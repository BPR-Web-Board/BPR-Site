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
import { deduplicateArticlesBySections } from "./lib/utils";
// import Footer from "./components/Footer";

// Fetch all data in parallel for optimal performance
const [posts, categories, usaPosts, worldPosts, culturePosts, policyPosts] =
  await Promise.all([
    getAllPosts(),
    getAllCategories(),
    getPostsByCategorySlug("usa", { per_page: 15 }),
    getPostsByCategorySlug("world", { per_page: 15 }),
    getPostsByCategorySlug("culture", { per_page: 10 }),
    getPostsByCategorySlug("law", { per_page: 8 }), // Law/Justice for policy content
  ]);

console.log("Categories:", categories);

// Enhance all posts in parallel for optimal performance
const [
  enhancedPosts,
  enhancedUsaPosts,
  enhancedWorldPosts,
  enhancedCulturePosts,
  enhancedPolicyPosts,
] = await Promise.all([
  enhancePosts(posts.slice(0, 20), categories),
  enhancePosts(usaPosts, categories),
  enhancePosts(worldPosts, categories),
  enhancePosts(culturePosts, categories),
  enhancePosts(policyPosts, categories),
]);

// Create sections with category priority (order matters for deduplication)
const sectionsData = [
  { categorySlug: "usa", posts: enhancedUsaPosts },
  { categorySlug: "world", posts: enhancedWorldPosts },
  { categorySlug: "culture", posts: enhancedCulturePosts },
  { categorySlug: "law", posts: enhancedPolicyPosts },
];

// Deduplicate articles across sections
// This ensures an article tagged with multiple categories only appears once
const deduplicatedSections = deduplicateArticlesBySections(sectionsData);

// Extract deduplicated posts by category
const usaPostsDedup = deduplicatedSections[0].posts;
const worldPostsDedup = deduplicatedSections[1].posts;
const culturePostsDedup = deduplicatedSections[2].posts;
const policyPostsDedup = deduplicatedSections[3].posts;

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
            leftColumnArticles={usaPostsDedup.slice(0, 3)}
            rightColumnArticles={usaPostsDedup.slice(3, 8)}
          />
          <FourArticleGrid
            posts={usaPostsDedup}
            categoryName="USA"
            showCategoryTitle={false}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>

        <Hero posts={enhancedPosts} />

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

        <Hero posts={enhancedPosts} />

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

        <Hero posts={enhancedPosts} />

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
