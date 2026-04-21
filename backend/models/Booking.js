import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
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
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        dueDate: {
            type: Date,
        },
        returnedDate: {
            type: Date,
            default: null,
        },
        totalDays: {
            type: Number,
            default: 0,
        },
        totalCost: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'returned', 'overdue'],
            default: 'pending',
        },
        finePerDay: {
            type: Number,
            default: 10,
        },
        fineAmount: {
            type: Number,
            default: 0,
        },
        fineCollected: {
            type: Boolean,
            default: false,
        },
        notifications: [
            {
                message: String,
                createdAt: { type: Date, default: Date.now },
                read: { type: Boolean, default: false },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
