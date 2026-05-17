// src/pages/VideoDetailPage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function VideoDetailPage() {
  const { id, type } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [wedding, setWedding] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadWeddingAndVideo();
  }, [id, type]);

  // Function to convert YouTube URL to embed format
  const convertToEmbedUrl = (url) => {
    if (!url) return null;
    
    // If already embed format
    if (url.includes("/embed/")) {
      return url;
    }
    
    // Convert youtu.be format
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert watch?v= format
    if (url.includes("watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    return url;
  };

  const loadWeddingAndVideo = () => {
    setLoading(true);
    setVideoError(false);
    const couples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    console.log("All couples:", couples);
    console.log("Looking for ID:", id);
    
    let foundWedding = couples.find((w) => w.id === id);
    
    if (!foundWedding) {
      foundWedding = couples.find((w) => w.couple === id || w.name === id);
    }
    
    console.log("Found wedding:", foundWedding);
    
    if (foundWedding) {
      setWedding(foundWedding);
      const foundVideo = foundWedding.events?.[type];
      console.log("Found video:", foundVideo);
      
      if (foundVideo && foundVideo.video) {
        // Convert to embed URL if needed
        const embedUrl = convertToEmbedUrl(foundVideo.video);
        setVideo({ ...foundVideo, video: embedUrl });
      } else {
        setVideo(foundVideo);
      }
    }
    
    setLoading(false);
  };

  const handleVideoError = () => {
    console.log("Video failed to load");
    setVideoError(true);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading video...</h2>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Wedding not found</h2>
        <p>The wedding couple you're looking for doesn't exist.</p>
        <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
          ID searched: {id}
        </p>
        <Link to="/">
          <button style={styles.errorBtn}>Go Home</button>
        </Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>Video not found</h2>
        <p>The {type} video for {wedding.couple} is not available yet.</p>
        <Link to={`/wedding/${wedding.id}`}>
          <button style={styles.errorBtn}>Back to Wedding</button>
        </Link>
      </div>
    );
  }

  const otherEvents = Object.entries(wedding.events || {}).filter(([key]) => key !== type);

  // Get the embed URL
  const embedUrl = video.video ? convertToEmbedUrl(video.video) : null;
  const isValidUrl = embedUrl && (embedUrl.includes("youtube.com/embed/") || embedUrl.includes("youtu.be"));

  return (
    <div style={styles.container}>
      <div style={styles.backContainer}>
        <Link to={`/wedding/${wedding.id}`}>
          <button style={styles.backButton}>⬅ Back to Wedding</button>
        </Link>
      </div>

      <div style={styles.titleSection}>
        <h1 style={isMobile ? styles.mobileTitle : styles.title}>
          {wedding.couple || wedding.name}
        </h1>
        <h2 style={isMobile ? styles.mobileSubtitle : styles.subtitle}>
          {video.title || type.toUpperCase()}
        </h2>
      </div>

      {embedUrl && isValidUrl ? (
        <div style={styles.videoWrapper}>
          <div style={styles.videoContainer}>
            {videoError ? (
              <div style={styles.noVideoContainer}>
                <p>⚠️ Video failed to load.</p>
                <p>Please check the video URL or try again later.</p>
                <p style={{ fontSize: "12px", marginTop: "10px" }}>
                  Current URL: {embedUrl}
                </p>
              </div>
            ) : (
              <iframe
                src={embedUrl}
                title="Wedding Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={styles.iframe}
                onError={handleVideoError}
              />
            )}
          </div>
        </div>
      ) : (
        <div style={styles.noVideoContainer}>
          <p>⚠️ Invalid video URL format.</p>
          <p>Please use one of these formats:</p>
          <ul style={{ textAlign: "left", marginTop: "10px" }}>
            <li>https://www.youtube.com/embed/VIDEO_ID</li>
            <li>https://youtu.be/VIDEO_ID</li>
            <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
          </ul>
          <p style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>
            Current URL: {video.video || "No URL provided"}
          </p>
        </div>
      )}

      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>📋 Video Information</h3>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Couple:</span>
            <span style={styles.infoValue}>{wedding.couple || wedding.name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Event Type:</span>
            <span style={styles.infoValue}>{video.title || type.toUpperCase()}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Location:</span>
            <span style={styles.infoValue}>{wedding.location || "Rwanda"}</span>
          </div>
        </div>
      </div>

      {otherEvents.length > 0 && (
        <div style={styles.relatedSection}>
          <h3 style={styles.relatedTitle}>🎬 Other Moments</h3>
          <div style={{
            ...styles.relatedGrid,
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          }}>
            {otherEvents.map(([key, event]) => (
              <Link key={key} to={`/video/${wedding.id}/${key}`} style={styles.relatedLink}>
                <div style={styles.relatedCard}>
                  <div style={styles.relatedIcon}>
                    {key === "dote" && "🪘"}
                    {key === "church" && "⛪"}
                    {key === "reception" && "🎉"}
                  </div>
                  <div style={styles.relatedInfo}>
                    <div style={styles.relatedName}>{event.title || key}</div>
                    <div style={styles.relatedType}>
                      {key === "dote" && "Traditional Ceremony"}
                      {key === "church" && "Church Wedding"}
                      {key === "reception" && "Reception Party"}
                    </div>
                  </div>
                  <div style={styles.relatedArrow}>→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f5f5f5", padding: "40px 20px" },
  loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  backContainer: { maxWidth: "1200px", margin: "0 auto", marginBottom: "20px" },
  backButton: { padding: "10px 24px", borderRadius: "30px", border: "none", background: "#000", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
  titleSection: { textAlign: "center", maxWidth: "900px", margin: "0 auto", marginBottom: "30px" },
  title: { fontSize: "42px", marginBottom: "10px", color: "#333" },
  mobileTitle: { fontSize: "28px", marginBottom: "10px", color: "#333" },
  subtitle: { fontSize: "22px", color: "#666", fontWeight: "normal" },
  mobileSubtitle: { fontSize: "16px", color: "#666", fontWeight: "normal" },
  videoWrapper: { maxWidth: "1000px", margin: "0 auto" },
  videoContainer: { position: "relative", width: "100%", paddingBottom: "56.25%", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
  iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" },
  noVideoContainer: { textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px", maxWidth: "600px", margin: "0 auto" },
  infoSection: { maxWidth: "800px", margin: "0 auto", marginTop: "40px" },
  infoCard: { background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  infoTitle: { fontSize: "18px", marginBottom: "20px", color: "#333", borderLeft: "3px solid #ffc107", paddingLeft: "12px" },
  infoRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #eee" },
  infoLabel: { fontWeight: "bold", color: "#666" },
  infoValue: { color: "#333" },
  relatedSection: { maxWidth: "800px", margin: "0 auto", marginTop: "40px" },
  relatedTitle: { fontSize: "20px", marginBottom: "20px", color: "#333" },
  relatedGrid: { display: "grid", gap: "15px" },
  relatedLink: { textDecoration: "none" },
  relatedCard: { background: "#fff", padding: "15px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "15px", transition: "transform 0.3s", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  relatedIcon: { fontSize: "30px", minWidth: "50px" },
  relatedInfo: { flex: 1 },
  relatedName: { fontSize: "16px", fontWeight: "bold", color: "#333", marginBottom: "4px" },
  relatedType: { fontSize: "13px", color: "#999" },
  relatedArrow: { fontSize: "20px", color: "#ccc" },
  errorContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f5f5f5", textAlign: "center", padding: "20px" },
  errorTitle: { fontSize: "28px", color: "#dc3545", marginBottom: "10px" },
  errorBtn: { marginTop: "20px", padding: "12px 24px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default VideoDetailPage;