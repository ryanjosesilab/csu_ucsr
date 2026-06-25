"use client";
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prefix = pathname === "/" ? "" : "/";

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const handleToggleHover = () => {
    setIsOpen(true);
  };

  const handleToggleLeave = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark fixed-top"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(3, 120, 26, 0.95), rgba(0, 80, 35, 0.93))",
        backdropFilter: "blur(8px)",
      }}
      ref={navRef}
      onMouseLeave={handleToggleLeave}
    >
      <div className="container-fluid">
        <a
          className="navbar-brand"
          href={`${prefix}#home`}
          onClick={handleNavClick}
        >
          <img
            src="/logo3.png"
            alt="CSU Sports Logo"
            style={{ width: "40px", height: "40px" }}
          />
        </a>

        <button
          className="navbar-toggler"
          onMouseEnter={handleToggleHover}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`navbar-collapse ${isOpen ? "show" : "collapse"}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href={`${prefix}#home`}
                onClick={handleNavClick}
              >
                home
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href={`${prefix}#service`}
                onClick={handleNavClick}
              >
                services
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href={`${prefix}#about`}
                onClick={handleNavClick}
              >
                about
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href={`${prefix}#documentation`}
                onClick={handleNavClick}
              >
                documentation
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/forms" onClick={handleNavClick}>
                forms
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
