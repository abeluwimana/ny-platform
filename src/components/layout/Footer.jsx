import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";

function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userLoggedIn = localStorage.getItem("user_logged_in");
    const adminLoggedIn = localStorage.getItem("admin_logged_in");
    const role = localStorage.getItem("user_role");

    setIsLoggedIn(userLoggedIn === "true" || adminLoggedIn === "true");
    setUserRole(role || "");
  }, []);

  return (
    <footer
      style={{
        background: "#000",
        color: "#fff",
        width: "100%",
        marginTop: "auto",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* MAIN FOOTER */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "70px 20px 50px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "50px",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            flex: 2,
            minWidth: "280px",
            maxWidth: "500px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "25px",
            }}
          >
            <img
              src={logo}
              alt="NY Logo"
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 0 15px rgba(255,255,255,0.15)",
              }}
            />

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            >
              NY Entertainment Rwanda
            </h2>
          </div>

          {/* Description */}
          <p
            style={{
              opacity: 0.8,
              lineHeight: "1.9",
              marginBottom: "30px",
              fontSize: "15px",
              maxWidth: "450px",
            }}
          >
            Premium wedding storytelling platform for modern couples in Rwanda.
            Capture your traditional ceremony, church wedding, and reception
            with cinematic quality and unforgettable memories.
          </p>

          {/* Contact */}
          <div>
            <div style={contactItem}>
              <FaEnvelope style={contactIcon} />
              <span style={contactText}>
                nyentertainmentrwanda@gmail.com
              </span>
            </div>

            <div style={contactItem}>
              <FaPhone style={contactIcon} />
              <span style={contactText}>+250 780 145 562</span>
            </div>

            <div style={contactItem}>
              <FaMapMarkerAlt style={contactIcon} />
              <span style={contactText}>Kigali, Rwanda</span>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div
          style={{
            flex: 1,
            minWidth: "180px",
            paddingTop: "10px",
          }}
        >
          <h3 style={sectionTitle}>Quick Links</h3>

          <div style={linksContainer}>
            <Link to="/" style={linkStyle}>
              Home
            </Link>

            <Link to="/videos" style={linkStyle}>
              Videos
            </Link>

            <Link to="/booking" style={linkStyle}>
              Book Now
            </Link>

            {!isLoggedIn && (
              <>
                <Link to="/login" style={linkStyle}>
                  Login
                </Link>

                <Link to="/register" style={linkStyle}>
                  Register
                </Link>
              </>
            )}

            {isLoggedIn && userRole === "client" && (
              <Link to="/my-bookings" style={linkStyle}>
                My Bookings
              </Link>
            )}

            {isLoggedIn && userRole === "admin" && (
              <Link to="/admin" style={linkStyle}>
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* SOCIAL MEDIA */}
        <div
          style={{
            flex: 1,
            minWidth: "200px",
            paddingTop: "10px",
          }}
        >
          <h3 style={sectionTitle}>Follow Us</h3>

          <div
            style={{
              display: "flex",
              gap: "18px",
              marginTop: "25px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              style={socialButton}
            >
              <FaInstagram />
            </a>

            <a
              href="https://youtu.be/sn1DteOIg0M?si=Em_quW4X4Fes2kON"
              target="_blank"
              rel="noreferrer"
              style={socialButton}
            >
              <FaYoutube />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              style={socialButton}
            >
              <FaTiktok />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              style={socialButton}
            >
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "18px 20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            opacity: 0.65,
            fontSize: "13px",
            letterSpacing: "0.5px",
          }}
        >
          © 2026 NY Entertainment Rwanda. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* SECTION TITLE */
const sectionTitle = {
  marginBottom: "25px",
  fontSize: "18px",
  fontWeight: "bold",
  borderLeft: "3px solid #ffc107",
  paddingLeft: "12px",
};

/* LINKS */
const linksContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  opacity: 0.8,
  transition: "0.3s",
  fontSize: "15px",
};

/* SOCIAL BUTTON */
const socialButton = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.08)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  fontSize: "20px",
  textDecoration: "none",
  transition: "0.3s",
  cursor: "pointer",
};

/* CONTACT */
const contactItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "15px",
};

const contactIcon = {
  fontSize: "15px",
  color: "#ffc107",
  minWidth: "18px",
};

const contactText = {
  opacity: 0.8,
  fontSize: "14px",
  lineHeight: "1.6",
};

export default Footer;