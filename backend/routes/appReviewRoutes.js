import express from 'express';
import {
  getAppReviews,
  getUserAppReview,
  submitAppReview,
  updateAppReview,
  deleteAppReview,
} from '../controllers/appReviewController.js';

const router = express.Router();

router.get('/',               getAppReviews);
router.get('/user/:userId',   getUserAppReview);
router.post('/',              submitAppReview);
router.put('/:id',            updateAppReview);
router.delete('/:id',         deleteAppReview);

export default router;
