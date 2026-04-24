import express from 'express';
import mongoose from 'mongoose';
import ItemReview from '../models/ItemReview.js';
import Item from '../models/Item.js';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Trust score formula (0–100):
 *   ratingComponent    = avgRating * 20                  (0–100 scaled)
 *   confidence         = min(1, reviewCount / 5)         (5+ reviews = full weight)
 *   weightedRating     = ratingComponent * confidence    (0–100)
 *   completedBonus     = min(20, completedBookings * 2)  (up to +20)
 *   trustScore         = min(100, weightedRating + completedBonus)
 *
 * Badge tiers:
 *   score >= 80 AND reviewCount >= 5 AND completedBookings >= 5 → GOLD ("Trusted User")
 *   score >= 60 → SILVER
 *   score >= 30 → BRONZE
 *   otherwise   → NEW MEMBER
 */
const computeTrust = ({ avgRating, reviewCount, completedBookings }) => {
    const rating = Number(avgRating) || 0;
    const rCount = Number(reviewCount) || 0;
    const cBookings = Number(completedBookings) || 0;

    const ratingComponent = rating * 20;
    const confidence = Math.min(1, rCount / 5);
    const weightedRating = ratingComponent * confidence;
    const completedBonus = Math.min(20, cBookings * 2);
    const trustScore = Math.min(100, weightedRating + completedBonus);

    let tier = 'new';
    let label = 'New Member';
    let isTrusted = false;

    if (trustScore >= 80 && rCount >= 5 && cBookings >= 5) {
        tier = 'gold';
        label = 'Trusted User';
        isTrusted = true;
    } else if (trustScore >= 60) {
        tier = 'silver';
        label = 'Silver Member';
    } else if (trustScore >= 30) {
        tier = 'bronze';
        label = 'Bronze Member';
    }

    return {
        trustScore: Math.round(trustScore),
        avgRating: Number(rating.toFixed(2)),
        reviewCount: rCount,
        completedBookings: cBookings,
        tier,
        label,
        isTrusted,
    };
};

// Helper that computes trust stats for a user id
const getTrustStatsForUser = async (userId) => {
    const objectId = new mongoose.Types.ObjectId(userId);

    const [agg] = await ItemReview.aggregate([
        { $match: { itemOwner: objectId } },
        {
            $group: {
                _id: '$itemOwner',
                avgRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    const completedBookings = await Booking.countDocuments({
        $or: [{ lender: objectId }, { borrower: objectId }],
        status: { $in: ['completed', 'returned'] },
    });

    return computeTrust({
        avgRating: agg?.avgRating || 0,
        reviewCount: agg?.reviewCount || 0,
        completedBookings,
    });
};

// @route   GET /api/item-reviews/item/:itemId
// @desc    List reviews for an item + item rating summary
router.get('/item/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Invalid item id' });
        }

        const reviews = await ItemReview.find({ item: itemId })
            .sort({ createdAt: -1 })
            .limit(50);

        const count = reviews.length;
        const average =
            count > 0
                ? reviews.reduce((s, r) => s + r.rating, 0) / count
                : 0;

        res.json({
            reviews,
            stats: { count, average: Number(average.toFixed(2)) },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/item-reviews/item/:itemId
// @desc    Submit a review for an item (auth)
router.post('/item/:itemId', protect, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Invalid item id' });
        }

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
            return res.status(400).json({ message: 'Comment is required.' });
        }

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.owner.toString() === req.user._id.toString()) {
            return res
                .status(400)
                .json({ message: 'You cannot review your own item.' });
        }

        const reviewerName =
            req.user.fullname || req.user.name || 'Anonymous Student';

        try {
            const review = await ItemReview.create({
                item: item._id,
                itemOwner: item.owner,
                reviewer: req.user._id,
                reviewerName,
                rating: numericRating,
                comment: comment.trim(),
            });
            res.status(201).json(review);
        } catch (err) {
            if (err.code === 11000) {
                return res
                    .status(400)
                    .json({ message: 'You have already reviewed this item.' });
            }
            throw err;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/item-reviews/trust-score/me
// @desc    Current user's trust score
router.get('/trust-score/me', protect, async (req, res) => {
    try {
        const stats = await getTrustStatsForUser(req.user._id);
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/item-reviews/trust-score/:userId
// @desc    Public trust score for any user
router.get('/trust-score/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const stats = await getTrustStatsForUser(userId);
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
