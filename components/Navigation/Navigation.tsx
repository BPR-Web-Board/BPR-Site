// components/Navigation/Navigation.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import styles from "./Navigation.module.css";

type NavigationProps = {
  className?: string;
};

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Navigation items based on project structure
  const navItems = [
    { label: "Home", path: "/" },
    { label: "World", path: "/world" },
    { label: "US", path: "/us" },
    { label: "Magazine", path: "/magazine" },
    { label: "Interviews", path: "/interviews" },
  ];

  // Handle scroll events to add shadow to nav when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Check if a nav item is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <header
      className={cn(styles.header, scrolled && styles.scrolled, className)}
    >
      <div className={styles.container}>
        <div className={styles.logoAndToggle}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>Brown Political Review</span>
          </Link>

          <button
            className={cn(styles.menuToggle, isMenuOpen && styles.active)}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  href={item.path}
                  className={cn(
                    styles.navLink,
                    isActive(item.path) && styles.active
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Navigation - Full Width Overlay */}
      <div className={cn(styles.mobileNav, isMenuOpen && styles.open)}>
        <div className={styles.mobileNavContent}>
          <nav>
            <ul className={styles.mobileNavList}>
              {navItems.map((item) => (
                <li key={item.path} className={styles.mobileNavItem}>
                  <Link
                    href={item.path}
                    className={cn(
                      styles.mobileNavLink,
                      isActive(item.path) && styles.active
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
