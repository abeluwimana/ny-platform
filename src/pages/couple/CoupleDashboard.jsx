// src/pages/couple/CoupleDashboard.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  
  // ─── PAYMENT & EARNINGS STATE (From Backend) ──────────────────
  const [supportEarnings, setSupportEarnings] = useState({ 
    total: 0, 
    monthly: 0, 
    supporters: [], 
    recentSupports: [],
    platformShare: 0,
    coupleShare: 0,
    totalSupports: 0
  });
  
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalReceived: 0,
    pending: 0,
    completed: 0,
    thisMonth: 0
  });
  
  const [profile, setProfile] = useState({
    brideName: "", groomName: "", coupleName: "", weddingDate: "", location: "",
    bio: "", instagram: "", tiktok: "", youtube: "", facebook: "", whatsapp: "",
    profileImage: null, coverImage: null, pageVisibility: "public", contentPermission: "public"
  });
  
  const [booking, setBooking] = useState(null);
  const [assignedCreator, setAssignedCreator] = useState(null);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  
  const [videoForm, setVideoForm] = useState({ 
    title: "", 
    videoUrl: "", 
    thumbnail: null, 
    isPremium: false, 
    price: 0, 
    eventType: "dote" 
  });
  const [postForm, setPostForm] = useState({ title: "", content: "", image: null, category: "update" });
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.style.background = "#111";
    }
    const token = localStorage.getItem("token");
    const coupleLoggedIn = localStorage.getItem("couple_logged_in") === "true";
    const userEmail = localStorage.getItem("user_email");
    if (!token || !coupleLoggedIn || !userEmail) {
      navigate("/login");
      return;
    }
    if (userEmail) {
      fetchCoupleData(userEmail);
    } else {
      navigate("/login");
    }
  }, []);

  // ─── FETCH COUPLE DATA FROM BACKEND ─────────────────────────────
  const fetchCoupleData = async (email) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch couple profile
      const profileResponse = await fetch(`${API_URL}/couples/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          const coupleData = profileData.couple;
          setCouple(coupleData);
          
          const displayName = coupleData.coupleName || coupleData.name || coupleData.brideName || "Couple";
          setProfile({
            brideName: coupleData.brideName || "",
            groomName: coupleData.groomName || "",
            coupleName: displayName,
            weddingDate: coupleData.weddingDate || "",
            location: coupleData.location || "",
            bio: coupleData.bio || "",
            instagram: coupleData.instagram || "",
            tiktok: coupleData.tiktok || "",
            youtube: coupleData.youtube || "",
            facebook: coupleData.facebook || "",
            whatsapp: coupleData.whatsapp || "",
            profileImage: coupleData.profileImage || null,
            coverImage: coupleData.coverImage || null,
            pageVisibility: coupleData.pageVisibility || "public",
            contentPermission: coupleData.contentPermission || "public"
          });
          setProfileForm({
            brideName: coupleData.brideName || "",
            groomName: coupleData.groomName || "",
            coupleName: displayName,
            weddingDate: coupleData.weddingDate || "",
            location: coupleData.location || "",
            bio: coupleData.bio || "",
            instagram: coupleData.instagram || "",
            tiktok: coupleData.tiktok || "",
            youtube: coupleData.youtube || "",
            facebook: coupleData.facebook || "",
            whatsapp: coupleData.whatsapp || "",
            profileImage: coupleData.profileImage || null,
            coverImage: coupleData.coverImage || null,
            pageVisibility: coupleData.pageVisibility || "public",
            contentPermission: coupleData.contentPermission || "public"
          });
          setProfileImagePreview(coupleData.profileImage || null);
          
          // Fetch videos
          await fetchVideos(coupleData.id);
          
          // Fetch support earnings from backend
          await fetchSupportEarnings(coupleData.id);
          
          // Fetch payment history
          await fetchPaymentHistory();
          
          // Fetch bookings
          await fetchBooking(coupleData.id);
          
          // Fetch notifications
          await fetchNotifications();
          
          // Fetch posts, gallery, etc. from localStorage (to be migrated)
          loadPosts(coupleData.id);
          loadGallery(coupleData.id);
          loadComments(coupleData.id);
          loadSubscribers(coupleData.id);
          loadWithdrawals(coupleData.id);
          loadAssignedCreator(coupleData.id);
          
          setLoading(false);
          return;
        }
      }
      
      // Fallback to localStorage
      loadCoupleByEmail(email);
    } catch (err) {
      console.error("Error fetching couple data:", err);
      loadCoupleByEmail(email);
    }
  };

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
      loadWithdrawals(found.id);
      loadBooking(found.id);
      loadAssignedCreator(found.id);
      loadSupportEarnings(found.id);
    }
    setLoading(false);
  };

  // ─── FETCH VIDEOS ──────────────────────────────────────────────────
  const fetchVideos = async (coupleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/videos/couple/${coupleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVideos(data.videos || []);
          return;
        }
      }
      loadVideos(coupleId);
    } catch (err) {
      console.error("Error fetching videos:", err);
      loadVideos(coupleId);
    }
  };

  const loadVideos = (coupleId) => {
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    setVideos(allVideos.filter(v => v.coupleId === coupleId));
  };

  // ─── FETCH SUPPORT EARNINGS FROM BACKEND ────────────────────────
  const fetchSupportEarnings = async (coupleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/support/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const earnings = data.earnings || {};
          setSupportEarnings({
            total: earnings.total || 0,
            monthly: earnings.monthly || 0,
            supporters: earnings.supporters || [],
            recentSupports: earnings.recentSupports || [],
            platformShare: earnings.platformShare || 0,
            coupleShare: earnings.coupleShare || 0,
            totalSupports: earnings.totalSupports || 0
          });
          
          // Update payment stats
          setPaymentStats({
            totalReceived: earnings.total || 0,
            pending: earnings.pending || 0,
            completed: earnings.completed || 0,
            thisMonth: earnings.monthly || 0
          });
          return;
        }
      }
      loadSupportEarnings(coupleId);
    } catch (err) {
      console.error("Error fetching support earnings:", err);
      loadSupportEarnings(coupleId);
    }
  };

  const loadSupportEarnings = (coupleId) => {
    const allSupports = JSON.parse(localStorage.getItem("video_supports") || "[]");
    const coupleSupports = allSupports.filter(s => s.coupleId === coupleId);
    
    const total = coupleSupports.reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthly = coupleSupports
      .filter(s => {
        const supportDate = new Date(s.date);
        return supportDate.getMonth() === currentMonth && supportDate.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + (s.coupleEarning || s.amount * 0.6), 0);
    
    const supporters = [...new Map(coupleSupports.map(s => [s.userEmail, {
      name: s.userName,
      email: s.userEmail,
      totalAmount: coupleSupports.filter(x => x.userEmail === s.userEmail).reduce((sum, x) => sum + (x.coupleEarning || x.amount * 0.6), 0),
      count: coupleSupports.filter(x => x.userEmail === s.userEmail).length
    }])).values()];
    
    const recentSupports = coupleSupports.slice(-5).reverse().map(s => ({
      id: s.id,
      supporterName: s.userName,
      amount: s.coupleEarning || s.amount * 0.6,
      originalAmount: s.amount,
      date: s.date,
      paymentMethod: s.paymentMethod
    }));
    
    setSupportEarnings({ total, monthly, supporters, recentSupports, coupleShare: total, platformShare: total * 0.4, totalSupports: coupleSupports.length });
    setPaymentStats({
      totalReceived: total,
      pending: 0,
      completed: coupleSupports.length,
      thisMonth: monthly
    });
  };

  // ─── FETCH PAYMENT HISTORY ──────────────────────────────────────
  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/payments/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentHistory(data.payments || []);
        }
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
    }
  };

  // ─── FETCH BOOKING ─────────────────────────────────────────────────
  const fetchBooking = async (coupleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/bookings/couple/${coupleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBooking(data.booking);
          return;
        }
      }
      loadBooking(coupleId);
    } catch (err) {
      console.error("Error fetching booking:", err);
      loadBooking(coupleId);
    }
  };

  const loadBooking = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    setBooking(bookings.find(b => b.coupleId === coupleId || b.coupleName === couple?.couple));
  };

  // ─── FETCH NOTIFICATIONS ──────────────────────────────────────────
  const fetchNotifications = async () => {
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
          const unread = data.notifications.filter(n => !n.read).length;
          setUnreadCount(unread);
          return;
        }
      }
      loadNotifications(couple?.id);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      loadNotifications(couple?.id);
    }
  };

  const loadNotifications = (coupleId) => {
    const allNotifs = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const myNotifs = allNotifs.filter(n => n.coupleId === coupleId || (n.type === "support" && n.coupleId === coupleId));
    setNotifications(myNotifs);
    const unread = myNotifs.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  // ─── LOCAL STORAGE HELPERS ───────────────────────────────────────
  const loadGallery = (coupleId) => {
    const allGalleries = JSON.parse(localStorage.getItem("couple_galleries") || "[]");
    setGallery(allGalleries.filter(g => g.coupleId === coupleId));
  };

  const loadPosts = (coupleId) => {
    const allPosts = JSON.parse(localStorage.getItem("couple_posts") || "[]");
    setPosts(allPosts.filter(p => p.coupleId === coupleId));
  };

  const loadComments = (coupleId) => {
    const allComments = JSON.parse(localStorage.getItem("wedding_comments") || "[]");
    setComments(allComments.filter(c => c.coupleId === coupleId));
  };

  const loadSubscribers = (coupleId) => {
    setSubscribers(JSON.parse(localStorage.getItem(`subscribers_${coupleId}`) || "[]"));
  };

  const loadWithdrawals = (coupleId) => {
    setWithdrawals(JSON.parse(localStorage.getItem(`withdrawals_${coupleId}`) || "[]"));
  };

  const loadAssignedCreator = (coupleId) => {
    const bookings = JSON.parse(localStorage.getItem("wedding_bookings") || "[]");
    const coupleBooking = bookings.find(b => b.coupleId === coupleId);
    if (coupleBooking && coupleBooking.assignedCreator) {
      const users = JSON.parse(localStorage.getItem("wedding_users") || "[]");
      setAssignedCreator(users.find(u => u.email === coupleBooking.assignedCreator));
    }
  };

  // ─── NOTIFICATION ACTIONS ─────────────────────────────────────────
  const markNotificationAsRead = (notifId) => {
    const updated = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    setUnreadCount(prev => Math.max(0, prev - 1));
    toast(t('clientDashboard.markedAsRead'));
  };
  
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.map(n => ({ ...n, read: true }));
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    setUnreadCount(0);
    toast(t('clientDashboard.allMarkedRead'));
  };
  
  const deleteNotification = (notifId) => {
    const updated = notifications.filter(n => n.id !== notifId);
    setNotifications(updated);
    const allNotifications = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updatedAll = allNotifications.filter(n => n.id !== notifId);
    localStorage.setItem("user_notifications", JSON.stringify(updatedAll));
    const unread = updated.filter(n => !n.read).length;
    setUnreadCount(unread);
    toast(t('clientDashboard.notificationDeleted'));
  };

  // ─── VIDEO FUNCTIONS ─────────────────────────────────────────────
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

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
        setVideoForm({ ...videoForm, thumbnail: reader.result });
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

  // ─── UPDATE PROFILE ──────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!couple) {
      toast("Error: No couple data found", "#ef4444");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const displayName = profileForm.coupleName || profileForm.brideName || profileForm.groomName || "Couple";
      const finalImage = profileImageFile || profile.profileImage || null;
      
      const response = await fetch(`${API_URL}/couples/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
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
          pageVisibility: profileForm.pageVisibility || "public",
          contentPermission: profileForm.contentPermission || "public",
          profileImage: finalImage
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast("✅ " + t('profile.updateSuccess'));
          setShowProfileModal(false);
          setProfileImageFile(null);
          fetchCoupleData(localStorage.getItem("user_email"));
          return;
        }
      }
      
      updateProfileLocal();
    } catch (error) {
      console.error("Error:", error);
      updateProfileLocal();
    }
  };

  const updateProfileLocal = () => {
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
      if (finalImage) {
        localStorage.setItem("user_profile_image", finalImage);
      }
      
      toast("✅ " + t('profile.updateSuccess'));
      setShowProfileModal(false);
      setProfileImageFile(null);
    } catch (error) {
      console.error("Error:", error);
      toast("Error saving profile", "#ef4444");
    }
  };

  // ─── UPLOAD VIDEO ────────────────────────────────────────────────
  const handleUploadVideo = async () => {
    if (!videoForm.title || !videoForm.videoUrl) {
      toast(t('creatorDashboard.fillRequired'), "#ef4444");
      return;
    }
    if (!videoForm.thumbnail) {
      toast("Please upload a thumbnail image", "#ef4444");
      return;
    }
    
    const finalUrl = convertToEmbedUrl(videoForm.videoUrl);
    if (!finalUrl.includes("youtube.com/embed/")) {
      toast(t('creatorDashboard.invalidYoutube'), "#ef4444");
      return;
    }
    
    const eventTypeLabels = {
      dote: { name: "DOTE Ceremony", icon: "🪘" },
      church: { name: "Church Wedding", icon: "⛪" },
      reception: { name: "Reception", icon: "🎉" },
      full: { name: "Full Wedding", icon: "💍" }
    };
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: videoForm.title,
          coupleId: couple.id,
          videoUrl: finalUrl,
          thumbnail: videoForm.thumbnail,
          eventType: videoForm.eventType,
          accessType: videoForm.isPremium ? 'PREMIUM' : 'FREE',
          price: videoForm.isPremium ? videoForm.price : 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast("✅ " + t('creatorDashboard.videoUploaded'));
          setShowVideoModal(false);
          setVideoForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0, eventType: "dote" });
          setThumbnailPreview(null);
          fetchVideos(couple.id);
          return;
        }
      }
      
      uploadVideoLocal(eventTypeLabels);
    } catch (err) {
      console.error("Error uploading video:", err);
      uploadVideoLocal(eventTypeLabels);
    }
  };

  const uploadVideoLocal = (eventTypeLabels) => {
    const newVideo = {
      id: Date.now(),
      coupleId: couple.id,
      coupleName: couple.couple,
      title: videoForm.title,
      videoUrl: convertToEmbedUrl(videoForm.videoUrl),
      thumbnail: videoForm.thumbnail,
      isPremium: videoForm.isPremium,
      price: videoForm.price,
      eventType: videoForm.eventType,
      eventTypeLabel: eventTypeLabels[videoForm.eventType].name,
      eventIcon: eventTypeLabels[videoForm.eventType].icon,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      status: "published",
      createdAt: new Date().toISOString()
    };
    
    const allVideos = JSON.parse(localStorage.getItem("couple_videos") || "[]");
    localStorage.setItem("couple_videos", JSON.stringify([...allVideos, newVideo]));
    setVideos([...videos, newVideo]);
    setShowVideoModal(false);
    setVideoForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0, eventType: "dote" });
    setThumbnailPreview(null);
    toast("✅ " + t('creatorDashboard.videoUploaded'));
  };

  // ─── CREATE POST ──────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!postForm.title || !postForm.content) {
      toast(t('creatorDashboard.fillRequired'), "#ef4444");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: postForm.title,
          content: postForm.content,
          image: postForm.image,
          category: postForm.category
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast("✅ " + t('creatorDashboard.postCreated'));
          setShowPostModal(false);
          setPostForm({ title: "", content: "", image: null, category: "update" });
          setPostImagePreview(null);
          loadPosts(couple.id);
          return;
        }
      }
      
      createPostLocal();
    } catch (err) {
      console.error("Error creating post:", err);
      createPostLocal();
    }
  };

  const createPostLocal = () => {
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
    toast("✅ " + t('creatorDashboard.postCreated'));
  };

  // ─── WITHDRAWAL ──────────────────────────────────────────────────
  const handleRequestWithdrawal = async () => {
    if (!withdrawalAmount || withdrawalAmount < 10000) {
      toast("Minimum withdrawal amount is 10,000 RWF", "#ef4444");
      return;
    }
    if (withdrawalAmount > supportEarnings.total) {
      toast("Insufficient balance", "#ef4444");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/withdrawals/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseInt(withdrawalAmount),
          coupleId: couple.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast("✅ " + t('creatorDashboard.requestWithdrawal'));
          setShowWithdrawalModal(false);
          setWithdrawalAmount("");
          fetchSupportEarnings(couple.id);
          return;
        }
      }
      
      // Fallback to localStorage
      const newWithdrawal = { 
        id: Date.now(), 
        amount: parseInt(withdrawalAmount), 
        status: "pending", 
        requestedAt: new Date().toISOString() 
      };
      const updatedWithdrawals = [newWithdrawal, ...withdrawals];
      setWithdrawals(updatedWithdrawals);
      localStorage.setItem(`withdrawals_${couple?.id}`, JSON.stringify(updatedWithdrawals));
      setShowWithdrawalModal(false);
      setWithdrawalAmount("");
      toast("✅ " + t('creatorDashboard.requestWithdrawal'));
    } catch (err) {
      console.error("Error requesting withdrawal:", err);
      toast("Error requesting withdrawal", "#ef4444");
    }
  };

  // ─── HELPERS ─────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const s = status?.toUpperCase() || 'PENDING';
    if (s === "COMPLETED" || s === "CONFIRMED") return <span style={{ background: "#d4edda", color: "#155724", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>✅ {t('myBookings.confirmed')}</span>;
    if (s === "PENDING") return <span style={{ background: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>⏳ {t('myBookings.pending')}</span>;
    if (s === "REJECTED" || s === "CANCELLED") return <span style={{ background: "#f8d7da", color: "#721c24", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>❌ {t('myBookings.cancelled')}</span>;
    return <span style={{ background: "#e2e3e5", color: "#383d41", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>{status || "Unknown"}</span>;
  };

  const bgColor = darkMode ? "#111" : "#f5f5f5";
  const cardBg = darkMode ? "#1e1e1e" : "#fff";
  const textColor = darkMode ? "#fff" : "#333";
  const textMuted = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#333" : "#e8e8e8";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, color: textColor, flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #ffc107", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!couple) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bgColor, flexDirection: "column", gap: "16px" }}>
        <p>No wedding found.</p>
        <Link to="/booking" style={{ color: Y }}>{t('home.bookEvent')} →</Link>
      </div>
    );
  }

  const TABS = [
    { id: "dashboard", label: "📊 " + t('creatorDashboard.dashboard') },
    { id: "videos", label: "🎬 " + t('creatorDashboard.videos') },
    { id: "posts", label: "📝 " + t('creatorDashboard.posts') },
    { id: "earnings", label: "💰 " + t('creatorDashboard.earnings') },
    { id: "supporters", label: "❤️ " + t('coupleDashboard.supporters') },
    { id: "notifications", label: `🔔 ${t('clientDashboard.notificationsTitle')}${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { id: "profile", label: "👤 " + t('profile.title') },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bgColor, fontFamily: "system-ui, sans-serif", color: textColor, padding: isMobile ? "16px" : "20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "bold" }}>💑 {t('coupleDashboard.title')}</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              style={{ background: "transparent", border: `1px solid ${borderColor}`, borderRadius: "8px", padding: "8px 12px", cursor: "pointer", color: textColor }}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
        
        {/* Stats Grid - Including Payment Stats */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{videos.length}</div>
            <div>{t('creatorDashboard.videos')}</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.total.toLocaleString()} RWF</div>
            <div>{t('coupleDashboard.totalEarnings')}</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.monthly.toLocaleString()} RWF</div>
            <div>{t('coupleDashboard.thisMonth')}</div>
          </div>
          <div style={{ background: cardBg, padding: "16px", borderRadius: "12px", textAlign: "center", border: `1px solid ${borderColor}` }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.supporters.length}</div>
            <div>{t('coupleDashboard.supporters')}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderBottom: `1px solid ${borderColor}`, marginBottom: "20px", paddingBottom: "12px", overflowX: isMobile ? "auto" : "visible", WebkitOverflowScrolling: "touch" }}>
          {TABS.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={{ 
                padding: isMobile ? "8px 14px" : "10px 20px", 
                background: activeTab === tab.id ? `${Y}20` : "none", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer", 
                fontWeight: activeTab === tab.id ? "bold" : "normal", 
                color: activeTab === tab.id ? Y : textMuted,
                whiteSpace: "nowrap",
                fontSize: isMobile ? "12px" : "14px"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>{t('coupleDashboard.welcome')}, {profile.coupleName || profile.brideName || "Couple"}!</h2>
            <p style={{ color: textMuted, marginTop: "8px" }}>{t('coupleDashboard.manage')}</p>
            
            {booking && (
              <div style={{ marginTop: "16px", padding: "12px", background: `${Y}10`, borderRadius: "8px" }}>
                📅 {booking.package} on {new Date(booking.eventDate || booking.date).toLocaleDateString()} {getStatusBadge(booking.status)}
              </div>
            )}
            
            {assignedCreator && (
              <div style={{ marginTop: "16px", padding: "12px", background: `${Y}10`, borderRadius: "8px" }}>
                🎥 {t('coupleDashboard.assignedCreator')}: {assignedCreator.name}
              </div>
            )}
            
            {/* Payment Summary */}
            <div style={{ marginTop: "20px", padding: "16px", background: `${Y}05`, borderRadius: "8px", border: `1px solid ${borderColor}` }}>
              <h3 style={{ marginBottom: "12px" }}>💰 {t('coupleDashboard.paymentSummary')}</h3>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: textMuted }}>{t('coupleDashboard.totalReceived')}</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: Y }}>{paymentStats.totalReceived.toLocaleString()} RWF</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: textMuted }}>{t('coupleDashboard.thisMonth')}</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: Y }}>{paymentStats.thisMonth.toLocaleString()} RWF</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: textMuted }}>{t('coupleDashboard.completed')}</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#22c55e" }}>{paymentStats.completed}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: textMuted }}>{t('coupleDashboard.pending')}</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f59e0b" }}>{paymentStats.pending}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h2>🎬 {t('coupleDashboard.weddingVideos')}</h2>
              <button onClick={() => setShowVideoModal(true)} style={{ background: Y, border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>+ {t('creatorDashboard.uploadVideo')}</button>
            </div>
            
            {videos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
                <p>{t('creatorDashboard.noVideosYet')}</p>
                <button onClick={() => setShowVideoModal(true)} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>+ {t('creatorDashboard.uploadVideo')}</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {videos.map(v => (
                  <div key={v.id} style={{ border: `1px solid ${borderColor}`, borderRadius: "12px", overflow: "hidden", background: darkMode ? "#1a1a1a" : "#fff" }}>
                    <div style={{ position: "relative" }}>
                      <img 
                        src={v.thumbnail || "https://via.placeholder.com/400x225"} 
                        alt={v.title} 
                        style={{ width: "100%", height: "180px", objectFit: "cover" }} 
                      />
                      <div style={{ 
                        position: "absolute", 
                        top: "10px", 
                        left: "10px", 
                        background: Y, 
                        color: BLK, 
                        padding: "4px 10px", 
                        borderRadius: "20px", 
                        fontSize: "11px", 
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {v.eventIcon || "🎬"} {v.eventTypeLabel || (v.eventType === "dote" ? "DOTE" : v.eventType === "church" ? "Church" : v.eventType === "reception" ? "Reception" : "Wedding")}
                      </div>
                      {v.isPremium && (
                        <div style={{ 
                          position: "absolute", 
                          top: "10px", 
                          right: "10px", 
                          background: "#ffc107", 
                          color: BLK, 
                          padding: "4px 10px", 
                          borderRadius: "20px", 
                          fontSize: "10px", 
                          fontWeight: "bold" 
                        }}>
                          ⭐ {t('videos.premium')}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ padding: "12px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "6px" }}>{v.title}</h3>
                      <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: textMuted, marginBottom: "8px" }}>
                        <span>👁️ {v.views || 0} {t('videos.views')}</span>
                        <span>❤️ {v.likes || 0} {t('videos.likes')}</span>
                        <span>💬 {v.comments || 0} {t('videos.comments')}</span>
                      </div>
                      <div style={{ fontSize: "10px", color: textMuted }}>
                        📅 {new Date(v.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h2>📝 {t('coupleDashboard.weddingStories')}</h2>
              <button onClick={() => setShowPostModal(true)} style={{ background: Y, border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>+ {t('creatorDashboard.createPost')}</button>
            </div>
            {posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
                <p>{t('creatorDashboard.noPostsYet')}</p>
                <button onClick={() => setShowPostModal(true)} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>+ {t('creatorDashboard.createPost')}</button>
              </div>
            ) : (
              posts.map(p => (
                <div key={p.id} style={{ borderBottom: `1px solid ${borderColor}`, padding: "12px 0" }}>
                  <h3>{p.title}</h3>
                  <p style={{ color: textMuted, fontSize: "13px" }}>{p.content?.substring(0, 100)}...</p>
                  <div style={{ fontSize: "11px", color: textMuted, marginTop: "6px" }}>
                    📅 {new Date(p.createdAt).toLocaleDateString()} • ❤️ {p.likes || 0} {t('videos.likes')} • 💬 {p.comments || 0} {t('videos.comments')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Earnings Tab - Updated with Payment Data */}
        {activeTab === "earnings" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>💰 {t('coupleDashboard.yourEarnings')}</h2>
            
            <div style={{ background: `${Y}05`, padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", margin: 0 }}>💡 {t('coupleDashboard.earningsNote')} <strong style={{ color: Y }}>60%</strong> {t('coupleDashboard.goesToYou')}.</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: `${Y}10`, padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: textMuted }}>{t('coupleDashboard.totalEarnings')}</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.total.toLocaleString()} RWF</div>
              </div>
              <div style={{ background: `${Y}10`, padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: textMuted }}>{t('coupleDashboard.thisMonth')}</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.monthly.toLocaleString()} RWF</div>
              </div>
              <div style={{ background: `${Y}10`, padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: textMuted }}>{t('coupleDashboard.totalSupports')}</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: Y }}>{supportEarnings.totalSupports || 0}</div>
              </div>
            </div>
            
            {/* Payment Breakdown */}
            <div style={{ marginBottom: "20px", padding: "16px", background: `${Y}05`, borderRadius: "8px" }}>
              <h4 style={{ marginBottom: "12px" }}>{t('coupleDashboard.paymentBreakdown')}</h4>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${borderColor}` }}>
                  <span>{t('coupleDashboard.coupleShare')} (60%)</span>
                  <strong style={{ color: "#22c55e" }}>{supportEarnings.coupleShare.toLocaleString()} RWF</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${borderColor}` }}>
                  <span>{t('coupleDashboard.platformShare')} (40%)</span>
                  <strong style={{ color: Y }}>{supportEarnings.platformShare.toLocaleString()} RWF</strong>
                </div>
              </div>
            </div>
            
            <button onClick={() => setShowWithdrawalModal(true)} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}>
              💸 {t('coupleDashboard.requestWithdrawal')}
            </button>
            
            {withdrawals.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3>📋 {t('coupleDashboard.withdrawalHistory')}</h3>
                {withdrawals.map(w => (
                  <div key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                    <span>💰 {w.amount.toLocaleString()} RWF</span>
                    <span style={{ color: w.status === "pending" ? Y : "#22c55e" }}>
                      {w.status === "pending" ? "⏳ " + t('coupleDashboard.pending') : "✅ " + t('coupleDashboard.completed')}
                    </span>
                    <span style={{ fontSize: "11px", color: textMuted }}>{new Date(w.requestedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supporters Tab */}
        {activeTab === "supporters" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>❤️ {t('coupleDashboard.yourSupporters')}</h2>
            
            {supportEarnings.supporters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>❤️</div>
                <p>{t('coupleDashboard.noSupportersYet')}</p>
                <button onClick={() => setActiveTab("videos")} style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" }}>{t('creatorDashboard.uploadVideo')} →</button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <h3>🏆 {t('coupleDashboard.topSupporters')}</h3>
                  {supportEarnings.supporters.slice(0, 5).map((supporter, idx) => (
                    <div key={supporter.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontWeight: "bold", color: Y, width: "30px" }}>#{idx + 1}</span>
                        <span>{supporter.name || supporter.email}</span>
                      </div>
                      <div>
                        <strong>{supporter.totalAmount.toLocaleString()} RWF</strong> ({supporter.count} supports)
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3>📋 {t('coupleDashboard.recentSupportActivity')}</h3>
                  {supportEarnings.recentSupports.map(support => (
                    <div key={support.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
                      <div>
                        <div><strong>{support.supporterName || "Anonymous"}</strong></div>
                        <div style={{ fontSize: "11px", color: textMuted }}>{new Date(support.date).toLocaleDateString()} • {support.paymentMethod === "mtn" ? "MTN" : "Airtel"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "bold", color: Y }}>{support.amount.toLocaleString()} RWF</div>
                        <div style={{ fontSize: "10px", color: textMuted }}>{t('coupleDashboard.fromSupport')} {support.originalAmount.toLocaleString()} RWF</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={{ margin: 0 }}>🔔 {t('clientDashboard.notificationsTitle')}</h2>
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} style={{ padding: "8px 16px", background: "#f0f0f0", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaCheck /> {t('clientDashboard.markAllRead')}
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
                <p>{t('clientDashboard.noNotifications')}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px", borderRadius: "12px", border: `1px solid ${borderColor}`, background: n.read ? "transparent" : `${Y}10` }}>
                    <div style={{ fontSize: "28px" }}>{n.type === "support" ? "❤️" : n.type === "payment" ? "💰" : "🔔"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>{n.title}</div>
                      <div style={{ fontSize: "13px", color: textMuted, marginBottom: "6px" }}>{n.message}</div>
                      <div style={{ fontSize: "11px", color: textMuted }}>{n.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {!n.read && (
                        <button onClick={() => markNotificationAsRead(n.id)} style={{ padding: "6px 10px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                          <FaCheck />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} style={{ padding: "6px 10px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${borderColor}` }}>
            <h2>👤 {t('coupleDashboard.weddingProfile')}</h2>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: Y, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", overflow: "hidden" }}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  profile.coupleName?.charAt(0) || profile.brideName?.charAt(0) || "C"
                )}
              </div>
            </div>
            <p><strong>{t('profile.coupleName')}:</strong> {profile.coupleName}</p>
            <p><strong>{t('profile.weddingDate')}:</strong> {profile.weddingDate || t('profile.notSet')}</p>
            <p><strong>{t('profile.location')}:</strong> {profile.location || t('profile.notSet')}</p>
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
              style={{ background: Y, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginTop: "16px", fontWeight: "bold", width: isMobile ? "100%" : "auto" }}
            >
              {t('profile.editProfile')}
            </button>
          </div>
        )}
      </div>

      {/* Upload Video Modal */}
      {showVideoModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "16px" }}>📤 {t('creatorDashboard.uploadNewVideo')}</h2>
            
            <input 
              placeholder={t('creatorDashboard.titlePlaceholder')}
              style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={videoForm.title} 
              onChange={e => setVideoForm({...videoForm, title: e.target.value})} 
            />
            
            <label style={{ fontSize: "13px", fontWeight: "600", marginTop: "10px", display: "block" }}>{t('creatorDashboard.eventType')}:</label>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "8px", margin: "10px 0" }}>
              {[
                { value: "dote", label: "🪘 DOTE", desc: t('events.dote') },
                { value: "church", label: "⛪ Church", desc: t('events.churchWedding') },
                { value: "reception", label: "🎉 Reception", desc: t('events.reception') },
                { value: "full", label: "💍 Full Wedding", desc: t('events.fullWedding') }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVideoForm({...videoForm, eventType: option.value})}
                  style={{
                    padding: "12px 8px",
                    background: videoForm.eventType === option.value ? Y : darkMode ? "#333" : "#f5f5f5",
                    color: videoForm.eventType === option.value ? BLK : textColor,
                    border: `1px solid ${videoForm.eventType === option.value ? Y : borderColor}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: videoForm.eventType === option.value ? "bold" : "normal",
                    fontSize: "13px",
                    textAlign: "center"
                  }}
                >
                  <div>{option.label}</div>
                  <div style={{ fontSize: "10px", color: textMuted }}>{option.desc}</div>
                </button>
              ))}
            </div>
            
            <label style={{ fontSize: "13px", fontWeight: "600", marginTop: "10px", display: "block" }}>{t('creatorDashboard.thumbnail')}:</label>
            <div 
              onClick={() => document.getElementById("thumbnailInput")?.click()}
              style={{ 
                border: `2px dashed ${borderColor}`, 
                borderRadius: "12px", 
                padding: "20px", 
                textAlign: "center", 
                cursor: "pointer",
                margin: "10px 0",
                background: darkMode ? "#333" : "#fafafa"
              }}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }} />
              ) : (
                <div>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🖼️</div>
                  <div style={{ fontSize: "12px", color: textMuted }}>{t('creatorDashboard.clickToUpload')}</div>
                  <div style={{ fontSize: "10px", color: textMuted, marginTop: "4px" }}>{t('creatorDashboard.recommendedSize')}</div>
                </div>
              )}
              <input id="thumbnailInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handleThumbnailUpload} />
            </div>
            
            <input 
              placeholder={t('creatorDashboard.youtubeUrl')}
              style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
              value={videoForm.videoUrl} 
              onChange={e => setVideoForm({...videoForm, videoUrl: e.target.value})} 
            />
            <p style={{ fontSize: "11px", color: textMuted, marginTop: "-5px", marginBottom: "10px" }}>
              {t('creatorDashboard.supportedFormats')}
            </p>
            
            <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0" }}>
              <input type="checkbox" checked={videoForm.isPremium} onChange={e => setVideoForm({...videoForm, isPremium: e.target.checked})} /> 
              <span>⭐ {t('videos.premium')}</span>
            </label>
            
            {videoForm.isPremium && (
              <input 
                type="number" 
                placeholder={t('videos.pricePlaceholder')}
                style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} 
                value={videoForm.price} 
                onChange={e => setVideoForm({...videoForm, price: parseInt(e.target.value) || 0})} 
              />
            )}
            
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleUploadVideo} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>
                📤 {t('creatorDashboard.upload')}
              </button>
              <button onClick={() => {
                setShowVideoModal(false);
                setVideoForm({ title: "", videoUrl: "", thumbnail: null, isPremium: false, price: 0, eventType: "dote" });
                setThumbnailPreview(null);
              }} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%" }}>
            <h2 style={{ marginBottom: "16px" }}>{t('creatorDashboard.createNewPost')}</h2>
            <input placeholder={t('creatorDashboard.postTitle')} style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
            <select style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
              <option value="update">{t('coupleDashboard.weddingUpdate')}</option>
              <option value="story">{t('coupleDashboard.loveStory')}</option>
              <option value="anniversary">{t('coupleDashboard.anniversary')}</option>
              <option value="thanks">{t('coupleDashboard.thankYou')}</option>
            </select>
            <textarea placeholder={t('creatorDashboard.writePost')} rows="4" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box", resize: "vertical" }} value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
            <div style={{ border: `2px dashed ${borderColor}`, borderRadius: "8px", padding: "16px", textAlign: "center", cursor: "pointer", margin: "10px 0" }} onClick={() => document.getElementById("postImageInput")?.click()}>
              {postImagePreview ? <img src={postImagePreview} style={{ maxHeight: "100px" }} alt="preview" /> : t('creatorDashboard.clickToUploadImage')}
              <input id="postImageInput" type="file" style={{ display: "none" }} accept="image/*" onChange={handlePostImageUpload} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleCreatePost} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>{t('creatorDashboard.publish')}</button>
              <button onClick={() => setShowPostModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "20px" }}>{t('profile.editProfile')}</h2>
            
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
              <p style={{ fontSize: "11px", marginTop: "8px", color: textMuted }}>{t('profile.clickToChangePhoto')}</p>
            </div>
            
            <input placeholder={t('profile.coupleName')} style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.coupleName || ""} onChange={e => setProfileForm({...profileForm, coupleName: e.target.value})} />
            <input placeholder={t('profile.bride')} style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.brideName || ""} onChange={e => setProfileForm({...profileForm, brideName: e.target.value})} />
            <input placeholder={t('profile.groom')} style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.groomName || ""} onChange={e => setProfileForm({...profileForm, groomName: e.target.value})} />
            <input type="date" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.weddingDate || ""} onChange={e => setProfileForm({...profileForm, weddingDate: e.target.value})} />
            <input placeholder={t('profile.location')} style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={profileForm.location || ""} onChange={e => setProfileForm({...profileForm, location: e.target.value})} />
            <textarea placeholder={t('profile.bio')} rows="3" style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box", resize: "vertical" }} value={profileForm.bio || ""} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
            
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleUpdateProfile} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>{t('common.save')}</button>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "90%" }}>
            <h2 style={{ marginBottom: "16px" }}>{t('coupleDashboard.requestWithdrawal')}</h2>
            <p>{t('coupleDashboard.availableBalance')}: <strong style={{ color: Y }}>{supportEarnings.total.toLocaleString()} RWF</strong></p>
            <input type="number" placeholder={t('coupleDashboard.amountRWF')} style={{ width: "100%", padding: "12px", margin: "10px 0", border: `1px solid ${borderColor}`, borderRadius: "8px", background: darkMode ? "#333" : "#fff", boxSizing: "border-box" }} value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} />
            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={handleRequestWithdrawal} style={{ background: Y, border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", flex: 1, fontWeight: "bold" }}>{t('coupleDashboard.request')}</button>
              <button onClick={() => setShowWithdrawalModal(false)} style={{ background: "transparent", border: `1px solid ${borderColor}`, padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);