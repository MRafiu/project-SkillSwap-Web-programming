import express from 'express';
import {
  getMyCertificates,
  getUserCertificates,
  getCertificateByUuid
} from '../controllers/certificateController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authenticated: Get certificates earned by logged-in user
router.get('/my', authenticateToken, getMyCertificates);

// Public: Get earned certificates for a specific user profile
router.get('/user/:userId', getUserCertificates);

// Public: Verify and view a certificate by UUID
router.get('/:uuid', getCertificateByUuid);

export default router;
