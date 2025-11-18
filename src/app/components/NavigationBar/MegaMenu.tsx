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
}

const MegaMenu: React.FC<MegaMenuProps> = ({
  section,
  items,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedArticle = async () => {
      setLoading(true);

      // Find the first item with a categorySlug to fetch a featured article
      const itemWithCategory = items.find(item => item.categorySlug);

      if (!itemWithCategory?.categorySlug) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/category-article?category=${itemWithCategory.categorySlug}`
        );
        const data = await response.json();

        if (data.article) {
          setFeaturedArticle(data.article);
          setActiveSubsection(itemWithCategory.categorySlug);
        }
      } catch (error) {
        console.error("Error fetching featured article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticle();
  }, [items]);

  const handleSubsectionHover = async (item: SubMenuItem) => {
    if (!item.categorySlug) return;

    setActiveSubsection(item.categorySlug);

    try {
      const response = await fetch(
        `/api/category-article?category=${item.categorySlug}`
      );
      const data = await response.json();

      if (data.article) {
        setFeaturedArticle(data.article);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
    }
  };

  const getArticleTitle = (article: Article): string => {
    return typeof article.title === "object" ? article.title.rendered : article.title;
  };

  const getFeaturedImageUrl = (article: Article): string => {
    return article.featured_media_obj?.source_url || "";
  };

  const getArticleLink = (article: Article): string => {
    return `/${article.categories_obj?.[0]?.slug || "world"}/article/${article.slug}`;
  };

  return (
    <div
      className="mega-menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
                  onMouseEnter={() => handleSubsectionHover(item)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Column - Featured Article Preview */}
          {featuredArticle && (
            <div className="mega-menu-featured">
              <a
                href={getArticleLink(featuredArticle)}
                className="mega-menu-article-card"
              >
                {getFeaturedImageUrl(featuredArticle) && (
                  <div className="mega-menu-featured-image">
                    <Image
                      src={getFeaturedImageUrl(featuredArticle)}
                      alt={getArticleTitle(featuredArticle)}
                      width={400}
                      height={250}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div className="mega-menu-featured-content">
                  <h4 className="mega-menu-featured-title">
                    {getArticleTitle(featuredArticle)}
                  </h4>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
