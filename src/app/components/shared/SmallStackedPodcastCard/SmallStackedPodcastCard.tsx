"use client";

import React from "react";
import Image from "next/image";
import { EnhancedPost } from "../../../lib/types";
import {
  stripHtml,
  getArticleTitle,
} from "../../../lib/utils";
import "./SmallStackedPodcastCard.css";

export interface SmallStackedPodcastCardProps {
  podcast: EnhancedPost;
  duration?: string;
  className?: string;
}

const SmallStackedPodcastCard: React.FC<SmallStackedPodcastCardProps> = ({
  podcast,
  duration,
  className = "",
}) => {
  const title = getArticleTitle(podcast);

  // Extract duration from meta or use provided prop
  const podcastDuration = duration || (podcast?.meta?.duration as string);

  // Format date
  const formattedDate = new Date(podcast.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className={`small-stacked-podcast-card ${className}`}>
      <div className="small-stacked-podcast-card-image-container">
        {podcast?.featured_media_obj?.source_url ? (
          <Image
            src={podcast.featured_media_obj.source_url}
            alt={stripHtml(title)}
            fill
            className="small-stacked-podcast-card-image"
            sizes="(max-width: 768px) 30vw, 20vw"
          />
        ) : (
          <div className="small-stacked-podcast-card-image-placeholder">
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

      <div className="small-stacked-podcast-card-content">
        <div className="small-stacked-podcast-card-date">{formattedDate}</div>
        <h3 className="small-stacked-podcast-card-title">{title}</h3>
        {podcastDuration && (
          <div className="small-stacked-podcast-card-duration">
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
      </div>
    </article>
  );
};

export default SmallStackedPodcastCard;
