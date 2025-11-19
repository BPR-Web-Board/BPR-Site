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
const [categories, magazinePostsRaw] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("magazine", { per_page: 30 }),
]);

// Enhance all posts in parallel
const [magazinePosts] = await Promise.all([
  enhancePosts(magazinePostsRaw, categories),
]);

const magazineCategory = categories.find((cat) => cat.slug === "magazine");

// Create content manager to prevent duplicate articles across all page components
const contentManager = new PageContentManager();

// Select articles for each section in order of appearance on the page
// This ensures no article appears twice on the magazine page
const magazinePoolArticles = contentManager.selectArticles(magazinePosts, 4, {
  allowPartial: true,
});
const featuredArticles = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});
const heroArticles = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});
const latestIssueArticles = contentManager.selectArticles(magazinePosts, 4, {
  allowPartial: true,
});
const carouselArticles = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});
const featuredSpotlight = contentManager.selectArticles(magazinePosts, 7, {
  allowPartial: true,
});
const previewArticles = contentManager.selectArticles(magazinePosts, 10, {
  allowPartial: true,
});
const latestColumn = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});
const archivesColumn = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});
const heroArticles2 = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});
const archivesArticles = contentManager.selectArticles(magazinePosts, 4, {
  allowPartial: true,
});
const magazineHighlights = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});
const heroArticles3 = contentManager.selectArticles(magazinePosts, 5, {
  allowPartial: true,
});

export default function MagazinePage() {
  return (
    <main className="page-container">
      <div className="main-content">
        {magazinePoolArticles.length > 0 && (
          <FourArticleGrid
            posts={magazinePoolArticles}
            categoryName="Editorial Excellence"
            showCategoryTitle={true}
            showBoundingLines={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        {featuredArticles.length > 0 && (
          <ArticleLayout
            posts={featuredArticles}
            categoryName="Featured Stories"
          />
        )}
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="magazine" />
        )}
        {latestIssueArticles.length > 0 && (
          <ArticleGrid posts={latestIssueArticles} categoryName="Latest Issue" />
        )}
        {carouselArticles.length > 0 && (
          <ArticleCarousel
            title="Magazine Highlights"
            posts={carouselArticles}
            maxArticles={5}
          />
        )}
        {featuredSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Featured Articles"
            posts={featuredSpotlight}
          />
        )}
        {previewArticles.length > 0 && (
          <ArticlePreviewGrid articles={previewArticles} />
        )}
        {(latestColumn.length > 0 || archivesColumn.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Latest Issue"
              leftColumnArticles={latestColumn}
              rightColumnTitle="From the Archives"
              rightColumnArticles={archivesColumn}
            />
          </div>
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="magazine" />
        )}
        {archivesArticles.length > 0 && (
          <ArticleGrid posts={archivesArticles} categoryName="Archives" />
        )}
        {magazineHighlights.length > 0 && (
          <ArticleLayout
            posts={magazineHighlights}
            categoryName={`${magazineCategory?.name ?? "Magazine"} Highlights`}
          />
        )}
        {heroArticles3.length > 0 && (
          <Hero posts={heroArticles3} preferredCategory="magazine" />
        )}
      </div>
    </main>
  );
}
