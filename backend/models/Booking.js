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
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        returnedDate: {
            type: Date,
            default: null,
        },
        totalDays: {
            type: Number,
            required: true,
        },
        totalCost: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'returned', 'overdue'],
            default: 'active',
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
