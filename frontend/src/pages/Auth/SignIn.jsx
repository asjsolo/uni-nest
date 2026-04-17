import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const SignIn = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', form);
            login(data);
            if (data.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={styles.card}
            >
                <h1 style={styles.logo}>UNI NEST</h1>
                <h2 style={styles.title}>Welcome back</h2>
                <p style={styles.subtitle}>Sign in to your account</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@university.edu"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            style={styles.input}
                        />
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    <button type="submit" disabled={loading} style={styles.btn}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={styles.link}>Sign Up</Link>
                </p>
            </motion.div>
        </div>
    );
};

const styles = {
    page: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#281C59',
        fontFamily: '"Inter", sans-serif',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    logo: {
        color: '#EDF7BD',
        fontSize: '1.4rem',
        fontWeight: '800',
        letterSpacing: '2px',
        margin: '0 0 28px 0',
        textAlign: 'center',
    },
    title: {
        color: '#fff',
        fontSize: '1.8rem',
        fontWeight: '700',
        margin: '0 0 6px 0',
        textAlign: 'center',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.95rem',
        margin: '0 0 32px 0',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    error: {
        color: '#ff6b6b',
        fontSize: '0.875rem',
        margin: '0',
        textAlign: 'center',
    },
    btn: {
        marginTop: '8px',
        padding: '14px',
        backgroundColor: '#4E8D9C',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '700',
        transition: 'opacity 0.2s',
        boxShadow: '0 8px 24px rgba(78,141,156,0.35)',
    },
    switchText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.9rem',
        textAlign: 'center',
        marginTop: '24px',
    },
    link: {
        color: '#EDF7BD',
        textDecoration: 'none',
        fontWeight: '600',
    },
};

export default SignIn;
