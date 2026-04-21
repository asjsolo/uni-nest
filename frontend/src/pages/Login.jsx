import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard'); // Route directly to Main Hub
      }
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
        <div className="auth-panel student-panel">
          <div className="panel-blob" />
          <div className="panel-content">
            <div className="panel-icon">🎓</div>
            <h2 className="panel-title">Student Portal</h2>
            <p className="panel-desc">
              Your central hub to list items for lending, browse campus items, and manage your rentals securely.
            </p>
            <div className="panel-features">
              {[
                'Single account for lending & borrowing',
                'Trust-verified campus users',
                'Reputation scoring system'
              ].map((f, i) => (
                <div key={i} className="panel-feature-item">
                  <span className="feature-dot" />
                  {f}
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
              <div className="role-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                ⭐ Unified Account
              </div>
            </div>

            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your UniNest account</p>

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
                className="btn-auth btn-primary"
                disabled={loading}
              >
                {loading ? <span className="btn-spinner" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register">Create one here</Link>
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
