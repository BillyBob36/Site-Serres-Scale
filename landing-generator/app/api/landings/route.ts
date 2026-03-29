import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../lib/db";
import { slugifyLandingName, isReservedLandingSlug } from "../../lib/slugifyLanding";

export async function GET() {
  const prisma = await getDb();
  const landings = await prisma.landing.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, configId: true, createdAt: true },
  });
  return NextResponse.json(landings);
}

export async function POST(req: NextRequest) {
  const prisma = await getDb();
  const body = await req.json();
  const { name, slug, configId, html } = body;
  if (!name || !html) {
    return NextResponse.json({ error: "name and html required" }, { status: 400 });
  }
  const fromField = slug != null && String(slug).trim() ? slugifyLandingName(String(slug)) : "";
  const fromName = slugifyLandingName(name);
  const cleanSlug = fromField || fromName || null;
  if (!cleanSlug) {
    return NextResponse.json(
      { error: "Le nom doit contenir au moins une lettre ou un chiffre pour l’URL (ex. test1)" },
      { status: 400 },
    );
  }
  if (isReservedLandingSlug(cleanSlug)) {
    return NextResponse.json({ error: "Ce nom d’URL est réservé (api, app-admin, l, p, etc.)" }, { status: 400 });
  }
  const existing = await prisma.landing.findFirst({ where: { slug: cleanSlug } });
  if (existing) {
    return NextResponse.json({ error: `L’URL « /${cleanSlug} » est déjà utilisée` }, { status: 409 });
  }
  const landing = await prisma.landing.create({
    data: { name, slug: cleanSlug, configId: configId ?? null, html },
  });
  return NextResponse.json(landing, { status: 201 });
}
