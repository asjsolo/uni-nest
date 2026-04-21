import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Users, Package, ShieldAlert, History, LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // Navigation State
  const [activeTab, setActiveTab] = useState('Overview');

  const [usersList, setUsersList] = useState([]);
  const [items, setItems] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statsData, setStatsData] = useState({
    usersCount: 0,
    itemsCount: 0,
    bookingsCount: 0
  });

  // Mock data for Charts
  const rentalsOverWeek = [
    { day: 'Mon', rentals: 12 },
    { day: 'Tue', rentals: 19 },
    { day: 'Wed', rentals: 15 },
    { day: 'Thu', rentals: 22 },
    { day: 'Fri', rentals: 30 },
    { day: 'Sat', rentals: 35 },
    { day: 'Sun', rentals: 25 },
  ];

  const pieColors = ['#38bdf8', '#34d399', '#818cf8'];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [usersRes, itemsRes, statsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/admin/items', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/admin/stats', config).catch(() => ({ data: { usersCount: 0, itemsCount: 0, bookingsCount: 0 } })),
        axios.get('http://localhost:5000/api/admin/logs', config).catch(() => ({ data: [] }))
      ]);

      if (usersRes.data && usersRes.data.length > 0) setUsersList(usersRes.data);
      if (itemsRes.data && itemsRes.data.length > 0) setItems(itemsRes.data);
      if (statsRes.data) setStatsData(statsRes.data);
      if (logsRes.data) setLogs(logsRes.data);

      setError(null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleResolveDispute = (id) => {
    setDisputes(disputes.map(d => d.id === id ? { ...d, status: 'Resolved' } : d));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="page-bg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Admin Dashboard...</div>;
  if (error) return <div className="page-bg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ff4d4f' }}>{error}</div>;

  const stats = [
    { label: 'Total Users', value: statsData.usersCount.toString(), icon: '👥' },
    { label: 'Total Listings', value: statsData.itemsCount.toString(), icon: '📦' },
    { label: 'Active Rentals', value: statsData.bookingsCount.toString(), icon: '🔄' },
    { label: 'Flagged Issues', value: disputes.length.toString(), icon: '⚠️' }
  ];

  const userRolesPie = [
    { name: 'Admins', value: usersList.filter(u => u.role === 'admin').length || 1 },
    { name: 'Users', value: usersList.filter(u => u.role === 'user').length || 1 }
  ];

  const renderOverviewTab = () => (
    <div className="fade-up">
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card glass-card">
            <div className="stat-icon" style={{ background: 'rgba(142, 45, 226, 0.15)', color: '#e2bbfd' }}>{stat.icon}</div>
            <div>
              <div className="stat-value" style={{ color: '#e2bbfd' }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="glass-card info-card">
          <h3 className="card-heading">Rentals over the Week</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={rentalsOverWeek} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.7)" tickLine={false} axisLine={false} />
              <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '12px' }} />
              <Bar dataKey="rentals" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-card info-card">
          <h3 className="card-heading">User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={userRolesPie} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value" stroke="none">
                {userRolesPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="glass-card info-card fade-up">
      <h3 className="card-heading">All Registered Users</h3>
      {usersList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Email</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Role</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{u.fullname || u.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={u.role === 'admin' ? 'profile-role-badge' : u.role === 'lender' ? 'profile-role-badge lender-role-badge' : 'profile-role-badge borrower-role-badge'} style={u.role === 'admin' ? { background: 'rgba(142, 45, 226, 0.2)', color: '#e2bbfd' } : {}}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="action-btn" style={{ color: '#ffb3c6', borderColor: 'rgba(255, 8, 68, 0.3)' }} onClick={() => handleDeleteUser(u._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderListingsTab = () => (
    <div className="glass-card info-card fade-up">
      <h3 className="card-heading">Listing Moderation</h3>
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No listings found</h3>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Title</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{item.name || item.title}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.category}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.status || 'Available'}</td>
                  <td style={{ padding: '12px' }}>
                    <button className="action-btn" style={{ color: '#ffb3c6', borderColor: 'rgba(255, 8, 68, 0.3)' }} onClick={() => handleDeleteItem(item._id)}>
                      Remove Listing
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDisputesTab = () => (
    <div className="glass-card empty-state fade-up">
      <div className="empty-icon">🛡️</div>
      <h3>No active disputes</h3>
      <p>All conflicts have been resolved. The platform is running smoothly.</p>
    </div>
  );

  const renderLogsTab = () => (
    <div className="glass-card info-card fade-up">
      <h3 className="card-heading">Admin Action Log</h3>
      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No actions logged yet</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map((log) => (
            <div key={log._id || Math.random()} style={{ display: 'flex', gap: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', borderLeft: '3px solid #818cf8' }}>
              <div style={{ fontWeight: '600', color: '#818cf8', minWidth: '100px', fontSize: '0.9rem' }}>
                {new Date(log.createdAt).toLocaleDateString()}
              </div>
              <div style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                <strong>{log.action}</strong>: {log.details || log.targetId} {log.adminId ? `(by ${log.adminId.name || 'Admin'})` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="page-bg" />
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="sidebar" style={{ background: 'rgba(20, 10, 40, 0.85)' }}>
          <div className="sidebar-logo">
            <span className="logo-icon">👑</span>
            <span className="logo-text" style={{ background: 'linear-gradient(135deg, #e2bbfd, #8e2de2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AdminNest</span>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #8e2de2, #4a00e0)' }}>
              {user?.fullname?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="profile-info">
              <p className="profile-name">{user?.fullname || 'Administrator'}</p>
              <div className="profile-role-badge" style={{ background: 'rgba(142, 45, 226, 0.2)', color: '#e2bbfd' }}>👑 Admin</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <a href="#" className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Overview'); }}>
              <LayoutDashboard className="nav-icon" /> Overview
            </a>
            <a href="#" className={`nav-item ${activeTab === 'Users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Users'); }}>
              <Users className="nav-icon" /> Users
            </a>
            <a href="#" className={`nav-item ${activeTab === 'Listings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Listings'); }}>
              <Package className="nav-icon" /> Listings
            </a>
            <a href="#" className={`nav-item ${activeTab === 'Disputes' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Disputes'); }}>
              <ShieldAlert className="nav-icon" /> Disputes
            </a>
            <a href="#" className={`nav-item ${activeTab === 'Action Logs' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Action Logs'); }}>
              <History className="nav-icon" /> Action Logs
            </a>
          </nav>

          <div className="sidebar-bottom-actions">
            <button className="sidebar-logout" onClick={handleLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header fade-up">
            <div>
              <h1 className="dashboard-greeting">
                {activeTab}
              </h1>
              <p className="dashboard-date">
                {activeTab === 'Overview' && "Manage your platform's users, listings, disputes, and logs."}
                {activeTab === 'Users' && "View and manage all registered platform users."}
                {activeTab === 'Listings' && "Moderate active inventory and remove inappropriate items."}
                {activeTab === 'Disputes' && "Resolve active conflicts between borrowers and lenders."}
                {activeTab === 'Action Logs' && "View a chronological trace of all administrative actions."}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'Overview' && renderOverviewTab()}
              {activeTab === 'Users' && renderUsersTab()}
              {activeTab === 'Listings' && renderListingsTab()}
              {activeTab === 'Disputes' && renderDisputesTab()}
              {activeTab === 'Action Logs' && renderLogsTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
