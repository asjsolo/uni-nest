import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        rentalPrice: {
            type: Number,
            required: true,
        },
        marketPrice: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Available', 'Rented', 'Deactivated'],
            default: 'Available',
        },
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
