import express from 'express';
import { getAllUsers, getAllItems, deleteItem, deleteUser, getAllLogs } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Booking from '../models/Booking.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', async (req, res) => {
  try {
    const [usersCount, itemsCount, bookingsCount] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Booking.countDocuments({ status: 'active' })
    ]);
    res.json({ usersCount, itemsCount, bookingsCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

router.route('/users').get(getAllUsers);
router.route('/users/:id').delete(deleteUser);
router.route('/items').get(getAllItems);
router.route('/items/:id').delete(deleteItem);
router.route('/logs').get(getAllLogs);

export default router;
