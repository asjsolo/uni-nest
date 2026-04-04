import Item from '../models/Item.js';
import Booking from '../models/Booking.js';

// @desc    Create a new item listing (published or draft)
// @route   POST /api/inventory/items
// @access  Private (Lender only)
export const createItem = async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            pricePerDay,
            discountPercentage,
            quantity,
            availabilityStatus,
            minRentalDays,
            maxRentalDays,
            pickupLocation,
            finePerDay,
            status, // 'published' or 'draft'
        } = req.body;

        const itemStatus = status === 'draft' ? 'draft' : 'published';

        // Only validate required fields for published items
        if (itemStatus === 'published') {
            if (Number(maxRentalDays) < Number(minRentalDays)) {
                return res.status(400).json({
                    message: 'Maximum rental days must be greater than or equal to minimum rental days',
                });
            }
        }

        const item = await Item.create({
            lender: req.user._id,
            name: name || 'Untitled Draft',
            category: category || 'Other',
            description: description || '',
            pricePerDay: Number(pricePerDay) || 0,
            discountPercentage: Number(discountPercentage) || 0,
            quantity: Number(quantity) || 1,
            availabilityStatus: availabilityStatus || 'Available',
            minRentalDays: Number(minRentalDays) || 1,
            maxRentalDays: Number(maxRentalDays) || 1,
            pickupLocation: pickupLocation || '',
            finePerDay: Number(finePerDay) || 10,
            image: req.file ? `/uploads/${req.file.filename}` : null,
            status: itemStatus,
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all items listed by the logged-in lender (with status filter)
// @route   GET /api/inventory/my-items
// @access  Private (Lender only)
export const getMyItems = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, availability, status } = req.query;

        const query = { lender: req.user._id };

        // Filter by status (draft/published/all)
        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.pricePerDay = {};
            if (minPrice) query.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
        }

        if (availability && availability !== 'All') {
            query.availabilityStatus = availability;
        }

        const items = await Item.find(query).sort({ createdAt: -1 });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all published items for borrowers to browse
// @route   GET /api/inventory/items
// @access  Private (any authenticated user)
export const getAllPublishedItems = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice } = req.query;

        const query = { status: 'published' };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.pricePerDay = {};
            if (minPrice) query.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
        }

        const items = await Item.find(query)
            .populate('lender', 'fullname email phonenumber')
            .sort({ createdAt: -1 });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get a single item by ID
// @route   GET /api/inventory/items/:id
// @access  Private
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('lender', 'fullname email');

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Update an item
// @route   PUT /api/inventory/items/:id
// @access  Private (Lender only - owner)
export const updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Ensure the lender owns the item
        if (item.lender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        // Check if the item is currently rented
        const isRented = await Booking.exists({
            item: req.params.id,
            status: { $in: ['active', 'overdue'] }
        });

        if (isRented) {
            return res.status(403).json({ message: 'Cannot edit an item that is currently rented by a borrower.' });
        }


        // If publishing a draft, run validation
        if (req.body.status === 'published') {
            const minDays = Number(req.body.minRentalDays ?? item.minRentalDays);
            const maxDays = Number(req.body.maxRentalDays ?? item.maxRentalDays);
            if (maxDays < minDays) {
                return res.status(400).json({
                    message: 'Maximum rental days must be >= minimum rental days',
                });
            }
        }

        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }

        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: false,
        });

        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Delete an item
// @route   DELETE /api/inventory/items/:id
// @access  Private (Lender only - owner)
export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.lender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await item.deleteOne();

        res.status(200).json({ message: 'Item removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
