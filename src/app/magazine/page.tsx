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
const [categories, magazinePostsRaw] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("magazine", { per_page: 24 }),
]);

// Enhance all posts in parallel
const [magazinePosts] = await Promise.all([
  enhancePosts(magazinePostsRaw, categories),
]);

const magazineCategory = categories.find((cat) => cat.slug === "magazine");

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

const featuredSpotlight = ensureContent(magazinePosts).slice(0, 7);
const latestColumn = ensureContent(magazinePosts).slice(7, 12);
const archivesColumn = ensureContent(magazinePosts).slice(12, 17);
const latestIssueArticles = ensureContent(magazinePosts).slice(0, 4);
const featuredArticles = ensureContent(magazinePosts).slice(4, 9);
const archivesArticles = ensureContent(magazinePosts).slice(9, 13);
const magazinePool = combineUniquePosts(magazinePosts);
const previewArticles = ensureContent(magazinePosts).slice(0, 10);

export default function MagazinePage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <FourArticleGrid
          posts={magazinePool}
          categoryName="Editorial Excellence"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
          className="width-constrained"
        />
        <ArticleLayout
          posts={featuredArticles}
          categoryName="Featured Stories"
        />
        <Hero posts={magazinePosts} preferredCategory="magazine" />
        <ArticleGrid posts={latestIssueArticles} categoryName="Latest Issue" />
        <ArticleCarousel
          title="Magazine Highlights"
          posts={magazinePosts}
          maxArticles={5}
        />
        <ArticleSplitShowcase
          sectionTitle="Featured Articles"
          posts={featuredSpotlight}
        />
        <ArticlePreviewGrid articles={previewArticles} />
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Latest Issue"
            leftColumnArticles={latestColumn}
            rightColumnTitle="From the Archives"
            rightColumnArticles={archivesColumn}
          />
        </div>
        <Hero posts={magazinePosts} preferredCategory="magazine" />
        <ArticleGrid posts={archivesArticles} categoryName="Archives" />
        <ArticleLayout
          posts={magazinePosts.slice(0, 5)}
          categoryName={`${magazineCategory?.name ?? "Magazine"} Highlights`}
        />
        <Hero posts={magazinePosts} preferredCategory="magazine" />
      </div>
    </main>
  );
}
