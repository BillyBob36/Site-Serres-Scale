import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { slugifyLandingName, isReservedLandingSlug } from "../../../lib/slugifyLanding";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const { id } = await params;
  const landing = await prisma.landing.findUnique({ where: { id } });
  if (!landing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  let clean: string | null = null;
  if (body.syncSlugFromName === true) {
    clean = slugifyLandingName(landing.name) || null;
  } else if (typeof body.slug === "string") {
    clean = slugifyLandingName(body.slug);
  }

  if (!clean) {
    return NextResponse.json(
      { error: "Indiquez un slug valide ou syncSlugFromName: true pour dériver du nom" },
      { status: 400 },
    );
  }
  if (isReservedLandingSlug(clean)) {
    return NextResponse.json({ error: "Ce segment d’URL est réservé" }, { status: 400 });
  }
  const taken = await prisma.landing.findFirst({ where: { slug: clean, id: { not: id } } });
  if (taken) {
    return NextResponse.json({ error: `L’URL « /${clean} » est déjà utilisée` }, { status: 409 });
  }

  const updated = await prisma.landing.update({
    where: { id },
    data: { slug: clean },
    select: { id: true, name: true, slug: true, configId: true, createdAt: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const { id } = await params;
  await prisma.landing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
