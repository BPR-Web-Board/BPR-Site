import React from "react";
import Hero from "./components/Hero";
import "./mainStyle.css";
import ArticleLayout from "./components/ArticleLayout/ArticleLayout";
import TwoColumnArticleLayout from "./components/TwoColumnArticleLayout";
import ArticlePreviewGrid from "./components/ArticlePreviewGrid";
import FourArticleGrid from "./components/FourArticleGrid";
import { fetchMainPageData, logDataFetchStats } from "./lib/dataManager";
// import Footer from "./components/Footer";

/**
 * Main Page - Optimized Data Fetching
 *
 * Uses centralized data manager for:
 * - Reduced API calls (2 calls vs 6+ previously)
 * - Automatic deduplication across all sections
 * - Priority-based article distribution
 * - Smart caching utilization
 */
const pageData = await fetchMainPageData();

// Extract data from optimized fetch
const {
  featured: enhancedPosts,
  usa: usaPostsDedup,
  world: worldPostsDedup,
  culture: culturePostsDedup,
  law: policyPostsDedup,
  categories,
} = pageData;

// Log optimization stats in development
if (process.env.NODE_ENV === 'development') {
  const totalPosts =
    enhancedPosts.length +
    usaPostsDedup.length +
    worldPostsDedup.length +
    culturePostsDedup.length +
    policyPostsDedup.length;

  logDataFetchStats('Main Page', 2, 50, totalPosts);
}

console.log("Categories:", categories);

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="featured-content">
        <Hero posts={enhancedPosts} />
        <div className="article-layout-wrapper">
          <ArticlePreviewGrid articles={enhancedPosts.slice(0, 10)} />
          {/* USA Section - 2 rows of 4 articles each */}
          <FourArticleGrid
            posts={usaPostsDedup}
            categoryName="USA"
            showCategoryTitle={false}
            numberOfRows={2}
            showBoundingLines={true}
          />
        </div>
      </div>
      <div className="main-content">
        <Hero posts={enhancedPosts} preferredCategory="usa" />

        {/* Section 1: USA News */}
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="USA News"
            rightColumnTitle="Latest Updates"
            leftColumnArticles={usaPostsDedup.slice(0, 4)}
            rightColumnArticles={usaPostsDedup.slice(4, 8)}
          />
          <FourArticleGrid
            posts={usaPostsDedup}
            categoryName="USA"
            showCategoryTitle={false}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>

        <Hero posts={usaPostsDedup} />

        {/* Section 2: World News */}
        <div className="two-column-layout-wrapper">
          <ArticleLayout
            posts={worldPostsDedup.slice(0, 5)}
            categoryName="World"
          />
          <FourArticleGrid
            posts={worldPostsDedup}
            categoryName="World"
            showCategoryTitle={false}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>

        <Hero posts={worldPostsDedup} />

        {/* Section 3: Culture & Arts */}
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Culture"
            rightColumnTitle="Arts & Entertainment"
            leftColumnArticles={culturePostsDedup.slice(0, 3)}
            rightColumnArticles={culturePostsDedup.slice(3, 8)}
          />
          <FourArticleGrid
            posts={culturePostsDedup}
            categoryName="Culture"
            showCategoryTitle={false}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>

        <Hero posts={culturePostsDedup} />

        {/* Section 4: Policy & Law */}
        {/* <div className="two-column-layout-wrapper">
          <ArticleLayout
            posts={policyPostsDedup.slice(0, 5)}
            categoryName="Law & Policy"
          />
        </div> */}
      </div>
    </div>
  );
}
