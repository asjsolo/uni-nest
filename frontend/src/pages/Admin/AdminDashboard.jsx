import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  // Temporary dummy data
  const initialUsers = [
    { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'Buyer', TrustScore: 4.8 },
    { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'Lender', TrustScore: 5.0 },
    { _id: 'u3', name: 'Alex Kim', email: 'alex@example.com', role: 'Admin', TrustScore: 4.9 },
  ];

  const initialItems = [
    { _id: 'i1', name: 'Textbook 1', category: 'Books', status: 'Available', rentalPrice: 10, marketPrice: 50 },
    { _id: 'i2', name: 'Lab Goggles', category: 'Equipment', status: 'Rented', rentalPrice: 5, marketPrice: 20 },
    { _id: 'i3', name: 'Scientific Calculator', category: 'Electronics', status: 'Available', rentalPrice: 15, marketPrice: 80 },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, itemsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/items')
      ]);
      if (usersRes.data && usersRes.data.length > 0) setUsers(usersRes.data);
      if (itemsRes.data && itemsRes.data.length > 0) setItems(itemsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching admin data, using dummy variables:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (!id.startsWith('i')) {
        await axios.delete(`/api/admin/items/${id}`);
      }
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      // fallback for local UI dummy deletion
      setItems(items.filter((item) => item._id !== id));
    }
  };

  if (loading) return <div style={styles.centerAligned}>Loading Admin Dashboard...</div>;
  if (error) return <div style={{ ...styles.centerAligned, color: '#ff4d4f' }}>{error}</div>;

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.25 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      style={styles.pageWrapper}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div style={styles.container}>
        <motion.header style={styles.header} variants={cardVariants}>
          <h1 style={styles.title}>Admin Control Panel</h1>
          <p style={styles.subtitle}>Manage your platform's users and items seamlessly.</p>
        </motion.header>

        {/* Users Section */}
        <motion.section style={styles.section} variants={cardVariants}>
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
                {users.length === 0 ? (
                  <tr><td colSpan="4" style={styles.tdCenter}>No users found.</td></tr>
                ) : (
                  users.map((user, idx) => (
                    <motion.tr 
                      key={user._id} 
                      style={{ backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'transparent', borderBottom: '1px solid rgba(40, 28, 89, 0.08)' }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,1)', boxShadow: '0 5px 15px -3px rgba(0,0,0,0.1)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      layout
                    >
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>
                        <span style={getRoleBadge(user.role)}>{user.role}</span>
                      </td>
                      <td style={styles.td}>
                        <strong>{user.TrustScore?.toFixed(1) || 'N/A'}</strong>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Items Section */}
        <motion.section style={styles.section} variants={cardVariants}>
          <h2 style={styles.sectionTitle}>All Platform Items</h2>
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
                  items.map((item, idx) => (
                    <motion.tr 
                      key={item._id} 
                      layout
                      style={{ backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.7)' : 'transparent', borderBottom: '1px solid rgba(40, 28, 89, 0.08)' }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,1)', boxShadow: '0 5px 15px -3px rgba(0,0,0,0.1)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <td style={styles.td}><strong>{item.name}</strong></td>
                      <td style={styles.td}>{item.category}</td>
                      <td style={styles.td}>
                        <span style={getStatusBadge(item.status)}>{item.status}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{color: colors.blue}}>${item.rentalPrice}</span> / ${item.marketPrice}
                      </td>
                      <td style={styles.td}>
                        <motion.button 
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteItem(item._id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

// Colors matching the brand palette
const colors = {
  navy: '#281C59',
  blue: '#4E8D9C',
  paleSea: '#EDF7BD',
  mint: '#85C79A'
};

// Helper components for styling
const getRoleBadge = (role) => ({
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '800',
  backgroundColor: role === 'Admin' ? colors.navy : role === 'Lender' ? colors.blue : '#5c6c80',
  color: colors.paleSea,
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
});

const getStatusBadge = (status) => ({
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: '800',
  backgroundColor: status === 'Available' ? colors.mint : status === 'Rented' ? '#eab308' : '#ef4444',
  color: status === 'Available' ? colors.navy : '#fff',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
});

const styles = {
  pageWrapper: {
    backgroundColor: colors.navy,
    minHeight: '100vh',
    width: '100vw',
    margin: 0,
    padding: '20px',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  centerAligned: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    fontFamily: '"Inter", sans-serif',
    backgroundColor: colors.navy,
    color: colors.paleSea,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", sans-serif',
    color: colors.paleSea,
  },
  header: {
    marginBottom: '50px',
    borderBottom: `2px solid rgba(78, 141, 156, 0.4)`,
    paddingBottom: '20px',
  },
  title: {
    fontSize: '3.2rem',
    margin: '0',
    color: colors.blue, // Page titles Medium Blue
    fontWeight: '900',
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: colors.paleSea,
    marginTop: '12px',
    opacity: 0.85,
    fontWeight: '400',
  },
  section: {
    marginBottom: '60px',
    backgroundColor: colors.paleSea, 
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 24px rgba(237, 247, 189, 0.1)', // Subtle float shadow matching Pale Sea
    color: colors.navy,
  },
  sectionTitle: {
    fontSize: '1.8rem',
    margin: '0 0 24px 0',
    color: colors.navy, 
    fontWeight: '900',
    borderBottom: `3px solid rgba(40, 28, 89, 0.08)`,
    paddingBottom: '12px',
    display: 'inline-block',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '16px',
    border: `2px solid ${colors.blue}`,
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: colors.blue, 
  },
  th: {
    padding: '20px',
    textAlign: 'left',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    color: colors.paleSea,
    fontWeight: '800',
    letterSpacing: '0.06em',
  },
  td: {
    padding: '18px 20px',
    fontSize: '1rem',
    color: colors.navy,
    fontWeight: '500',
  },
  tdCenter: {
    padding: '18px 20px',
    textAlign: 'center',
    color: colors.navy,
  },
  deleteButton: {
    padding: '10px 20px',
    backgroundColor: colors.mint, 
    color: colors.navy, 
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '800',
    boxShadow: '0 4px 10px rgba(133, 199, 154, 0.4)',
    outline: 'none',
  }
};

export default AdminDashboard;
