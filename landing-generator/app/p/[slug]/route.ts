import { NextRequest, NextResponse } from "next/server";

/** Ancien chemin /p/slug → canonique /slug (SEO, favoris) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(`/${slug}`, req.url);
  return NextResponse.redirect(url, 308);
}
