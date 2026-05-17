import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";

function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userLoggedIn = localStorage.getItem("user_logged_in");
    const adminLoggedIn = localStorage.getItem("admin_logged_in");
    const role = localStorage.getItem("user_role");
    const name = localStorage.getItem("user_name");
    
    const loggedIn = (userLoggedIn === "true" || adminLoggedIn === "true");
    
    setIsLoggedIn(loggedIn);
    setUserRole(role || "");
    setUserName(name || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_logged_in");
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("admin_email");
    
    setIsLoggedIn(false);
    setUserRole("");
    setUserName("");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav
      style={{
        background: "#000",
        color: "#fff",
        padding: "15px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
      }}
    >
      {/* LEFT SIDE - Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src={logo}
          alt="NY Logo"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "50%",
            boxShadow: "0 0 10px rgba(255,255,255,0.2)",
          }}
        />

        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          NY Entertainment Rwanda
        </h2>
      </div>

      {/* RIGHT SIDE - Navigation Links */}
      <div
        style={{
          display: "flex",
          gap: "25px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/videos" style={styles.link}>Videos</Link>
        <Link to="/booking" style={styles.link}>Book</Link>

        {isLoggedIn && (
          <>
            {userRole === "client" && (
              <Link to="/my-bookings" style={styles.clientLink}>
                📋 My Bookings
              </Link>
            )}

            {userRole === "creator" && (
              <Link to="/creator/dashboard" style={styles.creatorLink}>
                🎬 Creator
              </Link>
            )}

            {userRole === "admin" && (
              <Link to="/admin" style={styles.adminLink}>
                📊 Admin
              </Link>
            )}

            <span style={styles.welcomeText}>
              👋 {userName || (userRole === "admin" ? "Admin" : userRole)}
            </span>
            
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Logout
            </button>
          </>
        )}

        {!isLoggedIn && (
          <Link to="/login" style={styles.loginLink}>
            🔐 Login
          </Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
    transition: "opacity 0.3s",
  },
  loginLink: {
    color: "#28a745",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "16px",
  },
  adminLink: {
    color: "#ffc107",
    textDecoration: "none",
    fontWeight: "bold",
  },
  creatorLink: {
    color: "#17a2b8",
    textDecoration: "none",
    fontWeight: "bold",
  },
  clientLink: {
    color: "#28a745",
    textDecoration: "none",
    fontWeight: "bold",
  },
  welcomeText: {
    color: "#ffc107",
    fontSize: "14px",
  },
  logoutBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "6px 15px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default Navbar;