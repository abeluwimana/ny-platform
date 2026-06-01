// src/pages/Videos.jsx
import { useEffect, useState } from "react";
import { FaCalendar, FaEye, FaHeart, FaRegHeart, FaSearch, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";

// ─── CONSTANTS ─────────────────────────────────────────────────────
const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

// ✅ ALL EVENT TYPES - not just weddings
const CATEGORIES = [
  { id: "all", label: "All Videos", icon: "🎬" },
  { id: "wedding", label: "Weddings", icon: "💍" },
  { id: "dote", label: "DOTE Ceremony", icon: "🪘" },
  { id: "birthday", label: "Birthday Parties", icon: "🎂" },
  { id: "funeral", label: "Funeral Ceremonies", icon: "🕊️" },
  { id: "graduation", label: "Graduations", icon: "🎓" },
  { id: "corporate", label: "Corporate Events", icon: "🏢" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First", icon: "📅" },
  { value: "popular", label: "Most Popular", icon: "🔥" },
  { value: "oldest", label: "Oldest First", icon: "📅" },
  { value: "most_viewed", label: "Most Viewed", icon: "👁️" },
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
  setTimeout(() => el.remove(), 2500);
};

// ─── HELPER: Get event icon and label ──────────────────────────────
const getEventInfo = (type) => {
  const types = {
    wedding: { icon: "💍", label: "Wedding" },
    dote: { icon: "🪘", label: "DOTE Ceremony" },
    birthday: { icon: "🎂", label: "Birthday Party" },
    funeral: { icon: "🕊️", label: "Funeral Ceremony" },
    graduation: { icon: "🎓", label: "Graduation" },
    corporate: { icon: "🏢", label: "Corporate Event" },
  };
  return types[type] || { icon: "🎬", label: "Event" };
};

// ─── COMPONENT ─────────────────────────────────────────────────────
export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    loadVideos();
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

  const loadVideos = () => {
    const allVideos = [];
    
    // 1. Load videos from wedding couples (wedding events)
    const couples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    couples.forEach(couple => {
      if (couple.events) {
        Object.entries(couple.events).forEach(([eventType, event]) => {
          if (event.video) {
            allVideos.push({
              id: `${couple.id}-${eventType}`,
              coupleId: couple.id,
              coupleName: couple.couple || couple.name,
              title: event.title || eventType,
              eventType: eventType === "dote" ? "dote" : eventType === "church" ? "wedding" : eventType === "reception" ? "wedding" : "wedding",
              displayType: eventType === "dote" ? "dote" : "wedding",
              icon: eventType === "dote" ? "🪘" : "💍",
              typeLabel: eventType === "dote" ? "DOTE Ceremony" : eventType === "church" ? "Church Wedding" : eventType === "reception" ? "Reception" : "Wedding",
              image: event.image || couple.image || "https://via.placeholder.com/400x250?text=Event",
              videoUrl: event.video,
              views: Math.floor(Math.random() * 5000) + 100,
              likes: Math.floor(Math.random() * 300) + 10,
              date: couple.weddingDate || couple.createdAt || new Date().toISOString(),
              source: "couple"
            });
          }
        });
      }
    });

    // 2. Load videos from creators (approved only) - supports all event types
    const creatorVideos = JSON.parse(localStorage.getItem("creator_videos") || "[]");
    const approvedCreatorVideos = creatorVideos.filter(v => v.status === "published");
    approvedCreatorVideos.forEach(video => {
      const coupleId = video.coupleName?.toLowerCase().replace(/\s+/g, "-") || `creator-${video.id}`;
      const eventInfo = getEventInfo(video.eventType);
      
      allVideos.push({
        id: `creator-${video.id}`,
        coupleId: coupleId,
        coupleName: video.coupleName,
        title: video.title,
        eventType: video.eventType || "wedding",
        displayType: video.eventType || "wedding",
        icon: eventInfo.icon,
        typeLabel: eventInfo.label,
        image: video.thumbnail || "https://via.placeholder.com/400x250?text=Event+Video",
        videoUrl: video.videoUrl,
        views: video.views || Math.floor(Math.random() * 3000) + 50,
        likes: video.likes || Math.floor(Math.random() * 200) + 5,
        date: video.createdAt || new Date().toISOString(),
        source: "creator",
        creatorName: video.creatorName
      });
    });

    // 3. Load sample videos for other event types (Birthday, Funeral, Graduation, Corporate)
    // These would normally come from a database, but for demo we add samples
    const sampleEvents = [
      { coupleName: "Kevin Mugisha", title: "30th Birthday Celebration", eventType: "birthday", icon: "🎂", label: "Birthday Party", image: "https://picsum.photos/seed/birthday1/400/250", views: 1240, date: "2026-05-10" },
      { coupleName: "Mukamana Family", title: "Memorial Tribute", eventType: "funeral", icon: "🕊️", label: "Funeral Ceremony", image: "https://picsum.photos/seed/funeral1/400/250", views: 890, date: "2026-05-05" },
      { coupleName: "INES University", title: "Graduation Ceremony 2026", eventType: "graduation", icon: "🎓", label: "Graduation", image: "https://picsum.photos/seed/grad1/400/250", views: 3450, date: "2026-04-28" },
      { coupleName: "Kigali International", title: "Annual Conference 2026", eventType: "corporate", icon: "🏢", label: "Corporate Event", image: "https://picsum.photos/seed/corp1/400/250", views: 2100, date: "2026-04-15" },
    ];
    
    sampleEvents.forEach(event => {
      allVideos.push({
        id: `sample-${event.eventType}`,
        coupleId: event.coupleName.toLowerCase().replace(/\s+/g, "-"),
        coupleName: event.coupleName,
        title: event.title,
        eventType: event.eventType,
        displayType: event.eventType,
        icon: event.icon,
        typeLabel: event.label,
        image: event.image,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: event.views,
        likes: Math.floor(Math.random() * 200) + 10,
        date: event.date,
        source: "sample"
      });
    });

    allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
    setVideos(allVideos);
    setLoading(false);
  };

  const filterAndSortVideos = () => {
    let result = [...videos];

    if (category !== "all") {
      result = result.filter(v => v.eventType === category || v.displayType === category);
    }

    if (searchTerm) {
      result = result.filter(v => 
        v.coupleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleLike = (videoId) => {
    setLikedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
    toast(likedVideos[videoId] ? "Removed like" : "Liked video!");
  };

  const handleShare = async (video) => {
    const url = `${window.location.origin}/wedding/${video.coupleId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("🔗 Link copied to clipboard!");
    } catch (err) {
      toast("Press Ctrl+C to copy link");
    }
  };

  const getCategoryLabel = () => {
    const found = CATEGORIES.find(c => c.id === category);
    return found ? found.label : "All Videos";
  };

  const getCategoryIcon = () => {
    const found = CATEGORIES.find(c => c.id === category);
    return found ? found.icon : "🎬";
  };

  const trendingVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5);
  const recentVideos = [...videos].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);

  // ─── CSS for animations ──────────────────────────────────────────
  const css = `
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .card-animate { animation: fadeIn 0.35s ease both; }
    .card-animate:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
    .video-card:hover .play-overlay { opacity: 1 !important; }
    .video-card:hover .video-image { transform: scale(1.05) !important; }
    input:focus, select:focus { border-color: ${Y} !important; box-shadow: 0 0 0 3px rgba(255,193,7,0.15) !important; outline:none; }
    
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
    
    .mobile-menu-btn { display: none; position: fixed; bottom: 20px; right: 20px; background: ${Y}; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; z-index: 1001; box-shadow: 0 4px 12px rgba(0,0,0,0.15); align-items: center; justify-content: center; }
    .close-sidebar { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; }
  `;

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

  // ─── STYLES ─────────────────────────────────────────────────────
  const styles = {
    container: { minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", transition: "all 0.3s ease" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: Y, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    hero: { background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)`, color: WHT, padding: "60px 24px", textAlign: "center", position: "relative", overflow: "hidden" },
    heroTitle: { fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, marginBottom: 16, color: WHT, lineHeight: 1.2 },
    heroSubtitle: { fontSize: "clamp(14px, 4vw, 18px)", color: "rgba(255,255,255,0.8)", maxWidth: 600, margin: "0 auto" },
    statsBar: { background: cardBg, borderBottom: `1px solid ${borderColor}`, padding: "16px 24px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16, maxWidth: 1000, margin: "0 auto" },
    statCard: { textAlign: "center", padding: "12px" },
    statValue: { fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: Y, marginBottom: 4 },
    statLabel: { fontSize: "clamp(11px, 3vw, 13px)", color: textMuted },
    mainGrid: { maxWidth: 1400, margin: "0 auto", padding: "40px 20px", display: "grid", gridTemplateColumns: "minmax(260px, 300px) 1fr", gap: 32, alignItems: "start" },
    sidebar: { background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "20px", position: "sticky", top: 20 },
    sidebarTitle: { fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 700, marginBottom: 16, paddingLeft: 10, borderLeft: `3px solid ${Y}` },
    searchBox: { display: "flex", alignItems: "center", border: `1px solid ${borderColor}`, borderRadius: 10, padding: "10px 14px", background: darkMode ? "#333" : "#fafafa" },
    searchIcon: { color: textMuted, marginRight: 10 },
    searchInput: { flex: 1, border: "none", outline: "none", background: "transparent", color: textColor, fontSize: 14 },
    categoryList: { display: "flex", flexDirection: "column", gap: 8 },
    categoryBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "transparent", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, color: textMuted, transition: "all 0.2s", width: "100%" },
    categoryActive: { background: `${Y}20`, color: Y, fontWeight: 600 },
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
    videoCard: { background: cardBg, borderRadius: 16, overflow: "hidden", border: `1px solid ${borderColor}`, transition: "all 0.25s" },
    videoImageWrapper: { position: "relative", overflow: "hidden", aspectRatio: "16/9" },
    videoImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" },
    playOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s" },
    playButton: { width: 50, height: 50, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", color: BLK, fontSize: 20, cursor: "pointer" },
    videoType: { position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.7)", color: WHT, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
    creatorBadge: { position: "absolute", bottom: 12, right: 12, background: Y, color: BLK, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700 },
    videoInfo: { padding: "14px 16px" },
    videoCardTitle: { fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 6, lineHeight: 1.4 },
    videoMeta: { display: "flex", gap: 16, fontSize: 12, color: textMuted, marginBottom: 10 },
    videoActions: { display: "flex", gap: 16, padding: "12px 16px 16px", borderTop: `1px solid ${borderColor}` },
    actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: textMuted, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" },
    noResults: { textAlign: "center", padding: "60px 20px", background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}` },
    noResultsIcon: { fontSize: 64, marginBottom: 20 },
    resetBtn: { marginTop: 16, padding: "10px 24px", background: Y, color: BLK, border: "none", borderRadius: 30, cursor: "pointer", fontWeight: 600 }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 50, height: 50, border: `4px solid ${borderColor}`, borderTop: `4px solid ${Y}`, borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 20 }} />
        <p style={{ color: textMuted }}>Loading videos...</p>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div style={styles.container}>
        
        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode} style={styles.darkModeBtn}>{darkMode ? "☀️" : "🌙"}</button>
        
        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* ─── HERO SECTION ─── */}
        <div style={styles.hero}>
          <h1 className="hero-title" style={styles.heroTitle}>🎬 Event Videos Gallery</h1>
          <p style={styles.heroSubtitle}>Watch beautiful moments from weddings, birthdays, funerals, graduations & corporate events across Rwanda</p>
        </div>

        {/* ─── STATS BAR ─── */}
        <div style={styles.statsBar}>
          <div className="stats-grid" style={styles.statsGrid}>
            <div style={styles.statCard}><div style={styles.statValue}>{videos.length}</div><div style={styles.statLabel}>Total Videos</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{totalViews.toLocaleString()}</div><div style={styles.statLabel}>Total Views</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{CATEGORIES.length - 1}</div><div style={styles.statLabel}>Categories</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{trendingVideos.length}</div><div style={styles.statLabel}>Trending</div></div>
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="main-grid" style={styles.mainGrid}>

          {/* ─── SIDEBAR ─── */}
          <aside className="sidebar" style={styles.sidebar}>
            <button className="close-sidebar" onClick={() => setMobileMenuOpen(false)} style={{ display: 'none' }}>✕</button>
            
            {/* Search */}
            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>🔍 Search</div>
              <div style={styles.searchBox}>
                <FaSearch style={styles.searchIcon} />
                <input type="text" placeholder="Search by couple, event..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>📂 Categories</div>
              <div style={styles.categoryList}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ ...styles.categoryBtn, ...(category === cat.id ? styles.categoryActive : {}) }}>
                    <span>{cat.icon}</span> {cat.label}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: textMuted }}>{videos.filter(v => cat.id === "all" || v.eventType === cat.id || v.displayType === cat.id).length}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>🔀 Sort By</div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...styles.sortSelect, width: "100%" }}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                ))}
              </select>
            </div>

            {/* Trending */}
            {trendingVideos.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={styles.sidebarTitle}>🔥 Trending Now</div>
                {trendingVideos.map(video => (
                  <Link key={video.id} to={`/wedding/${video.coupleId}`} style={styles.trendingItem}>
                    <img src={video.image} alt={video.coupleName} style={styles.trendingImage} />
                    <div>
                      <div style={styles.trendingTitle}>{video.coupleName}</div>
                      <div style={styles.trendingViews}>{video.icon} {video.typeLabel} • {video.views.toLocaleString()} views</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Recent */}
            {recentVideos.length > 0 && (
              <div>
                <div style={styles.sidebarTitle}>🕐 Recent Uploads</div>
                {recentVideos.slice(0, 5).map(video => (
                  <Link key={video.id} to={`/wedding/${video.coupleId}`} style={styles.trendingItem}>
                    <img src={video.image} alt={video.coupleName} style={styles.trendingImage} />
                    <div>
                      <div style={styles.trendingTitle}>{video.coupleName}</div>
                      <div style={styles.trendingViews}><FaCalendar /> {new Date(video.date).toLocaleDateString()}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Book CTA */}
            <div style={{ marginTop: 24, background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <h4 style={{ color: WHT, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Book Your Event</h4>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 12 }}>Professional coverage for all events</p>
              <Link to="/booking">
                <button style={{ width: "100%", padding: "8px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Book Now →</button>
              </Link>
            </div>
          </aside>

          {/* ─── MAIN CONTENT ─── */}
          <main className="main-area" style={styles.mainArea}>

            {/* Video Header */}
            <div style={styles.videoHeader}>
              <div>
                <h2 style={styles.videoTitle}>{getCategoryIcon()} {getCategoryLabel()}</h2>
                <p style={styles.videoCount}>{filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} found</p>
              </div>
              {(searchTerm || category !== "all") && (
                <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", fontSize: 12, color: textMuted }}>
                  ✕ Clear filters
                </button>
              )}
            </div>

            {/* No Results */}
            {filteredVideos.length === 0 ? (
              <div style={styles.noResults}>
                <div style={styles.noResultsIcon}>🎬</div>
                <h3 style={{ marginBottom: 8 }}>No videos found</h3>
                <p style={{ color: textMuted }}>Try adjusting your search or category filter</p>
                <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={styles.resetBtn}>Clear Filters</button>
              </div>
            ) : (
              <div className="videos-grid" style={styles.videosGrid}>
                {filteredVideos.map(video => (
                  <div key={video.id} className="video-card card-animate" style={styles.videoCard}>
                    <Link to={`/wedding/${video.coupleId}`} style={{ textDecoration: "none" }}>
                      <div style={styles.videoImageWrapper}>
                        <img src={video.image} alt={video.coupleName} className="video-image" style={styles.videoImage} />
                        <div className="play-overlay" style={styles.playOverlay}>
                          <div style={styles.playButton}>▶</div>
                        </div>
                        <div style={styles.videoType}>{video.icon} {video.typeLabel}</div>
                        {video.source === "creator" && <div style={styles.creatorBadge}>🎬 Creator</div>}
                      </div>
                      <div style={styles.videoInfo}>
                        <h3 style={styles.videoCardTitle}>{video.coupleName}</h3>
                        <div style={styles.videoMeta}>
                          <span><FaEye /> {video.views.toLocaleString()} views</span>
                          <span><FaHeart /> {video.likes} likes</span>
                          <span><FaCalendar /> {new Date(video.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                    <div style={styles.videoActions}>
                      <button onClick={() => handleLike(video.id)} style={styles.actionBtn}>
                        {likedVideos[video.id] ? <FaHeart style={{ color: "#ff4444" }} /> : <FaRegHeart />} {likedVideos[video.id] ? "Liked" : "Like"}
                      </button>
                      <button onClick={() => handleShare(video)} style={styles.actionBtn}>
                        <FaShare /> Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}