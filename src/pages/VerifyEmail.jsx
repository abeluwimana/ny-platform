import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification link is missing or invalid. Please request a new one.');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ny-entertainment-backend.onrender.com/api'}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your email has been verified successfully.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Unable to verify your email right now. Please try again later.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>SHINECONNECT</div>
        <h1 style={styles.title}>
          {status === 'success' ? 'Email Verified' : status === 'error' ? 'Verification Failed' : 'Verifying Email...'}
        </h1>

        <p style={status === 'success' ? styles.success : status === 'error' ? styles.error : styles.info}>
          {message || 'Checking your confirmation link...'}
        </p>

        <Link to="/login" style={styles.linkButton}>Go to Login</Link>
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
    maxWidth: '460px',
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    padding: '32px 28px',
    textAlign: 'center'
  },
  brand: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginBottom: '12px'
  },
  title: {
    margin: '0 0 14px',
    fontSize: '30px'
  },
  success: {
    color: '#166534',
    background: '#ecfdf5',
    border: '1px solid #bbf7d0',
    padding: '12px 14px',
    borderRadius: '10px',
    marginBottom: '18px'
  },
  error: {
    color: '#b91c1c',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '12px 14px',
    borderRadius: '10px',
    marginBottom: '18px'
  },
  info: {
    color: '#374151',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: '12px 14px',
    borderRadius: '10px',
    marginBottom: '18px'
  },
  linkButton: {
    display: 'inline-block',
    background: '#facc15',
    color: '#111',
    textDecoration: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontWeight: 700
  }
};

export default VerifyEmail;
