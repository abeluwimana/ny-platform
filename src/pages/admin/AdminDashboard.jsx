// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [couples, setCouples] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAddCouple, setShowAddCouple] = useState(false);
  const [showEditCouple, setShowEditCouple] = useState(null);
  
  // Form for new couple
  const [coupleName, setCoupleName] = useState("");
  const [coupleLocation, setCoupleLocation] = useState("");
  const [coupleImage, setCoupleImage] = useState("");
  const [doteVideo, setDoteVideo] = useState("");
  const [churchVideo, setChurchVideo] = useState("");
  const [receptionVideo, setReceptionVideo] = useState("");
  const [doteImage, setDoteImage] = useState("");
  const [churchImage, setChurchImage] = useState("");
  const [receptionImage, setReceptionImage] = useState("");
  
  // Image previews
  const [coupleImagePreview, setCoupleImagePreview] = useState(null);
  const [doteImagePreview, setDoteImagePreview] = useState(null);
  const [churchImagePreview, setChurchImagePreview] = useState(null);
  const [receptionImagePreview, setReceptionImagePreview] = useState(null);
  const [editCoupleData, setEditCoupleData] = useState(null);

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("admin_logged_in");
    if (!adminLoggedIn) {
      navigate("/login");
      return;
    }
    loadBookings();
    loadCouples();
    loadUsers();
  }, [navigate]);

  const loadBookings = () => {
    const stored = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    let sorted = [...stored];
    if (sortBy === "date") {
      sorted.sort((a, b) => sortOrder === "desc" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    } else if (sortBy === "name") {
      sorted.sort((a, b) => sortOrder === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => sortOrder === "desc" ? b.id - a.id : a.id - b.id);
    }
    setBookings(sorted);
  };

  const loadCouples = () => {
    const stored = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    setCouples(stored);
  };

  const loadUsers = () => {
    const stored = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    setUsers(stored);
  };

  const saveCouples = (updatedCouples) => {
    localStorage.setItem("wedding_couples", JSON.stringify(updatedCouples));
    setCouples(updatedCouples);
  };

  const saveUsers = (updatedUsers) => {
    localStorage.setItem("wedding_users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  // Handle image uploads
  const handleCoupleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoupleImagePreview(reader.result);
        setCoupleImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoteImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoteImagePreview(reader.result);
        setDoteImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChurchImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChurchImagePreview(reader.result);
        setChurchImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReceptionImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceptionImagePreview(reader.result);
        setReceptionImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update couple image
  const handleUpdateCoupleImage = (coupleId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        const updated = couples.map(c => {
          if (c.id === coupleId) {
            return { ...c, image: imageUrl };
          }
          return c;
        });
        saveCouples(updated);
        alert("Couple image updated successfully!");
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  // Update event image
  const handleUpdateEventImage = (coupleId, eventType, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        const updated = couples.map(c => {
          if (c.id === coupleId) {
            return {
              ...c,
              events: {
                ...c.events,
                [eventType]: { ...c.events[eventType], image: imageUrl }
              }
            };
          }
          return c;
        });
        saveCouples(updated);
        alert(`${eventType.toUpperCase()} image updated successfully!`);
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCouple = () => {
    console.log("Adding couple...");
    
    if (!coupleName || coupleName.trim() === "") {
      alert("Please enter couple name");
      return;
    }
    
    if (!coupleLocation || coupleLocation.trim() === "") {
      alert("Please enter location");
      return;
    }

    // Create ID from couple name
    const id = coupleName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    // Check if couple already exists
    const existingCouple = couples.find(c => c.id === id);
    if (existingCouple) {
      alert(`⚠️ Couple "${coupleName}" already exists! Please use a different name.`);
      return;
    }
    
    const newCouple = {
      id: id,
      couple: coupleName,
      name: coupleName,
      location: coupleLocation,
      image: coupleImage || "",
      events: {
        dote: { title: "DOTE", image: doteImage || "", video: doteVideo || "" },
        church: { title: "Church", image: churchImage || "", video: churchVideo || "" },
        reception: { title: "Reception", image: receptionImage || "", video: receptionVideo || "" }
      }
    };

    const updatedCouples = [...couples, newCouple];
    saveCouples(updatedCouples);
    
    // Reset form
    setCoupleName("");
    setCoupleLocation("");
    setCoupleImage("");
    setCoupleImagePreview(null);
    setDoteVideo("");
    setChurchVideo("");
    setReceptionVideo("");
    setDoteImage("");
    setDoteImagePreview(null);
    setChurchImage("");
    setChurchImagePreview(null);
    setReceptionImage("");
    setReceptionImagePreview(null);
    setShowAddCouple(false);
    
    alert(`✅ "${coupleName}" added successfully!`);
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleEditCouple = (couple) => {
    setEditCoupleData(couple);
    setCoupleName(couple.couple);
    setCoupleLocation(couple.location);
    setCoupleImage(couple.image || "");
    setDoteVideo(couple.events?.dote?.video || "");
    setChurchVideo(couple.events?.church?.video || "");
    setReceptionVideo(couple.events?.reception?.video || "");
    setShowEditCouple(couple.id);
  };

  const handleSaveEdit = () => {
    if (!editCoupleData) return;
    
    const updated = couples.map(c => {
      if (c.id === editCoupleData.id) {
        return {
          ...c,
          couple: coupleName,
          name: coupleName,
          location: coupleLocation,
          image: coupleImage || c.image,
          events: {
            dote: { ...c.events.dote, video: doteVideo },
            church: { ...c.events.church, video: churchVideo },
            reception: { ...c.events.reception, video: receptionVideo }
          }
        };
      }
      return c;
    });
    
    saveCouples(updated);
    setShowEditCouple(null);
    setEditCoupleData(null);
    setCoupleName("");
    setCoupleLocation("");
    setCoupleImage("");
    setDoteVideo("");
    setChurchVideo("");
    setReceptionVideo("");
    alert("Couple updated successfully!");
    window.location.reload();
  };

  const handleDeleteCouple = (id) => {
    if (window.confirm("Delete this couple?")) {
      const updated = couples.filter(c => c.id !== id);
      saveCouples(updated);
      alert("Couple deleted!");
      window.location.reload();
    }
  };

  const handleUpdateVideo = (coupleId, eventType) => {
    const url = prompt(`Enter YouTube Embed URL for ${eventType.toUpperCase()}:\n\nExample: https://www.youtube.com/embed/VIDEO_ID`);
    
    if (url === null || url === "") return;
    
    let finalUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (!finalUrl.includes("youtube.com/embed/")) {
      alert("Invalid URL. Please use format: https://www.youtube.com/embed/VIDEO_ID");
      return;
    }
    
    const updated = couples.map(c => {
      if (c.id === coupleId) {
        return {
          ...c,
          events: { ...c.events, [eventType]: { ...c.events[eventType], video: finalUrl } }
        };
      }
      return c;
    });
    
    saveCouples(updated);
    alert(`${eventType.toUpperCase()} video updated successfully!`);
    window.location.reload();
  };

  const handleBlockUser = (userId) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === "blocked" ? "active" : "blocked" };
      }
      return u;
    });
    saveUsers(updated);
    alert("User status updated!");
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Delete this user permanently?")) {
      const updated = users.filter(u => u.id !== userId);
      saveUsers(updated);
      alert("User deleted!");
    }
  };

  const handleChangeRole = (userId, newRole) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveUsers(updated);
    alert(`User role changed to ${newRole}`);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Client Name", "Email", "Phone", "Package", "Date", "Price", "Status", "Booked On"];
    const rows = bookings.map(b => [
      b.id, b.name, b.email, b.phone, b.package, b.date, b.price, b.status, new Date(b.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    alert("Export completed!");
  };

  const updateStatus = (id, newStatus) => {
    const updated = bookings.map(booking =>
      booking.id === id ? { ...booking, status: newStatus } : booking
    );
    localStorage.setItem("wedding_bookings", JSON.stringify(updated));
    loadBookings();
  };

  const deleteBooking = (id) => {
    if (window.confirm("Delete this booking?")) {
      const filtered = bookings.filter(booking => booking.id !== id);
      localStorage.setItem("wedding_bookings", JSON.stringify(filtered));
      loadBookings();
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch = searchTerm === "" || 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
    revenue: bookings.filter(b => b.status === "confirmed").reduce((sum, b) => sum + (b.price || 0), 0),
    couples: couples.length,
    users: users.length
  };

  const styles = {
    container: { minHeight: "100vh", background: "#f5f5f5", padding: "40px" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" },
    title: { fontSize: "32px", color: "#333", margin: 0 },
    backBtn: { padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
    exportBtn: { padding: "10px 20px", background: "#17a2b8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginRight: "10px" },
    tabs: { display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "1px solid #ddd", paddingBottom: "10px", flexWrap: "wrap" },
    tab: { padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold", color: "#666" },
    activeTab: { padding: "10px 20px", background: "none", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold", color: "#000", borderBottom: "2px solid #000" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "20px", marginBottom: "30px" },
    statCard: { background: "#fff", padding: "20px", borderRadius: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
    statValue: { fontSize: "28px", fontWeight: "bold", marginBottom: "8px" },
    searchBar: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
    searchInput: { padding: "10px", border: "1px solid #ddd", borderRadius: "8px", flex: 1, minWidth: "200px" },
    filterBar: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
    filter: { padding: "8px 20px", background: "#fff", border: "1px solid #ddd", borderRadius: "25px", cursor: "pointer" },
    activeFilter: { padding: "8px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "25px", cursor: "pointer" },
    sortSelect: { padding: "8px 12px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff" },
    tableContainer: { background: "#fff", borderRadius: "12px", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: "800px" },
    th: { padding: "15px", textAlign: "left", background: "#f8f9fa", borderBottom: "2px solid #dee2e6", fontWeight: "600" },
    td: { padding: "15px", borderBottom: "1px solid #eee" },
    addBtn: { padding: "12px 24px", background: "#28a745", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontSize: "16px", fontWeight: "bold" },
    editBtn: { background: "#ffc107", border: "none", borderRadius: "5px", padding: "5px 10px", cursor: "pointer", marginRight: "5px" },
    deleteBtn: { background: "#dc3545", border: "none", borderRadius: "5px", padding: "5px 10px", cursor: "pointer", color: "#fff" },
    modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modalContent: { background: "#fff", padding: "30px", borderRadius: "16px", maxWidth: "600px", width: "90%", maxHeight: "80vh", overflowY: "auto" },
    input: { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "8px", boxSizing: "border-box" },
    label: { fontWeight: "bold", marginBottom: "5px", display: "block", marginTop: "10px" },
    saveBtn: { background: "#28a745", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", marginRight: "10px" },
    cancelBtn: { background: "#6c757d", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" },
    imagePreview: { width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px", background: "#f0f0f0" },
    imageUpload: { width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "10px" },
    sectionTitle: { fontSize: "18px", marginTop: "20px", marginBottom: "15px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "10px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Admin Dashboard</h1>
        <div>
          <button onClick={exportToCSV} style={styles.exportBtn}>📥 Export Bookings</button>
          <button onClick={() => navigate("/")} style={styles.backBtn}>← Back to Site</button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.total}</div><div>Bookings</div></div>
        <div style={{...styles.statCard, background: "#fff3cd"}}><div style={{...styles.statValue, color: "#856404"}}>{stats.pending}</div><div>Pending</div></div>
        <div style={{...styles.statCard, background: "#d4edda"}}><div style={{...styles.statValue, color: "#155724"}}>{stats.confirmed}</div><div>Confirmed</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.couples}</div><div>Couples</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.users}</div><div>Users</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{stats.revenue.toLocaleString()} RWF</div><div>Revenue</div></div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab("bookings")} style={activeTab === "bookings" ? styles.activeTab : styles.tab}>📋 Bookings</button>
        <button onClick={() => setActiveTab("couples")} style={activeTab === "couples" ? styles.activeTab : styles.tab}>💑 Couples & Videos</button>
        <button onClick={() => setActiveTab("users")} style={activeTab === "users" ? styles.activeTab : styles.tab}>👥 Users</button>
      </div>

      {activeTab === "bookings" && (
        <>
          <div style={styles.searchBar}>
            <input type="text" placeholder="🔍 Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.sortSelect}>
              <option value="id">Sort by ID</option>
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} style={styles.sortSelect}>
              {sortOrder === "desc" ? "↓ Descending" : "↑ Ascending"}
            </button>
          </div>

          <div style={styles.filterBar}>
            <button onClick={() => setFilter("all")} style={filter === "all" ? styles.activeFilter : styles.filter}>All ({stats.total})</button>
            <button onClick={() => setFilter("pending")} style={filter === "pending" ? styles.activeFilter : styles.filter}>Pending ({stats.pending})</button>
            <button onClick={() => setFilter("confirmed")} style={filter === "confirmed" ? styles.activeFilter : styles.filter}>Confirmed ({stats.confirmed})</button>
            <button onClick={() => setFilter("rejected")} style={filter === "rejected" ? styles.activeFilter : styles.filter}>Rejected ({stats.rejected})</button>
          </div>

          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "12px" }}>No bookings found</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Client</th><th style={styles.th}>Package</th><th style={styles.th}>Date</th><th style={styles.th}>Price</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id}>
                      <td style={styles.td}>#{booking.id}</td>
                      <td style={styles.td}><strong>{booking.name}</strong><br/><small>{booking.email}</small><br/><small>{booking.phone}</small></td>
                      <td style={styles.td}>{booking.package}</td>
                      <td style={styles.td}>{new Date(booking.date).toLocaleDateString()}</td>
                      <td style={styles.td}><strong>{booking.price?.toLocaleString()} RWF</strong></td>
                      <td style={styles.td}><span style={{ padding: "4px 12px", borderRadius: "20px", background: booking.status === "confirmed" ? "#d4edda" : booking.status === "rejected" ? "#f8d7da" : "#fff3cd", color: booking.status === "confirmed" ? "#155724" : booking.status === "rejected" ? "#721c24" : "#856404" }}>{booking.status}</span></td>
                      <td style={styles.td}>
                        <button onClick={() => updateStatus(booking.id, "confirmed")} style={{ background: "#28a745", border: "none", borderRadius: "5px", padding: "5px 8px", cursor: "pointer", marginRight: "5px" }}>✅</button>
                        <button onClick={() => updateStatus(booking.id, "rejected")} style={{ background: "#ffc107", border: "none", borderRadius: "5px", padding: "5px 8px", cursor: "pointer", marginRight: "5px" }}>❌</button>
                        <button onClick={() => deleteBooking(booking.id)} style={{ background: "#dc3545", border: "none", borderRadius: "5px", padding: "5px 8px", cursor: "pointer", color: "#fff" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "couples" && (
        <>
          <button onClick={() => setShowAddCouple(true)} style={styles.addBtn}>+ Add New Couple</button>
          
          {couples.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "12px" }}>No couples yet. Click "Add New Couple" to get started.</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Image</th>
                    <th style={styles.th}>Couple</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>DOTE</th>
                    <th style={styles.th}>Church</th>
                    <th style={styles.th}>Reception</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {couples.map(couple => (
                    <tr key={couple.id}>
                      <td style={styles.td}>
                        {couple.image ? (
                          <img src={couple.image} alt={couple.couple} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>📷</div>
                        )}
                        <div>
                          <input type="file" accept="image/*" onChange={(e) => handleUpdateCoupleImage(couple.id, e)} style={{ fontSize: "10px", marginTop: "5px", width: "80px" }} />
                        </div>
                      </td>
                      <td style={styles.td}><strong>{couple.couple}</strong></td>
                      <td style={styles.td}>{couple.location}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleUpdateVideo(couple.id, "dote")} style={styles.editBtn}>📹 Video</button>
                        <input type="file" accept="image/*" onChange={(e) => handleUpdateEventImage(couple.id, "dote", e)} style={{ fontSize: "10px", marginTop: "5px", width: "60px" }} />
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleUpdateVideo(couple.id, "church")} style={styles.editBtn}>📹 Video</button>
                        <input type="file" accept="image/*" onChange={(e) => handleUpdateEventImage(couple.id, "church", e)} style={{ fontSize: "10px", marginTop: "5px", width: "60px" }} />
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleUpdateVideo(couple.id, "reception")} style={styles.editBtn}>📹 Video</button>
                        <input type="file" accept="image/*" onChange={(e) => handleUpdateEventImage(couple.id, "reception", e)} style={{ fontSize: "10px", marginTop: "5px", width: "60px" }} />
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleEditCouple(couple)} style={styles.editBtn}>✏️</button>
                        <button onClick={() => handleDeleteCouple(couple.id)} style={styles.deleteBtn}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "users" && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Role</th><th style={styles.th}>Status</th><th style={styles.th}>Joined</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={styles.td}>#{user.id}</td>
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <select value={user.role} onChange={(e) => handleChangeRole(user.id, e.target.value)} style={styles.sortSelect}>
                      <option value="client">Client</option>
                      <option value="creator">Creator</option>
                    </select>
                  </td>
                  <td style={styles.td}><span style={{ padding: "4px 12px", borderRadius: "20px", background: user.status === "blocked" ? "#f8d7da" : "#d4edda", color: user.status === "blocked" ? "#721c24" : "#155724" }}>{user.status || "active"}</span></td>
                  <td style={styles.td}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleBlockUser(user.id)} style={styles.editBtn}>{user.status === "blocked" ? "🔓 Unblock" : "🔒 Block"}</button>
                    <button onClick={() => handleDeleteUser(user.id)} style={styles.deleteBtn}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Couple Modal */}
      {showAddCouple && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Add New Couple</h2>
            <label style={styles.label}>Couple Photo</label>
            {coupleImagePreview && <img src={coupleImagePreview} alt="Preview" style={styles.imagePreview} />}
            <input type="file" accept="image/*" onChange={handleCoupleImageUpload} style={styles.imageUpload} />
            <label style={styles.label}>Couple Name *</label>
            <input type="text" placeholder="e.g., Paul & Linda" value={coupleName} onChange={(e) => setCoupleName(e.target.value)} style={styles.input} />
            <label style={styles.label}>Location *</label>
            <input type="text" placeholder="e.g., Kigali" value={coupleLocation} onChange={(e) => setCoupleLocation(e.target.value)} style={styles.input} />
            <h3 style={styles.sectionTitle}>DOTE Event</h3>
            {doteImagePreview && <img src={doteImagePreview} alt="DOTE Preview" style={styles.imagePreview} />}
            <input type="file" accept="image/*" onChange={handleDoteImageUpload} style={styles.imageUpload} />
            <input type="text" placeholder="DOTE Video URL" value={doteVideo} onChange={(e) => setDoteVideo(e.target.value)} style={styles.input} />
            <h3 style={styles.sectionTitle}>Church Event</h3>
            {churchImagePreview && <img src={churchImagePreview} alt="Church Preview" style={styles.imagePreview} />}
            <input type="file" accept="image/*" onChange={handleChurchImageUpload} style={styles.imageUpload} />
            <input type="text" placeholder="Church Video URL" value={churchVideo} onChange={(e) => setChurchVideo(e.target.value)} style={styles.input} />
            <h3 style={styles.sectionTitle}>Reception Event</h3>
            {receptionImagePreview && <img src={receptionImagePreview} alt="Reception Preview" style={styles.imagePreview} />}
            <input type="file" accept="image/*" onChange={handleReceptionImageUpload} style={styles.imageUpload} />
            <input type="text" placeholder="Reception Video URL" value={receptionVideo} onChange={(e) => setReceptionVideo(e.target.value)} style={styles.input} />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleAddCouple} style={styles.saveBtn}>💾 Save Couple</button>
              <button onClick={() => setShowAddCouple(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Couple Modal */}
      {showEditCouple && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Edit Couple</h2>
            <label style={styles.label}>Couple Name</label>
            <input type="text" value={coupleName} onChange={(e) => setCoupleName(e.target.value)} style={styles.input} />
            <label style={styles.label}>Location</label>
            <input type="text" value={coupleLocation} onChange={(e) => setCoupleLocation(e.target.value)} style={styles.input} />
            <h3 style={styles.sectionTitle}>Video Links</h3>
            <label style={styles.label}>DOTE Video URL</label>
            <input type="text" value={doteVideo} onChange={(e) => setDoteVideo(e.target.value)} style={styles.input} />
            <label style={styles.label}>Church Video URL</label>
            <input type="text" value={churchVideo} onChange={(e) => setChurchVideo(e.target.value)} style={styles.input} />
            <label style={styles.label}>Reception Video URL</label>
            <input type="text" value={receptionVideo} onChange={(e) => setReceptionVideo(e.target.value)} style={styles.input} />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleSaveEdit} style={styles.saveBtn}>💾 Save Changes</button>
              <button onClick={() => setShowEditCouple(null)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;