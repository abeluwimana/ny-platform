// src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { getStoredAuthState, login } from '../services/api';

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

  const getDashboardPath = (role) => {
    const normalizedRole = String(role || 'client').trim().toUpperCase();

    if (normalizedRole === 'ADMIN') return '/admin';
    if (normalizedRole === 'COUPLE') return '/couple/dashboard';
    if (normalizedRole === 'CREATOR') return '/creator/dashboard';
    return '/client/dashboard';
  };

  useEffect(() => {
    const { isAuthenticated, role } = getStoredAuthState();

    if (isAuthenticated) {
      window.location.assign(getDashboardPath(role));
    }

    setError('');
    console.log('🔧 API_URL:', API_URL);
  }, []);

  const persistAuth = (result) => {
    const role = String(result.user.role || 'client').trim().toUpperCase();

    localStorage.setItem('token', result.token);
    localStorage.setItem('user_token', result.token);
    localStorage.setItem('user_data', JSON.stringify(result.user));
    localStorage.setItem('admin_data', JSON.stringify(result.user));
    localStorage.setItem('user_email', result.user.email);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', result.user.name);
    localStorage.setItem('user_phone', result.user.phone || '');
    localStorage.setItem('user_logged_in', 'true');

    if (role === 'ADMIN') {
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_email', result.user.email);
      localStorage.setItem('admin_name', result.user.name);
    } else if (role === 'COUPLE') {
      localStorage.setItem('couple_token', result.token);
      localStorage.setItem('couple_logged_in', 'true');
      localStorage.setItem('couple_name', result.user.name);
      localStorage.setItem('couple_email', result.user.email);
    } else if (role === 'CREATOR') {
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
      title: t('auth.welcomeBack'),
      message: `${t('auth.loggedInAt')} ${new Date().toLocaleDateString()} ${t('auth.at')} ${new Date().toLocaleTimeString()}`,
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
      console.log('🔐 Attempting login for:', email);
      console.log('📍 API URL:', API_URL);
      
      const result = await login(email, password);
      console.log('📝 Login response:', result);
      
      if (result.success) {
        persistAuth(result);
      } else {
        setError(result.message || t('auth.invalidCredentials'));
        setDebugInfo(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      let errorMessage = t('auth.loginError');
      if (err.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to server. Please check your internet connection or try again.';
      } else if (err.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.status === 404) {
        errorMessage = 'Login endpoint not found. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDebugInfo(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In setup
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

  const handleGoogleSignIn = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      const result = await googleSignIn({ credential: credentialResponse.credential });
      if (result.success) {
        persistAuth(result);
      } else {
        setError(result.message || t('auth.loginError'));
      }
    } catch (err) {
      console.error('❌ Google login error:', err);
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>
        <h1 style={styles.title}>{t('auth.welcomeBack')}</h1>
        <p style={styles.subtitle}>{t('auth.loginTitle')}</p>

        {error && <div style={styles.errorBox}>
          <strong>❌ {error}</strong>
          {debugInfo && (
            <div style={styles.debugInfo}>
              <details>
                <summary>Debug Info</summary>
                <pre style={styles.debugPre}>{debugInfo}</pre>
              </details>
            </div>
          )}
        </div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('auth.password')}</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                style={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div style={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <div style={styles.googleButtonWrap}>
          {googleReady ? (
            <div id="google-signin-button" style={{ width: '100%' }} />
          ) : (
            <span style={styles.googleMessage}>{googleMessage || 'Preparing Google sign-in…'}</span>
          )}
        </div>

        <div style={styles.footer}>
          {t('auth.noAccount')} <Link to="/register" style={styles.link}>{t('auth.registerHere')}</Link>
        </div>

        <div style={styles.apiInfo}>
          <span style={styles.apiInfoText}>🔗 API: {API_URL}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f0f2f5",
    padding: "60px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "450px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  icon: { fontSize: "48px", textAlign: "center", marginBottom: "20px" },
  title: { textAlign: "center", marginBottom: "10px", fontSize: "28px", fontWeight: "700", color: "#333" },
  subtitle: { textAlign: "center", marginBottom: "30px", color: "#666" },
  errorBox: { 
    background: "#f8d7da", 
    color: "#721c24", 
    padding: "12px", 
    borderRadius: "10px", 
    marginBottom: "20px", 
    textAlign: "center",
    fontSize: "14px"
  },
  debugInfo: {
    marginTop: "8px",
    fontSize: "12px",
    textAlign: "left",
    background: "#f5f5f5",
    padding: "8px",
    borderRadius: "4px",
  },
  debugPre: {
    margin: "4px 0",
    fontSize: "11px",
    color: "#555",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    maxHeight: "100px",
    overflow: "auto",
  },
  inputGroup: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "13px" },
  input: { 
    width: "100%", 
    padding: "12px", 
    border: "1px solid #ddd", 
    borderRadius: "10px", 
    fontSize: "14px", 
    boxSizing: "border-box", 
    outline: "none",
    transition: "border-color 0.2s"
  },
  passwordWrapper: { position: "relative", width: "100%" },
  passwordInput: { 
    width: "100%", 
    padding: "12px", 
    paddingRight: "40px", 
    border: "1px solid #ddd", 
    borderRadius: "10px", 
    fontSize: "14px", 
    boxSizing: "border-box", 
    outline: "none",
    transition: "border-color 0.2s"
  },
  eyeButton: { 
    position: "absolute", 
    right: "12px", 
    top: "50%", 
    transform: "translateY(-50%)", 
    background: "none", 
    border: "none", 
    cursor: "pointer", 
    fontSize: "18px", 
    color: "#666",
    padding: "4px"
  },
  forgotPassword: { textAlign: "right", marginBottom: "20px" },
  forgotLink: { color: "#ffc107", textDecoration: "none", fontSize: "13px", fontWeight: "500" },
  button: { 
    width: "100%", 
    padding: "14px", 
    background: "#000", 
    color: "#fff", 
    border: "none", 
    borderRadius: "10px", 
    fontSize: "16px", 
    fontWeight: "bold", 
    cursor: "pointer",
    transition: "opacity 0.2s",
    opacity: 1
  },
  divider: { display: "flex", alignItems: "center", margin: "20px 0", color: "#999" },
  dividerText: { margin: "0 10px", fontSize: "13px", textTransform: "uppercase" },
  googleButtonWrap: { display: "flex", justifyContent: "center", marginBottom: "20px", minHeight: "44px" },
  googleMessage: { color: "#999", fontSize: "13px", textAlign: "center" },
  footer: { marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#666" },
  link: { color: "#ffc107", textDecoration: "none", fontWeight: "600" },
  apiInfo: {
    marginTop: "16px",
    padding: "8px",
    background: "#f0f0f0",
    borderRadius: "6px",
    textAlign: "center",
  },
  apiInfoText: {
    fontSize: "11px",
    color: "#888",
    fontFamily: "monospace",
  },
};

export default Login;