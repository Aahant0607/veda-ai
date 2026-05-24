import { Router } from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignment,
  getGeneratedPaper,
  uploadMiddleware,
  updateAssignmentStatus // ← added import
} from '../controllers/assignment.controller';

const router = Router();

router.get('/',          getAllAssignments);          // ← Dashboard needs this
router.post('/',         uploadMiddleware, createAssignment);
router.get('/:id',       getAssignment);
router.get('/:id/paper', getGeneratedPaper);
router.patch('/:id',     updateAssignmentStatus);     // ← added PATCH route

export default router;
