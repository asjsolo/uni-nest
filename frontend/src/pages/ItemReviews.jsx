import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API = 'http://localhost:5000/api/item-reviews';

const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '2px',
              color: active ? '#fbbf24' : 'rgba(255,255,255,0.25)',
              transition: 'color 0.15s ease, transform 0.15s ease',
              transform: active ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

const StarDisplay = ({ value }) => (
  <span style={{ color: '#fbbf24', letterSpacing: '1px' }}>
    {'★'.repeat(Math.round(value))}
    <span style={{ color: 'rgba(255,255,255,0.2)' }}>
      {'★'.repeat(Math.max(0, 5 - Math.round(value)))}
    </span>
  </span>
);

const smallBtn = (opts = {}) => ({
  padding: '4px 10px',
  fontSize: '0.72rem',
  fontWeight: 600,
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-secondary)',
  ...opts,
});

const ItemReviews = ({ itemId, isOwner }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ count: 0, average: 0 });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const myReview = reviews.find(
    (r) => user?._id && String(r.reviewer) === String(user._id)
  );

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/item/${itemId}`);
      setReviews(res.data.reviews || []);
      setStats(res.data.stats || { count: 0, average: 0 });
    } catch (err) {
      setError('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) fetchReviews();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!rating) return setError('Please pick a star rating.');
    if (!comment.trim()) return setError('Please write a short review.');

    const token = localStorage.getItem('token');
    if (!token) return setError('You must be signed in to review.');

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/item/${itemId}`,
        { rating, comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRating(0);
      setComment('');
      setSuccess('Thanks for your review!');
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setEditRating(r.rating);
    setEditComment(r.comment);
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const saveEdit = async (reviewId) => {
    setEditError('');
    if (!editRating) return setEditError('Please pick a star rating.');
    if (!editComment.trim()) return setEditError('Please write a short review.');

    const token = localStorage.getItem('token');
    if (!token) return setEditError('You must be signed in.');

    setSavingEdit(true);
    try {
      await axios.put(
        `${API}/${reviewId}`,
        { rating: editRating, comment: editComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Could not update review.');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.delete(`${API}/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingId === reviewId) setEditingId(null);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete review.');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div
      className="glass-card fade-up"
      style={{
        padding: '26px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            ⭐ Reviews & Ratings
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            What other students are saying about this item.
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
            {stats.average ? stats.average.toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {stats.count} review{stats.count === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {isOwner ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          You own this item, so you can't review it. Reviews from other students appear below.
        </p>
      ) : myReview ? (
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '10px',
            padding: '10px 12px',
            textAlign: 'center',
          }}
        >
          ✓ You already reviewed this item — edit or delete your review below.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Your rating
            </label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a short review (max 500 characters)..."
            maxLength={500}
            rows={3}
            className="form-input"
            style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem', padding: '12px' }}
          />

          {error && (
            <div
              style={{
                fontSize: '0.82rem',
                color: '#f87171',
                background: 'rgba(248,113,113,0.08)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(248,113,113,0.25)',
              }}
            >
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div
              style={{
                fontSize: '0.82rem',
                color: '#34d399',
                background: 'rgba(52,211,153,0.08)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(52,211,153,0.25)',
              }}
            >
              ✓ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-auth"
            style={{
              marginTop: '2px',
              padding: '12px',
              fontSize: '0.92rem',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              boxShadow: '0 4px 18px rgba(124, 58, 237, 0.35)',
            }}
          >
            {submitting ? <span className="btn-spinner" /> : null}
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '360px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            No reviews yet — be the first to review this item!
          </p>
        ) : (
          reviews.map((r) => {
            const isMine = user?._id && String(r.reviewer) === String(user._id);
            const isEditing = editingId === r._id;
            return (
              <div
                key={r._id}
                style={{
                  padding: '12px 14px',
                  background: isMine ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.04)',
                  border: isMine
                    ? '1px solid rgba(124,58,237,0.3)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {r.reviewerName || 'Student'}
                    {isMine && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '0.68rem',
                          color: '#c4b5fd',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '99px',
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.3)',
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </strong>
                  {isEditing ? (
                    <StarInput value={editRating} onChange={setEditRating} />
                  ) : (
                    <StarDisplay value={r.rating} />
                  )}
                </div>

                {isEditing ? (
                  <>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="form-input"
                      style={{
                        width: '100%',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        fontSize: '0.88rem',
                        padding: '10px',
                        marginBottom: '8px',
                      }}
                    />
                    {editError && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#f87171',
                          marginBottom: '8px',
                        }}
                      >
                        ⚠️ {editError}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => saveEdit(r._id)}
                        style={smallBtn({
                          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                          color: 'white',
                          border: '1px solid rgba(124,58,237,0.4)',
                        })}
                      >
                        {savingEdit ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={cancelEdit} style={smallBtn()}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        margin: '0 0 6px',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}
                    >
                      {r.comment}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formatDate(r.createdAt)}
                        {r.updatedAt && r.updatedAt !== r.createdAt ? ' (edited)' : ''}
                      </span>
                      {isMine && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            style={smallBtn()}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteReview(r._id)}
                            style={smallBtn({
                              color: '#f87171',
                              borderColor: 'rgba(248,113,113,0.3)',
                              background: 'rgba(248,113,113,0.08)',
                            })}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ItemReviews;
