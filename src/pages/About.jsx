// src/pages/About.jsx
// SHINECONNECT - About Page
// Colors: Black (#000), White (#fff), Gold (#FFD700)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import abelImage from "../assets/images/Able.jpeg";
import yvesImage from "../assets/images/Yves.jpeg";

function About() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    return () => {
      document.body.style.background = "";
    };
  }, []);

  useEffect(() => {
    document.body.style.background = darkMode ? "#111" : "#f5f5f5";
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const leadership = [
    {
      name: "YVES NTAKIRUTIMANA",
      role: "Founder & Chief Executive Officer (CEO)",
      bio: "Yves NTAKIRUTIMANA is the Founder and Chief Executive Officer of NY ENTERTAINMENT Rwanda. He provides the overall vision and leadership of the company, guides business development and strategic partnerships, and oversees the growth and direction of the organization.",
      image: yvesImage,
      icon: "👔"
    },
    {
      name: "ABEL UWIMANA",
      role: "Managing Director",
      specialty: "IT & Software Development | Digital Marketing",
      bio: "Abel UWIMANA is the Managing Director of NY ENTERTAINMENT Rwanda. He leads the company's technology and digital operations, including software development, IT systems, SHINECONNECT platform development, digital marketing, and day-to-day operational management.",
      image: abelImage,
      icon: "💻"
    }
  ];

  const team = [
    { name: "Event Videography", icon: "🎬" },
    { name: "Photography & Media Production", icon: "📸" },
    { name: "Software & Technology", icon: "💻" },
    { name: "Digital Marketing & Communications", icon: "📢" },
    { name: "Creative Design", icon: "🎨" },
    { name: "Client Relations", icon: "🤝" },
    { name: "Event Coordination", icon: "📋" }
  ];

  const values = [
    { icon: "🎬", title: "Cinematic Excellence", desc: "We aim to deliver high-quality visual content with creativity and professionalism." },
    { icon: "❤️", title: "Authentic Storytelling", desc: "Every event has its own story. We capture and present those stories with authenticity and meaning." },
    { icon: "🤝", title: "Client-Centered Service", desc: "We listen to our clients, understand their needs, and work to deliver experiences that meet their expectations." },
    { icon: "💡", title: "Innovation", desc: "We use technology and creative ideas to improve how people discover, share, and preserve event memories." },
    { icon: "🇷🇼", title: "Rwandan Culture", desc: "We value Rwanda's culture, traditions, celebrations, and communities and aim to represent them respectfully through our work." }
  ];

  const eventTypes = [
    "Weddings",
    "DOTE Ceremonies",
    "Birthday Celebrations",
    "Funeral Ceremonies",
    "Graduations",
    "Corporate Events",
    "Cultural Events",
    "Special Celebrations"
  ];

  const technologyOperations = [
    "IT & Software Development",
    "SHINECONNECT Platform",
    "Digital Marketing",
    "Digital Operations",
    "Web & Technology Solutions"
  ];

  const bgColor = darkMode ? "#111" : "#ffffff";
  const cardBg = darkMode ? "#1e1e1e" : "#ffffff";
  const textColor = darkMode ? "#fff" : "#000000";
  const textMuted = darkMode ? "#aaa" : "#6b7280";
  const borderColor = darkMode ? "#333" : "#f0f0f0";
  const Y = "#FFD700";

  const styles = {
    container: { minHeight: "100vh", background: bgColor, transition: "all 0.3s ease" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: Y, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    hero: { background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)", color: "#fff", padding: "80px 20px", textAlign: "center", position: "relative", overflow: "hidden" },
    heroBadge: { display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "30px", padding: "6px 18px", marginBottom: "20px", fontSize: "12px", fontWeight: "600", letterSpacing: "0.15em", textTransform: "uppercase", color: Y },
    heroTitle: { fontSize: "clamp(36px, 6vw, 56px)", marginBottom: "16px", fontWeight: "900", color: "#fff", letterSpacing: "-0.02em" },
    heroSubtitle: { fontSize: "clamp(16px, 4vw, 20px)", opacity: 0.8, color: "#fff", maxWidth: "700px", margin: "0 auto" },
    heroLine: { width: "60px", height: "3px", background: Y, margin: "20px auto 0", borderRadius: "2px" },
    content: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
    sectionTitle: { textAlign: "center", fontSize: "clamp(28px, 5vw, 36px)", marginBottom: "12px", color: textColor, fontWeight: "800", letterSpacing: "-0.02em" },
    sectionSubtitle: { textAlign: "center", fontSize: "16px", color: textMuted, marginBottom: "40px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" },
    missionSection: { textAlign: "center", marginBottom: "60px" },
    missionText: { fontSize: "clamp(16px, 4vw, 18px)", lineHeight: "1.8", color: textMuted, maxWidth: "800px", margin: "0 auto" },
    valuesSection: { marginBottom: "60px" },
    valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
    valueCard: { background: cardBg, padding: "32px 24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, transition: "transform 0.3s, boxShadow 0.3s" },
    valueIcon: { fontSize: "44px", marginBottom: "16px" },
    valueTitle: { fontSize: "18px", marginBottom: "10px", color: textColor, fontWeight: "700" },
    valueDesc: { fontSize: "14px", color: textMuted, lineHeight: "1.6" },
    leadershipSection: { marginBottom: "60px" },
    leadershipGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" },
    leadershipCard: { background: cardBg, padding: "28px", borderRadius: "20px", textAlign: "left", boxShadow: "0 12px 36px rgba(0,0,0,0.06)", border: `1px solid ${borderColor}`, transition: "transform 0.3s", display: "grid", gridTemplateColumns: "150px minmax(0, 1fr)", alignItems: "center", gap: "24px" },
    leadershipPortrait: { width: "100%", minHeight: "190px", borderRadius: "16px", background: darkMode ? "linear-gradient(145deg, #292929, #1a1a1a)" : "linear-gradient(145deg, #fff7d6, #f2e6b5)", border: `1px dashed ${darkMode ? "#6b5b20" : "#d8bd57"}`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "10px", color: textMuted, textAlign: "center", padding: "16px" },
    leadershipImage: { width: "100%", height: "100%", minHeight: "190px", maxHeight: "230px", position: "absolute", inset: 0, objectFit: "cover", borderRadius: "inherit" },
    leadershipIcon: { fontSize: "42px", lineHeight: 1 },
    leadershipPortraitLabel: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: "1.5" },
    leadershipCopy: { minWidth: 0 },
    leadershipName: { fontSize: "clamp(20px, 4vw, 24px)", marginBottom: "4px", color: textColor, fontWeight: "700" },
    leadershipRole: { fontSize: "14px", color: Y, fontWeight: "700", marginBottom: "8px" },
    leadershipSpecialty: { fontSize: "13px", color: textMuted, fontWeight: "600", lineHeight: "1.5", marginBottom: "14px" },
    leadershipBio: { fontSize: "14px", color: textMuted, lineHeight: "1.75", margin: 0 },
    teamSection: { marginBottom: "60px" },
    teamGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" },
    teamCard: { background: cardBg, padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, transition: "transform 0.3s" },
    teamIcon: { fontSize: "40px", marginBottom: "12px" },
    teamName: { fontSize: "16px", marginBottom: "4px", color: textColor, fontWeight: "700" },
    teamNote: { fontSize: "15px", color: textMuted, lineHeight: "1.7", textAlign: "center", margin: "28px auto 0", maxWidth: "760px" },
    storySection: { background: cardBg, padding: "40px", borderRadius: "20px", marginBottom: "50px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}` },
    storyText: { fontSize: "clamp(15px, 4vw, 16px)", lineHeight: "1.8", color: textMuted, marginBottom: "20px" },
    infoSection: { marginBottom: "60px" },
    infoCard: { background: cardBg, padding: "32px", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}` },
    listGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", margin: 0, padding: 0, listStyle: "none" },
    listItem: { color: textMuted, fontSize: "15px", lineHeight: "1.6", padding: "12px 16px", borderRadius: "10px", background: darkMode ? "#252525" : "#f8f8f8" },
    structure: { display: "grid", gridTemplateColumns: "1fr", gap: "14px", maxWidth: "640px", margin: "0 auto" },
    structureItem: { background: cardBg, padding: "20px 24px", textAlign: "center", borderRadius: "14px", border: `1px solid ${borderColor}`, boxShadow: "0 4px 24px rgba(0,0,0,0.04)" },
    structureArrow: { color: Y, fontSize: "24px", textAlign: "center", lineHeight: 1 },
    contactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
    contactItem: { background: darkMode ? "#252525" : "#f8f8f8", padding: "20px", borderRadius: "12px", color: textMuted, lineHeight: "1.6" },
    ctaSection: { background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)", color: "#fff", padding: "60px 30px", textAlign: "center", borderRadius: "20px", border: `1px solid rgba(255,215,0,0.15)` },
    ctaTitle: { fontSize: "clamp(28px, 5vw, 36px)", marginBottom: "12px", fontWeight: "800", color: "#fff" },
    ctaText: { fontSize: "clamp(14px, 4vw, 16px)", opacity: 0.8, marginBottom: "28px", color: "#fff", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" },
    ctaButtons: { display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" },
    contactBtn: { padding: "14px 36px", background: Y, color: "#000", border: "none", borderRadius: "40px", fontSize: "clamp(14px, 4vw, 16px)", fontWeight: "700", cursor: "pointer", transition: "all 0.3s" },
    bookBtn: { padding: "14px 36px", background: "transparent", color: "#fff", border: `2px solid ${Y}`, borderRadius: "40px", fontSize: "clamp(14px, 4vw, 16px)", fontWeight: "700", cursor: "pointer", transition: "all 0.3s" }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-animate { animation: fadeIn 0.5s ease both; }
        .value-card:hover, .team-card:hover, .leadership-card:hover, .stat-card:hover { 
          transform: translateY(-6px); 
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .contact-btn:hover, .book-btn:hover { 
          transform: scale(1.04); 
          transition: transform 0.3s;
        }
        .contact-btn:hover { background: #e6c200; }
        .book-btn:hover { background: rgba(255,215,0,0.1); }
        @media (max-width: 768px) {
          .leadership-grid, .team-grid, .values-grid { grid-template-columns: 1fr !important; }
          .leadership-card { grid-template-columns: 1fr !important; text-align: center !important; }
          .leadership-photo { width: min(100%, 240px) !important; min-height: 240px !important; justify-self: center; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Dark Mode Toggle */}
        <button
          type="button"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleDarkMode}
          style={styles.darkModeBtn}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroBadge}>✨ SHINECONNECT — TEAM &amp; LEADERSHIP</div>
          <h1 style={styles.heroTitle}>SHINECONNECT by NY ENTERTAINMENT Rwanda</h1>
          <p style={styles.heroSubtitle}>Capture. Connect. Celebrate.</p>
          <div style={styles.heroLine}></div>
        </div>

        <div style={styles.content}>
          {/* About Section */}
          <div style={styles.storySection} className="card-animate">
            <h2 style={styles.sectionTitle}>About SHINECONNECT</h2>
            <p style={styles.storyText}>
              SHINECONNECT is the event media and digital storytelling platform of NY ENTERTAINMENT Rwanda. The platform is designed to connect people, couples, creators, events, and digital content in one modern ecosystem.
            </p>
            <h3 style={{ ...styles.valueTitle, textAlign: "center", marginTop: "28px" }}>We focus on</h3>
            <ul style={styles.listGrid}>
              {eventTypes.map((event) => <li key={event} style={styles.listItem}>{event}</li>)}
            </ul>
          </div>

          {/* Mission Section */}
          <div style={styles.missionSection} className="card-animate">
            <h2 style={styles.sectionTitle}>Our Mission</h2>
            <p style={styles.missionText}>
              Our mission is to help people preserve, discover, and share meaningful moments through professional event media, digital storytelling, and innovative technology. We combine creativity, technology, cultural understanding, and professional service to create memorable digital experiences.
            </p>
          </div>

          {/* Vision Section */}
          <div style={styles.missionSection} className="card-animate">
            <h2 style={styles.sectionTitle}>Our Vision</h2>
            <p style={styles.missionText}>
              To become a leading event media and digital storytelling platform in Rwanda, connecting people and their most meaningful celebrations through technology and creativity.
            </p>
          </div>

          {/* Values Section */}
          <div style={styles.valuesSection}>
            <h2 style={styles.sectionTitle}>Our Values</h2>
            <p style={styles.sectionSubtitle}>The principles that guide everything we do</p>
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
            <h2 style={styles.sectionTitle}>Leadership</h2>
            <p style={styles.sectionSubtitle}>Meet the visionaries behind SHINECONNECT</p>
            <div className="leadership-grid" style={styles.leadershipGrid}>
              {leadership.map((leader, idx) => (
                <div key={idx} className="card-animate leadership-card" style={{ ...styles.leadershipCard, animationDelay: `${idx * 0.1}s` }}>
                  <div
                    className="leadership-photo"
                    style={{ ...styles.leadershipPortrait, position: "relative", overflow: "hidden", padding: 0, borderStyle: "solid" }}
                  >
                    <img src={leader.image} alt={leader.name} style={styles.leadershipImage} />
                  </div>
                  <div style={styles.leadershipCopy}>
                    <h3 style={styles.leadershipName}>{leader.name}</h3>
                    <p style={styles.leadershipRole}>{leader.role}</p>
                    {leader.specialty && <p style={styles.leadershipSpecialty}>{leader.specialty}</p>}
                    <p style={styles.leadershipBio}>{leader.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div style={styles.teamSection}>
            <h2 style={styles.sectionTitle}>Our Team</h2>
            <p style={styles.sectionSubtitle}>Creative, technical, and event professionals working together to deliver high-quality event media and digital experiences</p>
            <div className="team-grid" style={styles.teamGrid}>
              {team.map((member, idx) => (
                <div key={idx} className="card-animate team-card" style={{ ...styles.teamCard, animationDelay: `${idx * 0.1}s` }}>
                  <div style={styles.teamIcon}>{member.icon}</div>
                  <h3 style={styles.teamName}>{member.name}</h3>
                </div>
              ))}
            </div>
            <p style={styles.teamNote}>Team members and specialized roles will be added as the company continues to grow.</p>
          </div>

          {/* Company Leadership Structure */}
          <div style={styles.infoSection}>
            <h2 style={styles.sectionTitle}>Company Leadership Structure</h2>
            <div style={styles.structure}>
              <div style={styles.structureItem}>
                <strong style={{ color: textColor }}>Founder &amp; CEO</strong>
                <div style={{ color: textMuted, marginTop: "6px" }}>Yves NTAKIRUTIMANA</div>
              </div>
              <div style={styles.structureArrow} aria-hidden="true">↓</div>
              <div style={styles.structureItem}>
                <strong style={{ color: textColor }}>Managing Director</strong>
                <div style={{ color: textMuted, marginTop: "6px" }}>Abel UWIMANA</div>
              </div>
              <div style={styles.structureArrow} aria-hidden="true">↓</div>
              <div style={styles.structureItem}>
                <strong style={{ color: textColor }}>Technology &amp; Digital Operations</strong>
                <ul style={{ ...styles.listGrid, marginTop: "18px" }}>
                  {technologyOperations.map((area) => <li key={area} style={styles.listItem}>{area}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div style={styles.storySection} className="card-animate">
            <h2 style={styles.sectionTitle}>Our Story</h2>
            <p style={styles.storyText}>
              NY ENTERTAINMENT Rwanda was established with a vision to create professional event media and entertainment services in Rwanda. SHINECONNECT was developed as a digital platform under NY ENTERTAINMENT Rwanda to bring event media, storytelling, bookings, digital content, and community connection into one ecosystem.
            </p>
            <p style={styles.storyText}>
              Today, SHINECONNECT focuses on helping people discover and preserve meaningful moments from weddings, DOTE ceremonies, birthdays, funerals, graduations, corporate events, and other celebrations.
            </p>
          </div>

          {/* Contact Information */}
          <div style={styles.infoSection}>
            <h2 style={styles.sectionTitle}>Contact</h2>
            <div style={styles.contactGrid}>
              <div style={styles.contactItem}><strong style={{ color: textColor }}>Email</strong><br /><a href="mailto:nyentertainmentrwanda@gmail.com" style={{ color: Y }}>nyentertainmentrwanda@gmail.com</a></div>
              <div style={styles.contactItem}><strong style={{ color: textColor }}>Phone / WhatsApp</strong><br /><a href="https://wa.me/250780145562" style={{ color: Y }}>+250 780 145 562</a></div>
              <div style={styles.contactItem}><strong style={{ color: textColor }}>Location</strong><br />Kamonyi, Rwanda</div>
              <div style={styles.contactItem}><strong style={{ color: textColor }}>Website</strong><br />SHINECONNECT by NY ENTERTAINMENT Rwanda</div>
            </div>
          </div>

          {/* CTA Section */}
          <div style={styles.ctaSection} className="card-animate">
            <h2 style={styles.ctaTitle}>SHINECONNECT by NY ENTERTAINMENT Rwanda</h2>
            <p style={styles.ctaText}>Capture. Connect. Celebrate.<br />Your Event • Your Story • Your Platform</p>
            <div style={styles.ctaButtons}>
              <Link to="/contact">
                <button className="contact-btn" style={styles.contactBtn}>📞 Contact Us</button>
              </Link>
              <Link to="/booking">
                <button className="book-btn" style={styles.bookBtn}>💍 Book Now</button>
              </Link>
            </div>
            <p style={{ ...styles.ctaText, marginTop: "32px", marginBottom: 0, fontSize: "13px" }}>© 2026 SHINECONNECT by NY ENTERTAINMENT Rwanda<br />All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;