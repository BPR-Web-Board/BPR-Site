import React from "react";
import Link from "next/link";
import { ListArticlePreview } from "@/components/ArticlePreview";
import { Post, Author, FeaturedMedia } from "@/lib/wordpress.d";
import styles from "./LatestNews.module.css";

type LatestNewsProps = {
  posts: {
    post: Post;
    author: Author;
    media?: FeaturedMedia;
  }[];
  className?: string;
};

const LatestNews: React.FC<LatestNewsProps> = ({ posts, className }) => {
  // Format date like "March 8, 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`${styles.latestNews} ${className || ""}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>Latest</h2>

        {/* Add search functionality later */}
        <div className={styles.searchPlaceholder}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.5 16.5L11.5 11.5M13.5 7.5C13.5 10.8137 10.8137 13.5 7.5 13.5C4.18629 13.5 1.5 10.8137 1.5 7.5C1.5 4.18629 4.18629 1.5 7.5 1.5C10.8137 1.5 13.5 4.18629 13.5 7.5Z"
              stroke="#888"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Search</span>
        </div>
      </header>

      <div className={styles.articlesList}>
        {posts.map(({ post, author, media }) => (
          <article key={post.id} className={styles.articleItem}>
            <div className={styles.date}>{formatDate(post.date)}</div>

            <div className={styles.articleContent}>
              <Link
                href={`/world/${post.slug}`}
                className={styles.articleTitle}
              >
                <h3>{post.title.rendered}</h3>
              </Link>

              <div className={styles.articleSummary}>
                {post.excerpt.rendered.replace(/<[^>]*>/g, "").slice(0, 120)}...
              </div>

              <div className={styles.authorInfo}>
                By {author.name.toUpperCase()}
              </div>
            </div>

            {media && (
              <div className={styles.imageContainer}>
                <Link href={`/world/${post.slug}`}>
                  <img
                    src={media.source_url}
                    alt={media.alt_text || post.title.rendered}
                    className={styles.image}
                  />
                </Link>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className={styles.advertisementPlaceholder}>
        <div className={styles.adLabel}>ADVERTISEMENT</div>
        <div className={styles.adContent}>
          {/* Placeholder for advertisement */}
          <div className={styles.adImage}></div>
        </div>
      </div>
    </div>
  );
};

export default LatestNews;
