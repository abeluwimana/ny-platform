// src/pages/WeddingPage.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { getCoupleById, getCoupleVideos } from "../services/api";

function WeddingPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [wedding, setWedding] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    loadWeddingAndVideos();
  }, [id]);

  const loadWeddingAndVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch couple data
      const coupleResponse = await getCoupleById(id);
      
      if (coupleResponse.success && coupleResponse.couple) {
        const couple = coupleResponse.couple;
        
        // Set wedding data from API
        setWedding({
          id: couple.id,
          name: couple.user?.name || couple.name || "SHINECONNECT",
          couple: couple.user?.name || couple.name || "SHINECONNECT",
          location: couple.location || "Rwanda",
          groomName: couple.groomName || "",
          brideName: couple.brideName || "",
          weddingDate: couple.weddingDate || "",
          events: {}
        });
        
        // Fetch videos for this couple
        const videosResponse = await getCoupleVideos(id);
        
        if (videosResponse.success && videosResponse.videos) {
          // Format videos by event type
          const formattedEvents = {};
          videosResponse.videos.forEach(video => {
            const eventKey = video.eventType?.toLowerCase() || "wedding";
            formattedEvents[eventKey] = {
              title: video.title || eventKey.charAt(0).toUpperCase() + eventKey.slice(1),
              video: video.videoUrl,
              image: video.thumbnail || "",
              views: video.views || 0,
              likes: video.likes || 0,
              id: video.id,
              accessType: video.accessType || "free",
              isPremium: video.isPremium || false
            };
          });
          
          setWedding(prev => ({
            ...prev,
            events: formattedEvents
          }));
          
          setVideos(videosResponse.videos);
        }
      } else {
        setError(t('wedding.notFound'));
      }
    } catch (err) {
      console.error("Error loading wedding:", err);
      setError(t('wedding.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // All events definition with translations
  const allEvents = [
    { key: "dote", title: "🪘 DOTE", description: t('wedding.doteDesc') },
    { key: "church", title: "⛪ Church", description: t('wedding.churchDesc') },
    { key: "reception", title: "🎉 Reception", description: t('wedding.receptionDesc') },
    { key: "wedding", title: "💍 Wedding", description: t('wedding.weddingDesc') },
    { key: "engagement", title: "💑 Engagement", description: t('wedding.engagementDesc') },
    { key: "introduction", title: "🤝 Introduction", description: t('wedding.introductionDesc') },
  ];

  // Filter only events that have video links
  const getAvailableEvents = () => {
    if (!wedding || !wedding.events) return [];
    return allEvents.filter(event => {
      const eventData = wedding.events[event.key];
      return eventData && eventData.video && eventData.video !== "";
    });
  };

  const availableEvents = getAvailableEvents();

  // Get premium status for event
  const isEventPremium = (eventKey) => {
    const eventData = wedding?.events?.[eventKey];
    return eventData?.isPremium || eventData?.accessType === "premium";
  };

  const getEventTitle = (eventKey) => {
    const found = allEvents.find(e => e.key === eventKey);
    return found ? found.title : eventKey;
  };

  const getEventDescription = (eventKey) => {
    const found = allEvents.find(e => e.key === eventKey);
    return found ? found.description : "";
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: "4px solid #e8e8e8", 
            borderTop: "4px solid #ffc107", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }} />
          <h2>{t('common.loading')}</h2>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>{t('wedding.notFound')}</h2>
        <p>{error || t('wedding.notFoundDesc')}</p>
        <div style={styles.errorButtons}>
          <Link to="/videos"><button style={styles.videosBtn}>🎬 {t('wedding.browseVideos')}</button></Link>
          <Link to="/"><button style={styles.homeBtn}>🏠 {t('wedding.goHome')}</button></Link>
        </div>
      </div>
    );
  }

  if (availableEvents.length === 0) {
    return (
      <div style={styles.container}>
        <div style={isMobile ? styles.mobileHeader : styles.header}>
          <h1 style={isMobile ? styles.mobileTitle : styles.title}>
            {wedding.couple || wedding.name}
          </h1>
          <p style={isMobile ? styles.mobileLocation : styles.location}>
            📍 {wedding.location || "Rwanda"}
          </p>
          {wedding.weddingDate && (
            <p style={isMobile ? styles.mobileSubtext : styles.subtext}>
              📅 {new Date(wedding.weddingDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <div style={styles.noVideosContainer}>
          <div style={styles.noVideosIcon}>🎬</div>
          <h3>{t('wedding.noVideosTitle')}</h3>
          <p>{t('wedding.noVideosDesc')}</p>
          <Link to="/videos">
            <button style={styles.backToVideosBtn}>{t('wedding.backToVideos')}</button>
          </Link>
        </div>
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
        {wedding.weddingDate && (
          <p style={isMobile ? styles.mobileSubtext : styles.subtext}>
            📅 {new Date(wedding.weddingDate).toLocaleDateString()}
          </p>
        )}
        <p style={isMobile ? styles.mobileSubtext : styles.subtext}>
          {t('wedding.selectMoment')}
        </p>
      </div>

      {/* Grid with fixed column sizes */}
      <div style={{
        ...styles.grid,
        gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
        padding: isMobile ? "30px 15px" : "50px 20px",
      }}>
        {allEvents.map((event) => {
          const eventData = wedding.events?.[event.key];
          const eventImage = eventData?.image || "";
          const hasImage = eventImage && eventImage !== "" && eventImage !== "undefined";
          const hasVideo = eventData && eventData.video && eventData.video !== "";
          const isPremium = isEventPremium(event.key);
          
          // If no video, show disabled card
          if (!hasVideo) {
            return (
              <div key={event.key} style={{ ...styles.card, opacity: 0.6, cursor: "not-allowed" }}>
                <div style={styles.imageWrapper}>
                  {hasImage ? (
                    <img
                      src={eventImage}
                      alt={event.title}
                      style={isMobile ? styles.mobileImage : styles.image}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
                      }}
                    />
                  ) : (
                    <div style={isMobile ? styles.mobilePlaceholder : styles.placeholder}>
                      <div style={styles.placeholderIcon}>📷</div>
                      <div style={styles.placeholderText}>{t('wedding.noImage')}</div>
                    </div>
                  )}
                  <div style={isMobile ? styles.mobilePlayButton : styles.playButton}>
                    <div style={styles.playIcon}>▶</div>
                  </div>
                  <div style={styles.comingSoonBadge}>{t('wedding.comingSoon')}</div>
                </div>
                <div style={isMobile ? styles.mobileText : styles.text}>
                  <h3 style={isMobile ? styles.mobileCardTitle : styles.cardTitle}>{event.title}</h3>
                  <p style={isMobile ? styles.mobileDescription : styles.description}>{event.description}</p>
                  <div style={{ ...styles.watchBtn, background: "#999", cursor: "not-allowed" }}>{t('wedding.comingSoon')} →</div>
                </div>
              </div>
            );
          }
          
          // Active card with video
          return (
            <Link key={event.key} to={`/video/${eventData.id}`} style={styles.link}>
              <div style={styles.card}>
                <div style={styles.imageWrapper}>
                  {hasImage ? (
                    <img
                      src={eventImage}
                      alt={event.title}
                      style={isMobile ? styles.mobileImage : styles.image}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
                      }}
                    />
                  ) : (
                    <div style={isMobile ? styles.mobilePlaceholder : styles.placeholder}>
                      <div style={styles.placeholderIcon}>📷</div>
                      <div style={styles.placeholderText}>{t('wedding.noImage')}</div>
                    </div>
                  )}
                  
                  {/* Premium Badge */}
                  {isPremium && (
                    <div style={styles.premiumBadge}>
                      ⭐ {t('wedding.premium')}
                    </div>
                  )}
                  
                  <div style={isMobile ? styles.mobilePlayButton : styles.playButton}>
                    <div style={styles.playIcon}>▶</div>
                  </div>
                  
                  {/* View count */}
                  {eventData.views > 0 && (
                    <div style={styles.viewCountBadge}>
                      👁️ {eventData.views.toLocaleString()}
                    </div>
                  )}
                </div>
                <div style={isMobile ? styles.mobileText : styles.text}>
                  <h3 style={isMobile ? styles.mobileCardTitle : styles.cardTitle}>
                    {event.title}
                    {isPremium && <span style={{ color: "#ffc107", fontSize: "14px", marginLeft: "8px" }}>⭐</span>}
                  </h3>
                  <p style={isMobile ? styles.mobileDescription : styles.description}>{event.description}</p>
                  <div style={styles.watchBtn}>
                    {isPremium ? `⭐ ${t('wedding.unlockPremium')} →` : `${t('wedding.watchNow')} →`}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div style={styles.infoSection}>
        <div style={styles.infoContainer}>
          <h3 style={styles.infoTitle}>💑 {t('wedding.aboutCouple')}</h3>
          {wedding.groomName && wedding.brideName && (
            <p style={styles.infoText}>
              <strong>{wedding.groomName}</strong> & <strong>{wedding.brideName}</strong>
            </p>
          )}
          <p style={styles.infoText}>
            {t('wedding.coupleCelebrated', { 
              couple: wedding.couple || wedding.name, 
              location: wedding.location || "Rwanda" 
            })}
          </p>
          {wedding.weddingDate && (
            <p style={styles.infoText}>
              📅 {t('wedding.weddingDateLabel')}: {new Date(wedding.weddingDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: "#f6f6f6", minHeight: "100vh" },
  loadingContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  header: { padding: "80px 20px", textAlign: "center", background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff" },
  mobileHeader: { padding: "50px 20px", textAlign: "center", background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff" },
  title: { fontSize: "48px", marginBottom: "10px" },
  mobileTitle: { fontSize: "28px", marginBottom: "10px" },
  location: { fontSize: "18px", opacity: 0.8 },
  mobileLocation: { fontSize: "14px", opacity: 0.8 },
  subtext: { fontSize: "14px", opacity: 0.7, marginTop: "5px" },
  mobileSubtext: { fontSize: "12px", opacity: 0.7, marginTop: "5px" },
  grid: { display: "grid", gap: "25px", maxWidth: "1200px", margin: "0 auto" },
  link: { textDecoration: "none", color: "inherit" },
  card: { background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", transition: "transform 0.3s", height: "100%", display: "flex", flexDirection: "column" },
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
  comingSoonBadge: { position: "absolute", bottom: "10px", left: "10px", right: "10px", background: "rgba(0,0,0,0.7)", color: "#ffc107", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", textAlign: "center" },
  premiumBadge: { position: "absolute", top: "10px", right: "10px", background: "linear-gradient(135deg, #f7971e, #ffd200)", color: "#1a1a2e", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" },
  viewCountBadge: { position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "3px 10px", borderRadius: "12px", fontSize: "11px" },
  text: { padding: "20px", flex: 1 },
  mobileText: { padding: "15px", flex: 1 },
  cardTitle: { fontSize: "22px", marginBottom: "8px" },
  mobileCardTitle: { fontSize: "18px", marginBottom: "5px" },
  description: { color: "#666", fontSize: "14px", marginBottom: "12px" },
  mobileDescription: { color: "#666", fontSize: "12px", marginBottom: "10px" },
  watchBtn: { display: "inline-block", padding: "8px 16px", background: "#000", color: "#fff", borderRadius: "25px", fontSize: "13px", fontWeight: "bold", textAlign: "center" },
  infoSection: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px 60px" },
  infoContainer: { background: "#fff", borderRadius: "16px", padding: "30px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  infoTitle: { fontSize: "20px", marginBottom: "15px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  infoText: { color: "#666", lineHeight: "1.7", fontSize: "15px", marginBottom: "8px" },
  errorContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f5f5f5", textAlign: "center", padding: "20px" },
  errorTitle: { fontSize: "28px", color: "#dc3545", marginBottom: "10px" },
  errorButtons: { display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" },
  videosBtn: { padding: "12px 24px", background: "#007bff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  homeBtn: { padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  noVideosContainer: { textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "16px", maxWidth: "500px", margin: "80px auto" },
  noVideosIcon: { fontSize: "64px", marginBottom: "20px", opacity: 0.5 },
  backToVideosBtn: { marginTop: "20px", padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default WeddingPage;