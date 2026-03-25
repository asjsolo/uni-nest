import express from 'express';
import {
  createReview,
  getReviewsByItem,
  updateReview,
  deleteReview,
  getAllItems,
  getAllUsers,
} from '../controllers/reviewController.js';
import {
  getStudentSummary,
  getRentalHistory,
  getTrustScore,
} from '../controllers/analyticsController.js';

const router = express.Router();

// Users & Items
router.get('/users', getAllUsers);
router.get('/items', getAllItems);

// Student Analytics
router.get('/summary/:userId', getStudentSummary);
router.get('/rentals/:userId', getRentalHistory);
router.get('/trust/:userId', getTrustScore);

// Reviews CRUD
router.post('/reviews', createReview);
router.get('/reviews/item/:itemId', getReviewsByItem);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
