// src/pages/Terms.jsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

function Terms() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Track terms page view
    trackTermsView();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const trackTermsView = async () => {
    try {
      // Optional: Track page view for analytics
      console.log("Terms of Service viewed");
    } catch (error) {
      console.error("Error tracking terms view:", error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📜 {t('terms.title')}</h1>
        <p style={styles.heroSubtitle}>{t('terms.lastUpdated')}: {new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style={styles.content}>
        {/* Section 1: Acceptance of Terms */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📌 {t('terms.section1')}</h2>
          <p style={styles.text}>{t('terms.section1Text')}</p>
        </section>

        {/* Section 2: Services Provided */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🎬 {t('terms.section2')}</h2>
          <p style={styles.text}>{t('terms.section2Text')}</p>
          <ul style={styles.list}>
            <li>🎪 {t('terms.serviceDote')}</li>
            <li>⛪ {t('terms.serviceChurch')}</li>
            <li>🎉 {t('terms.serviceReception')}</li>
            <li>💍 {t('terms.serviceFullWedding')}</li>
            <li>💃 {t('terms.serviceDancer')}</li>
          </ul>
        </section>

        {/* Section 3: Booking and Payments */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>💰 {t('terms.section3')}</h2>
          <p style={styles.text}>{t('terms.section3Text')}</p>
          <div style={styles.infoBox}>
            <p style={styles.infoText}>💡 {t('terms.paymentNote')}</p>
          </div>
        </section>

        {/* Section 4: Cancellation Policy */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>❌ {t('terms.section4')}</h2>
          <p style={styles.text}>{t('terms.section4Text')}</p>
          <div style={styles.cancelGrid}>
            <div style={styles.cancelItem}>
              <span style={styles.cancelIcon}>✅</span>
              <div>
                <strong>{t('terms.cancelFull')}</strong>
                <p style={styles.cancelDesc}>{t('terms.cancelFullDesc')}</p>
              </div>
            </div>
            <div style={styles.cancelItem}>
              <span style={styles.cancelIcon}>🔄</span>
              <div>
                <strong>{t('terms.cancelPartial')}</strong>
                <p style={styles.cancelDesc}>{t('terms.cancelPartialDesc')}</p>
              </div>
            </div>
            <div style={styles.cancelItem}>
              <span style={styles.cancelIcon}>❌</span>
              <div>
                <strong>{t('terms.cancelNone')}</strong>
                <p style={styles.cancelDesc}>{t('terms.cancelNoneDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: User Responsibilities */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⚖️ {t('terms.section5')}</h2>
          <p style={styles.text}>{t('terms.section5Text')}</p>
          <ul style={styles.list}>
            <li>✅ {t('terms.responsibility1')}</li>
            <li>✅ {t('terms.responsibility2')}</li>
            <li>✅ {t('terms.responsibility3')}</li>
            <li>✅ {t('terms.responsibility4')}</li>
          </ul>
        </section>

        {/* Section 6: Termination */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🚫 {t('terms.section6')}</h2>
          <p style={styles.text}>{t('terms.section6Text')}</p>
        </section>

        {/* Section 7: Changes to Terms */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📝 {t('terms.section7')}</h2>
          <p style={styles.text}>{t('terms.section7Text')}</p>
        </section>

        {/* Section 8: Contact Information */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📞 {t('terms.section8')}</h2>
          <p style={styles.text}>{t('terms.section8Text')}</p>
          <div style={styles.contactInfo}>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📧</span>
              <span><strong>Email:</strong> nyentertainmentrwanda@gmail.com</span>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📱</span>
              <span><strong>Phone:</strong> +250 780 145 562</span>
            </div>
            <div style={styles.contactItem}>
              <span style={styles.contactIcon}>📍</span>
              <span><strong>Location:</strong> Kamonyi, Rwanda</span>
            </div>
            <button 
              onClick={() => navigate("/contact")} 
              style={styles.contactBtn}
            >
              💬 {t('terms.contactUsButton')}
            </button>
          </div>
        </section>

        {/* Last Updated */}
        <div style={styles.lastUpdated}>
          <p>📅 {t('terms.lastUpdated')}: {new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Navigation Buttons */}
        <div style={styles.buttonGroup}>
          <Link to="/">
            <button style={styles.backBtn}>← {t('terms.backToHome')}</button>
          </Link>
          <Link to="/privacy">
            <button style={styles.privacyBtn}>{t('terms.readPrivacy')} →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    minHeight: "100vh", 
    background: "#f5f5f5" 
  },
  hero: { 
    background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", 
    color: "#fff", 
    padding: "60px 20px", 
    textAlign: "center" 
  },
  heroTitle: { 
    fontSize: "clamp(32px, 5vw, 48px)", 
    marginBottom: "15px", 
    fontWeight: "bold" 
  },
  heroSubtitle: { 
    fontSize: "clamp(14px, 2vw, 18px)", 
    opacity: 0.9 
  },
  content: { 
    maxWidth: "900px", 
    margin: "0 auto", 
    padding: "40px 20px" 
  },
  section: { 
    background: "#fff", 
    padding: "25px", 
    borderRadius: "16px", 
    marginBottom: "25px", 
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  sectionTitle: { 
    fontSize: "clamp(18px, 2.5vw, 22px)", 
    marginBottom: "15px", 
    color: "#333", 
    borderLeft: "3px solid #ffc107", 
    paddingLeft: "12px" 
  },
  text: { 
    fontSize: "clamp(14px, 1.5vw, 16px)", 
    lineHeight: "1.8", 
    color: "#555" 
  },
  list: {
    marginTop: "10px",
    paddingLeft: "20px",
    color: "#555",
    lineHeight: "2",
    fontSize: "clamp(14px, 1.5vw, 15px)",
    listStyle: "none",
  },
  infoBox: {
    marginTop: "12px",
    padding: "12px 16px",
    background: "#fff8e1",
    borderRadius: "8px",
    borderLeft: "3px solid #ffc107",
  },
  infoText: {
    margin: 0,
    fontSize: "clamp(13px, 1.3vw, 14px)",
    color: "#6d5d00",
  },
  cancelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginTop: "12px",
  },
  cancelItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  cancelIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },
  cancelDesc: {
    margin: "4px 0 0 0",
    fontSize: "clamp(12px, 1.2vw, 13px)",
    color: "#888",
  },
  contactInfo: {
    marginTop: "15px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "10px",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    fontSize: "clamp(13px, 1.5vw, 15px)",
    color: "#555",
  },
  contactIcon: {
    fontSize: "18px",
    width: "30px",
  },
  contactBtn: {
    marginTop: "12px",
    padding: "10px 20px",
    background: "#ffc107",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s",
  },
  lastUpdated: {
    textAlign: "center",
    padding: "20px",
    color: "#999",
    fontSize: "clamp(12px, 1.2vw, 14px)",
  },
  buttonGroup: { 
    display: "flex", 
    gap: "15px", 
    justifyContent: "center", 
    marginTop: "30px",
    flexWrap: "wrap",
  },
  backBtn: { 
    padding: "12px 24px", 
    background: "#000", 
    color: "#fff", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "bold",
    transition: "background 0.2s",
  },
  privacyBtn: { 
    padding: "12px 24px", 
    background: "#17a2b8", 
    color: "#fff", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "bold",
    transition: "background 0.2s",
  },
};

export default Terms;