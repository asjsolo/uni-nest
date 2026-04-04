import AppReview from '../models/AppReview.js';

// GET /api/app-reviews
export const getAppReviews = async (req, res) => {
  try {
    const reviews = await AppReview.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avg = total > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
      : 0;

    res.json({ reviews, avg, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/app-reviews/user/:userId
export const getUserAppReview = async (req, res) => {
  try {
    const review = await AppReview.findOne({ user: req.params.userId })
      .populate('user', 'name email');
    res.json(review || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/app-reviews
export const submitAppReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    if (!userId || !rating || !comment?.trim())
      return res.status(400).json({ message: 'userId, rating, and comment are required.' });

    const existing = await AppReview.findOne({ user: userId });
    if (existing)
      return res.status(409).json({ message: 'You already submitted a review. Edit it instead.' });

    const review = await AppReview.create({ user: userId, rating, comment: comment.trim() });
    const populated = await AppReview.findById(review._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/app-reviews/:id
export const updateAppReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const review = await AppReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (review.user.toString() !== userId)
      return res.status(403).json({ message: 'You can only edit your own review.' });

    if (rating)          review.rating  = rating;
    if (comment?.trim()) review.comment = comment.trim();
    await review.save();

    const populated = await AppReview.findById(review._id).populate('user', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/app-reviews/:id
export const deleteAppReview = async (req, res) => {
  try {
    const { userId } = req.body;
    const review = await AppReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (review.user.toString() !== userId)
      return res.status(403).json({ message: 'You can only delete your own review.' });

    await AppReview.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
