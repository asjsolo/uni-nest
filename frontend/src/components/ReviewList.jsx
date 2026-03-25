import StarRating from './StarRating';
import { deleteReview } from '../api/analyticsApi';

const ReviewList = ({ reviews, currentUser, onReviewDeleted, onEditReview }) => {
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId, currentUser);
      onReviewDeleted();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (reviews.length === 0) {
    return <p className="no-reviews">No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => {
        const isOwner = currentUser === review.reviewer?._id;
        return (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.reviewer?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <strong>{review.reviewer?.name || 'Unknown'}</strong>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <StarRating rating={review.rating} size={18} />
            </div>
            <p className="review-comment">{review.comment}</p>
            <div className="review-footer">
              <span className="rental-tag">Rental: {review.rentalId}</span>
              {isOwner && (
                <div className="review-actions">
                  <button className="btn-edit" onClick={() => onEditReview(review)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(review._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
