"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Category, Author } from "@/app/lib/types";
import { EnhancedPost } from "@/app/lib/enhanced-wordpress";
import ImagePlaceholder from "../ImagePlaceholder";
import "./SectionPage.css";

// No need to redefine EnhancedPost - import it from enhanced-wordpress

interface ArticlePreviewProps {
  post: EnhancedPost;
  isFeature?: boolean;
  imageSize?: "large" | "medium" | "small";
  showExcerpt?: boolean;
}

interface SectionPageProps {
  title: string;
  featuredPost?: EnhancedPost;
  posts: EnhancedPost[];
  categories?: Category[];
  className?: string;
}

// Article Preview Component for section pages
export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  post,
  isFeature = false,
  imageSize = "medium",
  showExcerpt = true,
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Strip HTML tags from excerpt
  const stripHtml = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const excerpt =
    showExcerpt && post.excerpt?.rendered
      ? stripHtml(post.excerpt.rendered).substring(0, 150) + "..."
      : "";

  const articleUrl = `/united-states/article/${post.slug}`;

  // Check if we have a featured media ID and create appropriate image source
  const hasFeaturedMedia = post.featured_media && post.featured_media > 0;

  return (
    <article
      className={`article-preview ${isFeature ? "feature-article" : ""}`}
    >
      <div className="article-preview-image-container">
        <Link href={articleUrl}>
          <div className={`article-preview-image image-${imageSize}`}>
            {hasFeaturedMedia ? (
              <Image
                src={`/api/media/${post.featured_media}`}
                alt={post.title.rendered}
                fill
                style={{ objectFit: "cover" }}
                sizes={`(max-width: 768px) 100vw, ${
                  isFeature ? "100%" : "50%"
                }`}
              />
            ) : (
              <div className="placeholder-wrapper">
                <ImagePlaceholder />
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="article-preview-content">
        <Link href={articleUrl} className="article-title-link">
          <h2
            className={`article-preview-title ${
              isFeature ? "feature-title" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>

        <div className="article-preview-meta">
          <span className="article-preview-author">
            BY {post.author_name || post.author_obj?.name || "STAFF WRITER"}
          </span>
          {post.illustrator && (
            <span className="article-preview-illustrator">
              ILLUSTRATION BY {post.illustrator}
            </span>
          )}
          <time className="article-preview-date">{formatDate(post.date)}</time>
        </div>

        {showExcerpt && (
          <div className="article-preview-excerpt">
            <p>{excerpt}</p>
          </div>
        )}
      </div>
    </article>
  );
};

// "Keep Reading" section with smaller article previews
const KeepReadingSection: React.FC<{ posts: EnhancedPost[] }> = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="keep-reading-section">
      <h2 className="keep-reading-title">Keep Reading</h2>
      <div className="keep-reading-grid">
        {posts.map((post) => (
          <ArticlePreview
            key={post.id}
            post={post}
            imageSize="small"
            showExcerpt={false}
          />
        ))}
      </div>
    </section>
  );
};

// Main Section Page Component
const SectionPage: React.FC<SectionPageProps> = ({
  title,
  featuredPost,
  posts = [], // Default to empty array to prevent errors
  categories = [], // Default to empty array to prevent errors
  className = "",
}) => {
  // Split posts: featured post and regular posts
  const regularPosts = featuredPost
    ? posts.filter((post) => post.id !== featuredPost.id)
    : posts;

  // Get the first few posts for the main grid
  const mainPosts = regularPosts.slice(0, 4);

  // Get the remaining posts for the "Keep Reading" section
  const keepReadingPosts = regularPosts.slice(4);

  return (
    <div className={`section-page ${className}`}>
      <div className="section-page-header">
        <h1 className="section-title">{title}</h1>

        {categories && categories.length > 0 && (
          <div className="section-categories">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/united-states/${category.slug}`}
                className="category-link"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="section-content">
        {/* Featured Article */}
        {featuredPost && (
          <div className="featured-article-container">
            <ArticlePreview
              post={featuredPost}
              isFeature={true}
              imageSize="large"
            />
          </div>
        )}

        {/* No posts message */}
        {posts.length === 0 && (
          <div className="no-posts-message">
            <p>No articles found. Please check back later for updates.</p>
          </div>
        )}

        {/* Main Articles Grid */}
        {mainPosts.length > 0 && (
          <div className="articles-grid">
            {mainPosts.map((post) => (
              <ArticlePreview key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Keep Reading Section */}
        {keepReadingPosts.length > 0 && (
          <KeepReadingSection posts={keepReadingPosts} />
        )}
      </div>
    </div>
  );
};

export default SectionPage;
