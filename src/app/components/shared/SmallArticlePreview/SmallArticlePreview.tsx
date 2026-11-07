
import ArticleTitle from "../ArticleTitle/ArticleTitle";

import CategoryPills from "../CategoryPills/CategoryPills";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../../lib/types";
import { getAuthorName,
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
  formatArchiveDate,
} from "../../../lib/utils";
import ArticleMedia from "../ArticleMedia/ArticleMedia";
import { getMediaPreview } from "../../../lib/mediaPreview";
import "./SmallArticlePreview.css";

export interface SmallArticlePreviewProps {
  article: EnhancedPost;
  excerptLength?: number;
  showImage?: boolean;
  imagePosition?: "left" | "right" | "top";
  variant?: "default" | "compact" | "sidebar" | "preview-grid";
  className?: string;
  showDate?: boolean;
  showExcerpt?: boolean;
}

const SmallArticlePreview: React.FC<SmallArticlePreviewProps> = ({
  article,
  excerptLength = 150,
  showImage = true,
  imagePosition = "left",
  variant = "default",
  className = "",
  showDate = true,
  showExcerpt = variant !== "preview-grid",
}) => {
  const articleLink = getArticleLink(article);
  const rawTitle = getArticleTitle(article);
  const title = stripHtml(rawTitle);
  const authorName = truncateText(
    getAuthorName(article).toUpperCase(),
    25
  );
  const formattedDate = formatArchiveDate(article?.date || "");
  const excerpt = truncateText(
    stripHtml(article?.excerpt?.rendered || ""),
    excerptLength
  );

  const imageContent = showImage && (!!article.featured_media_obj?.source_url || !!getMediaPreview(article)) && (
    <div className="small-article-image-container">
      <ArticleMedia article={article} className="small-article-image" sizes="(max-width: 768px) 100vw, 25vw" />
    </div>
  );

  const textContent = (
    <div className="small-article-content article-card-content-stack">
      <h4
        className="small-article-title"><ArticleTitle html={title} /></h4>
      <div className="article-byline-group">
        <div className="small-article-meta">
          <span className="small-article-author">{authorName}</span>
          {showDate && formattedDate ? <>
            <span className="small-article-meta-divider" aria-hidden="true">·</span>
            <time className="small-article-date" dateTime={article.date}>{formattedDate}</time>
          </> : null}
        </div>
        <CategoryPills categories={article.categories_obj} />
      </div>
      {showExcerpt && excerpt.trim() && (
        <div className="small-article-excerpt">{excerpt}</div>
      )}
    </div>
  );

  return (
    <article
      className={`article-card-frame small-article-preview variant-${variant} image-${imagePosition} ${className}`}
    >
      <Link
        href={articleLink}
        className="article-card-stretch-link"
        aria-label={title}
      />
      {imagePosition === "right" ? (
        <>
          {textContent}
          {imageContent}
        </>
      ) : (
        <>
          {imageContent}
          {textContent}
        </>
      )}
    </article>
  );
};

export default SmallArticlePreview;
