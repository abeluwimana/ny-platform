import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ericImage from "../assets/images/eric.jpeg";
import heroImage from "../assets/images/hero.png";
import traditionalImage from "../assets/images/traditional.jpeg";

function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [couples, setCouples] = useState([]);

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
    loadCouples();
  }, []);

  const loadCouples = () => {
    const storedCouples = JSON.parse(localStorage.getItem("wedding_couples") || "[]");
    
    if (storedCouples.length > 0) {
      setCouples(storedCouples);
    } else {
      const defaultCouples = [
        {
          id: "eric-diane",
          couple: "Eric & Diane",
          location: "Kigali",
          image: ericImage,
          events: {}
        },
        {
          id: "john-grace",
          couple: "John & Grace",
          location: "Huye",
          image: traditionalImage,
          events: {}
        },
        {
          id: "patrick-sandra",
          couple: "Patrick & Sandra",
          location: "Rubavu",
          image: heroImage,
          events: {}
        }
      ];
      setCouples(defaultCouples);
      localStorage.setItem("wedding_couples", JSON.stringify(defaultCouples));
    }
  };

  return (
    <div style={{ background: "#f6f6f6", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <section
        style={{
          minHeight: isMobile ? "50vh" : "65vh",
          height: "auto",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          textAlign: "center",
          padding: isMobile ? "40px 20px" : "20px",
        }}
      >
        <div style={{ maxWidth: "90%", width: "100%" }}>
          <h1
            style={{
              fontSize: isMobile ? "28px" : isTablet ? "42px" : "55px",
              marginBottom: "15px",
              lineHeight: "1.2",
              fontWeight: "700"
            }}
          >
            NY Entertainment Rwanda
          </h1>

          <h2
            style={{
              fontSize: isMobile ? "18px" : isTablet ? "24px" : "28px",
              marginBottom: "15px",
              fontWeight: "500"
            }}
          >
            Watch • Explore • Celebrate
          </h2>

          <p
            style={{
              fontSize: isMobile ? "15px" : isTablet ? "17px" : "19px",
              opacity: 0.92,
              maxWidth: "750px",
              margin: "0 auto",
              padding: "0 15px",
              lineHeight: "1.7"
            }}
          >
            Watch stunning wedding films of real couples across Rwanda.
            Browse through authentic DOTE ceremonies, heartfelt church vows, and vibrant 
            reception celebrations. Select your favorite couple, experience their journey, 
            and reserve your own wedding videography at flexible, affordable rates.
          </p>

          <p
            style={{
              fontSize: isMobile ? "16px" : "18px",
              marginTop: "20px",
              color: "#ffc107",
              fontWeight: "500"
            }}
          >
            ✨ Start preserving your love story with us today. ✨
          </p>

          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginTop: "30px" }}>
            <button
              onClick={() => document.getElementById("couples-section")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: isMobile ? "12px 28px" : "14px 38px",
                border: "none",
                borderRadius: "40px",
                background: "#ffc107",
                color: "#000",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "16px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              🎬 Watch Wedding Films
            </button>

            <button
              onClick={() => window.location.href = "/booking"}
              style={{
                padding: isMobile ? "12px 28px" : "14px 38px",
                border: "2px solid #ffc107",
                borderRadius: "40px",
                background: "transparent",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: isMobile ? "14px" : "16px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              📅 Reserve Your Date →
            </button>
          </div>
        </div>
      </section>

      {/* COUPLES SECTION */}
      <section id="couples-section" style={{ padding: isMobile ? "40px 15px" : "60px 20px" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: isMobile ? "28px" : isTablet ? "30px" : "32px",
            marginBottom: "10px",
          }}
        >
          Featured Couples
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: isMobile ? "30px" : "40px",
            fontSize: isMobile ? "14px" : "16px",
            padding: "0 15px",
          }}
        >
          Choose a couple to explore their wedding story
        </p>

        {couples.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p>Loading couples...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
              gap: isMobile ? "20px" : "25px",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: isMobile ? "0 10px" : "0 20px",
            }}
          >
            {couples.map((c) => (
              <Link
                key={c.id}
                to={`/wedding/${c.id}`}
                style={{ textDecoration: "none", color: "#000" }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <img
                      src={c.image || "https://via.placeholder.com/300x200?text=Wedding"}
                      alt={c.couple}
                      style={{
                        width: "100%",
                        height: isMobile ? "180px" : isTablet ? "200px" : "220px",
                        objectFit: "cover",
                        transition: "transform 0.5s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  </div>

                  <div style={{ padding: isMobile ? "15px" : "20px", flex: 1 }}>
                    <h3
                      style={{
                        fontSize: isMobile ? "18px" : "20px",
                        marginBottom: "5px",
                      }}
                    >
                      {c.couple}
                    </h3>
                    <p style={{ color: "#777", fontSize: isMobile ? "13px" : "14px", marginBottom: "15px" }}>
                      📍 {c.location || "Rwanda"}
                    </p>

                    <button
                      style={{
                        width: "100%",
                        padding: isMobile ? "10px" : "12px",
                        border: "none",
                        borderRadius: "30px",
                        background: "#000",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: isMobile ? "13px" : "14px",
                        fontWeight: "bold",
                        transition: "background 0.3s",
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#333"}
                      onMouseLeave={(e) => e.target.style.background = "#000"}
                    >
                      View Wedding →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;