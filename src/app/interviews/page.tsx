import React from "react";
import ArticleSpotlight from "../components/ArticleSpotlight";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import "../mainStyle.css";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
import { PageContentManager } from "../lib/contentManager";

export const revalidate = 1800;

export default async function InterviewsPage() {
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
    getPostsByCategorySlug("ri-interviews", { per_page: 8 }),
    getPostsByCategorySlug("us-interviews", { per_page: 8 }),
    getPostsByCategorySlug("congress", { per_page: 8 }),
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
    enhancePreviewPosts(interviewsPostsRaw, categories),
    enhancePreviewPosts(professorPodcastsPostsRaw, categories),
    enhancePreviewPosts(rhodeIslandPostsRaw, categories),
    enhancePreviewPosts(usInterviewsPostsRaw, categories),
    enhancePreviewPosts(congressPostsRaw, categories),
    enhancePreviewPosts(worldInterviewsPostsRaw, categories),
  ]);

  const interviewsCategory = categories.find((cat) => cat.slug === "interviews");

  // Create content manager to prevent duplicate articles across all page components
  const contentManager = new PageContentManager();

  // Create a global fallback pool for filling gaps
  const globalFallbackPool = contentManager.combineUniquePosts(
    interviewsPosts,
    professorPodcastsPosts,
    rhodeIslandPosts,
    usInterviewsPosts,
    congressPosts,
    worldInterviewsPosts
  );

  const popularArticles = contentManager.selectArticles(interviewsPosts, 4, {
    allowPartial: true,
  });

  const latestArticles = contentManager.selectArticles(interviewsPosts, 5, {
    allowPartial: true,
  });

  const heroArticles = contentManager.selectArticles(interviewsPosts, 5, {
    allowPartial: true,
  });

  const congressPool = contentManager.ensureContent(
    congressPosts,
    interviewsPosts
  );
  const congressArticles = contentManager.fillToCount(
    congressPool,
    4,
    globalFallbackPool
  );

  const previewArticles = contentManager.selectArticles(interviewsPosts, 10, {
    allowPartial: true,
  });

  const worldInterviewsPool = contentManager.ensureContent(
    worldInterviewsPosts,
    interviewsPosts
  );
  const worldInterviewsArticles = contentManager.selectArticles(
    worldInterviewsPool,
    5,
    { allowPartial: true }
  );

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

  const heroArticles2 = contentManager.selectArticles(interviewsPosts, 5, {
    allowPartial: true,
  });

  const academicPool = contentManager.ensureContent(
    professorPodcastsPosts,
    interviewsPosts
  );
  const academicPerspectives = contentManager.selectArticles(academicPool, 7, {
    allowPartial: true,
  });

  const interviewHighlights = contentManager.selectArticles(interviewsPosts, 5, {
    allowPartial: true,
  });

  const heroArticles3 = contentManager.selectArticles(interviewsPosts, 5, {
    allowPartial: true,
  });

  return (
    <main className="page-container">
      <div className="main-content">
        {popularArticles.length > 0 && (
          <ArticleSpotlight
            title="Most Popular"
            posts={popularArticles}
            maxArticles={4}
          />
        )}
        {latestArticles.length > 0 && (
          <ArticleLayout posts={latestArticles} categoryName="Latest" />
        )}
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="interviews" />
        )}
        <ArticleGrid posts={congressArticles} categoryName="Congress" />
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
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="interviews" />
        )}
        {academicPerspectives.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Academic Perspectives"
            posts={academicPerspectives}
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
