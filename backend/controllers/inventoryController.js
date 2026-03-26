import Item from '../models/Item.js';

// @desc    Create a new item listing
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
        } = req.body;

        // Validate maxRentalDays >= minRentalDays
        if (Number(maxRentalDays) < Number(minRentalDays)) {
            return res.status(400).json({
                message: 'Maximum rental days must be greater than or equal to minimum rental days',
            });
        }

        const item = await Item.create({
            lender: req.user._id,
            name,
            category,
            description,
            pricePerDay: Number(pricePerDay),
            discountPercentage: Number(discountPercentage) || 0,
            quantity: Number(quantity),
            availabilityStatus,
            minRentalDays: Number(minRentalDays),
            maxRentalDays: Number(maxRentalDays),
            pickupLocation,
            image: req.file ? `/uploads/${req.file.filename}` : null,
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get all items listed by the logged-in lender
// @route   GET /api/inventory/my-items
// @access  Private (Lender only)
export const getMyItems = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, availability } = req.query;

        const query = { lender: req.user._id };

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

        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
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
