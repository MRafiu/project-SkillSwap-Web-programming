import express from 'express';
import {
  getSkills,
  createSkill,
  addUserSkill,
  removeUserSkill,
  searchTeachers,
  getWishlistMatches
} from '../controllers/skillController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/skills', getSkills);
router.post('/skills', authenticateToken, createSkill);
router.post('/users/skills', authenticateToken, addUserSkill);
router.delete('/users/skills', authenticateToken, removeUserSkill);
router.get('/teachers/search', searchTeachers);
router.get('/skills/wishlist-matches', authenticateToken, getWishlistMatches);

export default router;
