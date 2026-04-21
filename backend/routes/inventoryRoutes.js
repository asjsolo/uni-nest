import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import {
    createItem,
    getMyItems,
    getAllPublishedItems,
    getItemById,
    updateItem,
    deleteItem,
    deactivateItem,
} from '../controllers/inventoryController.js';

const router = express.Router();

// Setup multer for handling multipart/form-data
const upload = multer({ dest: 'uploads/' });

// @route   GET /api/inventory/my-items
// @desc    Get logged in user's items
router.get('/my-items', protect, getMyItems);

// @route   GET /api/inventory/items
// @desc    Get all published items for borrowers to browse
router.get('/items', protect, getAllPublishedItems);

// @route   POST /api/inventory/items/create
// @desc    Create a new item
router.post('/items/create', protect, upload.single('image'), createItem);

// @route   GET /api/inventory/items/:id
// @desc    Get a single item by ID
router.get('/items/:id', protect, getItemById);

// @route   PUT /api/inventory/items/:id
// @desc    Update an item
router.put('/items/:id', protect, upload.single('image'), updateItem);

// @route   DELETE /api/inventory/items/:id
// @desc    Delete an item
router.delete('/items/:id', protect, deleteItem);

// @route   PUT /api/inventory/items/:id/deactivate
// @desc    Deactivate an item (set to draft)
router.put('/items/:id/deactivate', protect, deactivateItem);

export default router;
