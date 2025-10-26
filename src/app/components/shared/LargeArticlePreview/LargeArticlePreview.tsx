"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { EnhancedPost } from "../../../lib/types";
import {
  stripHtml,
  truncateText,
  getArticleTitle,
  getArticleLink,
} from "../../../lib/utils";
import "./LargeArticlePreview.css";

export interface LargeArticlePreviewProps {
  article: EnhancedPost;
  excerptLength?: number;
  variant?: "default" | "compact";
  imagePosition?: "top" | "left" | "right";
  className?: string;
}

const LargeArticlePreview: React.FC<LargeArticlePreviewProps> = ({
  article,
  excerptLength = 150,
  variant = "default",
  imagePosition = "top",
  className = "",
}) => {
  const articleLink = getArticleLink(article);
  const rawTitle = getArticleTitle(article);
  const title = truncateText(stripHtml(rawTitle), 120);
  const authorName = truncateText(
    (article?.author_name || "LASTNAME").toUpperCase(),
    30
  );

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  const formattedDate = formatDate(article?.date || new Date().toISOString());

  // Extract excerpt
  const fullExcerpt = stripHtml(article?.excerpt?.rendered || "");
  const excerpt = truncateText(fullExcerpt, excerptLength);

  return (
    <article className={`large-article-preview variant-${variant} image-position-${imagePosition} ${className}`}>
      <Link href={articleLink} className="large-article-preview-link">
        {/* Image Container */}
        <div className="large-article-preview-image-container">
          {article?.featured_media_obj?.source_url ? (
            <Image
              src={article.featured_media_obj.source_url}
              alt={stripHtml(title)}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="large-article-preview-image"
              priority
            />
          ) : (
            <div className="large-article-preview-image-placeholder"></div>
          )}
        </div>

        {/* Content Container */}
        <div className="large-article-preview-content">
          <h3
            className="large-article-preview-title"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          <div className="large-article-preview-meta">
            <span className="large-article-preview-author">BY {authorName}</span>
            <span className="large-article-preview-meta-divider"></span>
            <span className="large-article-preview-date">{formattedDate}</span>
          </div>

          <div
            className="large-article-preview-excerpt"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        </div>
      </Link>
    </article>
  );
};

export default LargeArticlePreview;
