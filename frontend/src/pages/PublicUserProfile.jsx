import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TrustScoreCard, { TIER_STYLES } from '../components/TrustScoreCard';
import './Auth.css';

const PublicUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [trust, setTrust] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [userRes, trustRes, summaryRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/auth/user/${userId}`),
          axios
            .get(`http://localhost:5000/api/item-reviews/trust-score/${userId}`)
            .catch(() => ({ data: null })),
          axios
            .get(`http://localhost:5000/api/bookings/summary/${userId}`)
            .catch(() => ({ data: null })),
        ]);
        setUser(userRes.data);
        setTrust(trustRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load user profile.');
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const displayName = user?.fullname || user?.name || 'Student';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const tier = trust ? TIER_STYLES[trust.tier] || TIER_STYLES.new : TIER_STYLES.new;
  const badges = buildBadges({ trust, summary });

  return (
    <>
      <div className="page-bg" />
      <div
        className="auth-page"
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '20px',
          padding: '24px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="auth-card glass-card fade-up"
          style={{ maxWidth: '620px', width: '100%' }}
        >
          <div className="auth-card-header">
            <button
              onClick={() => navigate(-1)}
              className="back-link"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ← Back
            </button>
            <div
              className="role-badge"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              👤 Public Profile
            </div>
          </div>

          {loading ? (
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              Loading profile...
            </p>
          ) : error ? (
            <div className="alert-error">⚠️ {error}</div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '18px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'white',
                    background: tier.gradient,
                    boxShadow: tier.glow,
                    flexShrink: 0,
                  }}
                >
                  {initials || '🎓'}
                </div>
                <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <h1
                    className="auth-title"
                    style={{ fontSize: '1.4rem', marginBottom: '6px' }}
                  >
                    {displayName}
                  </h1>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {trust && (
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '99px',
                          background: tier.gradient,
                          color: 'white',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          border: `1px solid ${tier.ring}`,
                        }}
                      >
                        {tier.icon} {trust.label}
                      </span>
                    )}
                    {trust?.isTrusted && (
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '99px',
                          background: 'rgba(16,185,129,0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16,185,129,0.35)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        ✓ Trusted
                      </span>
                    )}
                  </div>
                  <p
                    className="auth-subtitle"
                    style={{ margin: '8px 0 0', fontSize: '0.82rem' }}
                  >
                    Member since {joinedDate}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                }}
              >
                <SummaryTile
                  label="Items Listed"
                  value={summary?.itemsListed ?? '—'}
                  icon="📦"
                />
                <SummaryTile
                  label="Completed Rentals"
                  value={summary?.totalCompleted ?? '—'}
                  icon="✅"
                />
                <SummaryTile
                  label="Active Rentals"
                  value={
                    (summary?.activeAsLender ?? 0) +
                    (summary?.activeAsBorrower ?? 0)
                  }
                  icon="🔄"
                />
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  textAlign: 'left',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 10px',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  Rental Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <BreakdownRow
                    label="Completed as Lender"
                    value={summary?.completedAsLender ?? 0}
                  />
                  <BreakdownRow
                    label="Completed as Borrower"
                    value={summary?.completedAsBorrower ?? 0}
                  />
                  <BreakdownRow
                    label="Active as Lender"
                    value={summary?.activeAsLender ?? 0}
                  />
                  <BreakdownRow
                    label="Active as Borrower"
                    value={summary?.activeAsBorrower ?? 0}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  textAlign: 'left',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 10px',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  Earned Badges
                </h3>
                {badges.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    No badges earned yet.
                  </p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    {badges.map((b) => (
                      <span
                        key={b.key}
                        title={b.description}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '99px',
                          background: b.background,
                          color: b.color,
                          border: `1px solid ${b.border}`,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{b.icon}</span>
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!loading && !error && trust && (
          <TrustScoreCard trust={trust} />
        )}
      </div>
    </>
  );
};

const SummaryTile = ({ label, value, icon }) => (
  <div
    style={{
      padding: '14px 12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '1.2rem' }}>{icon}</div>
    <div
      style={{
        fontSize: '1.15rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginTop: '4px',
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
      {label}
    </div>
  </div>
);

const BreakdownRow = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      fontSize: '0.85rem',
    }}
  >
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{value}</span>
  </div>
);

const buildBadges = ({ trust, summary }) => {
  const badges = [];

  if (trust?.tier === 'gold') {
    badges.push({
      key: 'gold',
      icon: '🏆',
      label: 'Trusted User',
      description: 'Score ≥ 80 with 5+ reviews and 5+ completed rentals',
      background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(180,83,9,0.2))',
      color: '#fbbf24',
      border: 'rgba(245,158,11,0.5)',
    });
  } else if (trust?.tier === 'silver') {
    badges.push({
      key: 'silver',
      icon: '🥈',
      label: 'Silver Member',
      description: 'Trust score of 60 or more',
      background: 'linear-gradient(135deg, rgba(203,213,225,0.15), rgba(100,116,139,0.15))',
      color: '#cbd5e1',
      border: 'rgba(203,213,225,0.45)',
    });
  } else if (trust?.tier === 'bronze') {
    badges.push({
      key: 'bronze',
      icon: '🥉',
      label: 'Bronze Member',
      description: 'Trust score of 30 or more',
      background: 'linear-gradient(135deg, rgba(217,119,6,0.18), rgba(120,53,15,0.18))',
      color: '#fbbf24',
      border: 'rgba(217,119,6,0.5)',
    });
  }

  if (trust?.reviewCount >= 5) {
    badges.push({
      key: 'well-reviewed',
      icon: '💬',
      label: 'Well Reviewed',
      description: '5+ reviews received',
      background: 'rgba(124,58,237,0.15)',
      color: '#c4b5fd',
      border: 'rgba(124,58,237,0.4)',
    });
  }
  if (trust?.avgRating >= 4.5 && trust?.reviewCount >= 3) {
    badges.push({
      key: 'top-rated',
      icon: '⭐',
      label: 'Top Rated',
      description: 'Average rating of 4.5+ across at least 3 reviews',
      background: 'rgba(251,191,36,0.15)',
      color: '#fbbf24',
      border: 'rgba(251,191,36,0.4)',
    });
  }
  if (summary?.totalCompleted >= 10) {
    badges.push({
      key: 'veteran',
      icon: '🎖️',
      label: 'Rental Veteran',
      description: '10+ completed rentals',
      background: 'rgba(16,185,129,0.15)',
      color: '#34d399',
      border: 'rgba(16,185,129,0.4)',
    });
  } else if (summary?.totalCompleted >= 1) {
    badges.push({
      key: 'first-rental',
      icon: '🚀',
      label: 'First Rental',
      description: 'Completed their first rental',
      background: 'rgba(59,130,246,0.15)',
      color: '#93c5fd',
      border: 'rgba(59,130,246,0.4)',
    });
  }
  if (summary?.itemsListed >= 5) {
    badges.push({
      key: 'active-lender',
      icon: '🏷️',
      label: 'Active Lender',
      description: 'Listed 5+ items on UniNest',
      background: 'rgba(14,165,233,0.15)',
      color: '#7dd3fc',
      border: 'rgba(14,165,233,0.4)',
    });
  }

  return badges;
};

export default PublicUserProfile;
