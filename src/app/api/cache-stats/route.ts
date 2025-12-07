import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/app/lib/cache";

/**
 * GET endpoint to retrieve cache statistics
 * Query params:
 * - reset=true: Reset metrics after retrieving stats
 */
export async function GET(request: NextRequest) {
  const stats = await cache.getStats();
  
  const shouldReset = request.nextUrl.searchParams.get("reset") === "true";
  if (shouldReset) {
    cache.resetMetrics();
  }
  
  return NextResponse.json(stats);
}

/**
 * POST endpoint to reset cache metrics
 */
export async function POST() {
  cache.resetMetrics();
  return NextResponse.json({
    success: true,
    message: "Cache metrics reset successfully",
    timestamp: new Date().toISOString(),
  });
}
