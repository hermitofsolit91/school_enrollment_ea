import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HeroImage {
  src: string;
  alt: string;
}

const HERO_IMAGES: HeroImage[] = [
  { src: "/7+Cs.webp", alt: "7 Cs Education Framework" },
  { src: "/african-children-school-tanzania-happy.webp", alt: "Happy school children in Tanzania" },
  { src: "/elementary-school-kids-africa-posing.webp", alt: "Elementary school kids in Africa" },
  { src: "/happysmiling-school-children-playing.jpg", alt: "Smiling school children playing" },
  { src: "/hero-kenya-badili-educational-centre.webp", alt: "Kenya Badili Educational Centre" },
];

const GROUP_MEMBERS = [
  { name: "Joel Kidima", role: "Project Lead" },
  { name: "Awori Zaituna", role: "Lead Researcher" },
  { name: "Kibazo Justine", role: "Research" },
  { name: "Nattabi Gloria", role: "Data Research" },
  { name: "Semuwemba Salim", role: "Data Analysis" },
  { name: "Nansereko Angel", role: "Mobilizer" },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number): void => {
    setCurrentIndex(index);
  };

  const handleExploreClick = (): void => {
    navigate("/dashboard");
  };

  return (
    <section id="home" className="hero-section">
      {/* Carousel Container */}
      <div className="hero-carousel">
        {HERO_IMAGES.map((image, idx) => (
          <div
            key={idx}
            className={`hero-slide ${idx === currentIndex ? "active" : ""}`}
          >
            <img src={image.src} alt={image.alt} />
          </div>
        ))}

        {/* Dark Overlay */}
        <div className="hero-overlay" />

        {/* Content */}
        <div className="hero-content-wrapper">
          <div className="hero-main-content">
            <div className="hero-text">
              <h1 className="hero-title">
                School Enrollment & Literacy in East Africa
              </h1>
              <p className="hero-subtitle">
                Data Mining & Business Intelligence Analysis
              </p>
              <p className="hero-meta">
                2010-2023 · 7 East African Countries · World Bank Data
              </p>
              <button className="hero-cta" onClick={handleExploreClick}>
                Explore Dashboard
                <span className="cta-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Project Team Seamless Integration */}
          <div className="hero-team-overlay">
            <div className="team-header-mini">
              <span className="team-line"></span>
              <span className="team-label">PROJECT TEAM</span>
              <span className="team-line"></span>
            </div>
            <div className="team-pills-container">
              {GROUP_MEMBERS.map((member, idx) => (
                <div key={idx} className="team-pill-glass">
                  <div className="pill-avatar">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="pill-info">
                    <span className="pill-name">{member.name}</span>
                    <span className="pill-role">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="hero-dots">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
