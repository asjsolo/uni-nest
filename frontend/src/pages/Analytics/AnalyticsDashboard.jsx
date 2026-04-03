import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getAllItems, getReviewsByItem,
  getStudentSummary, getRentalHistory, getTrustScore,
} from '../../api/analyticsApi';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import ReviewForm from '../../components/ReviewForm';
import ReviewList from '../../components/ReviewList';
import TrustScore from '../../components/TrustScore';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { currentUser: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use logged-in user ID for analytics
  const currentUser = authUser?._id || '';

  // Shared state
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'reviews' ? 'reviews' : 'analytics');
  const [loading, setLoading] = useState(true);

  // Analytics state
  const [summary, setSummary] = useState(null);
  const [trustData, setTrustData] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [rentalFilter, setRentalFilter] = useState({ status: '', role: '' });

  // Reviews state
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Load items on mount
  useEffect(() => {
    getAllItems()
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Failed to load items:', err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch analytics when user changes
  useEffect(() => {
    if (currentUser) {
      fetchSummary();
      fetchRentals();
      fetchTrustScore();
    } else {
      setSummary(null);
      setTrustData(null);
      setRentals([]);
    }
  }, [currentUser]);

  // Re-fetch rentals when filter changes
  useEffect(() => {
    if (currentUser) fetchRentals();
  }, [rentalFilter]);

  const fetchSummary = async () => {
    try {
      const res = await getStudentSummary(currentUser);
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const fetchTrustScore = async () => {
    try {
      const res = await getTrustScore(currentUser);
      setTrustData(res.data);
    } catch (err) {
      console.error('Failed to load trust score:', err);
    }
  };

  const fetchRentals = async () => {
    try {
      const params = {};
      if (rentalFilter.status) params.status = rentalFilter.status;
      if (rentalFilter.role) params.role = rentalFilter.role;
      const res = await getRentalHistory(currentUser, params);
      setRentals(res.data);
    } catch (err) {
      console.error('Failed to load rentals:', err);
    }
  };

  // Review helpers
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
      getAllItems().then((res) => setItems(res.data));
    }
  };

  const getReliabilityBadge = (avg, count) => {
    if (count === 0) return { label: 'No Reviews', className: 'badge-none' };
    if (avg >= 4) return { label: 'Highly Rated', className: 'badge-high' };
    if (avg >= 2) return { label: 'Average', className: 'badge-medium' };
    return { label: 'Low Rated', className: 'badge-low' };
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button className="dash-back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <h1>UNI NEST</h1>
          <span className="header-subtitle">Student Analytics & Reviews</span>
        </div>
        <div className="header-right">
          <button className="dash-profile-btn" onClick={() => navigate('/profile')}>
            <div className="dash-avatar">{authUser?.name?.charAt(0)}</div>
            <span>{authUser?.name}</span>
          </button>
          <button className="dash-logout-btn" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('analytics'); setSelectedItem(null); }}
        >
          My Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Ratings & Reviews
        </button>
      </nav>

      <div className="dashboard-body">

        {/* ============================== */}
        {/* TAB 1: MY ANALYTICS            */}
        {/* ============================== */}
        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            {!currentUser ? (
              <div className="empty-state">
                <h2>Select a user to view analytics</h2>
                <p>Choose a student from the dropdown above to see their rental activity, savings, and earnings.</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                {summary && (
                  <div className="summary-section">
                    <h2>Savings & Earnings Summary</h2>
                    <div className="summary-cards">
                      <div className="summary-card card-savings">
                        <div className="card-icon">&#8595;</div>
                        <div className="card-content">
                          <span className="card-label">Total Savings</span>
                          <span className="card-value">Rs.{summary.asBorrower.totalSavings.toLocaleString()}</span>
                          <span className="card-sub">vs buying at market price</span>
                        </div>
                      </div>
                      <div className="summary-card card-spent">
                        <div className="card-icon">&#8593;</div>
                        <div className="card-content">
                          <span className="card-label">Total Spent</span>
                          <span className="card-value">Rs.{summary.asBorrower.totalSpent.toLocaleString()}</span>
                          <span className="card-sub">on {summary.asBorrower.completedRentals} completed rental{summary.asBorrower.completedRentals !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="summary-card card-earnings">
                        <div className="card-icon">$</div>
                        <div className="card-content">
                          <span className="card-label">Total Earnings</span>
                          <span className="card-value">Rs.{summary.asLender.totalEarnings.toLocaleString()}</span>
                          <span className="card-sub">from {summary.asLender.completedRentals} item{summary.asLender.completedRentals !== 1 ? 's' : ''} lent</span>
                        </div>
                      </div>
                      <div className="summary-card card-ongoing">
                        <div className="card-icon">&#9654;</div>
                        <div className="card-content">
                          <span className="card-label">Ongoing Rentals</span>
                          <span className="card-value">{summary.totalOngoing}</span>
                          <span className="card-sub">{summary.asBorrower.ongoingRentals} borrowing, {summary.asLender.ongoingRentals} lending</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats Bar */}
                    <div className="quick-stats">
                      <div className="stat-item">
                        <span className="stat-number">{summary.totalCompleted}</span>
                        <span className="stat-label">Completed</span>
                      </div>
                      <div className="stat-divider" />
                      <div className="stat-item">
                        <span className="stat-number">{summary.totalOngoing}</span>
                        <span className="stat-label">Ongoing</span>
                      </div>
                      <div className="stat-divider" />
                      <div className="stat-item">
                        <span className="stat-number">{summary.totalCompleted + summary.totalOngoing}</span>
                        <span className="stat-label">Total Rentals</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust Score */}
                <TrustScore trustData={trustData} />

                {/* Rental History */}
                <div className="rental-history-section">
                  <div className="history-header">
                    <h2>Rental History</h2>
                    <div className="history-filters">
                      <select
                        value={rentalFilter.status}
                        onChange={(e) => setRentalFilter((f) => ({ ...f, status: e.target.value }))}
                      >
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <select
                        value={rentalFilter.role}
                        onChange={(e) => setRentalFilter((f) => ({ ...f, role: e.target.value }))}
                      >
                        <option value="">All Roles</option>
                        <option value="borrower">As Borrower</option>
                        <option value="lender">As Lender</option>
                      </select>
                    </div>
                  </div>

                  {rentals.length === 0 ? (
                    <div className="empty-rentals">No rentals found matching the filters.</div>
                  ) : (
                    <div className="rental-table-wrapper">
                      <table className="rental-table">
                        <thead>
                          <tr>
                            <th>Rental ID</th>
                            <th>Item</th>
                            <th>Role</th>
                            <th>With</th>
                            <th>Duration</th>
                            <th>Total Cost</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rentals.map((r) => (
                            <tr key={r._id}>
                              <td className="rental-id-cell">{r.rentalId}</td>
                              <td>
                                <div className="rental-item-cell">
                                  {r.item?.image && (
                                    <img src={r.item.image} alt={r.itemName} className="rental-item-thumb" />
                                  )}
                                  <span>{r.itemName}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`role-badge role-${r.userRole}`}>
                                  {r.userRole === 'borrower' ? 'Borrower' : 'Lender'}
                                </span>
                              </td>
                              <td>{r.userRole === 'borrower' ? r.lender?.name : r.borrower?.name}</td>
                              <td>{r.durationDays} day{r.durationDays !== 1 ? 's' : ''}</td>
                              <td className="cost-cell">
                                <span>Rs.{r.totalCost}</span>
                                {r.userRole === 'borrower' && (
                                  <span className="saved-inline">
                                    saved Rs.{(r.marketPrice * r.durationDays) - r.totalCost}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className={`status-badge status-${r.status}`}>
                                  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                </span>
                              </td>
                              <td className="date-cell">
                                {new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {r.endDate && (
                                  <> - {new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================== */}
        {/* TAB 2: RATINGS & REVIEWS       */}
        {/* ============================== */}
        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            {/* Items Grid */}
            {!selectedItem && (
              <section className="items-section">
                <h2>Rental Items</h2>
                <div className="items-grid">
                  {items.map((item) => {
                    const badge = getReliabilityBadge(item.averageRating, item.totalReviews);
                    return (
                      <div key={item._id} className="item-card" onClick={() => selectItem(item)}>
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
                          <p className="item-owner">
                            Lender:{' '}
                            <button
                              className="lender-profile-link"
                              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.lender?._id}`); }}
                            >
                              {item.lender?.name}
                            </button>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Item Detail + Reviews */}
            {selectedItem && (
              <section className="detail-section">
                <button className="btn-back" onClick={() => setSelectedItem(null)}>
                  &larr; Back to Items
                </button>

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
                      <span className="savings-tag">Save Rs.{selectedItem.marketPrice - selectedItem.rentalPrice}</span>
                    </div>
                    <p className="detail-owner">Listed by: <strong>{selectedItem.lender?.name}</strong></p>
                  </div>
                </div>

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

                {currentUser && currentUser !== selectedItem.lender?._id && (
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
                        onCancelEdit={() => { setEditingReview(null); setShowForm(false); }}
                      />
                    )}
                  </div>
                )}

                {!currentUser && <p className="login-hint">Select a user above to write a review.</p>}

                <div className="reviews-section">
                  <h3>Reviews ({totalReviews})</h3>
                  <ReviewList
                    reviews={reviews}
                    currentUser={currentUser}
                    onReviewDeleted={handleReviewChange}
                    onEditReview={(review) => { setEditingReview(review); setShowForm(true); }}
                  />
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
