// src/pages/couple/CoupleDashboard.jsx
import { useEffect, useRef, useState } from "react";
import {
  FaCalendar,
  FaComments,
  FaEdit, FaEye, FaHeart, FaImage,
  FaLink,
  FaLock,
  FaShare,
  FaStar,
  FaUnlockAlt,
  FaUpload,
  FaUsers,
  FaVideo,
  FaWallet
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

// ─── CONSTANTS ─────────────────────────────────────────────────────
const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

const EVENT_TYPES = [
  { id: "dote", label: "DOTE Ceremony", icon: "🪘" },
  { id: "church", label: "Church Wedding", icon: "⛪" },
  { id: "reception", label: "Reception", icon: "🎉" },
  { id: "traditional", label: "Traditional Dance", icon: "💃" },
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

// ─── COMPONENT ─────────────────────────────────────────────────────
export default function CoupleDashboard() {
  const navigate = useNavigate();
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data states
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [comments, setComments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    premium: 0,
    subscription: 0,
    pending: 0,
    history: []
  });
  const [withdrawals, setWithdrawals] = useState([]);
  
  // Profile data
  const [profile, setProfile] = useState({
    brideName: "", groomName: "", coupleName: "", weddingDate: "", location: "",
    bio: "", instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "",
    profileImage: null, coverImage: null, pageVisibility: "public", contentPermission: "public"
  });
  
  const [stats, setStats] = useState({
    totalViews: 0,
    videoViews: 0,
    galleryViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    subscriberCount: 0,
    totalEarnings: 0,
    watchTime: 0,
    engagement: 0
  });
  
  const [assignedCreator, setAssignedCreator] = useState(null);
  const [booking, setBooking] = useState(null);
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  
  // Form states
  const [videoForm, setVideoForm] = useState({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0 });
  const [postForm, setPostForm] = useState({ title: "", content: "", image: null, category: "update" });
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    
    const coupleId = window.location.pathname.split("/")[3];
    if (coupleId) {
      loadCoupleData(coupleId);
    } else {
      const userEmail = localStorage.getItem("user_email");
      if (userEmail) {
        loadCoupleByEmail(userEmail);
      } else {
        navigate("/login");
      }
    }
  }, []);

  const loadCoupleData = (coupleId) => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const found = allCouples.find(c => c.id === coupleId);
    if (found) {
      setCouple(found);
      setProfile({
        brideName: found.brideName || "",
        groomName: found.groomName || "",
        coupleName: found.couple || found.name || "",
        weddingDate: found.weddingDate || "",
        location: found.location || "",
        bio: found.bio || "",
        instagram: found.instagram || "",
        tiktok: found.tiktok || "",
        youtube: found.youtube || "",
        facebook: found.facebook || "",
        whatsapp: found.whatsapp || "",
        profileImage: found.image || null,
        coverImage: found.coverImage || null,
        pageVisibility: found.pageVisibility || "public",
        contentPermission: found.contentPermission || "public"
      });
      setProfileForm({
        brideName: found.brideName || "",
        groomName: found.groomName || "",
        coupleName: found.couple || found.name || "",
        weddingDate: found.weddingDate || "",
        location: found.location || "",
        bio: found.bio || "",
        instagram: found.instagram || "",
        tiktok: found.tiktok || "",
        youtube: found.youtube || "",
        facebook: found.facebook || "",
        whatsapp: found.whatsapp || "",
        profileImage: found.image || null,
        coverImage: found.coverImage || null,
        pageVisibility: found.pageVisibility || "public",
        contentPermission: found.contentPermission || "public"
      });
      loadVideos(coupleId);
      loadGallery(coupleId);
      loadPosts(coupleId);
      loadNotifications(coupleId);
      loadComments(coupleId);
      loadSubscribers(coupleId);
      loadEarnings(coupleId);
      loadWithdrawals(coupleId);
      loadAssignedCreator(coupleId);
      loadBooking(coupleId);
      loadAnalytics(coupleId);
    }
    setLoading(false);
  };

  const loadCoupleByEmail = (email) => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const found = allCouples.find(c => c.email === email);
    if (found) {
      loadCoupleData(found.id);
    } else {
      setLoading(false);
    }
  };

  const loadVideos = (coupleId) => {
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    const coupleVideos = allVideos.filter(v => v.coupleId === coupleId);
    setVideos(coupleVideos);
  };

  const loadGallery = (coupleId) => {
    const allGalleries = JSON.parse(localStorage.getItem("couple_galleries") || "[]");
    const coupleGalleries = allGalleries.filter(g => g.coupleId === coupleId);
    setGallery(coupleGalleries);
  };

  const loadPosts = (coupleId) => {
    const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
    const couplePosts = allPosts.filter(p => p.coupleId === coupleId);
    setPosts(couplePosts);
  };

  const loadNotifications = (coupleId) => {
    const allNotifs = JSON.parse(localStorage.getItem("couple_notifications") || "[]");
    const coupleNotifs = allNotifs.filter(n => n.coupleId === coupleId);
    setNotifications(coupleNotifs);
  };

  const loadComments = (coupleId) => {
    const allComments = JSON.parse(localStorage.getItem("wedding_comments") || "[]");
    const coupleComments = allComments.filter(c => c.coupleId === coupleId);
    setComments(coupleComments);
  };

  const loadSubscribers = (coupleId) => {
    const allSubscribers = JSON.parse(localStorage.getItem(`subscribers_${coupleId}`) || "[]");
    setSubscribers(allSubscribers);
  };

  const loadEarnings = (coupleId) => {
    const stored = JSON.parse(localStorage.getItem(`earnings_${coupleId}`) || "{}");
    setEarnings({
      total: stored.total || 125000,
      premium: stored.premium || 87500,
      subscription: stored.subscription || 37500,
      pending: stored.pending || 45000,
      history: stored.history || []
    });
  };

  const loadWithdrawals = (coupleId) => {
    const stored = JSON.parse(localStorage.getItem(`withdrawals_${coupleId}`) || "[]");
    setWithdrawals(stored);
  };

  const loadAssignedCreator = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const coupleBooking = bookings.find(b => b.coupleId === coupleId || b.coupleName === couple?.couple);
    if (coupleBooking && coupleBooking.assignedCreator) {
      const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
      const creator = users.find(u => u.email === coupleBooking.assignedCreator);
      setAssignedCreator(creator);
    }
  };

  const loadBooking = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const coupleBooking = bookings.find(b => b.coupleId === coupleId || b.coupleName === couple?.couple);
    setBooking(coupleBooking);
  };

  const loadAnalytics = (coupleId) => {
    const stored = JSON.parse(localStorage.getItem(`analytics_${coupleId}`) || "{}");
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
    const galleryViews = gallery.reduce((sum, g) => sum + (g.views || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
    
    setStats({
      totalViews: totalViews + galleryViews,
      videoViews: totalViews,
      galleryViews: galleryViews,
      totalLikes: totalLikes,
      totalComments: comments.length,
      totalShares: stored.totalShares || 0,
      subscriberCount: subscribers.length,
      totalEarnings: earnings.total,
      watchTime: stored.watchTime || 3250,
      engagement: videos.length > 0 ? Math.round((totalLikes / totalViews) * 100) : 0
    });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
    addNotification("Theme changed", `Dark mode ${newMode ? "enabled" : "disabled"}`, "info");
  };

  const addNotification = (title, message, type = "info") => {
    const newNotif = { id: Date.now(), coupleId: couple?.id, title, message, type, read: false, time: new Date().toISOString() };
    const updated = [newNotif, ...notifications.slice(0, 49)];
    setNotifications(updated);
    localStorage.setItem("couple_notifications", JSON.stringify(updated));
  };

  const markNotificationRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("couple_notifications", JSON.stringify(updated));
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profileImage: reader.result });
        toast("✅ Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, coverImage: reader.result });
        toast("✅ Cover image updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const updated = allCouples.map(c => c.id === couple.id ? { ...c, ...profileForm } : c);
    localStorage.setItem("wedding_couples", JSON.stringify(updated));
    setCouple({ ...couple, ...profileForm });
    addNotification("Profile Updated", "Your wedding profile has been updated", "success");
    setShowProfileModal(false);
    toast("✅ Profile updated!");
  };

  const handleUploadVideo = () => {
    if (!videoForm.title || !videoForm.videoUrl) {
      toast("Please fill title and video URL", "#ef4444");
      return;
    }
    
    const finalUrl = convertToEmbedUrl(videoForm.videoUrl);
    if (!finalUrl.includes("youtube.com/embed/")) {
      toast("Invalid YouTube URL", "#ef4444");
      return;
    }
    
    const newVideo = {
      id: Date.now(),
      coupleId: couple.id,
      coupleName: couple.couple,
      title: videoForm.title,
      videoUrl: finalUrl,
      thumbnail: videoForm.thumbnail,
      isPremium: videoForm.isPremium,
      price: videoForm.price,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      status: "published",
      createdAt: new Date().toISOString()
    };
    
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    localStorage.setItem("couple_videos", JSON.stringify([...allVideos, newVideo]));
    setVideos([...videos, newVideo]);
    addNotification("Video Uploaded", `${videoForm.title} has been added to your wedding gallery`, "success");
    setShowVideoModal(false);
    setVideoForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0 });
    setThumbnailPreview(null);
    toast("✅ Video uploaded!");
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm("Delete this video?")) {
      const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
      const updated = allVideos.filter(v => v.id !== videoId);
      localStorage.setItem("couple_videos", JSON.stringify(updated));
      setVideos(videos.filter(v => v.id !== videoId));
      addNotification("Video Deleted", "A video has been removed from your gallery", "info");
      toast("✅ Video deleted!");
    }
  };

  const handleCreatePost = () => {
    if (!postForm.title || !postForm.content) {
      toast("Please fill title and content", "#ef4444");
      return;
    }
    
    const newPost = {
      id: Date.now(),
      coupleId: couple.id,
      coupleName: couple.couple,
      title: postForm.title,
      content: postForm.content,
      image: postForm.image,
      category: postForm.category,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString()
    };
    
    const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
    localStorage.setItem("couple_posts", JSON.stringify([newPost, ...allPosts]));
    setPosts([newPost, ...posts]);
    addNotification("Post Created", postForm.title, "success");
    setShowPostModal(false);
    setPostForm({ title: "", content: "", image: null, category: "update" });
    setPostImagePreview(null);
    toast("✅ Post published!");
  };

  const handleDeletePost = (postId) => {
    if (window.confirm("Delete this post?")) {
      const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
      const updated = allPosts.filter(p => p.id !== postId);
      localStorage.setItem("couple_posts", JSON.stringify(updated));
      setPosts(posts.filter(p => p.id !== postId));
      toast("✅ Post deleted!");
    }
  };

  const handleAddComment = (videoId) => {
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: Date.now(),
      coupleId: couple.id,
      videoId: videoId,
      userName: localStorage.getItem("user_name") || "Guest",
      comment: newComment,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    const allComments = JSON.parse(localStorage.getItem("wedding_comments") || "[]");
    localStorage.setItem("wedding_comments", JSON.stringify([...allComments, newCommentObj]));
    setComments([...comments, newCommentObj]);
    
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    const updatedVideos = allVideos.map(v => v.id === videoId ? { ...v, comments: (v.comments || 0) + 1 } : v);
    localStorage.setItem("couple_videos", JSON.stringify(updatedVideos));
    setVideos(videos.map(v => v.id === videoId ? { ...v, comments: (v.comments || 0) + 1 } : v));
    
    setNewComment("");
    addNotification("New Comment", "Someone commented on your video", "comment");
    toast("✅ Comment added!");
  };

  const handleLikeVideo = (videoId) => {
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    const updatedVideos = allVideos.map(v => v.id === videoId ? { ...v, likes: (v.likes || 0) + 1 } : v);
    localStorage.setItem("couple_videos", JSON.stringify(updatedVideos));
    setVideos(videos.map(v => v.id === videoId ? { ...v, likes: (v.likes || 0) + 1 } : v));
  };

  const handleShareVideo = (videoId) => {
    const videoUrl = `${window.location.origin}/wedding/${couple?.id}/video/${videoId}`;
    navigator.clipboard.writeText(videoUrl);
    toast("🔗 Link copied to clipboard!");
    
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    const updatedVideos = allVideos.map(v => v.id === videoId ? { ...v, shares: (v.shares || 0) + 1 } : v);
    localStorage.setItem("couple_videos", JSON.stringify(updatedVideos));
    setVideos(videos.map(v => v.id === videoId ? { ...v, shares: (v.shares || 0) + 1 } : v));
  };

  const handleRequestWithdrawal = () => {
    if (!withdrawalAmount || withdrawalAmount < 10000) {
      toast("Minimum withdrawal amount is 10,000 RWF", "#ef4444");
      return;
    }
    
    const newWithdrawal = {
      id: Date.now(),
      amount: parseInt(withdrawalAmount),
      status: "pending",
      requestedAt: new Date().toISOString()
    };
    
    const updatedWithdrawals = [newWithdrawal, ...withdrawals];
    setWithdrawals(updatedWithdrawals);
    localStorage.setItem(`withdrawals_${couple?.id}`, JSON.stringify(updatedWithdrawals));
    
    addNotification("Withdrawal Requested", `${withdrawalAmount} RWF withdrawal request submitted`, "payment");
    setShowWithdrawalModal(false);
    setWithdrawalAmount("");
    toast("✅ Withdrawal request submitted!");
  };

  const updateVisibility = (type, value) => {
    setProfileForm({ ...profileForm, [type]: value });
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const updated = allCouples.map(c => c.id === couple.id ? { ...c, [type]: value } : c);
    localStorage.setItem("wedding_couples", JSON.stringify(updated));
    toast(`✅ ${type === "pageVisibility" ? "Page" : "Content"} visibility updated!`);
  };

  // ✅ getStatusBadge FUNCTION - FIXES THE ERROR
  const getStatusBadge = (status) => {
    if (status === "confirmed") {
      return <span style={{ background: "#d4edda", color: "#155724", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>✅ Confirmed</span>;
    }
    if (status === "pending") {
      return <span style={{ background: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>⏳ Pending</span>;
    }
    if (status === "rejected") {
      return <span style={{ background: "#f8d7da", color: "#721c24", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>❌ Rejected</span>;
    }
    return <span style={{ background: "#e2e3e5", color: "#383d41", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{status || "Unknown"}</span>;
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

  const handleImageUpload = (e, setPreview, setForm) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setForm(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
        setPostForm({ ...postForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ─── CSS for animations ──────────────────────────────────────────
  const css = `
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .card-animate { animation: fadeIn 0.35s ease both; }
    .card-animate:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
    input:focus, textarea:focus, select:focus { border-color: ${Y} !important; box-shadow: 0 0 0 3px rgba(255,193,7,0.15) !important; outline:none; }
    
    @media (max-width: 768px) {
      .main-grid { grid-template-columns: 1fr !important; }
      .sidebar { display: ${mobileMenuOpen ? 'block' : 'none'} !important; position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; background: ${darkMode ? '#1e1e1e' : '#fff'}; overflow-y: auto; padding: 20px; }
      .mobile-menu-btn { display: flex !important; }
      .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .tabs { gap: 6px !important; }
      .tab { padding: 8px 12px !important; font-size: 12px !important; }
      .video-grid { grid-template-columns: 1fr !important; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
      .video-grid { grid-template-columns: repeat(2, 1fr) !important; }
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
    container: { minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", color: textColor },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: Y, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    hero: { background: `linear-gradient(160deg, ${BLK} 0%, #1a1400 100%)`, color: WHT, padding: "60px 24px 52px", textAlign: "center", position: "relative", overflow: "hidden" },
    heroTitle: { fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, marginBottom: 14, color: WHT, lineHeight: 1.1 },
    heroSubtitle: { fontSize: "clamp(14px,4vw,16px)", color: "rgba(255,255,255,0.75)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 },
    statsBar: { background: cardBg, borderBottom: `1px solid ${borderColor}`, padding: "14px 24px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 24 },
    statCard: { background: cardBg, padding: "16px", borderRadius: 12, textAlign: "center", border: `1px solid ${borderColor}`, transition: "all 0.2s" },
    statValue: { fontSize: "clamp(20px,5vw,28px)", fontWeight: 800, color: Y, marginBottom: 4 },
    statLabel: { fontSize: "clamp(11px,3vw,12px)", color: textMuted },
    mainGrid: { maxWidth: 1400, margin: "0 auto", padding: "32px 20px", display: "grid", gridTemplateColumns: "minmax(260px, 300px) 1fr", gap: 28, alignItems: "start" },
    sidebar: { background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "20px", position: "sticky", top: 20 },
    sidebarTitle: { fontSize: "clamp(13px,4vw,14px)", fontWeight: 700, marginBottom: 16, paddingLeft: 10, borderLeft: `3px solid ${Y}` },
    sidebarItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${borderColor}`, cursor: "pointer", transition: "all 0.2s" },
    content: { display: "flex", flexDirection: "column", gap: 24 },
    tabs: { display: "flex", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${borderColor}`, paddingBottom: 12 },
    tab: { padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: "clamp(12px,3.5vw,14px)", fontWeight: 600, color: textMuted, borderRadius: 8, transition: "all 0.2s" },
    activeTab: { background: `${Y}20`, color: Y },
    section: { background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: "24px" },
    sectionTitle: { fontSize: "clamp(16px,5vw,18px)", fontWeight: 700, marginBottom: 20, color: textColor },
    btnPrimary: { padding: "10px 20px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
    btnSuccess: { padding: "8px 16px", background: "#28a745", color: WHT, border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12 },
    btnDanger: { padding: "8px 16px", background: "#dc3545", color: WHT, border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12 },
    btnOutline: { padding: "8px 16px", background: "transparent", color: Y, border: `1px solid ${Y}`, borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12 },
    videoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 },
    videoCard: { background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, overflow: "hidden", transition: "all 0.2s" },
    videoImage: { width: "100%", height: "160px", objectFit: "cover" },
    postGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 },
    postCard: { background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "16px", transition: "all 0.2s" },
    galleryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 },
    galleryImage: { width: "100%", height: "120px", objectFit: "cover", borderRadius: 8 },
    notificationCard: { background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 10, padding: "14px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { background: cardBg, borderRadius: 16, padding: "28px", maxWidth: "550px", width: "90%", maxHeight: "85vh", overflowY: "auto" },
    input: { width: "100%", padding: "12px", border: `1.5px solid ${borderColor}`, borderRadius: 8, fontSize: "clamp(13px,4vw,14px)", background: darkMode ? "#333" : "#fff", color: textColor, outline: "none", boxSizing: "border-box" },
    textarea: { width: "100%", padding: "12px", border: `1.5px solid ${borderColor}`, borderRadius: 8, fontSize: "clamp(13px,4vw,14px)", background: darkMode ? "#333" : "#fff", color: textColor, resize: "vertical", fontFamily: "inherit", outline: "none" },
    label: { fontSize: "clamp(12px,3.5vw,13px)", fontWeight: 600, marginBottom: 6, display: "block", color: textColor },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
    emptyState: { textAlign: "center", padding: "48px", color: textMuted },
    emptyIcon: { fontSize: "48px", marginBottom: 16 },
    checkboxLabel: { display: "flex", alignItems: "center", gap: 10, marginBottom: 15, cursor: "pointer", color: textColor }
  };

  if (loading) {
    return <div style={{ ...styles.container, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading dashboard...</div>;
  }

  if (!couple) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.section, textAlign: "center", maxWidth: 500, margin: "auto", marginTop: 100 }}>
          <h2 style={styles.sectionTitle}>No Wedding Found</h2>
          <p style={{ color: textMuted, marginBottom: 20 }}>Create your wedding profile to get started.</p>
          <Link to="/booking"><button style={styles.btnPrimary}>Book Your Wedding →</button></Link>
        </div>
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
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: Y, marginBottom: 14 }}>NY Entertainment Rwanda</p>
          <h1 style={styles.heroTitle}>💑 Couple Dashboard</h1>
          <p style={styles.heroSubtitle}>Welcome to your wedding dashboard! Manage your videos, gallery, earnings, and share your love story.</p>
        </div>

        {/* ─── STATS BAR ─── */}
        <div style={styles.statsBar}>
          <div className="stats-grid" style={styles.statsGrid}>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.totalViews.toLocaleString()}</div><div style={styles.statLabel}>Total Views</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.videoViews.toLocaleString()}</div><div style={styles.statLabel}>Video Views</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.galleryViews.toLocaleString()}</div><div style={styles.statLabel}>Gallery Views</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.totalLikes}</div><div style={styles.statLabel}>Total Likes</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.subscriberCount}</div><div style={styles.statLabel}>Subscribers</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.totalEarnings.toLocaleString()} RWF</div><div style={styles.statLabel}>Total Earnings</div></div>
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="main-grid" style={styles.mainGrid}>

          {/* ─── SIDEBAR ─── */}
          <aside className="sidebar" style={styles.sidebar}>
            <button className="close-sidebar" onClick={() => setMobileMenuOpen(false)} style={{ display: 'none' }}>✕</button>
            
            {/* Couple Profile Mini */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: Y, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: BLK }}>
                {profileForm.coupleName?.charAt(0) || profileForm.brideName?.charAt(0) || "C"}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{profileForm.coupleName || couple?.couple}</h3>
              <p style={{ fontSize: 12, color: textMuted }}>{profileForm.location || couple?.location || "Rwanda"}</p>
              {profileForm.weddingDate && <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}><FaCalendar /> {new Date(profileForm.weddingDate).toLocaleDateString()}</p>}
            </div>

            {/* Quick Stats */}
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sidebarTitle}>📊 Quick Stats</div>
              <div style={styles.sidebarItem}><FaVideo style={{ color: Y }} /> <span>Videos: {videos.length}</span></div>
              <div style={styles.sidebarItem}><FaImage style={{ color: Y }} /> <span>Photos: {gallery.reduce((sum, g) => sum + g.images.length, 0)}</span></div>
              <div style={styles.sidebarItem}><FaHeart style={{ color: Y }} /> <span>Likes: {stats.totalLikes}</span></div>
              <div style={styles.sidebarItem}><FaComments style={{ color: Y }} /> <span>Comments: {stats.totalComments}</span></div>
              <div style={styles.sidebarItem}><FaUsers style={{ color: Y }} /> <span>Subscribers: {stats.subscriberCount}</span></div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sidebarTitle}>⚡ Quick Actions</div>
              <button onClick={() => setShowVideoModal(true)} style={{ ...styles.btnPrimary, width: "100%", marginBottom: 8 }}><FaUpload /> Upload Video</button>
              <button onClick={() => setShowPostModal(true)} style={{ ...styles.btnOutline, width: "100%", marginBottom: 8 }}><FaEdit /> Create Post</button>
              <button onClick={() => setShowProfileModal(true)} style={{ ...styles.btnOutline, width: "100%" }}><FaEdit /> Edit Profile</button>
            </div>

            {/* Wedding Page Link */}
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sidebarTitle}>🔗 Wedding Page</div>
              <a href={`/wedding/${couple?.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={styles.sidebarItem}><FaLink style={{ color: Y }} /> <span>View Public Page →</span></div>
              </a>
            </div>

            {/* Privacy Settings */}
            <div>
              <div style={styles.sidebarTitle}>🔒 Privacy</div>
              <div style={styles.sidebarItem} onClick={() => updateVisibility("pageVisibility", profileForm.pageVisibility === "public" ? "private" : "public")}>
                {profileForm.pageVisibility === "public" ? <FaUnlockAlt style={{ color: Y }} /> : <FaLock style={{ color: Y }} />}
                <span>{profileForm.pageVisibility === "public" ? "Public Page" : "Private Page"}</span>
              </div>
              <div style={styles.sidebarItem} onClick={() => updateVisibility("contentPermission", profileForm.contentPermission === "public" ? "premium" : "public")}>
                {profileForm.contentPermission === "public" ? <FaUnlockAlt style={{ color: Y }} /> : <FaStar style={{ color: Y }} />}
                <span>{profileForm.contentPermission === "public" ? "Free Content" : "Premium Content"}</span>
              </div>
            </div>
          </aside>

          {/* ─── MAIN CONTENT ─── */}
          <main style={styles.content}>

            {/* Tabs */}
            <div style={styles.tabs}>
              {["dashboard", "videos", "gallery", "posts", "earnings", "subscribers", "messages", "settings"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="tab" style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}>
                  {tab === "dashboard" && "📊 Dashboard"}
                  {tab === "videos" && "🎬 Videos"}
                  {tab === "gallery" && "🖼️ Gallery"}
                  {tab === "posts" && "📝 Posts"}
                  {tab === "earnings" && "💰 Earnings"}
                  {tab === "subscribers" && "👥 Subscribers"}
                  {tab === "messages" && "💬 Messages"}
                  {tab === "settings" && "⚙️ Settings"}
                </button>
              ))}
            </div>

            {/* ─── DASHBOARD TAB ─── */}
            {activeTab === "dashboard" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📊 Dashboard Overview</h2>
                
                {/* Stats Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.totalViews.toLocaleString()}</div><div style={styles.statLabel}>Total Views</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.totalLikes}</div><div style={styles.statLabel}>Total Likes</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.totalComments}</div><div style={styles.statLabel}>Comments</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.subscriberCount}</div><div style={styles.statLabel}>Subscribers</div></div>
                </div>

                {/* Assigned Creator */}
                {assignedCreator && (
                  <div style={{ marginBottom: 24, padding: 16, background: `${Y}10`, borderRadius: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>🎥 Your Videographer</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>{assignedCreator.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{assignedCreator.name}</div>
                        <div style={{ fontSize: 12, color: textMuted }}>{assignedCreator.email}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Status */}
                {booking && (
                  <div style={{ marginBottom: 24, padding: 16, background: `${Y}10`, borderRadius: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📅 Wedding Booking</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <span><strong>Package:</strong> {booking.package}</span>
                      <span><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</span>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Recent Activity</h3>
                {notifications.slice(0, 5).map(notif => (
                  <div key={notif.id} style={{ ...styles.notificationCard, opacity: notif.read ? 0.7 : 1 }} onClick={() => markNotificationRead(notif.id)}>
                    <div style={{ fontWeight: 600 }}>{notif.title}</div>
                    <div style={{ fontSize: 12, color: textMuted }}>{notif.message}</div>
                    <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>{new Date(notif.time).toLocaleDateString()}</div>
                  </div>
                ))}
                {notifications.length === 0 && <div style={styles.emptyState}><div>No recent activity</div></div>}
              </div>
            )}

            {/* ─── VIDEOS TAB ─── */}
            {activeTab === "videos" && (
              <div style={styles.section}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <h2 style={styles.sectionTitle}>🎬 Wedding Videos</h2>
                  <button onClick={() => setShowVideoModal(true)} style={styles.btnPrimary}><FaUpload /> Upload Video</button>
                </div>
                {videos.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>🎬</div><div>No videos yet. Upload your first wedding video!</div></div>
                ) : (
                  <div style={styles.videoGrid}>
                    {videos.map(video => (
                      <div key={video.id} className="card-animate" style={styles.videoCard}>
                        <img src={video.thumbnail || "https://via.placeholder.com/320x160?text=Wedding+Video"} alt={video.title} style={styles.videoImage} />
                        <div style={{ padding: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600 }}>{video.title}</h3>
                            {video.isPremium && <span style={{ background: Y, color: BLK, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Premium</span>}
                          </div>
                          <p style={{ fontSize: 12, color: textMuted, marginTop: 4 }}><FaEye /> {video.views || 0} views • <FaHeart /> {video.likes || 0} likes • <FaComments /> {video.comments || 0} comments</p>
                          {video.isPremium && <p style={{ fontSize: 11, color: Y, marginTop: 4 }}>💰 {video.price?.toLocaleString()} RWF</p>}
                          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button onClick={() => handleLikeVideo(video.id)} style={styles.btnOutline}><FaHeart /> Like</button>
                            <button onClick={() => handleShareVideo(video.id)} style={styles.btnOutline}><FaShare /> Share</button>
                            <button onClick={() => handleDeleteVideo(video.id)} style={styles.btnDanger}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── GALLERY TAB ─── */}
            {activeTab === "gallery" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🖼️ Photo Gallery</h2>
                {gallery.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>🖼️</div><div>No galleries yet.</div></div>
                ) : (
                  gallery.map(album => (
                    <div key={album.id} style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{album.title}</h3>
                      <p style={{ fontSize: 12, color: textMuted, marginBottom: 12 }}>{album.category} • {album.images.length} photos</p>
                      <div style={styles.galleryGrid}>
                        {album.images.slice(0, 6).map((img, idx) => (
                          <img key={idx} src={img} alt={`Gallery ${idx}`} style={styles.galleryImage} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── POSTS TAB ─── */}
            {activeTab === "posts" && (
              <div style={styles.section}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <h2 style={styles.sectionTitle}>📝 Wedding Stories</h2>
                  <button onClick={() => setShowPostModal(true)} style={styles.btnPrimary}><FaEdit /> Create Post</button>
                </div>
                {posts.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>📝</div><div>No posts yet. Share your love story!</div></div>
                ) : (
                  <div style={styles.postGrid}>
                    {posts.map(post => (
                      <div key={post.id} className="card-animate" style={styles.postCard}>
                        {post.image && <img src={post.image} alt={post.title} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />}
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{post.title}</h3>
                        <p style={{ fontSize: 11, color: textMuted, marginBottom: 8 }}>{new Date(post.createdAt).toLocaleDateString()} • {post.category}</p>
                        <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.5 }}>{post.content?.substring(0, 120)}...</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={() => handleDeletePost(post.id)} style={styles.btnDanger}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── EARNINGS TAB ─── */}
            {activeTab === "earnings" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>💰 Earnings Overview</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <div style={styles.statCard}><div style={styles.statValue}>{earnings.total.toLocaleString()} RWF</div><div style={styles.statLabel}>Total Earnings</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{earnings.premium.toLocaleString()} RWF</div><div style={styles.statLabel}>Premium Videos</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{earnings.subscription.toLocaleString()} RWF</div><div style={styles.statLabel}>Subscriptions</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{earnings.pending.toLocaleString()} RWF</div><div style={styles.statLabel}>Pending Payouts</div></div>
                </div>
                
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                  <button onClick={() => setShowWithdrawalModal(true)} style={styles.btnPrimary}><FaWallet /> Request Withdrawal</button>
                  <Link to={`/wedding/${couple?.id}`}><button style={styles.btnOutline}>View Public Page →</button></Link>
                </div>

                {/* Withdrawal History */}
                {withdrawals.length > 0 && (
                  <>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Withdrawal History</h3>
                    {withdrawals.map(w => (
                      <div key={w.id} style={{ ...styles.notificationCard, background: w.status === "completed" ? "#28a74520" : w.status === "pending" ? `${Y}20` : "#dc354520" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <span><strong>{w.amount.toLocaleString()} RWF</strong></span>
                          <span style={{ fontSize: 12, color: w.status === "completed" ? "#28a745" : w.status === "pending" ? Y : "#dc3545" }}>{w.status === "completed" ? "✅ Completed" : w.status === "pending" ? "⏳ Pending" : "❌ Rejected"}</span>
                          <span style={{ fontSize: 11, color: textMuted }}>{new Date(w.requestedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ─── SUBSCRIBERS TAB ─── */}
            {activeTab === "subscribers" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>👥 Subscribers</h2>
                <div style={{ textAlign: "center", padding: 32 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: Y, marginBottom: 8 }}>{stats.subscriberCount}</div>
                  <div style={{ color: textMuted }}>Total Subscribers</div>
                  <p style={{ marginTop: 20, fontSize: 13, color: textMuted }}>Subscribers get notified when you upload new premium content.</p>
                </div>
              </div>
            )}

            {/* ─── MESSAGES / COMMENTS TAB ─── */}
            {activeTab === "messages" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>💬 Comments & Messages</h2>
                {comments.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>💬</div><div>No comments yet</div></div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} style={styles.notificationCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{comment.userName}</div>
                          <div style={{ fontSize: 13, color: textMuted, marginTop: 4 }}>{comment.comment}</div>
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{new Date(comment.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── SETTINGS TAB ─── */}
            {activeTab === "settings" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>⚙️ Account Settings</h2>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: BLK, cursor: "pointer" }} onClick={() => document.getElementById("profileImageInput")?.click()}>
                    {profileForm.coupleName?.charAt(0) || profileForm.brideName?.charAt(0) || "C"}
                  </div>
                  <input id="profileImageInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handleProfileImageUpload} />
                  <button onClick={() => setShowProfileModal(true)} style={{ ...styles.btnOutline, marginTop: 12 }}>Edit Profile</button>
                </div>
                
                <div style={styles.row}>
                  <div><label style={styles.label}>Bride's Name</label><input style={styles.input} value={profileForm.brideName} onChange={e => setProfileForm({...profileForm, brideName: e.target.value})} /></div>
                  <div><label style={styles.label}>Groom's Name</label><input style={styles.input} value={profileForm.groomName} onChange={e => setProfileForm({...profileForm, groomName: e.target.value})} /></div>
                </div>
                <div><label style={styles.label}>Wedding Date</label><input style={styles.input} type="date" value={profileForm.weddingDate} onChange={e => setProfileForm({...profileForm, weddingDate: e.target.value})} /></div>
                <div><label style={styles.label}>Location</label><input style={styles.input} value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} /></div>
                <div><label style={styles.label}>Bio / Love Story</label><textarea style={styles.textarea} rows="3" value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} /></div>
                
                <div style={styles.row}>
                  <div><label style={styles.label}>Instagram</label><input style={styles.input} placeholder="https://instagram.com/..." value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} /></div>
                  <div><label style={styles.label}>TikTok</label><input style={styles.input} placeholder="https://tiktok.com/..." value={profileForm.tiktok} onChange={e => setProfileForm({...profileForm, tiktok: e.target.value})} /></div>
                </div>
                
                <button onClick={handleUpdateProfile} style={{ ...styles.btnPrimary, width: "100%", marginTop: 20 }}>Save All Changes</button>
              </div>
            )}

          </main>
        </div>

        {/* ─── MODALS ─── */}

        {/* Upload Video Modal */}
        {showVideoModal && (
          <div style={styles.modal} onClick={() => setShowVideoModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Upload Wedding Video</h2>
              <label style={styles.label}>Title *</label>
              <input style={styles.input} placeholder="e.g., Our Wedding Highlights" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} />
              <label style={styles.label}>YouTube Video URL *</label>
              <input style={styles.input} placeholder="https://youtu.be/VIDEO_ID" value={videoForm.videoUrl} onChange={e => setVideoForm({...videoForm, videoUrl: e.target.value})} />
              <label style={styles.label}>Thumbnail (Optional)</label>
              <div style={{ border: `2px dashed ${borderColor}`, borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer", marginBottom: 12 }} onClick={() => document.getElementById("thumbInput")?.click()}>
                {thumbnailPreview ? <img src={thumbnailPreview} style={{ maxHeight: 100 }} alt="preview" /> : "Click to upload thumbnail"}
                <input id="thumbInput" type="file" style={{ display: "none" }} accept="image/*" onChange={(e) => handleImageUpload(e, setThumbnailPreview, setVideoForm)} />
              </div>
              <label style={styles.checkboxLabel}><input type="checkbox" checked={videoForm.isPremium} onChange={e => setVideoForm({...videoForm, isPremium: e.target.checked})} /> Make this a premium video (earn revenue)</label>
              {videoForm.isPremium && <input style={styles.input} type="number" placeholder="Price (RWF)" value={videoForm.price} onChange={e => setVideoForm({...videoForm, price: parseInt(e.target.value)})} />}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleUploadVideo} style={{ ...styles.btnPrimary, flex: 1 }}>Upload</button>
                <button onClick={() => setShowVideoModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showPostModal && (
          <div style={styles.modal} onClick={() => setShowPostModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Share Your Story</h2>
              <label style={styles.label}>Title *</label>
              <input style={styles.input} placeholder="Post title" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                <option value="update">Wedding Update</option>
                <option value="story">Love Story</option>
                <option value="anniversary">Anniversary</option>
                <option value="thanks">Thank You</option>
              </select>
              <label style={styles.label}>Content *</label>
              <textarea style={styles.textarea} rows="5" placeholder="Write your story..." value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <label style={styles.label}>Image (Optional)</label>
              <div style={{ border: `2px dashed ${borderColor}`, borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("postImageInput")?.click()}>
                {postImagePreview ? <img src={postImagePreview} style={{ maxHeight: 100 }} alt="preview" /> : "Click to upload image"}
                <input id="postImageInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handlePostImageUpload} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, flex: 1 }}>Publish</button>
                <button onClick={() => setShowPostModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showProfileModal && (
          <div style={styles.modal} onClick={() => setShowProfileModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Edit Wedding Profile</h2>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, cursor: "pointer" }} onClick={() => document.getElementById("profileImg")?.click()}>
                  {profileForm.coupleName?.charAt(0) || "C"}
                </div>
                <input id="profileImg" type="file" style={{ display: "none" }} accept="image/*" onChange={handleProfileImageUpload} />
                <div style={{ marginTop: 8, cursor: "pointer" }} onClick={() => document.getElementById("coverImg")?.click()}>Change Cover Image</div>
                <input id="coverImg" type="file" style={{ display: "none" }} accept="image/*" onChange={handleCoverImageUpload} />
              </div>
              <div style={styles.row}>
                <div><label style={styles.label}>Bride's Name</label><input style={styles.input} value={profileForm.brideName} onChange={e => setProfileForm({...profileForm, brideName: e.target.value})} /></div>
                <div><label style={styles.label}>Groom's Name</label><input style={styles.input} value={profileForm.groomName} onChange={e => setProfileForm({...profileForm, groomName: e.target.value})} /></div>
              </div>
              <div><label style={styles.label}>Couple Name</label><input style={styles.input} value={profileForm.coupleName} onChange={e => setProfileForm({...profileForm, coupleName: e.target.value})} /></div>
              <div><label style={styles.label}>Wedding Date</label><input style={styles.input} type="date" value={profileForm.weddingDate} onChange={e => setProfileForm({...profileForm, weddingDate: e.target.value})} /></div>
              <div><label style={styles.label}>Location</label><input style={styles.input} value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} /></div>
              <div><label style={styles.label}>Bio / Love Story</label><textarea style={styles.textarea} rows="3" value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} /></div>
              <div style={styles.row}>
                <div><label style={styles.label}>Instagram</label><input style={styles.input} value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} /></div>
                <div><label style={styles.label}>TikTok</label><input style={styles.input} value={profileForm.tiktok} onChange={e => setProfileForm({...profileForm, tiktok: e.target.value})} /></div>
              </div>
              <div style={styles.row}>
                <div><label style={styles.label}>YouTube</label><input style={styles.input} value={profileForm.youtube} onChange={e => setProfileForm({...profileForm, youtube: e.target.value})} /></div>
                <div><label style={styles.label}>Facebook</label><input style={styles.input} value={profileForm.facebook} onChange={e => setProfileForm({...profileForm, facebook: e.target.value})} /></div>
              </div>
              <div style={styles.row}>
                <div><label style={styles.label}>WhatsApp</label><input style={styles.input} value={profileForm.whatsapp} onChange={e => setProfileForm({...profileForm, whatsapp: e.target.value})} /></div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleUpdateProfile} style={{ ...styles.btnPrimary, flex: 1 }}>Save Changes</button>
                <button onClick={() => setShowProfileModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal Modal */}
        {showWithdrawalModal && (
          <div style={styles.modal} onClick={() => setShowWithdrawalModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Request Withdrawal</h2>
              <p style={{ marginBottom: 16, fontSize: 13, color: textMuted }}>Available balance: <strong style={{ color: Y }}>{earnings.pending.toLocaleString()} RWF</strong></p>
              <label style={styles.label}>Amount (RWF)</label>
              <input style={styles.input} type="number" placeholder="Minimum 10,000 RWF" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} />
              <p style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>Withdrawals are processed within 3-5 business days to your Mobile Money account.</p>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleRequestWithdrawal} style={{ ...styles.btnPrimary, flex: 1 }}>Request</button>
                <button onClick={() => setShowWithdrawalModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}