import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const MainDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="page-bg" />
      <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-card glass-card fade-up" style={{ maxWidth: '600px', textAlign: 'center' }}>
          
          <div className="auth-card-header" style={{ justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </div>

          <h1 className="auth-title">Welcome, {user?.name?.split(' ')[0] || 'Student'}!</h1>
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
      </div>
    </>
  );
};

export default MainDashboard;
