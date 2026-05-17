import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('wedding_users') || '[]');
    if (existingUsers.find(u => u.email === formData.email)) {
      setError('User already exists with this email');
      setLoading(false);
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      password: formData.password, // In production, hash this!
      role: formData.role,
      createdAt: new Date().toISOString()
    };

    existingUsers.push(newUser);
    localStorage.setItem('wedding_users', JSON.stringify(existingUsers));

    // ============================================
    // 🔴 HAPA NIKO UBIKA user_name, user_role, etc
    // ============================================
    localStorage.setItem('user_logged_in', 'true');
    localStorage.setItem('user_email', formData.email);
    localStorage.setItem('user_role', formData.role);
    localStorage.setItem('user_name', formData.name);  // ← Izi ni zo wongeramo!

    setTimeout(() => {
      setLoading(false);
      // Redirect based on role
      if (formData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📝</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join NY Entertainment Rwanda</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Type</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              style={styles.input}
            >
              <option value="client">Client (Watch videos, Book weddings)</option>
              <option value="creator">Creator (Upload videos, Manage content)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
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
  button: { width: "100%", padding: "14px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  footer: { marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#666" },
  link: { color: "#007bff", textDecoration: "none" },
};

export default Register;