"use client";

import React from "react";
import Image from "next/image";
import { EnhancedPost } from "../../lib/types";
import {
  stripHtml,
  getArticleTitle,
} from "../../lib/utils";
import "./FeaturedPodcast.css";

interface FeaturedPodcastProps {
  podcast: EnhancedPost;
  spotifyUrl?: string;
  duration?: string;
  className?: string;
}

const FeaturedPodcast: React.FC<FeaturedPodcastProps> = ({
  podcast,
  spotifyUrl,
  duration,
  className = "",
}) => {
  const title = getArticleTitle(podcast);
  const podcastDuration = duration || (podcast?.meta?.duration as string);
  const spotifyLink =
    spotifyUrl ||
    (podcast?.meta?.spotify_url as string) ||
    extractSpotifyUrl(podcast.content?.rendered || "");

  return (
    <section className={`featured-podcast ${className}`}>
      <div className="featured-podcast-container">
        <div className="featured-podcast-image-wrapper">
          {podcast?.featured_media_obj?.source_url ? (
            <Image
              src={podcast.featured_media_obj.source_url}
              alt={stripHtml(title)}
              fill
              className="featured-podcast-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
              priority
            />
          ) : (
            <div className="featured-podcast-image-placeholder">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M9 18v-6m6 6v-6m-9 0a3 3 0 0 1 6 0m-6 0a3 3 0 0 0 6 0m-9 0c0-1.1.9-2 2-2s2 .9 2 2m6 0c0-1.1.9-2 2-2s2 .9 2 2" />
              </svg>
            </div>
          )}
        </div>

        <div className="featured-podcast-content">
          <h2 className="featured-podcast-title">{title}</h2>

          <div className="featured-podcast-meta">
            <span className="featured-podcast-author">
              BY {(podcast?.author_name || "LASTNAME").toUpperCase()}
            </span>
            {podcastDuration && (
              <span className="featured-podcast-duration">
                {podcastDuration}
              </span>
            )}
          </div>

          <div className="featured-podcast-date">
            {new Date(podcast.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <p className="featured-podcast-excerpt">
            {stripHtml(podcast?.excerpt?.rendered || "")}
          </p>

          {spotifyLink && (
            <a
              href={spotifyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="featured-podcast-listen-btn"
            >
              <span className="play-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              Listen on Spotify
            </a>
          )}
        </div>
      </div>
    </section>
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

export default FeaturedPodcast;
