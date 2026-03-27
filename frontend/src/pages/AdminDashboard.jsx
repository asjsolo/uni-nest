import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './AdminLogin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminRaw = localStorage.getItem('adminUser');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin');
  };

  const stats = [
    { label: 'Total Lenders', value: '—', icon: '🏷️' },
    { label: 'Total Borrowers', value: '—', icon: '🎒' },
    { label: 'Active Listings', value: '—', icon: '📦' },
    { label: 'Pending Reports', value: '—', icon: '⚠️' },
  ];

  return (
    <>
      <div className="page-bg" />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar admin-sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">UniNest</span>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar admin-avatar">
              {admin?.fullname?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="profile-info">
              <p className="profile-name">{admin?.fullname || 'Admin'}</p>
              <div className="profile-role-badge admin-role-badge">⚙️ Admin</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <span className="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">👥</span> Users
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">📦</span> Listings
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">📋</span> Reports
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">📈</span> Analytics
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
                Admin Console,{' '}
                <span className="admin-highlight">
                  {admin?.fullname?.split(' ')[0] || 'Admin'}
                </span>{' '}
                ⚙️
              </h1>
              <p className="dashboard-date">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid fade-up" style={{ animationDelay: '0.1s' }}>
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card glass-card">
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <div className="stat-value admin-stat">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Profile + Quick Actions */}
          <div className="content-grid fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-card info-card">
              <h3 className="card-heading">Admin Details</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">📧 Email</span>
                  <span className="info-val">{admin?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🎭 Role</span>
                  <span className="info-val admin-highlight">Administrator</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🔐 Super Admin</span>
                  <span className="info-val">
                    {admin?.isSuperAdmin ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card info-card">
              <h3 className="card-heading">Quick Actions</h3>
              <div className="quick-actions admin-actions">
                <button className="action-btn">👥 Manage Users</button>
                <button className="action-btn">📦 View All Listings</button>
                <button className="action-btn">📋 View Reports</button>
                <button className="action-btn">📈 Platform Analytics</button>
              </div>
            </div>
          </div>

          {/* Empty state placeholder */}
          <div className="glass-card empty-state fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="empty-icon">⚙️</div>
            <h3>Admin console is ready</h3>
            <p>
              Use the sidebar to navigate between users, listings, and platform
              management tools.
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
