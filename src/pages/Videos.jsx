// src/pages/Videos.jsx
// SHINECONNECT - Videos Page
// Colors: Black (#000), White (#fff), Gold (#FFD700)

import { useEffect, useRef, useState } from "react";
import { FaCalendar, FaEye, FaHeart, FaImage, FaLock, FaRegHeart, FaSearch, FaShare, FaTimes, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAllVideos, incrementVideoViews, supportCouple, uploadVideo } from "../services/api";

// ─── CONSTANTS ─────────────────────────────────────────────────────
const Y = "#FFD700";
const BLK = "#000000";
const WHT = "#ffffff";

const CATEGORIES = [
  { id: "all", label: "All Videos", icon: "🎬" },
  { id: "wedding", label: "Wedding", icon: "💍" },
  { id: "dote", label: "DOTE", icon: "🪘" },
  { id: "birthday", label: "Birthday", icon: "🎂" },
  { id: "funeral", label: "Funeral", icon: "🕊️" },
  { id: "graduation", label: "Graduation", icon: "🎓" },
  { id: "corporate", label: "Corporate", icon: "🏢" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: "📅" },
  { value: "popular", label: "Popular", icon: "🔥" },
  { value: "oldest", label: "Oldest", icon: "📅" },
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
  setTimeout(() => el.remove(), 3000);
};

