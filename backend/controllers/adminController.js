import User from '../models/User.js';
import Item from '../models/Item.js';
import ActionLog from '../models/ActionLog.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Public (Placeholder - add auth later)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// @desc    Get all items
// @route   GET /api/admin/items
// @access  Private/Admin
export const getAllItems = async (req, res) => {
    try {
        const items = await Item.find({}).populate('owner', 'name email');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

// @desc    Delete item
// @route   DELETE /api/admin/items/:id
// @access  Private/Admin
export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (item) {
            await Item.findByIdAndDelete(req.params.id);
            
            await ActionLog.create({
                adminId: req.user._id,
                action: 'DELETED_ITEM',
                targetId: req.params.id,
                details: `Deleted item: ${item.title || item.name}`
            });

            res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (user) {
            await User.findByIdAndDelete(req.params.id);
            
            await ActionLog.create({
                adminId: req.user._id,
                action: 'DELETED_USER',
                targetId: req.params.id,
                details: `Deleted user: ${user.name} (${user.email})`
            });

            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// @desc    Get all action logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getAllLogs = async (req, res) => {
    try {
        const logs = await ActionLog.find({})
            .sort({ createdAt: -1 })
            .populate('adminId', 'name');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching action logs', error: error.message });
    }
};
