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

const categories = await getAllCategories();

async function fetchEnhancedCategory(slug: string, count: number) {
  const posts = await getPostsByCategorySlug(slug, count);
  return enhancePosts(posts, categories);
}

const [
  worldPosts,
  europePosts,
  asiaPacificPosts,
  middleEastPosts,
  africaPosts,
  latinAmericaPosts,
  southAmericaPosts,
] = await Promise.all([
  fetchEnhancedCategory("world", 24),
  fetchEnhancedCategory("europe", 8),
  fetchEnhancedCategory("asia-pacific", 8),
  fetchEnhancedCategory("middle-east", 8),
  fetchEnhancedCategory("africa", 8),
  fetchEnhancedCategory("latin-america", 8),
  fetchEnhancedCategory("south-america", 8),
]);

const worldCategory = categories.find((cat) => cat.slug === "world");

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
