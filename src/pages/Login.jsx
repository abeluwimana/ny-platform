import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('wedding_users') || '[]');
    
    // Admin credentials (hardcoded - in production, move to database)
    const adminEmail = 'admin@nyentertainment.com';
    const adminPassword = 'admin123';

    setTimeout(() => {
      // Check admin
      if (email === adminEmail && password === adminPassword) {
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_email', email);
        localStorage.setItem('user_role', 'admin');
        localStorage.setItem('user_name', 'Admin');
        localStorage.setItem('user_logged_in', 'true');
        window.location.href = '/admin';
      } 
      // Check regular user
      else {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          localStorage.setItem('user_logged_in', 'true');
          localStorage.setItem('user_email', user.email);
          localStorage.setItem('user_role', user.role);
          localStorage.setItem('user_name', user.name);
          window.location.href = '/';
        } else {
          setError('Invalid email or password');
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Login to your account</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div style={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
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
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  icon: { fontSize: "48px", textAlign: "center", marginBottom: "20px" },
  title: { textAlign: "center", marginBottom: "10px", fontSize: "28px", color: "#333" },
  subtitle: { textAlign: "center", marginBottom: "30px", color: "#666" },
  errorBox: { background: "#f8d7da", color: "#721c24", padding: "12px", borderRadius: "8px", marginBottom: "20px", textAlign: "center" },
  inputGroup: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" },
  input: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  passwordWrapper: { position: "relative", width: "100%" },
  passwordInput: { width: "100%", padding: "12px", paddingRight: "40px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  eyeButton: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#666" },
  forgotPassword: { textAlign: "right", marginBottom: "20px" },
  forgotLink: { color: "#007bff", textDecoration: "none", fontSize: "13px" },
  button: { width: "100%", padding: "14px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  footer: { marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#666" },
  link: { color: "#007bff", textDecoration: "none" },
};

export default Login;