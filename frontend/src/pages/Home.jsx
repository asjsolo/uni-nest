import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-bg" />

      <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        {/* Hero Section */}
        <div className="home-hero fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="home-badge" style={{ margin: '0 auto 20px' }}>🏠 Campus Housing Platform</div>
          <h1 className="home-title">
            Welcome to <span className="gradient-text">UniNest</span>
          </h1>
          <p className="home-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            The smartest way to lend and borrow items within your campus community.
            Connect, share, and thrive together with a unified student account.
          </p>
        </div>

        {/* Unified Auth Actions */}
        <div className="fade-up" style={{ animationDelay: '0.15s', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            className="btn-auth btn-primary"
            style={{ padding: '15px 40px', fontSize: '1.1rem', minWidth: '180px', borderRadius: '99px' }}
          >
            Login
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            className="btn-auth"
            style={{ 
              padding: '15px 40px', 
              fontSize: '1.1rem', 
              minWidth: '180px', 
              background: 'rgba(255,255,255,0.1)', 
              color: '#fff', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '99px',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            Register
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
