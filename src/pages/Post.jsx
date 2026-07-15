// src/pages/Post.jsx
// SHINECONNECT - Posts Page

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  addComment,
  createPost,
  getAllPosts,
  likePost,
  savePost
} from "../services/api";

// ── CONSTANTS ─────────────────────────────────────────────────────
const Y   = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

const CATEGORIES = [
  { value: "all",           labelKey: "posts.allPosts",           icon: "📋" },
  { value: "wedding",       labelKey: "home.wedding",             icon: "💍" },
  { value: "birthday",      labelKey: "home.birthday",            icon: "🎂" },
  { value: "graduation",    labelKey: "home.graduation",          icon: "🎓" },
  { value: "corporate",     labelKey: "home.corporate",           icon: "🏢" },
  { value: "funeral",       labelKey: "home.funeral",             icon: "🕊️" },
  { value: "dote",          labelKey: "home.dote",                icon: "🪘" },
  { value: "announcement",  labelKey: "common.announcement",      icon: "📢" },
  { value: "tips",          labelKey: "common.tips",              icon: "💡" },
  { value: "news",          labelKey: "posts.news",               icon: "📰" },
  { value: "creator",       labelKey: "posts.creatorShowcase",    icon: "🎬" },
  { value: "couple",        labelKey: "posts.featuredCouples",    icon: "💑" },
  { value: "culture",       labelKey: "posts.culture",            icon: "🎭" },
];

const SORT_OPTIONS = [
  { value: "latest",    labelKey: "posts.latest" },
  { value: "trending",  labelKey: "posts.trending" },
  { value: "liked",     labelKey: "posts.mostLiked" },
  { value: "viewed",    labelKey: "posts.mostViewed" },
];

const HASHTAGS = [
  "#Wedding", "#Birthday", "#Graduation", "#DOTE", 
  "#SHINECONNECT", "#EventMedia", "#Rwanda", "#Kigali", 
  "#CorporateEvent", "#Videography"
];

const ROLE_COLORS = {
  admin:   { bg: "#fef9c3", color: "#854d0e",  labelKey: "admin.admin" },
  creator: { bg: "#dbeafe", color: "#1d4ed8",  labelKey: "creatorDashboard.creator" },
  couple:  { bg: "#fce7f3", color: "#9d174d",  labelKey: "coupleDashboard.couple" },
  client:  { bg: "#dcfce7", color: "#15803d",  labelKey: "clientDashboard.client" },
};

