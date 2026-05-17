// src/pages/WeddingPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function WeddingPage() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [wedding, setWedding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadWedding();
  }, [id]);

  const loadWedding = () => {
    setLoading(true);
    const couples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    console.log("All couples:", couples);
    console.log("Looking for ID:", id);
    
    let foundWedding = couples.find((w) => w.id === id);
    
    if (!foundWedding) {
      foundWedding = couples.find((w) => w.couple === id || w.name === id);
    }
    
    console.log("Found wedding:", foundWedding);
    
    // Log event images for debugging
    if (foundWedding && foundWedding.events) {
      console.log("DOTE image:", foundWedding.events.dote?.image);
      console.log("Church image:", foundWedding.events.church?.image);
      console.log("Reception image:", foundWedding.events.reception?.image);
    }
    
    setWedding(foundWedding);
    setLoading(false);
  };

  const events = [
    { key: "dote", title: "🪘 DOTE", description: "Traditional ceremony highlights" },
    { key: "church", title: "⛪ Church", description: "Wedding vows & blessings" },
    { key: "reception", title: "🎉 Reception", description: "Party & celebration moments" },
  ];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading wedding details...</h2>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Wedding not found</h2>
        <p>The wedding couple you're looking for doesn't exist.</p>
        <Link to="/">
          <button style={styles.errorBtn}>Go Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={isMobile ? styles.mobileHeader : styles.header}>
        <h1 style={isMobile ? styles.mobileTitle : styles.title}>
          {wedding.couple || wedding.name}
        </h1>
        <p style={isMobile ? styles.mobileLocation : styles.location}>
          📍 {wedding.location || "Rwanda"}
        </p>
        <p style={isMobile ? styles.mobileSubtext : styles.subtext}>
          Select wedding moment to watch
        </p>
      </div>

      <div style={{
        ...styles.grid,
        gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        padding: isMobile ? "30px 15px" : "50px 20px",
      }}>
        {events.map((event) => {
          const eventData = wedding.events?.[event.key];
          const eventImage = eventData?.image || "";
          
          // Check if image exists and is valid
          const hasImage = eventImage && eventImage !== "" && eventImage !== "undefined";
          
          return (
            <Link key={event.key} to={`/video/${wedding.id}/${event.key}`} style={styles.link}>
              <div style={styles.card}>
                <div style={styles.imageWrapper}>
                  {hasImage ? (
                    <img
                      src={eventImage}
                      alt={event.title}
                      style={isMobile ? styles.mobileImage : styles.image}
                      onError={(e) => {
                        console.log(`Failed to load ${event.key} image`);
                        e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div style={isMobile ? styles.mobilePlaceholder : styles.placeholder}>
                      <div style={styles.placeholderIcon}>📷</div>
                      <div style={styles.placeholderText}>No Image Available</div>
                    </div>
                  )}
                  <div style={isMobile ? styles.mobilePlayButton : styles.playButton}>
                    <div style={styles.playIcon}>▶</div>
                  </div>
                </div>
                <div style={isMobile ? styles.mobileText : styles.text}>
                  <h3 style={isMobile ? styles.mobileCardTitle : styles.cardTitle}>{event.title}</h3>
                  <p style={isMobile ? styles.mobileDescription : styles.description}>{event.description}</p>
                  <div style={styles.watchBtn}>Watch Now →</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={styles.infoSection}>
        <div style={styles.infoContainer}>
          <h3 style={styles.infoTitle}>💑 About the Couple</h3>
          <p style={styles.infoText}>
            {wedding.couple || wedding.name} celebrated their special day with family and friends in {wedding.location || "Rwanda"}.
            Watch their beautiful journey from traditional ceremony to church wedding and reception celebration.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: "#f6f6f6", minHeight: "100vh" },
  loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  header: { padding: "80px 20px", textAlign: "center", background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff" },
  mobileHeader: { padding: "50px 20px", textAlign: "center", background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff" },
  title: { fontSize: "48px", marginBottom: "10px" },
  mobileTitle: { fontSize: "28px", marginBottom: "10px" },
  location: { fontSize: "18px", opacity: 0.8 },
  mobileLocation: { fontSize: "14px", opacity: 0.8 },
  subtext: { fontSize: "14px", opacity: 0.7, marginTop: "15px" },
  mobileSubtext: { fontSize: "12px", opacity: 0.7, marginTop: "10px" },
  grid: { display: "grid", gap: "25px", maxWidth: "1200px", margin: "0 auto" },
  link: { textDecoration: "none", color: "inherit" },
  card: { background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.3s" },
  imageWrapper: { position: "relative", overflow: "hidden", background: "#f0f0f0", minHeight: "200px" },
  image: { width: "100%", height: "240px", objectFit: "cover", transition: "transform 0.5s" },
  mobileImage: { width: "100%", height: "200px", objectFit: "cover", transition: "transform 0.5s" },
  placeholder: { width: "100%", height: "240px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f0f0f0" },
  mobilePlaceholder: { width: "100%", height: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f0f0f0" },
  placeholderIcon: { fontSize: "48px", color: "#ccc", marginBottom: "10px" },
  placeholderText: { fontSize: "14px", color: "#999" },
  playButton: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", cursor: "pointer" },
  mobilePlayButton: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50px", height: "50px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", cursor: "pointer" },
  playIcon: { color: "#fff", fontSize: "28px", marginLeft: "5px" },
  text: { padding: "20px" },
  mobileText: { padding: "15px" },
  cardTitle: { fontSize: "22px", marginBottom: "8px" },
  mobileCardTitle: { fontSize: "18px", marginBottom: "5px" },
  description: { color: "#666", fontSize: "14px", marginBottom: "12px" },
  mobileDescription: { color: "#666", fontSize: "12px", marginBottom: "10px" },
  watchBtn: { display: "inline-block", padding: "8px 16px", background: "#000", color: "#fff", borderRadius: "25px", fontSize: "13px", fontWeight: "bold" },
  infoSection: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px 60px" },
  infoContainer: { background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  infoTitle: { fontSize: "20px", marginBottom: "15px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  infoText: { color: "#666", lineHeight: "1.7", fontSize: "15px" },
  errorContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f5f5f5", textAlign: "center", padding: "20px" },
  errorTitle: { fontSize: "28px", color: "#dc3545", marginBottom: "10px" },
  errorBtn: { marginTop: "20px", padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default WeddingPage;