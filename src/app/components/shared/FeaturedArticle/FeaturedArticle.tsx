
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
import "./FeaturedArticle.css";

export interface FeaturedArticleProps {
  article: EnhancedPost;
  excerptLength?: number;
  imagePosition?: "top" | "left" | "right";
  variant?: "default" | "large" | "compact" | "preview-grid";
  showImage?: boolean;
  className?: string;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({
  article,
  excerptLength = 300,
  imagePosition = "top",
  variant = "default",
  showImage = true,
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
    <div className="featured-article-image-container">
      <ArticleMedia article={article} className="featured-article-image" sizes="(max-width: 768px) 100vw, 50vw" priority />
    </div>
  );

  const textContent = (
    <div className="featured-article-content article-card-content-stack">
      <h3
        className="featured-article-title"><ArticleTitle html={title} /></h3>

      <div className="article-byline-group">
        <div className="featured-article-meta">
          <span className="featured-article-author">{getAuthorName(article).toUpperCase()}</span>
          {formattedDate ? <>
            <span className="featured-article-meta-divider" aria-hidden="true">·</span>
            <time className="featured-article-date" dateTime={article.date}>{formattedDate}</time>
          </> : null}
        </div>
        <CategoryPills categories={article.categories_obj} />
      </div>
      <div className="featured-article-excerpt">{excerpt}</div>
    </div>
  );

  const titleText = stripHtml(title);

  return (
    <article
      className={`article-card-frame featured-article variant-${variant} image-${imagePosition} ${className}`}
    >
      <Link
        href={articleLink}
        className="article-card-stretch-link"
        aria-label={titleText}
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
          {textContent}
          {imageContent}
        </>
      )}
    </article>
  );
};

export default FeaturedArticle;
