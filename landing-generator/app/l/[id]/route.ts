import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const landing = await prisma.landing.findUnique({ where: { id } });
  if (!landing) {
    return new NextResponse("Landing page not found", { status: 404 });
  }
  return new NextResponse(landing.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
