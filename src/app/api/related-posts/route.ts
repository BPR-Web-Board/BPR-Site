import { NextRequest, NextResponse } from "next/server";
import { getPostsByCategory, getAllCategories } from "@/app/lib/wordpress";
import { enhancePosts } from "@/app/lib/enhancePost";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const excludePostId = searchParams.get("excludePostId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const catId = parseInt(categoryId);
    const excludeId = excludePostId ? parseInt(excludePostId) : undefined;

    // Fetch articles and categories
    // We fetch categories too because enhancePosts needs them
    const [posts, categories] = await Promise.all([
      getPostsByCategory(catId),
      getAllCategories(),
    ]);

    if (!posts || posts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Filter out the current post
    let filteredPosts = posts;
    if (excludeId) {
      filteredPosts = posts.filter((p) => p.id !== excludeId);
    }

    // Limit to 4 posts
    const limitedPosts = filteredPosts.slice(0, 4);

    // Enhance posts
    const enhancedPosts = await enhancePosts(limitedPosts, categories);

    return NextResponse.json({ posts: enhancedPosts });
  } catch (error) {
    console.error("Error fetching related posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch related posts" },
      { status: 500 }
    );
  }
}
