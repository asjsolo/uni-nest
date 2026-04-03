import Review from '../models/Review.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

// @desc    Submit a new review
// @route   POST /api/analytics/reviews
export const createReview = async (req, res) => {
  try {
    const { reviewer, item, rating, comment } = req.body;

    // Validate required fields
    if (!reviewer || !item || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate comment is not empty
    if (comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    // Check if reviewer exists
    const reviewerUser = await User.findById(reviewer);
    if (!reviewerUser) {
      return res.status(404).json({ message: 'Reviewer not found' });
    }

    // Check if item exists
    const itemDoc = await Item.findById(item);
    if (!itemDoc) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Prevent owner from reviewing their own item
    if (itemDoc.lender.toString() === reviewer) {
      return res.status(400).json({ message: 'You cannot review your own item' });
    }

    // Check for duplicate review (same user + same rental)
    const existingReview = await Review.findOne({ reviewer, item });
    if (existingReview) {
      return res.status(409).json({ message: 'You already reviewed this item' });
    }

    const review = await Review.create({
      reviewer,
      item,
      rating,
      comment: comment.trim(),
    });

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name email')
      .populate('item', 'name category');

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate review for this rental' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a specific item
// @route   GET /api/analytics/reviews/item/:itemId
export const getReviewsByItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const reviews = await Review.find({ item: itemId })
      .populate('reviewer', 'name email')
      .populate('item', 'name category')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    res.json({ reviews, averageRating, totalReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own review
// @route   PUT /api/analytics/reviews/:reviewId
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reviewer, rating, comment } = req.body;

    if (!reviewer) {
      return res.status(400).json({ message: 'Reviewer ID is required' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only the reviewer can update their review
    if (review.reviewer.toString() !== reviewer) {
      return res.status(403).json({ message: 'You can only edit your own review' });
    }

    // Validate fields if provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      if (comment.trim().length === 0) {
        return res.status(400).json({ message: 'Comment cannot be empty' });
      }
      review.comment = comment.trim();
    }

    await review.save();

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name email')
      .populate('item', 'name category');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete own review
// @route   DELETE /api/analytics/reviews/:reviewId
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reviewer } = req.body;

    if (!reviewer) {
      return res.status(400).json({ message: 'Reviewer ID is required' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only the reviewer can delete their review
    if (review.reviewer.toString() !== reviewer) {
      return res.status(403).json({ message: 'You can only delete your own review' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items (with average ratings)
// @route   GET /api/analytics/items
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find().populate('lender', 'name email');

    // Attach average rating to each item
    const itemsWithRating = await Promise.all(
      items.map(async (item) => {
        const result = await Review.aggregate([
          { $match: { item: item._id } },
          { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        const obj = item.toObject();
        obj.averageRating = result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0;
        obj.totalReviews = result.length > 0 ? result[0].count : 0;
        return obj;
      })
    );

    res.json(itemsWithRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (for dropdowns)
// @route   GET /api/analytics/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with email + password
// @route   POST /api/analytics/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
