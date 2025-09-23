import React from "react";
import ArticleCarousel from "../components/ArticleCarousel";
import { enhancePosts } from "../lib/enhancePost";
import { getPostsByCategorySlug, getAllCategories } from "../lib/wordpress";

// Fetch sample posts for demo
const worldPosts = await getPostsByCategorySlug("world", 4);
const categories = await getAllCategories();
const enhancedWorldPosts = await enhancePosts(worldPosts, categories);

export default function ArticleCarouselDemo() {
  return (
    <div className="page-container">
      <main className="main-content">
        <div
          style={{ padding: "64px 32px", maxWidth: "1440px", margin: "0 auto" }}
        >
          <section style={{ marginBottom: "80px" }}>
            <ArticleCarousel
              title="World News"
              posts={enhancedWorldPosts}
              maxArticles={4}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
