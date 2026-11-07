
import ArticleTitle from "../ArticleTitle/ArticleTitle";

import CategoryPills from "../CategoryPills/CategoryPills";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../../lib/types";
import { getAuthorName, formatArchiveDate,
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
} from "../../../lib/utils";
import ArticleMedia from "../ArticleMedia/ArticleMedia";
import "./LargeArticlePreview.css";

export interface LargeArticlePreviewProps {
  article: EnhancedPost;
  excerptLength?: number;
  variant?: "default" | "compact";
  imagePosition?: "top" | "left" | "right";
  className?: string;
}

const LargeArticlePreview: React.FC<LargeArticlePreviewProps> = ({
  article,
  excerptLength = 150,
  variant = "default",
  imagePosition = "top",
  className = "",
}) => {
  const articleLink = getArticleLink(article);
  const rawTitle = getArticleTitle(article);
  const title = stripHtml(rawTitle);
  const authorName = truncateText(
    getAuthorName(article).toUpperCase(),
    30
  );

  const formattedDate = formatArchiveDate(article.date || "");

  // Extract excerpt
  const fullExcerpt = stripHtml(article?.excerpt?.rendered || "");
  const excerpt = truncateText(fullExcerpt, excerptLength);

  // Check if article has Spotify embed
  const spotifyLink =
    (article?.meta?.spotify_url as string) ||
    extractSpotifyUrl(article.content?.rendered || "");

  // Extract duration from meta
  const podcastDuration = article?.meta?.duration as string;

  // Check if this is a BPRadio/podcast article
  const isPodcast =
    article?.categories_obj?.some(
      (cat) => cat.slug === "bpradio" || cat.slug === "bpr-prodcast"
    ) || spotifyLink;

  // For compact variant, show play button on image; for default, show in metadata
  const showPlayButtonOnImage = variant === "compact";

  return (
    <article
      className={`article-card-frame large-article-preview variant-${variant} image-position-${imagePosition} ${
        isPodcast && spotifyLink ? "has-podcast" : ""
      } ${className}`}
    >
      <Link
        href={articleLink}
        className="article-card-stretch-link"
        aria-label={title}
      />
      <div className="large-article-preview-link">
        <div className="large-article-preview-image-container">
          <ArticleMedia article={article} className="large-article-preview-image" sizes="(max-width: 768px) 100vw, 50vw" />
          {isPodcast && spotifyLink && showPlayButtonOnImage && (
            <div className="podcast-play-button-overlay">
              <div className="podcast-play-button">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="large-article-preview-content article-card-content-stack">
          <h3
            className="large-article-preview-title"><ArticleTitle html={title} /></h3>

          <div className="article-byline-group">
            <div className="large-article-preview-meta">
              <span className="large-article-preview-author">
                {authorName}
              </span>
              {formattedDate && <>
                <span className="large-article-preview-meta-divider" aria-hidden="true">·</span>
                <time className="large-article-preview-date" dateTime={article.date}>{formattedDate}</time>
              </>}
            </div>
            <CategoryPills categories={article.categories_obj} />
          </div>

          <div className="large-article-preview-excerpt">{excerpt}</div>
          {isPodcast && spotifyLink && !showPlayButtonOnImage && (
            <div className="podcast-inline-player">
              <div className="podcast-play-icon-inline">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="podcast-duration-inline">
                {podcastDuration || "Podcast"}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// Helper function to extract Spotify URL from post content
function extractSpotifyUrl(content: string): string | undefined {
  // Check for Spotify iframes first (most common in WordPress)
  const iframeRegex =
    /<iframe[^>]*src=["']([^"']*spotify\.com[^"']*)["'][^>]*>/i;
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

export default LargeArticlePreview;
