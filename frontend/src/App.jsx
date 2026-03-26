import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div style={{
        fontFamily: '"Inter", sans-serif',
        backgroundColor: '#281C59',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}>
        <Routes>
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
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

              <Link to="/admin" style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  style={{
                    padding: '16px 36px',
                    backgroundColor: '#EDF7BD',
                    color: '#281C59',
                    borderRadius: '14px',
                    fontWeight: '800',
                    fontSize: '1.2rem',
                    boxShadow: '0 15px 30px -5px rgba(0,0,0,0.4)',
                    cursor: 'pointer'
                  }}
                >
                  Go to Admin Dashboard
                </motion.div>
              </Link>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
