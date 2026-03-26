/**
 * Initialize SQLite database tables without requiring Prisma CLI.
 * This avoids native binary compatibility issues on Linux.
 */
const Database = require("@libsql/client");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DATABASE_PATH || "/home/data/landing.db";
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

async function initDb() {
  const client = Database.createClient({ url: `file:${DB_PATH}` });

  await client.execute(`CREATE TABLE IF NOT EXISTS "Configuration" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "markdown" TEXT,
    "blocks" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS "Landing" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "configId" TEXT,
    "html" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  await client.execute(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  )`);

  console.log("Database initialized at", DB_PATH);
  client.close();
}

initDb().catch((err) => {
  console.error("DB init failed:", err);
  process.exit(1);
});
