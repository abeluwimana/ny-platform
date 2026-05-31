// src/pages/About.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function About() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const leadership = [
    {
      name: "Yves Ntakirutimana",
      role: "Chief Executive Officer (CEO)",
      bio: "Visionary leader with over 8 years of experience in the creative industry. Yves founded NY Entertainment Rwanda with a mission to revolutionize wedding storytelling in Rwanda.",
      icon: "👔"
    },
    {
      name: "Abel Uwimana",
      role: "Lead Designer & Creative Director",
      bio: "Creative designer and developer responsible for the platform's look and feel. Abel ensures every couple gets a beautiful digital experience.",
      icon: "🎨"
    }
  ];

  const team = [
    {
      name: "Diane Uwase",
      role: "Creative Director",
      bio: "Expert in storytelling and creative direction for wedding films.",
      icon: "🎬"
    },
    {
      name: "Eric Niyonsaba",
      role: "Senior Video Editor",
      bio: "Professional video editor specializing in wedding highlights and documentaries.",
      icon: "✂️"
    },
    {
      name: "Claudine Mukamana",
      role: "Client Relations Manager",
      bio: "Ensures every client receives personalized attention and excellent customer service.",
      icon: "🤝"
    },
    {
      name: "Patrick Nshimiyimana",
      role: "Lead Videographer",
      bio: "Master cinematographer with an eye for capturing emotional moments.",
      icon: "📹"
    },
    {
      name: "Sarah Uwera",
      role: "Marketing Specialist",
      bio: "Responsible for brand growth and connecting with couples across Rwanda.",
      icon: "📢"
    }
  ];

  const values = [
    { icon: "🎬", title: "Quality", desc: "High-quality cinematic wedding films" },
    { icon: "💝", title: "Emotion", desc: "Capturing real emotions and moments" },
    { icon: "🤝", title: "Trust", desc: "Reliable and professional service" },
    { icon: "💰", title: "Flexible", desc: "Negotiable prices for every budget" }
  ];

  const stats = [
    { number: "50+", label: "Weddings Captured" },
    { number: "100%", label: "Client Satisfaction" },
    { number: "8+", label: "Team Members" },
    { number: "5+", label: "Years Experience" }
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📖 About NY Entertainment Rwanda</h1>
        <p style={styles.heroSubtitle}>Capturing love stories across Rwanda since 2020</p>
      </div>

      <div style={styles.content}>
        {/* Mission Section */}
        <div style={styles.missionSection}>
          <h2 style={styles.sectionTitle}>Our Mission</h2>
          <p style={styles.missionText}>
            To preserve every couple's unique love story through cinematic wedding videography, 
            making professional wedding films accessible to all couples in Rwanda.
          </p>
        </div>

        {/* Stats Section */}
        <div style={styles.statsSection}>
          <div style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.statCard}>
                <div style={styles.statNumber}>{stat.number}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div style={styles.valuesSection}>
          <h2 style={styles.sectionTitle}>Our Values</h2>
          <div style={styles.valuesGrid}>
            {values.map((value, idx) => (
              <div key={idx} style={styles.valueCard}>
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
          <div style={styles.leadershipGrid}>
            {leadership.map((leader, idx) => (
              <div key={idx} style={styles.leadershipCard}>
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
          <h2 style={styles.sectionTitle}>Our Creative Team</h2>
          <p style={styles.teamSubtitle}>Meet the talented people behind NY Entertainment Rwanda</p>
          <div style={styles.teamGrid}>
            {team.map((member, idx) => (
              <div key={idx} style={styles.teamCard}>
                <div style={styles.teamIcon}>{member.icon}</div>
                <h3 style={styles.teamName}>{member.name}</h3>
                <p style={styles.teamRole}>{member.role}</p>
                <p style={styles.teamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div style={styles.storySection}>
          <h2 style={styles.sectionTitle}>Our Story</h2>
          <p style={styles.storyText}>
            NY Entertainment Rwanda started in 2020 with a simple goal: to give every couple 
            access to professional wedding videography at affordable, negotiable prices. 
            Based in Kamonyi, we've grown to serve couples across all districts of Rwanda, 
            capturing beautiful love stories from traditional DOTE ceremonies to church 
            weddings and reception celebrations.
          </p>
          <p style={styles.storyText}>
            What makes us different? We believe every love story is unique and deserves 
            to be told authentically. Our team combines technical expertise with genuine 
            passion for storytelling, ensuring your wedding film reflects who you are as a couple.
          </p>
        </div>

        {/* CTA Section */}
        <div style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>Ready to Start Your Love Story?</h2>
          <p style={styles.ctaText}>
            Contact us today for a free consultation and custom quote
          </p>
          <div style={styles.ctaButtons}>
            <Link to="/contact">
              <button style={styles.contactBtn}>📞 Contact Us</button>
            </Link>
            <Link to="/booking">
              <button style={styles.bookBtn}>💍 Book Now</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
  },
  hero: {
    background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
    color: "#fff",
    padding: "60px 20px",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: "42px",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  heroSubtitle: {
    fontSize: "18px",
    opacity: 0.9,
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "30px",
    color: "#333",
  },
  missionSection: {
    textAlign: "center",
    marginBottom: "50px",
  },
  missionText: {
    fontSize: "18px",
    lineHeight: "1.7",
    color: "#555",
    maxWidth: "800px",
    margin: "0 auto",
  },
  statsSection: {
    marginBottom: "50px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#ffc107",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
  },
  valuesSection: {
    marginBottom: "50px",
  },
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "25px",
  },
  valueCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.3s",
  },
  valueIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },
  valueTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#333",
  },
  valueDesc: {
    fontSize: "14px",
    color: "#666",
  },
  leadershipSection: {
    marginBottom: "50px",
  },
  leadershipGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
  },
  leadershipCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  leadershipIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },
  leadershipName: {
    fontSize: "22px",
    marginBottom: "5px",
    color: "#333",
  },
  leadershipRole: {
    fontSize: "14px",
    color: "#ffc107",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  leadershipBio: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.5",
  },
  teamSection: {
    marginBottom: "50px",
  },
  teamSubtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
  },
  teamCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.3s",
  },
  teamIcon: {
    fontSize: "40px",
    marginBottom: "15px",
  },
  teamName: {
    fontSize: "18px",
    marginBottom: "5px",
    color: "#333",
  },
  teamRole: {
    fontSize: "12px",
    color: "#ffc107",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  teamBio: {
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.5",
  },
  storySection: {
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    marginBottom: "50px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  storyText: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#555",
    marginBottom: "20px",
  },
  ctaSection: {
    background: "#000",
    color: "#fff",
    padding: "50px",
    textAlign: "center",
    borderRadius: "20px",
  },
  ctaTitle: {
    fontSize: "28px",
    marginBottom: "15px",
  },
  ctaText: {
    fontSize: "16px",
    opacity: 0.9,
    marginBottom: "25px",
  },
  ctaButtons: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  contactBtn: {
    padding: "12px 30px",
    background: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "30px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  bookBtn: {
    padding: "12px 30px",
    background: "transparent",
    color: "#fff",
    border: "2px solid #ffc107",
    borderRadius: "30px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.3s", 
  },
};

export default About;