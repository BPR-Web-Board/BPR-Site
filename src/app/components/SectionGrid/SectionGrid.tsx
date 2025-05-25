import React from "react";
import classNames from "classnames";
import { EnhancedPost } from "../../lib/types";
import { LargeArticlePreview, SmallArticlePreview } from "../ArticlePreviews";
import "./SectionGrid.css";

export interface SectionGridProps {
  posts: EnhancedPost[];
  sectionTitle: string;
  className?: string;
  maxPosts?: number;
  gridColumns?: 2 | 3 | 4; // Allow flexibility for other sections
}

const SectionGrid: React.FC<SectionGridProps> = ({
  posts = [],
  sectionTitle,
  className = "",
  maxPosts = 8, // Default to 1 large + 7 small articles
  gridColumns = 2,
}) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  // Limit posts to the maximum specified
  const displayPosts = posts.slice(0, maxPosts);

  // The first post is the featured one, the rest are small
  const [featured, ...smallPosts] = displayPosts;

  // Split small posts between left and right columns
  const leftColumnSmallPosts = smallPosts.slice(0, 2);
  const rightColumnSmallPosts = smallPosts.slice(2);

  return (
    <section className={classNames("section-grid", className)}>
      {sectionTitle && <h2 className="section-title">{sectionTitle}</h2>}
      <div className="section-grid-layout">
        {/* Left column with featured article and 2 small articles */}
        <div className="section-grid-left">
          {featured && (
            <div className="section-grid-featured">
              <LargeArticlePreview
                post={featured}
                showExcerpt
                imageAspectRatio="1/1"
              />
            </div>
          )}
          <div className="section-grid-left-smalls">
            {leftColumnSmallPosts.map((post) => (
              <div key={post.id} className="small-article-wrapper">
                <SmallArticlePreview
                  post={post}
                  layout="horizontal"
                  showExcerpt={false}
                  imageSize="small"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right column with 5 small articles */}
        <div className="section-grid-right">
          <div className="section-grid-right-smalls">
            {rightColumnSmallPosts.map((post) => (
              <div key={post.id} className="small-article-wrapper">
                <SmallArticlePreview
                  post={post}
                  layout="horizontal"
                  showExcerpt={false}
                  imageSize="small"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionGrid;
