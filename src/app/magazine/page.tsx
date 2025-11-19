import React from "react";
import ArticleCarousel from "../components/ArticleCarousel";
import ArticleLayout from "../components/ArticleLayout";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import FourArticleGrid from "../components/FourArticleGrid";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import "../mainStyle.css";
import "./magazine.css";
import { enhancePosts } from "../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
import { PageContentManager } from "../lib/contentManager";
import { EnhancedPost } from "../lib/types";

// Helper function to filter posts from the last 6 months
function filterPostsByLastSixMonths(posts: EnhancedPost[]): EnhancedPost[] {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return posts.filter((post) => {
    const postDate = new Date(post.date);
    return postDate >= sixMonthsAgo;
  });
}

// Helper function to sort posts by date (newest first)
function sortPostsByDate(posts: EnhancedPost[]): EnhancedPost[] {
  return [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

// Fetch all magazine posts
const [categories, magazinePostsRaw] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("mag", { per_page: 100 }), // Fetch more to ensure enough after filtering
]);

// Enhance posts
const magazinePostsEnhanced = await enhancePosts(magazinePostsRaw, categories);

// Filter to last 6 months and sort by date (newest first)
const magazinePosts = sortPostsByDate(
  filterPostsByLastSixMonths(magazinePostsEnhanced)
);

const magazineCategory = categories.find((cat) => cat.slug === "mag");

// Create content manager to prevent duplicate articles across all page components
const contentManager = new PageContentManager();

// Select articles for each section in order of appearance on the page
// This ensures no article appears twice on the magazine page

// Hero section - top 5 most recent articles
const heroArticles = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});

// Article Carousel - next 5 articles
const carouselArticles = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});

// Article Preview Grid - next 10 articles
const previewArticles = contentManager.selectArticles(magazinePosts, 10, {
  allowPartial: true,
});

// Article Split Showcase - next 7 articles
const splitShowcaseArticles = contentManager.selectArticles(magazinePosts, 7, {
  allowPartial: true,
});

// Two Column Layout - next 8 articles (4 per column)
const leftColumnArticles = contentManager.selectArticles(magazinePosts, 4, {
  allowPartial: true,
});
const rightColumnArticles = contentManager.selectArticles(magazinePosts, 4, {
  allowPartial: true,
});

// Four Article Grid - next 8 articles (2 rows of 4)
const gridArticles = contentManager.selectArticles(magazinePosts, 8, {
  allowPartial: true,
});

// Article Layout - next 5 articles
const layoutArticles = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});

// Second Hero - next 5 articles
const heroArticles2 = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});

// Final Four Article Grid - remaining articles
const finalGridArticles = contentManager.selectArticles(magazinePosts, 4, {
  allowPartial: true,
});

export default function MagazinePage() {
  return (
    <main className="page-container">
      <div className="main-content">
        {/* Hero Section */}
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="magazine" priority />
        )}

        {/* Article Carousel */}
        {carouselArticles.length > 0 && (
          <ArticleCarousel
            title="Recent Magazine Features"
            posts={carouselArticles}
            maxArticles={5}
          />
        )}

        {/* Article Preview Grid */}
        {previewArticles.length > 0 && (
          <ArticlePreviewGrid articles={previewArticles} />
        )}

        {/* Article Split Showcase */}
        {splitShowcaseArticles.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Magazine Spotlight"
            posts={splitShowcaseArticles}
          />
        )}

        {/* Two Column Layout */}
        {(leftColumnArticles.length > 0 ||
          rightColumnArticles.length > 0 ||
          magazinePosts.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Featured Stories"
              leftColumnArticles={leftColumnArticles}
              rightColumnTitle="Editor's Picks"
              rightColumnArticles={rightColumnArticles}
              fallbackArticles={magazinePosts}
            />
          </div>
        )}

        {/* Four Article Grid - First Set */}
        {gridArticles.length > 0 && (
          <FourArticleGrid
            posts={gridArticles}
            categoryName="Magazine"
            showCategoryTitle={false}
            showBoundingLines={true}
            numberOfRows={2}
            className="width-constrained"
          />
        )}

        {/* Article Layout */}
        {layoutArticles.length > 0 && (
          <ArticleLayout
            posts={layoutArticles}
            categoryName={`${magazineCategory?.name ?? "Magazine"} Articles`}
          />
        )}

        {/* Second Hero */}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="magazine" />
        )}

        {/* Four Article Grid - Final Set */}
        {finalGridArticles.length > 0 && (
          <FourArticleGrid
            posts={finalGridArticles}
            categoryName="More from Magazine"
            showCategoryTitle={true}
            showBoundingLines={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}

        {/* Explore Earlier Articles Button */}
        <div className="explore-archive-container">
          <a href="/magazine/archive" className="explore-archive-button">
            Explore Earlier Articles
          </a>
        </div>
      </div>
    </main>
  );
}
