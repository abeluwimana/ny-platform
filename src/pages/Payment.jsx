// src/pages/Payment.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaLock,
  FaTimesCircle,
  FaWhatsapp
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  getCoupleEarnings,
  getMyBookings,
  getMyPayments,
  getTopSupportedCouples,
  processBookingPayment,
  processSupportPayment
} from "../services/api";

const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

// Toast notification
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
  setTimeout(() => el.remove(), 3000);
};

export default function Payment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCouple, setSelectedCouple] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [couples, setCouples] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, couple: 0, platform: 0 });
  const [subscriptionPlan, setSubscriptionPlan] = useState("monthly");
  const [topCouples, setTopCouples] = useState([]);
  
  // Revenue split percentages (60/40 from admin settings)
  const [commission, setCommission] = useState({ couple: 60, platform: 40 });

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedTheme);
    if (savedTheme) document.body.style.background = "#111";
    
    // Check login status
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    const userData = localStorage.getItem("user_data") || localStorage.getItem("admin_data");
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserRole(user.role);
        setUserId(user.id);
        
        // Only CLIENTS can access payment page
        if (user.role !== "CLIENT") {
          toast(t('payment.accessDenied'), "#ef4444");
          navigate("/");
          return;
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    loadCommissionSettings();
    loadData();
    
    // Check if coming from booking or support
    const params = new URLSearchParams(location.search);
    const bookingId = params.get("booking");
    const coupleId = params.get("support");
    
    if (bookingId) {
      // Find booking by ID
      const booking = bookings.find(b => b.id == bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setPaymentAmount(booking.totalAmount || 0);
        setShowPaymentModal(true);
      }
    }
    
    if (coupleId) {
      // Find couple by ID
      const couple = couples.find(c => c.id === coupleId);
      if (couple) {
        setSelectedCouple(couple);
        setShowSupportModal(true);
      }
    }
  }, []);

  const loadCommissionSettings = () => {
    const saved = JSON.parse(localStorage.getItem("commission_settings") || "{}");
    if (saved.couple && saved.platform) {
      setCommission({ couple: saved.couple, platform: saved.platform });
    }
  };

  const loadData = async () => {
    setFetching(true);
    try {
      // Load payments from API
      const paymentsRes = await getMyPayments();
      if (paymentsRes.success) {
        setTransactions(paymentsRes.payments || []);
      }
      
      // Load bookings from API
      const bookingsRes = await getMyBookings();
      if (bookingsRes.success) {
        setBookings(bookingsRes.bookings || []);
      }
      
      // Load couple earnings from API
      const earningsRes = await getCoupleEarnings();
      if (earningsRes.success) {
        setEarnings({
          total: earningsRes.total || 0,
          couple: earningsRes.coupleShare || 0,
          platform: earningsRes.platformShare || 0
        });
      }
      
      // Load top supported couples
      const topRes = await getTopSupportedCouples();
      if (topRes.success) {
        setCouples(topRes.couples || []);
        setTopCouples(topRes.couples?.slice(0, 5) || []);
      }
      
    } catch (error) {
      console.error("Error loading payment data:", error);
      toast(t('payment.loadError'), "#ef4444");
    } finally {
      setFetching(false);
    }
  };

  // ─── FIXED: Booking Payment ─────────────────────────────────────
  const handleBookingPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast(t('payment.invalidPhone'), "#ef4444");
      return;
    }
    
    if (!selectedBooking) {
      toast(t('payment.noBookingSelected'), "#ef4444");
      return;
    }
    
    setLoading(true);
    
    try {
      // ✅ Correct: Send bookingId, phoneNumber, paymentMethod
      const response = await processBookingPayment({
        bookingId: selectedBooking.id,
        phoneNumber: phoneNumber,
        paymentMethod: paymentMethod.toUpperCase()
      });
      
      if (response.success) {
        setPaymentStatus("successful");
        setShowPaymentModal(false);
        toast(t('payment.bookingSuccess'));
        await loadData();
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast(response.message || t('payment.paymentFailed'), "#ef4444");
      }
    } catch (error) {
      console.error("Booking payment error:", error);
      toast(t('payment.paymentError'), "#ef4444");
    } finally {
      setLoading(false);
    }
  };

  // ─── FIXED: Support Payment ─────────────────────────────────────
  const handleSupportPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast(t('payment.invalidPhone'), "#ef4444");
      return;
    }
    
    if (!selectedCouple) {
      toast(t('payment.noCoupleSelected'), "#ef4444");
      return;
    }
    
    const amount = customAmount ? parseInt(customAmount) : paymentAmount;
    if (amount < 1000) {
      toast(t('payment.minimumAmount'), "#ef4444");
      return;
    }
    
    setLoading(true);
    
    try {
      // ✅ FIRST: Create support record via API
      const supportResponse = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          coupleId: selectedCouple.id,
          amount: amount,
          videoId: selectedCouple.videoId || null,
          message: `Support from ${localStorage.getItem("user_name") || "Anonymous"}`
        })
      });

      const supportData = await supportResponse.json();
      
      if (!supportData.success || !supportData.support) {
        toast(supportData.message || t('payment.supportCreateFailed'), "#ef4444");
        setLoading(false);
        return;
      }

      // ✅ THEN: Process payment with supportId
      const paymentResponse = await processSupportPayment({
        supportId: supportData.support.id,
        phoneNumber: phoneNumber,
        paymentMethod: paymentMethod.toUpperCase()
      });
      
      if (paymentResponse.success) {
        setShowSupportModal(false);
        toast(t('payment.supportSuccess', { amount: amount.toLocaleString() }));
        await loadData();
        setTimeout(() => {
          navigate(`/wedding/${selectedCouple.id}`);
        }, 2000);
      } else {
        toast(paymentResponse.message || t('payment.supportFailed'), "#ef4444");
      }
    } catch (error) {
      console.error("Support payment error:", error);
      toast(t('payment.supportError'), "#ef4444");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast(t('payment.invalidPhone'), "#ef4444");
      return;
    }
    
    const amount = subscriptionPlan === "monthly" ? 5000 : 50000;
    setLoading(true);
    
    try {
      // Process subscription payment (will be added to API later)
      // For now, save to localStorage as fallback
      const transaction = {
        id: "SUB" + Date.now(),
        type: "subscription",
        plan: subscriptionPlan,
        amount: amount,
        phoneNumber: phoneNumber,
        method: paymentMethod === "mtn" ? "MTN_MOMO" : "AIRTEL_MONEY",
        status: "COMPLETED",
        date: new Date().toISOString(),
        userId: userId
      };
      
      const allTransactions = JSON.parse(localStorage.getItem("user_transactions") || "[]");
      allTransactions.push(transaction);
      localStorage.setItem("user_transactions", JSON.stringify(allTransactions));
      
      const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
      subscriptions.push({
        id: Date.now(),
        userId: userId,
        plan: subscriptionPlan,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: subscriptionPlan === "monthly" 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      });
      localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
      
      setTransactions([transaction, ...transactions]);
      setLoading(false);
      setShowPaymentModal(false);
      toast(t('payment.subscriptionSuccess'));
      await loadData();
    } catch (error) {
      console.error("Subscription payment error:", error);
      toast(t('payment.subscriptionError'), "#ef4444");
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-RW", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    if (status === "COMPLETED" || status === "successful") {
      return <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}><FaCheckCircle size={10} /> {t('payment.completed')}</span>;
    } else if (status === "PENDING" || status === "pending") {
      return <span style={{ background: "#fef9c3", color: "#854d0e", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}><FaHourglassHalf size={10} /> {t('payment.pending')}</span>;
    } else if (status === "FAILED" || status === "failed") {
      return <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}><FaTimesCircle size={10} /> {t('payment.failed')}</span>;
    }
    return <span style={{ background: "#e2e3e5", color: "#383d41", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{status}</span>;
  };

  const getPaymentTypeIcon = (type) => {
    if (type === "booking") return "📅";
    if (type === "support") return "❤️";
    if (type === "subscription") return "⭐";
    return "💳";
  };

  const getPaymentTypeLabel = (type) => {
    if (type === "booking") return t('payment.booking');
    if (type === "support") return t('payment.support');
    if (type === "subscription") return t('payment.subscription');
    return t('payment.payment');
  };

  const stats = {
    totalPayments: transactions.filter(t => t.status === "COMPLETED" || t.status === "successful").length,
    totalSupport: transactions.filter(t => t.type === "support" && (t.status === "COMPLETED" || t.status === "successful")).reduce((sum, t) => sum + t.amount, 0),
    totalBookings: bookings.filter(b => b.paymentStatus === "COMPLETED" || b.paymentStatus === "paid").length,
    pendingPayments: bookings.filter(b => b.paymentStatus === "PENDING" || b.paymentStatus === "awaiting_deposit").length,
    recentTransactions: transactions.slice(0, 5)
  };

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

  const styles = {
    container: { minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", color: textColor, padding: "20px" },
    darkModeBtn: { position: "fixed", bottom: "20px", right: "20px", background: Y, border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
    header: { textAlign: "center", marginBottom: "32px" },
    title: { fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, marginBottom: "8px", color: textColor },
    subtitle: { fontSize: "14px", color: textMuted },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" },
    statCard: { background: cardBg, borderRadius: "16px", padding: "20px", border: `1px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "14px" },
    statIcon: { fontSize: "32px" },
    statInfo: { flex: 1 },
    statValue: { fontSize: "24px", fontWeight: 800, color: Y },
    statLabel: { fontSize: "12px", color: textMuted },
    tabs: { display: "flex", gap: "8px", marginBottom: "24px", borderBottom: `1px solid ${borderColor}`, paddingBottom: "12px", flexWrap: "wrap" },
    tab: { padding: "10px 20px", background: "none", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: textMuted },
    activeTab: { background: `${Y}20`, color: Y },
    section: { background: cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${borderColor}`, marginBottom: "24px" },
    sectionTitle: { fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" },
    button: { background: Y, color: BLK, border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px", transition: "all 0.2s" },
    buttonOutline: { background: "transparent", color: Y, border: `1px solid ${Y}`, padding: "10px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "13px" },
    input: { width: "100%", padding: "12px", border: `1.5px solid ${borderColor}`, borderRadius: "10px", fontSize: "14px", background: darkMode ? "#333" : "#fff", color: textColor, outline: "none", boxSizing: "border-box" },
    radioGroup: { display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" },
    radioLabel: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
    amountBtn: { padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px", transition: "all 0.2s" },
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
    modalBox: { background: cardBg, borderRadius: "20px", padding: "28px", maxWidth: "500px", width: "100%", maxHeight: "85vh", overflowY: "auto" },
    transactionItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${borderColor}`, flexWrap: "wrap", gap: "10px" },
    bookingItem: { background: darkMode ? "#2a2a2a" : "#fafafa", borderRadius: "12px", padding: "16px", marginBottom: "12px" },
    earningRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${borderColor}` }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
  };

  if (fetching) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${borderColor}`, borderTop: `4px solid ${Y}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p>{t('common.loading')}</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>🔒 {t('payment.loginRequired')}</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>{t('payment.loginRequiredDesc')}</p>
          <Link to="/login"><button style={styles.button}>{t('auth.login')}</button></Link>
        </div>
      </div>
    );
  }

  // If logged in but not CLIENT
  if (userRole !== "CLIENT") {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>🔒 {t('payment.accessDenied')}</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>{t('payment.accessDeniedDesc')}</p>
          <p style={{ color: textMuted, marginBottom: "20px" }}>{t('payment.yourRole')}: <strong>{userRole}</strong></p>
          <Link to="/"><button style={styles.button}>{t('payment.goHome')}</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={toggleDarkMode} style={styles.darkModeBtn}>{darkMode ? "☀️" : "🌙"}</button>
      
      <div style={styles.header}>
        <h1 style={styles.title}>💳 {t('payment.title')}</h1>
        <p style={styles.subtitle}>{t('payment.subtitle')}</p>
      </div>
      
      {/* Stats Dashboard */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💸</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.totalPayments}</div>
            <div style={styles.statLabel}>{t('payment.totalPayments')}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>❤️</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.totalSupport.toLocaleString()} RWF</div>
            <div style={styles.statLabel}>{t('payment.totalSupportGiven')}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.totalBookings}</div>
            <div style={styles.statLabel}>{t('payment.bookingPayments')}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.pendingPayments}</div>
            <div style={styles.statLabel}>{t('payment.pendingPayments')}</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabs}>
        {["bookings", "support", "subscription", "history", "earnings"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}>
            {tab === "bookings" && "📋 " + t('payment.bookingPaymentsTab')}
            {tab === "support" && "❤️ " + t('payment.supportCoupleTab')}
            {tab === "subscription" && "⭐ " + t('payment.premiumSubscriptionTab')}
            {tab === "history" && "📜 " + t('payment.transactionHistoryTab')}
            {tab === "earnings" && "💰 " + t('payment.earningsOverviewTab')}
          </button>
        ))}
      </div>
      
      {/* BOOKING PAYMENTS TAB */}
      {activeTab === "bookings" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 {t('payment.yourBookings')}</h2>
          {bookings.filter(b => b.paymentStatus !== "COMPLETED" && b.paymentStatus !== "paid").length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>{t('payment.noPendingBookings')} <Link to="/booking">{t('payment.bookNow')}</Link></p>
            </div>
          ) : (
            bookings.filter(b => b.paymentStatus !== "COMPLETED" && b.paymentStatus !== "paid").map(booking => (
              <div key={booking.id} style={styles.bookingItem}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: "4px" }}>{booking.eventType || "Wedding"}</h3>
                    <p style={{ fontSize: "13px", color: textMuted }}>{booking.package || "Standard"} • {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "N/A"}</p>
                    <p style={{ fontSize: "12px", color: textMuted }}>📍 {booking.eventLocation || "Rwanda"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: Y }}>{booking.totalAmount?.toLocaleString() || "0"} RWF</div>
                    {getStatusBadge(booking.paymentStatus || "PENDING")}
                  </div>
                </div>
                <button onClick={() => { setSelectedBooking(booking); setPaymentAmount(booking.totalAmount || 0); setShowPaymentModal(true); }} style={{ ...styles.button, width: "100%" }}>
                  {t('payment.payNow')}
                </button>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* SUPPORT COUPLE TAB */}
      {activeTab === "support" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>❤️ {t('payment.supportCouple')}</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>{t('payment.supportCoupleDesc')}</p>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.topCouples')}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
              {topCouples.length > 0 ? topCouples.map(couple => (
                <button 
                  key={couple.id} 
                  onClick={() => { setSelectedCouple(couple); setPaymentAmount(5000); }}
                  style={{
                    padding: "12px",
                    background: selectedCouple?.id === couple.id ? `${Y}25` : darkMode ? "#2a2a2a" : "#f5f5f5",
                    border: selectedCouple?.id === couple.id ? `2px solid ${Y}` : `1px solid ${borderColor}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "4px" }}>💑</div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{couple.user?.name || couple.name}</div>
                  <div style={{ fontSize: "11px", color: textMuted }}>❤️ {couple.supportCount || 0} {t('payment.supporters')}</div>
                </button>
              )) : (
                <p style={{ color: textMuted, gridColumn: "1/-1", textAlign: "center" }}>{t('payment.noCouples')}</p>
              )}
            </div>
          </div>
          
          {selectedCouple && (
            <div style={{ background: darkMode ? "#2a2a2a" : "#fafafa", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700 }}>
                  {selectedCouple.user?.name?.charAt(0) || selectedCouple.name?.charAt(0) || "C"}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{selectedCouple.user?.name || selectedCouple.name}</h3>
                  <p style={{ fontSize: "12px", color: textMuted }}>📍 {selectedCouple.location || "Rwanda"}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.supportAmount')}</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {[1000, 2000, 5000, 10000].map(amount => (
                    <button key={amount} onClick={() => { setPaymentAmount(amount); setCustomAmount(""); }} style={{ ...styles.amountBtn, background: paymentAmount === amount && !customAmount ? Y : "transparent", color: paymentAmount === amount && !customAmount ? BLK : textColor, border: `1px solid ${paymentAmount === amount && !customAmount ? Y : borderColor}` }}>
                      {amount.toLocaleString()} RWF
                    </button>
                  ))}
                </div>
                <input type="number" placeholder={t('payment.customAmountPlaceholder')} value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setPaymentAmount(0); }} style={styles.input} />
              </div>
              
              {/* 60/40 Split Display */}
              <div style={{ background: `${Y}15`, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span>💑 {t('payment.coupleReceives')} ({commission.couple}%):</span>
                  <strong style={{ color: "#22c55e" }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.couple / 100).toLocaleString()} RWF</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>🏢 {t('payment.platformFee')} ({commission.platform}%):</span>
                  <strong style={{ color: Y }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.platform / 100).toLocaleString()} RWF</strong>
                </div>
                <div style={{ marginTop: "8px", fontSize: "11px", textAlign: "center", color: textMuted, borderTop: `1px solid ${borderColor}`, paddingTop: "8px" }}>
                  {t('payment.supportMessage')}
                </div>
              </div>
              
              <button onClick={() => setShowSupportModal(true)} style={{ ...styles.button, width: "100%" }}>
                ❤️ {t('payment.supportNow')}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* PREMIUM SUBSCRIPTION TAB */}
      {activeTab === "subscription" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⭐ {t('payment.premiumSubscription')}</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>{t('payment.premiumSubscriptionDesc')}</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            <div style={{ background: darkMode ? "#2a2a2a" : "#fafafa", borderRadius: "12px", padding: "20px", textAlign: "center", border: subscriptionPlan === "monthly" ? `2px solid ${Y}` : `1px solid ${borderColor}` }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📱</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>{t('payment.monthlyPlan')}</h3>
              <div style={{ fontSize: "28px", fontWeight: 800, color: Y, marginBottom: "12px" }}>5,000 RWF</div>
              <div style={{ fontSize: "12px", color: textMuted, marginBottom: "16px" }}>{t('payment.perMonth')}</div>
              <button onClick={() => setSubscriptionPlan("monthly")} style={{ ...styles.buttonOutline, width: "100%" }}>{subscriptionPlan === "monthly" ? "✓ " + t('payment.selected') : t('payment.selectPlan')}</button>
            </div>
            
            <div style={{ background: darkMode ? "#2a2a2a" : "#fafafa", borderRadius: "12px", padding: "20px", textAlign: "center", border: subscriptionPlan === "annual" ? `2px solid ${Y}` : `1px solid ${borderColor}`, position: "relative" }}>
              <div style={{ position: "absolute", top: "-10px", right: "10px", background: Y, color: BLK, padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>{t('payment.save17')}</div>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>💎</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>{t('payment.yearlyPlan')}</h3>
              <div style={{ fontSize: "28px", fontWeight: 800, color: Y, marginBottom: "12px" }}>50,000 RWF</div>
              <div style={{ fontSize: "12px", color: textMuted, marginBottom: "16px" }}>{t('payment.perYear')}</div>
              <button onClick={() => setSubscriptionPlan("annual")} style={{ ...styles.buttonOutline, width: "100%" }}>{subscriptionPlan === "annual" ? "✓ " + t('payment.selected') : t('payment.selectPlan')}</button>
            </div>
          </div>
          
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "12px" }}>✨ {t('payment.premiumBenefits')}</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ {t('payment.benefit1')}</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ {t('payment.benefit2')}</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ {t('payment.benefit3')}</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ {t('payment.benefit4')}</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ {t('payment.benefit5')}</li>
            </ul>
          </div>
          
          <button onClick={() => setShowPaymentModal(true)} style={{ ...styles.button, width: "100%" }}>
            {t('payment.subscribeNow')}
          </button>
        </div>
      )}
      
      {/* TRANSACTION HISTORY TAB */}
      {activeTab === "history" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📜 {t('payment.transactionHistory')}</h2>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>{t('payment.noTransactions')}</p>
            </div>
          ) : (
            transactions.map(transaction => (
              <div key={transaction.id} style={styles.transactionItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "28px" }}>{getPaymentTypeIcon(transaction.type)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{getPaymentTypeLabel(transaction.type)}</div>
                    <div style={{ fontSize: "11px", color: textMuted }}>{transaction.transactionId || transaction.id} • {formatDate(transaction.createdAt || transaction.date)}</div>
                    {transaction.type === "support" && transaction.support?.couple?.user?.name && (
                      <div style={{ fontSize: "11px", color: textMuted }}>{t('payment.to')}: {transaction.support.couple.user.name}</div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: Y }}>{transaction.amount.toLocaleString()} RWF</div>
                  <div style={{ marginTop: "4px" }}>{getStatusBadge(transaction.status)}</div>
                  <div style={{ fontSize: "10px", color: textMuted, marginTop: "4px" }}>{transaction.method || transaction.paymentMethod}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* EARNINGS OVERVIEW TAB */}
      {activeTab === "earnings" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💰 {t('payment.yourImpact')}</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={styles.statCard}>
              <div><div style={styles.statValue}>{stats.totalSupport.toLocaleString()} RWF</div><div style={styles.statLabel}>{t('payment.totalSupportGivenLabel')}</div></div>
            </div>
            <div style={styles.statCard}>
              <div><div style={styles.statValue}>{transactions.filter(t => t.type === "support").length}</div><div style={styles.statLabel}>{t('payment.couplesSupported')}</div></div>
            </div>
            <div style={styles.statCard}>
              <div><div style={styles.statValue}>{transactions.length}</div><div style={styles.statLabel}>{t('payment.totalTransactions')}</div></div>
            </div>
          </div>
          
          <div style={styles.earningRow}>
            <span>❤️ {t('payment.yourTotalSupport')}</span>
            <strong style={{ color: Y }}>{stats.totalSupport.toLocaleString()} RWF</strong>
          </div>
          <div style={styles.earningRow}>
            <span>💑 {t('payment.goToCouples')} ({commission.couple}%)</span>
            <strong style={{ color: "#22c55e" }}>{(stats.totalSupport * commission.couple / 100).toLocaleString()} RWF</strong>
          </div>
          <div style={styles.earningRow}>
            <span>🏢 {t('payment.platformFeeLabel')} ({commission.platform}%)</span>
            <strong style={{ color: Y }}>{(stats.totalSupport * commission.platform / 100).toLocaleString()} RWF</strong>
          </div>
          
          <div style={{ marginTop: "20px", padding: "12px", background: `${Y}15`, borderRadius: "10px" }}>
            <p style={{ fontSize: "12px", margin: 0, textAlign: "center" }}>
              💡 {t('payment.supportMessage')}<br/>
              <strong style={{ color: "#22c55e" }}>{commission.couple}%</strong> {t('payment.goesToCouples')}, <strong style={{ color: Y }}>{commission.platform}%</strong> {t('payment.goesToPlatform')}
            </p>
          </div>
          
          <Link to="/videos">
            <button style={{ ...styles.buttonOutline, marginTop: "20px", width: "100%" }}>🎬 {t('payment.supportMoreCouples')} →</button>
          </Link>
        </div>
      )}
      
      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={styles.modal} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>💳 {t('payment.completePayment')}</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.paymentMethodLabel')}</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input type="radio" name="method" value="mtn" checked={paymentMethod === "mtn"} onChange={() => setPaymentMethod("mtn")} />
                  <span>📱 MTN Mobile Money</span>
                </label>
                <label style={styles.radioLabel}>
                  <input type="radio" name="method" value="airtel" checked={paymentMethod === "airtel"} onChange={() => setPaymentMethod("airtel")} />
                  <span>📱 Airtel Money</span>
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.phoneNumber')}</label>
              <input type="tel" placeholder={t('payment.phonePlaceholder')} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.input} />
              <p style={{ fontSize: "11px", color: textMuted, marginTop: "4px" }}>{t('payment.phoneHint')}</p>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.amount')}</label>
              <input type="text" value={`${(paymentAmount || (customAmount ? parseInt(customAmount) : 0)).toLocaleString()} RWF`} disabled style={{ ...styles.input, background: darkMode ? "#2a2a2a" : "#f5f5f5" }} />
            </div>
            
            <div style={{ background: `${Y}15`, borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "13px" }}>
              <p style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><FaLock size={12} /> {t('payment.securePayment')}</p>
              <p style={{ display: "flex", alignItems: "center", gap: "8px" }}><FaWhatsapp size={12} /> {t('payment.whatsappSupport')}</p>
            </div>
            
            <button 
              onClick={() => activeTab === "subscription" ? handleSubscriptionPayment() : (activeTab === "support" ? handleSupportPayment() : handleBookingPayment())} 
              disabled={loading} 
              style={{ ...styles.button, width: "100%" }}
            >
              {loading ? t('payment.processing') : `${t('payment.pay')} ${(paymentAmount || (customAmount ? parseInt(customAmount) : 0)).toLocaleString()} RWF`}
            </button>
            <button onClick={() => setShowPaymentModal(false)} style={{ ...styles.buttonOutline, width: "100%", marginTop: "12px" }}>{t('common.cancel')}</button>
          </div>
        </div>
      )}
      
      {/* SUPPORT MODAL */}
      {showSupportModal && selectedCouple && (
        <div style={styles.modal} onClick={() => setShowSupportModal(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>❤️ {t('payment.supportTitle', { name: selectedCouple.user?.name || selectedCouple.name })}</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.paymentMethodLabel')}</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input type="radio" name="method" value="mtn" checked={paymentMethod === "mtn"} onChange={() => setPaymentMethod("mtn")} />
                  <span>📱 MTN Mobile Money</span>
                </label>
                <label style={styles.radioLabel}>
                  <input type="radio" name="method" value="airtel" checked={paymentMethod === "airtel"} onChange={() => setPaymentMethod("airtel")} />
                  <span>📱 Airtel Money</span>
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.phoneNumber')}</label>
              <input type="tel" placeholder={t('payment.phonePlaceholder')} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.input} />
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>{t('payment.amount')}</label>
              <input type="text" value={`${(customAmount ? parseInt(customAmount) : paymentAmount).toLocaleString()} RWF`} disabled style={{ ...styles.input, background: darkMode ? "#2a2a2a" : "#f5f5f5" }} />
            </div>
            
            <div style={{ background: `${Y}15`, borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span>💑 {t('payment.coupleReceives')} ({commission.couple}%):</span>
                <strong style={{ color: "#22c55e" }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.couple / 100).toLocaleString()} RWF</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>🏢 {t('payment.platformFee')} ({commission.platform}%):</span>
                <strong style={{ color: Y }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.platform / 100).toLocaleString()} RWF</strong>
              </div>
              <div style={{ marginTop: "8px", fontSize: "10px", textAlign: "center", color: textMuted }}>
                {t('payment.supportHelps')}
              </div>
            </div>
            
            <button onClick={handleSupportPayment} disabled={loading} style={{ ...styles.button, width: "100%" }}>
              {loading ? t('payment.processing') : `❤️ ${t('payment.support')} ${(customAmount ? parseInt(customAmount) : paymentAmount).toLocaleString()} RWF`}
            </button>
            <button onClick={() => setShowSupportModal(false)} style={{ ...styles.buttonOutline, width: "100%", marginTop: "12px" }}>{t('common.cancel')}</button>
          </div>
        </div>
      )}
    </div>
  );
}