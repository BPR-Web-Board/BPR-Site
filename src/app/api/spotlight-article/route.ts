import { NextRequest, NextResponse } from "next/server";
import { getPostsByCategorySlug, getAllCategories } from "@/app/lib/wordpress";
import { enhancePosts } from "@/app/lib/enhancePost";
import { cache } from "@/app/lib/cache";

export const dynamic = "force-dynamic";

// Section-to-category mapping for spotlight articles
// These map to the parent category slugs in WordPress
const SECTION_CATEGORIES: Record<string, string> = {
  "United States": "usa",
  World: "world",
  Interviews: "interviews",
  Multimedia: "multimedia",
  Magazine: "mag",
};

// 7 days in milliseconds
const ONE_WEEK_TTL = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get("section");
    const perPageParam = searchParams.get("per_page");
    const perPage = perPageParam ? parseInt(perPageParam, 10) : 1;

    if (!section) {
      return NextResponse.json(
        { error: "Section is required" },
        { status: 400 }
      );
    }

    // Check if we have a valid section
    const categorySlug = SECTION_CATEGORIES[section];
    if (!categorySlug) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    // Try to get from cache first (1 week TTL)
    const cacheKey = `spotlight:${section}:${perPage}`;
    const cached = await cache.get<unknown>(cacheKey, {});

    if (cached) {
      // Return format based on requested count
      if (perPage > 1) {
        return NextResponse.json({ articles: cached });
      }
      return NextResponse.json({ article: cached });
    }

    // If not cached, fetch fresh articles (most recent)
    const requestedCount = Math.max(perPage, 2);
    const [posts, categories] = await Promise.all([
      getPostsByCategorySlug(categorySlug, { per_page: requestedCount }),
      getAllCategories(),
    ]);

    if (!posts || posts.length === 0) {
      return NextResponse.json({ article: null, articles: [] });
    }

    // Enhance posts (they come sorted by date DESC from WordPress)
    const enhancedPosts = await enhancePosts(posts, categories);

    if (perPage === 1) {
      // Get the most recent article
      const article = enhancedPosts[0];

      // Cache for 1 week
      await cache.set(cacheKey, {}, article, ONE_WEEK_TTL);

      return NextResponse.json({ article });
    } else {
      // Get the most recent N articles
      const articles = enhancedPosts.slice(0, perPage);

      // Cache for 1 week
      await cache.set(cacheKey, {}, articles, ONE_WEEK_TTL);

      return NextResponse.json({ articles });
    }
  } catch (error) {
    console.error("Error fetching spotlight article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
