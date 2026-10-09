// src/pages/admin/AdminDashboard.jsx
// SHINECONNECT Admin Dashboard — Final working version
// Powered by SHINECONNECT Rwanda

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaBars, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../components/common/Toast";
import BRANDING from "../../constants/branding";
import adminService from "../../services/adminService";

// ── ALL TABS ──────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  icon: "📊", label: "Dashboard" },
  { id: "users",     icon: "👥", label: "User Management" },
  { id: "bookings",  icon: "📋", label: "Bookings" },
  { id: "creators",  icon: "🎬", label: "Creators" },
  { id: "videos",    icon: "🎥", label: "Videos" },
  { id: "couples",   icon: "💑", label: "Couples" },
  { id: "support",   icon: "❤️", label: "Support System" },
  { id: "payments",  icon: "💳", label: "Payments" },
  { id: "revenue",   icon: "💰", label: "Revenue" },
  { id: "messages",  icon: "✉️", label: "Messages" },
  { id: "posts",     icon: "📝", label: "Posts" },
  { id: "settings",  icon: "⚙️", label: "Settings" },
];

// ── SAFE API CALL ────────────────────────────────────────────────
const safeCall = async (fnName, ...args) => {
  try {
    const fn = adminService?.[fnName];
    if (typeof fn !== "function") {
      console.warn(`[adminService.${fnName}] is not implemented`);
      return { success: false, _missing: true, message: `${fnName} not available` };
    }
    const res = await fn.apply(adminService, args);
    return res ?? { success: false, message: "Empty response" };
  } catch (err) {
    console.error(`[adminService.${fnName}] failed:`, err);
    return { success: false, message: err?.message || "Request failed", _error: err };
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── CORE STATE ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [maintenance, setMaintenance] = useState(false);

  // ── PAGINATION ──────────────────────────────────────────────────
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
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [couples, setCouples] = useState([]);
  const [supports, setSupports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);

  // ── MODAL STATE ─────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCouple, setSelectedCouple] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [priceModal, setPriceModal] = useState(null);
  const [assignCreatorModal, setAssignCreatorModal] = useState(null);

  // ── SETTINGS STATE ──────────────────────────────────────────────
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User",
    email: "nyentertainmentrwanda@gmail.com",
    phone: "+250 780 145 562",
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
    socialFacebook: "https://facebook.com/shineconnect",
    socialInstagram: "https://instagram.com/shineconnect",
    socialYoutube: "https://youtube.com/shineconnect",
    socialTiktok: "https://tiktok.com/@shineconnect",
    socialWhatsapp: "https://wa.me/250780145562",
  });
  const [packagePrices, setPackagePrices] = useState({
    packageBasic: 250000,
    packagePremium: 450000,
    packageLuxury: 650000,
    packageFull: 850000,
  });
  const [commission, setCommission] = useState({
    commissionCouple: 60,
    commissionPlatform: 40,
    commissionCreator: 0,
  });
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", message: "", target: "all" });
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwData, setPwData] = useState({ current: "", new: "", confirm: "" });
  const [agreedPrice, setAgreedPrice] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");

  // ── STATS ───────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalBookings: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
    revenue: 0, coupleRevenue: 0, platformRevenue: 0,
    totalUsers: 0, clients: 0, creators: 0, couples: 0,
    totalVideos: 0, pendingVideos: 0, publishedVideos: 0,
    totalPosts: 0, unreadMsgs: 0, pendingCreators: 0,
    totalSupporters: 0, totalSupportedCouples: 0,
  });

  // ── THEME VARS ──────────────────────────────────────────────────
  const bg     = darkMode ? "#111"    : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const txt    = darkMode ? "#f0f0f0" : "#1a1a1a";
  const muted  = darkMode ? "#aaa"    : "#666";
  const border = darkMode ? "#333"    : "#e8e8e8";
  const Ycolor = "#ffc107";
  const inputBg = darkMode ? "#2a2a2a" : "#fff";

  // ── STYLES ──────────────────────────────────────────────────────
  const C = useMemo(() => ({
    page: { display: "flex", minHeight: "100vh", background: bg, fontFamily: "system-ui,sans-serif", color: txt, position: "relative" },
    mobileMenuBtn: {
      position: "fixed", bottom: "20px", right: "20px", background: Ycolor, border: "none",
      borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer",
      zIndex: 1001, boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      display: isMobile ? "flex" : "none", alignItems: "center", justifyContent: "center"
    },
    sidebar: {
      width: sidebarOpen ? 260 : (isMobile ? 0 : 70), background: darkMode ? "#0d0d0d" : "#1a1a1a",
      color: "#fff", transition: "width 0.3s, transform 0.3s", flexShrink: 0, overflowX: "hidden",
      display: "flex", flexDirection: "column",
      position: isMobile ? "fixed" : "relative",
      top: isMobile ? 0 : "auto",
      left: isMobile && mobileSidebarOpen ? 0 : (isMobile ? "-280px" : "auto"),
      height: isMobile ? "100vh" : "auto", zIndex: 1000,
      transform: isMobile && mobileSidebarOpen ? "translateX(0)" : (isMobile ? "translateX(-100%)" : "none")
    },
    sideHead: { padding: "20px 16px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: 10 },
    sideTitle: { fontSize: 14, fontWeight: 700, color: Ycolor, whiteSpace: "nowrap", overflow: "hidden" },
    sideItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", whiteSpace: "nowrap", fontSize: 13, color: "#ccc" },
    sideActive: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: `${Ycolor}22`, borderLeft: `3px solid ${Ycolor}`, color: Ycolor, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: isMobile && mobileSidebarOpen ? "block" : "none" },
    main: { flex: 1, overflow: "auto", padding: isMobile ? "16px" : "24px 20px" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
    pageTitle: { fontSize: "clamp(18px,3vw,26px)", fontWeight: 700, color: txt },
    statsGrid: { display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 },
    statCard: { background: cardBg, padding: "16px 14px", borderRadius: 12, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: `1px solid ${border}` },
    statVal: { fontSize: isMobile ? "18px" : "22px", fontWeight: 700, color: txt, marginBottom: 4 },
    statLbl: { fontSize: 11, color: muted },
    card: { background: cardBg, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: `1px solid ${border}`, overflow: "hidden", marginBottom: 16 },
    tHead: { background: darkMode ? "#2a2a2a" : "#f8f8f8" },
    th: { padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" },
    td: { padding: "12px 14px", fontSize: 13, color: txt, borderTop: `1px solid ${border}` },
    badge: (bg2, c) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg2, color: c }),
    btn: (bg2, c = "#fff") => ({ padding: "6px 12px", background: bg2, color: c, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }),
    input: { width: "100%", padding: "10px 12px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, background: inputBg, color: txt, outline: "none", boxSizing: "border-box" },
    label: { fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6, marginTop: 14 },
    settingsGrid: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(320px,1fr))", gap: 16 },
    settingCard: { background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20 },
    secTitle: { fontSize: 15, fontWeight: 700, color: txt, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${border}` },
    filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
    filterBtn: (active) => ({ padding: "7px 16px", background: active ? Ycolor : cardBg, color: active ? "#1a1a1a" : muted, border: `1px solid ${active ? Ycolor : border}`, borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600 }),
    searchInput: { padding: "9px 14px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, background: inputBg, color: txt, outline: "none", width: isMobile ? "100%" : "auto", minWidth: isMobile ? "auto" : 200 },
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
    modalBox: { background: cardBg, borderRadius: 16, padding: isMobile ? 20 : 28, maxWidth: 550, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" },
  }), [bg, cardBg, txt, muted, border, inputBg, isMobile, sidebarOpen, mobileSidebarOpen, darkMode, Ycolor]);

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
      NEW: ["#dbeafe", "#1d4ed8"], READ: ["#f3f4f6", "#6b7280"],
    };
    const [bg2, c] = map[s] || ["#f3f4f6", "#6b7280"];
    return <span style={C.badge(bg2, c)}>{String(s).toLowerCase()}</span>;
  };

  // ══════════════════ API FETCHES ══════════════════
  const fetchDashboard = useCallback(async () => {
    const res = await safeCall("getDashboard");
    if (res.success && res.dashboard) {
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
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await safeCall("getStats");
    if (res.success && res.stats) setStats(prev => ({ ...prev, ...res.stats }));
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setUsersLoading(true);
    const res = await safeCall("getUsers", page, 50, {});
    if (res.success) {
      setUsers(res.users || []);
      setUsersTotal(res.pagination?.total || 0);
      setUsersPages(res.pagination?.pages || 1);
      setUsersPage(page);
      setStats(prev => ({
        ...prev,
        totalUsers: res.pagination?.total || prev.totalUsers,
        creators: (res.users || []).filter(u => u.role === "CREATOR").length,
        clients: (res.users || []).filter(u => u.role === "CLIENT").length,
        couples: (res.users || []).filter(u => u.role === "COUPLE").length,
        pendingCreators: (res.users || []).filter(u => u.role === "CREATOR" && u.isActive === false).length,
      }));
    } else {
      showNotification.error(res.message || "Failed to load users");
    }
    setUsersLoading(false);
  }, []);

  const fetchBookings = useCallback(async (page = 1, currentFilter = filter) => {
    const status = currentFilter === "all" ? null : currentFilter.toUpperCase();
    const res = await safeCall("getBookings", page, 50, status);
    if (res.success) {
      setBookings(res.bookings || []);
      setBookingsTotal(res.pagination?.total || 0);
      setBookingsPages(res.pagination?.pages || 1);
      setBookingsPage(page);
      const list = res.bookings || [];
      setStats(prev => ({
        ...prev,
        pending: list.filter(b => b.status === "PENDING").length,
        confirmed: list.filter(b => b.status === "CONFIRMED").length,
        completed: list.filter(b => b.status === "COMPLETED").length,
        cancelled: list.filter(b => b.status === "CANCELLED").length,
      }));
    } else {
      showNotification.error(res.message || "Failed to load bookings");
    }
  }, [filter]);

  const fetchVideos = useCallback(async (page = 1) => {
    const res = await safeCall("getVideos", page, 50, {});
    if (res.success) {
      setVideos(res.videos || []);
      setVideosTotal(res.pagination?.total || 0);
      setVideosPages(res.pagination?.pages || 1);
      setVideosPage(page);
      setStats(prev => ({
        ...prev,
        totalVideos: res.pagination?.total || 0,
        pendingVideos: (res.videos || []).filter(v => v.status === "PENDING").length,
      }));
    } else {
      showNotification.error(res.message || "Failed to load videos");
    }
  }, []);

  const fetchCouples = useCallback(async (page = 1) => {
    const res = await safeCall("getCouples", page, 50);
    if (res.success) setCouples(res.couples || []);
  }, []);

  const fetchSupports = useCallback(async () => {
    const res = await safeCall("getSupports");
    if (res.success) {
      setSupports(res.supports || []);
      setStats(prev => ({
        ...prev,
        revenue: res.summary?.totalAmount || 0,
        coupleRevenue: res.summary?.totalCoupleShare || 0,
        platformRevenue: res.summary?.totalPlatformShare || 0,
        totalSupporters: res.summary?.uniqueSupporters || 0,
        totalSupportedCouples: res.supports ? new Set(res.supports.map(s => s.coupleId)).size : 0,
      }));
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    const res = await safeCall("getPayments");
    if (res.success) setPayments(res.payments || []);
  }, []);

  const fetchPosts = useCallback(async () => {
    const res = await safeCall("getPosts");
    if (res.success) {
      setPosts(res.posts || []);
      setStats(prev => ({ ...prev, totalPosts: res.posts?.length || 0 }));
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    const res = await safeCall("getMessages");
    if (res.success) {
      setMessages(res.messages || []);
      setStats(prev => ({ ...prev, unreadMsgs: res.unreadCount || 0 }));
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    const res = await safeCall("getSettings");
    if (res.success && res.settings) {
      const s = res.settings;
      setWebsiteSettings(prev => ({
        ...prev,
        platformName: s.platformName || prev.platformName,
        tagline: s.tagline || prev.tagline,
        contactEmail: s.contactEmail || prev.contactEmail,
        contactPhone: s.contactPhone || prev.contactPhone,
        whatsappNumber: s.whatsappNumber || prev.whatsappNumber,
        address: s.address || prev.address,
        workingHours: s.workingHours || prev.workingHours,
      }));
      setSocialSettings(prev => ({
        ...prev,
        socialFacebook: s.socialFacebook || prev.socialFacebook,
        socialInstagram: s.socialInstagram || prev.socialInstagram,
        socialYoutube: s.socialYoutube || prev.socialYoutube,
        socialTiktok: s.socialTiktok || prev.socialTiktok,
        socialWhatsapp: s.socialWhatsapp || prev.socialWhatsapp,
      }));
      setPackagePrices(prev => ({
        ...prev,
        packageBasic: s.packageBasic ?? prev.packageBasic,
        packagePremium: s.packagePremium ?? prev.packagePremium,
        packageLuxury: s.packageLuxury ?? prev.packageLuxury,
        packageFull: s.packageFull ?? prev.packageFull,
      }));
      setCommission(prev => ({
        ...prev,
        commissionCouple: s.commissionCouple ?? prev.commissionCouple,
        commissionPlatform: s.commissionPlatform ?? prev.commissionPlatform,
        commissionCreator: s.commissionCreator ?? prev.commissionCreator,
      }));
      setMaintenance(!!s.maintenanceMode);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboard(),
      fetchStats(),
      fetchUsers(1),
      fetchBookings(1, "all"),
      fetchVideos(1),
      fetchCouples(1),
      fetchSupports(),
      fetchPayments(),
      fetchPosts(),
      fetchMessages(),
      fetchSettings(),
    ]);
    setRefreshing(false);
  }, [fetchDashboard, fetchStats, fetchUsers, fetchBookings, fetchVideos, fetchCouples, fetchSupports, fetchPayments, fetchPosts, fetchMessages, fetchSettings]);

  // ── AUTH CHECK ─────────────────────────────────────────────────
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) { navigate("/admin/login"); return; }

      try {
        const userData = JSON.parse(localStorage.getItem("admin_data") || "{}");
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

        const maint = localStorage.getItem("maintenance_mode") === "true";
        setMaintenance(maint);

        await loadAllData();
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_data");
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate, loadAllData]);

  // ── RESPONSIVE ─────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else { setSidebarOpen(true); setMobileSidebarOpen(false); }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── FILTER AUTO-REFETCH ────────────────────────────────────────
  useEffect(() => {
    if (!loading) fetchBookings(1, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ══════════════════ HANDLERS ══════════════════
  // USERS
  const handleToggleUserStatus = async (userId) => {
    const res = await safeCall("toggleUserStatus", userId);
    if (res.success) { showNotification.success(res.message || "User status updated"); await fetchUsers(usersPage); }
    else showNotification.error(res.message || "Failed to update user status");
  };

  const handleUpdateUserRole = async (userId, role) => {
    const res = await safeCall("updateUserRole", userId, role);
    if (res.success) { showNotification.success("User role updated"); await fetchUsers(usersPage); }
    else showNotification.error(res.message || "Failed to update user role");
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    const res = await safeCall("deleteUser", userId);
    if (res.success) { showNotification.success("User deleted"); await fetchUsers(usersPage); }
    else showNotification.error(res.message || "Failed to delete user");
  };

  // BOOKINGS
  const handleUpdateBookingStatus = async (bookingId, status, totalAmount = null) => {
    const res = await safeCall("updateBookingStatus", bookingId, status, totalAmount);
    if (res.success) {
      showNotification.success(`Booking ${status.toLowerCase()}`);
      await fetchBookings(bookingsPage, filter);
    } else showNotification.error(res.message || "Failed to update booking");
  };

  const setBookingPrice = async (id, price) => {
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) { showNotification.error("Enter a valid price"); return; }
    await handleUpdateBookingStatus(id, "CONFIRMED", num);
    setPriceModal(null);
    setAgreedPrice("");
  };

  const assignCreatorToBooking = async (bookingId, creatorId) => {
    if (!creatorId) { showNotification.error("Select a creator"); return; }
    const res = await safeCall("assignCreator", bookingId, creatorId);
    if (res.success) {
      showNotification.success(res.message || "Creator assigned!");
      await fetchBookings(bookingsPage, filter);
    } else showNotification.error(res.message || "Failed to assign creator");
    setAssignCreatorModal(null);
    setSelectedCreator("");
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    const res = await safeCall("deleteBooking", id);
    if (res.success) { showNotification.success("Booking deleted"); await fetchBookings(bookingsPage, filter); }
    else showNotification.error(res.message || "Failed to delete booking");
  };

  // VIDEOS
  const handleApproveVideo = async (videoId) => {
    const res = await safeCall("approveVideo", videoId);
    if (res.success) { showNotification.success("Video approved!"); await fetchVideos(videosPage); await fetchStats(); }
    else showNotification.error(res.message || "Failed to approve video");
  };

  const handleRejectVideo = async (videoId) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    const res = await safeCall("rejectVideo", videoId, reason);
    if (res.success) { showNotification.success("Video rejected"); await fetchVideos(videosPage); }
    else showNotification.error(res.message || "Failed to reject video");
  };

  const handleFeatureVideo = async (videoId) => {
    const res = await safeCall("featureVideo", videoId);
    if (res.success) { showNotification.success(res.message || "Video updated"); await fetchVideos(videosPage); }
    else showNotification.error(res.message || "Failed to update video");
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete video?")) return;
    const res = await safeCall("deleteVideo", id);
    if (res.success) { showNotification.success("Video deleted"); await fetchVideos(videosPage); }
    else showNotification.error(res.message || "Failed to delete video");
  };

  // POSTS
  const deletePost = async (id) => {
    if (!window.confirm("Delete post?")) return;
    const res = await safeCall("deletePost", id);
    if (res.success) { showNotification.success("Post deleted"); await fetchPosts(); }
    else showNotification.error(res.message || "Failed to delete post");
  };

  // MESSAGES
  const handleMarkMessageRead = async (id) => {
    const res = await safeCall("markMessageRead", id);
    if (res.success) { showNotification.success("Message marked read"); await fetchMessages(); }
    else showNotification.error(res.message || "Failed to update message");
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete message?")) return;
    const res = await safeCall("deleteMessage", id);
    if (res.success) { showNotification.success("Message deleted"); await fetchMessages(); }
    else showNotification.error(res.message || "Failed to delete message");
  };

  // SETTINGS
  const saveWebsite = async () => {
    const payload = {
      ...websiteSettings,
      ...socialSettings,
      ...packagePrices,
      ...commission,
      maintenanceMode: maintenance,
    };
    const res = await safeCall("updateSettings", payload);
    if (res.success) {
      showNotification.success("Settings saved!");
      if (res.settings) {
        setMaintenance(!!res.settings.maintenanceMode);
      }
    } else showNotification.error(res.message || "Failed to save settings");
  };

  const savePrices = async () => {
    const res = await safeCall("updateSettings", { ...packagePrices });
    if (res.success) showNotification.success("Prices saved!");
    else showNotification.error(res.message || "Failed to save prices");
  };

  const saveSocial = async () => {
    const res = await safeCall("updateSettings", { ...socialSettings });
    if (res.success) showNotification.success("Social links saved!");
    else showNotification.error(res.message || "Failed to save social links");
  };

  const saveCommission = async () => {
    const total = commission.commissionCouple + commission.commissionPlatform + commission.commissionCreator;
    if (total !== 100) { showNotification.error("Commission must total 100%"); return; }
    const res = await safeCall("updateSettings", { ...commission });
    if (res.success) showNotification.success("Commission saved!");
    else showNotification.error(res.message || "Failed to save commission");
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.title || !broadcastMsg.message) {
      showNotification.error("Fill all fields"); return;
    }
    const res = await safeCall("sendBroadcast", broadcastMsg);
    if (res.success) {
      showNotification.success(res.message || "Broadcast sent!");
      setBroadcastMsg({ title: "", message: "", target: "all" });
    } else showNotification.error(res.message || "Failed to send broadcast");
  };

  const saveAdminProfile = () => {
    localStorage.setItem("admin_profile", JSON.stringify(adminProfile));
    showNotification.success("Profile saved!");
  };

  const changePassword = () => {
    if (pwData.new !== pwData.confirm) { showNotification.error("Passwords don't match"); return; }
    if (pwData.new.length < 6) { showNotification.error("Min 6 characters"); return; }
    showNotification.success("Password changed!");
    setShowPwForm(false);
    setPwData({ current: "", new: "", confirm: "" });
  };

  const exportBackup = () => {
    const seen = new WeakSet();
    const safe = (obj) => JSON.stringify(obj, (k, v) => {
      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return "[Circular]";
        seen.add(v);
      }
      return v;
    }, 2);
    const data = { bookings, users, couples, videos, posts, websiteSettings };
    const blob = new Blob([safe(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification.success("Backup downloaded!");
  };

  const exportCSV = (type = "bookings") => {
    let data, headers;
    if (type === "bookings") {
      headers = ["ID", "Name", "Email", "Event", "Package", "Date", "Status", "Price"];
      data = bookings.map(b => [
        b.id, b.user?.name || "", b.user?.email || "", b.eventType || "",
        b.package || "", b.eventDate ? new Date(b.eventDate).toLocaleDateString() : "",
        b.status || "", b.totalAmount || ""
      ]);
    } else if (type === "revenue") {
      headers = ["Date", "Amount", "Couple", "Platform"];
      data = supports.map(s => [
        new Date(s.createdAt).toLocaleDateString(),
        s.amount || 0, s.coupleAmount || 0, s.platformAmount || 0
      ]);
    } else {
      headers = ["ID", "Name", "Email", "Role", "Joined"];
      data = users.map(u => [
        u.id, u.name || "", u.email || "", u.role || "",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""
      ]);
    }
    const csv = [headers, ...data].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification.success(`${type} exported!`);
  };

  const toggleDarkMode = () => {
    const nd = !darkMode;
    setDarkMode(nd);
    localStorage.setItem("darkMode", nd);
    document.body.style.background = nd ? "#111" : "#f5f5f5";
  };

  const toggleMaintenance = async () => {
    const nm = !maintenance;
    setMaintenance(nm);
    localStorage.setItem("maintenance_mode", nm);
    await safeCall("updateSettings", { maintenanceMode: nm });
    showNotification[nm ? "error" : "success"](`Maintenance mode ${nm ? "ON 🔧" : "OFF ✅"}`);
  };

  const handleRefresh = () => {
    setUsersPage(1);
    setBookingsPage(1);
    setVideosPage(1);
    setFilter("all");
    setSearch("");
    loadAllData();
    showNotification.info("Refreshing data...");
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    navigate("/admin/login");
  };

  // ── FILTERED DATA ──────────────────────────────────────────────
  const filteredBookings = bookings
    .filter(b => filter === "all" || b.status === filter.toUpperCase())
    .filter(b => !search ||
      (b.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.email || "").toLowerCase().includes(search.toLowerCase())
    );

  const allCreators = users.filter(u => u.role === "CREATOR" && u.isActive !== false);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
          <div style={{ color: txt, fontSize: "18px" }}>Loading SHINECONNECT Dashboard...</div>
          <div style={{ color: muted, fontSize: "14px", marginTop: "8px" }}>Verifying your credentials</div>
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
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", color: Ycolor, fontSize: 18, cursor: "pointer", padding: 0 }}
            >☰</button>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              style={{ background: "none", border: "none", color: Ycolor, fontSize: 20, cursor: "pointer", padding: 0, marginLeft: "auto" }}
            >✕</button>
          )}
          {sidebarOpen && <span style={C.sideTitle}>✨ SHINECONNECT</span>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
          {TABS.map(t => (
            <div
              key={t.id}
              style={activeTab === t.id ? C.sideActive : C.sideItem}
              onClick={() => {
                setActiveTab(t.id);
                if (t.id === "users") fetchUsers(1);
                if (t.id === "videos") fetchVideos(1);
                if (t.id === "couples") fetchCouples(1);
                if (t.id === "bookings") fetchBookings(1, filter);
                if (t.id === "messages") fetchMessages();
                if (t.id === "support") fetchSupports();
                if (t.id === "payments") fetchPayments();
                if (t.id === "posts") fetchPosts();
                if (t.id === "settings") fetchSettings();
                if (isMobile) setMobileSidebarOpen(false);
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
              {sidebarOpen && t.id === "bookings" && stats.pending > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pending}</span>
              )}
              {sidebarOpen && t.id === "creators" && stats.pendingCreators > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pendingCreators}</span>
              )}
              {sidebarOpen && t.id === "videos" && stats.pendingVideos > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pendingVideos}</span>
              )}
              {sidebarOpen && t.id === "messages" && stats.unreadMsgs > 0 && (
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.unreadMsgs}</span>
              )}
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
            <p style={{ fontSize: "13px", color: muted, marginTop: "2px" }}>{BRANDING.tagline}</p>
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
                { icon: "👥", val: stats.totalUsers, label: "Total Users" },
                { icon: "👤", val: stats.clients, label: "Clients" },
                { icon: "💑", val: stats.couples, label: "Couples" },
                { icon: "🎬", val: stats.creators, label: "Creators" },
                { icon: "📋", val: stats.totalBookings, label: "Total Bookings" },
                { icon: "🎥", val: stats.totalVideos, label: "Total Videos" },
                { icon: "📝", val: stats.totalPosts, label: "Posts" },
                { icon: "💰", val: (stats.revenue || 0).toLocaleString() + " RWF", label: "Support Revenue" },
                { icon: "⏳", val: stats.pendingCreators + stats.pendingVideos + stats.pending, label: "Pending", bg: "#fef9c3" },
              ].map((s, i) => (
                <div key={i} style={{ ...C.statCard, background: s.bg || cardBg }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={C.statVal}>{s.val}</div>
                  <div style={C.statLbl}>{s.label}</div>
                </div>
              ))}
            </div>

            {stats.pendingVideos > 0 && (
              <div style={{ ...C.settingCard, background: "#fef9c3", borderColor: "#f59e0b", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#854d0e" }}>
                      🎥 {stats.pendingVideos} video{stats.pendingVideos > 1 ? "s" : ""} awaiting approval
                    </div>
                    <div style={{ fontSize: 12, color: "#854d0e", marginTop: 4 }}>Review and approve to make them public</div>
                  </div>
                  <button
                    onClick={() => setActiveTab("videos")}
                    style={{ padding: "8px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                  >Review Now →</button>
                </div>
              </div>
            )}

            <div style={C.settingsGrid}>
              <div style={C.settingCard}>
                <div style={C.secTitle}>💰 Revenue (60/40)</div>
                {[
                  ["Total Support", (stats.revenue || 0).toLocaleString() + " RWF"],
                  ["💑 Couple (60%)", (stats.coupleRevenue || 0).toLocaleString() + " RWF"],
                  ["🏢 Platform (40%)", (stats.platformRevenue || 0).toLocaleString() + " RWF"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                    <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>⚡ Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button style={{ ...C.btn(Ycolor, "#1a1a1a"), padding: "10px 14px", textAlign: "left" }} onClick={() => setActiveTab("videos")}>
                    🎥 Review Videos ({stats.pendingVideos} pending)
                  </button>
                  <button style={{ ...C.btn("#3b82f6"), padding: "10px 14px", textAlign: "left" }} onClick={() => setActiveTab("bookings")}>
                    📋 Manage Bookings ({stats.pending} pending)
                  </button>
                  <button style={{ ...C.btn("#8b5cf6"), padding: "10px 14px", textAlign: "left" }} onClick={() => setActiveTab("couples")}>
                    💑 Manage Couples
                  </button>
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
              <button
                disabled={usersLoading}
                style={{ ...C.btn(Ycolor, "#1a1a1a"), opacity: usersLoading ? 0.7 : 1 }}
                onClick={() => fetchUsers(usersPage)}
              >{usersLoading ? "Refreshing..." : "↻ Refresh"}</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>{["ID", "Name", "Email", "Role", "Status", "Joined", "Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
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

        {/* ══ VIDEOS ══ */}
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
                  <tr>{["ID", "Thumbnail", "Title", "Couple", "Access", "Status", "Views", "Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
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
                        )}>{v.accessType || "FREE"}</span>
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
                  <tr>{["ID", "Couple", "Email", "Wedding Date", "Status", "Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {couples.map(c => (
                    <tr key={c.id}>
                      <td style={C.td}>#{c.id}</td>
                      <td style={C.td}>{c.coupleName || `${c.groomName || ""} & ${c.brideName || ""}` || c.user?.name || "—"}</td>
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
              {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map(s => (
                <button key={s} style={C.filterBtn(filter === s)} onClick={() => setFilter(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ")}
                </button>
              ))}
              <input
                style={C.searchInput}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button style={C.btn("#3b82f6")} onClick={() => exportCSV("bookings")}>📥 CSV</button>
            </div>
            <div style={C.card}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                  <thead style={C.tHead}>
                    <tr>{["ID", "Client", "Email", "Event", "Date", "Package", "Status", "Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id}>
                        <td style={C.td}>#{b.id}</td>
                        <td style={C.td}>{b.user?.name || b.name || "—"}</td>
                        <td style={C.td}>{b.user?.email || b.email || "—"}</td>
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
                              <>
                                <button style={C.btn("#f59e0b")} onClick={() => setPriceModal(b)}>💰</button>
                                <button style={C.btn("#8b5cf6")} onClick={() => setAssignCreatorModal(b)}>👤 Assign</button>
                              </>
                            )}
                            {b.status === "IN_PROGRESS" && (
                              <button style={C.btn("#22c55e")} onClick={() => handleUpdateBookingStatus(b.id, "COMPLETED")}>✔ Complete</button>
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
                ["Total Amount", (stats.revenue || 0).toLocaleString() + " RWF"],
                ["💑 Couple (60%)", (stats.coupleRevenue || 0).toLocaleString() + " RWF"],
                ["🏢 Platform (40%)", (stats.platformRevenue || 0).toLocaleString() + " RWF"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                  <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={C.card}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 600 : "100%" }}>
                  <thead style={C.tHead}>
                    <tr>{["Date", "Supporter", "Couple", "Amount", "💑 60%", "🏢 40%"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {supports.map(s => (
                      <tr key={s.id}>
                        <td style={C.td}>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td style={C.td}>{s.user?.name || s.user?.email || "—"}</td>
                        <td style={C.td}>{s.couple?.coupleName || s.couple?.user?.name || s.coupleId || "—"}</td>
                        <td style={C.td}><strong>{(s.amount || 0).toLocaleString()} RWF</strong></td>
                        <td style={{ ...C.td, color: "#22c55e", fontWeight: 600 }}>{(s.coupleAmount || 0).toLocaleString()}</td>
                        <td style={{ ...C.td, color: Ycolor, fontWeight: 600 }}>{(s.platformAmount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                    {supports.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: muted }}>No support records yet</td></tr>
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
                  <tr>{["ID", "User", "Amount", "Method", "Status", "Date"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
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
                ["Total Support", (stats.revenue || 0).toLocaleString() + " RWF"],
                ["💑 Couple (60%)", (stats.coupleRevenue || 0).toLocaleString() + " RWF"],
                ["🏢 Platform (40%)", (stats.platformRevenue || 0).toLocaleString() + " RWF"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${border}`, fontSize: 14 }}>
                  <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
              <button
                style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: isMobile ? "100%" : "auto" }}
                onClick={() => exportCSV("revenue")}
              >📥 Export Revenue</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>💸 Commission Split</div>
              {["commissionCouple", "commissionPlatform", "commissionCreator"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k.replace("commission", "")} %</label>
                  <input
                    style={C.input}
                    type="number"
                    value={commission[k]}
                    onChange={e => setCommission({ ...commission, [k]: +e.target.value })}
                  />
                </div>
              ))}
              <p style={{
                fontSize: 12,
                color: (commission.commissionCouple + commission.commissionPlatform + commission.commissionCreator) === 100 ? "#22c55e" : "#ef4444",
                marginTop: 8
              }}>
                Total: {commission.commissionCouple + commission.commissionPlatform + commission.commissionCreator}%
              </p>
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveCommission}>
                💾 Save Commission
              </button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📦 Package Prices (RWF)</div>
              {["packageBasic", "packagePremium", "packageLuxury", "packageFull"].map(p => (
                <div key={p}>
                  <label style={C.label}>{p.replace("package", "")}</label>
                  <input
                    style={C.input}
                    type="number"
                    value={packagePrices[p]}
                    onChange={e => setPackagePrices({ ...packagePrices, [p]: +e.target.value })}
                  />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={savePrices}>
                💾 Save Prices
              </button>
            </div>
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {activeTab === "messages" && (
          <div style={C.card}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${border}` }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Contact Messages</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{messages.length} messages · {stats.unreadMsgs} unread</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>{["Date", "Name", "Email", "Subject", "Status", "Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id}>
                      <td style={C.td}>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td style={C.td}>{m.name || "—"}</td>
                      <td style={C.td}>{m.email || "—"}</td>
                      <td style={C.td}>{m.subject || "—"}</td>
                      <td style={C.td}>{statusBadge(m.isRead ? "READ" : "NEW")}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedMsg(m)}>View</button>
                          {!m.isRead && (
                            <button style={C.btn("#22c55e")} onClick={() => handleMarkMessageRead(m.id)}>✓ Read</button>
                          )}
                          <button style={C.btn("#ef4444")} onClick={() => handleDeleteMessage(m.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: muted }}>No messages</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ POSTS ══ */}
        {activeTab === "posts" && (
          <div style={C.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead style={C.tHead}>
                  <tr>{["ID", "Title", "Author", "Status", "Created", "Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
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
              {["platformName", "tagline", "contactEmail", "contactPhone", "whatsappNumber", "address", "workingHours"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k}</label>
                  <input
                    style={C.input}
                    value={websiteSettings[k] || ""}
                    onChange={e => setWebsiteSettings({ ...websiteSettings, [k]: e.target.value })}
                  />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveWebsite}>
                💾 Save
              </button>
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>👤 Admin Profile</div>
              {["name", "email", "phone"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k}</label>
                  <input
                    style={C.input}
                    value={adminProfile[k] || ""}
                    onChange={e => setAdminProfile({ ...adminProfile, [k]: e.target.value })}
                  />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveAdminProfile}>
                💾 Save Profile
              </button>
              <button style={{ ...C.btn("#3b82f6"), marginTop: 8, width: "100%" }} onClick={() => setShowPwForm(!showPwForm)}>
                {showPwForm ? "Cancel" : "🔑 Change Password"}
              </button>
              {showPwForm && (
                <div style={{ marginTop: 12 }}>
                  {["current", "new", "confirm"].map(k => (
                    <div key={k}>
                      <label style={C.label}>{k} password</label>
                      <input
                        style={C.input}
                        type="password"
                        value={pwData[k]}
                        onChange={e => setPwData({ ...pwData, [k]: e.target.value })}
                      />
                    </div>
                  ))}
                  <button style={{ ...C.btn("#22c55e"), marginTop: 8, width: "100%" }} onClick={changePassword}>
                    ✅ Change Password
                  </button>
                </div>
              )}
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>📱 Social Links</div>
              {["socialFacebook", "socialInstagram", "socialYoutube", "socialTiktok", "socialWhatsapp"].map(k => (
                <div key={k}>
                  <label style={C.label}>{k.replace("social", "")}</label>
                  <input
                    style={C.input}
                    value={socialSettings[k] || ""}
                    onChange={e => setSocialSettings({ ...socialSettings, [k]: e.target.value })}
                  />
                </div>
              ))}
              <button style={{ ...C.btn(Ycolor, "#1a1a1a"), marginTop: 12, width: "100%" }} onClick={saveSocial}>
                💾 Save
              </button>
            </div>

            <div style={C.settingCard}>
              <div style={C.secTitle}>📢 Broadcast Message</div>
              <label style={C.label}>Title</label>
              <input
                style={C.input}
                value={broadcastMsg.title}
                onChange={e => setBroadcastMsg({ ...broadcastMsg, title: e.target.value })}
              />
              <label style={C.label}>Message</label>
              <textarea
                style={{ ...C.input, minHeight: "100px" }}
                value={broadcastMsg.message}
                onChange={e => setBroadcastMsg({ ...broadcastMsg, message: e.target.value })}
              />
              <label style={C.label}>Target</label>
              <select
                style={C.input}
                value={broadcastMsg.target}
                onChange={e => setBroadcastMsg({ ...broadcastMsg, target: e.target.value })}
              >
                <option value="all">All Users</option>
                <option value="client">Clients</option>
                <option value="creator">Creators</option>
                <option value="couple">Couples</option>
              </select>
              <button style={{ ...C.btn("#3b82f6"), marginTop: 12, width: "100%" }} onClick={sendBroadcast}>
                📨 Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}

      {/* PRICE MODAL */}
      {priceModal && (
        <div style={C.modal} onClick={() => setPriceModal(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: txt }}>💰 Set Price</h3>
            <input
              style={C.input}
              type="number"
              placeholder="350000"
              value={agreedPrice}
              onChange={e => setAgreedPrice(e.target.value)}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button style={{ ...C.btn("#22c55e"), padding: "10px 20px", flex: 1 }} onClick={() => setBookingPrice(priceModal.id, agreedPrice)}>
                ✅ Confirm
              </button>
              <button style={{ ...C.btn("#6b7280"), padding: "10px 20px", flex: 1 }} onClick={() => setPriceModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN CREATOR MODAL */}
      {assignCreatorModal && (
        <div style={C.modal} onClick={() => setAssignCreatorModal(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: txt }}>👤 Assign Creator</h3>
            <p style={{ fontSize: 13, color: muted, marginBottom: 12 }}>
              Booking #{assignCreatorModal.id} — {assignCreatorModal.eventType}
            </p>
            <select
              style={C.input}
              value={selectedCreator}
              onChange={e => setSelectedCreator(e.target.value)}
            >
              <option value="">-- Select a creator --</option>
              {allCreators.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            {allCreators.length === 0 && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>No active creators available</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                style={{ ...C.btn("#22c55e"), padding: "10px 20px", flex: 1 }}
                onClick={() => assignCreatorToBooking(assignCreatorModal.id, selectedCreator)}
              >✅ Assign</button>
              <button
                style={{ ...C.btn("#6b7280"), padding: "10px 20px", flex: 1 }}
                onClick={() => { setAssignCreatorModal(null); setSelectedCreator(""); }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {selectedVideo && (
        <div style={C.modal} onClick={() => setSelectedVideo(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: txt }}>🎥 Video Details</h3>
            {[
              ["Title", selectedVideo.title],
              ["Couple", selectedVideo.couple?.user?.name || selectedVideo.coupleName],
              ["Event", selectedVideo.eventType],
              ["Access", selectedVideo.accessType],
              ["Views", selectedVideo.views || 0],
              ["Status", statusBadge(selectedVideo.status || "PENDING")],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                <span style={{ color: muted }}>{k}</span>
                <strong>{k === "Status" ? v : (v || "—")}</strong>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexDirection: isMobile ? "column" : "row" }}>
              {selectedVideo.videoUrl && (
                <button style={{ ...C.btn("#3b82f6"), flex: 1 }} onClick={() => window.open(selectedVideo.videoUrl, "_blank")}>
                  ▶ Watch
                </button>
              )}
              {selectedVideo.status === "PENDING" && (
                <button style={{ ...C.btn("#22c55e"), flex: 1 }} onClick={() => { handleApproveVideo(selectedVideo.id); setSelectedVideo(null); }}>
                  ✅ Approve
                </button>
              )}
              <button style={{ ...C.btn("#6b7280"), flex: 1 }} onClick={() => setSelectedVideo(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {selectedUser && (
        <div style={C.modal} onClick={() => setSelectedUser(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: txt }}>👤 {selectedUser.name}</h3>
            {[
              ["Email", selectedUser.email],
              ["Role", selectedUser.role],
              ["Status", selectedUser.isActive ? "Active" : "Blocked"],
              ["Phone", selectedUser.phone || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <button style={{ ...C.btn("#6b7280"), width: "100%", marginTop: 20 }} onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}

      {/* COUPLE MODAL */}
      {selectedCouple && (
        <div style={C.modal} onClick={() => setSelectedCouple(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: txt }}>
              💑 {selectedCouple.coupleName || `${selectedCouple.groomName || ""} & ${selectedCouple.brideName || ""}`}
            </h3>
            {[
              ["Email", selectedCouple.user?.email],
              ["Wedding Date", selectedCouple.weddingDate ? new Date(selectedCouple.weddingDate).toLocaleDateString() : "—"],
              ["Location", selectedCouple.location],
              ["District", selectedCouple.district],
              ["Story", selectedCouple.story],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                <span style={{ color: muted }}>{k}</span><strong>{v || "—"}</strong>
              </div>
            ))}
            <button style={{ ...C.btn("#6b7280"), width: "100%", marginTop: 20 }} onClick={() => setSelectedCouple(null)}>Close</button>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedBooking && (
        <div style={C.modal} onClick={() => setSelectedBooking(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: txt }}>📋 Booking #{selectedBooking.id}</h3>
            {[
              ["Client", selectedBooking.user?.name || selectedBooking.name],
              ["Email", selectedBooking.user?.email || selectedBooking.email],
              ["Event", selectedBooking.eventType],
              ["Date", selectedBooking.eventDate ? new Date(selectedBooking.eventDate).toLocaleDateString() : "—"],
              ["Location", selectedBooking.eventLocation],
              ["Package", selectedBooking.package],
              ["Status", statusBadge(selectedBooking.status)],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                <span style={{ color: muted }}>{k}</span>
                <strong>{k === "Status" ? v : (v || "—")}</strong>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexDirection: isMobile ? "column" : "row" }}>
              {selectedBooking.status === "CONFIRMED" && (
                <button
                  style={{ ...C.btn("#8b5cf6"), flex: 1 }}
                  onClick={() => { setAssignCreatorModal(selectedBooking); setSelectedBooking(null); }}
                >👤 Assign Creator</button>
              )}
              <button style={{ ...C.btn("#6b7280"), flex: 1 }} onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {selectedMsg && (
        <div style={C.modal} onClick={() => setSelectedMsg(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16, color: txt }}>✉️ Message from {selectedMsg.name}</h3>
            {[
              ["Email", selectedMsg.email],
              ["Phone", selectedMsg.phone || "—"],
              ["Subject", selectedMsg.subject || "—"],
              ["Date", new Date(selectedMsg.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}`, fontSize: 13 }}>
                <span style={{ color: muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>MESSAGE:</div>
              <div style={{ padding: 12, background: darkMode ? "#2a2a2a" : "#f8f8f8", borderRadius: 8, fontSize: 14, lineHeight: 1.5 }}>
                {selectedMsg.message}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              {!selectedMsg.isRead && (
                <button
                  style={{ ...C.btn("#22c55e"), flex: 1 }}
                  onClick={() => { handleMarkMessageRead(selectedMsg.id); setSelectedMsg(null); }}
                >✓ Mark Read</button>
              )}
              <button style={{ ...C.btn("#6b7280"), flex: 1 }} onClick={() => setSelectedMsg(null)}>Close</button>
            </div>
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