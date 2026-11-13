import { NextResponse } from "next/server";

/** Only use for successful, public article responses, never errors or private data. */
export function publicArticleJson(body: unknown) {
  return NextResponse.json(body, {
    headers: {
      // Browsers recheck; Vercel shares responses by URL (including query parameters).
      "Cache-Control": "public, max-age=0, must-revalidate",
      // Keep CDN staleness bounded after a publish; this cache expires independently
      // of the Next.js path cache cleared by the publishing webhook.
      "Vercel-CDN-Cache-Control": "max-age=60, stale-while-revalidate=60",
    },
  });
}
