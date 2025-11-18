"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface SubMenuItem {
  label: string;
  href: string;
  categorySlug?: string;
}

interface Article {
  id: number;
  slug: string;
  title: { rendered: string } | string;
  excerpt?: { rendered: string } | string;
  featured_media_obj?: { source_url: string };
  categories_obj?: Array<{ slug: string }>;
}

interface MegaMenuProps {
  section: string;
  items: SubMenuItem[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isScrolled: boolean;
}

// Sections that should show spotlight articles
const SPOTLIGHT_SECTIONS = [
  "United States",
  "World",
  "Interviews",
  "Multimedia",
  "Magazine",
];

const MegaMenu: React.FC<MegaMenuProps> = ({
  section,
  items,
  onMouseEnter,
  onMouseLeave,
  isScrolled,
}) => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchSpotlightArticles = async () => {
      // Only fetch spotlight articles for specific sections
      if (!SPOTLIGHT_SECTIONS.includes(section)) {
        return;
      }

      // Fetch 2 most recent articles from spotlight endpoint for all sections
      try {
        const response = await fetch(
          `/api/spotlight-article?section=${encodeURIComponent(
            section
          )}&per_page=2`
        );
        const data = await response.json();

        // Handle both single article and multiple articles response formats
        if (data.articles && Array.isArray(data.articles)) {
          setFeaturedArticles(data.articles);
        } else if (data.article) {
          setFeaturedArticles([data.article]);
        }
      } catch (error) {
        console.error("Error fetching spotlight articles:", error);
      }
    };

    fetchSpotlightArticles();
  }, [section]);

  const getArticleTitle = (article: Article): string => {
    return typeof article.title === "object"
      ? article.title.rendered
      : article.title;
  };

  const getFeaturedImageUrl = (article: Article): string => {
    return article.featured_media_obj?.source_url || "";
  };

  const getArticleLink = (article: Article): string => {
    return `/${article.categories_obj?.[0]?.slug || "world"}/article/${
      article.slug
    }`;
  };

  return (
    <div
      className={`mega-menu ${isScrolled ? "scrolled" : "expanded"}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseEnter}
    >
      <div className="mega-menu-container">
        <div className="mega-menu-header">
          <h3 className="mega-menu-title">{section}</h3>
        </div>
        <div className="mega-menu-content">
          {/* Left Column - Navigation Links */}
          <div className="mega-menu-navigation">
            <nav className="mega-menu-nav-list">
              {items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="mega-menu-nav-link"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Column - Featured Article Preview */}
          {featuredArticles.length > 0 && (
            <div
              className={`mega-menu-featured ${
                featuredArticles.length > 1 ? "mega-menu-magazine-grid" : ""
              }`}
            >
              {featuredArticles.map((article) => (
                <a
                  key={article.id}
                  href={getArticleLink(article)}
                  className="mega-menu-article-card"
                >
                  {getFeaturedImageUrl(article) && (
                    <div className="mega-menu-featured-image">
                      <Image
                        src={getFeaturedImageUrl(article)}
                        alt={getArticleTitle(article)}
                        width={400}
                        height={250}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className="mega-menu-featured-content">
                    <h4 className="mega-menu-featured-title">
                      {getArticleTitle(article)}
                    </h4>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
