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

// Create content manager to prevent duplicate articles across all page components
const contentManager = new PageContentManager();

// Select articles for each section in order of appearance on the page
// This ensures no article appears twice on the culture page
const heroArticles = contentManager.selectArticles(culturePosts, 5, {
  allowPartial: true,
});
const carouselArticles = contentManager.selectArticles(culturePosts, 5, {
  allowPartial: true,
});

// Arts & Expression section
const artsPool = contentManager.ensureContent(artsPosts, culturePosts);
const artsSpotlight = contentManager.selectArticles(artsPool, 7, {
  allowPartial: true,
});

// Create a global fallback pool for filling gaps
const globalFallbackPool = contentManager.combineUniquePosts(
  culturePosts,
  artsPosts,
  genderPosts,
  healthCulturePosts,
  lgbtqPosts,
  racePosts,
  religionPosts,
  sciencePosts,
  technologyPosts
);

// LGBTQ+ Politics section - ensure exactly 4 articles
const lgbtqPool = contentManager.ensureContent(lgbtqPosts, culturePosts);
const lgbtqArticles = contentManager.fillToCount(lgbtqPool, 4, globalFallbackPool);

// Preview Grid
const previewArticles = contentManager.selectArticles(culturePosts, 10, {
  allowPartial: true,
});

// Two Column Layout - Gender and Race
const genderPool = contentManager.ensureContent(genderPosts, culturePosts);
const genderColumn = contentManager.selectArticles(genderPool, 5, {
  allowPartial: true,
});
const racePool = contentManager.ensureContent(racePosts, culturePosts);
const raceColumn = contentManager.selectArticles(racePool, 5, {
  allowPartial: true,
});

// Second Hero
const heroArticles2 = contentManager.selectArticles(culturePosts, 5, {
  allowPartial: true,
});

// Religion section
const religionPool = contentManager.ensureContent(religionPosts, culturePosts);
const religionArticles = contentManager.selectArticles(religionPool, 5, {
  allowPartial: true,
});

// Science section - ensure exactly 4 articles
const sciencePool = contentManager.ensureContent(sciencePosts, culturePosts);
const scienceArticles = contentManager.fillToCount(sciencePool, 4, globalFallbackPool);

// Technology section - ensure exactly 4 articles
const technologyPool = contentManager.ensureContent(
  technologyPosts,
  culturePosts
);
const technologyArticles = contentManager.fillToCount(technologyPool, 4, globalFallbackPool);

// Health & Culture section - ensure exactly 4 articles
const healthCulturePool = contentManager.ensureContent(
  healthCulturePosts,
  culturePosts
);
const healthCultureArticles = contentManager.fillToCount(
  healthCulturePool,
  4,
  globalFallbackPool
);

// Culture Pool - combines all subsections for the grid
const culturePool = contentManager.combineUniquePosts(
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
const culturePoolArticles = contentManager.selectArticles(culturePool, 4, {
  allowPartial: true,
});

// Culture highlights
const cultureHighlights = contentManager.selectArticles(culturePosts, 5, {
  allowPartial: true,
});

// Third Hero
const heroArticles3 = contentManager.selectArticles(culturePosts, 5, {
  allowPartial: true,
});

export default function CulturePage() {
  return (
    <main className="page-container">
      <div className="main-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="culture" />
        )}
        {carouselArticles.length > 0 && (
          <ArticleCarousel
            title="Culture Spotlight"
            posts={carouselArticles}
            maxArticles={5}
          />
        )}
        {artsSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Arts & Expression"
            posts={artsSpotlight}
          />
        )}
        <ArticleGrid posts={lgbtqArticles} categoryName="LGBTQ+ Politics" />
        {previewArticles.length > 0 && (
          <ArticlePreviewGrid articles={previewArticles} />
        )}
        {(genderColumn.length > 0 ||
          raceColumn.length > 0 ||
          culturePosts.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Gender"
              leftColumnArticles={genderColumn}
              rightColumnTitle="Race"
              rightColumnArticles={raceColumn}
              fallbackArticles={culturePosts}
            />
          </div>
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="culture" />
        )}
        {religionArticles.length > 0 && (
          <ArticleLayout posts={religionArticles} categoryName="Religion" />
        )}
        <ArticleGrid posts={scienceArticles} categoryName="Science" />
        <ArticleGrid posts={technologyArticles} categoryName="Technology" />
        <ArticleGrid
          posts={healthCultureArticles}
          categoryName="Health & Culture"
        />
        {culturePoolArticles.length > 0 && (
          <FourArticleGrid
            posts={culturePoolArticles}
            categoryName="Cultural Perspectives"
            showCategoryTitle={true}
            showBoundingLines={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        {cultureHighlights.length > 0 && (
          <ArticleLayout
            posts={cultureHighlights}
            categoryName={`${cultureCategory?.name ?? "Culture"} Highlights`}
          />
        )}
        {heroArticles3.length > 0 && (
          <Hero posts={heroArticles3} preferredCategory="culture" />
        )}
      </div>
    </main>
  );
}
