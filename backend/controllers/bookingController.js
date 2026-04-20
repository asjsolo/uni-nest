import Booking from '../models/Booking.js';
import Item from '../models/Item.js';

// ─── Helper: calculate fine ────────────────────────────────────────────
const calcFine = (dueDate, finePerDay) => {
    const now = new Date();
    if (now <= new Date(dueDate)) return 0;
    const msOverdue = now - new Date(dueDate);
    const daysOverdue = Math.ceil(msOverdue / (1000 * 60 * 60 * 24));
    return daysOverdue * finePerDay;
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Borrower only)
export const createBooking = async (req, res) => {
    try {
        const { itemId, startDate, totalDays } = req.body;

        if (!itemId || !startDate || !totalDays) {
            return res.status(400).json({ message: 'itemId, startDate, and totalDays are required.' });
        }

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        if (item.availabilityStatus === 'Out of Stock') {
            return res.status(400).json({ message: 'This item is currently out of stock.' });
        }
        if (item.status === 'draft') {
            return res.status(400).json({ message: 'This item is not available for booking.' });
        }

        const days = Number(totalDays);
        if (days < item.minRentalDays || days > item.maxRentalDays) {
            return res.status(400).json({
                message: `Rental duration must be between ${item.minRentalDays} and ${item.maxRentalDays} days.`,
            });
        }

        const start = new Date(startDate);
        const due = new Date(start);
        due.setDate(due.getDate() + days);

        const totalCost = days * item.pricePerDay * (1 - (item.discountPercentage || 0) / 100);

        const booking = await Booking.create({
            borrower: req.user._id,
            lender: item.lender,
            item: item._id,
            startDate: start,
            dueDate: due,
            totalDays: days,
            totalCost: Math.round(totalCost * 100) / 100,
            finePerDay: item.finePerDay || 10,
        });

        const populated = await Booking.findById(booking._id)
            .populate('item', 'name image category pricePerDay')
            .populate('lender', 'fullname email phonenumber');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all bookings for logged-in borrower
// @route   GET /api/bookings/my-bookings
// @access  Private (Borrower only)
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ borrower: req.user._id })
            .populate('item', 'name image category pricePerDay pickupLocation')
            .populate('lender', 'fullname email phonenumber')
            .sort({ createdAt: -1 });

        // Update fines dynamically for overdue ones (without saving, just for response)
        const enriched = bookings.map((b) => {
            const obj = b.toObject();
            if (obj.status === 'overdue') {
                obj.fineAmount = calcFine(obj.dueDate, obj.finePerDay);
            }
            return obj;
        });

        res.status(200).json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all bookings for items owned by logged-in lender
// @route   GET /api/bookings/lender-bookings
// @access  Private (Lender only)
export const getLenderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ lender: req.user._id })
            .populate('item', 'name image category pricePerDay')
            .populate('borrower', 'fullname email phonenumber campusRegistrationNumber')
            .sort({ createdAt: -1 });

        const enriched = bookings.map((b) => {
            const obj = b.toObject();
            if (obj.status === 'overdue') {
                obj.fineAmount = calcFine(obj.dueDate, obj.finePerDay);
            }
            return obj;
        });

        res.status(200).json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Mark a booking as returned (lender action)
// @route   PATCH /api/bookings/:id/mark-returned
// @access  Private (Lender only)
export const markReturned = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        if (booking.lender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        booking.status = 'returned';
        booking.returnedDate = new Date();

        // If returned late, keep the fine on record
        if (booking.fineAmount > 0) {
            booking.notifications.push({
                message: `Your item was returned late. You have a fine of Rs. ${booking.fineAmount.toFixed(2)}.`,
            });
        }

        await booking.save();

        const populated = await Booking.findById(booking._id)
            .populate('item', 'name image category')
            .populate('borrower', 'fullname email phonenumber');

        res.status(200).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Mark fine as collected (lender action)
// @route   PATCH /api/bookings/:id/collect-fine
// @access  Private (Lender only)
export const collectFine = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        if (booking.lender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        booking.fineCollected = true;
        await booking.save();

        res.status(200).json({ message: 'Fine marked as collected.', booking });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Mark notifications as read for a borrower bookings
// @route   PATCH /api/bookings/mark-notifications-read
// @access  Private (Borrower only)
export const markNotificationsRead = async (req, res) => {
    try {
        await Booking.updateMany(
            { borrower: req.user._id, 'notifications.read': false },
            { $set: { 'notifications.$[].read': true } }
        );
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Auto-check and mark overdue bookings + calculate fines
// Called internally (setInterval) or via PATCH endpoint
export const checkOverdueBookings = async () => {
    try {
        const now = new Date();
        const overdueBookings = await Booking.find({
            status: 'active',
            dueDate: { $lt: now },
        });

        for (const booking of overdueBookings) {
            const fine = calcFine(booking.dueDate, booking.finePerDay);
            booking.status = 'overdue';
            booking.fineAmount = fine;
            booking.notifications.push({
                message: `Your rental is overdue! A fine of Rs. ${fine.toFixed(2)} has been applied (Rs. ${booking.finePerDay}/day).`,
            });
            await booking.save();
        }

        // Also refresh fines on already-overdue but not yet returned
        const stillOverdue = await Booking.find({ status: 'overdue' });
        for (const booking of stillOverdue) {
            const fine = calcFine(booking.dueDate, booking.finePerDay);
            if (fine !== booking.fineAmount) {
                booking.fineAmount = fine;
                await booking.save();
            }
        }

        console.log(`[OverdueCheck] Processed ${overdueBookings.length} newly overdue bookings.`);
    } catch (err) {
        console.error('[OverdueCheck] Error:', err.message);
    }
};
