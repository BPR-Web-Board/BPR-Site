import React from "react";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";
import { EnhancedPost } from "../../lib/types";
import "./ArticlePreviews.css";

export interface SmallArticlePreviewProps {
  post: EnhancedPost;
  layout?: "horizontal" | "vertical";
  className?: string;
  showExcerpt?: boolean;
  imageSize?: "small" | "medium";
}

const SmallArticlePreview: React.FC<SmallArticlePreviewProps> = ({
  post,
  layout = "vertical",
  className = "",
  showExcerpt = false,
  imageSize = "medium",
}) => {
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

  // Image size class
  const imageSizeClass = imageSize === "small" ? "img-small" : "img-medium";

  return (
    <article className={classNames("small-article-preview", layout, className)}>
      <Link href={href} aria-label={titleText} className="article-link">
        <div className={classNames("article-image", imageSizeClass, layout === "horizontal" ? "aspect-1-1" : "aspect-16-9")}> 
          {hasImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes={imageSize === "small" ? "160px" : "320px"}
              style={{ objectFit: "cover" }}
              loading="lazy"
              className="article-img"
            />
          ) : (
            <div className="image-placeholder" aria-hidden="true" />
          )}
        </div>
        <div className="small-article-content">
          <h3 className="article-title small-title">{titleText}</h3>
          <div className="article-byline">BY {author.toUpperCase()}</div>
          {showExcerpt && excerpt && (
            <div className="article-excerpt excerpt-truncate" dangerouslySetInnerHTML={{ __html: excerpt }} />
          )}
        </div>
      </Link>
    </article>
  );
};

export default SmallArticlePreview;
