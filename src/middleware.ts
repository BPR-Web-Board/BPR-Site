import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MULTIMEDIA_SUBSECTIONS = [
  "bpradio",
  "bpr-prodcast",
  "data",
  "media",
] as const;

/** Common single-segment probes that should never hit WordPress. */
const BLOCKED_LEGACY_SLUGS = new Set([
  "admin",
  "login",
  "wp-admin",
  "wp-login",
  "wp-content",
  "wp-includes",
  "xmlrpc",
  "wordpress",
  "phpmyadmin",
  "cgi-bin",
  "vendor",
  "node_modules",
  "robots",
  "sitemap",
  "feed",
  "rss",
  "cdn-cgi",
]);

const ARTICLE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

function normalizeMultimedia(subsection: (typeof MULTIMEDIA_SUBSECTIONS)[number]) {
  return subsection === "bpr-prodcast" ? "bpradio" : subsection;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const subsection of MULTIMEDIA_SUBSECTIONS) {
    if (pathname.startsWith(`/${subsection}/article/`)) {
      const slug = pathname.slice(`/${subsection}/article/`.length).replace(/\/$/, "");
      if (!slug || !ARTICLE_SLUG.test(slug)) {
        return NextResponse.next();
      }
      return NextResponse.redirect(
        new URL(`/multimedia/${normalizeMultimedia(subsection)}/article/${slug}`, request.url),
        308
      );
    }

    if (pathname === `/${subsection}` || pathname === `/${subsection}/`) {
      return NextResponse.redirect(
        new URL(`/multimedia/${normalizeMultimedia(subsection)}`, request.url),
        308
      );
    }
  }

  const legacyMatch = pathname.match(/^\/([^/]+)\/?$/);
  const legacySlug = legacyMatch?.[1];
  if (
    legacySlug &&
    ARTICLE_SLUG.test(legacySlug) &&
    !BLOCKED_LEGACY_SLUGS.has(legacySlug.toLowerCase()) &&
    !MULTIMEDIA_SUBSECTIONS.includes(
      legacySlug as (typeof MULTIMEDIA_SUBSECTIONS)[number]
    )
  ) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/legacy-article/${legacySlug}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/bpradio",
    "/bpradio/:path*",
    "/bpr-prodcast",
    "/bpr-prodcast/:path*",
    "/data",
    "/data/:path*",
    "/media",
    "/media/:path*",
    "/((?!api|_next|about|culture|donate|interviews|legacy-article|magazine|multimedia|puzzles|puzzles-archives|search|united-states|world)[^/.]+)",
  ],
};
