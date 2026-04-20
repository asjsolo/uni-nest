import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const BorrowerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { label: 'Items Borrowed', value: '0', icon: '🎒' },
    { label: 'Active Requests', value: '0', icon: '🔄' },
    { label: 'Items Returned', value: '0', icon: '✅' },
    { label: 'Rating', value: '—', icon: '⭐' },
  ];

  return (
    <>
      <div className="page-bg" />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar borrower-sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">UniNest</span>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar borrower-avatar">
              {user?.fullname?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div className="profile-info">
              <p className="profile-name">{user?.fullname}</p>
              <div className="profile-role-badge borrower-role-badge">🎒 Borrower</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <span className="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">🔍</span> Browse Items
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">📋</span> My Requests
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">💬</span> Messages
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">⚙️</span> Settings
            </a>
          </nav>

          <button className="sidebar-logout" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </aside>

        {/* Main content */}
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header fade-up">
            <div>
              <h1 className="dashboard-greeting">
                Welcome back, <span className="borrower-highlight">{user?.fullname?.split(' ')[0]}</span> 👋
              </h1>
              <p className="dashboard-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button className="browse-btn">🔍 Browse Items</button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid fade-up" style={{ animationDelay: '0.1s' }}>
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card glass-card">
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <div className="stat-value borrower-stat">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Profile Details */}
          <div className="content-grid fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card info-card">
              <h3 className="card-heading">Account Details</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">📧 Email</span>
                  <span className="info-val">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📱 Phone</span>
                  <span className="info-val">{user?.phonenumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🎓 Reg. No.</span>
                  <span className="info-val">{user?.campusRegistrationNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🎭 Role</span>
                  <span className="info-val borrower-highlight" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="glass-card info-card">
              <h3 className="card-heading">Quick Actions</h3>
              <div className="quick-actions borrower-actions">
                <button className="action-btn">🔍 Browse All Items</button>
                <button className="action-btn">📋 View My Requests</button>
                <button className="action-btn">💬 Open Messages</button>
                <button className="action-btn">📜 Borrowing History</button>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="glass-card empty-state fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="empty-icon">🔍</div>
            <h3>No active borrows yet</h3>
            <p>Browse available items from lenders on your campus and make a request.</p>
            <button className="btn-empty borrower-btn-empty">Browse Available Items</button>
          </div>
        </main>
      </div>
    </>
  );
};

export default BorrowerDashboard;
