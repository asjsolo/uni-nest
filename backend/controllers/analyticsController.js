import Rental from '../models/Rental.js';
import Review from '../models/Review.js';
import Item from '../models/Item.js';
import User from '../models/User.js';

// @desc    Get student analytics summary (savings, earnings, rental counts)
// @route   GET /api/analytics/summary/:userId
export const getStudentSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- As Borrower ---
    const borrowedCompleted = await Rental.find({ borrower: userId, status: 'completed' });
    const borrowedOngoing = await Rental.find({ borrower: userId, status: 'ongoing' });

    const totalSpent = borrowedCompleted.reduce((sum, r) => sum + r.totalCost, 0);
    const totalSavings = borrowedCompleted.reduce((sum, r) => {
      const saved = (r.marketPrice * r.durationDays) - r.totalCost;
      return sum + (saved > 0 ? saved : 0);
    }, 0);

    // --- As Lender ---
    const lentCompleted = await Rental.find({ lender: userId, status: 'completed' });
    const lentOngoing = await Rental.find({ lender: userId, status: 'ongoing' });

    const totalEarnings = lentCompleted.reduce((sum, r) => sum + r.totalCost, 0);

    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      asBorrower: {
        completedRentals: borrowedCompleted.length,
        ongoingRentals: borrowedOngoing.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalSavings: Math.round(totalSavings * 100) / 100,
      },
      asLender: {
        completedRentals: lentCompleted.length,
        ongoingRentals: lentOngoing.length,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
      },
      totalCompleted: borrowedCompleted.length + lentCompleted.length,
      totalOngoing: borrowedOngoing.length + lentOngoing.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rental history for a user (borrower + lender)
// @route   GET /api/analytics/rentals/:userId
export const getRentalHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build query
    const query = {};
    if (role === 'borrower') {
      query.borrower = userId;
    } else if (role === 'lender') {
      query.lender = userId;
    } else {
      query.$or = [{ borrower: userId }, { lender: userId }];
    }

    if (status && ['ongoing', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate('lender', 'name email')
      .populate('borrower', 'name email')
      .populate('item', 'name category image')
      .sort({ createdAt: -1 });

    // Attach user's role in each rental
    const result = rentals.map((rental) => {
      const r = rental.toObject();
      r.userRole = r.lender._id.toString() === userId ? 'lender' : 'borrower';
      return r;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trust score for a user (based on reviews received on their items + rental activity)
// @route   GET /api/analytics/trust/:userId
export const getTrustScore = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- Rating component (60% weight) ---
    // Get all items owned by this user, then get reviews on those items
    const ownedItems = await Item.find({ lender: userId }).select('_id');
    const ownedItemIds = ownedItems.map((i) => i._id);

    const ratingAgg = await Review.aggregate([
      { $match: { item: { $in: ownedItemIds } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const avgRating = ratingAgg.length > 0 ? ratingAgg[0].avg : 0;
    const reviewCount = ratingAgg.length > 0 ? ratingAgg[0].count : 0;

    // Also count reviews this user has written (shows engagement)
    const reviewsWritten = await Review.countDocuments({ reviewer: userId });

    // --- Activity component (40% weight) ---
    const completedAsBorrower = await Rental.countDocuments({ borrower: userId, status: 'completed' });
    const completedAsLender = await Rental.countDocuments({ lender: userId, status: 'completed' });
    const totalCompleted = completedAsBorrower + completedAsLender;

    // --- Trust Score Calculation (0–100) ---
    // Rating: (avgRating / 5) * 60, max 60 points
    const ratingScore = reviewCount > 0 ? (avgRating / 5) * 60 : 0;

    // Activity: min(totalCompleted / 10, 1) * 40, max 40 points
    // 10 completed rentals = full activity score
    const activityScore = Math.min(totalCompleted / 10, 1) * 40;

    const trustScore = Math.round(ratingScore + activityScore);

    // --- Reliability Level ---
    let reliabilityLevel;
    if (trustScore >= 80) reliabilityLevel = 'High';
    else if (trustScore >= 50) reliabilityLevel = 'Medium';
    else reliabilityLevel = 'Low';

    // --- Badges ---
    const badges = [];

    if (completedAsLender >= 3) {
      badges.push({ name: 'Trusted Lender', icon: 'shield', description: 'Completed 3+ rentals as lender' });
    }
    if (completedAsBorrower >= 3) {
      badges.push({ name: 'Verified Renter', icon: 'check', description: 'Completed 3+ rentals as borrower' });
    }
    if (avgRating >= 4.5 && reviewCount >= 2) {
      badges.push({ name: 'Top Rated', icon: 'star', description: 'Average rating 4.5+ with 2+ reviews' });
    }
    if (totalCompleted >= 5) {
      badges.push({ name: 'Active Member', icon: 'zap', description: '5+ total completed rentals' });
    }
    if (reviewsWritten >= 3) {
      badges.push({ name: 'Helpful Reviewer', icon: 'message', description: 'Written 3+ reviews' });
    }
    if (totalCompleted < 2) {
      badges.push({ name: 'New Member', icon: 'wave', description: 'Just getting started' });
    }

    res.json({
      user: { _id: user._id, name: user.name, email: user.email },
      trustScore,
      reliabilityLevel,
      breakdown: {
        ratingScore: Math.round(ratingScore),
        activityScore: Math.round(activityScore),
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
        reviewsWritten,
        completedAsLender,
        completedAsBorrower,
        totalCompleted,
      },
      badges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
