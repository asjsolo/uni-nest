import { useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const selectedRole = location.state?.role || 'borrower';
  const isLender = selectedRole === 'lender';

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phonenumber: '',
    password: '',
    campusRegistrationNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ ...formData, role: selectedRole });
      if (user.role === 'lender') navigate('/lender-dashboard');
      else navigate('/borrower-dashboard');
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
        {/* Left panel */}
        <div className={`auth-panel ${isLender ? 'lender-panel' : 'borrower-panel'}`}>
          <div className="panel-blob" />
          <div className="panel-content">
            <div className="panel-icon">{isLender ? '🏷️' : '🎒'}</div>
            <h2 className="panel-title">Join as {isLender ? 'Lender' : 'Borrower'}</h2>
            <p className="panel-desc">
              {isLender
                ? 'Start lending your items to campus students and build your reputation.'
                : 'Access a wide range of items from fellow students on campus.'}
            </p>
            <div className="panel-steps">
              <div className="step-item">
                <div className="step-num">1</div>
                <span>Create your account</span>
              </div>
              <div className="step-item">
                <div className="step-num">2</div>
                <span>Complete your profile</span>
              </div>
              <div className="step-item">
                <div className="step-num">3</div>
                <span>{isLender ? 'Start listing items' : 'Browse & borrow items'}</span>
              </div>
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

            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join UniNest as a {selectedRole} today</p>

            {error && (
              <div className="alert-error">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullname">Full Name</label>
                  <input
                    id="fullname"
                    type="text"
                    name="fullname"
                    className="form-input"
                    placeholder="John Doe"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phonenumber">Phone Number</label>
                  <input
                    id="phonenumber"
                    type="text"
                    name="phonenumber"
                    className="form-input"
                    placeholder="+92 300 0000000"
                    value={formData.phonenumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="campusRegistrationNumber">Campus Registration Number</label>
                <input
                  id="campusRegistrationNumber"
                  type="text"
                  name="campusRegistrationNumber"
                  className="form-input"
                  placeholder="e.g. BSCS-2022-001"
                  value={formData.campusRegistrationNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className={`btn-auth ${isLender ? 'btn-lender' : 'btn-borrower'}`}
                disabled={loading}
              >
                {loading ? <span className="btn-spinner" /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" state={{ role: selectedRole }}>Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
