// src/pages/ClientDashboard.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCheck,
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaHourglassHalf,
  FaTimes,
  FaTimesCircle,
  FaTrash
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

// ── inline toast ──
const showNotification = {
  success: (msg) => {
    const el = document.createElement("div");
    el.textContent = "✅  " + msg;
    Object.assign(el.style, {
      position:"fixed", bottom:"24px", right:"24px", zIndex:9999,
      background:"#1a1a1a", color:"#fff", padding:"12px 20px",
      borderRadius:"10px", fontSize:"14px", fontWeight:"600",
      boxShadow:"0 4px 16px rgba(0,0,0,0.2)",
      borderLeft:"4px solid #ffc107",
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  },
  error: (msg) => {
    const el = document.createElement("div");
    el.textContent = "❌  " + msg;
    Object.assign(el.style, {
      position:"fixed", bottom:"24px", right:"24px", zIndex:9999,
      background:"#1a1a1a", color:"#fff", padding:"12px 20px",
      borderRadius:"10px", fontSize:"14px", fontWeight:"600",
      boxShadow:"0 4px 16px rgba(0,0,0,0.2)",
      borderLeft:"4px solid #ef4444",
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  },
};

function ClientDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [paymentStatus, setPaymentStatus] = useState({ totalPaid: 0, pendingAmount: 0, lastPayment: null });
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingProgress, setEditingProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Support History States
  const [supportHistory, setSupportHistory] = useState([]);
  const [totalSupportGiven, setTotalSupportGiven] = useState(0);

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
    const token = localStorage.getItem("token");
    const loggedIn = localStorage.getItem("user_logged_in");
    if (!token || !loggedIn) { 
      window.location.href = "/login"; 
      return; 
    }
    loadUserData();
    fetchBookings();
    loadFavorites();
    fetchNotifications();
    fetchSupportHistory();
  }, []);

  const loadUserData = () => {
    setUser({
      email: localStorage.getItem("user_email"),
      name:  localStorage.getItem("user_name"),
      role:  localStorage.getItem("user_role"),
    });
  };

  // ─── FETCH BOOKINGS FROM BACKEND ────────────────────────────────
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Bookings request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings || []);
        calculatePaymentStatus(data.bookings || []);
        setLoading(false);
        return;
      }

      throw new Error(data.message || 'Bookings request returned an unsuccessful response');
    } catch (err) {
      console.error("Error fetching bookings:", err);
      loadBookingsFromLocalStorage();
    }
  };

  const loadBookingsFromLocalStorage = () => {
    const userEmail = localStorage.getItem("user_email");
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const myBookings = allBookings.filter(b => b.email === userEmail || b.userId === userEmail);
    myBookings.sort((a, b) => b.id - a.id);
    setBookings(myBookings);
    calculatePaymentStatus(myBookings);
    setEditingProgress(Math.floor(Math.random() * 100));
    setLoading(false);
  };

  const calculatePaymentStatus = (bookingsList) => {
    const confirmed = bookingsList.filter(b => b.status === "confirmed" || b.status === "CONFIRMED");
    const totalPaid = confirmed.reduce((s, b) => s + (b.totalAmount || b.price || 0), 0);
    const pendingAmount = bookingsList.filter(b => b.status === "pending" || b.status === "PENDING").reduce((s, b) => s + (b.totalAmount || b.price || 0), 0);
    setPaymentStatus({ 
      totalPaid, 
      pendingAmount, 
      lastPayment: confirmed[0]?.date || null 
    });
  };

  // ─── FETCH SUPPORT HISTORY ───────────────────────────────────────
  const fetchSupportHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/support/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Support history request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const history = data.supports.map(support => ({
          id: support.id,
          coupleId: support.coupleId,
          coupleName: support.couple?.user?.name || support.coupleName || "Couple",
          amount: support.amount,
          coupleAmount: support.coupleAmount,
          platformAmount: support.platformAmount,
          paymentMethod: support.paymentMethod || "MTN_MOMO",
          date: support.createdAt,
          videoId: support.videoId
        }));
        setSupportHistory(history);
        const total = history.reduce((sum, s) => sum + s.amount, 0);
        setTotalSupportGiven(total);
        return;
      }

      throw new Error(data.message || 'Support history request returned an unsuccessful response');
    } catch (err) {
      console.error("Error fetching support history:", err);
      loadSupportFromLocalStorage();
    }
  };

  const loadSupportFromLocalStorage = () => {
    const allSupports = JSON.parse(localStorage.getItem("video_supports") || "[]");
    const userEmail = localStorage.getItem("user_email");
    const mySupports = allSupports.filter(s => s.userEmail === userEmail);
    
    const history = mySupports.map(support => ({
      id: support.id,
      coupleId: support.coupleId,
      coupleName: support.coupleName,
      amount: support.amount,
      coupleAmount: support.coupleEarning || support.amount * 0.6,
      platformAmount: support.platformEarning || support.amount * 0.4,
      paymentMethod: support.paymentMethod,
      date: support.date,
      videoId: support.videoId
    }));
    
    setSupportHistory(history);
    const total = history.reduce((sum, s) => sum + s.amount, 0);
    setTotalSupportGiven(total);
  };

  // ─── FETCH NOTIFICATIONS ────────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          const unread = data.notifications.filter(n => !n.read).length;
          setUnreadCount(unread);
          return;
        }
      }
      
      // Fallback to localStorage
      loadNotificationsFromLocalStorage();
    } catch (err) {
      console.error("Error fetching notifications:", err);
      loadNotificationsFromLocalStorage();
    }
  };

  const loadNotificationsFromLocalStorage = () => {
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const userEmail = localStorage.getItem("user_email");
    const myNotifications = allNotifications.filter(n => n.userEmail === userEmail || !n.userEmail);
    setNotifications(myNotifications);
    const unread = myNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  // ─── MARK NOTIFICATION AS READ ──────────────────────────────────
  const markNotificationAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
    
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
    showNotification.success(t('clientDashboard.markedAsRead'));
  };

  // ─── MARK ALL AS READ ────────────────────────────────────────────
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error marking all notifications read:", err);
    }
    
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.map(n => ({ ...n, read: true }));
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    setUnreadCount(0);
    showNotification.success(t('clientDashboard.allMarkedRead'));
  };

  // ─── DELETE NOTIFICATION ────────────────────────────────────────
  const deleteNotification = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/${notifId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
    
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.filter(n => n.id !== notifId);
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
    showNotification.success(t('clientDashboard.notificationDeleted'));
  };

  // ─── EDIT BOOKING ────────────────────────────────────────────────
  const handleEdit = (booking) => {
    setEditingBooking(booking.id);
    setEditForm({ 
      date: booking.date || booking.eventDate, 
      package: booking.package, 
      message: booking.message || "" 
    });
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const saveEdit = (bookingId) => {
    const updated = bookings.map(b =>
      b.id === bookingId
        ? { ...b, date: editForm.date, package: editForm.package, message: editForm.message, updatedAt: new Date().toISOString() }
        : b
    );
    const userEmail = localStorage.getItem("user_email");
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const others = allBookings.filter(b => b.email !== userEmail && b.userId !== userEmail);
    localStorage.setItem("wedding_bookings", JSON.stringify([...others, ...updated]));
    setBookings(updated);
    setEditingBooking(null);
    showNotification.success(t('clientDashboard.bookingUpdated'));
  };

  // ─── CANCEL BOOKING ──────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm(t('myBookings.cancelConfirm'))) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification.success(t('myBookings.cancelled'));
          fetchBookings(); // Refresh bookings
          return;
        }
      }
      
      // Fallback to localStorage
      cancelBookingLocalStorage(id);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      cancelBookingLocalStorage(id);
    }
  };

  const cancelBookingLocalStorage = (id) => {
    const updated = bookings.filter(b => b.id !== id);
    const userEmail = localStorage.getItem("user_email");
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const others = allBookings.filter(b => b.email !== userEmail && b.userId !== userEmail);
    localStorage.setItem("wedding_bookings", JSON.stringify([...others, ...updated]));
    setBookings(updated);
    showNotification.success(t('myBookings.cancelled'));
  };

  // ─── LOAD FAVORITES ──────────────────────────────────────────────
  const loadFavorites = () => {
    setFavorites(JSON.parse(localStorage.getItem("client_favorites") || "[]"));
  };

  // ─── HELPERS ──────────────────────────────────────────────────────
  const getStatusIcon = (s) => {
    const status = s?.toUpperCase() || 'PENDING';
    return status === "CONFIRMED" ? <FaCheckCircle style={{ color: "#22c55e" }} /> :
           status === "REJECTED" || status === "CANCELLED" ? <FaTimesCircle style={{ color: "#ef4444" }} /> :
           <FaHourglassHalf style={{ color: "#ffc107" }} />;
  };

  const getStatusText = (s) => {
    const status = s?.toUpperCase() || 'PENDING';
    return status === "CONFIRMED" ? t('myBookings.confirmed') : 
           status === "REJECTED" || status === "CANCELLED" ? t('myBookings.cancelled') : 
           t('myBookings.pending');
  };

  const getProgressStage = () => {
    const p = editingProgress;
    return p < 20 ? t('clientDashboard.bookingConfirmed') :
           p < 50 ? t('clientDashboard.shootingDay') :
           p < 80 ? t('clientDashboard.editingProgress') : 
           t('clientDashboard.readyForDelivery');
  };

  const statusStyle = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    return {
      ...S.statusBadge,
      background: s === "CONFIRMED" ? "#dcfce7" : 
                  s === "REJECTED" || s === "CANCELLED" ? "#fee2e2" : "#fef9c3",
      color:      s === "CONFIRMED" ? "#15803d" : 
                  s === "REJECTED" || s === "CANCELLED" ? "#b91c1c" : "#854d0e",
    };
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date + "T00:00:00").toLocaleDateString("en-RW", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  const formatPrice = (amount) => {
    if (!amount) return "—";
    return Number(amount).toLocaleString() + " RWF";
  };

  if (loading) {
    return (
      <div style={S.loading}>
        <div style={S.spinner}></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const TABS = [
    { id: "bookings",      label: "📋 " + t('clientDashboard.myBookings') },
    { id: "support",       label: "❤️ " + t('clientDashboard.mySupport') },
    { id: "timeline",      label: "⏱️ " + t('clientDashboard.timeline') },
    { id: "payments",      label: "💳 " + t('clientDashboard.payments') },
    { id: "favorites",     label: "❤️ " + t('clientDashboard.favorites') },
    { id: "notifications", label: `🔔 ${t('clientDashboard.notificationsTitle')}${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
  ];

  return (
    <div style={S.page}>
      {/* Responsive Header */}
      <div style={{ ...S.header, flexDirection: isMobile ? "column" : "row" }}>
        <div>
          <h1 style={S.title}>{t('clientDashboard.title')}</h1>
          <p style={S.subtitle}>{t('clientDashboard.welcome')}, <strong>{user?.name}</strong>! {t('clientDashboard.manage')}</p>
        </div>
        <Link to="/booking">
          <button style={{ ...S.newBookingBtn, width: isMobile ? "100%" : "auto" }}>{t('clientDashboard.newBooking')}</button>
        </Link>
      </div>

      {/* Responsive Stats Grid */}
      <div style={{ ...S.statsGrid, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {[
          { icon: "📋", value: bookings.length, label: t('clientDashboard.totalBookings') },
          { icon: "⏳", value: bookings.filter(b => b.status === "pending" || b.status === "PENDING").length, label: t('clientDashboard.pending') },
          { icon: "✅", value: bookings.filter(b => b.status === "confirmed" || b.status === "CONFIRMED").length, label: t('clientDashboard.confirmed') },
          { icon: "💰", value: formatPrice(paymentStatus.totalPaid), label: t('clientDashboard.totalPaid') },
          { icon: "❤️", value: formatPrice(totalSupportGiven), label: t('clientDashboard.totalSupportGiven') },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <div style={S.statIcon}>{s.icon}</div>
            <div>
              <div style={{ ...S.statValue, fontSize: isMobile ? "18px" : "22px" }}>{s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Responsive Tabs */}
      <div style={{ ...S.tabs, overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              ...(activeTab === t.id ? S.activeTab : S.tab),
              whiteSpace: "nowrap",
              fontSize: isMobile ? "12px" : "13px",
              padding: isMobile ? "8px 14px" : "9px 16px"
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BOOKINGS ── */}
      {activeTab === "bookings" && (
        <div style={S.section}>
          {bookings.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📅</div>
              <h3 style={{ marginBottom: 8, color: "#1a1a1a" }}>{t('myBookings.noBookings')}</h3>
              <p style={{ color: "#888", marginBottom: 20 }}>{t('myBookings.noBookingsDesc')}</p>
              <Link to="/booking"><button style={S.newBookingBtn}>{t('myBookings.bookNow')}</button></Link>
            </div>
          ) : (
            <div style={{ ...S.grid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {bookings.map(b => (
                <div key={b.id} style={S.card}>
                  <div style={{ ...S.cardHead, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "8px" : "0", alignItems: isMobile ? "flex-start" : "center" }}>
                    <span style={S.cardId}>#{String(b.id).slice(-6)}</span>
                    <span style={statusStyle(b.status)}>
                      {getStatusIcon(b.status)} {getStatusText(b.status)}
                    </span>
                  </div>

                  {editingBooking === b.id ? (
                    <div style={S.editForm}>
                      <label style={S.editLabel}>{t('myBookings.date')}</label>
                      <input type="date" name="date" value={editForm.date} onChange={handleEditChange} style={S.editInput} />
                      <label style={S.editLabel}>{t('myBookings.package')}</label>
                      <select name="package" value={editForm.package} onChange={handleEditChange} style={S.editInput}>
                        <option value="basic">{t('booking.basic')}</option>
                        <option value="premium">{t('booking.premium')}</option>
                        <option value="luxury">{t('booking.luxury')}</option>
                        <option value="full">{t('booking.full')}</option>
                      </select>
                      <label style={S.editLabel}>{t('myBookings.message')}</label>
                      <textarea name="message" value={editForm.message} onChange={handleEditChange}
                        rows="3" style={{ ...S.editInput, resize: "none" }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 4, flexDirection: isMobile ? "column" : "row" }}>
                        <button onClick={() => saveEdit(b.id)} style={S.saveBtn}>{t('common.save')}</button>
                        <button onClick={() => setEditingBooking(null)} style={S.cancelBtn}>{t('common.cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={S.cardBody}>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>{t('myBookings.package')}</span>
                          <strong>{b.package || "—"}</strong>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>{t('myBookings.date')}</span>
                          <span>{formatDate(b.date || b.eventDate)}</span>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>{t('myBookings.event')}</span>
                          <span>{b.eventType || "Wedding"}</span>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>{t('booking.location')}</span>
                          <span>{b.location || b.eventLocation || "—"}</span>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>{t('myBookings.paymentStatus')}</span>
                          <span style={{ color: b.paymentStatus === "paid" ? "#16a34a" : "#d97706", fontWeight: 600, fontSize: 12 }}>
                            {b.paymentStatus === "paid" ? "✅ Paid" :
                             b.paymentStatus === "deposit_submitted" ? "⏳ Deposit Sent" :
                             "🕐 Awaiting Approval"}
                          </span>
                        </div>
                        {b.totalAmount && (
                          <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                            <span style={S.rowKey}>{t('myBookings.totalAmount')}</span>
                            <strong>{formatPrice(b.totalAmount)}</strong>
                          </div>
                        )}
                      </div>
                      <div style={{ ...S.cardFoot, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "10px" : "0" }}>
                        <span style={{ fontSize: 11, color: "#aaa" }}>
                          {t('myBookings.bookedOn')} {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          {(b.status === "pending" || b.status === "PENDING") && (
                            <>
                              <button onClick={() => handleEdit(b)} style={S.editBtn}><FaEdit /></button>
                              <button onClick={() => handleCancel(b.id)} style={S.deleteBtn}><FaTrash /></button>
                            </>
                          )}
                          <Link to={`/wedding/${b.id}`}>
                            <button style={S.viewBtn}><FaEye /></button>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUPPORT HISTORY ── */}
      {activeTab === "support" && (
        <div style={S.section}>
          <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>{t('clientDashboard.supportHistory')}</h3>
          <div style={{ ...S.supportTotalCard, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
            <div style={S.supportTotalIcon}>💰</div>
            <div>
              <div style={S.supportTotalLabel}>{t('clientDashboard.totalSupportGivenLabel')}</div>
              <div style={{ ...S.supportTotalValue, fontSize: isMobile ? "24px" : "32px" }}>{formatPrice(totalSupportGiven)}</div>
            </div>
          </div>
          
          {supportHistory.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <h3 style={{ color: "#1a1a1a", marginBottom: 8 }}>{t('clientDashboard.noSupportYet')}</h3>
              <p style={{ color: "#888" }}>{t('clientDashboard.noSupportDesc')}</p>
              <Link to="/videos">
                <button style={S.newBookingBtn}>{t('clientDashboard.browseVideos')}</button>
              </Link>
            </div>
          ) : (
            <div style={S.supportList}>
              {supportHistory.map(support => (
                <div key={support.id} style={S.supportCard}>
                  <div style={{ ...S.supportHeader, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
                    <div style={S.supportCoupleIcon}>💑</div>
                    <div style={S.supportInfo}>
                      <h4 style={S.supportCoupleName}>{support.coupleName}</h4>
                      <p style={S.supportDate}>{new Date(support.date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ ...S.supportAmount, fontSize: isMobile ? "16px" : "20px" }}>
                      {formatPrice(support.amount)}
                    </div>
                  </div>
                  
                  <div style={{ ...S.supportFooter, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "10px" : "0" }}>
                    <span style={S.paymentMethod}>
                      {support.paymentMethod === "mtn" || support.paymentMethod === "MTN_MOMO" ? "📱 MTN Mobile Money" : "📱 Airtel Money"}
                    </span>
                    {support.videoId && (
                      <Link to={`/video/${support.videoId}`}>
                        <button style={{ ...S.viewVideoBtn, width: isMobile ? "100%" : "auto" }}>{t('clientDashboard.watchVideo')}</button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TIMELINE ── */}
      {activeTab === "timeline" && (
        <div style={S.section}>
          <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>{t('clientDashboard.yourEventProgress')}</h3>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${editingProgress}%` }} />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 24, color: "#1a1a1a" }}>{editingProgress}% {t('clientDashboard.complete')}</p>
          <div style={{ ...S.timelineSteps, flexDirection: isMobile ? "column" : "row" }}>
            {[
              { pct: 0,  label: t('clientDashboard.bookingConfirmed') },
              { pct: 25, label: t('clientDashboard.shootingDay') },
              { pct: 50, label: t('clientDashboard.editingProgress') },
              { pct: 75, label: t('clientDashboard.editingProgress') },
              { pct: 100, label: t('clientDashboard.readyForDelivery') },
            ].map((s, i) => (
              <div key={i} style={{ ...(editingProgress >= s.pct ? S.stepActive : S.step), textAlign: "center" }}>{s.label}</div>
            ))}
          </div>
          <div style={S.stageBadge}><strong>{t('clientDashboard.currentStage')}</strong> {getProgressStage()}</div>
        </div>
      )}

      {/* ── PAYMENTS ── */}
      {activeTab === "payments" && (
        <div style={S.section}>
          <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>{t('clientDashboard.paymentSummary')}</h3>
          <div style={S.payCard}>
            {[
              { label: t('clientDashboard.totalPaidLabel'), value: formatPrice(paymentStatus.totalPaid), color: "#16a34a" },
              { label: t('clientDashboard.pendingAmount'), value: formatPrice(paymentStatus.pendingAmount), color: "#d97706" },
              { label: t('clientDashboard.lastPayment'), value: paymentStatus.lastPayment || "N/A", color: "#1a1a1a" },
            ].map((r, i) => (
              <div key={i} style={{ ...S.payRow, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                <span style={{ fontSize: 14, color: "#666" }}>{r.label}</span>
                <strong style={{ color: r.color }}>{r.value}</strong>
              </div>
            ))}
          </div>
          <div style={S.payNote}>
            💡 {t('clientDashboard.paymentNote')}
          </div>
          <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer">
            <button style={{ ...S.waBtn, width: isMobile ? "100%" : "auto" }}>{t('clientDashboard.contactPayment')}</button>
          </a>
        </div>
      )}

      {/* ── FAVORITES ── */}
      {activeTab === "favorites" && (
        <div style={S.section}>
          {favorites.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <h3 style={{ color: "#1a1a1a", marginBottom: 8 }}>{t('clientDashboard.noFavoritesYet')}</h3>
              <p style={{ color: "#888" }}>{t('clientDashboard.noFavoritesDesc')}</p>
            </div>
          ) : (
            <div style={{ ...S.favGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {favorites.map(f => (
                <div key={f.id} style={S.favCard}>
                  <img src={f.image} alt={f.title} style={S.favImg} />
                  <div style={{ padding: "12px", textAlign: "center" }}>
                    <h4 style={{ fontSize: 14, marginBottom: 8 }}>{f.title}</h4>
                    <button style={{ ...S.removeBtn, width: isMobile ? "100%" : "auto" }}>{t('clientDashboard.remove')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {activeTab === "notifications" && (
        <div style={S.section}>
          <div style={{ ...S.notifHeader, flexDirection: isMobile ? "column" : "row" }}>
            <h3 style={{ marginBottom: 0, color: "#1a1a1a" }}>{t('clientDashboard.notificationsTitle')}</h3>
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} style={{ ...S.markAllBtn, width: isMobile ? "100%" : "auto" }}>
                <FaCheck /> {t('clientDashboard.markAllRead')}
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <h3 style={{ color: "#1a1a1a", marginBottom: 8 }}>{t('clientDashboard.allCaughtUp')}</h3>
              <p style={{ color: "#888" }}>{t('clientDashboard.noNotifications')}</p>
            </div>
          ) : (
            <div style={S.notifList}>
              {notifications.map(n => (
                <div key={n.id} style={{ ...S.notifCard, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
                  <div style={S.notifIcon}>{n.icon || (n.type === "payment" ? "❤️" : "🔔")}</div>
                  <div style={S.notifContent}>
                    <div style={S.notifTitle}>{n.title}</div>
                    <div style={S.notifMessage}>{n.message}</div>
                    <div style={S.notifDate}>{n.date || new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ ...S.notifActions, justifyContent: isMobile ? "center" : "flex-start" }}>
                    {!n.read && (
                      <button onClick={() => markNotificationAsRead(n.id)} style={S.notifReadBtn} title={t('clientDashboard.markAllRead')}>
                        <FaCheck />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)} style={S.notifDeleteBtn} title={t('common.delete')}>
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div style={{ ...S.section, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, color: "#1a1a1a" }}>{t('clientDashboard.quickActions')}</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
          <Link to="/booking"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>📅 {t('clientDashboard.newBooking')}</button></Link>
          <Link to="/videos"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>🎬 {t('clientDashboard.browseVideos')}</button></Link>
          <Link to="/profile"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>👤 {t('clientDashboard.editProfile')}</button></Link>
          <Link to="/contact"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>📞 {t('clientDashboard.support')}</button></Link>
          <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer" style={{ width: isMobile ? "100%" : "auto" }}>
            <button style={{ ...S.waBtn, width: isMobile ? "100%" : "auto" }}>💬 WhatsApp</button>
          </a>
        </div>
      </div>

    </div>
  );
}

// ── STYLES ──
const PRIMARY = "#ffc107";
const DARK    = "#1a1a1a";

const S = {
  page:        { minHeight: "100vh", background: "#f7f7f5", padding: "20px", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  loading:     { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontSize: 18, color: "#888", gap: "16px" },
  spinner:     { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #ffc107", borderRadius: "50%", animation: "spin 1s linear infinite" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 28 },
  title:       { fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, color: DARK, marginBottom: 4 },
  subtitle:    { fontSize: 14, color: "#888" },
  newBookingBtn: { padding: "11px 22px", background: PRIMARY, color: DARK, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },

  statsGrid:   { display: "grid", gap: 14, marginBottom: 24 },
  statCard:    { background: "#fff", padding: "18px 16px", borderRadius: 14, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  statIcon:    { fontSize: 28 },
  statValue:   { fontSize: 22, fontWeight: 700, color: DARK },
  statLabel:   { fontSize: 11, color: "#888", marginTop: 2 },

  tabs:        { display: "flex", gap: 4, marginBottom: 20, paddingBottom: 2 },
  tab:         { padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#888", borderRadius: 8, fontWeight: 500 },
  activeTab:   { padding: "9px 16px", background: PRIMARY, border: "none", cursor: "pointer", fontSize: 13, color: DARK, borderRadius: 8, fontWeight: 700 },

  section:     { background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  empty:       { textAlign: "center", padding: "50px 20px" },

  grid:        { display: "grid", gap: 16 },
  card:        { background: "#fafafa", borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0" },
  cardHead:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f5f5f5", borderBottom: "1px solid #eee" },
  cardId:      { fontSize: 12, fontWeight: 700, color: "#888" },
  statusBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 },
  cardBody:    { padding: "14px" },
  row:         { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #f5f5f5" },
  rowKey:      { color: "#888" },
  cardFoot:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f5f5f5", borderTop: "1px solid #eee" },
  editBtn:     { padding: "6px 10px", background: PRIMARY, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  deleteBtn:   { padding: "6px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  viewBtn:     { padding: "6px 10px", background: DARK, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  editForm:    { padding: "14px", display: "flex", flexDirection: "column", gap: 8 },
  editLabel:   { fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" },
  editInput:   { padding: "9px 12px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" },
  saveBtn:     { padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 },
  cancelBtn:   { padding: "8px 16px", background: "#e8e8e8", color: "#555", border: "none", borderRadius: 6, cursor: "pointer" },

  supportTotalCard: { background: "linear-gradient(135deg, #ffc10715 0%, #ffc10705 100%)", borderRadius: "16px", padding: "20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px", border: "1px solid rgba(255,193,7,0.2)" },
  supportTotalIcon: { fontSize: "48px" },
  supportTotalLabel: { fontSize: "14px", color: "#666" },
  supportTotalValue: { fontSize: "32px", fontWeight: "800", color: "#ffc107" },
  supportList: { display: "flex", flexDirection: "column", gap: "16px" },
  supportCard: { background: "#fafafa", borderRadius: "16px", padding: "20px", border: "1px solid #eee" },
  supportHeader: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" },
  supportCoupleIcon: { fontSize: "40px" },
  supportInfo: { flex: 1 },
  supportCoupleName: { fontSize: "18px", fontWeight: "700", color: DARK, marginBottom: "4px" },
  supportDate: { fontSize: "12px", color: "#888" },
  supportAmount: { fontSize: "20px", fontWeight: "700", color: PRIMARY },
  supportFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #eee" },
  paymentMethod: { fontSize: "12px", color: "#888" },
  viewVideoBtn: { padding: "6px 14px", background: DARK, color: "#fff", border: "none", borderRadius: "20px", fontSize: "12px", cursor: "pointer" },

  progressTrack: { width: "100%", height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden", marginBottom: 10 },
  progressFill:  { height: "100%", background: PRIMARY, borderRadius: 5, transition: "width 0.5s" },
  timelineSteps: { display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 20 },
  step:          { padding: "7px 14px", background: "#f0f0f0", borderRadius: 20, fontSize: 12, color: "#888", flex: 1 },
  stepActive:    { padding: "7px 14px", background: PRIMARY, borderRadius: 20, fontSize: 12, color: DARK, fontWeight: 700, flex: 1 },
  stageBadge:    { padding: "12px 16px", background: "#fff8e1", borderRadius: 10, fontSize: 14, color: "#7a5c00", border: "1px solid #fde68a" },

  payCard:     { border: "1px solid #f0f0f0", borderRadius: 12, padding: "0 4px", marginBottom: 16 },
  payRow:      { display: "flex", justifyContent: "space-between", padding: "13px 12px", borderBottom: "1px solid #f5f5f5", fontSize: 14 },
  payNote:     { background: "#fff8e1", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 16, lineHeight: 1.6 },
  waBtn:       { padding: "11px 22px", background: "#25d366", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },

  favGrid:     { display: "grid", gap: 16 },
  favCard:     { border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
  favImg:      { width: "100%", height: 140, objectFit: "cover" },
  removeBtn:   { padding: "5px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 },

  notifHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "10px" },
  markAllBtn: { padding: "8px 16px", background: "#f0f0f0", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  notifList: { display: "flex", flexDirection: "column", gap: "12px" },
  notifCard: { display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px", borderRadius: "12px", border: "1px solid #eee", transition: "all 0.2s" },
  notifIcon: { fontSize: "28px" },
  notifContent: { flex: 1 },
  notifTitle: { fontWeight: "700", marginBottom: "4px", color: DARK },
  notifMessage: { fontSize: "13px", color: "#666", marginBottom: "6px" },
  notifDate: { fontSize: "11px", color: "#aaa" },
  notifActions: { display: "flex", gap: "8px" },
  notifReadBtn: { padding: "6px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" },
  notifDeleteBtn: { padding: "6px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" },

  actionBtn:   { padding: "10px 18px", background: DARK, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ClientDashboard;