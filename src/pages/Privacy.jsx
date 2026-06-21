// src/pages/Privacy.jsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

function Privacy() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Track privacy policy view
    trackPrivacyView();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const trackPrivacyView = async () => {
    try {
      // Optional: Track page view for analytics
      // await fetch(`${API_URL}/analytics/page-view`, { ... });
      console.log("Privacy policy viewed");
    } catch (error) {
      console.error("Error tracking privacy view:", error);
    }
  };

  const handleContactClick = () => {
    navigate("/contact");
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🔒 {t('privacy.title')}</h1>
        <p style={styles.heroSubtitle}>{t('privacy.lastUpdated')}: {new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style={styles.content}>
        {/* Section 1: Information We Collect */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📌 {t('privacy.section1')}</h2>
          <p style={styles.text}>{t('privacy.section1Text')}</p>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🔒 {t('privacy.section2')}</h2>
          <p style={styles.text}>{t('privacy.section2Text')}</p>
        </section>

        {/* Section 3: Information Sharing */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🤝 {t('privacy.section3')}</h2>
          <p style={styles.text}>{t('privacy.section3Text')}</p>
        </section>

        {/* Section 4: Data Security */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🛡️ {t('privacy.section4')}</h2>
          <p style={styles.text}>{t('privacy.section4Text')}</p>
        </section>

        {/* Section 5: Your Rights */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📧 {t('privacy.section5')}</h2>
          <p style={styles.text}>{t('privacy.section5Text')}</p>
        </section>

        {/* Section 6: Cookies */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🍪 {t('privacy.section6')}</h2>
          <p style={styles.text}>{t('privacy.section6Text')}</p>
        </section>

        {/* Section 7: Contact Us */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📞 {t('privacy.section7')}</h2>
          <p style={styles.text}>{t('privacy.section7Text')}</p>
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
              onClick={handleContactClick} 
              style={styles.contactBtn}
            >
              💬 {t('privacy.contactUsButton')}
            </button>
          </div>
        </section>

        {/* Last Updated */}
        <div style={styles.lastUpdated}>
          <p>📅 {t('privacy.lastUpdated')}: {new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Navigation Buttons */}
        <div style={styles.buttonGroup}>
          <Link to="/">
            <button style={styles.backBtn}>← {t('privacy.backToHome')}</button>
          </Link>
          <Link to="/terms">
            <button style={styles.termsBtn}>{t('privacy.readTerms')} →</button>
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
  termsBtn: { 
    padding: "12px 24px", 
    background: "#ffc107", 
    color: "#000", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "bold",
    transition: "background 0.2s",
  },
};

export default Privacy;