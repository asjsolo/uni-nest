import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate('/login', { state: { role } });
  };

  return (
    <>
      <div className="page-bg" />

      <div className="home-container">
        {/* Hero Section */}
        <div className="home-hero fade-up">
          <div className="home-badge">🏠 Campus Housing Platform</div>
          <h1 className="home-title">
            Welcome to <span className="gradient-text">UniNest</span>
          </h1>
          <p className="home-subtitle">
            The smart way to lend and borrow items within your campus community.
            Connect, share, and thrive together.
          </p>
        </div>

        {/* Role Cards */}
        <div className="role-cards fade-up" style={{ animationDelay: '0.15s' }}>
          {/* Lender Card */}
          <div className="role-card lender-card" onClick={() => handleRoleSelection('lender')}>
            <div className="role-card-glow lender-glow" />
            <div className="role-icon lender-icon">🏷️</div>
            <h2 className="role-title">I'm a Lender</h2>
            <p className="role-desc">
              List your items for fellow students to borrow. Earn trust, build connections
              , and help your campus community.
            </p>
            <ul className="role-perks">
              <li>✦ List unlimited items</li>
              <li>✦ Manage borrowing requests</li>
              <li>✦ Build your campus reputation</li>
            </ul>
            <div className="role-cta lender-cta">
              Get Started as Lender
              <span className="cta-arrow">→</span>
            </div>
          </div>

          {/* Divider */}
          <div className="role-divider">
            <div className="divider-line" />
            <span>or</span>
            <div className="divider-line" />
          </div>

          {/* Borrower Card */}
          <div className="role-card borrower-card" onClick={() => handleRoleSelection('borrower')}>
            <div className="role-card-glow borrower-glow" />
            <div className="role-icon borrower-icon">🎒</div>
            <h2 className="role-title">I'm a Borrower</h2>
            <p className="role-desc">
              Find and borrow items from trusted students on campus. Save money and
              access what you need instantly.
            </p>
            <ul className="role-perks">
              <li>✦ Browse available items</li>
              <li>✦ Request with one click</li>
              <li>✦ Track your borrowing history</li>
            </ul>
            <div className="role-cta borrower-cta">
              Get Started as Borrower
              <span className="cta-arrow">→</span>
            </div>
          </div>
        </div>

        <p className="home-footer fade-up" style={{ animationDelay: '0.3s' }}>
          Already have an account?{' '}
          <a href="/login">Sign in here</a>
        </p>
      </div>
    </>
  );
};

export default Home;
