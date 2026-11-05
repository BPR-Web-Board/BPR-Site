"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Moon, Sun, Palette } from "lucide-react";
import NavigationLogo from "./NavigationLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./NavigationBar.css";

interface SubMenuItem { label: string; href: string; categorySlug?: string; }
interface MenuItem { label: string; href: string; megaMenu?: SubMenuItem[]; dropdown?: SubMenuItem[]; }

type ThemeMode = "issue" | "light" | "dark";

const THEME_LABELS: Record<ThemeMode, string> = {
  issue: "Issue Colors",
  light: "Light",
  dark: "Dark",
};

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === "issue" || value === "light" || value === "dark";
}

function hasIssueThemeColors(): boolean {
  return !!document.querySelector(".issue-edition");
}

function resolveTheme(hasIssueTheme: boolean): ThemeMode {
  let saved: string | null = null;
  try { saved = localStorage.getItem("bpr-theme"); } catch {}
  if (hasIssueTheme) return "issue";
  if (saved === "light" || saved === "dark") return saved;
  if (saved === "issue") return "dark";
  return "dark";
}

export default function NavigationBar({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [issueThemeAvailable, setIssueThemeAvailable] = useState(false);
  const themeToggleRef = useRef<HTMLButtonElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const lastDisclosure = useRef<HTMLButtonElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const closeMobileMenu = () => { setIsMobileMenuOpen(false); setActiveDropdown(null); };
  const themeOrder: ThemeMode[] = issueThemeAvailable ? ["issue", "light", "dark"] : ["dark", "light"];
  const activeTheme = themeOrder.includes(theme) ? theme : themeOrder[0];
  const nextTheme = themeOrder[(themeOrder.indexOf(activeTheme) + 1) % themeOrder.length];

  useEffect(() => {
    let available = hasIssueThemeColors();
    const apply = (hasIssueTheme: boolean) => {
      setIssueThemeAvailable(hasIssueTheme);
      const next = resolveTheme(hasIssueTheme);
      setTheme(next);
      if (document.documentElement.dataset.theme !== next) document.documentElement.dataset.theme = next;
    };
    apply(available);
    const observer = new MutationObserver(() => {
      const nextAvailable = hasIssueThemeColors();
      if (nextAvailable === available) return;
      available = nextAvailable;
      apply(available);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [pathname]);
  const cycleTheme = () => {
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    setTheme(nextTheme);
    try { localStorage.setItem("bpr-theme", nextTheme); } catch {}
  };
  useEffect(() => { closeMobileMenu(); setIsSearchOpen(false); }, [pathname]);
  useEffect(() => { if (isSearchOpen) searchInputRef.current?.focus(); }, [isSearchOpen]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1200px)");
    const onViewport = () => { closeMobileMenu(); setIsSearchOpen(false); };
    desktop.addEventListener("change", onViewport);
    return () => {
      desktop.removeEventListener("change", onViewport);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.querySelector<HTMLElement>(".page-container > :is(.featured-content, .main-content) > .hero-section:first-child");
      setIsScrolled(hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 50);
    };
    const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [pathname]);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const update = () => document.documentElement.style.setProperty("--nav-height", `${nav.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    update();
    return () => { observer.disconnect(); document.documentElement.style.removeProperty("--nav-height"); };
  }, []);
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isMobileMenuOpen]);
  const keepOpen = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const openMenu = (label: string) => { keepOpen(); if (!isSearchOpen) setActiveDropdown(label); };
  const deferClose = () => {
    keepOpen();
    closeTimer.current = setTimeout(() => {
      if (!navRef.current?.contains(document.activeElement) || document.activeElement === document.body) setActiveDropdown(null);
    }, 150);
  };
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (isSearchOpen) { setIsSearchOpen(false); searchToggleRef.current?.focus(); }
      else if (isMobileMenuOpen) { closeMobileMenu(); toggleRef.current?.focus(); }
      else { setActiveDropdown(null); lastDisclosure.current?.focus(); }
    }
    if (event.key === "Tab" && isMobileMenuOpen) {
      const focusable = [
        navRef.current?.querySelector<HTMLElement>(".logo-link"),
        toggleRef.current,
        searchToggleRef.current,
        themeToggleRef.current,
        ...Array.from(mobileRef.current?.querySelectorAll<HTMLElement>("a, button") || []),
      ].filter((el): el is HTMLElement => !!el && !el.closest("[hidden]"));
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      const next = (current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      event.preventDefault();
      focusable[next]?.focus();
    }
    if (event.key === "Tab" && !isMobileMenuOpen && activeDropdown) {
      const firstLink = navRef.current?.querySelector<HTMLAnchorElement>("#desktop-submenu a");
      if (!event.shiftKey && document.activeElement === lastDisclosure.current && firstLink) {
        event.preventDefault();
        firstLink.focus();
      } else if (event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault();
        lastDisclosure.current?.focus();
      }
    }
  };
  const leftMenuItems: MenuItem[] = [
    {
      label: "United States",
      href: "/united-states",
      megaMenu: [
        {
          label: "Education",
          href: "/united-states/education",
          categorySlug: "education",
        },
        {
          label: "Elections",
          href: "/united-states/elections",
          categorySlug: "elections",
        },
        {
          label: "Environment",
          href: "/united-states/environment",
          categorySlug: "environment",
        },
        {
          label: "Foreign Policy",
          href: "/united-states/foreign-policy",
          categorySlug: "foreign-policy",
        },
        {
          label: "Health",
          href: "/united-states/health",
          categorySlug: "health",
        },
        {
          label: "Housing",
          href: "/united-states/housing",
          categorySlug: "housing",
        },
        {
          label: "Law/Justice",
          href: "/united-states/law",
          categorySlug: "law",
        },
        {
          label: "Security and Defense",
          href: "/united-states/security-and-defense-usa",
          categorySlug: "security-and-defense-usa",
        },
      ],
    },
    {
      label: "World",
      href: "/world",
      megaMenu: [
        { label: "Africa", href: "/world/africa", categorySlug: "africa" },
        {
          label: "Asia/Pacific",
          href: "/world/asia-pacific",
          categorySlug: "asia-pacific",
        },
        { label: "Europe", href: "/world/europe", categorySlug: "europe" },
        {
          label: "Latin America",
          href: "/world/latin-america",
          categorySlug: "latin-america",
        },
        {
          label: "Middle East",
          href: "/world/middle-east",
          categorySlug: "middle-east",
        },
        {
          label: "South America",
          href: "/world/south-america",
          categorySlug: "south-america",
        },
      ],
    },
    {
      label: "Interviews",
      href: "/interviews",
    },
  ];

  const rightMenuItems: MenuItem[] = [
    {
      label: "Multimedia",
      href: "/multimedia",
      megaMenu: [
        {
          label: "BPRadio",
          href: "/multimedia/bpradio",
          categorySlug: "bpradio",
        },
        { label: "Data", href: "/multimedia/data", categorySlug: "data" },
        { label: "Media", href: "/multimedia/media", categorySlug: "media" },
      ],
    },
    {
      label: "Magazine",
      href: "/magazine",
      megaMenu: [
        { label: "Latest Issue", href: "/magazine" },
        { label: "Archive", href: "/magazine/issues" },
      ],
    },
    {
      label: "About",
      href: "/about/story",
      megaMenu: [
        { label: "Who are we?", href: "/about/story" },
        { label: "Masthead", href: "/about/masthead" },
        { label: "Join BPR!", href: "/about/join" },
        { label: "Pitch an Article", href: "/about/pitch" },
        { label: "High School Program", href: "/about/high-school-program" },
      ],
    },
  ];

  const articleMenu: MenuItem = {
    label: "Articles",
    href: "/",
    megaMenu: [
      { label: "United States", href: "/united-states" },
      { label: "World", href: "/world" },
      { label: "Culture", href: "/culture" },
    ],
  };
  const puzzles: MenuItem = {
    label: "Puzzles",
    href: "/puzzles",
    megaMenu: [
      { label: "Weekly Crossword", href: "/puzzles" },
      { label: "Puzzle Archive", href: "/puzzles-archives" },
    ],
  };
  const desktopMenuItems = [articleMenu, leftMenuItems[2], ...rightMenuItems.slice(0, 2), puzzles, rightMenuItems[2]];
  const items = [...leftMenuItems, ...rightMenuItems.slice(0, 2), puzzles, rightMenuItems[2]];
  const desktopItems = (items: MenuItem[]) => items.map((item) => (
    <div key={item.label} className="nav-item" onMouseEnter={() => openMenu(item.label)} onMouseLeave={deferClose}>
      <Link href={item.href} className="nav-link">{item.label}</Link>
      {item.megaMenu && <button className="nav-disclosure" aria-label={`${item.label} subsections`} aria-expanded={activeDropdown === item.label} aria-controls={activeDropdown === item.label ? "desktop-submenu" : undefined}
        onClick={(event) => { keepOpen(); lastDisclosure.current = event.currentTarget; setActiveDropdown(activeDropdown === item.label ? null : item.label); }}>Open</button>}
      {activeDropdown === item.label && item.megaMenu && !isSearchOpen && <div id="desktop-submenu" className="nav-submenu" onMouseEnter={keepOpen}>
        {item.megaMenu.map(sub => <Link key={sub.href} href={sub.href} onClick={() => setActiveDropdown(null)}>{sub.label}</Link>)}
      </div>}
    </div>
  ));
  return (
    <nav ref={navRef} aria-label="Main navigation" onKeyDown={onKeyDown} onMouseLeave={deferClose}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setActiveDropdown(null); setIsSearchOpen(false); } }}
      className={`navigation-bar ${isScrolled ? "scrolled" : "expanded"} ${isSearchOpen ? "search-open" : ""} ${className}`}>
      <div className="nav-container" onMouseMove={keepOpen}>
        <div className="nav-section nav-logo-section">
          <Link href="/" className="logo-link" aria-label="Brown Political Review home"><NavigationLogo /></Link>
        </div>
        <div className="nav-section desktop-menu">{desktopItems(desktopMenuItems)}</div>
        <button ref={toggleRef} className="mobile-menu-toggle" onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setActiveDropdown(null); setIsSearchOpen(false); }}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation">
          {[0, 1, 2].map((line) => <span key={line} className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`} />)}
        </button>
        <div className="nav-search-control">
          <form id="navigation-search" className="navigation-search" role={isSearchOpen ? "search" : undefined} aria-hidden={!isSearchOpen} method="get" action="/search">
            <input ref={searchInputRef} type="search" name="q" aria-label="Search articles" placeholder="Search articles…" maxLength={280} required disabled={!isSearchOpen} />
          </form>
          <button ref={searchToggleRef} className="search-toggle" aria-label={isSearchOpen ? "Close search" : "Search"} aria-expanded={isSearchOpen} aria-controls="navigation-search"
            onClick={() => { setIsSearchOpen(!isSearchOpen); closeMobileMenu(); }}>
            {isSearchOpen ? <X size={20} strokeWidth={1.5} aria-hidden="true" /> : <Search size={20} strokeWidth={1.5} aria-hidden="true" />}
          </button>
          <button
            ref={themeToggleRef}
            className="theme-toggle"
            type="button"
            aria-label={`Theme: ${THEME_LABELS[activeTheme]}. Switch to ${THEME_LABELS[nextTheme]}`}
            title={`Theme: ${THEME_LABELS[activeTheme]}`}
            onClick={cycleTheme}
          >
            <span key={activeTheme} className="theme-toggle-icon" aria-hidden="true">
              {activeTheme === "issue" ? <Palette size={20} strokeWidth={1.5} /> : activeTheme === "light" ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </span>
          </button>
        </div>

      </div>
      {isMobileMenuOpen && <div ref={mobileRef} id="mobile-navigation" className="mobile-menu active">
        <div className="mobile-menu-content">
          {items.map((item, index) => <div key={item.label} className="mobile-nav-item">
            <div className="mobile-nav-link-container">
              <Link href={item.href} className="mobile-nav-link" onClick={closeMobileMenu}>{item.label}</Link>
              {item.megaMenu && <button className="mobile-dropdown-toggle" aria-label={`${item.label} subsections`} aria-expanded={activeDropdown === item.label} aria-controls={`mobile-section-${index}`}
                onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}>{activeDropdown === item.label ? "−" : "+"}</button>}
            </div>
            <div id={`mobile-section-${index}`} hidden={activeDropdown !== item.label} className="mobile-dropdown-menu">
              {(item.megaMenu || item.dropdown || []).map((sub) => <Link key={sub.href} href={sub.href} className="mobile-dropdown-item" onClick={closeMobileMenu}>{sub.label}</Link>)}
            </div>
          </div>)}
        </div>
      </div>}
    </nav>
  );
}
