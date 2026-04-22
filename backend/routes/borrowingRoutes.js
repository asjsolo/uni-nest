import express from 'express';
import {
    getItems, getItemById, createInquiry, getInquiries,
    createRental, getRentals, payRental, returnRental
} from '../controllers/borrowingController.js';

const router = express.Router();

// Member 2 - Smart Borrowing System Routes
router.get('/items', getItems);
router.get('/items/:id', getItemById);

router.post('/inquiries', createInquiry);
router.get('/inquiries', getInquiries);

router.post('/rentals', createRental);
router.get('/rentals', getRentals);
router.patch('/rentals/:id/pay', payRental);
router.patch('/rentals/:id/return', returnRental);

export default router;
