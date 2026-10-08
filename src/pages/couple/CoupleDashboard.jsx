// src/pages/couple/CoupleDashboard.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBell, FaCalendarAlt, FaCheck,
  FaCog,
  FaCreditCard,
  FaEdit,
  FaHeart, FaHome, FaImage, FaMoon, FaPen,
  FaPlus, FaShare, FaSignOutAlt, FaSun, FaTimes, FaTrash, FaUser,
  FaVideo, FaWallet
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

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

const TABS = [
  { id: "dashboard", label: "📊 Dashboard", icon: <FaHome /> },
  { id: "profile", label: "👤 My Profile", icon: <FaUser /> },
  { id: "gallery", label: "📸 Gallery", icon: <FaImage /> },
  { id: "videos", label: "🎬 My Videos", icon: <FaVideo /> },
  { id: "posts", label: "📝 My Posts", icon: <FaPen /> },
  { id: "comments", label: "💬 Comments", icon: <FaHeart /> },
  { id: "bookings", label: "📅 Bookings", icon: <FaCalendarAlt /> },
  { id: "earnings", label: "💰 Earnings", icon: <FaWallet /> },
  { id: "payments", label: "💳 Payments", icon: <FaCreditCard /> },
  { id: "notifications", label: "🔔 Notifications", icon: <FaBell /> },
  { id: "settings", label: "⚙️ Settings", icon: <FaCog /> },
];

