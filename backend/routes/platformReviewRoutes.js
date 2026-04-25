import express from 'express';
import mongoose from 'mongoose';
import PlatformReview from '../models/PlatformReview.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/platform-reviews
// @desc    Get recent platform reviews (most recent first)
router.get('/', async (req, res) => {
    try {
        const reviews = await PlatformReview.find()
            .sort({ createdAt: -1 })
            .limit(20);

        const count = reviews.length;
        const average =
            count > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
                : 0;

        res.json({
            reviews,
            stats: {
                count,
                average: Number(average.toFixed(2)),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/platform-reviews
// @desc    Submit a platform review (authenticated users)
router.post('/', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const numericRating = Number(rating);
        if (
            !numericRating ||
            numericRating < 1 ||
            numericRating > 5 ||
            !Number.isFinite(numericRating)
        ) {
            return res
                .status(400)
                .json({ message: 'Rating must be a number between 1 and 5.' });
        }
        if (!comment || !comment.trim()) {
            return res
                .status(400)
                .json({ message: 'Comment is required.' });
        }

        const reviewerName =
            req.user?.fullname || req.user?.name || 'Anonymous Student';

        const review = await PlatformReview.create({
            reviewer: req.user._id,
            reviewerName,
            rating: numericRating,
            comment: comment.trim(),
        });

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/platform-reviews/:reviewId
// @desc    Update your own platform review
router.put('/:reviewId', protect, async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review id' });
        }

        const review = await PlatformReview.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.reviewer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only edit your own review.' });
        }

        const { rating, comment } = req.body;

        if (rating !== undefined) {
            const numericRating = Number(rating);
            if (
                !numericRating ||
                numericRating < 1 ||
                numericRating > 5 ||
                !Number.isFinite(numericRating)
            ) {
                return res
                    .status(400)
                    .json({ message: 'Rating must be a number between 1 and 5.' });
            }
            review.rating = numericRating;
        }

        if (comment !== undefined) {
            if (!comment.trim()) {
                return res.status(400).json({ message: 'Comment is required.' });
            }
            review.comment = comment.trim();
        }

        await review.save();
        res.json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/platform-reviews/:reviewId
// @desc    Delete your own platform review
router.delete('/:reviewId', protect, async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review id' });
        }

        const review = await PlatformReview.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.reviewer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own review.' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
