// src/pages/About.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function About() {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
  };

  const leadership = [
    {
      name: t('about.leaderName1'),
      role: t('about.leaderRole1'),
      bio: t('about.leaderBio1'),
      icon: "👔"
    },
    {
      name: t('about.leaderName2'),
      role: t('about.leaderRole2'),
      bio: t('about.leaderBio2'),
      icon: "🎨"
    }
  ];

  const team = [
    {
      name: t('about.teamName1'),
      role: t('about.teamRole1'),
      bio: t('about.teamBio1'),
      icon: "🎬"
    },
    {
      name: t('about.teamName2'),
      role: t('about.teamRole2'),
      bio: t('about.teamBio2'),
      icon: "✂️"
    },
    {
      name: t('about.teamName3'),
      role: t('about.teamRole3'),
      bio: t('about.teamBio3'),
      icon: "🤝"
    },
    {
      name: t('about.teamName4'),
      role: t('about.teamRole4'),
      bio: t('about.teamBio4'),
      icon: "📹"
    },
    {
      name: t('about.teamName5'),
      role: t('about.teamRole5'),
      bio: t('about.teamBio5'),
      icon: "📢"
    }
  ];

  const values = [
    { icon: "🎬", title: t('about.value1'), desc: t('about.value1Desc') },
    { icon: "💝", title: t('about.value2'), desc: t('about.value2Desc') },
    { icon: "🤝", title: t('about.value3'), desc: t('about.value3Desc') },
    { icon: "💰", title: t('about.value4'), desc: t('about.value4Desc') }
  ];

  const stats = [
    { number: "50+", label: t('about.stat1') },
    { number: "100%", label: t('about.stat2') },
    { number: "8+", label: t('about.stat3') },
    { number: "5+", label: t('about.stat4') }
  ];

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#ddd";
  const Y = "#ffc107";

  const styles = {
    container: { minHeight: "100vh", background: bgColor, transition: "all 0.3s ease" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: Y, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    hero: { background: `linear-gradient(135deg, #000 0%, #1a1a1a 100%)`, color: "#fff", padding: "60px 20px", textAlign: "center" },
    heroTitle: { fontSize: "clamp(32px, 6vw, 48px)", marginBottom: "15px", fontWeight: "bold", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.2)" },
    heroSubtitle: { fontSize: "clamp(16px, 4vw, 20px)", opacity: 0.9, color: "#fff" },
    content: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
    sectionTitle: { textAlign: "center", fontSize: "clamp(28px, 5vw, 36px)", marginBottom: "30px", color: textColor, fontWeight: "bold" },
    missionSection: { textAlign: "center", marginBottom: "50px" },
    missionText: { fontSize: "clamp(16px, 4vw, 18px)", lineHeight: "1.8", color: textMuted, maxWidth: "800px", margin: "0 auto" },
    statsSection: { marginBottom: "50px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" },
    statCard: { background: cardBg, padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}` },
    statNumber: { fontSize: "clamp(32px, 5vw, 42px)", fontWeight: "bold", color: Y, marginBottom: "10px" },
    statLabel: { fontSize: "14px", color: textMuted },
    valuesSection: { marginBottom: "50px" },
    valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "25px" },
    valueCard: { background: cardBg, padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}`, transition: "transform 0.3s" },
    valueIcon: { fontSize: "48px", marginBottom: "15px" },
    valueTitle: { fontSize: "20px", marginBottom: "10px", color: textColor, fontWeight: "bold" },
    valueDesc: { fontSize: "14px", color: textMuted },
    leadershipSection: { marginBottom: "50px" },
    leadershipGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "30px" },
    leadershipCard: { background: cardBg, padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}` },
    leadershipIcon: { fontSize: "52px", marginBottom: "15px" },
    leadershipName: { fontSize: "clamp(20px, 4vw, 24px)", marginBottom: "5px", color: textColor, fontWeight: "bold" },
    leadershipRole: { fontSize: "14px", color: Y, fontWeight: "bold", marginBottom: "10px" },
    leadershipBio: { fontSize: "14px", color: textMuted, lineHeight: "1.6" },
    teamSection: { marginBottom: "50px" },
    teamSubtitle: { textAlign: "center", color: textMuted, marginBottom: "30px", fontSize: "16px" },
    teamGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "25px" },
    teamCard: { background: cardBg, padding: "25px", borderRadius: "16px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}`, transition: "transform 0.3s" },
    teamIcon: { fontSize: "44px", marginBottom: "15px" },
    teamName: { fontSize: "18px", marginBottom: "5px", color: textColor, fontWeight: "bold" },
    teamRole: { fontSize: "12px", color: Y, fontWeight: "bold", marginBottom: "10px" },
    teamBio: { fontSize: "13px", color: textMuted, lineHeight: "1.5" },
    storySection: { background: cardBg, padding: "40px", borderRadius: "20px", marginBottom: "50px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: `1px solid ${borderColor}` },
    storyText: { fontSize: "clamp(15px, 4vw, 16px)", lineHeight: "1.8", color: textMuted, marginBottom: "20px" },
    ctaSection: { background: darkMode ? "#1a1a1a" : "#000", color: "#fff", padding: "50px 30px", textAlign: "center", borderRadius: "20px" },
    ctaTitle: { fontSize: "clamp(26px, 5vw, 32px)", marginBottom: "15px", fontWeight: "bold", color: "#fff" },
    ctaText: { fontSize: "clamp(14px, 4vw, 16px)", opacity: 0.9, marginBottom: "25px", color: "#fff" },
    ctaButtons: { display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" },
    contactBtn: { padding: "12px 32px", background: Y, color: "#000", border: "none", borderRadius: "40px", fontSize: "clamp(14px, 4vw, 16px)", fontWeight: "bold", cursor: "pointer", transition: "transform 0.3s" },
    bookBtn: { padding: "12px 32px", background: "transparent", color: "#fff", border: `2px solid ${Y}`, borderRadius: "40px", fontSize: "clamp(14px, 4vw, 16px)", fontWeight: "bold", cursor: "pointer", transition: "transform 0.3s" }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-animate { animation: fadeIn 0.5s ease both; }
        .value-card:hover, .team-card:hover { transform: translateY(-5px); transition: transform 0.3s; }
        .contact-btn:hover, .book-btn:hover { transform: scale(1.03); transition: transform 0.3s; }
        @media (max-width: 768px) {
          .leadership-grid, .team-grid, .values-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode} style={styles.darkModeBtn}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>{t('about.title')}</h1>
          <p style={styles.heroSubtitle}>{t('about.subtitle')}</p>
        </div>

        <div style={styles.content}>
          {/* Mission Section */}
          <div style={styles.missionSection} className="card-animate">
            <h2 style={styles.sectionTitle}>{t('about.mission')}</h2>
            <p style={styles.missionText}>
              {t('about.missionText')}
            </p>
          </div>

          {/* Stats Section */}
          <div style={styles.statsSection}>
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} className="card-animate" style={{ ...styles.statCard, animationDelay: `${index * 0.1}s` }}>
                  <div style={styles.statNumber}>{stat.number}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div style={styles.valuesSection}>
            <h2 style={styles.sectionTitle}>{t('about.valuesTitle')}</h2>
            <div style={styles.valuesGrid}>
              {values.map((value, idx) => (
                <div key={idx} className="card-animate value-card" style={{ ...styles.valueCard, animationDelay: `${idx * 0.1}s` }}>
                  <div style={styles.valueIcon}>{value.icon}</div>
                  <h3 style={styles.valueTitle}>{value.title}</h3>
                  <p style={styles.valueDesc}>{value.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leadership Section */}
          <div style={styles.leadershipSection}>
            <h2 style={styles.sectionTitle}>{t('about.leadershipTitle')}</h2>
            <div className="leadership-grid" style={styles.leadershipGrid}>
              {leadership.map((leader, idx) => (
                <div key={idx} className="card-animate" style={{ ...styles.leadershipCard, animationDelay: `${idx * 0.1}s` }}>
                  <div style={styles.leadershipIcon}>{leader.icon}</div>
                  <h3 style={styles.leadershipName}>{leader.name}</h3>
                  <p style={styles.leadershipRole}>{leader.role}</p>
                  <p style={styles.leadershipBio}>{leader.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div style={styles.teamSection}>
            <h2 style={styles.sectionTitle}>{t('about.teamTitle')}</h2>
            <p style={styles.teamSubtitle}>{t('about.teamSubtitle')}</p>
            <div className="team-grid" style={styles.teamGrid}>
              {team.map((member, idx) => (
                <div key={idx} className="card-animate team-card" style={{ ...styles.teamCard, animationDelay: `${idx * 0.1}s` }}>
                  <div style={styles.teamIcon}>{member.icon}</div>
                  <h3 style={styles.teamName}>{member.name}</h3>
                  <p style={styles.teamRole}>{member.role}</p>
                  <p style={styles.teamBio}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Story Section */}
          <div style={styles.storySection} className="card-animate">
            <h2 style={styles.sectionTitle}>{t('about.storyTitle')}</h2>
            <p style={styles.storyText}>
              {t('about.storyText1')}
            </p>
            <p style={styles.storyText}>
              {t('about.storyText2')}
            </p>
          </div>

          {/* CTA Section */}
          <div style={styles.ctaSection} className="card-animate">
            <h2 style={styles.ctaTitle}>{t('about.ctaTitle')}</h2>
            <p style={styles.ctaText}>{t('about.ctaText')}</p>
            <div style={styles.ctaButtons}>
              <Link to="/contact">
                <button className="contact-btn" style={styles.contactBtn}>📞 {t('about.contactUs')}</button>
              </Link>
              <Link to="/booking">
                <button className="book-btn" style={styles.bookBtn}>💍 {t('about.bookNow')}</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;