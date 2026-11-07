
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
import "./ArticleCard.css";

export interface ArticleCardProps {
  article: EnhancedPost;
  variant?: "standard" | "compact" | "featured";
  showExcerpt?: boolean;
  excerptLength?: number;
  showImage?: boolean;
  imagePosition?: "left" | "right" | "top";
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = "standard",
  showExcerpt = true,
  excerptLength = 200,
  showImage = true,
  imagePosition = "top",
  className = "",
}) => {
  const articleLink = getArticleLink(article);
  const title = getArticleTitle(article);
  const formattedDate = formatArchiveDate(article.date || "");
  const excerpt = truncateText(
    stripHtml(article?.excerpt?.rendered || ""),
    excerptLength
  );

  const imageContent = showImage && (!!article.featured_media_obj?.source_url || !!getMediaPreview(article)) && (
    <div className={`article-card-image-container image-${imagePosition}`}>
      <ArticleMedia article={article} className="article-card-image" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
    </div>
  );

  const textContent = (
    <div className="article-card-content article-card-content-stack">
      <h3
        className={`article-card-title variant-${variant}`}><ArticleTitle html={title} /></h3>

      <div className="article-byline-group">
        <div className="article-card-meta">
          <span className="article-card-author">
            {getAuthorName(article).toUpperCase()}
          </span>
          {formattedDate ? <>
            <span className="article-card-meta-divider" aria-hidden="true">·</span>
            <time className="article-card-date" dateTime={article.date}>{formattedDate}</time>
          </> : null}
        </div>
        <CategoryPills categories={article.categories_obj} />
      </div>

      {showExcerpt && excerpt && excerpt.trim() && (
        <div
          className="article-card-excerpt"
        >{excerpt}</div>
      )}
    </div>
  );

  return (
    <article
      className={`article-card-frame article-card variant-${variant} image-position-${imagePosition} ${className}`}
    >
      <Link
        href={articleLink}
        className="article-card-stretch-link"
        aria-label={stripHtml(title)}
      />
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
          {imageContent}
          {textContent}
        </>
      )}
    </article>
  );
};

export default ArticleCard;
