import React from "react";
import {
  getPostsByCategorySlug,
  getFeaturedMediaById,
  getAuthorById,
} from "../../lib/wordpress";
import { EnhancedPost, Post } from "../../lib/types";
import SectionGrid from "./SectionGrid";

export interface SectionGridWithRealDataProps {
  categorySlug: string;
  sectionTitle: string;
  maxPosts?: number;
  className?: string;
  gridColumns?: 2 | 3 | 4;
}

async function enhancePost(post: Post): Promise<EnhancedPost> {
  // Get featured media
  let featured_media_obj = null;
  if (post.featured_media && typeof post.featured_media === "number") {
    try {
      featured_media_obj = await getFeaturedMediaById(post.featured_media);
    } catch (error) {
      console.error("Error fetching featured media:", error);
    }
  }

  // Get author info
  let author_obj = null;
  let author_name = "STAFF WRITER";
  if (post.author && typeof post.author === "number") {
    try {
      author_obj = await getAuthorById(post.author);
      author_name = author_obj.name;
    } catch (error) {
      console.error("Error fetching author:", error);
    }
  }

  return {
    ...post,
    featured_media_obj,
    author_obj,
    author_name,
  };
}

export default async function SectionGridWithRealData({
  categorySlug,
  sectionTitle,
  maxPosts = 8,
  className = "",
  gridColumns = 2,
}: SectionGridWithRealDataProps) {
  try {
    // Fetch posts by category
    console.log("categorySlug", categorySlug);
    const posts = await getPostsByCategorySlug(categorySlug);

    // Only use the number of posts specified by maxPosts
    const limitedPosts = posts.slice(0, maxPosts);

    // Enhance the posts with featured media and author information
    const enhancedPosts = await Promise.all(limitedPosts.map(enhancePost));

    return (
      <SectionGrid
        posts={enhancedPosts}
        sectionTitle={sectionTitle}
        maxPosts={maxPosts}
        className={className}
        gridColumns={gridColumns}
      />
    );
  } catch (error) {
    console.error("Error fetching category posts:", error);
    return (
      <div className="error-container">
        <p>Error loading posts. Please try again later.</p>
      </div>
    );
  }
}
