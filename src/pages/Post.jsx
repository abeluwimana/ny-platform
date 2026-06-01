// src/pages/Post.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── CONSTANTS ─────────────────────────────────────────────────────
const Y   = "#ffc107";
const BLK = "#111111";
const WHT = "#ffffff";

const CATEGORIES = [
  { value: "all",           label: "All Posts",           icon: "📋" },
  { value: "wedding",       label: "Weddings",            icon: "💍" },
  { value: "birthday",      label: "Birthday Parties",    icon: "🎂" },
  { value: "graduation",    label: "Graduations",         icon: "🎓" },
  { value: "corporate",     label: "Corporate Events",    icon: "🏢" },
  { value: "funeral",       label: "Funeral Ceremonies",  icon: "🕊️" },
  { value: "dote",          label: "DOTE Ceremonies",     icon: "🪘" },
  { value: "announcement",  label: "Announcements",       icon: "📢" },
  { value: "tips",          label: "Tips & Guides",       icon: "💡" },
  { value: "news",          label: "News",                icon: "📰" },
  { value: "creator",       label: "Creator Showcase",    icon: "🎬" },
  { value: "couple",        label: "Featured Couples",    icon: "💑" },
  { value: "culture",       label: "Culture",             icon: "🎭" },
];

const SORT_OPTIONS = [
  { value: "latest",    label: "Latest" },
  { value: "trending",  label: "Trending" },
  { value: "liked",     label: "Most Liked" },
  { value: "viewed",    label: "Most Viewed" },
];

const HASHTAGS = ["#Wedding","#Birthday","#Graduation","#DOTE","#NYEntertainment","#EventMedia","#Rwanda","#Kigali","#CorporateEvent","#Videography"];

const ROLE_COLORS = {
  admin:   { bg: "#fef9c3", color: "#854d0e",  label: "Admin" },
  creator: { bg: "#dbeafe", color: "#1d4ed8",  label: "Creator" },
  couple:  { bg: "#fce7f3", color: "#9d174d",  label: "Couple" },
  client:  { bg: "#dcfce7", color: "#15803d",  label: "Client" },
};

