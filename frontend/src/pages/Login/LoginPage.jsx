import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/analyticsApi';
import './LoginPage.css';

const LoginPage = () => {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (currentUser) navigate('/dashboard');
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim())    { setError('Please enter your email.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const res = await loginUser(email.trim(), password);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not connect to server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="login-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">UNI NEST</span>
        </div>
        <p className="login-tagline">University Rental Platform</p>

        <div className="login-divider" />

        <h2 className="login-title">Sign in to your account</h2>
        <p className="login-subtitle">Enter your university credentials to continue</p>

        {error && (
          <motion.div
            className="login-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">✉️</span>
              <input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPass((s) => !s)}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn-login"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <span className="btn-spinner-row">
                <span className="btn-spinner" /> Signing in...
              </span>
            ) : 'Sign In'}
          </motion.button>
        </form>

        {/* Demo credentials hint */}
        <div className="login-demo-hint">
          <p>Demo accounts (all use password: <code>password123</code>)</p>
          <div className="demo-accounts">
            {[
              'alice@university.edu',
              'bob@university.edu',
              'charlie@university.edu',
              'diana@university.edu',
              'ethan@university.edu',
            ].map((acc) => (
              <button
                key={acc}
                type="button"
                className="demo-account-btn"
                onClick={() => { setEmail(acc); setPassword('password123'); setError(''); }}
              >
                {acc}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
