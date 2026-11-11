
import ArticleTitle from "../ArticleTitle/ArticleTitle";

import CategoryPills from "../CategoryPills/CategoryPills";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../../lib/types";
import { getAuthorName, stripHtml, truncateText, getArticleTitle, formatArchiveDate } from "../../../lib/utils";
import ArticleMedia from "../ArticleMedia/ArticleMedia";
import "./PodcastCard.css";

export interface PodcastCardProps {
  podcast: EnhancedPost;
  variant?: "standard" | "compact" | "featured";
  showExcerpt?: boolean;
  excerptLength?: number;
  showImage?: boolean;
  showDuration?: boolean;
  duration?: string;
  spotifyUrl?: string;
  imagePosition?: "left" | "right" | "top";
  className?: string;
}

const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  variant = "standard",
  showExcerpt = true,
  excerptLength = 150,
  showImage = true,
  showDuration = true,
  duration,
  spotifyUrl,
  imagePosition = "top",
  className = "",
}) => {
  const title = getArticleTitle(podcast);
  const formattedDate = formatArchiveDate(podcast.date || "");
  const excerpt = truncateText(
    stripHtml(podcast?.excerpt?.rendered || ""),
    excerptLength
  );

  // Extract duration from meta or use provided prop
  const podcastDuration = duration || (podcast?.meta?.duration as string);

  // Extract Spotify URL from meta or content
  const spotifyLink =
    spotifyUrl ||
    (podcast?.meta?.spotify_url as string) ||
    extractSpotifyUrl(podcast.content?.rendered || "");

  // For compact variant, show play button on image; for standard/featured, show inline
  const showPlayButtonOnImage = variant === "compact";

  const imageContent = showImage && (
    <div className={`podcast-card-image-container image-${imagePosition}`}>
      <ArticleMedia article={podcast} className="podcast-card-image" fallbackType="audio"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
      {spotifyLink && showPlayButtonOnImage && (
        <div className={`podcast-play-button-overlay variant-${variant}`}>
          <div className="podcast-play-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  const textContent = (
    <div className="podcast-card-content article-card-content-stack">
      <h3
        className={`podcast-card-title variant-${variant}`}><ArticleTitle html={title} /></h3>

      <div className="article-byline-group">
        <div className="podcast-card-meta">
          <span className="podcast-card-author">
            {getAuthorName(podcast).toUpperCase()}
          </span>
          {formattedDate ? <>
            <span className="podcast-card-meta-divider" aria-hidden="true">·</span>
            <time className="podcast-card-date" dateTime={podcast.date}>{formattedDate}</time>
          </> : null}
          {podcastDuration && showDuration && variant === "compact" && (
            <span className="podcast-card-duration">{podcastDuration}</span>
          )}
        </div>
        <CategoryPills categories={podcast.categories_obj} />
      </div>



      {showExcerpt && (
        <div className="podcast-card-excerpt">{excerpt}</div>
      )}
          {spotifyLink && !showPlayButtonOnImage && (
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
          {showDuration && (
            <span className="podcast-duration-inline">
              {podcastDuration || "Podcast"}
            </span>
          )}
        </div>
      )}

      {spotifyLink && (
        <a
          href={spotifyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="podcast-card-spotify-link"
        >
          <span className="spotify-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.597-.12-.419.18-.78.597-.9 4.561-1.123 8.369-.645 11.366 1.348.46.28.75.84.47 1.29zm1.44-3.3c-.301.466-.841.68-1.344.68-.301 0-.603-.09-.901-.271-3.29-2.038-8.159-2.629-12.412-1.438-.479.13-.961-.167-1.09-.646-.13-.479.166-.962.646-1.092 4.749-1.348 9.869-.63 13.589 1.639.516.318.793 1.01.477 1.578z" />
            </svg>
          </span>
          Listen on Spotify
        </a>
      )}
    </div>
  );

  const cardContent = (
    <>
      {imagePosition === "top" && (
        <>
          {imageContent}
          {textContent}
        </>
      )}
      {imagePosition === "left" && (
        <>
          {imageContent}
          {textContent}
        </>
      )}
      {imagePosition === "right" && (
        <>
          {textContent}
          {imageContent}
        </>
      )}
    </>
  );

  return (
    <article
      className={`article-card-frame podcast-card variant-${variant} image-position-${imagePosition} ${
        spotifyLink ? "has-spotify" : ""
      } ${className}`}
    >
      {podcast.link ? (
        <Link
          href={podcast.link}
          className="article-card-stretch-link"
          aria-label={stripHtml(title)}
        />
      ) : null}
      {cardContent}
    </article>
  );
};

function extractSpotifyUrl(content: string): string | undefined {
  const iframeRegex =
    /<iframe[^>]*\b(?:data-src|src)=["']([^"']*spotify\.com[^"']*)["'][^>]*>/i;
  const iframeMatch = content.match(iframeRegex);
  if (iframeMatch?.[1]) {
    return iframeMatch[1].replace(/&amp;/g, "&");
  }

  const spotifyRegex =
    /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:embed\/)?(?:episode|show|track)\/[a-zA-Z0-9]+(?:\?[^\s"<>)]*)?/gi;
  const matches = content.match(spotifyRegex);
  if (matches?.length) {
    const url = matches[0];
    return url.startsWith("http") ? url : `https://${url}`;
  }

  return undefined;
}

export default PodcastCard;
