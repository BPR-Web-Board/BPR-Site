"use client";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import LargePodcastCard from "../shared/LargePodcastCard/LargePodcastCard";
import SmallStackedPodcastCard from "../shared/SmallStackedPodcastCard/SmallStackedPodcastCard";
import "./BeyondTheArticleSection.css";

interface BeyondTheArticleSectionProps {
  podcasts: EnhancedPost[];
  title?: string;
  showMoreButton?: boolean;
  moreButtonLink?: string;
  className?: string;
}

const BeyondTheArticleSection: React.FC<BeyondTheArticleSectionProps> = ({
  podcasts,
  title = "Beyond the Article",
  showMoreButton = true,
  moreButtonLink = "#",
  className = "",
}) => {
  if (!podcasts || podcasts.length === 0) {
    return null;
  }

  // Get the first podcast for the large card
  const largePodcast = podcasts[0];

  // Get up to 2 podcasts for the small stacked cards
  const smallPodcasts = podcasts.slice(1, 3);

  return (
    <section className={`beyond-the-article-section ${className}`}>
      <div className="beyond-the-article-container">
        <h2 className="beyond-the-article-title">{title}</h2>

        <div className="beyond-the-article-layout">
          {/* Left column - Large Podcast Card (60%) */}
          <div className="beyond-the-article-left">
            <LargePodcastCard podcast={largePodcast} />
          </div>

          {/* Right column - Two Small Stacked Podcast Cards (40%) */}
          <div className="beyond-the-article-right">
            {smallPodcasts.map((podcast, index) => (
              <SmallStackedPodcastCard
                key={podcast.id || index}
                podcast={podcast}
              />
            ))}
          </div>
        </div>

        {showMoreButton && (
          <a href={moreButtonLink} className="beyond-the-article-more-btn">
            More episodes
          </a>
        )}
      </div>
    </section>
  );
};

export default BeyondTheArticleSection;
