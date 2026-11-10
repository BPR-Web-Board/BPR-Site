"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./NewsletterSignup.css";

const storageKey = "bpr-newsletter-dismissed";

export default function NewsletterSignup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch {}
    const timer = window.setTimeout(() => setVisible(true), 5000);
    const syncDismissal = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        window.clearTimeout(timer);
        setVisible(false);
      }
    };
    window.addEventListener("storage", syncDismissal);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", syncDismissal);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(storageKey, "true");
    } catch {}
  };

  if (!visible) return null;

  return <aside className="newsletter-signup" aria-labelledby="newsletter-title" aria-describedby="newsletter-description"
    onKeyDown={event => { if (event.key === "Escape") dismiss(); }}>
    <div className="newsletter-heading">
      <h2 id="newsletter-title">Stay in the loop</h2>
      <button type="button" className="newsletter-close" onClick={dismiss} aria-label="Dismiss newsletter signup">
        <X size={18} aria-hidden="true" />
      </button>
    </div>
    <p id="newsletter-description">Subscribe for BPR’s latest articles and interviews in your inbox.</p>
    <a className="site-action" href="http://eepurl.com/hJoTFX" target="_blank" rel="noopener noreferrer" onClick={dismiss}>Sign up</a>
  </aside>;
}
