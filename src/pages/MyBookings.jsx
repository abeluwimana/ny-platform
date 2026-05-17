// src/pages/MyBookings.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//                        ↑ Kuraho 'Link'

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    date: '',
    package: '',
    message: ''
  });

  useEffect(() => {
    const userLoggedIn = localStorage.getItem('user_logged_in');
    const userRole = localStorage.getItem('user_role');
    
    if (!userLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'client') {
      navigate('/');
      return;
    }
    
    loadBookings();
  }, []);

  const loadBookings = () => {
    const userEmail = localStorage.getItem('user_email');
    const allBookings = JSON.parse(localStorage.getItem('wedding_bookings') || '[]');
    
    const myBookings = allBookings.filter(b => 
      b.email === userEmail || b.userId === userEmail
    );
    
    myBookings.sort((a, b) => b.id - a.id);
    setBookings(myBookings);
    setLoading(false);
  };

  const saveToLocalStorage = (updatedBookings) => {
    const userEmail = localStorage.getItem('user_email');
    const allBookings = JSON.parse(localStorage.getItem('wedding_bookings') || '[]');
    
    const otherBookings = allBookings.filter(b => 
      b.email !== userEmail && b.userId !== userEmail
    );
    
    const newAllBookings = [...otherBookings, ...updatedBookings];
    localStorage.setItem('wedding_bookings', JSON.stringify(newAllBookings));
    
    // Reload
    setBookings(updatedBookings);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to CANCEL this booking?')) {
      const remaining = bookings.filter(b => b.id !== id);
      saveToLocalStorage(remaining);
    }
  };

  const startEdit = (booking) => {
    setEditingId(booking.id);
    setEditData({
      date: booking.date,
      package: booking.package,
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
          price: packagePrices[editData.package] || b.price,
          message: editData.message,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });

    saveToLocalStorage(updated);
    setEditingId(null);
  };

  const getStatusStyle = (status) => {
    if (status === 'confirmed') return { background: '#d4edda', color: '#155724' };
    if (status === 'rejected') return { background: '#f8d7da', color: '#721c24' };
    return { background: '#fff3cd', color: '#856404' };
  };

  const canEdit = (status) => status === 'pending';

  if (loading) {
    return <div style={styles.container}>Loading your bookings...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 My Bookings</h1>
        <button onClick={() => navigate('/booking')} style={styles.bookBtn}>
          + New Booking
        </button>
      </div>

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📅</div>
          <h2>No Bookings Yet</h2>
          <p>You haven't made any wedding bookings.</p>
          <button onClick={() => navigate('/booking')} style={styles.emptyBtn}>
            Book Now
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
                  {booking.status}
                </span>
              </div>

              {/* Body */}
              <div style={styles.cardBody}>
                {editingId === booking.id ? (
                  // EDIT MODE
                  <div>
                    <h3 style={styles.editTitle}>Edit Booking</h3>
                    
                    <div style={styles.field}>
                      <label>Event Date</label>
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) => setEditData({...editData, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label>Package</label>
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
                      <label>Special Requests</label>
                      <textarea
                        value={editData.message}
                        onChange={(e) => setEditData({...editData, message: e.target.value})}
                        rows="3"
                        style={styles.textarea}
                      />
                    </div>

                    <div style={styles.editActions}>
                      <button onClick={() => saveEdit(booking.id)} style={styles.saveBtn}>
                        💾 Save
                      </button>
                      <button onClick={cancelEdit} style={styles.cancelBtn}>
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div>
                    <h3 style={styles.package}>{booking.package}</h3>
                    <div style={styles.detail}>
                      <span>📅 Date:</span>
                      <strong>{new Date(booking.date).toLocaleDateString()}</strong>
                    </div>
                    <div style={styles.detail}>
                      <span>💰 Price:</span>
                      <strong>{booking.price?.toLocaleString()} RWF</strong>
                    </div>
                    <div style={styles.detail}>
                      <span>📧 Email:</span>
                      <span>{booking.email}</span>
                    </div>
                    <div style={styles.detail}>
                      <span>📞 Phone:</span>
                      <span>{booking.phone}</span>
                    </div>
                    {booking.message && (
                      <div style={styles.message}>
                        <strong>💬 Message:</strong>
                        <p>{booking.message}</p>
                      </div>
                    )}
                    {booking.updatedAt && (
                      <div style={styles.updated}>
                        Updated: {new Date(booking.updatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer - Buttons (only in view mode) */}
              {editingId !== booking.id && (
                <div style={styles.cardFooter}>
                  <span style={styles.date}>
                    Booked: {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                  {canEdit(booking.status) && (
                    <div style={styles.actions}>
                      <button onClick={() => startEdit(booking)} style={styles.editBtn}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(booking.id)} style={styles.deleteBtn}>
                        🗑️ Cancel
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
  bookBtn: {
    padding: "12px 24px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
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

export default MyBookings;