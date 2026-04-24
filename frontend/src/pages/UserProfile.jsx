import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import TrustScoreCard from '../components/TrustScoreCard';
import './Auth.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lendingHistory, setLendingHistory] = useState([]);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [trust, setTrust] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      try {
        const [profileRes, lendingRes, borrowingRes, trustRes] = await Promise.all([
          axios.get('http://localhost:5000/api/auth/profile', { headers }),
          axios
            .get('http://localhost:5000/api/bookings/lender-bookings', { headers })
            .catch(() => ({ data: [] })),
          axios
            .get('http://localhost:5000/api/bookings/my-requests', { headers })
            .catch(() => ({ data: [] })),
          axios
            .get('http://localhost:5000/api/item-reviews/trust-score/me', { headers })
            .catch(() => ({ data: null })),
        ]);
        setProfile(profileRes.data);
        setLendingHistory(Array.isArray(lendingRes.data) ? lendingRes.data : []);
        setBorrowingHistory(Array.isArray(borrowingRes.data) ? borrowingRes.data : []);
        setTrust(trustRes.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load profile.');
      } finally {
        setLoading(false);
        setHistoryLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = profile?.fullname || profile?.name || 'Student';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

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
              onClick={() => navigate('/dashboard')}
              className="back-link"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ← Back to Dashboard
            </button>
            <div
              className="role-badge"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              👤 My Profile
            </div>
          </div>

          {loading ? (
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>
              Loading your profile...
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
                    background:
                      'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    flexShrink: 0,
                  }}
                >
                  {initials || '🎓'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1
                    className="auth-title"
                    style={{ fontSize: '1.4rem', marginBottom: '6px' }}
                  >
                    {displayName}
                  </h1>
                  <p
                    className="auth-subtitle"
                    style={{ margin: 0, fontSize: '0.9rem' }}
                  >
                    {profile?.email || 'No email on file'}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  marginTop: '8px',
                }}
              >
                <ProfileRow
                  label="Full Name"
                  value={displayName}
                  icon="🧑"
                />
                <ProfileRow
                  label="Email Address"
                  value={profile?.email || '—'}
                  icon="📧"
                />
                <ProfileRow
                  label="Phone Number"
                  value={profile?.phonenumber || '—'}
                  icon="📱"
                />
                <ProfileRow
                  label="Campus Registration No."
                  value={profile?.campusRegistrationNumber || '—'}
                  icon="🎓"
                />
                <ProfileRow
                  label="Account Role"
                  value={(profile?.role || 'user').toUpperCase()}
                  icon="🛡️"
                />
                <ProfileRow
                  label="Member Since"
                  value={joinedDate}
                  icon="📅"
                />
              </div>

              <button
                onClick={handleLogout}
                className="btn-auth"
                style={{
                  background:
                    'linear-gradient(135deg, #ef4444, #b91c1c)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.35)',
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>

        {!loading && !error && (
          <>
            {trust && <TrustScoreCard trust={trust} />}
            <HistoryTable
              title="🏷️ Lending History"
              subtitle="Items you have lent to other students."
              rows={lendingHistory}
              role="lender"
              loading={historyLoading}
            />
            <HistoryTable
              title="🎒 Borrowing History"
              subtitle="Items you have borrowed from other students."
              rows={borrowingHistory}
              role="borrower"
              loading={historyLoading}
            />
          </>
        )}
      </div>
    </>
  );
};

const StatusPill = ({ status }) => {
  const map = {
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.35)' },
    approved: { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: 'rgba(59,130,246,0.35)' },
    rejected: { bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.35)' },
    active: { bg: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: 'rgba(124,58,237,0.35)' },
    returned: { bg: 'rgba(14,165,233,0.15)', color: '#7dd3fc', border: 'rgba(14,165,233,0.35)' },
    completed: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.35)' },
    overdue: { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: 'rgba(239,68,68,0.35)' },
  };
  const s = map[status] || { bg: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: 'rgba(255,255,255,0.15)' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '99px',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {status || 'unknown'}
    </span>
  );
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const HistoryTable = ({ title, subtitle, rows, role, loading }) => {
  const counterpartyLabel = role === 'lender' ? 'Borrower' : 'Lender';

  const th = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    whiteSpace: 'nowrap',
  };

  const td = {
    padding: '12px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    verticalAlign: 'middle',
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading...
          </td>
        </tr>
      );
    }
    if (!rows || rows.length === 0) {
      return (
        <tr>
          <td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--text-muted)' }}>
            No records yet.
          </td>
        </tr>
      );
    }
    return rows.map((r) => {
      const counterparty = role === 'lender' ? r.borrower : r.lender;
      const counterpartyName =
        counterparty?.fullname || counterparty?.name || '—';
      return (
        <tr key={r._id}>
          <td style={{ ...td, color: 'var(--text-primary)', fontWeight: 600 }}>
            {r.item?.name || 'Unknown item'}
          </td>
          <td style={td}>{counterpartyName}</td>
          <td style={td}>{formatDate(r.startDate)}</td>
          <td style={td}>{formatDate(r.dueDate || r.endDate)}</td>
          <td style={td}>
            <StatusPill status={r.status} />
          </td>
        </tr>
      );
    });
  };

  return (
    <div
      className="glass-card fade-up"
      style={{
        width: '100%',
        maxWidth: '900px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px',
          }}
        >
          <thead>
            <tr>
              <th style={th}>Item</th>
              <th style={th}>{counterpartyLabel}</th>
              <th style={th}>Start</th>
              <th style={th}>Due / End</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    </div>
  );
};

const ProfileRow = ({ label, value, icon }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '14px 16px',
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      <span
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
    <span
      style={{
        fontSize: '0.9rem',
        color: 'var(--text-primary)',
        fontWeight: 600,
        textAlign: 'right',
        wordBreak: 'break-word',
        maxWidth: '60%',
      }}
    >
      {value}
    </span>
  </div>
);

export default UserProfile;
