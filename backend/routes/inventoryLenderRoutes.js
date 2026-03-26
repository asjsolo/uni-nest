import express from 'express';
import {
    createItem,
    getMyItems,
    getItemById,
    updateItem,
    deleteItem,
} from '../controllers/inventoryController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Lender-specific routes
router.post('/items', authorizeRoles('lender'), upload.single('image'), createItem);
router.get('/my-items', authorizeRoles('lender'), getMyItems);

// General routes
router.get('/items/:id', getItemById);
router.put('/items/:id', authorizeRoles('lender'), upload.single('image'), updateItem);
router.delete('/items/:id', authorizeRoles('lender'), deleteItem);

export default router;
