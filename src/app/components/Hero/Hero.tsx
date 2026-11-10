
import ArticleTitle from "../shared/ArticleTitle/ArticleTitle";

import CategoryPills from "../shared/CategoryPills/CategoryPills";
import React, { ReactNode } from "react";
import Link from "next/link";
import classNames from "classnames";
import { EnhancedPost } from "../../lib/types";
import OptimizedImage from "../shared/OptimizedImage/OptimizedImage";
import { getAuthorName, getArticleLink, formatArchiveDate } from "../../lib/utils";
import { getMediaPreview } from "../../lib/mediaPreview";
import FourArticleGrid from "../FourArticleGrid/FourArticleGrid";
import "./Hero.css";

export interface HeroProps {
  posts: EnhancedPost[];
  className?: string;
  preferredCategory?: string; // Optional: prefer posts from a specific category
  priority?: boolean;
  topChrome?: ReactNode;
}

function heroImageUrl(post: EnhancedPost): string {
  return (
    post.featured_media_obj?.source_url ||
    getMediaPreview(post)?.thumbnail ||
    ""
  );
}

const Hero: React.FC<HeroProps> = ({
  posts,
  className = "",
  preferredCategory,
  priority = false,
  topChrome,
}) => {
  const postsWithImages = posts.filter((post) => Boolean(heroImageUrl(post)));

  if (postsWithImages.length === 0) {
    if (posts.length === 0) return topChrome ? <>{topChrome}</> : null;
    return <>
      {topChrome}
      <FourArticleGrid posts={posts} showCategoryTitle={false} numberOfRows={Math.ceil(posts.length / 4)} className="width-constrained" />
    </>;
  }

  // If preferredCategory is specified, try to find a post from that category first
  let selectedPost = postsWithImages[0];

  if (preferredCategory) {
    const categoryPost = postsWithImages.find((post) =>
      post.categories_obj?.some(
        (cat) =>
          cat.slug === preferredCategory ||
          cat.name.toLowerCase() === preferredCategory.toLowerCase()
      )
    );
    if (categoryPost) {
      selectedPost = categoryPost;
    }
  }

  // Extract data from the selected post
  const titleText =
    typeof selectedPost.title === "object" && selectedPost.title !== null
      ? selectedPost.title.rendered
      : String(selectedPost.title);

  const excerptText =
    typeof selectedPost.excerpt === "object" && selectedPost.excerpt !== null
      ? selectedPost.excerpt.rendered.replace(/<[^>]*>/g, "") // Strip HTML tags
      : String(selectedPost.excerpt || "").replace(/<[^>]*>/g, "");

  const author =
    getAuthorName(selectedPost);
  const formattedDate = formatArchiveDate(selectedPost.date || "");

  const imageUrl = heroImageUrl(selectedPost);
  const hasImage = Boolean(imageUrl);
  const imageAlt = hasImage
    ? selectedPost.featured_media_obj?.alt_text || titleText || "Hero image"
    : "";

  // Create article link using shared utility
  const href = getArticleLink(selectedPost);

  return (
    <section className={classNames("hero-section", className, topChrome ? "hero-section--with-chrome" : undefined)}>
      <div className="hero-background">
        {hasImage && imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority={priority}
            loading="lazy"
            className="hero-bg-image"
            showPlaceholder={true}
          />
        ) : (
          <div className="hero-bg-placeholder" />
        )}
        <div className="hero-gradient-overlay" />
      </div>

      {topChrome ? <div className="hero-top-chrome">{topChrome}</div> : null}

      <div className="hero-content">
        <div className="hero-text-container">
          <div className="hero-attributes">
            <CategoryPills categories={selectedPost.categories_obj} />

            <Link href={href} className="hero-link">
              <h1
                className="hero-title"><ArticleTitle html={titleText} /></h1>
            </Link>
          </div>
          <div className="hero-meta">
            <div
              className="hero-excerpt"
              dangerouslySetInnerHTML={{ __html: excerptText }}
            />

            <div className="hero-byline">
              <span className="hero-byline-author">{author.toUpperCase()}</span>
              {formattedDate ? <>
                <span className="hero-byline-divider" aria-hidden="true">·</span>
                <time className="hero-byline-date" dateTime={selectedPost.date}>{formattedDate}</time>
              </> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
