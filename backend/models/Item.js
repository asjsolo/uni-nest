import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
    {
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Please add an item name'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: ['Electronics', 'Books', 'Tools', 'Clothing', 'Sports', 'Furniture', 'Kitchen', 'Other'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        pricePerDay: {
            type: Number,
            required: [true, 'Please add a price per day'],
            min: [0.01, 'Price per day must be greater than 0'],
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
            max: [100, 'Discount cannot exceed 100%'],
        },
        quantity: {
            type: Number,
            required: [true, 'Please add availability quantity'],
            min: [1, 'Quantity must be at least 1'],
            validate: {
                validator: Number.isInteger,
                message: 'Quantity must be a whole number',
            },
        },
        availabilityStatus: {
            type: String,
            enum: ['Available', 'Out of Stock'],
            default: 'Available',
        },
        status: {
            type: String,
            enum: ['published', 'draft'],
            default: 'published',
        },
        finePerDay: {
            type: Number,
            default: 10,
            min: [0, 'Fine per day cannot be negative'],
        },
        minRentalDays: {
            type: Number,
            required: [true, 'Please add minimum rental days'],
            min: [1, 'Minimum rental days must be at least 1'],
        },
        maxRentalDays: {
            type: Number,
            required: [true, 'Please add maximum rental days'],
        },
        pickupLocation: {
            type: String,
            required: [true, 'Please add a pickup location'],
            trim: true,
        },
        image: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
