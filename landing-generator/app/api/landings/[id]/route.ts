import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const landing = await prisma.landing.findUnique({ where: { id } });
  if (!landing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Return HTML directly for browser access
  const accept = _req.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    return new NextResponse(landing.html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  return NextResponse.json(landing);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.landing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
