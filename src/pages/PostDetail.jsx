// src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPostById, getRelatedPosts, incrementPostViews } from "../services/api";

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch post from API
      const response = await getPostById(id);
      
      if (response.success && response.post) {
        const postData = response.post;
        setPost(postData);
        
        // Increment view count
        try {
          await incrementPostViews(postData.id);
        } catch (err) {
          console.error("Error incrementing views:", err);
        }
        
        // Fetch related posts
        if (postData.category) {
          const relatedResponse = await getRelatedPosts(postData.category, postData.id);
          if (relatedResponse.success) {
            setRelatedPosts(relatedResponse.posts || []);
          }
        }
      } else {
        setError("Post not found");
      }
    } catch (err) {
      console.error("Error loading post:", err);
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    announcement: { label: "📢 Announcement", color: "#17a2b8" },
    tips: { label: "💡 Tips & Advice", color: "#28a745" },
    news: { label: "📰 News", color: "#007bff" },
    "featured-couples": { label: "💑 Featured Couple", color: "#ffc107" },
    culture: { label: "🎭 Culture", color: "#6f42c1" },
    wedding: { label: "💍 Wedding", color: "#dc3545" },
    dote: { label: "🪘 DOTE", color: "#fd7e14" },
    events: { label: "🎉 Events", color: "#20c997" }
  };

  const getCategoryInfo = (category) => {
    return categories[category] || { label: category || "General", color: "#6c757d" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-RW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading wedding story...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Post Not Found</h2>
        <p>{error || "The wedding story you're looking for doesn't exist."}</p>
        <Link to="/posts">
          <button style={styles.errorBtn}>Back to Posts</button>
        </Link>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(post.category);
  const authorName = post.user?.name || post.author || "SHINECONNECT";

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <div style={styles.backContainer}>
        <Link to="/posts">
          <button style={styles.backBtn}>← Back to All Posts</button>
        </Link>
      </div>

      {/* Post Header */}
      <div style={styles.header}>
        <span style={{ ...styles.categoryBadge, background: categoryInfo.color }}>
          {categoryInfo.label}
        </span>
        <h1 style={styles.title}>{post.title}</h1>
        <div style={styles.meta}>
          <span>📅 {formatDate(post.createdAt)}</span>
          <span>✍️ {authorName}</span>
          <span>👁️ {post.views || 0} views</span>
          {post.readTime && <span>⏱️ {post.readTime} min read</span>}
        </div>
      </div>

      {/* Featured Image */}
      <div style={styles.imageContainer}>
        <img
          src={post.coverImage || post.image || "https://via.placeholder.com/800x400?text=Wedding+Story"}
          alt={post.title}
          style={styles.featuredImage}
          onError={(e) => { e.target.src = "https://via.placeholder.com/800x400?text=Wedding+Story"; }}
        />
      </div>

      {/* Post Content */}
      <div style={styles.contentContainer}>
        {post.excerpt && (
          <div style={styles.excerpt}>
            <p>{post.excerpt}</p>
          </div>
        )}
        
        <article style={styles.content}>
          {post.content && post.content.split('\n').map((paragraph, idx) => (
            <p key={idx} style={styles.paragraph}>{paragraph}</p>
          ))}
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={styles.tagsSection}>
            <strong>Tags:</strong>
            <div style={styles.tags}>
              {post.tags.map((tag, idx) => (
                <span key={idx} style={styles.tag}>#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div style={styles.shareSection}>
          <h3>Share this story</h3>
          <div style={styles.shareButtons}>
            <button 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`)} 
              style={styles.shareBtn}
            >
              📘 Facebook
            </button>
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${post.title}&url=${window.location.href}`)} 
              style={styles.shareBtn}
            >
              🐦 Twitter
            </button>
            <button 
              onClick={() => window.open(`https://wa.me/?text=${post.title} - ${window.location.href}`)} 
              style={styles.shareBtn}
            >
              💬 WhatsApp
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }} 
              style={styles.shareBtn}
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div style={styles.relatedSection}>
          <h2 style={styles.relatedTitle}>You May Also Like</h2>
          <div style={styles.relatedGrid}>
            {relatedPosts.map(related => (
              <Link key={related.id} to={`/post/${related.id}`} style={styles.relatedCard}>
                <img
                  src={related.coverImage || related.image || "https://via.placeholder.com/300x180?text=Wedding"}
                  alt={related.title}
                  style={styles.relatedImage}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x180?text=Wedding"; }}
                />
                <div style={styles.relatedContent}>
                  <h3 style={styles.relatedPostTitle}>{related.title}</h3>
                  <p style={styles.relatedDate}>{formatDate(related.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Capture Your Love Story?</h2>
        <p style={styles.ctaText}>Book your wedding videography today and preserve your special memories forever.</p>
        <Link to="/booking">
          <button style={styles.ctaBtn}>Book Your Wedding →</button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5", padding: "40px 20px" },
  loadingContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  spinner: { 
    width: "50px", 
    height: "50px", 
    border: "4px solid #ddd", 
    borderTop: "4px solid #ffc107", 
    borderRadius: "50%", 
    animation: "spin 1s linear infinite", 
    marginBottom: "20px" 
  },
  backContainer: { maxWidth: "900px", margin: "0 auto", marginBottom: "20px" },
  backBtn: { padding: "10px 20px", background: "transparent", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  header: { maxWidth: "900px", margin: "0 auto", textAlign: "center", marginBottom: "30px" },
  categoryBadge: { display: "inline-block", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", color: "#fff", marginBottom: "15px" },
  title: { fontSize: "42px", color: "#333", marginBottom: "20px", lineHeight: "1.3" },
  meta: { display: "flex", justifyContent: "center", gap: "25px", color: "#999", fontSize: "14px", flexWrap: "wrap" },
  imageContainer: { maxWidth: "900px", margin: "0 auto", marginBottom: "40px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
  featuredImage: { width: "100%", height: "auto", display: "block" },
  contentContainer: { maxWidth: "800px", margin: "0 auto", background: "#fff", borderRadius: "16px", padding: "40px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  excerpt: { background: "#f8f9fa", padding: "16px 20px", borderRadius: "8px", marginBottom: "24px", borderLeft: "4px solid #ffc107" },
  content: { fontSize: "16px", color: "#444", lineHeight: "1.8" },
  paragraph: { marginBottom: "20px" },
  tagsSection: { marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #eee" },
  tags: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" },
  tag: { background: "#f0f0f0", padding: "4px 12px", borderRadius: "15px", fontSize: "12px", color: "#666" },
  shareSection: { marginTop: "40px", paddingTop: "30px", borderTop: "1px solid #eee", textAlign: "center" },
  shareButtons: { display: "flex", gap: "15px", justifyContent: "center", marginTop: "15px", flexWrap: "wrap" },
  shareBtn: { padding: "8px 20px", background: "#f0f0f0", border: "none", borderRadius: "25px", cursor: "pointer", fontSize: "14px", transition: "background 0.2s" },
  relatedSection: { maxWidth: "900px", margin: "0 auto", marginTop: "50px" },
  relatedTitle: { fontSize: "28px", color: "#333", marginBottom: "25px" },
  relatedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  relatedCard: { background: "#fff", borderRadius: "12px", overflow: "hidden", textDecoration: "none", color: "inherit", transition: "transform 0.3s" },
  relatedImage: { width: "100%", height: "180px", objectFit: "cover" },
  relatedContent: { padding: "15px" },
  relatedPostTitle: { fontSize: "16px", marginBottom: "8px", color: "#333" },
  relatedDate: { fontSize: "12px", color: "#999" },
  ctaSection: { maxWidth: "800px", margin: "0 auto", marginTop: "60px", textAlign: "center", background: "#000", color: "#fff", padding: "50px", borderRadius: "16px" },
  ctaTitle: { fontSize: "28px", marginBottom: "15px" },
  ctaText: { fontSize: "16px", opacity: 0.9, marginBottom: "25px" },
  ctaBtn: { padding: "14px 35px", background: "#ffc107", color: "#000", border: "none", borderRadius: "50px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  errorContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "20px" },
  errorTitle: { fontSize: "28px", color: "#dc3545", marginBottom: "10px" },
  errorBtn: { marginTop: "20px", padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }
};

// Add spin animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default PostDetail;