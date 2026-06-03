// src/pages/Login.jsx
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

    const users = JSON.parse(localStorage.getItem('wedding_users') || '[]');
    
    const adminEmail = 'admin@nyentertainment.com';
    const adminPassword = 'admin123';

    setTimeout(() => {
      // Check Admin
      if (email === adminEmail && password === adminPassword) {
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_email', email);
        localStorage.setItem('admin_name', 'Admin');
        localStorage.setItem('user_role', 'admin');
        localStorage.setItem('user_logged_in', 'true');
        localStorage.setItem('user_name', 'Admin');
        navigate('/admin');
      } 
      else {
        // Check regular users
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          // Set common user data
          localStorage.setItem('user_logged_in', 'true');
          localStorage.setItem('user_email', user.email);
          localStorage.setItem('user_role', user.role);
          localStorage.setItem('user_name', user.name);
          localStorage.setItem('user_username', user.username || '');
          localStorage.setItem('user_phone', user.phone || '');
          localStorage.setItem('user_bio', user.bio || '');
          localStorage.setItem('user_district', user.district || '');
          
          // Set role-specific login flags for navbar
          if (user.role === 'couple') {
            localStorage.setItem('couple_logged_in', 'true');
            localStorage.setItem('couple_name', user.name);
            localStorage.setItem('couple_email', user.email);
          } else if (user.role === 'creator') {
            localStorage.setItem('creator_logged_in', 'true');
            localStorage.setItem('creator_name', user.name);
            localStorage.setItem('creator_email', user.email);
          } else {
            // ✅ ADD THIS - for regular clients
            localStorage.setItem('client_logged_in', 'true');
            localStorage.setItem('client_name', user.name);
            localStorage.setItem('client_email', user.email);
          }
          
          if (user.profileImage) {
            localStorage.setItem('user_profile_image', user.profileImage);
          }
          
          // Social links
          if (user.instagram || user.tiktok || user.youtube || user.facebook || user.whatsapp) {
            localStorage.setItem('user_social_links', JSON.stringify({
              instagram: user.instagram || '',
              tiktok: user.tiktok || '',
              youtube: user.youtube || '',
              facebook: user.facebook || '',
              whatsapp: user.whatsapp || '',
              twitter: user.twitter || ''
            }));
          }
          
          // Add welcome notification
          const notifications = JSON.parse(localStorage.getItem('user_notifications') || '[]');
          notifications.unshift({
            id: Date.now(),
            title: 'Welcome Back!',
            message: `You logged in on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
            type: 'login',
            read: false,
            date: new Date().toLocaleDateString()
          });
          localStorage.setItem('user_notifications', JSON.stringify(notifications.slice(0, 50)));
          
          // Redirect based on role
          if (user.role === 'admin') {
            navigate('/admin');
          } else if (user.role === 'couple') {
            navigate('/couple/dashboard');
          } else if (user.role === 'creator') {
            navigate('/creator/dashboard');
          } else {
            navigate('/dashboard');  // ✅ Client goes to dashboard
          }
        } else {
          setError('Invalid email or password');
        }
      }
      setLoading(false);
    }, 500);
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