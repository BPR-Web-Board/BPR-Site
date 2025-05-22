"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ImageWithCaptionProps,
  PullQuoteProps,
  ArticleMetaProps,
} from "@/app/lib/types";

/**
 * Image component with caption and credit
 */
export const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({
  src,
  alt,
  width = 1200,
  height = 800,
  caption,
  credit,
  priority = false,
  className = "",
}) => {
  return (
    <figure className={`article-image-container ${className}`}>
      <div className="article-image-wrapper">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="article-image"
        />
      </div>

      {(caption || credit) && (
        <figcaption className="article-image-caption">
          {caption && (
            <span
              className="caption-text"
              dangerouslySetInnerHTML={{ __html: caption }}
            />
          )}

          {credit && (
            <span className="image-credit">
              {caption ? " " : ""}
              {credit.toLowerCase().startsWith("illustration by") ||
              credit.toLowerCase().startsWith("photo by")
                ? credit
                : `Illustration by ${credit}`}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};

/**
 * Pull quote component with citation
 */
export const PullQuote: React.FC<PullQuoteProps> = ({
  content,
  citation,
  alignment = "center",
  className = "",
}) => {
  return (
    <blockquote
      className={`article-pull-quote article-pull-quote-${alignment} ${className}`}
    >
      <div
        className="pull-quote-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {citation && <cite className="pull-quote-citation">{citation}</cite>}
    </blockquote>
  );
};

/**
 * Article meta component (author, date, etc.)
 */
export const ArticleMeta: React.FC<ArticleMetaProps> = ({
  author,
  coAuthors = [],
  date,
  illustrator,
  categories = [],
  tags = [],
  className = "",
}) => {
  // Format publication date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className={`article-meta ${className}`}>
      <div className="article-author">
        <div className="byline">
          By{" "}
          {author.slug ? (
            <Link href={`/author/${author.slug}`} className="author-link">
              {author.name}
            </Link>
          ) : (
            <span>{author.name}</span>
          )}
          {/* Show co-authors if present */}
          {coAuthors.length > 0 && (
            <>
              {coAuthors.map((coAuthor, index) => (
                <React.Fragment key={`coauthor-${index}`}>
                  {index === 0
                    ? " and "
                    : index === coAuthors.length - 1
                    ? " and "
                    : ", "}
                  {coAuthor.slug ? (
                    <Link
                      href={`/author/${coAuthor.slug}`}
                      className="author-link"
                    >
                      {coAuthor.name}
                    </Link>
                  ) : (
                    <span>{coAuthor.name}</span>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      {illustrator && (
        <div className="article-illustrator">Illustration by {illustrator}</div>
      )}

      <time className="article-date" dateTime={date}>
        {formatDate(date)}
      </time>

      {categories.length > 0 && (
        <div className="article-section-indicator">
          {categories.map((category, index) => (
            <React.Fragment key={`category-${category}`}>
              <Link
                href={`/category/${category.toLowerCase()}`}
                className="section-link"
              >
                {category.toUpperCase()}
              </Link>
              {index < categories.length - 1 && " / "}
            </React.Fragment>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="article-tags">
          {tags.map((tag, index) => (
            <React.Fragment key={`tag-${tag}`}>
              <Link href={`/tag/${tag.toLowerCase()}`} className="tag-link">
                #{tag}
              </Link>
              {index < tags.length - 1 && " "}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Article Content component that handles embedded images and formatting
 */
export const ArticleContent: React.FC<{
  content: string;
  className?: string;
}> = ({ content, className = "" }) => {
  return (
    <div
      className={`article-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
