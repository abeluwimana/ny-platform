// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import { FaBars, FaMoon, FaSearch, FaSun, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { useTheme } from "../../context/ThemeContext";

function Navbar() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const userOk  = localStorage.getItem("user_logged_in")  === "true";
    const adminOk = localStorage.getItem("admin_logged_in") === "true";
    setIsLoggedIn(userOk || adminOk);
    setUserRole(localStorage.getItem("user_role") || "");
    setUserName(localStorage.getItem("user_name") || "");
  }, []);

  const logout = () => {
    ["user_logged_in","admin_logged_in","user_email","user_role","user_name","admin_email"]
      .forEach(k => localStorage.removeItem(k));
    setIsLoggedIn(false); setUserRole(""); setUserName("");
    setMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) { navigate(`/search?q=${encodeURIComponent(searchVal)}`); setSearchOpen(false); setSearchVal(""); }
  };

  const bg = scrolled
    ? darkMode ? "rgba(10,10,10,0.97)" : "rgba(0,0,0,0.97)"
    : darkMode ? "#111" : "#000";

  const NAV_LINKS = [
    { to: "/",        label: "Home" },
    { to: "/videos",  label: "Videos" },
    { to: "/posts",   label: "Posts" },
    { to: "/booking", label: "Booking" },
    { to: "/about",   label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const ROLE_LINKS = {
    client:  { to: "/client/dashboard",  label: "📊 Dashboard", color: "#28a745" },
    creator: { to: "/creator/dashboard", label: "🎬 Creator",   color: "#17a2b8" },
    admin:   { to: "/admin",             label: "📊 Admin",     color: "#ffc107" },
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: bg,
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      transition: "background 0.3s, box-shadow 0.3s",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.35)" : "none",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 68, gap: 16, position: "relative" }}>

        {/* ── LOGO ── */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 11, flexShrink: 0 }} onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="NY Logo" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #ffc107" }} />
          <span style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2, whiteSpace: "nowrap" }}>
            NY Entertainment<br />
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Rwanda</span>
          </span>
        </Link>

        {/* ── DESKTOP NAV LINKS ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{ color: "rgba(255,255,255,0.82)", textDecoration: "none", fontSize: 13, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 20 }}>
              {l.label}
            </Link>
          ))}

          {/* Search */}
          <button onClick={() => setSearchOpen(s => !s)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center" }}>
            <FaSearch />
          </button>

          {/* Dark mode */}
          <button onClick={toggleDarkMode} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#ffc107", fontSize: 15, cursor: "pointer", padding: "8px 10px", borderRadius: "50%", display: "flex", alignItems: "center" }}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Auth */}
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
              {ROLE_LINKS[userRole] && (
                <Link to={ROLE_LINKS[userRole].to} style={{ color: ROLE_LINKS[userRole].color, textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "6px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)" }}>
                  {ROLE_LINKS[userRole].label}
                </Link>
              )}
              <Link to="/profile" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 13, padding: "6px 10px" }}>👤</Link>
              <span style={{ color: "#ffc107", fontSize: 12, fontWeight: 600, background: "rgba(255,193,7,0.12)", padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(255,193,7,0.25)" }}>
                {userName || userRole}
              </span>
              <button onClick={logout} style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: 20, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ marginLeft: 6, background: "#ffc107", color: "#000", textDecoration: "none", fontSize: 13, fontWeight: 700, padding: "8px 20px", borderRadius: 24, letterSpacing: "0.04em" }}>
              Login
            </Link>
          )}
        </div>

        {/* ── MOBILE RIGHT ACTIONS ── */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={toggleDarkMode} className="ny-hamburger" style={{ background: "none", border: "none", color: "#ffc107", fontSize: 16, cursor: "pointer", padding: 8, display: "none" }}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => { setMenuOpen(o => !o); setSearchOpen(false); }} className="ny-hamburger" style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: "9px 11px", borderRadius: 10, display: "none", alignItems: "center", justifyContent: "center" }}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* ── SEARCH BAR (desktop dropdown) ── */}
      {searchOpen && (
        <div style={{ background: "rgba(0,0,0,0.95)", padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", maxWidth: 560, margin: "0 auto", background: "rgba(255,255,255,0.08)", borderRadius: 40, overflow: "hidden", padding: "4px 4px 4px 18px", border: "1px solid rgba(255,255,255,0.12)" }}>
            <FaSearch style={{ alignSelf: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }} />
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search videos, posts, creators…" autoFocus
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, padding: "10px 12px" }} />
            <button type="submit" style={{ background: "#ffc107", color: "#000", border: "none", borderRadius: 30, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Go</button>
          </form>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div style={{ background: darkMode ? "#0d0d0d" : "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 20px 24px" }}>
          {/* Mobile search */}
          <form onSubmit={handleSearch} style={{ display: "flex", background: "rgba(255,255,255,0.07)", borderRadius: 30, overflow: "hidden", padding: "4px 4px 4px 16px", marginBottom: 18, border: "1px solid rgba(255,255,255,0.1)" }}>
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search…"
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, padding: "8px 10px" }} />
            <button type="submit" style={{ background: "#ffc107", color: "#000", border: "none", borderRadius: 24, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Go</button>
          </form>

          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 15, fontWeight: 500, padding: "12px 14px", borderRadius: 10, display: "block" }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "14px 0" }} />

          {/* Auth section */}
          {isLoggedIn ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "#ffc107", fontSize: 13, fontWeight: 600, padding: "8px 14px", background: "rgba(255,193,7,0.1)", borderRadius: 10, border: "1px solid rgba(255,193,7,0.2)" }}>
                👋 {userName || userRole}
              </div>
              {ROLE_LINKS[userRole] && (
                <Link to={ROLE_LINKS[userRole].to} onClick={() => setMenuOpen(false)}
                  style={{ color: ROLE_LINKS[userRole].color, textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "11px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                  {ROLE_LINKS[userRole].label}
                </Link>
              )}
              <Link to="/profile" onClick={() => setMenuOpen(false)}
                style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 14, padding: "11px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
                👤 My Profile
              </Link>
              <button onClick={logout} style={{ background: "#dc3545", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
                🚪 Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ background: "#ffc107", color: "#000", textDecoration: "none", fontSize: 15, fontWeight: 700, padding: "13px", borderRadius: 10, textAlign: "center" }}>
                🔐 Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                style={{ background: "rgba(255,255,255,0.07)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600, padding: "13px", borderRadius: 10, textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                📝 Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;