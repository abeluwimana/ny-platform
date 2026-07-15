// src/pages/Login.jsx
// SHINECONNECT - Professional Login Page
// Colors: Black (#000), White (#fff), Gold (#FFD700)

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredAuthState, googleSignIn, login } from '../services/api';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleMessage, setGoogleMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://ny-entertainment-backend.onrender.com/api';

  const getDashboardPath = (role) => {
    const normalizedRole = String(role || 'client').trim().toLowerCase();

    if (normalizedRole === 'admin') return '/admin';
    if (normalizedRole === 'couple') return '/couple/dashboard';
    if (normalizedRole === 'creator') return '/creator/dashboard';
    return '/client/dashboard';
  };

  useEffect(() => {
    const { isAuthenticated, role } = getStoredAuthState();

    if (isAuthenticated) {
      window.location.assign(getDashboardPath(role));
    }

    setError('');
  }, []);

  const persistAuth = (result) => {
    const role = String(result.user.role || 'client').trim().toLowerCase();

    localStorage.setItem('token', result.token);
    localStorage.setItem('user_token', result.token);
    localStorage.setItem('user_data', JSON.stringify(result.user));
    localStorage.setItem('admin_data', JSON.stringify(result.user));
    localStorage.setItem('user_email', result.user.email);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', result.user.name);
    localStorage.setItem('user_phone', result.user.phone || '');
    localStorage.setItem('user_logged_in', 'true');

    if (role === 'admin') {
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_email', result.user.email);
      localStorage.setItem('admin_name', result.user.name);
    } else if (role === 'couple') {
      localStorage.setItem('couple_token', result.token);
      localStorage.setItem('couple_logged_in', 'true');
      localStorage.setItem('couple_name', result.user.name);
      localStorage.setItem('couple_email', result.user.email);
    } else if (role === 'creator') {
      localStorage.setItem('creator_token', result.token);
      localStorage.setItem('creator_logged_in', 'true');
      localStorage.setItem('creator_name', result.user.name);
      localStorage.setItem('creator_email', result.user.email);
    } else {
      localStorage.setItem('client_token', result.token);
      localStorage.setItem('client_logged_in', 'true');
      localStorage.setItem('client_name', result.user.name);
      localStorage.setItem('client_email', result.user.email);
    }

    const notifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      title: 'Welcome to SHINECONNECT',
      message: `Logged in at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      type: 'login',
      read: false,
      date: new Date().toLocaleDateString()
    });
    localStorage.setItem('user_notifications', JSON.stringify(notifications.slice(0, 50)));

    window.location.assign(getDashboardPath(role));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');

    try {
      console.log('🔐 SHINECONNECT Login Attempt:', email);
      console.log('📍 API URL:', API_URL);
      
      const result = await login(email, password);
      console.log('📝 Login response:', result);
      
      if (result.success) {
        persistAuth(result);
      } else {
        setError(result.message || 'Invalid email or password. Please try again.');
        setDebugInfo(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      if (err.message === 'Failed to fetch' || err.message === 'Network Error') {
        errorMessage = '⚠️ Cannot connect to SHINECONNECT server. Please check your internet connection.';
      } else if (err.status === 401) {
        errorMessage = '❌ Invalid email or password. Please try again.';
      } else if (err.status === 404) {
        errorMessage = '❌ Login endpoint not found. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDebugInfo(JSON.stringify({
        apiUrl: API_URL,
        error: err.message,
        status: err.status || 'unknown'
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      const result = await googleSignIn({ credential: credentialResponse.credential });
      if (result.success) {
        persistAuth(result);
      } else {
        setError(result.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Google login error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setGoogleMessage('Google sign-in is not configured yet.');
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        setGoogleMessage('Google sign-in script could not be loaded.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignIn
      });

      const button = document.getElementById('google-signin-button');
      if (button) {
        window.google.accounts.id.renderButton(button, {
          theme: 'outline',
          size: 'large',
          width: '100%'
        });
      }

      setGoogleReady(true);
      setGoogleMessage('');
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => setGoogleMessage('Google sign-in script could not be loaded.');
    document.head.appendChild(script);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandLogo}>SHINECONNECT</div>
          <div style={styles.brandLine}></div>
          <div style={styles.brandTagline}>Capture. Connect. Celebrate.</div>
        </div>
        
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to continue to your account</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
            {debugInfo && (
              <details style={styles.debugDetails}>
                <summary style={styles.debugSummary}>Technical Details</summary>
                <pre style={styles.debugPre}>{debugInfo}</pre>
              </details>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div style={styles.optionsRow}>
            <label style={styles.rememberMe}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox} 
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <span style={styles.loadingText}>
                <span style={styles.spinner}></span> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or continue with</span>
          <span style={styles.dividerLine}></span>
        </div>

        <div style={styles.socialLogin}>
          {googleReady ? (
            <div id="google-signin-button" style={styles.googleButton} />
          ) : (
            <span style={styles.googleMessage}>{googleMessage || 'Loading Google Sign-In...'}</span>
          )}
        </div>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Create one</Link>
        </p>

        <div style={styles.apiInfo}>
          <span style={styles.apiText}>🔗 API: {API_URL}</span>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        input:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.12) !important;
          outline: none;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .shine-card {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '44px 36px 36px',
    boxShadow: '0 8px 48px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.03)',
    border: '1px solid #f0f0f0',
    animation: 'fadeIn 0.4s ease-out',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  brandLogo: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#000000',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  brandLine: {
    width: '40px',
    height: '3px',
    background: '#FFD700',
    margin: '0 auto 8px',
    borderRadius: '2px',
  },
  brandTagline: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: '500',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#000000',
    margin: 0,
    marginBottom: '4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  errorIcon: {
    marginRight: '8px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: '500',
  },
  debugDetails: {
    marginTop: '6px',
  },
  debugSummary: {
    fontSize: '12px',
    color: '#6b7280',
    cursor: 'pointer',
  },
  debugPre: {
    fontSize: '11px',
    color: '#4b5563',
    background: '#f3f4f6',
    padding: '8px',
    borderRadius: '6px',
    marginTop: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: '80px',
    overflow: 'auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '0.2px',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#fafafa',
    color: '#000000',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: '13px 16px',
    paddingRight: '48px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#fafafa',
    color: '#000000',
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    marginTop: '2px',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4b5563',
    cursor: 'pointer',
    fontSize: '13px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#FFD700',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  forgotLink: {
    color: '#FFD700',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'opacity 0.2s',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s, background 0.2s',
    marginTop: '4px',
    position: 'relative',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.25)',
    borderTop: '2px solid #FFD700',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '22px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e7eb',
  },
  dividerText: {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  socialLogin: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
    minHeight: '44px',
  },
  googleButton: {
    width: '100%',
    maxWidth: '320px',
  },
  googleMessage: {
    color: '#9ca3af',
    fontSize: '13px',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
  },
  link: {
    color: '#FFD700',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
  apiInfo: {
    marginTop: '18px',
    padding: '8px 12px',
    background: '#f9fafb',
    borderRadius: '8px',
    textAlign: 'center',
  },
  apiText: {
    fontSize: '11px',
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
};

export default Login;