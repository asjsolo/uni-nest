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
  const [validationErrors, setValidationErrors] = useState({
    fullname: false,
    email: false,
    phonenumber: false,
    campusRegistrationNumber: false,
    password: false,
  });

  const validateEmail = (email) => {
    const emailRegex = /^(IT|EN|BM|BT)\d{8}@/i;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateStudentId = (id) => {
    const idRegex = /^(IT|EN|BM|BT)\d{8}$/i;
    return idRegex.test(id);
  };

  const validateFullName = (name) => {
    return name.trim().length > 0;
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numbers for phone number
    if (name === 'phonenumber') {
      if (!/^\d*$/.test(value)) {
        return;
      }
    }

    setFormData({ ...formData, [name]: value });

    // Real-time validation
    let isValid = true;
    if (name === 'fullname') {
      isValid = validateFullName(value);
    } else if (name === 'email') {
      isValid = validateEmail(value);
    } else if (name === 'phonenumber') {
      isValid = validatePhoneNumber(value);
    } else if (name === 'campusRegistrationNumber') {
      isValid = validateStudentId(value);
    } else if (name === 'password') {
      isValid = validatePassword(value);
    }

    setValidationErrors({
      ...validationErrors,
      [name]: !isValid && value.length > 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation check
    const newValidationErrors = {
      fullname: !validateFullName(formData.fullname),
      email: !validateEmail(formData.email),
      phonenumber: !validatePhoneNumber(formData.phonenumber),
      campusRegistrationNumber: !validateStudentId(formData.campusRegistrationNumber),
      password: !validatePassword(formData.password),
    };

    setValidationErrors(newValidationErrors);

    if (Object.values(newValidationErrors).some(err => err)) {
      setError('Please fix all validation errors before submitting.');
      return;
    }

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
                    className={`form-input ${
                      formData.fullname ? (validationErrors.fullname ? 'input-invalid' : 'input-valid') : ''
                    }`}
                    placeholder="Enter your full name"
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
                    className={`form-input ${
                      formData.phonenumber ? (validationErrors.phonenumber ? 'input-invalid' : 'input-valid') : ''
                    }`}
                    placeholder="077 4444 333"
                    value={formData.phonenumber}
                    onChange={handleChange}
                    maxLength="10"
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
                  className={`form-input ${
                    formData.email ? (validationErrors.email ? 'input-invalid' : 'input-valid') : ''
                  }`}
                  placeholder="Enter your university email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                  (e.g., IT12345678@sliit.com)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="campusRegistrationNumber">Campus Registration Number</label>
                <input
                  id="campusRegistrationNumber"
                  type="text"
                  name="campusRegistrationNumber"
                  className={`form-input ${
                    formData.campusRegistrationNumber ? (validationErrors.campusRegistrationNumber ? 'input-invalid' : 'input-valid') : ''
                  }`}
                  placeholder="Enter your Student ID"
                  value={formData.campusRegistrationNumber}
                  onChange={handleChange}
                  required
                />
                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                  (e.g., IT12345678)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  className={`form-input ${
                    formData.password ? (validationErrors.password ? 'input-invalid' : 'input-valid') : ''
                  }`}
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