export default function CoupleDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────
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
  const [withdrawals, setWithdrawals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const [supportEarnings, setSupportEarnings] = useState({
    total: 0, monthly: 0, supporters: [], recentSupports: [],
    platformShare: 0, coupleShare: 0, totalSupports: 0
  });

  const [profile, setProfile] = useState({
    brideName: "", groomName: "", coupleName: "", weddingDate: "", location: "",
    bio: "", instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "",
    profileImage: null, coverImage: null,
    pageVisibility: "public", contentPermission: "public"
  });

  const [assignedCreator, setAssignedCreator] = useState(null);
  const [videoError, setVideoError] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [editingVideo, setEditingVideo] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const [videoForm, setVideoForm] = useState({
    title: "", videoUrl: "", thumbnail: null,
    accessType: "free", supportAmount: "", eventType: "dote"
  });
  const [postForm, setPostForm] = useState({ title: "", content: "", image: null, category: "update" });
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("mtn");
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  // ── Effects ───────────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    const token = localStorage.getItem("token");
    const coupleLoggedIn = localStorage.getItem("couple_logged_in") === "true";
    const userEmail = localStorage.getItem("user_email");

    if (!token || !coupleLoggedIn || !userEmail) {
      navigate("/login");
      return;
    }
    fetchCoupleData(userEmail);
  }, []);

  // ── Fetch Couple Data ────────────────────────
  const fetchCoupleData = async (email) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const profileRes = await fetch(`${API_URL}/couples/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          const c = profileData.couple;
          setCouple(c);

          const displayName = c.coupleName || c.name || c.brideName || "Couple";
          const pObj = {
            brideName: c.brideName || "",
            groomName: c.groomName || "",
            coupleName: displayName,
            weddingDate: c.weddingDate || "",
            location: c.location || "",
            bio: c.bio || "",
            instagram: c.instagram || "",
            tiktok: c.tiktok || "",
            youtube: c.youtube || "",
            facebook: c.facebook || "",
            whatsapp: c.whatsapp || "",
            profileImage: c.profileImage || null,
            coverImage: c.coverImage || null,
            pageVisibility: c.pageVisibility || "public",
            contentPermission: c.contentPermission || "public"
          };
          setProfile(pObj);
          setProfileForm(pObj);
          setProfileImagePreview(c.profileImage || null);

          await Promise.all([
            fetchVideos(c.id),
            fetchGallery(c.id),
            fetchPosts(c.id),
            fetchComments(c.id),
            fetchBookings(c.id),
            fetchSupportEarnings(c.id),
            fetchPaymentHistory(),
            fetchNotifications(),
            fetchWithdrawals(c.id),
          ]);

          setLoading(false);
          return;
        }
      }
      navigate("/login");
    } catch (err) {
      console.error("Error fetching couple data:", err);
      setLoading(false);
    }
  };

  // ── Fetch helpers ────────────────────────────
  const fetchVideos = async (coupleId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/videos/couple/${coupleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setVideos(data.videos || []);
          setVideoError("");
          return;
        }
      }
      setVideoError("Could not load videos");
    } catch (err) {
      console.error("Videos error:", err);
      setVideoError("Could not load videos");
    }
  };

  const fetchGallery = async (coupleId) => {
    try {
      const res = await fetch(`${API_URL}/couples/${coupleId}/gallery`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setGallery(data.gallery || []);
          setGalleryError("");
          return;
        }
      }
      setGalleryError("Could not load gallery");
    } catch (err) {
      console.error("Gallery error:", err);
      setGalleryError("Could not load gallery");
    }
  };

  const fetchPosts = async (coupleId) => {
    try {
      const res = await fetch(`${API_URL}/posts?coupleId=${coupleId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts || []);
          return;
        }
      }
      setPosts([]);
    } catch (err) {
      console.error("Posts error:", err);
      setPosts([]);
    }
  };

  const fetchComments = async (coupleId) => {
    try {
      const res = await fetch(`${API_URL}/couples/${coupleId}/comments`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setComments(data.comments || []);
          return;
        }
      }
      setComments([]);
    } catch (err) {
      console.error("Comments error:", err);
      setComments([]);
    }
  };

  const fetchBookings = async (coupleId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/bookings/couple/${coupleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings || (data.booking ? [data.booking] : []));
          return;
        }
      }
      setBookings([]);
    } catch (err) {
      console.error("Bookings error:", err);
      setBookings([]);
    }
  };

  const fetchSupportEarnings = async (coupleId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/support/earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const e = data.earnings || {};
          setSupportEarnings({
            total: e.total || 0,
            monthly: e.monthly || 0,
            supporters: e.supporters || [],
            recentSupports: e.recentSupports || [],
            platformShare: e.platformShare || 0,
            coupleShare: e.coupleShare || 0,
            totalSupports: e.totalSupports || 0
          });
          return;
        }
      }
    } catch (err) {
      console.error("Support earnings error:", err);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/payments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setPaymentHistory(data.payments || []);
      }
    } catch (err) {
      console.error("Payment history error:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount((data.notifications || []).filter(n => !n.read).length);
        }
      }
    } catch (err) {
      console.error("Notifications error:", err);
    }
  };

  const fetchWithdrawals = async (coupleId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/withdrawals/couple/${coupleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error("Withdrawals error:", err);
    }
  };

  // ── Media helpers ────────────────────────────
  const convertToEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  // ── Handlers ─────────────────────────────────
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
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
    const file = e.target.files?.[0];
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
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setProfileImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast("Choose a JPEG, PNG, or WebP image.", "#ef4444");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast("Images must be smaller than 3 MB.", "#ef4444");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setGalleryUploading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/couples/gallery`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ imageData: reader.result })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Upload failed");
        setGallery((cur) => [data.image, ...cur]);
        toast("Photo added to gallery.");
      } catch (error) {
        toast(error.message || "Upload failed", "#ef4444");
      } finally {
        setGalleryUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteGalleryImage = async (id) => {
    if (!window.confirm("Remove this photo?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/couples/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setGallery((cur) => cur.filter((img) => img.id !== id));
      toast("Photo removed");
    } catch (error) {
      toast(error.message || "Delete failed", "#ef4444");
    }
  };

  const handleUpdateProfile = async () => {
    if (!couple) return;
    try {
      const token = localStorage.getItem("token");
      const displayName = profileForm.coupleName || profileForm.brideName || profileForm.groomName || "Couple";
      const finalImage = profileImageFile || profile.profileImage || null;

      const res = await fetch(`${API_URL}/couples/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileForm,
          coupleName: displayName,
          profileImage: finalImage
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");

      toast("✅ Profile updated");
      setShowProfileModal(false);
      setProfileImageFile(null);
      fetchCoupleData(localStorage.getItem("user_email"));
    } catch (error) {
      toast(error.message || "Update failed", "#ef4444");
    }
  };

  const handleUploadVideo = async () => {
    if (!videoForm.title || !videoForm.videoUrl || !videoForm.thumbnail) {
      toast("Please fill title, URL, and thumbnail", "#ef4444");
      return;
    }
    const finalUrl = convertToEmbedUrl(videoForm.videoUrl);
    if (!finalUrl.includes("youtube.com/embed/")) {
      toast("Invalid YouTube URL", "#ef4444");
      return;
    }
    if (videoForm.accessType !== "free" && (!videoForm.supportAmount || parseFloat(videoForm.supportAmount) <= 0)) {
      toast("Set a valid amount", "#ef4444");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: videoForm.title,
        coupleId: couple.id,
        videoUrl: finalUrl,
        thumbnail: videoForm.thumbnail,
        eventType: videoForm.eventType,
        accessType: videoForm.accessType,
        supportAmount: videoForm.accessType !== "free" ? parseFloat(videoForm.supportAmount) : 0,
        price: videoForm.accessType === "premium" ? parseFloat(videoForm.supportAmount) : 0
      };

      const res = await fetch(`${API_URL}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Upload failed");

      setVideos((cur) => [data.video, ...cur]);
      toast("Video submitted — pending admin approval");
      setShowVideoModal(false);
      setEditingVideo(null);
      setVideoForm({ title: "", videoUrl: "", thumbnail: null, accessType: "free", supportAmount: "", eventType: "dote" });
      setThumbnailPreview(null);
    } catch (err) {
      toast(err.message || "Upload failed", "#ef4444");
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/videos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setVideos((cur) => cur.filter((v) => v.id !== id));
      toast("Video deleted");
    } catch (error) {
      toast(error.message || "Delete failed", "#ef4444");
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.title || !postForm.content) {
      toast("Please fill title and content", "#ef4444");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const url = editingPost ? `${API_URL}/posts/${editingPost.id}` : `${API_URL}/posts`;
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Save failed");

      toast(editingPost ? "Post updated" : "Post created");
      setShowPostModal(false);
      setEditingPost(null);
      setPostForm({ title: "", content: "", image: null, category: "update" });
      setPostImagePreview(null);
      fetchPosts(couple.id);
    } catch (err) {
      toast(err.message || "Save failed", "#ef4444");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setPosts((cur) => cur.filter((p) => p.id !== id));
      toast("Post deleted");
    } catch (error) {
      toast(error.message || "Delete failed", "#ef4444");
    }
  };

  const handleRequestWithdrawal = async () => {
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt < 10000) {
      toast("Minimum withdrawal: 10,000 RWF", "#ef4444");
      return;
    }
    if (amt > supportEarnings.total) {
      toast("Insufficient balance", "#ef4444");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/withdrawals/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amt,
          coupleId: couple.id,
          paymentMethod: withdrawalMethod
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Request failed");

      toast("Withdrawal requested");
      setShowWithdrawalModal(false);
      setWithdrawalAmount("");
      fetchWithdrawals(couple.id);
    } catch (error) {
      toast(error.message || "Request failed", "#ef4444");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/couple/${couple?.id}`;
    navigator.clipboard.writeText(url);
    toast("Link copied! 📋");
    setShowShareModal(false);
  };

  // ── Notifications ────────────────────────────
  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  // ── Theme helpers ────────────────────────────
  const toggleDarkMode = () => {
    const nm = !darkMode;
    setDarkMode(nm);
    localStorage.setItem("darkMode", nm);
    document.body.style.background = nm ? "#111" : "#f5f5f5";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("couple_logged_in");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  // ── Theme vars ───────────────────────────────
  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    const style = { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 };
    if (s === "APPROVED" || s === "CONFIRMED" || s === "PUBLISHED" || s === "COMPLETED")
      return <span style={{ ...style, background: "#dcfce7", color: "#15803d" }}>{status}</span>;
    if (s === "PENDING")
      return <span style={{ ...style, background: "#fef9c3", color: "#854d0e" }}>{status}</span>;
    if (s === "REJECTED" || s === "CANCELLED" || s === "FAILED")
      return <span style={{ ...style, background: "#fee2e2", color: "#b91c1c" }}>{status}</span>;
    return <span style={{ ...style, background: "#e5e7eb", color: "#374151" }}>{status || "—"}</span>;
  };

  // ── Render ───────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor, flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "4px solid #f3f3f3", borderTop: `4px solid ${Y}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!couple) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, flexDirection: "column", gap: 16 }}>
        <p>No wedding found.</p>
        <Link to="/booking" style={{ color: Y }}>Book your event →</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", color: textColor }}>
      {/* ── Header ── */}
      <header style={{
        background: cardBg, borderBottom: `1px solid ${borderColor}`,
        padding: isMobile ? "12px 16px" : "16px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {profile.profileImage ? (
            <img src={profile.profileImage} alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: BLK }}>
              {(profile.coupleName || "C").charAt(0)}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.coupleName || "Your Wedding"}</div>
            <div style={{ fontSize: 12, color: textMuted }}>{profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString() : "Set your date"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowShareModal(true)} style={{ padding: "8px 14px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <FaShare /> Share
          </button>
          <button onClick={toggleDarkMode} style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", color: textColor }}>
            {darkMode ? <FaSun color={Y} /> : <FaMoon />}
          </button>
          <button onClick={handleLogout} style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", color: "#ef4444" }}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", maxWidth: 1400, margin: "0 auto" }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: isMobile ? "100%" : 240,
          background: cardBg,
          borderRight: isMobile ? "none" : `1px solid ${borderColor}`,
          borderBottom: isMobile ? `1px solid ${borderColor}` : "none",
          padding: isMobile ? "8px" : "20px 12px",
          position: isMobile ? "sticky" : "sticky",
          top: isMobile ? 65 : 81,
          height: isMobile ? "auto" : "calc(100vh - 81px)",
          overflowY: isMobile ? "hidden" : "auto",
          overflowX: isMobile ? "auto" : "hidden",
          zIndex: 50
        }}>
          <nav style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 4, whiteSpace: "nowrap" }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: isMobile ? "8px 12px" : "10px 14px",
                    borderRadius: 8, border: "none",
                    background: isActive ? `${Y}20` : "transparent",
                    color: isActive ? Y : textMuted,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer", fontSize: 13,
                    flexShrink: 0
                  }}
                >
                  {tab.icon} <span>{tab.label}</span>
                  {tab.id === "notifications" && unreadCount > 0 && (
                    <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", padding: "1px 6px", borderRadius: 10, fontSize: 10 }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, padding: isMobile ? 16 : 24, minWidth: 0 }}>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <>
              <h2 style={{ marginBottom: 20 }}>Welcome back, {profile.coupleName}! 👋</h2>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                <StatCard icon="🎬" value={videos.length} label="Videos" cardBg={cardBg} border={borderColor} textMuted={textMuted} />
                <StatCard icon="📸" value={gallery.length} label="Photos" cardBg={cardBg} border={borderColor} textMuted={textMuted} />
                <StatCard icon="❤️" value={supportEarnings.supporters.length} label="Supporters" cardBg={cardBg} border={borderColor} textMuted={textMuted} />
                <StatCard icon="💰" value={`${supportEarnings.total.toLocaleString()} RWF`} label="Earned" cardBg={cardBg} border={borderColor} textMuted={textMuted} />
              </div>

              {bookings.length > 0 && (
                <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                  <h3 style={{ marginBottom: 12 }}>📅 Your Booking</h3>
                  {bookings.slice(0, 2).map((b) => (
                    <div key={b.id} style={{ padding: 12, background: `${Y}08`, borderRadius: 8, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <strong>{b.package || "Custom"}</strong>
                          <div style={{ fontSize: 12, color: textMuted }}>
                            {b.eventDate ? new Date(b.eventDate).toLocaleDateString() : "No date"} · {b.location || "—"}
                          </div>
                        </div>
                        {getStatusBadge(b.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {assignedCreator && (
                <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 16 }}>
                  🎥 Assigned Creator: <strong>{assignedCreator.name}</strong>
                </div>
              )}
            </>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <Card cardBg={cardBg} border={borderColor}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h2>👤 Couple Profile</h2>
                <button onClick={() => { setProfileForm({ ...profile }); setShowProfileModal(true); }} style={{ padding: "8px 16px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <FaEdit /> Edit Profile
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: 24 }}>
                <div style={{ textAlign: "center" }}>
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: `3px solid ${Y}` }} />
                  ) : (
                    <div style={{ width: 120, height: 120, borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 700, color: BLK }}>
                      {(profile.coupleName || "C").charAt(0)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <InfoRow label="Couple Name" value={profile.coupleName} muted={textMuted} />
                  <InfoRow label="Bride" value={profile.brideName} muted={textMuted} />
                  <InfoRow label="Groom" value={profile.groomName} muted={textMuted} />
                  <InfoRow label="Wedding Date" value={profile.weddingDate ? new Date(profile.weddingDate).toLocaleDateString() : "—"} muted={textMuted} />
                  <InfoRow label="Location" value={profile.location} muted={textMuted} />
                  <InfoRow label="Bio" value={profile.bio} muted={textMuted} />
                  <InfoRow label="Page Visibility" value={profile.pageVisibility} muted={textMuted} />
                </div>
              </div>
            </Card>
          )}

          {/* GALLERY */}
          {activeTab === "gallery" && (
            <Card cardBg={cardBg} border={borderColor}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h2>📸 Wedding Gallery</h2>
                <label style={{ padding: "8px 16px", background: Y, color: BLK, borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                  <FaPlus /> {galleryUploading ? "Uploading..." : "Upload Photo"}
                  <input type="file" accept="image/*" onChange={handleGalleryImageUpload} style={{ display: "none" }} disabled={galleryUploading} />
                </label>
              </div>
              {galleryError && <p style={{ color: "#ef4444" }}>{galleryError}</p>}
              {gallery.length === 0 ? (
                <EmptyState icon="📸" title="No photos yet" subtitle="Upload your first wedding photo" />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {gallery.map((img) => (
                    <div key={img.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1" }}>
                      <img src={img.url || img.imageData} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => handleDeleteGalleryImage(img.id)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}>
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* VIDEOS */}
          {activeTab === "videos" && (
            <Card cardBg={cardBg} border={borderColor}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h2>🎬 Your Videos</h2>
                <button onClick={() => { setEditingVideo(null); setVideoForm({ title: "", videoUrl: "", thumbnail: null, accessType: "free", supportAmount: "", eventType: "dote" }); setThumbnailPreview(null); setShowVideoModal(true); }} style={{ padding: "8px 16px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <FaPlus /> Add Video
                </button>
              </div>
              {videoError && <p style={{ color: "#ef4444" }}>{videoError}</p>}
              {videos.length === 0 ? (
                <EmptyState icon="🎬" title="No videos yet" subtitle="Upload your first wedding video" />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {videos.map((v) => (
                    <div key={v.id} style={{ background: darkMode ? "#262626" : "#fafafa", borderRadius: 12, overflow: "hidden", border: `1px solid ${borderColor}` }}>
                      <div style={{ position: "relative" }}>
                        <img src={v.thumbnail || "https://via.placeholder.com/400x225"} alt={v.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: 8, left: 8 }}>{getStatusBadge(v.status || "PENDING")}</div>
                        {v.accessType && v.accessType.toLowerCase() !== "free" && (
                          <div style={{ position: "absolute", top: 8, right: 8, background: Y, color: BLK, padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                            {v.accessType.toLowerCase() === "premium" ? `⭐ ${(v.supportAmount || v.price || 0).toLocaleString()} RWF` : `❤️ Support`}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: 14 }}>
                        <h4 style={{ margin: 0, marginBottom: 6 }}>{v.title}</h4>
                        <div style={{ fontSize: 11, color: textMuted, marginBottom: 10 }}>
                          👁️ {v.views || 0} · ❤️ {v.likes || 0}
                        </div>
                        {v.status === "REJECTED" && v.rejectionReason && (
                          <div style={{ fontSize: 11, color: "#b91c1c", marginBottom: 8 }}>
                            Reason: {v.rejectionReason}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setEditingVideo(v); setVideoForm({ title: v.title, videoUrl: v.videoUrl, thumbnail: v.thumbnail, accessType: v.accessType?.toLowerCase() || "free", supportAmount: String(v.supportAmount || v.price || ""), eventType: v.eventType?.toLowerCase() || "dote" }); setThumbnailPreview(v.thumbnail); setShowVideoModal(true); }} style={{ flex: 1, padding: "6px 12px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 6, cursor: "pointer", fontSize: 12, color: textColor }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteVideo(v.id)} style={{ padding: "6px 12px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* POSTS */}
          {activeTab === "posts" && (
            <Card cardBg={cardBg} border={borderColor}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h2>📝 Your Posts</h2>
                <button onClick={() => { setEditingPost(null); setPostForm({ title: "", content: "", image: null, category: "update" }); setPostImagePreview(null); setShowPostModal(true); }} style={{ padding: "8px 16px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <FaPlus /> New Post
                </button>
              </div>
              {posts.length === 0 ? (
                <EmptyState icon="📝" title="No posts yet" subtitle="Share your first wedding update" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {posts.map((p) => (
                    <div key={p.id} style={{ background: darkMode ? "#262626" : "#fafafa", border: `1px solid ${borderColor}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                        <h3 style={{ margin: 0 }}>{p.title}</h3>
                        {getStatusBadge(p.status || "PUBLISHED")}
                      </div>
                      <p style={{ color: textMuted, fontSize: 14, marginBottom: 10 }}>{p.content}</p>
                      {p.image && <img src={p.image} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={() => { setEditingPost(p); setPostForm({ title: p.title, content: p.content, image: p.image, category: p.category || "update" }); setPostImagePreview(p.image); setShowPostModal(true); }} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 6, cursor: "pointer", fontSize: 12, color: textColor }}>
                          Edit
                        </button>
                        <button onClick={() => handleDeletePost(p.id)} style={{ padding: "6px 12px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* COMMENTS */}
          {activeTab === "comments" && (
            <Card cardBg={cardBg} border={borderColor}>
              <h2 style={{ marginBottom: 20 }}>💬 Comments on Your Content</h2>
              {comments.length === 0 ? (
                <EmptyState icon="💬" title="No comments yet" subtitle="Comments on your videos and posts will appear here" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {comments.map((c) => (
                    <div key={c.id} style={{ background: darkMode ? "#262626" : "#fafafa", border: `1px solid ${borderColor}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                        <strong>{c.user?.name || c.userName || "Anonymous"}</strong>
                        <span style={{ fontSize: 12, color: textMuted }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 14 }}>{c.content}</p>
                      {c.videoId && <div style={{ fontSize: 11, color: textMuted, marginTop: 6 }}>On video #{c.videoId}</div>}
                      {c.postId && <div style={{ fontSize: 11, color: textMuted, marginTop: 6 }}>On post #{c.postId}</div>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <Card cardBg={cardBg} border={borderColor}>
              <h2 style={{ marginBottom: 20 }}>📅 Your Bookings</h2>
              {bookings.length === 0 ? (
                <EmptyState icon="📅" title="No bookings yet" subtitle="Your event bookings will appear here" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {bookings.map((b) => (
                    <div key={b.id} style={{ background: darkMode ? "#262626" : "#fafafa", border: `1px solid ${borderColor}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>#{String(b.id).slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: 12, color: textMuted }}>{b.eventType?.toLowerCase() || "wedding"} · {b.package || "Custom"}</div>
                        </div>
                        {getStatusBadge(b.status)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, fontSize: 13 }}>
                        <div><strong>Date:</strong> {b.eventDate ? new Date(b.eventDate).toLocaleDateString() : "—"}</div>
                        <div><strong>Location:</strong> {b.location || "—"}</div>
                        <div><strong>Payment:</strong> {b.paymentStatus || "Pending"}</div>
                        <div><strong>Price:</strong> {b.totalAmount ? `${Number(b.totalAmount).toLocaleString()} RWF` : "Not set"}</div>
                        {b.creator?.name && <div><strong>Creator:</strong> {b.creator.name}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* EARNINGS */}
          {activeTab === "earnings" && (
            <Card cardBg={cardBg} border={borderColor}>
              <h2 style={{ marginBottom: 20 }}>💰 Earnings</h2>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                <StatCard icon="💰" value={`${supportEarnings.total.toLocaleString()} RWF`} label="Available Balance" cardBg={`${Y}10`} border={borderColor} textMuted={textMuted} />
                <StatCard icon="📅" value={`${supportEarnings.monthly.toLocaleString()} RWF`} label="This Month" cardBg={`${Y}10`} border={borderColor} textMuted={textMuted} />
                <StatCard icon="❤️" value={supportEarnings.totalSupports} label="Total Supports" cardBg={`${Y}10`} border={borderColor} textMuted={textMuted} />
              </div>

              <div style={{ background: darkMode ? "#262626" : "#fafafa", border: `1px solid ${borderColor}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <h3 style={{ marginBottom: 12 }}>📊 Revenue Split (60/40)</h3>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${borderColor}` }}>
                  <span>💑 Your share (60%)</span>
                  <strong style={{ color: "#22c55e" }}>{supportEarnings.coupleShare.toLocaleString()} RWF</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span>🏢 Platform fee (40%)</span>
                  <strong style={{ color: Y }}>{supportEarnings.platformShare.toLocaleString()} RWF</strong>
                </div>
              </div>

              <button onClick={() => setShowWithdrawalModal(true)} style={{ padding: "12px 24px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
                💸 Request Withdrawal
              </button>

              {withdrawals.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ marginBottom: 12 }}>📋 Withdrawal History</h3>
                  {withdrawals.map((w) => (
                    <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: 12, background: darkMode ? "#262626" : "#fafafa", borderRadius: 8, marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <span><strong>{w.amount?.toLocaleString()} RWF</strong> · {w.paymentMethod || "MTN"}</span>
                      <span>{getStatusBadge(w.status)}</span>
                    </div>
                  ))}
                </div>
              )}

              {supportEarnings.recentSupports.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ marginBottom: 12 }}>Recent Supporters</h3>
                  {supportEarnings.recentSupports.slice(0, 5).map((s) => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${borderColor}`, fontSize: 13, flexWrap: "wrap", gap: 8 }}>
                      <span>{s.supporterName || "Anonymous"}</span>
                      <strong style={{ color: Y }}>+{s.amount.toLocaleString()} RWF</strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* PAYMENTS */}
          {activeTab === "payments" && (
            <Card cardBg={cardBg} border={borderColor}>
              <h2 style={{ marginBottom: 20 }}>💳 Payment History</h2>
              {paymentHistory.length === 0 ? (
                <EmptyState icon="💳" title="No payments yet" subtitle="Your transaction history will appear here" />
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: darkMode ? "#2a2a2a" : "#f8f8f8" }}>
                        <th style={thStyle(borderColor)}>ID</th>
                        <th style={thStyle(borderColor)}>Amount</th>
                        <th style={thStyle(borderColor)}>Type</th>
                        <th style={thStyle(borderColor)}>Status</th>
                        <th style={thStyle(borderColor)}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((p) => (
                        <tr key={p.id}>
                          <td style={tdStyle(borderColor)}>#{p.id}</td>
                          <td style={tdStyle(borderColor)}><strong>{p.amount?.toLocaleString()} RWF</strong></td>
                          <td style={tdStyle(borderColor)}>{p.type || p.method || "—"}</td>
                          <td style={tdStyle(borderColor)}>{getStatusBadge(p.status)}</td>
                          <td style={tdStyle(borderColor)}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <Card cardBg={cardBg} border={borderColor}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h2>🔔 Notifications</h2>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${Y}`, borderRadius: 8, color: Y, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    <FaCheck /> Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up!" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ background: n.read ? (darkMode ? "#262626" : "#fafafa") : `${Y}10`, border: `1px solid ${borderColor}`, borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{n.title}</div>
                        <div style={{ fontSize: 13, color: textMuted, marginBottom: 6 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: textMuted }}>{n.date || (n.createdAt && new Date(n.createdAt).toLocaleString())}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {!n.read && (
                          <button onClick={() => markNotificationAsRead(n.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}>
                            <FaCheck />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(n.id)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 11 }}>
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <Card cardBg={cardBg} border={borderColor}>
              <h2 style={{ marginBottom: 20 }}>⚙️ Privacy & Content Settings</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Page Visibility</label>
                  <select
                    value={profile.pageVisibility}
                    onChange={(e) => {
                      setProfile({ ...profile, pageVisibility: e.target.value });
                      setProfileForm({ ...profileForm, pageVisibility: e.target.value });
                    }}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#333" : "#fff", color: textColor }}
                  >
                    <option value="public">🌍 Public — Anyone can see your page</option>
                    <option value="private">🔒 Private — Only you can see your page</option>
                    <option value="link-only">🔗 Link only — Accessible by direct link</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Content Permission</label>
                  <select
                    value={profile.contentPermission}
                    onChange={(e) => {
                      setProfile({ ...profile, contentPermission: e.target.value });
                      setProfileForm({ ...profileForm, contentPermission: e.target.value });
                    }}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#333" : "#fff", color: textColor }}
                  >
                    <option value="public">Anyone can view</option>
                    <option value="supporters">Supporters only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  style={{ padding: "12px 24px", background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                >
                  Save Settings
                </button>
              </div>
            </Card>
          )}

        </main>
      </div>

      {/* ── Modals ───────────────────────────────── */}
      {showProfileModal && (
        <Modal onClose={() => setShowProfileModal(false)} title="👤 Edit Profile" cardBg={cardBg} border={borderColor} isMobile={isMobile}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div
              onClick={() => document.getElementById("profilePicInput")?.click()}
              style={{ width: 90, height: 90, borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, cursor: "pointer", overflow: "hidden", color: BLK }}
            >
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (profileForm.coupleName || "C").charAt(0)
              )}
            </div>
            <input id="profilePicInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileImageSelect} />
            <p style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>Click to change</p>
          </div>

          <FormInput label="Couple Name" value={profileForm.coupleName} onChange={(v) => setProfileForm({ ...profileForm, coupleName: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />
          <FormInput label="Bride Name" value={profileForm.brideName} onChange={(v) => setProfileForm({ ...profileForm, brideName: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />
          <FormInput label="Groom Name" value={profileForm.groomName} onChange={(v) => setProfileForm({ ...profileForm, groomName: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />
          <FormInput label="Wedding Date" type="date" value={profileForm.weddingDate} onChange={(v) => setProfileForm({ ...profileForm, weddingDate: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />
          <FormInput label="Location" value={profileForm.location} onChange={(v) => setProfileForm({ ...profileForm, location: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />
          <FormInput label="Bio" type="textarea" value={profileForm.bio} onChange={(v) => setProfileForm({ ...profileForm, bio: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />

          <div style={{ display: "flex", gap: 10, marginTop: 20, flexDirection: isMobile ? "column" : "row" }}>
            <button onClick={handleUpdateProfile} style={{ flex: 1, padding: 12, background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
            <button onClick={() => setShowProfileModal(false)} style={{ padding: 12, background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", color: textColor }}>Cancel</button>
          </div>
        </Modal>
      )}

      {showVideoModal && (
        <Modal onClose={() => setShowVideoModal(false)} title={editingVideo ? "✏️ Edit Video" : "📤 Upload Video"} cardBg={cardBg} border={borderColor} isMobile={isMobile}>
          <FormInput label="Title" value={videoForm.title} onChange={(v) => setVideoForm({ ...videoForm, title: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />
          <FormInput label="YouTube URL" value={videoForm.videoUrl} onChange={(v) => setVideoForm({ ...videoForm, videoUrl: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Event Type</label>
          <select value={videoForm.eventType} onChange={(e) => setVideoForm({ ...videoForm, eventType: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#333" : "#fff", color: textColor, marginBottom: 12 }}>
            <option value="wedding">💍 Wedding</option>
            <option value="dote">🪘 DOTE</option>
            <option value="birthday">🎂 Birthday</option>
            <option value="funeral">🕊️ Funeral</option>
            <option value="graduation">🎓 Graduation</option>
            <option value="corporate">🏢 Corporate</option>
          </select>

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Access Type</label>
          <select value={videoForm.accessType} onChange={(e) => setVideoForm({ ...videoForm, accessType: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#333" : "#fff", color: textColor, marginBottom: 12 }}>
            <option value="free">🆓 Free</option>
            <option value="support">❤️ Support-based</option>
            <option value="premium">⭐ Premium (Paid)</option>
          </select>

          {videoForm.accessType !== "free" && (
            <FormInput label={videoForm.accessType === "premium" ? "Price (RWF)" : "Suggested Support (RWF)"} type="number" value={videoForm.supportAmount} onChange={(v) => setVideoForm({ ...videoForm, supportAmount: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />
          )}

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Thumbnail</label>
          <div
            onClick={() => document.getElementById("thumbInput")?.click()}
            style={{ border: `2px dashed ${borderColor}`, borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", marginBottom: 12 }}
          >
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="Preview" style={{ maxHeight: 150, borderRadius: 8 }} />
            ) : (
              <div style={{ color: textMuted, fontSize: 13 }}>
                <div style={{ fontSize: 32 }}>🖼️</div>
                Click to upload
              </div>
            )}
            <input id="thumbInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbnailUpload} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8, flexDirection: isMobile ? "column" : "row" }}>
            <button onClick={handleUploadVideo} style={{ flex: 1, padding: 12, background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>{editingVideo ? "Save" : "Submit"}</button>
            <button onClick={() => setShowVideoModal(false)} style={{ padding: 12, background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", color: textColor }}>Cancel</button>
          </div>
        </Modal>
      )}

      {showPostModal && (
        <Modal onClose={() => setShowPostModal(false)} title={editingPost ? "✏️ Edit Post" : "📝 New Post"} cardBg={cardBg} border={borderColor} isMobile={isMobile}>
          <FormInput label="Title" value={postForm.title} onChange={(v) => setPostForm({ ...postForm, title: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 8, marginBottom: 6 }}>Category</label>
          <select value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${borderColor}`, background: darkMode ? "#333" : "#fff", color: textColor, marginBottom: 12 }}>
            <option value="update">Wedding Update</option>
            <option value="story">Love Story</option>
            <option value="anniversary">Anniversary</option>
            <option value="thanks">Thank You</option>
          </select>

          <FormInput label="Content" type="textarea" value={postForm.content} onChange={(v) => setPostForm({ ...postForm, content: v })} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Image (optional)</label>
          <div onClick={() => document.getElementById("postImgInput")?.click()} style={{ border: `2px dashed ${borderColor}`, borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer", marginBottom: 12 }}>
            {postImagePreview ? <img src={postImagePreview} style={{ maxHeight: 100, borderRadius: 6 }} alt="" /> : <span style={{ color: textMuted, fontSize: 13 }}>Click to upload image</span>}
            <input id="postImgInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePostImageUpload} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8, flexDirection: isMobile ? "column" : "row" }}>
            <button onClick={handleCreatePost} style={{ flex: 1, padding: 12, background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>{editingPost ? "Update" : "Publish"}</button>
            <button onClick={() => setShowPostModal(false)} style={{ padding: 12, background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", color: textColor }}>Cancel</button>
          </div>
        </Modal>
      )}

      {showWithdrawalModal && (
        <Modal onClose={() => setShowWithdrawalModal(false)} title="💸 Request Withdrawal" cardBg={cardBg} border={borderColor} isMobile={isMobile}>
          <p style={{ marginBottom: 16 }}>Available: <strong style={{ color: Y }}>{supportEarnings.total.toLocaleString()} RWF</strong></p>

          <FormInput label="Amount (RWF)" type="number" value={withdrawalAmount} onChange={setWithdrawalAmount} inputBg={darkMode ? "#333" : "#fff"} border={borderColor} />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Payment Method</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["mtn", "airtel"].map((m) => (
              <button key={m} onClick={() => setWithdrawalMethod(m)} style={{ flex: 1, padding: 12, background: withdrawalMethod === m ? Y : "transparent", color: withdrawalMethod === m ? BLK : textColor, border: `1px solid ${withdrawalMethod === m ? Y : borderColor}`, borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                {m === "mtn" ? "📱 MTN" : "📱 Airtel"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
            <button onClick={handleRequestWithdrawal} style={{ flex: 1, padding: 12, background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Request</button>
            <button onClick={() => setShowWithdrawalModal(false)} style={{ padding: 12, background: "transparent", border: `1px solid ${borderColor}`, borderRadius: 8, cursor: "pointer", color: textColor }}>Cancel</button>
          </div>
        </Modal>
      )}

      {showShareModal && (
        <Modal onClose={() => setShowShareModal(false)} title="🔗 Share Your Page" cardBg={cardBg} border={borderColor} isMobile={isMobile}>
          <p style={{ marginBottom: 16, color: textMuted, fontSize: 14 }}>Share this link with family and friends:</p>
          <div style={{ background: darkMode ? "#333" : "#f5f5f5", padding: 12, borderRadius: 8, fontSize: 12, wordBreak: "break-all", marginBottom: 16, fontFamily: "monospace" }}>
            {`${window.location.origin}/couple/${couple?.id}`}
          </div>
          <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row" }}>
            <button onClick={handleShare} style={{ flex: 1, padding: 12, background: Y, color: BLK, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Copy Link</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${window.location.origin}/couple/${couple?.id}`)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
              <button style={{ width: "100%", padding: 12, background: "#25d366", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>WhatsApp</button>
            </a>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Small Components ────────────────────────────
function StatCard({ icon, value, label, cardBg, border, textMuted }) {
  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: textMuted }}>{label}</div>
    </div>
  );
}

function Card({ children, cardBg, border }) {
  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: "center", padding: 48 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{subtitle}</div>
    </div>
  );
}

function InfoRow({ label, value, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
      <span style={{ color: muted, fontSize: 13 }}>{label}</span>
      <strong style={{ fontSize: 14 }}>{value || "—"}</strong>
    </div>
  );
}

function Modal({ children, onClose, title, cardBg, border, isMobile }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: cardBg, borderRadius: 16, padding: 24, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "inherit" }}>
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", inputBg, border }) {
  const isTextarea = type === "textarea";
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {isTextarea ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: "inherit", minHeight: 80, boxSizing: "border-box", resize: "vertical" }} />
      ) : (
        <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: "inherit", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

function thStyle(border) {
  return { padding: "12px", textAlign: "left", fontSize: 12, fontWeight: 700, borderBottom: `1px solid ${border}` };
}

function tdStyle(border) {
  return { padding: "12px", fontSize: 13, borderBottom: `1px solid ${border}` };
}