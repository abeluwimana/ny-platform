// src/pages/Home.jsx
// SHINECONNECT - Home Page

import { useEffect, useRef, useState } from "react";
import {
  FaBookmark, FaBriefcase, FaBuilding, FaCalendar,
  FaDrum,
  FaEye, FaFire, FaGraduationCap, FaHeart,
  FaPlay, FaRing, FaSearch, FaStar,
  FaUsers, FaVideo
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import abamararunguImage from "../assets/images/abamararungu.jpeg";
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

const GALLERY = [heroImage, traditionalImage, ericImage, abamararunguImage, traditionalImage, heroImage];

const CREATORS = [
  { name: "Abel Uwimana",   roleKey: "leadVideographer",  rating: 5, exp: "5+ years", image: heroImage,       events: 120 },
  { name: "Diane Uwase",    roleKey: "creativeDirector",  rating: 5, exp: "4+ years", image: traditionalImage,events: 95 },
  { name: "Eric Niyonsaba", roleKey: "seniorEditor",      rating: 5, exp: "3+ years", image: ericImage,       events: 80 },
];

const POSTS = [
  { id: 1, title: "Tips for a Perfect Wedding Video", cat: "Tips", excerpt: "Discover the secrets to capturing your special day with cinematic excellence...", image: heroImage,       date: "Jan 15" },
  { id: 2, title: "Traditional DOTE Ceremony Guide", cat: "Guide", excerpt: "Everything you need to know about the beautiful Rwandan DOTE tradition...", image: traditionalImage, date: "Jan 10" },
  { id: 3, title: "Behind the Scenes with Our Creators", cat: "Behind Scenes", excerpt: "Go behind the camera with our top creators and see how magic happens...", image: ericImage,       date: "Jan 5" },
];

const TESTIMONIALS = [
  { name: "Eric & Diane", review: "Absolutely stunning work! Our wedding video captured every moment perfectly. Highly recommend!", rating: 5, location: "Kigali",  event: "Wedding",    avatar: ericImage },
  { name: "Sarah & Family", review: "The team was professional and respectful during our funeral service. The video was beautifully done.", rating: 5, location: "Kigali",  event: "Funeral",    avatar: heroImage },
  { name: "Kevin Mugisha", review: "My birthday party video was amazing! The drone shots and editing were top-notch.", rating: 5, location: "Rubavu",  event: "Birthday",   avatar: traditionalImage },
];

const WHY_US = [
  { icon: "🎬", title: "Cinematic Quality", desc: "Professional grade videography with cinematic storytelling" },
  { icon: "⚡", title: "Fast Delivery", desc: "Get your edited videos within days, not weeks" },
  { icon: "📷", title: "Modern Equipment", desc: "4K cameras, drones, and professional audio gear" },
  { icon: "🌍", title: "All of Rwanda", desc: "Covering all 30 districts across the country" },
  { icon: "💰", title: "Flexible Pricing", desc: "Custom packages to fit every budget and need" },
];

const STATS = [
  { number: "500+",  label: "Events Covered",  icon: <FaCalendar />,  raw: "500" },
  { number: "200+",  label: "Happy Clients",   icon: <FaUsers />,     raw: "200" },
  { number: "100K+", label: "Video Views",     icon: <FaVideo />,     raw: "100000" },
  { number: "50+",   label: "Top Creators",    icon: <FaStar />,      raw: "50" },
];

const FAQS = [
  { q: "How do I book your services?", a: "You can book directly through our booking page, call us at +250 780 145 562, or send us an email. We'll respond within 24 hours." },
  { q: "What is the price range for your services?", a: "Our packages range from 550,000 RWF for standard coverage to 1,500,000 RWF for our executive package. We also offer custom quotes for specific needs." },
  { q: "How long does it take to get my video?", a: "We deliver highlight videos within 48 hours and full ceremony edits within 2 weeks, depending on the package selected." },
  { q: "Do you offer drone coverage?", a: "Yes! Drone coverage is available for outdoor events and is included in our Premium and Executive packages." },
  { q: "Can I request a specific style of editing?", a: "Absolutely! We work closely with you to understand your vision and deliver a video that matches your style." },
  { q: "Do you cover events outside Kigali?", a: "Yes! We cover events across all 30 districts of Rwanda. Travel arrangements can be made based on the location." },
];

const STEPS = [
  { n: "01", title: "Contact Us", icon: "👤", desc: "Reach out via booking form, phone, or email to discuss your event" },
  { n: "02", title: "Plan Your Event", icon: "📅", desc: "We'll work with you to create a custom plan and schedule" },
  { n: "03", title: "We Capture", icon: "🎥", desc: "Our team arrives with professional equipment to capture every moment" },
  { n: "04", title: "Editing & Production", icon: "✂️", desc: "Our editors craft your footage into a cinematic masterpiece" },
  { n: "05", title: "Delivery", icon: "📦", desc: "Receive your final video in stunning quality, ready to share" },
];

// ─── ABAMARARUNGU DANCE SECTION ─────────────────────────────────
const ABAMARARUNGU_DANCE = {
  title: "Abamararungu Traditional Dance",
  description: "Experience the vibrant and energetic traditional Rwandan dance, Abamararungu. This cultural performance is a highlight of any celebration, bringing joy, rhythm, and authentic Rwandan heritage to your event.",
  features: [
    "Professional Traditional Dance Troupe",
    "Authentic Rwandan Drumming",
    "Colorful Traditional Attire",
    "Interactive Audience Participation",
    "Custom Choreography for Your Event",
    "Available for Weddings, DOTE, and Cultural Events"
  ],
  image: abamararunguImage
};

// ─── SEARCH TAGS ─────────────────────────────────────────────────
const SEARCH_TAGS = [
  { key: "all", label: "All" },
  { key: "videos", label: "Videos" },
  { key: "posts", label: "Posts" },
  { key: "creators", label: "Creators" },
  { key: "couples", label: "Couples" },
  { key: "events", label: "Events" },
];

export default function Home() {
  const navigate  = useNavigate();
  const [mobile,  setMobile]  = useState(false);
  const [tablet,  setTablet]  = useState(false);
  const [search,  setSearch]  = useState("");
  const [faqOpen, setFaqOpen] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  const [topCreatorsLeaderboard, setTopCreatorsLeaderboard] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  // ─── All data ───
  const EVENT_CATEGORIES = [
    { id: "wedding",    name: "Wedding",            icon: <FaRing />,         desc: "Capture the most beautiful day of your life with cinematic excellence", image: traditionalImage },
    { id: "birthday",   name: "Birthday",    icon: "🎂",               desc: "Celebrate another year with a professionally captured party", image: ericImage },
    { id: "funeral",    name: "Funeral",  icon: "🕊️",              desc: "Honor your loved ones with dignified and respectful coverage", image: heroImage },
    { id: "graduation", name: "Graduation",         icon: <FaGraduationCap />,desc: "Mark your academic achievement with a professionally filmed ceremony", image: traditionalImage },
    { id: "corporate",  name: "Corporate",    icon: <FaBuilding />,     desc: "Professional coverage for corporate events, conferences, and launches", image: ericImage },
    { id: "dote",       name: "DOTE",       icon: "🪘",               desc: "Traditional Rwandan DOTE ceremony captured with cultural authenticity", image: heroImage },
  ];

  const SERVICES = [
    { icon: "🎬", name: "Videography", desc: "Cinematic wedding and event videography with professional editing", image: videographyImg },
    { icon: "📷", name: "Photography", desc: "High-quality photography capturing every precious moment", image: photographyImg },
    { icon: "📡", name: "Live Streaming", desc: "Broadcast your event live to family and friends worldwide", image: liveStreamingImg },
    { icon: "🎙️", name: "Sound System", desc: "Professional audio equipment for crystal clear sound", image: soundSystemImg },
    { icon: "🎤", name: "MC & Protocol", desc: "Professional MC services to guide your event with style", image: mcProtocolImg },
    { icon: "🌸", name: "Decoration", desc: "Beautiful decorations to transform your venue", image: decorationImg },
    { icon: "🎂", name: "Cake Services", desc: "Stunning custom cakes for weddings, birthdays, and celebrations", image: cakeServicesImg },
    { icon: "🍽️", name: "Catering", desc: "Delicious catering services for all types of events", image: cateringImg },
    { icon: "📸", name: "Photo Booth", desc: "Fun and interactive photo booth for guest entertainment", image: photoBoothImg },
  ];

  const WEDDING_MOMENTS = [
    { name: "DOTE Ceremony", icon: "🪘", desc: "Traditional Rwandan DOTE ceremony captured with cultural authenticity", image: heroImage },
    { name: "Abamararungu Dance", icon: "💃", desc: "Energetic traditional Rwandan Abamararungu dance performance", image: abamararunguImage },
    { name: "Church Wedding",   icon: "⛪", desc: "Beautiful church wedding ceremony with cinematic coverage", image: heroImage },
    { name: "Reception",        icon: "🎉", desc: "Joyous reception celebrations captured with drone and camera", image: ericImage },
  ];

  const QUICK_LINKS = [
    { label: "Videos",   icon: <FaVideo />,   to: "/videos" },
    { label: "Posts",    icon: <FaBookmark />,to: "/posts" },
    { label: "Booking",  icon: <FaCalendar />,to: "/booking" },
    { label: "Creators", icon: <FaStar />,    to: "/creators" },
    { label: "Couples",  icon: <FaHeart />,   to: "/couples" },
    { label: "Contact",  icon: <FaBriefcase />, to: "/contact" },
  ];

  useEffect(() => {
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
          coupleName: v.couple?.user?.name || v.user?.name || "SHINECONNECT",
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
      const response = await getTopCreators();
      if (response.success && response.creators) {
        setTopCreatorsLeaderboard(response.creators.slice(0, 5));
      } else {
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
          ✨ SHINECONNECT
        </div>

        <h1 style={{ fontSize: mobile ? 32 : tablet ? 48 : 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, maxWidth: 900, letterSpacing: "-0.02em", color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          Capture. Connect. Celebrate.
        </h1>

        <p style={{ fontSize: mobile ? 16 : 20, color: "#ffffff", fontWeight: 400, maxWidth: 680, lineHeight: 1.7, marginBottom: 36, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
          Rwanda's premier event media platform — capturing weddings, DOTE ceremonies, birthdays, funerals, and more with cinematic quality across all 30 districts.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {[
            { label: "Book Your Event",     bg: Y,      color: BLK, to: "/booking" },
            { label: "Watch Videos",   bg: "transparent", color: WHT, border: `2px solid ${WHT}`, to: "/videos" },
            { label: "Explore Posts",  bg: "rgba(255,255,255,0.1)", color: WHT, to: "/posts" },
            { label: "Join Platform",  bg: "rgba(255,193,7,0.2)",   color: Y,   border: `1px solid ${Y}`, to: "/register" },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for videos, posts, creators..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: WHT, fontSize: 14, padding: "10px 14px" }} />
          <button type="submit" style={{ background: Y, color: BLK, border: "none", borderRadius: 40, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Search</button>
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
          <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll Down</span>
        </div>
      </section>

      {/* ─── PLATFORM INTRODUCTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK, color: WHT }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: Y }}>About Us</span>
            <h2 style={{ fontSize: mobile ? 28 : 38, fontWeight: 800, margin: "14px 0 20px", lineHeight: 1.2, color: WHT }}>SHINECONNECT by NY Entertainment Rwanda</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 16 }}>
              SHINECONNECT is a digital platform developed and operated by NY Entertainment Rwanda. The platform focuses on connecting users through wedding stories, entertainment content, professional video experiences, event services, and digital content sharing.
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 28 }}>
              The platform allows couples, creators, clients, and communities to share, discover, and celebrate memorable experiences.
            </p>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                ["Events Covered", "500+"],
                ["Happy Clients", "200+"],
                ["Districts", "30"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: Y }}>{value}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[heroImage, abamararunguImage, traditionalImage, ericImage].map((img, i) => (
              <img key={i} src={img} alt="" style={{ width: "100%", height: i % 2 === 0 ? 160 : 120, objectFit: "cover", borderRadius: 14, border: i === 0 ? `2px solid ${Y}` : "none" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEARCH SECTION ─── */}
      <section style={{ padding: mobile ? "40px 20px" : "56px 40px", background: WHT }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: mobile ? 24 : 30, marginBottom: 8, color: BLK }}>Find What You're Looking For</h2>
          <p style={{ color: "#666", marginBottom: 28 }}>Search across videos, posts, creators, couples, and events</p>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 0, background: "#f5f5f5", border: "2px solid #e0e0e0", borderRadius: 50, overflow: "hidden", padding: "4px 4px 4px 20px" }}>
            <FaSearch style={{ alignSelf: "center", color: "#aaa", flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SHINECONNECT..."
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: BLK, fontSize: 15, padding: "12px 14px" }} />
            <button type="submit" style={{ background: Y, color: BLK, border: "none", borderRadius: 40, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Search</button>
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
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUICK ACCESS CARDS ─── */}
      <section style={{ padding: mobile ? "40px 20px" : "56px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>Quick Access</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 32 }}>Jump directly to what matters most</p>
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

      {/* ─── ABAMARARUNGU DANCE SECTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK, color: WHT }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: Y, display: "flex", alignItems: "center", gap: 8 }}>
              <FaDrum /> Cultural Heritage
            </span>
            <h2 style={{ fontSize: mobile ? 28 : 38, fontWeight: 800, margin: "14px 0 20px", lineHeight: 1.2, color: WHT }}>
              {ABAMARARUNGU_DANCE.title}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 24 }}>
              {ABAMARARUNGU_DANCE.description}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {ABAMARARUNGU_DANCE.features.map((feature, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                  <span style={{ color: Y }}>✦</span> {feature}
                </div>
              ))}
            </div>
            <Link to="/booking">
              <button style={{ marginTop: 28, padding: "14px 32px", background: Y, color: BLK, border: "none", borderRadius: 40, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Book Abamararungu Dance
              </button>
            </Link>
          </div>
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <img src={ABAMARARUNGU_DANCE.image} alt="Abamararungu Dance" style={{ width: "100%", height: mobile ? 280 : 400, objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0,0,0,0.7)", padding: "8px 16px", borderRadius: 12, backdropFilter: "blur(8px)" }}>
              <span style={{ color: Y, fontWeight: 700, fontSize: 12 }}>🎵 Traditional Rwandan Dance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROFESSIONAL SERVICES ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>Our Professional Services</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
          Comprehensive event services to make your celebration unforgettable
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
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>Events We Cover</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Professional coverage for all types of events</p>
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
                  {cat.icon} {cat.name}
                </div>
              </div>
              <div style={{ padding: "20px 22px" }}>
                <p style={{ color: "#666", fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>{cat.desc}</p>
                <button onClick={() => navigate(`/booking?type=${cat.id}`)} style={{ width: "100%", padding: "10px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  Book This Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WEDDING MOMENTS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>Wedding Moments</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: 40 }}>Every precious moment of your special day, beautifully captured</p>
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
            <p style={{ color: "#666", fontSize: 14 }}>Most viewed and popular videos on SHINECONNECT</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.2)`, borderRadius: 30, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>View All</button></Link>
        </div>
        {trendingVideos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>No videos yet. Be the first to upload!</div>
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
                    {v.type}
                  </span>
                  {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐ Premium</span>}
                  {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶ Free</span>}
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ color: WHT, fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                  <p style={{ color: "#888", fontSize: 11, marginBottom: 10 }}>{v.coupleName}</p>
                  <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "8px", background: v.isPremium ? "#6c757d" : Y, color: v.isPremium ? WHT : BLK, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.isPremium ? `⭐ Support to Watch` : '▶ Watch Free'}
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
            <h2 style={{ color: WHT, marginBottom: 4 }}>⭐ Featured Videos</h2>
            <p style={{ color: "#666", fontSize: 14 }}>Curated selection of the best videos on SHINECONNECT</p>
          </div>
          <Link to="/videos"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid rgba(255,255,255,0.2)`, borderRadius: 30, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}>View All</button></Link>
        </div>
        
        {loadingVideos ? (
          <div style={{ textAlign: "center", padding: "40px", color: WHT }}>Loading...</div>
        ) : featuredVideos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>No featured videos yet</p>
            <Link to="/register"><button style={{ marginTop: 16, padding: "10px 24px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 600, cursor: "pointer" }}>Join as Creator</button></Link>
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
                    {v.type}
                  </span>
                  {v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#ffc107", color: BLK, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>⭐ Premium</span>}
                  {!v.isPremium && <span style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: WHT, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>▶ Free</span>}
                </div>
                <div style={{ padding: 14 }}>
                  <h4 style={{ color: WHT, fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{v.title || v.coupleName}</h4>
                  <p style={{ color: "#888", fontSize: 11, marginBottom: 10 }}>{v.coupleName}</p>
                  <button onClick={() => handleWatchVideo(v)} style={{ width: "100%", padding: "8px", background: v.isPremium ? "#6c757d" : Y, color: v.isPremium ? WHT : BLK, border: "none", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {v.isPremium ? `⭐ Support to Watch` : '▶ Watch Free'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── STATS SECTION ─── */}
      <section ref={statsRef} style={{ padding: mobile ? "52px 20px" : "72px 40px", background: `linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)` }}>
        <h2 style={{ textAlign: "center", color: WHT, marginBottom: 40 }}>Platform Statistics</h2>
        <div style={{ display: "grid", gridTemplateColumns: g(2, 2, 4), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {STATS.map((stat, idx) => {
            const count = useCountUp(stat.raw, 2000, statsVisible);
            return (
              <div key={idx} style={{ textAlign: "center", padding: "24px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 36, color: Y, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: WHT, marginBottom: 4 }}>{statsVisible ? count.toLocaleString() : "0"}+</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── TOP CREATORS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto 32px", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ color: BLK, marginBottom: 0 }}>🏆 Top Creators</h2>
          <Link to="/creators"><button style={{ padding: "9px 22px", background: Y, color: BLK, border: "none", borderRadius: 30, fontWeight: 600, cursor: "pointer" }}>View All</button></Link>
        </div>
        {loadingCreators ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading...</div>
        ) : topCreatorsLeaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>No creators yet</div>
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
                    <div style={{ fontSize: 13, color: "#888" }}>Views: {creator.totalViews?.toLocaleString() || 0}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
                  <span>📹 {creator.totalProjects || 0} Projects</span>
                  <span>⭐ {creator.rating || 0} Rating</span>
                  <span>🎬 {creator.events || 0} Events</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>How It Works</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Simple steps to book your event with SHINECONNECT</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 5), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {STEPS.map(step => (
            <div key={step.n} style={{ textAlign: "center", padding: 24, background: "#fafafa", borderRadius: 16, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{step.icon}</div>
              <div style={{ fontSize: 12, color: Y, fontWeight: 700, marginBottom: 4 }}>{step.n}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: BLK }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: "#f5f5f5" }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>Why Choose SHINECONNECT?</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>The trusted choice for event coverage in Rwanda</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {WHY_US.map((item, idx) => (
            <div key={idx} style={{ background: WHT, padding: 24, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s", border: "1px solid #ececec" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = Y; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#ececec"; }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: BLK }}>{item.title}</h3>
              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── GALLERY ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>Event Gallery</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: 40 }}>A glimpse into our work across Rwanda</p>
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
          <h2 style={{ color: BLK, marginBottom: 0 }}>📝 Latest Posts</h2>
          <Link to="/posts"><button style={{ padding: "9px 22px", background: "transparent", border: `1.5px solid ${BLK}`, borderRadius: 30, color: BLK, fontSize: 13, cursor: "pointer" }}>View All</button></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          {POSTS.map(post => (
            <div key={post.id} style={{ background: WHT, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}>
              <img src={post.image} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ background: Y, padding: "2px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: BLK }}>{post.cat}</span>
                  <span style={{ fontSize: 11, color: "#999" }}>{post.date}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: BLK, lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 12 }}>{post.excerpt}</p>
                <Link to={`/posts/${post.id}`}><button style={{ padding: "8px 20px", background: BLK, color: WHT, border: "none", borderRadius: 20, fontSize: 13, cursor: "pointer" }}>Read More</button></Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: WHT }}>Client Reviews</h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", marginBottom: 40 }}>What our clients say about their experience</p>
        <div style={{ display: "grid", gridTemplateColumns: g(1, 2, 3), gap: 24, maxWidth: 1000, margin: "0 auto" }}>
          {TESTIMONIALS.map((test, idx) => (
            <div key={idx} style={{ background: "#1a1a1a", padding: 24, borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = Y; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <img src={test.avatar} alt={test.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ color: WHT, fontWeight: 600 }}>{test.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{test.location} • {test.event}</div>
                </div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>"{test.review}"</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ color: i < test.rating ? Y : "#444" }}>★</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: WHT }}>
        <h2 style={{ textAlign: "center", marginBottom: 8, color: BLK }}>Frequently Asked Questions</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}>Find answers to common questions about our services</p>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {FAQS.map((faq, idx) => (
            <div key={idx} style={{ borderBottom: `1px solid #e8e8e8` }}>
              <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} style={{ width: "100%", padding: "18px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, fontWeight: 600, color: BLK }}>
                <span>{faq.q}</span>
                <span style={{ fontSize: 22 }}>{faqOpen === idx ? "−" : "+"}</span>
              </button>
              {faqOpen === idx && <div style={{ padding: "0 12px 18px", color: "#666", fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section style={{ padding: mobile ? "52px 20px" : "72px 40px", background: BLK }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", background: "linear-gradient(135deg, #1a1400 0%, #0d0d0d 100%)", padding: mobile ? "32px 20px" : "48px 40px", borderRadius: 20, border: `1px solid rgba(255,193,7,0.2)` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h2 style={{ fontSize: mobile ? 28 : 36, fontWeight: 800, color: WHT, marginBottom: 12 }}>Ready to Capture Your Moment?</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", maxWidth: 600, margin: "0 auto 28px", fontSize: 16, lineHeight: 1.6 }}>Contact us today to book your event and get a free consultation.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/contact"><button style={{ padding: "14px 32px", background: Y, color: BLK, border: "none", borderRadius: 40, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Contact Us</button></Link>
            <a href="https://wa.me/250780145562" target="_blank" rel="noopener noreferrer">
              <button style={{ padding: "14px 32px", background: "transparent", color: WHT, border: `2px solid #25d366`, borderRadius: 40, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                💬 WhatsApp Us
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}