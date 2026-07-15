// src/pages/About.jsx
// SHINECONNECT - About Page
// Colors: Black (#000), White (#fff), Gold (#FFD700)

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function About() {
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
      name: "Abel Uwimana",
      role: "Founder & Lead Videographer",
      bio: "Passionate about capturing life's most precious moments with cinematic excellence.",
      icon: "👔"
    },
    {
      name: "Diane Uwase",
      role: "Creative Director",
      bio: "Bringing creative vision and artistic direction to every project.",
      icon: "🎨"
    }
  ];

  const team = [
    {
      name: "Eric Niyonsaba",
      role: "Senior Video Editor",
      bio: "Crafting compelling stories through expert video editing and post-production.",
      icon: "🎬"
    },
    {
      name: "Sarah Mukamana",
      role: "Production Manager",
      bio: "Ensuring smooth operations and seamless event coverage.",
      icon: "✂️"
    },
    {
      name: "Kevin Mugisha",
      role: "Client Relations",
      bio: "Building lasting relationships and ensuring client satisfaction.",
      icon: "🤝"
    },
    {
      name: "Grace Uwimana",
      role: "Camera Operator",
      bio: "Capturing stunning visuals with precision and artistic flair.",
      icon: "📹"
    },
    {
      name: "Jean Pierre",
      role: "Marketing & Communications",
      bio: "Telling our story and connecting with communities across Rwanda.",
      icon: "📢"
    }
  ];

  const values = [
    { icon: "🎬", title: "Cinematic Excellence", desc: "We deliver professional, cinematic quality in every project we undertake." },
    { icon: "💝", title: "Passion for Storytelling", desc: "Every event has a unique story, and we're dedicated to telling it beautifully." },
    { icon: "🤝", title: "Client-Centered Service", desc: "Your vision is our priority. We work closely with you to bring it to life." },
    { icon: "💰", title: "Value for Money", desc: "Competitive pricing without compromising on quality or professionalism." }
  ];

  const stats = [
    { number: "500+", label: "Events Covered" },
    { number: "100%", label: "Client Satisfaction" },
    { number: "8+", label: "Years Experience" },
    { number: "5+", label: "Award-Winning Team" }
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
    statsSection: { marginBottom: "60px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" },
    statCard: { background: cardBg, padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, transition: "transform 0.3s" },
    statNumber: { fontSize: "clamp(32px, 5vw, 42px)", fontWeight: "800", color: Y, marginBottom: "8px" },
    statLabel: { fontSize: "14px", color: textMuted, fontWeight: "500" },
    valuesSection: { marginBottom: "60px" },
    valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" },
    valueCard: { background: cardBg, padding: "32px 24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, transition: "transform 0.3s, boxShadow 0.3s" },
    valueIcon: { fontSize: "44px", marginBottom: "16px" },
    valueTitle: { fontSize: "18px", marginBottom: "10px", color: textColor, fontWeight: "700" },
    valueDesc: { fontSize: "14px", color: textMuted, lineHeight: "1.6" },
    leadershipSection: { marginBottom: "60px" },
    leadershipGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" },
    leadershipCard: { background: cardBg, padding: "32px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, transition: "transform 0.3s" },
    leadershipIcon: { fontSize: "56px", marginBottom: "16px" },
    leadershipName: { fontSize: "clamp(20px, 4vw, 24px)", marginBottom: "4px", color: textColor, fontWeight: "700" },
    leadershipRole: { fontSize: "14px", color: Y, fontWeight: "600", marginBottom: "10px" },
    leadershipBio: { fontSize: "14px", color: textMuted, lineHeight: "1.6" },
    teamSection: { marginBottom: "60px" },
    teamGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" },
    teamCard: { background: cardBg, padding: "24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}`, transition: "transform 0.3s" },
    teamIcon: { fontSize: "40px", marginBottom: "12px" },
    teamName: { fontSize: "16px", marginBottom: "4px", color: textColor, fontWeight: "700" },
    teamRole: { fontSize: "12px", color: Y, fontWeight: "600", marginBottom: "8px" },
    teamBio: { fontSize: "13px", color: textMuted, lineHeight: "1.5" },
    storySection: { background: cardBg, padding: "40px", borderRadius: "20px", marginBottom: "50px", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", border: `1px solid ${borderColor}` },
    storyText: { fontSize: "clamp(15px, 4vw, 16px)", lineHeight: "1.8", color: textMuted, marginBottom: "20px" },
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
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode} style={styles.darkModeBtn}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroBadge}>✨ SHINECONNECT</div>
          <h1 style={styles.heroTitle}>About SHINECONNECT</h1>
          <p style={styles.heroSubtitle}>Rwanda's premier event media platform — capturing weddings, DOTE ceremonies, birthdays, funerals, and more with cinematic quality across all 30 districts.</p>
          <div style={styles.heroLine}></div>
        </div>

        <div style={styles.content}>
          {/* Mission Section */}
          <div style={styles.missionSection} className="card-animate">
            <h2 style={styles.sectionTitle}>Our Mission</h2>
            <p style={styles.missionText}>
              At SHINECONNECT, we believe every moment deserves to be captured with cinematic excellence. 
              Our mission is to provide professional, high-quality event media coverage that preserves 
              your precious memories for generations to come. We serve all 30 districts of Rwanda with 
              dedication, creativity, and a passion for storytelling.
            </p>
          </div>

          {/* Stats Section */}
          <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}>Our Impact</h2>
            <p style={styles.sectionSubtitle}>Making a difference across Rwanda through professional event coverage</p>
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} className="card-animate stat-card" style={{ ...styles.statCard, animationDelay: `${index * 0.1}s` }}>
                  <div style={styles.statNumber}>{stat.number}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
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
            <h2 style={styles.sectionTitle}>Our Team</h2>
            <p style={styles.sectionSubtitle}>The talented professionals behind every project</p>
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
            <h2 style={styles.sectionTitle}>Our Story</h2>
            <p style={styles.storyText}>
              SHINECONNECT was born from a vision to transform how Rwandans capture and share their most 
              important life moments. What started as a passion project by founder Abel Uwimana has grown 
              into Rwanda's premier event media platform, trusted by hundreds of families and organizations 
              across all 30 districts.
            </p>
            <p style={styles.storyText}>
              Today, SHINECONNECT stands as a digital platform developed and operated by NY Entertainment Rwanda, 
              connecting users through wedding stories, entertainment content, professional video experiences, 
              event services, and digital content sharing. We continue to innovate and push boundaries, 
              bringing cinematic quality to every event we cover.
            </p>
          </div>

          {/* CTA Section */}
          <div style={styles.ctaSection} className="card-animate">
            <h2 style={styles.ctaTitle}>Ready to Capture Your Moment?</h2>
            <p style={styles.ctaText}>Let us help you preserve your most precious memories with cinematic excellence.</p>
            <div style={styles.ctaButtons}>
              <Link to="/contact">
                <button className="contact-btn" style={styles.contactBtn}>📞 Contact Us</button>
              </Link>
              <Link to="/booking">
                <button className="book-btn" style={styles.bookBtn}>💍 Book Now</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;