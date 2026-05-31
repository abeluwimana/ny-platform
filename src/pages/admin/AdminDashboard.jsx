// src/pages/admin/AdminDashboard.jsx
// DELETE the AdminDashboard.js file — keep only this .jsx file
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── INLINE TOAST ─────────────────────────────────────────────────
const notify = (msg, type = "success") => {
  const el = document.createElement("div");
  el.textContent = msg;
  const colors = { success: "#22c55e", error: "#ef4444", info: "#ffc107" };
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
  { id: "overview",      icon: "📊", label: "Overview" },
  { id: "bookings",      icon: "📋", label: "Bookings" },
  { id: "users",         icon: "👥", label: "Users" },
  { id: "creators",      icon: "🎬", label: "Creators" },
  { id: "videos",        icon: "🎥", label: "Videos" },
  { id: "couples",       icon: "💑", label: "Couples" },
  { id: "payments",      icon: "💳", label: "Payments" },
  { id: "revenue",       icon: "💰", label: "Revenue" },
  { id: "messages",      icon: "📩", label: "Messages" },
  { id: "posts",         icon: "📝", label: "Posts" },
  { id: "gallery",       icon: "🖼️", label: "Gallery" },
  { id: "subscriptions", icon: "⭐", label: "Subscriptions" },
  { id: "promo",         icon: "🏷️", label: "Promo Codes" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "reports",       icon: "🚩", label: "Reports" },
  { id: "calendar",      icon: "📅", label: "Calendar" },
  { id: "analytics",     icon: "📈", label: "Analytics" },
  { id: "website",       icon: "🌐", label: "Website" },
  { id: "services",      icon: "🛠️", label: "Services" },
  { id: "commission",    icon: "💸", label: "Commission" },
  { id: "profile",       icon: "👤", label: "Profile" },
  { id: "settings",      icon: "⚙️", label: "Settings" },
  { id: "audit",         icon: "📜", label: "Audit Logs" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── CORE STATE ──────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState("overview");
  const [darkMode,    setDarkMode]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [maintenance, setMaintenance] = useState(false);

  // ── DATA STATE ──────────────────────────────────────────────────
  const [bookings,      setBookings]      = useState([]);
  const [users,         setUsers]         = useState([]);
  const [couples,       setCouples]       = useState([]);
  const [messages,      setMessages]      = useState([]);
  const [videos,        setVideos]        = useState([]);
  const [posts,         setPosts]         = useState([]);
  const [gallery,       setGallery]       = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [reports,       setReports]       = useState([]);
  const [auditLogs,     setAuditLogs]     = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);

  // ── MODAL STATE ─────────────────────────────────────────────────
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [selectedVideo,   setSelectedVideo]   = useState(null);
  const [selectedMsg,     setSelectedMsg]     = useState(null);
  const [priceModal,      setPriceModal]      = useState(null); // booking to set price

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
    couple: 70, platform: 30, creator: 0,
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
  const [newService,   setNewService]   = useState("");
  const [newPromo,     setNewPromo]     = useState({ code: "", discount: "", expiry: "", usageLimit: "" });
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", message: "", target: "all" });
  const [showPwForm,   setShowPwForm]   = useState(false);
  const [pwData,       setPwData]       = useState({ current: "", new: "", confirm: "" });
  const [agreedPrice,  setAgreedPrice]  = useState("");

  // ── LOAD ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("admin_logged_in")) { navigate("/login"); return; }
    loadAll();
    const dm = localStorage.getItem("darkMode") === "true";
    setDarkMode(dm);
    if (dm) document.body.style.background = "#111";
  }, [navigate]);

  const loadAll = () => {
    setBookings(JSON.parse(localStorage.getItem("wedding_bookings") || "[]").sort((a,b) => b.id - a.id));
    setUsers(JSON.parse(localStorage.getItem("wedding_users") || "[]"));
    setCouples(JSON.parse(localStorage.getItem("wedding_couples") || "[]"));
    setMessages(JSON.parse(localStorage.getItem("contact_messages") || "[]").sort((a,b) => b.id - a.id));
    setVideos(JSON.parse(localStorage.getItem("creator_videos") || "[]"));
    setPosts(JSON.parse(localStorage.getItem("platform_posts") || "[]"));
    setGallery(JSON.parse(localStorage.getItem("platform_gallery") || "[]"));
    setSubscriptions(JSON.parse(localStorage.getItem("subscriptions") || "[]"));
    setReports(JSON.parse(localStorage.getItem("user_reports") || "[]"));
    setAuditLogs(JSON.parse(localStorage.getItem("audit_logs") || "[]"));
    const allUsers = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    setPendingCreators(allUsers.filter(u => u.role === "creator" && u.status === "pending"));
    const saved = JSON.parse(localStorage.getItem("platform_settings") || "{}");
    if (Object.keys(saved).length) setWebsiteSettings(s => ({ ...s, ...saved }));
    const savedPrices = JSON.parse(localStorage.getItem("package_prices") || "{}");
    if (Object.keys(savedPrices).length) setPackagePrices(savedPrices);
    const savedComm = JSON.parse(localStorage.getItem("commission_settings") || "{}");
    if (Object.keys(savedComm).length) setCommission(savedComm);
    const savedPromo = JSON.parse(localStorage.getItem("promo_codes") || "[]");
    if (savedPromo.length) setPromoCodes(savedPromo);
    const savedSvc = JSON.parse(localStorage.getItem("services_list") || "[]");
    if (savedSvc.length) setServices(savedSvc);
    const savedBS = JSON.parse(localStorage.getItem("booking_settings") || "{}");
    if (Object.keys(savedBS).length) setBookingSettings(savedBS);
  };

  const log = (action) => {
    const entry = { id: Date.now(), action, admin: adminProfile.name, timestamp: new Date().toISOString() };
    const updated = [entry, ...auditLogs.slice(0, 99)];
    setAuditLogs(updated);
    localStorage.setItem("audit_logs", JSON.stringify(updated));
  };

  // ── BOOKING ACTIONS ─────────────────────────────────────────────
  const updateBookingStatus = (id, status) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(updated);
    localStorage.setItem("wedding_bookings", JSON.stringify(updated));
    log(`Booking #${id} → ${status}`);
    notify(`Booking ${status}!`);
  };

  const setBookingPrice = (id, price) => {
    const updated = bookings.map(b =>
      b.id === id ? { ...b, agreedPrice: Number(price), paymentStatus: "awaiting_deposit" } : b
    );
    setBookings(updated);
    localStorage.setItem("wedding_bookings", JSON.stringify(updated));
    setPriceModal(null);
    setAgreedPrice("");
    log(`Price set for booking #${id}: ${Number(price).toLocaleString()} RWF`);
    notify("Price set! Client will be notified.");
  };

  const deleteBooking = (id) => {
    if (!window.confirm("Delete this booking?")) return;
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    localStorage.setItem("wedding_bookings", JSON.stringify(updated));
    log(`Deleted booking #${id}`);
    notify("Booking deleted", "error");
  };

  const exportCSV = () => {
    const rows = [
      ["ID","Name","Email","Phone","Event","Package","Date","Status","Payment","Price"],
      ...bookings.map(b => [
        b.id, b.name||b.clientName, b.email, b.phone,
        b.eventType, b.package, b.date, b.status,
        b.paymentStatus, b.agreedPrice||"Negotiable"
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `bookings_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    log("Exported bookings CSV");
  };

  // ── USER ACTIONS ────────────────────────────────────────────────
  const toggleBlock = (id) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u
    );
    setUsers(updated);
    localStorage.setItem("wedding_users", JSON.stringify(updated));
    log(`Toggled block for user #${id}`);
    notify("User status updated");
  };

  const changeRole = (id, role) => {
    const updated = users.map(u => u.id === id ? { ...u, role } : u);
    setUsers(updated);
    localStorage.setItem("wedding_users", JSON.stringify(updated));
    log(`Changed role of user #${id} to ${role}`);
    notify(`Role changed to ${role}`);
  };

  const deleteUser = (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem("wedding_users", JSON.stringify(updated));
    log(`Deleted user #${id}`);
    notify("User deleted", "error");
  };

  const approveCreator = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, status: "active" } : u);
    setUsers(updated);
    localStorage.setItem("wedding_users", JSON.stringify(updated));
    setPendingCreators(p => p.filter(c => c.id !== id));
    log(`Approved creator #${id}`);
    notify("Creator approved!");
  };

  const rejectCreator = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, status: "rejected", role: "client" } : u);
    setUsers(updated);
    localStorage.setItem("wedding_users", JSON.stringify(updated));
    setPendingCreators(p => p.filter(c => c.id !== id));
    log(`Rejected creator #${id}`);
    notify("Creator rejected", "error");
  };

  // ── VIDEO ACTIONS ───────────────────────────────────────────────
  const approveVideo = (id) => {
    const updated = videos.map(v => v.id === id ? { ...v, status: "published" } : v);
    setVideos(updated); localStorage.setItem("creator_videos", JSON.stringify(updated));
    log(`Approved video #${id}`); notify("Video published!");
  };
  const rejectVideo = (id) => {
    const updated = videos.map(v => v.id === id ? { ...v, status: "rejected" } : v);
    setVideos(updated); localStorage.setItem("creator_videos", JSON.stringify(updated));
    log(`Rejected video #${id}`); notify("Video rejected", "error");
  };
  const deleteVideo = (id) => {
    if (!window.confirm("Delete video?")) return;
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated); localStorage.setItem("creator_videos", JSON.stringify(updated));
    log(`Deleted video #${id}`); notify("Video deleted", "error");
  };

  // ── MESSAGE ACTIONS ─────────────────────────────────────────────
  const markRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, status: "read" } : m);
    setMessages(updated); localStorage.setItem("contact_messages", JSON.stringify(updated));
  };
  const deleteMsg = (id) => {
    if (!window.confirm("Delete message?")) return;
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated); localStorage.setItem("contact_messages", JSON.stringify(updated));
    log(`Deleted message #${id}`); notify("Message deleted", "error");
  };

  // ── POST ACTIONS ────────────────────────────────────────────────
  const togglePin = (id) => {
    const updated = posts.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p);
    setPosts(updated); localStorage.setItem("platform_posts", JSON.stringify(updated));
    notify("Post updated");
  };
  const deletePost = (id) => {
    if (!window.confirm("Delete post?")) return;
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated); localStorage.setItem("platform_posts", JSON.stringify(updated));
    notify("Post deleted", "error");
  };

  // ── SETTINGS SAVES ──────────────────────────────────────────────
  const saveWebsite = () => {
    localStorage.setItem("platform_settings", JSON.stringify(websiteSettings));
    log("Updated website settings"); notify("Website settings saved!");
  };
  const savePrices = () => {
    localStorage.setItem("package_prices", JSON.stringify(packagePrices));
    log("Updated package prices"); notify("Prices saved!");
  };
  const saveSocial = () => {
    localStorage.setItem("social_settings", JSON.stringify(socialSettings));
    log("Updated social links"); notify("Social links saved!");
  };
  const saveCommission = () => {
    const total = commission.couple + commission.platform + commission.creator;
    if (total !== 100) { notify("Commission must total 100%", "error"); return; }
    localStorage.setItem("commission_settings", JSON.stringify(commission));
    log("Updated commission settings"); notify("Commission saved!");
  };
  const addService = () => {
    if (!newService.trim()) return;
    const updated = [...services, newService.trim()];
    setServices(updated); localStorage.setItem("services_list", JSON.stringify(updated));
    setNewService(""); notify("Service added!");
  };
  const deleteService = (i) => {
    const updated = services.filter((_, idx) => idx !== i);
    setServices(updated); localStorage.setItem("services_list", JSON.stringify(updated));
    notify("Service removed", "error");
  };
  const addPromo = () => {
    if (!newPromo.code || !newPromo.discount) return;
    const updated = [...promoCodes, { ...newPromo, used: 0 }];
    setPromoCodes(updated); localStorage.setItem("promo_codes", JSON.stringify(updated));
    setNewPromo({ code: "", discount: "", expiry: "", usageLimit: "" });
    log(`Added promo: ${newPromo.code}`); notify("Promo code added!");
  };
  const deletePromo = (i) => {
    const updated = promoCodes.filter((_, idx) => idx !== i);
    setPromoCodes(updated); localStorage.setItem("promo_codes", JSON.stringify(updated));
    notify("Promo code deleted", "error");
  };
  const sendBroadcast = () => {
    if (!broadcastMsg.title || !broadcastMsg.message) { notify("Fill all fields", "error"); return; }
    log(`Broadcast to ${broadcastMsg.target}: "${broadcastMsg.title}"`);
    notify(`Notification sent to ${broadcastMsg.target}!`);
    setBroadcastMsg({ title: "", message: "", target: "all" });
  };
  const saveAdminProfile = () => {
    localStorage.setItem("admin_profile", JSON.stringify(adminProfile));
    log("Updated admin profile"); notify("Profile saved!");
  };
  const changePassword = () => {
    if (pwData.new !== pwData.confirm) { notify("Passwords don't match", "error"); return; }
    if (pwData.new.length < 6) { notify("Min 6 characters", "error"); return; }
    log("Changed admin password"); notify("Password changed!");
    setShowPwForm(false); setPwData({ current: "", new: "", confirm: "" });
  };
  const exportBackup = () => {
    const data = { bookings, users, couples, messages, videos, posts, promoCodes, websiteSettings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `backup_${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url);
    log("Exported full backup"); notify("Backup downloaded!");
  };
  const toggleDarkMode = () => {
    const nd = !darkMode; setDarkMode(nd);
    localStorage.setItem("darkMode", nd);
    document.body.style.background = nd ? "#111" : "#f5f5f5";
    log(`Dark mode ${nd ? "on" : "off"}`);
  };
  const toggleMaintenance = () => {
    const nm = !maintenance; setMaintenance(nm);
    localStorage.setItem("maintenance_mode", nm);
    log(`Maintenance ${nm ? "ON" : "OFF"}`);
    notify(`Maintenance mode ${nm ? "ON 🔧" : "OFF ✅"}`, nm ? "error" : "success");
  };

  // ── STATS ───────────────────────────────────────────────────────
  const stats = {
    totalBookings:     bookings.length,
    pending:           bookings.filter(b => b.status === "pending").length,
    confirmed:         bookings.filter(b => b.status === "confirmed").length,
    rejected:          bookings.filter(b => b.status === "rejected").length,
    revenue:           bookings.filter(b => b.status === "confirmed").reduce((s,b) => s + (b.agreedPrice||0), 0),
    totalUsers:        users.length,
    clients:           users.filter(u => u.role === "client").length,
    creators:          users.filter(u => u.role === "creator").length,
    couples:           couples.length,
    totalVideos:       videos.length,
    pendingVideos:     videos.filter(v => v.status === "pending").length,
    totalPosts:        posts.length,
    unreadMsgs:        messages.filter(m => m.status === "unread").length,
    subscriptions:     subscriptions.length,
    pendingCreators:   pendingCreators.length,
    pendingReports:    reports.filter(r => r.status === "pending").length,
  };

  // ── THEME VARS ──────────────────────────────────────────────────
  const bg       = darkMode ? "#111"    : "#f5f5f5";
  const cardBg   = darkMode ? "#1e1e1e" : "#fff";
  const txt      = darkMode ? "#f0f0f0" : "#1a1a1a";
  const muted    = darkMode ? "#aaa"    : "#666";
  const border   = darkMode ? "#333"    : "#e8e8e8";
  const Y        = "#ffc107";
  const inputBg  = darkMode ? "#2a2a2a" : "#fff";

  // ── REUSABLE STYLES ─────────────────────────────────────────────
  const C = {
    page:      { display: "flex", minHeight: "100vh", background: bg, fontFamily: "system-ui,sans-serif", color: txt },
    sidebar:   { width: sidebarOpen ? 220 : 60, background: darkMode ? "#0d0d0d" : "#1a1a1a", color: "#fff", transition: "width 0.3s", flexShrink: 0, overflowX: "hidden", display: "flex", flexDirection: "column" },
    sideHead:  { padding: "20px 16px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: 10 },
    sideTitle: { fontSize: 14, fontWeight: 700, color: Y, whiteSpace: "nowrap", overflow: "hidden" },
    sideItem:  { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", transition: "background 0.2s", borderRadius: 0, whiteSpace: "nowrap", fontSize: 13, color: "#ccc" },
    sideActive:{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", background: `${Y}22`, borderLeft: `3px solid ${Y}`, color: Y, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" },
    main:      { flex: 1, overflow: "auto", padding: "24px 20px" },
    topBar:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
    pageTitle: { fontSize: "clamp(18px,3vw,26px)", fontWeight: 700, color: txt },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 24 },
    statCard:  { background: cardBg, padding: "16px 14px", borderRadius: 12, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: `1px solid ${border}` },
    statVal:   { fontSize: 22, fontWeight: 700, color: txt, marginBottom: 4 },
    statLbl:   { fontSize: 11, color: muted },
    card:      { background: cardBg, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: `1px solid ${border}`, overflow: "hidden", marginBottom: 16 },
    tHead:     { background: darkMode ? "#2a2a2a" : "#f8f8f8" },
    th:        { padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" },
    td:        { padding: "12px 14px", fontSize: 13, color: txt, borderTop: `1px solid ${border}` },
    badge:     (bg2, c) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg2, color: c }),
    btn:       (bg2, c="#fff") => ({ padding: "6px 12px", background: bg2, color: c, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }),
    input:     { width: "100%", padding: "10px 12px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 14, background: inputBg, color: txt, outline: "none", boxSizing: "border-box" },
    label:     { fontSize: 12, fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6, marginTop: 14 },
    settingsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 },
    settingCard:  { background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20 },
    secTitle:  { fontSize: 15, fontWeight: 700, color: txt, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${border}` },
    filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
    filterBtn: (active) => ({ padding: "7px 16px", background: active ? Y : cardBg, color: active ? "#1a1a1a" : muted, border: `1px solid ${active ? Y : border}`, borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600 }),
    searchInput: { padding: "9px 14px", border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, background: inputBg, color: txt, outline: "none", minWidth: 200 },
    modal:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
    modalBox:  { background: cardBg, borderRadius: 16, padding: 28, maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" },
  };

  const statusBadge = (s) => {
    const map = {
      confirmed: ["#dcfce7","#15803d"], pending: ["#fef9c3","#854d0e"],
      rejected:  ["#fee2e2","#b91c1c"], completed: ["#dbeafe","#1d4ed8"],
      active:    ["#dcfce7","#15803d"], blocked:   ["#fee2e2","#b91c1c"],
      published: ["#dcfce7","#15803d"], draft:     ["#f3f4f6","#6b7280"],
    };
    const [bg2, c] = map[s] || ["#f3f4f6","#6b7280"];
    return <span style={C.badge(bg2, c)}>{s}</span>;
  };

  const filteredBookings = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => !search || (b.name||b.clientName||"").toLowerCase().includes(search.toLowerCase()) || (b.email||"").toLowerCase().includes(search.toLowerCase()));

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div style={C.page}>

      {/* ── SIDEBAR ── */}
      <div style={C.sidebar}>
        <div style={C.sideHead}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", color: Y, fontSize: 18, cursor: "pointer", padding: 0 }}>
            ☰
          </button>
          {sidebarOpen && <span style={C.sideTitle}>NY Admin</span>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingTop: 8 }}>
          {TABS.map(t => (
            <div key={t.id}
              style={activeTab === t.id ? C.sideActive : C.sideItem}
              onClick={() => setActiveTab(t.id)}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
              {sidebarOpen && t.id === "bookings" && stats.pending > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pending}</span>}
              {sidebarOpen && t.id === "messages" && stats.unreadMsgs > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.unreadMsgs}</span>}
              {sidebarOpen && t.id === "creators" && stats.pendingCreators > 0 &&
                <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px" }}>{stats.pendingCreators}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a2a" }}>
          <div style={{ ...C.sideItem, color: "#ef4444", padding: "8px 0" }}
            onClick={() => { localStorage.clear(); navigate("/login"); }}>
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={toggleMaintenance}
              style={C.btn(maintenance ? "#ef4444" : "#22c55e")}>
              {maintenance ? "🔧 Maintenance ON" : "✅ Live"}
            </button>
            <button onClick={exportBackup} style={C.btn("#3b82f6")}>💾 Backup</button>
            <button onClick={toggleDarkMode} style={C.btn(cardBg, txt)}>{darkMode ? "☀️" : "🌙"}</button>
            <button onClick={() => navigate("/")} style={C.btn("#1a1a1a")}>← Site</button>
          </div>
        </div>

        {/* ══ OVERVIEW ══ */}
        {activeTab === "overview" && (
          <>
            <div style={C.statsGrid}>
              {[
                { icon:"📋", val: stats.totalBookings, label:"Total Bookings", bg: cardBg },
                { icon:"⏳", val: stats.pending,       label:"Pending",        bg:"#fef9c3" },
                { icon:"✅", val: stats.confirmed,     label:"Confirmed",      bg:"#dcfce7" },
                { icon:"👥", val: stats.totalUsers,    label:"Total Users",    bg: cardBg },
                { icon:"🎬", val: stats.creators,      label:"Creators",       bg: cardBg },
                { icon:"💑", val: stats.couples,       label:"Couples",        bg: cardBg },
                { icon:"🎥", val: stats.totalVideos,   label:"Videos",         bg: cardBg },
                { icon:"📩", val: stats.unreadMsgs,    label:"Unread Msgs",    bg:"#dbeafe" },
                { icon:"⭐", val: stats.subscriptions, label:"Subscribers",    bg: cardBg },
                { icon:"💰", val: stats.revenue.toLocaleString()+" RWF", label:"Revenue", bg: cardBg },
              ].map((s,i) => (
                <div key={i} style={{ ...C.statCard, background: s.bg }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={C.statVal}>{s.val}</div>
                  <div style={C.statLbl}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick summary */}
            <div style={C.settingsGrid}>
              <div style={C.settingCard}>
                <div style={C.secTitle}>📋 Recent Bookings</div>
                {bookings.slice(0,5).map(b => (
                  <div key={b.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span>{b.name||b.clientName||"—"}</span>
                    {statusBadge(b.status)}
                  </div>
                ))}
                {bookings.length === 0 && <p style={{ color: muted, fontSize: 13 }}>No bookings yet</p>}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>📩 Recent Messages</div>
                {messages.slice(0,5).map(m => (
                  <div key={m.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span>{m.name||"—"}</span>
                    {statusBadge(m.status||"unread")}
                  </div>
                ))}
                {messages.length === 0 && <p style={{ color: muted, fontSize: 13 }}>No messages yet</p>}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>💰 Revenue Breakdown</div>
                {[
                  ["Confirmed Bookings", stats.confirmed],
                  ["Pending Bookings",   stats.pending],
                  ["Total Revenue",      stats.revenue.toLocaleString()+" RWF"],
                  ["Conversion Rate",    `${Math.round((stats.confirmed/Math.max(stats.totalBookings,1))*100)}%`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span style={{ color: muted }}>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div style={C.settingCard}>
                <div style={C.secTitle}>⚡ Quick Actions</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <button style={{ ...C.btn(Y,"#1a1a1a"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("bookings")}>📋 Manage Bookings ({stats.pending} pending)</button>
                  <button style={{ ...C.btn("#3b82f6"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("creators")}>🎬 Approve Creators ({stats.pendingCreators} pending)</button>
                  <button style={{ ...C.btn("#8b5cf6"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("videos")}>🎥 Review Videos ({stats.pendingVideos} pending)</button>
                  <button style={{ ...C.btn("#22c55e"), padding:"10px 14px", textAlign:"left" }} onClick={() => setActiveTab("messages")}>📩 Read Messages ({stats.unreadMsgs} unread)</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ BOOKINGS ══ */}
        {activeTab === "bookings" && (
          <>
            <div style={C.filterRow}>
              <input style={C.searchInput} placeholder="🔍 Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
              {["all","pending","confirmed","rejected"].map(f => (
                <button key={f} style={C.filterBtn(filter===f)} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase()+f.slice(1)} {f==="all"?`(${stats.totalBookings})`:f==="pending"?`(${stats.pending})`:f==="confirmed"?`(${stats.confirmed})`:`(${stats.rejected})`}
                </button>
              ))}
              <button style={C.btn("#3b82f6")} onClick={exportCSV}>📥 CSV</button>
            </div>

            <div style={C.card}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
                  <thead style={C.tHead}>
                    <tr>{["ID","Client","Event","Package","Date","Status","Payment","Price","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 && (
                      <tr><td colSpan={9} style={{ ...C.td, textAlign:"center", padding: 40, color: muted }}>No bookings found</td></tr>
                    )}
                    {filteredBookings.map(b => (
                      <tr key={b.id} style={{ background: b.status==="pending" ? (darkMode?"#1e1a00":"#fffbeb") : "transparent" }}>
                        <td style={C.td}><span style={{ fontSize:11, color: muted }}>#{String(b.id).slice(-6)}</span></td>
                        <td style={C.td}>
                          <div style={{ fontWeight:600 }}>{b.name||b.clientName||"—"}</div>
                          <div style={{ fontSize:11, color:muted }}>{b.email}</div>
                          <div style={{ fontSize:11, color:muted }}>{b.phone}</div>
                        </td>
                        <td style={C.td}>{b.eventType||"Wedding"}</td>
                        <td style={C.td}>{b.package||"—"}</td>
                        <td style={C.td}>{b.date ? new Date(b.date+"T00:00:00").toLocaleDateString("en-RW",{day:"numeric",month:"short",year:"numeric"}) : "—"}</td>
                        <td style={C.td}>{statusBadge(b.status||"pending")}</td>
                        <td style={C.td}>
                          <span style={{ fontSize:11, color: b.paymentStatus==="paid"?"#16a34a":"#d97706", fontWeight:600 }}>
                            {b.paymentStatus==="paid"?"✅ Paid":b.paymentStatus==="awaiting_deposit"?"⏳ Awaiting Deposit":"🕐 Not Set"}
                          </span>
                        </td>
                        <td style={C.td}>
                          {b.agreedPrice ? <strong>{Number(b.agreedPrice).toLocaleString()} RWF</strong> : <span style={{ color: muted, fontSize:11 }}>Negotiable</span>}
                        </td>
                        <td style={C.td}>
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            <button style={C.btn("#22c55e")} onClick={() => updateBookingStatus(b.id,"confirmed")}>✅</button>
                            <button style={C.btn("#ef4444")} onClick={() => updateBookingStatus(b.id,"rejected")}>❌</button>
                            <button style={C.btn(Y,"#1a1a1a")} onClick={() => { setPriceModal(b); setAgreedPrice(b.agreedPrice||""); }}>💰</button>
                            <button style={C.btn("#3b82f6")} onClick={() => setSelectedBooking(b)}>👁️</button>
                            <button style={C.btn("#6b7280")} onClick={() => deleteBooking(b.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ USERS ══ */}
        {activeTab === "users" && (
          <>
            <div style={C.filterRow}>
              <input style={C.searchInput} placeholder="🔍 Search users…" value={search} onChange={e => setSearch(e.target.value)} />
              {["all","client","creator","admin"].map(f => (
                <button key={f} style={C.filterBtn(filter===f)} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <div style={C.card}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:650 }}>
                  <thead style={C.tHead}>
                    <tr>{["Name","Email","Role","Status","Joined","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.filter(u => (filter==="all"||u.role===filter) && (!search||(u.name||"").toLowerCase().includes(search.toLowerCase()))).map(u => (
                      <tr key={u.id}>
                        <td style={C.td}><strong>{u.name}</strong></td>
                        <td style={C.td}>{u.email}</td>
                        <td style={C.td}>
                          <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                            style={{ padding:"4px 8px", borderRadius:6, border:`1px solid ${border}`, background:inputBg, color:txt, fontSize:12 }}>
                            <option value="client">Client</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={C.td}>{statusBadge(u.status||"active")}</td>
                        <td style={C.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                        <td style={C.td}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button style={C.btn(u.status==="blocked"?"#22c55e":"#f59e0b")} onClick={() => toggleBlock(u.id)}>{u.status==="blocked"?"🔓":"🔒"}</button>
                            <button style={C.btn("#3b82f6")} onClick={() => setSelectedUser(u)}>👁️</button>
                            <button style={C.btn("#ef4444")} onClick={() => deleteUser(u.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length===0 && <tr><td colSpan={6} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No users yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ CREATORS ══ */}
        {activeTab === "creators" && (
          <>
            {pendingCreators.length > 0 && (
              <>
                <div style={{ ...C.secTitle, color: txt, marginBottom:12 }}>⏳ Pending Approvals ({pendingCreators.length})</div>
                <div style={C.card}>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                      <thead style={C.tHead}>
                        <tr>{["Name","Email","Joined","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {pendingCreators.map(c => (
                          <tr key={c.id}>
                            <td style={C.td}><strong>{c.name}</strong></td>
                            <td style={C.td}>{c.email}</td>
                            <td style={C.td}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                            <td style={C.td}>
                              <div style={{ display:"flex", gap:4 }}>
                                <button style={C.btn("#22c55e")} onClick={() => approveCreator(c.id)}>✅ Approve</button>
                                <button style={C.btn("#ef4444")} onClick={() => rejectCreator(c.id)}>❌ Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            <div style={{ ...C.secTitle, color: txt, marginBottom:12, marginTop:8 }}>🎬 All Creators</div>
            <div style={C.card}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                  <thead style={C.tHead}>
                    <tr>{["Name","Email","Status","Videos","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role==="creator").map(u => (
                      <tr key={u.id}>
                        <td style={C.td}><strong>{u.name}</strong></td>
                        <td style={C.td}>{u.email}</td>
                        <td style={C.td}>{statusBadge(u.status||"active")}</td>
                        <td style={C.td}>{videos.filter(v => v.creatorId===u.id||v.creatorEmail===u.email).length}</td>
                        <td style={C.td}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button style={C.btn(u.status==="blocked"?"#22c55e":"#f59e0b")} onClick={() => toggleBlock(u.id)}>{u.status==="blocked"?"🔓":"🔒"}</button>
                            <button style={C.btn("#3b82f6")} onClick={() => setSelectedUser(u)}>👁️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.filter(u=>u.role==="creator").length===0 && <tr><td colSpan={5} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No creators yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ VIDEOS ══ */}
        {activeTab === "videos" && (
          <>
            <div style={C.filterRow}>
              {["all","pending","published","rejected"].map(f => (
                <button key={f} style={C.filterBtn(filter===f)} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase()+f.slice(1)} ({f==="all"?videos.length:videos.filter(v=>(v.status||"pending")===f).length})
                </button>
              ))}
            </div>
            <div style={C.card}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
                  <thead style={C.tHead}>
                    <tr>{["Title","Couple","Event","Creator","Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {videos.filter(v => filter==="all"||(v.status||"pending")===filter).map(v => (
                      <tr key={v.id}>
                        <td style={C.td}><strong>{v.title||"—"}</strong></td>
                        <td style={C.td}>{v.coupleName||"—"}</td>
                        <td style={C.td}>{v.eventType||"—"}</td>
                        <td style={C.td}>{v.creatorName||"—"}</td>
                        <td style={C.td}>{statusBadge(v.status||"pending")}</td>
                        <td style={C.td}>
                          <div style={{ display:"flex", gap:4 }}>
                            {v.status!=="published" && <button style={C.btn("#22c55e")} onClick={() => approveVideo(v.id)}>✅</button>}
                            {v.status!=="rejected" && v.status!=="published" && <button style={C.btn("#f59e0b")} onClick={() => rejectVideo(v.id)}>❌</button>}
                            <button style={C.btn("#3b82f6")} onClick={() => setSelectedVideo(v)}>👁️</button>
                            <button style={C.btn("#ef4444")} onClick={() => deleteVideo(v.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {videos.length===0 && <tr><td colSpan={6} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No videos yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ COUPLES ══ */}
        {activeTab === "couples" && (
          <div style={C.card}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                <thead style={C.tHead}>
                  <tr>{["Couple","Location","Videos","Gallery","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {couples.map(c => (
                    <tr key={c.id}>
                      <td style={C.td}><strong>{c.couple||c.name||"—"}</strong></td>
                      <td style={C.td}>{c.location||"—"}</td>
                      <td style={C.td}>{videos.filter(v=>v.coupleId===c.id).length}</td>
                      <td style={C.td}>{(c.gallery||[]).length}</td>
                      <td style={C.td}><button style={C.btn("#3b82f6")}>👁️ View</button></td>
                    </tr>
                  ))}
                  {couples.length===0 && <tr><td colSpan={5} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No couples yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ PAYMENTS ══ */}
        {activeTab === "payments" && (
          <>
            <div style={C.settingsGrid}>
              {[
                { label:"Total Revenue",     val: stats.revenue.toLocaleString()+" RWF", color:"#22c55e" },
                { label:"Pending Payments",  val: bookings.filter(b=>b.paymentStatus==="awaiting_deposit").length, color:"#f59e0b" },
                { label:"Paid Bookings",     val: bookings.filter(b=>b.paymentStatus==="paid").length, color:"#3b82f6" },
                { label:"Active Subscribers",val: stats.subscriptions, color:"#8b5cf6" },
              ].map((s,i) => (
                <div key={i} style={{ ...C.statCard, textAlign:"left", padding:20 }}>
                  <div style={{ fontSize:13, color:muted, marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:26, fontWeight:700, color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={C.card}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
                  <thead style={C.tHead}>
                    <tr>{["Client","Event","Package","Agreed Price","Payment Status","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={C.td}><strong>{b.name||b.clientName||"—"}</strong><br/><span style={{ fontSize:11,color:muted }}>{b.phone}</span></td>
                        <td style={C.td}>{b.eventType||"Wedding"}</td>
                        <td style={C.td}>{b.package||"—"}</td>
                        <td style={C.td}>{b.agreedPrice ? <strong>{Number(b.agreedPrice).toLocaleString()} RWF</strong> : <span style={{ color:muted,fontSize:11 }}>Not set</span>}</td>
                        <td style={C.td}>
                          <span style={{ fontSize:12,fontWeight:600, color: b.paymentStatus==="paid"?"#16a34a":b.paymentStatus==="awaiting_deposit"?"#d97706":"#6b7280" }}>
                            {b.paymentStatus==="paid"?"✅ Paid":b.paymentStatus==="awaiting_deposit"?"⏳ Awaiting Deposit":"🕐 Not Set"}
                          </span>
                        </td>
                        <td style={C.td}>
                          <button style={C.btn(Y,"#1a1a1a")} onClick={() => { setPriceModal(b); setAgreedPrice(b.agreedPrice||""); }}>💰 Set Price</button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length===0 && <tr><td colSpan={6} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No payment records</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ REVENUE ══ */}
        {activeTab === "revenue" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>💰 Revenue Summary</div>
              {[
                ["Total Revenue",      stats.revenue.toLocaleString()+" RWF"],
                ["Confirmed Bookings", stats.confirmed],
                ["Avg per Booking",    stats.confirmed ? Math.round(stats.revenue/stats.confirmed).toLocaleString()+" RWF" : "—"],
                ["Subscription Revenue", (subscriptions.length * 5000).toLocaleString()+" RWF"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${border}`, fontSize:14 }}>
                  <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
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
                <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:12, padding:"10px 20px" }} onClick={saveCommission}>💾 Save Commission</button>
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
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:12, padding:"10px 20px" }} onClick={savePrices}>💾 Save Prices</button>
            </div>
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {activeTab === "messages" && (
          <>
            <div style={C.filterRow}>
              {["all","unread","read"].map(f => (
                <button key={f} style={C.filterBtn(filter===f)} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase()+f.slice(1)} {f==="unread"?`(${stats.unreadMsgs})`:""}
                </button>
              ))}
            </div>
            <div style={C.card}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
                  <thead style={C.tHead}>
                    <tr>{["From","Subject","Status","Date","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {messages.filter(m => filter==="all"||(m.status||"unread")===filter).map(m => (
                      <tr key={m.id} style={{ background: (m.status||"unread")==="unread"?(darkMode?"#1e1a00":"#fffbeb"):"transparent" }}>
                        <td style={C.td}><strong>{m.name||"—"}</strong><br/><span style={{ fontSize:11,color:muted }}>{m.email}</span></td>
                        <td style={C.td}>{m.subject||"—"}</td>
                        <td style={C.td}>{statusBadge(m.status||"unread")}</td>
                        <td style={C.td}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}</td>
                        <td style={C.td}>
                          <div style={{ display:"flex", gap:4 }}>
                            <button style={C.btn("#3b82f6")} onClick={() => { setSelectedMsg(m); markRead(m.id); }}>👁️</button>
                            <button style={C.btn("#ef4444")} onClick={() => deleteMsg(m.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {messages.length===0 && <tr><td colSpan={5} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No messages yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ POSTS ══ */}
        {activeTab === "posts" && (
          <div style={C.card}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
                <thead style={C.tHead}>
                  <tr>{["Title","Author","Type","Pinned","Date","Actions"].map(h => <th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id}>
                      <td style={C.td}><strong>{p.title||"—"}</strong></td>
                      <td style={C.td}>{p.author||"—"}</td>
                      <td style={C.td}>{p.type||"post"}</td>
                      <td style={C.td}>{p.pinned ? "📌 Yes" : "No"}</td>
                      <td style={C.td}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>
                        <div style={{ display:"flex", gap:4 }}>
                          <button style={C.btn(Y,"#1a1a1a")} onClick={() => togglePin(p.id)}>{p.pinned?"Unpin":"📌 Pin"}</button>
                          <button style={C.btn("#ef4444")} onClick={() => deletePost(p.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length===0 && <tr><td colSpan={6} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No posts yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ GALLERY ══ */}
        {activeTab === "gallery" && (
          <div style={{ ...C.settingCard }}>
            <div style={C.secTitle}>🖼️ Platform Gallery</div>
            {gallery.length === 0 ? (
              <p style={{ color:muted, textAlign:"center", padding:40 }}>No gallery items yet. Gallery images uploaded by creators appear here.</p>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
                {gallery.map((g,i) => (
                  <div key={i} style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${border}` }}>
                    <img src={g.url||g} alt="" style={{ width:"100%", height:120, objectFit:"cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ SUBSCRIPTIONS ══ */}
        {activeTab === "subscriptions" && (
          <>
            <div style={C.statsGrid}>
              {[
                { label:"Total Subscribers", val: subscriptions.length },
                { label:"Active",            val: subscriptions.filter(s=>s.status==="active").length },
                { label:"Monthly Revenue",   val: (subscriptions.filter(s=>s.plan==="monthly").length * 5000).toLocaleString()+" RWF" },
                { label:"Annual Revenue",    val: (subscriptions.filter(s=>s.plan==="annual").length * 50000).toLocaleString()+" RWF" },
              ].map((s,i) => (
                <div key={i} style={C.statCard}>
                  <div style={C.statVal}>{s.val}</div>
                  <div style={C.statLbl}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={C.card}>
              {subscriptions.length===0 ? (
                <p style={{ color:muted, textAlign:"center", padding:40 }}>No subscribers yet</p>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead style={C.tHead}>
                      <tr>{["User","Plan","Status","Started","Expires"].map(h=><th key={h} style={C.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((s,i) => (
                        <tr key={i}>
                          <td style={C.td}>{s.email||"—"}</td>
                          <td style={C.td}>{s.plan||"monthly"}</td>
                          <td style={C.td}>{statusBadge(s.status||"active")}</td>
                          <td style={C.td}>{s.startDate ? new Date(s.startDate).toLocaleDateString() : "—"}</td>
                          <td style={C.td}>{s.endDate ? new Date(s.endDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ PROMO CODES ══ */}
        {activeTab === "promo" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🏷️ Add Promo Code</div>
              <label style={C.label}>Code</label>
              <input style={C.input} placeholder="e.g. SUMMER10" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} />
              <label style={C.label}>Discount %</label>
              <input style={C.input} type="number" placeholder="e.g. 15" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})} />
              <label style={C.label}>Expiry Date</label>
              <input style={C.input} type="date" value={newPromo.expiry} onChange={e => setNewPromo({...newPromo, expiry: e.target.value})} />
              <label style={C.label}>Usage Limit</label>
              <input style={C.input} type="number" placeholder="e.g. 100" value={newPromo.usageLimit} onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})} />
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 20px" }} onClick={addPromo}>+ Add Code</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📋 Active Codes ({promoCodes.length})</div>
              {promoCodes.map((p,i) => (
                <div key={i} style={{ background: darkMode?"#2a2a2a":"#f8f8f8", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <strong style={{ color:Y, fontSize:15 }}>{p.code}</strong>
                    <span style={{ fontSize:13, color:muted }}>{p.discount}% OFF</span>
                  </div>
                  <div style={{ fontSize:12, color:muted, marginTop:4 }}>
                    Expires: {p.expiry} · Used: {p.used||0}/{p.usageLimit||"∞"}
                  </div>
                  <button style={{ ...C.btn("#ef4444"), marginTop:8, fontSize:11 }} onClick={() => deletePromo(i)}>🗑️ Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {activeTab === "notifications" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📢 Send Broadcast</div>
              <label style={C.label}>Target Audience</label>
              <select style={{ ...C.input }} value={broadcastMsg.target} onChange={e => setBroadcastMsg({...broadcastMsg, target: e.target.value})}>
                <option value="all">All Users</option>
                <option value="clients">Clients Only</option>
                <option value="creators">Creators Only</option>
                <option value="couples">Couples Only</option>
              </select>
              <label style={C.label}>Title</label>
              <input style={C.input} placeholder="Notification title" value={broadcastMsg.title} onChange={e => setBroadcastMsg({...broadcastMsg, title: e.target.value})} />
              <label style={C.label}>Message</label>
              <textarea style={{ ...C.input, minHeight:100, resize:"vertical" }} placeholder="Your message…" value={broadcastMsg.message} onChange={e => setBroadcastMsg({...broadcastMsg, message: e.target.value})} />
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 20px" }} onClick={sendBroadcast}>📢 Send Notification</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📊 Notification Stats</div>
              {[
                ["Total Users",   stats.totalUsers],
                ["Clients",       stats.clients],
                ["Creators",      stats.creators],
                ["Subscribers",   stats.subscriptions],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${border}`, fontSize:14 }}>
                  <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ REPORTS ══ */}
        {activeTab === "reports" && (
          <div style={C.card}>
            {reports.length===0 ? (
              <p style={{ color:muted, textAlign:"center", padding:40 }}>No reports filed yet</p>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead style={C.tHead}>
                    <tr>{["Reporter","Type","Target","Reason","Status","Actions"].map(h=><th key={h} style={C.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r.id}>
                        <td style={C.td}>{r.reporter||"—"}</td>
                        <td style={C.td}>{r.type||"—"}</td>
                        <td style={C.td}>{r.target||"—"}</td>
                        <td style={C.td}>{r.reason||"—"}</td>
                        <td style={C.td}>{statusBadge(r.status||"pending")}</td>
                        <td style={C.td}><button style={C.btn("#3b82f6")}>Review</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ CALENDAR ══ */}
        {activeTab === "calendar" && (
          <div style={C.settingCard}>
            <div style={C.secTitle}>📅 Upcoming Events</div>
            {bookings.filter(b => b.date && new Date(b.date) >= new Date()).sort((a,b) => new Date(a.date)-new Date(b.date)).slice(0,20).map(b => (
              <div key={b.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 0", borderBottom:`1px solid ${border}` }}>
                <div style={{ background:Y, color:"#1a1a1a", borderRadius:10, padding:"8px 12px", textAlign:"center", minWidth:50, flexShrink:0 }}>
                  <div style={{ fontSize:18, fontWeight:700 }}>{new Date(b.date+"T00:00:00").getDate()}</div>
                  <div style={{ fontSize:10 }}>{new Date(b.date+"T00:00:00").toLocaleString("en",{month:"short"})}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{b.name||b.clientName||"—"}</div>
                  <div style={{ fontSize:12, color:muted }}>{b.eventType||"Wedding"} · {b.location||"—"} · {b.package||"—"}</div>
                </div>
                {statusBadge(b.status||"pending")}
              </div>
            ))}
            {bookings.filter(b => b.date && new Date(b.date) >= new Date()).length===0 && (
              <p style={{ color:muted, textAlign:"center", padding:40 }}>No upcoming events</p>
            )}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {activeTab === "analytics" && (
          <div style={C.settingsGrid}>
            {[
              { title:"📊 Booking Analytics", rows:[
                ["Total Bookings",   stats.totalBookings],
                ["Pending",          stats.pending],
                ["Confirmed",        stats.confirmed],
                ["Rejected",         stats.rejected],
                ["Conversion Rate",  `${Math.round((stats.confirmed/Math.max(stats.totalBookings,1))*100)}%`],
              ]},
              { title:"👥 User Analytics", rows:[
                ["Total Users",      stats.totalUsers],
                ["Clients",          stats.clients],
                ["Creators",         stats.creators],
                ["Pending Creators", stats.pendingCreators],
                ["Subscriptions",    stats.subscriptions],
              ]},
              { title:"🎥 Content Analytics", rows:[
                ["Total Videos",     stats.totalVideos],
                ["Pending Videos",   stats.pendingVideos],
                ["Published",        videos.filter(v=>v.status==="published").length],
                ["Total Posts",      stats.totalPosts],
                ["Couples",          stats.couples],
              ]},
              { title:"💰 Revenue Analytics", rows:[
                ["Total Revenue",    stats.revenue.toLocaleString()+" RWF"],
                ["Avg per Booking",  stats.confirmed?Math.round(stats.revenue/stats.confirmed).toLocaleString()+" RWF":"—"],
                ["Couple Share",     `${commission.couple}%`],
                ["Platform Share",   `${commission.platform}%`],
                ["Creator Share",    `${commission.creator}%`],
              ]},
            ].map((section, i) => (
              <div key={i} style={C.settingCard}>
                <div style={C.secTitle}>{section.title}</div>
                {section.rows.map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                    <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ══ WEBSITE ══ */}
        {activeTab === "website" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🌐 General Settings</div>
              {[
                ["platformName","Platform Name","text"],
                ["contactEmail","Contact Email","email"],
                ["contactPhone","Contact Phone","text"],
                ["whatsappNumber","WhatsApp Number","text"],
                ["address","Address","text"],
                ["workingHours","Working Hours","text"],
              ].map(([k,lbl,t]) => (
                <div key={k}>
                  <label style={C.label}>{lbl}</label>
                  <input style={C.input} type={t} value={websiteSettings[k]||""} onChange={e => setWebsiteSettings({...websiteSettings,[k]:e.target.value})} />
                </div>
              ))}
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 20px" }} onClick={saveWebsite}>💾 Save</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🏠 Hero Section</div>
              {[
                ["heroTitle","Hero Title"],
                ["heroSubtitle","Hero Subtitle"],
              ].map(([k,lbl]) => (
                <div key={k}>
                  <label style={C.label}>{lbl}</label>
                  <input style={C.input} value={websiteSettings[k]||""} onChange={e => setWebsiteSettings({...websiteSettings,[k]:e.target.value})} />
                </div>
              ))}
              <label style={C.label}>Hero Description</label>
              <textarea style={{ ...C.input, minHeight:80, resize:"vertical" }} value={websiteSettings.heroDescription||""} onChange={e => setWebsiteSettings({...websiteSettings, heroDescription:e.target.value})} />
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 20px" }} onClick={saveWebsite}>💾 Save Hero</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🔗 Social Media</div>
              {["facebook","instagram","youtube","tiktok","whatsapp"].map(s => (
                <div key={s}>
                  <label style={C.label}>{s.charAt(0).toUpperCase()+s.slice(1)}</label>
                  <input style={C.input} value={socialSettings[s]||""} onChange={e => setSocialSettings({...socialSettings,[s]:e.target.value})} />
                </div>
              ))}
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 20px" }} onClick={saveSocial}>💾 Save Links</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📋 Booking Settings</div>
              {[
                ["enableBookings","Enable Bookings"],
                ["autoConfirm","Auto-confirm Bookings"],
                ["requireDeposit","Require Deposit"],
              ].map(([k,lbl]) => (
                <label key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, cursor:"pointer", fontSize:14 }}>
                  <input type="checkbox" checked={bookingSettings[k]} onChange={e => setBookingSettings({...bookingSettings,[k]:e.target.checked})} style={{ width:16,height:16 }} />
                  {lbl}
                </label>
              ))}
              <label style={C.label}>Deposit Percentage</label>
              <input style={C.input} type="number" value={bookingSettings.depositPercentage} onChange={e => setBookingSettings({...bookingSettings, depositPercentage:+e.target.value})} />
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 20px" }} onClick={() => { localStorage.setItem("booking_settings",JSON.stringify(bookingSettings)); notify("Saved!"); }}>💾 Save</button>
            </div>
          </div>
        )}

        {/* ══ SERVICES ══ */}
        {activeTab === "services" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🛠️ Manage Services</div>
              <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                <input style={{ ...C.input }} placeholder="New service name" value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => e.key==="Enter" && addService()} />
                <button style={C.btn("#22c55e")} onClick={addService}>+ Add</button>
              </div>
              {services.map((s,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                  <span>{s}</span>
                  <button style={C.btn("#ef4444")} onClick={() => deleteService(i)}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ COMMISSION ══ */}
        {activeTab === "commission" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>💸 Commission Settings</div>
              <p style={{ fontSize:13, color:muted, marginBottom:16 }}>Configure how revenue is split between couples, the platform, and creators. Total must equal 100%.</p>
              {[
                ["couple","💑 Couple %"],
                ["platform","🏢 NY Platform %"],
                ["creator","🎬 Creator %"],
              ].map(([k,lbl]) => (
                <div key={k}>
                  <label style={C.label}>{lbl} — currently {commission[k]}%</label>
                  <input style={C.input} type="number" min={0} max={100} value={commission[k]}
                    onChange={e => setCommission({...commission,[k]:+e.target.value})} />
                </div>
              ))}
              <div style={{ marginTop:14, padding:"12px 16px", background: (commission.couple+commission.platform+commission.creator)===100?"#dcfce7":"#fee2e2", borderRadius:10 }}>
                <strong>Total: {commission.couple+commission.platform+commission.creator}%</strong>
                <p style={{ fontSize:12, marginTop:4 }}>{(commission.couple+commission.platform+commission.creator)===100?"✅ Valid split":"⚠️ Must total 100%"}</p>
              </div>
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 24px" }} onClick={saveCommission}>💾 Save Commission</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>📊 Example Split</div>
              <p style={{ fontSize:13, color:muted, marginBottom:16 }}>For a booking of 500,000 RWF:</p>
              {[
                ["Couple receives",   Math.round(500000*commission.couple/100).toLocaleString()+" RWF"],
                ["NY Platform gets",  Math.round(500000*commission.platform/100).toLocaleString()+" RWF"],
                ["Creator receives",  Math.round(500000*commission.creator/100).toLocaleString()+" RWF"],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${border}`, fontSize:14 }}>
                  <span style={{ color:muted }}>{k}</span><strong style={{ color:Y }}>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ PROFILE ══ */}
        {activeTab === "profile" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>👤 Admin Profile</div>
              {[["name","Full Name"],["username","Username"],["email","Email"],["phone","Phone"]].map(([k,lbl]) => (
                <div key={k}>
                  <label style={C.label}>{lbl}</label>
                  <input style={C.input} value={adminProfile[k]||""} onChange={e => setAdminProfile({...adminProfile,[k]:e.target.value})} />
                </div>
              ))}
              <label style={C.label}>Bio</label>
              <textarea style={{ ...C.input, minHeight:80, resize:"vertical" }} value={adminProfile.bio||""} onChange={e => setAdminProfile({...adminProfile, bio:e.target.value})} />
              <button style={{ ...C.btn(Y,"#1a1a1a"), marginTop:14, padding:"10px 20px" }} onClick={saveAdminProfile}>💾 Save Profile</button>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🔒 Change Password</div>
              {!showPwForm ? (
                <button style={{ ...C.btn(Y,"#1a1a1a"), padding:"10px 20px" }} onClick={() => setShowPwForm(true)}>Change Password</button>
              ) : (
                <>
                  {[["current","Current Password"],["new","New Password"],["confirm","Confirm Password"]].map(([k,lbl]) => (
                    <div key={k}>
                      <label style={C.label}>{lbl}</label>
                      <input style={C.input} type="password" value={pwData[k]} onChange={e => setPwData({...pwData,[k]:e.target.value})} />
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:8, marginTop:14 }}>
                    <button style={C.btn("#22c55e")} onClick={changePassword}>Update</button>
                    <button style={C.btn("#6b7280")} onClick={() => setShowPwForm(false)}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {activeTab === "settings" && (
          <div style={C.settingsGrid}>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🖥️ System Settings</div>
              <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, cursor:"pointer", fontSize:14 }}>
                <input type="checkbox" checked={maintenance} onChange={toggleMaintenance} style={{ width:16,height:16 }} />
                🔧 Maintenance Mode {maintenance ? "(ON — site hidden)" : "(OFF — site live)"}
              </label>
              <label style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, cursor:"pointer", fontSize:14 }}>
                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} style={{ width:16,height:16 }} />
                🌙 Dark Mode
              </label>
              <div style={{ marginTop:16 }}>
                <button style={{ ...C.btn("#3b82f6"), padding:"10px 20px" }} onClick={exportBackup}>💾 Export Full Backup</button>
              </div>
            </div>
            <div style={C.settingCard}>
              <div style={C.secTitle}>🔐 Admin Credentials</div>
              <p style={{ fontSize:13, color:muted, marginBottom:12 }}>Current admin login:</p>
              <div style={{ background: darkMode?"#2a2a2a":"#f5f5f5", borderRadius:8, padding:"12px 14px", fontSize:13 }}>
                <div><strong>Email:</strong> admin@nyentertainment.com</div>
                <div style={{ marginTop:4 }}><strong>Password:</strong> admin123</div>
                <div style={{ marginTop:4, fontSize:11, color:"#ef4444" }}>⚠️ Change in production!</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ AUDIT LOGS ══ */}
        {activeTab === "audit" && (
          <div style={C.card}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead style={C.tHead}>
                  <tr>{["Time","Admin","Action"].map(h=><th key={h} style={C.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {auditLogs.map(l => (
                    <tr key={l.id}>
                      <td style={{ ...C.td, fontSize:11, color:muted, whiteSpace:"nowrap" }}>{new Date(l.timestamp).toLocaleString()}</td>
                      <td style={C.td}>{l.admin}</td>
                      <td style={C.td}>{l.action}</td>
                    </tr>
                  ))}
                  {auditLogs.length===0 && <tr><td colSpan={3} style={{ ...C.td, textAlign:"center", padding:40, color:muted }}>No logs yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>{/* end main */}

      {/* ══ MODALS ══ */}

      {/* Set Price Modal */}
      {priceModal && (
        <div style={C.modal} onClick={() => setPriceModal(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:8, color:txt }}>💰 Set Agreed Price</h3>
            <p style={{ fontSize:13, color:muted, marginBottom:16 }}>Client: <strong>{priceModal.name||priceModal.clientName}</strong></p>
            <label style={C.label}>Agreed Price (RWF)</label>
            <input style={C.input} type="number" placeholder="e.g. 350000" value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} autoFocus />
            <p style={{ fontSize:12, color:muted, marginTop:6 }}>This price will be shown to the client and used for payment via MTN MoMo / Airtel Money.</p>
            <div style={{ display:"flex", gap:8, marginTop:20 }}>
              <button style={{ ...C.btn("#22c55e"), padding:"10px 20px" }} onClick={() => setBookingPrice(priceModal.id, agreedPrice)}>✅ Confirm Price</button>
              <button style={{ ...C.btn("#6b7280"), padding:"10px 20px" }} onClick={() => setPriceModal(null)}>Cancel</button>
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
              ["Booking ID",   `#${String(selectedBooking.id).slice(-6).toUpperCase()}`],
              ["Client",       selectedBooking.name||selectedBooking.clientName||"—"],
              ["Email",        selectedBooking.email||"—"],
              ["Phone",        selectedBooking.phone||"—"],
              ["Event Type",   selectedBooking.eventType||"Wedding"],
              ["Package",      selectedBooking.package||"—"],
              ["Date",         selectedBooking.date||"—"],
              ["Location",     selectedBooking.location||"—"],
              ["District",     selectedBooking.district||"—"],
              ["Guests",       selectedBooking.guests||"—"],
              ["Status",       selectedBooking.status],
              ["Payment",      selectedBooking.paymentStatus||"awaiting_approval"],
              ["Agreed Price", selectedBooking.agreedPrice ? Number(selectedBooking.agreedPrice).toLocaleString()+" RWF" : "Not set"],
              ["Services",     (selectedBooking.services||[]).join(", ")||"—"],
              ["Notes",        selectedBooking.message||"—"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:12, padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                <span style={{ color:muted, minWidth:100 }}>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20 }}>
              <button style={C.btn("#22c55e")} onClick={() => { updateBookingStatus(selectedBooking.id,"confirmed"); setSelectedBooking(null); }}>✅ Confirm</button>
              <button style={C.btn("#ef4444")} onClick={() => { updateBookingStatus(selectedBooking.id,"rejected"); setSelectedBooking(null); }}>❌ Reject</button>
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
            {[["Name",selectedUser.name],["Email",selectedUser.email],["Role",selectedUser.role],["Status",selectedUser.status||"active"],["Joined",selectedUser.createdAt?new Date(selectedUser.createdAt).toLocaleDateString():"—"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:12, padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                <span style={{ color:muted, minWidth:80 }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <button style={{ ...C.btn("#6b7280"), marginTop:16 }} onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMsg && (
        <div style={C.modal} onClick={() => setSelectedMsg(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>📩 Message</h3>
            <p><strong>From:</strong> {selectedMsg.name}</p>
            <p><strong>Email:</strong> {selectedMsg.email}</p>
            <p><strong>Subject:</strong> {selectedMsg.subject}</p>
            <div style={{ background:darkMode?"#2a2a2a":"#f5f5f5", borderRadius:10, padding:"14px 16px", marginTop:14, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
              {selectedMsg.message}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <a href={`mailto:${selectedMsg.email}`} style={{ textDecoration:"none" }}>
                <button style={{ ...C.btn("#3b82f6"), padding:"8px 16px" }}>📧 Reply</button>
              </a>
              <button style={{ ...C.btn("#6b7280"), padding:"8px 16px" }} onClick={() => setSelectedMsg(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Detail Modal */}
      {selectedVideo && (
        <div style={C.modal} onClick={() => setSelectedVideo(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:16, color:txt }}>🎥 Video Details</h3>
            {[["Title",selectedVideo.title],["Couple",selectedVideo.coupleName],["Event",selectedVideo.eventType],["Creator",selectedVideo.creatorName],["Status",selectedVideo.status||"pending"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:12, padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13 }}>
                <span style={{ color:muted, minWidth:80 }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              {selectedVideo.videoUrl && <button style={C.btn("#3b82f6")} onClick={() => window.open(selectedVideo.videoUrl,"_blank")}>▶ Watch</button>}
              {selectedVideo.status!=="published" && <button style={C.btn("#22c55e")} onClick={() => { approveVideo(selectedVideo.id); setSelectedVideo(null); }}>✅ Approve</button>}
              <button style={C.btn("#6b7280")} onClick={() => setSelectedVideo(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}