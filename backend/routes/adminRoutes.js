import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected route (admin must be logged in)
router.get('/profile', protect, getAdminProfile);

export default router;
