import User from '../models/User.js';
import Item from '../models/Item.js';

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
// @access  Public
export const getAllItems = async (req, res) => {
    try {
        const items = await Item.find({}).populate('lender', 'name email');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

// @desc    Delete item
// @route   DELETE /api/admin/items/:id
// @access  Public
export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        
        if (item) {
            await Item.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
};
