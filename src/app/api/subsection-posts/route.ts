import { NextRequest, NextResponse } from "next/server";
import { getPostsByCategorySlug, getAllCategories } from "@/app/lib/wordpress";
import { enhancePosts } from "@/app/lib/enhancePost";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subsection = searchParams.get("subsection");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "10", 10);

    if (!subsection) {
      return NextResponse.json(
        { error: "Subsection parameter is required" },
        { status: 400 }
      );
    }

    // Fetch posts and categories in parallel
    const [posts, categories] = await Promise.all([
      getPostsByCategorySlug(subsection, {
        per_page: perPage,
        page: page,
      }),
      getAllCategories(),
    ]);

    // Enhance posts with author, media, and category data
    const enhancedPosts = await enhancePosts(posts, categories);

    return NextResponse.json({
      posts: enhancedPosts,
      page,
      perPage,
      hasMore: posts.length === perPage, // If we got a full page, there might be more
    });
  } catch (error) {
    console.error("Error fetching subsection posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
