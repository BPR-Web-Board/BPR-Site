import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cacheInvalidation } from "@/app/lib/cache";

/**
 * API endpoint for cache revalidation
 *
 * This endpoint allows WordPress (or other services) to trigger cache invalidation
 * when content is updated.
 *
 * Usage:
 * POST /api/revalidate?secret=YOUR_SECRET&type=posts
 *
 * Query Parameters:
 * - secret (required): Revalidation secret token (must match REVALIDATION_SECRET env var)
 * - type (optional): Type of cache to invalidate (posts, categories, tags, authors, media, all)
 * - path (optional): Specific path to revalidate in Next.js
 *
 * Example WordPress webhook:
 * curl -X POST "https://yourdomain.com/api/revalidate?secret=YOUR_SECRET&type=posts"
 */
export async function POST(request: NextRequest) {
  try {
    // Get and verify the secret token
    const secret = request.nextUrl.searchParams.get("secret");
    const revalidationSecret = process.env.REVALIDATION_SECRET;

    if (!revalidationSecret) {
      console.error("REVALIDATION_SECRET is not configured");
      return NextResponse.json(
        {
          success: false,
          message: "Revalidation is not configured on the server",
        },
        { status: 500 }
      );
    }

    if (secret !== revalidationSecret) {
      console.warn("Invalid revalidation token attempted");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid revalidation token",
        },
        { status: 401 }
      );
    }

    // Get the type of cache to invalidate
    const type = request.nextUrl.searchParams.get("type") || "all";
    const path = request.nextUrl.searchParams.get("path");

    console.log(`Cache revalidation requested: type=${type}, path=${path}`);

    // Invalidate Redis/memory cache
    switch (type.toLowerCase()) {
      case "posts":
        await cacheInvalidation.invalidatePosts();
        break;
      case "categories":
        await cacheInvalidation.invalidateCategories();
        break;
      case "tags":
        await cacheInvalidation.invalidateTags();
        break;
      case "authors":
        await cacheInvalidation.invalidateAuthors();
        break;
      case "media":
        await cacheInvalidation.invalidateMedia();
        break;
      case "all":
      default:
        await cacheInvalidation.invalidateAll();
        break;
    }

    // Revalidate Next.js paths if specified
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    } else {
      // Revalidate common paths
      revalidatePath("/");
      revalidatePath("/components-demo");
      revalidatePath("/world");
      revalidatePath("/united-states");
      revalidatePath("/magazine");
      revalidatePath("/interviews");
      console.log("Revalidated common paths");
    }

    // You can also use revalidateTag if you've tagged your data fetches
    // revalidateTag('posts');

    return NextResponse.json({
      success: true,
      revalidated: true,
      type,
      path: path || "all common paths",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error during revalidation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error revalidating cache",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if the revalidation endpoint is working
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const revalidationSecret = process.env.REVALIDATION_SECRET;

  if (!revalidationSecret) {
    return NextResponse.json({
      configured: false,
      message: "REVALIDATION_SECRET is not set",
    });
  }

  if (secret !== revalidationSecret) {
    return NextResponse.json({
      configured: true,
      authenticated: false,
      message: "Revalidation endpoint is configured but token is invalid",
    });
  }

  return NextResponse.json({
    configured: true,
    authenticated: true,
    message: "Revalidation endpoint is ready",
    availableTypes: ["posts", "categories", "tags", "authors", "media", "all"],
  });
}
