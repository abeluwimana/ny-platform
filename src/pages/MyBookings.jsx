// src/pages/MyBookings.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function MyBookings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    date: '',
    package: '',
    message: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userLoggedIn = localStorage.getItem('user_logged_in');
    const userRole = localStorage.getItem('user_role');
    
    if (!token || !userLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'client') {
      navigate('/');
      return;
    }
    
    fetchMyBookings();
  }, []);

  // ─── FETCH BOOKINGS FROM BACKEND ───
  const fetchMyBookings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.message || 'Failed to load bookings');
        // Fallback to localStorage if API fails
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Connection error. Loading from local storage...');
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // ─── FALLBACK: LOAD FROM LOCALSTORAGE ───
  const loadFromLocalStorage = () => {
    const userEmail = localStorage.getItem('user_email');
    const allBookings = JSON.parse(localStorage.getItem('wedding_bookings') || '[]');
    
    const myBookings = allBookings.filter(b => 
      b.email === userEmail || b.userId === userEmail
    );
    
    myBookings.sort((a, b) => b.id - a.id);
    setBookings(myBookings);
  };

  // ─── CANCEL BOOKING ───
  const handleCancelBooking = async (id) => {
    if (!window.confirm(t('myBookings.cancelConfirm'))) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setBookings(bookings.map(b => 
          b.id === id ? { ...b, status: 'CANCELLED' } : b
        ));
        alert('Booking cancelled successfully!');
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Error cancelling booking. Please try again.');
    }
  };

  // ─── DELETE BOOKING (LOCAL) ───
  const handleDelete = (id) => {
    if (window.confirm(t('myBookings.cancelConfirm'))) {
      const remaining = bookings.filter(b => b.id !== id);
      saveToLocalStorage(remaining);
    }
  };

  const saveToLocalStorage = (updatedBookings) => {
    const userEmail = localStorage.getItem('user_email');
    const allBookings = JSON.parse(localStorage.getItem('wedding_bookings') || '[]');
    
    const otherBookings = allBookings.filter(b => 
      b.email !== userEmail && b.userId !== userEmail
    );
    
    const newAllBookings = [...otherBookings, ...updatedBookings];
    localStorage.setItem('wedding_bookings', JSON.stringify(newAllBookings));
    
    setBookings(updatedBookings);
  };

  // ─── EDIT FUNCTIONS ───
  const startEdit = (booking) => {
    setEditingId(booking.id);
    setEditData({
      date: booking.date || booking.eventDate || '',
      package: booking.package || '',
      message: booking.message || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ date: '', package: '', message: '' });
  };

  const saveEdit = (id) => {
    const packagePrices = {
      'Traditional Wedding': 250000,
      'Church Wedding': 350000,
      'Reception Coverage': 200000,
      'Full Wedding Package': 650000,
    };

    const updated = bookings.map(b => {
      if (b.id === id) {
        return {
          ...b,
          date: editData.date,
          package: editData.package,
          price: packagePrices[editData.package] || b.totalAmount || b.price,
          message: editData.message,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });

    saveToLocalStorage(updated);
    setEditingId(null);
  };

  // ─── HELPERS ───
  const getStatusStyle = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    if (s === 'CONFIRMED' || s === 'confirmed') return { background: '#d4edda', color: '#155724' };
    if (s === 'REJECTED' || s === 'rejected' || s === 'CANCELLED' || s === 'cancelled') return { background: '#f8d7da', color: '#721c24' };
    if (s === 'COMPLETED' || s === 'completed') return { background: '#cce5ff', color: '#004085' };
    return { background: '#fff3cd', color: '#856404' };
  };

  const getStatusLabel = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    const map = {
      'PENDING': t('myBookings.pending'),
      'CONFIRMED': t('myBookings.confirmed'),
      'IN_PROGRESS': t('myBookings.inProgress'),
      'COMPLETED': t('myBookings.completed'),
      'CANCELLED': t('myBookings.cancelled'),
      'REJECTED': t('myBookings.cancelled')
    };
    return map[s] || s;
  };

  const canEdit = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    return s === 'PENDING';
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
  };

  const formatPrice = (amount) => {
    if (!amount) return '—';
    return Number(amount).toLocaleString() + ' RWF';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>{t('myBookings.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 {t('myBookings.title')}</h1>
          <p style={styles.subtitle}>{t('myBookings.subtitle')}</p>
        </div>
        <button onClick={() => navigate('/booking')} style={styles.bookBtn}>
          + {t('myBookings.bookNow')}
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ⚠️ {error}
          <button onClick={fetchMyBookings} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📅</div>
          <h2>{t('myBookings.noBookings')}</h2>
          <p>{t('myBookings.noBookingsDesc')}</p>
          <button onClick={() => navigate('/booking')} style={styles.emptyBtn}>
            {t('myBookings.bookNow')}
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {bookings.map(booking => (
            <div key={booking.id} style={styles.card}>
              {/* Header */}
              <div style={styles.cardHeader}>
                <span style={styles.id}>#{booking.id}</span>
                <span style={{...styles.status, ...getStatusStyle(booking.status)}}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              {/* Body */}
              <div style={styles.cardBody}>
                {editingId === booking.id ? (
                  // EDIT MODE
                  <div>
                    <h3 style={styles.editTitle}>✏️ {t('myBookings.editBooking')}</h3>
                    
                    <div style={styles.field}>
                      <label>{t('myBookings.date')}</label>
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) => setEditData({...editData, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label>{t('myBookings.package')}</label>
                      <select
                        value={editData.package}
                        onChange={(e) => setEditData({...editData, package: e.target.value})}
                        style={styles.input}
                      >
                        <option value="Traditional Wedding">Traditional Wedding - 250,000 RWF</option>
                        <option value="Church Wedding">Church Wedding - 350,000 RWF</option>
                        <option value="Reception Coverage">Reception Coverage - 200,000 RWF</option>
                        <option value="Full Wedding Package">Full Wedding Package - 650,000 RWF</option>
                      </select>
                    </div>

                    <div style={styles.field}>
                      <label>{t('myBookings.message')}</label>
                      <textarea
                        value={editData.message}
                        onChange={(e) => setEditData({...editData, message: e.target.value})}
                        rows="3"
                        style={styles.textarea}
                        placeholder={t('myBookings.messagePlaceholder')}
                      />
                    </div>

                    <div style={styles.editActions}>
                      <button onClick={() => saveEdit(booking.id)} style={styles.saveBtn}>
                        💾 {t('common.save')}
                      </button>
                      <button onClick={cancelEdit} style={styles.cancelBtn}>
                        ❌ {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div>
                    <h3 style={styles.package}>{booking.package || booking.eventType || t('myBookings.event')}</h3>
                    <div style={styles.detail}>
                      <span>📅 {t('myBookings.date')}:</span>
                      <strong>{formatDate(booking.date || booking.eventDate)}</strong>
                    </div>
                    <div style={styles.detail}>
                      <span>💰 {t('myBookings.totalAmount')}:</span>
                      <strong>{formatPrice(booking.totalAmount || booking.price)}</strong>
                    </div>
                    <div style={styles.detail}>
                      <span>👤 {t('myBookings.creator')}:</span>
                      <span>{booking.creator?.name || booking.assignedCreator || t('myBookings.notAssigned')}</span>
                    </div>
                    <div style={styles.detail}>
                      <span>💳 {t('myBookings.paymentStatus')}:</span>
                      <span>{booking.paymentStatus || 'Pending'}</span>
                    </div>
                    {booking.message && (
                      <div style={styles.message}>
                        <strong>💬 {t('myBookings.message')}:</strong>
                        <p>{booking.message}</p>
                      </div>
                    )}
                    {booking.updatedAt && (
                      <div style={styles.updated}>
                        {t('myBookings.updatedAt')}: {new Date(booking.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer - Buttons (only in view mode) */}
              {editingId !== booking.id && (
                <div style={styles.cardFooter}>
                  <span style={styles.date}>
                    📅 {t('myBookings.bookedOn')}: {new Date(booking.createdAt || booking.createdDate).toLocaleDateString()}
                  </span>
                  {canEdit(booking.status) && (
                    <div style={styles.actions}>
                      <button onClick={() => startEdit(booking)} style={styles.editBtn}>
                        ✏️ {t('common.edit')}
                      </button>
                      <button onClick={() => handleCancelBooking(booking.id)} style={styles.deleteBtn}>
                        🗑️ {t('myBookings.cancelBooking')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "40px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "15px",
  },
  title: {
    fontSize: "32px",
    color: "#333",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "4px",
  },
  bookBtn: {
    padding: "12px 24px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #ffc107",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  errorBanner: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "12px 20px",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  retryBtn: {
    background: "#721c24",
    color: "#fff",
    border: "none",
    padding: "6px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: "80px",
    background: "#fff",
    borderRadius: "16px",
  },
  emptyIcon: { fontSize: "64px", marginBottom: "20px" },
  emptyBtn: {
    marginTop: "20px",
    padding: "12px 24px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 20px",
    background: "#f8f9fa",
    borderBottom: "1px solid #eee",
  },
  id: { fontWeight: "bold", color: "#666" },
  status: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" },
  cardBody: { padding: "20px" },
  package: { margin: "0 0 15px 0", fontSize: "18px", color: "#333" },
  detail: { display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" },
  message: { marginTop: "10px", padding: "10px", background: "#f8f9fa", borderRadius: "8px" },
  updated: { marginTop: "10px", fontSize: "11px", color: "#999", fontStyle: "italic" },
  cardFooter: {
    padding: "15px 20px",
    background: "#f8f9fa",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  date: { fontSize: "12px", color: "#999" },
  actions: { display: "flex", gap: "10px" },
  editBtn: { padding: "6px 12px", background: "#ffc107", border: "none", borderRadius: "5px", cursor: "pointer" },
  deleteBtn: { padding: "6px 12px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  
  // Edit mode styles
  editTitle: { margin: "0 0 15px 0", fontSize: "18px" },
  field: { marginBottom: "15px" },
  input: { width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  editActions: { display: "flex", gap: "10px", marginTop: "10px" },
  saveBtn: { padding: "8px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  cancelBtn: { padding: "8px 16px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default MyBookings;