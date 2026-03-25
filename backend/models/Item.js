import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Books', 'Sports', 'Tools', 'Clothing', 'Other'],
  },
  marketPrice: {
    type: Number,
    required: [true, 'Market price is required'],
    min: 0,
  },
  rentalPrice: {
    type: Number,
    required: [true, 'Rental price is required'],
    min: 0,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
