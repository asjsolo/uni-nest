import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Users, Package, ShieldAlert, History } from 'lucide-react';

const AdminDashboard = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('Overview');

  // Temporary dummy data
  const initialUsers = [
    { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'Buyer', TrustScore: 4.8 },
    { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'Lender', TrustScore: 5.0 },
    { _id: 'u3', name: 'Alex Kim', email: 'alex@example.com', role: 'Admin', TrustScore: 4.9 },
  ];

  const initialItems = [
    { _id: 'i1', title: 'Textbook 1', category: 'Books', status: 'Available', pricing: { depositAmount: 10, fullPrice: 50 } },
    { _id: 'i2', title: 'Lab Goggles', category: 'Equipment', status: 'Rented', pricing: { depositAmount: 5, fullPrice: 20 } },
    { _id: 'i3', title: 'Scientific Calculator', category: 'Electronics', status: 'Available', pricing: { depositAmount: 15, fullPrice: 80 } },
  ];

  const initialDisputes = [
    { id: 'd1', reportedUser: 'Jane Smith', issueDescription: 'Item returned damaged', status: 'Active' },
    { id: 'd2', reportedUser: 'John Doe', issueDescription: 'Late return over 5 days', status: 'Active' },
    { id: 'd3', reportedUser: 'Mike Johnson', issueDescription: 'Fake listing suspected', status: 'Resolved' },
  ];

  const initialLogs = [
    { date: '2026-03-27', actionTaken: 'Removed listing', target: 'Fake Airpods (#i99)' },
    { date: '2026-03-28', actionTaken: 'Resolved dispute', target: 'Jane Smith - Damaged textbook' },
    { date: '2026-03-28', actionTaken: 'Banned user', target: 'SpamBot9000' }
  ];

  const [usersList, setUsersList] = useState(initialUsers);
  const [items, setItems] = useState(initialItems);
  const [disputes, setDisputes] = useState(initialDisputes);
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats for Overview
  const stats = [
    { title: 'Total Users', value: 1254 },
    { title: 'Total Listings', value: 345 },
    { title: 'Active Rentals', value: 89 },
    { title: 'Flagged Issues', value: disputes.filter(d => d.status === 'Active').length }
  ];

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

  const userRolesPie = [
    { name: 'Buyers', value: 800 },
    { name: 'Lenders', value: 404 },
    { name: 'Admins', value: 50 },
  ];
  
  // Muted "Winter Palette": soft blue, teal, muted indigo
  const pieColors = ['#38bdf8', '#34d399', '#818cf8'];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, itemsRes] = await Promise.all([
        axios.get('/api/admin/users').catch(() => ({ data: [] })),
        axios.get('/api/admin/items').catch(() => ({ data: [] }))
      ]);
      if (usersRes.data && usersRes.data.length > 0) setUsersList(usersRes.data);
      if (itemsRes.data && itemsRes.data.length > 0) setItems(itemsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin data, using dummy variables:', err);
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
      if (!id.startsWith('i')) {
        await axios.delete(`/api/admin/items/${id}`);
      }
      setItems(items.filter((item) => item._id !== id));
      
      const itemToDelete = items.find(i => i._id === id);
      setLogs([{ date: new Date().toISOString().split('T')[0], actionTaken: 'Removed listing', target: itemToDelete?.title || id }, ...logs]);
    } catch (err) {
      console.error('Error deleting item:', err);
      const itemToDelete = items.find(i => i._id === id);
      setItems(items.filter((item) => item._id !== id));
      setLogs([{ date: new Date().toISOString().split('T')[0], actionTaken: 'Removed listing', target: itemToDelete?.title || id }, ...logs]);
    }
  };

  const handleResolveDispute = (id) => {
    setDisputes(disputes.map(d => d.id === id ? { ...d, status: 'Resolved' } : d));
    const dispute = disputes.find(d => d.id === id);
    setLogs([{ date: new Date().toISOString().split('T')[0], actionTaken: 'Resolved dispute', target: dispute?.reportedUser || id }, ...logs]);
  };

  if (loading) return <div style={styles.centerAligned}>Loading Admin Dashboard...</div>;
  if (error) return <div style={{ ...styles.centerAligned, color: '#ff4d4f' }}>{error}</div>;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const renderOverviewTab = () => (
    <motion.div key="overview" initial="hidden" animate="visible" exit="exit" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.section style={styles.statsContainer} variants={cardVariants}>
        {stats.map((stat, idx) => (
          <motion.div key={idx} style={styles.statCard} whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(56, 189, 248, 0.1)' }}>
            <h3 style={styles.statTitle}>{stat.title}</h3>
            <p style={styles.statValue}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section style={styles.chartsContainer} variants={cardVariants}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Rentals over the Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rentalsOverWeek} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.7)" tickLine={false} axisLine={false} />
              <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
              <Bar dataKey="rentals" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>User Roles Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={userRolesPie} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value" stroke="none">
                {userRolesPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 12, 41, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '12px' }} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </motion.div>
  );

  const renderUsersTab = () => (
    <motion.section key="users" style={styles.section} initial="hidden" animate="visible" exit="exit" variants={cardVariants}>
      <h2 style={styles.sectionTitle}>All Registered Users</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>TrustScore</th>
            </tr>
          </thead>
          <tbody>
            {usersList.length === 0 ? (
              <tr><td colSpan="4" style={styles.tdCenter}>No users found.</td></tr>
            ) : (
              usersList.map((user) => (
                <motion.tr key={user._id} style={styles.tr} whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}><span style={getRoleBadge(user.role)}>{user.role}</span></td>
                  <td style={styles.td}><strong>{user.TrustScore?.toFixed(1) || 'N/A'}</strong></td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );

  const renderListingsTab = () => (
    <motion.section key="listings" style={styles.section} initial="hidden" animate="visible" exit="exit" variants={cardVariants}>
      <h2 style={styles.sectionTitle}>Listing Moderation</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Price (Dep/Full)</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" style={styles.tdCenter}>No items found.</td></tr>
            ) : (
              items.map((item) => (
                <motion.tr key={item._id} layout style={styles.tr} whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <td style={styles.td}><strong>{item.title}</strong></td>
                  <td style={styles.td}>{item.category}</td>
                  <td style={styles.td}><span style={getStatusBadge(item.status)}>{item.status}</span></td>
                  <td style={styles.td}><span style={{color: 'rgba(255,255,255,0.7)'}}>${item.pricing?.depositAmount}</span> / ${item.pricing?.fullPrice}</td>
                  <td style={styles.td}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteItem(item._id)} style={styles.deleteButton}>Remove Listing</motion.button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );

  const renderDisputesTab = () => (
    <motion.section key="disputes" style={styles.section} initial="hidden" animate="visible" exit="exit" variants={cardVariants}>
      <h2 style={styles.sectionTitle}>Issue / Dispute Management</h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Dispute ID</th>
              <th style={styles.th}>Reported User</th>
              <th style={styles.th}>Issue Description</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.length === 0 ? (
              <tr><td colSpan="5" style={styles.tdCenter}>No disputes found.</td></tr>
            ) : (
              disputes.map((dispute) => (
                <motion.tr key={dispute.id} layout style={styles.tr} whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <td style={styles.td}><strong>{dispute.id}</strong></td>
                  <td style={styles.td}>{dispute.reportedUser}</td>
                  <td style={styles.td}>{dispute.issueDescription}</td>
                  <td style={styles.td}><span style={getDisputeBadge(dispute.status)}>{dispute.status}</span></td>
                  <td style={styles.td}>
                    {dispute.status === 'Active' ? (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleResolveDispute(dispute.id)} style={styles.resolveButton}>Resolve</motion.button>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>Resolved</span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );

  const renderLogsTab = () => (
    <motion.section key="logs" style={styles.section} initial="hidden" animate="visible" exit="exit" variants={cardVariants}>
      <h2 style={styles.sectionTitle}>Admin Action Log</h2>
      <div style={styles.logContainer}>
        {logs.map((log, index) => (
          <motion.div key={index} style={styles.logItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <div style={styles.logDate}>{log.date}</div>
            <div style={styles.logContent}><strong>{log.actionTaken}</strong>: {log.target}</div>
          </motion.div>
        ))}
        {logs.length === 0 && <p style={{ color: 'rgba(255,255,255,0.7)' }}>No actions logged yet.</p>}
      </div>
    </motion.section>
  );

  const sidebarTabs = [
    { name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', icon: <Users size={20} /> },
    { name: 'Listings', icon: <Package size={20} /> },
    { name: 'Disputes', icon: <ShieldAlert size={20} /> },
    { name: 'Action Logs', icon: <History size={20} /> },
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* Sidebar Focus Area */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Admin Panel</h2>
        </div>
        <nav style={styles.sidebarNav}>
          {sidebarTabs.map(tab => (
            <motion.button 
              key={tab.name} 
              style={activeTab === tab.name ? styles.navButtonActive : styles.navButton}
              whileHover={{ backgroundColor: activeTab === tab.name ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.icon}
              {tab.name}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <motion.header style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={styles.title}>{activeTab}</h1>
          <p style={styles.subtitle}>
            {activeTab === 'Overview' && "Manage your platform's users, listings, disputes, and logs."}
            {activeTab === 'Users' && "View and manage all registered platform users."}
            {activeTab === 'Listings' && "Moderate active inventory and remove inappropriate items."}
            {activeTab === 'Disputes' && "Resolve active conflicts between borrowers and lenders."}
            {activeTab === 'Action Logs' && "View a chronological trace of all administrative actions."}
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && renderOverviewTab()}
          {activeTab === 'Users' && renderUsersTab()}
          {activeTab === 'Listings' && renderListingsTab()}
          {activeTab === 'Disputes' && renderDisputesTab()}
          {activeTab === 'Action Logs' && renderLogsTab()}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Liquid Glass mixin
const liquidGlass = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
  borderRadius: '16px',
};

const badgeBase = {
  padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
};

const getRoleBadge = (role) => ({
  ...badgeBase,
  background: role === 'Admin' ? 'rgba(142, 45, 226, 0.2)' : role === 'Lender' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.1)',
  border: `1px solid ${role === 'Admin' ? 'rgba(142, 45, 226, 0.4)' : role === 'Lender' ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
  color: role === 'Admin' ? '#e2bbfd' : role === 'Lender' ? '#b5f6ff' : 'rgba(255,255,255,0.9)',
});

const getStatusBadge = (status) => ({
  ...badgeBase,
  background: status === 'Available' ? 'rgba(16, 185, 129, 0.2)' : status === 'Rented' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 8, 68, 0.2)',
  border: `1px solid ${status === 'Available' ? 'rgba(16, 185, 129, 0.4)' : status === 'Rented' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 8, 68, 0.4)'}`,
  color: status === 'Available' ? '#6EE7B7' : status === 'Rented' ? '#A5B4FC' : '#ffb3c6',
});

const getDisputeBadge = (status) => ({
  ...badgeBase,
  background: status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 8, 68, 0.2)',
  border: `1px solid ${status === 'Resolved' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 8, 68, 0.4)'}`,
  color: status === 'Resolved' ? '#6EE7B7' : '#ffb3c6',
});

const styles = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'row',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    minHeight: '100vh',
    width: '100vw',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sidebar: {
    width: '260px',
    ...liquidGlass,
    borderRadius: 0,
    borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 20px',
  },
  sidebarHeader: {
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  sidebarTitle: {
    color: '#ffffff',
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '1px',
    textShadow: '0 2px 10px rgba(255,255,255,0.2)'
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  navButton: {
    padding: '16px 20px',
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    border: 'none',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.05rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    padding: '16px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  mainContent: {
    flex: 1,
    padding: '40px 60px',
    overflowY: 'auto',
    fontFamily: '"Inter", sans-serif',
    color: '#ffffff',
  },
  centerAligned: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
    fontSize: '1.2rem', fontFamily: '"Inter", sans-serif', background: '#0f0c29', color: '#ffffff',
  },
  header: {
    marginBottom: '40px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '3.2rem',
    margin: '0',
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: '-0.03em',
    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: '1.15rem',
    color: 'rgba(255,255,255,0.7)',
    marginTop: '12px',
    fontWeight: '400',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  statCard: {
    ...liquidGlass,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  statTitle: {
    fontSize: '1rem', margin: '0 0 12px 0', fontWeight: '500', color: 'rgba(255,255,255,0.7)',
  },
  statValue: {
    fontSize: '2.8rem', margin: 0, fontWeight: '700', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },
  chartCard: {
    ...liquidGlass,
    padding: '30px',
  },
  chartTitle: {
    fontSize: '1.2rem', margin: '0 0 24px 0', fontWeight: '600', color: '#ffffff',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.6rem', margin: '0 0 24px 0', color: '#ffffff', fontWeight: '700',
  },
  tableContainer: {
    ...liquidGlass,
    overflowX: 'auto',
  },
  table: {
    width: '100%', borderCollapse: 'collapse', textAlign: 'left',
  },
  thead: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  th: {
    padding: '20px 24px', fontSize: '0.85rem', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background-color 0.2s ease',
  },
  td: {
    padding: '20px 24px', fontSize: '0.95rem', color: '#ffffff', fontWeight: '400',
  },
  tdCenter: {
    padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.7)',
  },
  deleteButton: {
    padding: '8px 16px', background: 'rgba(255, 8, 68, 0.15)', color: '#ffb3c6', 
    border: '1px solid rgba(255, 8, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', 
    fontSize: '0.85rem', fontWeight: '600', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(255, 8, 68, 0.15)',
  },
  resolveButton: {
    padding: '8px 16px', background: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', 
    border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', cursor: 'pointer', 
    fontSize: '0.85rem', fontWeight: '600', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.15)',
  },
  logContainer: {
    ...liquidGlass,
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  logItem: {
    display: 'flex', gap: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', 
    borderRadius: '10px', borderLeft: '3px solid rgba(56, 189, 248, 0.5)',
  },
  logDate: {
    fontWeight: '600', color: '#38bdf8', minWidth: '100px', fontSize: '0.9rem',
  },
  logContent: {
    color: '#ffffff', fontSize: '0.95rem',
  }
};

export default AdminDashboard;
