import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import AdminDashboard from "../pages/admin/AdminDashboard";
import BookingConfirmation from "../pages/booking/BookingConfirmation";
import BookingForm from "../pages/booking/BookingForm";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MyBookings from "../pages/MyBookings";
import Register from "../pages/Register";
import VideoDetailPage from "../pages/VideoDetailPage";
import Videos from "../pages/Videos";
import WeddingPage from "../pages/WeddingPage";

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
        
        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* PROTECTED ROUTES */}
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default AppRoutes;