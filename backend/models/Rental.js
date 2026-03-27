import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
    {
        rentalId: {
            type: String,
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        itemName: {
            type: String,
        },
        borrower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rentalPrice: {
            type: Number,
        },
        marketPrice: {
            type: Number,
        },
        durationDays: {
            type: Number,
        },
        totalCost: {
            type: Number,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'active', 'completed', 'ongoing', 'cancelled', 'disputed'],
            default: 'pending',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        returnDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
