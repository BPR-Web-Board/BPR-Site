import * as React from "react";
import Link from "next/link";
import { Instagram, Linkedin, Mail } from "lucide-react";
import "./Footer.css";

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...props }) => (
  <footer className={`footer ${className || ""}`} {...props}>
    <div className="footer-content">
      <div className="footer-text">
        <nav aria-label="Footer">
          <ul className="footer-links">
            <li><Link href="/about/story" className="footer-link" target="_blank" rel="noopener noreferrer">Our Story</Link></li>
            <li><Link href="/about/masthead" className="footer-link" target="_blank" rel="noopener noreferrer">Masthead</Link></li>
            <li><Link href="/about/join" className="footer-link" target="_blank" rel="noopener noreferrer">Join BPR</Link></li>
            <li><Link href="/donate" className="footer-link" target="_blank" rel="noopener noreferrer">Donate</Link></li>
            <li><a href="http://eepurl.com/hJoTFX" className="footer-link" target="_blank" rel="noopener noreferrer">Newsletter</a></li>
            <li>
              <ul className="footer-social-links" aria-label="Social and contact links">
                <li>
                  <a href="https://www.instagram.com/brownpoliticalreview/?hl=en#" className="footer-link footer-icon-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
                    <Instagram size={16} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href="https://open.spotify.com/show/4OewXk59kprBDrq1to11Ap" className="footer-link footer-icon-link" target="_blank" rel="noopener noreferrer" aria-label="Spotify" title="Spotify">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M6.5 9a15 15 0 0 1 11 1M7 12.5a12 12 0 0 1 9.5.9M7.5 16a9 9 0 0 1 7.8.7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/brown-political-review/posts/?feedView=all" className="footer-link footer-icon-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                    <Linkedin size={16} aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a href="mailto:brown-political-review@brown.edu" className="footer-link footer-icon-link" target="_blank" rel="noopener noreferrer" aria-label="Email BPR" title="Email BPR">
                    <Mail size={16} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        <p className="footer-copyright">© {new Date().getFullYear()} Brown Political Review</p>
      </div>
      <span className="footer-logo" role="img" aria-label="Brown Political Review" />
    </div>
  </footer>
);

export default Footer;
