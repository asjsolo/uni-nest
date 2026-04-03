import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './MainDashboard.css';

const MainDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

      {/* Hero */}
      <div className="main-dash-body">
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

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Access</h2>
          <div className="qa-grid">
            <motion.button
              className="qa-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/profile')}
            >
              <span className="qa-icon">👤</span>
              <span>My Profile</span>
            </motion.button>
            <motion.button
              className="qa-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/inventory')}
            >
              <span className="qa-icon">📦</span>
              <span>Browse Items</span>
            </motion.button>
            <motion.button
              className="qa-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/analytics')}
            >
              <span className="qa-icon">📊</span>
              <span>Analytics</span>
            </motion.button>
            <motion.button
              className="qa-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/analytics?tab=reviews')}
            >
              <span className="qa-icon">⭐</span>
              <span>Reviews</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
