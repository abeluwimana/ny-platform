// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { FaBars, FaBell, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

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

  // ── CORE STATE ──────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState("overview");
  const [darkMode,    setDarkMode]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [maintenance, setMaintenance] = useState(false);

  // Check screen size for responsive design
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
  const [comments,      setComments]      = useState([]);
  const [supports,      setSupports]      = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [homepageSettings, setHomepageSettings] = useState({
    heroTitle: "NY Entertainment Rwanda",
    heroSubtitle: "Capturing Life's Most Important Moments",
    featuredVideos: [],
    featuredCouples: [],
    featuredCreators: [],
    statistics: { events: "500+", clients: "200+", views: "100K+", creators: "50+" },
    testimonials: []
  });

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
  const [newService,   setNewService]   = useState("");
  const [newPromo,     setNewPromo]     = useState({ code: "", discount: "", expiry: "", usageLimit: "" });
  const [broadcastMsg, setBroadcastMsg] = useState({ title: "", message: "", target: "all" });
  const [showPwForm,   setShowPwForm]   = useState(false);
  const [pwData,       setPwData]       = useState({ current: "", new: "", confirm: "" });
  const [agreedPrice,  setAgreedPrice]  = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");
  const [reportDateRange, setReportDateRange] = useState({ start: "", end: "" });
  const [loginActivity, setLoginActivity] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0,
    revenue: 0, coupleRevenue: 0, platformRevenue: 0,
    totalUsers: 0, clients: 0, creators: 0, couples: 0,
    totalVideos: 0, pendingVideos: 0, publishedVideos: 0,
    totalPosts: 0, totalGalleries: 0, totalComments: 0,
    unreadMsgs: 0, subscriptions: 0, pendingCreators: 0,
    pendingReports: 0, totalSupporters: 0, totalSupportedCouples: 0,
  });

  // ── AUTHENTICATION CHECK ────────────────────────────────────────
  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        // Verify token is valid by calling /me endpoint
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const data = await response.json();
        
        // Check if user is admin
        if (data.user.role !== 'ADMIN') {
          throw new Error('Not an admin');
        }

        // Update admin profile with real data
        setAdminProfile({
          name: data.user.name || "Admin User",
          email: data.user.email || "",
          phone: data.user.phone || "",
          username: data.user.username || "admin_ny",
          bio: data.user.bio || "Platform administrator",
        });

        // Load all data
        loadAll();
        
        // Load dark mode preference
        const dm = localStorage.getItem("darkMode") === "true";
        setDarkMode(dm);
        if (dm) document.body.style.background = "#111";
        
        loadLoginActivity();
        loadAdminNotifications();
        
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        localStorage.removeItem('admin_logged_in');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  const loadAdminNotifications = () => {
    const stored = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setAdminNotifications(stored);
    const unread = stored.filter(n => !n.read).length;
    setAdminUnreadCount(unread);
  };

  const addAdminNotification = (title, message, type = "info") => {
    const newNotif = { id: Date.now(), title, message, type, read: false, time: new Date().toISOString() };
    const updated = [newNotif, ...adminNotifications.slice(0, 49)];
    setAdminNotifications(updated);
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
    setAdminUnreadCount(prev => prev + 1);
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
    const unread = updated.filter(n => !n.read).length;
    setAdminUnreadCount(unread);
    notify("Notification deleted");
  };

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
    setComments(JSON.parse(localStorage.getItem("wedding_comments") || "[]"));
    setSupports(JSON.parse(localStorage.getItem("video_supports") || "[]"));
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
    const savedHomepage = JSON.parse(localStorage.getItem("homepage_settings") || "{}");
    if (Object.keys(savedHomepage).length) setHomepageSettings(savedHomepage);
    
    // Update stats
    updateStats();
  };

  const updateStats = () => {
    setStats({
      totalBookings: bookings.length,
      pending: bookings.filter(b => b.status === "pending").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      completed: bookings.filter(b => b.status === "completed").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
      revenue: supports.reduce((sum, s) => sum + s.amount, 0),
      coupleRevenue: supports.reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0),
      platformRevenue: supports.reduce((sum, s) => sum + (s.platformEarning || s.amount * 0.4), 0),
      totalUsers: users.length,
      clients: users.filter(u => u.role === "client").length,
      creators: users.filter(u => u.role === "creator").length,
      couples: couples.length,
      totalVideos: videos.length,
      pendingVideos: videos.filter(v => v.status === "pending").length,
      publishedVideos: videos.filter(v => v.status === "published").length,
      totalPosts: posts.length,
      totalGalleries: gallery.length,
      totalComments: comments.length,
      unreadMsgs: messages.filter(m => m.status === "unread").length,
      subscriptions: subscriptions.length,
      pendingCreators: pendingCreators.length,
      pendingReports: reports.filter(r => r.status === "pending").length,
      totalSupporters: [...new Set(supports.map(s => s.userEmail))].length,
      totalSupportedCouples: [...new Set(supports.map(s => s.coupleId))].length,
    });
  };

  // Update stats whenever data changes
  useEffect(() => {
    updateStats();
  }, [bookings, users, couples, messages, videos, posts, gallery, subscriptions, reports, comments, supports, pendingCreators]);

  const loadLoginActivity = () => {
    const activities = JSON.parse(localStorage.getItem("login_activity") || "[]");
    setLoginActivity(activities);
  };

  const log = (action) => {
    const entry = { id: Date.now(), action, admin: adminProfile.name, timestamp: new Date().toISOString() };
    const updated = [entry, ...auditLogs.slice(0, 99)];
    setAuditLogs(updated);
    localStorage.setItem("audit_logs", JSON.stringify(updated));
    addAdminNotification("Audit Log", action, "info");
  };

  // ── BOOKING ACTIONS ─────────────────────────────────────────────
  const updateBookingStatus = (id, status) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    setBookings(updated);
    localStorage.setItem("wedding_bookings", JSON.stringify(updated));
    log(`Booking #${id} → ${status}`);
    notify(`Booking ${status}!`);
  };

  const assignCreatorToBooking = (bookingId, creatorEmail) => {
    if (!creatorEmail) { notify("Select a creator", "error"); return; }
    const updated = bookings.map(b => b.id === bookingId ? { ...b, assignedCreator: creatorEmail, status: "assigned" } : b);
    setBookings(updated);
    localStorage.setItem("wedding_bookings", JSON.stringify(updated));
    
    const creator = users.find(u => u.email === creatorEmail);
    if (creator) {
      const creatorNotifs = JSON.parse(localStorage.getItem("creator_notifications") || "[]");
      creatorNotifs.unshift({
        id: Date.now(),
        title: "New Project Assigned",
        message: `You have been assigned to a new project.`,
        type: "assignment",
        read: false,
        time: new Date().toISOString()
      });
      localStorage.setItem("creator_notifications", JSON.stringify(creatorNotifs.slice(0, 50)));
    }
    
    setAssignCreatorModal(null);
    setSelectedCreator("");
    log(`Assigned creator ${creatorEmail} to booking #${bookingId}`);
    notify("Creator assigned successfully!");
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

  const exportCSV = (type = "bookings") => {
    let data, headers;
    if (type === "bookings") {
      headers = ["ID","Name","Email","Phone","Event","Package","Date","Status","Payment","Price"];
      data = bookings.map(b => [b.id, b.name||b.clientName, b.email, b.phone, b.eventType, b.package, b.date, b.status, b.paymentStatus, b.agreedPrice||"Negotiable"]);
    } else if (type === "revenue") {
      headers = ["Date","Type","Amount","Couple Share (60%)","Platform Share (40%)","Status"];
      data = supports.map(s => [new Date(s.date).toLocaleDateString(), "Support", s.amount, (s.coupleEarning || s.amount * 0.6).toLocaleString(), (s.platformEarning || s.amount * 0.4).toLocaleString(), "Completed"]);
    } else {
      headers = ["ID","Name","Email","Role","Joined"];
      data = users.map(u => [u.id, u.name, u.email, u.role, u.createdAt]);
    }
    const rows = [headers, ...data];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${type}_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    log(`Exported ${type} CSV`);
    notify(`${type} exported!`);
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

  const verifyUser = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, verified: true } : u);
    setUsers(updated);
    localStorage.setItem("wedding_users", JSON.stringify(updated));
    log(`Verified user #${id}`);
    notify("User verified!");
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

  // ── COUPLE ACTIONS ──────────────────────────────────────────────
  const approveCouple = (id) => {
    const updated = couples.map(c => c.id === id ? { ...c, status: "approved" } : c);
    setCouples(updated);
    localStorage.setItem("wedding_couples", JSON.stringify(updated));
    log(`Approved couple #${id}`);
    notify("Couple approved!");
  };

  const viewCoupleEarnings = (coupleId) => {
    const coupleEarnings = supports.filter(s => s.coupleId === coupleId);
    const total = coupleEarnings.reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0);
    notify(`Total earnings (60% of supports): ${total.toLocaleString()} RWF`, "info");
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
  
  const featureVideo = (id) => {
    const updated = videos.map(v => v.id === id ? { ...v, featured: !v.featured } : v);
    setVideos(updated); localStorage.setItem("creator_videos", JSON.stringify(updated));
    log(`Toggled featured video #${id}`);
    notify(videos.find(v => v.id === id)?.featured ? "Video unfeatured" : "Video featured!");
  };
  
  const deleteVideo = (id) => {
    if (!window.confirm("Delete video?")) return;
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated); localStorage.setItem("creator_videos", JSON.stringify(updated));
    log(`Deleted video #${id}`); notify("Video deleted", "error");
  };

  // ── GALLERY ACTIONS ─────────────────────────────────────────────
  const approveGallery = (id) => {
    const updated = gallery.map(g => g.id === id ? { ...g, status: "approved" } : g);
    setGallery(updated); localStorage.setItem("platform_gallery", JSON.stringify(updated));
    log(`Approved gallery #${id}`); notify("Gallery approved!");
  };
  
  const deleteGallery = (id) => {
    if (!window.confirm("Delete gallery?")) return;
    const updated = gallery.filter(g => g.id !== id);
    setGallery(updated); localStorage.setItem("platform_gallery", JSON.stringify(updated));
    log(`Deleted gallery #${id}`); notify("Gallery deleted", "error");
  };

  // ── COMMENT ACTIONS ─────────────────────────────────────────────
  const deleteComment = (id) => {
    if (!window.confirm("Delete comment?")) return;
    const updated = comments.filter(c => c.id !== id);
    setComments(updated); localStorage.setItem("wedding_comments", JSON.stringify(updated));
    log(`Deleted comment #${id}`); notify("Comment deleted", "error");
  };
  
  const blockSpam = (userId) => {
    const updated = users.map(u => u.id === userId ? { ...u, status: "blocked", reason: "Spam" } : u);
    setUsers(updated); localStorage.setItem("wedding_users", JSON.stringify(updated));
    log(`Blocked user #${userId} for spam`); notify("User blocked for spam", "error");
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
  const approvePost = (id) => {
    const updated = posts.map(p => p.id === id ? { ...p, status: "approved" } : p);
    setPosts(updated); localStorage.setItem("platform_posts", JSON.stringify(updated));
    log(`Approved post #${id}`); notify("Post approved!");
  };
  
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

  // ── HOMEPAGE MANAGEMENT ─────────────────────────────────────────
  const updateHomepageHero = () => {
    localStorage.setItem("homepage_settings", JSON.stringify(homepageSettings));
    log("Updated homepage hero section");
    notify("Homepage hero updated!");
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
    
    let targetUsers = [];
    if (broadcastMsg.target === "all") targetUsers = users;
    else if (broadcastMsg.target === "clients") targetUsers = users.filter(u => u.role === "client");
    else if (broadcastMsg.target === "creators") targetUsers = users.filter(u => u.role === "creator");
    else if (broadcastMsg.target === "couples") targetUsers = users.filter(u => u.role === "couple");
    
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
    const data = { bookings, users, couples, messages, videos, posts, promoCodes, websiteSettings, homepageSettings };
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

  // ── THEME VARS ──────────────────────────────────────────────────
  const bg       = darkMode ? "#111"    : "#f5f5f5";
  const cardBg   = darkMode ? "#1e1e1e" : "#fff";
  const txt      = darkMode ? "#f0f0f0" : "#1a1a1a";
  const muted    = darkMode ? "#aaa"    : "#666";
  const border   = darkMode ? "#333"    : "#e8e8e8";
  const Ycolor   = "#ffc107";
  const inputBg  = darkMode ? "#2a2a2a" : "#fff";

  // ── REUSABLE STYLES (Responsive) ────────────────────────────────
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
    overlay:   { 
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
      background: "rgba(0,0,0,0.5)", zIndex: 999, display: isMobile && mobileSidebarOpen ? "block" : "none" 
    },
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
    const map = {
      confirmed: ["#dcfce7","#15803d"], pending: ["#fef9c3","#854d0e"],
      rejected:  ["#fee2e2","#b91c1c"], completed: ["#dbeafe","#1d4ed8"],
      active:    ["#dcfce7","#15803d"], blocked:   ["#fee2e2","#b91c1c"],
      published: ["#dcfce7","#15803d"], draft:     ["#f3f4f6","#6b7280"],
      approved:  ["#dcfce7","#15803d"], assigned:  ["#dbeafe","#1d4ed8"],
      cancelled: ["#fee2e2","#b91c1c"], in_progress: ["#fef9c3","#854d0e"]
    };
    const [bg2, c] = map[s] || ["#f3f4f6","#6b7280"];
    return <span style={C.badge(bg2, c)}>{s}</span>;
  };

  const filteredBookings = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => !search || (b.name||b.clientName||"").toLowerCase().includes(search.toLowerCase()) || (b.email||"").toLowerCase().includes(search.toLowerCase()));

  const allCreators = users.filter(u => u.role === "creator" && u.status === "active");

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: bg 
      }}>
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
              localStorage.removeItem('admin_logged_in');
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
                  const existing = acc.find(a => a.userEmail === s.userEmail);
                  if (existing) existing.amount += s.amount;
                  else acc.push({ userEmail: s.userEmail, userName: s.userName, amount: s.amount });
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
                        <td style={C.td}>{new Date(s.date).toLocaleDateString()}</td>
                        <td style={C.td}>{s.userName || s.userEmail}</td>
                        <td style={C.td}>{s.coupleName}</td>
                        <td style={C.td}><strong>{s.amount.toLocaleString()} RWF</strong></td>
                        <td style={C.td} style={{ color: "#22c55e", fontWeight: 600 }}>{(s.coupleEarning || s.amount * 0.6).toLocaleString()} RWF</td>
                        <td style={C.td} style={{ color: Ycolor, fontWeight: 600 }}>{(s.platformEarning || s.amount * 0.4).toLocaleString()} RWF</td>
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
                      <td style={C.td}>{u.name}</td>
                      <td style={C.td}>{u.email}</td>
                      <td style={C.td}>
                        <select 
                          value={u.role} 
                          onChange={(e) => changeRole(u.id, e.target.value)} 
                          style={{ ...C.input, padding: "4px 8px", fontSize: 12, width: "auto" }}
                        >
                          <option value="client">Client</option>
                          <option value="creator">Creator</option>
                          <option value="couple">Couple</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={C.td}>{statusBadge(u.status || "active")}</td>
                      <td style={C.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button style={C.btn(u.status === "blocked" ? "#22c55e" : "#ef4444")} onClick={() => toggleBlock(u.id)}>
                            {u.status === "blocked" ? "Unblock" : "Block"}
                          </button>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedUser(u)}>View</button>
                          <button style={C.btn("#ef4444")} onClick={() => deleteUser(u.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ BOOKINGS TAB ══ */}
        {activeTab === "bookings" && (
          <>
            <div style={C.filterRow}>
              {["all","pending","confirmed","completed","cancelled"].map(s => (
                <button key={s} style={C.filterBtn(filter === s)} onClick={() => setFilter(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
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
                        <td style={C.td}>{b.name || b.clientName || "—"}</td>
                        <td style={C.td}>{b.email || "—"}</td>
                        <td style={C.td}>{b.eventType || "Wedding"}</td>
                        <td style={C.td}>{b.date || "—"}</td>
                        <td style={C.td}>{b.package || "—"}</td>
                        <td style={C.td}>{statusBadge(b.status)}</td>
                        <td style={C.td}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <button style={C.btn("#3b82f6")} onClick={() => setSelectedBooking(b)}>View</button>
                            {b.status === "pending" && (
                              <>
                                <button style={C.btn("#22c55e")} onClick={() => updateBookingStatus(b.id, "confirmed")}>✅ Confirm</button>
                                <button style={C.btn("#ef4444")} onClick={() => updateBookingStatus(b.id, "cancelled")}>❌ Cancel</button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <button style={C.btn("#f59e0b")} onClick={() => setPriceModal(b)}>💰 Set Price</button>
                            )}
                            {b.status === "confirmed" && (
                              <button style={C.btn("#8b5cf6")} onClick={() => setAssignCreatorModal(b)}>👤 Assign</button>
                            )}
                            {b.status === "in_progress" && (
                              <button style={C.btn("#22c55e")} onClick={() => updateBookingStatus(b.id, "completed")}>✅ Complete</button>
                            )}
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
                        <td style={C.td}>{c.name}</td>
                        <td style={C.td}>{c.email}</td>
                        <td style={C.td}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                        <td style={C.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={C.btn("#22c55e")} onClick={() => approveCreator(c.id)}>✓ Approve</button>
                            <button style={C.btn("#ef4444")} onClick={() => rejectCreator(c.id)}>✗ Reject</button>
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
                      <td style={C.td}>{v.title}</td>
                      <td style={C.td}>{v.creatorName || "—"}</td>
                      <td style={C.td}>{v.coupleName || "—"}</td>
                      <td style={C.td}>{statusBadge(v.status)}</td>
                      <td style={C.td}>{v.views || 0}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedVideo(v)}>View</button>
                          {v.status === "pending" && (
                            <>
                              <button style={C.btn("#22c55e")} onClick={() => approveVideo(v.id)}>Approve</button>
                              <button style={C.btn("#ef4444")} onClick={() => rejectVideo(v.id)}>Reject</button>
                            </>
                          )}
                          <button style={C.btn(v.featured ? "#6b7280" : "#f59e0b")} onClick={() => featureVideo(v.id)}>
                            {v.featured ? "Unfeature" : "Feature"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  {paymentsData && paymentsData.length > 0 ? paymentsData.map(p => (
                    <tr key={p.id}>
                      <td style={C.td}>#{p.id}</td>
                      <td style={C.td}>{p.user?.name || "—"}</td>
                      <td style={C.td}>{p.amount?.toLocaleString() || 0} RWF</td>
                      <td style={C.td}>{p.type || "Payment"}</td>
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
                      <td style={C.td}>{p.title}</td>
                      <td style={C.td}>{p.author || "—"}</td>
                      <td style={C.td}>{statusBadge(p.status || "draft")}</td>
                      <td style={C.td}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={C.btn("#22c55e")} onClick={() => approvePost(p.id)}>Approve</button>
                          <button style={C.btn("#f59e0b")} onClick={() => togglePin(p.id)}>📌</button>
                          <button style={C.btn("#ef4444")} onClick={() => deletePost(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                      <td style={C.td}>{c.name || `${c.groomName} & ${c.brideName}`}</td>
                      <td style={C.td}>{c.email || "—"}</td>
                      <td style={C.td}>{c.weddingDate || "—"}</td>
                      <td style={C.td}>{statusBadge(c.status || "pending")}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {c.status !== "approved" && (
                            <button style={C.btn("#22c55e")} onClick={() => approveCouple(c.id)}>Approve</button>
                          )}
                          <button style={C.btn("#3b82f6")} onClick={() => viewCoupleEarnings(c.id)}>💰 Earnings</button>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedCouple(c)}>View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                      <td style={C.td}>{g.title}</td>
                      <td style={C.td}>{g.coupleName || "—"}</td>
                      <td style={C.td}>{statusBadge(g.status || "pending")}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {g.status !== "approved" && (
                            <button style={C.btn("#22c55e")} onClick={() => approveGallery(g.id)}>Approve</button>
                          )}
                          <button style={C.btn("#ef4444")} onClick={() => deleteGallery(g.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                      <td style={C.td}>{c.userName || "—"}</td>
                      <td style={C.td} style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.content || c.text}
                      </td>
                      <td style={C.td}>{c.postTitle || "—"}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={C.btn("#ef4444")} onClick={() => deleteComment(c.id)}>Delete</button>
                          <button style={C.btn("#ef4444")} onClick={() => blockSpam(c.userId)}>Block User</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                      <td style={C.td}>{statusBadge(m.status || "unread")}</td>
                      <td style={C.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={C.btn("#3b82f6")} onClick={() => setSelectedMsg(m)}>View</button>
                          {m.status !== "read" && (
                            <button style={C.btn("#22c55e")} onClick={() => markRead(m.id)}>Mark Read</button>
                          )}
                          <button style={C.btn("#ef4444")} onClick={() => deleteMsg(m.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

        {/* Additional tabs not shown but follow same pattern */}

      </div>{/* end main */}

      {/* ══ MODALS ══ */}

      {/* Set Price Modal */}
      {priceModal && (
        <div style={C.modal} onClick={() => setPriceModal(null)}>
          <div style={C.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:8, color:txt }}>💰 Set Agreed Price</h3>
            <p style={{ fontSize:13, color:muted, marginBottom:16 }}>Client: <strong>{priceModal.name || priceModal.clientName}</strong></p>
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
            <p style={{ fontSize:13, color:muted, marginBottom:16 }}>Booking: <strong>{assignCreatorModal.name || assignCreatorModal.clientName}</strong></p>
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
              ["Client", selectedBooking.name || selectedBooking.clientName || "—"],
              ["Email", selectedBooking.email || "—"],
              ["Phone", selectedBooking.phone || "—"],
              ["Event Type", selectedBooking.eventType || "Wedding"],
              ["Package", selectedBooking.package || "—"],
              ["Date", selectedBooking.date || "—"],
              ["Status", statusBadge(selectedBooking.status)],
              ["Payment", selectedBooking.paymentStatus || "awaiting_approval"],
              ["Agreed Price", selectedBooking.agreedPrice ? Number(selectedBooking.agreedPrice).toLocaleString() + " RWF" : "Not set"],
              ["Assigned Creator", selectedBooking.assignedCreator || "Not assigned"],
              ["Notes", selectedBooking.message || "—"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13, flexWrap:"wrap", gap:"8px" }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              {selectedBooking.status === "pending" && (
                <>
                  <button style={C.btn("#22c55e")} onClick={() => { updateBookingStatus(selectedBooking.id, "confirmed"); setSelectedBooking(null); }}>✅ Confirm</button>
                  <button style={C.btn("#ef4444")} onClick={() => { updateBookingStatus(selectedBooking.id, "cancelled"); setSelectedBooking(null); }}>❌ Cancel</button>
                </>
              )}
              {selectedBooking.status === "confirmed" && (
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
              ["Name", selectedUser.name],
              ["Email", selectedUser.email],
              ["Role", selectedUser.role],
              ["Status", selectedUser.status || "active"],
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
            <p><strong>From:</strong> {selectedMsg.name}</p>
            <p><strong>Email:</strong> {selectedMsg.email}</p>
            <p><strong>Subject:</strong> {selectedMsg.subject}</p>
            <div style={{ background:darkMode?"#2a2a2a":"#f5f5f5", borderRadius:10, padding:"14px 16px", marginTop:14, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
              {selectedMsg.message}
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
              ["Title", selectedVideo.title],
              ["Couple", selectedVideo.coupleName || "—"],
              ["Event", selectedVideo.eventType || "—"],
              ["Creator", selectedVideo.creatorName || "—"],
              ["Views", selectedVideo.views || 0],
              ["Likes", selectedVideo.likes || 0],
              ["Status", statusBadge(selectedVideo.status || "pending")]
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}`, fontSize:13, flexWrap:"wrap", gap:"8px" }}>
                <span style={{ color:muted }}>{k}</span><strong>{v}</strong>
              </div>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:20, flexDirection: isMobile ? "column" : "row" }}>
              {selectedVideo.videoUrl && (
                <button style={{ ...C.btn("#3b82f6"), flex:1 }} onClick={() => window.open(selectedVideo.videoUrl, "_blank")}>▶ Watch</button>
              )}
              {selectedVideo.status !== "published" && selectedVideo.status !== "approved" && (
                <button style={{ ...C.btn("#22c55e"), flex:1 }} onClick={() => { approveVideo(selectedVideo.id); setSelectedVideo(null); }}>✅ Approve</button>
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
              ["Name", selectedCouple.name || `${selectedCouple.groomName} & ${selectedCouple.brideName}`],
              ["Email", selectedCouple.email || "—"],
              ["Phone", selectedCouple.phone || "—"],
              ["Wedding Date", selectedCouple.weddingDate || "—"],
              ["Location", selectedCouple.location || "—"],
              ["Status", statusBadge(selectedCouple.status || "pending")]
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

    </div>
  );
}