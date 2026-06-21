// src/pages/Videos.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCalendar, FaEye, FaHeart, FaLock, FaRegHeart, FaSearch, FaShare, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAllVideos, incrementVideoViews, supportCouple } from "../services/api";

// ─── CONSTANTS ─────────────────────────────────────────────────────
const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

// All event types
const CATEGORIES = [
  { id: "all", labelKey: "videos.allVideos", icon: "🎬" },
  { id: "wedding", labelKey: "home.wedding", icon: "💍" },
  { id: "dote", labelKey: "home.dote", icon: "🪘" },
  { id: "birthday", labelKey: "home.birthday", icon: "🎂" },
  { id: "funeral", labelKey: "home.funeral", icon: "🕊️" },
  { id: "graduation", labelKey: "home.graduation", icon: "🎓" },
  { id: "corporate", labelKey: "home.corporate", icon: "🏢" },
];

const SORT_OPTIONS = [
  { value: "newest", labelKey: "videos.newest", icon: "📅" },
  { value: "popular", labelKey: "videos.popular", icon: "🔥" },
  { value: "oldest", labelKey: "videos.oldest", icon: "📅" },
  { value: "most_viewed", labelKey: "videos.mostViewed", icon: "👁️" },
];

// ─── INLINE TOAST ──────────────────────────────────────────────────
const toast = (msg, color = Y) => {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
    background: BLK, color: WHT, padding: "12px 20px",
    borderRadius: "10px", fontSize: "14px", fontWeight: "600",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)", borderLeft: `4px solid ${color}`,
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// ─── HELPER ────────────────────────────────────────────────────────
const getEventInfo = (type) => {
  const types = {
    wedding: { icon: "💍", label: "home.wedding" },
    dote: { icon: "🪘", label: "home.dote" },
    birthday: { icon: "🎂", label: "home.birthday" },
    funeral: { icon: "🕊️", label: "home.funeral" },
    graduation: { icon: "🎓", label: "home.graduation" },
    corporate: { icon: "🏢", label: "home.corporate" },
  };
  return types[type] || { icon: "🎬", label: "home.events" };
};

