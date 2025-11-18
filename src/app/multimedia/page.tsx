import { getPostsByCategorySlug } from "../lib/wordpress";
import { enhancePosts } from "../lib/enhancePost";
import { EnhancedPost } from "../lib/types";
import Hero from "../components/Hero/Hero";
import ArticleCarousel from "../components/ArticleCarousel/ArticleCarousel";
import ArticlePreviewGrid from "../components/ArticlePreviewGrid/ArticlePreviewGrid";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout/TwoColumnArticleLayout";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase/ArticleSplitShowcase";
import FourArticleGrid from "../components/FourArticleGrid/FourArticleGrid";
import ArticleLayout from "../components/ArticleLayout/ArticleLayout";

/**
 * Multimedia Section Landing Page
 *
 * Displays multimedia content organized by subsection:
 * - BPRadio (podcasts and audio content)
 * - Data (data visualizations and infographics)
 * - Media (photos, videos, and visual journalism)
 */
export default async function MultimediaPage() {
  // Fetch posts for each multimedia subsection in parallel
  const [allMultimedia, bpRadio, dataViz, media] = await Promise.all([
    getPostsByCategorySlug("multimedia", { per_page: 15 }),
    getPostsByCategorySlug("bpradio", { per_page: 10 }),
    getPostsByCategorySlug("data", { per_page: 10 }),
    getPostsByCategorySlug("media", { per_page: 10 }),
  ]);

  // Enhance all posts in parallel
  const [enhancedAll, enhancedRadio, enhancedData, enhancedMedia] =
    await Promise.all([
      enhancePosts(allMultimedia),
      enhancePosts(bpRadio),
      enhancePosts(dataViz),
      enhancePosts(media),
    ]);

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
        <h1 className="text-5xl font-bold tracking-tight">Multimedia</h1>
        <p className="text-lg text-gray-600 mt-2">
          Visual journalism, data stories, podcasts, and interactive content
        </p>
      </div>

      {/* Hero - Featured Multimedia */}
      {enhancedAll.length > 0 && (
        <section>
          <div className="border-b-2 border-black mb-6 pb-2">
            <h2 className="text-2xl font-bold">Featured</h2>
          </div>
          <Hero posts={ensureContent(enhancedAll, 0, 1)} priority={true} />
        </section>
      )}

      {/* Preview Grid - Latest Multimedia (Articles 2-11) */}
      {enhancedAll.length > 1 && (
        <section>
          <div className="border-b-2 border-black mb-6 pb-2">
            <h2 className="text-2xl font-bold">Latest Multimedia</h2>
          </div>
          <ArticlePreviewGrid posts={ensureContent(enhancedAll, 1, 10)} />
        </section>
      )}

      {/* Split Showcase - BPRadio */}
      {enhancedRadio.length > 0 && (
        <section>
          <ArticleSplitShowcase
            posts={ensureContent(enhancedRadio, 0, 7)}
            sectionTitle="BPRadio"
            mainPlacement="right"
          />
        </section>
      )}

      {/* Two Column Layout - Data vs Media */}
      {(enhancedData.length > 0 || enhancedMedia.length > 0) && (
        <section>
          <TwoColumnArticleLayout
            leftPosts={ensureContent(enhancedData, 0, 5)}
            rightPosts={ensureContent(enhancedMedia, 0, 5)}
            leftTitle="Data & Visualizations"
            rightTitle="Photos & Video"
          />
        </section>
      )}

      {/* Carousel - More from BPRadio */}
      {enhancedRadio.length > 7 && (
        <section>
          <ArticleCarousel
            posts={ensureContent(enhancedRadio, 7, 5)}
            title="More from BPRadio"
          />
        </section>
      )}

      {/* Four Article Grid - Data Deep Dives */}
      {enhancedData.length > 5 && (
        <section>
          <FourArticleGrid
            posts={ensureContent(enhancedData, 5, 4)}
            rows={1}
            title="Data Deep Dives"
          />
        </section>
      )}

      {/* Article Layout - Visual Stories */}
      {enhancedMedia.length > 5 && (
        <section>
          <ArticleLayout
            posts={ensureContent(enhancedMedia, 5, 5)}
            sectionTitle="Visual Stories"
          />
        </section>
      )}

      {/* More Multimedia Grid */}
      {enhancedAll.length > 11 && (
        <section>
          <FourArticleGrid
            posts={ensureContent(enhancedAll, 11, 4)}
            rows={1}
            title="More Multimedia"
          />
        </section>
      )}

      {/* CTA Sections */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Podcast CTA */}
        <section className="bg-gray-100 p-8 border-2 border-black">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Listen to BPRadio</h3>
            <p className="text-gray-700 mb-6">
              Explore our complete catalog of podcasts and audio journalism.
            </p>
            <a
              href="/podcasts"
              className="inline-block bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors"
            >
              Browse Podcasts
            </a>
          </div>
        </section>

        {/* Multimedia Archive CTA */}
        <section className="bg-black text-white p-8 border-2 border-black">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Multimedia Archive</h3>
            <p className="text-gray-300 mb-6">
              Browse our collection of visual journalism and data stories.
            </p>
            <a
              href="/multimedia"
              className="inline-block bg-white text-black px-6 py-3 font-bold hover:bg-gray-200 transition-colors"
            >
              Explore Archive
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

// Revalidate every 30 minutes
export const revalidate = 1800;
