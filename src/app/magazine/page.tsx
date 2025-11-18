import { getPostsByCategorySlug } from "../lib/wordpress";
import { enhancePosts } from "../lib/enhancePost";
import { EnhancedPost } from "../lib/types";
import Hero from "../components/Hero/Hero";
import ArticleCarousel from "../components/ArticleCarousel/ArticleCarousel";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid/ArticlePreviewGrid";
import FourArticleGrid from "../components/FourArticleGrid/FourArticleGrid";
import ArticleLayout from "../components/ArticleLayout/ArticleLayout";
import Link from "next/link";

/**
 * Magazine Section Landing Page
 *
 * Displays articles tagged with "magazine" category in a creative editorial layout.
 * Features:
 * - Hero showcase for the latest magazine article
 * - Carousel for recent issues
 * - Mixed grid layouts for variety
 * - First ~20 articles displayed with link to archives
 */
export default async function MagazinePage() {
  // Fetch all magazine posts, sorted by date (most recent first)
  const magazinePosts = await getPostsByCategorySlug("magazine", {
    per_page: 25,
  });

  // Enhance posts with author, media, and category information
  const enhancedPosts = await enhancePosts(magazinePosts);

  // Helper function to ensure we have content for each section
  const ensureContent = (
    posts: EnhancedPost[],
    start: number,
    count: number
  ): EnhancedPost[] => {
    const slice = posts.slice(start, start + count);
    // If we don't have enough posts, cycle through available posts
    if (slice.length < count && posts.length > 0) {
      const needed = count - slice.length;
      const filler = posts.slice(0, needed);
      return [...slice, ...filler];
    }
    return slice;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Page Header */}
      <div className="border-b-2 border-black pb-4">
        <h1 className="text-5xl font-bold tracking-tight">Magazine</h1>
        <p className="text-lg text-gray-600 mt-2">
          In-depth analysis, long-form journalism, and thought-provoking commentary
        </p>
      </div>

      {/* Hero - Latest Magazine Article */}
      {enhancedPosts.length > 0 && (
        <section>
          <div className="border-b-2 border-black mb-6 pb-2">
            <h2 className="text-2xl font-bold">Latest Issue</h2>
          </div>
          <Hero posts={ensureContent(enhancedPosts, 0, 1)} priority={true} />
        </section>
      )}

      {/* Carousel - Recent Issues (Articles 2-6) */}
      {enhancedPosts.length > 1 && (
        <section>
          <ArticleCarousel
            posts={ensureContent(enhancedPosts, 1, 5)}
            title="Recent Features"
          />
        </section>
      )}

      {/* Preview Grid - Articles 7-16 (10 articles) */}
      {enhancedPosts.length > 6 && (
        <section>
          <div className="border-b-2 border-black mb-6 pb-2">
            <h2 className="text-2xl font-bold">Magazine Highlights</h2>
          </div>
          <ArticlePreviewGrid posts={ensureContent(enhancedPosts, 6, 10)} />
        </section>
      )}

      {/* Four Article Grid - Articles 17-20 */}
      {enhancedPosts.length > 16 && (
        <section>
          <FourArticleGrid
            posts={ensureContent(enhancedPosts, 16, 4)}
            rows={1}
            title="More from the Magazine"
          />
        </section>
      )}

      {/* Article Layout - Articles 21-25 (backup) */}
      {enhancedPosts.length > 20 && (
        <section>
          <ArticleLayout
            posts={ensureContent(enhancedPosts, 20, 5)}
            sectionTitle="Editor's Picks"
          />
        </section>
      )}

      {/* Link to Archives */}
      <section className="text-center py-12 border-t-2 border-black">
        <h3 className="text-2xl font-bold mb-4">Explore Past Issues</h3>
        <p className="text-gray-600 mb-6">
          Browse our complete archive of magazine articles and special issues
        </p>
        <Link
          href="/magazine/archives"
          className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
        >
          View Archives
        </Link>
      </section>

      {/* Pitch CTA */}
      <section className="bg-gray-100 p-8 border-2 border-black">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Have a Story Idea?</h3>
          <p className="text-lg text-gray-700 mb-6">
            We're always looking for compelling long-form pieces, in-depth analysis,
            and unique perspectives. Share your pitch with our editorial team.
          </p>
          <Link
            href="/magazine/pitch"
            className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
          >
            Submit a Pitch
          </Link>
        </div>
      </section>
    </div>
  );
}

// Revalidate every 30 minutes
export const revalidate = 1800;
