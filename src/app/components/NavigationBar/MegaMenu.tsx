"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getPostsByCategorySlug } from "@/app/lib/wordpress";
import { enhancePosts } from "@/app/lib/enhancePost";
import { getAllCategories } from "@/app/lib/wordpress";
import { getArticleTitle, getFeaturedImageUrl } from "@/app/lib/utils";
import type { EnhancedPost } from "@/app/lib/types";

interface SubMenuItem {
  label: string;
  href: string;
  categorySlug?: string;
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
  const [articles, setArticles] = useState<{ [key: string]: EnhancedPost | null }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const articlesMap: { [key: string]: EnhancedPost | null } = {};

      try {
        const categories = await getAllCategories();

        // Fetch articles for items with categorySlug
        const fetchPromises = items
          .filter((item) => item.categorySlug)
          .map(async (item) => {
            try {
              const posts = await getPostsByCategorySlug(item.categorySlug!, { per_page: 5 });
              const enhancedPosts = await enhancePosts(posts, categories);

              // Randomly select one article from the fetched posts
              if (enhancedPosts && enhancedPosts.length > 0) {
                const randomIndex = Math.floor(Math.random() * enhancedPosts.length);
                articlesMap[item.categorySlug!] = enhancedPosts[randomIndex];
              } else {
                articlesMap[item.categorySlug!] = null;
              }
            } catch (error) {
              console.error(`Error fetching articles for ${item.categorySlug}:`, error);
              articlesMap[item.categorySlug!] = null;
            }
          });

        await Promise.all(fetchPromises);
        setArticles(articlesMap);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [items]);

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
          <div className="mega-menu-grid">
            {items.map((item) => {
              const article = item.categorySlug ? articles[item.categorySlug] : null;
              const hasArticle = article && !loading;

              return (
                <div key={item.label} className="mega-menu-item">
                  <a href={item.href} className="mega-menu-link">
                    <span className="mega-menu-link-text">{item.label}</span>
                  </a>
                  {hasArticle && (
                    <a
                      href={`/${article.categories_obj?.[0]?.slug || "world"}/article/${article.slug}`}
                      className="mega-menu-article-preview"
                    >
                      {getFeaturedImageUrl(article) && (
                        <div className="mega-menu-article-image">
                          <Image
                            src={getFeaturedImageUrl(article)}
                            alt={getArticleTitle(article)}
                            width={120}
                            height={80}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <p className="mega-menu-article-title">
                        {getArticleTitle(article)}
                      </p>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
