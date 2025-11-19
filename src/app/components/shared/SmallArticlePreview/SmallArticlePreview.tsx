"use client";

import React from "react";
import Link from "next/link";
import { EnhancedPost } from "../../../lib/types";
import {
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
} from "../../../lib/utils";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import "./SmallArticlePreview.css";

export interface SmallArticlePreviewProps {
  article: EnhancedPost;
  excerptLength?: number;
  showImage?: boolean;
  imagePosition?: "left" | "right";
  variant?: "default" | "compact" | "sidebar" | "preview-grid";
  className?: string;
}

const SmallArticlePreview: React.FC<SmallArticlePreviewProps> = ({
  article,
  excerptLength = 150,
  showImage = true,
  imagePosition = "left",
  variant = "default",
  className = "",
}) => {
  const articleLink = getArticleLink(article);
  const rawTitle = getArticleTitle(article);
  const title = truncateText(stripHtml(rawTitle), 80);
  const authorName = truncateText(
    (article?.author_name || "LASTNAME").toUpperCase(),
    25
  );
  const excerpt = truncateText(
    stripHtml(article?.excerpt?.rendered || ""),
    excerptLength
  );

  const imageContent = showImage && (
    <div className="small-article-image-container">
      {article?.featured_media_obj?.source_url ? (
        <OptimizedImage
          src={article.featured_media_obj.source_url}
          alt={stripHtml(title)}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="small-article-image"
          showPlaceholder={true}
        />
      ) : (
        <div className="small-article-image-placeholder"></div>
      )}
    </div>
  );

  const textContent = (
    <div className="small-article-content">
      <h4
        className="small-article-title"
        dangerouslySetInnerHTML={{ __html: title }}
      ></h4>
      <div className="small-article-meta">
        <span className="small-article-author">BY {authorName}</span>
      </div>
      {variant !== "preview-grid" && (
        <div
          className="small-article-excerpt"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        ></div>
      )}
    </div>
  );

  return (
    <article
      className={`small-article-preview variant-${variant} image-${imagePosition} ${className}`}
    >
      <Link href={articleLink} style={{ display: "contents" }}>
        {imagePosition === "left" ? (
          <>
            {imageContent}
            {textContent}
          </>
        ) : (
          <>
            {textContent}
            {imageContent}
          </>
        )}
      </Link>
    </article>
  );
};

export default SmallArticlePreview;
