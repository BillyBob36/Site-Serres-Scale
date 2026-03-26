import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await prisma.configuration.findUnique({ where: { id } });
  if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, markdown, blocks } = body;
  const config = await prisma.configuration.update({
    where: { id },
    data: { name, description: description ?? null, markdown: markdown ?? null, blocks },
  });
  return NextResponse.json(config);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.configuration.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
