import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LenderDashboard from './pages/LenderDashboard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import ListItem from './pages/ListItem';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If they go to wrong dashboard, bounce them to home
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

          <Route
            path="/lender-dashboard"
            element={
              <PrivateRoute allowedRole="lender">
                <LenderDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/list-item"
            element={
              <PrivateRoute allowedRole="lender">
                <ListItem />
              </PrivateRoute>
            }
          />

          <Route
            path="/borrower-dashboard"
            element={
              <PrivateRoute allowedRole="borrower">
                <BorrowerDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
