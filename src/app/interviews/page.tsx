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

// Create content manager to prevent duplicate articles across all page components
const contentManager = new PageContentManager();

// Select articles for each section in order of appearance on the page
// This ensures no article appears twice on the interviews page

// Professor Podcasts section
const professorPool = contentManager.ensureContent(
  professorPodcastsPosts,
  interviewsPosts
);
const professorSpotlight = contentManager.selectArticles(professorPool, 7, {
  allowPartial: true,
});

// Congress section
const congressPool = contentManager.ensureContent(
  congressPosts,
  interviewsPosts
);
const congressArticles = contentManager.selectArticles(congressPool, 4, {
  allowPartial: true,
});

// Hero
const heroArticles = contentManager.selectArticles(interviewsPosts, 5, {
  allowPartial: true,
});

// Preview Grid
const previewArticles = contentManager.selectArticles(interviewsPosts, 10, {
  allowPartial: true,
});

// World Interviews section
const worldInterviewsPool = contentManager.ensureContent(
  worldInterviewsPosts,
  interviewsPosts
);
const worldInterviewsArticles = contentManager.selectArticles(
  worldInterviewsPool,
  5,
  { allowPartial: true }
);

// Two Column Layout - Rhode Island and US Interviews
const rhodeIslandPool = contentManager.ensureContent(
  rhodeIslandPosts,
  interviewsPosts
);
const rhodeIslandColumn = contentManager.selectArticles(rhodeIslandPool, 5, {
  allowPartial: true,
});
const usInterviewsPool = contentManager.ensureContent(
  usInterviewsPosts,
  interviewsPosts
);
const usInterviewsColumn = contentManager.selectArticles(usInterviewsPool, 5, {
  allowPartial: true,
});

// Carousel
const carouselArticles = contentManager.selectArticles(interviewsPosts, 5, {
  allowPartial: true,
});

// Political Pool
const politicalPool = contentManager.combineUniquePosts(
  congressPosts,
  usInterviewsPosts,
  rhodeIslandPosts,
  interviewsPosts
);
const politicalPoolArticles = contentManager.selectArticles(politicalPool, 4, {
  allowPartial: true,
});

// Second Hero
const heroArticles2 = contentManager.selectArticles(interviewsPosts, 5, {
  allowPartial: true,
});

// Academic Perspectives (from professor podcasts)
const academicPerspectives = contentManager.selectArticles(
  professorPodcastsPosts,
  4,
  { allowPartial: true }
);

// Interview Highlights
const interviewHighlights = contentManager.selectArticles(interviewsPosts, 5, {
  allowPartial: true,
});

// Third Hero
const heroArticles3 = contentManager.selectArticles(interviewsPosts, 5, {
  allowPartial: true,
});

export default function InterviewsPage() {
  return (
    <main className="page-container">
      <div className="main-content">
        {professorSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Professor Podcasts"
            posts={professorSpotlight}
          />
        )}
        {congressArticles.length > 0 && (
          <ArticleGrid posts={congressArticles} categoryName="Congress" />
        )}
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="interviews" />
        )}
        {previewArticles.length > 0 && (
          <ArticlePreviewGrid articles={previewArticles} />
        )}
        {worldInterviewsArticles.length > 0 && (
          <ArticleLayout
            posts={worldInterviewsArticles}
            categoryName="World Interviews"
          />
        )}
        {(rhodeIslandColumn.length > 0 ||
          usInterviewsColumn.length > 0 ||
          interviewsPosts.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Rhode Island"
              leftColumnArticles={rhodeIslandColumn}
              rightColumnTitle="U.S. Interviews"
              rightColumnArticles={usInterviewsColumn}
              fallbackArticles={interviewsPosts}
            />
          </div>
        )}
        {carouselArticles.length > 0 && (
          <ArticleCarousel
            title="Interview Highlights"
            posts={carouselArticles}
            maxArticles={5}
          />
        )}
        {politicalPoolArticles.length > 0 && (
          <FourArticleGrid
            posts={politicalPoolArticles}
            categoryName="Political Conversations"
            showCategoryTitle={true}
            showBoundingLines={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="interviews" />
        )}
        {academicPerspectives.length > 0 && (
          <ArticleGrid
            posts={academicPerspectives}
            categoryName="Academic Perspectives"
          />
        )}
        {interviewHighlights.length > 0 && (
          <ArticleLayout
            posts={interviewHighlights}
            categoryName={`${
              interviewsCategory?.name ?? "Interviews"
            } Highlights`}
          />
        )}
        {heroArticles3.length > 0 && (
          <Hero posts={heroArticles3} preferredCategory="interviews" />
        )}
      </div>
    </main>
  );
}
