import React from "react";
import classNames from "classnames";
import { EnhancedPost } from "../../lib/types";
import { LargeArticlePreview, SmallArticlePreview } from "../ArticlePreviews";
import "./LatestIssueGrid.css";

export interface LatestIssueGridProps {
  posts: EnhancedPost[];
  title?: string;
  className?: string;
  maxPosts?: number;
}

const LatestIssueGrid: React.FC<LatestIssueGridProps> = ({
  posts = [],
  title = "Latest Issue",
  className = "",
  maxPosts = 4,
}) => {
  if (!posts || posts.length === 0) {
    return null;
  }
  const displayPosts = posts.slice(0, maxPosts);
  const [featured, ...rest] = displayPosts;
  const smalls = rest.slice(0, 3);

  return (
    <section className={classNames("latest-issue-grid-section", className)}>
      {title && <h2 className="latest-issue-title">{title}</h2>}
      <div className="latest-issue-grid">
        <div className="latest-issue-featured">
          {featured && (
            <LargeArticlePreview
              post={featured}
              showExcerpt
              imageAspectRatio="1/1"
            />
          )}
        </div>
        <div className="latest-issue-smalls">
          {smalls.map((post) => (
            <SmallArticlePreview
              key={post.id}
              post={post}
              layout="horizontal"
              showExcerpt={true}
              imageSize="small"
              className="latest-issue-small"
            />
          ))}
          <button className="latest-issue-readmore" type="button">
            Read more
          </button>
        </div>
      </div>
    </section>
  );
};

export default LatestIssueGrid;
