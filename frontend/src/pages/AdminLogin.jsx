import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regFullname, setRegFullname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── Login ─────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/admin/login', {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data));
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Register ──────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (regPassword !== regConfirmPassword) {
      return setError('Passwords do not match.');
    }
    if (regPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/register', {
        fullname: regFullname,
        email: regEmail,
        password: regPassword,
      });
      setSuccess('Admin account created! You can now sign in.');
      setActiveTab('login');
      setLoginEmail(regEmail);
      // Reset register form
      setRegFullname('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-bg" />
      <div className="auth-page">

        {/* ── Left decorative panel ── */}
        <div className="auth-panel admin-panel">
          <div className="panel-blob" />
          <div className="panel-content">
            <div className="panel-icon admin-panel-icon">⚙️</div>
            <h2 className="panel-title">Admin Portal</h2>
            <p className="panel-desc">
              Secure access to the UniNest administration console. Manage users,
              listings, and platform settings from one centralised dashboard.
            </p>
            <div className="panel-features">
              {[
                'Manage lenders & borrowers',
                'Oversee all listings',
                'Review platform analytics',
                'Handle reports & disputes',
              ].map((f, i) => (
                <div key={i} className="panel-feature-item">
                  <span className="feature-dot admin-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right auth card ── */}
        <div className="auth-form-container">
          <div className="auth-card glass-card fade-up">

            {/* Header */}
            <div className="auth-card-header">
              <Link to="/" className="back-link">← Back</Link>
              <div className="role-badge admin-badge">⚙️ Admin</div>
            </div>

            {/* Tabs */}
            {/* <div className="admin-tabs">
              <button
                className={`admin-tab ${activeTab === 'login' ? 'admin-tab-active' : ''}`}
                onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
              >
                Sign In
              </button>
              <button
                className={`admin-tab ${activeTab === 'register' ? 'admin-tab-active' : ''}`}
                onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
              >
                Register
              </button>
            </div> */}

            {/* Alerts */}
            {error && <div className="alert-error">⚠️ {error}</div>}
            {success && <div className="alert-success">✅ {success}</div>}

            {/* ── Login Form ── */}
            {activeTab === 'login' && (
              <>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to the admin console</p>

                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="admin-email">Email Address</label>
                    <input
                      id="admin-email"
                      type="email"
                      className="form-input"
                      placeholder="admin@uninest.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="admin-password">Password</label>
                    <input
                      id="admin-password"
                      type="password"
                      className="form-input"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-auth btn-admin" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : null}
                    {loading ? 'Signing in...' : 'Sign In as Admin'}
                  </button>
                </form>
              </>
            )}

            {/* ── Register Form ── */}
            {activeTab === 'register' && (
              <>
                <h1 className="auth-title">Create admin account</h1>
                <p className="auth-subtitle">Set up a new UniNest admin</p>

                <form onSubmit={handleRegister} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="reg-fullname">Full Name</label>
                    <input
                      id="reg-fullname"
                      type="text"
                      className="form-input"
                      placeholder="Admin Full Name"
                      value={regFullname}
                      onChange={(e) => setRegFullname(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-email">Email Address</label>
                    <input
                      id="reg-email"
                      type="email"
                      className="form-input"
                      placeholder="admin@uninest.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="reg-password">Password</label>
                      <input
                        id="reg-password"
                        type="password"
                        className="form-input"
                        placeholder="Min. 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-confirm">Confirm Password</label>
                      <input
                        id="reg-confirm"
                        type="password"
                        className="form-input"
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-auth btn-admin" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : null}
                    {loading ? 'Creating account...' : 'Create Admin Account'}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
