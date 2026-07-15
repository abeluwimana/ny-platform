// src/pages/booking/BookingConfirmation.jsx
// SHINECONNECT - Booking Confirmation Page
// Colors: Black (#000), White (#fff), Gold (#FFD700)

import { useLocation, useNavigate } from 'react-router-dom';

// ─── HELPER FUNCTION ──────────────────────────────────────────────
const getValue = (obj, ...keys) => {
  if (!obj) return null;
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return null;
};

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  // Helper functions for readable labels
  const getEventTypeLabel = (type) => {
    if (!type) return 'Other';
    const types = {
      wedding: 'Wedding',
      birthday: 'Birthday',
      funeral: 'Funeral',
      graduation: 'Graduation',
      corporate: 'Corporate',
      WEDDING: 'Wedding',
      BIRTHDAY: 'Birthday',
      FUNERAL: 'Funeral',
      GRADUATION: 'Graduation',
      CORPORATE: 'Corporate',
      DOTE: 'DOTE',
      OTHER: 'Other'
    };
    return types[type] || type;
  };

  const getWeddingPartLabel = (part) => {
    if (!part) return part;
    const parts = {
      dote_part: 'DOTE Ceremony',
      church: 'Church Ceremony',
      reception: 'Reception',
      traditional: 'Traditional Ceremony'
    };
    return parts[part] || part;
  };

  const getPackageLabel = (pkgId) => {
    if (!pkgId) return 'Standard';
    const packages = {
      basic: 'Basic',
      premium: 'Premium',
      luxury: 'Luxury',
      full: 'Full',
      standard: 'Standard',
      executive: 'Executive'
    };
    return packages[pkgId] || pkgId || 'Standard';
  };

  const getServiceLabel = (serviceId) => {
    if (!serviceId) return serviceId;
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

  const getStatusLabel = (status) => {
    if (!status) return 'Pending';
    const s = status.toUpperCase();
    const statusMap = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'REJECTED': 'Rejected'
    };
    return statusMap[s] || status;
  };

  const getStatusColor = (status) => {
    if (!status) return '#FFD700';
    const s = status.toUpperCase();
    const statusMap = {
      'PENDING': '#FFD700',
      'CONFIRMED': '#10b981',
      'IN_PROGRESS': '#3b82f6',
      'COMPLETED': '#10b981',
      'CANCELLED': '#ef4444',
      'REJECTED': '#ef4444'
    };
    return statusMap[s] || '#FFD700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-RW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBookingId = () => {
    const id = getValue(booking, 'id', 'bookingNumber');
    return id || 'Pending';
  };

  const getBookingStatus = () => {
    const status = getValue(booking, 'status');
    return status || 'PENDING';
  };

  if (!booking) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>No Booking Found</h2>
          <p style={styles.errorText}>We couldn't find your booking details. Please try again.</p>
          <button onClick={() => navigate('/booking')} style={styles.primaryButton}>Go to Booking</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>
        <h1 style={styles.confirmationTitle}>Booking Confirmed! 🎉</h1>
        <p style={styles.subtitle}>
          Thank you <strong>{getValue(booking, 'name', 'clientName', 'user.name') || ''}</strong> for choosing SHINECONNECT!
        </p>

        <div style={styles.detailsBox}>
          <h3 style={styles.detailsTitle}>📋 Booking Details</h3>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Booking ID:</span>
            <span style={styles.detailValue}>#{getBookingId()}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Status:</span>
            <span style={{ ...styles.statusBadge, background: getStatusColor(getBookingStatus()) + '20', color: getStatusColor(getBookingStatus()) }}>
              ● {getStatusLabel(getBookingStatus())}
            </span>
          </div>

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>🎊 Event Information</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Event Type:</span>
            <span style={styles.detailValue}>{getEventTypeLabel(getValue(booking, 'eventType'))}</span>
          </div>

          {(() => {
            const parts = getValue(booking, 'weddingParts');
            if (parts) {
              const partsArray = typeof parts === 'string' ? JSON.parse(parts) : parts;
              if (partsArray && partsArray.length > 0) {
                return (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Wedding Parts:</span>
                    <span style={styles.detailValue}>
                      {partsArray.map(p => getWeddingPartLabel(p)).join(', ')}
                    </span>
                  </div>
                );
              }
            }
            return null;
          })()}

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Event Date:</span>
            <span style={styles.detailValue}>{formatDate(getValue(booking, 'eventDate', 'date'))}</span>
          </div>

          {(getValue(booking, 'startTime') || getValue(booking, 'endTime')) && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Event Time:</span>
              <span style={styles.detailValue}>
                {getValue(booking, 'startTime') || '?'} - {getValue(booking, 'endTime') || '?'}
              </span>
            </div>
          )}

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Location:</span>
            <span style={styles.detailValue}>
              {getValue(booking, 'eventLocation', 'location') || ''}
              {getValue(booking, 'district') ? `, ${getValue(booking, 'district')}` : ''}
            </span>
          </div>

          {getValue(booking, 'guestCount', 'guests') && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Guests:</span>
              <span style={styles.detailValue}>
                {Number(getValue(booking, 'guestCount', 'guests')).toLocaleString()}
              </span>
            </div>
          )}

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>👤 Client Information</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Name:</span>
            <span style={styles.detailValue}>{getValue(booking, 'name', 'clientName', 'user.name') || ''}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Email:</span>
            <span style={styles.detailValue}>{getValue(booking, 'email', 'user.email') || ''}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Phone:</span>
            <span style={styles.detailValue}>{getValue(booking, 'phone', 'user.phone') || ''}</span>
          </div>

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>🎬 Services</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Package:</span>
            <span style={styles.detailValue}>{getPackageLabel(getValue(booking, 'package'))}</span>
          </div>

          {(() => {
            const services = getValue(booking, 'services');
            if (services) {
              const servicesArray = typeof services === 'string' ? JSON.parse(services) : services;
              if (servicesArray && servicesArray.length > 0) {
                return (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Add-on Services:</span>
                    <span style={styles.detailValue}>
                      {servicesArray.map(s => getServiceLabel(s)).join(', ')}
                    </span>
                  </div>
                );
              }
            }
            return null;
          })()}

          {getValue(booking, 'notes', 'message') && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Notes:</span>
                <span style={styles.detailValue}>{getValue(booking, 'notes', 'message')}</span>
              </div>
            </>
          )}

          <div style={styles.divider} />

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              💡 <strong>What's Next?</strong><br />
              Our team will review your booking and contact you within 24 hours to confirm the details. 
              You can also reach us directly at <strong>+250 780 145 562</strong> or 
              <strong> shineconnect@nyentertainment.com</strong>.
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
    background: "#ffffff",
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
    boxShadow: "0 8px 48px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.03)",
    border: "1px solid #f0f0f0",
  },
  successIcon: {
    fontSize: "56px",
    textAlign: "center",
    marginBottom: "8px",
  },
  errorIcon: {
    fontSize: "48px",
    textAlign: "center",
    marginBottom: "8px",
  },
  confirmationTitle: {
    textAlign: "center",
    color: "#000000",
    marginBottom: "8px",
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  errorTitle: {
    textAlign: "center",
    color: "#ef4444",
    marginBottom: "10px",
    fontSize: "24px",
    fontWeight: "700",
  },
  errorText: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "20px",
    fontSize: "14px",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "28px",
    color: "#6b7280",
    fontSize: "15px",
  },
  detailsBox: {
    background: "#f8f9fa",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "24px",
    border: "1px solid #f0f0f0",
  },
  detailsTitle: {
    marginBottom: "16px",
    color: "#000000",
    fontSize: "16px",
    fontWeight: "700",
  },
  sectionTitle: {
    marginBottom: "10px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    gap: "10px",
    flexWrap: "wrap",
  },
  detailLabel: {
    fontWeight: "600",
    color: "#6b7280",
    fontSize: "13px",
    flexShrink: 0,
  },
  detailValue: {
    color: "#000000",
    fontSize: "13px",
    textAlign: "right",
    wordBreak: "break-word",
  },
  divider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "12px 0",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  infoBox: {
    background: "#fefce8",
    border: "1px solid #fde68a",
    padding: "14px 16px",
    borderRadius: "10px",
    marginTop: "4px",
  },
  infoText: {
    fontSize: "13px",
    color: "#78350f",
    lineHeight: "1.6",
    margin: 0,
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "12px 28px",
    background: "#000000",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "opacity 0.2s",
  },
  secondaryButton: {
    padding: "12px 28px",
    background: "#000000",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "opacity 0.2s",
  },
  outlineButton: {
    padding: "12px 28px",
    background: "transparent",
    color: "#000000",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
  },
};

export default BookingConfirmation;