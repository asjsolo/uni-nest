import { useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const selectedRole = location.state?.role || 'borrower';
  const isLender = selectedRole === 'lender';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'lender') navigate('/lender-dashboard');
      else navigate('/borrower-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-bg" />
      <div className="auth-page">
        {/* Left panel */}
        <div className={`auth-panel ${isLender ? 'lender-panel' : 'borrower-panel'}`}>
          <div className="panel-blob" />
          <div className="panel-content">
            <div className="panel-icon">{isLender ? '🏷️' : '🎒'}</div>
            <h2 className="panel-title">{isLender ? 'Lender' : 'Borrower'} Portal</h2>
            <p className="panel-desc">
              {isLender
                ? 'Manage your listings, track requests, and build your campus reputation.'
                : 'Browse available items, make requests, and manage your borrowing history.'}
            </p>
            <div className="panel-features">
              {['List & manage items', 'View borrowing requests', 'Campus reputation score'].map((f, i) => (
                <div key={i} className="panel-feature-item">
                  <span className="feature-dot" />
                  {isLender ? ['List & manage items', 'View borrowing requests', 'Campus reputation score'][i]
                    : ['Browse item catalogue', 'One-click borrow requests', 'Track borrowing history'][i]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="auth-form-container">
          <div className="auth-card glass-card fade-up">
            <div className="auth-card-header">
              <a href="/" className="back-link">← Back</a>
              <div className={`role-badge ${isLender ? 'lender-badge' : 'borrower-badge'}`}>
                {isLender ? '🏷️ Lender' : '🎒 Borrower'}
              </div>
            </div>

            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your {selectedRole} account</p>

            {error && (
              <div className="alert-error">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn-auth ${isLender ? 'btn-lender' : 'btn-borrower'}`}
                disabled={loading}
              >
                {loading ? <span className="btn-spinner" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register" state={{ role: selectedRole }}>Create one here</Link>
            </p>

            <p className="auth-switch">
              Forgot password? <u>Click Here</u>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
