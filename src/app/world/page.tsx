import React from "react";
import ArticleSpotlight from "../components/ArticleSpotlight";
import ArticleGrid from "../components/ArticleGrid";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";
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

export default async function WorldPage() {
  const [
    categories,
    worldPostsRaw,
    worldArchiveRaw,
    europePostsRaw,
    asiaPacificPostsRaw,
    middleEastPostsRaw,
    africaPostsRaw,
    latinAmericaPostsRaw,
    southAmericaPostsRaw,
  ] = await Promise.all([
    getAllCategories(),
    getPostsByCategorySlug("world", { per_page: ARCHIVE_OFFSET }),
    getPostsByCategorySlug("world", {
      per_page: ARCHIVE_PER_PAGE,
      offset: ARCHIVE_OFFSET,
    }),
    getPostsByCategorySlug("europe", { per_page: 12 }),
    getPostsByCategorySlug("asia-pacific", { per_page: 12 }),
    getPostsByCategorySlug("middle-east", { per_page: 12 }),
    getPostsByCategorySlug("africa", { per_page: 8 }),
    getPostsByCategorySlug("latin-america", { per_page: 10 }),
    getPostsByCategorySlug("south-america", { per_page: 8 }),
  ]);

  const [
    worldPosts,
    worldArchivePosts,
    europePosts,
    asiaPacificPosts,
    middleEastPosts,
    africaPosts,
    latinAmericaPosts,
    southAmericaPosts,
  ] = await Promise.all([
    enhancePreviewPosts(worldPostsRaw, categories),
    enhancePreviewPosts(worldArchiveRaw, categories),
    enhancePreviewPosts(europePostsRaw, categories),
    enhancePreviewPosts(asiaPacificPostsRaw, categories),
    enhancePreviewPosts(middleEastPostsRaw, categories),
    enhancePreviewPosts(africaPostsRaw, categories),
    enhancePreviewPosts(latinAmericaPostsRaw, categories),
    enhancePreviewPosts(southAmericaPostsRaw, categories),
  ]);

  const worldCategory = categories.find((cat) => cat.slug === "world");
  const contentManager = new PageContentManager();
  const withImage = (post: (typeof worldPosts)[number]) =>
    Boolean(post.featured_media_obj?.source_url);

  const africaSpotlight = contentManager.selectArticles(africaPosts, 7, {
    allowPartial: true,
  });
  const asiaPacificArticles = contentManager.selectArticles(
    asiaPacificPosts,
    9,
    { allowPartial: true }
  );
  const europeMeCount = Math.min(
    4,
    contentManager.getAvailable(europePosts).length,
    contentManager.getAvailable(middleEastPosts).length
  );
  const europeColumn = contentManager.selectArticles(
    europePosts,
    europeMeCount,
    { allowPartial: true }
  );
  const middleEastColumn = contentManager.selectArticles(
    middleEastPosts,
    europeMeCount,
    { allowPartial: true }
  );
  const latinAmericaArticles = contentManager.selectArticles(
    latinAmericaPosts,
    9,
    { allowPartial: true }
  );
  const southAmericaArticles = contentManager.selectArticles(
    southAmericaPosts,
    4,
    { allowPartial: true }
  );

  const heroArticles = contentManager.selectArticles(worldPosts, 5, {
    allowPartial: true,
    filter: withImage,
  });
  const spotlightArticles = contentManager.selectArticles(worldPosts, 4, {
    allowPartial: true,
  });
  const heroArticles2 = contentManager.selectArticles(worldPosts, 5, {
    allowPartial: true,
    filter: withImage,
  });

  const excludeIds = contentManager.getUsedIds();
  const archivePosts = contentManager.selectArticles(
    worldArchivePosts,
    ARCHIVE_PER_PAGE,
    { allowPartial: true }
  );

  return (
    <main className="page-container">
      <div className="main-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="world" />
        )}
        {spotlightArticles.length > 0 && (
          <ArticleSpotlight
            title="Global Briefing"
            posts={spotlightArticles}
            maxArticles={4}
          />
        )}
        {africaSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Africa Dispatch"
            posts={africaSpotlight}
          />
        )}
        {asiaPacificArticles.length > 0 && (
          <ArticlePreviewGrid
            articles={asiaPacificArticles}
            categoryName="Asia/Pacific"
          />
        )}
        {(europeColumn.length > 0 || middleEastColumn.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Europe"
              leftColumnArticles={europeColumn}
              rightColumnTitle="Middle East"
              rightColumnArticles={middleEastColumn}
            />
          </div>
        )}
        {latinAmericaArticles.length > 0 && (
          <ArticlePreviewGrid
            articles={latinAmericaArticles}
            categoryName="Latin America"
          />
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="world" />
        )}
        {southAmericaArticles.length > 0 && (
          <ArticleGrid
            posts={southAmericaArticles}
            categoryName="South America"
            maxArticles={4}
          />
        )}
        {archivePosts.length > 0 && (
          <InfiniteScrollArticleList
            subsection="world"
            initialPosts={archivePosts}
            initialPage={ARCHIVE_OFFSET / ARCHIVE_PER_PAGE}
            perPage={ARCHIVE_PER_PAGE}
            title={`${worldCategory?.name ?? "World"} Archive`}
            excludeIds={excludeIds}
          />
        )}
      </div>
    </main>
  );
}
