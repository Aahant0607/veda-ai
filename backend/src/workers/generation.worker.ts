import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { connectDB } from '../config/db';
import { redis } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { generateQuestionPaper } from '../services/ai.service';
import { notifyClients } from '../websocket/ws';

connectDB();

const worker = new Worker(
  'question-generation',
  async (job: Job) => {
    const { assignmentId } = job.data;

    try {
      // 1. Mark as processing
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      notifyClients(assignmentId, { type: 'STATUS_UPDATE', status: 'processing', progress: 10 });

      // 2. Fetch assignment
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error('Assignment not found');
      notifyClients(assignmentId, { type: 'STATUS_UPDATE', status: 'processing', progress: 30 });

      // 3. Generate with Gemini
      const result = await generateQuestionPaper({
        title:                  assignment.title,
        subject:                assignment.subject,
        grade:                  assignment.grade,
        questionTypes:          assignment.questionTypes,
        totalQuestions:         assignment.totalQuestions,
        totalMarks:             assignment.totalMarks,
        additionalInstructions: assignment.additionalInstructions,
        fileContent:            assignment.fileContent,
      });
      notifyClients(assignmentId, { type: 'STATUS_UPDATE', status: 'processing', progress: 70 });

      // 4. Save to MongoDB Atlas
      const paper = new GeneratedPaper({
        assignmentId:  assignment._id,
        examTitle:     result.examTitle,
        subject:       assignment.subject,
        grade:         assignment.grade,
        dueDate:       assignment.dueDate,
        totalMarks:    assignment.totalMarks,
        duration:      result.duration,
        sections:      result.sections,
      });
      await paper.save();

      // 5. Cache in Upstash Redis (24h TTL)
      await redis.set(`paper:${assignmentId}`, JSON.stringify(paper.toObject()), 'EX', 86400);

      // 6. Done — notify frontend
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
      notifyClients(assignmentId, {
        type:     'COMPLETED',
        status:   'completed',
        progress: 100,
        paperId:  paper._id.toString(),
      });

    } catch (error: any) {
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
      notifyClients(assignmentId, { type: 'FAILED', status: 'failed', error: error.message });
      throw error;
    }
  },
  { connection: redis, concurrency: 2 }
);

worker.on('completed', (job) => console.log(`✅ Job ${job.id} done`));
worker.on('failed',    (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));