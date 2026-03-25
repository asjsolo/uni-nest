import Rental from '../models/Rental.js';
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
