import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: Number,
    default: 0
  },
  actualPrice: {
    type: Number,
    default: 0
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  availabilityStatus: {
    type: String,
    default: 'Available'
  },
  minRentalDays: {
    type: Number,
    default: 1
  },
  maxRentalDays: {
    type: Number,
    default: 1
  },
  pickupLocation: {
    type: String,
    default: ''
  },
  finePerDay: {
    type: Number,
    default: 10
  },
  image: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Item = mongoose.model('Item', itemSchema);
export default Item;
