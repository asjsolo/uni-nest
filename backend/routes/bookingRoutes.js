import express from 'express';
import {
    createBooking,
    getMyBookings,
    getLenderBookings,
    markReturned,
    collectFine,
    markNotificationsRead,
} from '../controllers/bookingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Borrower routes
router.post('/', authorizeRoles('borrower'), createBooking);
router.get('/my-bookings', authorizeRoles('borrower'), getMyBookings);
router.patch('/mark-notifications-read', authorizeRoles('borrower'), markNotificationsRead);

// Lender routes
router.get('/lender-bookings', authorizeRoles('lender'), getLenderBookings);
router.patch('/:id/mark-returned', authorizeRoles('lender'), markReturned);
router.patch('/:id/collect-fine', authorizeRoles('lender'), collectFine);

export default router;
