// src/pages/couple/CoupleDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

const toast = (msg, color = Y) => {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
    background: BLK, color: WHT, padding: "12px 20px",
    borderRadius: "10px", fontSize: "14px", fontWeight: "600",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)", borderLeft: `4px solid ${color}`,
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
};

export default function CoupleDashboard() {
  const navigate = useNavigate();
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [comments, setComments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  
  const [profile, setProfile] = useState({
    brideName: "", groomName: "", coupleName: "", weddingDate: "", location: "",
    bio: "", instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "",
    profileImage: null, coverImage: null, pageVisibility: "public", contentPermission: "public"
  });
  
  const [earnings, setEarnings] = useState({ total: 0, premium: 0, subscription: 0, pending: 0, history: [] });
  const [booking, setBooking] = useState(null);
  const [assignedCreator, setAssignedCreator] = useState(null);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  
  const [videoForm, setVideoForm] = useState({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0 });
  const [postForm, setPostForm] = useState({ title: "", content: "", image: null, category: "update" });
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    const coupleLoggedIn = localStorage.getItem("couple_logged_in") === "true";
    const userEmail = localStorage.getItem("user_email");
    if (!coupleLoggedIn && !userEmail) {
      navigate("/login");
      return;
    }
    if (userEmail) loadCoupleByEmail(userEmail);
    else navigate("/login");
  }, []);

  const loadCoupleByEmail = (email) => {
    const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    const found = allCouples.find(c => c.email === email);
    if (found) {
      setCouple(found);
      const displayName = found.couple || found.name || found.brideName || "Couple";
      setProfile({
        brideName: found.brideName || "", groomName: found.groomName || "",
        coupleName: displayName, weddingDate: found.weddingDate || "",
        location: found.location || "", bio: found.bio || "",
        instagram: found.instagram || "", tiktok: found.tiktok || "",
        youtube: found.youtube || "", facebook: found.facebook || "",
        whatsapp: found.whatsapp || "", profileImage: found.image || null,
        coverImage: found.coverImage || null, pageVisibility: found.pageVisibility || "public",
        contentPermission: found.contentPermission || "public"
      });
      setProfileForm({
        brideName: found.brideName || "", groomName: found.groomName || "",
        coupleName: displayName, weddingDate: found.weddingDate || "",
        location: found.location || "", bio: found.bio || "",
        instagram: found.instagram || "", tiktok: found.tiktok || "",
        youtube: found.youtube || "", facebook: found.facebook || "",
        whatsapp: found.whatsapp || "", profileImage: found.image || null,
        coverImage: found.coverImage || null, pageVisibility: found.pageVisibility || "public",
        contentPermission: found.contentPermission || "public"
      });
      setProfileImagePreview(found.image || null);
      loadVideos(found.id);
      loadGallery(found.id);
      loadPosts(found.id);
      loadNotifications(found.id);
      loadComments(found.id);
      loadSubscribers(found.id);
      loadEarnings(found.id);
      loadWithdrawals(found.id);
      loadBooking(found.id);
      loadAssignedCreator(found.id);
    }
    setLoading(false);
  };

  const loadVideos = (coupleId) => {
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    setVideos(allVideos.filter(v => v.coupleId === coupleId));
  };
  const loadGallery = (coupleId) => {
    const allGalleries = JSON.parse(localStorage.getItem("couple_galleries") || "[]");
    setGallery(allGalleries.filter(g => g.coupleId === coupleId));
  };
  const loadPosts = (coupleId) => {
    const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
    setPosts(allPosts.filter(p => p.coupleId === coupleId));
  };
  const loadNotifications = (coupleId) => {
    const allNotifs = JSON.parse(localStorage.getItem("couple_notifications") || "[]");
    setNotifications(allNotifs.filter(n => n.coupleId === coupleId));
  };
  const loadComments = (coupleId) => {
    const allComments = JSON.parse(localStorage.getItem("wedding_comments") || "[]");
    setComments(allComments.filter(c => c.coupleId === coupleId));
  };
  const loadSubscribers = (coupleId) => {
    setSubscribers(JSON.parse(localStorage.getItem(`subscribers_${coupleId}`) || "[]"));
  };
  const loadEarnings = (coupleId) => {
    const stored = JSON.parse(localStorage.getItem(`earnings_${coupleId}`) || "{}");
    setEarnings({ total: stored.total || 125000, premium: stored.premium || 87500, subscription: stored.subscription || 37500, pending: stored.pending || 45000, history: stored.history || [] });
  };
  const loadWithdrawals = (coupleId) => {
    setWithdrawals(JSON.parse(localStorage.getItem(`withdrawals_${coupleId}`) || "[]"));
  };
  const loadBooking = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    setBooking(bookings.find(b => b.coupleId === coupleId || b.coupleName === couple?.couple));
  };
  const loadAssignedCreator = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const coupleBooking = bookings.find(b => b.coupleId === coupleId);
    if (coupleBooking && coupleBooking.assignedCreator) {
      const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
      setAssignedCreator(users.find(u => u.email === coupleBooking.assignedCreator));
    }
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleImageUpload = (e, setPreview, setForm) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setForm(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
        setPostForm({ ...postForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
        setProfileImageFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ WORKING SAVE FUNCTION
  const handleUpdateProfile = () => {
    console.log("Save button clicked");
    
    if (!couple) {
      toast("Error: No couple data found", "#ef4444");
      return;
    }
    
    try {
      const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
      const displayName = profileForm.coupleName || profileForm.brideName || profileForm.groomName || "Couple";
      const finalImage = profileImageFile || profile.profileImage || null;
      
      const updatedCouples = allCouples.map(c => {
        if (c.id === couple.id) {
          return { 
            ...c, 
            brideName: profileForm.brideName || "",
            groomName: profileForm.groomName || "",
            coupleName: displayName,
            couple: displayName,
            name: displayName,
            weddingDate: profileForm.weddingDate || "",
            location: profileForm.location || "",
            bio: profileForm.bio || "",
            instagram: profileForm.instagram || "",
            tiktok: profileForm.tiktok || "",
            youtube: profileForm.youtube || "",
            facebook: profileForm.facebook || "",
            whatsapp: profileForm.whatsapp || "",
            pageVisibility: profileForm.pageVisibility || "public",
            contentPermission: profileForm.contentPermission || "public",
            image: finalImage,
            profileImage: finalImage
          };
        }
        return c;
      });
      
      localStorage.setItem("wedding_couples", JSON.stringify(updatedCouples));
      
      setProfile({
        ...profile,
        brideName: profileForm.brideName || "",
        groomName: profileForm.groomName || "",
        coupleName: displayName,
        weddingDate: profileForm.weddingDate || "",
        location: profileForm.location || "",
        bio: profileForm.bio || "",
        instagram: profileForm.instagram || "",
        tiktok: profileForm.tiktok || "",
        youtube: profileForm.youtube || "",
        facebook: profileForm.facebook || "",
        whatsapp: profileForm.whatsapp || "",
        profileImage: finalImage
      });
      
      setCouple(updatedCouples.find(c => c.id === couple.id));
      
      localStorage.setItem("user_name", displayName);
      localStorage.setItem("couple_name", displayName);
      localStorage.setItem("couple_logged_in", "true");
      if (finalImage) {
        localStorage.setItem("user_profile_image", finalImage);
      }
      
      toast("✅ Profile updated successfully!");
      setShowProfileModal(false);
      setProfileImageFile(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Error:", error);
      toast("Error saving profile", "#ef4444");
    }
  };

  const handleUploadVideo = () => {
    if (!videoForm.title || !videoForm.videoUrl) {
      toast("Please fill title and video URL", "#ef4444");
      return;
    }
    const finalUrl = convertToEmbedUrl(videoForm.videoUrl);
    if (!finalUrl.includes("youtube.com/embed/")) {
      toast("Invalid YouTube URL", "#ef4444");
      return;
    }
    const newVideo = {
      id: Date.now(), coupleId: couple.id, coupleName: couple.couple, title: videoForm.title,
      videoUrl: finalUrl, thumbnail: videoForm.thumbnail, isPremium: videoForm.isPremium,
      price: videoForm.price, views: 0, likes: 0, comments: 0, shares: 0,
      status: "published", createdAt: new Date().toISOString()
    };
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    localStorage.setItem("couple_videos", JSON.stringify([...allVideos, newVideo]));
    setVideos([...videos, newVideo]);
    setShowVideoModal(false);
    setVideoForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0 });
    setThumbnailPreview(null);
    toast("✅ Video uploaded!");
  };

  const handleCreatePost = () => {
    if (!postForm.title || !postForm.content) {
      toast("Please fill title and content", "#ef4444");
      return;
    }
    const newPost = {
      id: Date.now(), coupleId: couple.id, coupleName: couple.couple, title: postForm.title,
      content: postForm.content, image: postForm.image, category: postForm.category,
      likes: 0, comments: 0, shares: 0, createdAt: new Date().toISOString()
    };
    const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
    localStorage.setItem("couple_posts", JSON.stringify([newPost, ...allPosts]));
    setPosts([newPost, ...posts]);
    setShowPostModal(false);
    setPostForm({ title: "", content: "", image: null, category: "update" });
    setPostImagePreview(null);
    toast("✅ Post published!");
  };

  const handleRequestWithdrawal = () => {
    if (!withdrawalAmount || withdrawalAmount < 10000) {
      toast("Minimum withdrawal amount is 10,000 RWF", "#ef4444");
      return;
    }
    const newWithdrawal = { id: Date.now(), amount: parseInt(withdrawalAmount), status: "pending", requestedAt: new Date().toISOString() };
    const updatedWithdrawals = [newWithdrawal, ...withdrawals];
    setWithdrawals(updatedWithdrawals);
    localStorage.setItem(`withdrawals_${couple?.id}`, JSON.stringify(updatedWithdrawals));
    setShowWithdrawalModal(false);
    setWithdrawalAmount("");
    toast("✅ Withdrawal request submitted!");
  };

  const getStatusBadge = (status) => {
    if (status === "confirmed") return <span style={{ background: "#d4edda", color: "#155724", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>✅ Confirmed</span>;
    if (status === "pending") return <span style={{ background: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>⏳ Pending</span>;
    if (status === "rejected") return <span style={{ background: "#f8d7da", color: "#721c24", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>❌ Rejected</span>;
    return <span style={{ background: "#e2e3e5", color: "#383d41", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{status || "Unknown"}</span>;
  };

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor }}>Loading dashboard...</div>;
  if (!couple) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor }}>No wedding found. <Link to="/booking">Book your wedding →</Link></div>;

  return (
    <div style={{ minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", color: textColor, padding: "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>💑 Couple Dashboard</h1>
        
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{videos.length}</div><div>Videos</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{earnings.total.toLocaleString()} RWF</div><div>Total Earnings</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{earnings.pending.toLocaleString()} RWF</div><div>Pending</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderBottom: `1px solid ${borderColor}`, marginBottom: "20px", paddingBottom: "12px" }}>
          {["dashboard", "videos", "posts", "earnings", "profile"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 20px", background: activeTab === tab ? `${Y}20` : "none", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: activeTab === tab ? "bold" : "normal", color: activeTab === tab ? Y : textMuted }}>
              {tab === "dashboard" && "📊 Dashboard"} {tab === "videos" && "🎬 Videos"} {tab === "posts" && "📝 Posts"} {tab === "earnings" && "💰 Earnings"} {tab === "profile" && "👤 Profile"}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>Welcome, {profile.coupleName || profile.brideName || "Couple"}!</h2>
            {booking && <div style={{ marginTop: "16px", padding: "12px", background: `${Y}10`, borderRadius: "8px" }}>📅 {booking.package} on {new Date(booking.date).toLocaleDateString()} {getStatusBadge(booking.status)}</div>}
            {assignedCreator && <div style={{ marginTop: "16px", padding: "12px", background: `${Y}10`, borderRadius: "8px" }}>🎥 Videographer: {assignedCreator.name}</div>}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2>🎬 Wedding Videos</h2>
              <button onClick={() => setShowVideoModal(true)} style={{ background: Y, border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>+ Upload Video</button>
            </div>
            {videos.length === 0 ? <p>No videos yet.</p> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {videos.map(v => <div key={v.id} style={{ border: `1px solid ${borderColor}`, borderRadius: "8px", overflow: "hidden" }}>
                  <img src={v.thumbnail || "https://via.placeholder.com/300x160"} alt={v.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                  <div style={{ padding: "12px" }}><h3>{v.title}</h3>{v.isPremium && <span style={{ background: Y, padding: "2px 8px", borderRadius: "10px", fontSize: "10px" }}>Premium</span>}</div>
                </div>)}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2>📝 Wedding Stories</h2>
              <button onClick={() => setShowPostModal(true)} style={{ background: Y, border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>+ Create Post</button>
            </div>
            {posts.length === 0 ? <p>No posts yet.</p> : posts.map(p => <div key={p.id} style={{ borderBottom: `1px solid ${borderColor}`, padding: "12px 0" }}><h3>{p.title}</h3><p>{p.content?.substring(0, 100)}...</p></div>)}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>💰 Earnings</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "20px" }}>
              <div><strong>Total:</strong> {earnings.total.toLocaleString()} RWF</div>
              <div><strong>Pending:</strong> {earnings.pending.toLocaleString()} RWF</div>
            </div>
            <button onClick={() => setShowWithdrawalModal(true)} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Request Withdrawal</button>
            {withdrawals.length > 0 && <div style={{ marginTop: "20px" }}><h3>History</h3>{withdrawals.map(w => <div key={w.id}>💰 {w.amount.toLocaleString()} RWF - {w.status}</div>)}</div>}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>👤 Wedding Profile</h2>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", overflow: "hidden" }}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  profile.coupleName?.charAt(0) || profile.brideName?.charAt(0) || "C"
                )}
              </div>
            </div>
            <p><strong>Couple:</strong> {profile.coupleName}</p>
            <p><strong>Date:</strong> {profile.weddingDate || "Not set"}</p>
            <p><strong>Location:</strong> {profile.location || "Not set"}</p>
            <button 
              onClick={() => {
                setProfileForm({
                  brideName: profile.brideName || "",
                  groomName: profile.groomName || "",
                  coupleName: profile.coupleName || "",
                  weddingDate: profile.weddingDate || "",
                  location: profile.location || "",
                  bio: profile.bio || "",
                  instagram: profile.instagram || "",
                  tiktok: profile.tiktok || "",
                  youtube: profile.youtube || "",
                  facebook: profile.facebook || "",
                  whatsapp: profile.whatsapp || "",
                  pageVisibility: profile.pageVisibility || "public",
                  contentPermission: profile.contentPermission || "public",
                  profileImage: profile.profileImage || null
                });
                setProfileImagePreview(profile.profileImage || null);
                setProfileImageFile(null);
                setShowProfileModal(true);
              }} 
              style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "16px", fontWeight: "bold" }}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Upload Video Modal */}
      {showVideoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%" }}>
            <h2 style={{ marginBottom: "16px" }}>Upload Video</h2>
            <input placeholder="Title" style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} />
            <input placeholder="YouTube URL" style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={videoForm.videoUrl} onChange={e => setVideoForm({...videoForm, videoUrl: e.target.value})} />
            <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
              <input type="checkbox" checked={videoForm.isPremium} onChange={e => setVideoForm({...videoForm, isPremium: e.target.checked})} /> Premium Video
            </label>
            {videoForm.isPremium && <input type="number" placeholder="Price (RWF)" style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={videoForm.price} onChange={e => setVideoForm({...videoForm, price: parseInt(e.target.value) || 0})} />}
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button onClick={handleUploadVideo} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>Upload</button>
              <button onClick={() => setShowVideoModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%" }}>
            <h2 style={{ marginBottom: "16px" }}>Share Your Story</h2>
            <input placeholder="Title" style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
            <select style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
              <option value="update">Wedding Update</option>
              <option value="story">Love Story</option>
              <option value="anniversary">Anniversary</option>
              <option value="thanks">Thank You</option>
            </select>
            <textarea placeholder="Content" rows="4" style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box", resize: "vertical" }} value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
            <div style={{ border: `2px dashed ${borderColor}`, borderRadius: "8px", padding: "16px", textAlign: "center", cursor: "pointer", margin: "10px 0" }} onClick={() => document.getElementById("postImageInput")?.click()}>
              {postImagePreview ? <img src={postImagePreview} style={{ maxHeight: "100px" }} alt="preview" /> : "Click to upload image"}
              <input id="postImageInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handlePostImageUpload} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button onClick={handleCreatePost} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>Publish</button>
              <button onClick={() => setShowPostModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "20px" }}>Edit Wedding Profile</h2>
            
            {/* Profile Image Upload Section */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div 
                onClick={() => document.getElementById("editProfileImageInput")?.click()}
                style={{ width: "100px", height: "100px", borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", fontWeight: "bold", cursor: "pointer", overflow: "hidden" }}>
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  (profileForm.coupleName?.charAt(0) || profileForm.brideName?.charAt(0) || "C")
                )}
              </div>
              <input id="editProfileImageInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handleProfileImageSelect} />
              <p style={{ fontSize: "11px", marginTop: "8px", color: textMuted }}>Click photo to change</p>
            </div>
            
            <input 
              placeholder="Couple Name" 
              style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={profileForm.coupleName || ""} 
              onChange={e => setProfileForm({...profileForm, coupleName: e.target.value})} 
            />
            <input 
              placeholder="Bride's Name" 
              style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={profileForm.brideName || ""} 
              onChange={e => setProfileForm({...profileForm, brideName: e.target.value})} 
            />
            <input 
              placeholder="Groom's Name" 
              style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={profileForm.groomName || ""} 
              onChange={e => setProfileForm({...profileForm, groomName: e.target.value})} 
            />
            <input 
              type="date" 
              style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={profileForm.weddingDate || ""} 
              onChange={e => setProfileForm({...profileForm, weddingDate: e.target.value})} 
            />
            <input 
              placeholder="Location" 
              style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={profileForm.location || ""} 
              onChange={e => setProfileForm({...profileForm, location: e.target.value})} 
            />
            <textarea 
              placeholder="Bio / Love Story" 
              rows="3" 
              style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box", resize: "vertical" }} 
              value={profileForm.bio || ""} 
              onChange={e => setProfileForm({...profileForm, bio: e.target.value})} 
            />
            
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button 
                onClick={handleUpdateProfile} 
                style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}
              >
                SAVE CHANGES
              </button>
              <button 
                onClick={() => setShowProfileModal(false)} 
                style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "90%" }}>
            <h2 style={{ marginBottom: "16px" }}>Request Withdrawal</h2>
            <p>Available: <strong style={{ color: Y }}>{earnings.pending.toLocaleString()} RWF</strong></p>
            <input 
              type="number" 
              placeholder="Amount (RWF)" 
              style={{ width: "100%", padding: "10px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={withdrawalAmount} 
              onChange={e => setWithdrawalAmount(e.target.value)} 
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button onClick={handleRequestWithdrawal} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>Request</button>
              <button onClick={() => setShowWithdrawalModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}