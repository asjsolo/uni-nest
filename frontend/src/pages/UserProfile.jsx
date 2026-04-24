import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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
        style={{ justifyContent: 'center', alignItems: 'center' }}
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
      </div>
    </>
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
