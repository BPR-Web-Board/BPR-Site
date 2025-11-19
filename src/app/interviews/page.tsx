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
  interviewsPostsRaw,
  professorPodcastsPostsRaw,
  rhodeIslandPostsRaw,
  usInterviewsPostsRaw,
  congressPostsRaw,
  worldInterviewsPostsRaw,
] = await Promise.all([
  getAllCategories(),
  getPostsByCategorySlug("interviews", { per_page: 24 }),
  getPostsByCategorySlug("professor-podcasts", { per_page: 8 }),
  getPostsByCategorySlug("rhode-island-interviews", { per_page: 8 }),
  getPostsByCategorySlug("us-interviews", { per_page: 8 }),
  getPostsByCategorySlug("congress-interviews", { per_page: 8 }),
  getPostsByCategorySlug("world-interviews", { per_page: 8 }),
]);

// Enhance all posts in parallel
const [
  interviewsPosts,
  professorPodcastsPosts,
  rhodeIslandPosts,
  usInterviewsPosts,
  congressPosts,
  worldInterviewsPosts,
] = await Promise.all([
  enhancePosts(interviewsPostsRaw, categories),
  enhancePosts(professorPodcastsPostsRaw, categories),
  enhancePosts(rhodeIslandPostsRaw, categories),
  enhancePosts(usInterviewsPostsRaw, categories),
  enhancePosts(congressPostsRaw, categories),
  enhancePosts(worldInterviewsPostsRaw, categories),
]);

const interviewsCategory = categories.find((cat) => cat.slug === "interviews");

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

const professorSpotlight = ensureContent(
  professorPodcastsPosts,
  interviewsPosts
).slice(0, 7);
const rhodeIslandColumn = ensureContent(
  rhodeIslandPosts,
  interviewsPosts
).slice(0, 5);
const usInterviewsColumn = ensureContent(
  usInterviewsPosts,
  interviewsPosts
).slice(0, 5);
const congressArticles = ensureContent(congressPosts, interviewsPosts).slice(
  0,
  4
);
const worldInterviewsArticles = ensureContent(
  worldInterviewsPosts,
  interviewsPosts
).slice(0, 5);
const politicalPool = combineUniquePosts(
  congressPosts,
  usInterviewsPosts,
  rhodeIslandPosts,
  interviewsPosts
);
const previewArticles = ensureContent(interviewsPosts).slice(0, 10);

export default function InterviewsPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        <ArticleSplitShowcase
          sectionTitle="Professor Podcasts"
          posts={professorSpotlight}
        />
        <ArticleGrid posts={congressArticles} categoryName="Congress" />
        <Hero posts={interviewsPosts} preferredCategory="interviews" />
        <ArticlePreviewGrid articles={previewArticles} />
        <ArticleLayout
          posts={worldInterviewsArticles}
          categoryName="World Interviews"
        />
        <div className="two-column-layout-wrapper">
          <TwoColumnArticleLayout
            leftColumnTitle="Rhode Island"
            leftColumnArticles={rhodeIslandColumn}
            rightColumnTitle="U.S. Interviews"
            rightColumnArticles={usInterviewsColumn}
          />
        </div>
        <ArticleCarousel
          title="Interview Highlights"
          posts={interviewsPosts}
          maxArticles={5}
        />
        <FourArticleGrid
          posts={politicalPool}
          categoryName="Political Conversations"
          showCategoryTitle={true}
          showBoundingLines={true}
          numberOfRows={1}
          className="width-constrained"
        />
        <Hero posts={interviewsPosts} preferredCategory="interviews" />
        <ArticleGrid
          posts={professorPodcastsPosts.slice(0, 4)}
          categoryName="Academic Perspectives"
        />
        <ArticleLayout
          posts={interviewsPosts.slice(0, 5)}
          categoryName={`${
            interviewsCategory?.name ?? "Interviews"
          } Highlights`}
        />
        <Hero posts={interviewsPosts} preferredCategory="interviews" />
      </div>
    </main>
  );
}
