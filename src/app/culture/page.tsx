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
  culturePostsRaw,
  artsPostsRaw,
  genderPostsRaw,
  healthCulturePostsRaw,
  lgbtqPostsRaw,
  racePostsRaw,
  religionPostsRaw,
  sciencePostsRaw,
  technologyPostsRaw,
] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("culture", { per_page: 24 }),
  getPostsByCategorySlug("arts", { per_page: 8 }),
  getPostsByCategorySlug("gender", { per_page: 8 }),
  getPostsByCategorySlug("health-culture", { per_page: 8 }),
  getPostsByCategorySlug("lgbtq-politics", { per_page: 8 }),
  getPostsByCategorySlug("race", { per_page: 8 }),
  getPostsByCategorySlug("religion", { per_page: 8 }),
  getPostsByCategorySlug("science", { per_page: 8 }),
  getPostsByCategorySlug("technology", { per_page: 8 }),
]);

// Enhance all posts in parallel
const [
  culturePosts,
  artsPosts,
  genderPosts,
  healthCulturePosts,
  lgbtqPosts,
  racePosts,
  religionPosts,
  sciencePosts,
  technologyPosts,
] = await Promise.all([
  enhancePosts(culturePostsRaw, categories),
  enhancePosts(artsPostsRaw, categories),
  enhancePosts(genderPostsRaw, categories),
  enhancePosts(healthCulturePostsRaw, categories),
  enhancePosts(lgbtqPostsRaw, categories),
  enhancePosts(racePostsRaw, categories),
  enhancePosts(religionPostsRaw, categories),
  enhancePosts(sciencePostsRaw, categories),
  enhancePosts(technologyPostsRaw, categories),
]);

const cultureCategory = categories.find((cat) => cat.slug === "culture");

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

const artsSpotlight = ensureContent(artsPosts, culturePosts).slice(0, 7);
const genderColumn = ensureContent(genderPosts, culturePosts).slice(0, 5);
const raceColumn = ensureContent(racePosts, culturePosts).slice(0, 5);
const lgbtqArticles = ensureContent(lgbtqPosts, culturePosts).slice(0, 4);
const religionArticles = ensureContent(religionPosts, culturePosts).slice(0, 5);
const scienceArticles = ensureContent(sciencePosts, culturePosts).slice(0, 4);
const technologyArticles = ensureContent(technologyPosts, culturePosts).slice(
  0,
  4
);
const healthCultureArticles = ensureContent(
  healthCulturePosts,
  culturePosts
).slice(0, 4);
const culturePool = combineUniquePosts(
  artsPosts,
  genderPosts,
  healthCulturePosts,
  lgbtqPosts,
  racePosts,
  religionPosts,
  sciencePosts,
  technologyPosts,
  culturePosts
);
const previewArticles = ensureContent(culturePosts).slice(0, 10);

export default function CulturePage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <Hero posts={culturePosts} preferredCategory="culture" />
        <ArticleCarousel
          title="Culture Spotlight"
          posts={culturePosts}
          maxArticles={5}
        />
        <ArticleSplitShowcase
          sectionTitle="Arts & Expression"
          posts={artsSpotlight}
        />
        <ArticleGrid posts={lgbtqArticles} categoryName="LGBTQ+ Politics" />
        <ArticlePreviewGrid articles={previewArticles} />
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Gender"
            leftColumnArticles={genderColumn}
            rightColumnTitle="Race"
            rightColumnArticles={raceColumn}
          />
        </div>
        <Hero posts={culturePosts} preferredCategory="culture" />
        <ArticleLayout posts={religionArticles} categoryName="Religion" />
        <ArticleGrid posts={scienceArticles} categoryName="Science" />
        <ArticleGrid posts={technologyArticles} categoryName="Technology" />
        <ArticleGrid
          posts={healthCultureArticles}
          categoryName="Health & Culture"
        />
        <FourArticleGrid
          posts={culturePool}
          categoryName="Cultural Perspectives"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
          className="width-constrained"
        />
        <ArticleLayout
          posts={culturePosts.slice(0, 5)}
          categoryName={`${cultureCategory?.name ?? "Culture"} Highlights`}
        />
        <Hero posts={culturePosts} preferredCategory="culture" />
      </div>
    </main>
  );
}
