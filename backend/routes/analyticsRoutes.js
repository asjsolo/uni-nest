import express from 'express';
import { getAllItems, getAllUsers, loginUser } from '../controllers/reviewController.js';
import {
  getStudentSummary,
  getRentalHistory,
  getTrustScore,
} from '../controllers/analyticsController.js';

const router = express.Router();

// Auth
router.post('/login', loginUser);

// Users & Items
router.get('/users', getAllUsers);
router.get('/items', getAllItems);

// Student Analytics
router.get('/summary/:userId', getStudentSummary);
router.get('/rentals/:userId', getRentalHistory);
router.get('/trust/:userId', getTrustScore);

export default router;
