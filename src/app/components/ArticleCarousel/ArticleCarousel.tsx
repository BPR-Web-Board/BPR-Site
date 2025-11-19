"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EnhancedPost } from "../../lib/types";
import OptimizedImage from "../shared/OptimizedImage/OptimizedImage";
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

// Helper function to extract Spotify URL from post content
function extractSpotifyUrl(content: string): string | undefined {
  // Check for Spotify iframes first (most common in WordPress)
  const iframeRegex =
    /<iframe[^>]*src=["']([^"']*spotify\.com[^"']*)[""][^>]*>/i;
  const iframeMatch = content.match(iframeRegex);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // Check for direct Spotify URLs (including open.spotify.com/embed/)
  const spotifyRegex =
    /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:embed\/)?(?:episode|show|track)\/[a-zA-Z0-9]+(?:\?[^\s"<>)]*)?/gi;
  const matches = content.match(spotifyRegex);
  if (matches && matches.length > 0) {
    const url = matches[0];
    return url.startsWith("http") ? url : `https://${url}`;
  }

  return undefined;
}

const ArticleCarousel: React.FC<ArticleCarouselProps> = ({
  title,
  posts,
  maxArticles = 5,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollRef = React.useRef<NodeJS.Timeout | null>(null);

  // Limit articles to maxArticles
  const articles = posts.slice(0, maxArticles);

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === articles.length - 1 ? 0 : prevIndex + 1
    );
  }, [articles.length]);

  const prevSlide = React.useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? articles.length - 1 : prevIndex - 1
    );
  }, [articles.length]);

  const resetAutoScroll = React.useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    autoScrollRef.current = setInterval(nextSlide, 30000);
  }, [nextSlide]);

  const handleNext = () => {
    nextSlide();
    resetAutoScroll();
  };

  const handlePrev = () => {
    prevSlide();
    resetAutoScroll();
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetAutoScroll();
  };

  React.useEffect(() => {
    resetAutoScroll();
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [resetAutoScroll]);

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

  return (
    <div className="article-carousel">
      {/* Top divider line */}

      <div className="carousel-top-divider"></div>

      {/* Article Content */}
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {articles.map((article, index) => {
            const titleText =
              typeof article.title === "object"
                ? article.title.rendered
                : article.title;
            const excerptText =
              typeof article.excerpt === "object"
                ? article.excerpt.rendered
                : article.excerpt;

            return (
              <div className="carousel-slide" key={index}>
                <Link
                  href={`/${
                    article.categories_obj?.[0]?.slug || "world"
                  }/article/${article.slug}`}
                  style={{ display: "contents" }}
                >
                  <div className="carousel-content">
                    <div className="article-text-content">
                      <h3
                        className="article-title-carousel"
                        dangerouslySetInnerHTML={{ __html: titleText }}
                      />

                      <div className="article-meta-carousel">
                        <span className="article-author-carousel">
                          BY {(article.author_name || "LASTNAME").toUpperCase()}
                        </span>
                        <div className="meta-divider"></div>
                        <span className="article-date-carousel">
                          {formatDate(article.date).toUpperCase()}
                        </span>
                      </div>

                      {(() => {
                        // Check if article has Spotify embed
                        const spotifyLink =
                          (article?.meta?.spotify_url as string) ||
                          extractSpotifyUrl(article.content?.rendered || "");

                        // Check if this is a BPRadio/podcast article
                        const isPodcast =
                          article?.categories_obj?.some(
                            (cat) =>
                              cat.slug === "bpradio" ||
                              cat.slug === "bpr-prodcast"
                          ) || spotifyLink;

                        // Extract duration from meta
                        const podcastDuration = article?.meta
                          ?.duration as string;

                        return isPodcast && spotifyLink ? (
                          <div className="podcast-inline-player-carousel">
                            <div className="podcast-play-icon-inline-carousel">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <span className="podcast-duration-inline-carousel">
                              {podcastDuration || "Podcast"}
                            </span>
                          </div>
                        ) : null;
                      })()}

                      <div
                        className="article-excerpt-carousel"
                        dangerouslySetInnerHTML={{
                          __html: truncateText(excerptText, 400),
                        }}
                      />
                    </div>

                    {/* Article Image */}
                    <div className="article-image-container-carousel">
                      {article.featured_media_obj?.source_url ? (
                        <OptimizedImage
                          src={article.featured_media_obj.source_url}
                          alt={stripHtml(titleText)}
                          width={714}
                          height={586}
                          className="article-image-carousel"
                          showPlaceholder={true}
                        />
                      ) : (
                        <div className="article-image-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation and Progress */}
      <div className="carousel-navigation">
        <button
          className="nav-button nav-prev"
          onClick={handlePrev}
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
          onClick={handleNext}
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
