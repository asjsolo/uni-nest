import Review from '../models/Review.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

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
