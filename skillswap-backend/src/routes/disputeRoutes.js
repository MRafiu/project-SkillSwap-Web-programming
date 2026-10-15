import express from 'express';
import { createDispute, getMyDisputes } from '../controllers/disputeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createDispute);
router.get('/my', authenticateToken, getMyDisputes);

export default router;
