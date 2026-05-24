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

// ── Safe PDF parser ───────────────────────────────────────────────────
async function extractFileText(file: Express.Multer.File): Promise<string | undefined> {
  if (file.mimetype === 'application/pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const fn = pdfParse.default || pdfParse;
      const data = await fn(file.buffer);
      return data.text;
    } catch { return undefined; }
  }
  return file.buffer.toString('utf-8');
}

// ── GET /api/assignments — list all for dashboard ────────────────────
export const getAllAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .select('-fileContent')         // don't send file text to dashboard
      .sort({ createdAt: -1 })        // newest first
      .limit(50);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// ── POST /api/assignments — create new ───────────────────────────────
export const createAssignment = async (req: Request, res: Response) => {
  const {
    title, subject, grade, dueDate,
    questionTypes, totalQuestions, totalMarks,
    additionalInstructions,
    questionBreakdown,
  } = req.body;

  if (!title || !subject || !grade || !dueDate || !questionTypes || !totalQuestions || !totalMarks) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  if (Number(totalQuestions) < 1) return res.status(400).json({ error: 'Questions must be at least 1' });
  if (Number(totalMarks)     < 1) return res.status(400).json({ error: 'Marks must be at least 1' });
  if (new Date(dueDate) < new Date()) return res.status(400).json({ error: 'Due date must be in the future' });

  let parsedBreakdown: { type: string; questions: number; marksEach: number }[] = [];
  if (questionBreakdown) {
    try {
      parsedBreakdown = typeof questionBreakdown === 'string'
        ? JSON.parse(questionBreakdown)
        : questionBreakdown;
    } catch { parsedBreakdown = []; }
  }

  let fileContent: string | undefined;
  let fileName:    string | undefined;
  if (req.file) {
    fileName    = req.file.originalname;
    fileContent = await extractFileText(req.file);
  }

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

// ── GET /api/assignments/:id ─────────────────────────────────────────
export const getAssignment = async (req: Request, res: Response) => {
  const assignment = await Assignment.findById(req.params.id).select('-fileContent');
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  res.json(assignment);
};

// ── GET /api/assignments/:id/paper ──────────────────────────────────
export const getGeneratedPaper = async (req: Request, res: Response) => {
  const { id } = req.params;

  const cached = await redis.get(`paper:${id}`);
  if (cached) return res.json({ source: 'cache', paper: JSON.parse(cached) });

  const paper = await GeneratedPaper.findOne({ assignmentId: id });
  if (!paper) return res.status(404).json({ error: 'Paper not found or still generating' });

  await redis.set(`paper:${id}`, JSON.stringify(paper.toObject()), 'EX', 86400);
  res.json({ source: 'db', paper });
};
