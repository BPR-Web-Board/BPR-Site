"use client";

import React from "react";
import Image from "next/image";
import { EnhancedPost } from "../../../lib/types";
import {
  stripHtml,
  truncateText,
  getArticleTitle,
} from "../../../lib/utils";
import "./LargePodcastCard.css";

export interface LargePodcastCardProps {
  podcast: EnhancedPost;
  excerptLength?: number;
  duration?: string;
  className?: string;
}

const LargePodcastCard: React.FC<LargePodcastCardProps> = ({
  podcast,
  excerptLength = 200,
  duration,
  className = "",
}) => {
  const title = getArticleTitle(podcast);
  const excerpt = truncateText(
    stripHtml(podcast?.excerpt?.rendered || ""),
    excerptLength
  );

  // Extract duration from meta or use provided prop
  const podcastDuration = duration || (podcast?.meta?.duration as string);

  // Format date
  const formattedDate = new Date(podcast.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className={`large-podcast-card ${className}`}>
      <div className="large-podcast-card-date">{formattedDate}</div>

      <div className="large-podcast-card-image-container">
        {podcast?.featured_media_obj?.source_url ? (
          <Image
            src={podcast.featured_media_obj.source_url}
            alt={stripHtml(title)}
            fill
            className="large-podcast-card-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          />
        ) : (
          <div className="large-podcast-card-image-placeholder">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="podcast-icon"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                d="M12 6v6l4 2"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="large-podcast-card-content">
        <h3 className="large-podcast-card-title">{title}</h3>

        {podcastDuration && (
          <div className="large-podcast-card-duration">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="clock-icon"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {podcastDuration}
          </div>
        )}

        <p className="large-podcast-card-excerpt">{excerpt}</p>
      </div>
    </article>
  );
};

export default LargePodcastCard;
