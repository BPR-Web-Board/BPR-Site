import React from "react";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";
import { EnhancedPost } from "../../lib/types";
import "./ArticlePreviews.css";

export interface LargeArticlePreviewProps {
  post: EnhancedPost;
  className?: string;
  showExcerpt?: boolean;
  imageAspectRatio?: "16/9" | "4/3" | "1/1";
}

const LargeArticlePreview: React.FC<LargeArticlePreviewProps> = ({
  post,
  className = "",
  showExcerpt = false,
  imageAspectRatio = "16/9",
}) => {
  // Section/slug logic
  let section = "world";
  if (Array.isArray(post.categories) && post.categories.length > 0) {
    if (
      typeof post.categories[0] === "object" &&
      post.categories[0] !== null &&
      "slug" in post.categories[0]
    ) {
      section = (post.categories[0] as any).slug || "world";
    }
  }
  const href = `/${section}/article/${post.slug}`;
  const author = post.author_name || post.author_obj?.name || "STAFF WRITER";
  const excerpt = typeof post.excerpt === "object" && post.excerpt !== null ? post.excerpt.rendered : post.excerpt || "";
  const hasImage = !!(post.featured_media_obj && post.featured_media_obj.source_url);
  const imageUrl = hasImage ? post.featured_media_obj!.source_url : undefined;
  const imageAlt = hasImage ? (post.featured_media_obj!.alt_text || (typeof post.title === "object" && post.title ? post.title.rendered : String(post.title)) || "Article image") : "";
  const titleText = typeof post.title === "object" && post.title !== null ? post.title.rendered : String(post.title);

  // Aspect ratio class
  const aspectClass = {
    "16/9": "aspect-16-9",
    "4/3": "aspect-4-3",
    "1/1": "aspect-1-1",
  }[imageAspectRatio];

  return (
    <article className={classNames("large-article-preview", className)}>
      <Link href={href} aria-label={titleText} className="article-link">
        <div className={classNames("article-image", aspectClass)}>
          {hasImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
              style={{ objectFit: "cover" }}
              loading="lazy"
              className="article-img"
            />
          ) : (
            <div className="image-placeholder" aria-hidden="true" />
          )}
        </div>
        <h2 className="article-title large-title">{titleText}</h2>
      </Link>
      <div className="article-byline">BY {author.toUpperCase()}</div>
      {showExcerpt && excerpt && (
        <div className="article-excerpt" dangerouslySetInnerHTML={{ __html: excerpt }} />
      )}
    </article>
  );
};

export default LargeArticlePreview;
