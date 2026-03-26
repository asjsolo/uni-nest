import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
    {
        title: {
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
        pricing: {
            depositAmount: {
                type: Number,
                required: true,
            },
            fullPrice: {
                type: Number,
                required: true,
            },
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
