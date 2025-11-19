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
  usaPostsRaw,
  electionsPostsRaw,
  educationPostsRaw,
  environmentPostsRaw,
  healthPostsRaw,
  lawPostsRaw,
  housingPostsRaw,
  foreignPolicyPostsRaw,
  securityPostsRaw,
] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("usa", { per_page: 24 }),
  getPostsByCategorySlug("elections", { per_page: 8 }),
  getPostsByCategorySlug("education", { per_page: 8 }),
  getPostsByCategorySlug("environment", { per_page: 8 }),
  getPostsByCategorySlug("health", { per_page: 8 }),
  getPostsByCategorySlug("law", { per_page: 8 }),
  getPostsByCategorySlug("housing", { per_page: 8 }),
  getPostsByCategorySlug("foreign-policy", { per_page: 8 }),
  getPostsByCategorySlug("security-and-defense-usa", { per_page: 8 }),
]);

// Enhance all posts in parallel
const [
  usaPosts,
  electionsPosts,
  educationPosts,
  environmentPosts,
  healthPosts,
  lawPosts,
  housingPosts,
  foreignPolicyPosts,
  securityPosts,
] = await Promise.all([
  enhancePosts(usaPostsRaw, categories),
  enhancePosts(electionsPostsRaw, categories),
  enhancePosts(educationPostsRaw, categories),
  enhancePosts(environmentPostsRaw, categories),
  enhancePosts(healthPostsRaw, categories),
  enhancePosts(lawPostsRaw, categories),
  enhancePosts(housingPostsRaw, categories),
  enhancePosts(foreignPolicyPostsRaw, categories),
  enhancePosts(securityPostsRaw, categories),
]);

const usaCategory = categories.find((cat) => cat.slug === "usa");

// Create content manager to prevent duplicate articles across all page components
const contentManager = new PageContentManager();

// Create a global fallback pool for filling gaps
const globalFallbackPool = contentManager.combineUniquePosts(
  usaPosts,
  electionsPosts,
  educationPosts,
  environmentPosts,
  healthPosts,
  lawPosts,
  housingPosts,
  foreignPolicyPosts,
  securityPosts
);

// Select articles for each section in order of appearance on the page
// This ensures no article appears twice on the United States page
const previewArticles = contentManager.selectArticles(usaPosts, 10, {
  allowPartial: true,
});
const carouselArticles = contentManager.selectArticles(usaPosts, 5, {
  allowPartial: true,
});
const heroArticles = contentManager.selectArticles(usaPosts, 5, {
  allowPartial: true,
});

// Election Dispatch section
const electionPool = contentManager.ensureContent(electionsPosts, usaPosts);
const electionSpotlight = contentManager.selectArticles(electionPool, 7, {
  allowPartial: true,
});

// Two Column Layout - Environment and Health
const environmentPool = contentManager.ensureContent(
  environmentPosts,
  usaPosts
);
const environmentColumn = contentManager.selectArticles(environmentPool, 5, {
  allowPartial: true,
});
const healthPool = contentManager.ensureContent(healthPosts, usaPosts);
const healthColumn = contentManager.selectArticles(healthPool, 5, {
  allowPartial: true,
});

// Education section - ensure exactly 4 articles
const educationPool = contentManager.ensureContent(educationPosts, usaPosts);
const educationArticles = contentManager.fillToCount(
  educationPool,
  4,
  globalFallbackPool
);

// Second Hero
const heroArticles2 = contentManager.selectArticles(usaPosts, 5, {
  allowPartial: true,
});

// Law & Justice section
const lawPool = contentManager.ensureContent(lawPosts, usaPosts);
const lawArticles = contentManager.selectArticles(lawPool, 5, {
  allowPartial: true,
});

// National Security & Foreign Policy Pool
const nationalSecurityPool = contentManager.combineUniquePosts(
  foreignPolicyPosts,
  securityPosts,
  usaPosts
);
const nationalSecurityArticles = contentManager.selectArticles(
  nationalSecurityPool,
  4,
  { allowPartial: true }
);

// Housing & Urban Affairs section - ensure exactly 4 articles
const housingPool = contentManager.ensureContent(housingPosts, usaPosts);
const housingArticles = contentManager.fillToCount(
  housingPool,
  4,
  globalFallbackPool
);

// USA Highlights
const usaHighlights = contentManager.selectArticles(usaPosts, 5, {
  allowPartial: true,
});

// Third Hero
const heroArticles3 = contentManager.selectArticles(usaPosts, 5, {
  allowPartial: true,
});

export default function UnitedStatesPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        {previewArticles.length > 0 && (
          <ArticlePreviewGrid articles={previewArticles} />
        )}
        {carouselArticles.length > 0 && (
          <ArticleCarousel
            title="Domestic Briefing"
            posts={carouselArticles}
            maxArticles={5}
          />
        )}
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="usa" />
        )}
        {electionSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Election Dispatch"
            posts={electionSpotlight}
          />
        )}
        {(environmentColumn.length > 0 ||
          healthColumn.length > 0 ||
          usaPosts.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Environment"
              leftColumnArticles={environmentColumn}
              rightColumnTitle="Health"
              rightColumnArticles={healthColumn}
              fallbackArticles={usaPosts}
            />
          </div>
        )}
        <ArticleGrid posts={educationArticles} categoryName="Education" />
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="usa" />
        )}
        {lawArticles.length > 0 && (
          <ArticleLayout posts={lawArticles} categoryName="Law &amp; Justice" />
        )}
        {nationalSecurityArticles.length > 0 && (
          <FourArticleGrid
            posts={nationalSecurityArticles}
            categoryName="National Security &amp; Foreign Policy"
            showCategoryTitle={true}
            showBoundingLines={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        <ArticleGrid
          posts={housingArticles}
          categoryName="Housing &amp; Urban Affairs"
        />
        {usaHighlights.length > 0 && (
          <ArticleLayout
            posts={usaHighlights}
            categoryName={`${usaCategory?.name ?? "United States"} Highlights`}
          />
        )}
        {heroArticles3.length > 0 && (
          <Hero posts={heroArticles3} preferredCategory="usa" />
        )}
      </div>
    </main>
  );
}
