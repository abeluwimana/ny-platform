// src/pages/couple/CoupleDashboard.jsx
import { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

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

export default function CoupleDashboard() {
  const navigate = useNavigate();
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  
  // Support Earnings (60% from client supports)
  const [supportEarnings, setSupportEarnings] = useState({ total: 0, monthly: 0, supporters: [], recentSupports: [] });
  
  const [profile, setProfile] = useState({
    brideName: "", groomName: "", coupleName: "", weddingDate: "", location: "",
    bio: "", instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "",
    profileImage: null, coverImage: null, pageVisibility: "public", contentPermission: "public"
  });
  
  const [booking, setBooking] = useState(null);
  const [assignedCreator, setAssignedCreator] = useState(null);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  
  const [videoForm, setVideoForm] = useState({ 
    title: "", 
    videoUrl: "", 
    thumbnail: null, 
    isPremium: false, 
    price: 0, 
    eventType: "dote" 
  });
  const [postForm, setPostForm] = useState({ title: "", content: "", image: null, category: "update" });
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    const coupleLoggedIn = localStorage.getItem("couple_logged_in") === "true";
    const userEmail = localStorage.getItem("user_email");
    if (!coupleLoggedIn && !userEmail) {
      navigate("/login");
      return;
    }
    if (userEmail) loadCoupleByEmail(userEmail);
    else navigate("/login");
  }, []);

  const loadCoupleByEmail = (email) => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const found = allCouples.find(c => c.email === email);
    if (found) {
      setCouple(found);
      const displayName = found.couple || found.name || found.brideName || "Couple";
      setProfile({
        brideName: found.brideName || "", groomName: found.groomName || "",
        coupleName: displayName, weddingDate: found.weddingDate || "",
        location: found.location || "", bio: found.bio || "",
        instagram: found.instagram || "", tiktok: found.tiktok || "",
        youtube: found.youtube || "", facebook: found.facebook || "",
        whatsapp: found.whatsapp || "", profileImage: found.image || null,
        coverImage: found.coverImage || null, pageVisibility: found.pageVisibility || "public",
        contentPermission: found.contentPermission || "public"
      });
      setProfileForm({
        brideName: found.brideName || "", groomName: found.groomName || "",
        coupleName: displayName, weddingDate: found.weddingDate || "",
        location: found.location || "", bio: found.bio || "",
        instagram: found.instagram || "", tiktok: found.tiktok || "",
        youtube: found.youtube || "", facebook: found.facebook || "",
        whatsapp: found.whatsapp || "", profileImage: found.image || null,
        coverImage: found.coverImage || null, pageVisibility: found.pageVisibility || "public",
        contentPermission: found.contentPermission || "public"
      });
      setProfileImagePreview(found.image || null);
      loadVideos(found.id);
      loadGallery(found.id);
      loadPosts(found.id);
      loadNotifications(found.id);
      loadComments(found.id);
      loadSubscribers(found.id);
      loadWithdrawals(found.id);
      loadBooking(found.id);
      loadAssignedCreator(found.id);
      loadSupportEarnings(found.id);
    }
    setLoading(false);
  };

  // Load support earnings (60% from client supports)
  const loadSupportEarnings = (coupleId) => {
    const allSupports = JSON.parse(localStorage.getItem("video_supports") || "[]");
    const coupleSupports = allSupports.filter(s => s.coupleId === coupleId);
    
    const total = coupleSupports.reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthly = coupleSupports
      .filter(s => {
        const supportDate = new Date(s.date);
        return supportDate.getMonth() === currentMonth && supportDate.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0);
    
    const supporters = [...new Map(coupleSupports.map(s => [s.userEmail, {
      name: s.userName,
      email: s.userEmail,
      totalAmount: coupleSupports.filter(x => x.userEmail === s.userEmail).reduce((sum, x) => sum + (x.coupleEarning || x.amount * 0.6), 0),
      count: coupleSupports.filter(x => x.userEmail === s.userEmail).length
    }])).values()];
    
    const recentSupports = coupleSupports.slice(-5).reverse().map(s => ({
      id: s.id,
      supporterName: s.userName,
      amount: s.coupleEarning || s.amount * 0.6,
      originalAmount: s.amount,
      date: s.date,
      paymentMethod: s.paymentMethod
    }));
    
    setSupportEarnings({ total, monthly, supporters, recentSupports });
  };

  const loadVideos = (coupleId) => {
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    setVideos(allVideos.filter(v => v.coupleId === coupleId));
  };
  const loadGallery = (coupleId) => {
    const allGalleries = JSON.parse(localStorage.getItem("couple_galleries") || "[]");
    setGallery(allGalleries.filter(g => g.coupleId === coupleId));
  };
  const loadPosts = (coupleId) => {
    const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
    setPosts(allPosts.filter(p => p.coupleId === coupleId));
  };
  const loadNotifications = (coupleId) => {
    const allNotifs = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const myNotifs = allNotifs.filter(n => n.coupleId === coupleId || (n.type === "support" && n.coupleId === coupleId));
    setNotifications(myNotifs);
    const unread = myNotifs.filter(n => !n.read).length;
    setUnreadCount(unread);
  };
  const loadComments = (coupleId) => {
    const allComments = JSON.parse(localStorage.getItem("wedding_comments") || "[]");
    setComments(allComments.filter(c => c.coupleId === coupleId));
  };
  const loadSubscribers = (coupleId) => {
    setSubscribers(JSON.parse(localStorage.getItem(`subscribers_${coupleId}`) || "[]"));
  };
  const loadWithdrawals = (coupleId) => {
    setWithdrawals(JSON.parse(localStorage.getItem(`withdrawals_${coupleId}`) || "[]"));
  };
  const loadBooking = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    setBooking(bookings.find(b => b.coupleId === coupleId || b.coupleName === couple?.couple));
  };
  const loadAssignedCreator = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const coupleBooking = bookings.find(b => b.coupleId === coupleId);
    if (coupleBooking && coupleBooking.assignedCreator) {
      const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
      setAssignedCreator(users.find(u => u.email === coupleBooking.assignedCreator));
    }
  };

  const markNotificationAsRead = (notifId) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    setUnreadCount(prev => Math.max(0, prev - 1));
    toast("Marked as read");
  };
  
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.map(n => ({ ...n, read: true }));
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    setUnreadCount(0);
    toast("All notifications marked as read");
  };
  
  const deleteNotification = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.filter(n => n.id !== notifId);
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
    toast("Notification deleted");
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

  const handleThumbnailUpload = (e) => {
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

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setProfileImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    if (!couple) {
      toast("Error: No couple data found", "#ef4444");
      return;
    }
    
    try {
      const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
      const displayName = profileForm.coupleName || profileForm.brideName || profileForm.groomName || "Couple";
      const finalImage = profileImageFile || profile.profileImage || null;
      
      const updatedCouples = allCouples.map(c => {
        if (c.id === couple.id) {
          return { 
            ...c, 
            brideName: profileForm.brideName || "",
            groomName: profileForm.groomName || "",
            coupleName: displayName,
            couple: displayName,
            name: displayName,
            weddingDate: profileForm.weddingDate || "",
            location: profileForm.location || "",
            bio: profileForm.bio || "",
            instagram: profileForm.instagram || "",
            tiktok: profileForm.tiktok || "",
            youtube: profileForm.youtube || "",
            facebook: profileForm.facebook || "",
            whatsapp: profileForm.whatsapp || "",
            pageVisibility: profileForm.pageVisibility || "public",
            contentPermission: profileForm.contentPermission || "public",
            image: finalImage,
            profileImage: finalImage
          };
        }
        return c;
      });
      
      localStorage.setItem("wedding_couples", JSON.stringify(updatedCouples));
      
      setProfile({
        ...profile,
        brideName: profileForm.brideName || "",
        groomName: profileForm.groomName || "",
        coupleName: displayName,
        weddingDate: profileForm.weddingDate || "",
        location: profileForm.location || "",
        bio: profileForm.bio || "",
        instagram: profileForm.instagram || "",
        tiktok: profileForm.tiktok || "",
        youtube: profileForm.youtube || "",
        facebook: profileForm.facebook || "",
        whatsapp: profileForm.whatsapp || "",
        profileImage: finalImage
      });
      
      setCouple(updatedCouples.find(c => c.id === couple.id));
      
      localStorage.setItem("user_name", displayName);
      localStorage.setItem("couple_name", displayName);
      if (finalImage) {
        localStorage.setItem("user_profile_image", finalImage);
      }
      
      toast("✅ Profile updated successfully!");
      setShowProfileModal(false);
      setProfileImageFile(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Error:", error);
      toast("Error saving profile", "#ef4444");
    }
  };

  const handleUploadVideo = () => {
    if (!videoForm.title || !videoForm.videoUrl) {
      toast("Please fill title and video URL", "#ef4444");
      return;
    }
    if (!videoForm.thumbnail) {
      toast("Please upload a thumbnail image", "#ef4444");
      return;
    }
    
    const finalUrl = convertToEmbedUrl(videoForm.videoUrl);
    if (!finalUrl.includes("youtube.com/embed/")) {
      toast("Invalid YouTube URL", "#ef4444");
      return;
    }
    
    const eventTypeLabels = {
      dote: { name: "DOTE Ceremony", icon: "🪘" },
      church: { name: "Church Wedding", icon: "⛪" },
      reception: { name: "Reception", icon: "🎉" },
      full: { name: "Full Wedding", icon: "💍" }
    };
    
    const newVideo = {
      id: Date.now(),
      coupleId: couple.id,
      coupleName: couple.couple,
      title: videoForm.title,
      videoUrl: finalUrl,
      thumbnail: videoForm.thumbnail,
      isPremium: videoForm.isPremium,
      price: videoForm.price,
      eventType: videoForm.eventType,
      eventTypeLabel: eventTypeLabels[videoForm.eventType].name,
      eventIcon: eventTypeLabels[videoForm.eventType].icon,
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
    setShowVideoModal(false);
    setVideoForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0, eventType: "dote" });
    setThumbnailPreview(null);
    toast("✅ Video uploaded!");
  };

  const handleCreatePost = () => {
    if (!postForm.title || !postForm.content) {
      toast("Please fill title and content", "#ef4444");
      return;
    }
    const newPost = {
      id: Date.now(), coupleId: couple.id, coupleName: couple.couple, title: postForm.title,
      content: postForm.content, image: postForm.image, category: postForm.category,
      likes: 0, comments: 0, shares: 0, createdAt: new Date().toISOString()
    };
    const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
    localStorage.setItem("couple_posts", JSON.stringify([newPost, ...allPosts]));
    setPosts([newPost, ...posts]);
    setShowPostModal(false);
    setPostForm({ title: "", content: "", image: null, category: "update" });
    setPostImagePreview(null);
    toast("✅ Post published!");
  };

  const handleRequestWithdrawal = () => {
    if (!withdrawalAmount || withdrawalAmount < 10000) {
      toast("Minimum withdrawal amount is 10,000 RWF", "#ef4444");
      return;
    }
    if (withdrawalAmount > supportEarnings.total) {
      toast("Insufficient balance", "#ef4444");
      return;
    }
    const newWithdrawal = { id: Date.now(), amount: parseInt(withdrawalAmount), status: "pending", requestedAt: new Date().toISOString() };
    const updatedWithdrawals = [newWithdrawal, ...withdrawals];
    setWithdrawals(updatedWithdrawals);
    localStorage.setItem(`withdrawals_${couple?.id}`, JSON.stringify(updatedWithdrawals));
    setShowWithdrawalModal(false);
    setWithdrawalAmount("");
    toast("✅ Withdrawal request submitted!");
  };

  const getStatusBadge = (status) => {
    if (status === "confirmed") return <span style={{ background: "#d4edda", color: "#155724", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>✅ Confirmed</span>;
    if (status === "pending") return <span style={{ background: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>⏳ Pending</span>;
    if (status === "rejected") return <span style={{ background: "#f8d7da", color: "#721c24", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>❌ Rejected</span>;
    return <span style={{ background: "#e2e3e5", color: "#383d41", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{status || "Unknown"}</span>;
  };

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor }}>Loading dashboard...</div>;
  if (!couple) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor }}>No wedding found. <Link to="/booking">Book your wedding →</Link></div>;

  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "videos", label: "🎬 Videos" },
    { id: "posts", label: "📝 Posts" },
    { id: "earnings", label: "💰 Earnings" },
    { id: "supporters", label: "❤️ Supporters" },
    { id: "notifications", label: `🔔 Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { id: "profile", label: "👤 Profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", color: textColor, padding: isMobile ? "16px" : "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "bold" }}>💑 Couple Dashboard</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              style={{ background: "transparent", border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "8px 12px", cursor: "pointer", color: textColor }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
        
        {/* Stats Grid - Responsive */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{videos.length}</div><div>Videos</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.total.toLocaleString()} RWF</div><div>Total Earnings</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.monthly.toLocaleString()} RWF</div><div>This Month</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.supporters.length}</div><div>Supporters</div>
          </div>
        </div>

        {/* Tabs - Horizontal scroll on mobile */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderBottom: `1px solid ${borderColor}`, marginBottom: "20px", paddingBottom: "12px", overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch" }}>
          {TABS.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={{ 
                padding: isMobile ? "8px 14px" : "10px 20px", 
                background: activeTab === tab.id ? `${Y}20` : "none", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer", 
                fontWeight: activeTab === tab.id ? "bold" : "normal", 
                color: activeTab === tab.id ? Y : textMuted,
                whiteSpace: "nowrap",
                fontSize: isMobile ? "12px" : "14px"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>Welcome, {profile.coupleName || profile.brideName || "Couple"}!</h2>
            <p style={{ color: textMuted, marginTop: "8px" }}>Manage your wedding videos, posts, and earnings from this dashboard.</p>
            {booking && <div style={{ marginTop: "16px", padding: "12px", background: `${Y}10`, borderRadius: "8px" }}>📅 {booking.package} on {new Date(booking.date).toLocaleDateString()} {getStatusBadge(booking.status)}</div>}
            {assignedCreator && <div style={{ marginTop: "16px", padding: "12px", background: `${Y}10`, borderRadius: "8px" }}>🎥 Videographer: {assignedCreator.name}</div>}
          </div>
        )}

        {/* Videos Tab - With Event Type Badges */}
        {activeTab === "videos" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h2>🎬 Wedding Videos</h2>
              <button onClick={() => setShowVideoModal(true)} style={{ background: Y, border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>+ Upload Video</button>
            </div>
            
            {videos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
                <p>No videos yet. Upload your first wedding video!</p>
                <button onClick={() => setShowVideoModal(true)} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>+ Upload Video</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {videos.map(v => (
                  <div key={v.id} style={{ border: `1px solid ${borderColor}`, borderRadius: "12px", overflow: "hidden", background: darkMode ? "#1a1a1a" : "#fff" }}>
                    {/* Thumbnail with Event Type Badge */}
                    <div style={{ position: "relative" }}>
                      <img 
                        src={v.thumbnail || "https://via.placeholder.com/400x225"} 
                        alt={v.title} 
                        style={{ width: "100%", height: "180px", objectFit: "cover" }} 
                      />
                      <div style={{ 
                        position: "absolute", 
                        top: "10px", 
                        left: "10px", 
                        background: Y, 
                        color: BLK, 
                        padding: "4px 10px", 
                        borderRadius: "20px", 
                        fontSize: "11px", 
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {v.eventIcon || "🎬"} {v.eventTypeLabel || (v.eventType === "dote" ? "DOTE" : v.eventType === "church" ? "Church" : v.eventType === "reception" ? "Reception" : "Wedding")}
                      </div>
                      {v.isPremium && (
                        <div style={{ 
                          position: "absolute", 
                          top: "10px", 
                          right: "10px", 
                          background: "#ffc107", 
                          color: BLK, 
                          padding: "4px 10px", 
                          borderRadius: "20px", 
                          fontSize: "10px", 
                          fontWeight: "bold" 
                        }}>
                          ⭐ Premium
                        </div>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div style={{ padding: "12px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "6px" }}>{v.title}</h3>
                      <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: textMuted, marginBottom: "8px" }}>
                        <span>👁️ {v.views || 0} views</span>
                        <span>❤️ {v.likes || 0} likes</span>
                        <span>💬 {v.comments || 0} comments</span>
                      </div>
                      <div style={{ fontSize: "10px", color: textMuted }}>
                        📅 {new Date(v.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h2>📝 Wedding Stories</h2>
              <button onClick={() => setShowPostModal(true)} style={{ background: Y, border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>+ Create Post</button>
            </div>
            {posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
                <p>No posts yet. Share your wedding story!</p>
                <button onClick={() => setShowPostModal(true)} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>+ Create Post</button>
              </div>
            ) : (
              posts.map(p => (
                <div key={p.id} style={{ borderBottom: `1px solid ${borderColor}`, padding: "12px 0" }}>
                  <h3>{p.title}</h3>
                  <p style={{ color: textMuted, fontSize: "13px" }}>{p.content?.substring(0, 100)}...</p>
                  <div style={{ fontSize: "11px", color: textMuted, marginTop: "6px" }}>
                    📅 {new Date(p.createdAt).toLocaleDateString()} • ❤️ {p.likes || 0} likes • 💬 {p.comments || 0} comments
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Earnings Tab - Simplified for Couples */}
        {activeTab === "earnings" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>💰 Your Earnings</h2>
            
            <div style={{ background: `${Y}05`, padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", margin: 0 }}>💡 When clients support your videos, <strong style={{ color: Y }}>60% goes to you</strong> and 40% goes to platform fees.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: `${Y}10`, padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: textMuted }}>Total Earnings</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.total.toLocaleString()} RWF</div>
              </div>
              <div style={{ background: `${Y}10`, padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: textMuted }}>This Month</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.monthly.toLocaleString()} RWF</div>
              </div>
            </div>
            
            <button onClick={() => setShowWithdrawalModal(true)} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}>
              💸 Request Withdrawal
            </button>
            
            {withdrawals.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3>📋 Withdrawal History</h3>
                {withdrawals.map(w => (
                  <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                    <span>💰 {w.amount.toLocaleString()} RWF</span>
                    <span style={{ color: w.status === "pending" ? Y : "#22c55e" }}>
                      {w.status === "pending" ? "⏳ Pending" : "✅ Completed"}
                    </span>
                    <span style={{ fontSize: "11px", color: textMuted }}>{new Date(w.requestedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supporters Tab */}
        {activeTab === "supporters" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>❤️ Your Supporters</h2>
            
            {supportEarnings.supporters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>❤️</div>
                <p>No supporters yet. Share your videos to receive support!</p>
                <button onClick={() => setActiveTab("videos")} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>Upload Videos →</button>
              </div>
            ) : (
              <>
                {/* Top Supporters */}
                <div style={{ marginBottom: "24px" }}>
                  <h3>🏆 Top Supporters</h3>
                  {supportEarnings.supporters.slice(0, 5).map((supporter, idx) => (
                    <div key={supporter.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontWeight: "bold", color: Y, width: "30px" }}>#{idx + 1}</span>
                        <span>{supporter.name || supporter.email}</span>
                      </div>
                      <div>
                        <strong>{supporter.totalAmount.toLocaleString()} RWF</strong> ({supporter.count} supports)
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Recent Supports */}
                <div>
                  <h3>📋 Recent Support Activity</h3>
                  {supportEarnings.recentSupports.map(support => (
                    <div key={support.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                      <div>
                        <div><strong>{support.supporterName || "Anonymous"}</strong></div>
                        <div style={{ fontSize: "11px", color: textMuted }}>{new Date(support.date).toLocaleDateString()} • {support.paymentMethod === "mtn" ? "MTN" : "Airtel"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "bold", color: Y }}>{support.amount.toLocaleString()} RWF</div>
                        <div style={{ fontSize: "10px", color: textMuted }}>From {support.originalAmount.toLocaleString()} RWF support</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={{ margin: 0 }}>🔔 Notifications</h2>
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} style={{ padding: "8px 16px", background: "#f0f0f0", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaCheck /> Mark all as read
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
                <p>No notifications yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px", borderRadius: "12px", border: `1px solid ${borderColor}`, background: n.read ? "transparent" : `${Y}10` }}>
                    <div style={{ fontSize: "28px" }}>{n.type === "support" ? "❤️" : n.type === "payment" ? "💰" : "🔔"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>{n.title}</div>
                      <div style={{ fontSize: "13px", color: textMuted, marginBottom: "6px" }}>{n.message}</div>
                      <div style={{ fontSize: "11px", color: textMuted }}>{n.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!n.read && (
                        <button onClick={() => markNotificationAsRead(n.id)} style={{ padding: "6px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                          <FaCheck />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} style={{ padding: "6px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>👤 Wedding Profile</h2>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", overflow: "hidden" }}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  profile.coupleName?.charAt(0) || profile.brideName?.charAt(0) || "C"
                )}
              </div>
            </div>
            <p><strong>Couple:</strong> {profile.coupleName}</p>
            <p><strong>Date:</strong> {profile.weddingDate || "Not set"}</p>
            <p><strong>Location:</strong> {profile.location || "Not set"}</p>
            <button 
              onClick={() => {
                setProfileForm({
                  brideName: profile.brideName || "",
                  groomName: profile.groomName || "",
                  coupleName: profile.coupleName || "",
                  weddingDate: profile.weddingDate || "",
                  location: profile.location || "",
                  bio: profile.bio || "",
                  instagram: profile.instagram || "",
                  tiktok: profile.tiktok || "",
                  youtube: profile.youtube || "",
                  facebook: profile.facebook || "",
                  whatsapp: profile.whatsapp || "",
                  pageVisibility: profile.pageVisibility || "public",
                  contentPermission: profile.contentPermission || "public",
                  profileImage: profile.profileImage || null
                });
                setProfileImagePreview(profile.profileImage || null);
                setProfileImageFile(null);
                setShowProfileModal(true);
              }} 
              style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "16px", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Upload Video Modal - With Event Type and Thumbnail */}
      {showVideoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "16px" }}>📤 Upload Wedding Video</h2>
            
            {/* Video Title */}
            <input 
              placeholder="Video Title (e.g., Our Beautiful DOTE Ceremony)" 
              style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={videoForm.title} 
              onChange={e => setVideoForm({...videoForm, title: e.target.value})} 
            />
            
            {/* Event Type Selection */}
            <label style={{ fontSize: "13px", fontWeight: "600", marginTop: "10px", display: "block" }}>Event Type:</label>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "8px", margin: "10px 0" }}>
              {[
                { value: "dote", label: "🪘 DOTE", desc: "Introduction Ceremony" },
                { value: "church", label: "⛪ Church", desc: "Church Wedding" },
                { value: "reception", label: "🎉 Reception", desc: "Party/Reception" },
                { value: "full", label: "💍 Full Wedding", desc: "Complete Package" }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVideoForm({...videoForm, eventType: option.value})}
                  style={{
                    padding: "12px 8px",
                    background: videoForm.eventType === option.value ? Y : darkMode ? "#333" : "#f5f5f5",
                    color: videoForm.eventType === option.value ? BLK : textColor,
                    border: `1px solid ${videoForm.eventType === option.value ? Y : borderColor}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: videoForm.eventType === option.value ? "bold" : "normal",
                    fontSize: "13px",
                    textAlign: "center"
                  }}
                >
                  <div>{option.label}</div>
                  <div style={{ fontSize: "10px", color: textMuted }}>{option.desc}</div>
                </button>
              ))}
            </div>
            
            {/* Thumbnail Upload */}
            <label style={{ fontSize: "13px", fontWeight: "600", marginTop: "10px", display: "block" }}>Video Thumbnail (Cover Image):</label>
            <div 
              onClick={() => document.getElementById("thumbnailInput")?.click()}
              style={{ 
                border: `2px dashed ${borderColor}`, 
                borderRadius: "12px", 
                padding: "20px", 
                textAlign: "center", 
                cursor: "pointer",
                margin: "10px 0",
                background: darkMode ? "#333" : "#fafafa"
              }}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }} />
              ) : (
                <div>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🖼️</div>
                  <div style={{ fontSize: "12px", color: textMuted }}>Click to upload thumbnail image</div>
                  <div style={{ fontSize: "10px", color: textMuted, marginTop: "4px" }}>Recommended: 1280x720px</div>
                </div>
              )}
              <input id="thumbnailInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handleThumbnailUpload} />
            </div>
            
            {/* YouTube URL */}
            <input 
              placeholder="YouTube Video URL" 
              style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={videoForm.videoUrl} 
              onChange={e => setVideoForm({...videoForm, videoUrl: e.target.value})} 
            />
            <p style={{ fontSize: "11px", color: textMuted, marginTop: "-5px", marginBottom: "10px" }}>
              Supported formats: youtube.com/watch?v=XXXX or youtu.be/XXXX
            </p>
            
            {/* Premium Options */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
              <input type="checkbox" checked={videoForm.isPremium} onChange={e => setVideoForm({...videoForm, isPremium: e.target.checked})} /> 
              <span>⭐ Make this a Premium Video (requires payment to watch)</span>
            </label>
            
            {videoForm.isPremium && (
              <input 
                type="number" 
                placeholder="Premium Price (RWF)" 
                style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
                value={videoForm.price} 
                onChange={e => setVideoForm({...videoForm, price: parseInt(e.target.value) || 0})} 
              />
            )}
            
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleUploadVideo} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>
                📤 Upload Video
              </button>
              <button onClick={() => {
                setShowVideoModal(false);
                setVideoForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0, eventType: "dote" });
                setThumbnailPreview(null);
              }} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%" }}>
            <h2 style={{ marginBottom: "16px" }}>Share Your Story</h2>
            <input placeholder="Title" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
            <select style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
              <option value="update">Wedding Update</option>
              <option value="story">Love Story</option>
              <option value="anniversary">Anniversary</option>
              <option value="thanks">Thank You</option>
            </select>
            <textarea placeholder="Content" rows="4" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box", resize: "vertical" }} value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
            <div style={{ border: `2px dashed ${borderColor}`, borderRadius: "8px", padding: "16px", textAlign: "center", cursor: "pointer", margin: "10px 0" }} onClick={() => document.getElementById("postImageInput")?.click()}>
              {postImagePreview ? <img src={postImagePreview} style={{ maxHeight: "100px" }} alt="preview" /> : "Click to upload image"}
              <input id="postImageInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handlePostImageUpload} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleCreatePost} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>Publish</button>
              <button onClick={() => setShowPostModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "20px" }}>Edit Wedding Profile</h2>
            
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div 
                onClick={() => document.getElementById("editProfileImageInput")?.click()}
                style={{ width: "100px", height: "100px", borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", fontWeight: "bold", cursor: "pointer", overflow: "hidden" }}>
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (profileForm.coupleName?.charAt(0) || profileForm.brideName?.charAt(0) || "C")
                )}
              </div>
              <input id="editProfileImageInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handleProfileImageSelect} />
              <p style={{ fontSize: "11px", marginTop: "8px", color: textMuted }}>Click photo to change</p>
            </div>
            
            <input placeholder="Couple Name" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.coupleName || ""} onChange={e => setProfileForm({...profileForm, coupleName: e.target.value})} />
            <input placeholder="Bride's Name" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.brideName || ""} onChange={e => setProfileForm({...profileForm, brideName: e.target.value})} />
            <input placeholder="Groom's Name" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.groomName || ""} onChange={e => setProfileForm({...profileForm, groomName: e.target.value})} />
            <input type="date" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.weddingDate || ""} onChange={e => setProfileForm({...profileForm, weddingDate: e.target.value})} />
            <input placeholder="Location" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.location || ""} onChange={e => setProfileForm({...profileForm, location: e.target.value})} />
            <textarea placeholder="Bio / Love Story" rows="3" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box", resize: "vertical" }} value={profileForm.bio || ""} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
            
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleUpdateProfile} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>SAVE CHANGES</button>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "90%" }}>
            <h2 style={{ marginBottom: "16px" }}>Request Withdrawal</h2>
            <p>Available Balance: <strong style={{ color: Y }}>{supportEarnings.total.toLocaleString()} RWF</strong></p>
            <input type="number" placeholder="Amount (RWF)" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} />
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleRequestWithdrawal} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>Request</button>
              <button onClick={() => setShowWithdrawalModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}