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

const ensureContent = (
  primary: EnhancedPost[],
  ...fallbacks: EnhancedPost[][]
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

const africaSpotlight = ensureContent(africaPosts, worldPosts).slice(0, 7);
const europeColumn = ensureContent(europePosts, worldPosts).slice(0, 5);
const middleEastColumn = ensureContent(middleEastPosts, worldPosts).slice(0, 5);
const asiaPacificArticles = ensureContent(asiaPacificPosts, worldPosts).slice(
  0,
  4
);
const latinAmericaArticles = ensureContent(latinAmericaPosts, worldPosts).slice(
  0,
  5
);
const southAmericaArticles = ensureContent(southAmericaPosts, worldPosts).slice(
  0,
  4
);
const regionalPool = combineUniquePosts(
  africaPosts,
  asiaPacificPosts,
  europePosts,
  latinAmericaPosts,
  middleEastPosts,
  southAmericaPosts,
  worldPosts
);
const previewArticles = ensureContent(worldPosts).slice(0, 10);

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
          sectionTitle="Africa Dispatch"
          posts={africaSpotlight}
        />
        <ArticleGrid posts={asiaPacificArticles} categoryName="Asia/Pacific" />
        <ArticlePreviewGrid articles={previewArticles} />
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Europe"
            leftColumnArticles={europeColumn}
            rightColumnTitle="Middle East"
            rightColumnArticles={middleEastColumn}
          />
        </div>
        <Hero posts={worldPosts} preferredCategory="world" />
        <ArticleLayout
          posts={latinAmericaArticles}
          categoryName="Latin America"
        />
        <ArticleGrid
          posts={southAmericaArticles}
          categoryName="South America"
        />
        <FourArticleGrid
          posts={regionalPool}
          categoryName="Regional Perspectives"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
          className="width-constrained"
        />
        <ArticleLayout
          posts={worldPosts.slice(0, 5)}
          categoryName={`${worldCategory?.name ?? "World"} Highlights`}
        />
        <Hero posts={worldPosts} preferredCategory="world" />
      </div>
    </main>
  );
}
