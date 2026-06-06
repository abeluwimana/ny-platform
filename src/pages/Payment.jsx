// src/pages/Payment.jsx
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaLock,
  FaTimesCircle,
  FaWhatsapp
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  
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
  
  // Revenue split percentages (60/40 from admin settings)
  const [commission, setCommission] = useState({ couple: 60, platform: 40 });

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedTheme);
    if (savedTheme) document.body.style.background = "#111";
    
    const loggedIn = localStorage.getItem("user_logged_in") === "true";
    const userRoleStored = localStorage.getItem("user_role");
    setIsLoggedIn(loggedIn);
    setUserRole(userRoleStored);
    
    // Only CLIENTS can access payment page
    if (loggedIn && userRoleStored !== "client") {
      toast("Only CLIENTS can access payment page", "#ef4444");
      navigate("/");
      return;
    }
    
    loadCommissionSettings();
    loadTransactions();
    loadBookings();
    loadCouples();
    loadEarnings();
    
    // Check if coming from booking or support
    const params = new URLSearchParams(location.search);
    const bookingId = params.get("booking");
    const coupleId = params.get("support");
    
    if (bookingId) {
      const booking = bookings.find(b => b.id == bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setPaymentAmount(booking.agreedPrice || getPackagePrice(booking.package));
        setShowPaymentModal(true);
      }
    }
    
    if (coupleId) {
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

  const loadTransactions = () => {
    const allTransactions = JSON.parse(localStorage.getItem("user_transactions") || "[]");
    const userEmail = localStorage.getItem("user_email");
    const userTransactions = allTransactions.filter(t => t.userEmail === userEmail);
    setTransactions(userTransactions);
  };

  const loadBookings = () => {
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const userEmail = localStorage.getItem("user_email");
    const userBookings = allBookings.filter(b => b.email === userEmail);
    setBookings(userBookings);
  };

  const loadCouples = () => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    setCouples(allCouples);
  };

  const loadEarnings = () => {
    const supports = JSON.parse(localStorage.getItem("video_supports") || "[]");
    const total = supports.reduce((sum, s) => sum + s.amount, 0);
    const coupleTotal = supports.reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0);
    const platformTotal = supports.reduce((sum, s) => sum + (s.platformEarning || s.amount * 0.4), 0);
    setEarnings({ total, couple: coupleTotal, platform: platformTotal });
  };

  const getPackagePrice = (pkg) => {
    const prices = { basic: 250000, premium: 450000, luxury: 650000, full: 850000 };
    return prices[pkg?.toLowerCase()] || 250000;
  };

  const handleBookingPayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast("Please enter a valid phone number", "#ef4444");
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const transaction = {
        id: "TXN" + Date.now(),
        type: "booking",
        bookingId: selectedBooking.id,
        eventType: selectedBooking.eventType,
        amount: paymentAmount,
        phoneNumber: phoneNumber,
        method: paymentMethod === "mtn" ? "MTN MoMo" : "Airtel Money",
        status: "successful",
        date: new Date().toISOString(),
        userEmail: localStorage.getItem("user_email")
      };
      
      const allTransactions = JSON.parse(localStorage.getItem("user_transactions") || "[]");
      allTransactions.push(transaction);
      localStorage.setItem("user_transactions", JSON.stringify(allTransactions));
      
      // Update booking status
      const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
      const updatedBookings = allBookings.map(b => 
        b.id === selectedBooking.id ? { ...b, paymentStatus: "paid", status: "confirmed" } : b
      );
      localStorage.setItem("wedding_bookings", JSON.stringify(updatedBookings));
      
      setTransactions([transaction, ...transactions]);
      setPaymentStatus("successful");
      setLoading(false);
      setShowPaymentModal(false);
      toast("✅ Payment successful! Your booking is confirmed.");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }, 2000);
  };

  const handleSupportPayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast("Please enter a valid phone number", "#ef4444");
      return;
    }
    
    const amount = customAmount ? parseInt(customAmount) : paymentAmount;
    if (amount < 1000) {
      toast("Minimum support amount is 1,000 RWF", "#ef4444");
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const coupleEarning = amount * (commission.couple / 100);
      const platformEarning = amount * (commission.platform / 100);
      
      const transaction = {
        id: "SUP" + Date.now(),
        type: "support",
        coupleId: selectedCouple.id,
        coupleName: selectedCouple.couple || selectedCouple.name,
        amount: amount,
        coupleEarning: coupleEarning,
        platformEarning: platformEarning,
        phoneNumber: phoneNumber,
        method: paymentMethod === "mtn" ? "MTN MoMo" : "Airtel Money",
        status: "successful",
        date: new Date().toISOString(),
        userEmail: localStorage.getItem("user_email")
      };
      
      const allTransactions = JSON.parse(localStorage.getItem("user_transactions") || "[]");
      allTransactions.push(transaction);
      localStorage.setItem("user_transactions", JSON.stringify(allTransactions));
      
      const supports = JSON.parse(localStorage.getItem("video_supports") || "[]");
      supports.push({
        id: Date.now(),
        coupleId: selectedCouple.id,
        coupleName: selectedCouple.couple || selectedCouple.name,
        amount: amount,
        coupleEarning: coupleEarning,
        platformEarning: platformEarning,
        userEmail: localStorage.getItem("user_email"),
        userName: localStorage.getItem("user_name"),
        date: new Date().toISOString()
      });
      localStorage.setItem("video_supports", JSON.stringify(supports));
      
      // Update couple earnings in localStorage
      const coupleEarnings = JSON.parse(localStorage.getItem(`earnings_${selectedCouple.id}`) || "{}");
      coupleEarnings.total = (coupleEarnings.total || 0) + coupleEarning;
      coupleEarnings.pending = (coupleEarnings.pending || 0) + coupleEarning;
      localStorage.setItem(`earnings_${selectedCouple.id}`, JSON.stringify(coupleEarnings));
      
      setTransactions([transaction, ...transactions]);
      setPaymentStatus("successful");
      setLoading(false);
      setShowSupportModal(false);
      toast(`✅ Thank you! ${amount.toLocaleString()} RWF supported. ${coupleEarning.toLocaleString()} RWF (${commission.couple}%) goes to ${selectedCouple.couple}.`);
      
      loadEarnings();
      
      setTimeout(() => {
        navigate(`/wedding/${selectedCouple.id}`);
      }, 2000);
    }, 2000);
  };

  const handleSubscriptionPayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast("Please enter a valid phone number", "#ef4444");
      return;
    }
    
    const amount = subscriptionPlan === "monthly" ? 5000 : 50000;
    setLoading(true);
    
    setTimeout(() => {
      const transaction = {
        id: "SUB" + Date.now(),
        type: "subscription",
        plan: subscriptionPlan,
        amount: amount,
        phoneNumber: phoneNumber,
        method: paymentMethod === "mtn" ? "MTN MoMo" : "Airtel Money",
        status: "successful",
        date: new Date().toISOString(),
        userEmail: localStorage.getItem("user_email")
      };
      
      const allTransactions = JSON.parse(localStorage.getItem("user_transactions") || "[]");
      allTransactions.push(transaction);
      localStorage.setItem("user_transactions", JSON.stringify(allTransactions));
      
      const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
      subscriptions.push({
        id: Date.now(),
        email: localStorage.getItem("user_email"),
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
      toast("✅ Subscription activated! Enjoy premium content.");
    }, 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-RW", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const getStatusBadge = (status) => {
    if (status === "successful") {
      return <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}><FaCheckCircle size={10} /> Successful</span>;
    } else if (status === "pending") {
      return <span style={{ background: "#fef9c3", color: "#854d0e", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}><FaHourglassHalf size={10} /> Pending</span>;
    } else if (status === "failed") {
      return <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}><FaTimesCircle size={10} /> Failed</span>;
    }
    return <span style={{ background: "#e2e3e5", color: "#383d41", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{status}</span>;
  };

  const getPaymentTypeIcon = (type) => {
    if (type === "booking") return "📅";
    if (type === "support") return "❤️";
    return "⭐";
  };

  const stats = {
    totalPayments: transactions.filter(t => t.status === "successful").length,
    totalSupport: transactions.filter(t => t.type === "support" && t.status === "successful").reduce((sum, t) => sum + t.amount, 0),
    totalBookings: bookings.filter(b => b.paymentStatus === "paid").length,
    pendingPayments: bookings.filter(b => b.paymentStatus === "awaiting_deposit").length,
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

  // If not logged in
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>🔒 Please Login First</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>You need to be logged in as a CLIENT to make payments.</p>
          <Link to="/login"><button style={styles.button}>Login Now</button></Link>
        </div>
      </div>
    );
  }

  // If logged in but not CLIENT
  if (userRole !== "client") {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>🔒 Access Denied</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>Only CLIENT accounts can access the payment center.</p>
          <p style={{ color: textMuted, marginBottom: "20px" }}>Your current role: <strong>{userRole}</strong></p>
          <Link to="/"><button style={styles.button}>Go to Home</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={toggleDarkMode} style={styles.darkModeBtn}>{darkMode ? "☀️" : "🌙"}</button>
      
      <div style={styles.header}>
        <h1 style={styles.title}>💳 Payment Center</h1>
        <p style={styles.subtitle}>Manage payments, support couples, and track transactions</p>
      </div>
      
      {/* Stats Dashboard */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💸</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.totalPayments}</div>
            <div style={styles.statLabel}>Total Payments</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>❤️</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.totalSupport.toLocaleString()} RWF</div>
            <div style={styles.statLabel}>Total Support Given</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.totalBookings}</div>
            <div style={styles.statLabel}>Booking Payments</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>{stats.pendingPayments}</div>
            <div style={styles.statLabel}>Pending Payments</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabs}>
        {["bookings", "support", "subscription", "history", "earnings"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}>
            {tab === "bookings" && "📋 Booking Payments"}
            {tab === "support" && "❤️ Support Couple"}
            {tab === "subscription" && "⭐ Premium Subscription"}
            {tab === "history" && "📜 Transaction History"}
            {tab === "earnings" && "💰 Earnings Overview"}
          </button>
        ))}
      </div>
      
      {/* BOOKING PAYMENTS TAB */}
      {activeTab === "bookings" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Pending Bookings</h2>
          {bookings.filter(b => b.paymentStatus !== "paid").length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>No pending bookings. <Link to="/booking">Book an event</Link></p>
            </div>
          ) : (
            bookings.filter(b => b.paymentStatus !== "paid").map(booking => (
              <div key={booking.id} style={styles.bookingItem}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: "4px" }}>{booking.eventType || "Wedding"}</h3>
                    <p style={{ fontSize: "13px", color: textMuted }}>{booking.package} • {new Date(booking.date).toLocaleDateString()}</p>
                    <p style={{ fontSize: "12px", color: textMuted }}>📍 {booking.location}, {booking.district}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: Y }}>{booking.agreedPrice?.toLocaleString() || getPackagePrice(booking.package).toLocaleString()} RWF</div>
                    {getStatusBadge(booking.paymentStatus || "pending")}
                  </div>
                </div>
                <button onClick={() => { setSelectedBooking(booking); setPaymentAmount(booking.agreedPrice || getPackagePrice(booking.package)); setShowPaymentModal(true); }} style={{ ...styles.button, width: "100%" }}>
                  Pay Now
                </button>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* SUPPORT COUPLE TAB */}
      {activeTab === "support" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>❤️ Support a Couple</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>Your support helps couples preserve their memories and earn from their stories.</p>
          
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Select Couple</label>
            <select onChange={(e) => {
              const couple = couples.find(c => c.id === e.target.value);
              if (couple) setSelectedCouple(couple);
            }} style={styles.input}>
              <option value="">-- Select a couple to support --</option>
              {couples.map(couple => (
                <option key={couple.id} value={couple.id}>{couple.couple || couple.name}</option>
              ))}
            </select>
          </div>
          
          {selectedCouple && (
            <div style={{ background: darkMode ? "#2a2a2a" : "#fafafa", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700 }}>
                  {selectedCouple.couple?.charAt(0) || selectedCouple.name?.charAt(0) || "C"}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{selectedCouple.couple || selectedCouple.name}</h3>
                  <p style={{ fontSize: "12px", color: textMuted }}>📍 {selectedCouple.location || "Rwanda"}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Support Amount (RWF)</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {[1000, 2000, 5000, 10000].map(amount => (
                    <button key={amount} onClick={() => { setPaymentAmount(amount); setCustomAmount(""); }} style={{ ...styles.amountBtn, background: paymentAmount === amount && !customAmount ? Y : "transparent", color: paymentAmount === amount && !customAmount ? BLK : textColor, border: `1px solid ${paymentAmount === amount && !customAmount ? Y : borderColor}` }}>
                      {amount.toLocaleString()} RWF
                    </button>
                  ))}
                </div>
                <input type="number" placeholder="Custom amount (RWF)" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setPaymentAmount(0); }} style={styles.input} />
              </div>
              
              {/* 60/40 Split Display */}
              <div style={{ background: `${Y}15`, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                  <span>💑 Couple receives ({commission.couple}%):</span>
                  <strong style={{ color: "#22c55e" }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.couple / 100).toLocaleString()} RWF</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span>🏢 NY Entertainment fee ({commission.platform}%):</span>
                  <strong style={{ color: Y }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.platform / 100).toLocaleString()} RWF</strong>
                </div>
                <div style={{ marginTop: "8px", fontSize: "11px", textAlign: "center", color: textMuted, borderTop: `1px solid ${borderColor}`, paddingTop: "8px" }}>
                  Your full support amount goes to help couples share their memories
                </div>
              </div>
              
              <button onClick={() => setShowSupportModal(true)} style={{ ...styles.button, width: "100%" }}>
                ❤️ Support Now
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* PREMIUM SUBSCRIPTION TAB */}
      {activeTab === "subscription" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⭐ Premium Subscription</h2>
          <p style={{ color: textMuted, marginBottom: "20px" }}>Get access to exclusive premium content, full wedding films, and special galleries.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            <div style={{ background: darkMode ? "#2a2a2a" : "#fafafa", borderRadius: "12px", padding: "20px", textAlign: "center", border: subscriptionPlan === "monthly" ? `2px solid ${Y}` : `1px solid ${borderColor}` }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📱</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Monthly Plan</h3>
              <div style={{ fontSize: "28px", fontWeight: 800, color: Y, marginBottom: "12px" }}>5,000 RWF</div>
              <div style={{ fontSize: "12px", color: textMuted, marginBottom: "16px" }}>per month • auto-renewable</div>
              <button onClick={() => setSubscriptionPlan("monthly")} style={{ ...styles.buttonOutline, width: "100%" }}>{subscriptionPlan === "monthly" ? "✓ Selected" : "Select Plan"}</button>
            </div>
            
            <div style={{ background: darkMode ? "#2a2a2a" : "#fafafa", borderRadius: "12px", padding: "20px", textAlign: "center", border: subscriptionPlan === "annual" ? `2px solid ${Y}` : `1px solid ${borderColor}`, position: "relative" }}>
              <div style={{ position: "absolute", top: "-10px", right: "10px", background: Y, color: BLK, padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>SAVE 17%</div>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>💎</div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Yearly Plan</h3>
              <div style={{ fontSize: "28px", fontWeight: 800, color: Y, marginBottom: "12px" }}>50,000 RWF</div>
              <div style={{ fontSize: "12px", color: textMuted, marginBottom: "16px" }}>per year • save 10,000 RWF</div>
              <button onClick={() => setSubscriptionPlan("annual")} style={{ ...styles.buttonOutline, width: "100%" }}>{subscriptionPlan === "annual" ? "✓ Selected" : "Select Plan"}</button>
            </div>
          </div>
          
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "12px" }}>✨ Premium Benefits:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ Access to all premium wedding films</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ Full ceremony recordings</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ Exclusive behind-the-scenes content</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ High-quality downloadable videos</li>
              <li style={{ padding: "8px 0", display: "flex", alignItems: "center", gap: "8px" }}>✅ Priority support</li>
            </ul>
          </div>
          
          <button onClick={() => setShowPaymentModal(true)} style={{ ...styles.button, width: "100%" }}>
            Subscribe Now
          </button>
        </div>
      )}
      
      {/* TRANSACTION HISTORY TAB */}
      {activeTab === "history" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📜 Transaction History</h2>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>No transactions yet. Make your first payment!</p>
            </div>
          ) : (
            transactions.map(transaction => (
              <div key={transaction.id} style={styles.transactionItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "28px" }}>{getPaymentTypeIcon(transaction.type)}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{transaction.type === "booking" ? "Booking Payment" : transaction.type === "support" ? "Couple Support" : "Subscription"}</div>
                    <div style={{ fontSize: "11px", color: textMuted }}>{transaction.id} • {formatDate(transaction.date)}</div>
                    {transaction.type === "support" && <div style={{ fontSize: "11px", color: textMuted }}>To: {transaction.coupleName}</div>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: Y }}>{transaction.amount.toLocaleString()} RWF</div>
                  <div style={{ marginTop: "4px" }}>{getStatusBadge(transaction.status)}</div>
                  <div style={{ fontSize: "10px", color: textMuted, marginTop: "4px" }}>{transaction.method} • {transaction.phoneNumber}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* EARNINGS OVERVIEW TAB - Only for Couples (Read-only for Clients) */}
      {activeTab === "earnings" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💰 Your Impact Summary</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={styles.statCard}>
              <div><div style={styles.statValue}>{stats.totalSupport.toLocaleString()} RWF</div><div style={styles.statLabel}>Total Support Given</div></div>
            </div>
            <div style={styles.statCard}>
              <div><div style={styles.statValue}>{transactions.filter(t => t.type === "support").length}</div><div style={styles.statLabel}>Couples Supported</div></div>
            </div>
            <div style={styles.statCard}>
              <div><div style={styles.statValue}>{transactions.length}</div><div style={styles.statLabel}>Total Transactions</div></div>
            </div>
          </div>
          
          <div style={styles.earningRow}>
            <span>❤️ Your Total Support Given</span>
            <strong style={{ color: Y }}>{stats.totalSupport.toLocaleString()} RWF</strong>
          </div>
          <div style={styles.earningRow}>
            <span>💑 Go to Couples (60%)</span>
            <strong style={{ color: "#22c55e" }}>{(stats.totalSupport * 0.6).toLocaleString()} RWF</strong>
          </div>
          <div style={styles.earningRow}>
            <span>🏢 Platform Fee (40%)</span>
            <strong style={{ color: Y }}>{(stats.totalSupport * 0.4).toLocaleString()} RWF</strong>
          </div>
          
          <div style={{ marginTop: "20px", padding: "12px", background: `${Y}15`, borderRadius: "10px" }}>
            <p style={{ fontSize: "12px", margin: 0, textAlign: "center" }}>
              💡 Thank you for supporting Rwandan couples! Your contributions help them preserve their precious memories.<br/>
              <strong style={{ color: "#22c55e" }}>60%</strong> of your support goes directly to the couples, <strong style={{ color: Y }}>40%</strong> helps maintain the platform.
            </p>
          </div>
          
          <Link to="/videos">
            <button style={{ ...styles.buttonOutline, marginTop: "20px", width: "100%" }}>🎬 Support More Couples →</button>
          </Link>
        </div>
      )}
      
      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={styles.modal} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>💳 Complete Payment</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Payment Method</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Phone Number</label>
              <input type="tel" placeholder="0788 123 456" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.input} />
              <p style={{ fontSize: "11px", color: textMuted, marginTop: "4px" }}>Enter the MTN or Airtel number registered with mobile money</p>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Amount</label>
              <input type="text" value={`${paymentAmount.toLocaleString()} RWF`} disabled style={{ ...styles.input, background: darkMode ? "#2a2a2a" : "#f5f5f5" }} />
            </div>
            
            <div style={{ background: `${Y}15`, borderRadius: "10px", padding: "12px", marginBottom: "20px", fontSize: "13px" }}>
              <p style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><FaLock size={12} /> Secure payment via Mobile Money</p>
              <p style={{ display: "flex", alignItems: "center", gap: "8px" }}><FaWhatsapp size={12} /> For support, contact +250 780 145 562</p>
            </div>
            
            <button onClick={() => activeTab === "subscription" ? handleSubscriptionPayment() : (activeTab === "support" ? handleSupportPayment() : handleBookingPayment())} disabled={loading} style={{ ...styles.button, width: "100%" }}>
              {loading ? "Processing..." : `Pay ${paymentAmount.toLocaleString()} RWF`}
            </button>
            <button onClick={() => setShowPaymentModal(false)} style={{ ...styles.buttonOutline, width: "100%", marginTop: "12px" }}>Cancel</button>
          </div>
        </div>
      )}
      
      {/* SUPPORT MODAL */}
      {showSupportModal && selectedCouple && (
        <div style={styles.modal} onClick={() => setShowSupportModal(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>❤️ Support {selectedCouple.couple}</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Payment Method</label>
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
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Phone Number</label>
              <input type="tel" placeholder="0788 123 456" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.input} />
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Amount</label>
              <input type="text" value={`${(customAmount ? parseInt(customAmount) : paymentAmount).toLocaleString()} RWF`} disabled style={{ ...styles.input, background: darkMode ? "#2a2a2a" : "#f5f5f5" }} />
            </div>
            
            <div style={{ background: `${Y}15`, borderRadius: "10px", padding: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span>💑 Couple receives ({commission.couple}%):</span>
                <strong style={{ color: "#22c55e" }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.couple / 100).toLocaleString()} RWF</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span>🏢 NY Entertainment fee ({commission.platform}%):</span>
                <strong style={{ color: Y }}>{((customAmount ? parseInt(customAmount) : paymentAmount) * commission.platform / 100).toLocaleString()} RWF</strong>
              </div>
              <div style={{ marginTop: "8px", fontSize: "10px", textAlign: "center", color: textMuted }}>
                Your support helps couples preserve their memories
              </div>
            </div>
            
            <button onClick={handleSupportPayment} disabled={loading} style={{ ...styles.button, width: "100%" }}>
              {loading ? "Processing..." : `❤️ Support with ${(customAmount ? parseInt(customAmount) : paymentAmount).toLocaleString()} RWF`}
            </button>
            <button onClick={() => setShowSupportModal(false)} style={{ ...styles.buttonOutline, width: "100%", marginTop: "12px" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}