import React from "react";
import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";
import { EnhancedPost } from "../../lib/types";
import "./Hero.css";

export interface HeroProps {
  posts: EnhancedPost[];
  className?: string;
  preferredCategory?: string; // Optional: prefer posts from a specific category
}

const Hero: React.FC<HeroProps> = ({
  posts,
  className = "",
  preferredCategory,
}) => {
  // Filter posts that have featured images
  const postsWithImages = posts.filter(
    (post) => post.featured_media_obj && post.featured_media_obj.source_url
  );

  if (postsWithImages.length === 0) {
    return (
      <div
        className="hero-error-container"
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          color: "#666",
        }}
      >
        <div className="text-center">
          <h2>Hero Content Unavailable</h2>
          <p>No posts with featured images available.</p>
        </div>
      </div>
    );
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
    selectedPost.author_name || selectedPost.author_obj?.name || "STAFF WRITER";

  // Get category name (assuming first category is primary)
  const categoryName =
    selectedPost.categories_obj && selectedPost.categories_obj.length > 0
      ? selectedPost.categories_obj[0].name.toUpperCase()
      : "FEATURED";

  // Get featured image
  const hasImage = !!(
    selectedPost.featured_media_obj &&
    selectedPost.featured_media_obj.source_url
  );
  const imageUrl = hasImage ? selectedPost.featured_media_obj!.source_url : "";
  const imageAlt = hasImage
    ? selectedPost.featured_media_obj!.alt_text || titleText || "Hero image"
    : "";

  // Create article link
  let section = "world";
  if (
    Array.isArray(selectedPost.categories) &&
    selectedPost.categories.length > 0
  ) {
    const cat = selectedPost.categories_obj && selectedPost.categories_obj[0];
    if (cat && cat.slug) {
      section = cat.slug;
    }
  }
  const href = `/${section}/article/${selectedPost.slug}`;

  return (
    <section className={classNames("hero-section", className)}>
      <div className="hero-background">
        {hasImage && imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
            className="hero-bg-image"
          />
        ) : (
          <div className="hero-bg-placeholder" />
        )}
        <div className="hero-gradient-overlay" />
      </div>

      <div className="hero-content">
        <div className="hero-text-container">
          <div className="hero-attributes">
            <div className="hero-category">{categoryName}</div>

            <Link href={href} className="hero-link">
              <h1
                className="hero-title"
                dangerouslySetInnerHTML={{ __html: titleText }}
              />
            </Link>
          </div>
          <div className="hero-meta">
            <div
              className="hero-excerpt"
              dangerouslySetInnerHTML={{ __html: excerptText }}
            />

            <div className="hero-byline">BY {author.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
