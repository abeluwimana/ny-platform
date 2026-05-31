// src/pages/Post.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Post() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load posts from localStorage or use default
    const storedPosts = JSON.parse(localStorage.getItem("wedding_posts") || "[]");
    
    if (storedPosts.length > 0) {
      setPosts(storedPosts);
    } else {
      const samplePosts = [
        { 
          id: 1, 
          title: "Welcome to NY Entertainment Rwanda", 
          content: "We are excited to launch our wedding platform. Now you can watch stunning wedding videos, book your special day, and get premium wedding videography services at affordable prices. Our platform features real couples from across Rwanda, showcasing their beautiful love stories from traditional DOTE ceremonies to church weddings and reception celebrations.", 
          excerpt: "Exciting news! NY Entertainment Rwanda wedding platform is now live...",
          date: "2026-05-18", 
          category: "announcement",
          image: "https://via.placeholder.com/400x250?text=Welcome",
          author: "Admin",
          views: 245,
          featured: true
        },
        { 
          id: 2, 
          title: "Top 10 Tips for Your Perfect Wedding Day", 
          content: "Planning a wedding can be overwhelming. Here are 10 essential tips to make your day perfect. First, start planning early. Second, set a realistic budget. Third, hire professional vendors. Fourth, create a wedding timeline. Fifth, communicate with your partner. Sixth, book your videographer early. Seventh, choose the right venue. Eighth, plan for contingencies. Ninth, stay hydrated and eat well. Tenth, most importantly, enjoy every moment of your special day!", 
          excerpt: "Essential tips to make your wedding day unforgettable...",
          date: "2026-05-17", 
          category: "tips",
          image: "https://via.placeholder.com/400x250?text=Wedding+Tips",
          author: "Admin",
          views: 189,
          featured: false
        },
        { 
          id: 3, 
          title: "Best Wedding Venues in Kigali", 
          content: "Kigali offers stunning wedding venues for every couple. Top venues include Kigali Convention Centre, Serena Hotel, Marriott Hotel, Radisson Blu, and many beautiful outdoor gardens. Each venue offers unique features, from luxury ballrooms to scenic garden views. Prices range from 500,000 to 5,000,000 RWF depending on guest count and services. Book early to secure your dream venue!", 
          excerpt: "Discover the most beautiful wedding venues in Kigali...",
          date: "2026-05-16", 
          category: "news",
          image: "https://via.placeholder.com/400x250?text=Venues",
          author: "Admin",
          views: 312,
          featured: true
        },
        { 
          id: 4, 
          title: "Eric & Diane - A Beautiful Love Story", 
          content: "Eric and Diane met in college and have been together for 5 years. Their traditional DOTE ceremony was filled with joy, laughter, and cultural dances. The church wedding was emotional with heartfelt vows. The reception was a party to remember with amazing music, dancing, and celebrations. Watch their full wedding story on our platform.", 
          excerpt: "Watch the beautiful wedding journey of Eric & Diane...",
          date: "2026-05-15", 
          category: "featured-couples",
          image: "https://via.placeholder.com/400x250?text=Eric+%26+Diane",
          author: "Admin",
          views: 567,
          featured: true
        },
        { 
          id: 5, 
          title: "Traditional DOTE Ceremony Explained", 
          content: "DOTE (Dowry) is a traditional Rwandan ceremony where the groom's family presents gifts to the bride's family. It symbolizes respect, gratitude, and the union of two families. The ceremony includes traditional dances, speeches, and the exchange of gifts including cows, baskets, and other cultural items.", 
          excerpt: "Learn about the beautiful Rwandan traditional DOTE ceremony...",
          date: "2026-05-14", 
          category: "culture",
          image: "https://via.placeholder.com/400x250?text=DOTE",
          author: "Admin",
          views: 234,
          featured: false
        },
        { 
          id: 6, 
          title: "Why Wedding Videography Matters", 
          content: "Photos capture moments, but videos capture emotions. A wedding video allows you to relive your special day for years to come. You can hear your vows, see your loved ones' reactions, and experience the joy again and again. Professional videography is an investment in your memories.", 
          excerpt: "The importance of professional wedding videography...",
          date: "2026-05-13", 
          category: "tips",
          image: "https://via.placeholder.com/400x250?text=Videography",
          author: "Admin",
          views: 178,
          featured: false
        }
      ];
      setPosts(samplePosts);
      localStorage.setItem("wedding_posts", JSON.stringify(samplePosts));
    }
    setLoading(false);
  }, []);

  const categories = [
    { value: "all", label: "All Posts" },
    { value: "announcement", label: "📢 Announcements" },
    { value: "tips", label: "💡 Tips & Advice" },
    { value: "news", label: "📰 News" },
    { value: "featured-couples", label: "💑 Featured Couples" },
    { value: "culture", label: "🎭 Culture" }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = category === "all" || post.category === category;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = posts.filter(post => post.featured);
  const recentPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading amazing wedding stories...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>📝 Wedding Stories & Tips</h1>
        <p style={styles.heroSubtitle}>Discover inspiring wedding stories, expert tips, and latest news</p>
      </div>

      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {/* Search */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>🔍 Search</h3>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Categories */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>📂 Categories</h3>
            <div style={styles.categoryList}>
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    ...styles.categoryBtn,
                    ...(category === cat.value ? styles.categoryBtnActive : {})
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Posts */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>⭐ Featured Posts</h3>
            {featuredPosts.slice(0, 3).map(post => (
              <Link key={post.id} to={`/post/${post.id}`} style={styles.featuredLink}>
                <div style={styles.featuredItem}>
                  <div style={styles.featuredIcon}>⭐</div>
                  <div>
                    <div style={styles.featuredTitle}>{post.title}</div>
                    <div style={styles.featuredDate}>{post.date}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Posts */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>🕐 Recent Posts</h3>
            {recentPosts.map(post => (
              <Link key={post.id} to={`/post/${post.id}`} style={styles.recentLink}>
                <div style={styles.recentItem}>
                  <div style={styles.recentDate}>{post.date}</div>
                  <div style={styles.recentTitle}>{post.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          <div style={styles.categoryHeader}>
            <h2 style={styles.categoryTitle}>
              {categories.find(c => c.value === category)?.label}
            </h2>
            <p style={styles.postCount}>{filteredPosts.length} posts</p>
          </div>

          <div style={styles.grid}>
            {filteredPosts.map(post => (
              <article key={post.id} style={styles.card}>
                <div style={styles.cardImageWrapper}>
                  <img
                    src={post.image || "https://via.placeholder.com/400x250?text=Wedding+Story"}
                    alt={post.title}
                    style={styles.cardImage}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x250?text=Wedding+Story"; }}
                  />
                  <span style={styles.categoryBadge}>
                    {categories.find(c => c.value === post.category)?.label || post.category}
                  </span>
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.cardMeta}>
                    <span>📅 {post.date}</span>
                    <span>👁️ {post.views} views</span>
                    <span>✍️ {post.author}</span>
                  </div>
                  <h2 style={styles.cardTitle}>{post.title}</h2>
                  <p style={styles.cardExcerpt}>{post.excerpt || post.content.substring(0, 120)}...</p>
                  <Link to={`/post/${post.id}`} style={styles.readBtn}>
                    Read Full Story →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div style={styles.noResults}>
              <p>No posts found matching your search.</p>
              <button onClick={() => { setSearchTerm(""); setCategory("all"); }} style={styles.resetBtn}>
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5" },
  loadingContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f5f5f5" },
  spinner: { width: "50px", height: "50px", border: "4px solid #ddd", borderTop: "4px solid #000", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "20px" },
  hero: { background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)", color: "#fff", padding: "60px 20px", textAlign: "center" },
  heroTitle: { fontSize: "42px", marginBottom: "15px", fontWeight: "bold" },
  heroSubtitle: { fontSize: "18px", opacity: 0.9 },
  mainLayout: { maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", display: "flex", gap: "40px", flexWrap: "wrap" },
  sidebar: { flex: "1", minWidth: "280px" },
  mainContent: { flex: "3", minWidth: "300px" },
  sidebarCard: { background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  sidebarTitle: { fontSize: "18px", marginBottom: "15px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  searchInput: { width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" },
  categoryList: { display: "flex", flexWrap: "wrap", gap: "10px" },
  categoryBtn: { padding: "8px 16px", background: "#f0f0f0", border: "none", borderRadius: "25px", cursor: "pointer", fontSize: "13px" },
  categoryBtnActive: { background: "#000", color: "#fff" },
  featuredLink: { textDecoration: "none", display: "block", marginBottom: "12px" },
  featuredItem: { display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#f8f9fa", borderRadius: "8px" },
  featuredIcon: { fontSize: "24px" },
  featuredTitle: { fontSize: "14px", fontWeight: "bold", color: "#333" },
  featuredDate: { fontSize: "11px", color: "#999" },
  recentLink: { textDecoration: "none", display: "block", marginBottom: "12px", padding: "8px 0", borderBottom: "1px solid #eee" },
  recentItem: { display: "flex", flexDirection: "column", gap: "4px" },
  recentDate: { fontSize: "11px", color: "#999" },
  recentTitle: { fontSize: "14px", color: "#333" },
  categoryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" },
  categoryTitle: { fontSize: "24px", color: "#333" },
  postCount: { color: "#666", fontSize: "14px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" },
  card: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "transform 0.3s" },
  cardImageWrapper: { position: "relative", height: "200px", overflow: "hidden" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" },
  categoryBadge: { position: "absolute", top: "15px", left: "15px", background: "#ffc107", color: "#000", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" },
  cardContent: { padding: "20px" },
  cardMeta: { display: "flex", gap: "15px", fontSize: "12px", color: "#999", marginBottom: "12px" },
  cardTitle: { fontSize: "18px", marginBottom: "10px", color: "#333", lineHeight: "1.4" },
  cardExcerpt: { color: "#666", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px" },
  readBtn: { display: "inline-block", padding: "8px 20px", background: "#000", color: "#fff", borderRadius: "25px", textDecoration: "none", fontSize: "13px", fontWeight: "bold", transition: "background 0.3s" },
  noResults: { textAlign: "center", padding: "60px", background: "#fff", borderRadius: "16px" },
  resetBtn: { marginTop: "15px", padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default Post;