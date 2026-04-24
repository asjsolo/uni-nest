import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PlatformReviews from './PlatformReviews';
import './Auth.css';

const MainDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.fullname || user?.name || 'Student';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <div className="page-bg" />
      <div
        className="auth-page"
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '20px',
          padding: '24px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div className="auth-card glass-card fade-up" style={{ maxWidth: '600px', textAlign: 'center' }}>

          <div
            className="auth-card-header"
            style={{ justifyContent: 'flex-end', marginBottom: '10px', gap: '12px' }}
          >
            <button
              onClick={() => navigate('/profile')}
              title="View your profile"
              aria-label="Open user profile"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.35)';
              }}
            >
              {initials || '👤'}
            </button>
            <button
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </div>

          <h1 className="auth-title">Welcome, {displayName.split(' ')[0]}!</h1>
          <p className="auth-subtitle" style={{ marginBottom: '20px' }}>Choose your portal to enter.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            
            {/* Lender Flow Registration / Entry */}
            <button 
              onClick={() => navigate('/lender-dashboard')}
              className="btn-auth btn-lender"
              style={{ padding: '24px', fontSize: '1.2rem', justifyContent: 'flex-start' }}
            >
              <div style={{ fontSize: '2rem', marginRight: '20px' }}>🏷️</div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Enter Lender Dashboard</strong>
                <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 'normal' }}>List items, approve requests, and earn reputation.</span>
              </div>
            </button>

            {/* Borrower Flow Registration / Entry */}
            <button 
              onClick={() => navigate('/borrower-dashboard')}
              className="btn-auth btn-borrower"
              style={{ padding: '24px', fontSize: '1.2rem', justifyContent: 'flex-start' }}
            >
              <div style={{ fontSize: '2rem', marginRight: '20px' }}>🎒</div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Enter Borrower Dashboard</strong>
                <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 'normal' }}>Browse the marketplace, request items, and track rentals.</span>
              </div>
            </button>

          </div>
        </div>

        <PlatformReviews />
      </div>
    </>
  );
};

export default MainDashboard;