// ─── HELPER ────────────────────────────────────────────────────────
const getEventInfo = (type) => {
  const types = {
    wedding: { icon: "💍", label: "Wedding" },
    dote: { icon: "🪘", label: "DOTE" },
    birthday: { icon: "🎂", label: "Birthday" },
    funeral: { icon: "🕊️", label: "Funeral" },
    graduation: { icon: "🎓", label: "Graduation" },
    corporate: { icon: "🏢", label: "Corporate" },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: "",
    videoUrl: "",
    thumbnail: null,
    thumbnailPreview: null,
    eventType: "wedding",
    accessType: "free",
    supportAmount: "5000"
  });
  
  // Support Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [supportAmount, setSupportAmount] = useState(5000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [purchasedVideos, setPurchasedVideos] = useState([]);
  const [coupleSupportCounts, setCoupleSupportCounts] = useState({});

  // ─── Drag & Drop Handlers ────────────────────────────────────────
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.style.borderColor = Y;
      dropAreaRef.current.style.background = "rgba(255,215,0,0.05)";
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.style.borderColor = "#e8e8e8";
      dropAreaRef.current.style.background = "transparent";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current) {
      dropAreaRef.current.style.borderColor = "#e8e8e8";
      dropAreaRef.current.style.background = "transparent";
    }
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageFile(file);
      } else {
        toast('Please drop an image file', '#ef4444');
      }
    }
  };

  const handleImageFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be less than 5MB', '#ef4444');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadForm(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: reader.result
      }));
      toast('Image uploaded successfully! ✅', '#22c55e');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const removeImage = () => {
    setUploadForm(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─── Lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    
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
    
    const purchased = JSON.parse(localStorage.getItem("user_purchased_videos") || "[]");
    setPurchasedVideos(purchased);
    
    fetchVideos();
    loadCoupleSupportCounts();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, category, searchTerm, sortBy]);

  // ─── Data Fetching ───────────────────────────────────────────────
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos(1, 100, {});
      
      if (data.success && data.videos) {
        const formattedVideos = data.videos.map(v => ({
          id: v.id,
          coupleId: v.couple?.id || v.userId,
          coupleName: v.couple?.user?.name || v.user?.name || "SHINECONNECT",
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
        toast('Failed to load videos', "#ef4444");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast('Error loading videos. Please refresh.', "#ef4444");
    } finally {
      setLoading(false);
    }
  };

  const loadCoupleSupportCounts = async () => {
    try {
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

  // ─── Filter & Sort ──────────────────────────────────────────────
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

  // ─── Actions ──────────────────────────────────────────────────────
  const handleLike = async (videoId) => {
    if (!isLoggedIn) { toast('Please login to like', "#ef4444"); return; }
    const isLiked = !likedVideos[videoId];
    setLikedVideos(prev => ({ ...prev, [videoId]: isLiked }));
    toast(isLiked ? 'Liked! ❤️' : 'Unliked');
  };

  const handleShare = async (video) => {
    const url = `${window.location.origin}/video/${video.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied! 📋');
    } catch (err) {
      toast('Copy the link from your browser');
    }
  };

  const hasAccess = (video) => {
    if (video.accessType !== "support" && video.accessType !== "premium") return true;
    return purchasedVideos.some(p => p.videoId === video.id);
  };
  
  const canSupport = () => isLoggedIn && userRole === "CLIENT";

  const handleSupportClick = async (video) => {
    if (!isLoggedIn) {
      toast('Please login to support', "#ef4444");
      setTimeout(() => { window.location.href = "/login"; }, 1000);
      return;
    }
    
    if (userRole !== "CLIENT") {
      toast('Only clients can support couples', "#ef4444");
      return;
    }
    
    if (hasAccess(video)) {
      try {
        await incrementVideoViews(video.id);
        window.open(video.videoUrl, "_blank");
      } catch (error) {
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
      toast('Minimum amount is 1,000 RWF', "#ef4444");
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
        toast(`✅ Supported ${selectedVideo.coupleName} with ${supportAmount.toLocaleString()} RWF!`, '#22c55e');
        
        setTimeout(async () => {
          try {
            await incrementVideoViews(selectedVideo.id);
            window.open(selectedVideo.videoUrl, "_blank");
          } catch (err) {
            window.open(selectedVideo.videoUrl, "_blank");
          }
        }, 500);
      } else {
        toast(result.message || 'Support failed', "#ef4444");
      }
    } catch (error) {
      console.error("Support error:", error);
      toast('Error processing support', "#ef4444");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast('Please login to upload', '#ef4444');
      return;
    }

    if (!uploadForm.title.trim() || !uploadForm.videoUrl.trim()) {
      toast('Please add a title and video link', '#ef4444');
      return;
    }

    try {
      setUploading(true);
      const storedCoupleId = Number(localStorage.getItem('couple_profile_id'));
      
      // Prepare thumbnail - use uploaded image or fallback
      let thumbnailUrl = uploadForm.thumbnailPreview || '';
      
      const payload = {
        title: uploadForm.title,
        videoUrl: uploadForm.videoUrl,
        thumbnail: thumbnailUrl,
        eventType: uploadForm.eventType,
        accessType: uploadForm.accessType,
        supportAmount: uploadForm.accessType === 'support' ? uploadForm.supportAmount : 0,
        price: uploadForm.accessType === 'premium' ? uploadForm.supportAmount : 0,
        creatorId: userId,
        creatorName: localStorage.getItem('user_name') || 'Creator',
        ...(Number.isFinite(storedCoupleId) && storedCoupleId > 0 ? { coupleId: storedCoupleId } : {})
      };

      const result = await uploadVideo(payload);
      if (result.success) {
        toast('Video uploaded successfully! 🎉', '#22c55e');
        setShowUploadModal(false);
        setUploadForm({ 
          title: '', 
          videoUrl: '', 
          thumbnail: null, 
          thumbnailPreview: null,
          eventType: 'wedding', 
          accessType: 'free', 
          supportAmount: '5000' 
        });
        fetchVideos();
      } else {
        toast(result.message || 'Upload failed', '#ef4444');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast('Upload failed. Please try again.', '#ef4444');
    } finally {
      setUploading(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
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
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);

  // ─── Styles ──────────────────────────────────────────────────────
  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#000";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

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
    categoryActive: { background: `#FFD70020`, color: Y, fontWeight: 600 },
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
    playButton: { width: 50, height: 50, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", color: BLK, fontSize: 20, cursor: "pointer" },
    videoType: { position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.7)", color: WHT, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
    supportBadge: { position: "absolute", top: 12, right: 12, background: Y, color: BLK, padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 },
    creatorBadge: { position: "absolute", bottom: 12, right: 12, background: "#3b82f6", color: WHT, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700 },
    lockedOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 },
    videoInfo: { padding: "14px 16px" },
    videoCardTitle: { fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 6, lineHeight: 1.4 },
    videoMeta: { display: "flex", gap: 16, fontSize: 12, color: textMuted, marginBottom: 10, flexWrap: "wrap" },
    supportStats: { display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: Y, marginTop: 6 },
    videoActions: { display: "flex", gap: 16, padding: "12px 16px 16px", borderTop: `1px solid ${borderColor}`, flexWrap: "wrap" },
    actionBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: textMuted, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", padding: "6px 10px", borderRadius: 8 },
    supportBtn: { background: Y, color: BLK, fontWeight: 700, padding: "8px 16px", borderRadius: 20 },
    supportBtnDisabled: { background: "#6c757d", color: WHT, cursor: "not-allowed", opacity: 0.6 },
    noResults: { textAlign: "center", padding: "60px 20px", background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}` },
    noResultsIcon: { fontSize: 64, marginBottom: 20 },
    resetBtn: { marginTop: 16, padding: "10px 24px", background: Y, color: BLK, border: "none", borderRadius: 30, cursor: "pointer", fontWeight: 600 },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" },
    modalBox: { background: cardBg, borderRadius: "20px", padding: "28px", maxWidth: "500px", width: "100%", textAlign: "center", maxHeight: "90vh", overflowY: "auto" },
    modalTitle: { fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: textColor },
    modalText: { fontSize: "13px", color: textMuted, marginBottom: "20px", lineHeight: 1.6 },
    amountBtn: { padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "14px", transition: "all 0.2s" },
    input: { width: "100%", padding: "12px", border: `1.5px solid ${borderColor}`, borderRadius: "10px", fontSize: "16px", background: darkMode ? "#333" : "#fff", color: textColor, outline: "none", textAlign: "center", boxSizing: "border-box" },
    radioGroup: { display: "flex", gap: "15px", justifyContent: "center", marginBottom: "20px" },
    radioLabel: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" },
    revenueInfo: { background: `#FFD70015`, borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "12px" },
    splitAmount: { fontWeight: 700, color: Y },
    btnPrimary: { padding: "12px 24px", background: Y, color: BLK, border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "15px", width: "100%" },
    btnOutline: { padding: "10px 20px", background: "transparent", color: textColor, border: `1px solid ${borderColor}`, borderRadius: "10px", cursor: "pointer", fontSize: "14px", width: "100%" },
    // Upload specific styles
    dropArea: {
      border: `2px dashed ${borderColor}`,
      borderRadius: "12px",
      padding: "30px 20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "transparent",
      marginBottom: "12px",
      position: "relative"
    },
    dropAreaActive: {
      borderColor: Y,
      background: "rgba(255,215,0,0.05)"
    },
    dropIcon: {
      fontSize: "40px",
      color: Y,
      marginBottom: "8px"
    },
    dropText: {
      fontSize: "14px",
      color: textMuted,
      marginBottom: "4px"
    },
    dropSubtext: {
      fontSize: "12px",
      color: textMuted,
      opacity: 0.7
    },
    thumbnailPreview: {
      width: "100%",
      maxHeight: "150px",
      objectFit: "cover",
      borderRadius: "8px",
      marginBottom: "10px"
    },
    removeImageBtn: {
      position: "absolute",
      top: "8px",
      right: "8px",
      background: "rgba(0,0,0,0.7)",
      color: WHT,
      border: "none",
      borderRadius: "50%",
      width: "28px",
      height: "28px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px"
    }
  };

  const css = `
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .card-animate { animation: fadeIn 0.35s ease both; }
    .card-animate:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
    .video-card:hover .play-overlay { opacity: 1 !important; }
    .video-card:hover .video-image { transform: scale(1.05) !important; }
    input:focus, select:focus, textarea:focus { border-color: #FFD700 !important; box-shadow: 0 0 0 3px rgba(255,215,0,0.15) !important; outline:none; }
    
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
    
    .mobile-menu-btn { display: none; position: fixed; bottom: 20px; right: 20px; background: #FFD700; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; z-index: 1001; box-shadow: 0 4px 12px rgba(0,0,0,0.15); align-items: center; justify-content: center; }
    .close-sidebar { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; }
  `;

  if (loading) {
    return (
      <div style={{ ...styles.container, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ width: 50, height: 50, border: `4px solid ${borderColor}`, borderTop: `4px solid ${Y}`, borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 20 }} />
        <p style={{ color: textMuted }}>Loading videos...</p>
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
          <h1 className="hero-title" style={styles.heroTitle}>🎬 Videos</h1>
          <p style={styles.heroSubtitle}>Watch and support amazing wedding and event videos from across Rwanda</p>
        </div>

        {/* Stats */}
        <div style={styles.statsBar}>
          <div className="stats-grid" style={styles.statsGrid}>
            <div style={styles.statCard}><div style={styles.statValue}>{videos.length}</div><div style={styles.statLabel}>Total Videos</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{totalViews.toLocaleString()}</div><div style={styles.statLabel}>Total Views</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{CATEGORIES.length - 1}</div><div style={styles.statLabel}>Categories</div></div>
            <div style={styles.statCard}><div style={styles.statValue}>{trendingVideos.length}</div><div style={styles.statLabel}>Trending</div></div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="main-grid" style={styles.mainGrid}>

          {/* Sidebar */}
          <aside className="sidebar" style={styles.sidebar}>
            <button className="close-sidebar" onClick={() => setMobileMenuOpen(false)} style={{ display: 'none' }}>✕</button>
            
            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>🔍 Search</div>
              <div style={styles.searchBox}>
                <FaSearch style={styles.searchIcon} />
                <input type="text" placeholder="Search videos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
              </div>
            </div>

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

            <div style={{ marginBottom: 24 }}>
              <div style={styles.sidebarTitle}>🔀 Sort By</div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...styles.sortSelect, width: "100%" }}>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                ))}
              </select>
            </div>

            {trendingVideos.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={styles.sidebarTitle}>🔥 Trending</div>
                {trendingVideos.map(video => (
                  <Link key={video.id} to={`/video/${video.id}`} style={styles.trendingItem}>
                    <img src={video.image} alt={video.coupleName} style={styles.trendingImage} />
                    <div>
                      <div style={styles.trendingTitle}>{video.coupleName}</div>
                      <div style={styles.trendingViews}>{video.icon} {video.typeLabel} • {video.views.toLocaleString()} views</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div style={{ marginTop: 24, background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <h4 style={{ color: WHT, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Book Your Event</h4>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginBottom: 12 }}>Capture your special moments with us</p>
              <Link to="/booking">
                <button style={{ width: "100%", padding: "8px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>Book Now →</button>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-area" style={styles.mainArea}>
            <div style={styles.videoHeader}>
              <div>
                <h2 style={styles.videoTitle}>{getCategoryIcon()} {getCategoryLabel()}</h2>
                <p style={styles.videoCount}>{filteredVideos.length} videos found</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(searchTerm || category !== "all") && (
                  <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", fontSize: 12, color: textMuted }}>
                    ✕ Clear Filters
                  </button>
                )}
                {isLoggedIn && (userRole === 'ADMIN' || userRole === 'COUPLE' || userRole === 'couple' || userRole === 'admin') && (
                  <button onClick={() => setShowUploadModal(true)} style={{ padding: "8px 16px", background: Y, color: BLK, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                    + Upload Video
                  </button>
                )}
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <div style={styles.noResults}>
                <div style={styles.noResultsIcon}>🎬</div>
                <h3 style={{ marginBottom: 8 }}>No videos found</h3>
                <p style={{ color: textMuted }}>Try adjusting your search or filters</p>
                <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={styles.resetBtn}>Clear Filters</button>
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
                        <div style={styles.videoType}>{video.icon} {video.typeLabel}</div>
                        
                        {video.accessType === "support" && (
                          <div style={styles.supportBadge}>
                            ❤️ Support Video • {video.supportAmount?.toLocaleString()} RWF
                          </div>
                        )}

                        {video.accessType === "premium" && (
                          <div style={{ ...styles.supportBadge, background: "#22c55e", color: WHT }}>
                            🔒 Paid • {video.supportAmount?.toLocaleString() || video.price?.toLocaleString() || 0} RWF
                          </div>
                        )}

                        {video.accessType === "free" && (
                          <div style={{ ...styles.supportBadge, background: "rgba(34,197,94,0.16)", color: "#22c55e" }}>
                            ▶ Free
                          </div>
                        )}
                        
                        {video.source === "creator" && <div style={styles.creatorBadge}>🎬 Creator</div>}
                        
                        {video.accessType === "support" && !isAlreadyPurchased && (
                          <div className="locked-overlay" style={styles.lockedOverlay}>
                            <FaLock style={{ fontSize: 24, color: Y }} />
                            <span style={{ fontSize: 11, color: WHT }}>❤️ Support to Watch</span>
                          </div>
                        )}
                      </div>
                      
                      <div style={styles.videoInfo}>
                        <h3 style={styles.videoCardTitle}>{video.coupleName}</h3>
                        <div style={styles.videoMeta}>
                          <span><FaEye /> {video.views.toLocaleString()} views</span>
                          <span><FaHeart /> {video.likes} likes</span>
                          <span><FaCalendar /> {new Date(video.date).toLocaleDateString()}</span>
                        </div>
                        
                        {supportCount > 0 && (
                          <div style={styles.supportStats}>
                            <span>❤️ {supportCount} supporters</span>
                            <span>💰 {supportTotal.toLocaleString()} RWF raised</span>
                          </div>
                        )}
                      </div>
                      
                      <div style={styles.videoActions}>
                        <button onClick={() => handleLike(video.id)} style={styles.actionBtn}>
                          {likedVideos[video.id] ? <FaHeart style={{ color: "#ff4444" }} /> : <FaRegHeart />} {likedVideos[video.id] ? 'Liked' : 'Like'}
                        </button>
                        <button onClick={() => handleShare(video)} style={styles.actionBtn}>
                          <FaShare /> Share
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
                            {!isLoggedIn ? "🔒 Login to Support" : !canSupportUser ? "🔒 Clients Only" : isAlreadyPurchased ? "▶ Watch" : "❤️ Support"}
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              incrementVideoViews(video.id);
                              window.open(video.videoUrl, "_blank");
                            }} 
                            style={{ ...styles.actionBtn, marginLeft: "auto", background: Y, color: BLK, fontWeight: 600, borderRadius: 20, padding: "6px 14px" }}
                          >
                            ▶ Watch Free
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

        {/* ─── UPLOAD MODAL WITH DRAG & DROP ─── */}
        {showUploadModal && (
          <div style={styles.modal} onClick={() => setShowUploadModal(false)}>
            <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>🎬</div>
              <h2 style={styles.modalTitle}>Upload Video</h2>
              <p style={styles.modalText}>Share your wedding or event video with the community</p>

              <form onSubmit={handleUploadSubmit} style={{ textAlign: "left" }}>
                {/* Title */}
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: textColor }}>Title *</label>
                <input 
                  name="title" 
                  value={uploadForm.title} 
                  onChange={handleUploadChange} 
                  placeholder="Wedding highlight video" 
                  style={{ ...styles.input, textAlign: "left", marginBottom: 12 }} 
                  required 
                />

                {/* Video URL */}
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: textColor }}>Video URL *</label>
                <input 
                  name="videoUrl" 
                  value={uploadForm.videoUrl} 
                  onChange={handleUploadChange} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  style={{ ...styles.input, textAlign: "left", marginBottom: 12 }} 
                  required 
                />

                {/* DRAG & DROP IMAGE UPLOAD */}
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: textColor }}>Thumbnail Image</label>
                
                <div
                  ref={dropAreaRef}
                  style={styles.dropArea}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadForm.thumbnailPreview ? (
                    <div style={{ position: "relative" }}>
                      <img 
                        src={uploadForm.thumbnailPreview} 
                        alt="Thumbnail preview" 
                        style={styles.thumbnailPreview} 
                      />
                      <button
                        type="button"
                        style={styles.removeImageBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={styles.dropIcon}><FaImage /></div>
                      <div style={styles.dropText}>Drag & drop an image here</div>
                      <div style={styles.dropSubtext}>or click to select from your device</div>
                      <div style={{ ...styles.dropSubtext, marginTop: 8, color: Y }}>PNG, JPG, WEBP • Max 5MB</div>
                    </>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                {/* Event Type */}
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: textColor }}>Category</label>
                <select 
                  name="eventType" 
                  value={uploadForm.eventType} 
                  onChange={handleUploadChange} 
                  style={{ ...styles.input, textAlign: "left", marginBottom: 12 }}
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>

                {/* Access Type */}
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: textColor }}>Access</label>
                <select 
                  name="accessType" 
                  value={uploadForm.accessType} 
                  onChange={handleUploadChange} 
                  style={{ ...styles.input, textAlign: "left", marginBottom: 12 }}
                >
                  <option value="free">Free</option>
                  <option value="premium">Paid (Premium)</option>
                  <option value="support">Support Based</option>
                </select>

                {(uploadForm.accessType === 'premium' || uploadForm.accessType === 'support') && (
                  <>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: textColor }}>
                      {uploadForm.accessType === 'premium' ? 'Price (RWF)' : 'Support Amount (RWF)'}
                    </label>
                    <input 
                      name="supportAmount" 
                      type="number" 
                      value={uploadForm.supportAmount} 
                      onChange={handleUploadChange} 
                      style={{ ...styles.input, textAlign: "left", marginBottom: 12 }} 
                    />
                  </>
                )}

                <button type="submit" disabled={uploading} style={styles.btnPrimary}>
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
                <button type="button" onClick={() => setShowUploadModal(false)} style={{ ...styles.btnOutline, marginTop: 12 }}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {/* ─── SUPPORT MODAL ─── */}
        {showSupportModal && selectedVideo && (
          <div style={styles.modal} onClick={() => setShowSupportModal(false)}>
            <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>❤️</div>
              <h2 style={styles.modalTitle}>Support {selectedVideo.coupleName}</h2>
              <p style={styles.modalText}>
                Support this couple and unlock access to their video<br/>
                <strong style={{ color: Y }}>60% goes to the couple • 40% platform fee</strong>
              </p>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>Support Amount</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" }}>
                  {[2000, 5000, 10000, 20000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setSupportAmount(amount)}
                      style={{
                        ...styles.amountBtn,
                        background: supportAmount === amount ? Y : cardBg,
                        color: supportAmount === amount ? BLK : textColor,
                        border: `1.5px solid ${supportAmount === amount ? Y : borderColor}`
                      }}
                    >
                      {amount.toLocaleString()} RWF
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={supportAmount}
                  onChange={e => setSupportAmount(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "block", textAlign: "left" }}>Payment Method</label>
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
                  <span>💑 Couple Receives (60%):</span>
                  <span style={styles.splitAmount}>{(supportAmount * 0.6).toLocaleString()} RWF</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>🏢 Platform Fee (40%):</span>
                  <span style={styles.splitAmount}>{(supportAmount * 0.4).toLocaleString()} RWF</span>
                </div>
              </div>

              <div style={{ marginBottom: "15px", fontSize: "11px", color: textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <FaWhatsapp style={{ color: "#25D366" }} />
                <span>WhatsApp Support: +250 780 145 562</span>
              </div>

              <button onClick={handleSupportVideo} disabled={isProcessing} style={styles.btnPrimary}>
                {isProcessing ? 'Processing...' : `Support ${supportAmount.toLocaleString()} RWF`}
              </button>
              <button onClick={() => setShowSupportModal(false)} style={{ ...styles.btnOutline, marginTop: "12px" }}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}