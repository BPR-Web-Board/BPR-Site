import React from "react";
import ArticleCarousel from "../components/ArticleCarousel";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import FourArticleGrid from "../components/FourArticleGrid";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import "../mainStyle.css";
import { enhancePosts } from "../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
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
  getPostsByCategorySlug("europe", { per_page: 15 }), // Fetch more to filter
  getPostsByCategorySlug("asia-pacific", { per_page: 15 }),
  getPostsByCategorySlug("middle-east", { per_page: 15 }),
  getPostsByCategorySlug("africa", { per_page: 15 }),
  getPostsByCategorySlug("latin-america", { per_page: 15 }),
  getPostsByCategorySlug("south-america", { per_page: 15 }),
]);

// Get the World category ID for filtering
const worldCategory = categories.find((cat) => cat.slug === "world");
const worldCategoryId = worldCategory?.id;

// Filter subsection posts to only include those ALSO tagged with "world"
// This ensures we show articles tagged with BOTH world AND the subsection
const filterByWorld = (posts: any[]) => {
  if (!worldCategoryId) return posts;
  return posts.filter((post) => post.categories?.includes(worldCategoryId));
};

const europeWorld = filterByWorld(europePostsRaw);
const asiaPacificWorld = filterByWorld(asiaPacificPostsRaw);
const middleEastWorld = filterByWorld(middleEastPostsRaw);
const africaWorld = filterByWorld(africaPostsRaw);
const latinAmericaWorld = filterByWorld(latinAmericaPostsRaw);
const southAmericaWorld = filterByWorld(southAmericaPostsRaw);

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
  enhancePosts(europeWorld, categories),
  enhancePosts(asiaPacificWorld, categories),
  enhancePosts(middleEastWorld, categories),
  enhancePosts(africaWorld, categories),
  enhancePosts(latinAmericaWorld, categories),
  enhancePosts(southAmericaWorld, categories),
]);

const ensureContent = (
  primary: EnhancedPost[],
  ...fallbacks: EnhancedPost[]
): EnhancedPost[] => {
  if (primary && primary.length > 0) {
    return primary;
  }

  for (const fallback of fallbacks) {
    if (fallback && fallback.length > 0) {
      return fallback;
    }
  }

  return [];
};

const combineUniquePosts = (...lists: EnhancedPost[][]): EnhancedPost[] => {
  const seen = new Set<number>();
  const combined: EnhancedPost[] = [];

  lists.forEach((list) => {
    list.forEach((post) => {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        combined.push(post);
      }
    });
  });

  return combined;
};

const europeSpotlight = ensureContent(europePosts, worldPosts).slice(0, 7);
const asiaPacificSpotlight = ensureContent(asiaPacificPosts, worldPosts).slice(
  0,
  4
);
const middleEastSpotlight = ensureContent(middleEastPosts, worldPosts).slice(
  0,
  5
);
const africaSpotlight = ensureContent(africaPosts, worldPosts).slice(0, 5);
const americasPool = combineUniquePosts(
  latinAmericaPosts,
  southAmericaPosts,
  worldPosts
);

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
