"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import { PodcastCard } from "../shared";
import "./PodcastGrid.css";

interface PodcastGridProps {
  podcasts: EnhancedPost[];
  title?: string;
  showTitle?: boolean;
  numberOfRows?: number;
  className?: string;
}

const PodcastGrid: React.FC<PodcastGridProps> = ({
  podcasts,
  title,
  showTitle = true,
  numberOfRows = 1,
  className = "",
}) => {
  if (!podcasts || podcasts.length === 0) {
    return (
      <div className={`podcast-grid ${className}`}>
        {showTitle && title && (
          <h2 className="podcast-grid-title">{title}</h2>
        )}
        <div className="podcast-grid-empty">No podcasts available</div>
      </div>
    );
  }

  // Calculate total podcasts needed (numberOfRows * 4)
  const totalPodcastsNeeded = numberOfRows * 4;

  // Take only the required number of podcasts (or however many are available)
  const displayPodcasts = podcasts.slice(0, totalPodcastsNeeded);

  // Fill with placeholders if we have fewer podcasts than needed
  while (displayPodcasts.length < totalPodcastsNeeded) {
    const placeholderPodcast: EnhancedPost = {
      id: -displayPodcasts.length - 1,
      date: new Date().toISOString(),
      date_gmt: new Date().toISOString(),
      guid: {
        rendered: "#",
      },
      modified: new Date().toISOString(),
      modified_gmt: new Date().toISOString(),
      slug: `placeholder-${displayPodcasts.length}`,
      status: "publish" as const,
      type: "post",
      link: "#",
      title: { rendered: "Coming Soon" },
      content: {
        rendered: "More episodes coming soon...",
        protected: false,
      },
      excerpt: {
        rendered:
          "Stay tuned for more exciting podcast episodes from Brown Political Review.",
        protected: false,
      },
      author: 1,
      featured_media: 0,
      format: "audio" as const,
      meta: {},
      categories: [],
      tags: [],
      author_name: "BPR",
      author_obj: null,
      featured_media_obj: null,
      categories_obj: [],
    };
    displayPodcasts.push(placeholderPodcast);
  }

  return (
    <div className={`podcast-grid ${className}`}>
      {showTitle && title && (
        <h2 className="podcast-grid-title">{title}</h2>
      )}

      <div className="podcasts-rows-container">
        {Array.from({ length: numberOfRows }, (_, rowIndex) => {
          const startIndex = rowIndex * 4;
          const endIndex = startIndex + 4;
          const rowPodcasts = displayPodcasts.slice(startIndex, endIndex);

          return (
            <div key={rowIndex}>
              {/* Add horizontal divider before each row except the first */}
              {rowIndex > 0 && <div className="podcast-row-divider" />}

              <div className="podcasts-grid">
                {rowPodcasts.map((podcast, index) => (
                  <PodcastCard
                    key={`${podcast.id}-${startIndex + index}`}
                    podcast={podcast}
                    variant="standard"
                    excerptLength={120}
                    imagePosition="top"
                    showDuration={true}
                    className="podcast-grid-card"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PodcastGrid;
