import { Router } from 'express';
import {
  startInterview,
  evaluateAnswer,
  completeInterview,
} from '../controllers/interview.controller';

const router = Router();

router.post('/start', startInterview);      // POST /api/interview/start
router.post('/answer', evaluateAnswer);     // POST /api/interview/answer
router.post('/complete', completeInterview); // POST /api/interview/complete

export default router;
