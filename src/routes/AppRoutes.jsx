// src/routes/AppRoutes.jsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import About from "../pages/About";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import BookingConfirmation from "../pages/booking/BookingConfirmation";
import BookingForm from "../pages/booking/BookingForm";
import ClientDashboard from "../pages/ClientDashboard";
import Contact from "../pages/Contact";
import CoupleDashboard from "../pages/couple/CoupleDashboard";
import CreatorDashboard from "../pages/creator/CreatorDashboard";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MyBookings from "../pages/MyBookings";
import Payment from "../pages/Payment";
import Post from "../pages/Post";
import PostDetail from "../pages/PostDetail";
import Privacy from "../pages/Privacy";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import Terms from "../pages/Terms";
import VideoDetailPage from "../pages/VideoDetailPage";
import Videos from "../pages/Videos";
import WeddingPage from "../pages/WeddingPage";

// ── PROTECTED ROUTE COMPONENT ─────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Check if user is logged in (any role)
  const isLoggedIn = 
    localStorage.getItem("user_logged_in") === "true" ||
    localStorage.getItem("admin_logged_in") === "true" ||
    localStorage.getItem("couple_logged_in") === "true" ||
    localStorage.getItem("creator_logged_in") === "true";
  
  const userRole = localStorage.getItem("user_role") || 
    (localStorage.getItem("admin_logged_in") === "true" ? "admin" :
     localStorage.getItem("couple_logged_in") === "true" ? "couple" :
     localStorage.getItem("creator_logged_in") === "true" ? "creator" : null);
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user role is not allowed, redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// ── ROLE REDIRECT COMPONENT ───────────────────────────────────────
const RoleRedirect = () => {
  const userRole = localStorage.getItem("user_role") ||
    (localStorage.getItem("admin_logged_in") === "true" ? "admin" :
     localStorage.getItem("couple_logged_in") === "true" ? "couple" :
     localStorage.getItem("creator_logged_in") === "true" ? "creator" : null);
  
  const roleMap = {
    admin: "/admin",
    couple: "/couple/dashboard",
    creator: "/creator/dashboard",
    client: "/client/dashboard"
  };
  
  const dashboardPath = roleMap[userRole] || "/client/dashboard";
  return <Navigate to={dashboardPath} replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/booking" element={<BookingForm />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/wedding/:id" element={<WeddingPage />} />
        <Route path="/video/:id/:type" element={<VideoDetailPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        
        {/* TERMS & PRIVACY */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* POST ROUTES */}
        <Route path="/posts" element={<Post />} />
        <Route path="/post/:id" element={<PostDetail />} />

        {/* AUTH ROUTES (redirect if already logged in) */}
        <Route path="/login" element={
          localStorage.getItem("user_logged_in") === "true" ||
          localStorage.getItem("admin_logged_in") === "true" ||
          localStorage.getItem("couple_logged_in") === "true" ||
          localStorage.getItem("creator_logged_in") === "true" 
            ? <Navigate to="/dashboard" replace /> 
            : <Login />
        } />
        <Route path="/register" element={
          localStorage.getItem("user_logged_in") === "true" ||
          localStorage.getItem("admin_logged_in") === "true" ||
          localStorage.getItem("couple_logged_in") === "true" ||
          localStorage.getItem("creator_logged_in") === "true"
            ? <Navigate to="/dashboard" replace />
            : <Register />
        } />
        
        {/* DASHBOARD REDIRECT */}
        <Route path="/dashboard" element={<RoleRedirect />} />
        
        {/* PROTECTED ROUTES */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        
        {/* ADMIN ONLY */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* CLIENT ONLY */}
        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={["client"]}>
            <Payment />
          </ProtectedRoute>
        } />
        
        {/* CREATOR ONLY */}
        <Route path="/creator/dashboard" element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <CreatorDashboard />
          </ProtectedRoute>
        } />
        
        {/* COUPLE ONLY */}
        <Route path="/couple/dashboard/:id?" element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <CoupleDashboard />
          </ProtectedRoute>
        } />
        
        {/* 404 - NOT FOUND */}
        <Route path="*" element={
          <div style={{ 
            minHeight: "60vh", 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center",
            textAlign: "center",
            padding: "40px"
          }}>
            <h1 style={{ fontSize: "80px", margin: 0 }}>404</h1>
            <h2>Page Not Found</h2>
            <p style={{ color: "#666" }}>The page you're looking for doesn't exist or has been moved.</p>
            <a href="/" style={{ marginTop: "20px" }}>
              <button style={{
                background: "#ffc107",
                color: "#111",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold"
              }}>Go Home</button>
            </a>
          </div>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default AppRoutes;