// src/pages/creator/CreatorDashboard.jsx
import { useEffect, useState } from "react";
import { FaCalendar, FaDollarSign, FaEdit, FaEye, FaHeart, FaImage, FaTrash, FaUpload, FaUserFriends, FaVideo } from "react-icons/fa";

function CreatorDashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [darkMode, setDarkMode] = useState(false);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: "", coupleName: "", eventType: "dote", videoUrl: "", thumbnail: null, description: ""
  });
  const [postForm, setPostForm] = useState({
    title: "", content: "", category: "wedding", image: null
  });
  const [galleryForm, setGalleryForm] = useState({
    title: "", images: [], category: "wedding"
  });
  const [profileForm, setProfileForm] = useState({
    bio: "", skills: "", experience: "", instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "", twitter: ""
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", coupleName: "", eventType: "dote", videoUrl: "", thumbnail: null, description: "" });
  const [editThumbnailPreview, setEditThumbnailPreview] = useState(null);
  
  // Calendar/Events
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    
    const loggedIn = localStorage.getItem("user_logged_in");
    const role = localStorage.getItem("user_role");
    
    if (!loggedIn || role !== "creator") {
      window.location.href = "/login";
      return;
    }
    
    loadUser();
    loadVideos();
    loadPosts();
    loadGallery();
    loadClients();
    loadNotifications();
    loadUpcomingEvents();
    loadProfileData();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
    addNotification("Theme changed", `Dark mode ${newMode ? "enabled" : "disabled"}`, "info");
  };

  const addNotification = (title, message, type = "info") => {
    const newNotif = { id: Date.now(), title, message, type, read: false, time: new Date().toISOString() };
    setNotifications([newNotif, ...notifications.slice(0, 49)]);
    localStorage.setItem("creator_notifications", JSON.stringify([newNotif, ...notifications.slice(0, 49)]));
  };

  const loadUser = () => {
    const name = localStorage.getItem("user_name");
    const email = localStorage.getItem("user_email");
    setUser({ name, email });
    setLoading(false);
  };

  const loadProfileData = () => {
    const stored = JSON.parse(localStorage.getItem("creator_profile") || "{}");
    setProfileForm({
      bio: stored.bio || "",
      skills: stored.skills || "",
      experience: stored.experience || "",
      instagram: stored.instagram || "",
      tiktok: stored.tiktok || "",
      youtube: stored.youtube || "",
      facebook: stored.facebook || "",
      whatsapp: stored.whatsapp || "",
      twitter: stored.twitter || ""
    });
  };

  const saveProfile = () => {
    localStorage.setItem("creator_profile", JSON.stringify(profileForm));
    addNotification("Profile updated", "Your profile has been successfully updated", "success");
    setShowProfileModal(false);
    alert("✅ Profile saved!");
  };

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Passwords don't match!");
      return;
    }
    if (passwordForm.new.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    addNotification("Password changed", "Your password has been updated", "success");
    setShowPasswordForm(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
    alert("✅ Password changed!");
  };

  const loadVideos = () => {
    const stored = JSON.parse(localStorage.getItem("creator_videos") || "[]");
    setVideos(stored);
  };

  const loadPosts = () => {
    const stored = JSON.parse(localStorage.getItem("creator_posts") || "[]");
    setPosts(stored);
  };

  const loadGallery = () => {
    const stored = JSON.parse(localStorage.getItem("creator_gallery") || "[]");
    setGallery(stored);
  };

  const loadClients = () => {
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const creatorEmail = localStorage.getItem("user_email");
    const assigned = allBookings.filter(b => b.assignedCreator === creatorEmail || b.creatorId === creatorEmail);
    setClients(assigned);
  };

  const loadNotifications = () => {
    const stored = JSON.parse(localStorage.getItem("creator_notifications") || "[]");
    setNotifications(stored);
  };

  const loadUpcomingEvents = () => {
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const creatorEmail = localStorage.getItem("user_email");
    const assigned = allBookings.filter(b => (b.assignedCreator === creatorEmail || b.creatorId === creatorEmail) && b.status === "confirmed");
    const today = new Date();
    const upcoming = assigned.filter(b => new Date(b.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
    setUpcomingEvents(upcoming);
  };

  const saveVideos = (updatedVideos) => {
    localStorage.setItem("creator_videos", JSON.stringify(updatedVideos));
    setVideos(updatedVideos);
  };

  const savePosts = (updatedPosts) => {
    localStorage.setItem("creator_posts", JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const saveGallery = (updatedGallery) => {
    localStorage.setItem("creator_gallery", JSON.stringify(updatedGallery));
    setGallery(updatedGallery);
  };

  const updateCoupleWithVideo = (coupleName, eventType, videoUrl, thumbnail) => {
    const coupleId = coupleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const existingCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    let existingCouple = existingCouples.find(c => c.id === coupleId);
    
    if (!existingCouple) {
      const newCouple = {
        id: coupleId,
        couple: coupleName,
        name: coupleName,
        location: "Rwanda",
        image: thumbnail || "",
        events: { dote: { title: "DOTE", image: "", video: "" }, church: { title: "Church", image: "", video: "" }, reception: { title: "Reception", image: "", video: "" } }
      };
      newCouple.events[eventType].video = videoUrl;
      newCouple.events[eventType].image = thumbnail || "";
      existingCouples.push(newCouple);
      localStorage.setItem("wedding_couples", JSON.stringify(existingCouples));
    } else {
      existingCouple.events[eventType].video = videoUrl;
      if (thumbnail) existingCouple.events[eventType].image = thumbnail;
      localStorage.setItem("wedding_couples", JSON.stringify(existingCouples));
    }
    return coupleId;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
        setUploadForm({ ...uploadForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreview(prev => [...prev, reader.result]);
          setGalleryForm({ ...galleryForm, images: [...galleryForm.images, reader.result] });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handlePostImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPostForm({ ...postForm, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleUpload = () => {
    if (!uploadForm.title || !uploadForm.coupleName || !uploadForm.videoUrl) {
      alert("Please fill all required fields");
      return;
    }
    const finalUrl = convertToEmbedUrl(uploadForm.videoUrl);
    if (!finalUrl.includes("youtube.com/embed/")) {
      alert("Invalid YouTube URL");
      return;
    }
    updateCoupleWithVideo(uploadForm.coupleName, uploadForm.eventType, finalUrl, uploadForm.thumbnail);
    const newVideo = {
      id: Date.now(), ...uploadForm, videoUrl: finalUrl,
      coupleId: uploadForm.coupleName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      creatorId: user?.email, creatorName: user?.name, views: 0, likes: 0, status: "pending", createdAt: new Date().toISOString()
    };
    saveVideos([...videos, newVideo]);
    addNotification("Video uploaded", `${uploadForm.title} is pending admin approval`, "success");
    setShowUploadModal(false);
    setUploadForm({ title: "", coupleName: "", eventType: "dote", videoUrl: "", thumbnail: null, description: "" });
    setThumbnailPreview(null);
    alert("✅ Video uploaded! Waiting for admin approval.");
  };

  const handlePostSubmit = () => {
    if (!postForm.title || !postForm.content) {
      alert("Please fill title and content");
      return;
    }
    if (editingPost) {
      const updated = posts.map(p => p.id === editingPost.id ? { ...p, ...postForm, updatedAt: new Date().toISOString() } : p);
      savePosts(updated);
      addNotification("Post updated", postForm.title, "success");
    } else {
      const newPost = { id: Date.now(), ...postForm, author: user?.name, views: 0, likes: 0, comments: [], createdAt: new Date().toISOString() };
      savePosts([newPost, ...posts]);
      addNotification("Post created", postForm.title, "success");
    }
    setShowPostModal(false);
    setPostForm({ title: "", content: "", category: "wedding", image: null });
    setEditingPost(null);
    alert("✅ Post saved!");
  };

  const handleGallerySubmit = () => {
    if (!galleryForm.title || galleryForm.images.length === 0) {
      alert("Please add title and at least one image");
      return;
    }
    const newAlbum = { id: Date.now(), ...galleryForm, createdAt: new Date().toISOString() };
    saveGallery([newAlbum, ...gallery]);
    addNotification("Gallery created", galleryForm.title, "success");
    setShowGalleryModal(false);
    setGalleryForm({ title: "", images: [], category: "wedding" });
    setGalleryPreview([]);
    alert("✅ Gallery created!");
  };

  const deletePost = (id) => {
    if (window.confirm("Delete this post?")) {
      savePosts(posts.filter(p => p.id !== id));
      addNotification("Post deleted", "Post has been removed", "info");
      alert("Post deleted!");
    }
  };

  const deleteGallery = (id) => {
    if (window.confirm("Delete this gallery?")) {
      saveGallery(gallery.filter(g => g.id !== id));
      alert("Gallery deleted!");
    }
  };

  const deleteVideo = (id) => {
    if (window.confirm("Delete this video?")) {
      saveVideos(videos.filter(v => v.id !== id));
      addNotification("Video deleted", "Video has been removed", "info");
      alert("Video deleted!");
    }
  };

  const markNotificationRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("creator_notifications", JSON.stringify(updated));
  };

  const stats = {
    totalVideos: videos.length,
    totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
    totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0),
    totalEarnings: videos.reduce((sum, v) => sum + ((v.views || 0) * 5), 0),
    pendingVideos: videos.filter(v => v.status === "pending").length,
    publishedVideos: videos.filter(v => v.status === "published").length,
    totalPosts: posts.length,
    totalGallery: gallery.length,
    totalClients: clients.length
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#ddd";
  const primaryColor = "#ffc107";

  const styles = {
    container: { minHeight: "100vh", background: bgColor, padding: "40px", transition: "all 0.3s ease" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: primaryColor, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999 },
    header: { marginBottom: "30px" },
    title: { fontSize: "32px", color: textColor, marginBottom: "10px" },
    subtitle: { color: textMuted },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "30px" },
    statCard: { background: cardBg, padding: "20px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "15px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
    statIcon: { fontSize: "28px", color: primaryColor },
    statValue: { fontSize: "24px", fontWeight: "bold", color: textColor },
    statLabel: { fontSize: "12px", color: textMuted },
    tabs: { display: "flex", gap: "10px", marginBottom: "30px", borderBottom: `1px solid ${borderColor}`, paddingBottom: "10px", flexWrap: "wrap" },
    tab: { padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", color: textMuted, borderRadius: "8px" },
    activeTab: { padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", color: primaryColor, background: `${primaryColor}20`, borderRadius: "8px" },
    section: { background: cardBg, borderRadius: "16px", padding: "20px" },
    uploadBtn: { padding: "12px 24px", background: "#28a745", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" },
    emptyState: { textAlign: "center", padding: "60px", color: textMuted },
    emptyIcon: { fontSize: "64px", marginBottom: "20px" },
    videosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
    videoCard: { background: cardBg, borderRadius: "12px", overflow: "hidden", border: `1px solid ${borderColor}` },
    videoImage: { width: "100%", height: "180px", objectFit: "cover" },
    videoInfo: { padding: "15px" },
    videoTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "5px", color: textColor },
    videoMeta: { fontSize: "12px", color: textMuted, marginBottom: "10px" },
    videoStats: { fontSize: "11px", color: textMuted, marginBottom: "10px", display: "flex", gap: "10px" },
    statusBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "bold", display: "inline-block" },
    videoActions: { display: "flex", gap: "10px", marginTop: "10px" },
    editBtn: { padding: "6px 12px", background: primaryColor, border: "none", borderRadius: "5px", cursor: "pointer", color: "#000" },
    deleteBtn: { padding: "6px 12px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
    postsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
    postCard: { background: cardBg, borderRadius: "12px", padding: "15px", border: `1px solid ${borderColor}` },
    galleryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" },
    galleryImage: { width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" },
    clientCard: { background: cardBg, borderRadius: "12px", padding: "15px", marginBottom: "10px", border: `1px solid ${borderColor}` },
    notificationCard: { background: cardBg, borderRadius: "12px", padding: "15px", marginBottom: "10px", border: `1px solid ${borderColor}`, cursor: "pointer" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modalContent: { background: cardBg, padding: "30px", borderRadius: "16px", maxWidth: "550px", width: "90%", maxHeight: "85vh", overflowY: "auto" },
    label: { fontWeight: "bold", marginBottom: "8px", display: "block", marginTop: "15px", color: textColor },
    input: { width: "100%", padding: "10px", marginBottom: "15px", border: `1px solid ${borderColor}`, borderRadius: "8px", boxSizing: "border-box", background: darkMode ? "#333" : "#fff", color: textColor },
    textarea: { width: "100%", padding: "10px", marginBottom: "15px", border: `1px solid ${borderColor}`, borderRadius: "8px", fontFamily: "inherit", resize: "vertical", background: darkMode ? "#333" : "#fff", color: textColor },
    select: { width: "100%", padding: "10px", marginBottom: "15px", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", color: textColor },
    modalButtons: { display: "flex", gap: "10px", marginTop: "20px" },
    saveBtn: { flex: 1, padding: "10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
    cancelBtn: { flex: 1, padding: "10px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
    imageUploadArea: { border: `2px dashed ${borderColor}`, borderRadius: "12px", padding: "20px", textAlign: "center", background: darkMode ? "#2a2a2a" : "#fafafa", cursor: "pointer" },
    imagePreview: { width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" },
    eventCard: { background: cardBg, borderRadius: "12px", padding: "15px", marginBottom: "10px", border: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
    profileGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" },
    earningRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${borderColor}` },
    withdrawBtn: { padding: "12px 24px", background: "#007bff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "20px" }
  };

  if (loading) {
    return <div style={{ ...styles.container, display: "flex", justifyContent: "center", alignItems: "center" }}>Loading creator dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={toggleDarkMode} style={styles.darkModeBtn}>{darkMode ? "☀️" : "🌙"}</button>
      
      <div style={styles.header}>
        <h1 style={styles.title}>🎬 Creator Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user?.name}! Manage your wedding videos, posts, and gallery here.</p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statIcon}><FaVideo /></div><div><div style={styles.statValue}>{stats.totalVideos}</div><div style={styles.statLabel}>Total Videos</div></div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><FaEye /></div><div><div style={styles.statValue}>{stats.totalViews.toLocaleString()}</div><div style={styles.statLabel}>Total Views</div></div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><FaHeart /></div><div><div style={styles.statValue}>{stats.totalLikes.toLocaleString()}</div><div style={styles.statLabel}>Total Likes</div></div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><FaDollarSign /></div><div><div style={styles.statValue}>{stats.totalEarnings.toLocaleString()} RWF</div><div style={styles.statLabel}>Total Earnings</div></div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><FaCalendar /></div><div><div style={styles.statValue}>{stats.pendingVideos}</div><div style={styles.statLabel}>Pending Review</div></div></div>
        <div style={styles.statCard}><div style={styles.statIcon}><FaUserFriends /></div><div><div style={styles.statValue}>{stats.totalClients}</div><div style={styles.statLabel}>Active Clients</div></div></div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button onClick={() => setActiveTab("videos")} style={activeTab === "videos" ? styles.activeTab : styles.tab}>📹 Videos</button>
        <button onClick={() => setActiveTab("posts")} style={activeTab === "posts" ? styles.activeTab : styles.tab}>📝 Posts</button>
        <button onClick={() => setActiveTab("gallery")} style={activeTab === "gallery" ? styles.activeTab : styles.tab}>🖼️ Gallery</button>
        <button onClick={() => setActiveTab("clients")} style={activeTab === "clients" ? styles.activeTab : styles.tab}>👥 Clients</button>
        <button onClick={() => setActiveTab("calendar")} style={activeTab === "calendar" ? styles.activeTab : styles.tab}>📅 Calendar</button>
        <button onClick={() => setActiveTab("notifications")} style={activeTab === "notifications" ? styles.activeTab : styles.tab}>🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}</button>
        <button onClick={() => setActiveTab("analytics")} style={activeTab === "analytics" ? styles.activeTab : styles.tab}>📊 Analytics</button>
        <button onClick={() => setActiveTab("earnings")} style={activeTab === "earnings" ? styles.activeTab : styles.tab}>💰 Earnings</button>
        <button onClick={() => setActiveTab("profile")} style={activeTab === "profile" ? styles.activeTab : styles.tab}>👤 Profile</button>
      </div>

      {/* VIDEOS TAB */}
      {activeTab === "videos" && (
        <div style={styles.section}>
          <button onClick={() => setShowUploadModal(true)} style={styles.uploadBtn}><FaUpload /> Upload New Video</button>
          {videos.length === 0 ? (
            <div style={styles.emptyState}><div style={styles.emptyIcon}>🎬</div><h3>No Videos Yet</h3><p>Upload your first wedding video to get started.</p></div>
          ) : (
            <div style={styles.videosGrid}>
              {videos.map(video => (
                <div key={video.id} style={styles.videoCard}>
                  <img src={video.thumbnail || "https://via.placeholder.com/300x180?text=Wedding+Video"} alt={video.title} style={styles.videoImage} />
                  <div style={styles.videoInfo}>
                    <h3 style={styles.videoTitle}>{video.title}</h3>
                    <p style={styles.videoMeta}>{video.coupleName} • {video.eventType === "dote" ? "DOTE" : video.eventType === "church" ? "Church" : "Reception"}</p>
                    <p style={styles.videoStats}><FaEye /> {video.views || 0} views • <FaHeart /> {video.likes || 0} likes</p>
                    <span style={{ ...styles.statusBadge, background: video.status === "published" ? "#d4edda" : video.status === "rejected" ? "#f8d7da" : "#fff3cd", color: video.status === "published" ? "#155724" : video.status === "rejected" ? "#721c24" : "#856404" }}>
                      {video.status === "published" ? "✅ Published" : video.status === "rejected" ? "❌ Rejected" : "⏳ Pending Review"}
                    </span>
                    <div style={styles.videoActions}>
                      <button onClick={() => { setEditingVideo(video); setEditForm({ title: video.title, coupleName: video.coupleName, eventType: video.eventType, videoUrl: video.videoUrl, thumbnail: video.thumbnail, description: video.description || "" }); setEditThumbnailPreview(video.thumbnail); setShowEditModal(true); }} style={styles.editBtn}><FaEdit /> Edit</button>
                      <button onClick={() => deleteVideo(video.id)} style={styles.deleteBtn}><FaTrash /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POSTS TAB */}
      {activeTab === "posts" && (
        <div style={styles.section}>
          <button onClick={() => { setEditingPost(null); setPostForm({ title: "", content: "", category: "wedding", image: null }); setShowPostModal(true); }} style={styles.uploadBtn}><FaEdit /> Create New Post</button>
          {posts.length === 0 ? (
            <div style={styles.emptyState}><div style={styles.emptyIcon}>📝</div><h3>No Posts Yet</h3><p>Create your first post to share updates.</p></div>
          ) : (
            <div style={styles.postsGrid}>
              {posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  {post.image && <img src={post.image} alt={post.title} style={styles.videoImage} />}
                  <h3 style={styles.videoTitle}>{post.title}</h3>
                  <p style={styles.videoMeta}>{post.category} • {new Date(post.createdAt).toLocaleDateString()}</p>
                  <p style={{ color: textMuted, fontSize: "13px" }}>{post.content.substring(0, 100)}...</p>
                  <div style={styles.videoActions}>
                    <button onClick={() => { setEditingPost(post); setPostForm({ title: post.title, content: post.content, category: post.category, image: post.image }); setShowPostModal(true); }} style={styles.editBtn}><FaEdit /> Edit</button>
                    <button onClick={() => deletePost(post.id)} style={styles.deleteBtn}><FaTrash /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GALLERY TAB */}
      {activeTab === "gallery" && (
        <div style={styles.section}>
          <button onClick={() => setShowGalleryModal(true)} style={styles.uploadBtn}><FaImage /> Create New Gallery</button>
          {gallery.length === 0 ? (
            <div style={styles.emptyState}><div style={styles.emptyIcon}>🖼️</div><h3>No Galleries Yet</h3><p>Create your first photo gallery.</p></div>
          ) : (
            gallery.map(album => (
              <div key={album.id} style={{ marginBottom: "30px" }}>
                <h3 style={{ color: textColor }}>{album.title}</h3>
                <p style={styles.videoMeta}>{album.category} • {album.images.length} images</p>
                <div style={styles.galleryGrid}>
                  {album.images.slice(0, 4).map((img, idx) => <img key={idx} src={img} alt={`Gallery ${idx}`} style={styles.galleryImage} />)}
                </div>
                <button onClick={() => deleteGallery(album.id)} style={{ ...styles.deleteBtn, marginTop: "10px" }}>Delete Gallery</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* CLIENTS TAB */}
      {activeTab === "clients" && (
        <div style={styles.section}>
          <h3 style={{ color: textColor }}>👥 Your Clients</h3>
          {clients.length === 0 ? (
            <div style={styles.emptyState}><div style={styles.emptyIcon}>👥</div><h3>No Clients Assigned</h3><p>You'll see your assigned clients here.</p></div>
          ) : (
            clients.map(client => (
              <div key={client.id} style={styles.clientCard}>
                <div><strong>{client.name}</strong> - {client.package}</div>
                <div style={{ fontSize: "12px", color: textMuted }}>{client.email} • {client.phone}</div>
                <div style={{ fontSize: "12px", color: primaryColor }}>Event: {new Date(client.date).toLocaleDateString()} at {client.location}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === "calendar" && (
        <div style={styles.section}>
          <h3 style={{ color: textColor }}>📅 Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <div style={styles.emptyState}><div style={styles.emptyIcon}>📅</div><h3>No Upcoming Events</h3><p>Your schedule is clear.</p></div>
          ) : (
            upcomingEvents.map(event => (
              <div key={event.id} style={styles.eventCard}>
                <div><strong>{event.name}</strong> - {event.package}</div>
                <div style={{ fontSize: "12px", color: primaryColor }}>{new Date(event.date).toLocaleDateString()} at {event.location}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div style={styles.section}>
          <h3 style={{ color: textColor }}>🔔 Notifications</h3>
          {notifications.length === 0 ? (
            <div style={styles.emptyState}><div style={styles.emptyIcon}>🔔</div><h3>No Notifications</h3></div>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} onClick={() => markNotificationRead(notif.id)} style={{ ...styles.notificationCard, opacity: notif.read ? 0.7 : 1 }}>
                <strong>{notif.title}</strong>
                <p style={{ fontSize: "12px", color: textMuted }}>{notif.message}</p>
                <small>{new Date(notif.time).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div style={styles.section}>
          <h3 style={{ color: textColor }}>📊 Performance Analytics</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}><div><div style={styles.statValue}>{stats.totalViews.toLocaleString()}</div><div>Total Views</div></div></div>
            <div style={styles.statCard}><div><div style={styles.statValue}>{stats.totalLikes.toLocaleString()}</div><div>Total Likes</div></div></div>
            <div style={styles.statCard}><div><div style={styles.statValue}>{Math.round(stats.totalViews / (stats.totalVideos || 1))}</div><div>Avg Views/Video</div></div></div>
            <div style={styles.statCard}><div><div style={styles.statValue}>{stats.publishedVideos}</div><div>Published</div></div></div>
          </div>
          <div style={{ textAlign: "center", padding: "40px", background: darkMode ? "#2a2a2a" : "#f8f9fa", borderRadius: "12px", marginTop: "20px" }}>
            <p>Advanced analytics coming soon with backend integration!</p>
          </div>
        </div>
      )}

      {/* EARNINGS TAB */}
      {activeTab === "earnings" && (
        <div style={styles.section}>
          <h3 style={{ color: textColor }}>💰 Earnings Summary</h3>
          <div style={styles.earningRow}><span>Total Earnings:</span><strong>{stats.totalEarnings.toLocaleString()} RWF</strong></div>
          <div style={styles.earningRow}><span>Available for Withdrawal:</span><strong>{Math.floor(stats.totalEarnings * 0.7).toLocaleString()} RWF</strong></div>
          <div style={styles.earningRow}><span>Pending Payouts:</span><strong>{Math.floor(stats.totalEarnings * 0.3).toLocaleString()} RWF</strong></div>
          <button style={styles.withdrawBtn}>💸 Request Withdrawal</button>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div style={styles.section}>
          <button onClick={() => setShowProfileModal(true)} style={styles.uploadBtn}><FaEdit /> Edit Profile</button>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ ...styles.uploadBtn, background: "#17a2b8" }}>🔒 Change Password</button>
          
          {showPasswordForm && (
            <div style={{ marginTop: "20px", padding: "20px", background: darkMode ? "#2a2a2a" : "#f8f9fa", borderRadius: "12px" }}>
              <label style={styles.label}>Current Password</label>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} style={styles.input} />
              <label style={styles.label}>New Password</label>
              <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} style={styles.input} />
              <label style={styles.label}>Confirm Password</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} style={styles.input} />
              <button onClick={handlePasswordChange} style={styles.saveBtn}>Update Password</button>
              <button onClick={() => setShowPasswordForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          )}
          
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ color: textColor }}>About You</h3>
            <p><strong>Bio:</strong> {profileForm.bio || "Not set"}</p>
            <p><strong>Skills:</strong> {profileForm.skills || "Not set"}</p>
            <p><strong>Experience:</strong> {profileForm.experience || "Not set"}</p>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: textColor }}><FaUpload /> Upload New Video</h2>
            <div style={styles.imageUploadArea} onClick={() => document.getElementById("thumbnailInput").click()}>
              {thumbnailPreview ? <img src={thumbnailPreview} alt="Preview" style={styles.imagePreview} /> : <div>Click to upload thumbnail</div>}
              <input id="thumbnailInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </div>
            <label style={styles.label}>Title *</label>
            <input type="text" placeholder="Video title" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} style={styles.input} />
            <label style={styles.label}>Couple Name *</label>
            <input type="text" placeholder="e.g., Eric & Diane" value={uploadForm.coupleName} onChange={(e) => setUploadForm({...uploadForm, coupleName: e.target.value})} style={styles.input} />
            <label style={styles.label}>Event Type</label>
            <select value={uploadForm.eventType} onChange={(e) => setUploadForm({...uploadForm, eventType: e.target.value})} style={styles.select}>
              <option value="dote">DOTE Ceremony</option>
              <option value="church">Church Wedding</option>
              <option value="reception">Reception Party</option>
            </select>
            <label style={styles.label}>YouTube Video URL *</label>
            <input type="text" placeholder="https://youtu.be/VIDEO_ID" value={uploadForm.videoUrl} onChange={(e) => setUploadForm({...uploadForm, videoUrl: e.target.value})} style={styles.input} />
            <label style={styles.label}>Description</label>
            <textarea rows="3" placeholder="Video description..." value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} style={styles.textarea} />
            <div style={styles.modalButtons}>
              <button onClick={handleUpload} style={styles.saveBtn}>Upload</button>
              <button onClick={() => setShowUploadModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: textColor }}><FaEdit /> Edit Video</h2>
            <div style={styles.imageUploadArea} onClick={() => document.getElementById("editThumbnailInput").click()}>
              {editThumbnailPreview ? <img src={editThumbnailPreview} alt="Preview" style={styles.imagePreview} /> : <div>Click to change thumbnail</div>}
              <input id="editThumbnailInput" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setEditThumbnailPreview(reader.result); setEditForm({...editForm, thumbnail: reader.result}); }; reader.readAsDataURL(file); } }} />
            </div>
            <label style={styles.label}>Title *</label>
            <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} style={styles.input} />
            <label style={styles.label}>Couple Name *</label>
            <input type="text" value={editForm.coupleName} onChange={(e) => setEditForm({...editForm, coupleName: e.target.value})} style={styles.input} />
            <label style={styles.label}>Event Type</label>
            <select value={editForm.eventType} onChange={(e) => setEditForm({...editForm, eventType: e.target.value})} style={styles.select}>
              <option value="dote">DOTE Ceremony</option>
              <option value="church">Church Wedding</option>
              <option value="reception">Reception Party</option>
            </select>
            <label style={styles.label}>YouTube URL *</label>
            <input type="text" value={editForm.videoUrl} onChange={(e) => setEditForm({...editForm, videoUrl: e.target.value})} style={styles.input} />
            <label style={styles.label}>Description</label>
            <textarea rows="3" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} style={styles.textarea} />
            <div style={styles.modalButtons}>
              <button onClick={() => { const finalUrl = convertToEmbedUrl(editForm.videoUrl); const updated = videos.map(v => v.id === editingVideo.id ? { ...v, ...editForm, videoUrl: finalUrl } : v); saveVideos(updated); setShowEditModal(false); alert("Video updated!"); }} style={styles.saveBtn}>Save</button>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: textColor }}>{editingPost ? "Edit Post" : "Create New Post"}</h2>
            <div style={styles.imageUploadArea} onClick={() => document.getElementById("postImageInput").click()}>
              {postForm.image ? <img src={postForm.image} alt="Preview" style={styles.imagePreview} /> : <div>Click to upload image (optional)</div>}
              <input id="postImageInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePostImageUpload} />
            </div>
            <label style={styles.label}>Title *</label>
            <input type="text" placeholder="Post title" value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} style={styles.input} />
            <label style={styles.label}>Category</label>
            <select value={postForm.category} onChange={(e) => setPostForm({...postForm, category: e.target.value})} style={styles.select}>
              <option value="wedding">Wedding</option>
              <option value="announcement">Announcement</option>
              <option value="tips">Tips & Stories</option>
            </select>
            <label style={styles.label}>Content *</label>
            <textarea rows="5" placeholder="Post content..." value={postForm.content} onChange={(e) => setPostForm({...postForm, content: e.target.value})} style={styles.textarea} />
            <div style={styles.modalButtons}>
              <button onClick={handlePostSubmit} style={styles.saveBtn}>Save Post</button>
              <button onClick={() => setShowPostModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Gallery Modal */}
      {showGalleryModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: textColor }}>Create New Gallery</h2>
            <label style={styles.label}>Gallery Title *</label>
            <input type="text" placeholder="Gallery title" value={galleryForm.title} onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})} style={styles.input} />
            <label style={styles.label}>Category</label>
            <select value={galleryForm.category} onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})} style={styles.select}>
              <option value="wedding">Wedding</option>
              <option value="dote">DOTE</option>
              <option value="reception">Reception</option>
            </select>
            <div style={styles.imageUploadArea} onClick={() => document.getElementById("galleryInput").click()}>
              {galleryPreview.length > 0 ? <div>{galleryPreview.length} images selected</div> : <div>Click to upload images</div>}
              <input id="galleryInput" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleGalleryUpload} />
            </div>
            <div style={styles.modalButtons}>
              <button onClick={handleGallerySubmit} style={styles.saveBtn}>Create Gallery</button>
              <button onClick={() => setShowGalleryModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: textColor }}>Edit Profile</h2>
            <div style={styles.profileGrid}>
              <div><label style={styles.label}>Bio</label><textarea rows="3" placeholder="Tell about yourself..." value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} style={styles.textarea} /></div>
              <div><label style={styles.label}>Skills</label><input type="text" placeholder="e.g., Videography, Editing, Drone" value={profileForm.skills} onChange={(e) => setProfileForm({...profileForm, skills: e.target.value})} style={styles.input} /></div>
              <div><label style={styles.label}>Experience</label><select value={profileForm.experience} onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})} style={styles.select}><option value="">Select</option><option value="1-3 years">1-3 years</option><option value="3-5 years">3-5 years</option><option value="5+ years">5+ years</option></select></div>
              <div><label style={styles.label}>Instagram</label><input type="text" placeholder="https://instagram.com/..." value={profileForm.instagram} onChange={(e) => setProfileForm({...profileForm, instagram: e.target.value})} style={styles.input} /></div>
              <div><label style={styles.label}>TikTok</label><input type="text" placeholder="https://tiktok.com/..." value={profileForm.tiktok} onChange={(e) => setProfileForm({...profileForm, tiktok: e.target.value})} style={styles.input} /></div>
              <div><label style={styles.label}>YouTube</label><input type="text" placeholder="https://youtube.com/..." value={profileForm.youtube} onChange={(e) => setProfileForm({...profileForm, youtube: e.target.value})} style={styles.input} /></div>
            </div>
            <div style={styles.modalButtons}>
              <button onClick={saveProfile} style={styles.saveBtn}>Save Profile</button>
              <button onClick={() => setShowProfileModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatorDashboard;