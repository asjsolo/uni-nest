import express from 'express';
import {
  createReview,
  getReviewsByItem,
  updateReview,
  deleteReview,
  getAllItems,
  getAllUsers,
} from '../controllers/reviewController.js';

const router = express.Router();

// Users & Items
router.get('/users', getAllUsers);
router.get('/items', getAllItems);

// Reviews CRUD
router.post('/reviews', createReview);
router.get('/reviews/item/:itemId', getReviewsByItem);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
