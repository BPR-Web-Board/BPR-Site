"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import "./NavigationBar.css";
import Image from "next/image";

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  className,
  ...props
}) => {
  const [isAboutOpen, setIsAboutOpen] = React.useState<boolean>(false);

  const toggleAbout = (): void => {
    setIsAboutOpen(!isAboutOpen);
  };

  return (
    <>
      <div className="nav-spacer"></div>
      <div className={`nav-container ${className || ""}`} {...props}>
        <nav className="nav-main">
          <div className="nav-content">
            <div className="logo-container">
              <Image
                src="/logo.svg"
                alt="The Brown Political Review Logo"
                width={100}
                height={100}
              />
            </div>

            <div className="nav-links">
              <Link href="/united-states" className="nav-link">
                United States
              </Link>
              <Link href="/world" className="nav-link">
                World
              </Link>
              <Link href="/magazine" className="nav-link">
                Magazine
              </Link>
              <Link href="/multimedia" className="nav-link">
                Multimedia
              </Link>
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
                    <Link href="/about/masthead" className="dropdown-item">
                      Masthead
                    </Link>
                    <Link href="/about/values" className="dropdown-item">
                      Company Values
                    </Link>
                    <Link href="/about/eboard" className="dropdown-item">
                      E-Board
                    </Link>
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
