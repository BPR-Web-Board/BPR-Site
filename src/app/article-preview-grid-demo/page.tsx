import React from "react";
import { getAllPosts, getAllCategories } from "../lib/wordpress";
import { enhancePosts } from "../lib/enhancePost";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";

export default async function ArticlePreviewGridDemo() {
  try {
    // Fetch posts and categories
    const posts = await getAllPosts();
    const categories = await getAllCategories();

    // Enhance posts with additional data
    const enhancedPosts = await enhancePosts(posts.slice(0, 10), categories);

    return (
      <div className="demo-page">
        <div style={{ padding: "2rem 0", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-primary-serif)",
              fontSize: "2.5rem",
              marginBottom: "1rem",
              color: "var(--color-black)",
            }}
          >
            Article Preview Grid Demo
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "1.125rem",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            A three-column layout featuring medium articles on the left, a large
            featured article in the center, and compact sidebar articles on the
            right.
          </p>
        </div>

        <ArticlePreviewGrid articles={enhancedPosts} />
      </div>
    );
  } catch (error) {
    console.error("Error loading articles:", error);
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#ef4444",
        }}
      >
        <h1>Error Loading Articles</h1>
        <p>Failed to load articles from WordPress API</p>
      </div>
    );
  }
}
