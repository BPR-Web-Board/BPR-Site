import React from "react";
import ArticleSpotlight from "../components/ArticleSpotlight";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import FourArticleGrid from "../components/FourArticleGrid";
import Hero from "../components/Hero";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout";
import "../mainStyle.css";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
import { PageContentManager } from "../lib/contentManager";

export const revalidate = 1800;

export default async function MultimediaPage() {
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
      enhancePreviewPosts(multimediaPostsRaw, categories),
      enhancePreviewPosts(bpradioPostsRaw, categories),
      enhancePreviewPosts(dataPostsRaw, categories),
      enhancePreviewPosts(mediaPostsRaw, categories),
    ]);

  const multimediaCategory = categories.find((cat) => cat.slug === "multimedia");

  // Create content manager to prevent duplicate articles across all page components
  const contentManager = new PageContentManager();

  // Create a global fallback pool for filling gaps
  const globalFallbackPool = contentManager.combineUniquePosts(
    multimediaPosts,
    bpradioPosts,
    dataPosts,
    mediaPosts
  );

  // Select articles for each section in order of appearance on the page
  // This ensures no article appears twice on the multimedia page

  // Two Column Layout - Data and Media
  const dataPool = contentManager.ensureContent(dataPosts, multimediaPosts);
  const dataColumn = contentManager.selectArticles(dataPool, 5, {
    allowPartial: true,
  });
  const mediaPool = contentManager.ensureContent(mediaPosts, multimediaPosts);
  const mediaColumn = contentManager.selectArticles(mediaPool, 5, {
    allowPartial: true,
  });

  // Hero
  const heroArticles = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
  });

  // BPRadio section - ensure exactly 4 articles
  const bpradioPool = contentManager.ensureContent(bpradioPosts, multimediaPosts);
  const bpradioArticles = contentManager.fillToCount(
    bpradioPool,
    4,
    globalFallbackPool
  );

  const spotlightArticles = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
  });

  // Data & Analysis section
  const dataArticles = contentManager.selectArticles(dataPool, 5, {
    allowPartial: true,
  });

  // BPRadio Features section
  const bpradioSpotlight = contentManager.selectArticles(bpradioPool, 7, {
    allowPartial: true,
  });

  // Preview Grid
  const previewArticles = contentManager.selectArticles(multimediaPosts, 10, {
    allowPartial: true,
  });

  // Second Hero
  const heroArticles2 = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
  });

  // Media section - ensure exactly 4 articles
  const mediaArticles = contentManager.fillToCount(
    mediaPool,
    4,
    globalFallbackPool
  );

  // Multimedia Collection Pool
  const multimediaPool = contentManager.combineUniquePosts(
    bpradioPosts,
    dataPosts,
    mediaPosts,
    multimediaPosts
  );
  const multimediaPoolArticles = contentManager.selectArticles(
    multimediaPool,
    4,
    {
      allowPartial: true,
    }
  );

  // Multimedia Highlights
  const multimediaHighlights = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
  });

  // Third Hero
  const heroArticles3 = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
  });


  return (
    <main className="page-container">
      <div className="main-content">
        {(dataColumn.length > 0 ||
          mediaColumn.length > 0 ||
          multimediaPosts.length > 0) && (
          <div className="two-column-layout-wrapper">
            <TwoColumnArticleLayout
              leftColumnTitle="Data"
              leftColumnArticles={dataColumn}
              rightColumnTitle="Media"
              rightColumnArticles={mediaColumn}
              fallbackArticles={multimediaPosts}
            />
          </div>
        )}
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="multimedia" />
        )}
        <ArticleGrid posts={bpradioArticles} categoryName="BPRadio" />
        {spotlightArticles.length > 0 && (
          <ArticleSpotlight
            title="Multimedia Showcase"
            posts={spotlightArticles}
            maxArticles={5}
          />
        )}
        {dataArticles.length > 0 && (
          <ArticleLayout
            posts={dataArticles}
            categoryName="Data &amp; Analysis"
          />
        )}
        {bpradioSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="BPRadio Features"
            posts={bpradioSpotlight}
          />
        )}
        {previewArticles.length > 0 && (
          <ArticlePreviewGrid articles={previewArticles} />
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="multimedia" />
        )}
        <ArticleGrid posts={mediaArticles} categoryName="Media" />
        {multimediaPoolArticles.length > 0 && (
          <FourArticleGrid
            posts={multimediaPoolArticles}
            categoryName="Multimedia Collection"
            showCategoryTitle={true}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        {multimediaHighlights.length > 0 && (
          <ArticleLayout
            posts={multimediaHighlights}
            categoryName={`${
              multimediaCategory?.name ?? "Multimedia"
            } Highlights`}
          />
        )}
        {heroArticles3.length > 0 && (
          <Hero posts={heroArticles3} preferredCategory="multimedia" />
        )}
      </div>
    </main>
  );
}
