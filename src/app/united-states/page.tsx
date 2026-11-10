import React from "react";
import ArticleSpotlight from "../components/ArticleSpotlight";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import FourArticleGrid from "../components/FourArticleGrid";
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

export default async function UnitedStatesPage() {
  const [
    categories,
    usaPostsRaw,
    usaArchiveRaw,
    electionsPostsRaw,
    educationPostsRaw,
    environmentPostsRaw,
    healthPostsRaw,
    lawPostsRaw,
    housingPostsRaw,
    foreignPolicyPostsRaw,
    securityPostsRaw,
  ] = await Promise.all([
    getAllCategories(),
    getPostsByCategorySlug("usa", { per_page: ARCHIVE_OFFSET }),
    getPostsByCategorySlug("usa", {
      per_page: ARCHIVE_PER_PAGE,
      offset: ARCHIVE_OFFSET,
    }),
    getPostsByCategorySlug("elections", { per_page: 8 }),
    getPostsByCategorySlug("education", { per_page: 8 }),
    getPostsByCategorySlug("environment", { per_page: 8 }),
    getPostsByCategorySlug("health", { per_page: 8 }),
    getPostsByCategorySlug("law", { per_page: 8 }),
    getPostsByCategorySlug("housing", { per_page: 8 }),
    getPostsByCategorySlug("foreign-policy", { per_page: 8 }),
    getPostsByCategorySlug("security-and-defense-usa", { per_page: 8 }),
  ]);

  const [
    usaPosts,
    usaArchivePosts,
    electionsPosts,
    educationPosts,
    environmentPosts,
    healthPosts,
    lawPosts,
    housingPosts,
    foreignPolicyPosts,
    securityPosts,
  ] = await Promise.all([
    enhancePreviewPosts(usaPostsRaw, categories),
    enhancePreviewPosts(usaArchiveRaw, categories),
    enhancePreviewPosts(electionsPostsRaw, categories),
    enhancePreviewPosts(educationPostsRaw, categories),
    enhancePreviewPosts(environmentPostsRaw, categories),
    enhancePreviewPosts(healthPostsRaw, categories),
    enhancePreviewPosts(lawPostsRaw, categories),
    enhancePreviewPosts(housingPostsRaw, categories),
    enhancePreviewPosts(foreignPolicyPostsRaw, categories),
    enhancePreviewPosts(securityPostsRaw, categories),
  ]);

  const usaCategory = categories.find((cat) => cat.slug === "usa");
  const contentManager = new PageContentManager();
  const withImage = (post: (typeof usaPosts)[number]) =>
    Boolean(post.featured_media_obj?.source_url);

  const electionSpotlight = contentManager.selectArticles(electionsPosts, 5, {
    allowPartial: true,
  });
  const envHealthCount = Math.min(
    4,
    contentManager.getAvailable(environmentPosts).length,
    contentManager.getAvailable(healthPosts).length
  );
  const environmentColumn = contentManager.selectArticles(
    environmentPosts,
    envHealthCount,
    { allowPartial: true }
  );
  const healthColumn = contentManager.selectArticles(
    healthPosts,
    envHealthCount,
    { allowPartial: true }
  );
  const educationArticles = contentManager.selectArticles(educationPosts, 4, {
    allowPartial: true,
  });
  const lawArticles = contentManager.selectArticles(lawPosts, 5, {
    allowPartial: true,
  });
  const nationalSecurityArticles = contentManager.selectArticles(
    contentManager.combineUniquePosts(foreignPolicyPosts, securityPosts),
    4,
    { allowPartial: true }
  );
  const housingArticles = contentManager.selectArticles(housingPosts, 4, {
    allowPartial: true,
  });

  const heroArticles = contentManager.selectArticles(usaPosts, 5, {
    allowPartial: true,
    filter: withImage,
  });
  const spotlightArticles = contentManager.selectArticles(usaPosts, 4, {
    allowPartial: true,
  });
  const heroArticles2 = contentManager.selectArticles(usaPosts, 5, {
    allowPartial: true,
    filter: withImage,
  });

  const excludeIds = contentManager.getUsedIds();
  const archivePosts = contentManager.selectArticles(
    usaArchivePosts,
    ARCHIVE_PER_PAGE,
    { allowPartial: true }
  );

  return (
    <main className="page-container">
      <div className="main-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="usa" />
        )}
        {spotlightArticles.length > 0 && (
          <ArticleSpotlight
            title="Domestic Briefing"
            posts={spotlightArticles}
            maxArticles={4}
          />
        )}
        {electionSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="Election Dispatch"
            posts={electionSpotlight}
          />
        )}
        {(environmentColumn.length > 0 || healthColumn.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Environment"
              leftColumnArticles={environmentColumn}
              rightColumnTitle="Health"
              rightColumnArticles={healthColumn}
            />
          </div>
        )}
        {educationArticles.length > 0 && (
          <ArticleGrid posts={educationArticles} categoryName="Education" />
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="usa" />
        )}
        {lawArticles.length > 0 && (
          <ArticleLayout posts={lawArticles} categoryName="Law & Justice" />
        )}
        {nationalSecurityArticles.length > 0 && (
          <FourArticleGrid
            posts={nationalSecurityArticles}
            categoryName="National Security & Foreign Policy"
            showCategoryTitle={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        {housingArticles.length > 0 && (
          <ArticleGrid
            posts={housingArticles}
            categoryName="Housing & Urban Affairs"
          />
        )}
        {archivePosts.length > 0 && (
          <InfiniteScrollArticleList
            subsection="usa"
            initialPosts={archivePosts}
            initialPage={ARCHIVE_OFFSET / ARCHIVE_PER_PAGE}
            perPage={ARCHIVE_PER_PAGE}
            title={`${usaCategory?.name ?? "United States"} Archive`}
            excludeIds={excludeIds}
          />
        )}
      </div>
    </main>
  );
}
