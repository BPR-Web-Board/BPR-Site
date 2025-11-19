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

const electionSpotlight = ensureContent(electionsPosts, usaPosts).slice(0, 7);
const environmentColumn = ensureContent(environmentPosts, usaPosts).slice(0, 5);
const healthColumn = ensureContent(healthPosts, usaPosts).slice(0, 5);
const educationArticles = ensureContent(educationPosts, usaPosts).slice(0, 4);
const lawArticles = ensureContent(lawPosts, usaPosts).slice(0, 5);
const housingArticles = ensureContent(housingPosts, usaPosts).slice(0, 4);
const nationalSecurityPool = combineUniquePosts(
  foreignPolicyPosts,
  securityPosts,
  usaPosts
);
const previewArticles = ensureContent(usaPosts).slice(0, 10);

export default function UnitedStatesPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <ArticlePreviewGrid articles={previewArticles} />
        <ArticleCarousel
          title="Domestic Briefing"
          posts={usaPosts}
          maxArticles={5}
        />
        <Hero posts={usaPosts} preferredCategory="usa" />
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
        <Hero posts={usaPosts} preferredCategory="usa" />s
        <ArticleLayout posts={lawArticles} categoryName="Law &amp; Justice" />
        <FourArticleGrid
          posts={nationalSecurityPool}
          categoryName="National Security &amp; Foreign Policy"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
          className="width-constrained"
        />
        <ArticleGrid
          posts={housingArticles}
          categoryName="Housing &amp; Urban Affairs"
        />
        <ArticleLayout
          posts={usaPosts.slice(0, 5)}
          categoryName={`${usaCategory?.name ?? "United States"} Highlights`}
        />
        <Hero posts={usaPosts} preferredCategory="usa" />
      </div>
    </main>
  );
}
