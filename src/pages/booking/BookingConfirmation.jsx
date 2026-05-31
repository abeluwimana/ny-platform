// src/pages/booking/BookingConfirmation.jsx
import { useLocation, useNavigate } from 'react-router-dom';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  // Helper functions for readable labels
  const getEventTypeLabel = (type) => {
    const types = {
      wedding: 'Wedding',
      birthday: 'Birthday Party',
      funeral: 'Funeral Ceremony',
      graduation: 'Graduation',
      corporate: 'Corporate Event'
    };
    return types[type] || type;
  };

  const getWeddingPartLabel = (part) => {
    const parts = {
      dote_part: 'DOTE Ceremony',
      church: 'Church Wedding',
      reception: 'Reception',
      traditional: 'Traditional Dance'
    };
    return parts[part] || part;
  };

  const getPackageLabel = (pkgId) => {
    const packages = {
      basic: 'Basic Package',
      premium: 'Premium Package',
      luxury: 'Luxury Package',
      full: 'Full Wedding Package'
    };
    return packages[pkgId] || pkgId;
  };

  const getServiceLabel = (serviceId) => {
    const services = {
      videography: 'Videography',
      photography: 'Photography',
      drone: 'Drone Coverage',
      sound: 'Sound System',
      decoration: 'Decoration',
      cake: 'Cake Services',
      catering: 'Catering',
      mc: 'MC & Protocol',
      streaming: 'Live Streaming',
      photobooth: 'Photo Booth',
      dancer: 'Traditional Dancer',
      album: 'Photo Album'
    };
    return services[serviceId] || serviceId;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-RW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!booking) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>No booking found</h2>
          <p style={styles.errorText}>We couldn't find your booking information.</p>
          <button onClick={() => navigate('/booking')} style={styles.primaryButton}>Go to Booking</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>
        <h1 style={styles.confirmationTitle}>Booking Submitted!</h1>
        <p style={styles.subtitle}>Thank you {booking.name} for choosing NY Entertainment Rwanda</p>

        <div style={styles.detailsBox}>
          <h3 style={styles.detailsTitle}>📋 Booking Details</h3>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Booking ID:</span>
            <span style={styles.detailValue}>#{booking.id}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Status:</span>
            <span style={styles.statusBadge}>⏳ Pending Admin Review</span>
          </div>

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>🎊 Event Information</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Event Type:</span>
            <span style={styles.detailValue}>{getEventTypeLabel(booking.eventType)}</span>
          </div>

          {booking.weddingParts && booking.weddingParts.length > 0 && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Wedding Parts:</span>
              <span style={styles.detailValue}>
                {booking.weddingParts.map(p => getWeddingPartLabel(p)).join(', ')}
              </span>
            </div>
          )}

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Event Date:</span>
            <span style={styles.detailValue}>{formatDate(booking.date)}</span>
          </div>

          {(booking.startTime || booking.endTime) && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Event Time:</span>
              <span style={styles.detailValue}>
                {booking.startTime || '?'} - {booking.endTime || '?'}
              </span>
            </div>
          )}

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Location:</span>
            <span style={styles.detailValue}>
              {booking.location}{booking.district ? `, ${booking.district}` : ''}
            </span>
          </div>

          {booking.guests && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Guests:</span>
              <span style={styles.detailValue}>{Number(booking.guests).toLocaleString()}</span>
            </div>
          )}

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>👤 Client Information</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Name:</span>
            <span style={styles.detailValue}>{booking.name}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Email:</span>
            <span style={styles.detailValue}>{booking.email}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Phone:</span>
            <span style={styles.detailValue}>{booking.phone}</span>
          </div>

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>🎬 Services Selected</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Package:</span>
            <span style={styles.detailValue}>{getPackageLabel(booking.package)}</span>
          </div>

          {booking.services && booking.services.length > 0 && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Add-ons:</span>
              <span style={styles.detailValue}>
                {booking.services.map(s => getServiceLabel(s)).join(', ')}
              </span>
            </div>
          )}

          {booking.message && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Special Requests:</span>
                <span style={styles.detailValue}>{booking.message}</span>
              </div>
            </>
          )}

          <div style={styles.divider} />

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              💡 <strong>What happens next?</strong><br />
              Our team will review your booking within 24 hours. We'll contact you via email or phone to discuss pricing (negotiable) and confirm availability.
            </p>
          </div>
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
    background: "#f5f5f5",
    padding: "60px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  successIcon: {
    fontSize: "60px",
    textAlign: "center",
    marginBottom: "10px",
  },
  errorIcon: {
    fontSize: "50px",
    textAlign: "center",
    marginBottom: "10px",
  },
  confirmationTitle: {
    textAlign: "center",
    color: "#28a745",
    marginBottom: "10px",
    fontSize: "28px",
    fontWeight: "700",
  },
  errorTitle: {
    textAlign: "center",
    color: "#dc3545",
    marginBottom: "10px",
    fontSize: "24px",
  },
  errorText: {
    textAlign: "center",
    color: "#666",
    marginBottom: "20px",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#666",
  },
  detailsBox: {
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px",
  },
  detailsTitle: {
    marginBottom: "15px",
    color: "#333",
    fontSize: "16px",
  },
  sectionTitle: {
    marginBottom: "10px",
    color: "#555",
    fontSize: "14px",
    fontWeight: "600",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    gap: "10px",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#666",
    fontSize: "13px",
    flexShrink: 0,
  },
  detailValue: {
    color: "#333",
    fontSize: "13px",
    textAlign: "right",
  },
  divider: {
    height: "1px",
    background: "#e0e0e0",
    margin: "12px 0",
  },
  statusBadge: {
    background: "#fff3cd",
    color: "#856404",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  infoBox: {
    background: "#e8f4fd",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "10px",
  },
  infoText: {
    fontSize: "12px",
    color: "#004085",
    lineHeight: "1.5",
    margin: 0,
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "12px 24px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryButton: {
    padding: "12px 24px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  outlineButton: {
    padding: "12px 24px",
    background: "transparent",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default BookingConfirmation;