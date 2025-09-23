"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import "./NavigationBar.css";

interface NavigationBarProps {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ className = "" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Start transitioning when user scrolls more than 50px
      const scrolled = scrollPosition > 50;
      setIsScrolled(scrolled);

      // Add/remove scrolled class to body for spacing
      if (scrolled) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("scrolled");
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleMouseEnter = (dropdown: string) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    // Prevent body scroll when menu is open
    if (newState) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "unset";
  };

  const handleMobileDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const leftMenuItems = [
    {
      label: "Magazine",
      href: "/magazine",
      dropdown: [
        { label: "Latest Issue", href: "/magazine" },
        { label: "Archives", href: "/magazine/archives" },
        { label: "Pitch", href: "/magazine/pitch" },
      ],
    },
    {
      label: "United States",
      href: "/united-states",
      dropdown: [
        { label: "Politics", href: "/united-states/politics" },
        { label: "Economy", href: "/united-states/economy" },
        { label: "Society", href: "/united-states/society" },
      ],
    },
    {
      label: "World",
      href: "/world",
      dropdown: [
        { label: "International", href: "/world/international" },
        { label: "Global Economy", href: "/world/global-economy" },
        { label: "Security", href: "/world/security" },
      ],
    },
  ];

  const rightMenuItems = [
    {
      label: "Interviews",
      href: "/interviews",
      dropdown: [
        { label: "Recent", href: "/interviews" },
        { label: "Featured", href: "/interviews/featured" },
      ],
    },
    {
      label: "About",
      href: "/about",
      dropdown: [
        { label: "Our Story", href: "/about/story" },
        { label: "Executive Board", href: "/about/eboard" },
        { label: "Masthead", href: "/about/masthead" },
        { label: "Join", href: "/about/join" },
      ],
    },
    {
      label: "Media",
      href: "/media",
      dropdown: [
        { label: "Podcasts", href: "/podcasts" },
        { label: "Videos", href: "/videos" },
      ],
    },
  ];

  return (
    <nav
      className={`navigation-bar ${
        isScrolled ? "scrolled" : "expanded"
      } ${className}`}
    >
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
      )}

      <div className="nav-container">
        {/* Mobile Hamburger Button */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
        </button>
        {/* Left Menu Items */}
        <div className="nav-section left-menu">
          {leftMenuItems.map((item) => (
            <div
              key={item.label}
              className="nav-item"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <a href={item.href} className="nav-link">
                {item.label}
              </a>
              {activeDropdown === item.label && item.dropdown && (
                <div className="dropdown-menu">
                  {item.dropdown.map((dropdownItem) => (
                    <a
                      key={dropdownItem.label}
                      href={dropdownItem.href}
                      className="dropdown-item"
                    >
                      {dropdownItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logo Section */}
        <div className="nav-section nav-logo-section">
          {!isScrolled && (
            <>
              <div className="logo-divider left-divider"></div>
              <div className="logo-divider right-divider"></div>
            </>
          )}
          <a href="/" className="logo-link">
            <Image
              src="/logo/logo.svg"
              alt="Brown Political Review"
              width={isScrolled ? 120 : 250}
              height={isScrolled ? 40 : 110}
              className="logo"
              priority
            />
          </a>
        </div>

        {/* Right Menu Items */}
        <div className="nav-section right-menu">
          {rightMenuItems.map((item) => (
            <div
              key={item.label}
              className="nav-item"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <a href={item.href} className="nav-link">
                {item.label}
              </a>
              {activeDropdown === item.label && item.dropdown && (
                <div className="dropdown-menu">
                  {item.dropdown.map((dropdownItem) => (
                    <a
                      key={dropdownItem.label}
                      href={dropdownItem.href}
                      className="dropdown-item"
                    >
                      {dropdownItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-section">
            {leftMenuItems.map((item) => (
              <div key={item.label} className="mobile-nav-item">
                <div
                  className="mobile-nav-link-container"
                  onClick={() => handleMobileDropdownToggle(item.label)}
                >
                  <a
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                  {item.dropdown && (
                    <button
                      className="mobile-dropdown-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobileDropdownToggle(item.label);
                      }}
                    >
                      <span
                        className={`dropdown-arrow ${
                          activeDropdown === item.label ? "active" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                  )}
                </div>
                {activeDropdown === item.label && item.dropdown && (
                  <div className="mobile-dropdown-menu">
                    {item.dropdown.map((dropdownItem) => (
                      <a
                        key={dropdownItem.label}
                        href={dropdownItem.href}
                        className="mobile-dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        {dropdownItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mobile-menu-section">
            {rightMenuItems.map((item) => (
              <div key={item.label} className="mobile-nav-item">
                <div
                  className="mobile-nav-link-container"
                  onClick={() => handleMobileDropdownToggle(item.label)}
                >
                  <a
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                  {item.dropdown && (
                    <button
                      className="mobile-dropdown-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobileDropdownToggle(item.label);
                      }}
                    >
                      <span
                        className={`dropdown-arrow ${
                          activeDropdown === item.label ? "active" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                  )}
                </div>
                {activeDropdown === item.label && item.dropdown && (
                  <div className="mobile-dropdown-menu">
                    {item.dropdown.map((dropdownItem) => (
                      <a
                        key={dropdownItem.label}
                        href={dropdownItem.href}
                        className="mobile-dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        {dropdownItem.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
