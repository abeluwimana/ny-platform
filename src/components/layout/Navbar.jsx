// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import {
  FaBars, FaBookmark, FaCalendar, FaHome, FaInfo,
  FaPhone, FaSearch, FaSignInAlt, FaTimes,
  FaUser, FaUserPlus, FaVideo
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";

const Y   = "#ffc107";
const BLK = "#000000";
const WHT = "#ffffff";

const NAV_LINKS = [
  { to: "/",        label: "Home",    icon: <FaHome /> },
  { to: "/videos",  label: "Videos",  icon: <FaVideo /> },
  { to: "/posts",   label: "Posts",   icon: <FaBookmark /> },
  { to: "/booking", label: "Booking", icon: <FaCalendar /> },
  { to: "/about",   label: "About",   icon: <FaInfo /> },
  { to: "/contact", label: "Contact", icon: <FaPhone /> },
];

const ROLE_LINKS = {
  client:  { to: "/client/dashboard",  label: "📊 My Dashboard", color: "#28a745" },
  creator: { to: "/creator/dashboard", label: "🎬 Creator Panel", color: "#17a2b8" },
  admin:   { to: "/admin",             label: "📊 Admin Panel",   color: Y },
  couple:  { to: "/couple/dashboard",  label: "💑 Wedding Panel", color: Y },
};

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole,   setUserRole]   = useState("");
  const [userName,   setUserName]   = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchVal,   setSearchVal]   = useState("");
  const [scrolled,    setScrolled]    = useState(false);

  useEffect(() => {
    const css = document.createElement("style");
    css.textContent = `
      .ny-link { transition: color 0.2s; }
      .ny-link:hover { color: ${Y} !important; }
      .ny-hamburger { display: none !important; }
      .ny-desktop   { display: flex !important; }
      @media (max-width: 900px) {
        .ny-hamburger { display: flex !important; }
        .ny-desktop   { display: none !important; }
      }
      @media (max-width: 480px) {
        .ny-logo-text { display: none !important; }
      }
      .ny-sidebar-link { transition: background 0.18s, color 0.18s; }
      .ny-sidebar-link:hover { background: rgba(255,193,7,0.08) !important; color: ${Y} !important; }
      .ny-sidebar-link.active-link { background: rgba(255,193,7,0.12) !important; color: ${Y} !important; border-left: 3px solid ${Y}; }
    `;
    document.head.appendChild(css);
    return () => document.head.removeChild(css);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    const userOk  = localStorage.getItem("user_logged_in")  === "true";
    const adminOk = localStorage.getItem("admin_logged_in") === "true";
    const coupleOk = localStorage.getItem("couple_logged_in") === "true";
    const creatorOk = localStorage.getItem("creator_logged_in") === "true";
    setIsLoggedIn(userOk || adminOk || coupleOk || creatorOk);
    setUserRole(localStorage.getItem("user_role") || "");
    setUserName(localStorage.getItem("user_name") || "");
  }, []);

  const logout = () => {
    ["user_logged_in","admin_logged_in","couple_logged_in","creator_logged_in",
     "user_email","user_role","user_name","admin_email","couple_email","creator_email"]
      .forEach(k => localStorage.removeItem(k));
    setIsLoggedIn(false); setUserRole(""); setUserName("");
    setSidebarOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal)}`);
      setSearchOpen(false); setSearchVal(""); setSidebarOpen(false);
    }
  };

  const isActive = (to) => location.pathname === to;
  const navBg = scrolled ? "rgba(0,0,0,0.96)" : BLK;

  return (
    <>
      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 900,
        background: navBg,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: scrolled ? "0 4px 28px rgba(0,0,0,0.4)" : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", gap: 12 }}>

          {/* LOGO */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <img src={logo} alt="NY" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: `2px solid ${Y}` }} />
            <div className="ny-logo-text">
              <div style={{ fontSize: 17, fontWeight: 800, color: WHT, lineHeight: 1.1 }}>NY Entertainment</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: Y, letterSpacing: "0.1em", textTransform: "uppercase" }}>Rwanda</div>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="ny-desktop" style={{ alignItems: "center", gap: 2, marginLeft: "auto" }}>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} className="ny-link"
                style={{ color: isActive(l.to) ? Y : "rgba(255,255,255,0.78)", textDecoration: "none", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", padding: "6px 13px", borderRadius: 20, background: isActive(l.to) ? "rgba(255,193,7,0.1)" : "none" }}>
                {l.label}
              </Link>
            ))}

            {/* Search btn */}
            <button onClick={() => setSearchOpen(s => !s)}
              style={{ background: searchOpen ? "rgba(255,193,7,0.12)" : "none", border: "none", color: searchOpen ? Y : "rgba(255,255,255,0.65)", fontSize: 15, cursor: "pointer", padding: "8px 11px", borderRadius: 20, display: "flex", alignItems: "center", marginLeft: 4 }}>
              <FaSearch />
            </button>

            {/* Auth - Desktop */}
            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
                {ROLE_LINKS[userRole] && (
                  <Link to={ROLE_LINKS[userRole].to}
                    style={{ color: ROLE_LINKS[userRole].color, textDecoration: "none", fontSize: 12, fontWeight: 700, padding: "6px 13px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {ROLE_LINKS[userRole].label}
                  </Link>
                )}
                {/* ✅ FIXED: Only show PAYMENT link for CLIENT role */}
                {userRole === "client" && (
                  <Link to="/payment" style={{ color: Y, textDecoration: "none", fontSize: 12, fontWeight: 700, padding: "6px 13px", borderRadius: 20, background: "rgba(255,193,7,0.12)", border: `1px solid ${Y}` }}>
                    💳 Payment
                  </Link>
                )}
                <Link to="/profile" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 13, padding: "6px 10px" }}>👤</Link>
                <span style={{ color: Y, fontSize: 12, fontWeight: 600, background: "rgba(255,193,7,0.1)", padding: "5px 13px", borderRadius: 20, border: `1px solid rgba(255,193,7,0.25)` }}>
                  {userName || userRole}
                </span>
                <button onClick={logout}
                  style={{ background: "#dc3545", color: WHT, border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login"
                style={{ marginLeft: 8, background: Y, color: BLK, textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "8px 22px", borderRadius: 24 }}>
                Login
              </Link>
            )}
          </div>

          {/* MOBILE: search + hamburger */}
          <div className="ny-hamburger" style={{ marginLeft: "auto", display: "none", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSearchOpen(s => !s)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 17, cursor: "pointer", padding: 8, display: "flex" }}>
              <FaSearch />
            </button>
            <button onClick={() => setSidebarOpen(true)}
              style={{ background: "rgba(255,255,255,0.09)", border: "none", color: WHT, fontSize: 19, cursor: "pointer", padding: "9px 12px", borderRadius: 10, display: "flex", alignItems: "center" }}>
              <FaBars />
            </button>
          </div>
        </div>

        {/* SEARCH DROPDOWN */}
        {searchOpen && (
          <div style={{ background: "rgba(0,0,0,0.97)", padding: "12px 20px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <form onSubmit={handleSearch} style={{ display: "flex", maxWidth: 560, margin: "0 auto", background: "rgba(255,255,255,0.07)", borderRadius: 40, border: "1px solid rgba(255,255,255,0.12)", padding: "4px 4px 4px 18px", alignItems: "center", gap: 8 }}>
              <FaSearch style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, flexShrink: 0 }} />
              <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search videos, posts, creators…" autoFocus
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: WHT, fontSize: 14, padding: "9px 0" }} />
              <button type="submit"
                style={{ background: Y, color: BLK, border: "none", borderRadius: 30, padding: "9px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
                Search
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* SIDEBAR OVERLAY */}
      <div onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 0.3s",
        }} />

      {/* Sidebar panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 300, maxWidth: "85vw",
        zIndex: 1001,
        background: "#0d0d0d",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column",
        transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
        overflowY: "auto",
      }}>

        {/* Sidebar header */}
        <div style={{ padding: "18px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={logo} alt="NY" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: `2px solid ${Y}` }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: WHT }}>NY Entertainment</div>
              <div style={{ fontSize: 10, color: Y, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Rwanda</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", color: WHT, fontSize: 18, cursor: "pointer", padding: "8px 10px", borderRadius: 10, display: "flex", alignItems: "center" }}>
            <FaTimes />
          </button>
        </div>

        {/* User badge (if logged in) */}
        {isLoggedIn && (
          <div style={{ margin: "14px 16px 0", padding: "12px 16px", background: "rgba(255,193,7,0.08)", border: `1px solid rgba(255,193,7,0.2)`, borderRadius: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>Logged in as</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: Y }}>👋 {userName || userRole}</div>
            {ROLE_LINKS[userRole] && (
              <div style={{ fontSize: 11, color: ROLE_LINKS[userRole].color, marginTop: 3 }}>{ROLE_LINKS[userRole].label}</div>
            )}
          </div>
        )}

        {/* Search inside sidebar */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", background: "rgba(255,255,255,0.07)", borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)", padding: "4px 4px 4px 14px", alignItems: "center", gap: 8 }}>
            <FaSearch style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }} />
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search…"
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: WHT, fontSize: 14, padding: "8px 0" }} />
            <button type="submit"
              style={{ background: Y, color: BLK, border: "none", borderRadius: 24, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Go
            </button>
          </form>
        </div>

        {/* Nav links */}
        <div style={{ padding: "10px 10px 0", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", padding: "8px 10px 6px" }}>Navigation</div>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to}
              className={`ny-sidebar-link ${isActive(l.to) ? "active-link" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: isActive(l.to) ? Y : "rgba(255,255,255,0.78)", fontSize: 15, fontWeight: 500, padding: "13px 14px", borderRadius: 12, marginBottom: 2, borderLeft: isActive(l.to) ? `3px solid ${Y}` : "3px solid transparent" }}>
              <span style={{ fontSize: 16, opacity: 0.7, width: 18, textAlign: "center" }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}

          {/* Role-specific link */}
          {isLoggedIn && ROLE_LINKS[userRole] && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 10px" }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", padding: "8px 10px 6px" }}>My Account</div>
              <Link to={ROLE_LINKS[userRole].to}
                className="ny-sidebar-link"
                style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: ROLE_LINKS[userRole].color, fontSize: 15, fontWeight: 700, padding: "13px 14px", borderRadius: 12, marginBottom: 2, borderLeft: "3px solid transparent" }}>
                <span style={{ width: 18 }}>📊</span>
                {ROLE_LINKS[userRole].label}
              </Link>
              {/* ✅ FIXED: Only show PAYMENT link in sidebar for CLIENT role */}
              {userRole === "client" && (
                <Link to="/payment"
                  className="ny-sidebar-link"
                  style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: Y, fontSize: 15, fontWeight: 700, padding: "13px 14px", borderRadius: 12, marginBottom: 2, borderLeft: "3px solid transparent", background: "rgba(255,193,7,0.05)" }}>
                  <span style={{ width: 18 }}>💰</span>
                  Payment Center
                </Link>
              )}
              <Link to="/profile"
                className="ny-sidebar-link"
                style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "rgba(255,255,255,0.78)", fontSize: 15, fontWeight: 500, padding: "13px 14px", borderRadius: 12, marginBottom: 2, borderLeft: "3px solid transparent" }}>
                <span style={{ width: 18 }}><FaUser /></span>
                My Profile
              </Link>
            </>
          )}
        </div>

        {/* Bottom auth actions */}
        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          {isLoggedIn ? (
            <button onClick={logout}
              style={{ width: "100%", padding: "14px", background: "#dc3545", color: WHT, border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              🚪 Logout
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link to="/login" onClick={() => setSidebarOpen(false)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: Y, color: BLK, textDecoration: "none", fontSize: 15, fontWeight: 700, padding: "14px", borderRadius: 14, textAlign: "center" }}>
                <FaSignInAlt /> Login
              </Link>
              <Link to="/register" onClick={() => setSidebarOpen(false)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.07)", color: WHT, textDecoration: "none", fontSize: 15, fontWeight: 600, padding: "14px", borderRadius: 14, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                <FaUserPlus /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}