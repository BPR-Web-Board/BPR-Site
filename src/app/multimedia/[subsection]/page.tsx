import React from "react";
import ArticleSpotlight from "../../components/ArticleSpotlight";
import ArticleGrid from "../../components/ArticleGrid";
import InfiniteScrollArticleList from "../../components/shared/InfiniteScrollArticleList";
import { enhancePreviewPosts } from "../../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../../lib/wordpress";
import { PageContentManager } from "../../lib/contentManager";
import "../../mainStyle.css";

interface SubsectionPageProps {
  params: Promise<{
    subsection: string;
  }>;
}

export default async function MultimediaSubsectionPage({
  params,
}: SubsectionPageProps) {
  const { subsection } = await params;

  // Fetch categories first to enhance posts
  const categories = await getAllCategories();

  // Total: 23 posts on initial load
  const [spotlightPostsRaw, gridPostsRaw, infiniteScrollPostsRaw] =
    await Promise.all([
      getPostsByCategorySlug(subsection, { per_page: 5, page: 1 }),
      getPostsByCategorySlug(subsection, { per_page: 8, page: 1, offset: 5 }),
      getPostsByCategorySlug(subsection, { per_page: 10, page: 1, offset: 13 }),
    ]);

  // Enhance all posts in parallel
  const [spotlightPosts, gridPosts, infiniteScrollPosts] = await Promise.all([
    enhancePreviewPosts(spotlightPostsRaw, categories),
    enhancePreviewPosts(gridPostsRaw, categories),
    enhancePreviewPosts(infiniteScrollPostsRaw, categories),
  ]);

  // Get the category name for display
  const subsectionCategory = categories.find((cat) => cat.slug === subsection);
  const categoryName = subsectionCategory?.name || subsection;

  // Create content manager to prevent duplicate articles across all page components
  const contentManager = new PageContentManager();

  // Create a global fallback pool for filling gaps
  const globalFallbackPool = contentManager.combineUniquePosts(
    spotlightPosts,
    gridPosts,
    infiniteScrollPosts
  );

  // Select articles for each section in order
  const displaySpotlightPosts = contentManager.selectArticles(spotlightPosts, 4, {
    allowPartial: true,
  });

  // Grid section - ensure exactly 8 articles
  const displayGridPosts = contentManager.fillToCount(
    gridPosts,
    8,
    globalFallbackPool
  );

  return (
    <main className="page-container">
      <div className="main-content">
        {displaySpotlightPosts.length > 0 && (
          <ArticleSpotlight
            title="Latest"
            posts={displaySpotlightPosts}
            maxArticles={4}
          />
        )}

        {/* Article Grid - 2 rows x 4 columns = 8 posts */}
        <ArticleGrid
          posts={displayGridPosts}
          categoryName="Spotlight"
          maxArticles={8}
        />

        {/* Infinite Scroll Article List - Remaining posts */}
        {infiniteScrollPosts.length > 0 && (
          <InfiniteScrollArticleList
            subsection={subsection}
            initialPosts={infiniteScrollPosts}
            initialPage={2} // We already loaded page 1 (offset 13-22), start from page 2
            perPage={10}
            title={`${categoryName} Archive`}
          />
        )}

        {/* Empty state if no posts at all */}
        {displaySpotlightPosts.length === 0 &&
          displayGridPosts.length === 0 &&
          infiniteScrollPosts.length === 0 && (
            <div
              className="site-state width-constrained"
            >
              <h2>No articles found</h2>
              <p>There are currently no articles in this subsection.</p>
            </div>
          )}
      </div>
    </main>
  );
}

// Generate static params for common subsections
export async function generateStaticParams() {
  // Common Multimedia subsections
  const subsections = ["bpradio", "data", "media"];

  return subsections.map((subsection) => ({
    subsection,
  }));
}

// Revalidate every 30 minutes for fresh content
export const revalidate = 1800;
