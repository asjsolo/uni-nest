import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile);
// router.post('/forgot-password', forgotPassword);
// router.put('/reset-password/:resetToken', resetPassword);

export default router;
