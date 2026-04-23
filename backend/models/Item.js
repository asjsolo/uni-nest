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
        image: {
            type: String,
        },
        isEmergency: {
            type: Boolean,
            default: false,
        },
        pricePerDay: {
            type: Number,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // Made optional to support user's manual items2 data
        },
    },
    {
        timestamps: true,
        collection: 'items2'
    }
);

const Item = mongoose.model('Item', itemSchema);
export default Item;
