import React from "react";
import Image from "next/image";
import {
  Post,
  Author,
  FeaturedMedia,
  Tag,
  Category,
} from "../../lib/wordpress.d";
import { cn } from "../../lib/utils";
import styles from "./ArticlePage.module.css";

type ArticlePageProps = {
  post: Post;
  author: Author;
  featuredMedia?: FeaturedMedia;
  relatedPosts: Post[];
  categories?: Category[];
  tags?: Tag[];
};

const ArticlePage: React.FC<ArticlePageProps> = ({
  post,
  author,
  featuredMedia,
  relatedPosts,
  categories,
  tags,
}) => {
  // Function to safely render HTML content from WordPress
  const renderHtmlContent = (html: string) => {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className={styles.articleContainer}>
      {/* Article Header */}
      <header className={styles.articleHeader}>
        <h1 className={styles.articleTitle}>{post.title.rendered}</h1>
        <div className={styles.articleExcerpt}>
          {renderHtmlContent(post.excerpt.rendered)}
        </div>
      </header>

      {/* Featured Image */}
      {featuredMedia && (
        <div className={styles.featuredImageContainer}>
          <Image
            src={featuredMedia.source_url}
            alt={featuredMedia.alt_text || post.title.rendered}
            width={featuredMedia.media_details.width}
            height={featuredMedia.media_details.height}
            className={styles.featuredImage}
            priority
          />
        </div>
      )}

      {/* Author Info */}
      <div className={styles.authorInfo}>
        <p className={styles.authorName}>BY {author.name.toUpperCase()}</p>
        {featuredMedia && featuredMedia.caption && (
          <p className={styles.illustrationCredit}>
            {`ILLUSTRATION BY ${featuredMedia.caption.rendered}`}
          </p>
        )}
      </div>

      {/* Article Content */}
      <article className={styles.articleContent}>
        {renderHtmlContent(post.content.rendered)}
      </article>

      {/* Related Articles Section */}
      <section className={styles.relatedArticlesSection}>
        <h2 className={styles.relatedHeading}>Keep Reading</h2>
        <div className={styles.relatedArticlesGrid}>
          {relatedPosts.map((relatedPost) => (
            <div key={relatedPost.id} className={styles.relatedArticleCard}>
              {relatedPost.featured_media > 0 && (
                <div className={styles.relatedArticleImageContainer}>
                  {/* In a real implementation, you would fetch the media for each related post */}
                  <div className={styles.relatedArticleImagePlaceholder}></div>
                </div>
              )}
              <div className={styles.relatedArticleMeta}>
                {categories && categories.length > 0 && (
                  <span className={styles.relatedArticleCategory}>
                    {categories[0].name}
                  </span>
                )}
              </div>
              <h3 className={styles.relatedArticleTitle}>
                {relatedPost.title.rendered}
              </h3>
              <p className={styles.relatedArticleAuthor}>
                BY {author.name.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArticlePage;
