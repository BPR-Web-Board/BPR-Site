import { getPostsByCategorySlug, getAllPosts } from "../lib/wordpress";
import { enhancePosts } from "../lib/enhancePost";
import { EnhancedPost } from "../lib/types";
import Hero from "../components/Hero/Hero";
import ArticleCarousel from "../components/ArticleCarousel/ArticleCarousel";
import TwoColumnArticleLayout from "../components/TwoColumnArticleLayout/TwoColumnArticleLayout";
import ArticleLayout from "../components/ArticleLayout/ArticleLayout";
import FourArticleGrid from "../components/FourArticleGrid/FourArticleGrid";
import ArticleSplitShowcase from "../components/ArticleSplitShowcase/ArticleSplitShowcase";

/**
 * Interviews Section Landing Page
 *
 * Displays interviews organized by subsection categories:
 * - Professor Podcasts
 * - Rhode Island
 * - U.S. (interviews tagged with BOTH interviews AND us categories)
 * - Congress
 * - World (interviews tagged with BOTH interviews AND world categories)
 */
export default async function InterviewsPage() {
  // Fetch posts for each interview subsection in parallel
  const [
    allInterviews,
    professorPodcasts,
    rhodeIsland,
    congress,
    usaPosts,
    worldPosts,
  ] = await Promise.all([
    getPostsByCategorySlug("interviews", { per_page: 10 }),
    getPostsByCategorySlug("professor-podcasts", { per_page: 8 }),
    getPostsByCategorySlug("rhode-island", { per_page: 8 }),
    getPostsByCategorySlug("congress", { per_page: 8 }),
    getPostsByCategorySlug("usa", { per_page: 20 }), // Fetch more to filter
    getPostsByCategorySlug("world", { per_page: 20 }), // Fetch more to filter
  ]);

  // For US and World interviews, we need articles tagged with BOTH categories
  // Filter by checking if the post has the "interviews" category
  const usInterviews = usaPosts.filter((post) =>
    post.categories?.some((catId) => {
      // We need to check if this post is in the interviews category
      // We'll do this by seeing if it's in our allInterviews
      return allInterviews.some((interview) => interview.id === post.id);
    })
  );

  const worldInterviews = worldPosts.filter((post) =>
    post.categories?.some((catId) => {
      return allInterviews.some((interview) => interview.id === post.id);
    })
  );

  // Enhance all posts in parallel
  const [
    enhancedAll,
    enhancedProfessor,
    enhancedRI,
    enhancedCongress,
    enhancedUS,
    enhancedWorld,
  ] = await Promise.all([
    enhancePosts(allInterviews),
    enhancePosts(professorPodcasts),
    enhancePosts(rhodeIsland),
    enhancePosts(congress),
    enhancePosts(usInterviews.slice(0, 8)),
    enhancePosts(worldInterviews.slice(0, 8)),
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
        <h1 className="text-5xl font-bold tracking-tight">Interviews</h1>
        <p className="text-lg text-gray-600 mt-2">
          Conversations with thought leaders, policymakers, and experts
        </p>
      </div>

      {/* Hero - Latest Interview */}
      {enhancedAll.length > 0 && (
        <section>
          <div className="border-b-2 border-black mb-6 pb-2">
            <h2 className="text-2xl font-bold">Featured Interview</h2>
          </div>
          <Hero posts={ensureContent(enhancedAll, 0, 1)} priority={true} />
        </section>
      )}

      {/* Carousel - Recent Interviews */}
      {enhancedAll.length > 1 && (
        <section>
          <ArticleCarousel
            posts={ensureContent(enhancedAll, 1, 5)}
            title="Recent Conversations"
          />
        </section>
      )}

      {/* Split Showcase - Professor Podcasts */}
      {enhancedProfessor.length > 0 && (
        <section>
          <ArticleSplitShowcase
            posts={ensureContent(enhancedProfessor, 0, 7)}
            sectionTitle="Professor Podcasts"
            mainPlacement="left"
          />
        </section>
      )}

      {/* Two Column Layout - U.S. Interviews vs Congress */}
      {(enhancedUS.length > 0 || enhancedCongress.length > 0) && (
        <section>
          <TwoColumnArticleLayout
            leftPosts={ensureContent(enhancedUS, 0, 5)}
            rightPosts={ensureContent(enhancedCongress, 0, 5)}
            leftTitle="U.S. Interviews"
            rightTitle="Congress"
          />
        </section>
      )}

      {/* Article Layout - World Interviews */}
      {enhancedWorld.length > 0 && (
        <section>
          <ArticleLayout
            posts={ensureContent(enhancedWorld, 0, 5)}
            sectionTitle="World Interviews"
          />
        </section>
      )}

      {/* Four Article Grid - Rhode Island */}
      {enhancedRI.length > 0 && (
        <section>
          <FourArticleGrid
            posts={ensureContent(enhancedRI, 0, 4)}
            rows={1}
            title="Rhode Island"
          />
        </section>
      )}

      {/* More Interviews Grid */}
      {enhancedAll.length > 6 && (
        <section>
          <FourArticleGrid
            posts={ensureContent(enhancedAll, 6, 4)}
            rows={1}
            title="More Interviews"
          />
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gray-100 p-8 border-2 border-black">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Listen to Our Podcasts</h3>
          <p className="text-lg text-gray-700 mb-6">
            Dive deeper into conversations with experts on policy, politics, and
            global affairs through our podcast series.
          </p>
          <a
            href="/podcasts"
            className="inline-block bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-colors"
          >
            Explore Podcasts
          </a>
        </div>
      </section>
    </div>
  );
}

// Revalidate every 30 minutes
export const revalidate = 1800;
