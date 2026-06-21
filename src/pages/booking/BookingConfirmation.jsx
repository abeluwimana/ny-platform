// src/pages/booking/BookingConfirmation.jsx
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  // Helper functions for readable labels
  const getEventTypeLabel = (type) => {
    if (!type) return t('booking.eventOther');
    const types = {
      wedding: t('booking.eventWedding'),
      birthday: t('booking.eventBirthday'),
      funeral: t('booking.eventFuneral'),
      graduation: t('booking.eventGraduation'),
      corporate: t('booking.eventCorporate'),
      WEDDING: t('booking.eventWedding'),
      BIRTHDAY: t('booking.eventBirthday'),
      FUNERAL: t('booking.eventFuneral'),
      GRADUATION: t('booking.eventGraduation'),
      CORPORATE: t('booking.eventCorporate'),
      DOTE: t('booking.eventDote'),
      OTHER: t('booking.eventOther')
    };
    return types[type] || type;
  };

  const getWeddingPartLabel = (part) => {
    if (!part) return part;
    const parts = {
      dote_part: t('booking.weddingDote'),
      church: t('booking.weddingChurch'),
      reception: t('booking.weddingReception'),
      traditional: t('booking.weddingTraditional')
    };
    return parts[part] || part;
  };

  const getPackageLabel = (pkgId) => {
    if (!pkgId) return t('booking.packageStandard');
    const packages = {
      basic: t('booking.packageBasic'),
      premium: t('booking.packagePremium'),
      luxury: t('booking.packageLuxury'),
      full: t('booking.packageFull'),
      standard: t('booking.packageStandard')
    };
    return packages[pkgId] || pkgId || t('booking.packageStandard');
  };

  const getServiceLabel = (serviceId) => {
    if (!serviceId) return serviceId;
    const services = {
      videography: t('booking.serviceVideography'),
      photography: t('booking.servicePhotography'),
      drone: t('booking.serviceDrone'),
      sound: t('booking.serviceSound'),
      decoration: t('booking.serviceDecoration'),
      cake: t('booking.serviceCake'),
      catering: t('booking.serviceCatering'),
      mc: t('booking.serviceMC'),
      streaming: t('booking.serviceStreaming'),
      photobooth: t('booking.servicePhotobooth'),
      dancer: t('booking.serviceDancer'),
      album: t('booking.serviceAlbum')
    };
    return services[serviceId] || serviceId;
  };

  const getStatusLabel = (status) => {
    if (!status) return t('booking.statusPending');
    const s = status.toUpperCase();
    const statusMap = {
      'PENDING': t('booking.statusPending'),
      'CONFIRMED': t('booking.statusConfirmed'),
      'IN_PROGRESS': t('booking.statusInProgress'),
      'COMPLETED': t('booking.statusCompleted'),
      'CANCELLED': t('booking.statusCancelled'),
      'REJECTED': t('booking.statusRejected')
    };
    return statusMap[s] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('booking.notSpecified');
    return new Date(dateString).toLocaleDateString('en-RW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get booking ID (handle both API and localStorage formats)
  const getBookingId = () => {
    const id = getValue(booking, 'id', 'bookingNumber');
    return id || t('booking.pendingId');
  };

  // Get booking status
  const getBookingStatus = () => {
    const status = getValue(booking, 'status');
    return status || 'PENDING';
  };

  if (!booking) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>{t('booking.noBookingFound')}</h2>
          <p style={styles.errorText}>{t('booking.noBookingFoundDesc')}</p>
          <button onClick={() => navigate('/booking')} style={styles.primaryButton}>{t('booking.goToBooking')}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>
        <h1 style={styles.confirmationTitle}>{t('booking.confirmationTitle')}</h1>
        <p style={styles.subtitle}>
          {t('booking.thankYou')} {getValue(booking, 'name', 'clientName', 'user.name') || ''} {t('booking.forChoosing')}
        </p>

        <div style={styles.detailsBox}>
          <h3 style={styles.detailsTitle}>📋 {t('booking.detailsTitle')}</h3>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.bookingId')}:</span>
            <span style={styles.detailValue}>#{getBookingId()}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.statusLabel')}:</span>
            <span style={styles.statusBadge}>⏳ {getStatusLabel(getBookingStatus())}</span>
          </div>

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>🎊 {t('booking.eventInfo')}</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.eventTypeLabel')}:</span>
            <span style={styles.detailValue}>{getEventTypeLabel(getValue(booking, 'eventType'))}</span>
          </div>

          {/* Wedding Parts - handles both array and JSON string */}
          {(() => {
            const parts = getValue(booking, 'weddingParts');
            if (parts) {
              const partsArray = typeof parts === 'string' ? JSON.parse(parts) : parts;
              if (partsArray && partsArray.length > 0) {
                return (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>{t('booking.weddingPartsLabel')}:</span>
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
            <span style={styles.detailLabel}>{t('booking.eventDateLabel')}:</span>
            <span style={styles.detailValue}>{formatDate(getValue(booking, 'eventDate', 'date'))}</span>
          </div>

          {(getValue(booking, 'startTime') || getValue(booking, 'endTime')) && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>{t('booking.eventTimeLabel')}:</span>
              <span style={styles.detailValue}>
                {getValue(booking, 'startTime') || '?'} - {getValue(booking, 'endTime') || '?'}
              </span>
            </div>
          )}

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.locationLabel')}:</span>
            <span style={styles.detailValue}>
              {getValue(booking, 'eventLocation', 'location') || ''}
              {getValue(booking, 'district') ? `, ${getValue(booking, 'district')}` : ''}
            </span>
          </div>

          {getValue(booking, 'guestCount', 'guests') && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>{t('booking.guestsLabel')}:</span>
              <span style={styles.detailValue}>
                {Number(getValue(booking, 'guestCount', 'guests')).toLocaleString()}
              </span>
            </div>
          )}

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>👤 {t('booking.clientInfo')}</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.nameLabel')}:</span>
            <span style={styles.detailValue}>{getValue(booking, 'name', 'clientName', 'user.name') || ''}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.emailLabel')}:</span>
            <span style={styles.detailValue}>{getValue(booking, 'email', 'user.email') || ''}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.phoneLabel')}:</span>
            <span style={styles.detailValue}>{getValue(booking, 'phone', 'user.phone') || ''}</span>
          </div>

          <div style={styles.divider} />

          <h4 style={styles.sectionTitle}>🎬 {t('booking.servicesLabel')}</h4>

          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>{t('booking.packageLabel')}:</span>
            <span style={styles.detailValue}>{getPackageLabel(getValue(booking, 'package'))}</span>
          </div>

          {/* Services - handles both array and JSON string */}
          {(() => {
            const services = getValue(booking, 'services');
            if (services) {
              const servicesArray = typeof services === 'string' ? JSON.parse(services) : services;
              if (servicesArray && servicesArray.length > 0) {
                return (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>{t('booking.addonServicesLabel')}:</span>
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
                <span style={styles.detailLabel}>{t('booking.notesLabel')}:</span>
                <span style={styles.detailValue}>{getValue(booking, 'notes', 'message')}</span>
              </div>
            </>
          )}

          <div style={styles.divider} />

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              💡 <strong>{t('booking.whatsNext')}</strong><br />
              {t('booking.whatsNextDesc')}
            </p>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/booking')} style={styles.secondaryButton}>📅 {t('booking.newBooking')}</button>
          <button onClick={() => navigate('/')} style={styles.outlineButton}>🏠 {t('booking.home')}</button>
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