const SAMPLE_POSTS = [
  { id: 1,  title: "Welcome to NY Entertainment Rwanda",          content: "We are excited to launch our wedding platform...", excerpt: "Exciting news! NY Entertainment Rwanda is now live!", date: "2026-05-18", category: "announcement", image: "https://picsum.photos/seed/post1/600/400",  author: "NY Admin",    authorRole: "admin",   views: 245, likes: 32, saves: 12, comments: 5,  featured: true,  pinned: true,  tags: ["#NYEntertainment","#Rwanda"] },
  { id: 2,  title: "Top 10 Tips for Your Perfect Wedding Day",    content: "Planning a wedding can be overwhelming...",    excerpt: "Essential tips every couple needs to know.",                date: "2026-05-17", category: "tips",         image: "https://picsum.photos/seed/post2/600/400",  author: "Diane Uwase", authorRole: "creator", views: 189, likes: 45, saves: 28, comments: 8,  featured: false, pinned: false, tags: ["#Wedding","#Tips"] },
  { id: 3,  title: "Best Wedding Venues in Kigali 2026",          content: "Kigali offers stunning wedding venues...",        excerpt: "Discover the most beautiful wedding venues in Kigali.",                    date: "2026-05-16", category: "news",         image: "https://picsum.photos/seed/post3/600/400",  author: "NY Admin",    authorRole: "admin",   views: 312, likes: 67, saves: 41, comments: 14, featured: true,  pinned: false, tags: ["#Kigali","#Wedding"] },
  { id: 4,  title: "Eric & Diane — A Beautiful Love Story",       content: "Eric and Diane met in college...",        excerpt: "The wedding journey of Eric & Diane.",                      date: "2026-05-15", category: "couple",       image: "https://picsum.photos/seed/post4/600/400",  author: "Eric Kagabo", authorRole: "couple",  views: 567, likes: 124, saves: 89, comments: 32, featured: true,  pinned: false, tags: ["#Wedding","#Couple"] },
  { id: 5,  title: "Traditional DOTE Ceremony Explained",         content: "DOTE is Rwanda's traditional introduction ceremony...", excerpt: "Learn about Rwanda's beautiful traditional DOTE ceremony.", date: "2026-05-14", category: "dote",         image: "https://picsum.photos/seed/post5/600/400",  author: "NY Admin",    authorRole: "admin",   views: 234, likes: 56, saves: 34, comments: 9,  featured: false, pinned: false, tags: ["#DOTE","#Culture"] },
  { id: 6,  title: "Behind the Lens: Our Camera Gear 2026",       content: "As professional videographers...",        excerpt: "A look at the professional equipment we use.",       date: "2026-05-13", category: "creator",      image: "https://picsum.photos/seed/post6/600/400",  author: "Abel Uwimana",authorRole: "creator", views: 178, likes: 38, saves: 22, comments: 6,  featured: false, pinned: false, tags: ["#Videography","#Creator"] },
  { id: 7,  title: "Kevin's Epic Birthday Celebration",           content: "Kevin's 30th birthday was an unforgettable evening...", excerpt: "Kevin's 30th birthday celebration.", date: "2026-05-12", category: "birthday",     image: "https://picsum.photos/seed/post7/600/400",  author: "NY Admin",    authorRole: "admin",   views: 143, likes: 29, saves: 15, comments: 4,  featured: false, pinned: false, tags: ["#Birthday","#Kigali"] },
  { id: 8,  title: "INES Graduation Ceremony 2026",               content: "Congratulations to all INES graduates!", excerpt: "Capturing the pride and joy of INES University.", date: "2026-05-11", category: "graduation",   image: "https://picsum.photos/seed/post8/600/400",  author: "NY Admin",    authorRole: "admin",   views: 298, likes: 72, saves: 43, comments: 11, featured: true,  pinned: false, tags: ["#Graduation","#Rwanda"] },
];

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

  const [newPost, setNewPost] = useState({
    title: "", content: "", category: "wedding",
    image: "", videoUrl: "", tags: "", location: "",
  });

  const userRole  = localStorage.getItem("user_role")  || "client";
  const userName  = localStorage.getItem("user_name")  || "Guest";
  const userEmail = localStorage.getItem("user_email") || "";
  const isLoggedIn = !!localStorage.getItem("user_logged_in");
  const canPost   = ["admin","creator","couple","client"].includes(userRole);

  // ── LOAD ────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("platform_posts") || "[]");
    const data = stored.length ? stored : SAMPLE_POSTS;
    if (!stored.length) localStorage.setItem("platform_posts", JSON.stringify(SAMPLE_POSTS));
    setPosts(data);
    setLoading(false);
  }, []);

  // ── HELPERS ─────────────────────────────────────────────────────
  const save = (updated) => {
    setPosts(updated);
    localStorage.setItem("platform_posts", JSON.stringify(updated));
  };

  const toggleLike = (id) => {
    if (!isLoggedIn) { toast("Please login to like posts", "#ef4444"); return; }
    save(posts.map(p => p.id === id ? { ...p, likes: (p.likes||0) + (p.likedByMe ? -1 : 1), likedByMe: !p.likedByMe } : p));
  };

  const toggleSave = (id) => {
    if (!isLoggedIn) { toast("Please login to save posts", "#ef4444"); return; }
    save(posts.map(p => p.id === id ? { ...p, saves: (p.saves||0) + (p.savedByMe ? -1 : 1), savedByMe: !p.savedByMe } : p));
    toast("Post saved! ✅");
  };

  const addComment = (id) => {
    const text = (commentText[id]||"").trim();
    if (!text) return;
    if (!isLoggedIn) { toast("Please login to comment", "#ef4444"); return; }
    const comment = { id: Date.now(), author: userName, role: userRole, text, date: new Date().toLocaleDateString() };
    save(posts.map(p => p.id === id ? { ...p, commentsList: [...(p.commentsList||[]), comment], comments: (p.comments||0) + 1 } : p));
    setCommentText({ ...commentText, [id]: "" });
    toast("Comment added!");
  };

  const sharePost = (post, platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${post.title} — NY Entertainment Rwanda`);
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    if (links[platform]) window.open(links[platform], "_blank");
    else { navigator.clipboard.writeText(window.location.href); toast("Link copied! 🔗"); }
  };

  const submitPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) { toast("Title and content are required", "#ef4444"); return; }
    const post = {
      id: Date.now(), ...newPost,
      excerpt: newPost.content.slice(0, 120),
      author: userName, authorRole: userRole,
      date: new Date().toISOString().split("T")[0],
      views: 0, likes: 0, saves: 0, comments: 0,
      featured: false, pinned: false,
      tags: newPost.tags.split(",").map(t => t.trim()).filter(Boolean),
      commentsList: [],
    };
    save([post, ...posts]);
    setNewPost({ title:"", content:"", category:"wedding", image:"", videoUrl:"", tags:"", location:"" });
    setShowCreate(false);
    toast("Post published! 🎉");
  };

  // ── FILTER & SORT ────────────────────────────────────────────────
  let filtered = posts.filter(p => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.content||"").toLowerCase().includes(search.toLowerCase()) || (p.author||"").toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || (p.tags||[]).includes(activeTag);
    return matchCat && matchSearch && matchTag;
  });

  if (sort === "latest")   filtered = [...filtered].sort((a,b) => new Date(b.date) - new Date(a.date));
  if (sort === "trending") filtered = [...filtered].sort((a,b) => (b.views||0) - (a.views||0));
  if (sort === "liked")    filtered = [...filtered].sort((a,b) => (b.likes||0) - (a.likes||0));
  if (sort === "viewed")   filtered = [...filtered].sort((a,b) => (b.views||0) - (a.views||0));

  const pinned   = filtered.filter(p => p.pinned);
  const featured = posts.filter(p => p.featured).slice(0, 4);
  const recent   = [...posts].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f5", flexDirection:"column", gap:16 }}>
      <div style={{ width:48, height:48, border:"4px solid #ddd", borderTop:`4px solid ${Y}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"#888" }}>Loading posts…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

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
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:Y, marginBottom:14, position:"relative" }}>NY Entertainment Rwanda</p>
          <h1 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:900, marginBottom:14, color:WHT, position:"relative", lineHeight:1.1 }}>📝 Posts & Stories</h1>
          <p style={{ fontSize:"clamp(14px,4vw,16px)", color:"rgba(255,255,255,0.75)", maxWidth:600, margin:"0 auto 32px", lineHeight:1.7, position:"relative" }}>
            Wedding stories, event highlights, tips, guides & community updates from creators, couples and clients across Rwanda.
          </p>

          {/* Search */}
          <div style={{ display:"flex", maxWidth:600, margin:"0 auto 24px", background:"rgba(255,255,255,0.1)", backdropFilter:"blur(12px)", border:"1.5px solid rgba(255,255,255,0.2)", borderRadius:50, overflow:"hidden", padding:"4px 4px 4px 20px", position:"relative", flexWrap:"wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts, stories, creators…"
              style={{ flex:1, background:"none", border:"none", outline:"none", color:WHT, fontSize:"clamp(12px,4vw,14px)", padding:"10px 14px", minWidth:"120px" }} />
            {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:18, padding:"0 12px" }}>×</button>}
            <button style={{ background:Y, color:BLK, border:"none", borderRadius:40, padding:"10px 24px", fontWeight:700, fontSize:"clamp(12px,3vw,13px)", cursor:"pointer" }}>Search</button>
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
                ["📋", posts.length,                                        "Posts"],
                ["👁️", posts.reduce((s,p)=>s+(p.views||0),0).toLocaleString(), "Views"],
                ["❤️", posts.reduce((s,p)=>s+(p.likes||0),0),               "Likes"],
                ["💬", posts.reduce((s,p)=>s+(p.comments||0),0),            "Comments"],
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
                {showCreate ? "✕ Cancel" : "+ Create Post"}
              </button>
            )}
          </div>
        </div>

        {/* ── CREATE POST ── */}
        {showCreate && (
          <div style={{ background:"#fff8e1", borderBottom:"2px solid #fde68a", padding:"24px" }}>
            <div style={{ maxWidth:860, margin:"0 auto" }}>
              <h3 style={{ marginBottom:20, fontSize:"clamp(16px,5vw,18px)", fontWeight:700 }}>✍️ Create New Post</h3>
              <div className="create-post-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))", gap:14 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Post Title *</label>
                  <input style={inp} placeholder="Enter a compelling title…" value={newPost.title} onChange={e => setNewPost({...newPost, title:e.target.value})} />
                </div>
                <div>
                  <label style={lbl}>Category *</label>
                  <select style={inp} value={newPost.category} onChange={e => setNewPost({...newPost, category:e.target.value})}>
                    {CATEGORIES.filter(c => c.value !== "all").map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Location (optional)</label>
                  <input style={inp} placeholder="e.g. Kigali, Rwanda" value={newPost.location} onChange={e => setNewPost({...newPost, location:e.target.value})} />
                </div>
                <div>
                  <label style={lbl}>Image URL (optional)</label>
                  <input style={inp} placeholder="https://…" value={newPost.image} onChange={e => setNewPost({...newPost, image:e.target.value})} />
                </div>
                <div>
                  <label style={lbl}>YouTube Video URL (optional)</label>
                  <input style={inp} placeholder="https://youtube.com/…" value={newPost.videoUrl} onChange={e => setNewPost({...newPost, videoUrl:e.target.value})} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Content *</label>
                  <textarea style={{ ...inp, minHeight:120, resize:"vertical" }} placeholder="Write your story, tips or announcement…" value={newPost.content} onChange={e => setNewPost({...newPost, content:e.target.value})} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Tags (comma separated)</label>
                  <input style={inp} placeholder="#Wedding, #Kigali, #NYEntertainment" value={newPost.tags} onChange={e => setNewPost({...newPost, tags:e.target.value})} />
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}>
                <button onClick={submitPost} style={{ padding:"10px 24px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, cursor:"pointer" }}>🚀 Publish Post</button>
                <button onClick={() => setShowCreate(false)} style={{ padding:"10px 24px", background:"#f0f0f0", color:"#555", border:"none", borderRadius:8, cursor:"pointer" }}>Cancel</button>
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
              <div style={sTitle}>📂 Categories</div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {CATEGORIES.map(cat => {
                  const count = cat.value === "all" ? posts.length : posts.filter(p => p.category === cat.value).length;
                  return (
                    <button key={cat.value} className="category-chip"
                      onClick={() => { setCategory(cat.value); setMobileMenuOpen(false); }}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"8px 12px", background: category===cat.value ? Y : "transparent", color: category===cat.value ? BLK : "#555", border:`1px solid ${category===cat.value ? Y : "#ececec"}`, borderRadius:8, cursor:"pointer", fontSize:13, fontWeight: category===cat.value ? 700 : 500, marginBottom:4, transition:"all 0.2s", textAlign:"left" }}>
                      <span>{cat.icon} {cat.label}</span>
                      <span style={{ background: category===cat.value ? "rgba(0,0,0,0.15)" : "#f0f0f0", borderRadius:10, padding:"1px 8px", fontSize:11 }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div style={sCard}>
              <div style={sTitle}>🔀 Sort By</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:6 }}>
                {SORT_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setSort(s.value)}
                    style={{ padding:"7px", background: sort===s.value ? Y : "#f5f5f5", color: sort===s.value ? BLK : "#666", border:"none", borderRadius:6, cursor:"pointer", fontSize:"clamp(11px,3vw,12px)", fontWeight: sort===s.value ? 700 : 500 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div style={sCard}>
              <div style={sTitle}>⭐ Featured Posts</div>
              {featured.map(p => (
                <Link key={p.id} to={`/posts/${p.id}`} style={{ textDecoration:"none", display:"block", marginBottom:10 }} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ display:"flex", gap:10, padding:"8px 10px", background:"#f8f8f8", borderRadius:8, transition:"all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background="#fff8e1"}
                    onMouseLeave={e => e.currentTarget.style.background="#f8f8f8"}>
                    {p.image && <img src={p.image} alt="" style={{ width:44, height:44, borderRadius:6, objectFit:"cover", flexShrink:0 }} />}
                    <div>
                      <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:600, color:BLK, lineHeight:1.3 }}>{p.title.length>50?p.title.slice(0,50)+"…":p.title}</div>
                      <div style={{ fontSize:"clamp(10px,3vw,11px)", color:"#aaa", marginTop:3 }}>❤️ {p.likes} · 👁️ {p.views}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent */}
            <div style={sCard}>
              <div style={sTitle}>🕐 Recent Posts</div>
              {recent.map(p => (
                <Link key={p.id} to={`/posts/${p.id}`} style={{ textDecoration:"none", display:"block", padding:"8px 0", borderBottom:"1px solid #f5f5f5" }} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ fontSize:"clamp(11px,3vw,12px)", color:"#aaa", marginBottom:3 }}>{p.date}</div>
                  <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:600, color:BLK, lineHeight:1.4 }}>{p.title.length>55?p.title.slice(0,55)+"…":p.title}</div>
                </Link>
              ))}
            </div>

            {/* Hashtags */}
            <div style={sCard}>
              <div style={sTitle}>🔖 Popular Tags</div>
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
              <h4 style={{ color:WHT, fontSize:"clamp(14px,4vw,15px)", fontWeight:700, marginBottom:8 }}>Ready to Book?</h4>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"clamp(11px,3vw,12px)", marginBottom:14, lineHeight:1.5 }}>Professional coverage for all events across Rwanda</p>
              <Link to="/booking">
                <button style={{ width:"100%", padding:"10px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, fontSize:"clamp(12px,3.5vw,13px)", cursor:"pointer" }}>Book Now →</button>
              </Link>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main>

            {/* Filter bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontSize:"clamp(16px,5vw,20px)", fontWeight:700 }}>
                  {CATEGORIES.find(c => c.value===category)?.icon} {CATEGORIES.find(c => c.value===category)?.label}
                  {activeTag && <span style={{ fontSize:"clamp(12px,3.5vw,14px)", color:Y, marginLeft:10 }}>{activeTag}</span>}
                </h2>
                <p style={{ fontSize:"clamp(12px,3.5vw,13px)", color:"#888", marginTop:2 }}>{filtered.length} post{filtered.length!==1?"s":""} found</p>
              </div>
              {search && (
                <button onClick={() => { setSearch(""); setCategory("all"); setActiveTag(""); }}
                  style={{ padding:"6px 14px", background:"#f0f0f0", border:"none", borderRadius:20, fontSize:"clamp(11px,3vw,12px)", cursor:"pointer", color:"#555" }}>
                  ✕ Clear filters
                </button>
              )}
            </div>

            {/* Pinned posts */}
            {pinned.length > 0 && (
              <div style={{ background:"#fff8e1", border:"1.5px solid #fde68a", borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start", flexWrap:"wrap" }}>
                <span style={{ fontSize:20 }}>📌</span>
                <div>
                  <div style={{ fontSize:"clamp(11px,3vw,12px)", fontWeight:700, color:"#854d0e", marginBottom:6 }}>PINNED</div>
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
                <h3 style={{ fontSize:"clamp(16px,5vw,18px)", marginBottom:8 }}>No posts found</h3>
                <p style={{ color:"#888", fontSize:"clamp(13px,4vw,14px)", marginBottom:20 }}>Try a different search or category</p>
                <button onClick={() => { setSearch(""); setCategory("all"); setActiveTag(""); }}
                  style={{ padding:"10px 24px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:"clamp(13px,4vw,14px)" }}>
                  Clear Filters
                </button>
              </div>
            )}

            {/* Post grid - Responsive */}
            <div className="post-grid" style={{ display:"grid", gap:20 }}>
              {filtered.map((post, idx) => {
                const catInfo  = CATEGORIES.find(c => c.value === post.category) || CATEGORIES[0];
                const roleInfo = ROLE_COLORS[post.authorRole] || ROLE_COLORS.client;
                const isExpanded = expandedId === post.id;

                return (
                  <article key={post.id} className="post-card"
                    style={{ background:WHT, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.07)", border:"1.5px solid #ececec", transition:"all 0.25s", animationDelay:`${idx*0.05}s` }}>

                    {/* Image */}
                    {post.image && (
                      <div style={{ position:"relative", height:"clamp(180px, 30vw, 200px)", overflow:"hidden" }}>
                        <img src={post.image} alt={post.title} style={{ width:"100%", height:"100%", objectFit:"cover" }}
                          onError={e => e.target.src = `https://picsum.photos/seed/${post.id}/600/400`} />
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%)" }} />
                        <span style={{ position:"absolute", top:12, left:12, background:Y, color:BLK, fontSize:"clamp(9px,3vw,10px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>
                          {catInfo.icon} {catInfo.label}
                        </span>
                        {post.featured && (
                          <span style={{ position:"absolute", top:12, right:12, background:"#7c3aed", color:WHT, fontSize:"clamp(9px,3vw,10px)", fontWeight:700, padding:"3px 10px", borderRadius:20 }}>⭐ Featured</span>
                        )}
                        <span style={{ position:"absolute", bottom:10, right:12, background:"rgba(0,0,0,0.6)", color:WHT, fontSize:"clamp(9px,3vw,10px)", padding:"2px 8px", borderRadius:10 }}>
                          👁️ {post.views||0}
                        </span>
                      </div>
                    )}

                    {/* Video embed */}
                    {post.videoUrl && !post.image && (
                      <div style={{ position:"relative", aspectRatio:"16/9", background:BLK, overflow:"hidden" }}>
                        <iframe src={post.videoUrl.replace("watch?v=","embed/")} width="100%" height="100%" frameBorder="0" allowFullScreen title={post.title} style={{ border:"none" }} />
                      </div>
                    )}

                    <div style={{ padding:"16px 18px" }}>
                      {/* Author */}
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:Y, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:BLK, flexShrink:0 }}>
                          {(post.author||"?")[0].toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:700, color:BLK }}>{post.author}</div>
                          <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:2, flexWrap:"wrap" }}>
                            <span style={{ fontSize:"clamp(9px,3vw,10px)", fontWeight:600, padding:"1px 8px", borderRadius:10, background:roleInfo.bg, color:roleInfo.color }}>{roleInfo.label}</span>
                            {post.location && <span style={{ fontSize:"clamp(9px,3vw,10px)", color:"#aaa" }}>📍 {post.location}</span>}
                          </div>
                        </div>
                        <span style={{ fontSize:"clamp(10px,3vw,11px)", color:"#bbb", flexShrink:0 }}>{post.date}</span>
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
                        <button className="like-btn" onClick={() => toggleLike(post.id)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background: post.likedByMe ? "#fef9c3" : "#f5f5f5", border:"none", borderRadius:20, cursor:"pointer", fontSize:"clamp(11px,3vw,12px)", fontWeight:600, color: post.likedByMe ? "#854d0e" : "#555", transition:"all 0.2s" }}>
                          {post.likedByMe ? "❤️" : "🤍"} {post.likes||0}
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : post.id)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"#f5f5f5", border:"none", borderRadius:20, cursor:"pointer", fontSize:"clamp(11px,3vw,12px)", fontWeight:600, color:"#555" }}>
                          💬 {post.comments||0}
                        </button>
                        <button className="save-btn" onClick={() => toggleSave(post.id)}
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
                              title={`Share on ${s.platform}`}>
                              {s.icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Read more / comments */}
                      <div style={{ marginTop:10, display:"flex", gap:8, alignItems:"center" }}>
                        <Link to={`/posts/${post.id}`} style={{ fontSize:"clamp(11px,3vw,12px)", fontWeight:700, color:Y, textDecoration:"none" }}>
                          Read Full Post →
                        </Link>
                      </div>

                      {/* Comments section */}
                      {isExpanded && (
                        <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid #f5f5f5" }}>
                          <div style={{ fontSize:"clamp(12px,3.5vw,13px)", fontWeight:700, marginBottom:10 }}>💬 Comments ({(post.commentsList||[]).length})</div>
                          {(post.commentsList||[]).map(c => (
                            <div key={c.id} style={{ display:"flex", gap:8, marginBottom:10, padding:"10px 12px", background:"#f8f8f8", borderRadius:10, flexWrap:"wrap" }}>
                              <div style={{ width:28, height:28, borderRadius:"50%", background:Y, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(11px,3vw,12px)", fontWeight:700, flexShrink:0 }}>
                                {c.author[0].toUpperCase()}
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:"clamp(11px,3vw,12px)", fontWeight:700 }}>{c.author} <span style={{ color:"#aaa", fontWeight:400 }}>· {c.date}</span></div>
                                <div style={{ fontSize:"clamp(12px,3.5vw,13px)", color:"#555", marginTop:3 }}>{c.text}</div>
                              </div>
                            </div>
                          ))}
                          {isLoggedIn ? (
                            <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
                              <input value={commentText[post.id]||""} onChange={e => setCommentText({...commentText,[post.id]:e.target.value})}
                                placeholder="Write a comment…" onKeyDown={e => e.key==="Enter" && addComment(post.id)}
                                style={{ flex:1, padding:"8px 12px", border:"1.5px solid #e8e8e8", borderRadius:8, fontSize:"clamp(12px,3.5vw,13px)", outline:"none", minWidth:"150px" }} />
                              <button onClick={() => addComment(post.id)}
                                style={{ padding:"8px 16px", background:Y, color:BLK, border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:"clamp(12px,3.5vw,13px)" }}>Post</button>
                            </div>
                          ) : (
                            <p style={{ fontSize:"clamp(11px,3vw,12px)", color:"#aaa", marginTop:8 }}>
                              <Link to="/login" style={{ color:Y }}>Login</Link> to comment
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