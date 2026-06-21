// src/pages/Home.jsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBookmark, FaBriefcase, FaBuilding, FaCalendar,
  FaEye,
  FaFire,
  FaGraduationCap,
  FaHeart,
  FaPlay, FaRing, FaSearch, FaStar,
  FaUsers, FaVideo
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import ericImage from "../assets/images/eric.jpeg";
import heroImage from "../assets/images/hero.png";
import traditionalImage from "../assets/images/traditional.jpeg";
import { getTopCreators, getVideos } from "../services/api";

import cakeServicesImg from "../assets/images/services/cake.jpg";
import cateringImg from "../assets/images/services/catering.jpg";
import decorationImg from "../assets/images/services/decoration.jpg";
import liveStreamingImg from "../assets/images/services/livestreaming.jpg";
import mcProtocolImg from "../assets/images/services/mc.jpg";
import photoBoothImg from "../assets/images/services/photobooth.png";
import photographyImg from "../assets/images/services/photography.jpg";
import soundSystemImg from "../assets/images/services/soundsystem.jpg";
import videographyImg from "../assets/images/services/videography.jpg";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const num = parseInt(target.replace(/\D/g, "")) || 0;
    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const progress = clamp((ts - startTime) / duration, 0, 1);
      setCount(Math.floor(progress * num));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);
  return count;
}

const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

const GALLERY = [heroImage, traditionalImage, ericImage, heroImage, traditionalImage, ericImage];

const CREATORS = [
  { name: "Abel Uwimana",   roleKey: "leadVideographer",  rating: 5, exp: "5+ years", image: heroImage,       events: 120 },
  { name: "Diane Uwase",    roleKey: "creativeDirector",  rating: 5, exp: "4+ years", image: traditionalImage,events: 95 },
  { name: "Eric Niyonsaba", roleKey: "seniorEditor",      rating: 5, exp: "3+ years", image: ericImage,       events: 80 },
];

const POSTS = [
  { id: 1, titleKey: "post1Title", catKey: "tips", excerptKey: "post1Excerpt", image: heroImage,       date: "Jan 15" },
  { id: 2, titleKey: "post2Title", catKey: "guide", excerptKey: "post2Excerpt", image: traditionalImage, date: "Jan 10" },
  { id: 3, titleKey: "post3Title", catKey: "behindScenes", excerptKey: "post3Excerpt", image: ericImage,       date: "Jan 5" },
];

const TESTIMONIALS = [
  { name: "Eric & Diane", reviewKey: "review1", rating: 5, location: "Kigali",  eventKey: "wedding",    avatar: ericImage },
  { name: "Sarah & Family",   reviewKey: "review2", rating: 5, location: "Kigali",  eventKey: "funeral",    avatar: heroImage },
  { name: "Kevin Mugisha",    reviewKey: "review3", rating: 5, location: "Rubavu",  eventKey: "birthday",   avatar: traditionalImage },
];

const WHY_US = [
  { icon: "🎬", titleKey: "cinematicQuality", descKey: "cinematicQualityDesc" },
  { icon: "⚡", titleKey: "fastDelivery", descKey: "fastDeliveryDesc" },
  { icon: "📷", titleKey: "modernEquipment", descKey: "modernEquipmentDesc" },
  { icon: "🌍", titleKey: "allRwanda", descKey: "allRwandaDesc" },
  { icon: "💰", titleKey: "flexiblePricing", descKey: "flexiblePricingDesc" },
];

const STATS = [
  { number: "500+",  labelKey: "eventsCovered",  icon: <FaCalendar />,  raw: "500" },
  { number: "200+",  labelKey: "happyClients",   icon: <FaUsers />,     raw: "200" },
  { number: "100K+", labelKey: "videoViews",     icon: <FaVideo />,     raw: "100000" },
  { number: "50+",   labelKey: "topCreators",    icon: <FaStar />,      raw: "50" },
];

const FAQS = [
  { qKey: "faq1q", aKey: "faq1a" },
  { qKey: "faq2q", aKey: "faq2a" },
  { qKey: "faq3q", aKey: "faq3a" },
  { qKey: "faq4q", aKey: "faq4a" },
  { qKey: "faq5q", aKey: "faq5a" },
  { qKey: "faq6q", aKey: "faq6a" },
];

