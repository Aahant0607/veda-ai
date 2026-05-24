import { Router } from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignment,
  getGeneratedPaper,
  uploadMiddleware,
} from '../controllers/assignment.controller';

const router = Router();

router.get('/',          getAllAssignments);          // ← Dashboard needs this
router.post('/',         uploadMiddleware, createAssignment);
router.get('/:id',       getAssignment);
router.get('/:id/paper', getGeneratedPaper);

export default router;
