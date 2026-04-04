import express from 'express';
import { getAllUsers, getAllItems, deleteItem } from '../controllers/adminController.js';

const router = express.Router();

router.route('/users').get(getAllUsers);
router.route('/items').get(getAllItems);
router.route('/items/:id').delete(deleteItem);

export default router;
