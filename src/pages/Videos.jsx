// src/pages/Videos.jsx
import { useEffect, useState } from "react";
import { FaCalendar, FaEye, FaHeart, FaRegHeart, FaSearch, FaShare } from "react-icons/fa";
import { Link } from "react-router-dom";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState({});

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, category, searchTerm, sortBy]);

  const loadVideos = () => {
    const allVideos = [];
    
    // 1. Load videos from wedding couples (DOTE, Church, Reception)
    const couples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    couples.forEach(couple => {
      if (couple.events) {
        Object.entries(couple.events).forEach(([type, event]) => {
          if (event.video) {
            allVideos.push({
              id: `${couple.id}-${type}`,
              coupleId: couple.id,
              coupleName: couple.couple || couple.name,
              title: event.title || type,
              type: type,
              typeIcon: type === "dote" ? "🪘" : type === "church" ? "⛪" : "🎉",
              image: event.image || couple.image || "https://via.placeholder.com/400x250?text=Wedding",
              videoUrl: event.video,
              views: Math.floor(Math.random() * 5000) + 100,
              date: couple.createdAt || new Date().toISOString(),
              source: "couple"
            });
          }
        });
      }
    });

    // 2. Load videos from creators (approved only)
    const creatorVideos = JSON.parse(localStorage.getItem("creator_videos") || "[]");
    const approvedCreatorVideos = creatorVideos.filter(v => v.status === "published");
    approvedCreatorVideos.forEach(video => {
      // Create a valid coupleId from coupleName
      const coupleId = video.coupleName?.toLowerCase().replace(/\s+/g, "-") || `creator-${video.id}`;
      
      allVideos.push({
        id: `creator-${video.id}`,
        coupleId: coupleId,
        coupleName: video.coupleName,
        title: video.title,
        type: video.eventType || "dote",
        typeIcon: video.eventType === "dote" ? "🪘" : video.eventType === "church" ? "⛪" : "🎉",
        image: video.thumbnail || "https://via.placeholder.com/400x250?text=Wedding+Video",
        videoUrl: video.videoUrl,
        views: video.views || Math.floor(Math.random() * 3000) + 50,
        date: video.createdAt || new Date().toISOString(),
        source: "creator",
        creatorName: video.creatorName
      });
    });

    // Sort by date (newest first)
    allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
    setVideos(allVideos);
    setLoading(false);
  };

  const filterAndSortVideos = () => {
    let result = [...videos];

    if (category !== "all") {
      result = result.filter(v => v.type === category);
    }

    if (searchTerm) {
      result = result.filter(v => 
        v.coupleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "popular") {
      result.sort((a, b) => b.views - a.views);
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredVideos(result);
  };

  const handleLike = (videoId) => {
    setLikedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  const handleShare = (video) => {
    const url = `${window.location.origin}/wedding/${video.coupleId}`;
    navigator.clipboard.writeText(url);
    alert("Link copied! Share with friends.");
  };

  const getCategoryIcon = () => {
    if (category === "dote") return "🪘";
    if (category === "church") return "⛪";
    if (category === "reception") return "🎉";
    return "🎬";
  };

  const trendingVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 3);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading wedding videos...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🎬 Wedding Videos Gallery</h1>
        <p style={styles.heroSubtitle}>Click on any video to watch the full wedding story</p>
      </div>

      <div style={styles.mainContent}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>🔍 Search Videos</h3>
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />
              <input type="text" placeholder="Search by couple name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>📂 Categories</h3>
            <div style={styles.categoryList}>
              <button onClick={() => setCategory("all")} style={category === "all" ? styles.categoryActive : styles.categoryBtn}>🎬 All Videos</button>
              <button onClick={() => setCategory("dote")} style={category === "dote" ? styles.categoryActive : styles.categoryBtn}>🪘 DOTE Ceremony</button>
              <button onClick={() => setCategory("church")} style={category === "church" ? styles.categoryActive : styles.categoryBtn}>⛪ Church Wedding</button>
              <button onClick={() => setCategory("reception")} style={category === "reception" ? styles.categoryActive : styles.categoryBtn}>🎉 Reception Party</button>
            </div>
          </div>

          {trendingVideos.length > 0 && (
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>🔥 Trending Now</h3>
              {trendingVideos.map(video => (
                <Link key={video.id} to={`/wedding/${video.coupleId}`} style={styles.trendingItem}>
                  <img src={video.image} alt={video.coupleName} style={styles.trendingImage} />
                  <div>
                    <div style={styles.trendingTitle}>{video.coupleName}</div>
                    <div style={styles.trendingViews}>{video.views.toLocaleString()} views</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>

        <main style={styles.mainArea}>
          <div style={styles.videoHeader}>
            <div>
              <h2 style={styles.videoTitle}>{getCategoryIcon()} {category === "all" ? "All Videos" : category === "dote" ? "DOTE Ceremony" : category === "church" ? "Church Wedding" : "Reception Party"}</h2>
              <p style={styles.videoCount}>{filteredVideos.length} videos found</p>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.sortSelect}>
              <option value="newest">📅 Newest First</option>
              <option value="popular">🔥 Most Popular</option>
              <option value="oldest">📅 Oldest First</option>
            </select>
          </div>

          {filteredVideos.length === 0 ? (
            <div style={styles.noResults}>
              <div style={styles.noResultsIcon}>🎬</div>
              <h3>No videos found</h3>
              <p>Try adjusting your search or category filter</p>
              <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={styles.resetBtn}>Clear Filters</button>
            </div>
          ) : (
            <div style={styles.videosGrid}>
              {filteredVideos.map(video => (
                <div key={video.id} style={styles.videoCard}>
                  <Link to={`/wedding/${video.coupleId}`} style={{ textDecoration: "none" }}>
                    <div style={styles.videoImageWrapper}>
                      <img src={video.image} alt={video.coupleName} style={styles.videoImage} />
                      <div style={styles.playOverlay}>
                        <div style={styles.playButton}>▶</div>
                      </div>
                      <div style={styles.videoType}>{video.typeIcon} {video.title}</div>
                      {video.source === "creator" && (
                        <div style={styles.creatorBadge}>🎬 Creator</div>
                      )}
                    </div>
                    <div style={styles.videoInfo}>
                      <h3 style={styles.videoCardTitle}>{video.coupleName}</h3>
                      <div style={styles.videoMeta}>
                        <span><FaEye /> {video.views.toLocaleString()} views</span>
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
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5" },
  loadingContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  spinner: { width: "50px", height: "50px", border: "4px solid #ddd", borderTop: "4px solid #000", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" },
  hero: { background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff", padding: "60px 20px", textAlign: "center" },
  heroTitle: { fontSize: "42px", marginBottom: "15px", fontWeight: "bold" },
  heroSubtitle: { fontSize: "18px", opacity: 0.9 },
  mainContent: { maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "40px", flexWrap: "wrap" },
  sidebar: { flex: "1", minWidth: "280px" },
  mainArea: { flex: "3", minWidth: "300px" },
  sidebarCard: { background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  sidebarTitle: { fontSize: "18px", marginBottom: "15px", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  searchBox: { display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 12px" },
  searchIcon: { color: "#999", marginRight: "10px" },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: "14px" },
  categoryList: { display: "flex", flexDirection: "column", gap: "10px" },
  categoryBtn: { padding: "10px 15px", background: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer", textAlign: "left" },
  categoryActive: { padding: "10px 15px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", textAlign: "left" },
  trendingItem: { display: "flex", gap: "12px", padding: "10px 0", borderBottom: "1px solid #eee", textDecoration: "none", color: "inherit" },
  trendingImage: { width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" },
  trendingTitle: { fontSize: "14px", fontWeight: "bold", marginBottom: "4px" },
  trendingViews: { fontSize: "11px", color: "#999" },
  videoHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
  videoTitle: { fontSize: "24px", color: "#333", marginBottom: "5px" },
  videoCount: { color: "#666", fontSize: "14px" },
  sortSelect: { padding: "10px 15px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer" },
  videosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
  videoCard: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "transform 0.3s" },
  videoImageWrapper: { position: "relative", cursor: "pointer" },
  videoImage: { width: "100%", height: "200px", objectFit: "cover", transition: "transform 0.3s" },
  playOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s" },
  playButton: { width: "60px", height: "60px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" },
  videoType: { position: "absolute", top: "10px", left: "10px", background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "11px" },
  creatorBadge: { position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.7)", color: "#ffc107", padding: "3px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" },
  videoInfo: { padding: "15px" },
  videoCardTitle: { fontSize: "18px", marginBottom: "8px", color: "#333" },
  videoMeta: { display: "flex", gap: "15px", fontSize: "12px", color: "#999" },
  videoActions: { display: "flex", gap: "15px", padding: "10px 15px 15px", borderTop: "1px solid #eee" },
  actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "5px" },
  noResults: { textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" },
  noResultsIcon: { fontSize: "64px", marginBottom: "20px" },
  resetBtn: { marginTop: "15px", padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default Videos;