"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EnhancedPost } from "../../lib/types";
import "./ArticleCarousel.css";

interface ArticleCarouselProps {
  title: string;
  posts: EnhancedPost[];
  maxArticles?: number;
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

const ArticleCarousel: React.FC<ArticleCarouselProps> = ({
  title,
  posts,
  maxArticles = 5,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Limit articles to maxArticles
  const articles = posts.slice(0, maxArticles);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === articles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? articles.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="article-carousel">
        <div className="carousel-header">
          <h2
            className="carousel-title"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>
        <div className="carousel-error">No articles available</div>
      </div>
    );
  }

  const currentArticle = articles[currentIndex];

  if (!currentArticle) {
    return (
      <div className="article-carousel">
        <div className="carousel-header">
          <h2
            className="carousel-title"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>
        <div className="carousel-error">No articles available</div>
      </div>
    );
  }

  const titleText =
    typeof currentArticle.title === "object"
      ? currentArticle.title.rendered
      : currentArticle.title;
  const excerptText =
    typeof currentArticle.excerpt === "object"
      ? currentArticle.excerpt.rendered
      : currentArticle.excerpt;

  return (
    <div className="article-carousel">
      {/* Top divider line */}

      <div className="carousel-top-divider"></div>

      {/* Article Content */}
      <div className="carousel-content">
        <div className="article-text-content">
          <Link
            href={`/${
              currentArticle.categories_obj?.[0]?.slug || "world"
            }/article/${currentArticle.slug}`}
            className="article-link-carousel"
          >
            <h3
              className="article-title-carousel"
              dangerouslySetInnerHTML={{ __html: stripHtml(titleText) }}
            />
          </Link>

          <div className="article-meta-carousel">
            <span className="article-author-carousel">
              BY {(currentArticle.author_name || "LASTNAME").toUpperCase()}
            </span>
            <div className="meta-divider"></div>
            <span className="article-date-carousel">
              {formatDate(currentArticle.date).toUpperCase()}
            </span>
          </div>

          <div
            className="article-excerpt-carousel"
            dangerouslySetInnerHTML={{
              __html: truncateText(stripHtml(excerptText), 400),
            }}
          />
        </div>

        {/* Article Image */}
        <div className="article-image-container-carousel">
          {currentArticle.featured_media_obj?.source_url ? (
            <Image
              src={currentArticle.featured_media_obj.source_url}
              alt={stripHtml(titleText)}
              width={714}
              height={586}
              className="article-image-carousel"
            />
          ) : (
            <div className="article-image-placeholder">
              <span>No Image</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation and Progress */}
      <div className="carousel-navigation">
        <button
          className="nav-button nav-prev"
          onClick={prevSlide}
          aria-label="Previous article"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="progress-container">
          {articles.map((_, index) => (
            <button
              key={index}
              className={`progress-bar ${
                index === currentIndex ? "active" : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to article ${index + 1}`}
            />
          ))}
        </div>

        <button
          className="nav-button nav-next"
          onClick={nextSlide}
          aria-label="Next article"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom divider line */}
      <div className="carousel-bottom-divider"></div>
    </div>
  );
};

export default ArticleCarousel;
