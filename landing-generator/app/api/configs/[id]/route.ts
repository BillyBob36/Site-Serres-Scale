import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const { id } = await params;
  const config = await prisma.configuration.findUnique({ where: { id } });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const { id } = await params;
  const body = await req.json();
  const { name, description, markdown, blocks, palettes, activePaletteLabel, blockPalettes } = body;
  const config = await prisma.configuration.update({
    where: { id },
    data: { name, description: description ?? null, markdown: markdown ?? null, blocks, palettes: palettes ?? null, activePaletteLabel: activePaletteLabel ?? null, blockPalettes: blockPalettes ?? null },
  });
  return NextResponse.json(config);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const { id } = await params;
  await prisma.configuration.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
