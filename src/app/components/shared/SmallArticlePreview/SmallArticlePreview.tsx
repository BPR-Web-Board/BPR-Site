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
  const title = getArticleTitle(article);
  const excerpt = truncateText(
    stripHtml(article?.excerpt?.rendered || ""),
    excerptLength
  );

  const imageContent = showImage && (
    <div className="small-article-image-container">
      {article?.featured_media_obj?.source_url ? (
        <Image
          src={article.featured_media_obj.source_url}
          alt={stripHtml(title)}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="small-article-image"
        />
      ) : (
        <div className="small-article-image-placeholder"></div>
      )}
    </div>
  );

  const textContent = (
    <div className="small-article-content">
      <Link href={articleLink} className="small-article-title-link">
        <h4
          className="small-article-title"
          dangerouslySetInnerHTML={{ __html: title }}
        ></h4>
      </Link>
      <div className="small-article-meta">
        <span className="small-article-author">
          BY {(article?.author_name || "LASTNAME").toUpperCase()}
        </span>
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
    </article>
  );
};

export default SmallArticlePreview;
