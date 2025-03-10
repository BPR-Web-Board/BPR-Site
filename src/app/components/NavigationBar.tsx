"use client";

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from "next/link";
import './NavigationBar.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ className, ...props }) => {
  const [isAboutOpen, setIsAboutOpen] = React.useState<boolean>(false);

  const toggleAbout = (): void => {
    setIsAboutOpen(!isAboutOpen);
  };

  return (
    <>
      <div className="nav-spacer"></div>
      <div className={`nav-container ${inter.className} ${className || ''}`} {...props}>
        <nav className="nav-main">
          <div className="nav-content">
            <div className="logo-container">
              <img
                src="/api/placeholder/200/50"
                alt="Logo placeholder"
                className="logo"
              />
            </div>

            <div className="nav-links">
              <Link href="/united-states" className="nav-link">United States</Link>
              <Link href="/world" className="nav-link">World</Link>
              <Link href="/interviews" className="nav-link">Interviews</Link>
              <Link href="/magazine" className="nav-link">Magazine</Link>
              <Link href="/interviews" className="nav-link">Interviews</Link>
              <Link href="/multimedia" className="nav-link">Multimedia</Link>
              <Link href="/subscribe" className="nav-link">Subscribe</Link>
              <div className="about-container">
                <button
                  onClick={toggleAbout}
                  className="nav-link about-button"
                  type="button"
                >
                  About
                  {isAboutOpen ? (
                    <ChevronUp className="chevron" />
                  ) : (
                    <ChevronDown className="chevron" />
                  )}
                </button>
                
                {isAboutOpen && (
                  <div className="dropdown-menu">
                    <Link href="/about/masthead" className="dropdown-item">Masthead</Link>
                    <Link href="/about/values" className="dropdown-item">Company Values</Link>
                    <Link href="/about/eboard" className="dropdown-item">E-Board</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default NavigationBar;