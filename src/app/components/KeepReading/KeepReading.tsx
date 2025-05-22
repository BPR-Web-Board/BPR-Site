import React from "react";
import Link from "next/link";
import Image from "next/image";
import classNames from "classnames";
import "./KeepReading.css";
import { EnhancedPost } from "../../lib/types";
// import { ImagePlaceholder } from "../ImagePlaceholder"; // Uncomment if exists

export interface KeepReadingProps {
  posts: EnhancedPost[];
  title?: string;
  maxPosts?: number;
  showExcerpts?: boolean;
  className?: string;
}

const KeepReadingArticlePreview: React.FC<{
  post: EnhancedPost;
  showExcerpt: boolean;
}> = ({ post, showExcerpt }) => {
  // Determine section from post categories or metadata
  let section = "world";
  if (Array.isArray(post.categories) && post.categories.length > 0) {
    // If categories is array of objects with slug
    if (typeof post.categories[0] === "object" && post.categories[0] !== null && "slug" in post.categories[0]) {
      section = (post.categories[0] as any).slug || "world";
    }
  }
  // Fallback to 'world' if not found
  const href = `/${section}/article/${post.slug}`;
  const author = post.author_name || post.author_obj?.name || "STAFF WRITER";
  const excerpt = typeof post.excerpt === "object" && post.excerpt !== null ? post.excerpt.rendered : post.excerpt || "";
  const hasImage = !!(post.featured_media_obj && post.featured_media_obj.source_url);
  const imageUrl = hasImage ? post.featured_media_obj!.source_url : undefined;
  const imageAlt = hasImage ? (post.featured_media_obj!.alt_text || (typeof post.title === "object" && post.title ? post.title.rendered : String(post.title)) || "Article image") : "";
  const titleText = typeof post.title === "object" && post.title !== null ? post.title.rendered : String(post.title);
  return (
    <article className="article-preview">
      <Link href={href} aria-label={titleText}>
        <div className="article-image">
          {hasImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{ objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <div className="image-placeholder" aria-hidden="true" />
          )}
        </div>
        <h3 className="article-title">{titleText}</h3>
      </Link>
      <div className="article-byline">
        BY {author.toUpperCase()}
      </div>
      {showExcerpt && excerpt && (
        <div className="article-excerpt" dangerouslySetInnerHTML={{ __html: excerpt }} />
      )}
    </article>
  );
};

export const KeepReading: React.FC<KeepReadingProps> = ({
  posts,
  title = "Keep Reading",
  maxPosts = 8,
  showExcerpts = true,
  className = "",
}) => {
  if (!posts || posts.length === 0) return null;
  return (
    <section className={classNames("keep-reading", className)}>
      <h2 className="keep-reading-title">{title}</h2>
      <div className="keep-reading-grid">
        {posts.slice(0, maxPosts).map((post) => (
          <KeepReadingArticlePreview key={post.id} post={post} showExcerpt={showExcerpts} />
        ))}
      </div>
    </section>
  );
};

export default KeepReading;
