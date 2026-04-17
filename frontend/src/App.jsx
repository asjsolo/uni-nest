import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminDashboard from './pages/Admin/AdminDashboard';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import { useAuth } from './context/AuthContext';
import './App.css';

// Protected route — redirects to /login if not authenticated
const Protected = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
};

// Student Navbar
const StudentNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <h2 style={{ margin: 0, color: '#EDF7BD', letterSpacing: '1px' }}>UNI NEST</h2>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <Link to="/" style={styles.navLink}>Marketplace</Link>
        <Link to="/lend" style={styles.navLink}>+ Lend Item</Link>
        <Link to="/dashboard" style={styles.navLink}>My Dashboard</Link>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          {user?.name}
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

// Teammate Dummy Slots
const LendSlot = () => (
  <div style={styles.slotContainer}>
    <h2>Lend Item Page (Teammate Slot)</h2>
    <p style={{ color: '#94A3B8' }}>Build out your item listing form component here.</p>
  </div>
);

const DashboardSlot = () => (
  <div style={styles.slotContainer}>
    <h2>Student Dashboard (Teammate Slot)</h2>
    <p style={{ color: '#94A3B8' }}>Build out the student's personal overview component here (Active rentals, history, etc).</p>
  </div>
);

// Main Marketplace
const Marketplace = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', width: '100%' }}>
    <motion.h1
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ fontSize: '4rem', color: '#4E8D9C', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '-0.02em', textAlign: 'center' }}
    >
      Welcome to UNI NEST
    </motion.h1>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
      style={{ fontSize: '1.4rem', color: '#EDF7BD', marginBottom: '40px', opacity: 0.9, textAlign: 'center' }}
    >
      The smartest way to rent and borrow items on campus.
    </motion.p>
  </div>
);

// Student Zone wrapper
const StudentZone = () => (
  <div style={{ backgroundColor: '#281C59', minHeight: '100vh', width: '100vw', margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
    <StudentNavbar />
    <Routes>
      <Route path="/" element={<Marketplace />} />
      <Route path="/lend" element={<LendSlot />} />
      <Route path="/dashboard" element={<DashboardSlot />} />
    </Routes>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/admin"
          element={
            <Protected adminOnly>
              <AdminDashboard />
            </Protected>
          }
        />

        <Route
          path="/*"
          element={
            <Protected>
              <StudentZone />
            </Protected>
          }
        />
      </Routes>
    </Router>
  );
}

const styles = {
  navbar: {
    height: '80px',
    padding: '0 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'opacity 0.2s ease',
    cursor: 'pointer',
  },
  logoutBtn: {
    padding: '8px 18px',
    backgroundColor: 'transparent',
    color: '#ff6b6b',
    border: '1px solid rgba(255,107,107,0.4)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  slotContainer: {
    padding: '60px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: 'calc(100vh - 80px)',
  },
};

export default App;
