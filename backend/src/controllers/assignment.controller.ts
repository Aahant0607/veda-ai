import { Request, Response } from 'express';
import multer from 'multer';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { generationQueue } from '../queues/generation.queue';
import { redis } from '../config/redis';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
export const uploadMiddleware = upload.single('file');

// ── Safe PDF parser — handles all import styles ──────────────────────
async function extractFileText(file: Express.Multer.File): Promise<string | undefined> {
  if (file.mimetype === 'application/pdf') {
    try {
      // Dynamically import to avoid build-time call signature issues
      const pdfParse = require('pdf-parse');
      const fn = pdfParse.default || pdfParse;
      const data = await fn(file.buffer);
      return data.text;
    } catch {
      return undefined;
    }
  }
  // Plain text or image — just return as string
  return file.buffer.toString('utf-8');
}

export const createAssignment = async (req: Request, res: Response) => {
  const {
    title, subject, grade, dueDate,
    questionTypes, totalQuestions, totalMarks,
    additionalInstructions,
    questionBreakdown,
  } = req.body;

  // ── Validation ────────────────────────────────────────────────
  if (!title || !subject || !grade || !dueDate || !questionTypes || !totalQuestions || !totalMarks) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  if (Number(totalQuestions) < 1) return res.status(400).json({ error: 'Questions must be at least 1' });
  if (Number(totalMarks)     < 1) return res.status(400).json({ error: 'Marks must be at least 1' });
  if (new Date(dueDate) < new Date()) return res.status(400).json({ error: 'Due date must be in the future' });

  // ── Parse questionBreakdown ───────────────────────────────────
  let parsedBreakdown: { type: string; questions: number; marksEach: number }[] = [];
  if (questionBreakdown) {
    try {
      parsedBreakdown = typeof questionBreakdown === 'string'
        ? JSON.parse(questionBreakdown)
        : questionBreakdown;
    } catch {
      parsedBreakdown = [];
    }
  }

  // ── Extract file text safely ──────────────────────────────────
  let fileContent: string | undefined;
  let fileName:    string | undefined;
  if (req.file) {
    fileName    = req.file.originalname;
    fileContent = await extractFileText(req.file);
  }

  // ── Save to MongoDB ───────────────────────────────────────────
  const assignment = new Assignment({
    title, subject, grade,
    dueDate:                new Date(dueDate),
    questionTypes:          Array.isArray(questionTypes) ? questionTypes : [questionTypes],
    questionBreakdown:      parsedBreakdown,
    totalQuestions:         Number(totalQuestions),
    totalMarks:             Number(totalMarks),
    additionalInstructions, fileContent, fileName,
    status: 'pending',
  });
  await assignment.save();

  // ── Enqueue job ───────────────────────────────────────────────
  const job = await generationQueue.add('generate', {
    assignmentId: assignment._id.toString(),
  });
  await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

  res.status(201).json({
    message:      'Assignment created. Generating question paper...',
    assignmentId: assignment._id,
    jobId:        job.id,
  });
};

export const getAssignment = async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id).select('-fileContent');
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  res.json(assignment);
};

export const getGeneratedPaper = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Redis cache first
  const cached = await redis.get(`paper:${id}`);
  if (cached) return res.json({ source: 'cache', paper: JSON.parse(cached) });

  // Fallback to MongoDB
  const paper = await GeneratedPaper.findOne({ assignmentId: id });
  if (!paper) return res.status(404).json({ error: 'Paper not found or still generating' });

  await redis.set(`paper:${id}`, JSON.stringify(paper.toObject()), 'EX', 86400);
  res.json({ source: 'db', paper });
};
