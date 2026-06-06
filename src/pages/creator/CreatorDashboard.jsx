// src/pages/creator/CreatorDashboard.jsx
import { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaCalendar,
  FaChartLine,
  FaCheck,
  FaEdit,
  FaEnvelope,
  FaEye, FaHeart, FaImage,
  FaTimes,
  FaUpload, FaUserFriends,
  FaUsers
} from "react-icons/fa";
import { Link } from "react-router-dom";

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

const SERVICE_CATEGORIES = {
  wedding: { label: "Wedding", icon: "💍" },
  birthday: { label: "Birthday", icon: "🎂" },
  funeral: { label: "Funeral", icon: "🕊️" },
  graduation: { label: "Graduation", icon: "🎓" },
  corporate: { label: "Corporate", icon: "🏢" },
};

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
export default function CreatorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data states
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: 0,
    pending: 0,
    history: []
  });
  
  // Profile data
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", location: "",
    bio: "", skills: "", experience: "",
    instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "", twitter: "",
    profileImage: null, coverImage: null, availability: "available"
  });
  
  const [stats, setStats] = useState({
    assignedEvents: 0,
    upcomingEvents: 0,
    completedProjects: 0,
    totalVideos: 0,
    totalGalleries: 0,
    totalEarnings: 0,
    profileViews: 0,
    portfolioViews: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0,
    engagement: 0
  });
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  // Form states
  const [videoForm, setVideoForm] = useState({
    title: "", 
    coupleName: "", 
    coupleId: "", 
    eventType: "dote", 
    videoUrl: "", 
    thumbnail: null, 
    description: "",
    accessType: "free",
    supportAmount: 5000,
    visibility: "public"
  });
  const [postForm, setPostForm] = useState({
    title: "", content: "", category: "wedding", image: null, tags: ""
  });
  const [galleryForm, setGalleryForm] = useState({
    title: "", coupleName: "", coupleId: "", category: "wedding", images: []
  });
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Load data on mount
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
    
    loadUserData();
    loadAllData();
  }, []);

  const loadUserData = () => {
    const name = localStorage.getItem("user_name");
    const email = localStorage.getItem("user_email");
    const phone = localStorage.getItem("user_phone") || "";
    const bio = localStorage.getItem("user_bio") || "";
    const location = localStorage.getItem("user_district") || "";
    const profileImage = localStorage.getItem("user_profile_image");
    
    setUser({ name, email, phone, bio, location, profileImage });
    setProfile({
      name: name || "", email: email || "", phone: phone || "", location: location || "",
      bio: bio || "", skills: "", experience: "",
      instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "", twitter: "",
      profileImage: profileImage || null, coverImage: null, availability: "available"
    });
    setProfileForm({
      name: name || "", email: email || "", phone: phone || "", location: location || "",
      bio: bio || "", skills: "", experience: "",
      instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "", twitter: "",
      profileImage: profileImage || null, coverImage: null, availability: "available"
    });
  };

  const loadAllData = () => {
    loadAssignedEvents();
    loadVideos();
    loadPosts();
    loadGallery();
    loadNotifications();
    loadMessages();
    loadReviews();
    loadFollowers();
    loadEarnings();
    loadProfileData();
    loadStats();
    setLoading(false);
  };

  const loadAssignedEvents = () => {
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const creatorEmail = localStorage.getItem("user_email");
    const assigned = allBookings.filter(b => 
      b.assignedCreator === creatorEmail || b.creatorId === creatorEmail
    );
    setAssignedEvents(assigned);
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

  const loadNotifications = () => {
    const stored = JSON.parse(localStorage.getItem("creator_notifications") || "[]");
    setNotifications(stored);
    const unread = stored.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const loadMessages = () => {
    const stored = JSON.parse(localStorage.getItem("creator_messages") || "[]");
    setMessages(stored);
  };

  const loadReviews = () => {
    const stored = JSON.parse(localStorage.getItem("creator_reviews") || "[]");
    setReviews(stored);
  };

  const loadFollowers = () => {
    const stored = JSON.parse(localStorage.getItem("creator_followers") || "[]");
    setFollowers(stored);
  };

  const loadEarnings = () => {
    const stored = JSON.parse(localStorage.getItem("creator_earnings") || "{}");
    setEarnings({
      total: stored.total || 2450000,
      monthly: stored.monthly || 450000,
      pending: stored.pending || 125000,
      history: stored.history || []
    });
  };

  const loadProfileData = () => {
    const stored = JSON.parse(localStorage.getItem("creator_profile") || "{}");
    setProfile(prev => ({ ...prev, ...stored }));
    setProfileForm(prev => ({ ...prev, ...stored }));
  };

  const loadStats = () => {
    const allVideos = videos;
    const totalViews = allVideos.reduce((sum, v) => sum + (v.views || 0), 0);
    const totalLikes = allVideos.reduce((sum, v) => sum + (v.likes || 0), 0);
    
    setStats({
      assignedEvents: assignedEvents.length,
      upcomingEvents: assignedEvents.filter(e => new Date(e.date) >= new Date()).length,
      completedProjects: assignedEvents.filter(e => e.status === "completed").length,
      totalVideos: videos.length,
      totalGalleries: gallery.length,
      totalEarnings: earnings.total,
      profileViews: 1250,
      portfolioViews: 3420,
      totalViews: totalViews,
      totalLikes: totalLikes,
      followers: followers.length,
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
    const newNotif = { id: Date.now(), title, message, type, read: false, time: new Date().toISOString() };
    const updated = [newNotif, ...notifications.slice(0, 49)];
    setNotifications(updated);
    localStorage.setItem("creator_notifications", JSON.stringify(updated));
    setUnreadCount(prev => prev + 1);
  };

  const markNotificationRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("creator_notifications", JSON.stringify(updated));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("creator_notifications", JSON.stringify(updated));
    setUnreadCount(0);
    toast("All notifications marked as read");
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("creator_notifications", JSON.stringify(updated));
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
    toast("Notification deleted");
  };

  const handleAcceptEvent = (eventId) => {
    const updated = assignedEvents.map(e => 
      e.id === eventId ? { ...e, status: "accepted", creatorConfirmed: true } : e
    );
    setAssignedEvents(updated);
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const updatedBookings = allBookings.map(b => 
      b.id === eventId ? { ...b, status: "accepted", creatorConfirmed: true } : b
    );
    localStorage.setItem("wedding_bookings", JSON.stringify(updatedBookings));
    addNotification("Event Accepted", `You accepted ${updated.find(e => e.id === eventId)?.name}'s event`, "success");
    toast("✅ Event accepted!");
  };

  const handleRejectEvent = (eventId) => {
    if (window.confirm("Are you sure you want to reject this event?")) {
      const updated = assignedEvents.filter(e => e.id !== eventId);
      setAssignedEvents(updated);
      const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
      const updatedBookings = allBookings.filter(b => b.id !== eventId);
      localStorage.setItem("wedding_bookings", JSON.stringify(updatedBookings));
      addNotification("Event Rejected", "You rejected an event assignment", "warning");
      toast("❌ Event rejected");
    }
  };

  const handleUploadVideo = () => {
    if (!videoForm.title || !videoForm.coupleName || !videoForm.videoUrl) {
      toast("Please fill all required fields", "#ef4444");
      return;
    }
    
    if (videoForm.accessType === "support" && (!videoForm.supportAmount || videoForm.supportAmount < 1000)) {
      toast("Please set a support amount (minimum 1,000 RWF)", "#ef4444");
      return;
    }
    
    const finalUrl = convertToEmbedUrl(videoForm.videoUrl);
    if (!finalUrl.includes("youtube.com/embed/")) {
      toast("Invalid YouTube URL", "#ef4444");
      return;
    }
    
    updateCoupleWithVideo(videoForm.coupleName, videoForm.eventType, finalUrl, videoForm.thumbnail);
    
    const newVideo = {
      id: Date.now(),
      title: videoForm.title,
      coupleName: videoForm.coupleName,
      coupleId: videoForm.coupleName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      eventType: videoForm.eventType,
      videoUrl: finalUrl,
      thumbnail: videoForm.thumbnail,
      description: videoForm.description,
      accessType: videoForm.accessType,
      supportAmount: videoForm.supportAmount,
      views: 0,
      likes: 0,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    const updated = [...videos, newVideo];
    setVideos(updated);
    localStorage.setItem("creator_videos", JSON.stringify(updated));
    
    const platformVideos = JSON.parse(localStorage.getItem("platform_videos") || "[]");
    localStorage.setItem("platform_videos", JSON.stringify([...platformVideos, newVideo]));
    
    addNotification("Video uploaded", `${videoForm.title} is pending admin approval`, "success");
    setShowVideoModal(false);
    setVideoForm({ 
      title: "", coupleName: "", coupleId: "", eventType: "dote", videoUrl: "", 
      thumbnail: null, description: "", accessType: "free", supportAmount: 5000, visibility: "public"
    });
    setThumbnailPreview(null);
    toast("✅ Video uploaded! Waiting for admin approval.");
  };

  const handleDeleteVideo = (id) => {
    if (window.confirm("Delete this video?")) {
      const updated = videos.filter(v => v.id !== id);
      setVideos(updated);
      localStorage.setItem("creator_videos", JSON.stringify(updated));
      addNotification("Video deleted", "A video has been removed", "info");
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
      ...postForm,
      author: user?.name,
      authorRole: "creator",
      views: 0,
      likes: 0,
      comments: [],
      tags: postForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };
    
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem("creator_posts", JSON.stringify(updated));
    addNotification("Post created", postForm.title, "success");
    setShowPostModal(false);
    setPostForm({ title: "", content: "", category: "wedding", image: null, tags: "" });
    toast("✅ Post published!");
  };

  const handleDeletePost = (id) => {
    if (window.confirm("Delete this post?")) {
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);
      localStorage.setItem("creator_posts", JSON.stringify(updated));
      addNotification("Post deleted", "A post has been removed", "info");
      toast("✅ Post deleted!");
    }
  };

  const handleCreateGallery = () => {
    if (!galleryForm.title || galleryForm.images.length === 0) {
      toast("Please add title and at least one image", "#ef4444");
      return;
    }
    
    const newAlbum = {
      id: Date.now(),
      ...galleryForm,
      creatorId: user?.email,
      creatorName: user?.name,
      createdAt: new Date().toISOString()
    };
    
    const updated = [newAlbum, ...gallery];
    setGallery(updated);
    localStorage.setItem("creator_gallery", JSON.stringify(updated));
    addNotification("Gallery created", galleryForm.title, "success");
    setShowGalleryModal(false);
    setGalleryForm({ title: "", coupleName: "", coupleId: "", category: "wedding", images: [] });
    setGalleryPreview([]);
    toast("✅ Gallery created!");
  };

  const handleDeleteGallery = (id) => {
    if (window.confirm("Delete this gallery?")) {
      const updated = gallery.filter(g => g.id !== id);
      setGallery(updated);
      localStorage.setItem("creator_gallery", JSON.stringify(updated));
      toast("✅ Gallery deleted!");
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    addNotification("Message sent", `Reply sent to ${selectedMessage?.sender}`, "success");
    setShowMessageModal(false);
    setReplyText("");
    toast("✅ Reply sent!");
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
        setVideoForm({ ...videoForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageUpload = (e) => {
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

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profileImage: reader.result });
        localStorage.setItem("creator_profile_image", reader.result);
        toast("✅ Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    localStorage.setItem("creator_profile", JSON.stringify(profileForm));
    localStorage.setItem("user_name", profileForm.name);
    localStorage.setItem("user_phone", profileForm.phone);
    localStorage.setItem("user_bio", profileForm.bio);
    localStorage.setItem("user_district", profileForm.location);
    setProfile(profileForm);
    addNotification("Profile updated", "Your profile has been updated", "success");
    setShowProfileModal(false);
    toast("✅ Profile updated!");
  };

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
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .stats-grid { grid-templateColumns: repeat(3, 1fr) !important; }
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
    eventCard: { background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "16px", marginBottom: 12, transition: "all 0.2s" },
    videoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 },
    videoCard: { background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, overflow: "hidden", transition: "all 0.2s" },
    videoImage: { width: "100%", height: "160px", objectFit: "cover" },
    postGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 },
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
    emptyIcon: { fontSize: "48px", marginBottom: 16 }
  };

  if (loading) {
    return <div style={{ ...styles.container, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading dashboard...</div>;
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
          <h1 style={styles.heroTitle}>🎬 Creator Dashboard</h1>
          <p style={styles.heroSubtitle}>Welcome back, {user?.name}! Manage your events, videos, and content from one place.</p>
        </div>

        {/* ─── STATS BAR ─── */}
        <div style={styles.statsBar}>
          <div className="stats-grid" style={styles.statsGrid}>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.assignedEvents}</div><div style={styles.statLabel}>Assigned Events</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.upcomingEvents}</div><div style={styles.statLabel}>Upcoming</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.completedProjects}</div><div style={styles.statLabel}>Completed</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.totalVideos}</div><div style={styles.statLabel}>Videos</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.totalGalleries}</div><div style={styles.statLabel}>Galleries</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{stats.totalEarnings.toLocaleString()} RWF</div><div style={styles.statLabel}>Earnings</div></div>
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="main-grid" style={styles.mainGrid}>

          {/* ─── SIDEBAR ─── */}
          <aside className="sidebar" style={styles.sidebar}>
            <button className="close-sidebar" onClick={() => setMobileMenuOpen(false)} style={{ display: 'none' }}>✕</button>
            
            {/* Creator Profile Mini */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: Y, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: BLK }}>
                {user?.name?.charAt(0) || "U"}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h3>
              <p style={{ fontSize: 12, color: textMuted }}>{user?.email}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: profile.availability === "available" ? "#28a745" : "#dc3545" }} />
                <span style={{ fontSize: 12 }}>{profile.availability === "available" ? "Available" : "Busy"}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sidebarTitle}>📊 Quick Stats</div>
              <div style={styles.sidebarItem}><FaEye style={{ color: Y }} /> <span>Profile Views: {stats.profileViews}</span></div>
              <div style={styles.sidebarItem}><FaHeart style={{ color: Y }} /> <span>Total Likes: {stats.totalLikes}</span></div>
              <div style={styles.sidebarItem}><FaUsers style={{ color: Y }} /> <span>Followers: {stats.followers}</span></div>
              <div style={styles.sidebarItem}><FaChartLine style={{ color: Y }} /> <span>Engagement: {stats.engagement}%</span></div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 20 }}>
              <div style={styles.sidebarTitle}>⚡ Quick Actions</div>
              <button onClick={() => setShowVideoModal(true)} style={{ ...styles.btnPrimary, width: "100%", marginBottom: 8 }}><FaUpload /> Upload Video</button>
              <button onClick={() => setShowPostModal(true)} style={{ ...styles.btnOutline, width: "100%", marginBottom: 8 }}><FaEdit /> Create Post</button>
              <button onClick={() => setShowGalleryModal(true)} style={{ ...styles.btnOutline, width: "100%" }}><FaImage /> Create Gallery</button>
            </div>

            {/* Navigation Links */}
            <div>
              <div style={styles.sidebarTitle}>🔗 Quick Links</div>
              <Link to="/profile"><div style={styles.sidebarItem}><FaUserFriends /> My Profile</div></Link>
              <Link to="/booking"><div style={styles.sidebarItem}><FaCalendar /> Bookings</div></Link>
              <Link to="/contact"><div style={styles.sidebarItem}><FaEnvelope /> Support</div></Link>
            </div>
          </aside>

          {/* ─── MAIN CONTENT ─── */}
          <main style={styles.content}>

            {/* Tabs */}
            <div style={styles.tabs}>
              {["dashboard", "events", "videos", "posts", "gallery", "messages", "earnings", "profile"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="tab" style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}>
                  {tab === "dashboard" && "📊 Dashboard"}
                  {tab === "events" && "📅 Events"}
                  {tab === "videos" && "🎬 Videos"}
                  {tab === "posts" && "📝 Posts"}
                  {tab === "gallery" && "🖼️ Gallery"}
                  {tab === "messages" && `💬 Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                  {tab === "earnings" && "💰 Earnings"}
                  {tab === "profile" && "👤 Profile"}
                </button>
              ))}
            </div>

            {/* ─── DASHBOARD TAB with NOTIFICATIONS ─── */}
            {activeTab === "dashboard" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📊 Dashboard Overview</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.totalViews.toLocaleString()}</div><div style={styles.statLabel}>Total Views</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.totalLikes.toLocaleString()}</div><div style={styles.statLabel}>Total Likes</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.portfolioViews}</div><div style={styles.statLabel}>Portfolio Views</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{stats.followers}</div><div style={styles.statLabel}>Followers</div></div>
                </div>
                
                {/* NOTIFICATION CENTER */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                      <FaBell style={{ color: Y }} /> Notifications
                      {unreadCount > 0 && <span style={{ background: "#dc3545", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: 11 }}>{unreadCount} new</span>}
                    </h3>
                    {notifications.length > 0 && (
                      <button onClick={markAllNotificationsRead} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
                        <FaCheck /> Mark all as read
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🔔</div>
                      <div>No notifications yet</div>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(notif => (
                      <div key={notif.id} style={{ ...styles.notificationCard, background: notif.read ? "transparent" : `${Y}10`, borderLeft: notif.read ? "none" : `3px solid ${Y}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1, cursor: "pointer" }} onClick={() => markNotificationRead(notif.id)}>
                            <div style={{ fontWeight: 600 }}>{notif.title}</div>
                            <div style={{ fontSize: 12, color: textMuted }}>{notif.message}</div>
                            <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>{new Date(notif.time).toLocaleDateString()}</div>
                          </div>
                          <button onClick={() => deleteNotification(notif.id)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", padding: "4px" }}>
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {notifications.length > 5 && (
                    <div style={{ textAlign: "center", marginTop: 12 }}>
                      <button onClick={() => setActiveTab("messages")} style={styles.btnOutline}>View all {notifications.length} notifications →</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── EVENTS TAB ─── */}
            {activeTab === "events" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📅 Assigned Events</h2>
                {assignedEvents.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>📅</div><div>No events assigned yet</div></div>
                ) : (
                  assignedEvents.map(event => (
                    <div key={event.id} className="card-animate" style={styles.eventCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{event.name}</h3>
                          <p style={{ fontSize: 13, color: textMuted }}>{event.package} • {event.eventType || "Wedding"}</p>
                          <p style={{ fontSize: 12, color: textMuted, marginTop: 4 }}><FaCalendar /> {new Date(event.date).toLocaleDateString()} • 📍 {event.location}</p>
                          <p style={{ fontSize: 12, color: textMuted }}>👤 {event.email} • 📞 {event.phone}</p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {event.status !== "accepted" && (
                            <>
                              <button onClick={() => handleAcceptEvent(event.id)} style={styles.btnSuccess}>✅ Accept</button>
                              <button onClick={() => handleRejectEvent(event.id)} style={styles.btnDanger}>❌ Reject</button>
                            </>
                          )}
                          {event.status === "accepted" && <span style={{ ...styles.btnSuccess, background: "#28a745", cursor: "default" }}>✓ Accepted</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── VIDEOS TAB ─── */}
            {activeTab === "videos" && (
              <div style={styles.section}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <h2 style={styles.sectionTitle}>🎬 My Videos</h2>
                  <button onClick={() => setShowVideoModal(true)} style={styles.btnPrimary}><FaUpload /> Upload Video</button>
                </div>
                {videos.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>🎬</div><div>No videos yet. Upload your first video!</div></div>
                ) : (
                  <div style={styles.videoGrid}>
                    {videos.map(video => (
                      <div key={video.id} className="card-animate" style={styles.videoCard}>
                        <img src={video.thumbnail || "https://via.placeholder.com/300x160?text=Video"} alt={video.title} style={styles.videoImage} />
                        <div style={{ padding: 12 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{video.title}</h3>
                          <p style={{ fontSize: 12, color: textMuted }}>{video.coupleName} • {video.eventType}</p>
                          <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}><FaEye /> {video.views || 0} views • <FaHeart /> {video.likes || 0} likes</p>
                          {video.accessType === "support" && (
                            <div style={{ marginTop: 6 }}>
                              <span style={{ background: Y, color: BLK, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, display: "inline-block" }}>
                                ❤️ Support Video • {video.supportAmount?.toLocaleString()} RWF
                              </span>
                            </div>
                          )}
                          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: video.status === "published" ? "#28a74520" : "#ffc10720", color: video.status === "published" ? "#28a745" : "#ffc107", marginTop: 8 }}>
                            {video.status === "published" ? "Published" : "Pending"}
                          </span>
                          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button onClick={() => handleDeleteVideo(video.id)} style={styles.btnDanger}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── POSTS TAB ─── */}
            {activeTab === "posts" && (
              <div style={styles.section}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <h2 style={styles.sectionTitle}>📝 My Posts</h2>
                  <button onClick={() => setShowPostModal(true)} style={styles.btnPrimary}><FaEdit /> Create Post</button>
                </div>
                {posts.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>📝</div><div>No posts yet. Create your first post!</div></div>
                ) : (
                  <div style={styles.postGrid}>
                    {posts.map(post => (
                      <div key={post.id} className="card-animate" style={styles.postCard}>
                        {post.image && <img src={post.image} alt={post.title} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />}
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{post.title}</h3>
                        <p style={{ fontSize: 12, color: textMuted }}>{post.category} • {new Date(post.createdAt).toLocaleDateString()}</p>
                        <p style={{ fontSize: 13, color: textMuted, marginTop: 8, lineHeight: 1.5 }}>{post.content?.substring(0, 100)}...</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button onClick={() => handleDeletePost(post.id)} style={styles.btnDanger}>Delete</button>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <h2 style={styles.sectionTitle}>🖼️ My Galleries</h2>
                  <button onClick={() => setShowGalleryModal(true)} style={styles.btnPrimary}><FaImage /> Create Gallery</button>
                </div>
                {gallery.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>🖼️</div><div>No galleries yet. Create your first gallery!</div></div>
                ) : (
                  gallery.map(album => (
                    <div key={album.id} style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{album.title}</h3>
                      <p style={{ fontSize: 12, color: textMuted, marginBottom: 12 }}>{album.category} • {album.images.length} images</p>
                      <div style={styles.galleryGrid}>
                        {album.images.slice(0, 4).map((img, idx) => (
                          <img key={idx} src={img} alt={`Gallery ${idx}`} style={styles.galleryImage} />
                        ))}
                      </div>
                      <button onClick={() => handleDeleteGallery(album.id)} style={{ ...styles.btnDanger, marginTop: 12 }}>Delete Gallery</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── MESSAGES TAB ─── */}
            {activeTab === "messages" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>💬 Messages</h2>
                {messages.length === 0 ? (
                  <div style={styles.emptyState}><div style={styles.emptyIcon}>💬</div><div>No messages yet</div></div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} style={{ ...styles.notificationCard, background: msg.read ? "transparent" : `${Y}10` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{msg.sender}</div>
                          <div style={{ fontSize: 13, color: textMuted, marginTop: 4 }}>{msg.message}</div>
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{new Date(msg.time).toLocaleDateString()}</div>
                        </div>
                        <button onClick={() => { setSelectedMessage(msg); setShowMessageModal(true); }} style={styles.btnOutline}>Reply</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── EARNINGS TAB ─── */}
            {activeTab === "earnings" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>💰 Earnings Overview</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <div style={styles.statCard}><div style={styles.statValue}>{earnings.total.toLocaleString()} RWF</div><div style={styles.statLabel}>Total Earnings</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{earnings.monthly.toLocaleString()} RWF</div><div style={styles.statLabel}>This Month</div></div>
                  <div style={styles.statCard}><div style={styles.statValue}>{earnings.pending.toLocaleString()} RWF</div><div style={styles.statLabel}>Pending Payouts</div></div>
                </div>
                <button style={styles.btnPrimary}>Request Withdrawal</button>
              </div>
            )}

            {/* ─── PROFILE TAB ─── */}
            {activeTab === "profile" && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>👤 Profile Settings</h2>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: BLK }}>
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{user?.name}</h3>
                      <p style={{ color: textMuted }}>{user?.email}</p>
                      <button onClick={() => setShowProfileModal(true)} style={styles.btnOutline}>Edit Profile</button>
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div><label style={styles.label}>Phone</label><input value={user?.phone || ""} disabled style={styles.input} /></div>
                    <div><label style={styles.label}>Location</label><input value={user?.location || ""} disabled style={styles.input} /></div>
                  </div>
                  <div><label style={styles.label}>Bio</label><textarea value={user?.bio || ""} disabled rows="3" style={styles.textarea} /></div>
                </div>
                <button onClick={() => setShowProfileModal(true)} style={styles.btnPrimary}>Edit Profile</button>
              </div>
            )}

          </main>
        </div>

        {/* ─── UPLOAD VIDEO MODAL with Access Type & Support Amount ─── */}
        {showVideoModal && (
          <div style={styles.modal} onClick={() => setShowVideoModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Upload New Video</h2>
              
              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Title *</label>
                <input style={styles.input} placeholder="Video title" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} />
              </div>
              
              {/* Couple Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Couple Name *</label>
                <input style={styles.input} placeholder="e.g., Eric & Diane" value={videoForm.coupleName} onChange={e => setVideoForm({...videoForm, coupleName: e.target.value})} />
              </div>
              
              {/* Event Type */}
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Event Type</label>
                <select style={styles.input} value={videoForm.eventType} onChange={e => setVideoForm({...videoForm, eventType: e.target.value})}>
                  <option value="dote">DOTE Ceremony</option>
                  <option value="church">Church Wedding</option>
                  <option value="reception">Reception</option>
                  <option value="traditional">Traditional Dance</option>
                </select>
              </div>
              
              {/* YouTube URL */}
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>YouTube URL *</label>
                <input style={styles.input} placeholder="https://youtu.be/..." value={videoForm.videoUrl} onChange={e => setVideoForm({...videoForm, videoUrl: e.target.value})} />
              </div>
              
              {/* Thumbnail */}
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Thumbnail</label>
                <div style={{ border: `2px dashed ${borderColor}`, borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("thumbInput")?.click()}>
                  {thumbnailPreview ? <img src={thumbnailPreview} style={{ maxHeight: 100, margin: "0 auto" }} alt="preview" /> : "Click to upload thumbnail"}
                  <input id="thumbInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>
              
              {/* ACCESS TYPE SELECTION */}
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Access Type</label>
                <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="accessType"
                      value="free"
                      checked={videoForm.accessType === "free"}
                      onChange={() => setVideoForm({...videoForm, accessType: "free", supportAmount: 0})}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    <span>🎬 Free Content</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="accessType"
                      value="support"
                      checked={videoForm.accessType === "support"}
                      onChange={() => setVideoForm({...videoForm, accessType: "support"})}
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    <span>❤️ Support Content (Users pay to watch)</span>
                  </label>
                </div>
              </div>
              
              {/* SUPPORT AMOUNT - only shown when accessType is "support" */}
              {videoForm.accessType === "support" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={styles.label}>Support Amount (RWF) *</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    {[2000, 5000, 10000, 20000].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setVideoForm({...videoForm, supportAmount: amount})}
                        style={{
                          padding: "8px 16px",
                          background: videoForm.supportAmount === amount ? Y : "transparent",
                          color: videoForm.supportAmount === amount ? BLK : textColor,
                          border: `1px solid ${videoForm.supportAmount === amount ? Y : borderColor}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 13
                        }}
                      >
                        {amount.toLocaleString()} RWF
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Custom amount (RWF)"
                    value={videoForm.supportAmount}
                    onChange={e => setVideoForm({...videoForm, supportAmount: parseInt(e.target.value) || 0})}
                    style={{ ...styles.input, marginBottom: 8 }}
                  />
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 4, padding: "8px", background: `${Y}15`, borderRadius: 8 }}>
                    💡 <strong>Revenue Split:</strong> Couple gets <strong style={{ color: Y }}>60%</strong> ({(videoForm.supportAmount * 0.6).toLocaleString()} RWF) | 
                    Platform gets <strong style={{ color: Y }}>40%</strong> ({(videoForm.supportAmount * 0.4).toLocaleString()} RWF)
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} rows="3" placeholder="Video description..." value={videoForm.description} onChange={e => setVideoForm({...videoForm, description: e.target.value})} />
              </div>
              
              {/* Buttons */}
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
              <h2 style={{ marginBottom: 20 }}>Create New Post</h2>
              <label style={styles.label}>Title *</label>
              <input style={styles.input} placeholder="Post title" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                <option value="wedding">Wedding</option>
                <option value="announcement">Announcement</option>
                <option value="tips">Tips</option>
              </select>
              <label style={styles.label}>Content *</label>
              <textarea style={styles.textarea} rows="5" placeholder="Write your post..." value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <label style={styles.label}>Image URL</label>
              <input style={styles.input} placeholder="https://..." value={postForm.image} onChange={e => setPostForm({...postForm, image: e.target.value})} />
              <label style={styles.label}>Tags (comma separated)</label>
              <input style={styles.input} placeholder="#Wedding, #Kigali" value={postForm.tags} onChange={e => setPostForm({...postForm, tags: e.target.value})} />
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleCreatePost} style={{ ...styles.btnPrimary, flex: 1 }}>Publish</button>
                <button onClick={() => setShowPostModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Gallery Modal */}
        {showGalleryModal && (
          <div style={styles.modal} onClick={() => setShowGalleryModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Create New Gallery</h2>
              <label style={styles.label}>Gallery Title *</label>
              <input style={styles.input} placeholder="Gallery title" value={galleryForm.title} onChange={e => setGalleryForm({...galleryForm, title: e.target.value})} />
              <label style={styles.label}>Category</label>
              <select style={styles.input} value={galleryForm.category} onChange={e => setGalleryForm({...galleryForm, category: e.target.value})}>
                <option value="wedding">Wedding</option>
                <option value="dote">DOTE</option>
                <option value="reception">Reception</option>
              </select>
              <label style={styles.label}>Images</label>
              <div style={{ border: `2px dashed ${borderColor}`, borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("galleryInput")?.click()}>
                {galleryPreview.length > 0 ? `${galleryPreview.length} images selected` : "Click to upload images"}
                <input id="galleryInput" type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleGalleryImageUpload} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleCreateGallery} style={{ ...styles.btnPrimary, flex: 1 }}>Create Gallery</button>
                <button onClick={() => setShowGalleryModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showProfileModal && (
          <div style={styles.modal} onClick={() => setShowProfileModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Edit Profile</h2>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: BLK, cursor: "pointer" }} onClick={() => document.getElementById("profileImage")?.click()}>
                  {profileForm.name?.charAt(0) || "U"}
                </div>
                <input id="profileImage" type="file" style={{ display: "none" }} accept="image/*" onChange={handleProfileImageUpload} />
              </div>
              <div style={styles.row}>
                <div><label style={styles.label}>Name *</label><input style={styles.input} value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} /></div>
                <div><label style={styles.label}>Email</label><input style={styles.input} value={profileForm.email} disabled /></div>
                <div><label style={styles.label}>Phone</label><input style={styles.input} value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></div>
                <div><label style={styles.label}>Location</label><input style={styles.input} value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} /></div>
              </div>
              <label style={styles.label}>Bio</label><textarea style={styles.textarea} rows="3" value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
              <label style={styles.label}>Skills</label><input style={styles.input} placeholder="Videography, Editing, Drone" value={profileForm.skills} onChange={e => setProfileForm({...profileForm, skills: e.target.value})} />
              <label style={styles.label}>Experience</label><select style={styles.input} value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: e.target.value})}>
                <option value="">Select</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
              <label style={styles.label}>Availability</label><select style={styles.input} value={profileForm.availability} onChange={e => setProfileForm({...profileForm, availability: e.target.value})}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleUpdateProfile} style={{ ...styles.btnPrimary, flex: 1 }}>Save Changes</button>
                <button onClick={() => setShowProfileModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Reply Message Modal */}
        {showMessageModal && selectedMessage && (
          <div style={styles.modal} onClick={() => setShowMessageModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: 20 }}>Reply to {selectedMessage.sender}</h2>
              <textarea style={styles.textarea} rows="5" placeholder="Type your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button onClick={handleSendReply} style={{ ...styles.btnPrimary, flex: 1 }}>Send Reply</button>
                <button onClick={() => setShowMessageModal(false)} style={styles.btnOutline}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}