// src/pages/ClientDashboard.jsx
import { useEffect, useState } from "react";
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
    const loggedIn = localStorage.getItem("user_logged_in");
    if (!loggedIn) { window.location.href = "/login"; return; }
    loadUserData();
    loadBookings();
    loadFavorites();
    loadNotifications();
    loadSupportHistory();
  }, []);

  const loadUserData = () => {
    setUser({
      email: localStorage.getItem("user_email"),
      name:  localStorage.getItem("user_name"),
      role:  localStorage.getItem("user_role"),
    });
  };

  const loadBookings = () => {
    const userEmail = localStorage.getItem("user_email");
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const myBookings = allBookings.filter(b => b.email === userEmail || b.userId === userEmail);
    myBookings.sort((a, b) => b.id - a.id);
    setBookings(myBookings);
    const confirmed = myBookings.filter(b => b.status === "confirmed");
    const totalPaid = confirmed.reduce((s, b) => s + (b.price || 0), 0);
    const pendingAmount = myBookings.filter(b => b.status === "pending").reduce((s, b) => s + (b.price || 0), 0);
    setPaymentStatus({ totalPaid, pendingAmount, lastPayment: confirmed[0]?.date || null });
    setEditingProgress(Math.floor(Math.random() * 100));
    setLoading(false);
  };

  const loadFavorites = () => setFavorites(JSON.parse(localStorage.getItem("client_favorites") || "[]"));
  
  const loadNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const userEmail = localStorage.getItem("user_email");
    const myNotifications = allNotifications.filter(n => n.userEmail === userEmail || !n.userEmail);
    setNotifications(myNotifications);
    const unread = myNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };
  
  const loadSupportHistory = () => {
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
    showNotification.success("Marked as read");
  };
  
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.map(n => ({ ...n, read: true }));
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    setUnreadCount(0);
    showNotification.success("All notifications marked as read");
  };
  
  const deleteNotification = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.filter(n => n.id !== notifId);
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
    showNotification.success("Notification deleted");
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking.id);
    setEditForm({ date: booking.date, package: booking.package, message: booking.message || "" });
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
    showNotification.success("Booking updated!");
  };

  const handleCancel = (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    const updated = bookings.filter(b => b.id !== id);
    const userEmail = localStorage.getItem("user_email");
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const others = allBookings.filter(b => b.email !== userEmail && b.userId !== userEmail);
    localStorage.setItem("wedding_bookings", JSON.stringify([...others, ...updated]));
    setBookings(updated);
    showNotification.success("Booking cancelled!");
  };

  const getStatusIcon = (s) =>
    s === "confirmed" ? <FaCheckCircle style={{ color: "#22c55e" }} /> :
    s === "rejected"  ? <FaTimesCircle style={{ color: "#ef4444" }} /> :
    <FaHourglassHalf style={{ color: "#ffc107" }} />;

  const getStatusText = (s) =>
    s === "confirmed" ? "Confirmed" : s === "rejected" ? "Rejected" : "Pending";

  const getProgressStage = () =>
    editingProgress < 20 ? "📝 Booking Confirmed" :
    editingProgress < 50 ? "🎬 Shooting Day" :
    editingProgress < 80 ? "✂️ Editing in Progress" : "📦 Ready for Delivery";

  const statusStyle = (status) => ({
    ...S.statusBadge,
    background: status === "confirmed" ? "#dcfce7" : status === "rejected" ? "#fee2e2" : "#fef9c3",
    color:      status === "confirmed" ? "#15803d" : status === "rejected" ? "#b91c1c" : "#854d0e",
  });

  if (loading) return <div style={S.loading}>Loading your dashboard…</div>;

  const TABS = [
    { id: "bookings",      label: "📋 My Bookings" },
    { id: "support",       label: "❤️ My Support" },
    { id: "timeline",      label: "⏱️ Timeline" },
    { id: "payments",      label: "💳 Payments" },
    { id: "favorites",     label: "❤️ Favorites" },
    { id: "notifications", label: `🔔 Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
  ];

  return (
    <div style={S.page}>
      {/* Responsive Header */}
      <div style={{ ...S.header, flexDirection: isMobile ? "column" : "row" }}>
        <div>
          <h1 style={S.title}>Client Dashboard</h1>
          <p style={S.subtitle}>Welcome back, <strong>{user?.name}</strong>! Manage your event journey here.</p>
        </div>
        <Link to="/booking">
          <button style={{ ...S.newBookingBtn, width: isMobile ? "100%" : "auto" }}>+ New Booking</button>
        </Link>
      </div>

      {/* Responsive Stats Grid */}
      <div style={{ ...S.statsGrid, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {[
          { icon: "📋", value: bookings.length, label: "Total Bookings" },
          { icon: "⏳", value: bookings.filter(b => b.status === "pending").length, label: "Pending" },
          { icon: "✅", value: bookings.filter(b => b.status === "confirmed").length, label: "Confirmed" },
          { icon: "💰", value: paymentStatus.totalPaid.toLocaleString() + " RWF", label: "Total Paid" },
          { icon: "❤️", value: totalSupportGiven.toLocaleString() + " RWF", label: "Total Support Given" },
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

      {/* Responsive Tabs - Horizontal scroll on mobile */}
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
              <h3 style={{ marginBottom: 8, color: "#1a1a1a" }}>No Bookings Yet</h3>
              <p style={{ color: "#888", marginBottom: 20 }}>You haven't made any bookings yet.</p>
              <Link to="/booking"><button style={S.newBookingBtn}>Book Your Event →</button></Link>
            </div>
          ) : (
            <div style={{ ...S.grid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {bookings.map(b => (
                <div key={b.id} style={S.card}>
                  {/* Card content - responsive layout inside */}
                  <div style={{ ...S.cardHead, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "8px" : "0", alignItems: isMobile ? "flex-start" : "center" }}>
                    <span style={S.cardId}>#{String(b.id).slice(-6)}</span>
                    <span style={statusStyle(b.status)}>
                      {getStatusIcon(b.status)} {getStatusText(b.status)}
                    </span>
                  </div>

                  {editingBooking === b.id ? (
                    <div style={S.editForm}>
                      <label style={S.editLabel}>Event Date</label>
                      <input type="date" name="date" value={editForm.date} onChange={handleEditChange} style={S.editInput} />
                      <label style={S.editLabel}>Package</label>
                      <select name="package" value={editForm.package} onChange={handleEditChange} style={S.editInput}>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="luxury">Luxury</option>
                        <option value="full">Full Wedding</option>
                      </select>
                      <label style={S.editLabel}>Special Requests</label>
                      <textarea name="message" value={editForm.message} onChange={handleEditChange}
                        rows="3" style={{ ...S.editInput, resize: "none" }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 4, flexDirection: isMobile ? "column" : "row" }}>
                        <button onClick={() => saveEdit(b.id)} style={S.saveBtn}>✅ Save</button>
                        <button onClick={() => setEditingBooking(null)} style={S.cancelBtn}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={S.cardBody}>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>Package</span>
                          <strong>{b.package || "—"}</strong>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>Date</span>
                          <span>{b.date ? new Date(b.date + "T00:00:00").toLocaleDateString("en-RW", { day:"numeric", month:"short", year:"numeric" }) : "—"}</span>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>Event</span>
                          <span>{b.eventType || "Wedding"}</span>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>Location</span>
                          <span>{b.location || "—"}</span>
                        </div>
                        <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                          <span style={S.rowKey}>Payment</span>
                          <span style={{ color: b.paymentStatus === "paid" ? "#16a34a" : "#d97706", fontWeight: 600, fontSize: 12 }}>
                            {b.paymentStatus === "paid" ? "✅ Paid" :
                             b.paymentStatus === "deposit_submitted" ? "⏳ Deposit Sent" :
                             "🕐 Awaiting Approval"}
                          </span>
                        </div>
                        {b.agreedPrice && (
                          <div style={{ ...S.row, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                            <span style={S.rowKey}>Price</span>
                            <strong>{Number(b.agreedPrice).toLocaleString()} RWF</strong>
                          </div>
                        )}
                      </div>
                      <div style={{ ...S.cardFoot, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "10px" : "0" }}>
                        <span style={{ fontSize: 11, color: "#aaa" }}>
                          Booked {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          {b.status === "pending" && (
                            <>
                              <button onClick={() => handleEdit(b)} style={S.editBtn}><FaEdit /></button>
                              <button onClick={() => handleCancel(b.id)} style={S.deleteBtn}><FaTrash /></button>
                            </>
                          )}
                          <Link to="/wedding/eric-diane">
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
          <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>❤️ My Support History</h3>
          <div style={{ ...S.supportTotalCard, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
            <div style={S.supportTotalIcon}>💰</div>
            <div>
              <div style={S.supportTotalLabel}>Total Support Given</div>
              <div style={{ ...S.supportTotalValue, fontSize: isMobile ? "24px" : "32px" }}>{totalSupportGiven.toLocaleString()} RWF</div>
            </div>
          </div>
          
          {supportHistory.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <h3 style={{ color: "#1a1a1a", marginBottom: 8 }}>No Support Yet</h3>
              <p style={{ color: "#888" }}>You haven't supported any couples yet.</p>
              <Link to="/videos">
                <button style={S.newBookingBtn}>Browse Videos →</button>
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
                    <div style={{ ...S.supportAmount, fontSize: isMobile ? "16px" : "20px" }}>RWF {support.amount.toLocaleString()}</div>
                  </div>
                  
                  <div style={{ ...S.supportFooter, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "10px" : "0" }}>
                    <span style={S.paymentMethod}>
                      {support.paymentMethod === "mtn" ? "📱 MTN Mobile Money" : "📱 Airtel Money"}
                    </span>
                    <Link to={`/video/${support.coupleId}/wedding`}>
                      <button style={{ ...S.viewVideoBtn, width: isMobile ? "100%" : "auto" }}>🎬 Watch Video</button>
                    </Link>
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
          <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>📅 Your Event Progress</h3>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${editingProgress}%` }} />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 24, color: "#1a1a1a" }}>{editingProgress}% Complete</p>
          <div style={{ ...S.timelineSteps, flexDirection: isMobile ? "column" : "row" }}>
            {[
              { pct: 0,  label: "📝 Booking" },
              { pct: 25, label: "🎬 Shooting" },
              { pct: 50, label: "✂️ Editing" },
              { pct: 75, label: "🎥 Review" },
              { pct: 100, label: "📦 Delivery" },
            ].map((s, i) => (
              <div key={i} style={{ ...(editingProgress >= s.pct ? S.stepActive : S.step), textAlign: "center" }}>{s.label}</div>
            ))}
          </div>
          <div style={S.stageBadge}><strong>Current Stage:</strong> {getProgressStage()}</div>
        </div>
      )}

      {/* ── PAYMENTS ── */}
      {activeTab === "payments" && (
        <div style={S.section}>
          <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>💳 Payment Summary</h3>
          <div style={S.payCard}>
            {[
              { label: "Total Paid", value: paymentStatus.totalPaid.toLocaleString() + " RWF", color: "#16a34a" },
              { label: "Pending Amount", value: paymentStatus.pendingAmount.toLocaleString() + " RWF", color: "#d97706" },
              { label: "Last Payment", value: paymentStatus.lastPayment || "N/A", color: "#1a1a1a" },
            ].map((r, i) => (
              <div key={i} style={{ ...S.payRow, flexDirection: isMobile ? "column" : "row", gap: isMobile ? "4px" : "0" }}>
                <span style={{ fontSize: 14, color: "#666" }}>{r.label}</span>
                <strong style={{ color: r.color }}>{r.value}</strong>
              </div>
            ))}
          </div>
          <div style={S.payNote}>
            💡 Payment is collected <strong>after admin approves</strong> your booking. You'll be contacted via WhatsApp with payment details (MTN MoMo / Airtel Money).
          </div>
          <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer">
            <button style={{ ...S.waBtn, width: isMobile ? "100%" : "auto" }}>💬 Contact for Payment</button>
          </a>
        </div>
      )}

      {/* ── FAVORITES ── */}
      {activeTab === "favorites" && (
        <div style={S.section}>
          {favorites.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
              <h3 style={{ color: "#1a1a1a", marginBottom: 8 }}>No Favorites Yet</h3>
              <p style={{ color: "#888" }}>Save your favorite wedding videos and posts here.</p>
            </div>
          ) : (
            <div style={{ ...S.favGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {favorites.map(f => (
                <div key={f.id} style={S.favCard}>
                  <img src={f.image} alt={f.title} style={S.favImg} />
                  <div style={{ padding: "12px", textAlign: "center" }}>
                    <h4 style={{ fontSize: 14, marginBottom: 8 }}>{f.title}</h4>
                    <button style={{ ...S.removeBtn, width: isMobile ? "100%" : "auto" }}>Remove</button>
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
            <h3 style={{ marginBottom: 0, color: "#1a1a1a" }}>🔔 Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} style={{ ...S.markAllBtn, width: isMobile ? "100%" : "auto" }}>
                <FaCheck /> Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <h3 style={{ color: "#1a1a1a", marginBottom: 8 }}>All Caught Up!</h3>
              <p style={{ color: "#888" }}>No notifications right now.</p>
            </div>
          ) : (
            <div style={S.notifList}>
              {notifications.map(n => (
                <div key={n.id} style={{ ...S.notifCard, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
                  <div style={S.notifIcon}>{n.icon || (n.type === "payment" ? "❤️" : "🔔")}</div>
                  <div style={S.notifContent}>
                    <div style={S.notifTitle}>{n.title}</div>
                    <div style={S.notifMessage}>{n.message}</div>
                    <div style={S.notifDate}>{n.date}</div>
                  </div>
                  <div style={{ ...S.notifActions, justifyContent: isMobile ? "center" : "flex-start" }}>
                    {!n.read && (
                      <button onClick={() => markNotificationAsRead(n.id)} style={S.notifReadBtn} title="Mark as read">
                        <FaCheck />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)} style={S.notifDeleteBtn} title="Delete">
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
        <h3 style={{ marginBottom: 16, color: "#1a1a1a" }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
          <Link to="/booking"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>📅 New Booking</button></Link>
          <Link to="/videos"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>🎬 Browse Videos</button></Link>
          <Link to="/profile"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>👤 Edit Profile</button></Link>
          <Link to="/contact"><button style={{ ...S.actionBtn, width: isMobile ? "100%" : "auto" }}>📞 Support</button></Link>
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
  loading:     { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 18, color: "#888" },
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

export default ClientDashboard;