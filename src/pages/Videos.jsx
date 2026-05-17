import VideoCard from "../components/video/VideoCard";

function Videos() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Eric & Diane Wedding</h1>

      <h2>🪘 DOTE</h2>
      <VideoCard
        title="Traditional Ceremony Highlights"
        image="https://via.placeholder.com/300"
        type="🪘 DOTE"
      />

      <h2 style={{ marginTop: "30px" }}>⛪ Church Wedding</h2>
      <VideoCard
        title="Church Blessing Ceremony"
        image="https://via.placeholder.com/300"
        type="⛪ Church"
      />

      <h2 style={{ marginTop: "30px" }}>🎉 Reception</h2>
      <VideoCard
        title="Reception Party Moments"
        image="https://via.placeholder.com/300"
        type="🎉 Reception"
      />
    </div>
  );
}

export default Videos;