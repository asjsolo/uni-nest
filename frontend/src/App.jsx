import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css'; // Optional, but usually left for standard vite reset

// 1. Dummy Login Component
const DummyLogin = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', backgroundColor: '#281C59', color: '#fff' }}>
      <h1 style={{ marginBottom: '10px' }}>Demo Gateway</h1>
      <p style={{ marginBottom: '40px', color: '#EDF7BD' }}>Where would you like to navigate?</p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={styles.loginBtn}
        >
          Login as Student
        </button>
        <button 
          onClick={() => navigate('/admin')} 
          style={{ ...styles.loginBtn, backgroundColor: '#EDF7BD', color: '#281C59' }}
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
};

// 2. Student Navbar (Glassmorphism theme over #281C59)
const StudentNavbar = () => {
  return (
    <nav style={styles.navbar}>
      <h2 style={{ margin: 0, color: '#EDF7BD', letterSpacing: '1px' }}>UNI NEST</h2>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <Link to="/" style={styles.navLink}>Marketplace</Link>
        <Link to="/lend" style={styles.navLink}>+ Lend Item</Link>
        <Link to="/dashboard" style={styles.navLink}>My Dashboard</Link>
        <Link to="/login" style={{ ...styles.navLink, color: '#ff6b6b', fontWeight: 'bold' }}>Logout</Link>
      </div>
    </nav>
  );
};

// 3. Teammate Dummy Slots
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

// 4. Main Marketplace (Home /) - Retained original Framer Motion styling
const Marketplace = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)', width: '100%' }}>
      <motion.h1 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
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
};

// 5. Student Zone Route Wrapper
const StudentZone = () => {
  return (
    <div style={{ backgroundColor: '#281C59', minHeight: '100vh', width: '100vw', margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
      <StudentNavbar />
      <Routes>
        <Route path="/" element={<Marketplace />} />
        <Route path="/lend" element={<LendSlot />} />
        <Route path="/dashboard" element={<DashboardSlot />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Gateway Routes */}
        <Route path="/login" element={<DummyLogin />} />
        
        {/* Admin Zone - Isolated without Navbar */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Student Zone - Navbar wrapped */}
        <Route path="/*" element={<StudentZone />} />
      </Routes>
    </Router>
  );
}

// Global UI styling object
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
    cursor: 'pointer'
  },
  loginBtn: {
    padding: '14px 28px',
    backgroundColor: '#4E8D9C',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.05rem',
    fontWeight: '700',
    transition: 'transform 0.1s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  },
  slotContainer: {
    padding: '60px',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: 'calc(100vh - 80px)', // Account for navbar
  }
};

export default App;
