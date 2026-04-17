import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import MainDashboard from './pages/Dashboard/MainDashboard';
import UserProfile from './pages/Profile/UserProfile';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import InventoryPage from './pages/Inventory/InventoryPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && currentUser.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login"  element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/"       element={<Navigate to="/login" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><MainDashboard /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
        <Route path="/admin"     element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
