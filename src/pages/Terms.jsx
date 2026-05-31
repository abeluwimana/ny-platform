// src/pages/Terms.jsx
import { Link } from "react-router-dom";

function Terms() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📜 Terms of Service</h1>
        <p style={styles.heroSubtitle}>Last updated: May 2026</p>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p style={styles.text}>By accessing or using NY Entertainment Rwanda's website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Services Provided</h2>
          <p style={styles.text}>NY Entertainment Rwanda provides wedding videography services, including but not limited to:</p>
          <ul style={styles.list}>
            <li>Traditional DOTE ceremony coverage</li>
            <li>Church wedding coverage</li>
            <li>Reception coverage</li>
            <li>Full wedding packages</li>
            <li>Abamararungu traditional dancer services</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Booking and Payments</h2>
          <p style={styles.text}>All bookings are subject to availability. A deposit may be required to confirm your booking. Prices are negotiable and will be confirmed before service delivery.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Cancellation Policy</h2>
          <p style={styles.text}>Cancellations made 30 days before the event date receive a full refund. Cancellations made 14-29 days before receive 50% refund. Cancellations made less than 14 days before are non-refundable.</p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Contact Information</h2>
          <p style={styles.text}>Email: nyentertainment@gmail.com<br />Phone: +250 780 145 562<br />Address: Kamonyi, Rwanda</p>
        </section>

        <div style={styles.buttonGroup}>
          <Link to="/"><button style={styles.backBtn}>← Back to Home</button></Link>
          <Link to="/privacy"><button style={styles.privacyBtn}>Read Privacy Policy →</button></Link>
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
  list: { marginTop: "10px", paddingLeft: "20px", color: "#555", lineHeight: "1.8" },
  buttonGroup: { display: "flex", gap: "15px", justifyContent: "center", marginTop: "30px" },
  backBtn: { padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  privacyBtn: { padding: "12px 24px", background: "#17a2b8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
};

export default Terms;