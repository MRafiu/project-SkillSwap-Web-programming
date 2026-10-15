import express from 'express';
import {
  getMyAvailability,
  getUserAvailability,
  saveMyAvailability,
  addSlot,
  updateSlot,
  deleteSlot,
  getCalendarAvailability,
  getMyOverrides,
  addDateOverride,
  deleteDateOverride
} from '../controllers/availabilityController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: view another user's availability for booking/scheduling
router.get('/user/:userId', getUserAvailability);
router.get('/calendar/:userId', getCalendarAvailability);

// Authenticated user availability management
router.use(authenticateToken);
router.get('/me', getMyAvailability);
router.post('/save', saveMyAvailability);
router.post('/slot', addSlot);
router.put('/slot/:id', updateSlot);
router.delete('/slot/:id', deleteSlot);

// Authenticated date overrides / blackouts management
router.get('/overrides/me', getMyOverrides);
router.post('/override', addDateOverride);
router.delete('/override/:id', deleteDateOverride);

export default router;
