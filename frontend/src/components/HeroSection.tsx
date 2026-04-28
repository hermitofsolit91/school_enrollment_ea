import { useState, useEffect } from "react";

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

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number): void => {
    setCurrentIndex(index);
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
        <div className="hero-content">
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
            <button className="hero-cta">
              Explore Dashboard
              <span className="cta-arrow">→</span>
            </button>
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

        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator">
          <div className="scroll-text">Scroll to explore</div>
          <div className="scroll-icon">↓</div>
        </div>
      </div>
    </section>
  );
}
