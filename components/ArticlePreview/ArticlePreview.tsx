import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Post, Author, Category, FeaturedMedia } from "@/lib/wordpress.d";
import { cn } from "@/lib/utils";
import styles from "./ArticlePreview.module.css";

export type ArticlePreviewProps = {
  post: Post;
  author?: Author;
  category?: Category;
  featuredMedia?: FeaturedMedia;
  className?: string;
  variant?: "featured" | "standard" | "list" | "compact";
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
};

const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  post,
  author,
  category,
  featuredMedia,
  className,
  variant = "standard",
  showExcerpt = false,
  showAuthor = false,
  showDate = false,
  showCategory = false,
}) => {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Remove HTML tags from excerpt
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "");
  };

  // Build URL for the article
  const getArticleUrl = () => {
    // Default section based on category
    let section = "world";

    if (category) {
      // Map category to appropriate section
      if (["us", "world", "magazine", "interviews"].includes(category.slug)) {
        section = category.slug;
      }
    }

    return `/${section}/${post.slug}`;
  };

  // Classes based on variant
  const containerClasses = cn(
    styles.article,
    {
      [styles.featured]: variant === "featured",
      [styles.standard]: variant === "standard",
      [styles.list]: variant === "list",
      [styles.compact]: variant === "compact",
    },
    className
  );

  return (
    <article className={containerClasses}>
      <Link href={getArticleUrl()} className={styles.articleLink}>
        {featuredMedia && (
          <div className={styles.imageContainer}>
            <Image
              src={featuredMedia.source_url}
              alt={featuredMedia.alt_text || post.title.rendered}
              width={featuredMedia.media_details.width}
              height={featuredMedia.media_details.height}
              className={styles.image}
              priority={variant === "featured"}
            />
          </div>
        )}

        <div className={styles.content}>
          {showCategory && category && (
            <span className={styles.category}>{category.name}</span>
          )}

          <h2 className={styles.title}>{post.title.rendered}</h2>

          {showExcerpt && post.excerpt.rendered && (
            <p className={styles.excerpt}>{stripHtml(post.excerpt.rendered)}</p>
          )}

          <div className={styles.meta}>
            {showAuthor && author && (
              <span className={styles.author}>By {author.name}</span>
            )}

            {showDate && (
              <span className={styles.date}>
                {showAuthor && author ? " • " : ""}
                {formatDate(post.date)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ArticlePreview;
