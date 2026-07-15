// src/pages/VideoDetailPage.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaHeart, FaWhatsapp } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { getCoupleSupportStats, getVideoById, incrementVideoViews, supportCouple } from "../services/api";

function VideoDetailPage() {
  const { t } = useTranslation();
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
  const [userId, setUserId] = useState(null);
  const [supportStats, setSupportStats] = useState({ count: 0, totalAmount: 0 });
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportAmount, setSupportAmount] = useState(5000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [purchasedVideos, setPurchasedVideos] = useState([]);

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
    // Check login status from localStorage
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    const userData = localStorage.getItem("user_data") || localStorage.getItem("admin_data");
    
    if (token) {
      setIsLoggedIn(true);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserRole(user.role);
          setUserId(user.id);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
    
    // Load purchased videos
    const purchased = JSON.parse(localStorage.getItem("user_purchased_videos") || "[]");
    setPurchasedVideos(purchased);
    
    loadVideoDetails();
  }, [id, type]);

  const loadVideoDetails = async () => {
    setLoading(true);
    setVideoError(false);
    
    try {
      // Fetch video from API
      const response = await getVideoById(id);
      
      if (response.success && response.video) {
        const videoData = response.video;
        
        // Format video data
        const formattedVideo = {
          id: videoData.id,
          title: videoData.title || type?.toUpperCase() || "Video",
          video: videoData.videoUrl,
          coupleId: videoData.couple?.id,
          coupleName: videoData.couple?.user?.name || "SHINECONNECT",
          eventType: videoData.eventType || type || "wedding",
          thumbnail: videoData.thumbnail,
          views: videoData.views || 0,
          likes: videoData.likes || 0,
          createdAt: videoData.createdAt,
          accessType: videoData.accessType || "free",
          isPremium: videoData.isPremium || false,
          supportAmount: videoData.supportAmount || 0
        };
        
        setVideo(formattedVideo);
        
        // Set wedding data
        setWedding({
          id: videoData.couple?.id,
          name: videoData.couple?.user?.name || "SHINECONNECT",
          couple: videoData.couple?.user?.name || "SHINECONNECT",
          location: videoData.couple?.location || "Rwanda",
          events: {}
        });
        
        // Load support stats
        if (videoData.couple?.id) {
          loadSupportStats(videoData.couple.id);
        }
        
        // Increment view count
        try {
          await incrementVideoViews(videoData.id);
        } catch (err) {
          console.error("Error incrementing views:", err);
        }
      } else {
        console.error("Video not found");
        setVideoError(true);
      }
    } catch (error) {
      console.error("Error loading video:", error);
      setVideoError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportStats = async (coupleId) => {
    try {
      const response = await getCoupleSupportStats(coupleId);
      if (response.success) {
        setSupportStats({
          count: response.stats?.count || 0,
          totalAmount: response.stats?.totalAmount || 0
        });
      }
    } catch (error) {
      console.error("Error loading support stats:", error);
    }
  };

  const canSupport = () => {
    return isLoggedIn && userRole === "CLIENT";
  };

  const hasPurchased = (videoId) => {
    return purchasedVideos.some(p => p.videoId === videoId);
  };

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

  const handleVideoError = () => {
    console.log("Video failed to load");
    setVideoError(true);
  };

  const handleSupportClick = () => {
    if (!isLoggedIn) {
      alert(t('videoDetail.loginToSupport'));
      window.location.href = "/login";
      return;
    }
    
    if (userRole !== "CLIENT") {
      alert(t('videoDetail.onlyClientsCanSupport'));
      return;
    }
    
    setShowSupportModal(true);
  };

  const handleSupportVideo = async () => {
    if (!wedding) return;
    if (supportAmount < 1000) {
      alert(t('videoDetail.minimumAmount'));
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await supportCouple({
        coupleId: wedding.id,
        amount: supportAmount,
        videoId: video.id,
        paymentMethod: paymentMethod.toUpperCase()
      });
      
      if (result.success) {
        const coupleEarning = supportAmount * 0.6;
        const platformEarning = supportAmount * 0.4;
        
        // Update purchased videos in localStorage
        const purchased = JSON.parse(localStorage.getItem("user_purchased_videos") || "[]");
        purchased.push({
          videoId: video.id,
          coupleId: wedding.id,
          coupleName: wedding.name,
          amount: supportAmount,
          purchasedAt: new Date().toISOString()
        });
        localStorage.setItem("user_purchased_videos", JSON.stringify(purchased));
        setPurchasedVideos(purchased);
        
        // Update support stats
        loadSupportStats(wedding.id);
        
        setShowSupportModal(false);
        alert(t('videoDetail.supportSuccess', { 
          coupleName: wedding.name, 
          amount: coupleEarning.toLocaleString() 
        }));
      } else {
        alert(result.message || t('videoDetail.supportFailed'));
      }
    } catch (error) {
      console.error("Support error:", error);
      alert(t('videoDetail.supportError'));
    } finally {
      setIsProcessing(false);
    }
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

  if (!wedding || !video) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>{t('videoDetail.notFound')}</h2>
        <p>{t('videoDetail.notFoundDesc')}</p>
        <Link to="/">
          <button style={styles.errorBtn}>{t('videoDetail.goHome')}</button>
        </Link>
      </div>
    );
  }

  const embedUrl = video.video ? convertToEmbedUrl(video.video) : null;
  const isValidUrl = embedUrl && (embedUrl.includes("youtube.com/embed/") || embedUrl.includes("youtu.be"));
  const coupleName = wedding.couple || wedding.name;
  const isPremium = video.isPremium || video.accessType === "premium";
  const hasAccess = !isPremium || hasPurchased(video.id);

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .video-container {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        @media (max-width: 768px) {
          .related-grid { grid-template-columns: 1fr !important; }
          .support-stats { flex-direction: column; gap: 8px !important; }
        }
      `}</style>
      
      <div style={styles.container}>
        <div style={styles.backContainer}>
          <Link to="/videos">
            <button style={styles.backButton}>⬅ {t('videoDetail.backToVideos')}</button>
          </Link>
        </div>

        <div style={styles.titleSection}>
          <h1 style={isMobile ? styles.mobileTitle : styles.title}>{coupleName}</h1>
          <h2 style={isMobile ? styles.mobileSubtitle : styles.subtitle}>
            {video.title || type?.toUpperCase()}
          </h2>
          {isPremium && (
            <div style={{ 
              display: "inline-block", 
              background: "linear-gradient(135deg, #f7971e, #ffd200)", 
              color: "#1a1a2e", 
              padding: "4px 16px", 
              borderRadius: "20px", 
              fontSize: "13px", 
              fontWeight: "700",
              marginTop: "8px"
            }}>
              ⭐ {t('videoDetail.premiumVideo')}
            </div>
          )}
        </div>

        {!hasAccess ? (
          <div style={styles.lockedContainer}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>{t('videoDetail.premiumVideo')}</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
              {t('videoDetail.purchaseRequired')}
            </p>
            <button onClick={handleSupportClick} style={styles.supportButton}>
              <FaHeart style={{ marginRight: "8px" }} /> {t('videoDetail.purchaseAccess')}
            </button>
          </div>
        ) : embedUrl && isValidUrl ? (
          <div style={styles.videoWrapper}>
            <div className="video-container">
              {videoError ? (
                <div style={styles.noVideoContainer}>
                  <p>⚠️ {t('videoDetail.videoLoadError')}</p>
                  <p>{t('videoDetail.videoLoadErrorDesc')}</p>
                </div>
              ) : (
                <iframe
                  src={embedUrl}
                  title="Wedding Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={handleVideoError}
                />
              )}
            </div>
          </div>
        ) : (
          <div style={styles.noVideoContainer}>
            <p>⚠️ {t('videoDetail.invalidUrl')}</p>
            <p>{t('videoDetail.invalidUrlDesc')}</p>
          </div>
        )}

        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>📋 {t('videoDetail.videoInfo')}</h3>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>{t('videoDetail.couple')}:</span>
              <span style={styles.infoValue}>{coupleName}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>{t('videoDetail.eventType')}:</span>
              <span style={styles.infoValue}>{video.title || type?.toUpperCase()}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>{t('videoDetail.location')}:</span>
              <span style={styles.infoValue}>{wedding.location || "Rwanda"}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>{t('videoDetail.views')}:</span>
              <span style={styles.infoValue}>{video.views?.toLocaleString() || 0}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>{t('videoDetail.access')}:</span>
              <span style={styles.infoValue}>
                {isPremium ? (
                  <span style={{ color: "#f7971e", fontWeight: "bold" }}>⭐ {t('videoDetail.premium')}</span>
                ) : (
                  <span style={{ color: "#22c55e", fontWeight: "bold" }}>✅ {t('videoDetail.free')}</span>
                )}
              </span>
            </div>
          </div>

          {/* Support Section - Only visible to CLIENTS */}
          <div style={styles.supportCard}>
            <h3 style={styles.supportTitle}>❤️ {t('videoDetail.supportThisCouple')}</h3>
            
            {supportStats.count > 0 && (
              <div className="support-stats" style={{ ...styles.supportStats, flexDirection: isMobile ? "column" : "row" }}>
                <div style={styles.supportStatItem}>
                  <span style={styles.supportStatEmoji}>👥</span>
                  <span>{supportStats.count} {t('videoDetail.supporters')}</span>
                </div>
                <div style={styles.supportStatItem}>
                  <span style={styles.supportStatEmoji}>💰</span>
                  <span>{supportStats.totalAmount.toLocaleString()} RWF {t('videoDetail.raised')}</span>
                </div>
              </div>
            )}
            
            {canSupport() ? (
              <button onClick={handleSupportClick} style={styles.supportButton}>
                <FaHeart style={{ marginRight: "8px" }} /> ❤️ {t('videoDetail.supportThisCouple')}
              </button>
            ) : !isLoggedIn ? (
              <Link to="/login" style={{ textDecoration: "none", display: "block" }}>
                <button style={{ ...styles.supportButton, background: "#6c757d", cursor: "pointer" }}>
                  🔒 {t('videoDetail.loginToSupport')}
                </button>
              </Link>
            ) : userRole !== "CLIENT" ? (
              <button style={{ ...styles.supportButton, background: "#6c757d", cursor: "not-allowed", opacity: 0.6 }} disabled>
                🔒 {t('videoDetail.onlyClientsCanSupport')}
              </button>
            ) : null}
            
            <p style={styles.supportNote}>
              ❤️ {t('videoDetail.supportNote')}<br/>
              <strong style={{ color: "#ffc107" }}>{t('videoDetail.supportSplit')}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div style={styles.modal} onClick={() => setShowSupportModal(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "48px", marginBottom: "12px", textAlign: "center" }}>❤️</div>
            <h2 style={styles.modalTitle}>{t('videoDetail.supportTitle', { coupleName })}</h2>
            <p style={styles.modalText}>
              {t('videoDetail.supportDescription')}<br/>
              <strong style={{ color: "#ffc107" }}>{t('videoDetail.supportSplit')}</strong>
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>{t('videoDetail.supportAmount')}</label>
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
                placeholder={t('videoDetail.customAmount')}
                value={supportAmount}
                onChange={e => setSupportAmount(parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>{t('videoDetail.paymentMethod')}</label>
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
                <span>💑 {t('videoDetail.coupleReceives')} (60%):</span>
                <span style={styles.splitAmount}>{(supportAmount * 0.6).toLocaleString()} RWF</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>🏢 {t('videoDetail.platformFee')} (40%):</span>
                <span style={styles.splitAmount}>{(supportAmount * 0.4).toLocaleString()} RWF</span>
              </div>
            </div>

            <div style={{ marginBottom: "15px", fontSize: "11px", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FaWhatsapp style={{ color: "#25D366" }} />
              <span>{t('videoDetail.whatsappSupport')}: +250 780 145 562</span>
            </div>

            <button onClick={handleSupportVideo} disabled={isProcessing} style={styles.btnPrimary}>
              {isProcessing ? t('videoDetail.processing') : `❤️ ${t('videoDetail.support')} ${supportAmount.toLocaleString()} RWF`}
            </button>
            <button onClick={() => setShowSupportModal(false)} style={styles.btnOutline}>{t('common.cancel')}</button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5", padding: "40px 20px" },
  loadingContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  backContainer: { maxWidth: "1200px", margin: "0 auto", marginBottom: "20px" },
  backButton: { padding: "10px 24px", borderRadius: "30px", border: "none", background: "#000", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  titleSection: { textAlign: "center", maxWidth: "900px", margin: "0 auto", marginBottom: "30px" },
  title: { fontSize: "42px", marginBottom: "10px", color: "#333" },
  mobileTitle: { fontSize: "28px", marginBottom: "10px", color: "#333" },
  subtitle: { fontSize: "22px", color: "#666", fontWeight: "normal" },
  mobileSubtitle: { fontSize: "16px", color: "#666", fontWeight: "normal" },
  videoWrapper: { maxWidth: "1000px", margin: "0 auto" },
  lockedContainer: { maxWidth: "600px", margin: "0 auto", background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", borderRadius: "16px", padding: "60px 40px", textAlign: "center" },
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
  supportNote: { fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "15px", lineHeight: "1.5" },
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