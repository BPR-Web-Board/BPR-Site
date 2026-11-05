
import CategoryPills from "../shared/CategoryPills/CategoryPills";
import ArticleTitle from "../shared/ArticleTitle/ArticleTitle";

import React from "react";
import { EnhancedPost } from "../../lib/types";
import { getAuthorName, getArticleTitle, formatArchiveDate } from "../../lib/utils";
import ArticleMedia from "../shared/ArticleMedia/ArticleMedia";
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
  const formattedDate = formatArchiveDate(podcast.date || "");
  const podcastDuration = duration || (podcast?.meta?.duration as string);
  const spotifyLink =
    spotifyUrl ||
    (podcast?.meta?.spotify_url as string) ||
    extractSpotifyUrl(podcast.content?.rendered || "");

  return (
    <section className={`featured-podcast ${className}`}>
      <div className="featured-podcast-container article-card-frame">
        <div className="featured-podcast-image-wrapper">
          <ArticleMedia article={podcast} className="featured-podcast-image" fallbackType="audio"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw" />
        </div>

        <div className="featured-podcast-content article-card-content-stack">
          <h2
            className="featured-podcast-title"><ArticleTitle html={title} /></h2>

          <div className="featured-podcast-meta">
            <span className="featured-podcast-author">
              {getAuthorName(podcast).toUpperCase()}
            </span>
            {formattedDate ? <>
              <span className="featured-podcast-meta-divider" aria-hidden="true">·</span>
              <time className="featured-podcast-date" dateTime={podcast.date}>{formattedDate}</time>
            </> : null}
            {podcastDuration && (
              <span className="featured-podcast-duration">
                {podcastDuration}
              </span>
            )}
          </div>



          <CategoryPills categories={podcast.categories_obj} />

          <div
            className="featured-podcast-excerpt"
            dangerouslySetInnerHTML={{
              __html: podcast?.excerpt?.rendered || "",
            }}
          ></div>

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
    return matches[0].startsWith("http") ? matches[0] : `https://${matches[0]}`;
  }
  return undefined;
}

export default FeaturedPodcast;
