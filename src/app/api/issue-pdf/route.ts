import { NextRequest, NextResponse } from "next/server";
import { validIssuePdf } from "../../lib/issues";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const pdf = validIssuePdf(request.nextUrl.searchParams.get("url") || "");
  if (!pdf) return NextResponse.json({ error: "Invalid PDF URL" }, { status: 400 });

  try {
    const upstream = await fetch(pdf, {
      headers: {
        Accept: "application/pdf,*/*",
        "User-Agent": "Mozilla/5.0 (compatible; BPR-Site/1.0; +https://brownpoliticalreview.org)",
      },
      redirect: "follow",
      cache: "force-cache",
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "PDF unavailable" }, { status: upstream.status === 404 ? 404 : 502 });
    }
    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength < 5) {
      return NextResponse.json({ error: "PDF unavailable" }, { status: 502 });
    }
    const header = String.fromCharCode(...new Uint8Array(bytes.slice(0, 5)));
    if (header !== "%PDF-") {
      return NextResponse.json({ error: "URL is not a PDF" }, { status: 415 });
    }
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Content-Length": String(bytes.byteLength),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 502 });
  }
}
