import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../lib/db";
import { RESERVED_LANDING_SLUGS } from "../lib/reservedLandingSlugs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (RESERVED_LANDING_SLUGS.has(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const prisma = await getDb();
  const landing = await prisma.landing.findFirst({ where: { slug } });
  if (!landing) {
    return new NextResponse("Page introuvable", { status: 404 });
  }
  return new NextResponse(landing.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
