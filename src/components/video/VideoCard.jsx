import { Link, useParams } from "react-router-dom";
import { weddings } from "../../data/weddings";

function VideoDetailPage() {
  const { id, type } = useParams();

  const wedding = weddings.find((w) => w.id === id);

  if (!wedding) return <h2>Wedding not found</h2>;

  const video = wedding.events[type];

  if (!video) return <h2>Video not found</h2>;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      
      {/* BACK */}
      <Link to={`/wedding/${id}`}>
        <button
          style={{
            padding: "10px 20px",
            borderRadius: "30px",
            border: "none",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ⬅ Back
        </button>
      </Link>

      <h1 style={{ marginTop: "20px" }}>
        {wedding.couple}
      </h1>

      <h2 style={{ color: "#666" }}>
        {video.title}
      </h2>

      {/* VIDEO PLAYER */}
      <div
        style={{
          marginTop: "30px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <iframe
          width="100%"
          height="450"
          src={video.video}
          title="Wedding Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: "20px" }}
        />
      </div>
    </div>
  );
}

export default VideoDetailPage;