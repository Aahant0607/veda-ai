import { Router } from 'express';
import { createAssignment, getAssignment, getGeneratedPaper, uploadMiddleware } from '../controllers/assignment.controller';

const router = Router();
router.post('/',           uploadMiddleware, createAssignment);
router.get('/:id',                          getAssignment);
router.get('/:id/paper',                    getGeneratedPaper);
export default router;