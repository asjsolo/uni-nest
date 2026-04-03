import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getStudentSummary, getTrustScore, getReviewsByItem, getAllItems } from '../../api/analyticsApi';
import StarRating from '../../components/StarRating';
import './UserProfile.css';

const BADGE_ICONS = { shield: '🛡️', check: '✅', star: '⭐', zap: '⚡', message: '💬', wave: '👋' };

const UserProfile = () => {
  const { userId } = useParams();           // undefined = own profile
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Target user: if userId param given view that user, else view self
  const targetId = userId || currentUser?._id;
  const isOwnProfile = !userId || userId === currentUser?._id;

  const [profileUser, setProfileUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trustData, setTrustData] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    if (!targetId) return;
    fetchAll();
  }, [targetId, currentUser]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch summary, trust score, and items in parallel
      const [summaryRes, trustRes, itemsRes] = await Promise.all([
        getStudentSummary(targetId),
        getTrustScore(targetId),
        getAllItems(),
      ]);

      setSummary(summaryRes.data);
      setTrustData(trustRes.data);
      setProfileUser(summaryRes.data.user);

      // Get reviews for items owned by this user (up to 3 most recent)
      const ownedItems = itemsRes.data.filter(
        (item) => item.lender?._id === targetId || item.lender === targetId
      );

      // Fetch reviews for each owned item, flatten + take latest 3
      const reviewArrays = await Promise.all(
        ownedItems.slice(0, 4).map((item) =>
          getReviewsByItem(item._id).then((r) => r.data.reviews).catch(() => [])
        )
      );
      const allReviews = reviewArrays
        .flat()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentReviews(allReviews);
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error-page">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const trust = trustData;
  const getMeterColor = (score) => score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';
  const meterColor = trust ? getMeterColor(trust.trustScore) : '#9ca3af';

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="profile-header-brand">
          <span className="profile-brand-logo">🏠</span>
          <span className="profile-brand-name">UNI NEST</span>
        </div>
        {isOwnProfile && (
          <button className="profile-dash-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
        )}
      </header>

      <div className="profile-body">
        {/* Left Column */}
        <aside className="profile-sidebar">

          {/* User Card */}
          <motion.div
            className="profile-user-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="profile-big-avatar">
              {profileUser?.name?.charAt(0)}
            </div>
            <h1 className="profile-name">{profileUser?.name}</h1>
            <p className="profile-email">{profileUser?.email}</p>
            {isOwnProfile && <span className="profile-own-tag">Your Profile</span>}

            <div className="profile-meta-row">
              <div className="profile-meta-item">
                <span className="pmeta-val">{summary?.totalCompleted ?? 0}</span>
                <span className="pmeta-label">Completed</span>
              </div>
              <div className="profile-meta-divider" />
              <div className="profile-meta-item">
                <span className="pmeta-val">{summary?.totalOngoing ?? 0}</span>
                <span className="pmeta-label">Ongoing</span>
              </div>
              <div className="profile-meta-divider" />
              <div className="profile-meta-item">
                <span className="pmeta-val">{trust?.breakdown?.reviewCount ?? 0}</span>
                <span className="pmeta-label">Reviews</span>
              </div>
            </div>
          </motion.div>

          {/* Trust Score Panel */}
          {trust && (
            <motion.div
              className="profile-trust-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3>Trust Score</h3>

              {/* Circular Meter */}
              <div className="ptrust-meter">
                <svg viewBox="0 0 120 120" className="ptrust-circle">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={meterColor} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(trust.trustScore / 100) * 327} 327`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="ptrust-meter-text">
                  <span className="ptrust-score" style={{ color: meterColor }}>{trust.trustScore}</span>
                  <span className="ptrust-outof">/100</span>
                </div>
              </div>

              <div className={`ptrust-badge ptrust-${trust.reliabilityLevel.toLowerCase()}`}>
                {trust.reliabilityLevel} Reliability
              </div>

              {/* Avg Rating */}
              <div className="ptrust-rating-row">
                <StarRating rating={Math.round(trust.breakdown.avgRating)} size={16} />
                <span className="ptrust-avg">{trust.breakdown.avgRating}/5</span>
                <span className="ptrust-revcount">({trust.breakdown.reviewCount} reviews)</span>
              </div>

              {/* Breakdown bars */}
              <div className="ptrust-breakdown">
                <div className="ptrust-bar-row">
                  <span>Rating</span>
                  <div className="ptrust-bar-bg">
                    <div className="ptrust-bar-fill" style={{ width: `${(trust.breakdown.ratingScore / 60) * 100}%`, background: '#4f46e5' }} />
                  </div>
                  <span>{trust.breakdown.ratingScore}/60</span>
                </div>
                <div className="ptrust-bar-row">
                  <span>Activity</span>
                  <div className="ptrust-bar-bg">
                    <div className="ptrust-bar-fill" style={{ width: `${(trust.breakdown.activityScore / 40) * 100}%`, background: '#059669' }} />
                  </div>
                  <span>{trust.breakdown.activityScore}/40</span>
                </div>
              </div>

              {/* Badges */}
              {trust.badges.length > 0 && (
                <div className="ptrust-badges">
                  {trust.badges.map((b) => (
                    <div key={b.name} className="ptrust-badge-item">
                      <span>{BADGE_ICONS[b.icon] || '🏆'}</span>
                      <div>
                        <strong>{b.name}</strong>
                        <span>{b.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </aside>

        {/* Right Column */}
        <main className="profile-main">

          {/* Savings & Earnings (own profile only) */}
          {isOwnProfile && summary && (
            <motion.div
              className="profile-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h2>Savings & Earnings</h2>
              <div className="pse-cards">
                <div className="pse-card pse-savings">
                  <div className="pse-icon">💰</div>
                  <div className="pse-info">
                    <span className="pse-label">Total Savings (as Buyer)</span>
                    <span className="pse-value">Rs.{summary.asBorrower.totalSavings.toLocaleString()}</span>
                    <span className="pse-sub">saved vs buying at market price</span>
                  </div>
                </div>
                <div className="pse-card pse-spent">
                  <div className="pse-icon">🛒</div>
                  <div className="pse-info">
                    <span className="pse-label">Total Spent (as Buyer)</span>
                    <span className="pse-value">Rs.{summary.asBorrower.totalSpent.toLocaleString()}</span>
                    <span className="pse-sub">across {summary.asBorrower.completedRentals} completed rentals</span>
                  </div>
                </div>
                <div className="pse-card pse-earnings">
                  <div className="pse-icon">📈</div>
                  <div className="pse-info">
                    <span className="pse-label">Total Earned (as Lender)</span>
                    <span className="pse-value">Rs.{summary.asLender.totalEarnings.toLocaleString()}</span>
                    <span className="pse-sub">from {summary.asLender.completedRentals} item{summary.asLender.completedRentals !== 1 ? 's' : ''} lent</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Feedback / Reviews */}
          <motion.div
            className="profile-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2>Recent Feedback</h2>
            {recentReviews.length === 0 ? (
              <div className="profile-no-reviews">
                No reviews received yet.
              </div>
            ) : (
              <div className="profile-reviews-list">
                {recentReviews.map((review) => (
                  <div key={review._id} className="profile-review-card">
                    <div className="prv-header">
                      <div className="prv-avatar">{review.reviewer?.name?.charAt(0)}</div>
                      <div className="prv-meta">
                        <strong>{review.reviewer?.name}</strong>
                        <span className="prv-item">on: {review.item?.name}</span>
                      </div>
                      <div className="prv-right">
                        <StarRating rating={review.rating} size={14} />
                        <span className="prv-date">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <p className="prv-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Rental Summary (non-own: show basic stats) */}
          {!isOwnProfile && summary && (
            <motion.div
              className="profile-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h2>Rental Activity</h2>
              <div className="pra-stats">
                <div className="pra-stat">
                  <span className="pra-val">{summary.asBorrower.completedRentals}</span>
                  <span className="pra-label">Items Borrowed</span>
                </div>
                <div className="pra-stat">
                  <span className="pra-val">{summary.asLender.completedRentals}</span>
                  <span className="pra-label">Items Lent</span>
                </div>
                <div className="pra-stat">
                  <span className="pra-val">{summary.totalCompleted}</span>
                  <span className="pra-label">Total Completed</span>
                </div>
                <div className="pra-stat">
                  <span className="pra-val">{summary.totalOngoing}</span>
                  <span className="pra-label">Ongoing</span>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
