import { useState, useEffect } from 'react';
import { getAllItems, getAllUsers, getReviewsByItem } from '../../api/analyticsApi';
import StarRating from '../../components/StarRating';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load users and items on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, itemsRes] = await Promise.all([getAllUsers(), getAllItems()]);
        setUsers(usersRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch reviews when an item is selected
  const fetchReviews = async (itemId) => {
    try {
      const res = await getReviewsByItem(itemId);
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
      setTotalReviews(res.data.totalReviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setEditingReview(null);
    setShowForm(false);
    fetchReviews(item._id);
  };

  const handleReviewChange = () => {
    if (selectedItem) {
      fetchReviews(selectedItem._id);
      // Also refresh items list to update rating badges
      getAllItems().then((res) => setItems(res.data));
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const getReliabilityBadge = (avg, count) => {
    if (count === 0) return { label: 'No Reviews', className: 'badge-none' };
    if (avg >= 4) return { label: 'Highly Rated', className: 'badge-high' };
    if (avg >= 2) return { label: 'Average', className: 'badge-medium' };
    return { label: 'Low Rated', className: 'badge-low' };
  };

  const currentUserName = users.find((u) => u._id === currentUser)?.name || '';

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>UNI NEST</h1>
          <span className="header-subtitle">Rating & Review System</span>
        </div>
        <div className="header-right">
          <label>Logged in as:</label>
          <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)}>
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
          {currentUserName && <span className="current-user-badge">{currentUserName}</span>}
        </div>
      </header>

      <div className="dashboard-body">
        {/* Items Grid */}
        <section className={`items-section ${selectedItem ? 'collapsed' : ''}`}>
          <h2>Rental Items</h2>
          <div className="items-grid">
            {items.map((item) => {
              const badge = getReliabilityBadge(item.averageRating, item.totalReviews);
              return (
                <div
                  key={item._id}
                  className={`item-card ${selectedItem?._id === item._id ? 'active' : ''}`}
                  onClick={() => selectItem(item)}
                >
                  <div className="item-image">
                    <img src={item.image || 'https://placehold.co/300x200/eee/999?text=No+Image'} alt={item.name} />
                    <span className="item-category">{item.category}</span>
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <div className="item-price">
                      <span className="rental-price">Rs.{item.rentalPrice}/day</span>
                      <span className="market-price">Rs.{item.marketPrice}</span>
                    </div>
                    <div className="item-rating-row">
                      <StarRating rating={Math.round(item.averageRating)} size={16} />
                      <span className="rating-text">
                        {item.averageRating > 0 ? `${item.averageRating}/5` : 'No ratings'}
                      </span>
                      <span className={`badge ${badge.className}`}>{badge.label}</span>
                    </div>
                    <p className="item-owner">Owner: {item.owner?.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Item Detail + Reviews Panel */}
        {selectedItem && (
          <section className="detail-section">
            <button className="btn-back" onClick={() => setSelectedItem(null)}>
              &larr; Back to Items
            </button>

            {/* Item Detail Header */}
            <div className="detail-header">
              <img
                src={selectedItem.image || 'https://placehold.co/300x200/eee/999?text=No+Image'}
                alt={selectedItem.name}
                className="detail-image"
              />
              <div className="detail-info">
                <h2>{selectedItem.name}</h2>
                <span className="item-category">{selectedItem.category}</span>
                <p className="detail-desc">{selectedItem.description}</p>
                <div className="detail-prices">
                  <span className="rental-price">Rs.{selectedItem.rentalPrice}/day</span>
                  <span className="market-price">Market: Rs.{selectedItem.marketPrice}</span>
                  <span className="savings-tag">
                    Save Rs.{selectedItem.marketPrice - selectedItem.rentalPrice}
                  </span>
                </div>
                <p className="detail-owner">Listed by: <strong>{selectedItem.owner?.name}</strong></p>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="rating-summary">
              <div className="rating-big">
                <span className="rating-number">{averageRating}</span>
                <span className="rating-outof">/5</span>
              </div>
              <StarRating rating={Math.round(averageRating)} size={24} />
              <span className="rating-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
              {(() => {
                const badge = getReliabilityBadge(averageRating, totalReviews);
                return <span className={`badge ${badge.className}`}>{badge.label}</span>;
              })()}
            </div>

            {/* Write Review Button / Form */}
            {currentUser && currentUser !== selectedItem.owner?._id && (
              <div className="review-form-section">
                {!showForm ? (
                  <button className="btn-write-review" onClick={() => setShowForm(true)}>
                    Write a Review
                  </button>
                ) : (
                  <ReviewForm
                    itemId={selectedItem._id}
                    currentUser={currentUser}
                    editingReview={editingReview}
                    onReviewAdded={handleReviewChange}
                    onCancelEdit={() => {
                      setEditingReview(null);
                      setShowForm(false);
                    }}
                  />
                )}
              </div>
            )}

            {!currentUser && (
              <p className="login-hint">Select a user above to write a review.</p>
            )}

            {/* Reviews List */}
            <div className="reviews-section">
              <h3>Reviews ({totalReviews})</h3>
              <ReviewList
                reviews={reviews}
                currentUser={currentUser}
                onReviewDeleted={handleReviewChange}
                onEditReview={handleEditReview}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
