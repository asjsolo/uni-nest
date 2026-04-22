import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dates: {
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true,
            },
            returnDate: {
                type: Date,
            },
        },
        paymentStatus: {
            depositPaid: {
                type: Boolean,
                default: false,
            },
            fullAmountPaid: {
                type: Boolean,
                default: false,
            },
        },
        rentalStatus: {
            type: String,
            enum: ['Pending', 'Approved', 'Active', 'Returned', 'Disputed'],
            default: 'Pending',
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
