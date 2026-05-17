// src/pages/booking/BookingConfirmation.jsx
import { useLocation, useNavigate } from 'react-router-dom';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>No booking found</h2>
          <button onClick={() => navigate('/booking')} style={styles.button}>Go to Booking</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>
        <h1 style={styles.confirmationTitle}>Booking Confirmed!</h1>
        <p style={styles.subtitle}>Thank you {booking.name} for choosing NY Entertainment</p>
        
        <div style={styles.detailsBox}>
          <h3>📋 Booking Details</h3>
          <p><strong>Booking ID:</strong> #{booking.id}</p>
          <p><strong>Package:</strong> {booking.package}</p>
          <p><strong>Price:</strong> {booking.price?.toLocaleString()} RWF</p>
          <p><strong>Event Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Email:</strong> {booking.email}</p>
          <p><strong>Phone:</strong> {booking.phone}</p>
          {booking.message && <p><strong>Requests:</strong> {booking.message}</p>}
          <div style={styles.statusBox}>Status: Pending Review</div>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/booking')} style={styles.secondaryButton}>📅 New Booking</button>
          <button onClick={() => navigate('/')} style={styles.outlineButton}>🏠 Home</button>
        </div>
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
  successIcon: { fontSize: "60px", textAlign: "center" },
  confirmationTitle: { textAlign: "center", color: "#28a745", marginBottom: "10px", fontSize: "32px" },
  subtitle: { textAlign: "center", marginBottom: "30px", color: "#666" },
  detailsBox: { background: "#f8f9fa", padding: "20px", borderRadius: "10px", marginBottom: "25px" },
  statusBox: { marginTop: "15px", padding: "10px", background: "#fff3cd", borderRadius: "8px", color: "#856404", textAlign: "center" },
  buttonGroup: { display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" },
  button: { padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
  secondaryButton: { padding: "12px 24px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
  outlineButton: { padding: "12px 24px", background: "transparent", color: "#333", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer" },
};

export default BookingConfirmation;