import React from "react";
import ArticleCarousel from "../components/ArticleCarousel";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import FourArticleGrid from "../components/FourArticleGrid";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import "../mainStyle.css";
import {
  fetchCategoryPageData,
  ensureMinimumContent,
  combineAndDeduplicate,
  logDataFetchStats,
} from "../lib/dataManager";

/**
 * World Page - Optimized Data Fetching
 *
 * Uses centralized data manager for:
 * - Reduced API calls (2 calls vs 8 previously)
 * - Automatic deduplication across subcategories
 * - Priority-based article distribution
 * - Smart quota enforcement
 */
const pageData = await fetchCategoryPageData("world", [
  "europe",
  "asia-pacific",
  "middle-east",
  "africa",
  "latin-america",
  "south-america",
]);

// Extract data from optimized fetch
const { main: worldPosts, subcategories, categories } = pageData;

// Subcategory posts (automatically deduplicated)
const europePosts = subcategories["europe"] || [];
const asiaPacificPosts = subcategories["asia-pacific"] || [];
const middleEastPosts = subcategories["middle-east"] || [];
const africaPosts = subcategories["africa"] || [];
const latinAmericaPosts = subcategories["latin-america"] || [];
const southAmericaPosts = subcategories["south-america"] || [];

// Prepare section content with fallbacks
const europeSpotlight = ensureMinimumContent(europePosts, worldPosts, 7).slice(
  0,
  7
);
const asiaPacificSpotlight = ensureMinimumContent(
  asiaPacificPosts,
  worldPosts,
  4
).slice(0, 4);
const middleEastSpotlight = ensureMinimumContent(
  middleEastPosts,
  worldPosts,
  5
).slice(0, 5);
const africaSpotlight = ensureMinimumContent(africaPosts, worldPosts, 5).slice(
  0,
  5
);

// Combine Americas (Latin + South + general World for this region)
const americasPool = combineAndDeduplicate(
  latinAmericaPosts,
  southAmericaPosts,
  worldPosts
);

const worldCategory = categories.find((cat) => cat.slug === "world");

// Log optimization stats in development
if (process.env.NODE_ENV === "development") {
  const totalPosts =
    worldPosts.length +
    europePosts.length +
    asiaPacificPosts.length +
    middleEastPosts.length +
    africaPosts.length +
    latinAmericaPosts.length +
    southAmericaPosts.length;

  const uniquePosts =
    new Set([
      ...worldPosts.map((p) => p.id),
      ...europePosts.map((p) => p.id),
      ...asiaPacificPosts.map((p) => p.id),
      ...middleEastPosts.map((p) => p.id),
      ...africaPosts.map((p) => p.id),
      ...latinAmericaPosts.map((p) => p.id),
      ...southAmericaPosts.map((p) => p.id),
    ]).size;

  logDataFetchStats("World Page", 2, totalPosts, uniquePosts);
}

export default function WorldPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <Hero posts={worldPosts} preferredCategory="world" />

        <ArticleCarousel
          title="Global Briefing"
          posts={worldPosts}
          maxArticles={5}
        />

        <ArticleSplitShowcase
          sectionTitle="Europe Spotlight"
          posts={europeSpotlight}
          mainPlacement="right"
          highlightIndex={0}
        />

        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Middle East"
            leftColumnArticles={middleEastSpotlight}
            rightColumnTitle="Africa"
            rightColumnArticles={africaSpotlight}
          />
        </div>

        <ArticleGrid
          posts={asiaPacificSpotlight}
          categoryName="Asia &amp; Pacific"
        />

        <FourArticleGrid
          posts={americasPool}
          categoryName="Across the Americas"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
        />

        <ArticleLayout
          posts={worldPosts.slice(0, 5)}
          categoryName={`${worldCategory?.name ?? "World"} Highlights`}
        />
      </div>
    </main>
  );
}
