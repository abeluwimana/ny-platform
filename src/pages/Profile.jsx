// src/pages/Profile.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    bio: "",
    district: "",
    profession: "",
    skills: "",
    experience: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    facebook: "",
    whatsapp: "",
    twitter: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
  }, []);

  // Load user data
  useEffect(() => {
    const loggedIn = localStorage.getItem("user_logged_in");
    const adminLoggedIn = localStorage.getItem("admin_logged_in");
    
    if (!loggedIn && !adminLoggedIn) {
      navigate("/login");
      return;
    }
    loadUser();
    loadBookings();
    loadNotifications();
  }, [navigate]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
    showToast(newMode ? "🌙 Dark Mode On" : "☀️ Light Mode On", "success");
  };

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadUser = () => {
    const userEmail = localStorage.getItem("user_email");
    const userName = localStorage.getItem("user_name");
    const userRole = localStorage.getItem("user_role") || "client";
    const userPhone = localStorage.getItem("user_phone") || "";
    
    // Load role-specific profile images
    let savedProfileImage = null;
    let savedCoverImage = null;
    let userUsername = "";
    let userBio = "";
    let userDistrict = "";
    let userProfession = "";
    let userSkills = "";
    let userExperience = "";
    let socialLinks = {};
    
    if (userRole === "admin") {
      // Admin profile data - uses separate keys
      const adminProfile = JSON.parse(localStorage.getItem("admin_profile") || "{}");
      savedProfileImage = localStorage.getItem("admin_profile_image");
      savedCoverImage = localStorage.getItem("admin_cover_image");
      userUsername = adminProfile.username || userName?.toLowerCase().replace(/\s/g, "") || "admin";
      userBio = adminProfile.bio || "";
      userDistrict = adminProfile.district || "";
      userProfession = adminProfile.profession || "Platform Administrator";
      userSkills = adminProfile.skills || "System Management, User Administration";
      userExperience = adminProfile.experience || "5+ years";
      socialLinks = {
        instagram: adminProfile.instagram || "",
        tiktok: adminProfile.tiktok || "",
        youtube: adminProfile.youtube || "",
        facebook: adminProfile.facebook || "",
        whatsapp: adminProfile.whatsapp || "",
        twitter: adminProfile.twitter || ""
      };
    } else if (userRole === "creator") {
      // Creator profile data - uses separate keys
      const creatorProfile = JSON.parse(localStorage.getItem("creator_profile") || "{}");
      savedProfileImage = localStorage.getItem("creator_profile_image");
      savedCoverImage = localStorage.getItem("creator_cover_image");
      userUsername = creatorProfile.username || userName?.toLowerCase().replace(/\s/g, "") || "";
      userBio = creatorProfile.bio || "";
      userDistrict = creatorProfile.district || "";
      userProfession = creatorProfile.profession || "Wedding Videographer";
      userSkills = creatorProfile.skills || "";
      userExperience = creatorProfile.experience || "";
      socialLinks = {
        instagram: creatorProfile.instagram || "",
        tiktok: creatorProfile.tiktok || "",
        youtube: creatorProfile.youtube || "",
        facebook: creatorProfile.facebook || "",
        whatsapp: creatorProfile.whatsapp || "",
        twitter: creatorProfile.twitter || ""
      };
    } else {
      // Client profile data
      userUsername = localStorage.getItem("user_username") || userName?.toLowerCase().replace(/\s/g, "") || "";
      userBio = localStorage.getItem("user_bio") || "";
      userDistrict = localStorage.getItem("user_district") || "";
      userProfession = localStorage.getItem("user_profession") || "";
      userSkills = localStorage.getItem("user_skills") || "";
      userExperience = localStorage.getItem("user_experience") || "";
      savedProfileImage = localStorage.getItem("user_profile_image");
      savedCoverImage = localStorage.getItem("user_cover_image");
      socialLinks = JSON.parse(localStorage.getItem("user_social_links") || "{}");
    }
    
    setUser({ 
      email: userEmail, 
      name: userName, 
      role: userRole,
      phone: userPhone,
      username: userUsername,
      bio: userBio,
      district: userDistrict,
      profession: userProfession,
      skills: userSkills,
      experience: userExperience,
      joinDate: localStorage.getItem("user_join_date") || "January 2025",
      verified: userRole === "admin" || userRole === "creator"
    });
    
    if (savedProfileImage) setProfileImage(savedProfileImage);
    if (savedCoverImage) setCoverImage(savedCoverImage);
    
    setFormData({
      name: userName || "",
      phone: userPhone || "",
      username: userUsername || "",
      bio: userBio || "",
      district: userDistrict || "",
      profession: userProfession || "",
      skills: userSkills || "",
      experience: userExperience || "",
      instagram: socialLinks.instagram || "",
      tiktok: socialLinks.tiktok || "",
      youtube: socialLinks.youtube || "",
      facebook: socialLinks.facebook || "",
      whatsapp: socialLinks.whatsapp || "",
      twitter: socialLinks.twitter || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setLoading(false);
  };

  const loadBookings = () => {
    const allBookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const userEmail = localStorage.getItem("user_email");
    const userRole = localStorage.getItem("user_role");
    
    let userBookings;
    if (userRole === "admin") {
      userBookings = allBookings;
    } else if (userRole === "creator") {
      userBookings = allBookings.filter(b => b.assignedCreator === userEmail || b.creatorId === userEmail);
    } else {
      userBookings = allBookings.filter(b => b.userId === userEmail || b.email === userEmail);
    }
    setBookings(userBookings);
  };

  const loadNotifications = () => {
    const userRole = localStorage.getItem("user_role");
    let savedNotifications = [];
    
    if (userRole === "admin") {
      savedNotifications = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    } else if (userRole === "creator") {
      savedNotifications = JSON.parse(localStorage.getItem("creator_notifications") || "[]");
    } else {
      savedNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    }
    setNotifications(savedNotifications);
  };

  const addNotification = (title, message, type = "booking") => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      time: new Date().toISOString()
    };
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    
    const userRole = localStorage.getItem("user_role");
    const storageKey = userRole === "admin" ? "admin_notifications" : userRole === "creator" ? "creator_notifications" : "user_notifications";
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const markNotificationRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    
    const userRole = localStorage.getItem("user_role");
    const storageKey = userRole === "admin" ? "admin_notifications" : userRole === "creator" ? "creator_notifications" : "user_notifications";
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        const userRole = localStorage.getItem("user_role");
        // Use role-specific keys for profile images
        if (userRole === "admin") {
          localStorage.setItem("admin_profile_image", reader.result);
        } else if (userRole === "creator") {
          localStorage.setItem("creator_profile_image", reader.result);
        } else {
          localStorage.setItem("user_profile_image", reader.result);
        }
        showToast("Profile picture updated!", "success");
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
        const userRole = localStorage.getItem("user_role");
        // Use role-specific keys for cover images
        if (userRole === "admin") {
          localStorage.setItem("admin_cover_image", reader.result);
        } else if (userRole === "creator") {
          localStorage.setItem("creator_cover_image", reader.result);
        } else {
          localStorage.setItem("user_cover_image", reader.result);
        }
        showToast("Cover image updated!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    const userRole = localStorage.getItem("user_role");
    if (userRole === "admin") {
      localStorage.removeItem("admin_profile_image");
    } else if (userRole === "creator") {
      localStorage.removeItem("creator_profile_image");
    } else {
      localStorage.removeItem("user_profile_image");
    }
    showToast("Profile picture removed", "success");
  };

  const handleUpdateProfile = () => {
    if (!formData.name.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }

    const userRole = localStorage.getItem("user_role");
    const userEmail = localStorage.getItem("user_email");
    
    // Update role-specific profile storage
    if (userRole === "admin") {
      const adminProfile = {
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio,
        district: formData.district,
        profession: formData.profession,
        skills: formData.skills,
        experience: formData.experience,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        youtube: formData.youtube,
        facebook: formData.facebook,
        whatsapp: formData.whatsapp,
        twitter: formData.twitter
      };
      localStorage.setItem("admin_profile", JSON.stringify(adminProfile));
    } else if (userRole === "creator") {
      const creatorProfile = {
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        bio: formData.bio,
        district: formData.district,
        profession: formData.profession,
        skills: formData.skills,
        experience: formData.experience,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        youtube: formData.youtube,
        facebook: formData.facebook,
        whatsapp: formData.whatsapp,
        twitter: formData.twitter
      };
      localStorage.setItem("creator_profile", JSON.stringify(creatorProfile));
    } else {
      // Client
      localStorage.setItem("user_name", formData.name);
      localStorage.setItem("user_phone", formData.phone);
      localStorage.setItem("user_username", formData.username);
      localStorage.setItem("user_bio", formData.bio);
      localStorage.setItem("user_district", formData.district);
      localStorage.setItem("user_profession", formData.profession);
      localStorage.setItem("user_skills", formData.skills);
      localStorage.setItem("user_experience", formData.experience);
      localStorage.setItem("user_social_links", JSON.stringify({
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        youtube: formData.youtube,
        facebook: formData.facebook,
        whatsapp: formData.whatsapp,
        twitter: formData.twitter
      }));
    }
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    const updatedUsers = users.map(u => {
      if (u.email === userEmail) {
        return { 
          ...u, 
          name: formData.name,
          phone: formData.phone,
          username: formData.username,
          bio: formData.bio,
          district: formData.district,
          profession: formData.profession,
          skills: formData.skills,
          experience: formData.experience
        };
      }
      return u;
    });
    localStorage.setItem("wedding_users", JSON.stringify(updatedUsers));
    
    setUser({ 
      ...user, 
      name: formData.name, 
      phone: formData.phone,
      username: formData.username,
      bio: formData.bio,
      district: formData.district,
      profession: formData.profession,
      skills: formData.skills,
      experience: formData.experience
    });
    
    showToast("Profile updated successfully!", "success");
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      showToast("Please fill all password fields", "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    const currentUser = users.find(u => u.email === user.email);
    
    if (currentUser && currentUser.password !== formData.currentPassword) {
      showToast("Current password is incorrect", "error");
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.email === user.email) {
        return { ...u, password: formData.newPassword };
      }
      return u;
    });
    localStorage.setItem("wedding_users", JSON.stringify(updatedUsers));
    
    showToast("Password changed successfully!", "success");
    setShowPasswordForm(false);
    setFormData({
      ...formData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleDeleteAccount = () => {
    const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    const updatedUsers = users.filter(u => u.email !== user.email);
    localStorage.setItem("wedding_users", JSON.stringify(updatedUsers));
    
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const updatedBookings = bookings.filter(b => b.userId !== user.email && b.email !== user.email);
    localStorage.setItem("wedding_bookings", JSON.stringify(updatedBookings));
    
    localStorage.removeItem("user_logged_in");
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_username");
    localStorage.removeItem("user_bio");
    localStorage.removeItem("user_district");
    localStorage.removeItem("user_profession");
    localStorage.removeItem("user_skills");
    localStorage.removeItem("user_experience");
    localStorage.removeItem("user_profile_image");
    localStorage.removeItem("user_cover_image");
    localStorage.removeItem("user_social_links");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_profile");
    localStorage.removeItem("admin_profile_image");
    localStorage.removeItem("admin_cover_image");
    localStorage.removeItem("creator_profile");
    localStorage.removeItem("creator_profile_image");
    localStorage.removeItem("creator_cover_image");
    
    navigate("/");
    window.location.reload();
  };

  const getUserStats = () => {
    const allBookings = bookings;
    const completed = allBookings.filter(b => b.status === "completed").length;
    const pending = allBookings.filter(b => b.status === "pending").length;
    const total = allBookings.length;
    
    if (user?.role === "admin") {
      const allUsers = JSON.parse(localStorage.getItem("wedding_users") || "[]");
      const allVideos = JSON.parse(localStorage.getItem("creator_videos") || "[]");
      return {
        totalUsers: allUsers.length,
        totalBookings: total,
        totalVideos: allVideos.length,
        pendingBookings: pending,
        completedEvents: completed
      };
    } else if (user?.role === "creator") {
      const creatorVideos = JSON.parse(localStorage.getItem("creator_videos") || "[]").filter(v => v.creatorId === user?.email);
      return {
        totalProjects: creatorVideos.length,
        earnings: "2.4M",
        rating: 4.9,
        followers: 1280,
        portfolioViews: 15420,
        engagement: "92%"
      };
    }
    
    return {
      totalBookings: total,
      pendingBookings: pending,
      completedEvents: completed,
      savedVideos: 8,
      favoriteCreators: 5
    };
  };

  const stats = getUserStats();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { label: "Pending", color: "#ffc107", bg: "#fff3cd" },
      confirmed: { label: "Confirmed", color: "#28a745", bg: "#d4edda" },
      completed: { label: "Completed", color: "#17a2b8", bg: "#d1ecf1" },
      rejected: { label: "Rejected", color: "#dc3545", bg: "#f8d7da" }
    };
    const s = statuses[status] || statuses.pending;
    return <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{s.label}</span>;
  };

  const getEventTypeLabel = (type) => {
    const types = {
      wedding: "Wedding",
      birthday: "Birthday",
      funeral: "Funeral",
      graduation: "Graduation",
      corporate: "Corporate"
    };
    return types[type] || type;
  };

  const districts = [
    "Gasabo", "Kicukiro", "Nyarugenge", "Bugesera", "Gatsibo", "Kayonza",
    "Kirehe", "Ngoma", "Nyagatare", "Rwamagana", "Burera", "Gakenke",
    "Gicumbi", "Musanze", "Rulindo", "Gisagara", "Huye", "Kamonyi",
    "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango", "Karongi",
    "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"
  ];

  if (loading) {
    return <div style={{ ...styles.container, background: darkMode ? "#111" : "#f5f5f5", color: darkMode ? "#fff" : "#333" }}>Loading...</div>;
  }

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#eee";
  const primaryColor = "#ffc107";

  return (
    <div style={{ ...styles.container, background: bgColor, color: textColor }}>
      {/* Dark Mode Toggle */}
      <button onClick={toggleDarkMode} style={styles.darkModeBtn}>
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div style={{ ...styles.card, background: cardBg, borderColor: borderColor }}>
        {/* Cover Banner */}
        <div style={styles.coverContainer}>
          {coverImage ? (
            <img src={coverImage} alt="Cover" style={styles.coverImage} />
          ) : (
            <div style={{ ...styles.coverPlaceholder, background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}40)` }}>
              <span>📸 Cover Image</span>
            </div>
          )}
          <button onClick={() => coverInputRef.current.click()} style={styles.coverUploadBtn}>
            📷 Change Cover
          </button>
          <input type="file" ref={coverInputRef} style={{ display: "none" }} accept="image/*" onChange={handleCoverImageUpload} />
        </div>

        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={styles.avatar} />
            ) : (
              <div style={{ ...styles.avatarPlaceholder, background: primaryColor }}>
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <button onClick={() => fileInputRef.current.click()} style={styles.avatarUploadBtn}>
              📷
            </button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleProfileImageUpload} />
            {profileImage && (
              <button onClick={removeProfileImage} style={styles.avatarRemoveBtn}>🗑️</button>
            )}
          </div>
          
          <div style={styles.profileInfo}>
            <h1 style={{ ...styles.userName, color: textColor }}>{user?.name}</h1>
            <p style={{ ...styles.userUsername, color: textMuted }}>@{user?.username || user?.name?.toLowerCase().replace(/\s/g, "")}</p>
            <div style={styles.badgeContainer}>
              <span style={{ ...styles.roleBadge, background: primaryColor, color: "#000" }}>{user?.role === "admin" ? "👑 Admin" : user?.role === "creator" ? "🎬 Creator" : "👤 Client"}</span>
              {user?.verified && <span style={{ ...styles.verifiedBadge, background: "#28a745", color: "#fff" }}>✓ Verified</span>}
              <span style={{ ...styles.statusBadge, background: "#22c55e20", color: "#22c55e" }}>🟢 Online</span>
            </div>
            <p style={{ ...styles.joinDate, color: textMuted }}>Joined {user?.joinDate}</p>
          </div>
        </div>

        {message && (
          <div style={{ ...styles.message, ...(messageType === "error" ? styles.errorMessage : styles.successMessage), background: messageType === "error" ? "#f8d7da" : "#d4edda", color: messageType === "error" ? "#721c24" : "#155724" }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {["overview", "bookings", "notifications", "settings"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ ...styles.tab, ...(activeTab === tab ? { ...styles.activeTab, borderBottomColor: primaryColor, color: primaryColor } : { color: textMuted }) }}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "bookings" && "📋 Bookings"}
              {tab === "notifications" && `🔔 Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              {tab === "settings" && "⚙️ Settings"}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Stats Dashboard */}
            <div style={styles.statsGrid}>
              {user?.role === "admin" ? (
                <>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalUsers}</div>
                    <div style={styles.statLabel}>Total Users</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalBookings}</div>
                    <div style={styles.statLabel}>Total Bookings</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalVideos}</div>
                    <div style={styles.statLabel}>Total Videos</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.pendingBookings}</div>
                    <div style={styles.statLabel}>Pending</div>
                  </div>
                </>
              ) : user?.role === "creator" ? (
                <>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalProjects}</div>
                    <div style={styles.statLabel}>Total Projects</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.earnings} RWF</div>
                    <div style={styles.statLabel}>Earnings</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.rating} ⭐</div>
                    <div style={styles.statLabel}>Rating</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.followers}</div>
                    <div style={styles.statLabel}>Followers</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalBookings}</div>
                    <div style={styles.statLabel}>Total Bookings</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.pendingBookings}</div>
                    <div style={styles.statLabel}>Pending</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.completedEvents}</div>
                    <div style={styles.statLabel}>Completed</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.savedVideos}</div>
                    <div style={styles.statLabel}>Saved Videos</div>
                  </div>
                </>
              )}
            </div>

            {/* User Information */}
            <div style={styles.infoSection}>
              <h3 style={{ ...styles.sectionTitle, color: textColor }}>📌 About Me</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoRow}><span style={styles.label}>📍 District:</span><span>{user?.district || "Not set"}</span></div>
                <div style={styles.infoRow}><span style={styles.label}>📧 Email:</span><span>{user?.email}</span></div>
                <div style={styles.infoRow}><span style={styles.label}>📞 Phone:</span><span>{user?.phone || "Not set"}</span></div>
                {user?.profession && <div style={styles.infoRow}><span style={styles.label}>💼 Profession:</span><span>{user.profession}</span></div>}
                {user?.skills && <div style={styles.infoRow}><span style={styles.label}>🔧 Skills:</span><span>{user.skills}</span></div>}
                {user?.experience && <div style={styles.infoRow}><span style={styles.label}>📅 Experience:</span><span>{user.experience}</span></div>}
              </div>
              {user?.bio && (
                <div style={styles.bioBox}>
                  <span style={styles.label}>📝 Bio:</span>
                  <p style={styles.bioText}>{user.bio}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={styles.buttonGroup}>
              <button onClick={() => setIsEditing(true)} style={{ ...styles.editBtn, background: primaryColor, color: "#000" }}>✏️ Edit Profile</button>
              {user?.role !== "admin" && <Link to="/my-bookings"><button style={styles.bookingsBtn}>📋 My Bookings</button></Link>}
              {user?.role === "creator" && <Link to="/creator/dashboard"><button style={{ ...styles.bookingsBtn, background: "#28a745" }}>🎬 Creator Dashboard</button></Link>}
              {user?.role === "admin" && <Link to="/admin"><button style={{ ...styles.bookingsBtn, background: "#dc3545" }}>⚙️ Admin Dashboard</button></Link>}
            </div>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div style={styles.bookingsSection}>
            <h3 style={{ ...styles.sectionTitle, color: textColor }}>📋 My Bookings</h3>
            {bookings.length === 0 ? (
              <p style={{ color: textMuted, textAlign: "center", padding: "40px" }}>No bookings yet. <Link to="/booking" style={{ color: primaryColor }}>Book an event</Link></p>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} style={{ ...styles.bookingCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                  <div style={styles.bookingHeader}>
                    <span style={styles.bookingId}>#{booking.id}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div style={styles.bookingDetails}>
                    <p><strong>Event:</strong> {getEventTypeLabel(booking.eventType)}</p>
                    <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                    <p><strong>Package:</strong> {booking.package || "Not specified"}</p>
                    <p><strong>Location:</strong> {booking.location}, {booking.district}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div style={styles.notificationsSection}>
            <h3 style={{ ...styles.sectionTitle, color: textColor }}>🔔 Notifications</h3>
            {notifications.length === 0 ? (
              <p style={{ color: textMuted, textAlign: "center", padding: "40px" }}>No notifications yet</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} onClick={() => markNotificationRead(notif.id)} style={{ ...styles.notificationCard, background: darkMode ? "#2a2a2a" : "#f8f9fa", opacity: notif.read ? 0.7 : 1, cursor: "pointer" }}>
                  <div style={styles.notificationIcon}>{notif.type === "booking" ? "📅" : notif.type === "payment" ? "💰" : "📢"}</div>
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationTitle}>{notif.title}</div>
                    <div style={styles.notificationMessage}>{notif.message}</div>
                    <div style={styles.notificationTime}>{new Date(notif.time).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <>
            {/* Edit Profile Section */}
            {!isEditing ? (
              <div style={styles.infoSection}>
                <h3 style={{ ...styles.sectionTitle, color: textColor }}>Profile Information</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoRow}><span style={styles.label}>Name:</span><span>{user?.name}</span></div>
                  <div style={styles.infoRow}><span style={styles.label}>Username:</span><span>@{user?.username}</span></div>
                  <div style={styles.infoRow}><span style={styles.label}>Email:</span><span>{user?.email}</span></div>
                  <div style={styles.infoRow}><span style={styles.label}>Phone:</span><span>{user?.phone || "Not set"}</span></div>
                  <div style={styles.infoRow}><span style={styles.label}>District:</span><span>{user?.district || "Not set"}</span></div>
                </div>
                <div style={styles.buttonGroup}>
                  <button onClick={() => setIsEditing(true)} style={{ ...styles.editBtn, background: primaryColor, color: "#000" }}>✏️ Edit Profile</button>
                  <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={styles.passwordBtn}>🔒 Change Password</button>
                </div>
              </div>
            ) : (
              <div style={styles.editSection}>
                <h3 style={{ ...styles.sectionTitle, color: textColor }}>Edit Profile</h3>
                <div style={styles.inputGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>District</label>
                    <select name="district" value={formData.district} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }}>
                      <option value="">Select district</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Profession</label>
                    <input type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Videographer" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Skills</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Video Editing, Drone" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Experience</label>
                    <select name="experience" value={formData.experience} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }}>
                      <option value="">Select experience</option>
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>
                </div>

                <h3 style={{ ...styles.sectionTitle, color: textColor, marginTop: "20px" }}>Social Media Links</h3>
                <div style={styles.inputGrid}>
                  <div style={styles.inputGroup}><label style={styles.label}>Instagram</label><input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>TikTok</label><input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>YouTube</label><input type="text" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/@username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>Facebook</label><input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>WhatsApp</label><input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+250 7XX XXX XXX" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>Twitter/X</label><input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Bio / About</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell us about yourself..." style={{ ...styles.textarea, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>

                <div style={styles.buttonGroup}>
                  <button onClick={handleUpdateProfile} style={{ ...styles.saveBtn, background: "#28a745", color: "#fff" }}>💾 Save Changes</button>
                  <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            {/* Change Password Form */}
            {showPasswordForm && (
              <div style={{ ...styles.passwordSection, borderTopColor: borderColor }}>
                <h3 style={{ ...styles.sectionTitle, color: textColor }}>Change Password</h3>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>New Password</label>
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>
                <div style={styles.buttonGroup}>
                  <button onClick={handleChangePassword} style={{ ...styles.saveBtn, background: "#28a745", color: "#fff" }}>🔐 Update Password</button>
                  <button onClick={() => setShowPasswordForm(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div style={{ ...styles.dangerZone, background: "#f8d7da20", borderColor: "#f5c6cb" }}>
              <h3 style={{ ...styles.dangerTitle, color: "#721c24" }}>⚠️ Danger Zone</h3>
              <p style={styles.dangerText}>Once you delete your account, there is no going back. All your data will be permanently deleted.</p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={styles.deleteBtn}>🗑️ Delete Account</button>
              ) : (
                <div style={styles.deleteConfirm}>
                  <p style={{ color: "#721c24", marginBottom: "10px" }}>Are you absolutely sure? This action cannot be undone.</p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={handleDeleteAccount} style={{ ...styles.deleteBtn, background: "#dc3545" }}>Yes, Delete My Account</button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    transition: "all 0.3s ease",
  },
  darkModeBtn: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#ffc107",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid",
  },
  coverContainer: {
    position: "relative",
    height: "180px",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "#888",
  },
  coverUploadBtn: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "6px 12px",
    fontSize: "11px",
    cursor: "pointer",
  },
  profileHeader: {
    display: "flex",
    alignItems: "flex-end",
    padding: "0 30px 20px",
    marginTop: "-50px",
    gap: "20px",
    flexWrap: "wrap",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #ffc107",
  },
  avatarPlaceholder: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    fontWeight: "bold",
    color: "#000",
    border: "4px solid #ffc107",
  },
  avatarUploadBtn: {
    position: "absolute",
    bottom: "0",
    right: "0",
    background: "#ffc107",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    fontSize: "14px",
    cursor: "pointer",
  },
  avatarRemoveBtn: {
    position: "absolute",
    bottom: "0",
    left: "0",
    background: "#dc3545",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: "24px",
    marginBottom: "4px",
  },
  userUsername: {
    fontSize: "14px",
    marginBottom: "8px",
  },
  badgeContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  roleBadge: {
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  verifiedBadge: {
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  joinDate: {
    fontSize: "12px",
  },
  message: {
    padding: "12px",
    borderRadius: "8px",
    margin: "20px",
    textAlign: "center",
  },
  successMessage: {
    background: "#d4edda",
    color: "#155724",
  },
  errorMessage: {
    background: "#f8d7da",
    color: "#721c24",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #eee",
    padding: "0 20px",
  },
  tab: {
    padding: "12px 20px",
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
  },
  activeTab: {
    borderBottomColor: "#ffc107",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    padding: "20px",
  },
  statCard: {
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "12px",
    opacity: 0.7,
  },
  infoSection: {
    padding: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    paddingLeft: "12px",
    borderLeft: "3px solid #ffc107",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "12px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  label: {
    fontWeight: "bold",
    fontSize: "13px",
  },
  bioBox: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "8px",
  },
  bioText: {
    fontSize: "13px",
    marginTop: "8px",
    lineHeight: "1.5",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    padding: "20px",
    flexWrap: "wrap",
  },
  editBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  passwordBtn: {
    flex: 1,
    padding: "12px",
    background: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  saveBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  bookingsBtn: {
    flex: 1,
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  bookingsSection: {
    padding: "20px",
  },
  bookingCard: {
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "12px",
  },
  bookingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  bookingId: {
    fontWeight: "bold",
    fontSize: "13px",
  },
  bookingDetails: {
    fontSize: "13px",
    lineHeight: "1.6",
  },
  notificationsSection: {
    padding: "20px",
  },
  notificationCard: {
    display: "flex",
    gap: "12px",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "10px",
  },
  notificationIcon: {
    fontSize: "24px",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "4px",
  },
  notificationMessage: {
    fontSize: "12px",
    opacity: 0.8,
    marginBottom: "4px",
  },
  notificationTime: {
    fontSize: "10px",
    opacity: 0.6,
  },
  editSection: {
    padding: "20px",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "15px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },
  passwordSection: {
    padding: "20px",
    borderTop: "1px solid",
  },
  dangerZone: {
    margin: "20px",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid",
  },
  dangerTitle: {
    fontSize: "16px",
    marginBottom: "10px",
  },
  dangerText: {
    fontSize: "13px",
    marginBottom: "15px",
  },
  deleteBtn: {
    padding: "10px 20px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteConfirm: {
    marginTop: "10px",
  },
};

export default Profile;