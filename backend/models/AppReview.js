import mongoose from 'mongoose';

const appReviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('AppReview', appReviewSchema);
