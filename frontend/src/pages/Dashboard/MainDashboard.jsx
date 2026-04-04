import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getAppReviews, getUserAppReview, submitAppReview, updateAppReview, deleteAppReview } from '../../api/appReviewApi';
import StarRating from '../../components/StarRating';
import './MainDashboard.css';

const MainDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Reviews state
  const [reviews, setReviews]         = useState([]);
  const [avg, setAvg]                 = useState(0);
  const [total, setTotal]             = useState(0);
  const [myReview, setMyReview]       = useState(null);
  const [editing, setEditing]         = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [formRating, setFormRating]   = useState(0);
  const [formComment, setFormComment] = useState('');
  const [formError, setFormError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => { loadReviews(); }, [currentUser]);

  const loadReviews = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        getAppReviews(),
        currentUser ? getUserAppReview(currentUser._id) : Promise.resolve({ data: null }),
      ]);
      setReviews(allRes.data.reviews);
      setAvg(allRes.data.avg);
      setTotal(allRes.data.total);
      setMyReview(myRes.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const openForm = (prefill = null) => {
    setFormRating(prefill?.rating || 0);
    setFormComment(prefill?.comment || '');
    setFormError('');
    setEditing(!!prefill);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formRating)        return setFormError('Please select a star rating.');
    if (!formComment.trim()) return setFormError('Please write a comment.');
    setSubmitting(true);
    setFormError('');
    try {
      if (editing && myReview) {
        await updateAppReview(myReview._id, { userId: currentUser._id, rating: formRating, comment: formComment });
      } else {
        await submitAppReview({ userId: currentUser._id, rating: formRating, comment: formComment });
      }
      setShowForm(false);
      await loadReviews();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    try {
      await deleteAppReview(myReview._id, currentUser._id);
      setMyReview(null);
      await loadReviews();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const otherReviews = reviews.filter((r) => r.user?._id !== currentUser?._id);

  return (
    <div className="main-dash">
      {/* Header */}
      <header className="main-dash-header">
        <div className="mdh-left">
          <span className="mdh-logo">🏠</span>
          <span className="mdh-title">UNI NEST</span>
        </div>
        <div className="mdh-right">
          <button className="mdh-profile-btn" onClick={() => navigate('/profile')}>
            <div className="mdh-avatar">{currentUser?.name?.charAt(0)}</div>
            <span>{currentUser?.name}</span>
          </button>
          <button className="mdh-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="main-dash-body">
        {/* Welcome */}
        <motion.div
          className="dash-welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Welcome back, {currentUser?.name?.split(' ')[0]} 👋</h1>
          <p>What would you like to do today?</p>
        </motion.div>

        {/* Role Cards */}
        <div className="role-cards">
          <motion.div
            className="role-card role-buyer"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(78,141,156,0.3)' }}
            onClick={() => navigate('/inventory')}
          >
            <div className="role-card-icon">🛒</div>
            <h2>Buyer</h2>
            <p>Browse rental items from other students. Borrow what you need at a fraction of the cost.</p>
            <ul className="role-features">
              <li>📦 Browse all rental items</li>
              <li>🔍 Filter by category</li>
              <li>⭐ Read & write reviews</li>
              <li>💰 See how much you save</li>
            </ul>
            <div className="role-card-btn">Go to Inventory →</div>
          </motion.div>

          <motion.div
            className="role-card role-lender role-coming-soon"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="coming-soon-tag">Coming Soon</div>
            <div className="role-card-icon">🏷️</div>
            <h2>Lender</h2>
            <p>List your items for rent and earn money while helping fellow students on campus.</p>
            <ul className="role-features">
              <li>📦 Add & manage listings</li>
              <li>✅ Approve rental requests</li>
              <li>💸 Track your earnings</li>
              <li>📊 View lender analytics</li>
            </ul>
            <div className="role-card-btn role-card-btn-disabled">Available Soon</div>
          </motion.div>
        </div>

        {/* ── Community Reviews Section ── */}
        <motion.section
          className="app-reviews-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Section header */}
          <div className="ars-header">
            <div className="ars-header-left">
              <h2>Community Reviews</h2>
              <p>What students say about UNI NEST</p>
            </div>
            <div className="ars-aggregate">
              <span className="ars-avg">{avg > 0 ? avg.toFixed(1) : '—'}</span>
              <div className="ars-aggregate-right">
                <StarRating rating={Math.round(avg)} size={18} />
                <span className="ars-total">{total} review{total !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="ars-body">
            {/* Left — your review / form */}
            <div className="ars-your-side">
              {!showForm && !myReview && (
                <div className="ars-write-prompt">
                  <div className="ars-prompt-icon">✍️</div>
                  <h3>Share Your Experience</h3>
                  <p>How has UNI NEST helped you on campus?</p>
                  <button className="btn-write-review" onClick={() => openForm()}>
                    Write a Review
                  </button>
                </div>
              )}

              {!showForm && myReview && (
                <div className="ars-my-review">
                  <div className="ars-my-review-header">
                    <span className="ars-your-tag">Your Review</span>
                    <div className="ars-my-actions">
                      <button className="ars-edit-btn" onClick={() => openForm(myReview)}>Edit</button>
                      <button className="ars-delete-btn" onClick={handleDelete}>Delete</button>
                    </div>
                  </div>
                  <StarRating rating={myReview.rating} size={20} />
                  <p className="ars-my-comment">{myReview.comment}</p>
                  <span className="ars-my-date">
                    {new Date(myReview.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    className="ars-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3>{editing ? 'Edit Your Review' : 'Write a Review'}</h3>

                    <div className="ars-form-stars">
                      <label>Your Rating</label>
                      <StarRating rating={formRating} onRate={setFormRating} size={28} />
                    </div>

                    <div className="ars-form-field">
                      <label>Your Comment</label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your experience with UNI NEST..."
                        value={formComment}
                        onChange={(e) => { setFormComment(e.target.value); setFormError(''); }}
                      />
                    </div>

                    {formError && <p className="ars-form-error">{formError}</p>}

                    <div className="ars-form-actions">
                      <button className="btn-submit-review" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Submitting...' : editing ? 'Save Changes' : 'Submit Review'}
                      </button>
                      <button className="btn-cancel-review" onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right — community reviews */}
            <div className="ars-community">
              {otherReviews.length === 0 ? (
                <div className="ars-no-reviews">
                  No community reviews yet. Be the first!
                </div>
              ) : (
                <div className="ars-reviews-grid">
                  {otherReviews.slice(0, 6).map((r) => (
                    <div key={r._id} className="ars-review-card">
                      <div className="arc-top">
                        <div className="arc-avatar">{r.user?.name?.charAt(0)}</div>
                        <div className="arc-meta">
                          <strong>{r.user?.name}</strong>
                          <StarRating rating={r.rating} size={13} />
                        </div>
                        <span className="arc-date">
                          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="arc-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MainDashboard;
