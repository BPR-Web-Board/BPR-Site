import React from "react";
import ArticleLayout from "../components/ArticleLayout";
import FourArticleGrid from "../components/FourArticleGrid/FourArticleGrid";
import Hero from "../components/Hero";
import InfiniteScrollArticleList from "../components/shared/InfiniteScrollArticleList";
import "../mainStyle.css";
import { enhancePreviewPosts } from "../lib/enhancePost";
import { getMediaPreview } from "../lib/mediaPreview";
import { getAllCategories, getPostsByCategorySlug } from "../lib/wordpress";
import { PageContentManager } from "../lib/contentManager";
import type { EnhancedPost } from "../lib/types";

export const revalidate = 1800;

const ARCHIVE_OFFSET = 40;
const ARCHIVE_PER_PAGE = 10;
const SUBSECTION_SLUGS = ["bpradio", "data", "media"] as const;

function hasHeroImage(post: EnhancedPost): boolean {
  return Boolean(
    post.featured_media_obj?.source_url || getMediaPreview(post)?.thumbnail
  );
}

function hasCategory(post: EnhancedPost, slug: string): boolean {
  return Boolean(post.categories_obj?.some((category) => category.slug === slug));
}

function scopedToSubsection(
  posts: EnhancedPost[],
  slug: (typeof SUBSECTION_SLUGS)[number],
  { allowShared = false }: { allowShared?: boolean } = {}
): EnhancedPost[] {
  const siblings = SUBSECTION_SLUGS.filter((item) => item !== slug);
  const exclusive = posts.filter(
    (post) =>
      hasCategory(post, slug) &&
      !siblings.some((sibling) => hasCategory(post, sibling))
  );
  if (exclusive.length > 0 || !allowShared) return exclusive;
  return posts.filter((post) => hasCategory(post, slug));
}

function preferHeroImages(posts: EnhancedPost[]): EnhancedPost[] {
  return [...posts].sort(
    (a, b) => Number(hasHeroImage(b)) - Number(hasHeroImage(a))
  );
}

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
    getPostsByCategorySlug("bpradio", { per_page: 12 }),
    getPostsByCategorySlug("data", { per_page: 12 }),
    getPostsByCategorySlug("media", { per_page: 16 }),
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
  const bpradioOnly = scopedToSubsection(bpradioPosts, "bpradio");
  const bpradioPool = bpradioOnly.length
    ? bpradioOnly
    : scopedToSubsection(bpradioPosts, "bpradio", { allowShared: true });
  const dataOnly = scopedToSubsection(dataPosts, "data");
  const dataPool = dataOnly.length
    ? dataOnly
    : scopedToSubsection(dataPosts, "data", { allowShared: true });
  const mediaOnly = scopedToSubsection(mediaPosts, "media");
  const mediaPool = mediaOnly.length
    ? mediaOnly
    : scopedToSubsection(mediaPosts, "media", { allowShared: true });

  const heroArticles = contentManager.selectArticles(multimediaPosts, 5, {
    allowPartial: true,
    filter: hasHeroImage,
  });
  const showcaseFeature = contentManager.selectArticles(
    preferHeroImages(multimediaPosts),
    3,
    { allowPartial: true }
  );
  const showcaseBelow = contentManager.selectArticles(multimediaPosts, 2, {
    allowPartial: true,
  });

  const bpradioArticles = contentManager.selectArticles(
    preferHeroImages(bpradioPool),
    5,
    { allowPartial: true }
  );

  const dataAnalysisArticles = contentManager.selectArticles(
    preferHeroImages(dataPool),
    5,
    { allowPartial: true }
  );

  const mediaArticles = contentManager.selectArticles(
    preferHeroImages(mediaPool),
    9,
    { allowPartial: true }
  );

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
          <Hero posts={heroArticles} preferredCategory="multimedia" priority />
        )}
        {showcaseFeature.length > 0 && (
          <ArticleLayout
            posts={showcaseFeature}
            categoryName="Multimedia Showcase"
          />
        )}
        {showcaseBelow.length > 0 && (
          <FourArticleGrid
            posts={showcaseBelow}
            showCategoryTitle={false}
            columns={2}
            numberOfRows={1}
            className="width-constrained"
          />
        )}
        {bpradioArticles.length > 0 && (
          <ArticleLayout posts={bpradioArticles} categoryName="BPRadio" />
        )}
        {dataAnalysisArticles.length > 0 && (
          <ArticleLayout
            posts={dataAnalysisArticles}
            categoryName="Data & Analysis"
          />
        )}
        {mediaArticles.length > 0 && (
          <ArticleLayout posts={mediaArticles} categoryName="Media" />
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
