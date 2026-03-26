import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/db";

export async function GET() {
  const landings = await prisma.landing.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, configId: true, createdAt: true },
  });
  return NextResponse.json(landings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, configId, html } = body;
  if (!name || !html) {
    return NextResponse.json({ error: "name and html required" }, { status: 400 });
  }
  const landing = await prisma.landing.create({
    data: { name, configId: configId ?? null, html },
  });
  return NextResponse.json(landing, { status: 201 });
}
