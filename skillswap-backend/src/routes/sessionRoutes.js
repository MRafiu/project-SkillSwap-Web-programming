import express from 'express';
import {
  createSession,
  getUserSessions,
  updateSessionStatus
} from '../controllers/sessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createSession);
router.get('/', getUserSessions);
router.patch('/:id/status', updateSessionStatus);

export default router;
