import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

interface NavLink {
  label: string;
  href: string;
  isRoute?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = (): void => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Project Header */}
      <div className="project-header">
        <div className="container-max">
          <div className="header-content">
            <h2 className="header-title">School Enrollment & Literacy in East Africa</h2>
            <p className="header-subtitle">
              Data Mining &amp; Business Intelligence Analysis · 2010-2023 · 7 Countries · World Bank Data
            </p>

          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="container-max">
          <div className="navbar-inner">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <img src="/logo.webp" alt="EduData EA" className="logo-img" style={{borderRadius:'6px',objectFit:'cover'}} />
              <div className="logo-text">
                <div className="logo-name">EduData EA</div>
                <div className="logo-sub">SCI-CITS · Nkumba University</div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="nav-links-desktop">
              {NAV_LINKS.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="nav-link"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="nav-link"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="container-max">
              {NAV_LINKS.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="mobile-nav-link"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="mobile-nav-link"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
