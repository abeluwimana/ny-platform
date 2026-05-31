import { useEffect, useState } from "react";
import {
  FaEnvelope, FaFacebook, FaHeart, FaInstagram,
  FaMapMarkerAlt, FaPhone, FaTiktok, FaWhatsapp, FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { useTheme } from "../../context/ThemeContext";

const Y   = "#ffc107";
const WHT = "#ffffff";

function Footer() {
  const { darkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole,   setUserRole]   = useState("");
  const [email,      setEmail]      = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const userOk  = localStorage.getItem("user_logged_in")  === "true";
    const adminOk = localStorage.getItem("admin_logged_in") === "true";
    setIsLoggedIn(userOk || adminOk);
    setUserRole(localStorage.getItem("user_role") || "");
  }, []);

  const bg = darkMode ? "#0d0d0d" : "#000";

  const SOCIAL = [
    { icon: <FaInstagram />, href: "https://instagram.com",            label: "Instagram", color: "#E1306C" },
    { icon: <FaYoutube />,   href: "https://youtube.com",              label: "YouTube",   color: "#FF0000" },
    { icon: <FaTiktok />,    href: "https://tiktok.com",               label: "TikTok",    color: WHT },
    { icon: <FaFacebook />,  href: "https://facebook.com",             label: "Facebook",  color: "#1877F2" },
    { icon: <FaWhatsapp />,  href: "https://wa.me/250780145562",       label: "WhatsApp",  color: "#25D366" },
  ];

  const SERVICES_LINKS = [
    "Wedding Videography", "DOTE Coverage", "Birthday Parties",
    "Funeral Ceremonies", "Graduations", "Corporate Events",
  ];

  const QUICK_LINKS = [
    { to: "/",        label: "Home" },
    { to: "/videos",  label: "Videos" },
    { to: "/posts",   label: "Posts" },
    { to: "/booking", label: "Book Now" },
    { to: "/about",   label: "About Us" },
    { to: "/contact", label: "Contact" },
    { to: "/terms",   label: "Terms of Service" },
    { to: "/privacy", label: "Privacy Policy" },
    ...(!isLoggedIn ? [{ to: "/login", label: "Login" }, { to: "/register", label: "Register" }] : []),
    ...(isLoggedIn && userRole === "client"  ? [{ to: "/my-bookings", label: "My Bookings" }] : []),
    ...(isLoggedIn && userRole === "creator" ? [{ to: "/creator/dashboard", label: "Creator Dashboard" }] : []),
    ...(isLoggedIn && userRole === "admin"   ? [{ to: "/admin", label: "Admin Dashboard" }] : []),
  ];

  return (
    <footer style={{ background: bg, color: WHT, width: "100%", marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.07)", transition: "background 0.3s" }}>

      {/* ── TOP STRIP ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "22px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Follow Us:</span>
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: s.color, fontSize: 16, textDecoration: "none", transition: "all 0.2s", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = WHT; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = s.color; e.currentTarget.style.transform = ""; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#25D366", color: WHT, textDecoration: "none", padding: "9px 20px", borderRadius: 30, fontSize: 13, fontWeight: 700 }}>
            <FaWhatsapp /> Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 50px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px 40px" }}>

        {/* BRAND COLUMN */}
        <div style={{ gridColumn: "span 1", minWidth: 220 }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <img src={logo} alt="NY Logo" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${Y}` }} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: WHT, lineHeight: 1.2 }}>NY Entertainment</div>
              <div style={{ fontSize: 11, color: Y, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Rwanda</div>
            </div>
          </Link>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.85, marginBottom: 24 }}>
            Rwanda's premier event media platform — capturing weddings, DOTE ceremonies, birthdays, funerals, and more with cinematic quality across all 30 districts.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: <FaEnvelope />, text: "nyentertainmentrwanda@gmail.com", href: "mailto:nyentertainmentrwanda@gmail.com" },
              { icon: <FaPhone />,    text: "+250 780 145 562",                href: "tel:+250780145562" },
              { icon: <FaMapMarkerAlt />, text: "Kamonyi, Rwanda",            href: "#" },
            ].map((c, i) => (
              <a key={i} href={c.href} style={{ display: "flex", alignItems: "flex-start", gap: 10, textDecoration: "none" }}>
                <span style={{ color: Y, fontSize: 14, marginTop: 2, flexShrink: 0 }}>{c.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.5 }}>{c.text}</span>
              </a>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: Y, marginBottom: 22, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Quick Links</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QUICK_LINKS.map((l, i) => (
              <Link key={i} to={l.to} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = Y}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}>
                → {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* SERVICES */}
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: Y, marginBottom: 22, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Our Services</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SERVICES_LINKS.map((s, i) => (
              <Link key={i} to="/booking" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = Y}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}>
                → {s}
              </Link>
            ))}
          </div>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: Y, marginBottom: 22, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Newsletter</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>
            Get updates on new events, featured videos, and exclusive offers.
          </p>
          {subscribed ? (
            <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#4ade80" }}>
              ✅ You're subscribed!
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
                  style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, color: WHT, fontSize: 14, outline: "none", transition: "border 0.2s" }}
                  onFocus={e => e.target.style.borderColor = Y}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button onClick={() => { if (email.trim()) setSubscribed(true); }}
                  style={{ width: "100%", padding: "12px", background: Y, color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffca2c"}
                  onMouseLeave={e => e.currentTarget.style.background = Y}>
                  Subscribe →
                </button>
              </div>
            </div>
          )}

          {/* Stats badges */}
          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            {[["500+", "Events"], ["200+", "Clients"], ["30", "Districts"]].map(([n, l]) => (
              <div key={l} style={{ background: "rgba(255,193,7,0.08)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: Y }}>{n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            © 2026 NY Entertainment Rwanda. All rights reserved.
          </p>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.25)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            Made with <FaHeart style={{ color: Y, fontSize: 11 }} /> in Rwanda
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;