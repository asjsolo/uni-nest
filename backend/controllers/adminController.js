import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

// Generate JWT for admin
const generateAdminToken = (id) => {
    return jwt.sign(
        { id, role: 'admin' },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
    );
};

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Public (restrict this in production with a secret header or invite system)
export const registerAdmin = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({ message: 'Please provide fullname, email, and password.' });
        }

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'An admin with this email already exists.' });
        }

        // Create admin
        const admin = await Admin.create({ fullname, email, password });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                fullname: admin.fullname,
                email: admin.email,
                role: admin.role,
                isSuperAdmin: admin.isSuperAdmin,
                token: generateAdminToken(admin._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Login admin & return JWT
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        // Find admin and explicitly select the password field
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        res.status(200).json({
            _id: admin._id,
            fullname: admin.fullname,
            email: admin.email,
            role: admin.role,
            isSuperAdmin: admin.isSuperAdmin,
            token: generateAdminToken(admin._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (admin only)
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        res.status(200).json({
            _id: admin._id,
            fullname: admin.fullname,
            email: admin.email,
            role: admin.role,
            isSuperAdmin: admin.isSuperAdmin,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
