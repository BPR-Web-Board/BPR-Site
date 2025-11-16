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
import {
  fetchCategoryPageData,
  ensureMinimumContent,
  combineAndDeduplicate,
  logDataFetchStats,
} from "../lib/dataManager";

/**
 * United States Page - Optimized Data Fetching
 *
 * Uses centralized data manager for:
 * - Reduced API calls (2 calls vs 10 previously)
 * - Automatic deduplication across subcategories
 * - Priority-based article distribution
 * - Smart quota enforcement
 */
const pageData = await fetchCategoryPageData("united-states", [
  "elections",
  "economy",
  "education",
  "environment",
  "health",
  "law",
  "housing",
  "foreign-policy",
  "security-defense-usa",
]);

// Extract data from optimized fetch
const { main: usaPosts, subcategories, categories } = pageData;

// Subcategory posts (automatically deduplicated)
const electionsPosts = subcategories["elections"] || [];
const economyPosts = subcategories["economy"] || [];
const educationPosts = subcategories["education"] || [];
const environmentPosts = subcategories["environment"] || [];
const healthPosts = subcategories["health"] || [];
const lawPosts = subcategories["law"] || [];
const housingPosts = subcategories["housing"] || [];
const foreignPolicyPosts = subcategories["foreign-policy"] || [];
const securityPosts = subcategories["security-defense-usa"] || [];

// Prepare section content with fallbacks
const electionSpotlight = ensureMinimumContent(
  electionsPosts,
  usaPosts,
  7
).slice(0, 7);
const environmentColumn = ensureMinimumContent(
  environmentPosts,
  usaPosts,
  5
).slice(0, 5);
const healthColumn = ensureMinimumContent(healthPosts, usaPosts, 5).slice(
  0,
  5
);
const educationArticles = ensureMinimumContent(
  educationPosts,
  usaPosts,
  4
).slice(0, 4);
const lawArticles = ensureMinimumContent(lawPosts, usaPosts, 5).slice(0, 5);
const housingArticles = ensureMinimumContent(housingPosts, usaPosts, 4).slice(
  0,
  4
);

// Combine National Security topics (Foreign Policy + Defense + general USA)
const nationalSecurityPool = combineAndDeduplicate(
  foreignPolicyPosts,
  securityPosts,
  usaPosts
);

const previewArticles = usaPosts.slice(0, 10);
const usaCategory = categories.find((cat) => cat.slug === "united-states");

// Log optimization stats in development
if (process.env.NODE_ENV === "development") {
  const totalPosts =
    usaPosts.length +
    electionsPosts.length +
    economyPosts.length +
    educationPosts.length +
    environmentPosts.length +
    healthPosts.length +
    lawPosts.length +
    housingPosts.length +
    foreignPolicyPosts.length +
    securityPosts.length;

  const uniquePosts =
    new Set([
      ...usaPosts.map((p) => p.id),
      ...electionsPosts.map((p) => p.id),
      ...economyPosts.map((p) => p.id),
      ...educationPosts.map((p) => p.id),
      ...environmentPosts.map((p) => p.id),
      ...healthPosts.map((p) => p.id),
      ...lawPosts.map((p) => p.id),
      ...housingPosts.map((p) => p.id),
      ...foreignPolicyPosts.map((p) => p.id),
      ...securityPosts.map((p) => p.id),
    ]).size;

  logDataFetchStats("United States Page", 2, totalPosts, uniquePosts);
}

export default function UnitedStatesPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <Hero posts={usaPosts} preferredCategory="usa" />

        <ArticlePreviewGrid articles={previewArticles} />

        <ArticleCarousel
          title="Domestic Briefing"
          posts={usaPosts}
          maxArticles={5}
        />

        <ArticleSplitShowcase
          sectionTitle="Election Dispatch"
          posts={electionSpotlight}
        />

        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Environment"
            leftColumnArticles={environmentColumn}
            rightColumnTitle="Health"
            rightColumnArticles={healthColumn}
          />
        </div>

        <ArticleGrid posts={educationArticles} categoryName="Education" />

        <ArticleLayout
          posts={lawArticles}
          categoryName="Law &amp; Justice"
        />

        <FourArticleGrid
          posts={nationalSecurityPool}
          categoryName="National Security &amp; Foreign Policy"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
        />

        <ArticleGrid
          posts={housingArticles}
          categoryName="Housing &amp; Urban Affairs"
        />

        <ArticleLayout
          posts={usaPosts.slice(0, 5)}
          categoryName={`${usaCategory?.name ?? "United States"} Highlights`}
        />
      </div>
    </main>
  );
}
