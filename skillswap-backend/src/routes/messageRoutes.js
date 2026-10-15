import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessageHistory,
  markAsRead
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:otherUserId', getMessageHistory);
router.patch('/:otherUserId/read', markAsRead);

export default router;
