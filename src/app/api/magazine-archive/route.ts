import { NextRequest, NextResponse } from "next/server";
import { enhancePosts } from "../../lib/enhancePost";
import { getAllCategories, getPostsByCategorySlug } from "../../lib/wordpress";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "12", 10);

    // Validate parameters
    if (page < 1 || perPage < 1 || perPage > 100) {
      return NextResponse.json(
        { error: "Invalid page or per_page parameter" },
        { status: 400 }
      );
    }

    // Fetch categories and magazine posts
    const [categories, magazinePostsRaw] = await Promise.all([
      getAllCategories(),
      getPostsByCategorySlug("mag", {
        per_page: perPage,
        page: page,
      }),
    ]);

    // Enhance posts with additional data
    const enhancedPosts = await enhancePosts(magazinePostsRaw, categories);

    // Sort by date (newest first)
    const sortedPosts = enhancedPosts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json(
      {
        posts: sortedPosts,
        page: page,
        per_page: perPage,
        total: sortedPosts.length,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching magazine archive:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch magazine articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
