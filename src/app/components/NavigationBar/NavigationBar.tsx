"use client";

import * as React from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import "./NavigationBar.css";
import Image from "next/image";

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface DropdownItem {
  title: string;
  href: string;
}

interface SectionConfig {
  title: string;
  href: string;
  items: DropdownItem[];
  featured?: {
    title: string;
    description: string;
  };
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  className,
  ...props
}) => {
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);
  const [mobileExpandedSections, setMobileExpandedSections] = React.useState<
    string[]
  >([]);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    // Check if we're on mobile and update state
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Handle body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleMouseEnter = (section: string): void => {
    if (isMobile) return; // Don't show dropdowns on mobile

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpenSection(section);
    }, 300); // Show submenu after 300ms hover
  };

  const handleMouseLeave = (): void => {
    if (isMobile) return; // Don't hide dropdowns on mobile

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpenSection(null);
    }, 300); // Hide submenu after 300ms
  };

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleMobileSection = (section: string): void => {
    if (mobileExpandedSections.includes(section)) {
      setMobileExpandedSections(
        mobileExpandedSections.filter((s) => s !== section)
      );
    } else {
      setMobileExpandedSections([...mobileExpandedSections, section]);
    }
  };

  const sections: Record<string, SectionConfig> = {
    us: {
      title: "United States",
      href: "/united-states",
      items: [
        { title: "Law (Judicial cases)", href: "/united-states/law" },
        {
          title: "Science (Climate/Health/Tech)",
          href: "/united-states/science",
        },
        { title: "Local (Campus)", href: "/united-states/local" },
        { title: "Economy", href: "/united-states/economy" },
        { title: "Foreign Policy", href: "/united-states/foreign-policy" },
        { title: "Culture", href: "/united-states/culture" },
        { title: "Public Policy", href: "/united-states/public-policy" },
      ],
      featured: {
        title: "Policy Spotlight",
        description:
          "Explore our latest analysis on key policy developments and their implications for American governance.",
      },
    },
    world: {
      title: "World",
      href: "/world",
      items: [
        { title: "Economy", href: "/world/economy" },
        { title: "International", href: "/world/international" },
        { title: "Africa", href: "/world/africa" },
        { title: "Asia", href: "/world/asia" },
        { title: "Europe", href: "/world/europe" },
        { title: "Latin America", href: "/world/latin-america" },
        { title: "Middle East", href: "/world/middle-east" },
      ],
      featured: {
        title: "Global Perspectives",
        description:
          "Comparative analysis from our international contributors examining cross-border political trends.",
      },
    },
    magazine: {
      title: "Magazine",
      href: "/magazine",
      items: [
        { title: "Pick up the issue", href: "/magazine/current-issue" },
        { title: "Feature articles", href: "/magazine/features" },
        { title: "US articles", href: "/magazine/us-articles" },
        { title: "World articles", href: "/magazine/world-articles" },
      ],
      featured: {
        title: "Latest Edition",
        description:
          "Read our most recent publication exploring pressing political issues through in-depth analysis.",
      },
    },
    multimedia: {
      title: "Multimedia",
      href: "/multimedia",
      items: [
        { title: "BPR Media Presents", href: "/multimedia/media-presents" },
        { title: "Interviews", href: "/multimedia/interviews" },
        { title: "US", href: "/multimedia/us" },
        { title: "World", href: "/multimedia/world" },
        { title: "Economy", href: "/multimedia/economy" },
        { title: "Culture", href: "/multimedia/culture" },
      ],
      featured: {
        title: "Latest Podcast",
        description:
          "Listen to our newest episode featuring conversations with political thought leaders.",
      },
    },
    about: {
      title: "About",
      href: "/about",
      items: [
        { title: "Masthead", href: "/about/masthead" },
        { title: "Our Story", href: "/about/story" },
        { title: "Company Values", href: "/about/values" },
        { title: "E-Board", href: "/about/eboard" },
        { title: "Join Staff", href: "/about/join" },
        { title: "Pitch an article", href: "/about/pitch" },
      ],
      featured: {
        title: "Our Mission",
        description:
          "The Brown Political Review is dedicated to promoting political discourse through quality journalism and analysis.",
      },
    },
  };

  return (
    <>
      <div className="nav-spacer"></div>
      <div className={`nav-container ${className || ""}`} {...props}>
        <nav className="nav-main">
          <div className="nav-content">
            <div className="logo-container">
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="The Brown Political Review Logo"
                  width={100}
                  height={100}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-links">
              {Object.entries(sections).map(([key, section]) => (
                <div
                  key={key}
                  className="nav-section"
                  onMouseEnter={() => handleMouseEnter(key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link href={section.href} className="nav-link">
                    {section.title}
                    <ChevronDown className="nav-link-indicator" />
                  </Link>

                  {openSection === key && (
                    <div className="nav-dropdown-container">
                      <div className="nav-dropdown">
                        <div className="dropdown-columns">
                          <div className="dropdown-column">
                            <div className="dropdown-category">
                              {key === "world" ? "Regions" : "Sections"}
                            </div>
                            <div className="dropdown-items">
                              {section.items.map((item, index) => (
                                <Link
                                  key={index}
                                  href={item.href}
                                  className="dropdown-item"
                                >
                                  {item.title}
                                </Link>
                              ))}
                            </div>
                          </div>

                          <div className="dropdown-column">
                            {section.featured && (
                              <div className="dropdown-featured">
                                <div className="featured-article">
                                  <div className="featured-title">
                                    {section.featured.title}
                                  </div>
                                  <p className="featured-description">
                                    {section.featured.description}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <div
          className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
        ></div>
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-header">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/logo.svg"
                alt="The Brown Political Review Logo"
                width={100}
                height={50}
                className="mobile-logo"
              />
            </Link>
            <button
              className="mobile-close-button"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mobile-menu-content">
            {Object.entries(sections).map(([key, section]) => (
              <div key={key} className="mobile-section">
                <div className="mobile-section-header">
                  <Link
                    href={section.href}
                    className="mobile-section-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {section.title}
                  </Link>
                  <button
                    className="mobile-expand-button"
                    onClick={() => toggleMobileSection(key)}
                    aria-label={`${
                      mobileExpandedSections.includes(key)
                        ? "Collapse"
                        : "Expand"
                    } ${section.title} section`}
                  >
                    <ChevronDown
                      className={`mobile-expand-icon ${
                        mobileExpandedSections.includes(key) ? "rotate" : ""
                      }`}
                    />
                  </button>
                </div>

                {mobileExpandedSections.includes(key) && (
                  <div className="mobile-subsections">
                    {section.items.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="mobile-subsection-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}

                    {section.featured && (
                      <div className="mobile-featured">
                        <div className="mobile-featured-title">
                          {section.featured.title}
                        </div>
                        <p className="mobile-featured-description">
                          {section.featured.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;
