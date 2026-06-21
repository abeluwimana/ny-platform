import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_data', JSON.stringify(data.user));
        navigate('/admin');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('nyentertainmentrwanda@gmail.com');
    setPassword('Admin@123');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.box}>
          <h1 style={styles.title}>🔐 Admin Login</h1>
          <p style={styles.subtitle}>Login to manage NY Entertainment Rwanda</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? '⏳ Logging in...' : '🔑 Login'}
            </button>
          </form>

          <button onClick={fillDemoCredentials} style={styles.demoButton}>
            📝 Fill Demo Credentials
          </button>

          <div style={styles.hint}>
            <p style={styles.hintTitle}>Default Admin Credentials:</p>
            <p style={styles.hintText}>Email: nyentertainmentrwanda@gmail.com</p>
            <p style={styles.hintText}>Password: Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
  },
  container: {
    width: '100%',
    maxWidth: '450px',
  },
  box: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    color: '#1a1a2e',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  demoButton: {
    width: '100%',
    padding: '10px',
    background: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
  },
  hint: {
    marginTop: '20px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '10px',
    textAlign: 'center',
  },
  hintTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
  },
  hintText: {
    fontSize: '13px',
    color: '#666',
    margin: '2px 0',
  },
};