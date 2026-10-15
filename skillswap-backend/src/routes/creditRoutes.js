import express from 'express';
import { getBalance, getTransactions } from '../controllers/creditController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/balance', getBalance);
router.get('/transactions', getTransactions);

export default router;
