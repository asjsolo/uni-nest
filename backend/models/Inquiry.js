import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
    {
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // Temporarily making this optional or auto-filled since auth context might not be fully established
        },
        message: {
            type: String,
            required: true,
            minlength: 10,
        },
        status: {
            type: String,
            enum: ['Pending', 'Replied', 'Closed'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
