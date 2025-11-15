"use client";

import React from "react";
import { EnhancedPost } from "../../../lib/types";
import {
  stripHtml,
  truncateText,
  getArticleTitle,
} from "../../../lib/utils";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
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

  const imageContent = showImage && (
    <div className={`podcast-card-image-container image-${imagePosition}`}>
      {podcast?.featured_media_obj?.source_url ? (
        <OptimizedImage
          src={podcast.featured_media_obj.source_url}
          alt={stripHtml(title)}
          fill
          className="podcast-card-image"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          showPlaceholder={true}
        />
      ) : (
        <div className="podcast-card-image-placeholder">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="podcast-icon"
          >
            <path d="M9 18v-6m6 6v-6m-9 0a3 3 0 0 1 6 0m-6 0a3 3 0 0 0 6 0m-9 0c0-1.1.9-2 2-2s2 .9 2 2m6 0c0-1.1.9-2 2-2s2 .9 2 2" />
          </svg>
        </div>
      )}
    </div>
  );

  const textContent = (
    <div className="podcast-card-content">
      <h3 className={`podcast-card-title variant-${variant}`}>{title}</h3>

      <div className="podcast-card-meta">
        <span className="podcast-card-author">
          BY {(podcast?.author_name || "LASTNAME").toUpperCase()}
        </span>
        {podcastDuration && showDuration && (
          <span className="podcast-card-duration">{podcastDuration}</span>
        )}
      </div>

      {showExcerpt && <div className="podcast-card-excerpt">{excerpt}</div>}

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

  return (
    <article
      className={`podcast-card variant-${variant} image-position-${imagePosition} ${className}`}
    >
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
    </article>
  );
};

// Helper function to extract Spotify URL from post content
function extractSpotifyUrl(content: string): string | undefined {
  const spotifyRegex = /(?:https?:\/\/)?(?:www\.)?spotify\.com\/[^\s"<>)]+/g;
  const matches = content.match(spotifyRegex);
  if (matches && matches.length > 0) {
    return matches[0].startsWith("http")
      ? matches[0]
      : `https://${matches[0]}`;
  }
  return undefined;
}

export default PodcastCard;
