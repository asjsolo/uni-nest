import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (Lender or Borrower)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const {
            fullname,
            email,
            phonenumber,
            password,
            campusRegistrationNumber,
            profilePicture,
            role,
        } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            fullname,
            email,
            phonenumber,
            password,
            campusRegistrationNumber,
            profilePicture,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                phonenumber: user.phonenumber,
                campusRegistrationNumber: user.campusRegistrationNumber,
                profilePicture: user.profilePicture,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Forgot Password - generate reset token & send email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        // Always respond with success to avoid user enumeration
        if (!user) {
            return res.status(200).json({
                message: 'If that email is registered, a reset link has been sent.',
            });
        }

        // Generate reset token (plain stored in DB as hash)
        const resetToken = user.generateResetToken();
        await user.save({ validateBeforeSave: false });

        // Build reset URL pointing to the frontend
        const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetURL = `${clientURL}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a1a; color: #f1f5f9; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #7c3aed, #5b21b6); padding: 36px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">🏠 UniNest</h1>
                    <p style="margin: 8px 0 0; opacity: 0.85; font-size: 15px;">Campus Housing Platform</p>
                </div>
                <div style="padding: 40px;">
                    <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700;">Reset your password</h2>
                    <p style="margin: 0 0 28px; color: #94a3b8; line-height: 1.6;">
                        We received a request to reset the password for your UniNest account.
                        Click the button below to choose a new password. This link expires in <strong style="color: #f1f5f9;">15 minutes</strong>.
                    </p>
                    <a href="${resetURL}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                        Reset Password
                    </a>
                    <p style="margin: 28px 0 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                        If you didn't request a password reset, you can safely ignore this email.
                        Your password will not be changed.<br/><br/>
                        Or copy this URL into your browser:<br/>
                        <a href="${resetURL}" style="color: #a78bfa; word-break: break-all;">${resetURL}</a>
                    </p>
                </div>
                <div style="padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
                    <p style="margin: 0; color: #475569; font-size: 12px;">© ${new Date().getFullYear()} UniNest. All rights reserved.</p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: 'UniNest – Password Reset Request',
            html,
        });

        res.status(200).json({
            message: 'If that email is registered, a reset link has been sent.',
        });
    } catch (error) {
        console.error('forgotPassword error:', error);
        // Clean up tokens if email failed to send
        if (error.user) {
            error.user.resetPasswordToken = undefined;
            error.user.resetPasswordExpire = undefined;
            await error.user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ message: 'Email could not be sent. Please try again.' });
    }
};

// @desc    Reset Password using token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { password } = req.body;

        // Hash the incoming token to match what's stored in DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password reset successful. You can now log in with your new password.',
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

