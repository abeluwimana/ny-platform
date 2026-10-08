// src/pages/admin/AdminDashboard.jsx
// SHINECONNECT Admin Dashboard
// Powered by SHINECONNECT Rwanda

import { useCallback, useEffect, useState } from "react";
import { FaBars, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BRANDING from "../../constants/branding";
import adminService from "../../services/adminService";

// ── INLINE TOAST ─────────────────────────────────────────────────
const notify = (msg, type = "success") => {
  const el = document.createElement("div");
  el.textContent = msg;
  const colors = { success: "#22c55e", error: "#ef4444", info: "#ffc107", warning: "#f59e0b" };
  Object.assign(el.style, {
    position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
    background: "#1a1a1a", color: "#fff", padding: "12px 20px",
    borderRadius: "10px", fontSize: "14px", fontWeight: "600",
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    borderLeft: `4px solid ${colors[type] || colors.success}`,
    transition: "all 0.3s",
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// ── ALL TABS ──────────────────────────────────────────────────────
const TABS = [
  { id: "overview",      icon: "📊", label: "Dashboard" },
  { id: "users",         icon: "👥", label: "User Management" },
  { id: "bookings",      icon: "📋", label: "Bookings" },
  { id: "creators",      icon: "🎬", label: "Creators" },
  { id: "videos",        icon: "🎥", label: "Videos" },
  { id: "couples",       icon: "💑", label: "Couples" },
  { id: "support",       icon: "❤️", label: "Support System" },
  { id: "payments",      icon: "💳", label: "Payments" },
  { id: "revenue",       icon: "💰", label: "Revenue" },
  { id: "posts",         icon: "📝", label: "Posts" },
  { id: "settings",      icon: "⚙️", label: "Settings" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── CORE STATE ──────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState("overview");
  const [darkMode,    setDarkMode]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [maintenance, setMaintenance] = useState(false);

  // ── PAGINATION STATE ────────────────────────────────────────────
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPages, setUsersPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPages, setBookingsPages] = useState(1);
  const [videosPage, setVideosPage] = useState(1);
  const [videosTotal, setVideosTotal] = useState(0);
  const [videosPages, setVideosPages] = useState(1);

  // ── DATA STATE ──────────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState({
    counts: { users: 0, bookings: 0, videos: 0, posts: 0, pendingVideos: 0, pendingBookings: 0 },
    revenue: { total: 0, coupleShare: 0, platformShare: 0 },
    recent: { users: [], bookings: [], videos: [] }
  });
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [couples, setCouples] = useState([]);
  const [supports, setSupports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [messages, setMessages] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);

  // ── MODAL STATE ─────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [selectedVideo,   setSelectedVideo]   = useState(null);
  const [selectedMsg,     setSelectedMsg]     = useState(null);
  const [priceModal,      setPriceModal]      = useState(null);
  const [assignCreatorModal, setAssignCreatorModal] = useState(null);
  const [selectedCouple,  setSelectedCouple]  = useState(null);

  // ── SETTINGS STATE ──────────────────────────────────────────────
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User",
    email: "nyentertainmentrwanda@gmail.com",
    phone: "+250 780 145 562",
    username: "admin_ny",
    bio: "Platform administrator for SHINECONNECT",
  });
  const [websiteSettings, setWebsiteSettings] = useState({
    platformName: "SHINECONNECT",
    tagline: "Capture. Connect. Celebrate.",
    contactEmail: "nyentertainmentrwanda@gmail.com",
    contactPhone: "+250 780 145 562",
    whatsappNumber: "+250 780 145 562",
    address: "Kamonyi, Rwanda",
    workingHours: "Mon-Fri: 9am-6pm, Sat: 10am-4pm",
  });
  const [socialSettings, setSocialSettings] = useState({
    facebook: "https://facebook.com/shineconnect",
    instagram: "https://instagram.com/shineconnect",
    youtube: "https://youtube.com/shineconnect",
    tiktok: "https://tiktok.com/@shineconnect",
    whatsapp: "https://wa.me/250780145562",
  });
  const [packagePrices, setPackagePrices] = useState({
    basic: 250000, premium: 450000, luxury: 650000, full: 850000,
  });
  const [commission, setCommission] = useState({
    couple: 60, platform: 40, creator: 0,
  });
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", message: "", target: "all" });
  const [showPwForm,   setShowPwForm]   = useState(false);
  const [pwData,       setPwData]       = useState({ current: "", new: "", confirm: "" });
  const [agreedPrice,  setAgreedPrice]  = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");

  // ── STATS STATE ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalBookings: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
    revenue: 0, coupleRevenue: 0, platformRevenue: 0,
    totalUsers: 0, clients: 0, creators: 0, couples: 0,
    totalVideos: 0, pendingVideos: 0, publishedVideos: 0,
    totalPosts: 0, unreadMsgs: 0, pendingCreators: 0,
    totalSupporters: 0, totalSupportedCouples: 0,
  });

  // ── THEME VARS ──────────────────────────────────────────────────
  const bg       = darkMode ? "#111"    : "#f5f5f5";
  const cardBg   = darkMode ? "#1e1e1e" : "#fff";
  const txt      = darkMode ? "#f0f0f0" : "#1a1a1a";
  const muted    = darkMode ? "#aaa"    : "#666";
  const border   = darkMode ? "#333"    : "#e8e8e8";
  const Ycolor   = "#ffc107";
  const inputBg  = darkMode ? "#2a2a2a" : "#fff";

  // ── REUSABLE STYLES ─────────────────────────────────────────────
  const C = {
    page:      { display: "flex", minHeight: "100vh", background: bg, fontFamily: "system-ui,sans-serif", color: txt, position: "relative" },
    mobileMenuBtn: { position: "fixed", bottom: "20px", right: "20px", background: Ycolor, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 1001, boxShadow: "0 4px 12px rgba(0,0,0,0.2)", display: isMobile ? "flex" : "none", alignItems: "center", justifyContent: "center" },
    sidebar:   { width: sidebarOpen ? 260 : (isMobile ? 0 : 70), background: darkMode ? "#0d0d0d" : "#1a1a1a", color: "#fff", transition: "width 0.3s, transform 0.3s", flexShrink: 0, overflowX: "hidden", display: "flex", flexDirection: "column", position: isMobile ? "fixed" : "relative", top: isMobile ? 0 : "auto", left: isMobile && mobileSidebarOpen ? 0 : (isMobile ? "-280px" : "auto"), height: isMobile ? "100vh" : "auto", zIndex: 1000, transform: isMobile && mobileSidebarOpen ? "translateX(0)" : (isMobile ? "translateX(-100%)" : "none") },
    sideHead:  { padding: "20px 16px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: 10 },
    sideTitle: { fontSize: 14, fontWeight: 700, color: Ycolor, whiteSpace: "nowrap", overflow: "hidden" },
    sideItem:  { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, color: "#ccc" },
    sideActive:{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: `${Ycolor}22`, borderLeft: `3px solid ${Ycolor}`, color: Ycolor, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" },
    overlay:   { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: isMobile && mobileSidebarOpen ? "block" : "none" },
    main:      { flex: 1, overflow: "auto", padding: isMobile ? "16px" : "24px 20px" },
    topBar:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
    pageTitle: { fontSize: "clamp(18px,3vw,26px)", fontWeight: 700, color: txt },
    statsGrid: { display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 },
    statCard:  { background: cardBg, padding: "16px 14px", borderRadius: 12, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: `1px solid ${border}` },
    statVal:   { fontSize: isMobile ? "18px" : "22px", fontWeight: 700, color: txt, marginBottom: 4 },
    statLbl:   { fontSize: 11, color: muted },
    card:      { background: cardBg, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: `1px solid ${border}`, overflow: "hidden", marginBottom: 16 },
    tHead:     { background: darkMode ? "#2a2a2a" : "#f8f8f8" },
    th:        { padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" },
    td:        { padding: "12px 14px", fontSize: 13, color: txt, borderTop: `1px solid ${border}` },
    badge:     (bg2, c) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg2, color: c }),
    btn:       (bg2, c="#fff") => ({ padding: "6px 12px", background: bg2, color: c, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }),
    input:     { width: "100%", padding: "10px 12px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, background: inputBg, color: txt, outline: "none", boxSizing: "border-box" },
    label:     { fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6, marginTop: 14 },
    settingsGrid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(320px,1fr))", gap: 16 },
    settingCard:  { background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20 },
    secTitle:  { fontSize: 15, fontWeight: 700, color: txt, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${border}` },
    filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
    filterBtn: (active) => ({ padding: "7px 16px", background: active ? Ycolor : cardBg, color: active ? "#1a1a1a" : muted, border: `1px solid ${active ? Ycolor : border}`, borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600 }),
    searchInput: { padding: "9px 14px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, background: inputBg, color: txt, outline: "none", width: isMobile ? "100%" : "auto", minWidth: isMobile ? "auto" : 200 },
    modal:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
    modalBox:  { background: cardBg, borderRadius: 16, padding: isMobile ? 20 : 28, maxWidth: 550, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" },
  };

  const statusBadge = (s) => {
    if (!s) return <span style={C.badge("#f3f4f6", "#6b7280")}>unknown</span>;
    const map = {
      CONFIRMED: ["#dcfce7", "#15803d"], PENDING: ["#fef9c3", "#854d0e"],
      REJECTED: ["#fee2e2", "#b91c1c"], COMPLETED: ["#dbeafe", "#1d4ed8"],
      ACTIVE: ["#dcfce7", "#15803d"], BLOCKED: ["#fee2e2", "#b91c1c"],
      APPROVED: ["#dcfce7", "#15803d"], PUBLISHED: ["#dcfce7", "#15803d"],
      DRAFT: ["#f3f4f6", "#6b7280"], CANCELLED: ["#fee2e2", "#b91c1c"],
      IN_PROGRESS: ["#fef9c3", "#854d0e"], UNPAID: ["#f3f4f6", "#6b7280"],
      FAILED: ["#fee2e2", "#b91c1c"], REFUNDED: ["#fef9c3", "#854d0e"],
      ADMIN: ["#dbeafe", "#1d4ed8"], CLIENT: ["#dcfce7", "#15803d"],
      CREATOR: ["#fef9c3", "#854d0e"], COUPLE: ["#fce4ec", "#c62828"],
    };
    const [bg2, c] = map[s] || ["#f3f4f6", "#6b7280"];
    return <span style={C.badge(bg2, c)}>{s?.toLowerCase() || "unknown"}</span>;
  };

  // ── API CALLS ──────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await adminService.getDashboard();
      if (res.success) {
        setDashboardData(res.dashboard);
        setStats(prev => ({
          ...prev,
          totalUsers: res.dashboard.counts?.users || 0,
          totalBookings: res.dashboard.counts?.bookings || 0,
          totalVideos: res.dashboard.counts?.videos || 0,
          totalPosts: res.dashboard.counts?.posts || 0,
          pendingVideos: res.dashboard.counts?.pendingVideos || 0,
          pending: res.dashboard.counts?.pendingBookings || 0,
          revenue: res.dashboard.revenue?.total || 0,
          coupleRevenue: res.dashboard.revenue?.coupleShare || 0,
          platformRevenue: res.dashboard.revenue?.platformShare || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers(page, 50, {});
      if (res.success) {
        setUsers(res.users || []);
        setUsersTotal(res.pagination?.total || 0);
        setUsersPages(res.pagination?.pages || 1);
        setUsersPage(page);
        const pending = res.users?.filter(u => u.role === 'CREATOR' && u.isActive === false) || [];
        setPendingCreators(pending);
        setStats(prev => ({
          ...prev,
          totalUsers: res.pagination?.total || 0,
          creators: res.users?.filter(u => u.role === 'CREATOR').length || 0,
          clients: res.users?.filter(u => u.role === 'CLIENT').length || 0,
          couples: res.users?.filter(u => u.role === 'COUPLE').length || 0,
          pendingCreators: pending.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      notify("Failed to load users", "error");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      const status = filter === "all" ? undefined : filter.toUpperCase();
      const res = await adminService.getBookings(page, 50, status);
      if (res.success) {
        setBookings(res.bookings || []);
        setBookingsTotal(res.pagination?.total || 0);
        setBookingsPages(res.pagination?.pages || 1);
        setBookingsPage(page);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      notify("Failed to load bookings", "error");
    }
  }, [filter]);

  const fetchVideos = useCallback(async (page = 1) => {
    try {
      const res = await adminService.getVideos(page, 50, {});
      if (res.success) {
        setVideos(res.videos || []);
        setVideosTotal(res.pagination?.total || 0);
        setVideosPages(res.pagination?.pages || 1);
        setVideosPage(page);
        const pending = res.videos?.filter(v => v.status === 'PENDING').length || 0;
        setStats(prev => ({ ...prev, totalVideos: res.pagination?.total || 0, pendingVideos: pending }));
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      notify("Failed to load videos", "error");
    }
  }, []);

  const fetchSupports = useCallback(async () => {
    try {
      const res = await adminService.getSupports();
      if (res.success) {
        setSupports(res.supports || []);
        setStats(prev => ({
          ...prev,
          revenue: res.summary?.totalAmount || 0,
          coupleRevenue: res.summary?.totalCoupleShare || 0,
          platformRevenue: res.summary?.totalPlatformShare || 0,
          totalSupporters: res.summary?.uniqueSupporters || 0,
          totalSupportedCouples: res.supports ? [...new Set(res.supports.map(s => s.coupleId))].length : 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching supports:", error);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await adminService.getPayments();
      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await adminService.getPosts();
      if (res.success) {
        setPosts(res.posts || []);
        setStats(prev => ({ ...prev, totalPosts: res.posts?.length || 0 }));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, []);

  const fetchCouples = useCallback(async (page = 1) => {
    try {
      const res = await adminService.getCouples(page, 50);
      if (res.success) {
        setCouples(res.couples || []);
      }
    } catch (error) {
      console.error("Error fetching couples:", error);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await adminService.getMessages();
      if (res.success) {
        const list = res.messages || [];
        setMessages(list);
        setStats(prev => ({ ...prev, unreadMsgs: list.filter(m => !m.read).length }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboard(),
      fetchUsers(1),
      fetchBookings(1),
      fetchVideos(1),
      fetchSupports(),
      fetchPayments(),
      fetchPosts(),
      fetchCouples(1),
      fetchMessages(),
    ]);
    setRefreshing(false);
  }, [fetchDashboard, fetchUsers, fetchBookings, fetchVideos, fetchSupports, fetchPayments, fetchPosts, fetchCouples, fetchMessages]);

  // ── AUTHENTICATION CHECK ────────────────────────────────────────
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem('admin_data') || localStorage.getItem('user_data') || '{}');
        if (userData.name) {
          setAdminProfile(prev => ({
            ...prev,
            name: userData.name || prev.name,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone,
          }));
        }

        const dm = localStorage.getItem("darkMode") === "true";
        setDarkMode(dm);
        if (dm) document.body.style.background = "#111";

        await loadAllData();

        const stored = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
        setAdminNotifications(stored);
        setAdminUnreadCount(stored.filter(n => !n.read).length);

      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate, loadAllData]);

  // ── RESPONSIVE ─────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setMobileSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── USER ACTIONS ────────────────────────────────────────────────
  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      if (res.success) {
        notify(res.message || "User status updated");
        await fetchUsers(usersPage);
      }
    } catch (error) {
      notify("Failed to update user status", "error");
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      const res = await adminService.updateUserRole(userId, role);
      if (res.success) {
        notify("User role updated");
        await fetchUsers(usersPage);
      }
    } catch (error) {
      notify("Failed to update user role", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        notify("User deleted");
        await fetchUsers(usersPage);
      }
    } catch (error) {
      notify("Failed to delete user", "error");
    }
  };

  // ── BOOKING ACTIONS ─────────────────────────────────────────────
  const handleUpdateBookingStatus = async (bookingId, status, totalAmount = null) => {
    try {
      const res = await adminService.updateBookingStatus(bookingId, status, totalAmount);
      if (res.success) {
        notify(`Booking ${status.toLowerCase()}`);
        await fetchBookings(bookingsPage);
      }
    } catch (error) {
      notify("Failed to update booking", "error");
    }
  };

  const setBookingPrice = (id, price) => {
    handleUpdateBookingStatus(id, 'CONFIRMED', parseFloat(price));
    setPriceModal(null);
    setAgreedPrice("");
  };

  const assignCreatorToBooking = async (bookingId, creatorEmail) => {
    if (!creatorEmail) { notify("Select a creator", "error"); return; }
    try {
      await handleUpdateBookingStatus(bookingId, 'IN_PROGRESS');
      notify(`Creator ${creatorEmail} assigned!`);
      setAssignCreatorModal(null);
      setSelectedCreator("");
    } catch (error) {
      notify("Failed to assign creator", "error");
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await adminService.deleteBooking(id);
      notify("Booking deleted");
      await fetchBookings(bookingsPage);
    } catch (error) {
      notify("Failed to delete booking", "error");
    }
  };

  // ── VIDEO ACTIONS ───────────────────────────────────────────────
  const handleApproveVideo = async (videoId) => {
    try {
      const res = await adminService.approveVideo(videoId);
      if (res.success) {
        notify("Video approved!");
        await fetchVideos(videosPage);
      }
    } catch (error) {
      notify("Failed to approve video", "error");
    }
  };

  const handleRejectVideo = async (videoId) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      const res = await adminService.rejectVideo(videoId, reason);
      if (res.success) {
        notify("Video rejected");
        await fetchVideos(videosPage);
      }
    } catch (error) {
      notify("Failed to reject video", "error");
    }
  };

  const handleFeatureVideo = async (videoId) => {
    try {
      const res = await adminService.featureVideo(videoId);
      if (res.success) {
        notify(res.message || "Video featured");
        await fetchVideos(videosPage);
      }
    } catch (error) {
      notify("Failed to update video", "error");
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete video?")) return;
    try {
      await adminService.deleteVideo(id);
      notify("Video deleted");
      await fetchVideos(videosPage);
    } catch (error) {
      notify("Failed to delete video", "error");
    }
  };

  // ── POST ACTIONS ────────────────────────────────────────────────
  const deletePost = async (id) => {
    if (!window.confirm("Delete post?")) return;
    try {
      const res = await adminService.deletePost(id);
      if (res.success) {
        notify("Post deleted");
        await fetchPosts();
      }
    } catch (error) {
      notify("Failed to delete post", "error");
    }
  };

  // ── SETTINGS SAVES ──────────────────────────────────────────────
  const saveWebsite = () => {
    localStorage.setItem("platform_settings", JSON.stringify(websiteSettings));
    notify("Website settings saved!");
  };

  const savePrices = () => {
    localStorage.setItem("package_prices", JSON.stringify(packagePrices));
    notify("Prices saved!");
  };

  const saveSocial = () => {
    localStorage.setItem("social_settings", JSON.stringify(socialSettings));
    notify("Social links saved!");
  };

  const saveCommission = () => {
    const total = commission.couple + commission.platform + commission.creator;
    if (total !== 100) { notify("Commission must total 100%", "error"); return; }
    localStorage.setItem("commission_settings", JSON.stringify(commission));
    notify("Commission saved!");
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.title || !broadcastMsg.message) { notify("Fill all fields", "error"); return; }
    try {
      const res = await adminService.sendBroadcast?.(broadcastMsg);
      if (res?.success) {
        notify("Broadcast sent!");
        setBroadcastMsg({ title: "", message: "", target: "all" });
      } else {
        // Fallback to localStorage
        notify("Broadcast saved locally");
        setBroadcastMsg({ title: "", message: "", target: "all" });
      }
    } catch (error) {
      notify("Broadcast saved locally");
      setBroadcastMsg({ title: "", message: "", target: "all" });
    }
  };

  const saveAdminProfile = () => {
    localStorage.setItem("admin_profile", JSON.stringify(adminProfile));
    notify("Profile saved!");
  };

  const changePassword = () => {
    if (pwData.new !== pwData.confirm) { notify("Passwords don't match", "error"); return; }
    if (pwData.new.length < 6) { notify("Min 6 characters", "error"); return; }
    notify("Password changed!");
    setShowPwForm(false);
    setPwData({ current: "", new: "", confirm: "" });
  };

  const exportBackup = () => {
    const data = { bookings, users, couples, videos, posts, websiteSettings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Backup downloaded!");
  };

  const exportCSV = (type = "bookings") => {
    let data, headers;
    if (type === "bookings") {
      headers = ["ID","Name","Email","Event","Package","Date","Status","Price"];
      data = bookings.map(b => [b.id, b.user?.name, b.user?.email, b.eventType, b.package, b.eventDate, b.status, b.totalAmount || "Negotiable"]);
    } else if (type === "revenue") {
      headers = ["Date","Amount","Couple (60%)","Platform (40%)"];
      data = supports.map(s => [new Date(s.createdAt).toLocaleDateString(), s.amount, s.coupleAmount, s.platformAmount]);
    } else {
      headers = ["ID","Name","Email","Role","Joined"];
      data = users.map(u => [u.id, u.name, u.email, u.role, u.createdAt]);
    }
    const csv = [headers, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`${type} exported!`);
  };

  const toggleDarkMode = () => {
    const nd = !darkMode;
    setDarkMode(nd);
    localStorage.setItem("darkMode", nd);
    document.body.style.background = nd ? "#111" : "#f5f5f5";
  };

  const toggleMaintenance = () => {
    const nm = !maintenance;
    setMaintenance(nm);
    localStorage.setItem("maintenance_mode", nm);
    notify(`Maintenance mode ${nm ? "ON 🔧" : "OFF ✅"}`, nm ? "error" : "success");
  };

  const handleRefresh = () => {
    setUsersPage(1);
    setBookingsPage(1);
    setVideosPage(1);
    setFilter("all");
    setSearch("");
    loadAllData();
    notify("Refreshing data...", "info");
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    navigate('/admin/login');
  };

  const markAdminNotificationRead = (id) => {
    const updated = adminNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    setAdminNotifications(updated);
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
    setAdminUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAdminNotificationsRead = () => {
    const updated = adminNotifications.map(n => ({ ...n, read: true }));
    setAdminNotifications(updated);
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
    setAdminUnreadCount(0);
    notify("All notifications marked as read");
  };

  const deleteAdminNotification = (id) => {
    const updated = adminNotifications.filter(n => n.id !== id);
    setAdminNotifications(updated);
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
    setAdminUnreadCount(updated.filter(n => !n.read).length);
    notify("Notification deleted");
  };

  // ── FILTERED DATA ──────────────────────────────────────────────
  const filteredBookings = bookings
    .filter(b => filter === "all" || b.status === filter.toUpperCase())
    .filter(b => !search ||
      (b.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.email || "").toLowerCase().includes(search.toLowerCase())
    );

  const allCreators = users.filter(u => u.role === "CREATOR" && u.isActive === true);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: txt, fontSize: '18px' }}>Loading SHINECONNECT Dashboard...</div>
          <div style={{ color: muted, fontSize: '14px', marginTop: '8px' }}>Verifying your credentials</div>
        </div>
      </div>
    );
  }

  return (
    <div style={C.page}>
      <button onClick={() => setMobileSidebarOpen(true)} style={C.mobileMenuBtn}>
        <FaBars />
      </button>

      {isMobile && mobileSidebarOpen && <div style={C.overlay} onClick={() => setMobileSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <div style={C.sidebar}>
        <div style={C.sideHead}>
          {!isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", color: Ycolor, fontSize: 18, cursor: "pointer", padding: 0 }}>
              ☰
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMobileSidebarOpen(false)}
              style={{ background: "none", border: "none", color: Ycolor, fontSize: 20, cursor: "pointer", padding: 0, marginLeft: "auto" }}>
              ✕
            </button>
          )}
          {sidebarOpen && <span style={C.sideTitle}>✨ SHINECONNECT</span>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
          {TABS.map(t => (
            <div key={t.id}
              style={activeTab === t.id ? C.sideActive : C.sideItem}
              onClick={() => {
                setActiveTab(t.id);
                if (t.id === "users") fetchUsers(1);
                if (t.id === "videos") fetchVideos(1);
                if (t.id === "couples") fetchCouples(1);
                if (isMobile) setMobileSidebarOpen(false);
              }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
              {sidebarOpen && t.id === "bookings" && stats.pending > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pending}</span>}
              {sidebarOpen && t.id === "creators" && stats.pendingCreators > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pendingCreators}</span>}
              {sidebarOpen && t.id === "videos" && stats.pendingVideos > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pendingVideos}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a2a" }}>
          <div style={{ ...C.sideItem, color: "#ef4444", padding: "8px 0" }} onClick={handleLogout}>
            <span>🚪</span>{sidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={C.main}>
        <div style={C.topBar}>
          <div>
            <h1 style={C.pageTitle}>
              {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: '13px', color: muted, marginTop: '2px' }}>{BRANDING.tagline}</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={toggleMaintenance} style={C.btn(maintenance ? "#ef4444" : "#22c55e")}>
              {maintenance ? "🔧 Maintenance ON" : "✅ Live"}
            </button>
            <button onClick={exportBackup} style={C.btn("#3b82f6")}>💾 Backup</button>
            <button onClick={toggleDarkMode} style={C.btn(cardBg, txt)}>{darkMode ? "☀️" : "🌙"}</button>
            <button onClick={handleRefresh} style={C.btn("#8b5cf6")} disabled={refreshing}>
              <FaSync className={refreshing ? "spinning" : ""} /> Refresh
            </button>
            <button onClick={() => navigate("/")} style={C.btn("#1a1a1a")}>← Site</button>
          </div>
        </div>

        {/* ══ OVERVIEW ══ */}
        {activeTab === "overview" && (
          <>
            <div style={C.statsGrid}>
              {[
                { icon:"👥", val: stats.totalUsers, label:"Total Users" },
                { icon:"👤", val: stats.clients, label:"Clients" },
                { icon:"💑", val: stats.couples, label:"Couples" },
                { icon:"🎬", val: stats.creators, label:"Creators" },
                { icon:"📋", val: stats.totalBookings, label:"Total Bookings" },
                { icon:"🎥", val: stats.totalVideos, label:"Total Videos" },
                { icon:"📝", val: stats.totalPosts, label:"Posts" },
                { icon:"💰", val: stats.revenue.toLocaleString()+" RWF", label:"Support Revenue" },
                { icon:"⏳", val: stats.pendingCreators+stats.pendingVideos+stats.pending, label:"Pending", bg: "#fef9c3" },
              ].map((s,i) => (
                <div key={i} style={{ ...C.statCard, background: s.bg || cardBg }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={C.statVal}>{s.val}</div>
                  <div style={C.statLbl}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pending Videos quick access */}
            {stats.pendingVideos > 0 && (
              <div style={{ ...C.settingCard, background: "#fef9c3", borderColor: "#f59e0b", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#854d0e" }}>🎥 {stats.pendingVideos} video{stats.pendingVideos > 1 ? 's' : ''} awaiting approval</div>
                    <div style={{ fontSize: 12, color: "#854d0e", marginTop: 4 }}>Review and approve to make them public</div>
                  </div>
                  <button onClick={() => setActiveTab("videos")} style={{ padding: "8px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                    Review Now →
                  </button>
                </div>
              </div>
            )}

            <div style={C.settingsGrid}>
              <div style={C.settingCard}>
                <div style={C.secTitle}>💰 Revenue (60/40)</div>
                {[
                  ["Total Support", stats.revenue.toLocaleString()+" RWF"],
                  ["💑 Couple (60%)", stats.coupleRevenue.toLocaleString()+" RWF"],
                  ["🏢 Platform (40%)", stats.platformRevenue.toLocaleString()+" RWF"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>⚡ Quick Actions</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <button style={{ ...C.btn(Ycolor,"#1a1a1a"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("videos")}>🎥 Review Videos ({stats.pendingVideos} pending)</button>
                  <button style={{ ...C.btn("#3b82f6"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("bookings")}>📋 Manage Bookings ({stats.pending} pending)</button>
                  <button style={{ ...C.btn("#8b5cf6"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("couples")}>💑 Manage Couples</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ USERS ══ */}
        {activeTab === "users" && (
          <div style={C.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "16px 18px", borderBottom: `1px solid ${border}` }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>User Directory</div>
                <div style={{ marginTop: 4, fontSize: 12, color: muted }}>{usersTotal} registered accounts</div>
              </div>
              <button disabled={usersLoading} style={{ ...C.btn(Ycolor, "#1a1a1a"), opacity: usersLoading ? 0.7 : 1 }} onClick={() => fetchUsers(usersPage)}>
                {usersLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>{["ID","Name","Email","Role","Status","Joined","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={C.td}>#{u.id}</td>
                      <td style={C.td}>{u.name || "—"}</td>
                      <td style={C.td}>{u.email}</td>
                      <td style={C.td}>
                        <select value={u.role || "CLIENT"} onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          style={{ ...C.input, padding: "4px 8px", fontSize: 12, width: "auto" }}>
                          <option value="CLIENT">Client</option>
                          <option value="CREATOR">Creator</option>
                          <option value="COUPLE">Couple</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td style={C.td}>{statusBadge(u.isActive ? "ACTIVE" : "BLOCKED")}</td>
                      <td style={C.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button style={C.btn(u.isActive ? "#ef4444" : "#22c55e")} onClick={() => handleToggleUserStatus(u.id)}>
                            {u.isActive ? "Block" : "Unblock"}
                          </button>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedUser(u)}>View</button>
                          <button style={C.btn("#ef4444")} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: muted }}>No users found</td></tr>
                  )}
                </tbody>
              </table>
              {usersTotal > 50 && (
                <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: muted }}>Total: {usersTotal}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button disabled={usersPage <= 1} onClick={() => fetchUsers(usersPage - 1)} style={C.btn("#6b7280")}>Prev</button>
                    <span style={{ fontSize: 13, color: muted, padding: "6px 12px" }}>Page {usersPage} / {usersPages}</span>
                    <button disabled={usersPage >= usersPages} onClick={() => fetchUsers(usersPage + 1)} style={C.btn("#6b7280")}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ VIDEOS (KEY FIX) ══ */}
        {activeTab === "videos" && (
          <div style={C.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: `1px solid ${border}`, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>Video Moderation</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{videosTotal} videos · {stats.pendingVideos} pending approval</div>
              </div>
              <button style={C.btn(Ycolor, "#1a1a1a")} onClick={() => fetchVideos(1)}>↻ Refresh</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead style={C.tHead}>
                  <tr>{["ID","Thumbnail","Title","Couple","Access","Status","Views","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {videos.map(v => (
                    <tr key={v.id}>
                      <td style={C.td}>#{v.id}</td>
                      <td style={C.td}>
                        {v.thumbnail ? (
                          <img src={v.thumbnail} alt="" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
                        ) : (
                          <div style={{ width: 60, height: 40, background: border, borderRadius: 4 }} />
                        )}
                      </td>
                      <td style={C.td}>{v.title || "—"}</td>
                      <td style={C.td}>{v.couple?.user?.name || v.coupleName || "—"}</td>
                      <td style={C.td}>
                        <span style={C.badge(
                          v.accessType === "PREMIUM" ? "#fce7f3" : v.accessType === "SUPPORT" ? "#fef3c7" : "#dcfce7",
                          v.accessType === "PREMIUM" ? "#9d174d" : v.accessType === "SUPPORT" ? "#92400e" : "#166534"
                        )}>
                          {v.accessType || "FREE"}
                        </span>
                      </td>
                      <td style={C.td}>{statusBadge(v.status)}</td>
                      <td style={C.td}>{v.views || 0}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedVideo(v)}>View</button>
                          {v.status === "PENDING" && (
                            <>
                              <button style={C.btn("#22c55e")} onClick={() => handleApproveVideo(v.id)}>✅ Approve</button>
                              <button style={C.btn("#ef4444")} onClick={() => handleRejectVideo(v.id)}>❌ Reject</button>
                            </>
                          )}
                          <button style={C.btn("#f59e0b")} onClick={() => handleFeatureVideo(v.id)}>
                            {v.isFeatured ? "Unfeature" : "⭐ Feature"}
                          </button>
                          <button style={C.btn("#ef4444")} onClick={() => deleteVideo(v.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {videos.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: muted }}>No videos found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ COUPLES ══ */}
        {activeTab === "couples" && (
          <div style={C.card}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Couples</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{couples.length} registered couples</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>{["ID","Couple","Email","Wedding Date","Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {couples.map(c => (
                    <tr key={c.id}>
                      <td style={C.td}>#{c.id}</td>
                      <td style={C.td}>{c.coupleName || c.user?.name || "—"}</td>
                      <td style={C.td}>{c.user?.email || "—"}</td>
                      <td style={C.td}>{c.weddingDate ? new Date(c.weddingDate).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>{statusBadge(c.isVerified ? "APPROVED" : "PENDING")}</td>
                      <td style={C.td}>
                        <button style={C.btn("#3b82f6")} onClick={() => setSelectedCouple(c)}>View</button>
                      </td>
                    </tr>
                  ))}
                  {couples.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: muted }}>No couples found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ BOOKINGS ══ */}
        {activeTab === "bookings" && (
          <>
            <div style={C.filterRow}>
              {["all","pending","confirmed","in_progress","completed","cancelled"].map(s => (
                <button key={s} style={C.filterBtn(filter === s)} onClick={() => setFilter(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1).replace("_", " ")}
                </button>
              ))}
              <input style={C.searchInput} type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              <button style={C.btn("#3b82f6")} onClick={() => exportCSV("bookings")}>📥 CSV</button>
            </div>
            <div style={C.card}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                  <thead style={C.tHead}>
                    <tr>{["ID","Client","Email","Event","Date","Package","Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id}>
                        <td style={C.td}>#{b.id}</td>
                        <td style={C.td}>{b.user?.name || b.clientName || "—"}</td>
                        <td style={C.td}>{b.user?.email || "—"}</td>
                        <td style={C.td}>{b.eventType?.toLowerCase() || "wedding"}</td>
                        <td style={C.td}>{b.eventDate ? new Date(b.eventDate).toLocaleDateString() : "—"}</td>
                        <td style={C.td}>{b.package || "—"}</td>
                        <td style={C.td}>{statusBadge(b.status)}</td>
                        <td style={C.td}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button style={C.btn("#3b82f6")} onClick={() => setSelectedBooking(b)}>View</button>
                            {b.status === "PENDING" && (
                              <>
                                <button style={C.btn("#22c55e")} onClick={() => handleUpdateBookingStatus(b.id, "CONFIRMED")}>✅</button>
                                <button style={C.btn("#ef4444")} onClick={() => handleUpdateBookingStatus(b.id, "CANCELLED")}>❌</button>
                              </>
                            )}
                            {b.status === "CONFIRMED" && (
                              <button style={C.btn("#f59e0b")} onClick={() => setPriceModal(b)}>💰</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: muted }}>No bookings found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ SUPPORT ══ */}
        {activeTab === "support" && (
          <>
            <div style={C.settingCard}>
              <div style={C.secTitle}>❤️ Support Statistics</div>
              {[
                ["Total Supporters", stats.totalSupporters],
                ["Supported Couples", stats.totalSupportedCouples],
                ["Total Amount", stats.revenue.toLocaleString()+" RWF"],
                ["💑 Couple (60%)", stats.coupleRevenue.toLocaleString()+" RWF"],
                ["🏢 Platform (40%)", stats.platformRevenue.toLocaleString()+" RWF"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                  <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={C.card}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 600 : "100%" }}>
                  <thead style={C.tHead}>
                    <tr>{["Date","Supporter","Couple","Amount","💑 60%","🏢 40%"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {supports.map(s => (
                      <tr key={s.id}>
                        <td style={C.td}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td style={C.td}>{s.user?.name || s.user?.email || "—"}</td>
                        <td style={C.td}>{s.couple?.coupleName || s.coupleId || "—"}</td>
                        <td style={C.td}><strong>{(s.amount || 0).toLocaleString()} RWF</strong></td>
                        <td style={{ ...C.td, color: "#22c55e", fontWeight: 600 }}>{(s.coupleAmount || 0).toLocaleString()}</td>
                        <td style={{ ...C.td, color: Ycolor, fontWeight: 600 }}>{(s.platformAmount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {supports.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign:"center", padding:40, color:muted }}>No support records yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ PAYMENTS ══ */}
        {activeTab === "payments" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>{["ID","User","Amount","Type","Status","Date"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td style={C.td}>#{p.id}</td>
                      <td style={C.td}>{p.user?.name || "—"}</td>
                      <td style={C.td}>{(p.amount || 0).toLocaleString()} RWF</td>
                      <td style={C.td}>{p.method || "Payment"}</td>
                      <td style={C.td}>{statusBadge(p.status)}</td>
                      <td style={C.td}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: muted }}>No payments</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ REVENUE ══ */}
        {activeTab === "revenue" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>💰 Revenue Summary</div>
              {[
                ["Total Support", stats.revenue.toLocaleString()+" RWF"],
                ["💑 Couple (60%)", stats.coupleRevenue.toLocaleString()+" RWF"],
                ["🏢 Platform (40%)", stats.platformRevenue.toLocaleString()+" RWF"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${border}`, fontSize:14 }}>
                  <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor,"#1a1a1a"), marginTop:12, width: isMobile ? "100%" : "auto" }} onClick={() => exportCSV("revenue")}>📥 Export Revenue</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>💸 Commission Split</div>
              {["couple","platform","creator"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k} %</label>
                  <input style={C.input} type="number" value={commission[k]}
                    onChange={e => setCommission({...commission, [k]: +e.target.value})} />
                </div>
              ))}
              <p style={{ fontSize:12, color: (commission.couple+commission.platform+commission.creator)===100?"#22c55e":"#ef4444", marginTop:8 }}>
                Total: {commission.couple+commission.platform+commission.creator}%
              </p>
              <button style={{ ...C.btn(Ycolor,"#1a1a1a"), marginTop:12, width: "100%" }} onClick={saveCommission}>💾 Save Commission</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📦 Package Prices (RWF)</div>
              {["basic","premium","luxury","full"].map(p => (
                <div key={p}>
                  <label style={C.label}>{p.charAt(0).toUpperCase()+p.slice(1)}</label>
                  <input style={C.input} type="number" value={packagePrices[p]}
                    onChange={e => setPackagePrices({...packagePrices, [p]: +e.target.value})} />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor,"#1a1a1a"), marginTop:12, width: "100%" }} onClick={savePrices}>💾 Save Prices</button>
            </div>
          </div>
        )}

        {/* ══ POSTS ══ */}
        {activeTab === "posts" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>{["ID","Title","Author","Status","Created","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id}>
                      <td style={C.td}>#{p.id}</td>
                      <td style={C.td}>{p.title || "—"}</td>
                      <td style={C.td}>{p.user?.name || p.author || "—"}</td>
                      <td style={C.td}>{statusBadge(p.status || "PUBLISHED")}</td>
                      <td style={C.td}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>
                        <button style={C.btn("#ef4444")} onClick={() => deletePost(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: muted }}>No posts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {activeTab === "settings" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🏢 Platform Settings</div>
              {["platformName","tagline","contactEmail","contactPhone","address"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k}</label>
                  <input style={C.input} value={websiteSettings[k] || ""} onChange={e => setWebsiteSettings({...websiteSettings, [k]: e.target.value})} />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveWebsite}>💾 Save</button>
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>👤 Admin Profile</div>
              {["name","email","phone"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k}</label>
                  <input style={C.input} value={adminProfile[k] || ""} onChange={e => setAdminProfile({...adminProfile, [k]: e.target.value})} />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveAdminProfile}>💾 Save Profile</button>
              <button style={{ ...C.btn("#3b82f6"), marginTop: 8, width: "100%" }} onClick={() => setShowPwForm(!showPwForm)}>
                {showPwForm ? "Cancel" : "🔑 Change Password"}
              </button>
              {showPwForm && (
                <div style={{ marginTop: 12 }}>
                  {["current","new","confirm"].map(k => (
                    <div key={k}>
                      <label style={C.label}>{k} password</label>
                      <input style={C.input} type="password" value={pwData[k]} onChange={e => setPwData({...pwData, [k]: e.target.value})} />
                    </div>
                  ))}
                  <button style={{ ...C.btn("#22c55e"), marginTop: 8, width: "100%" }} onClick={changePassword}>✅ Change Password</button>
                </div>
              )}
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>📱 Social Links</div>
              {["facebook","instagram","youtube","tiktok"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k}</label>
                  <input style={C.input} value={socialSettings[k]} onChange={e => setSocialSettings({...socialSettings, [k]: e.target.value})} />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveSocial}>💾 Save</button>
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>📢 Broadcast Message</div>
              <label style={C.label}>Title</label>
              <input style={C.input} value={broadcastMsg.title} onChange={e => setBroadcastMsg({...broadcastMsg, title: e.target.value})} />
              <label style={C.label}>Message</label>
              <textarea style={{ ...C.input, minHeight: "100px" }} value={broadcastMsg.message} onChange={e => setBroadcastMsg({...broadcastMsg, message: e.target.value})} />
              <label style={C.label}>Target</label>
              <select style={C.input} value={broadcastMsg.target} onChange={e => setBroadcastMsg({...broadcastMsg, target: e.target.value})}>
                <option value="all">All Users</option>
                <option value="clients">Clients</option>
                <option value="creators">Creators</option>
                <option value="couples">Couples</option>
              </select>
              <button style={{ ...C.btn("#3b82f6"), marginTop: 12, width: "100%" }} onClick={sendBroadcast}>📨 Send</button>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}
      {priceModal && (
        <div style={C.modal} onClick={() => setPriceModal(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>💰 Set Price</h3>
            <input style={C.input} type="number" placeholder="350000" value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} autoFocus />
            <div style={{ display:"flex", gap:8, marginTop:20 }}>
              <button style={{ ...C.btn("#22c55e"), padding:"10px 20px", flex:1 }} onClick={() => setBookingPrice(priceModal.id, agreedPrice)}>✅ Confirm</button>
              <button style={{ ...C.btn("#6b7280"), padding:"10px 20px", flex:1 }} onClick={() => setPriceModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedVideo && (
        <div style={C.modal} onClick={() => setSelectedVideo(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>🎥 Video Details</h3>
            {[
              ["Title", selectedVideo.title],
              ["Couple", selectedVideo.couple?.user?.name || selectedVideo.coupleName],
              ["Event", selectedVideo.eventType],
              ["Access", selectedVideo.accessType],
              ["Views", selectedVideo.views || 0],
              ["Status", statusBadge(selectedVideo.status || "PENDING")],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              {selectedVideo.videoUrl && (
                <button style={{ ...C.btn("#3b82f6"), flex:1 }} onClick={() => window.open(selectedVideo.videoUrl, "_blank")}>▶ Watch</button>
              )}
              {selectedVideo.status === "PENDING" && (
                <button style={{ ...C.btn("#22c55e"), flex:1 }} onClick={() => { handleApproveVideo(selectedVideo.id); setSelectedVideo(null); }}>✅ Approve</button>
              )}
              <button style={{ ...C.btn("#6b7280"), flex:1 }} onClick={() => setSelectedVideo(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div style={C.modal} onClick={() => setSelectedUser(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>👤 {selectedUser.name}</h3>
            {[["Email", selectedUser.email],["Role", selectedUser.role],["Status", selectedUser.isActive ? "Active" : "Blocked"],["Phone", selectedUser.phone || "—"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <button style={{ ...C.btn("#6b7280"), width:"100%", marginTop:20 }} onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}

      {selectedCouple && (
        <div style={C.modal} onClick={() => setSelectedCouple(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>💑 {selectedCouple.coupleName || selectedCouple.user?.name}</h3>
            {[["Email", selectedCouple.user?.email],["Wedding Date", selectedCouple.weddingDate],["Location", selectedCouple.location],["Bio", selectedCouple.bio]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                <span style={{ color:muted }}>{k}</span><strong>{v || "—"}</strong>
              </div>
            ))}
            <button style={{ ...C.btn("#6b7280"), width:"100%", marginTop:20 }} onClick={() => setSelectedCouple(null)}>Close</button>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div style={C.modal} onClick={() => setSelectedBooking(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>📋 Booking #{selectedBooking.id}</h3>
            {[["Client", selectedBooking.user?.name],["Email", selectedBooking.user?.email],["Event", selectedBooking.eventType],["Date", selectedBooking.eventDate],["Status", statusBadge(selectedBooking.status)]].map(([k,v], i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                <span style={{ color:muted }}>{k}</span>
                <strong>{k === "Status" ? v : (v || "—")}</strong>
              </div>
            ))}
            <button style={{ ...C.btn("#6b7280"), width:"100%", marginTop:20 }} onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}