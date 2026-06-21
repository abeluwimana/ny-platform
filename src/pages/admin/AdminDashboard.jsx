// src/pages/admin/AdminDashboard.jsx
import { useCallback, useEffect, useState } from "react";
import { FaBars, FaBell, FaCheck, FaSync, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
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
  { id: "galleries",     icon: "🖼️", label: "Galleries" },
  { id: "couples",       icon: "💑", label: "Couples" },
  { id: "support",       icon: "❤️", label: "Support System" },
  { id: "payments",      icon: "💳", label: "Payments" },
  { id: "revenue",       icon: "💰", label: "Revenue" },
  { id: "posts",         icon: "📝", label: "Posts" },
  { id: "comments",      icon: "💬", label: "Comments" },
  { id: "analytics",     icon: "📈", label: "Analytics" },
  { id: "homepage",      icon: "🏠", label: "Home Page" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "reports",       icon: "📄", label: "Reports" },
  { id: "messages",      icon: "📩", label: "Contact Messages" },
  { id: "settings",      icon: "⚙️", label: "Settings" },
  { id: "security",      icon: "🔒", label: "Security" },
  { id: "audit",         icon: "📜", label: "Audit Logs" },
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
  const [gallery, setGallery] = useState([]);
  const [comments, setComments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loginActivity, setLoginActivity] = useState([]);

  // ── MODAL STATE ─────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [selectedVideo,   setSelectedVideo]   = useState(null);
  const [selectedMsg,     setSelectedMsg]     = useState(null);
  const [priceModal,      setPriceModal]      = useState(null);
  const [assignCreatorModal, setAssignCreatorModal] = useState(null);
  const [selectedCouple,  setSelectedCouple]  = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  // ── SETTINGS STATE ──────────────────────────────────────────────
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User", email: "admin@nyentertainment.com",
    phone: "+250 780 145 562", username: "admin_ny",
    bio: "Platform administrator for NY Entertainment Rwanda",
  });
  const [websiteSettings, setWebsiteSettings] = useState({
    platformName: "NY Entertainment Rwanda",
    contactEmail: "nyentertainment@gmail.com",
    contactPhone: "+250 780 145 562",
    whatsappNumber: "+250 780 145 562",
    address: "Kamonyi, Rwanda",
    workingHours: "Mon-Fri: 9am-6pm, Sat: 10am-4pm",
    heroTitle: "NY Entertainment Rwanda",
    heroSubtitle: "Capturing Life's Most Important Moments",
    footerText: "© 2026 NY Entertainment Rwanda. All rights reserved.",
  });
  const [socialSettings, setSocialSettings] = useState({
    facebook: "https://facebook.com/nyentertainment",
    instagram: "https://instagram.com/nyentertainment",
    youtube: "https://youtube.com/nyentertainment",
    tiktok: "https://tiktok.com/@nyentertainment",
    whatsapp: "https://wa.me/250780145562",
  });
  const [packagePrices, setPackagePrices] = useState({
    basic: 250000, premium: 450000, luxury: 650000, full: 850000,
  });
  const [commission, setCommission] = useState({
    couple: 60, platform: 40, creator: 0,
  });
  const [services, setServices] = useState([
    "Wedding Videography","Photography","Drone Coverage","Sound System",
    "Decoration","Cake Services","Catering","MC & Protocol",
    "Live Streaming","Photo Booth","Traditional Dancer","Photo Album",
  ]);
  const [promoCodes, setPromoCodes] = useState([
    { code: "NYLOVE", discount: 10, expiry: "2026-12-31", usageLimit: 100, used: 23 },
    { code: "WEDDING2026", discount: 15, expiry: "2026-12-31", usageLimit: 50, used: 12 },
  ]);
  const [bookingSettings, setBookingSettings] = useState({
    enableBookings: true, autoConfirm: false,
    requireDeposit: true, depositPercentage: 30, maxBookingsPerDay: 10,
  });
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [newService,   setNewService]   = useState("");
  const [newPromo,     setNewPromo]     = useState({ code: "", discount: "", expiry: "", usageLimit: "" });
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", message: "", target: "all" });
  const [showPwForm,   setShowPwForm]   = useState(false);
  const [pwData,       setPwData]       = useState({ current: "", new: "", confirm: "" });
  const [agreedPrice,  setAgreedPrice]  = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");
  const [reportDateRange, setReportDateRange] = useState({ start: "", end: "" });
  const [homepageSettings, setHomepageSettings] = useState({
    heroTitle: "NY Entertainment Rwanda",
    heroSubtitle: "Capturing Life's Most Important Moments",
    featuredVideos: [],
    featuredCouples: [],
    featuredCreators: [],
    statistics: { events: "500+", clients: "200+", views: "100K+", creators: "50+" },
    testimonials: []
  });

  // ── STATS STATE ──────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalBookings: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
    revenue: 0, coupleRevenue: 0, platformRevenue: 0,
    totalUsers: 0, clients: 0, creators: 0, couples: 0,
    totalVideos: 0, pendingVideos: 0, publishedVideos: 0,
    totalPosts: 0, totalGalleries: 0, totalComments: 0,
    unreadMsgs: 0, subscriptions: 0, pendingCreators: 0,
    pendingReports: 0, totalSupporters: 0, totalSupportedCouples: 0,
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
    sidebar:   { 
      width: sidebarOpen ? 260 : (isMobile ? 0 : 70), 
      background: darkMode ? "#0d0d0d" : "#1a1a1a", 
      color: "#fff", 
      transition: "width 0.3s, transform 0.3s",
      flexShrink: 0, 
      overflowX: "hidden", 
      display: "flex", 
      flexDirection: "column",
      position: isMobile ? "fixed" : "relative",
      top: isMobile ? 0 : "auto",
      left: isMobile && mobileSidebarOpen ? 0 : (isMobile ? "-280px" : "auto"),
      height: isMobile ? "100vh" : "auto",
      zIndex: 1000,
      transform: isMobile && mobileSidebarOpen ? "translateX(0)" : (isMobile ? "translateX(-100%)" : "none"),
    },
    sideHead:  { padding: "20px 16px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: 10 },
    sideTitle: { fontSize: 14, fontWeight: 700, color: Ycolor, whiteSpace: "nowrap", overflow: "hidden" },
    sideItem:  { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", transition: "background 0.2s", borderRadius: 0, whiteSpace: "nowrap", fontSize: 13, color: "#ccc" },
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
        // Update stats from dashboard data
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
    try {
      const res = await adminService.getUsers(page, 50, {});
      if (res.success) {
        setUsers(res.users);
        setUsersTotal(res.pagination?.total || 0);
        setUsersPages(res.pagination?.pages || 1);
        setUsersPage(page);
        const pending = res.users?.filter(u => u.role === 'CREATOR' && u.isActive === false) || [];
        setPendingCreators(pending);
        // Update stats
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
    }
  }, []);

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      const status = filter === "all" ? undefined : filter.toUpperCase();
      const res = await adminService.getBookings(page, 50, status);
      if (res.success) {
        setBookings(res.bookings);
        setBookingsTotal(res.pagination?.total || 0);
        setBookingsPages(res.pagination?.pages || 1);
        setBookingsPage(page);
        // Update stats
        const pending = res.bookings?.filter(b => b.status === 'PENDING').length || 0;
        const confirmed = res.bookings?.filter(b => b.status === 'CONFIRMED').length || 0;
        const completed = res.bookings?.filter(b => b.status === 'COMPLETED').length || 0;
        const cancelled = res.bookings?.filter(b => b.status === 'CANCELLED').length || 0;
        setStats(prev => ({
          ...prev,
          totalBookings: res.pagination?.total || 0,
          pending,
          confirmed,
          completed,
          cancelled,
        }));
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
        setVideos(res.videos);
        setVideosTotal(res.pagination?.total || 0);
        setVideosPages(res.pagination?.pages || 1);
        setVideosPage(page);
        const pending = res.videos?.filter(v => v.status === 'PENDING').length || 0;
        const published = res.videos?.filter(v => v.status === 'PUBLISHED' || v.status === 'APPROVED').length || 0;
        setStats(prev => ({
          ...prev,
          totalVideos: res.pagination?.total || 0,
          pendingVideos: pending,
          publishedVideos: published,
        }));
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
        setStats(prev => ({
          ...prev,
          totalPosts: res.posts?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
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
    ]);
    setRefreshing(false);
  }, [fetchDashboard, fetchUsers, fetchBookings, fetchVideos, fetchSupports, fetchPayments, fetchPosts]);

  // ── AUTHENTICATION CHECK ────────────────────────────────────────
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem('admin_data') || '{}');
        if (userData.name) {
          setAdminProfile({
            name: userData.name || "Admin User",
            email: userData.email || "",
            phone: userData.phone || "",
            username: userData.username || "admin",
            bio: userData.bio || "Platform administrator",
          });
        }

        const dm = localStorage.getItem("darkMode") === "true";
        setDarkMode(dm);
        if (dm) document.body.style.background = "#111";

        await loadAllData();

        // Load login activity
        const activities = JSON.parse(localStorage.getItem("login_activity") || "[]");
        setLoginActivity(activities);

        // Load admin notifications
        const stored = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
        setAdminNotifications(stored);
        const unread = stored.filter(n => !n.read).length;
        setAdminUnreadCount(unread);

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

  // ── CHECK SCREEN SIZE ──────────────────────────────────────────
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
        notify(res.message);
        await fetchUsers(usersPage);
        await fetchDashboard();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      notify("Failed to update user status", "error");
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      const res = await adminService.updateUserRole(userId, role);
      if (res.success) {
        notify("User role updated");
        await fetchUsers(usersPage);
        await fetchDashboard();
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      notify("Failed to update user role", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        notify("User deleted");
        await fetchUsers(usersPage);
        await fetchDashboard();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
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
        await fetchDashboard();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
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
      // Update booking with creator
      await handleUpdateBookingStatus(bookingId, 'IN_PROGRESS');
      notify(`Creator ${creatorEmail} assigned!`);
      setAssignCreatorModal(null);
      setSelectedCreator("");
    } catch (error) {
      console.error("Error assigning creator:", error);
      notify("Failed to assign creator", "error");
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      // Use admin service to delete
      await adminService.deleteBooking(id);
      notify("Booking deleted");
      await fetchBookings(bookingsPage);
      await fetchDashboard();
    } catch (error) {
      console.error("Error deleting booking:", error);
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
        await fetchDashboard();
      }
    } catch (error) {
      console.error("Error approving video:", error);
      notify("Failed to approve video", "error");
    }
  };

  const handleRejectVideo = async (videoId) => {
    const reason = prompt("Please provide a reason for rejection:");
    try {
      const res = await adminService.rejectVideo(videoId, reason);
      if (res.success) {
        notify("Video rejected");
        await fetchVideos(videosPage);
        await fetchDashboard();
      }
    } catch (error) {
      console.error("Error rejecting video:", error);
      notify("Failed to reject video", "error");
    }
  };

  const handleFeatureVideo = async (videoId) => {
    try {
      const res = await adminService.featureVideo(videoId);
      if (res.success) {
        notify(res.message);
        await fetchVideos(videosPage);
      }
    } catch (error) {
      console.error("Error featuring video:", error);
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
      console.error("Error deleting video:", error);
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
        await fetchDashboard();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
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

  const addService = () => {
    if (!newService.trim()) return;
    const updated = [...services, newService.trim()];
    setServices(updated);
    localStorage.setItem("services_list", JSON.stringify(updated));
    setNewService("");
    notify("Service added!");
  };

  const deleteService = (i) => {
    const updated = services.filter((_, idx) => idx !== i);
    setServices(updated);
    localStorage.setItem("services_list", JSON.stringify(updated));
    notify("Service removed", "error");
  };

  const addPromo = () => {
    if (!newPromo.code || !newPromo.discount) return;
    const updated = [...promoCodes, { ...newPromo, used: 0 }];
    setPromoCodes(updated);
    localStorage.setItem("promo_codes", JSON.stringify(updated));
    setNewPromo({ code: "", discount: "", expiry: "", usageLimit: "" });
    notify("Promo code added!");
  };

  const deletePromo = (i) => {
    const updated = promoCodes.filter((_, idx) => idx !== i);
    setPromoCodes(updated);
    localStorage.setItem("promo_codes", JSON.stringify(updated));
    notify("Promo code deleted", "error");
  };

  const sendBroadcast = () => {
    if (!broadcastMsg.title || !broadcastMsg.message) { notify("Fill all fields", "error"); return; }
    
    let targetUsers = [];
    if (broadcastMsg.target === "all") targetUsers = users;
    else if (broadcastMsg.target === "clients") targetUsers = users.filter(u => u.role === "CLIENT");
    else if (broadcastMsg.target === "creators") targetUsers = users.filter(u => u.role === "CREATOR");
    else if (broadcastMsg.target === "couples") targetUsers = users.filter(u => u.role === "COUPLE");
    
    targetUsers.forEach(user => {
      const notifs = JSON.parse(localStorage.getItem(`${user.role}_notifications`) || "[]");
      notifs.unshift({
        id: Date.now(),
        title: broadcastMsg.title,
        message: broadcastMsg.message,
        type: "broadcast",
        read: false,
        time: new Date().toISOString()
      });
      localStorage.setItem(`${user.role}_notifications`, JSON.stringify(notifs.slice(0, 50)));
    });
    
    notify(`Notification sent to ${broadcastMsg.target}!`);
    setBroadcastMsg({ title: "", message: "", target: "all" });
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
    const data = { bookings, users, couples, messages, videos, posts, promoCodes, websiteSettings, homepageSettings };
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
      headers = ["ID","Name","Email","Phone","Event","Package","Date","Status","Payment","Price"];
      data = bookings.map(b => [b.id, b.user?.name || b.clientName, b.user?.email, b.user?.phone, b.eventType, b.package, b.eventDate, b.status, b.paymentStatus, b.totalAmount || "Negotiable"]);
    } else if (type === "revenue") {
      headers = ["Date","Type","Amount","Couple Share (60%)","Platform Share (40%)","Status"];
      data = supports.map(s => [new Date(s.createdAt).toLocaleDateString(), "Support", s.amount, s.coupleAmount, s.platformAmount, s.status]);
    } else {
      headers = ["ID","Name","Email","Role","Joined"];
      data = users.map(u => [u.id, u.name, u.email, u.role, u.createdAt]);
    }
    const rows = [headers, ...data];
    const csv = rows.map(r => r.join(",")).join("\n");
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
    loadAllData();
    notify("Refreshing data...", "info");
  };

  // ── FILTERED DATA ──────────────────────────────────────────────
  const filteredBookings = bookings
    .filter(b => filter === "all" || b.status === filter.toUpperCase())
    .filter(b => !search || 
      (b.user?.name || "").toLowerCase().includes(search.toLowerCase()) || 
      (b.user?.email || "").toLowerCase().includes(search.toLowerCase())
    );

  const allCreators = users.filter(u => u.role === "CREATOR" && u.isActive === true);

  // ── ADMIN NOTIFICATIONS ────────────────────────────────────────
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
    const unread = updated.filter(n => !n.read).length;
    setAdminUnreadCount(unread);
    notify("Notification deleted");
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: txt, fontSize: '18px' }}>Loading admin dashboard...</div>
          <div style={{ color: muted, fontSize: '14px', marginTop: '8px' }}>Verifying your credentials</div>
        </div>
      </div>
    );
  }

  return (
    <div style={C.page}>
      {/* Mobile Menu Button */}
      <button onClick={() => setMobileSidebarOpen(true)} style={C.mobileMenuBtn}>
        <FaBars />
      </button>

      {/* Mobile Sidebar Overlay */}
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
          {sidebarOpen && <span style={C.sideTitle}>NY Admin</span>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
          {TABS.map(t => (
            <div key={t.id}
              style={activeTab === t.id ? C.sideActive : C.sideItem}
              onClick={() => { setActiveTab(t.id); if(isMobile) setMobileSidebarOpen(false); }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
              {sidebarOpen && t.id === "bookings" && stats.pending > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pending}</span>}
              {sidebarOpen && t.id === "messages" && stats.unreadMsgs > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.unreadMsgs}</span>}
              {sidebarOpen && t.id === "creators" && stats.pendingCreators > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pendingCreators}</span>}
              {sidebarOpen && t.id === "notifications" && adminUnreadCount > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{adminUnreadCount}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a2a" }}>
          <div style={{ ...C.sideItem, color: "#ef4444", padding: "8px 0" }}
            onClick={() => { 
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_data');
              navigate('/admin/login');
            }}>
            <span>🚪</span>{sidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={C.main}>
        {/* TOP BAR */}
        <div style={C.topBar}>
          <div>
            <h1 style={C.pageTitle}>
              {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={toggleMaintenance}
              style={C.btn(maintenance ? "#ef4444" : "#22c55e")}>
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

        {/* ══ DASHBOARD OVERVIEW ══ */}
        {activeTab === "overview" && (
          <>
            <div style={C.statsGrid}>
              {[
                { icon:"👥", val: stats.totalUsers, label:"Total Users", bg: cardBg },
                { icon:"👤", val: stats.clients, label:"Clients", bg: cardBg },
                { icon:"💑", val: stats.couples, label:"Couples", bg: cardBg },
                { icon:"🎬", val: stats.creators, label:"Creators", bg: cardBg },
                { icon:"📋", val: stats.totalBookings, label:"Total Bookings", bg: cardBg },
                { icon:"🎥", val: stats.totalVideos, label:"Total Videos", bg: cardBg },
                { icon:"🖼️", val: stats.totalGalleries, label:"Galleries", bg: cardBg },
                { icon:"📝", val: stats.totalPosts, label:"Posts", bg: cardBg },
                { icon:"💰", val: stats.revenue.toLocaleString()+" RWF", label:"Total Revenue", bg: cardBg },
                { icon:"⏳", val: stats.pendingCreators+stats.pendingVideos+stats.pending, label:"Pending Approvals", bg: "#fef9c3" },
              ].map((s,i) => (
                <div key={i} style={{ ...C.statCard, background: s.bg }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={C.statVal}>{s.val}</div>
                  <div style={C.statLbl}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ADMIN NOTIFICATION CENTER */}
            <div style={C.settingCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaBell style={{ color: Ycolor }} />
                  <span style={{ fontWeight: 700 }}>Admin Notifications</span>
                  {adminUnreadCount > 0 && (
                    <span style={{ background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: 11 }}>
                      {adminUnreadCount} new
                    </span>
                  )}
                </div>
                {adminNotifications.length > 0 && (
                  <button onClick={markAllAdminNotificationsRead} style={{ ...C.btn("#6b7280"), fontSize: 11, padding: "4px 12px" }}>
                    <FaCheck /> Mark all as read
                  </button>
                )}
              </div>
              
              {adminNotifications.length === 0 ? (
                <p style={{ textAlign: "center", color: muted, padding: "20px" }}>No admin notifications yet</p>
              ) : (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {adminNotifications.slice(0, 10).map(notif => (
                    <div key={notif.id} style={{ 
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start", 
                      padding: "12px", borderBottom: `1px solid ${border}`,
                      background: notif.read ? "transparent" : `${Ycolor}10`,
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? "8px" : "0"
                    }}>
                      <div style={{ flex: 1, cursor: "pointer" }} onClick={() => markAdminNotificationRead(notif.id)}>
                        <div style={{ fontWeight: 700 }}>{notif.title}</div>
                        <div style={{ fontSize: 12, color: muted }}>{notif.message}</div>
                        <div style={{ fontSize: 10, color: muted, marginTop: 4 }}>{new Date(notif.time).toLocaleString()}</div>
                      </div>
                      <button onClick={() => deleteAdminNotification(notif.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}>
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={C.settingsGrid}>
              <div style={C.settingCard}>
                <div style={C.secTitle}>📋 Recent Bookings</div>
                {dashboardData.recent?.bookings?.slice(0,5).map(b => (
                  <div key={b.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span>{b.user?.name || b.clientName || "—"}</span>
                    {statusBadge(b.status)}
                  </div>
                ))}
                {(!dashboardData.recent?.bookings || dashboardData.recent.bookings.length === 0) && 
                  <p style={{ color: muted, fontSize: 13 }}>No bookings yet</p>}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>📩 Recent Messages</div>
                {messages.slice(0,5).map(m => (
                  <div key={m.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span>{m.name||"—"}</span>
                    {statusBadge(m.status||"UNREAD")}
                  </div>
                ))}
                {messages.length === 0 && <p style={{ color: muted, fontSize: 13 }}>No messages yet</p>}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>💰 Revenue Breakdown (60/40 Split)</div>
                {[
                  ["Total Revenue", stats.revenue.toLocaleString()+" RWF"],
                  ["💑 Couple Share (60%)", stats.coupleRevenue.toLocaleString()+" RWF"],
                  ["🏢 Platform Share (40%)", stats.platformRevenue.toLocaleString()+" RWF"],
                  ["Pending Bookings", stats.pending],
                  ["Conversion Rate", `${Math.round((stats.confirmed/Math.max(stats.totalBookings,1))*100)}%`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>⚡ Quick Actions</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <button style={{ ...C.btn(Ycolor,"#1a1a1a"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("bookings")}>📋 Manage Bookings ({stats.pending} pending)</button>
                  <button style={{ ...C.btn("#3b82f6"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("creators")}>🎬 Approve Creators ({stats.pendingCreators} pending)</button>
                  <button style={{ ...C.btn("#8b5cf6"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("videos")}>🎥 Review Videos ({stats.pendingVideos} pending)</button>
                  <button style={{ ...C.btn("#22c55e"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("messages")}>📩 Read Messages ({stats.unreadMsgs} unread)</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ SUPPORT SYSTEM TAB ══ */}
        {activeTab === "support" && (
          <>
            <div style={C.settingsGrid}>
              <div style={C.settingCard}>
                <div style={C.secTitle}>❤️ Support Statistics (60/40 Split)</div>
                {[
                  ["Total Supporters", stats.totalSupporters],
                  ["Supported Couples", stats.totalSupportedCouples],
                  ["Total Support Amount", stats.revenue.toLocaleString()+" RWF"],
                  ["💑 Couple Share (60%)", stats.coupleRevenue.toLocaleString()+" RWF"],
                  ["🏢 Platform Share (40%)", stats.platformRevenue.toLocaleString()+" RWF"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                    <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "8px", background: `${Ycolor}15`, borderRadius: 8 }}>
                  <p style={{ fontSize: 12, margin: 0 }}>💡 <strong>Revenue Split:</strong> When a client supports a couple, <strong style={{ color: "#22c55e" }}>60% goes to the couple</strong> and <strong style={{ color: Ycolor }}>40% goes to the platform</strong>.</p>
                </div>
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>🏆 Top Supporters</div>
                {supports.reduce((acc, s) => {
                  const existing = acc.find(a => a.userEmail === s.user?.email);
                  if (existing) existing.amount += s.amount;
                  else acc.push({ userEmail: s.user?.email, userName: s.user?.name, amount: s.amount });
                  return acc;
                }, []).sort((a,b) => b.amount - a.amount).slice(0,5).map((s, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
                    <span>{i+1}. {s.userName || s.userEmail}</span><strong>{s.amount.toLocaleString()} RWF</strong>
                  </div>
                ))}
                {supports.length === 0 && <p style={{ color: muted }}>No supporters yet</p>}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={C.card}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 600 : "100%" }}>
                  <thead style={C.tHead}>
                    <tr>{["Date","Supporter","Couple","Amount","💑 (60%)","🏢 (40%)"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {supports.map(s => (
                      <tr key={s.id}>
                        <td style={C.td}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td style={C.td}>{s.user?.name || s.user?.email || "—"}</td>
                        <td style={C.td}>{s.couple?.user?.name || s.coupleId || "—"}</td>
                        <td style={C.td}><strong>{s.amount.toLocaleString()} RWF</strong></td>
                        <td style={C.td} style={{ color: "#22c55e", fontWeight: 600 }}>{s.coupleAmount.toLocaleString()} RWF</td>
                        <td style={C.td} style={{ color: Ycolor, fontWeight: 600 }}>{s.platformAmount.toLocaleString()} RWF</td>
                      </tr>
                    ))}
                    {supports.length === 0 && <tr><td colSpan={6} style={{ textAlign:"center", padding:40, color:muted }}>No support records yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ REVENUE TAB ══ */}
        {activeTab === "revenue" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>💰 Revenue Summary (60/40 Split)</div>
              {[
                ["Total Revenue", stats.revenue.toLocaleString()+" RWF"],
                ["💑 Couple Revenue (60%)", stats.coupleRevenue.toLocaleString()+" RWF"],
                ["🏢 Platform Revenue (40%)", stats.platformRevenue.toLocaleString()+" RWF"],
                ["Confirmed Bookings", stats.confirmed],
                ["Avg per Booking", stats.confirmed ? Math.round(stats.revenue/stats.confirmed).toLocaleString()+" RWF" : "—"],
                ["Subscription Revenue", (subscriptions.length * 5000).toLocaleString()+" RWF"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${border}`, fontSize:14 }}>
                  <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "8px", background: `${Ycolor}15`, borderRadius: 8 }}>
                <p style={{ fontSize: 12, margin: 0 }}>💡 When a client supports a couple, <strong style={{ color: "#22c55e" }}>60% goes to the couple</strong> and <strong style={{ color: Ycolor }}>40% goes to NY Entertainment</strong>.</p>
              </div>
              <button style={{ ...C.btn(Ycolor,"#1a1a1a"), marginTop:12, width: isMobile ? "100%" : "auto" }} onClick={() => exportCSV("revenue")}>📥 Export Revenue Report</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>💸 Commission Split</div>
              <div style={{ marginBottom:8 }}>
                <label style={C.label}>Couple % (currently {commission.couple}%)</label>
                <input style={C.input} type="number" value={commission.couple} min={0} max={100}
                  onChange={e => setCommission({...commission, couple: +e.target.value})} />
                <label style={C.label}>NY Platform % (currently {commission.platform}%)</label>
                <input style={C.input} type="number" value={commission.platform} min={0} max={100}
                  onChange={e => setCommission({...commission, platform: +e.target.value})} />
                <label style={C.label}>Creator % (currently {commission.creator}%)</label>
                <input style={C.input} type="number" value={commission.creator} min={0} max={100}
                  onChange={e => setCommission({...commission, creator: +e.target.value})} />
                <p style={{ fontSize:12, color: (commission.couple+commission.platform+commission.creator)===100?"#22c55e":"#ef4444", marginTop:8 }}>
                  Total: {commission.couple+commission.platform+commission.creator}% {(commission.couple+commission.platform+commission.creator)===100?"✅":"(must be 100%)"}
                </p>
                <button style={{ ...C.btn(Ycolor,"#1a1a1a"), marginTop:12, padding:"10px 20px", width: isMobile ? "100%" : "auto" }} onClick={saveCommission}>💾 Save Commission</button>
              </div>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📦 Package Prices (RWF)</div>
              {["basic","premium","luxury","full"].map(p => (
                <div key={p}>
                  <label style={C.label}>{p.charAt(0).toUpperCase()+p.slice(1)} Package</label>
                  <input style={C.input} type="number" value={packagePrices[p]}
                    onChange={e => setPackagePrices({...packagePrices, [p]: +e.target.value})} />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor,"#1a1a1a"), marginTop:12, width: isMobile ? "100%" : "auto" }} onClick={savePrices}>💾 Save Prices</button>
            </div>
          </div>
        )}

        {/* ══ USER MANAGEMENT TAB ══ */}
        {activeTab === "users" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","Name","Email","Role","Status","Joined","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={C.td}>#{u.id}</td>
                      <td style={C.td}>{u.name || "—"}</td>
                      <td style={C.td}>{u.email}</td>
                      <td style={C.td}>
                        <select 
                          value={u.role || "CLIENT"} 
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)} 
                          style={{ ...C.input, padding: "4px 8px", fontSize: 12, width: "auto" }}
                        >
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
                  <span style={{ fontSize: 13, color: muted }}>Total: {usersTotal} users</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button disabled={usersPage <= 1} onClick={() => fetchUsers(usersPage - 1)} style={C.btn("#6b7280")}>Previous</button>
                    <span style={{ fontSize: 13, color: muted, padding: "6px 12px" }}>Page {usersPage} of {usersPages}</span>
                    <button disabled={usersPage >= usersPages} onClick={() => fetchUsers(usersPage + 1)} style={C.btn("#6b7280")}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ BOOKINGS TAB ══ */}
        {activeTab === "bookings" && (
          <>
            <div style={C.filterRow}>
              {["all","pending","confirmed","in_progress","completed","cancelled"].map(s => (
                <button key={s} style={C.filterBtn(filter === s)} onClick={() => setFilter(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1).replace("_", " ")}
                </button>
              ))}
              <input style={C.searchInput} type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              <button style={C.btn("#3b82f6")} onClick={() => exportCSV("bookings")}>📥 Export CSV</button>
            </div>
            <div style={C.card}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                  <thead style={C.tHead}>
                    <tr>
                      {["ID","Client","Email","Event","Date","Package","Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                    </tr>
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
                                <button style={C.btn("#22c55e")} onClick={() => handleUpdateBookingStatus(b.id, "CONFIRMED")}>✅ Confirm</button>
                                <button style={C.btn("#ef4444")} onClick={() => handleUpdateBookingStatus(b.id, "CANCELLED")}>❌ Cancel</button>
                              </>
                            )}
                            {b.status === "CONFIRMED" && (
                              <button style={C.btn("#f59e0b")} onClick={() => setPriceModal(b)}>💰 Set Price</button>
                            )}
                            {b.status === "CONFIRMED" && (
                              <button style={C.btn("#8b5cf6")} onClick={() => setAssignCreatorModal(b)}>👤 Assign</button>
                            )}
                            {b.status === "IN_PROGRESS" && (
                              <button style={C.btn("#22c55e")} onClick={() => handleUpdateBookingStatus(b.id, "COMPLETED")}>✅ Complete</button>
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
                {bookingsTotal > 50 && (
                  <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: muted }}>Total: {bookingsTotal} bookings</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button disabled={bookingsPage <= 1} onClick={() => fetchBookings(bookingsPage - 1)} style={C.btn("#6b7280")}>Previous</button>
                      <span style={{ fontSize: 13, color: muted, padding: "6px 12px" }}>Page {bookingsPage} of {bookingsPages}</span>
                      <button disabled={bookingsPage >= bookingsPages} onClick={() => fetchBookings(bookingsPage + 1)} style={C.btn("#6b7280")}>Next</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══ CREATORS TAB ══ */}
        {activeTab === "creators" && (
          <div style={C.card}>
            <div style={C.secTitle}>🎬 Pending Creator Approvals ({pendingCreators.length})</div>
            {pendingCreators.length === 0 ? (
              <p style={{ color: muted, padding: 20, textAlign: "center" }}>No pending creator approvals</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead style={C.tHead}>
                    <tr><th style={C.th}>Name</th><th style={C.th}>Email</th><th style={C.th}>Registered</th><th style={C.th}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {pendingCreators.map(c => (
                      <tr key={c.id}>
                        <td style={C.td}>{c.name || "—"}</td>
                        <td style={C.td}>{c.email}</td>
                        <td style={C.td}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                        <td style={C.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={C.btn("#22c55e")} onClick={() => handleUpdateUserRole(c.id, "CREATOR")}>✓ Approve</button>
                            <button style={C.btn("#ef4444")} onClick={() => handleDeleteUser(c.id)}>✗ Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ VIDEOS TAB ══ */}
        {activeTab === "videos" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","Title","Creator","Couple","Status","Views","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {videos.map(v => (
                    <tr key={v.id}>
                      <td style={C.td}>#{v.id}</td>
                      <td style={C.td}>{v.title || "—"}</td>
                      <td style={C.td}>{v.user?.name || v.creatorName || "—"}</td>
                      <td style={C.td}>{v.couple?.user?.name || v.coupleName || "—"}</td>
                      <td style={C.td}>{statusBadge(v.status)}</td>
                      <td style={C.td}>{v.views || 0}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedVideo(v)}>View</button>
                          {v.status === "PENDING" && (
                            <>
                              <button style={C.btn("#22c55e")} onClick={() => handleApproveVideo(v.id)}>Approve</button>
                              <button style={C.btn("#ef4444")} onClick={() => handleRejectVideo(v.id)}>Reject</button>
                            </>
                          )}
                          <button style={C.btn(v.isPremium ? "#6b7280" : "#f59e0b")} onClick={() => handleFeatureVideo(v.id)}>
                            {v.isPremium ? "Unfeature" : "Feature"}
                          </button>
                          <button style={C.btn("#ef4444")} onClick={() => deleteVideo(v.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {videos.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: muted }}>No videos found</td></tr>
                  )}
                </tbody>
              </table>
              {videosTotal > 50 && (
                <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: muted }}>Total: {videosTotal} videos</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button disabled={videosPage <= 1} onClick={() => fetchVideos(videosPage - 1)} style={C.btn("#6b7280")}>Previous</button>
                    <span style={{ fontSize: 13, color: muted, padding: "6px 12px" }}>Page {videosPage} of {videosPages}</span>
                    <button disabled={videosPage >= videosPages} onClick={() => fetchVideos(videosPage + 1)} style={C.btn("#6b7280")}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ PAYMENTS TAB ══ */}
        {activeTab === "payments" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","User","Amount","Type","Status","Date"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? payments.map(p => (
                    <tr key={p.id}>
                      <td style={C.td}>#{p.id}</td>
                      <td style={C.td}>{p.user?.name || "—"}</td>
                      <td style={C.td}>{p.amount?.toLocaleString() || 0} RWF</td>
                      <td style={C.td}>{p.method || "Payment"}</td>
                      <td style={C.td}>{statusBadge(p.status)}</td>
                      <td style={C.td}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: muted }}>No payments recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ POSTS TAB ══ */}
        {activeTab === "posts" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","Title","Author","Status","Created","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id}>
                      <td style={C.td}>#{p.id}</td>
                      <td style={C.td}>{p.title || "—"}</td>
                      <td style={C.td}>{p.user?.name || p.author || "—"}</td>
                      <td style={C.td}>{statusBadge(p.status || "DRAFT")}</td>
                      <td style={C.td}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={C.btn("#ef4444")} onClick={() => deletePost(p.id)}>Delete</button>
                        </div>
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

        {/* ══ COUPLES TAB ══ */}
        {activeTab === "couples" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","Couple","Email","Wedding Date","Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {couples.map(c => (
                    <tr key={c.id}>
                      <td style={C.td}>#{c.id}</td>
                      <td style={C.td}>{c.user?.name || c.name || "—"}</td>
                      <td style={C.td}>{c.user?.email || c.email || "—"}</td>
                      <td style={C.td}>{c.weddingDate ? new Date(c.weddingDate).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>{statusBadge(c.isVerified ? "APPROVED" : "PENDING")}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {!c.isVerified && (
                            <button style={C.btn("#22c55e")} onClick={() => handleUpdateUserRole(c.userId, "COUPLE")}>Approve</button>
                          )}
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedCouple(c)}>View</button>
                        </div>
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

        {/* ══ GALLERIES TAB ══ */}
        {activeTab === "galleries" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","Title","Couple","Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {gallery.map(g => (
                    <tr key={g.id}>
                      <td style={C.td}>#{g.id}</td>
                      <td style={C.td}>{g.title || "—"}</td>
                      <td style={C.td}>{g.coupleName || "—"}</td>
                      <td style={C.td}>{statusBadge(g.status || "PENDING")}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {g.status !== "APPROVED" && (
                            <button style={C.btn("#22c55e")}>Approve</button>
                          )}
                          <button style={C.btn("#ef4444")}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {gallery.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: muted }}>No galleries found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ COMMENTS TAB ══ */}
        {activeTab === "comments" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","User","Comment","Post","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {comments.map(c => (
                    <tr key={c.id}>
                      <td style={C.td}>#{c.id}</td>
                      <td style={C.td}>{c.user?.name || c.userName || "—"}</td>
                      <td style={C.td} style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.content || c.text || "—"}
                      </td>
                      <td style={C.td}>{c.post?.title || c.postTitle || "—"}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={C.btn("#ef4444")}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {comments.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: muted }}>No comments found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ MESSAGES TAB ══ */}
        {activeTab === "messages" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead style={C.tHead}>
                  <tr>
                    {["ID","From","Email","Subject","Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id}>
                      <td style={C.td}>#{m.id}</td>
                      <td style={C.td}>{m.name || "—"}</td>
                      <td style={C.td}>{m.email || "—"}</td>
                      <td style={C.td}>{m.subject || "—"}</td>
                      <td style={C.td}>{statusBadge(m.status || "UNREAD")}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedMsg(m)}>View</button>
                          {m.status !== "READ" && (
                            <button style={C.btn("#22c55e")}>Mark Read</button>
                          )}
                          <button style={C.btn("#ef4444")}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: muted }}>No messages found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {activeTab === "settings" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🏢 Website Settings</div>
              <label style={C.label}>Platform Name</label>
              <input style={C.input} value={websiteSettings.platformName} onChange={e => setWebsiteSettings({...websiteSettings, platformName: e.target.value})} />
              <label style={C.label}>Contact Email</label>
              <input style={C.input} value={websiteSettings.contactEmail} onChange={e => setWebsiteSettings({...websiteSettings, contactEmail: e.target.value})} />
              <label style={C.label}>Contact Phone</label>
              <input style={C.input} value={websiteSettings.contactPhone} onChange={e => setWebsiteSettings({...websiteSettings, contactPhone: e.target.value})} />
              <label style={C.label}>Address</label>
              <input style={C.input} value={websiteSettings.address} onChange={e => setWebsiteSettings({...websiteSettings, address: e.target.value})} />
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveWebsite}>💾 Save Settings</button>
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>👤 Admin Profile</div>
              <label style={C.label}>Name</label>
              <input style={C.input} value={adminProfile.name} onChange={e => setAdminProfile({...adminProfile, name: e.target.value})} />
              <label style={C.label}>Email</label>
              <input style={C.input} value={adminProfile.email} onChange={e => setAdminProfile({...adminProfile, email: e.target.value})} />
              <label style={C.label}>Phone</label>
              <input style={C.input} value={adminProfile.phone} onChange={e => setAdminProfile({...adminProfile, phone: e.target.value})} />
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveAdminProfile}>💾 Save Profile</button>
              <button style={{ ...C.btn("#3b82f6"), marginTop: 8, width: "100%" }} onClick={() => setShowPwForm(!showPwForm)}>
                {showPwForm ? "Cancel" : "🔑 Change Password"}
              </button>
              {showPwForm && (
                <div style={{ marginTop: 12 }}>
                  <label style={C.label}>Current Password</label>
                  <input style={C.input} type="password" value={pwData.current} onChange={e => setPwData({...pwData, current: e.target.value})} />
                  <label style={C.label}>New Password</label>
                  <input style={C.input} type="password" value={pwData.new} onChange={e => setPwData({...pwData, new: e.target.value})} />
                  <label style={C.label}>Confirm Password</label>
                  <input style={C.input} type="password" value={pwData.confirm} onChange={e => setPwData({...pwData, confirm: e.target.value})} />
                  <button style={{ ...C.btn("#22c55e"), marginTop: 8, width: "100%" }} onClick={changePassword}>✅ Change Password</button>
                </div>
              )}
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>📱 Social Links</div>
              <label style={C.label}>Facebook</label>
              <input style={C.input} value={socialSettings.facebook} onChange={e => setSocialSettings({...socialSettings, facebook: e.target.value})} />
              <label style={C.label}>Instagram</label>
              <input style={C.input} value={socialSettings.instagram} onChange={e => setSocialSettings({...socialSettings, instagram: e.target.value})} />
              <label style={C.label}>YouTube</label>
              <input style={C.input} value={socialSettings.youtube} onChange={e => setSocialSettings({...socialSettings, youtube: e.target.value})} />
              <label style={C.label}>TikTok</label>
              <input style={C.input} value={socialSettings.tiktok} onChange={e => setSocialSettings({...socialSettings, tiktok: e.target.value})} />
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveSocial}>💾 Save Social Links</button>
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>📢 Broadcast Message</div>
              <label style={C.label}>Title</label>
              <input style={C.input} value={broadcastMsg.title} onChange={e => setBroadcastMsg({...broadcastMsg, title: e.target.value})} />
              <label style={C.label}>Message</label>
              <textarea style={{ ...C.input, minHeight: "100px" }} value={broadcastMsg.message} onChange={e => setBroadcastMsg({...broadcastMsg, message: e.target.value})} />
              <label style={C.label}>Target Audience</label>
              <select style={C.input} value={broadcastMsg.target} onChange={e => setBroadcastMsg({...broadcastMsg, target: e.target.value})}>
                <option value="all">All Users</option>
                <option value="clients">Clients Only</option>
                <option value="creators">Creators Only</option>
                <option value="couples">Couples Only</option>
              </select>
              <button style={{ ...C.btn("#3b82f6"), marginTop: 12, width: "100%" }} onClick={sendBroadcast}>📨 Send Broadcast</button>
            </div>
          </div>
        )}

        {/* ══ SECURITY TAB ══ */}
        {activeTab === "security" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🔐 Login Activity</div>
              {loginActivity.length === 0 ? (
                <p style={{ color: muted, textAlign: "center", padding: "20px" }}>No login activity recorded</p>
              ) : (
                loginActivity.slice(0, 20).map((activity, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    <span style={{ color: muted }}>{activity.ip || "Unknown IP"}</span>
                  </div>
                ))
              )}
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📜 Audit Logs</div>
              {auditLogs.length === 0 ? (
                <p style={{ color: muted, textAlign: "center", padding: "20px" }}>No audit logs</p>
              ) : (
                auditLogs.slice(0, 20).map((log, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 12 }}>
                    <span>{log.action}</span>
                    <span style={{ color: muted }}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}

      {/* Set Price Modal */}
      {priceModal && (
        <div style={C.modal} onClick={() => setPriceModal(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:8, color:txt }}>💰 Set Agreed Price</h3>
            <p style={{ fontSize:13, color:muted, marginBottom:16 }}>Client: <strong>{priceModal.user?.name || priceModal.clientName}</strong></p>
            <label style={C.label}>Agreed Price (RWF)</label>
            <input style={C.input} type="number" placeholder="e.g. 350000" value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} autoFocus />
            <p style={{ fontSize:12, color:muted, marginTop:6 }}>This price will be shown to the client and used for payment via MTN MoMo / Airtel Money.</p>
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              <button style={{ ...C.btn("#22c55e"), padding:"10px 20px", flex:1 }} onClick={() => setBookingPrice(priceModal.id, agreedPrice)}>✅ Confirm Price</button>
              <button style={{ ...C.btn("#6b7280"), padding:"10px 20px", flex:1 }} onClick={() => setPriceModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Creator Modal */}
      {assignCreatorModal && (
        <div style={C.modal} onClick={() => setAssignCreatorModal(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:8, color:txt }}>👤 Assign Creator</h3>
            <p style={{ fontSize:13, color:muted, marginBottom:16 }}>Booking: <strong>{assignCreatorModal.user?.name || assignCreatorModal.clientName}</strong></p>
            <label style={C.label}>Select Creator</label>
            <select style={C.input} value={selectedCreator} onChange={e => setSelectedCreator(e.target.value)}>
              <option value="">-- Select a creator --</option>
              {allCreators.map(c => <option key={c.id} value={c.email}>{c.name} ({c.email})</option>)}
            </select>
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              <button style={{ ...C.btn("#22c55e"), padding:"10px 20px", flex:1 }} onClick={() => assignCreatorToBooking(assignCreatorModal.id, selectedCreator)}>✅ Assign</button>
              <button style={{ ...C.btn("#6b7280"), padding:"10px 20px", flex:1 }} onClick={() => setAssignCreatorModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div style={C.modal} onClick={() => setSelectedBooking(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>📋 Booking Details</h3>
            {[
              ["Booking ID", `#${String(selectedBooking.id).slice(-6).toUpperCase()}`],
              ["Client", selectedBooking.user?.name || selectedBooking.clientName || "—"],
              ["Email", selectedBooking.user?.email || "—"],
              ["Phone", selectedBooking.user?.phone || "—"],
              ["Event Type", selectedBooking.eventType?.toLowerCase() || "wedding"],
              ["Package", selectedBooking.package || "—"],
              ["Date", selectedBooking.eventDate ? new Date(selectedBooking.eventDate).toLocaleDateString() : "—"],
              ["Status", statusBadge(selectedBooking.status)],
              ["Payment", selectedBooking.paymentStatus || "UNPAID"],
              ["Agreed Price", selectedBooking.totalAmount ? Number(selectedBooking.totalAmount).toLocaleString() + " RWF" : "Not set"],
              ["Assigned Creator", selectedBooking.creator?.name || "Not assigned"],
              ["Notes", selectedBooking.notes || "—"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13, flexWrap:"wrap", gap:"8px" }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              {selectedBooking.status === "PENDING" && (
                <>
                  <button style={C.btn("#22c55e")} onClick={() => { handleUpdateBookingStatus(selectedBooking.id, "CONFIRMED"); setSelectedBooking(null); }}>✅ Confirm</button>
                  <button style={C.btn("#ef4444")} onClick={() => { handleUpdateBookingStatus(selectedBooking.id, "CANCELLED"); setSelectedBooking(null); }}>❌ Cancel</button>
                </>
              )}
              {selectedBooking.status === "CONFIRMED" && (
                <>
                  <button style={C.btn("#f59e0b")} onClick={() => { setPriceModal(selectedBooking); setSelectedBooking(null); }}>💰 Set Price</button>
                  <button style={C.btn("#8b5cf6")} onClick={() => { setAssignCreatorModal(selectedBooking); setSelectedBooking(null); }}>👤 Assign</button>
                </>
              )}
              <button style={C.btn("#6b7280")} onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={C.modal} onClick={() => setSelectedUser(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>👤 User Details</h3>
            {[
              ["Name", selectedUser.name || "—"],
              ["Email", selectedUser.email || "—"],
              ["Role", selectedUser.role || "—"],
              ["Status", selectedUser.isActive ? "Active" : "Blocked"],
              ["Phone", selectedUser.phone || "—"],
              ["Joined", selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "—"]
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13, flexWrap:"wrap", gap:"8px" }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20 }}>
              <button style={{ ...C.btn("#6b7280"), flex:1 }} onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMsg && (
        <div style={C.modal} onClick={() => setSelectedMsg(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>📩 Message</h3>
            <p><strong>From:</strong> {selectedMsg.name || "—"}</p>
            <p><strong>Email:</strong> {selectedMsg.email || "—"}</p>
            <p><strong>Subject:</strong> {selectedMsg.subject || "—"}</p>
            <div style={{ background:darkMode?"#2a2a2a":"#f5f5f5", borderRadius:10, padding:"14px 16px", marginTop:14, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
              {selectedMsg.message || "No message content"}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              <a href={`mailto:${selectedMsg.email}`} style={{ textDecoration:"none", flex:1 }}>
                <button style={{ ...C.btn("#3b82f6"), padding:"8px 16px", width: "100%" }}>📧 Reply</button>
              </a>
              <button style={{ ...C.btn("#6b7280"), padding:"8px 16px", flex:1 }} onClick={() => setSelectedMsg(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div style={C.modal} onClick={() => setSelectedVideo(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>🎥 Video Details</h3>
            {[
              ["Title", selectedVideo.title || "—"],
              ["Couple", selectedVideo.couple?.user?.name || selectedVideo.coupleName || "—"],
              ["Event", selectedVideo.eventType || "—"],
              ["Creator", selectedVideo.user?.name || selectedVideo.creatorName || "—"],
              ["Views", selectedVideo.views || 0],
              ["Likes", selectedVideo.likes || 0],
              ["Status", statusBadge(selectedVideo.status || "PENDING")]
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13, flexWrap:"wrap", gap:"8px" }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              {selectedVideo.videoUrl && (
                <button style={{ ...C.btn("#3b82f6"), flex:1 }} onClick={() => window.open(selectedVideo.videoUrl, "_blank")}>▶ Watch</button>
              )}
              {selectedVideo.status !== "PUBLISHED" && selectedVideo.status !== "APPROVED" && (
                <button style={{ ...C.btn("#22c55e"), flex:1 }} onClick={() => { handleApproveVideo(selectedVideo.id); setSelectedVideo(null); }}>✅ Approve</button>
              )}
              <button style={{ ...C.btn("#6b7280"), flex:1 }} onClick={() => setSelectedVideo(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Couple Detail Modal */}
      {selectedCouple && (
        <div style={C.modal} onClick={() => setSelectedCouple(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>💑 Couple Details</h3>
            {[
              ["Name", selectedCouple.user?.name || selectedCouple.name || "—"],
              ["Email", selectedCouple.user?.email || selectedCouple.email || "—"],
              ["Phone", selectedCouple.user?.phone || selectedCouple.phone || "—"],
              ["Wedding Date", selectedCouple.weddingDate ? new Date(selectedCouple.weddingDate).toLocaleDateString() : "—"],
              ["Location", selectedCouple.location || "—"],
              ["Status", selectedCouple.isVerified ? "Verified" : "Pending"]
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13, flexWrap:"wrap", gap:"8px" }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20 }}>
              <button style={{ ...C.btn("#6b7280"), flex:1 }} onClick={() => setSelectedCouple(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add spinning animation CSS */}
      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}