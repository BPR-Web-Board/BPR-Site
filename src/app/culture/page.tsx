import React from "react";
import ArticleSpotlight from "../components/ArticleSpotlight";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
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

export default async function CulturePage() {
  const [
    categories,
    culturePostsRaw,
    cultureArchiveRaw,
    artsPostsRaw,
    genderPostsRaw,
    healthCulturePostsRaw,
    lgbtqPostsRaw,
    racePostsRaw,
    religionPostsRaw,
    sciencePostsRaw,
    technologyPostsRaw,
  ] = await Promise.all([
    getAllCategories(),
    getPostsByCategorySlug("culture", { per_page: ARCHIVE_OFFSET }),
    getPostsByCategorySlug("culture", {
      per_page: ARCHIVE_PER_PAGE,
      offset: ARCHIVE_OFFSET,
    }),
    getPostsByCategorySlug("arts", { per_page: 8 }),
    getPostsByCategorySlug("gender", { per_page: 8 }),
    getPostsByCategorySlug("health-culture", { per_page: 8 }),
    getPostsByCategorySlug("lgbtq", { per_page: 10 }),
    getPostsByCategorySlug("race", { per_page: 8 }),
    getPostsByCategorySlug("religion", { per_page: 8 }),
    getPostsByCategorySlug("science", { per_page: 8 }),
    getPostsByCategorySlug("technology", { per_page: 8 }),
  ]);

  const [
    culturePosts,
    cultureArchivePosts,
    artsPosts,
    genderPosts,
    healthCulturePosts,
    lgbtqPosts,
    racePosts,
    religionPosts,
    sciencePosts,
    technologyPosts,
  ] = await Promise.all([
    enhancePreviewPosts(culturePostsRaw, categories),
    enhancePreviewPosts(cultureArchiveRaw, categories),
    enhancePreviewPosts(artsPostsRaw, categories),
    enhancePreviewPosts(genderPostsRaw, categories),
    enhancePreviewPosts(healthCulturePostsRaw, categories),
    enhancePreviewPosts(lgbtqPostsRaw, categories),
    enhancePreviewPosts(racePostsRaw, categories),
    enhancePreviewPosts(religionPostsRaw, categories),
    enhancePreviewPosts(sciencePostsRaw, categories),
    enhancePreviewPosts(technologyPostsRaw, categories),
  ]);

  const cultureCategory = categories.find((cat) => cat.slug === "culture");
  const contentManager = new PageContentManager();
  const withImage = (post: (typeof culturePosts)[number]) =>
    Boolean(post.featured_media_obj?.source_url);

  const artsSpotlight = contentManager.selectArticles(artsPosts, 5, {
    allowPartial: true,
  });
  const genderRaceCount = Math.min(
    4,
    contentManager.getAvailable(genderPosts).length,
    contentManager.getAvailable(racePosts).length
  );
  const genderColumn = contentManager.selectArticles(genderPosts, genderRaceCount, {
    allowPartial: true,
  });
  const raceColumn = contentManager.selectArticles(racePosts, genderRaceCount, {
    allowPartial: true,
  });
  const religionArticles = contentManager.selectArticles(religionPosts, 5, {
    allowPartial: true,
  });
  const scienceTechCount = Math.min(
    4,
    contentManager.getAvailable(sciencePosts).length,
    contentManager.getAvailable(technologyPosts).length
  );
  const scienceColumn = contentManager.selectArticles(
    sciencePosts,
    scienceTechCount,
    { allowPartial: true }
  );
  const technologyColumn = contentManager.selectArticles(
    technologyPosts,
    scienceTechCount,
    { allowPartial: true }
  );
  const healthCultureArticles = contentManager.selectArticles(
    healthCulturePosts,
    4,
    { allowPartial: true }
  );
  const lgbtqArticles = contentManager.selectArticles(lgbtqPosts, 9, {
    allowPartial: true,
  });

  const heroArticles = contentManager.selectArticles(culturePosts, 5, {
    allowPartial: true,
    filter: withImage,
  });
  const spotlightArticles = contentManager.selectArticles(culturePosts, 4, {
    allowPartial: true,
  });
  const heroArticles2 = contentManager.selectArticles(culturePosts, 5, {
    allowPartial: true,
    filter: withImage,
  });

  const excludeIds = contentManager.getUsedIds();
  const archivePosts = contentManager.selectArticles(
    cultureArchivePosts,
    ARCHIVE_PER_PAGE,
    { allowPartial: true }
  );

  return (
    <main className="page-container">
      <div className="main-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="culture" />
        )}
        {spotlightArticles.length > 0 && (
          <ArticleSpotlight
            title="Culture Spotlight"
            posts={spotlightArticles}
            maxArticles={4}
          />
        )}
        {artsSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Arts & Expression"
            posts={artsSpotlight}
          />
        )}
        {(genderColumn.length > 0 || raceColumn.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Gender"
              leftColumnArticles={genderColumn}
              rightColumnTitle="Race"
              rightColumnArticles={raceColumn}
            />
          </div>
        )}
        {religionArticles.length > 0 && (
          <ArticleLayout posts={religionArticles} categoryName="Religion" />
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="culture" />
        )}
        {(scienceColumn.length > 0 || technologyColumn.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Science"
              leftColumnArticles={scienceColumn}
              rightColumnTitle="Technology"
              rightColumnArticles={technologyColumn}
            />
          </div>
        )}
        {healthCultureArticles.length > 0 && (
          <ArticleGrid
            posts={healthCultureArticles}
            categoryName="Health & Culture"
            maxArticles={4}
          />
        )}
        {lgbtqArticles.length > 0 && (
          <ArticlePreviewGrid
            articles={lgbtqArticles}
            categoryName="LGBTQ+ Politics"
          />
        )}
        {archivePosts.length > 0 && (
          <InfiniteScrollArticleList
            subsection="culture"
            initialPosts={archivePosts}
            initialPage={ARCHIVE_OFFSET / ARCHIVE_PER_PAGE}
            perPage={ARCHIVE_PER_PAGE}
            title={`${cultureCategory?.name ?? "Culture"} Archive`}
            excludeIds={excludeIds}
          />
        )}
      </div>
    </main>
  );
}
