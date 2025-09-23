import React from "react";
import ArticleCarousel from "../components/ArticleCarousel";
import FourArticleGrid from "../components/FourArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import FeaturedArticleLayout from "../components/FeaturedArticleLayout";
import ArticleGrid from "../components/ArticleGrid";
import Footer from "../components/Footer";
import { enhancePosts } from "../lib/enhancePost";
import { getPostsByCategorySlug, getAllCategories } from "../lib/wordpress";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";

// Fetch world category posts
const worldPosts = await getPostsByCategorySlug("world", 15);
const categories = await getAllCategories();
const enhancedWorldPosts = await enhancePosts(worldPosts, categories);

// Find world category data
const worldCategory = categories.find((cat) => cat.slug === "world");

export default function WorldPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <ArticleCarousel
          title="World News"
          posts={enhancedWorldPosts}
          maxArticles={4}
        />
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            posts={enhancedWorldPosts}
            sectionTitle="World"
            leftColumnArticles={3}
            rightColumnArticles={5}
          />
        </div>
        {/* <Hero posts={enhancedWorldPosts} />

        <FourArticleGrid
          posts={enhancedWorldPosts}
          categoryName={worldCategory?.name || "World"}
          showCategoryTitle={true}
        />
        <FeaturedArticleLayout
          title="World News"
          posts={enhancedWorldPosts}
          maxArticles={7}
          featuredIndex={0}
        />
        <ArticleLayout
          posts={enhancedWorldPosts.slice(0, 5)}
          categoryName={worldCategory?.name || "World"}
        />
        <FourArticleGrid
          posts={enhancedWorldPosts.slice(5, 9)}
          categoryName={worldCategory?.name || "World"}
          showCategoryTitle={true}
        />
        <ArticleGrid
          posts={enhancedWorldPosts.slice(9, 13)}
          categoryName={worldCategory?.name || "World"}
          maxArticles={4}
        /> */}
      </div>
      {/* <Footer /> */}
    </main>
  );
}
