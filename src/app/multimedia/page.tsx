import React from "react";
import ArticleSpotlight from "../components/ArticleSpotlight";
import ArticleGrid from "../components/ArticleGrid";
import ArticleLayout from "../components/ArticleLayout";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase";
import Hero from "../components/Hero";
import InfiniteScrollArticleList from "../components/shared/InfiniteScrollArticleList";
import "../mainStyle.css";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
import { PageContentManager } from "../lib/contentManager";

export const revalidate = 1800;

const ARCHIVE_OFFSET = 40;
const ARCHIVE_PER_PAGE = 10;

export default async function MultimediaPage() {
  const [
    categories,
    multimediaPostsRaw,
    multimediaArchiveRaw,
    bpradioPostsRaw,
    dataPostsRaw,
    mediaPostsRaw,
  ] = await Promise.all([
    getAllCategories(),
    getPostsByCategorySlug("multimedia", { per_page: ARCHIVE_OFFSET }),
    getPostsByCategorySlug("multimedia", {
      per_page: ARCHIVE_PER_PAGE,
      offset: ARCHIVE_OFFSET,
    }),
    getPostsByCategorySlug("bpradio", { per_page: 10 }),
    getPostsByCategorySlug("data", { per_page: 10 }),
    getPostsByCategorySlug("media", { per_page: 10 }),
  ]);

  const [
    multimediaPosts,
    multimediaArchivePosts,
    bpradioPosts,
    dataPosts,
    mediaPosts,
  ] = await Promise.all([
    enhancePreviewPosts(multimediaPostsRaw, categories),
    enhancePreviewPosts(multimediaArchiveRaw, categories),
    enhancePreviewPosts(bpradioPostsRaw, categories),
    enhancePreviewPosts(dataPostsRaw, categories),
    enhancePreviewPosts(mediaPostsRaw, categories),
  ]);

  const multimediaCategory = categories.find((cat) => cat.slug === "multimedia");
  const contentManager = new PageContentManager();
  const withImage = (post: (typeof multimediaPosts)[number]) =>
    Boolean(post.featured_media_obj?.source_url);

  const bpradioArticles = contentManager.selectArticles(bpradioPosts, 4, {
    allowPartial: true,
  });
  const bpradioSpotlight = contentManager.selectArticles(bpradioPosts, 5, {
    allowPartial: true,
  });
  const dataAnalysisArticles = contentManager.selectArticles(dataPosts, 5, {
    allowPartial: true,
  });
  const mediaArticles = contentManager.selectArticles(mediaPosts, 4, {
    allowPartial: true,
  });

  const heroArticles = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
    filter: withImage,
  });
  const spotlightArticles = contentManager.selectArticles(multimediaPosts, 4, {
    allowPartial: true,
  });
  const heroArticles2 = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
    filter: withImage,
  });

  const excludeIds = contentManager.getUsedIds();
  const archivePosts = contentManager.selectArticles(
    multimediaArchivePosts,
    ARCHIVE_PER_PAGE,
    { allowPartial: true }
  );

  return (
    <main className="page-container">
      <div className="main-content">
        {heroArticles.length > 0 && (
          <Hero posts={heroArticles} preferredCategory="multimedia" />
        )}
        {spotlightArticles.length > 0 && (
          <ArticleSpotlight
            title="Multimedia Showcase"
            posts={spotlightArticles}
            maxArticles={4}
          />
        )}
        {bpradioArticles.length > 0 && (
          <ArticleGrid posts={bpradioArticles} categoryName="BPRadio" />
        )}
        {bpradioSpotlight.length > 0 && (
          <ArticleSplitShowcase
            sectionTitle="BPRadio Features"
            posts={bpradioSpotlight}
          />
        )}
        {heroArticles2.length > 0 && (
          <Hero posts={heroArticles2} preferredCategory="multimedia" />
        )}
        {dataAnalysisArticles.length > 0 && (
          <ArticleLayout
            posts={dataAnalysisArticles}
            categoryName="Data & Analysis"
          />
        )}
        {mediaArticles.length > 0 && (
          <ArticleGrid posts={mediaArticles} categoryName="Media" />
        )}
        {archivePosts.length > 0 && (
          <InfiniteScrollArticleList
            subsection="multimedia"
            initialPosts={archivePosts}
            initialPage={ARCHIVE_OFFSET / ARCHIVE_PER_PAGE}
            perPage={ARCHIVE_PER_PAGE}
            title={`${multimediaCategory?.name ?? "Multimedia"} Archive`}
            excludeIds={excludeIds}
          />
        )}
      </div>
    </main>
  );
}
