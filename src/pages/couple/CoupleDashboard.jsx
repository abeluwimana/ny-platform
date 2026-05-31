// src/pages/couple/CoupleDashboard.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ============================================
// ✅ STYLES MUST BE DEFINED BEFORE THE COMPONENT
// ============================================
const styles = {
  container: { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f7f7f5", minHeight: "100vh", paddingBottom: "80px" },
  banner: { background: "#1a1a1a", padding: "36px 24px 28px", textAlign: "center", position: "relative", overflow: "hidden" },
  bannerEyebrow: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffc107", marginBottom: "10px" },
  bannerTitle: { fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 700, color: "#fff", marginBottom: "8px" },
  bannerSub: { fontSize: "13px", color: "#888" },
  progressBar: { height: "3px", background: "#e8e8e8", position: "relative" },
  progressFill: { height: "100%", background: "#ffc107", transition: "width 0.4s ease" },
  stepper: { display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px 0", maxWidth: "600px", margin: "0 auto" },
  stepContainer: { display: "flex", alignItems: "center", flex: 1 },
  step: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: "none" },
  stepCircle: { width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #e8e8e8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#888" },
  stepCircleDone: { background: "#ffc107", borderColor: "#ffc107", color: "#1a1a1a" },
  stepCircleActive: { background: "#1a1a1a", borderColor: "#1a1a1a", color: "#ffc107" },
  stepLabel: { fontSize: "10px", fontWeight: 500, color: "#888", textAlign: "center" },
  stepLabelActive: { color: "#1a1a1a", fontWeight: 600 },
  stepLine: { flex: 1, height: "2px", background: "#e8e8e8", marginBottom: "16px" },
  stepLineDone: { background: "#ffc107" },
  card: { background: "#fff", borderRadius: "14px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "24px", margin: "20px 16px 0", maxWidth: "680px", marginLeft: "auto", marginRight: "auto" },
  cardTitle: { fontSize: "18px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" },
  cardSub: { fontSize: "13px", color: "#888", marginBottom: "20px" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", color: "#444", marginBottom: "7px", textTransform: "uppercase" },
  input: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#1a1a1a", background: "#fff", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#1a1a1a", background: "#fff", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" },
  select: { width: "100%", padding: "13px 15px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "15px", color: "#1a1a1a", background: "#fff", outline: "none", cursor: "pointer" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  errorMsg: { fontSize: "12px", color: "#ef4444", marginTop: "5px" },
  eventGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "4px" },
  eventCard: { border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "14px 8px", textAlign: "center", cursor: "pointer", background: "#fff", transition: "all 0.2s" },
  eventCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  eventLabel: { fontSize: "13px", fontWeight: 600, color: "#444" },
  noteBox: { background: "#e8f4fd", borderRadius: "10px", padding: "12px", marginTop: "15px", textAlign: "center" },
  noteText: { fontSize: "12px", color: "#004085", margin: 0 },
  partsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "4px" },
  partCard: { border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", cursor: "pointer", background: "#fff" },
  partCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  partLabel: { fontSize: "13px", fontWeight: 500, color: "#444" },
  packageGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "4px" },
  packageCard: { border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "16px", cursor: "pointer", background: "#fff", position: "relative", transition: "all 0.2s" },
  packageCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  packageBadge: { position: "absolute", top: "-10px", right: "12px", background: "#ffc107", color: "#1a1a1a", fontSize: "10px", fontWeight: 700, padding: "2px 10px", borderRadius: "20px" },
  packageName: { fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "5px" },
  packageDesc: { fontSize: "12px", color: "#888", lineHeight: "1.5" },
  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  serviceCard: { border: "1.5px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", cursor: "pointer", background: "#fff" },
  serviceCardActive: { borderColor: "#ffc107", background: "#fff8e1" },
  serviceCheckbox: { width: "20px", height: "20px", border: "2px solid #e8e8e8", borderRadius: "6px", marginRight: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  serviceCheckboxActive: { background: "#ffc107", borderColor: "#ffc107" },
  serviceLabel: { fontSize: "14px", fontWeight: 500, color: "#444" },
  btnRow: { display: "flex", gap: "10px", marginTop: "24px" },
  btnBack: { padding: "14px 20px", border: "1.5px solid #e8e8e8", borderRadius: "10px", background: "#fff", color: "#888", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  btnNext: { flex: 1, padding: "14px", border: "none", borderRadius: "10px", background: "#ffc107", color: "#1a1a1a", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  tip: { background: "#fff8e1", borderLeft: "3px solid #ffc107", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: "12px", color: "#444", marginBottom: "16px", lineHeight: "1.5" },
  reviewSection: { marginBottom: "18px" },
  reviewSectionTitle: { fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid #e8e8e8" },
  reviewRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", gap: "12px" },
  reviewKey: { fontSize: "13px", color: "#888" },
  reviewVal: { fontSize: "13px", fontWeight: 600, color: "#1a1a1a", textAlign: "right" },
  reviewTags: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" },
  tag: { background: "#fff8e1", border: "1px solid #f0d060", color: "#1a1a1a", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" },
};

// ============================================
// ✅ COMPONENT FUNCTION
// ============================================
export default function CoupleDashboard() {
  const navigate = useNavigate();
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Couple Profile Data
  const [profileForm, setProfileForm] = useState({
    brideName: "",
    groomName: "",
    coupleName: "",
    weddingDate: "",
    location: "",
    bio: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    facebook: "",
    whatsapp: ""
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  // Videos
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0 });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  // Gallery
  const [gallery, setGallery] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [galleryForm, setGalleryForm] = useState({ title: "", images: [], category: "wedding" });
  
  // Analytics
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    watchTime: 0,
    totalLikes: 0,
    subscriberCount: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    videoPerformance: []
  });
  
  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Creator assigned
  const [assignedCreator, setAssignedCreator] = useState(null);
  
  // Booking
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    
    const coupleId = window.location.pathname.split("/")[3];
    if (coupleId) {
      loadCoupleData(coupleId);
    } else {
      const userEmail = localStorage.getItem("user_email");
      if (userEmail) {
        loadCoupleByEmail(userEmail);
      } else {
        navigate("/login");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
  };

  const loadCoupleData = (coupleId) => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const found = allCouples.find(c => c.id === coupleId);
    if (found) {
      setCouple(found);
      setProfileForm({
        brideName: found.brideName || "",
        groomName: found.groomName || "",
        coupleName: found.couple || found.name || "",
        weddingDate: found.weddingDate || "",
        location: found.location || "",
        bio: found.bio || "",
        instagram: found.instagram || "",
        tiktok: found.tiktok || "",
        youtube: found.youtube || "",
        facebook: found.facebook || "",
        whatsapp: found.whatsapp || ""
      });
      setProfileImage(found.image);
      setCoverImage(found.coverImage);
      loadVideos(coupleId);
      loadGallery(coupleId);
      loadComments(coupleId);
      loadNotifications(coupleId);
      loadAnalytics(coupleId);
      loadAssignedCreator(coupleId);
      loadBooking(coupleId);
    }
    setLoading(false);
  };

  const loadCoupleByEmail = (email) => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const found = allCouples.find(c => c.email === email);
    if (found) {
      loadCoupleData(found.id);
    } else {
      setLoading(false);
    }
  };

  const loadVideos = (coupleId) => {
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    const coupleVideos = allVideos.filter(v => v.coupleId === coupleId);
    setVideos(coupleVideos);
  };

  const loadGallery = (coupleId) => {
    const allGalleries = JSON.parse(localStorage.getItem("couple_galleries") || "[]");
    const coupleGalleries = allGalleries.filter(g => g.coupleId === coupleId);
    setGallery(coupleGalleries);
  };

  const loadComments = (coupleId) => {
    const allComments = JSON.parse(localStorage.getItem("wedding_comments") || "[]");
    const coupleComments = allComments.filter(c => c.coupleId === coupleId);
    setComments(coupleComments);
  };

  const loadNotifications = (coupleId) => {
    const allNotifs = JSON.parse(localStorage.getItem("couple_notifications") || "[]");
    const coupleNotifs = allNotifs.filter(n => n.coupleId === coupleId);
    setNotifications(coupleNotifs);
  };

  const loadAnalytics = (coupleId) => {
    const stored = JSON.parse(localStorage.getItem(`analytics_${coupleId}`) || "{}");
    setAnalytics({
      totalViews: stored.totalViews || 12450,
      watchTime: stored.watchTime || 3250,
      totalLikes: stored.totalLikes || 845,
      subscriberCount: stored.subscriberCount || 156,
      totalEarnings: stored.totalEarnings || 125000,
      pendingEarnings: stored.pendingEarnings || 45000,
      videoPerformance: stored.videoPerformance || []
    });
  };

  const loadAssignedCreator = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const coupleBooking = bookings.find(b => b.coupleId === coupleId || b.coupleName === couple?.couple);
    if (coupleBooking && coupleBooking.assignedCreator) {
      const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
      const creator = users.find(u => u.email === coupleBooking.assignedCreator);
      setAssignedCreator(creator);
    }
  };

  const loadBooking = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const coupleBooking = bookings.find(b => b.coupleId === coupleId || b.coupleName === couple?.couple);
    setBooking(coupleBooking);
  };

  const addNotification = (title, message, type = "info") => {
    const newNotif = {
      id: Date.now(),
      coupleId: couple?.id,
      title,
      message,
      type,
      read: false,
      time: new Date().toISOString()
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem("couple_notifications", JSON.stringify(updated));
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
        const updated = allCouples.map(c => c.id === couple.id ? { ...c, image: reader.result } : c);
        localStorage.setItem("wedding_couples", JSON.stringify(updated));
        addNotification("Profile Updated", "Your profile picture has been updated", "success");
        alert("✅ Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
        const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
        const updated = allCouples.map(c => c.id === couple.id ? { ...c, coverImage: reader.result } : c);
        localStorage.setItem("wedding_couples", JSON.stringify(updated));
        addNotification("Cover Updated", "Your cover image has been updated", "success");
        alert("✅ Cover image updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const updated = allCouples.map(c => c.id === couple.id ? {
      ...c,
      brideName: profileForm.brideName,
      groomName: profileForm.groomName,
      couple: profileForm.coupleName,
      name: profileForm.coupleName,
      weddingDate: profileForm.weddingDate,
      location: profileForm.location,
      bio: profileForm.bio,
      instagram: profileForm.instagram,
      tiktok: profileForm.tiktok,
      youtube: profileForm.youtube,
      facebook: profileForm.facebook,
      whatsapp: profileForm.whatsapp
    } : c);
    localStorage.setItem("wedding_couples", JSON.stringify(updated));
    setCouple({ ...couple, ...profileForm });
    addNotification("Profile Updated", "Your wedding profile has been updated", "success");
    setIsEditing(false);
    alert("✅ Profile updated!");
  };

  const handleUploadVideo = () => {
    if (!uploadForm.title || !uploadForm.videoUrl) {
      alert("Please fill title and video URL");
      return;
    }
    
    const newVideo = {
      id: Date.now(),
      coupleId: couple.id,
      coupleName: couple.couple,
      title: uploadForm.title,
      videoUrl: uploadForm.videoUrl,
      thumbnail: uploadForm.thumbnail,
      isPremium: uploadForm.isPremium,
      price: uploadForm.price,
      views: 0,
      likes: 0,
      status: "published",
      createdAt: new Date().toISOString()
    };
    
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    localStorage.setItem("couple_videos", JSON.stringify([...allVideos, newVideo]));
    setVideos([...videos, newVideo]);
    addNotification("Video Uploaded", `${uploadForm.title} has been added to your wedding gallery`, "success");
    setShowUploadModal(false);
    setUploadForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0 });
    setThumbnailPreview(null);
    alert("✅ Video uploaded!");
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm("Delete this video?")) {
      const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
      const updated = allVideos.filter(v => v.id !== videoId);
      localStorage.setItem("couple_videos", JSON.stringify(updated));
      setVideos(videos.filter(v => v.id !== videoId));
      addNotification("Video Deleted", "A video has been removed from your gallery", "info");
      alert("✅ Video deleted!");
    }
  };

  const handleGallerySubmit = () => {
    if (!galleryForm.title || galleryForm.images.length === 0) {
      alert("Please add title and at least one image");
      return;
    }
    
    const newAlbum = {
      id: Date.now(),
      coupleId: couple.id,
      title: galleryForm.title,
      category: galleryForm.category,
      images: galleryForm.images,
      createdAt: new Date().toISOString()
    };
    
    const allGalleries = JSON.parse(localStorage.getItem("couple_galleries") || "[]");
    localStorage.setItem("couple_galleries", JSON.stringify([...allGalleries, newAlbum]));
    setGallery([...gallery, newAlbum]);
    addNotification("Gallery Created", `${galleryForm.title} album has been added`, "success");
    setShowGalleryModal(false);
    setGalleryForm({ title: "", images: [], category: "wedding" });
    setGalleryPreview([]);
    alert("✅ Gallery created!");
  };

  const handleGalleryImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreview(prev => [...prev, reader.result]);
          setGalleryForm({ ...galleryForm, images: [...galleryForm.images, reader.result] });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: Date.now(),
      coupleId: couple.id,
      userName: "Guest",
      comment: newComment,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    const allComments = JSON.parse(localStorage.getItem("wedding_comments") || "[]");
    localStorage.setItem("wedding_comments", JSON.stringify([...allComments, newCommentObj]));
    setComments([...comments, newCommentObj]);
    setNewComment("");
    addNotification("New Comment", "Someone commented on your wedding page", "comment");
  };

  const getStatusBadge = (status) => {
    if (status === "confirmed") return <span style={{ background: "#d4edda", color: "#155724", padding: "4px 10px", borderRadius: "20px", fontSize: "11px" }}>✅ Confirmed</span>;
    if (status === "pending") return <span style={{ background: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "11px" }}>⏳ Pending</span>;
    return <span style={{ background: "#f8d7da", color: "#721c24", padding: "4px 10px", borderRadius: "20px", fontSize: "11px" }}>❌ Rejected</span>;
  };

  if (loading) {
    return <div style={{ ...styles.container, display: "flex", justifyContent: "center", alignItems: "center" }}>Loading couple dashboard...</div>;
  }

  if (!couple) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>No Wedding Found</h2>
          <p>Create your wedding profile to get started.</p>
          <Link to="/booking"><button style={styles.btnNext}>Book Your Wedding →</button></Link>
        </div>
      </div>
    );
  }

  // Dynamic styles based on dark mode
  const dynamicStyles = {
    container: { ...styles.container, background: darkMode ? "#111" : "#f7f7f5" },
    card: { ...styles.card, background: darkMode ? "#1e1e1e" : "#fff" },
    cardTitle: { ...styles.cardTitle, color: darkMode ? "#fff" : "#1a1a1a" },
    label: { ...styles.label, color: darkMode ? "#fff" : "#444" },
    input: { ...styles.input, background: darkMode ? "#333" : "#fff", color: darkMode ? "#fff" : "#1a1a1a", borderColor: darkMode ? "#444" : "#e8e8e8" },
    textarea: { ...styles.textarea, background: darkMode ? "#333" : "#fff", color: darkMode ? "#fff" : "#1a1a1a", borderColor: darkMode ? "#444" : "#e8e8e8" },
    select: { ...styles.select, background: darkMode ? "#333" : "#fff", color: darkMode ? "#fff" : "#1a1a1a", borderColor: darkMode ? "#444" : "#e8e8e8" },
  };

  return (
    <div style={dynamicStyles.container}>
      <button onClick={toggleDarkMode} style={styles.darkModeBtn || { position: "fixed", bottom: "20px", right: "20px", background: "#ffc107", border: "none", borderRadius: "50%", width: "50px", height: "50px", fontSize: "24px", cursor: "pointer", zIndex: 999 }}>{darkMode ? "☀️" : "🌙"}</button>
      
      <div style={styles.banner}>
        <p style={styles.bannerEyebrow}>NY Entertainment Rwanda</p>
        <h1 style={styles.bannerTitle}>Couple Dashboard</h1>
        <p style={styles.bannerSub}>Manage your wedding content, videos, and earnings</p>
      </div>

      {/* Simple placeholder for the rest - you can add more content here */}
      <div style={dynamicStyles.card}>
        <h2 style={dynamicStyles.cardTitle}>Welcome, {couple?.couple || couple?.name}!</h2>
        <p>Your couple dashboard is being loaded. You can manage your wedding videos, photos, and earnings here.</p>
        
        <div style={{ marginTop: "20px" }}>
          <h3>Quick Stats</h3>
          <p>Total Videos: {videos.length}</p>
          <p>Total Photos: {gallery.reduce((sum, g) => sum + g.images.length, 0)}</p>
          <p>Total Earnings: {analytics.totalEarnings.toLocaleString()} RWF</p>
        </div>
        
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => setShowUploadModal(true)} style={styles.btnNext}>Upload Video</button>
          <button onClick={() => setIsEditing(true)} style={styles.btnBack}>Edit Profile</button>
        </div>
      </div>

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div style={styles.modal || { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={dynamicStyles.card}>
            <h2 style={dynamicStyles.cardTitle}>Upload Wedding Video</h2>
            <label style={dynamicStyles.label}>Video Title</label>
            <input type="text" placeholder="e.g., Our Wedding Highlights" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} style={dynamicStyles.input} />
            <label style={dynamicStyles.label}>YouTube Video URL</label>
            <input type="text" placeholder="https://youtu.be/VIDEO_ID" value={uploadForm.videoUrl} onChange={(e) => setUploadForm({...uploadForm, videoUrl: e.target.value})} style={dynamicStyles.input} />
            <label style={dynamicStyles.label}>Thumbnail (Optional)</label>
            <div style={styles.imageUploadArea || { border: "2px dashed #ddd", borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("thumbInput").click()}>
              {thumbnailPreview ? <img src={thumbnailPreview} alt="Preview" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "8px" }} /> : <div>Click to upload thumbnail</div>}
              <input id="thumbInput" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setThumbnailPreview(reader.result); setUploadForm({...uploadForm, thumbnail: reader.result}); }; reader.readAsDataURL(file); } }} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleUploadVideo} style={styles.btnNext}>Upload</button>
              <button onClick={() => setShowUploadModal(false)} style={styles.btnBack}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}