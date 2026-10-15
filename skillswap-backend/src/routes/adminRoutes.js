import express from 'express';
import {
  getOverview,
  getUsers,
  updateUserStatus,
  getDisputes,
  resolveDispute,
  getSkills,
  createSkill,
  deleteSkill,
  getRequests,
  getAnalytics
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require valid authentication AND admin role
router.use(authenticateToken, requireAdmin);

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id/resolve', resolveDispute);
router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.delete('/skills/:id', deleteSkill);
router.get('/requests', getRequests);
router.get('/analytics', getAnalytics);

export default router;
