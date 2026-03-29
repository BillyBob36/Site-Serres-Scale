import { PrismaClient } from "../generated/prisma/client";
import path from "path";
import fs from "fs";

// Support both DATABASE_URL (file:path) and DATABASE_PATH (raw path).
// Default must match init-db.js on Azure: without env, init uses /home/data/landing.db
// while Prisma previously used cwd/dev.db → wrong file, missing columns, POST 500.
const rawUrl = process.env.DATABASE_URL;
const DB_PATH = rawUrl?.startsWith("file:")
  ? rawUrl.replace(/^file:/, "")
  : process.env.DATABASE_PATH ||
    (process.env.NODE_ENV === "production"
      ? "/home/data/landing.db"
      : path.join(process.cwd(), "dev.db"));

// Ensure directory exists (important for Azure /home/data/)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

async function createPrismaClient(): Promise<PrismaClient> {
  // Try libsql adapter first (cross-platform, works on Azure Linux + Windows dev)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql({ url: `file:${DB_PATH}` });
    console.log("[db] Using @prisma/adapter-libsql with", DB_PATH);
    return new PrismaClient({ adapter } as never);
  } catch (e1) {
    // Fallback to better-sqlite3 adapter (available in Docker builds)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaBetterSQLite3 } = require("@prisma/adapter-better-sqlite3");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require("better-sqlite3");
      const db = new Database(DB_PATH);
      db.pragma("journal_mode = WAL");
      const adapter = new PrismaBetterSQLite3(db);
      console.log("[db] Using @prisma/adapter-better-sqlite3 with", DB_PATH);
      return new PrismaClient({ adapter } as never);
    } catch (e2) {
      console.error("[db] libsql error:", e1);
      console.error("[db] better-sqlite3 error:", e2);
      throw new Error("No Prisma adapter available. Install @libsql/client or better-sqlite3.");
    }
  }
}

// We need a synchronous export, so we use a lazy initialization pattern
let _prismaPromise: Promise<PrismaClient> | null = null;
let _prismaResolved: PrismaClient | null = null;

function getPrismaPromise(): Promise<PrismaClient> {
  if (_prismaResolved) return Promise.resolve(_prismaResolved);
  if (!_prismaPromise) {
    _prismaPromise = (globalForPrisma.prisma
      ? Promise.resolve(globalForPrisma.prisma)
      : createPrismaClient()
    ).then((client) => {
      _prismaResolved = client;
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = client;
      }
      return client;
    });
  }
  return _prismaPromise;
}

export { getPrismaPromise as getDb };
