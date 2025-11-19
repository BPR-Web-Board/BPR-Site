import React from "react";
import ArticleCarousel from "../components/ArticleCarousel";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import FourArticleGrid from "../components/FourArticleGrid";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import "../mainStyle.css";
import { enhancePosts } from "../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
import { PageContentManager } from "../lib/contentManager";
import type { EnhancedPost } from "../lib/types";

// Fetch all data in parallel for optimal performance
const [
  categories,
  worldPostsRaw,
  europePostsRaw,
  asiaPacificPostsRaw,
  middleEastPostsRaw,
  africaPostsRaw,
  latinAmericaPostsRaw,
  southAmericaPostsRaw,
] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("world", { per_page: 24 }),
  getPostsByCategorySlug("europe", { per_page: 8 }),
  getPostsByCategorySlug("asia-pacific", { per_page: 8 }),
  getPostsByCategorySlug("middle-east", { per_page: 8 }),
  getPostsByCategorySlug("africa", { per_page: 8 }),
  getPostsByCategorySlug("latin-america", { per_page: 8 }),
  getPostsByCategorySlug("south-america", { per_page: 8 }),
]);

// Enhance all posts in parallel
const [
  worldPosts,
  europePosts,
  asiaPacificPosts,
  middleEastPosts,
  africaPosts,
  latinAmericaPosts,
  southAmericaPosts,
] = await Promise.all([
  enhancePosts(worldPostsRaw, categories),
  enhancePosts(europePostsRaw, categories),
  enhancePosts(asiaPacificPostsRaw, categories),
  enhancePosts(middleEastPostsRaw, categories),
  enhancePosts(africaPostsRaw, categories),
  enhancePosts(latinAmericaPostsRaw, categories),
  enhancePosts(southAmericaPostsRaw, categories),
]);

const worldCategory = categories.find((cat) => cat.slug === "world");

// Create content manager to prevent duplicate articles across all page components
const contentManager = new PageContentManager();

// Select articles for each section in order of appearance on the page
// This ensures no article appears twice on the world page
const heroArticles = contentManager.selectArticles(worldPosts, 5, {
  allowPartial: true,
});
const carouselArticles = contentManager.selectArticles(worldPosts, 5, {
  allowPartial: true,
});

// Africa Dispatch section
const africaPool = contentManager.ensureContent(africaPosts, worldPosts);
const africaSpotlight = contentManager.selectArticles(africaPool, 7, {
  allowPartial: true,
});

// Asia/Pacific section
const asiaPacificPool = contentManager.ensureContent(
  asiaPacificPosts,
  worldPosts
);
const asiaPacificArticles = contentManager.selectArticles(asiaPacificPool, 4, {
  allowPartial: true,
});

// Preview Grid
const previewArticles = contentManager.selectArticles(worldPosts, 10, {
  allowPartial: true,
});

// Two Column Layout - Europe and Middle East
const europePool = contentManager.ensureContent(europePosts, worldPosts);
const europeColumn = contentManager.selectArticles(europePool, 5, {
  allowPartial: true,
});
const middleEastPool = contentManager.ensureContent(
  middleEastPosts,
  worldPosts
);
const middleEastColumn = contentManager.selectArticles(middleEastPool, 5, {
  allowPartial: true,
});

// Second Hero
const heroArticles2 = contentManager.selectArticles(worldPosts, 5, {
  allowPartial: true,
});

// Latin America section
const latinAmericaPool = contentManager.ensureContent(
  latinAmericaPosts,
  worldPosts
);
const latinAmericaArticles = contentManager.selectArticles(
  latinAmericaPool,
  5,
  {
    allowPartial: true,
  }
);

// South America section
const southAmericaPool = contentManager.ensureContent(
  southAmericaPosts,
  worldPosts
);
const southAmericaArticles = contentManager.selectArticles(
  southAmericaPool,
  4,
  {
    allowPartial: true,
  }
);

// Regional Pool - combines all regional posts for the grid
const regionalPool = contentManager.combineUniquePosts(
  africaPosts,
  asiaPacificPosts,
  europePosts,
  latinAmericaPosts,
  middleEastPosts,
  southAmericaPosts,
  worldPosts
);
const regionalPoolArticles = contentManager.selectArticles(regionalPool, 4, {
  allowPartial: true,
});

// World highlights
const worldHighlights = contentManager.selectArticles(worldPosts, 5, {
  allowPartial: true,
});

// Third Hero
const heroArticles3 = contentManager.selectArticles(worldPosts, 5, {
  allowPartial: true,
});

export default function WorldPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="world" />
        )}
        {carouselArticles.length > 0 && (
          <ArticleCarousel
            title="Global Briefing"
            posts={carouselArticles}
            maxArticles={5}
          />
        )}
        {africaSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Africa Dispatch"
            posts={africaSpotlight}
          />
        )}
        {asiaPacificArticles.length > 0 && (
          <ArticleGrid
            posts={asiaPacificArticles}
            categoryName="Asia/Pacific"
          />
        )}
        {previewArticles.length > 0 && (
          <ArticlePreviewGrid articles={previewArticles} />
        )}
        {(europeColumn.length > 0 ||
          middleEastColumn.length > 0 ||
          worldPosts.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Europe"
              leftColumnArticles={europeColumn}
              rightColumnTitle="Middle East"
              rightColumnArticles={middleEastColumn}
              fallbackArticles={worldPosts}
            />
          </div>
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="world" />
        )}
        {latinAmericaArticles.length > 0 && (
          <ArticleLayout
            posts={latinAmericaArticles}
            categoryName="Latin America"
          />
        )}
        {southAmericaArticles.length > 0 && (
          <ArticleGrid
            posts={southAmericaArticles}
            categoryName="South America"
          />
        )}
        {regionalPoolArticles.length > 0 && (
          <FourArticleGrid
            posts={regionalPoolArticles}
            categoryName="Regional Perspectives"
            showCategoryTitle={true}
            showBoundingLines={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        {worldHighlights.length > 0 && (
          <ArticleLayout
            posts={worldHighlights}
            categoryName={`${worldCategory?.name ?? "World"} Highlights`}
          />
        )}
        {heroArticles3.length > 0 && (
          <Hero posts={heroArticles3} preferredCategory="world" />
        )}
      </div>
    </main>
  );
}
