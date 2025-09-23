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
import Footer from "./components/Footer";

const posts = await getAllPosts();
const categories = await getAllCategories();

// Enhance posts with additional data
const enhancedPosts = await enhancePosts(posts.slice(0, 20), categories);

// Get category-specific posts
const usaPosts = await getPostsByCategorySlug("usa", 10);
const enhancedUsaPosts = await enhancePosts(usaPosts, categories);

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="featured-content">
        <Hero posts={enhancedPosts} />
        <div className="article-layout-wrapper">
          <ArticlePreviewGrid articles={enhancedPosts.slice(0, 10)} />
          <FourArticleGrid
            posts={enhancedUsaPosts}
            categoryName="USA"
            showCategoryTitle={false}
            numberOfRows={2}
            showBoundingLines={true}
          />
        </div>
      </div>
      <div className="main-content">
        <Hero posts={enhancedPosts} preferredCategory="usa" />
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            posts={enhancedUsaPosts}
            sectionTitle="USA"
            leftColumnArticles={3}
            rightColumnArticles={5}
          />
          <FourArticleGrid
            posts={enhancedUsaPosts}
            categoryName="USA"
            showCategoryTitle={false}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>
        <Hero posts={enhancedPosts} />
        <div className="two-column-layout-wrapper">
          <ArticleLayout
            posts={enhancedUsaPosts.slice(0, 5)}
            categoryName="USA"
          />
          <FourArticleGrid
            posts={enhancedUsaPosts}
            categoryName="USA"
            showCategoryTitle={false}
            numberOfRows={1}
            showBoundingLines={true}
          />
        </div>
        <Hero posts={enhancedPosts} />
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            posts={enhancedUsaPosts}
            sectionTitle="USA"
            leftColumnArticles={3}
            rightColumnArticles={5}
          />
        </div>
      </div>
    </div>
  );
}
