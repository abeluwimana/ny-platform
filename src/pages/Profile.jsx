// src/pages/Profile.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  const [isMobile, setIsMobile] = useState(false);
  
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    bio: "",
    district: "",
    profession: "",
    skills: "",
    experience: "",
    weddingDate: "",
    location: "",
    brideName: "",
    groomName: "",
    coupleName: "",
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

  // Load user data from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = localStorage.getItem("user_logged_in");
    const adminLoggedIn = localStorage.getItem("admin_logged_in");
    const coupleLoggedIn = localStorage.getItem("couple_logged_in");
    const creatorLoggedIn = localStorage.getItem("creator_logged_in");
    
    if (!token && !loggedIn && !adminLoggedIn && !coupleLoggedIn && !creatorLoggedIn) {
      navigate("/login");
      return;
    }
    
    fetchUserProfile();
    fetchUserBookings();
    fetchUserNotifications();
  }, [navigate]);

  // ─── FETCH USER PROFILE FROM BACKEND ────────────────────────────
  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      if (data.success) {
        const userData = data.user;
        setUser(userData);
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          name: userData.name || "",
          phone: userData.phone || "",
          username: userData.username || "",
          bio: userData.bio || "",
          district: userData.district || "",
          profession: userData.profession || "",
          skills: userData.skills || "",
          experience: userData.experience || "",
          weddingDate: userData.weddingDate || "",
          location: userData.location || "",
          brideName: userData.brideName || "",
          groomName: userData.groomName || "",
          coupleName: userData.coupleName || "",
          instagram: userData.instagram || "",
          tiktok: userData.tiktok || "",
          youtube: userData.youtube || "",
          facebook: userData.facebook || "",
          whatsapp: userData.whatsapp || "",
          twitter: userData.twitter || ""
        }));
        
        if (userData.profileImage) setProfileImage(userData.profileImage);
        if (userData.coverImage) setCoverImage(userData.coverImage);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Fallback to localStorage
      loadUserFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // ─── FALLBACK: LOAD FROM LOCALSTORAGE ───────────────────────────
  const loadUserFromLocalStorage = () => {
    const userEmail = localStorage.getItem("user_email");
    const userName = localStorage.getItem("user_name");
    let userRole = localStorage.getItem("user_role") || "client";
    
    if (localStorage.getItem("admin_logged_in") === "true") userRole = "admin";
    else if (localStorage.getItem("couple_logged_in") === "true") userRole = "couple";
    else if (localStorage.getItem("creator_logged_in") === "true") userRole = "creator";
    
    // Load role-specific profile data
    let savedProfileImage = null;
    let savedCoverImage = null;
    let userUsername = "";
    let userBio = "";
    let userDistrict = "";
    let userProfession = "";
    let userSkills = "";
    let userExperience = "";
    let userWeddingDate = "";
    let userLocation = "";
    let userBrideName = "";
    let userGroomName = "";
    let userCoupleName = "";
    let socialLinks = {};
    
    if (userRole === "admin") {
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
    } else if (userRole === "couple") {
      const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
      const coupleData = allCouples.find(c => c.email === userEmail);
      if (coupleData) {
        savedProfileImage = coupleData.image || coupleData.profileImage || null;
        savedCoverImage = coupleData.coverImage || null;
        userCoupleName = coupleData.coupleName || coupleData.couple || coupleData.name || "";
        userBrideName = coupleData.brideName || "";
        userGroomName = coupleData.groomName || "";
        userWeddingDate = coupleData.weddingDate || "";
        userLocation = coupleData.location || "";
        userBio = coupleData.bio || "";
        userUsername = coupleData.username || userCoupleName.toLowerCase().replace(/\s/g, "") || "";
        userDistrict = coupleData.district || "";
        socialLinks = {
          instagram: coupleData.instagram || "",
          tiktok: coupleData.tiktok || "",
          youtube: coupleData.youtube || "",
          facebook: coupleData.facebook || "",
          whatsapp: coupleData.whatsapp || "",
          twitter: coupleData.twitter || ""
        };
      } else {
        userCoupleName = userName || "";
        userUsername = userName?.toLowerCase().replace(/\s/g, "") || "";
      }
    } else {
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
      name: userRole === "couple" ? (userCoupleName || userName) : userName,
      role: userRole,
      phone: localStorage.getItem("user_phone") || "",
      username: userUsername,
      bio: userBio,
      district: userDistrict,
      profession: userProfession,
      skills: userSkills,
      experience: userExperience,
      weddingDate: userWeddingDate,
      location: userLocation,
      brideName: userBrideName,
      groomName: userGroomName,
      coupleName: userCoupleName,
      joinDate: localStorage.getItem("user_join_date") || "January 2025",
      verified: userRole === "admin" || userRole === "creator"
    });
    
    if (savedProfileImage) setProfileImage(savedProfileImage);
    if (savedCoverImage) setCoverImage(savedCoverImage);
    
    setFormData({
      name: userRole === "couple" ? (userCoupleName || userName || "") : (userName || ""),
      phone: localStorage.getItem("user_phone") || "",
      username: userUsername || "",
      bio: userBio || "",
      district: userDistrict || "",
      profession: userProfession || "",
      skills: userSkills || "",
      experience: userExperience || "",
      weddingDate: userWeddingDate || "",
      location: userLocation || "",
      brideName: userBrideName || "",
      groomName: userGroomName || "",
      coupleName: userCoupleName || "",
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
  };

  // ─── FETCH USER BOOKINGS ────────────────────────────────────────
  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookings(data.bookings || []);
          return;
        }
      }
      
      // Fallback to localStorage
      loadBookingsFromLocalStorage();
    } catch (err) {
      console.error("Error fetching bookings:", err);
      loadBookingsFromLocalStorage();
    }
  };

  const loadBookingsFromLocalStorage = () => {
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

  // ─── FETCH USER NOTIFICATIONS ────────────────────────────────────
  const fetchUserNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          return;
        }
      }
      
      // Fallback to localStorage
      loadNotificationsFromLocalStorage();
    } catch (err) {
      console.error("Error fetching notifications:", err);
      loadNotificationsFromLocalStorage();
    }
  };

  const loadNotificationsFromLocalStorage = () => {
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

  // ─── UPDATE PROFILE ──────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      showToast(t('profile.nameRequired'), "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          username: formData.username,
          bio: formData.bio,
          district: formData.district,
          profession: formData.profession,
          skills: formData.skills,
          experience: formData.experience,
          weddingDate: formData.weddingDate,
          location: formData.location,
          brideName: formData.brideName,
          groomName: formData.groomName,
          coupleName: formData.coupleName,
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          facebook: formData.facebook,
          whatsapp: formData.whatsapp,
          twitter: formData.twitter
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showToast(t('profile.updateSuccess'), "success");
          setIsEditing(false);
          fetchUserProfile(); // Refresh data
          return;
        }
      }
      
      // Fallback to localStorage
      updateProfileLocalStorage();
    } catch (err) {
      console.error("Error updating profile:", err);
      updateProfileLocalStorage();
    }
  };

  const updateProfileLocalStorage = () => {
    const userRole = localStorage.getItem("user_role");
    const userEmail = localStorage.getItem("user_email");
    const displayName = userRole === "couple" ? (formData.coupleName || formData.name) : formData.name;
    
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
      localStorage.setItem("admin_name", formData.name);
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
      localStorage.setItem("creator_name", formData.name);
    } else if (userRole === "couple") {
      const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
      const updatedCouples = allCouples.map(c => {
        if (c.email === userEmail) {
          return {
            ...c,
            coupleName: formData.coupleName || formData.name,
            couple: formData.coupleName || formData.name,
            name: formData.coupleName || formData.name,
            brideName: formData.brideName,
            groomName: formData.groomName,
            weddingDate: formData.weddingDate,
            location: formData.location,
            bio: formData.bio,
            district: formData.district,
            instagram: formData.instagram,
            tiktok: formData.tiktok,
            youtube: formData.youtube,
            facebook: formData.facebook,
            whatsapp: formData.whatsapp,
            twitter: formData.twitter
          };
        }
        return c;
      });
      localStorage.setItem("wedding_couples", JSON.stringify(updatedCouples));
      localStorage.setItem("couple_name", formData.coupleName || formData.name);
    } else {
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
    
    const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    const updatedUsers = users.map(u => {
      if (u.email === userEmail) {
        return { 
          ...u, 
          name: displayName,
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
    localStorage.setItem("user_name", displayName);
    
    setUser({ 
      ...user, 
      name: displayName,
      phone: formData.phone,
      username: formData.username,
      bio: formData.bio,
      district: formData.district,
      profession: formData.profession,
      skills: formData.skills,
      experience: formData.experience,
      weddingDate: formData.weddingDate,
      location: formData.location,
      brideName: formData.brideName,
      groomName: formData.groomName,
      coupleName: formData.coupleName
    });
    
    showToast(t('profile.updateSuccess'), "success");
    setIsEditing(false);
  };

  // ─── CHANGE PASSWORD ─────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      showToast(t('profile.fillPasswordFields'), "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast(t('profile.passwordMismatch'), "error");
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast(t('profile.passwordMinLength'), "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showToast(t('profile.passwordChangeSuccess'), "success");
          setShowPasswordForm(false);
          setFormData({
            ...formData,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          return;
        }
      }
      
      showToast(t('profile.passwordChangeError'), "error");
    } catch (err) {
      console.error("Error changing password:", err);
      showToast(t('profile.passwordChangeError'), "error");
    }
  };

  // ─── DELETE ACCOUNT ──────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Clear all localStorage
        localStorage.clear();
        navigate("/");
        window.location.reload();
        return;
      }
      
      // Fallback: delete from localStorage
      deleteAccountLocalStorage();
    } catch (err) {
      console.error("Error deleting account:", err);
      deleteAccountLocalStorage();
    }
  };

  const deleteAccountLocalStorage = () => {
    const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    const updatedUsers = users.filter(u => u.email !== user.email);
    localStorage.setItem("wedding_users", JSON.stringify(updatedUsers));
    
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const updatedBookings = bookings.filter(b => b.userId !== user.email && b.email !== user.email);
    localStorage.setItem("wedding_bookings", JSON.stringify(updatedBookings));
    
    if (user.role === "couple") {
      const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
      const updatedCouples = allCouples.filter(c => c.email !== user.email);
      localStorage.setItem("wedding_couples", JSON.stringify(updatedCouples));
    }
    
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  // ─── TOAST NOTIFICATION ──────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  // ─── TOGGLE DARK MODE ────────────────────────────────────────────
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.body.style.background = newMode ? "#111" : "#f5f5f5";
  };

  // ─── HANDLE PROFILE IMAGE UPLOAD ────────────────────────────────
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        const userRole = localStorage.getItem("user_role");
        
        if (userRole === "admin") {
          localStorage.setItem("admin_profile_image", reader.result);
        } else if (userRole === "creator") {
          localStorage.setItem("creator_profile_image", reader.result);
        } else if (userRole === "couple") {
          const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
          const userEmail = localStorage.getItem("user_email");
          const updatedCouples = allCouples.map(c => 
            c.email === userEmail ? { ...c, image: reader.result, profileImage: reader.result } : c
          );
          localStorage.setItem("wedding_couples", JSON.stringify(updatedCouples));
          localStorage.setItem("user_profile_image", reader.result);
        } else {
          localStorage.setItem("user_profile_image", reader.result);
        }
        showToast(t('profile.imageUpdated'), "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── HANDLE COVER IMAGE UPLOAD ──────────────────────────────────
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
        const userRole = localStorage.getItem("user_role");
        
        if (userRole === "admin") {
          localStorage.setItem("admin_cover_image", reader.result);
        } else if (userRole === "creator") {
          localStorage.setItem("creator_cover_image", reader.result);
        } else if (userRole === "couple") {
          const allCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
          const userEmail = localStorage.getItem("user_email");
          const updatedCouples = allCouples.map(c => 
            c.email === userEmail ? { ...c, coverImage: reader.result } : c
          );
          localStorage.setItem("wedding_couples", JSON.stringify(updatedCouples));
        } else {
          localStorage.setItem("user_cover_image", reader.result);
        }
        showToast(t('profile.coverUpdated'), "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── HANDLE INPUT CHANGE ─────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── MARK NOTIFICATION READ ──────────────────────────────────────
  const markNotificationRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
    
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    
    const userRole = localStorage.getItem("user_role");
    const storageKey = userRole === "admin" ? "admin_notifications" : userRole === "creator" ? "creator_notifications" : "user_notifications";
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // ─── GET USER STATS ──────────────────────────────────────────────
  const getUserStats = () => {
    const allBookings = bookings;
    const completed = allBookings.filter(b => b.status === "completed" || b.status === "COMPLETED").length;
    const pending = allBookings.filter(b => b.status === "pending" || b.status === "PENDING").length;
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
      const creatorVideos = JSON.parse(localStorage.getItem("creator_videos") || "[]").filter(v => v.creatorId === user?.email || v.creatorEmail === user?.email);
      return {
        totalProjects: creatorVideos.length,
        earnings: "2.4M",
        rating: 4.9,
        followers: 1280,
        portfolioViews: 15420,
        engagement: "92%"
      };
    } else if (user?.role === "couple") {
      const coupleVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]").filter(v => v.coupleId === user?.email || v.coupleName === user?.name);
      
      const allSupports = JSON.parse(localStorage.getItem("video_supports") || "[]");
      const coupleSupports = allSupports.filter(s => s.coupleId === user?.email || s.coupleName === user?.name);
      const totalEarnings = coupleSupports.reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0);
      
      return {
        totalVideos: coupleVideos.length,
        totalViews: coupleVideos.reduce((sum, v) => sum + (v.views || 0), 0),
        totalLikes: coupleVideos.reduce((sum, v) => sum + (v.likes || 0), 0),
        supporters: coupleSupports.length,
        earnings: totalEarnings.toLocaleString(),
        pendingEarnings: "0"
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

  // ─── GET STATUS BADGE ────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    const statuses = {
      PENDING: { label: t('myBookings.pending'), color: "#ffc107", bg: "#fff3cd" },
      CONFIRMED: { label: t('myBookings.confirmed'), color: "#28a745", bg: "#d4edda" },
      COMPLETED: { label: t('myBookings.completed'), color: "#17a2b8", bg: "#d1ecf1" },
      REJECTED: { label: t('myBookings.cancelled'), color: "#dc3545", bg: "#f8d7da" },
      CANCELLED: { label: t('myBookings.cancelled'), color: "#dc3545", bg: "#f8d7da" }
    };
    const statusInfo = statuses[s] || statuses.PENDING;
    return <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{statusInfo.label}</span>;
  };

  // ─── GET EVENT TYPE LABEL ────────────────────────────────────────
  const getEventTypeLabel = (type) => {
    const types = {
      wedding: t('home.wedding'),
      birthday: t('home.birthday'),
      funeral: t('home.funeral'),
      graduation: t('home.graduation'),
      corporate: t('home.corporate'),
      WEDDING: t('home.wedding'),
      BIRTHDAY: t('home.birthday'),
      FUNERAL: t('home.funeral'),
      GRADUATION: t('home.graduation'),
      CORPORATE: t('home.corporate'),
      DOTE: t('home.dote')
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
    return (
      <div style={{ 
        ...styles.container, 
        background: darkMode ? "#111" : "#f5f5f5", 
        color: darkMode ? "#fff" : "#333",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={styles.spinner}></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
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
              <span>📸 {t('profile.coverImage')}</span>
            </div>
          )}
          <button onClick={() => coverInputRef.current.click()} style={styles.coverUploadBtn}>
            📷 {t('profile.changeCover')}
          </button>
          <input type="file" ref={coverInputRef} style={{ display: "none" }} accept="image/*" onChange={handleCoverImageUpload} />
        </div>

        {/* Profile Header */}
        <div style={{ ...styles.profileHeader, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-end", textAlign: isMobile ? "center" : "left" }}>
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
              <button onClick={() => { setProfileImage(null); localStorage.removeItem("user_profile_image"); showToast(t('profile.imageRemoved'), "success"); }} style={styles.avatarRemoveBtn}>🗑️</button>
            )}
          </div>
          
          <div style={{ ...styles.profileInfo, textAlign: isMobile ? "center" : "left" }}>
            <h1 style={{ ...styles.userName, color: textColor }}>{user?.name}</h1>
            <p style={{ ...styles.userUsername, color: textMuted }}>@{user?.username || user?.name?.toLowerCase().replace(/\s/g, "")}</p>
            <div style={{ ...styles.badgeContainer, justifyContent: isMobile ? "center" : "flex-start" }}>
              <span style={{ ...styles.roleBadge, background: primaryColor, color: "#000" }}>
                {user?.role === "admin" ? "👑 Admin" : user?.role === "creator" ? "🎬 Creator" : user?.role === "couple" ? "💑 Couple" : "👤 Client"}
              </span>
              {user?.verified && <span style={{ ...styles.verifiedBadge, background: "#28a745", color: "#fff" }}>✓ Verified</span>}
              <span style={{ ...styles.statusBadge, background: "#22c55e20", color: "#22c55e" }}>🟢 Online</span>
            </div>
            {user?.role === "couple" && user?.weddingDate && (
              <p style={{ ...styles.joinDate, color: textMuted }}>💒 {t('profile.weddingDate')}: {new Date(user.weddingDate).toLocaleDateString()}</p>
            )}
            <p style={{ ...styles.joinDate, color: textMuted }}>{t('profile.joined')} {user?.joinDate}</p>
          </div>
        </div>

        {message && (
          <div style={{ ...styles.message, ...(messageType === "error" ? styles.errorMessage : styles.successMessage), background: messageType === "error" ? "#f8d7da" : "#d4edda", color: messageType === "error" ? "#721c24" : "#155724" }}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div style={{ ...styles.tabs, overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch" }}>
          {["overview", "bookings", "notifications", "settings"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                ...styles.tab, 
                ...(activeTab === tab ? { ...styles.activeTab, borderBottomColor: primaryColor, color: primaryColor } : { color: textMuted }),
                whiteSpace: "nowrap",
                fontSize: isMobile ? "12px" : "14px",
                padding: isMobile ? "10px 14px" : "12px 20px"
              }}
            >
              {tab === "overview" && "📊 " + t('profile.overview')}
              {tab === "bookings" && "📋 " + t('profile.bookings')}
              {tab === "notifications" && `🔔 ${t('profile.notifications')}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              {tab === "settings" && "⚙️ " + t('profile.settings')}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            <div style={{ ...styles.statsGrid, gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(150px, 1fr))" }}>
              {user?.role === "admin" ? (
                <>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalUsers}</div>
                    <div style={styles.statLabel}>{t('admin.totalUsers')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalBookings}</div>
                    <div style={styles.statLabel}>{t('admin.totalBookings')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalVideos}</div>
                    <div style={styles.statLabel}>{t('admin.videos')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.pendingBookings}</div>
                    <div style={styles.statLabel}>{t('clientDashboard.pending')}</div>
                  </div>
                </>
              ) : user?.role === "creator" ? (
                <>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalProjects}</div>
                    <div style={styles.statLabel}>{t('creatorDashboard.totalProjects')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.earnings} RWF</div>
                    <div style={styles.statLabel}>{t('creatorDashboard.earnings')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.rating} ⭐</div>
                    <div style={styles.statLabel}>{t('home.rating')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.followers}</div>
                    <div style={styles.statLabel}>{t('creatorDashboard.followers')}</div>
                  </div>
                </>
              ) : user?.role === "couple" ? (
                <>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalVideos}</div>
                    <div style={styles.statLabel}>{t('videos.totalVideos')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalViews}</div>
                    <div style={styles.statLabel}>{t('videos.totalViews')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalLikes}</div>
                    <div style={styles.statLabel}>{t('videos.likes')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.supporters}</div>
                    <div style={styles.statLabel}>{t('videos.supporters')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.earnings} RWF</div>
                    <div style={styles.statLabel}>{t('support.coupleReceives')}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.totalBookings}</div>
                    <div style={styles.statLabel}>{t('clientDashboard.totalBookings')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.pendingBookings}</div>
                    <div style={styles.statLabel}>{t('clientDashboard.pending')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.completedEvents}</div>
                    <div style={styles.statLabel}>{t('clientDashboard.completed')}</div>
                  </div>
                  <div style={{ ...styles.statCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                    <div style={styles.statValue}>{stats.savedVideos}</div>
                    <div style={styles.statLabel}>{t('clientDashboard.savedVideos')}</div>
                  </div>
                </>
              )}
            </div>

            {/* User Information */}
            <div style={styles.infoSection}>
              <h3 style={{ ...styles.sectionTitle, color: textColor }}>📌 {t('profile.aboutMe')}</h3>
              <div style={{ ...styles.infoGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))" }}>
                {user?.role === "couple" ? (
                  <>
                    <div style={styles.infoRow}><span style={styles.label}>💑 {t('profile.coupleName')}:</span><span>{user?.coupleName || user?.name}</span></div>
                    {user?.brideName && <div style={styles.infoRow}><span style={styles.label}>👰 {t('profile.bride')}:</span><span>{user?.brideName}</span></div>}
                    {user?.groomName && <div style={styles.infoRow}><span style={styles.label}>🤵 {t('profile.groom')}:</span><span>{user?.groomName}</span></div>}
                    {user?.weddingDate && <div style={styles.infoRow}><span style={styles.label}>💒 {t('profile.weddingDate')}:</span><span>{new Date(user.weddingDate).toLocaleDateString()}</span></div>}
                    {user?.location && <div style={styles.infoRow}><span style={styles.label}>📍 {t('profile.location')}:</span><span>{user?.location}</span></div>}
                  </>
                ) : (
                  <>
                    {user?.district && <div style={styles.infoRow}><span style={styles.label}>📍 {t('profile.district')}:</span><span>{user?.district}</span></div>}
                    {user?.profession && <div style={styles.infoRow}><span style={styles.label}>💼 {t('profile.profession')}:</span><span>{user.profession}</span></div>}
                    {user?.skills && <div style={styles.infoRow}><span style={styles.label}>🔧 {t('profile.skills')}:</span><span>{user.skills}</span></div>}
                    {user?.experience && <div style={styles.infoRow}><span style={styles.label}>📅 {t('profile.experience')}:</span><span>{user.experience}</span></div>}
                  </>
                )}
                <div style={styles.infoRow}><span style={styles.label}>📧 {t('profile.email')}:</span><span>{user?.email}</span></div>
                <div style={styles.infoRow}><span style={styles.label}>📞 {t('profile.phone')}:</span><span>{user?.phone || t('profile.notSet')}</span></div>
              </div>
              {user?.bio && (
                <div style={styles.bioBox}>
                  <span style={styles.label}>📝 {t('profile.bio')}:</span>
                  <p style={styles.bioText}>{user.bio}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ ...styles.buttonGroup, flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={() => setIsEditing(true)} style={{ ...styles.editBtn, background: primaryColor, color: "#000", width: isMobile ? "100%" : "auto" }}>✏️ {t('profile.editProfile')}</button>
              {user?.role !== "admin" && <Link to="/my-bookings" style={{ width: isMobile ? "100%" : "auto" }}><button style={{ ...styles.bookingsBtn, width: "100%" }}>📋 {t('myBookings.title')}</button></Link>}
              {user?.role === "creator" && <Link to="/creator/dashboard" style={{ width: isMobile ? "100%" : "auto" }}><button style={{ ...styles.bookingsBtn, background: "#28a745", width: "100%" }}>🎬 {t('nav.dashboard')}</button></Link>}
              {user?.role === "couple" && <Link to="/couple/dashboard" style={{ width: isMobile ? "100%" : "auto" }}><button style={{ ...styles.bookingsBtn, background: primaryColor, color: "#000", width: "100%" }}>💑 {t('nav.weddingPanel')}</button></Link>}
              {user?.role === "admin" && <Link to="/admin" style={{ width: isMobile ? "100%" : "auto" }}><button style={{ ...styles.bookingsBtn, background: "#dc3545", width: "100%" }}>⚙️ {t('admin.dashboard')}</button></Link>}
            </div>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div style={styles.bookingsSection}>
            <h3 style={{ ...styles.sectionTitle, color: textColor }}>📋 {t('myBookings.title')}</h3>
            {bookings.length === 0 ? (
              <p style={{ color: textMuted, textAlign: "center", padding: "40px" }}>{t('myBookings.noBookings')}. <Link to="/booking" style={{ color: primaryColor }}>{t('myBookings.bookNow')}</Link></p>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} style={{ ...styles.bookingCard, background: darkMode ? "#2a2a2a" : "#f8f9fa" }}>
                  <div style={styles.bookingHeader}>
                    <span style={styles.bookingId}>#{booking.id}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div style={styles.bookingDetails}>
                    <p><strong>{t('myBookings.event')}:</strong> {getEventTypeLabel(booking.eventType)}</p>
                    <p><strong>{t('myBookings.date')}:</strong> {new Date(booking.date || booking.eventDate).toLocaleDateString()}</p>
                    <p><strong>{t('myBookings.package')}:</strong> {booking.package || t('myBookings.notSpecified')}</p>
                    <p><strong>{t('myBookings.location')}:</strong> {booking.location || booking.eventLocation}, {booking.district}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div style={styles.notificationsSection}>
            <h3 style={{ ...styles.sectionTitle, color: textColor }}>🔔 {t('profile.notifications')}</h3>
            {notifications.length === 0 ? (
              <p style={{ color: textMuted, textAlign: "center", padding: "40px" }}>{t('clientDashboard.noNotifications')}</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} onClick={() => markNotificationRead(notif.id)} style={{ ...styles.notificationCard, background: darkMode ? "#2a2a2a" : "#f8f9fa", opacity: notif.read ? 0.7 : 1, cursor: "pointer", flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
                  <div style={styles.notificationIcon}>{notif.type === "booking" ? "📅" : notif.type === "payment" ? "💰" : "📢"}</div>
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationTitle}>{notif.title}</div>
                    <div style={styles.notificationMessage}>{notif.message}</div>
                    <div style={styles.notificationTime}>{new Date(notif.time || notif.createdAt).toLocaleDateString()}</div>
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
                <h3 style={{ ...styles.sectionTitle, color: textColor }}>{t('profile.profileInformation')}</h3>
                <div style={{ ...styles.infoGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))" }}>
                  <div style={styles.infoRow}><span style={styles.label}>{t('profile.name')}:</span><span>{user?.name}</span></div>
                  <div style={styles.infoRow}><span style={styles.label}>{t('profile.username')}:</span><span>@{user?.username}</span></div>
                  <div style={styles.infoRow}><span style={styles.label}>{t('profile.email')}:</span><span>{user?.email}</span></div>
                  <div style={styles.infoRow}><span style={styles.label}>{t('profile.phone')}:</span><span>{user?.phone || t('profile.notSet')}</span></div>
                  {user?.role === "couple" ? (
                    <>
                      <div style={styles.infoRow}><span style={styles.label}>{t('profile.weddingDate')}:</span><span>{user?.weddingDate || t('profile.notSet')}</span></div>
                      <div style={styles.infoRow}><span style={styles.label}>{t('profile.location')}:</span><span>{user?.location || t('profile.notSet')}</span></div>
                    </>
                  ) : (
                    <div style={styles.infoRow}><span style={styles.label}>{t('profile.district')}:</span><span>{user?.district || t('profile.notSet')}</span></div>
                  )}
                </div>
                <div style={{ ...styles.buttonGroup, flexDirection: isMobile ? "column" : "row" }}>
                  <button onClick={() => setIsEditing(true)} style={{ ...styles.editBtn, background: primaryColor, color: "#000", width: isMobile ? "100%" : "auto" }}>✏️ {t('profile.editProfile')}</button>
                  <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ ...styles.passwordBtn, width: isMobile ? "100%" : "auto" }}>🔒 {t('profile.changePassword')}</button>
                </div>
              </div>
            ) : (
              <div style={styles.editSection}>
                <h3 style={{ ...styles.sectionTitle, color: textColor }}>{t('profile.editProfile')}</h3>
                
                {user?.role === "couple" ? (
                  <>
                    <div style={{ ...styles.inputGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))" }}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.coupleName')} *</label>
                        <input type="text" name="coupleName" value={formData.coupleName} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.bride')}</label>
                        <input type="text" name="brideName" value={formData.brideName} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.groom')}</label>
                        <input type="text" name="groomName" value={formData.groomName} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.weddingDate')}</label>
                        <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.location')}</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Kigali Convention Centre" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.phone')}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ ...styles.inputGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))" }}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.name')} *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.username')}</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.phone')}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.district')}</label>
                        <select name="district" value={formData.district} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }}>
                          <option value="">{t('register.selectDistrict')}</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.profession')}</label>
                        <input type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Videographer" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.skills')}</label>
                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Video Editing, Drone" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>{t('profile.experience')}</label>
                        <select name="experience" value={formData.experience} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }}>
                          <option value="">{t('profile.selectExperience')}</option>
                          <option value="Less than 1 year">Less than 1 year</option>
                          <option value="1-3 years">1-3 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5+ years">5+ years</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <h3 style={{ ...styles.sectionTitle, color: textColor, marginTop: "20px" }}>{t('profile.socialLinks')}</h3>
                <div style={{ ...styles.inputGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  <div style={styles.inputGroup}><label style={styles.label}>Instagram</label><input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>TikTok</label><input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>YouTube</label><input type="text" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="https://youtube.com/@username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>Facebook</label><input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>WhatsApp</label><input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+250 7XX XXX XXX" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                  <div style={styles.inputGroup}><label style={styles.label}>Twitter/X</label><input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/username" style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} /></div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>{t('profile.bio')}</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder={t('register.bioPlaceholder')} style={{ ...styles.textarea, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>

                <div style={{ ...styles.buttonGroup, flexDirection: isMobile ? "column" : "row" }}>
                  <button onClick={handleUpdateProfile} style={{ ...styles.saveBtn, background: "#28a745", color: "#fff", width: isMobile ? "100%" : "auto" }}>💾 {t('profile.saveChanges')}</button>
                  <button onClick={() => setIsEditing(false)} style={{ ...styles.cancelBtn, width: isMobile ? "100%" : "auto" }}>{t('common.cancel')}</button>
                </div>
              </div>
            )}

            {/* Change Password Form */}
            {showPasswordForm && (
              <div style={{ ...styles.passwordSection, borderTopColor: borderColor }}>
                <h3 style={{ ...styles.sectionTitle, color: textColor }}>{t('profile.changePassword')}</h3>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{t('profile.currentPassword')}</label>
                  <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{t('profile.newPassword')}</label>
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>{t('profile.confirmPassword')}</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={{ ...styles.input, background: darkMode ? "#333" : "#fff", color: textColor }} />
                </div>
                <div style={{ ...styles.buttonGroup, flexDirection: isMobile ? "column" : "row" }}>
                  <button onClick={handleChangePassword} style={{ ...styles.saveBtn, background: "#28a745", color: "#fff", width: isMobile ? "100%" : "auto" }}>🔐 {t('profile.updatePassword')}</button>
                  <button onClick={() => setShowPasswordForm(false)} style={{ ...styles.cancelBtn, width: isMobile ? "100%" : "auto" }}>{t('common.cancel')}</button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div style={{ ...styles.dangerZone, background: "#f8d7da20", borderColor: "#f5c6cb" }}>
              <h3 style={{ ...styles.dangerTitle, color: "#721c24" }}>⚠️ {t('profile.dangerZone')}</h3>
              <p style={styles.dangerText}>{t('profile.dangerZoneText')}</p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={{ ...styles.deleteBtn, width: isMobile ? "100%" : "auto" }}>🗑️ {t('profile.deleteAccountConfirm')}</button>
              ) : (
                <div style={styles.deleteConfirm}>
                  <p style={{ color: "#721c24", marginBottom: "10px" }}>{t('profile.deleteConfirmText')}</p>
                  <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
                    <button onClick={handleDeleteAccount} style={{ ...styles.deleteBtn, background: "#dc3545", width: isMobile ? "100%" : "auto" }}>✅ {t('profile.deleteAccountConfirm')}</button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ ...styles.cancelBtn, width: isMobile ? "100%" : "auto" }}>{t('common.cancel')}</button>
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

// ─── STYLES ─────────────────────────────────────────────────────────
const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
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
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  passwordBtn: {
    padding: "12px",
    background: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  saveBtn: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    padding: "12px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  bookingsBtn: {
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
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #ffc107",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
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

export default Profile;