// ─── COMPONENT ─────────────────────────────────────────────────────
export default function Videos() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Support Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [supportAmount, setSupportAmount] = useState(5000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [purchasedVideos, setPurchasedVideos] = useState([]);
  
  // Support stats for couples
  const [coupleSupportCounts, setCoupleSupportCounts] = useState({});

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    
    // Get user data from localStorage
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
    
    // Load purchased videos from localStorage (will be synced with backend later)
    const purchased = JSON.parse(localStorage.getItem("user_purchased_videos") || "[]");
    setPurchasedVideos(purchased);
    
    fetchVideos();
    loadCoupleSupportCounts();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, category, searchTerm, sortBy]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
  };
  
  // Load support counts from API
  const loadCoupleSupportCounts = async () => {
    try {
      // This would be an API call to get support counts
      // For now, we'll use localStorage as fallback
      const supports = JSON.parse(localStorage.getItem("video_supports") || "[]");
      const counts = {};
      supports.forEach(support => {
        if (!counts[support.coupleId]) {
          counts[support.coupleId] = { count: 0, totalAmount: 0 };
        }
        counts[support.coupleId].count++;
        counts[support.coupleId].totalAmount += support.amount;
      });
      setCoupleSupportCounts(counts);
    } catch (error) {
      console.error("Error loading support counts:", error);
    }
  };

  // Fetch videos from backend API
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos(1, 100, {});
      
      if (data.success && data.videos) {
        const formattedVideos = data.videos.map(v => ({
          id: v.id,
          coupleId: v.couple?.id || v.userId,
          coupleName: v.couple?.user?.name || v.user?.name || "NY Entertainment",
          title: v.title || "Untitled Video",
          eventType: v.eventType?.toLowerCase() || "wedding",
          displayType: v.eventType?.toLowerCase() || "wedding",
          icon: getEventInfo(v.eventType?.toLowerCase()).icon,
          typeLabel: getEventInfo(v.eventType?.toLowerCase()).label,
          image: v.thumbnail || "https://via.placeholder.com/400x250?text=Video",
          videoUrl: v.videoUrl,
          views: v.views || 0,
          likes: v.likes || 0,
          date: v.createdAt,
          source: v.user?.role === "CREATOR" ? "creator" : "couple",
          creatorName: v.user?.name,
          accessType: v.accessType?.toLowerCase() || "free",
          supportAmount: v.supportAmount || 0,
          isPremium: v.isPremium || false,
          couple: v.couple
        }));
        setVideos(formattedVideos);
      } else {
        toast(t('videos.loadError'), "#ef4444");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast(t('videos.loadErrorRefresh'), "#ef4444");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVideos = () => {
    let result = [...videos];

    if (category !== "all") {
      result = result.filter(v => v.eventType === category || v.displayType === category);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.coupleName?.toLowerCase().includes(term) ||
        v.title?.toLowerCase().includes(term) ||
        v.creatorName?.toLowerCase().includes(term)
      );
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "popular" || sortBy === "most_viewed") {
      result.sort((a, b) => b.views - a.views);
    }

    setFilteredVideos(result);
  };

  const handleLike = async (videoId) => {
    const isLiked = !likedVideos[videoId];
    setLikedVideos(prev => ({ ...prev, [videoId]: isLiked }));
    toast(isLiked ? t('videos.liked') : t('videos.unliked'));
    
    try {
      // This would call an API to like/unlike
      // await likeVideo(videoId, isLiked);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleShare = async (video) => {
    const url = `${window.location.origin}/video/${video.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast(t('videos.linkCopied'));
    } catch (err) {
      toast(t('videos.copyLink'));
    }
  };

  const hasAccess = (video) => {
    if (video.accessType !== "support" && video.accessType !== "premium") return true;
    return purchasedVideos.some(p => p.videoId === video.id);
  };
  
  const canSupport = () => {
    return isLoggedIn && userRole === "CLIENT";
  };

  const handleSupportClick = async (video) => {
    if (!isLoggedIn) {
      toast(t('videos.loginToSupport'), "#ef4444");
      setTimeout(() => { window.location.href = "/login"; }, 1000);
      return;
    }
    
    if (userRole !== "CLIENT") {
      toast(t('videos.onlyClientsCanSupport'), "#ef4444");
      return;
    }
    
    if (hasAccess(video)) {
      // Already purchased, watch directly
      try {
        await incrementVideoViews(video.id);
        window.open(video.videoUrl, "_blank");
      } catch (error) {
        console.error("Error incrementing views:", error);
        window.open(video.videoUrl, "_blank");
      }
      return;
    }
    
    setSelectedVideo(video);
    setSupportAmount(video.supportAmount || 5000);
    setShowSupportModal(true);
  };

  const handleSupportVideo = async () => {
    if (!selectedVideo) return;
    if (supportAmount < 1000) {
      toast(t('videos.minimumAmount'), "#ef4444");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await supportCouple({
        coupleId: selectedVideo.coupleId,
        amount: supportAmount,
        videoId: selectedVideo.id,
        paymentMethod: paymentMethod.toUpperCase()
      });
      
      if (result.success) {
        const coupleEarning = supportAmount * 0.6;
        const platformEarning = supportAmount * 0.4;
        
        const purchased = JSON.parse(localStorage.getItem("user_purchased_videos") || "[]");
        purchased.push({
          videoId: selectedVideo.id,
          coupleId: selectedVideo.coupleId,
          coupleName: selectedVideo.coupleName,
          amount: supportAmount,
          purchasedAt: new Date().toISOString()
        });
        localStorage.setItem("user_purchased_videos", JSON.stringify(purchased));
        setPurchasedVideos(purchased);
        
        loadCoupleSupportCounts();
        
        setShowSupportModal(false);
        toast(t('videos.supportSuccess', { 
          coupleName: selectedVideo.coupleName, 
          amount: coupleEarning.toLocaleString() 
        }));
        
        setTimeout(async () => {
          try {
            await incrementVideoViews(selectedVideo.id);
            window.open(selectedVideo.videoUrl, "_blank");
          } catch (err) {
            window.open(selectedVideo.videoUrl, "_blank");
          }
        }, 500);
      } else {
        toast(result.message || t('videos.supportFailed'), "#ef4444");
      }
    } catch (error) {
      console.error("Support error:", error);
      toast(t('videos.supportError'), "#ef4444");
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryLabel = () => {
    const found = CATEGORIES.find(c => c.id === category);
    return found ? t(found.labelKey) : t('videos.allVideos');
  };

  const getCategoryIcon = () => {
    const found = CATEGORIES.find(c => c.id === category);
    return found ? found.icon : "🎬";
  };

  const trendingVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);

  const css = `
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .card-animate { animation: fadeIn 0.35s ease both; }
    .card-animate:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
    .video-card:hover .play-overlay { opacity: 1 !important; }
    .video-card:hover .video-image { transform: scale(1.05) !important; }
    input:focus, select:focus { border-color: #ffc107 !important; box-shadow: 0 0 0 3px rgba(255,193,7,0.15) !important; outline:none; }
    
    @media (max-width: 768px) {
      .main-grid { grid-template-columns: 1fr !important; }
      .sidebar { display: ${mobileMenuOpen ? 'block' : 'none'} !important; position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; background: ${darkMode ? '#1e1e1e' : '#fff'}; overflow-y: auto; padding: 20px; }
      .mobile-menu-btn { display: flex !important; }
      .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .hero-title { font-size: 28px !important; }
      .videos-grid { grid-template-columns: 1fr !important; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .videos-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    
    .mobile-menu-btn { display: none; position: fixed; bottom: 20px; right: 20px; background: #ffc107; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; z-index: 1001; box-shadow: 0 4px 12px rgba(0,0,0,0.15); align-items: center; justify-content: center; }
    .close-sidebar { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; }
  `;

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

  const styles = {
    container: { minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", transition: "all 0.3s ease" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: "#ffc107", border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    hero: { background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)`, color: WHT, padding: "60px 24px", textAlign: "center", position: "relative", overflow: "hidden" },
    heroTitle: { fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, marginBottom: 16, color: WHT, lineHeight: 1.2 },
    heroSubtitle: { fontSize: "clamp(14px, 4vw, 18px)", color: "rgba(255,255,255,0.8)", maxWidth: 600, margin: "0 auto" },
    statsBar: { background: cardBg, borderBottom: `1px solid ${borderColor}`, padding: "16px 24px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16, maxWidth: 1000, margin: "0 auto" },
    statCard: { textAlign: "center", padding: "12px" },
    statValue: { fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "#ffc107", marginBottom: 4 },
    statLabel: { fontSize: "clamp(11px, 3vw, 13px)", color: textMuted },
    mainGrid: { maxWidth: 1400, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "minmax(260px, 300px) 1fr", gap: 32, alignItems: "start" },
    sidebar: { background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "20px", position: "sticky", top: 20 },
    sidebarTitle: { fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 700, marginBottom: 16, paddingLeft: 10, borderLeft: `3px solid #ffc107` },
    searchBox: { display: "flex", alignItems: "center", border: `1px solid ${borderColor}`, borderRadius: 10, padding: "10px 14px", background: darkMode ? "#333" : "#fafafa" },
    searchIcon: { color: textMuted, marginRight: 10 },
    searchInput: { flex: 1, border: "none", outline: "none", background: "transparent", color: textColor, fontSize: 14 },
    categoryList: { display: "flex", flexDirection: "column", gap: 8 },
    categoryBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "transparent", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, color: textMuted, transition: "all 0.2s", width: "100%" },
    categoryActive: { background: `#ffc10720`, color: "#ffc107", fontWeight: 600 },
    trendingItem: { display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${borderColor}`, textDecoration: "none", transition: "all 0.2s" },
    trendingImage: { width: "60px", height: "60px", borderRadius: 10, objectFit: "cover" },
    trendingTitle: { fontSize: "13px", fontWeight: 600, color: textColor, marginBottom: 4 },
    trendingViews: { fontSize: "11px", color: textMuted },
    mainArea: { minWidth: 0 },
    videoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 },
    videoTitle: { fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 700, color: textColor, marginBottom: 4 },
    videoCount: { fontSize: 13, color: textMuted },
    sortSelect: { padding: "10px 16px", border: `1px solid ${borderColor}`, borderRadius: 10, background: cardBg, color: textColor, cursor: "pointer", fontSize: 14 },
    videosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 },
    videoCard: { background: cardBg, borderRadius: 16, overflow: "hidden", border: `1px solid ${borderColor}`, transition: "all 0.25s", position: "relative" },
    videoImageWrapper: { position: "relative", overflow: "hidden", aspectRatio: "16/9" },
    videoImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" },
    playOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s" },
    playButton: { width: 50, height: 50, borderRadius: "50%", background: "#ffc107", display: "flex", alignItems: "center", justifyContent: "center", color: BLK, fontSize: 20, cursor: "pointer" },
    videoType: { position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.7)", color: WHT, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
    supportBadge: { position: "absolute", top: 12, right: 12, background: "#ffc107", color: BLK, padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 },
    creatorBadge: { position: "absolute", bottom: 12, right: 12, background: "#3b82f6", color: WHT, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700 },
    lockedOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 },
    videoInfo: { padding: "14px 16px" },
    videoCardTitle: { fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 6, lineHeight: 1.4 },
    videoMeta: { display: "flex", gap: 16, fontSize: 12, color: textMuted, marginBottom: 10, flexWrap: "wrap" },
    supportStats: { display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#ffc107", marginTop: 6 },
    videoActions: { display: "flex", gap: 16, padding: "12px 16px 16px", borderTop: `1px solid ${borderColor}`, flexWrap: "wrap" },
    actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: textMuted, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", padding: "6px 10px", borderRadius: 8 },
    supportBtn: { background: "#ffc107", color: BLK, fontWeight: 700, padding: "8px 16px", borderRadius: 20 },
    supportBtnDisabled: { background: "#6c757d", color: WHT, cursor: "not-allowed", opacity: 0.6 },
    noResults: { textAlign: "center", padding: "60px 20px", background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}` },
    noResultsIcon: { fontSize: 64, marginBottom: 20 },
    resetBtn: { marginTop: 16, padding: "10px 24px", background: "#ffc107", color: BLK, border: "none", borderRadius: 30, cursor: "pointer", fontWeight: 600 },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" },
    modalBox: { background: cardBg, borderRadius: "20px", padding: "28px", maxWidth: "450px", width: "100%", textAlign: "center" },
    modalTitle: { fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: textColor },
    modalText: { fontSize: "13px", color: textMuted, marginBottom: "20px", lineHeight: 1.6 },
    amountBtn: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" },
    input: { width: "100%", padding: "12px", border: `1.5px solid ${borderColor}`, borderRadius: "10px", fontSize: "16px", background: darkMode ? "#333" : "#fff", color: textColor, outline: "none", textAlign: "center", boxSizing: "border-box" },
    radioGroup: { display: "flex", gap: "15px", justifyContent: "center", marginBottom: "20px" },
    radioLabel: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" },
    revenueInfo: { background: `#ffc10715`, borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "12px" },
    splitAmount: { fontWeight: 700, color: "#ffc107" },
    btnPrimary: { padding: "12px 24px", background: "#ffc107", color: BLK, border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "15px", width: "100%" },
    btnOutline: { padding: "10px 20px", background: "transparent", color: textColor, border: `1px solid ${borderColor}`, borderRadius: "10px", cursor: "pointer", fontSize: "14px", width: "100%" }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ width: 50, height: 50, border: `4px solid ${borderColor}`, borderTop: `4px solid #ffc107`, borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 20 }} />
        <p style={{ color: textMuted }}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div style={styles.container}>
        
        <button onClick={toggleDarkMode} style={styles.darkModeBtn}>{darkMode ? "☀️" : "🌙"}</button>
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Hero */}
        <div style={styles.hero}>
          <h1 className="hero-title" style={styles.heroTitle}>🎬 {t('videos.title')}</h1>
          <p style={styles.heroSubtitle}>{t('videos.subtitle')}</p>
        </div>

        {/* Stats */}
        <div style={styles.statsBar}>
          <div className="stats-grid" style={styles.statsGrid}>
            <div style={styles.statCard}><div style={styles.statValue}>{videos.length}</div><div style={styles.statLabel}>{t('videos.totalVideos')}</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{totalViews.toLocaleString()}</div><div style={styles.statLabel}>{t('videos.totalViews')}</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{CATEGORIES.length - 1}</div><div style={styles.statLabel}>{t('videos.categories')}</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{trendingVideos.length}</div><div style={styles.statLabel}>{t('videos.trending')}</div></div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="main-grid" style={styles.mainGrid}>

          {/* Sidebar */}
          <aside className="sidebar" style={styles.sidebar}>
            <button className="close-sidebar" onClick={() => setMobileMenuOpen(false)} style={{ display: 'none' }}>✕</button>
            
            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>🔍 {t('common.search')}</div>
              <div style={styles.searchBox}>
                <FaSearch style={styles.searchIcon} />
                <input type="text" placeholder={t('videos.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>📂 {t('videos.categories')}</div>
              <div style={styles.categoryList}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ ...styles.categoryBtn, ...(category === cat.id ? styles.categoryActive : {}) }}>
                    <span>{cat.icon}</span> {t(cat.labelKey)}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: textMuted }}>{videos.filter(v => cat.id === "all" || v.eventType === cat.id || v.displayType === cat.id).length}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>🔀 {t('common.sortBy')}</div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...styles.sortSelect, width: "100%" }}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {t(opt.labelKey)}</option>
                ))}
              </select>
            </div>

            {trendingVideos.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={styles.sidebarTitle}>🔥 {t('videos.trending')}</div>
                {trendingVideos.map(video => (
                  <Link key={video.id} to={`/video/${video.id}`} style={styles.trendingItem}>
                    <img src={video.image} alt={video.coupleName} style={styles.trendingImage} />
                    <div>
                      <div style={styles.trendingTitle}>{video.coupleName}</div>
                      <div style={styles.trendingViews}>{video.icon} {t(video.typeLabel)} • {video.views.toLocaleString()} {t('videos.views')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div style={{ marginTop: 24, background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <h4 style={{ color: WHT, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{t('videos.bookYourEvent')}</h4>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 12 }}>{t('videos.bookYourEventDesc')}</p>
              <Link to="/booking">
                <button style={{ width: "100%", padding: "8px", background: "#ffc107", color: BLK, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>{t('videos.bookNow')}</button>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-area" style={styles.mainArea}>
            <div style={styles.videoHeader}>
              <div>
                <h2 style={styles.videoTitle}>{getCategoryIcon()} {getCategoryLabel()}</h2>
                <p style={styles.videoCount}>{filteredVideos.length} {t('videos.videoFound', { count: filteredVideos.length })}</p>
              </div>
              {(searchTerm || category !== "all") && (
                <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", fontSize: 12, color: textMuted }}>
                  ✕ {t('videos.clearFilters')}
                </button>
              )}
            </div>

            {filteredVideos.length === 0 ? (
              <div style={styles.noResults}>
                <div style={styles.noResultsIcon}>🎬</div>
                <h3 style={{ marginBottom: 8 }}>{t('videos.noVideosFound')}</h3>
                <p style={{ color: textMuted }}>{t('videos.tryAdjusting')}</p>
                <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={styles.resetBtn}>{t('videos.clearFilters')}</button>
              </div>
            ) : (
              <div className="videos-grid" style={styles.videosGrid}>
                {filteredVideos.map(video => {
                  const supportCount = coupleSupportCounts[video.coupleId]?.count || 0;
                  const supportTotal = coupleSupportCounts[video.coupleId]?.totalAmount || 0;
                  const canSupportUser = canSupport();
                  const isAlreadyPurchased = hasAccess(video);
                  
                  return (
                    <div key={video.id} className="video-card card-animate" style={styles.videoCard}>
                      <div style={styles.videoImageWrapper}>
                        <img src={video.image} alt={video.coupleName} className="video-image" style={styles.videoImage} />
                        <div className="play-overlay" style={styles.playOverlay}>
                          <div style={styles.playButton}>▶</div>
                        </div>
                        <div style={styles.videoType}>{video.icon} {t(video.typeLabel)}</div>
                        
                        {video.accessType === "support" && (
                          <div style={styles.supportBadge}>
                            ❤️ {t('videos.supportVideo')} • {video.supportAmount?.toLocaleString()} RWF
                          </div>
                        )}
                        
                        {video.source === "creator" && <div style={styles.creatorBadge}>🎬 {t('videos.creator')}</div>}
                        
                        {video.accessType === "support" && !isAlreadyPurchased && (
                          <div className="locked-overlay" style={styles.lockedOverlay}>
                            <FaLock style={{ fontSize: 24, color: "#ffc107" }} />
                            <span style={{ fontSize: 11, color: WHT }}>❤️ {t('videos.supportToWatch')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div style={styles.videoInfo}>
                        <h3 style={styles.videoCardTitle}>{video.coupleName}</h3>
                        <div style={styles.videoMeta}>
                          <span><FaEye /> {video.views.toLocaleString()} {t('videos.views')}</span>
                          <span><FaHeart /> {video.likes} {t('videos.likes')}</span>
                          <span><FaCalendar /> {new Date(video.date).toLocaleDateString()}</span>
                        </div>
                        
                        {supportCount > 0 && (
                          <div style={styles.supportStats}>
                            <span>❤️ {supportCount} {t('videos.supporters')}</span>
                            <span>💰 {supportTotal.toLocaleString()} RWF {t('videos.raised')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div style={styles.videoActions}>
                        <button onClick={() => handleLike(video.id)} style={styles.actionBtn}>
                          {likedVideos[video.id] ? <FaHeart style={{ color: "#ff4444" }} /> : <FaRegHeart />} {likedVideos[video.id] ? t('videos.liked') : t('videos.like')}
                        </button>
                        <button onClick={() => handleShare(video)} style={styles.actionBtn}>
                          <FaShare /> {t('videos.share')}
                        </button>
                        
                        {video.accessType === "support" ? (
                          <button 
                            onClick={() => handleSupportClick(video)} 
                            style={{ 
                              ...styles.actionBtn, 
                              ...(canSupportUser ? styles.supportBtn : styles.supportBtnDisabled),
                              marginLeft: "auto"
                            }}
                            disabled={!canSupportUser}
                          >
                            {!isLoggedIn ? "🔒 " + t('videos.loginToSupport') : !canSupportUser ? "🔒 " + t('videos.onlyClientsCanSupport') : isAlreadyPurchased ? "▶ " + t('videos.watch') : "❤️ " + t('videos.support')}
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              incrementVideoViews(video.id);
                              window.open(video.videoUrl, "_blank");
                            }} 
                            style={{ ...styles.actionBtn, marginLeft: "auto", background: "#ffc107", color: BLK, fontWeight: 600, borderRadius: 20, padding: "6px 14px" }}
                          >
                            ▶ {t('videos.watchFree')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        {/* Support Modal */}
        {showSupportModal && selectedVideo && (
          <div style={styles.modal} onClick={() => setShowSupportModal(false)}>
            <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>❤️</div>
              <h2 style={styles.modalTitle}>{t('videos.supportTitle', { coupleName: selectedVideo.coupleName })}</h2>
              <p style={styles.modalText}>
                {t('videos.supportDescription')}<br/>
                <strong style={{ color: "#ffc107" }}>{t('videos.supportSplit')}</strong>
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>{t('videos.supportAmount')}</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" }}>
                  {[2000, 5000, 10000, 20000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setSupportAmount(amount)}
                      style={{
                        ...styles.amountBtn,
                        background: supportAmount === amount ? "#ffc107" : cardBg,
                        color: supportAmount === amount ? BLK : textColor,
                        border: `1.5px solid ${supportAmount === amount ? "#ffc107" : borderColor}`
                      }}
                    >
                      {amount.toLocaleString()} RWF
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder={t('videos.customAmount')}
                  value={supportAmount}
                  onChange={e => setSupportAmount(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>{t('videos.paymentMethod')}</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="paymentMethod" value="mtn" checked={paymentMethod === "mtn"} onChange={() => setPaymentMethod("mtn")} style={{ width: "16px", height: "16px" }} />
                    <span>📱 MTN Mobile Money</span>
                  </label>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="paymentMethod" value="airtel" checked={paymentMethod === "airtel"} onChange={() => setPaymentMethod("airtel")} style={{ width: "16px", height: "16px" }} />
                    <span>📱 Airtel Money</span>
                  </label>
                </div>
              </div>

              <div style={styles.revenueInfo}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>💑 {t('videos.coupleReceives')} (60%):</span>
                  <span style={styles.splitAmount}>{(supportAmount * 0.6).toLocaleString()} RWF</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>🏢 {t('videos.platformFee')} (40%):</span>
                  <span style={styles.splitAmount}>{(supportAmount * 0.4).toLocaleString()} RWF</span>
                </div>
              </div>

              <div style={{ marginBottom: "15px", fontSize: "11px", color: textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <FaWhatsapp style={{ color: "#25D366" }} />
                <span>{t('videos.whatsappSupport')}: +250 780 145 562</span>
              </div>

              <button onClick={handleSupportVideo} disabled={isProcessing} style={styles.btnPrimary}>
                {isProcessing ? t('videos.processing') : `${t('videos.support')} ${supportAmount.toLocaleString()} RWF`}
              </button>
              <button onClick={() => setShowSupportModal(false)} style={{ ...styles.btnOutline, marginTop: "12px" }}>{t('common.cancel')}</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}