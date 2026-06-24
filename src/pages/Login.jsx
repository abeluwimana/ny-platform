// src/pages/Login.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login for:', email);
      
      const result = await login(email, password);
      console.log('📝 Login response:', result);
      
      if (result.success) {
        // Save token and user data
        localStorage.setItem('token', result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        localStorage.setItem('admin_data', JSON.stringify(result.user));
        localStorage.setItem('user_email', result.user.email);
        localStorage.setItem('user_role', result.user.role);
        localStorage.setItem('user_name', result.user.name);
        localStorage.setItem('user_phone', result.user.phone || '');
        localStorage.setItem('user_logged_in', 'true');
        
        // Set role-specific login flags
        const role = result.user.role;
        if (role === 'ADMIN') {
          localStorage.setItem('admin_logged_in', 'true');
          localStorage.setItem('admin_email', result.user.email);
          localStorage.setItem('admin_name', result.user.name);
        } else if (role === 'COUPLE') {
          localStorage.setItem('couple_logged_in', 'true');
          localStorage.setItem('couple_name', result.user.name);
          localStorage.setItem('couple_email', result.user.email);
        } else if (role === 'CREATOR') {
          localStorage.setItem('creator_logged_in', 'true');
          localStorage.setItem('creator_name', result.user.name);
          localStorage.setItem('creator_email', result.user.email);
        } else {
          localStorage.setItem('client_logged_in', 'true');
          localStorage.setItem('client_name', result.user.name);
          localStorage.setItem('client_email', result.user.email);
        }
        
        // Add welcome back notification
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
        
        // Redirect based on role
        if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'COUPLE') {
          navigate('/couple/dashboard');
        } else if (role === 'CREATOR') {
          navigate('/creator/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || t('auth.invalidCredentials'));
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(t('auth.loginError'));
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

        {error && <div style={styles.errorBox}>{error}</div>}

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

        <div style={styles.footer}>
          {t('auth.noAccount')} <Link to="/register" style={styles.link}>{t('auth.registerHere')}</Link>
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
  errorBox: { background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "10px", marginBottom: "20px", textAlign: "center" },
  inputGroup: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", color: "#333", fontSize: "13px" },
  input: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", outline: "none" },
  passwordWrapper: { position: "relative", width: "100%" },
  passwordInput: { width: "100%", padding: "12px", paddingRight: "40px", border: "1px solid #ddd", borderRadius: "10px", fontSize: "14px", boxSizing: "border-box", outline: "none" },
  eyeButton: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#666" },
  forgotPassword: { textAlign: "right", marginBottom: "20px" },
  forgotLink: { color: "#ffc107", textDecoration: "none", fontSize: "13px", fontWeight: "500" },
  button: { width: "100%", padding: "14px", background: "#000", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  footer: { marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#666" },
  link: { color: "#ffc107", textDecoration: "none", fontWeight: "600" },
};

export default Login;