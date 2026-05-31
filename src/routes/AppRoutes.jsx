import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import About from "../pages/About";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import BookingConfirmation from "../pages/booking/BookingConfirmation";
import BookingForm from "../pages/booking/BookingForm";
import ClientDashboard from "../pages/ClientDashboard";
import Contact from "../pages/Contact";
import CoupleDashboard from "../pages/couple/CoupleDashboard"; // ← ADD THIS
import CreatorDashboard from "../pages/creator/CreatorDashboard";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MyBookings from "../pages/MyBookings";
import Post from "../pages/Post";
import PostDetail from "../pages/PostDetail";
import Privacy from "../pages/Privacy";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import Terms from "../pages/Terms";
import VideoDetailPage from "../pages/VideoDetailPage";
import Videos from "../pages/Videos";
import WeddingPage from "../pages/WeddingPage";

// Add route

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
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        
        {/* TERMS & PRIVACY */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* POST ROUTES */}
        <Route path="/posts" element={<Post />} />
        <Route path="/post/:id" element={<PostDetail />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* PROTECTED ROUTES */}
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/couple/dashboard/:id?" element={<CoupleDashboard />} />  {/* ← ADD THIS */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default AppRoutes;