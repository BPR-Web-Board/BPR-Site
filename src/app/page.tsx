import React from "react";
import Hero from "./components/Hero";
import "./mainStyle.css";
import ArticleLayout from "./components/ArticleLayout/ArticleLayout";
import TwoColumnArticleLayout from "./components/TwoColumnArticleLayout";
import { enhancePosts } from "./lib/enhancePost";
import { getAllPosts, getPostsByCategorySlug } from "./lib/wordpress";
import { getAllCategories } from "./lib/wordpress";
import ArticlePreviewGrid from "./components/ArticlePreviewGrid";
import FourArticleGrid from "./components/FourArticleGrid";
import { PageContentManager } from "./lib/contentManager";
// import Footer from "./components/Footer";

// Fetch all data in parallel for optimal performance
const [posts, categories, usaPosts, worldPosts, culturePosts, policyPosts] =
  await Promise.all([
    getAllPosts(),
    getAllCategories(),
    getPostsByCategorySlug("usa", { per_page: 20 }),
    getPostsByCategorySlug("world", { per_page: 20 }),
    getPostsByCategorySlug("culture", { per_page: 15 }),
    getPostsByCategorySlug("law", { per_page: 10 }), // Law/Justice for policy content
  ]);

// Enhance all posts in parallel for optimal performance
const [
  enhancedPosts,
  enhancedUsaPosts,
  enhancedWorldPosts,
  enhancedCulturePosts,
  enhancedPolicyPosts,
] = await Promise.all([
  enhancePosts(posts.slice(0, 25), categories),
  enhancePosts(usaPosts, categories),
  enhancePosts(worldPosts, categories),
  enhancePosts(culturePosts, categories),
  enhancePosts(policyPosts, categories),
]);

// Create content manager to prevent duplicate articles across all page components
const contentManager = new PageContentManager();

// Select articles for each section in order of appearance on the page
// This ensures no article appears twice on the homepage
const heroArticles = contentManager.selectArticles(enhancedPosts, 5, {
  allowPartial: true,
});
const previewArticles = contentManager.selectArticles(enhancedPosts, 10, {
  allowPartial: true,
});

// USA Section - combine all USA posts and select unique articles
const usaPool = contentManager.ensureContent(enhancedUsaPosts, enhancedPosts);
const usaFeaturedGrid = contentManager.selectArticles(usaPool, 8, {
  allowPartial: true,
});
const usaLeftColumn = contentManager.selectArticles(usaPool, 4, {
  allowPartial: true,
});
const usaRightColumn = contentManager.selectArticles(usaPool, 4, {
  allowPartial: true,
});
const usaBottomGrid = contentManager.selectArticles(usaPool, 4, {
  allowPartial: true,
});

// World Section
const worldPool = contentManager.ensureContent(
  enhancedWorldPosts,
  enhancedPosts
);
const worldHeroArticles = contentManager.selectArticles(worldPool, 5, {
  allowPartial: true,
});
const worldLayoutArticles = contentManager.selectArticles(worldPool, 5, {
  allowPartial: true,
});
const worldGrid = contentManager.selectArticles(worldPool, 4, {
  allowPartial: true,
});

// Culture Section
const culturePool = contentManager.ensureContent(
  enhancedCulturePosts,
  enhancedPosts
);
const cultureLeftColumn = contentManager.selectArticles(culturePool, 3, {
  allowPartial: true,
});
const cultureRightColumn = contentManager.selectArticles(culturePool, 5, {
  allowPartial: true,
});
const cultureGrid = contentManager.selectArticles(culturePool, 4, {
  allowPartial: true,
});

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="featured-content">
        {/* Main hero - shows the most recent featured post with priority loading */}
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} priority={true} />
        )}
        <div className="article-layout-wrapper">
          {previewArticles.length > 0 && (
            <ArticlePreviewGrid articles={previewArticles} />
          )}
          {/* USA Section - 2 rows of 4 articles each */}
          {usaFeaturedGrid.length > 0 && (
            <FourArticleGrid
              posts={usaFeaturedGrid}
              categoryName="USA"
              showCategoryTitle={false}
              numberOfRows={2}
              showBoundingLines={true}
              className="width-constrained"
            />
          )}
        </div>
      </div>
      <div className="main-content">
        {/* Section 1: USA News */}
        {(usaLeftColumn.length > 0 ||
          usaRightColumn.length > 0 ||
          usaPool.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="USA News"
              rightColumnTitle="Latest Updates"
              leftColumnArticles={usaLeftColumn}
              rightColumnArticles={usaRightColumn}
              fallbackArticles={usaPool}
            />
            {usaBottomGrid.length > 0 && (
              <FourArticleGrid
                posts={usaBottomGrid}
                categoryName="USA"
                showCategoryTitle={false}
                numberOfRows={1}
                showBoundingLines={true}
                className="width-constrained"
              />
            )}
          </div>
        )}

        {/* Hero for World section - loads lazily as user scrolls */}
        {worldHeroArticles.length > 0 && <Hero posts={worldHeroArticles} />}

        {/* Section 2: World News */}
        {(worldLayoutArticles.length > 0 || worldGrid.length > 0) && (
          <div className="two-column-layout-wrapper">
            {worldLayoutArticles.length > 0 && (
              <ArticleLayout posts={worldLayoutArticles} categoryName="World" />
            )}
            {worldGrid.length > 0 && (
              <FourArticleGrid
                posts={worldGrid}
                categoryName="World"
                showCategoryTitle={false}
                numberOfRows={1}
                showBoundingLines={true}
                className="width-constrained"
              />
            )}
          </div>
        )}

        {/* Section 3: Culture & Arts */}
        {(cultureLeftColumn.length > 0 ||
          cultureRightColumn.length > 0 ||
          culturePool.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Culture"
              rightColumnTitle="Arts & Entertainment"
              leftColumnArticles={cultureLeftColumn}
              rightColumnArticles={cultureRightColumn}
              fallbackArticles={culturePool}
            />
            {cultureGrid.length > 0 && (
              <FourArticleGrid
                posts={cultureGrid}
                categoryName="Culture"
                showCategoryTitle={false}
                numberOfRows={1}
                showBoundingLines={true}
                className="width-constrained"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
