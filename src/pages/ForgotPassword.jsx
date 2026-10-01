import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message || 'If an account exists for this email, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Unable to send the reset link right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>SHINECONNECT</div>
        <h1 style={styles.title}>Forgot password?</h1>
        <p style={styles.subtitle}>Enter the email connected to your account and we will send a reset link.</p>

        {error && <div style={styles.alertError}>{error}</div>}
        {message && <div style={styles.alertSuccess}>{message}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.primaryButton}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p style={styles.footerText}>
          Back to <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    background: '#f8f8f8'
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    padding: '32px 28px'
  },
  brand: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginBottom: '8px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '30px'
  },
  subtitle: {
    margin: '0 0 20px',
    color: '#666',
    lineHeight: 1.5
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  label: {
    fontWeight: 600,
    fontSize: '14px'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e5e5e5',
    fontSize: '15px',
    outline: 'none'
  },
  primaryButton: {
    marginTop: '8px',
    border: 'none',
    background: '#facc15',
    color: '#111',
    borderRadius: '10px',
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  alertError: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '10px 12px',
    marginBottom: '16px'
  },
  alertSuccess: {
    background: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '10px 12px',
    marginBottom: '16px'
  },
  footerText: {
    marginTop: '18px',
    textAlign: 'center',
    color: '#666'
  },
  link: {
    color: '#111',
    fontWeight: 700,
    textDecoration: 'none'
  }
};

export default ForgotPassword;
