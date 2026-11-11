import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED_ROOT_SEGMENTS = new Set([
  "about",
  "apple-icon.png",
  "culture",
  "donate",
  "icon.svg",
  "interviews",
  "legacy-article",
  "magazine",
  "multimedia",
  "puzzles",
  "puzzles-archives",
  "search",
  "united-states",
  "world",
]);

const MULTIMEDIA_SUBSECTIONS = [
  "bpradio",
  "bpr-prodcast",
  "data",
  "media",
] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const subsection of MULTIMEDIA_SUBSECTIONS) {
    if (pathname.startsWith(`/${subsection}/article/`)) {
      const slug = pathname.replace(`/${subsection}/article/`, "");
      const normalizedSubsection =
        subsection === "bpr-prodcast" ? "bpradio" : subsection;
      return NextResponse.redirect(
        new URL(`/multimedia/${normalizedSubsection}/article/${slug}`, request.url),
        308
      );
    }

    if (pathname === `/${subsection}` || pathname === `/${subsection}/`) {
      const normalizedSubsection =
        subsection === "bpr-prodcast" ? "bpradio" : subsection;
      return NextResponse.redirect(
        new URL(`/multimedia/${normalizedSubsection}`, request.url),
        308
      );
    }
  }

  const legacyMatch = pathname.match(/^\/([^/]+)\/?$/);
  const legacySlug = legacyMatch?.[1];
  if (
    legacySlug &&
    !RESERVED_ROOT_SEGMENTS.has(legacySlug) &&
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
