import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import fs from "fs";

// Support both DATABASE_URL (file:path) and DATABASE_PATH (raw path)
const rawUrl = process.env.DATABASE_URL;
const DB_PATH = rawUrl?.startsWith("file:")
  ? rawUrl.replace(/^file:/, "")
  : process.env.DATABASE_PATH || path.join(process.cwd(), "dev.db");

// Ensure directory exists (important for Azure /home/data/)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: `file:${DB_PATH}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