const STEPS = [
  { n: "01", titleKey: "step1", icon: "👤", descKey: "step1Desc" },
  { n: "02", titleKey: "step2", icon: "📅", descKey: "step2Desc" },
  { n: "03", titleKey: "step3", icon: "🎥", descKey: "step3Desc" },
  { n: "04", titleKey: "step4", icon: "✂️", descKey: "step4Desc" },
  { n: "05", titleKey: "step5", icon: "📦", descKey: "step5Desc" },
];

// ─── SEARCH TAGS ─────────────────────────────────────────────────
const SEARCH_TAGS = [
  { key: "all", labelKey: "home.all" },
  { key: "videos", labelKey: "home.videos" },
  { key: "posts", labelKey: "home.posts" },
  { key: "creators", labelKey: "home.creators" },
  { key: "couples", labelKey: "home.couples" },
  { key: "events", labelKey: "home.events" },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate  = useNavigate();
  const [mobile,  setMobile]  = useState(false);
  const [tablet,  setTablet]  = useState(false);
  const [search,  setSearch]  = useState("");
  const [faqOpen, setFaqOpen] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [recentlyApprovedVideos, setRecentlyApprovedVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  const [topCreatorsLeaderboard, setTopCreatorsLeaderboard] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  // ─── All data that uses t() inside component ───
  const EVENT_CATEGORIES = [
    { id: "wedding",    name: t('home.wedding'),            icon: <FaRing />,         desc: t('home.weddingDesc'),        image: traditionalImage },
    { id: "birthday",   name: t('home.birthday'),    icon: "🎂",               desc: t('home.birthdayDesc'),           image: ericImage },
    { id: "funeral",    name: t('home.funeral'),  icon: "🕊️",              desc: t('home.funeralDesc'),          image: heroImage },
    { id: "graduation", name: t('home.graduation'),         icon: <FaGraduationCap />,desc: t('home.graduationDesc'),    image: traditionalImage },
    { id: "corporate",  name: t('home.corporate'),    icon: <FaBuilding />,     desc: t('home.corporateDesc'),         image: ericImage },
    { id: "dote",       name: t('home.dote'),       icon: "🪘",               desc: t('home.doteDesc'),   image: heroImage },
  ];

  const SERVICES = [
    { icon: "🎬", nameKey: "videography", descKey: "videographyDesc", image: videographyImg },
    { icon: "📷", nameKey: "photography", descKey: "photographyDesc", image: photographyImg },
    { icon: "📡", nameKey: "liveStreaming", descKey: "liveStreamingDesc", image: liveStreamingImg },
    { icon: "🎙️", nameKey: "soundSystem", descKey: "soundSystemDesc", image: soundSystemImg },
    { icon: "🎤", nameKey: "mcProtocol", descKey: "mcProtocolDesc", image: mcProtocolImg },
    { icon: "🌸", nameKey: "decoration", descKey: "decorationDesc", image: decorationImg },
    { icon: "🎂", nameKey: "cakeServices", descKey: "cakeServicesDesc", image: cakeServicesImg },
    { icon: "🍽️", nameKey: "catering", descKey: "cateringDesc", image: cateringImg },
    { icon: "📸", nameKey: "photoBooth", descKey: "photoBoothDesc", image: photoBoothImg },
  ];

  const WEDDING_MOMENTS = [
    { nameKey: "dote",    icon: "🪘", descKey: "doteDesc", image: heroImage },
    { nameKey: "traditionalDance", icon: "💃", descKey: "traditionalDanceDesc",   image: traditionalImage },
    { nameKey: "churchWedding",   icon: "⛪", descKey: "churchWeddingDesc",          image: heroImage },
    { nameKey: "reception",        icon: "🎉", descKey: "receptionDesc",      image: ericImage },
  ];

  const QUICK_LINKS = [
    { label: t('nav.videos'),   icon: <FaVideo />,   to: "/videos" },
    { label: t('nav.posts'),    icon: <FaBookmark />,to: "/posts" },
    { label: t('nav.booking'),  icon: <FaCalendar />,to: "/booking" },
    { label: t('nav.creators'), icon: <FaStar />,    to: "/creators" },
    { label: t('nav.couples'),  icon: <FaHeart />,   to: "/couples" },
    { label: t('nav.contact'),  icon: <FaBriefcase />, to: "/contact" },
  ];

  useEffect(() => {
    // Check login status from token
    const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
    const userData = localStorage.getItem("user_data") || localStorage.getItem("admin_data");
    
    if (token) {
      setIsLoggedIn(true);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserRole(user.role);
          setUserId(user.id);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
    
    const onResize = () => {
      setMobile(window.innerWidth <= 768);
      setTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    onResize();
    window.addEventListener("resize", onResize);
    
    fetchHomeData();
    fetchTopCreators();
    
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // ─── FETCH HOME DATA ────────────────────────────────────────────
  const fetchHomeData = async () => {
    setLoadingVideos(true);
    try {
      const videosData = await getVideos();
      if (videosData.success && videosData.videos) {
        const formattedVideos = videosData.videos.map(v => ({
          id: v.id,
          title: v.title,
          coupleName: v.couple?.user?.name || v.user?.name || "NY Entertainment",
          thumb: v.thumbnail || heroImage,
          url: v.videoUrl,
          views: v.views || 0,
          likes: v.likes || 0,
          type: v.eventType?.toLowerCase() || "wedding",
          isPremium: v.accessType === "PREMIUM" || v.isPremium,
          createdAt: v.createdAt
        }));
        
        setFeaturedVideos(formattedVideos.slice(0, 4));
        setTrendingVideos([...formattedVideos].sort((a, b) => b.views - a.views).slice(0, 4));
        setRecentlyApprovedVideos(formattedVideos.slice(0, 6));
        setRecentVideos(formattedVideos.slice(4, 8));
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  // ─── FETCH TOP CREATORS ──────────────────────────────────────────
  const fetchTopCreators = async () => {
    setLoadingCreators(true);
    try {
      // Try to fetch from API first
      const response = await getTopCreators();
      if (response.success && response.creators) {
        setTopCreatorsLeaderboard(response.creators.slice(0, 5));
      } else {
        // Fallback to localStorage
        loadTopCreatorsFromLocal();
      }
    } catch (error) {
      console.error("Error fetching top creators:", error);
      loadTopCreatorsFromLocal();
    } finally {
      setLoadingCreators(false);
    }
  };

  const loadTopCreatorsFromLocal = () => {
    const allUsers = JSON.parse(localStorage.getItem("wedding_users") || "[]");
    const creators = allUsers.filter(u => u.role === "creator");
    const creatorStats = creators.map(c => {
      const creatorVideos = JSON.parse(localStorage.getItem("creator_videos") || "[]").filter(v => v.creatorEmail === c.email);
      const totalViews = creatorVideos.reduce((sum, v) => sum + (v.views || 0), 0);
      const totalProjects = creatorVideos.length;
      const rating = 4.5 + Math.random() * 0.5;
      return { ...c, totalViews, totalProjects, rating: rating.toFixed(1) };
    });
    const sorted = creatorStats.sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);
    setTopCreatorsLeaderboard(sorted);
  };

  const g = (cols1, cols2, cols3) =>
    mobile ? "1fr" : tablet ? `repeat(${cols2}, 1fr)` : `repeat(${cols3}, 1fr)`;

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  const formatViews = (views) => {
    if (views >= 1000) return (views / 1000).toFixed(1) + "K";
    return views.toString();
  };

  const handleWatchVideo = (video) => {
    if (video.isPremium) {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      navigate(`/payment?premium=${video.id}`);
    } else {
      if (video.url) {
        window.open(video.url, "_blank");
      } else {
        navigate(`/video/${video.id}`);
      }
    }
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ─── HERO SECTION ─── */}
      <section style={{ minHeight: mobile ? "90vh" : "85vh", backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.8) 100%), url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: WHT, textAlign: "center", padding: mobile ? "60px 20px 80px" : "60px 40px", position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,193,7,0.15)", border: `1px solid rgba(255,193,7,0.4)`, borderRadius: 30, padding: "6px 18px", marginBottom: 24, fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: Y }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: Y, display: "inline-block", animation: "pulse 1.5s infinite" }} />
          {t('home.heroBadge')}
        </div>

        <h1 style={{ fontSize: mobile ? 32 : tablet ? 48 : 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, maxWidth: 900, letterSpacing: "-0.02em", color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          {t('home.heroTitle')}
        </h1>

        <p style={{ fontSize: mobile ? 16 : 20, color: "#ffffff", fontWeight: 400, maxWidth: 680, lineHeight: 1.7, marginBottom: 36, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
          {t('home.heroSubtitle')}
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {[
            { labelKey: "bookEvent",     bg: Y,      color: BLK, to: "/booking" },
            { labelKey: "watchVideos",   bg: "transparent", color: WHT, border: `2px solid ${WHT}`, to: "/videos" },
            { labelKey: "explorePosts",  bg: "rgba(255,255,255,0.1)", color: WHT, to: "/posts" },
            { labelKey: "joinPlatform",  bg: "rgba(255,193,7,0.2)",   color: Y,   border: `1px solid ${Y}`, to: "/register" },
          ].map(btn => (
            <Link key={btn.labelKey} to={btn.to}>
              <button style={{ padding: mobile ? "11px 22px" : "13px 28px", background: btn.bg, color: btn.color, border: btn.border || "none", borderRadius: 40, fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.03em", transition: "all 0.2s" }}>
                {t(`home.${btn.labelKey}`)}
              </button>
            </Link>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ display: "flex", width: "100%", maxWidth: 560, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 50, overflow: "hidden", padding: "4px 4px 4px 20px" }}>
          <FaSearch style={{ alignSelf: "center", color: "rgba(255,255,255,0.5)", flexShrink: 0, fontSize: 14 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('home.searchPlaceholder')}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: WHT, fontSize: 14, padding: "10px 14px" }} />
          <button type="submit" style={{ background: Y, color: BLK, border: "none", borderRadius: 40, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t('home.searchButton')}</button>
        </form>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
          {QUICK_LINKS.map((l, index) => (
            <Link key={index} to={l.to}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "7px 16px", fontSize: 12, color: "rgba(255,255,255,0.85)", cursor: "pointer", transition: "all 0.2s" }}>
                {l.icon} {l.label}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4 }}>
          <div style={{ width: 1, height: 40, background: WHT }} />
          <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>{t('common.scroll')}</span>
        </div>
      </section>

      {/* ─── PLATFORM INTRODUCTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK, color: WHT }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: Y }}>{t('home.aboutUs')}</span>
            <h2 style={{ fontSize: mobile ? 28 : 38, fontWeight: 800, margin: "14px 0 20px", lineHeight: 1.2, color: WHT }}>{t('home.platformTitle')}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 16 }}>
              {t('home.platformDesc')}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 28 }}>
              {t('home.platformDesc2')}
            </p>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                [t('home.eventsCovered'), "500+"],
                [t('home.clients'), "200+"],
                [t('home.districts'), "30"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: Y }}>{value}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[heroImage, traditionalImage, ericImage, heroImage].map((img, i) => (
              <img key={i} src={img} alt="" style={{ width: "100%", height: i % 2 === 0 ? 160 : 120, objectFit: "cover", borderRadius: 14, border: i === 0 ? `2px solid ${Y}` : "none" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEARCH SECTION ─── */}
      <section style={{ padding: mobile ? "40px 20px" : "56px 40px", background: WHT }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: mobile ? 24 : 30, marginBottom: 8, color: BLK }}>{t('home.findWhatYouLooking')}</h2>
          <p style={{ color: "#666", marginBottom: 28 }}>{t('home.searchAcross')}</p>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 0, background: "#f5f5f5", border: "2px solid #e0e0e0", borderRadius: 50, overflow: "hidden", padding: "4px 4px 4px 20px" }}>
            <FaSearch style={{ alignSelf: "center", color: "#aaa", flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('home.searchPlaceholder')}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: BLK, fontSize: 15, padding: "12px 14px" }} />
            <button type="submit" style={{ background: Y, color: BLK, border: "none", borderRadius: 40, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>{t('home.searchButton')}</button>
          </form>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
            {SEARCH_TAGS.map(tag => (
              <span key={tag.key} style={{
                padding: "5px 14px",
                background: tag.key === "all" ? Y : "#f0f0f0",
                color: tag.key === "all" ? BLK : "#555",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}>
                {t(tag.labelKey)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUICK ACCESS CARDS ─── */}
      <section style={{ padding: mobile ? "40px 20px" : "56px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>{t('home.quickAccess')}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 32 }}>{t('home.jumpDirectly')}</p>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 3, 6), gap: 14, maxWidth: 1000, margin: "0 auto" }}>
          {QUICK_LINKS.map((l, index) => (
            <Link key={index} to={l.to} style={{ textDecoration: "none" }}>
              <div style={{ background: WHT, borderRadius: 16, padding: "22px 14px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", transition: "all 0.2s", border: "1.5px solid #ececec" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = Y; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#ececec"; }}>
                <div style={{ fontSize: 26, color: Y, marginBottom: 10 }}>{l.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: BLK }}>{l.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── PROFESSIONAL SERVICES ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>{t('home.ourServices')}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
          {t('home.servicesDesc')}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 3, 5), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {SERVICES.map((svc, i) => (
            <div key={i} style={{ 
              background: "#fff", 
              borderRadius: 20, 
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform = "translateY(-8px)"; 
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.12)"; 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform = "translateY(0)"; 
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; 
              }}>
              <div style={{ 
                height: 180, 
                overflow: "hidden",
                position: "relative"
              }}>
                <img 
                  src={svc.image} 
                  alt={t(`home.${svc.nameKey}`)} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    transition: "transform 0.5s ease"
                  }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                />
                <div style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: Y,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}>
                  {svc.icon}
                </div>
              </div>
              <div style={{ padding: "20px" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: BLK }}>{t(`home.${svc.nameKey}`)}</h3>
                <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>{t(`home.${svc.descKey}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── EVENT TYPES ─── */}
      <section id="events-section" style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>{t('home.eventsWeCover')}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>{t('home.eventsWeCoverDesc')}</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {EVENT_CATEGORIES.map(cat => (
            <div key={cat.id} style={{ background: WHT, borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.3s", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}>
              <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                  onMouseLeave={e => e.target.style.transform = ""} />
                <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(0,0,0,0.6)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: WHT, fontWeight: 600, backdropFilter: "blur(8px)" }}>
                  {typeof cat.icon === "string" ? cat.icon : ""} {cat.name}
                </div>
              </div>
              <div style={{ padding: "20px 22px" }}>
                <p style={{ color: "#666", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>{cat.desc}</p>
                <button onClick={() => navigate(`/booking?type=${cat.id}`)} style={{ width: "100%", padding: "10px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  {t('home.bookThisEvent')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WEDDING MOMENTS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>{t('home.weddingMoments')}</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: 40 }}>{t('home.weddingMomentsDesc')}</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 4), gap: 18, maxWidth: 1200, margin: "0 auto" }}>
          {WEDDING_MOMENTS.map((m, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer", height: 220 }}
              onMouseEnter={e => e.currentTarget.querySelector("img").style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.querySelector("img").style.transform = ""}>
              <img src={m.image} alt={t(`home.${m.nameKey}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 18, left: 18 }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                <h3 style={{ color: WHT, fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{t(`home.${m.nameKey}`)}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{t(`home.${m.descKey}`)}</p>
              </div>
              <div style={{ position: "absolute", top: 14, right: 14, background: Y, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: BLK }}>{t('home.wedding')}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRENDING VIDEOS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: WHT, marginBottom: 4 }}><FaFire style={{ color: Y, marginRight: 8 }} /> {t('home.trendingVideos')}</h2>
            <p style={{ color: "#666", fontSize: 14 }}>{t('home.trendingDesc')}</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.2)`, borderRadius: 30, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>{t('home.viewAll')}</button></Link>
        </div>
        {trendingVideos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>{t('home.noVideosYet')}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 4), gap: 20, maxWidth: 1200, margin: "0 auto" }}>
            {trendingVideos.map(v => (
              <div key={v.id} style={{ background: "#1a1a1a", borderRadius: 18, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                  <img src={v.thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = heroImage} />
                  <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6 }}>
                    <span style={{ background: "rgba(0,0,0,0.75)", color: WHT, fontSize: 10, padding: "3px 8px", borderRadius: 10 }}><FaEye style={{ fontSize: 9 }} /> {formatViews(v.views)}</span>
                    <span style={{ background: "rgba(0,0,0,0.75)", color: WHT, fontSize: 10, padding: "3px 8px", borderRadius: 10 }}><FaHeart style={{ fontSize: 9 }} /> {formatViews(v.likes)}</span>
                  </div>
                  <span style={{ position: "absolute", top: 8, left: 8, background: Y, color: BLK, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>
                    {t(`home.${v.type}`) || v.type}
                  </span>
                  {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐ {t('videos.premium')}</span>}
                  {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶ {t('videos.free')}</span>}
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ color: WHT, fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                  <p style={{ color: "#888", fontSize: 11, marginBottom: 10 }}>{v.coupleName}</p>
                  <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "8px", background: v.isPremium ? "#6c757d" : Y, color: v.isPremium ? WHT : BLK, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.isPremium ? `⭐ ${t('videos.supportToWatch')}` : t('videos.watchFree')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── FEATURED VIDEOS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#111" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: WHT, marginBottom: 4 }}>{t('home.featuredVideos')}</h2>
            <p style={{ color: "#666", fontSize: 14 }}>{t('home.featuredDesc')}</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.2)`, borderRadius: 30, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>{t('home.viewAll')}</button></Link>
        </div>
        
        {loadingVideos ? (
          <div style={{ textAlign: "center", padding: "40px", color: WHT }}>{t('common.loading')}</div>
        ) : featuredVideos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>{t('home.noVideosYet')}</p>
            <Link to="/register"><button style={{ marginTop: 16, padding: "10px 24px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 600, cursor: "pointer" }}>{t('home.joinAsCreator')}</button></Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 4), gap: 20, maxWidth: 1200, margin: "0 auto" }}>
            {featuredVideos.map(v => (
              <div key={v.id} style={{ background: "#1a1a1a", borderRadius: 18, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                  <img src={v.thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = heroImage} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.3s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: Y, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaPlay style={{ color: BLK, fontSize: 16, marginLeft: 3 }} />
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6 }}>
                    <span style={{ background: "rgba(0,0,0,0.75)", color: WHT, fontSize: 10, padding: "3px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}><FaEye style={{ fontSize: 9 }} />{formatViews(v.views)}</span>
                    <span style={{ background: "rgba(0,0,0,0.75)", color: WHT, fontSize: 10, padding: "3px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}><FaHeart style={{ fontSize: 9 }} />{formatViews(v.likes)}</span>
                  </div>
                  <span style={{ position: "absolute", top: 8, left: 8, background: Y, color: BLK, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>
                    {t(`home.${v.type}`) || v.type}
                  </span>
                  {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐ {t('videos.premium')}</span>}
                  {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶ {t('videos.free')}</span>}
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ color: WHT, fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                  <p style={{ color: "#888", fontSize: 11, marginBottom: 10 }}>{v.coupleName}</p>
                  <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "8px", background: v.isPremium ? "#6c757d" : Y, color: v.isPremium ? WHT : BLK, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.isPremium ? `⭐ ${t('videos.supportToWatch')}` : t('videos.watchFree')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── STATS SECTION ─── */}
      <section ref={statsRef} style={{ padding: mobile ? "52px 20px" : "72px 40px", background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)` }}>
        <h2 style={{ textAlign: "center", color: WHT, marginBottom: 40 }}>{t('home.platformStatistics')}</h2>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 2, 4), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {STATS.map((stat, idx) => {
            const count = useCountUp(stat.raw, 2000, statsVisible);
            return (
              <div key={idx} style={{ textAlign: "center", padding: "24px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 36, color: Y, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: WHT, marginBottom: 4 }}>{statsVisible ? count.toLocaleString() : "0"}+</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{t(`home.${stat.labelKey}`)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── TOP CREATORS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ color: BLK, marginBottom: 0 }}>{t('home.topCreators')}</h2>
          <Link to="/creators"><button style={{ padding: "9px 22px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 600, cursor: "pointer" }}>{t('home.viewAll')}</button></Link>
        </div>
        {loadingCreators ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>{t('common.loading')}</div>
        ) : topCreatorsLeaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>{t('home.noCreatorsYet')}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
            {topCreatorsLeaderboard.map((creator, idx) => (
              <div key={creator.id || idx} style={{ background: WHT, borderRadius: 20, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.25s", cursor: "pointer", border: idx === 0 ? `2px solid ${Y}` : "none" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <div style={{ position: "relative" }}>
                    <img src={creator.image || creator.avatar || heroImage} alt={creator.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: idx === 0 ? `3px solid ${Y}` : "none" }} />
                    <div style={{ position: "absolute", bottom: -4, right: -4, background: Y, color: BLK, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{idx + 1}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: BLK }}>{creator.name}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>{t('home.views')}: {creator.totalViews?.toLocaleString() || 0}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
                  <span>📹 {creator.totalProjects || 0} {t('home.projects')}</span>
                  <span>⭐ {creator.rating || 0} {t('home.rating')}</span>
                  <span>🎬 {creator.events || 0} {t('home.events')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>{t('home.howItWorks')}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>{t('home.howItWorksDesc')}</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 5), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {STEPS.map(step => (
            <div key={step.n} style={{ textAlign: "center", padding: 24, background: "#fafafa", borderRadius: 16, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{step.icon}</div>
              <div style={{ fontSize: 12, color: Y, fontWeight: 700, marginBottom: 4 }}>{step.n}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: BLK }}>{t(`home.${step.titleKey}`)}</h3>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{t(`home.${step.descKey}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>{t('home.whyChooseUs')}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>{t('home.whyChooseUsDesc')}</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {WHY_US.map((item, idx) => (
            <div key={idx} style={{ background: WHT, padding: 24, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s", border: "1px solid #ececec" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = Y; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#ececec"; }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: BLK }}>{t(`home.${item.titleKey}`)}</h3>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{t(`home.${item.descKey}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>{t('home.eventGallery')}</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: 40 }}>{t('home.eventGalleryDesc')}</p>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 3, 6), gap: 12, maxWidth: 1200, margin: "0 auto" }}>
          {GALLERY.map((img, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", borderRadius: 12, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.querySelector("img").style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.querySelector("img").style.transform = "scale(1)"}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
              {i === 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(255,193,7,0.1)", border: `3px solid ${Y}` }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── LATEST POSTS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ color: BLK, marginBottom: 0 }}>{t('home.latestPosts')}</h2>
          <Link to="/posts"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid ${BLK}`, borderRadius: 30, color: BLK, fontSize: 13, cursor: "pointer" }}>{t('home.viewAll')}</button></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {POSTS.map(post => (
            <div key={post.id} style={{ background: WHT, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
              <img src={post.image} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ background: Y, padding: "2px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: BLK }}>{t(`home.${post.catKey}`)}</span>
                  <span style={{ fontSize: 11, color: "#999" }}>{post.date}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: BLK, lineHeight: 1.4 }}>{t(`home.${post.titleKey}`)}</h3>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 12 }}>{t(`home.${post.excerptKey}`)}</p>
                <Link to={`/posts/${post.id}`}><button style={{ padding: "8px 20px", background: BLK, color: WHT, border: "none", borderRadius: 20, fontSize: 13, cursor: "pointer" }}>{t('home.readMore')}</button></Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>{t('home.clientReviews')}</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: 40 }}>{t('home.clientReviewsDesc')}</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {TESTIMONIALS.map((test, idx) => (
            <div key={idx} style={{ background: "#1a1a1a", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = Y; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <img src={test.avatar} alt={test.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ color: WHT, fontWeight: 600 }}>{test.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{test.location} • {t(`home.${test.eventKey}`)}</div>
                </div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{t(`home.${test.reviewKey}`)}</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: i < test.rating ? Y : "#444" }}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>{t('home.faq')}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>{t('home.faqDesc')}</p>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {FAQS.map((faq, idx) => (
            <div key={idx} style={{ borderBottom: `1px solid #e8e8e8` }}>
              <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} style={{ width: "100%", padding: "18px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, fontWeight: 600, color: BLK }}>
                <span>{t(`home.${faq.qKey}`)}</span>
                <span style={{ fontSize: 22 }}>{faqOpen === idx ? "−" : "+"}</span>
              </button>
              {faqOpen === idx && <div style={{ padding: "0 12px 18px", color: "#666", fontSize: 14, lineHeight: 1.7 }}>{t(`home.${faq.aKey}`)}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", background: "linear-gradient(135deg, #1a1400 0%, #0d0d0d 100%)", padding: mobile ? "32px 20px" : "48px 40px", borderRadius: 20, border: `1px solid rgba(255,193,7,0.2)` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💍</div>
          <h2 style={{ fontSize: mobile ? 28 : 36, fontWeight: 800, color: WHT, marginBottom: 12 }}>{t('home.readyToCapture')}</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 600, margin: "0 auto 28px", fontSize: 16, lineHeight: 1.6 }}>{t('home.contactUs')}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/contact"><button style={{ padding: "14px 32px", background: Y, color: BLK, border: "none", borderRadius: 40, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{t('home.contactUsBtn')}</button></Link>
            <a href="https://wa.me/250780145562" target="_blank" rel="noopener noreferrer">
              <button style={{ padding: "14px 32px", background: "transparent", color: WHT, border: `2px solid #25d366`, borderRadius: 40, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                💬 {t('home.whatsappUs')}
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}