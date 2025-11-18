import { NextRequest, NextResponse } from "next/server";
import { getPostsByCategorySlug, getAllCategories } from "@/app/lib/wordpress";
import { enhancePosts } from "@/app/lib/enhancePost";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("category");

    if (!categorySlug) {
      return NextResponse.json(
        { error: "Category slug is required" },
        { status: 400 }
      );
    }

    // Fetch articles and categories
    const [posts, categories] = await Promise.all([
      getPostsByCategorySlug(categorySlug, { per_page: 5 }),
      getAllCategories(),
    ]);

    if (!posts || posts.length === 0) {
      return NextResponse.json({ article: null });
    }

    // Enhance posts
    const enhancedPosts = await enhancePosts(posts, categories);

    // Return a random article
    const randomIndex = Math.floor(Math.random() * enhancedPosts.length);
    const article = enhancedPosts[randomIndex];

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error fetching category article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
