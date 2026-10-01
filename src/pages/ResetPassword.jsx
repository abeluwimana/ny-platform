import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordWithToken } from '../services/api';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing or invalid. Please request a new reset link.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordWithToken(token, newPassword);

      if (result.success) {
        setSuccess(result.message || 'Password reset successful.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(result.message || 'Unable to reset password.');
      }
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>SHINECONNECT</div>
        <h1 style={styles.title}>Reset password</h1>
        <p style={styles.subtitle}>Create a new password for your account.</p>

        {error && <div style={styles.alertError}>{error}</div>}
        {success && <div style={styles.alertSuccess}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
            required
            style={styles.input}
          />

          <label style={styles.label}>Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            required
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.primaryButton}>
            {loading ? 'Resetting...' : 'Reset password'}
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

export default ResetPassword;
