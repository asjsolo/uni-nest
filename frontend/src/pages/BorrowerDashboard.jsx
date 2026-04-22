import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const BorrowerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Dashboard');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (err) {
      console.error('Error fetching requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReturnItem = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/return`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to return item');
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to return item');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeRequests = requests.filter(r => r.status === 'active' || r.status === 'pending');
  const itemsReturned = requests.filter(r => r.status === 'returned').length;

  const stats = [
    { label: 'Items Borrowed', value: requests.length.toString(), icon: '🎒' },
    { label: 'Active Requests', value: activeRequests.length.toString(), icon: '🔄' },
    { label: 'Items Returned', value: itemsReturned.toString(), icon: '✅' },
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
            <a href="#" className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Dashboard'); }}>
              <span className="nav-icon">📊</span> Dashboard
            </a>
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); navigate('/browse-items'); }}>
              <span className="nav-icon">🔍</span> Browse Items
            </a>
            <a href="#" className={`nav-item ${activeTab === 'My Requests' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('My Requests'); }}>
              <span className="nav-icon">📋</span> My Requests
              {requests.length > 0 && <span className="nav-badge" style={{ marginLeft: 'auto', background: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{requests.length}</span>}
            </a>
            <a href="#" className={`nav-item ${activeTab === 'Messages' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Messages'); }}>
              <span className="nav-icon">💬</span> Messages
            </a>
          </nav>

          <div className="sidebar-bottom-actions">
            <button className="sidebar-switch-role" onClick={() => navigate('/dashboard')} style={{ width: '100%', marginBottom: '10px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>🔄</span> Back to Main Hub
            </button>
            <button className="sidebar-logout" onClick={handleLogout} style={{ width: '100%' }}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="dashboard-main">
          {activeTab === 'Dashboard' ? (
            <>
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
                <button className="browse-btn" onClick={() => navigate('/browse-items')}>🔍 Browse Items</button>
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
                    <button className="action-btn" onClick={() => navigate('/browse-items')}>🔍 Browse All Items</button>
                    <button className="action-btn" onClick={() => setActiveTab('My Requests')}>📋 View My Requests</button>
                    <button className="action-btn">💬 Open Messages</button>
                    <button className="action-btn">📜 Borrowing History</button>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              {/* Active Rentals / Empty state */}
              {activeRequests.filter(r => r.status === 'active').length === 0 ? (
                <div className="glass-card empty-state fade-up" style={{ animationDelay: '0.3s' }}>
                  <div className="empty-icon">🔍</div>
                  <h3>No active borrows yet</h3>
                  <p>Browse available items from lenders on your campus and make a request.</p>
                  <button className="btn-empty borrower-btn-empty" onClick={() => navigate('/browse-items')}>Browse Available Items</button>
                </div>
              ) : (
                <div className="glass-card listings-section fade-up" style={{ animationDelay: '0.3s', marginTop: '20px' }}>
                  <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>🔄 Active Rentals</h3>
                  <div className="items-grid" style={{ marginTop: '20px' }}>
                    {activeRequests.filter(r => r.status === 'active').map(req => (
                      <div key={req._id} className="item-card glass-card">
                        <div className="item-card-image">
                          {req.item?.image ? (
                            <img src={`http://localhost:5000/${req.item.image.replace(/^[\\/]+/, '')}`} alt={req.item.name} className="item-img" />
                          ) : (
                            <div className="item-img-placeholder">📦</div>
                          )}
                          <div className="item-status-badge badge-available" style={{ textTransform: 'capitalize' }}>
                            rented
                          </div>
                        </div>
                        <div className="item-card-body">
                          <div className="item-card-top">
                            <div>
                              <h4 className="item-name">{req.item?.name}</h4>
                              <span className="item-category">From: {req.lender?.fullname}</span>
                            </div>
                          </div>
                          <div className="item-meta" style={{ marginTop: '10px' }}>
                            <span className="item-meta-chip">📅 Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="item-card-actions" style={{ marginTop: '16px' }}>
                            <button 
                              className="action-btn" 
                              style={{ width: '100%', background: 'var(--primary-color)', color: 'white', textAlign: 'center', border: 'none', fontWeight: 'bold' }}
                              onClick={() => handleReturnItem(req._id)}
                            >
                              🔄 Return Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'My Requests' ? (
            <div className="glass-card listings-section fade-up">
              <div className="listings-header">
                <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>📋 My Requests</h3>
                <span className="listings-count">{requests.length} requests</span>
              </div>
              
              {loading ? (
                <div className="listings-loading"><div className="loading-spinner" /><p>Loading requests…</p></div>
              ) : requests.length === 0 ? (
                <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                  <div className="empty-icon">📋</div>
                  <h3>No requests found</h3>
                  <p>You haven't made any rental requests yet.</p>
                  <button className="btn-empty borrower-btn-empty" onClick={() => navigate('/browse-items')}>Browse Items</button>
                </div>
              ) : (
                <div className="items-grid" style={{ marginTop: '20px' }}>
                  {requests.map(req => (
                    <div key={req._id} className="item-card glass-card">
                      <div className="item-card-image">
                        {req.item?.image ? (
                          <img src={`http://localhost:5000/${req.item.image.replace(/^[\\/]+/, '')}`} alt={req.item.name} className="item-img" />
                        ) : (
                          <div className="item-img-placeholder">📦</div>
                        )}
                        <div className={`item-status-badge ${req.status === 'pending' ? 'badge-out' : 'badge-available'}`} style={{ textTransform: 'capitalize' }}>
                          {req.status === 'active' ? 'rented' : req.status}
                        </div>
                      </div>
                      <div className="item-card-body">
                        <div className="item-card-top">
                          <div>
                            <h4 className="item-name">{req.item?.name}</h4>
                            <span className="item-category">From: {req.lender?.fullname}</span>
                          </div>
                        </div>
                        <div className="item-meta" style={{ marginTop: '10px' }}>
                          <span className="item-meta-chip">📅 Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        {req.status === 'active' && (
                          <div className="item-card-actions" style={{ marginTop: '16px' }}>
                            <button 
                              className="action-btn" 
                              style={{ width: '100%', background: 'var(--primary-color)', color: 'white', textAlign: 'center', border: 'none', fontWeight: 'bold' }}
                              onClick={() => handleReturnItem(req._id)}
                            >
                              🔄 Return Item
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'Messages' ? (
            <div className="glass-card listings-section fade-up">
              <div className="listings-header">
                <h3 className="card-heading" style={{ borderBottom: 'none', paddingBottom: 0 }}>💬 Messages & Notifications</h3>
              </div>
              
              {(() => {
                const notifications = requests
                  .flatMap(r => (r.notifications || []).map(n => ({ ...n, bookingId: r._id, itemName: r.item?.name })))
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                if (notifications.length === 0) {
                  return (
                    <div className="empty-state" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
                      <div className="empty-icon">💬</div>
                      <h3>No messages yet</h3>
                      <p>You haven't received any notifications or messages.</p>
                    </div>
                  );
                }
                
                return (
                  <div className="notifications-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="glass-card" style={{ padding: '20px', borderLeft: notif.read ? 'none' : '4px solid var(--primary-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                            {notif.itemName ? `Update regarding: ${notif.itemName}` : 'Notification'}
                          </strong>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{notif.message}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
};

export default BorrowerDashboard;
