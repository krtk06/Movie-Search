import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowUpRight, Film, Heart, Info, Sun, Moon } from "./PixelIcon";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import MagneticButton from "./MagneticButton";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home", num: "01", icon: Film },
    { to: "/favorites", label: "Collection", num: "02", icon: Heart },
    { to: "/about", label: "About", num: "03", icon: Info },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const avatarLetter = user?.email ? user.email.charAt(0).toUpperCase() : "?";
  const themeLabel = theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-left">
            <span className="nav-link nav-static">
              <span className="num">✦</span> Cinema Curated
            </span>
            <span className="nav-link nav-static">
              <span className="num">N°</span> MMXXVI
            </span>
          </div>

          <Link to="/" className="nav-logo">
            <span className="logo-mark">CM</span>
            <span>
              CINEMART
              <span className="logo-sub">Discover Cinema</span>
            </span>
          </Link>

          <div className="nav-right">
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
                >
                  <span className="num">{link.num}</span> {link.label}
                </Link>
              ))}
            </div>

            <div className="nav-auth">
              {user ? (
                <div className="nav-user-pill">
                  <span className="avatar">{avatarLetter}</span>
                  <span className="nav-user-name">{user.email?.split("@")[0]}</span>
                  <button onClick={handleLogout}>Exit</button>
                </div>
              ) : (
                <MagneticButton
                  strength={0.3}
                  as="button"
                  className="nav-signin"
                  onClick={() => navigate("/login")}
                >
                  <span>Sign In</span>
                  <ArrowUpRight className="w-3.5 h-3.5 arrow" />
                </MagneticButton>
              )}
            </div>

            <button
              className="nav-icon-btn nav-theme-toggle"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              className="nav-icon-btn nav-mobile-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="nav-mobile-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`nav-mobile-backdrop ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        id="nav-mobile-menu"
        className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
      >
        <div className="nav-mobile-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              <span>{link.label}</span>
              <span className="num">{link.num}</span>
            </Link>
          ))}
        </div>

        <div className="nav-mobile-foot">
          <button className="nav-mobile-theme" onClick={toggleTheme}>
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          {user ? (
            <button onClick={handleLogout}>
              <span>Exit · {user.email?.split("@")[0]}</span>
              <span className="num">↗</span>
            </button>
          ) : (
            <button onClick={() => navigate("/login")}>
              <span>Sign In</span>
              <span className="num">↗</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
