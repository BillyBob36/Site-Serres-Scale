import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../lib/db";

export async function GET() {
  const prisma = await getDb();
  const configs = await prisma.configuration.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, description: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const prisma = await getDb();
  const body = await req.json();
  const { name, description, markdown, blocks, palettes, activePaletteLabel, blockPalettes } = body;
  if (!name || !blocks) {
    return NextResponse.json({ error: "name and blocks required" }, { status: 400 });
  }
  const config = await prisma.configuration.create({
    data: { name, description: description ?? null, markdown: markdown ?? null, blocks, palettes: palettes ?? null, activePaletteLabel: activePaletteLabel ?? null, blockPalettes: blockPalettes ?? null },
  });
  return NextResponse.json(config, { status: 201 });
}
