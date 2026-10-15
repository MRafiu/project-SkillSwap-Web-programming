import express from 'express';
import { submitReview, getUserReviews, getSessionReviews } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly viewable reviews for a user
router.get('/user/:userId', getUserReviews);

// Check reviews for a session (authenticated)
router.get('/session/:sessionId', authenticateToken, getSessionReviews);

// Submit review for a completed session (authenticated)
router.post('/', authenticateToken, submitReview);

export default router;
