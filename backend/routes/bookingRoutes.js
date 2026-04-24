import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import Booking from '../models/Booking.js';
import Item from '../models/Item.js';

const router = express.Router();

// @route   GET /api/bookings/summary/:userId
// @desc    Public rental summary for a user
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const uid = new mongoose.Types.ObjectId(userId);
    const completedStatuses = ['completed', 'returned'];

    const [completedAsLender, completedAsBorrower, itemsListed, activeAsLender, activeAsBorrower] =
      await Promise.all([
        Booking.countDocuments({ lender: uid, status: { $in: completedStatuses } }),
        Booking.countDocuments({ borrower: uid, status: { $in: completedStatuses } }),
        Item.countDocuments({ owner: uid }),
        Booking.countDocuments({ lender: uid, status: { $in: ['approved', 'active'] } }),
        Booking.countDocuments({ borrower: uid, status: { $in: ['approved', 'active'] } }),
      ]);

    res.json({
      completedAsLender,
      completedAsBorrower,
      totalCompleted: completedAsLender + completedAsBorrower,
      activeAsLender,
      activeAsBorrower,
      itemsListed,
    });
  } catch (error) {
    console.error('Error fetching booking summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings/create
// @desc    Create a new rental booking request
router.post('/create', protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rent your own item' });
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newBooking = new Booking({
      borrower: req.user._id,
      lender: item.owner,
      item: itemId,
      startDate: today,
      endDate: tomorrow,
      dueDate: tomorrow, // default dueDate as tomorrow for pending
      status: 'pending'
    });

    await newBooking.save();

    res.status(201).json({ message: 'Booking request created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

// @route   GET /api/bookings/my-requests
// @desc    Get bookings made by the current user (borrower)
router.get('/my-requests', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ borrower: req.user._id })
      .populate('item')
      .populate('lender', 'fullname email phonenumber')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching borrower bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/lender-bookings
// @desc    Get bookings for lender's items
router.get('/lender-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ lender: req.user._id })
      .populate('item')
      .populate('borrower', 'fullname email phonenumber campusRegistrationNumber')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching lender bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/approve
// @desc    Approve a booking request
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.lender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to approve this booking' });
    }

    booking.status = 'approved';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject a booking request
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.lender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to reject this booking' });
    }

    booking.status = 'rejected';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/return
// @desc    Borrower returns item
router.put('/:id/return', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to return this booking' });
    }

    booking.status = 'returned';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Error returning booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/confirm-return
// @desc    Lender confirms item return
router.put('/:id/confirm-return', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.lender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to confirm this return' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error('Error confirming return:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
