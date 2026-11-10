import React from "react";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import InfiniteScrollArticleList from "../components/shared/InfiniteScrollArticleList";
import "../mainStyle.css";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
import { PageContentManager } from "../lib/contentManager";

export const revalidate = 1800;

const ARCHIVE_OFFSET = 40;
const ARCHIVE_PER_PAGE = 10;

export default async function InterviewsPage() {
  const [
    categories,
    interviewsPostsRaw,
    interviewsArchiveRaw,
    professorPodcastsPostsRaw,
    rhodeIslandPostsRaw,
    usInterviewsPostsRaw,
    congressPostsRaw,
    worldInterviewsPostsRaw,
  ] = await Promise.all([
    getAllCategories(),
    getPostsByCategorySlug("interviews", { per_page: ARCHIVE_OFFSET }),
    getPostsByCategorySlug("interviews", {
      per_page: ARCHIVE_PER_PAGE,
      offset: ARCHIVE_OFFSET,
    }),
    getPostsByCategorySlug("professor-podcasts", { per_page: 8 }),
    getPostsByCategorySlug("ri-interviews", { per_page: 8 }),
    getPostsByCategorySlug("us-interviews", { per_page: 8 }),
    getPostsByCategorySlug("congress", { per_page: 8 }),
    getPostsByCategorySlug("world-interviews", { per_page: 8 }),
  ]);

  const [
    interviewsPosts,
    interviewsArchivePosts,
    professorPodcastsPosts,
    rhodeIslandPosts,
    usInterviewsPosts,
    congressPosts,
    worldInterviewsPosts,
  ] = await Promise.all([
    enhancePreviewPosts(interviewsPostsRaw, categories),
    enhancePreviewPosts(interviewsArchiveRaw, categories),
    enhancePreviewPosts(professorPodcastsPostsRaw, categories),
    enhancePreviewPosts(rhodeIslandPostsRaw, categories),
    enhancePreviewPosts(usInterviewsPostsRaw, categories),
    enhancePreviewPosts(congressPostsRaw, categories),
    enhancePreviewPosts(worldInterviewsPostsRaw, categories),
  ]);

  const interviewsCategory = categories.find((cat) => cat.slug === "interviews");
  const contentManager = new PageContentManager();

  const congressArticles = contentManager.selectArticles(congressPosts, 4, {
    allowPartial: true,
  });
  const worldInterviewsArticles = contentManager.selectArticles(
    worldInterviewsPosts,
    5,
    { allowPartial: true }
  );
  const pairCount = Math.min(
    4,
    contentManager.getAvailable(rhodeIslandPosts).length,
    contentManager.getAvailable(usInterviewsPosts).length
  );
  const rhodeIslandColumn = contentManager.selectArticles(
    rhodeIslandPosts,
    pairCount,
    { allowPartial: true }
  );
  const usInterviewsColumn = contentManager.selectArticles(
    usInterviewsPosts,
    pairCount,
    { allowPartial: true }
  );
  const academicPerspectives = contentManager.selectArticles(
    professorPodcastsPosts,
    5,
    { allowPartial: true }
  );

  const heroArticles = contentManager.selectArticles(interviewsPosts, 5, {
    allowPartial: true,
  });
  const latestArticles = contentManager.selectArticles(interviewsPosts, 9, {
    allowPartial: true,
  });
  const heroArticles2 = contentManager.selectArticles(interviewsPosts, 5, {
    allowPartial: true,
  });

  const excludeIds = contentManager.getUsedIds();
  const archivePosts = contentManager.selectArticles(
    interviewsArchivePosts,
    ARCHIVE_PER_PAGE,
    { allowPartial: true }
  );

  return (
    <main className="page-container">
      <div className="main-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="interviews" />
        )}
        {latestArticles.length > 0 && (
          <ArticleLayout posts={latestArticles} categoryName="Latest" />
        )}
        {congressArticles.length > 0 && (
          <ArticleGrid posts={congressArticles} categoryName="Congress" />
        )}
        {worldInterviewsArticles.length > 0 && (
          <ArticleLayout
            posts={worldInterviewsArticles}
            categoryName="World Interviews"
          />
        )}
        {(rhodeIslandColumn.length > 0 || usInterviewsColumn.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Rhode Island"
              leftColumnArticles={rhodeIslandColumn}
              rightColumnTitle="U.S. Interviews"
              rightColumnArticles={usInterviewsColumn}
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
        {archivePosts.length > 0 && (
          <InfiniteScrollArticleList
            subsection="interviews"
            initialPosts={archivePosts}
            initialPage={ARCHIVE_OFFSET / ARCHIVE_PER_PAGE}
            perPage={ARCHIVE_PER_PAGE}
            title={`${interviewsCategory?.name ?? "Interviews"} Archive`}
            excludeIds={excludeIds}
          />
        )}
      </div>
    </main>
  );
}
