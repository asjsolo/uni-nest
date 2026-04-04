import express from 'express';
import {
    createItem,
    getMyItems,
    getAllPublishedItems,
    getItemById,
    updateItem,
    deleteItem,
} from '../controllers/inventoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public browse route (all authenticated users can browse published items)
router.get('/items', getAllPublishedItems);

// Lender-specific routes
router.post('/items/create', authorizeRoles('lender'), upload.single('image'), createItem);
router.get('/my-items', authorizeRoles('lender'), getMyItems);

// General routes
router.get('/items/:id', getItemById);
router.put('/items/:id', authorizeRoles('lender'), upload.single('image'), updateItem);
router.delete('/items/:id', authorizeRoles('lender'), deleteItem);

export default router;
