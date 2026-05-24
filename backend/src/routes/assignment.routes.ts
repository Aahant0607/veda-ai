import { Router } from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignment,
  getGeneratedPaper,
  uploadMiddleware,
  updateAssignmentStatus,
  deleteAssignment // ← Added this import!
} from '../controllers/assignment.controller';

const router = Router();

router.get('/',          getAllAssignments);          
router.post('/',         uploadMiddleware, createAssignment);
router.get('/:id',       getAssignment);
router.get('/:id/paper', getGeneratedPaper);
router.patch('/:id',     updateAssignmentStatus);     
router.delete('/:id',    deleteAssignment); // ← Added the DELETE route here!

export default router;
