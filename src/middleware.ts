import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle multimedia subsection redirects
  // These subsections should be under /multimedia/[subsection]/
  const multimediaSubsections = [
    "bpradio",
    "bpr-prodcast", // Legacy/alternate name for bpradio
    "data",
    "media",
  ];

  // Check if the path matches a multimedia subsection pattern
  for (const subsection of multimediaSubsections) {
    // Pattern: /subsection/article/[slug]
    if (pathname.startsWith(`/${subsection}/article/`)) {
      const slug = pathname.replace(`/${subsection}/article/`, "");

      // Map bpr-prodcast to bpradio
      const normalizedSubsection =
        subsection === "bpr-prodcast" ? "bpradio" : subsection;

      // Redirect to /multimedia/subsection/article/slug
      const newUrl = new URL(
        `/multimedia/${normalizedSubsection}/article/${slug}`,
        request.url
      );
      return NextResponse.redirect(newUrl, 308); // 308 = Permanent Redirect, preserves method
    }

    // Pattern: /subsection (root subsection page)
    if (pathname === `/${subsection}` || pathname === `/${subsection}/`) {
      const normalizedSubsection =
        subsection === "bpr-prodcast" ? "bpradio" : subsection;
      const newUrl = new URL(
        `/multimedia/${normalizedSubsection}`,
        request.url
      );
      return NextResponse.redirect(newUrl, 308);
    }
  }

  return NextResponse.next();
}

// Configure which paths should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
