import { NextRequest, NextResponse } from "next/server";
import { validIssuePdf } from "../../lib/issues";
import { resolveWordPressMediaUrl } from "../../lib/utils";

export async function GET(request: NextRequest) {
  const pdf = validIssuePdf(resolveWordPressMediaUrl(request.nextUrl.searchParams.get("url") || ""));
  if (!pdf) return NextResponse.json({ error: "Invalid PDF URL" }, { status: 400 });
  return NextResponse.redirect(pdf, 308);
}
