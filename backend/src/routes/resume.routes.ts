import { Router } from 'express';
import { analyzeResume } from '../controllers/resume.controller';

const router = Router();

router.post('/analyze', analyzeResume);

export default router;
