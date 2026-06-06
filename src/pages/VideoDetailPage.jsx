// src/pages/VideoDetailPage.jsx
import { useEffect, useState } from "react";
import { FaHeart, FaWhatsapp } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";

function VideoDetailPage() {
  const { id, type } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [wedding, setWedding] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  
  // Support System States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [supportStats, setSupportStats] = useState({ count: 0, totalAmount: 0 });
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportAmount, setSupportAmount] = useState(5000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mtn");

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
    // Check login status and user role
    const loggedIn = localStorage.getItem("user_logged_in") === "true" ||
                     localStorage.getItem("admin_logged_in") === "true" ||
                     localStorage.getItem("couple_logged_in") === "true" ||
                     localStorage.getItem("creator_logged_in") === "true";
    setIsLoggedIn(loggedIn);
    
    // Get user role
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
    
    loadWeddingAndVideo();
  }, [id, type]);

  // Load support stats for this couple
  const loadSupportStats = (coupleId) => {
    const supports = JSON.parse(localStorage.getItem("video_supports") || "[]");
    const coupleSupports = supports.filter(s => s.coupleId === coupleId);
    const totalAmount = coupleSupports.reduce((sum, s) => sum + s.amount, 0);
    setSupportStats({
      count: coupleSupports.length,
      totalAmount: totalAmount
    });
  };

  // Check if user can support (only CLIENT role)
  const canSupport = () => {
    return isLoggedIn && userRole === "CLIENT";
  };

  // Function to convert YouTube URL to embed format
  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    
    if (url.includes("/embed/")) {
      return url;
    }
    
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    if (url.includes("watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    return url;
  };

  const loadWeddingAndVideo = () => {
    setLoading(true);
    setVideoError(false);
    const couples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    
    let foundWedding = couples.find((w) => w.id === id);
    
    if (!foundWedding) {
      foundWedding = couples.find((w) => w.couple === id || w.name === id);
    }
    
    if (foundWedding) {
      setWedding(foundWedding);
      loadSupportStats(foundWedding.id);
      
      const foundVideo = foundWedding.events?.[type];
      
      if (foundVideo && foundVideo.video) {
        const embedUrl = convertToEmbedUrl(foundVideo.video);
        setVideo({ ...foundVideo, video: embedUrl });
      } else {
        setVideo(foundVideo);
      }
    }
    
    setLoading(false);
  };

  const handleVideoError = () => {
    console.log("Video failed to load");
    setVideoError(true);
  };

  const handleSupportClick = () => {
    if (!isLoggedIn) {
      alert("Please login to support couples");
      window.location.href = "/login";
      return;
    }
    
    if (userRole !== "CLIENT") {
      alert("Only CLIENT accounts can support couples");
      return;
    }
    
    setShowSupportModal(true);
  };

  const handleSupportVideo = () => {
    if (!wedding) return;
    if (supportAmount < 1000) {
      alert("Minimum support amount is 1,000 RWF");
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const coupleEarning = supportAmount * 0.6;
      const platformEarning = supportAmount * 0.4;
      
      const supportRecord = {
        id: Date.now(),
        coupleId: wedding.id,
        coupleName: wedding.couple || wedding.name,
        videoId: type,
        amount: supportAmount,
        coupleEarning: coupleEarning,
        platformEarning: platformEarning,
        userEmail: localStorage.getItem("user_email") || "guest@example.com",
        userName: localStorage.getItem("user_name") || "Guest",
        userRole: userRole,
        paymentMethod: paymentMethod,
        date: new Date().toISOString()
      };
      
      const supports = JSON.parse(localStorage.getItem("video_supports") || "[]");
      supports.push(supportRecord);
      localStorage.setItem("video_supports", JSON.stringify(supports));
      
      loadSupportStats(wedding.id);
      
      const coupleEarnings = JSON.parse(localStorage.getItem("couple_earnings") || "[]");
      coupleEarnings.push({
        id: Date.now(),
        coupleId: wedding.id,
        coupleName: wedding.couple || wedding.name,
        videoId: type,
        amount: coupleEarning,
        platformFee: platformEarning,
        date: new Date().toISOString()
      });
      localStorage.setItem("couple_earnings", JSON.stringify(coupleEarnings));
      
      const notifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
      notifications.unshift({
        id: Date.now(),
        title: "❤️ Support Successful!",
        message: `You supported ${wedding.couple || wedding.name} with ${supportAmount.toLocaleString()} RWF. ${coupleEarning.toLocaleString()} RWF (60%) goes to the couple. Thank you!`,
        type: "payment",
        read: false,
        date: new Date().toLocaleDateString()
      });
      localStorage.setItem("user_notifications", JSON.stringify(notifications.slice(0, 50)));
      
      setIsProcessing(false);
      setShowSupportModal(false);
      alert(`✅ Thank you for supporting ${wedding.couple || wedding.name}! 60% (${coupleEarning.toLocaleString()} RWF) goes to the couple.`);
    }, 1500);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading video...</h2>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Wedding not found</h2>
        <p>The wedding couple you're looking for doesn't exist.</p>
        <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
          ID searched: {id}
        </p>
        <Link to="/">
          <button style={styles.errorBtn}>Go Home</button>
        </Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Video not found</h2>
        <p>The {type} video for {wedding.couple || wedding.name} is not available yet.</p>
        <Link to={`/wedding/${wedding.id}`}>
          <button style={styles.errorBtn}>Back to Wedding</button>
        </Link>
      </div>
    );
  }

  const otherEvents = Object.entries(wedding.events || {}).filter(([key]) => key !== type);
  const embedUrl = video.video ? convertToEmbedUrl(video.video) : null;
  const isValidUrl = embedUrl && (embedUrl.includes("youtube.com/embed/") || embedUrl.includes("youtu.be"));
  const coupleName = wedding.couple || wedding.name;

  return (
    <div style={styles.container}>
      <div style={styles.backContainer}>
        <Link to={`/wedding/${wedding.id}`}>
          <button style={styles.backButton}>⬅ Back to Wedding</button>
        </Link>
      </div>

      <div style={styles.titleSection}>
        <h1 style={isMobile ? styles.mobileTitle : styles.title}>{coupleName}</h1>
        <h2 style={isMobile ? styles.mobileSubtitle : styles.subtitle}>
          {video.title || type.toUpperCase()}
        </h2>
      </div>

      {embedUrl && isValidUrl ? (
        <div style={styles.videoWrapper}>
          <div style={styles.videoContainer}>
            {videoError ? (
              <div style={styles.noVideoContainer}>
                <p>⚠️ Video failed to load.</p>
                <p>Please check the video URL or try again later.</p>
              </div>
            ) : (
              <iframe
                src={embedUrl}
                title="Wedding Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={styles.iframe}
                onError={handleVideoError}
              />
            )}
          </div>
        </div>
      ) : (
        <div style={styles.noVideoContainer}>
          <p>⚠️ Invalid video URL format.</p>
          <p>Please use a valid YouTube URL.</p>
        </div>
      )}

      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>📋 Video Information</h3>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Couple:</span>
            <span style={styles.infoValue}>{coupleName}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Event Type:</span>
            <span style={styles.infoValue}>{video.title || type.toUpperCase()}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Location:</span>
            <span style={styles.infoValue}>{wedding.location || "Rwanda"}</span>
          </div>
        </div>

        {/* Support Section - Only visible to CLIENTS */}
        <div style={styles.supportCard}>
          <h3 style={styles.supportTitle}>❤️ Support This Couple</h3>
          
          {supportStats.count > 0 && (
            <div style={styles.supportStats}>
              <div style={styles.supportStatItem}>
                <span style={styles.supportStatEmoji}>👥</span>
                <span>{supportStats.count} supporter{supportStats.count !== 1 ? "s" : ""}</span>
              </div>
              <div style={styles.supportStatItem}>
                <span style={styles.supportStatEmoji}>💰</span>
                <span>{supportStats.totalAmount.toLocaleString()} RWF raised</span>
              </div>
            </div>
          )}
          
          {canSupport() ? (
            <button onClick={handleSupportClick} style={styles.supportButton}>
              <FaHeart style={{ marginRight: "8px" }} /> ❤️ Twerera / Support This Couple
            </button>
          ) : !isLoggedIn ? (
            <Link to="/login" style={styles.supportButtonLink}>
              <button style={{ ...styles.supportButton, background: "#6c757d", cursor: "pointer" }}>
                🔒 Login to Support
              </button>
            </Link>
          ) : userRole !== "CLIENT" ? (
            <button style={{ ...styles.supportButton, background: "#6c757d", cursor: "not-allowed", opacity: 0.6 }} disabled>
              🔒 Only Clients Can Support
            </button>
          ) : null}
          
          <p style={styles.supportNote}>
            ❤️ Your support helps couples share their special moments.<br/>
            <strong style={{ color: "#ffc107" }}>60% goes to the couple, 40% supports the platform.</strong>
          </p>
        </div>
      </div>

      {otherEvents.length > 0 && (
        <div style={styles.relatedSection}>
          <h3 style={styles.relatedTitle}>🎬 Other Moments</h3>
          <div style={{ ...styles.relatedGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)" }}>
            {otherEvents.map(([key, event]) => (
              <Link key={key} to={`/video/${wedding.id}/${key}`} style={styles.relatedLink}>
                <div style={styles.relatedCard}>
                  <div style={styles.relatedIcon}>
                    {key === "dote" && "🪘"}
                    {key === "church" && "⛪"}
                    {key === "reception" && "🎉"}
                  </div>
                  <div style={styles.relatedInfo}>
                    <div style={styles.relatedName}>{event.title || key}</div>
                    <div style={styles.relatedType}>
                      {key === "dote" && "Traditional Ceremony"}
                      {key === "church" && "Church Wedding"}
                      {key === "reception" && "Reception Party"}
                    </div>
                  </div>
                  <div style={styles.relatedArrow}>→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div style={styles.modal} onClick={() => setShowSupportModal(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "48px", marginBottom: "12px", textAlign: "center" }}>❤️</div>
            <h2 style={styles.modalTitle}>Support {coupleName}</h2>
            <p style={styles.modalText}>
              Your support helps couples share their special moments.<br/>
              <strong style={{ color: "#ffc107" }}>60% goes to the couple, 40% supports the platform.</strong>
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>Support Amount (RWF)</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" }}>
                {[2000, 5000, 10000, 20000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSupportAmount(amount)}
                    style={{
                      ...styles.amountBtn,
                      background: supportAmount === amount ? "#ffc107" : "#fff",
                      color: supportAmount === amount ? "#111" : "#333",
                      border: `1.5px solid ${supportAmount === amount ? "#ffc107" : "#ddd"}`
                    }}
                  >
                    {amount.toLocaleString()} RWF
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom amount (RWF)"
                value={supportAmount}
                onChange={e => setSupportAmount(parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>Payment Method</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input type="radio" name="paymentMethod" value="mtn" checked={paymentMethod === "mtn"} onChange={() => setPaymentMethod("mtn")} />
                  <span>📱 MTN Mobile Money</span>
                </label>
                <label style={styles.radioLabel}>
                  <input type="radio" name="paymentMethod" value="airtel" checked={paymentMethod === "airtel"} onChange={() => setPaymentMethod("airtel")} />
                  <span>📱 Airtel Money</span>
                </label>
              </div>
            </div>

            <div style={styles.revenueInfo}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>💑 Couple receives (60%):</span>
                <span style={styles.splitAmount}>{(supportAmount * 0.6).toLocaleString()} RWF</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>🏢 Platform fee (40%):</span>
                <span style={styles.splitAmount}>{(supportAmount * 0.4).toLocaleString()} RWF</span>
              </div>
            </div>

            <div style={{ marginBottom: "15px", fontSize: "11px", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FaWhatsapp style={{ color: "#25D366" }} />
              <span>Or send via WhatsApp: +250 780 145 562</span>
            </div>

            <button onClick={handleSupportVideo} disabled={isProcessing} style={styles.btnPrimary}>
              {isProcessing ? "Processing..." : `❤️ Support with ${supportAmount.toLocaleString()} RWF`}
            </button>
            <button onClick={() => setShowSupportModal(false)} style={styles.btnOutline}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5", padding: "40px 20px" },
  loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  backContainer: { maxWidth: "1200px", margin: "0 auto", marginBottom: "20px" },
  backButton: { padding: "10px 24px", borderRadius: "30px", border: "none", background: "#000", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  titleSection: { textAlign: "center", maxWidth: "900px", margin: "0 auto", marginBottom: "30px" },
  title: { fontSize: "42px", marginBottom: "10px", color: "#333" },
  mobileTitle: { fontSize: "28px", marginBottom: "10px", color: "#333" },
  subtitle: { fontSize: "22px", color: "#666", fontWeight: "normal" },
  mobileSubtitle: { fontSize: "16px", color: "#666", fontWeight: "normal" },
  videoWrapper: { maxWidth: "1000px", margin: "0 auto" },
  videoContainer: { position: "relative", width: "100%", paddingBottom: "56.25%", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" },
  noVideoContainer: { textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px", maxWidth: "600px", margin: "0 auto" },
  infoSection: { maxWidth: "800px", margin: "0 auto", marginTop: "40px" },
  infoCard: { background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", marginBottom: "20px" },
  infoTitle: { fontSize: "18px", marginBottom: "20px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #eee" },
  infoLabel: { fontWeight: "bold", color: "#666" },
  infoValue: { color: "#333" },
  supportCard: { background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)", borderRadius: "16px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", textAlign: "center", border: "1px solid rgba(255,193,7,0.2)" },
  supportTitle: { fontSize: "20px", marginBottom: "15px", color: "#ffc107", fontWeight: "bold" },
  supportStats: { display: "flex", justifyContent: "center", gap: "30px", marginBottom: "20px", padding: "10px", background: "rgba(255,193,7,0.1)", borderRadius: "12px" },
  supportStatItem: { display: "flex", alignItems: "center", gap: "8px", color: "#fff", fontSize: "14px" },
  supportStatEmoji: { fontSize: "18px" },
  supportButton: { padding: "14px 28px", background: "#ffc107", color: "#111", border: "none", borderRadius: "40px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", width: "100%" },
  supportButtonLink: { textDecoration: "none", display: "block", width: "100%" },
  supportNote: { fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "15px", lineHeight: "1.5" },
  relatedSection: { maxWidth: "800px", margin: "0 auto", marginTop: "40px" },
  relatedTitle: { fontSize: "20px", marginBottom: "20px", color: "#333" },
  relatedGrid: { display: "grid", gap: "15px" },
  relatedLink: { textDecoration: "none" },
  relatedCard: { background: "#fff", padding: "15px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "15px", transition: "transform 0.3s", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  relatedIcon: { fontSize: "30px", minWidth: "50px" },
  relatedInfo: { flex: 1 },
  relatedName: { fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "4px" },
  relatedType: { fontSize: "13px", color: "#999" },
  relatedArrow: { fontSize: "20px", color: "#ccc" },
  errorContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f5f5f5", textAlign: "center", padding: "20px" },
  errorTitle: { fontSize: "28px", color: "#dc3545", marginBottom: "10px" },
  errorBtn: { marginTop: "20px", padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" },
  modalBox: { background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "450px", width: "100%", textAlign: "center" },
  modalTitle: { fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: "#333" },
  modalText: { fontSize: "13px", color: "#666", marginBottom: "20px", lineHeight: 1.6 },
  amountBtn: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" },
  input: { width: "100%", padding: "12px", border: "1.5px solid #ddd", borderRadius: "10px", fontSize: "16px", outline: "none", textAlign: "center", boxSizing: "border-box" },
  radioGroup: { display: "flex", gap: "15px", justifyContent: "center", marginBottom: "20px" },
  radioLabel: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" },
  revenueInfo: { background: "rgba(255,193,7,0.08)", borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "12px" },
  splitAmount: { fontWeight: 700, color: "#ffc107" },
  btnPrimary: { padding: "12px 24px", background: "#ffc107", color: "#111", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "15px", width: "100%" },
  btnOutline: { padding: "10px 20px", background: "transparent", color: "#333", border: "1px solid #ddd", borderRadius: "10px", cursor: "pointer", fontSize: "14px", width: "100%", marginTop: "12px" }
};

export default VideoDetailPage;