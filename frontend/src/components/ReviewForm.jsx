import { useState } from 'react';
import StarRating from './StarRating';
import { createReview, updateReview } from '../api/analyticsApi';

const ReviewForm = ({ itemId, currentUser, onReviewAdded, editingReview = null, onCancelEdit }) => {
  const [rating, setRating] = useState(editingReview ? editingReview.rating : 0);
  const [comment, setComment] = useState(editingReview ? editingReview.comment : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Please select a user first');
      return;
    }
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setLoading(true);
    try {
      if (editingReview) {
        await updateReview(editingReview._id, {
          reviewer: currentUser,
          rating,
          comment: comment.trim(),
        });
      } else {
        await createReview({
          reviewer: currentUser,
          item: itemId,
          rating,
          comment: comment.trim(),
        });
      }

      setRating(0);
      setComment('');
      onReviewAdded();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>{editingReview ? 'Edit Review' : 'Write a Review'}</h3>

      <div className="form-group">
        <label>Rating</label>
        <StarRating rating={rating} onRate={setRating} size={28} />
      </div>

      <div className="form-group">
        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
        </button>
        {editingReview && (
          <button type="button" className="btn-cancel" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
