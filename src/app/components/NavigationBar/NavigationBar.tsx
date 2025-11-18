"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import "./NavigationBar.css";
import MegaMenu from "./MegaMenu";

interface NavigationBarProps {
  className?: string;
}

interface SubMenuItem {
  label: string;
  href: string;
  categorySlug?: string;
}

interface MenuItem {
  label: string;
  href: string;
  megaMenu?: SubMenuItem[];
  dropdown?: SubMenuItem[];
}

const NavigationBar: React.FC<NavigationBarProps> = ({ className = "" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

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
      // Clean up any pending timeouts
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleMouseEnter = (dropdown: string) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Show mega menu immediately or with slight delay
    const timeout = setTimeout(() => {
      setActiveDropdown(dropdown);
    }, 100);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    // Clear timeout on mouse leave
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Delay before closing to allow moving to mega menu
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleMegaMenuEnter = () => {
    // Keep mega menu open when hovering over it
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleMegaMenuLeave = () => {
    // Close mega menu when mouse leaves
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
    setHoverTimeout(timeout);
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

  const leftMenuItems: MenuItem[] = [
    {
      label: "United States",
      href: "/united-states",
      megaMenu: [
        { label: "Education", href: "/united-states/education", categorySlug: "education" },
        { label: "Elections", href: "/united-states/elections", categorySlug: "elections" },
        { label: "Environment", href: "/united-states/environment", categorySlug: "environment" },
        { label: "Foreign Policy", href: "/united-states/foreign-policy", categorySlug: "foreign-policy" },
        { label: "Health", href: "/united-states/health", categorySlug: "health" },
        { label: "Housing", href: "/united-states/housing", categorySlug: "housing" },
        { label: "Law/Justice", href: "/united-states/law-justice", categorySlug: "law" },
        { label: "Security and Defense", href: "/united-states/security-defense", categorySlug: "security-and-defense-usa" },
      ],
    },
    {
      label: "World",
      href: "/world",
      megaMenu: [
        { label: "Africa", href: "/world/africa", categorySlug: "africa" },
        { label: "Asia/Pacific", href: "/world/asia-pacific", categorySlug: "asia-pacific" },
        { label: "Europe", href: "/world/europe", categorySlug: "europe" },
        { label: "Latin America", href: "/world/latin-america", categorySlug: "latin-america" },
        { label: "Middle East", href: "/world/middle-east", categorySlug: "middle-east" },
        { label: "South America", href: "/world/south-america", categorySlug: "south-america" },
      ],
    },
    {
      label: "Interviews",
      href: "/interviews",
      megaMenu: [
        { label: "Professor Podcasts", href: "/interviews/professor-podcasts", categorySlug: "professor-podcasts" },
        { label: "Rhode Island", href: "/interviews/rhode-island", categorySlug: "rhode-island-interviews" },
        { label: "U.S.", href: "/interviews/us", categorySlug: "us-interviews" },
        { label: "Congress", href: "/interviews/congress", categorySlug: "congress-interviews" },
        { label: "World", href: "/interviews/world", categorySlug: "world-interviews" },
      ],
    },
  ];

  const rightMenuItems: MenuItem[] = [
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
      label: "About",
      href: "/about",
      megaMenu: [
        { label: "Who are we?", href: "/about/story" },
        { label: "Masthead", href: "/about/masthead" },
        { label: "Join BPR!", href: "/about/join" },
        { label: "High School Program", href: "/about/high-school" },
      ],
    },
    {
      label: "Multimedia",
      href: "/multimedia",
      megaMenu: [
        { label: "BPRadio", href: "/multimedia/bpradio", categorySlug: "bpradio" },
        { label: "Data", href: "/multimedia/data", categorySlug: "data" },
        { label: "Media", href: "/multimedia/media", categorySlug: "media" },
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
              width={isScrolled ? 120 : 175}
              height={isScrolled ? 60 : 78}
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

      {/* Mega Menu - Render for all menu items with megaMenu */}
      {activeDropdown &&
        [...leftMenuItems, ...rightMenuItems].find(
          (item) => item.label === activeDropdown && item.megaMenu
        ) && (
          <MegaMenu
            section={activeDropdown}
            items={
              [...leftMenuItems, ...rightMenuItems].find(
                (item) => item.label === activeDropdown
              )?.megaMenu || []
            }
            onMouseEnter={handleMegaMenuEnter}
            onMouseLeave={handleMegaMenuLeave}
          />
        )}

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
                  {(item.dropdown || item.megaMenu) && (
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
                {activeDropdown === item.label && item.megaMenu && (
                  <div className="mobile-dropdown-menu">
                    {item.megaMenu.map((megaMenuItem) => (
                      <a
                        key={megaMenuItem.label}
                        href={megaMenuItem.href}
                        className="mobile-dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        {megaMenuItem.label}
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
                  {(item.dropdown || item.megaMenu) && (
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
                {activeDropdown === item.label && item.megaMenu && (
                  <div className="mobile-dropdown-menu">
                    {item.megaMenu.map((megaMenuItem) => (
                      <a
                        key={megaMenuItem.label}
                        href={megaMenuItem.href}
                        className="mobile-dropdown-item"
                        onClick={closeMobileMenu}
                      >
                        {megaMenuItem.label}
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
