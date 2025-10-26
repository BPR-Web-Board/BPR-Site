import { NextResponse } from "next/server";
import { cache } from "@/app/lib/cache";

export async function GET() {
  const stats = await cache.getStats();
  return NextResponse.json(stats);
}
