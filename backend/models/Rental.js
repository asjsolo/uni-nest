import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  rentalId: {
    type: String,
    required: true,
    unique: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rentalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  marketPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  durationDays: {
    type: Number,
    required: true,
    min: 1,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Rental = mongoose.model('Rental', rentalSchema);

export default Rental;
