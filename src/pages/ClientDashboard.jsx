// src/pages/ClientDashboard.jsx
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaHourglassHalf,
  FaTimesCircle,
  FaTrash
} from "react-icons/fa";
import { Link } from "react-router-dom";

// ── inline toast (replace with your Toast component once created) ──
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
  const [editingProgress, setEditingProgress] = useState(0);

  useEffect(() => {
    const loggedIn = localStorage.getItem("user_logged_in");
    if (!loggedIn) { window.location.href = "/login"; return; }
    loadUserData();
    loadBookings();
    loadFavorites();
    loadNotifications();
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

  const loadFavorites   = () => setFavorites(JSON.parse(localStorage.getItem("client_favorites") || "[]"));
  const loadNotifications = () => setNotifications(JSON.parse(localStorage.getItem("client_notifications") || "[]"));

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
    { id: "timeline",      label: "⏱️ Timeline" },
    { id: "payments",      label: "💳 Payments" },
    { id: "favorites",     label: "❤️ Favorites" },
    { id: "notifications", label: "🔔 Notifications" },
  ];

  return (
    <div style={S.page}>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Client Dashboard</h1>
          <p style={S.subtitle}>Welcome back, <strong>{user?.name}</strong>! Manage your event journey here.</p>
        </div>
        <Link to="/booking">
          <button style={S.newBookingBtn}>+ New Booking</button>
        </Link>
      </div>

      {/* ── STATS ── */}
      <div style={S.statsGrid}>
        {[
          { icon: "📋", value: bookings.length,                                           label: "Total Bookings" },
          { icon: "⏳", value: bookings.filter(b => b.status === "pending").length,       label: "Pending" },
          { icon: "✅", value: bookings.filter(b => b.status === "confirmed").length,     label: "Confirmed" },
          { icon: "💰", value: paymentStatus.totalPaid.toLocaleString() + " RWF",         label: "Total Paid" },
        ].map((s, i) => (
          <div key={i} style={S.statCard}>
            <div style={S.statIcon}>{s.icon}</div>
            <div>
              <div style={S.statValue}>{s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={S.tabs}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={activeTab === t.id ? S.activeTab : S.tab}>
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
            <div style={S.grid}>
              {bookings.map(b => (
                <div key={b.id} style={S.card}>
                  {/* card header */}
                  <div style={S.cardHead}>
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
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button onClick={() => saveEdit(b.id)} style={S.saveBtn}>✅ Save</button>
                        <button onClick={() => setEditingBooking(null)} style={S.cancelBtn}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={S.cardBody}>
                        <div style={S.row}><span style={S.rowKey}>Package</span><strong>{b.package || "—"}</strong></div>
                        <div style={S.row}><span style={S.rowKey}>Date</span><span>{b.date ? new Date(b.date + "T00:00:00").toLocaleDateString("en-RW", { day:"numeric", month:"short", year:"numeric" }) : "—"}</span></div>
                        <div style={S.row}><span style={S.rowKey}>Event</span><span>{b.eventType || "Wedding"}</span></div>
                        <div style={S.row}><span style={S.rowKey}>Location</span><span>{b.location || "—"}</span></div>
                        <div style={S.row}><span style={S.rowKey}>Payment</span>
                          <span style={{ color: b.paymentStatus === "paid" ? "#16a34a" : "#d97706", fontWeight: 600, fontSize: 12 }}>
                            {b.paymentStatus === "paid" ? "✅ Paid" :
                             b.paymentStatus === "deposit_submitted" ? "⏳ Deposit Sent" :
                             "🕐 Awaiting Approval"}
                          </span>
                        </div>
                        {b.agreedPrice && (
                          <div style={S.row}><span style={S.rowKey}>Price</span><strong>{Number(b.agreedPrice).toLocaleString()} RWF</strong></div>
                        )}
                      </div>
                      <div style={S.cardFoot}>
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

      {/* ── TIMELINE ── */}
      {activeTab === "timeline" && (
        <div style={S.section}>
          <h3 style={{ marginBottom: 20, color: "#1a1a1a" }}>📅 Your Event Progress</h3>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: `${editingProgress}%` }} />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 24, color: "#1a1a1a" }}>{editingProgress}% Complete</p>
          <div style={S.timelineSteps}>
            {[
              { pct: 0,  label: "📝 Booking" },
              { pct: 25, label: "🎬 Shooting" },
              { pct: 50, label: "✂️ Editing" },
              { pct: 75, label: "🎥 Review" },
              { pct: 100, label: "📦 Delivery" },
            ].map((s, i) => (
              <div key={i} style={editingProgress >= s.pct ? S.stepActive : S.step}>{s.label}</div>
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
              { label: "Total Paid",       value: paymentStatus.totalPaid.toLocaleString() + " RWF", color: "#16a34a" },
              { label: "Pending Amount",   value: paymentStatus.pendingAmount.toLocaleString() + " RWF", color: "#d97706" },
              { label: "Last Payment",     value: paymentStatus.lastPayment || "N/A", color: "#1a1a1a" },
            ].map((r, i) => (
              <div key={i} style={S.payRow}>
                <span style={{ fontSize: 14, color: "#666" }}>{r.label}</span>
                <strong style={{ color: r.color }}>{r.value}</strong>
              </div>
            ))}
          </div>
          <div style={S.payNote}>
            💡 Payment is collected <strong>after admin approves</strong> your booking. You'll be contacted via WhatsApp with payment details (MTN MoMo / Airtel Money).
          </div>
          <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer">
            <button style={S.waBtn}>💬 Contact for Payment</button>
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
            <div style={S.favGrid}>
              {favorites.map(f => (
                <div key={f.id} style={S.favCard}>
                  <img src={f.image} alt={f.title} style={S.favImg} />
                  <div style={{ padding: "12px", textAlign: "center" }}>
                    <h4 style={{ fontSize: 14, marginBottom: 8 }}>{f.title}</h4>
                    <button style={S.removeBtn}>Remove</button>
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
          {notifications.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <h3 style={{ color: "#1a1a1a", marginBottom: 8 }}>All Caught Up!</h3>
              <p style={{ color: "#888" }}>No notifications right now.</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} style={S.notifCard}>
              <div style={{ fontSize: 24 }}>{n.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{n.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div style={{ ...S.section, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, color: "#1a1a1a" }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/booking"><button style={S.actionBtn}>📅 New Booking</button></Link>
          <Link to="/profile"><button style={S.actionBtn}>👤 Edit Profile</button></Link>
          <Link to="/contact"><button style={S.actionBtn}>📞 Support</button></Link>
          <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer">
            <button style={S.waBtn}>💬 WhatsApp</button>
          </a>
        </div>
      </div>

    </div>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────
const PRIMARY = "#ffc107";
const DARK    = "#1a1a1a";

const S = {
  page:        { minHeight: "100vh", background: "#f7f7f5", padding: "32px 20px", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  loading:     { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 18, color: "#888" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  title:       { fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700, color: DARK, marginBottom: 4 },
  subtitle:    { fontSize: 14, color: "#888" },
  newBookingBtn: { padding: "11px 22px", background: PRIMARY, color: DARK, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },

  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 },
  statCard:    { background: "#fff", padding: "18px 16px", borderRadius: 14, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  statIcon:    { fontSize: 28 },
  statValue:   { fontSize: 22, fontWeight: 700, color: DARK },
  statLabel:   { fontSize: 11, color: "#888", marginTop: 2 },

  tabs:        { display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 2 },
  tab:         { padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#888", borderRadius: 8, whiteSpace: "nowrap", fontWeight: 500 },
  activeTab:   { padding: "9px 16px", background: PRIMARY, border: "none", cursor: "pointer", fontSize: 13, color: DARK, borderRadius: 8, whiteSpace: "nowrap", fontWeight: 700 },

  section:     { background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  empty:       { textAlign: "center", padding: "50px 20px" },

  grid:        { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
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

  progressTrack: { width: "100%", height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden", marginBottom: 10 },
  progressFill:  { height: "100%", background: PRIMARY, borderRadius: 5, transition: "width 0.5s" },
  timelineSteps: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  step:          { padding: "7px 14px", background: "#f0f0f0", borderRadius: 20, fontSize: 12, color: "#888" },
  stepActive:    { padding: "7px 14px", background: PRIMARY, borderRadius: 20, fontSize: 12, color: DARK, fontWeight: 700 },
  stageBadge:    { padding: "12px 16px", background: "#fff8e1", borderRadius: 10, fontSize: 14, color: "#7a5c00", border: "1px solid #fde68a" },

  payCard:     { border: "1px solid #f0f0f0", borderRadius: 12, padding: "0 4px", marginBottom: 16 },
  payRow:      { display: "flex", justifyContent: "space-between", padding: "13px 12px", borderBottom: "1px solid #f5f5f5", fontSize: 14 },
  payNote:     { background: "#fff8e1", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#7a5c00", marginBottom: 16, lineHeight: 1.6 },
  waBtn:       { padding: "11px 22px", background: "#25d366", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },

  favGrid:     { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  favCard:     { border: "1px solid #eee", borderRadius: 12, overflow: "hidden" },
  favImg:      { width: "100%", height: 140, objectFit: "cover" },
  removeBtn:   { padding: "5px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 },

  notifCard:   { display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #f5f5f5", alignItems: "flex-start" },

  actionBtn:   { padding: "10px 18px", background: DARK, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
};

export default ClientDashboard;