// ── INLINE TOAST ──────────────────────────────────────────────────
const toast = (msg, color = Y) => {
  const el = document.createElement("div");
  el.textContent = msg;
  Object.assign(el.style, {
    position:"fixed", bottom:"24px", right:"24px", zIndex:9999,
    background:BLK, color:WHT, padding:"12px 20px",
    borderRadius:"10px", fontSize:"14px", fontWeight:"600",
    boxShadow:"0 4px 16px rgba(0,0,0,0.25)", borderLeft:`4px solid ${color}`,
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
};

// ── COMPONENT ─────────────────────────────────────────────────────
export default function Post() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [posts,       setPosts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [category,    setCategory]    = useState("all");
  const [sort,        setSort]        = useState("latest");
  const [search,      setSearch]      = useState("");
  const [activeTag,   setActiveTag]   = useState("");
  const [showCreate,  setShowCreate]  = useState(false);
  const [expandedId,  setExpandedId]  = useState(null);
  const [commentText, setCommentText] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  const [newPost, setNewPost] = useState({
    title: "", content: "", category: "wedding",
    image: "", videoUrl: "", tags: "", location: "",
  });

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user_data") || localStorage.getItem("admin_data") || "{}");
  const userRole  = userData.role || "client";
  const userName  = userData.name || "Guest";
  const userEmail = userData.email || "";
  const userId = userData.id || null;
  const isLoggedIn = !!localStorage.getItem("token") || !!localStorage.getItem("admin_token");
  const canPost   = ["ADMIN","CREATOR","COUPLE","CLIENT"].includes(userRole?.toUpperCase());

  // ── LOAD ────────────────────────────────────────────────────────
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPosts(1, 50, {});
      if (response.success) {
        setPosts(response.posts || []);
      } else {
        setError(t('posts.loadError'));
      }
    } catch (err) {
      console.error("Error loading posts:", err);
      setError(t('posts.loadErrorRefresh'));
    } finally {
      setLoading(false);
    }
  };

  // ── HELPERS ─────────────────────────────────────────────────────
  const handleLike = async (id) => {
    if (!isLoggedIn) { toast(t('posts.loginToLike'), "#ef4444"); return; }
    try {
      const response = await likePost(id);
      if (response.success) {
        setPosts(posts.map(p => p.id === id ? { ...p, likes: response.likes, likedByMe: response.liked } : p));
      }
    } catch (err) {
      console.error("Error liking post:", err);
      toast(t('posts.likeError'), "#ef4444");
    }
  };

  const handleSave = async (id) => {
    if (!isLoggedIn) { toast(t('posts.loginToSave'), "#ef4444"); return; }
    try {
      const response = await savePost(id);
      if (response.success) {
        setPosts(posts.map(p => p.id === id ? { ...p, saves: response.saves, savedByMe: response.saved } : p));
        toast(response.saved ? t('posts.saved') : t('posts.unsaved'));
      }
    } catch (err) {
      console.error("Error saving post:", err);
      toast(t('posts.saveError'), "#ef4444");
    }
  };

  const handleAddComment = async (id) => {
    const text = (commentText[id]||"").trim();
    if (!text) return;
    if (!isLoggedIn) { toast(t('posts.loginToComment'), "#ef4444"); return; }
    try {
      const response = await addComment(id, text);
      if (response.success) {
        setPosts(posts.map(p => p.id === id ? { ...p, comments: response.comments, commentsList: response.commentsList } : p));
        setCommentText({ ...commentText, [id]: "" });
        toast(t('posts.commentAdded'));
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast(t('posts.commentError'), "#ef4444");
    }
  };

  const sharePost = (post, platform) => {
    const url = encodeURIComponent(`${window.location.origin}/posts/${post.id}`);
    const text = encodeURIComponent(`${post.title} — SHINECONNECT`);
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    if (links[platform]) window.open(links[platform], "_blank");
    else { navigator.clipboard.writeText(window.location.href); toast(t('posts.linkCopied')); }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) { 
      toast(t('posts.fillRequired'), "#ef4444"); 
      return; 
    }
    
    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        coverImage: newPost.image,
        videoUrl: newPost.videoUrl,
        location: newPost.location,
        tags: newPost.tags.split(",").map(t => t.trim()).filter(Boolean),
        userId: userId
      };
      
      const response = await createPost(postData);
      if (response.success) {
        setPosts([response.post, ...posts]);
        setNewPost({ title:"", content:"", category:"wedding", image:"", videoUrl:"", tags:"", location:"" });
        setShowCreate(false);
        toast(t('posts.published'));
      } else {
        toast(response.message || t('posts.createError'), "#ef4444");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      toast(t('posts.createError'), "#ef4444");
    }
  };

  // ── FILTER & SORT ────────────────────────────────────────────────
  let filtered = posts.filter(p => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || (p.content||"").toLowerCase().includes(search.toLowerCase()) || (p.user?.name||"").toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || (p.tags||[]).includes(activeTag);
    return matchCat && matchSearch && matchTag;
  });

  if (sort === "latest")   filtered = [...filtered].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === "trending") filtered = [...filtered].sort((a,b) => (b.views||0) - (a.views||0));
  if (sort === "liked")    filtered = [...filtered].sort((a,b) => (b.likes||0) - (a.likes||0));
  if (sort === "viewed")   filtered = [...filtered].sort((a,b) => (b.views||0) - (a.views||0));

  const pinned   = filtered.filter(p => p.pinned);
  const featured = posts.filter(p => p.featured).slice(0, 4);
  const recent   = [...posts].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-RW', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryLabel = (catValue) => {
    const found = CATEGORIES.find(c => c.value === catValue);
    return found ? t(found.labelKey) : catValue;
  };

  const getRoleLabel = (role) => {
    const found = Object.values(ROLE_COLORS).find(r => r.labelKey === role || role?.toLowerCase() === r.labelKey?.toLowerCase());
    return found ? t(found.labelKey) : role || "Client";
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f5", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, border:"4px solid #ddd", borderTop:`4px solid ${Y}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"#888" }}>{t('common.loading')}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f5", flexDirection:"column", gap:16, padding:"20px" }}>
        <div style={{ fontSize:48 }}>⚠️</div>
        <h3 style={{ color:"#dc3545" }}>{t('posts.loadError')}</h3>
        <p style={{ color:"#888" }}>{error}</p>
        <button onClick={loadPosts} style={{ padding:"10px 24px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>
          {t('common.retry')}
        </button>
      </div>
    );
  }

  // ── CSS ──────────────────────────────────────────────────────────
  const css = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .post-card { animation: fadeIn 0.35s ease both; }
    .post-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important; }
    .post-card img { transition: transform 0.4s; }
    .post-card:hover img { transform: scale(1.04); }
    .like-btn:hover { background: #fef9c3 !important; }
    .save-btn:hover { background: #dbeafe !important; }
    .tag-pill:hover { background: ${Y} !important; color: ${BLK} !important; cursor:pointer; }
    .category-chip:hover { border-color: ${Y} !important; color: ${BLK} !important; }
    input:focus, textarea:focus, select:focus { border-color: ${Y} !important; box-shadow: 0 0 0 3px rgba(255,193,7,0.15) !important; outline:none; }
    
    /* Responsive Styles */
    @media (max-width: 768px) {
      .main-grid { grid-template-columns: 1fr !important; }
      .sidebar { display: ${mobileMenuOpen ? 'block' : 'none'} !important; position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 1000 !important; background: white !important; overflow-y: auto !important; padding: 20px !important; }
      .mobile-menu-btn { display: flex !important; }
      .stats-bar { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
      .post-grid { grid-template-columns: 1fr !important; }
      .hero-buttons { flex-direction: column !important; align-items: stretch !important; }
      .hero-buttons button { width: 100% !important; }
      .hashtags { justify-content: center !important; }
      .create-post-grid { grid-template-columns: 1fr !important; }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      .post-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    
    @media (min-width: 1025px) {
      .post-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }
    
    .mobile-menu-btn { display: none; position: fixed; bottom: 20px; right: 20px; background: ${Y}; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 24px; cursor: pointer; z-index: 1001; box-shadow: 0 4px 12px rgba(0,0,0,0.15); align-items: center; justify-content: center; }
    .close-sidebar { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ background:"#f5f5f5", minHeight:"100vh", fontFamily:"system-ui,sans-serif", color:BLK }}>

        {/* Mobile Menu Toggle Button */}
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* ── HERO ── */}
        <div style={{ background:`linear-gradient(160deg, ${BLK} 0%, #1a1400 100%)`, color:WHT, padding:"60px 24px 52px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 110%, rgba(255,193,7,0.15) 0%, transparent 70%)", pointerEvents:"none" }} />
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:Y, marginBottom:14, position:"relative" }}>✨ SHINECONNECT</p>
          <h1 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:900, marginBottom:14, color:WHT, position:"relative", lineHeight:1.1 }}>📝 {t('posts.title')}</h1>
          <p style={{ fontSize:"clamp(14px,4vw,16px)", color:"rgba(255,255,255,0.75)", maxWidth:600, margin:"0 auto 32px", lineHeight:1.7, position:"relative" }}>
            {t('posts.subtitle')}
          </p>

          {/* Search */}
          <div style={{ display:"flex", maxWidth:600, margin:"0 auto 24px", background:"rgba(255,255,255,0.1)", backdropFilter:"blur(12px)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:50, overflow:"hidden", padding:"4px 4px 4px 20px", position:"relative", flexWrap:"wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('posts.searchPlaceholder')}
              style={{ flex:1, background:"none", border:"none", outline:"none", color:WHT, fontSize:"clamp(12px,4vw,14px)", padding:"10px 14px", minWidth:"120px" }} />
            {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:18, padding:"0 12px" }}>×</button>}
            <button style={{ background:Y, color:BLK, border:"none", borderRadius:40, padding:"10px 24px", fontWeight:700, fontSize:"clamp(12px,3vw,13px)", cursor:"pointer" }}>{t('common.search')}</button>
          </div>

          {/* Hashtag pills */}
          <div className="hashtags" style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", position:"relative" }}>
            {HASHTAGS.map(tag => (
              <span key={tag} className="tag-pill"
                onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                style={{ padding:"5px 14px", background: activeTag===tag ? Y : "rgba(255,255,255,0.1)", color: activeTag===tag ? BLK : "rgba(255,255,255,0.75)", borderRadius:20, fontSize:"clamp(10px,3vw,12px)", fontWeight:600, border: activeTag===tag ? "none" : "1px solid rgba(255,255,255,0.15)", transition:"all 0.2s", cursor:"pointer" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="stats-bar" style={{ background:WHT, borderBottom:"1px solid #ececec", padding:"14px 24px" }}>
          <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", gap:28, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:"clamp(12px,4vw,24px)", flexWrap:"wrap" }}>
              {[
                ["📋", posts.length,                                        t('posts.posts')],
                ["👁️", posts.reduce((s,p)=>s+(p.views||0),0).toLocaleString(), t('posts.views')],
                ["❤️", posts.reduce((s,p)=>s+(p.likes||0),0),               t('posts.likes')],
                ["💬", posts.reduce((s,p)=>s+(p.comments||0),0),            t('posts.comments')],
              ].map(([icon,val,label]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"clamp(11px,3vw,13px)" }}>
                  <span>{icon}</span>
                  <strong>{val}</strong>
                  <span style={{ color:"#aaa" }}>{label}</span>
                </div>
              ))}
            </div>
            {canPost && isLoggedIn && (
              <button onClick={() => setShowCreate(!showCreate)}
                style={{ padding:"9px 22px", background: showCreate ? "#f0f0f0" : Y, color: showCreate ? "#555" : BLK, border:"none", borderRadius:8, fontWeight:700, fontSize:"clamp(11px,3vw,13px)", cursor:"pointer" }}>
                {showCreate ? "✕ " + t('common.cancel') : "+ " + t('posts.createPost')}
              </button>
            )}
          </div>
        </div>

        {/* ── CREATE POST ── */}
        {showCreate && (
          <div style={{ background:"#fff8e1", borderBottom:"2px solid #fde68a", padding:"24px" }}>
            <div style={{ maxWidth:860, margin:"0 auto" }}>
              <h3 style={{ marginBottom:20, fontSize:"clamp(16px,5vw,18px)", fontWeight:700 }}>✍️ {t('posts.createNewPost')}</h3>
              <div className="create-post-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:14 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>{t('posts.postTitle')} *</label>
                  <input style={inp} placeholder={t('posts.titlePlaceholder')} value={newPost.title} onChange={e => setNewPost({...newPost, title:e.target.value})} />
                </div>
                <div>
                  <label style={lbl}>{t('posts.category')} *</label>
                  <select style={inp} value={newPost.category} onChange={e => setNewPost({...newPost, category:e.target.value})}>
                    {CATEGORIES.filter(c => c.value !== "all").map(c => <option key={c.value} value={c.value}>{c.icon} {getCategoryLabel(c.value)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>{t('posts.location')}</label>
                  <input style={inp} placeholder="e.g. Kigali, Rwanda" value={newPost.location} onChange={e => setNewPost({...newPost, location:e.target.value})} />
                </div>
                <div>
                  <label style={lbl}>{t('posts.imageUrl')}</label>
                  <input style={inp} placeholder="https://…" value={newPost.image} onChange={e => setNewPost({...newPost, image:e.target.value})} />
                </div>
                <div>
                  <label style={lbl}>{t('posts.videoUrl')}</label>
                  <input style={inp} placeholder="https://youtube.com/…" value={newPost.videoUrl} onChange={e => setNewPost({...newPost, videoUrl:e.target.value})} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>{t('posts.content')} *</label>
                  <textarea style={{ ...inp, minHeight:120, resize:"vertical" }} placeholder={t('posts.contentPlaceholder')} value={newPost.content} onChange={e => setNewPost({...newPost, content:e.target.value})} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>{t('posts.tags')}</label>
                  <input style={inp} placeholder="#Wedding, #Kigali, #SHINECONNECT" value={newPost.tags} onChange={e => setNewPost({...newPost, tags:e.target.value})} />
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}>
                <button onClick={handleCreatePost} style={{ padding:"10px 24px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>🚀 {t('posts.publish')}</button>
                <button onClick={() => setShowCreate(false)} style={{ padding:"10px 24px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:8, cursor:"pointer" }}>{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN GRID (Responsive) ── */}
        <div className="main-grid" style={{ maxWidth:1400, margin:"0 auto", padding:"32px 20px", display:"grid", gridTemplateColumns:"minmax(250px, 280px) 1fr", gap:28, alignItems:"start" }}>

          {/* ── SIDEBAR (Mobile responsive) ── */}
          <aside className="sidebar" style={{ display:"flex", flexDirection:"column", gap:18, position:"sticky", top:20 }}>
            <button className="close-sidebar" onClick={() => setMobileMenuOpen(false)} style={{ display: 'none' }}>✕</button>
            
            {/* Categories */}
            <div style={sCard}>
              <div style={sTitle}>📂 {t('posts.categories')}</div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {CATEGORIES.map(cat => {
                  const count = cat.value === "all" ? posts.length : posts.filter(p => p.category === cat.value).length;
                  return (
                    <button key={cat.value} className="category-chip"
                      onClick={() => { setCategory(cat.value); setMobileMenuOpen(false); }}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"8px 12px", background: category===cat.value ? Y : "transparent", color: category===cat.value ? BLK : "#555", border:`1px solid ${category===cat.value ? Y : "#ececec"}`, borderRadius:8, cursor:"pointer", fontSize:13, fontWeight: category===cat.value ? 700 : 500, marginBottom:4, transition:"all 0.2s", textAlign:"left" }}>
                      <span>{cat.icon} {getCategoryLabel(cat.value)}</span>
                      <span style={{ background: category===cat.value ? "rgba(0,0,0,0.15)" : "#f0f0f0", borderRadius:10, padding:"1px 8px", fontSize:11 }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div style={sCard}>
              <div style={sTitle}>🔀 {t('posts.sortBy')}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:6 }}>
                {SORT_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setSort(s.value)}
                    style={{ padding:"7px", background: sort===s.value ? Y : "#f5f5f5", color: sort===s.value ? BLK : "#666", border:"none", borderRadius:6, cursor:"pointer", fontSize:"clamp(11px,3vw,12px)", fontWeight: sort===s.value ? 700 : 500 }}>
                    {t(s.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div style={sCard}>
              <div style={sTitle}>⭐ {t('posts.featured')}</div>
              {featured.map(p => (
                <Link key={p.id} to={`/posts/${p.id}`} style={{ textDecoration:"none", display:"block", marginBottom:10 }} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ display:"flex", gap:10, padding:"8px 10px", background:"#f8f8f8", borderRadius:8, transition:"all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background="#fff8e1"}
                    onMouseLeave={e => e.currentTarget.style.background="#f8f8f8"}>
                    {p.coverImage && <img src={p.coverImage} alt="" style={{ width:44, height:44, borderRadius:6, objectFit:"cover", flexShrink:0 }} />}
                    <div>
                      <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:600, color:BLK, lineHeight:1.3 }}>{p.title?.length>50?p.title.slice(0,50)+"…":p.title}</div>
                      <div style={{ fontSize:"clamp(10px,3vw,11px)", color:"#aaa", marginTop:3 }}>❤️ {p.likes} · 👁️ {p.views}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent */}
            <div style={sCard}>
              <div style={sTitle}>🕐 {t('posts.recent')}</div>
              {recent.map(p => (
                <Link key={p.id} to={`/posts/${p.id}`} style={{ textDecoration:"none", display:"block", padding:"8px 0", borderBottom:"1px solid #f5f5f5" }} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ fontSize:"clamp(11px,3vw,12px)", color:"#aaa", marginBottom:3 }}>{formatDate(p.createdAt)}</div>
                  <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:600, color:BLK, lineHeight:1.4 }}>{p.title?.length>55?p.title.slice(0,55)+"…":p.title}</div>
                </Link>
              ))}
            </div>

            {/* Hashtags */}
            <div style={sCard}>
              <div style={sTitle}>🔖 {t('posts.popularTags')}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {HASHTAGS.map(tag => (
                  <span key={tag} className="tag-pill"
                    onClick={() => { setActiveTag(activeTag===tag?"":tag); setMobileMenuOpen(false); }}
                    style={{ padding:"4px 12px", background: activeTag===tag ? Y : "#f0f0f0", color: activeTag===tag ? BLK : "#555", borderRadius:20, fontSize:"clamp(11px,3vw,12px)", fontWeight:600, transition:"all 0.2s", cursor:"pointer" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Book CTA */}
            <div style={{ background:`linear-gradient(135deg, ${BLK} 0%, #1a1400 100%)`, borderRadius:14, padding:"22px 18px", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>📅</div>
              <h4 style={{ color:WHT, fontSize:"clamp(14px,4vw,15px)", fontWeight:700, marginBottom:8 }}>{t('posts.readyToBook')}</h4>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"clamp(11px,3vw,12px)", marginBottom:14, lineHeight:1.5 }}>{t('posts.readyToBookDesc')}</p>
              <Link to="/booking">
                <button style={{ width:"100%", padding:"10px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, fontSize:"clamp(12px,3.5vw,13px)", cursor:"pointer" }}>{t('posts.bookNow')} →</button>
              </Link>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main>

            {/* Filter bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontSize:"clamp(16px,5vw,20px)", fontWeight:700 }}>
                  {CATEGORIES.find(c => c.value===category)?.icon} {getCategoryLabel(category)}
                  {activeTag && <span style={{ fontSize:"clamp(12px,3.5vw,14px)", color:Y, marginLeft:10 }}>{activeTag}</span>}
                </h2>
                <p style={{ fontSize:"clamp(12px,3.5vw,13px)", color:"#888", marginTop:2 }}>{filtered.length} {t('posts.postsFound')}</p>
              </div>
              {(search || category !== "all") && (
                <button onClick={() => { setSearch(""); setCategory("all"); setActiveTag(""); }}
                  style={{ padding:"6px 14px", background:"#f0f0f0", border:"none", borderRadius:20, fontSize:"clamp(11px,3vw,12px)", cursor:"pointer", color:"#555" }}>
                  ✕ {t('posts.clearFilters')}
                </button>
              )}
            </div>

            {/* Pinned posts */}
            {pinned.length > 0 && (
              <div style={{ background:"#fff8e1", border:"1.5px solid #fde68a", borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start", flexWrap:"wrap" }}>
                <span style={{ fontSize:20 }}>📌</span>
                <div>
                  <div style={{ fontSize:"clamp(11px,3vw,12px)", fontWeight:700, color:"#854d0e", marginBottom:6 }}>{t('posts.pinned')}</div>
                  {pinned.map(p => (
                    <Link key={p.id} to={`/posts/${p.id}`} style={{ textDecoration:"none", display:"block", fontSize:"clamp(13px,4vw,14px)", fontWeight:600, color:BLK, marginBottom:4 }}>{p.title}</Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {filtered.length === 0 && (
              <div style={{ background:WHT, borderRadius:16, padding:"60px 24px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
                <h3 style={{ fontSize:"clamp(16px,5vw,18px)", marginBottom:8 }}>{t('posts.noPostsFound')}</h3>
                <p style={{ color:"#888", fontSize:"clamp(13px,4vw,14px)", marginBottom:20 }}>{t('posts.tryAdjusting')}</p>
                <button onClick={() => { setSearch(""); setCategory("all"); setActiveTag(""); }}
                  style={{ padding:"10px 24px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:"clamp(13px,4vw,14px)" }}>
                  {t('posts.clearFilters')}
                </button>
              </div>
            )}

            {/* Post grid - Responsive */}
            <div className="post-grid" style={{ display:"grid", gap:20 }}>
              {filtered.map((post, idx) => {
                const catInfo  = CATEGORIES.find(c => c.value === post.category) || CATEGORIES[0];
                const roleInfo = ROLE_COLORS[post.user?.role?.toLowerCase()] || ROLE_COLORS.client;
                const isExpanded = expandedId === post.id;
                const authorName = post.user?.name || post.author || "NY Entertainment";
                const authorRole = post.user?.role || post.authorRole || "client";

                return (
                  <article key={post.id} className="post-card"
                    style={{ background:WHT, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", border:"1.5px solid #ececec", transition:"all 0.25s", animationDelay:`${idx*0.05}s` }}>

                    {/* Image */}
                    {post.coverImage && (
                      <div style={{ position:"relative", height:"clamp(180px, 30vw, 200px)", overflow:"hidden" }}>
                        <img src={post.coverImage} alt={post.title} style={{ width:"100%", height:"100%", objectFit:"cover" }}
                          onError={e => e.target.src = `https://picsum.photos/seed/${post.id}/600/400`} />
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%)" }} />
                        <span style={{ position:"absolute", top:12, left:12, background:Y, color:BLK, fontSize:"clamp(9px,3vw,10px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                          {catInfo.icon} {getCategoryLabel(catInfo.value)}
                        </span>
                        {post.featured && (
                          <span style={{ position:"absolute", top:12, right:12, background:"#7c3aed", color:WHT, fontSize:"clamp(9px,3vw,10px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>⭐ {t('posts.featured')}</span>
                        )}
                        <span style={{ position:"absolute", bottom:10, right:12, background:"rgba(0,0,0,0.6)", color:WHT, fontSize:"clamp(9px,3vw,10px)", padding:"2px 8px", borderRadius:10 }}>
                          👁️ {post.views||0}
                        </span>
                      </div>
                    )}

                    {/* Video embed */}
                    {post.videoUrl && !post.coverImage && (
                      <div style={{ position:"relative", aspectRatio:"16/9", background:BLK, overflow:"hidden" }}>
                        <iframe src={post.videoUrl.replace("watch?v=","embed/")} width="100%" height="100%" frameBorder="0" allowFullScreen title={post.title} style={{ border:"none" }} />
                      </div>
                    )}

                    <div style={{ padding:"16px 18px" }}>
                      {/* Author */}
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:Y, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:BLK, flexShrink:0 }}>
                          {authorName[0]?.toUpperCase() || "?"}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:700, color:BLK }}>{authorName}</div>
                          <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:2, flexWrap:"wrap" }}>
                            <span style={{ fontSize:"clamp(9px,3vw,10px)", fontWeight:600, padding:"1px 8px", borderRadius:10, background:roleInfo.bg, color:roleInfo.color }}>{getRoleLabel(authorRole)}</span>
                            {post.location && <span style={{ fontSize:"clamp(9px,3vw,10px)", color:"#aaa" }}>📍 {post.location}</span>}
                          </div>
                        </div>
                        <span style={{ fontSize:"clamp(10px,3vw,11px)", color:"#bbb", flexShrink:0 }}>{formatDate(post.createdAt)}</span>
                      </div>

                      {/* Title & excerpt */}
                      <h2 style={{ fontSize:"clamp(15px,4.5vw,16px)", fontWeight:700, marginBottom:8, color:BLK, lineHeight:1.4 }}>{post.title}</h2>
                      <p style={{ fontSize:"clamp(12px,3.5vw,13px)", color:"#666", lineHeight:1.65, marginBottom:12 }}>
                        {isExpanded ? post.content : (post.excerpt || post.content?.slice(0,120)+"…")}
                      </p>

                      {/* Tags */}
                      {(post.tags||[]).length > 0 && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                          {(post.tags||[]).map(tag => (
                            <span key={tag} className="tag-pill"
                              onClick={() => setActiveTag(activeTag===tag?"":tag)}
                              style={{ padding:"2px 10px", background:"#f0f0f0", color:"#666", borderRadius:20, fontSize:"clamp(10px,3vw,11px)", fontWeight:600, transition:"all 0.2s", cursor:"pointer" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display:"flex", alignItems:"center", gap:6, paddingTop:12, borderTop:"1px solid #f5f5f5", flexWrap:"wrap" }}>
                        <button className="like-btn" onClick={() => handleLike(post.id)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background: post.likedByMe ? "#fef9c3" : "#f5f5f5", border:"none", borderRadius:20, cursor:"pointer", fontSize:"clamp(11px,3vw,12px)", fontWeight:600, color: post.likedByMe ? "#854d0e" : "#555", transition:"all 0.2s" }}>
                          {post.likedByMe ? "❤️" : "🤍"} {post.likes||0}
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : post.id)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"#f5f5f5", border:"none", borderRadius:20, cursor:"pointer", fontSize:"clamp(11px,3vw,12px)", fontWeight:600, color:"#555" }}>
                          💬 {post.comments||0}
                        </button>
                        <button className="save-btn" onClick={() => handleSave(post.id)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background: post.savedByMe ? "#dbeafe" : "#f5f5f5", border:"none", borderRadius:20, cursor:"pointer", fontSize:"clamp(11px,3vw,12px)", fontWeight:600, color: post.savedByMe ? "#1d4ed8" : "#555", transition:"all 0.2s" }}>
                          {post.savedByMe ? "🔖" : "📑"} {post.saves||0}
                        </button>
                        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
                          {[
                            { icon:"💬", platform:"whatsapp", color:"#25d366" },
                            { icon:"🌐", platform:"facebook", color:"#1877f2" },
                            { icon:"🔗", platform:"copy",     color:"#888" },
                          ].map(s => (
                            <button key={s.platform} onClick={() => sharePost(post, s.platform)}
                              style={{ padding:"5px 8px", background:"#f5f5f5", border:"none", borderRadius:8, cursor:"pointer", fontSize:"clamp(11px,3vw,13px)", transition:"all 0.2s" }}
                              title={t('posts.shareOn') + " " + s.platform}>
                              {s.icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Read more */}
                      <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                        <Link to={`/posts/${post.id}`} style={{ fontSize:"clamp(11px,3vw,12px)", fontWeight:700, color:Y, textDecoration:"none" }}>
                          {t('posts.readFullPost')} →
                        </Link>
                      </div>

                      {/* Comments section */}
                      {isExpanded && (
                        <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid #f5f5f5" }}>
                          <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:700, marginBottom:10 }}>💬 {t('posts.comments')} ({(post.commentsList||[]).length})</div>
                          {(post.commentsList||[]).map(c => (
                            <div key={c.id} style={{ display:"flex", gap:8, marginBottom:10, padding:"10px 12px", background:"#f8f8f8", borderRadius:10, flexWrap:"wrap" }}>
                              <div style={{ width:28, height:28, borderRadius:"50%", background:Y, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(11px,3vw,12px)", fontWeight:700, flexShrink:0 }}>
                                {c.author?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:"clamp(11px,3vw,12px)", fontWeight:700 }}>{c.author} <span style={{ color:"#aaa", fontWeight:400 }}>· {formatDate(c.createdAt)}</span></div>
                                <div style={{ fontSize:"clamp(12px,3.5vw,13px)", color:"#555", marginTop:3 }}>{c.content}</div>
                              </div>
                            </div>
                          ))}
                          {isLoggedIn ? (
                            <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                              <input value={commentText[post.id]||""} onChange={e => setCommentText({...commentText,[post.id]:e.target.value})}
                                placeholder={t('posts.writeComment')} onKeyDown={e => e.key==="Enter" && handleAddComment(post.id)}
                                style={{ flex:1, padding:"8px 12px", border:"1.5px solid #e8e8e8", borderRadius:8, fontSize:"clamp(12px,3.5vw,13px)", outline:"none", minWidth:"150px" }} />
                              <button onClick={() => handleAddComment(post.id)}
                                style={{ padding:"8px 16px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:"clamp(12px,3.5vw,13px)" }}>{t('posts.postComment')}</button>
                            </div>
                          ) : (
                            <p style={{ fontSize:"clamp(11px,3vw,12px)", color:"#aaa", marginTop:8 }}>
                              <Link to="/login" style={{ color:Y }}>{t('posts.loginToComment')}</Link>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ── SHARED MINI STYLES ─────────────────────────────────────────────
const sCard  = { background: WHT, borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #ececec" };
const sTitle = { fontSize: "clamp(13px,4vw,14px)", fontWeight: 700, color: BLK, marginBottom: 14, paddingLeft: 10, borderLeft: `3px solid ${Y}` };
const lbl    = { fontSize: "clamp(11px,3vw,12px)", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6, marginTop: 12 };
const inp    = { width: "100%", padding: "10px 12px", border: "1.5px solid #e8e8e8", borderRadius: 8, fontSize: "clamp(13px,4vw,14px)", fontFamily: "inherit", background: WHT, color: BLK, boxSizing: "border-box", outline: "none" };