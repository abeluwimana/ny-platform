// src/pages/booking/BookingForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', package: '', message: '',
  });
  const [loading, setLoading] = useState(false);

  const packagePrices = {
    'Traditional Wedding': { price: 250000, features: ['4K Video', '3 Hours Coverage', 'Highlight Reel'] },
    'Church Wedding': { price: 350000, features: ['4K Video', '4 Hours Coverage', 'Full Ceremony', 'Highlight Reel'] },
    'Reception Coverage': { price: 200000, features: ['HD Video', '3 Hours Coverage', 'Highlight Reel'] },
    'Full Wedding Package': { price: 650000, features: ['4K Video', 'Full Day Coverage', 'Drone Shots', 'Highlight Reel', 'Raw Footage'] },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const existing = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    
    // Get current logged in user
    const userEmail = localStorage.getItem('user_email');
    const userName = localStorage.getItem('user_name');
    const userRole = localStorage.getItem('user_role');
    
    const newBooking = {
      id: Date.now(),
      ...formData,
      price: packagePrices[formData.package]?.price || 0,
      status: "pending",
      createdAt: new Date().toISOString(),
      // 🔴 ONGERA IBI - Link booking to user
      userId: userEmail,  // Link by email
      clientName: userName || formData.name,
      clientRole: userRole || 'guest',
    };

    localStorage.setItem("wedding_bookings", JSON.stringify([...existing, newBooking]));

    setTimeout(() => {
      setLoading(false);
      navigate("/booking/confirmation", { state: { booking: newBooking } });
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💍 Book Your Wedding</h1>
        <p style={styles.subtitle}>Reserve your wedding videography session with NY Entertainment Rwanda</p>

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={styles.input} />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={styles.input} />
          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={styles.input} />
          <input type="date" name="date" value={formData.date} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} style={styles.input} />
          
          <select name="package" value={formData.package} onChange={handleChange} required style={styles.input}>
            <option value="">Select Package</option>
            <option value="Traditional Wedding">💒 Traditional Wedding - 250,000 RWF</option>
            <option value="Church Wedding">⛪ Church Wedding - 350,000 RWF</option>
            <option value="Reception Coverage">🎉 Reception Coverage - 200,000 RWF</option>
            <option value="Full Wedding Package">💍 Full Wedding Package - 650,000 RWF</option>
          </select>

          <textarea name="message" placeholder="Additional Details" rows="4" value={formData.message} onChange={handleChange} style={{ ...styles.input, resize: "none" }} />
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#ffffff",
    padding: "60px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "550px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    border: "1px solid #eee",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "32px",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#666",
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#000",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default BookingForm;