import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LenderDashboard from './pages/LenderDashboard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import ListItem from './pages/ListItem';
import BrowseItems from './pages/BrowseItems';
import AdminDashboard from './pages/Admin/AdminDashboard';
import MainDashboard from './pages/MainDashboard';
import ItemDetail from './pages/ItemDetail';
import './App.css';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main Central Hub for Students */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <MainDashboard />
              </PrivateRoute>
            } 
          />
          
          {/* Admin Dashboard */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute allowedRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          <Route
            path="/lender-dashboard"
            element={
              <PrivateRoute>
                <LenderDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/list-item"
            element={
              <PrivateRoute>
                <ListItem />
              </PrivateRoute>
            }
          />

          <Route
            path="/borrower-dashboard"
            element={
              <PrivateRoute>
                <BorrowerDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/browse-items"
            element={
              <PrivateRoute>
                <BrowseItems />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/item/:id"
            element={
              <PrivateRoute>
                <ItemDetail />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
