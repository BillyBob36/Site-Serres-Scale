import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function GET() {
  const prisma = await getDb();
  const landings = await prisma.landing.findMany({
    where: { showInSummary: true },
    select: { id: true, name: true, slug: true, category: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(landings);
}
