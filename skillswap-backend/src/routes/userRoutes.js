import express from 'express';
import { getProfile, updateProfile, getPublicProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/:userId/public', authenticateToken, getPublicProfile);

export default router;
