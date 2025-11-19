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
  multimediaPostsRaw,
  bpradioPostsRaw,
  dataPostsRaw,
  mediaPostsRaw,
] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("multimedia", { per_page: 24 }),
  getPostsByCategorySlug("bpradio", { per_page: 8 }),
  getPostsByCategorySlug("data", { per_page: 8 }),
  getPostsByCategorySlug("media", { per_page: 8 }),
]);

// Enhance all posts in parallel
const [multimediaPosts, bpradioPosts, dataPosts, mediaPosts] =
  await Promise.all([
    enhancePosts(multimediaPostsRaw, categories),
    enhancePosts(bpradioPostsRaw, categories),
    enhancePosts(dataPostsRaw, categories),
    enhancePosts(mediaPostsRaw, categories),
  ]);

const multimediaCategory = categories.find((cat) => cat.slug === "multimedia");

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

const bpradioSpotlight = ensureContent(bpradioPosts, multimediaPosts).slice(
  0,
  7
);
const dataColumn = ensureContent(dataPosts, multimediaPosts).slice(0, 5);
const mediaColumn = ensureContent(mediaPosts, multimediaPosts).slice(0, 5);
const bpradioArticles = ensureContent(bpradioPosts, multimediaPosts).slice(
  0,
  4
);
const dataArticles = ensureContent(dataPosts, multimediaPosts).slice(0, 5);
const mediaArticles = ensureContent(mediaPosts, multimediaPosts).slice(0, 4);
const multimediaPool = combineUniquePosts(
  bpradioPosts,
  dataPosts,
  mediaPosts,
  multimediaPosts
);
const previewArticles = ensureContent(multimediaPosts).slice(0, 10);

export default function MultimediaPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Data"
            leftColumnArticles={dataColumn}
            rightColumnTitle="Media"
            rightColumnArticles={mediaColumn}
          />
        </div>
        <Hero posts={multimediaPosts} preferredCategory="multimedia" />
        <ArticleGrid posts={bpradioArticles} categoryName="BPRadio" />
        <ArticleCarousel
          title="Multimedia Showcase"
          posts={multimediaPosts}
          maxArticles={5}
        />
        <ArticleLayout
          posts={dataArticles}
          categoryName="Data &amp; Analysis"
        />
        <ArticleSplitShowcase
          sectionTitle="BPRadio Features"
          posts={bpradioSpotlight}
        />
        <ArticlePreviewGrid articles={previewArticles} />
        <Hero posts={multimediaPosts} preferredCategory="multimedia" />
        <ArticleGrid posts={mediaArticles} categoryName="Media" />
        <FourArticleGrid
          posts={multimediaPool}
          categoryName="Multimedia Collection"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
          className="width-constrained"
        />
        <ArticleLayout
          posts={multimediaPosts.slice(0, 5)}
          categoryName={`${
            multimediaCategory?.name ?? "Multimedia"
          } Highlights`}
        />
        <Hero posts={multimediaPosts} preferredCategory="multimedia" />
      </div>
    </main>
  );
}
