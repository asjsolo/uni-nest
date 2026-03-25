import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer ID is required'],
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required'],
  },
  rentalId: {
    type: String,
    required: [true, 'Rental ID is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
  },
}, {
  timestamps: true,
});

// One review per user per rental
reviewSchema.index({ reviewer: 1, rentalId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
