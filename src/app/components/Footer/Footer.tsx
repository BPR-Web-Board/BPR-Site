"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import "./Footer.css";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...props }) => {
  return (
    <footer className={`footer ${className || ""}`} {...props}>
      <div className="footer-container">
        <div className="footer-content">
          {/* Left Section - Logo */}
          <div className="logo-section">
            <div className="logo-container">
              <Image
                src="/logo/logo_white.svg"
                alt="The Brown Political Review Logo"
                width={250}
                height={75}
                priority
              />
            </div>
          </div>

          {/* Middle Section - Intentionally Left Blank */}
          <div className="middle-section"></div>

          {/* Right Section - Links in a 2x2 Grid */}
          <div className="links-grid">
            {/* About Column */}
            <div className="link-column">
              <h3 className="column-title">About</h3>
              <ul className="link-list">
                <li>
                  <Link href="/mission" className="footer-link">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link href="/story" className="footer-link">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/masthead" className="footer-link">
                    Masthead
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="link-column">
              <h3 className="column-title">Support</h3>
              <ul className="link-list">
                <li>
                  <Link href="/subscribe" className="footer-link">
                    Subscribe
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className="footer-link">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link href="/advertise" className="footer-link">
                    Advertise
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect Column */}
            <div className="link-column">
              <h3 className="column-title">Connect</h3>
              <ul className="link-list">
                <li>
                  <Link href="/contact" className="footer-link">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/join" className="footer-link">
                    Join BPR
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Column */}
            <div className="link-column">
              <h3 className="column-title">Follow</h3>
              <div className="social-icons">
                <Link
                  href="https://instagram.com"
                  className="social-icon"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </Link>
                <Link
                  href="https://facebook.com"
                  className="social-icon"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </Link>
                <Link
                  href="https://linkedin.com"
                  className="social-icon"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
