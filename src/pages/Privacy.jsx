// src/pages/Privacy.jsx
import { Link } from "react-router-dom";

function Privacy() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🔒 Privacy Policy</h1>
        <p style={styles.heroSubtitle}>Last updated: May 2026</p>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Information We Collect</h2>
          <p style={styles.text}>We collect information you provide directly to us, including: name, email address, phone number, wedding date, booking preferences, and messages sent through our contact form.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. How We Use Your Information</h2>
          <p style={styles.text}>We use your information to process bookings, communicate with you, improve our services, and respond to your inquiries.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Information Sharing</h2>
          <p style={styles.text}>We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist with our operations.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Data Security</h2>
          <p style={styles.text}>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Your Rights</h2>
          <p style={styles.text}>You have the right to access, correct, or request deletion of your personal information. Contact us to exercise these rights.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Contact Us</h2>
          <p style={styles.text}>Email: nyentertainment@gmail.com<br />Phone: +250 780 145 562</p>
        </section>

        <div style={styles.buttonGroup}>
          <Link to="/"><button style={styles.backBtn}>← Back to Home</button></Link>
          <Link to="/terms"><button style={styles.termsBtn}>Read Terms of Service →</button></Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5" },
  hero: { background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff", padding: "60px 20px", textAlign: "center" },
  heroTitle: { fontSize: "42px", marginBottom: "15px", fontWeight: "bold" },
  heroSubtitle: { fontSize: "18px", opacity: 0.9 },
  content: { maxWidth: "900px", margin: "0 auto", padding: "40px 20px" },
  section: { background: "#fff", padding: "25px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  sectionTitle: { fontSize: "22px", marginBottom: "15px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  text: { fontSize: "16px", lineHeight: "1.6", color: "#555" },
  buttonGroup: { display: "flex", gap: "15px", justifyContent: "center", marginTop: "30px" },
  backBtn: { padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  termsBtn: { padding: "12px 24px", background: "#ffc107", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
};

export default Privacy;