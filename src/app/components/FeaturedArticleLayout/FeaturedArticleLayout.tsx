"use client";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../lib/types";
import OptimizedImage from "../shared/OptimizedImage/OptimizedImage";
import "./FeaturedArticleLayout.css";

interface FeaturedArticleLayoutProps {
  title: string;
  posts: EnhancedPost[];
  maxArticles?: number;
  featuredIndex?: number; // Which article to feature (default 0)
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Helper function to strip HTML
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

const FeaturedArticleLayout: React.FC<FeaturedArticleLayoutProps> = ({
  title,
  posts,
  maxArticles = 7, // 1 featured + 6 list articles
  featuredIndex = 0,
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="featured-article-layout">
        <div className="layout-header">
          <h2 className="layout-title">{title}</h2>
        </div>
        <div className="layout-error">No articles available</div>
      </div>
    );
  }

  const articles = posts.slice(0, maxArticles);
  const featuredArticle = articles[featuredIndex];
  const listArticles = articles
    .filter((_, index) => index !== featuredIndex)
    .slice(0, 6);

  if (!featuredArticle) {
    return (
      <div className="featured-article-layout">
        <div className="layout-header">
          <h2 className="layout-title">{title}</h2>
        </div>
        <div className="layout-error">No featured article available</div>
      </div>
    );
  }

  const featuredTitleText =
    typeof featuredArticle.title === "object"
      ? featuredArticle.title.rendered
      : featuredArticle.title;

  const featuredExcerptText =
    typeof featuredArticle.excerpt === "object"
      ? featuredArticle.excerpt.rendered
      : featuredArticle.excerpt;

  return (
    <div className="featured-article-layout">
      {/* Header */}
      <div className="horizontal-divider"></div>
      <div className="layout-header">
        <h2 className="layout-title">{title}</h2>
      </div>

      {/* Main Layout */}
      <div className="layout-container">
        {/* Featured Article */}
        <div className="featured-article">
          <Link
            href={`/${
              featuredArticle.categories_obj?.[0]?.slug || "world"
            }/article/${featuredArticle.slug}`}
            style={{ display: "contents" }}
          >
            <div className="featured-image-container">
              {featuredArticle.featured_media_obj?.source_url ? (
                <OptimizedImage
                  src={featuredArticle.featured_media_obj.source_url}
                  alt={stripHtml(featuredTitleText)}
                  width={673}
                  height={454}
                  className="featured-image"
                  showPlaceholder={true}
                />
              ) : (
                <div className="featured-image-placeholder">
                  <span>No Image</span>
                </div>
              )}
            </div>

            <div className="featured-content">
              <h3
                className="featured-title"
                dangerouslySetInnerHTML={{ __html: featuredTitleText }}
              ></h3>

              <div className="featured-meta">
                <span className="featured-author">
                  BY {(featuredArticle.author_name || "LASTNAME").toUpperCase()}
                </span>
                <span className="featured-date">
                  {formatDate(featuredArticle.date).toUpperCase()}
                </span>
              </div>
              {maxArticles > 5 && (
                <div
                  className="featured-excerpt"
                  dangerouslySetInnerHTML={{
                    __html: truncateText(featuredExcerptText, 400),
                  }}
                ></div>
              )}
            </div>
          </Link>
        </div>

        {/* Article List */}
        <div className="article-list">
          {listArticles.map((article, index) => {
            const titleText =
              typeof article.title === "object"
                ? article.title.rendered
                : article.title;

            return (
              <div key={article.id} className="list-article">
                <Link
                  href={`/${
                    article.categories_obj?.[0]?.slug || "world"
                  }/article/${article.slug}`}
                  style={{ display: "contents" }}
                >
                  <div className="list-article-divider"></div>

                  <h4
                    className="list-title"
                    dangerouslySetInnerHTML={{
                      __html: truncateText(titleText, 100),
                    }}
                  ></h4>

                  <div className="list-author">
                    BY {(article.author_name || "LASTNAME").toUpperCase()}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedArticleLayout;
