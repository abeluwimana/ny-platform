// src/pages/Home.jsx
import { useEffect, useRef, useState } from "react";
import {
  FaBookmark, FaBriefcase, FaBuilding, FaCalendar,
  FaCrown,
  FaDownload,
  FaEye,
  FaFire,
  FaGraduationCap,
  FaHeart,
  FaPlay, FaRing, FaSearch, FaStar,
  FaTrophy,
  FaUsers, FaVideo, FaWhatsapp
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import ericImage from "../assets/images/eric.jpeg";
import heroImage from "../assets/images/hero.png";
import traditionalImage from "../assets/images/traditional.jpeg";
import { getVideos } from "../services/api";

// Service images (you can replace with your own images)
import cakeServicesImg from "../assets/images/services/cake.jpg";
import cateringImg from "../assets/images/services/catering.jpg";
import decorationImg from "../assets/images/services/decoration.jpg";
import liveStreamingImg from "../assets/images/services/livestreaming.jpg";
import mcProtocolImg from "../assets/images/services/mc.jpg";
import photoBoothImg from "../assets/images/services/photobooth.png";
import photographyImg from "../assets/images/services/photography.jpg";
import soundSystemImg from "../assets/images/services/soundsystem.jpg";
import videographyImg from "../assets/images/services/videography.jpg";

/* ── helpers ── */
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

/* ── data ── */
const EVENT_CATEGORIES = [
  { id: "wedding",    name: "Weddings",            icon: <FaRing />,         desc: "Beautiful wedding ceremonies",        image: traditionalImage },
  { id: "birthday",   name: "Birthday Parties",    icon: "🎂",               desc: "Fun birthday celebrations",           image: ericImage },
  { id: "funeral",    name: "Funeral Ceremonies",  icon: "🕊️",              desc: "Respectful memorial videos",          image: heroImage },
  { id: "graduation", name: "Graduations",         icon: <FaGraduationCap />,desc: "Academic achievements celebrated",    image: traditionalImage },
  { id: "corporate",  name: "Corporate Events",    icon: <FaBuilding />,     desc: "Professional event coverage",         image: ericImage },
  { id: "dote",       name: "DOTE Ceremony",       icon: "🪘",               desc: "Traditional introduction ceremony",   image: heroImage },
];

// Professional Services with real images
const SERVICES = [
  { icon: "🎬", name: "Videography", desc: "4K cinematic coverage", image: videographyImg },
  { icon: "📷", name: "Photography", desc: "Professional stills", image: photographyImg },
  { icon: "📡", name: "Live Streaming", desc: "Real-time broadcast", image: liveStreamingImg },
  { icon: "🎙️", name: "Sound System", desc: "Crystal clear audio", image: soundSystemImg },
  { icon: "🎤", name: "MC & Protocol", desc: "Expert hosting", image: mcProtocolImg },
  { icon: "🌸", name: "Decoration", desc: "Elegant setups", image: decorationImg },
  { icon: "🎂", name: "Cake Services", desc: "Custom designs", image: cakeServicesImg },
  { icon: "🍽️", name: "Catering", desc: "Delicious menus", image: cateringImg },
  { icon: "📸", name: "Photo Booth", desc: "Fun memories", image: photoBoothImg },
];

const WEDDING_MOMENTS = [
  { name: "DOTE Ceremony",    icon: "🪘", desc: "Traditional introduction", image: heroImage },
  { name: "Traditional Dance",icon: "💃", desc: "Cultural performances",   image: traditionalImage },
  { name: "Church Wedding",   icon: "⛪", desc: "Sacred ceremony",          image: heroImage },
  { name: "Reception",        icon: "🎉", desc: "Celebration & party",      image: ericImage },
];

const GALLERY = [heroImage, traditionalImage, ericImage, heroImage, traditionalImage, ericImage];

const CREATORS = [
  { name: "Abel Uwimana",   role: "Lead Videographer",  rating: 5, exp: "5+ years", image: heroImage,       events: 120 },
  { name: "Diane Uwase",    role: "Creative Director",  rating: 5, exp: "4+ years", image: traditionalImage,events: 95 },
  { name: "Eric Niyonsaba", role: "Senior Editor",      rating: 5, exp: "3+ years", image: ericImage,       events: 80 },
];

const POSTS = [
  { id: 1, title: "Top 5 Wedding Trends in Rwanda 2025", cat: "Tips",         excerpt: "Discover the hottest wedding styles taking over Kigali this season.", image: heroImage,       date: "Jan 15" },
  { id: 2, title: "How to Plan Your DOTE Ceremony",      cat: "Guide",        excerpt: "Everything you need to know about Rwanda's beautiful introduction ceremony.", image: traditionalImage, date: "Jan 10" },
  { id: 3, title: "Behind the Lens: Our Camera Gear",    cat: "Behind Scenes",excerpt: "A look at the professional equipment we use to capture your moments.", image: ericImage,       date: "Jan 5" },
];

const TESTIMONIALS = [
  { name: "Eric & Diane",     review: "Amazing! The video captured every emotion perfectly. We cry every time we watch it.", rating: 5, location: "Kigali",  event: "Wedding",    avatar: ericImage },
  { name: "Sarah & Family",   review: "Beautiful tribute for our father. They preserved his memory with such dignity.", rating: 5, location: "Kigali",  event: "Funeral",    avatar: heroImage },
  { name: "Kevin Mugisha",    review: "The birthday video was incredible! Everyone was blown away by the quality.", rating: 5, location: "Rubavu",  event: "Birthday",   avatar: traditionalImage },
];

const WHY_US = [
  { icon: "🎬", title: "Cinematic Quality",    desc: "Every event filmed like a movie — rich colors, smooth motion" },
  { icon: "⚡", title: "Fast Delivery",        desc: "Highlight reels within 48 hours, full video in 2–4 weeks" },
  { icon: "📷", title: "Modern Equipment",     desc: "4K cameras, gimbals, pro lighting & audio gear" },
  { icon: "🌍", title: "All Rwanda",           desc: "We travel to all 30 districts — no event too far" },
  { icon: "💰", title: "Flexible Pricing",     desc: "Negotiable packages — we work within your budget" },
];

const STATS = [
  { number: "500+",  label: "Events Covered",  icon: <FaCalendar />,  raw: "500" },
  { number: "200+",  label: "Happy Clients",   icon: <FaUsers />,     raw: "200" },
  { number: "100K+", label: "Video Views",     icon: <FaVideo />,     raw: "100000" },
  { number: "50+",   label: "Top Creators",    icon: <FaStar />,      raw: "50" },
];

const FAQS = [
  { q: "What is DOTE (Introduction) ceremony?",  a: "DOTE is Rwanda's traditional introduction ceremony where the groom's family formally requests the bride's hand in marriage, with gift presentation, family speeches, and cultural dances." },
  { q: "How do I book an event?",                a: "Click 'Book Event Now' on any section. Choose your event type, fill in details, and submit. Our team reviews within 24 hours and contacts you with pricing." },
  { q: "How long does editing take?",             a: "Highlight reels: 48 hours. Full videos: 2–4 weeks depending on event size and package selected." },
  { q: "Do you cover events outside Kigali?",     a: "Yes! We cover all 30 districts of Rwanda. Travel costs may apply for distant locations." },
  { q: "Can I pay a deposit first?",              a: "Yes. A deposit is required to confirm your booking. Full payment is completed after admin approval and before the event date." },
  { q: "What's included in the Full Package?",    a: "Complete DOTE, Church, and Reception coverage, drone shots, two videographers, same-day highlight reel, and full cinematic film." },
];

const STEPS = [
  { n: "01", title: "Create Account", icon: "👤", desc: "Sign up and build your profile" },
  { n: "02", title: "Book Event",     icon: "📅", desc: "Choose your package and date" },
  { n: "03", title: "Event Coverage", icon: "🎥", desc: "Our team captures every moment" },
  { n: "04", title: "Editing",        icon: "✂️", desc: "Cinematic post-production" },
  { n: "05", title: "Share Memories", icon: "📦", desc: "Receive and share your story" },
];

const QUICK_LINKS = [
  { label: "Videos",   icon: <FaVideo />,   to: "/videos" },
  { label: "Posts",    icon: <FaBookmark />,to: "/posts" },
  { label: "Booking",  icon: <FaCalendar />,to: "/booking" },
  { label: "Creators", icon: <FaStar />,    to: "/creators" },
  { label: "Couples",  icon: <FaHeart />,   to: "/couples" },
  { label: "Contact",  icon: <FaBriefcase />, to: "/contact" },
];

const Y = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

export default function Home() {
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
  
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [recentlyApprovedVideos, setRecentlyApprovedVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  const [topCreatorsLeaderboard, setTopCreatorsLeaderboard] = useState([]);

  useEffect(() => {
    const loggedIn = localStorage.getItem("user_logged_in") === "true" ||
                     localStorage.getItem("admin_logged_in") === "true" ||
                     localStorage.getItem("couple_logged_in") === "true" ||
                     localStorage.getItem("creator_logged_in") === "true";
    setIsLoggedIn(loggedIn);
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
    
    const onResize = () => {
      setMobile(window.innerWidth <= 768);
      setTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    onResize();
    window.addEventListener("resize", onResize);
    
    fetchHomeData();
    loadTopCreatorsLeaderboard();
    
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const fetchHomeData = async () => {
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
    }
  };

  const loadTopCreatorsLeaderboard = () => {
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

      {/* ─── 1. HERO SECTION ─── */}
      <section style={{ minHeight: mobile ? "90vh" : "85vh", backgroundImage: `linear-gradient(160deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.8) 100%), url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: WHT, textAlign: "center", padding: mobile ? "60px 20px 80px" : "60px 40px", position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,193,7,0.15)", border: `1px solid rgba(255,193,7,0.4)`, borderRadius: 30, padding: "6px 18px", marginBottom: 24, fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: Y }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: Y, display: "inline-block", animation: "pulse 1.5s infinite" }} />
          Rwanda's Premier Event Media Platform
        </div>

        <h1 style={{ fontSize: mobile ? 32 : tablet ? 48 : 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, maxWidth: 900, letterSpacing: "-0.02em", color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          NY Entertainment Rwanda
        </h1>

        <p style={{ fontSize: mobile ? 16 : 20, color: "#ffffff", fontWeight: 400, maxWidth: 680, lineHeight: 1.7, marginBottom: 36, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
          Capturing unforgettable moments — DOTE introductions, weddings, birthdays, funerals, graduations &amp; corporate events across all of Rwanda.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {[
            { label: "📅 Book Event",     bg: Y,      color: BLK, to: "/booking" },
            { label: "🎬 Watch Videos",   bg: "transparent", color: WHT, border: `2px solid ${WHT}`, to: "/videos" },
            { label: "📝 Explore Posts",  bg: "rgba(255,255,255,0.1)", color: WHT, to: "/posts" },
            { label: "👤 Join Platform",  bg: "rgba(255,193,7,0.2)",   color: Y,   border: `1px solid ${Y}`, to: "/register" },
          ].map(btn => (
            <Link key={btn.label} to={btn.to}>
              <button style={{ padding: mobile ? "11px 22px" : "13px 28px", background: btn.bg, color: btn.color, border: btn.border || "none", borderRadius: 40, fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.03em", transition: "all 0.2s" }}>
                {btn.label}
              </button>
            </Link>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ display: "flex", width: "100%", maxWidth: 560, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 50, overflow: "hidden", padding: "4px 4px 4px 20px" }}>
          <FaSearch style={{ alignSelf: "center", color: "rgba(255,255,255,0.5)", flexShrink: 0, fontSize: 14 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos, posts, creators, couples…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: WHT, fontSize: 14, padding: "10px 14px" }} />
          <button type="submit" style={{ background: Y, color: BLK, border: "none", borderRadius: 40, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Search</button>
        </form>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}>
          {QUICK_LINKS.map(l => (
            <Link key={l.label} to={l.to}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "7px 16px", fontSize: 12, color: "rgba(255,255,255,0.85)", cursor: "pointer", transition: "all 0.2s" }}>
                {l.icon} {l.label}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4 }}>
          <div style={{ width: 1, height: 40, background: WHT }} />
          <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</span>
        </div>
      </section>

      {/* ─── 2. PLATFORM INTRODUCTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK, color: WHT }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: Y }}>About Us</span>
            <h2 style={{ fontSize: mobile ? 28 : 38, fontWeight: 800, margin: "14px 0 20px", lineHeight: 1.2, color: WHT }}>Rwanda's Leading Event Media Platform</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 16 }}>
              NY Entertainment Rwanda is a professional event media company covering weddings, DOTE ceremonies, birthdays, funerals, graduations, and corporate events across all 30 districts of Rwanda.
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 28 }}>
              From cinematic videography and aerial drone coverage to live streaming and photo booths — we provide end-to-end media production that preserves your most important moments forever.
            </p>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[["500+","Events"], ["200+","Clients"], ["30","Districts"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: Y }}>{n}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{l}</div>
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
          <h2 style={{ fontSize: mobile ? 24 : 30, marginBottom: 8, color: BLK }}>🔍 Find What You're Looking For</h2>
          <p style={{ color: "#666", marginBottom: 28 }}>Search across videos, posts, creators, couples and events</p>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 0, background: "#f5f5f5", border: "2px solid #e0e0e0", borderRadius: 50, overflow: "hidden", padding: "4px 4px 4px 20px" }}>
            <FaSearch style={{ alignSelf: "center", color: "#aaa", flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos, posts, creators, couples…"
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: BLK, fontSize: 15, padding: "12px 14px" }} />
            <button type="submit" style={{ background: Y, color: BLK, border: "none", borderRadius: 40, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Search</button>
          </form>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
            {["All", "Videos", "Posts", "Creators", "Couples", "Events"].map(tag => (
              <span key={tag} style={{ padding: "5px 14px", background: tag === "All" ? Y : "#f0f0f0", color: tag === "All" ? BLK : "#555", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUICK ACCESS CARDS ─── */}
      <section style={{ padding: mobile ? "40px 20px" : "56px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>⚡ Quick Access</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 32 }}>Jump directly to what you need</p>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 3, 6), gap: 14, maxWidth: 1000, margin: "0 auto" }}>
          {QUICK_LINKS.map(l => (
            <Link key={l.label} to={l.to} style={{ textDecoration: "none" }}>
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

      {/* ─── PROFESSIONAL SERVICES WITH IMAGES ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>🛠️ Our Premium Services</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
          Everything you need for a perfect event – professional, reliable, and tailored to your needs.
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
                  alt={svc.name} 
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
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: BLK }}>{svc.name}</h3>
                <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>{svc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── EVENT TYPES ─── */}
      <section id="events-section" style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>📋 Events We Cover</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Professional coverage for every occasion</p>
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
                  Book This Event →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WEDDING MOMENTS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>💒 Wedding Moments</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: 40 }}>Every part of your wedding, beautifully covered</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 4), gap: 18, maxWidth: 1200, margin: "0 auto" }}>
          {WEDDING_MOMENTS.map((m, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer", height: 220 }}
              onMouseEnter={e => e.currentTarget.querySelector("img").style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.querySelector("img").style.transform = ""}>
              <img src={m.image} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 18, left: 18 }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                <h3 style={{ color: WHT, fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{m.name}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{m.desc}</p>
              </div>
              <div style={{ position: "absolute", top: 14, right: 14, background: Y, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: BLK }}>Wedding</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRENDING VIDEOS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: WHT, marginBottom: 4 }}><FaFire style={{ color: Y, marginRight: 8 }} /> Trending Videos</h2>
            <p style={{ color: "#666", fontSize: 14 }}>Most viewed and popular content</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.2)`, borderRadius: 30, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>View All →</button></Link>
        </div>
        {trendingVideos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>No trending videos yet</div>
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
                  <span style={{ position: "absolute", top: 8, left: 8, background: Y, color: BLK, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{v.type}</span>
                  {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐ Premium</span>}
                  {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶ Free</span>}
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ color: WHT, fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                  <p style={{ color: "#888", fontSize: 11, marginBottom: 10 }}>{v.coupleName}</p>
                  <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "8px", background: v.isPremium ? "#6c757d" : Y, color: v.isPremium ? WHT : BLK, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.isPremium ? "⭐ Twerera/ Support to Watch" : "▶ Watch Free"}
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
            <h2 style={{ color: WHT, marginBottom: 4 }}>🎬 Featured Videos</h2>
            <p style={{ color: "#666", fontSize: 14 }}>Our best cinematic work</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.2)`, borderRadius: 30, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>View All →</button></Link>
        </div>
        
        {loadingVideos ? (
          <div style={{ textAlign: "center", padding: "40px", color: WHT }}>Loading videos...</div>
        ) : featuredVideos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>No videos yet. Videos uploaded by couples and creators will appear here.</p>
            <Link to="/register"><button style={{ marginTop: 16, padding: "10px 24px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 600, cursor: "pointer" }}>Join as Creator →</button></Link>
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
                  <span style={{ position: "absolute", top: 8, left: 8, background: Y, color: BLK, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>{v.type}</span>
                  {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐ Premium</span>}
                  {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶ Free</span>}
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ color: WHT, fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                  <p style={{ color: "#888", fontSize: 11, marginBottom: 10 }}>{v.coupleName}</p>
                  <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "8px", background: v.isPremium ? "#6c757d" : Y, color: v.isPremium ? WHT : BLK, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.isPremium ? "⭐ Twerera/ Support to Watch" : "▶ Watch Free"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── RECENTLY APPROVED VIDEOS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: BLK, marginBottom: 4 }}>✅ Recently Approved</h2>
            <p style={{ color: "#666", fontSize: 14 }}>Fresh content just published</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: BLK, border: "none", borderRadius: 30, color: WHT, fontSize: 13, cursor: "pointer" }}>View All →</button></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 3, 4), gap: 16, maxWidth: 1200, margin: "0 auto" }}>
          {recentlyApprovedVideos.slice(0, 4).map(v => (
            <div key={v.id} style={{ background: "#fff", border: "1.5px solid #ececec", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                <img src={v.thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaPlay style={{ color: WHT, fontSize: 24, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
                </div>
                {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐ Premium</span>}
                {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶ Free</span>}
              </div>
              <div style={{ padding: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: BLK, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                <p style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>{v.coupleName}</p>
                <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "7px", background: v.isPremium ? "#6c757d" : Y, color: v.isPremium ? WHT : BLK, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {v.isPremium ? "⭐ Support" : "▶ Watch Free"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SHORT VIDEOS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: BLK, marginBottom: 4 }}>📱 Short Reels</h2>
            <p style={{ color: "#666", fontSize: 14 }}>Quick event previews & highlights</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: BLK, border: "none", borderRadius: 30, color: WHT, fontSize: 13, cursor: "pointer" }}>View All →</button></Link>
        </div>
        
        {loadingVideos ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading videos...</div>
        ) : recentVideos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>More videos coming soon...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: g(2, 3, 4), gap: 16, maxWidth: 1200, margin: "0 auto" }}>
            {recentVideos.map(v => (
              <div key={v.id} style={{ background: "#fafafa", border: "1.5px solid #ececec", borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ position: "relative", aspectRatio: "9/16", overflow: "hidden" }}>
                  <img src={v.thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaPlay style={{ color: WHT, fontSize: 24, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
                  </div>
                  {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐</span>}
                  {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶</span>}
                </div>
                <div style={{ padding: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: BLK, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                  <p style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>{v.coupleName}</p>
                  <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "7px", background: v.isPremium ? "#6c757d" : BLK, color: v.isPremium ? WHT : WHT, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.isPremium ? "⭐ Support" : "▶ Watch"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── TOP CREATORS LEADERBOARD ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}><FaTrophy style={{ color: Y, marginRight: 8 }} /> Top Creators Leaderboard</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: 40 }}>The most viewed and followed creators on our platform</p>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {topCreatorsLeaderboard.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>No creators yet</p>
          ) : (
            topCreatorsLeaderboard.map((creator, index) => (
              <div key={creator.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1a1a1a", borderRadius: 12, padding: "16px 20px", marginBottom: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: index === 0 ? Y : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#666", width: 40 }}>#{index + 1}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: WHT }}>{creator.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{creator.role || "Creator"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div><span style={{ color: "#888" }}>📹 Projects:</span> <strong style={{ color: Y }}>{creator.totalProjects}</strong></div>
                  <div><span style={{ color: "#888" }}>👁️ Views:</span> <strong>{creator.totalViews?.toLocaleString()}</strong></div>
                  <div><span style={{ color: "#888" }}>⭐ Rating:</span> <strong>{creator.rating}</strong></div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ─── SUPPORT IMPACT SECTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: Y, textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: BLK, marginBottom: 16 }}>Your Support Makes a Difference</h2>
          <p style={{ fontSize: 16, color: "rgba(0,0,0,0.7)", lineHeight: 1.7, marginBottom: 24 }}>
            "Your support helps couples preserve their precious memories and earn from their love stories. 
             Every contribution goes directly to supporting Rwandan couples and their families."
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/couples"><button style={{ background: BLK, color: WHT, border: "none", padding: "12px 28px", borderRadius: 40, fontWeight: 700, cursor: "pointer" }}>Browse Couples →</button></Link>
            <Link to="/register?role=couple"><button style={{ background: "transparent", border: `2px solid ${BLK}`, color: BLK, padding: "12px 28px", borderRadius: 40, fontWeight: 700, cursor: "pointer" }}>Become a Couple →</button></Link>
          </div>
        </div>
      </section>

      {/* ─── LIVE EVENTS SECTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}><span style={{ marginRight: 8, fontSize: 24 }}>🔴</span> Live Events</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", marginBottom: 40 }}>Watch live ceremonies happening now</p>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", padding: "40px", background: "rgba(0,0,0,0.2)", borderRadius: 16 }}>No live events at the moment</div>
        </div>
      </section>

      {/* ─── DOWNLOAD APP SECTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}><FaDownload style={{ color: Y, marginRight: 8 }} /> Download Our App</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: 40 }}>Coming soon to Android and iOS</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#3ddc84", width: 80, height: 80, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <span style={{ fontSize: 40 }}>🤖</span>
            </div>
            <div style={{ fontWeight: 600, color: WHT }}>Android App</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Coming Q3 2026</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ background: "#000", width: 80, height: 80, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: "1px solid #333" }}>
              <span style={{ fontSize: 40 }}>🍎</span>
            </div>
            <div style={{ fontWeight: 600, color: WHT }}>iOS App</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Coming Q4 2026</div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED EVENTS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>⭐ Featured Events</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Handpicked events from our portfolio</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {[
            { title: "Eric & Diane — Full Wedding",  type: "Wedding",    image: ericImage,        date: "Dec 2024" },
            { title: "Kevin Mugisha — Birthday Bash", type: "Birthday",   image: traditionalImage, date: "Jan 2025" },
            { title: "INES Graduation Ceremony",      type: "Graduation", image: heroImage,        date: "Nov 2024" },
          ].map((ev, i) => (
            <div key={i} style={{ background: WHT, borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}>
              <div style={{ position: "relative", height: 200 }}>
                <img src={ev.image} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 14, left: 14, background: Y, color: BLK, fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20 }}>{ev.type}</span>
                <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.6)", color: WHT, fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>{ev.date}</span>
              </div>
              <div style={{ padding: "18px 20px" }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: BLK }}>{ev.title}</h3>
                <Link to="/videos"><button style={{ width: "100%", padding: "10px", background: BLK, color: WHT, border: "none", borderRadius: 30, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>View Event →</button></Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED COUPLES ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>💑 Featured Couples</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Real love stories, beautifully preserved</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {[
            { id: "eric-diane", name: "Eric & Diane", location: "Kigali", image: ericImage },
            { id: "john-grace", name: "John & Grace", location: "Huye", image: traditionalImage },
            { id: "patrick-sandra", name: "Patrick & Sandra", location: "Rubavu", image: heroImage },
          ].map(c => (
            <Link key={c.id} to={`/wedding/${c.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fafafa", borderRadius: 20, overflow: "hidden", border: "1.5px solid #ececec", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = Y; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#ececec"; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ position: "relative", height: 220 }}>
                  <img src={c.image} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: 14, left: 16, color: WHT }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800 }}>{c.name}</h3>
                    <p style={{ fontSize: 13, opacity: 0.8 }}>📍 {c.location}</p>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <button style={{ width: "100%", padding: "10px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    ❤️ View Story →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── TOP CREATORS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>🎥 Top Creators</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: 40 }}>The talented team behind every shot</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {CREATORS.map((c, i) => (
            <div key={i} style={{ background: "#1a1a1a", borderRadius: 20, padding: "28px 24px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${Y}`; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"; e.currentTarget.style.transform = ""; }}>
              <img src={c.image} alt={c.name} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", margin: "0 auto 16px", border: `3px solid ${Y}` }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: WHT, marginBottom: 4 }}>{c.name}</h3>
              <p style={{ color: Y, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{c.role}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 10 }}>
                {[...Array(c.rating)].map((_, i) => <FaStar key={i} style={{ color: Y, fontSize: 12 }} />)}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
                <div><div style={{ fontSize: 18, fontWeight: 800, color: WHT }}>{c.events}+</div><div style={{ fontSize: 11, color: "#666" }}>Events</div></div>
                <div><div style={{ fontSize: 18, fontWeight: 800, color: WHT }}>{c.exp}</div><div style={{ fontSize: 11, color: "#666" }}>Exp.</div></div>
              </div>
              <Link to="/creators"><button style={{ width: "100%", padding: "9px", background: Y, color: BLK, border: "none", borderRadius: 24, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View Profile →</button></Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LATEST POSTS & STORIES ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: BLK, marginBottom: 4 }}>📝 Latest Posts & Stories</h2>
            <p style={{ color: "#666", fontSize: 14 }}>Tips, guides & event announcements</p>
          </div>
          <Link to="/posts"><button style={{ padding: "9px 22px", background: BLK, border: "none", borderRadius: 30, color: WHT, fontSize: 13, cursor: "pointer" }}>View All →</button></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          {POSTS.map(post => (
            <div key={post.id} style={{ background: WHT, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)"; }}>
              <div style={{ height: 170, overflow: "hidden" }}>
                <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                  onMouseLeave={e => e.target.style.transform = ""} />
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ background: Y, color: BLK, fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{post.cat}</span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{post.date}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: BLK, lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ fontSize: 13, color: "#777", lineHeight: 1.6, marginBottom: 14 }}>{post.excerpt}</p>
                <Link to={`/posts/${post.id}`}><button style={{ padding: "8px 18px", background: BLK, color: WHT, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Read More →</button></Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── IMAGE GALLERY ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>📸 Event Gallery</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Beautiful moments from our portfolio</p>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 12, maxWidth: 1100, margin: "0 auto" }}>
          {GALLERY.map((img, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer", height: i % 3 === 0 ? 260 : 180 }}
              onClick={() => setGalleryOpen(i)}>
              <img src={img} alt={`Gallery ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                onMouseEnter={e => e.target.style.transform = "scale(1.07)"}
                onMouseLeave={e => e.target.style.transform = ""} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.3s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0)"; }}>
                <FaEye style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: WHT, fontSize: 22, opacity: 0.9 }} />
              </div>
            </div>
          ))}
        </div>
        {galleryOpen !== null && (
          <div onClick={() => setGalleryOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <img src={GALLERY[galleryOpen]} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 16 }} />
            <button onClick={() => setGalleryOpen(null)} style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", color: WHT, fontSize: 32, cursor: "pointer" }}>×</button>
          </div>
        )}
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>✨ Why Choose NY Entertainment?</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Professional service you can trust</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 22, maxWidth: 1000, margin: "0 auto" }}>
          {WHY_US.map((item, i) => (
            <div key={i} style={{ background: WHT, padding: "28px 24px", borderRadius: 18, border: "1.5px solid #ececec", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = Y; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ececec"; e.currentTarget.style.transform = ""; }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: BLK }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "#777", lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PLATFORM STATISTICS ─── */}
      <section ref={statsRef} style={{ padding: mobile ? "60px 20px" : "80px 40px", background: BLK, color: WHT, textAlign: "center" }}>
        <h2 style={{ color: WHT, marginBottom: 8 }}>📊 Platform Statistics</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 48 }}>Numbers that speak for themselves</p>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 2, 4), gap: 32, maxWidth: 900, margin: "0 auto" }}>
          {STATS.map((stat, i) => {
            const count = useCountUp(stat.raw, 2000, statsVisible);
            const suffix = stat.number.replace(/\d/g, "").trim();
            return (
              <div key={i}>
                <div style={{ fontSize: 32, color: Y, marginBottom: 12 }}>{stat.icon}</div>
                <div style={{ fontSize: mobile ? 36 : 48, fontWeight: 900, marginBottom: 6, lineHeight: 1 }}>
                  {statsVisible ? count.toLocaleString() : "0"}{suffix}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CLIENT REVIEWS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>💬 Client Reviews</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Real experiences from happy clients</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: WHT, padding: "28px 24px", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "relative" }}>
              <div style={{ fontSize: 40, position: "absolute", top: 16, right: 20, opacity: 0.08, color: BLK, fontFamily: "serif", lineHeight: 1 }}>"</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
                <img src={t.avatar} alt={t.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${Y}` }} />
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: BLK }}>{t.name}</h4>
                  <p style={{ fontSize: 12, color: "#aaa" }}>📍 {t.location} • {t.event}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                {[...Array(t.rating)].map((_, i) => <FaStar key={i} style={{ color: Y, fontSize: 13 }} />)}
              </div>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, fontStyle: "italic" }}>"{t.review}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOOKING CTA ─── */}
      <section style={{ padding: mobile ? "60px 20px" : "80px 40px", background: Y, textAlign: "center" }}>
        <h2 style={{ fontSize: mobile ? 28 : 38, fontWeight: 900, color: BLK, marginBottom: 14 }}>Ready to Capture Your Event?</h2>
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.65)", marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
          Contact us today — pricing is negotiable and we'll work within your budget.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer">
            <button style={{ padding: "14px 32px", background: "#25D366", color: WHT, border: "none", borderRadius: 40, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
              <FaWhatsapp style={{ fontSize: 20, animation: "pulse 1.5s ease-in-out infinite" }} /> WhatsApp Us
            </button>
          </a>
          <Link to="/booking"><button style={{ padding: "14px 32px", background: BLK, color: WHT, border: "none", borderRadius: 40, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>📅 Book Event Now</button></Link>
          <Link to="/contact"><button style={{ padding: "14px 32px", background: WHT, color: BLK, border: "none", borderRadius: 40, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>📞 Contact Us</button></Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>⚙️ How It Works</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 48 }}>Simple 5-step process</p>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 3, 5), gap: 20, maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ textAlign: "center", position: "relative" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLK, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26, border: `3px solid ${Y}` }}>{step.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: Y, marginBottom: 6, textTransform: "uppercase" }}>Step {step.n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: BLK }}>{step.title}</h3>
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PREMIUM CONTENT ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)`, color: WHT, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,193,7,0.15)", border: `1px solid rgba(255,193,7,0.4)`, borderRadius: 30, padding: "6px 18px", marginBottom: 20, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: Y }}>
          <FaCrown /> Premium Content
        </div>
        <h2 style={{ color: WHT, marginBottom: 14, fontSize: mobile ? 28 : 36 }}>Exclusive Premium Videos & Galleries</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 36, maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Subscribe to access premium cinematic wedding films, full ceremony recordings, and exclusive behind-the-scenes content.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/subscribe"><button style={{ padding: "13px 30px", background: Y, color: BLK, border: "none", borderRadius: 40, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>⭐ Subscribe Now</button></Link>
          <Link to="/videos"><button style={{ padding: "13px 30px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.25)`, color: "rgba(255,255,255,0.8)", borderRadius: 40, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Learn More</button></Link>
        </div>
      </section>

      {/* ─── EARN WITH US ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>💰 Earn With Us</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Turn your passion into income</p>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 24, maxWidth: 900, margin: "0 auto" }}>
          {[
            { icon: "💍", title: "Become a Featured Couple", desc: "Share your love story, get a dedicated wedding page, and earn from premium video views and sponsorships.", cta: "Join as Couple", to: "/register?role=couple", color: Y },
            { icon: "🎬", title: "Become a Creator",         desc: "Showcase your work, get bookings through our platform, and earn from events, tips, and premium content.", cta: "Join as Creator", to: "/register?role=creator", color: BLK },
          ].map((card, i) => (
            <div key={i} style={{ background: WHT, borderRadius: 22, padding: "32px 28px", border: "1.5px solid #ececec", textAlign: "center", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{card.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: BLK }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, marginBottom: 24 }}>{card.desc}</p>
              <Link to={card.to}><button style={{ padding: "12px 28px", background: card.color, color: card.color === Y ? BLK : WHT, border: "none", borderRadius: 30, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>{card.cta} →</button></Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STAY UPDATED ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT, textAlign: "center" }}>
        <h2 style={{ marginBottom: 8, color: BLK }}>📧 Stay Updated</h2>
        <p style={{ color: "#666", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>Subscribe to get updates on new events, offers, and featured videos</p>
        <div style={{ display: "flex", gap: 0, maxWidth: 520, margin: "0 auto", background: "#f5f5f5", border: "2px solid #e0e0e0", borderRadius: 50, overflow: "hidden", padding: "5px 5px 5px 22px" }}>
          <input type="email" placeholder="Your email address"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: BLK, fontSize: 15, minWidth: 0 }} />
          <button style={{ padding: "12px 28px", background: Y, color: BLK, border: "none", borderRadius: 40, fontWeight: 700, fontSize: 14, cursor: "pointer", flexShrink: 0 }}>Subscribe</button>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>❓ FAQ</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Got questions? We've got answers</p>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: WHT, borderRadius: 14, overflow: "hidden", border: faqOpen === i ? `1.5px solid ${Y}` : "1.5px solid #ececec", transition: "border 0.2s" }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: BLK }}>{faq.q}</span>
                <span style={{ color: Y, fontSize: 20, fontWeight: 300, flexShrink: 0, transform: faqOpen === i ? "rotate(45deg)" : "none", transition: "transform 0.25s" }}>+</span>
              </button>
              {faqOpen === i && (
                <div style={{ padding: "0 22px 18px", fontSize: 14, color: "#666", lineHeight: 1.75, borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ paddingTop: 14 }}>{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── GET IN TOUCH ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>📞 Get In Touch</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>We're ready to cover your next event</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 4), gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {[
            { icon: "📧", label: "Email",     value: "nyentertainment@gmail.com", href: "mailto:nyentertainment@gmail.com" },
            { icon: "📱", label: "Phone",     value: "+250 780 145 562",          href: "tel:+250780145562" },
            { icon: "📍", label: "Location",  value: "Kamonyi, Rwanda",            href: "#" },
            { icon: "💬", label: "WhatsApp",  value: "Chat with us now",         href: "https://wa.me/250780145562" },
          ].map((c, i) => (
            <a key={i} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ background: "#f5f5f5", borderRadius: 16, padding: "22px 18px", textAlign: "center", border: "1.5px solid #ececec", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = Y; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#ececec"; e.currentTarget.style.transform = ""; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: BLK }}>{c.value}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── FLOATING WHATSAPP WITH PULSE ANIMATION ─── */}
      <a href="https://wa.me/250780145562" target="_blank" rel="noreferrer"
        style={{ position: "fixed", bottom: 28, right: 24, width: 58, height: 58, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,211,102,0.5)", zIndex: 1000, transition: "all 0.2s", animation: "pulse 2s ease-in-out infinite" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.animation = "none"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.animation = "pulse 2s ease-in-out infinite"; }}>
        <FaWhatsapp style={{ fontSize: 26, color: WHT }} />
      </a>

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.08);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}