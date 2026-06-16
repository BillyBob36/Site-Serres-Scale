-- AlterTable
ALTER TABLE "Configuration" ADD COLUMN "blockSvgs" TEXT;
ALTER TABLE "Configuration" ADD COLUMN "customSvgs" TEXT;
ALTER TABLE "Configuration" ADD COLUMN "globalSvgs" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Landing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "configId" TEXT,
    "html" TEXT NOT NULL,
    "showInSummary" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Landing" ("configId", "createdAt", "html", "id", "name") SELECT "configId", "createdAt", "html", "id", "name" FROM "Landing";
DROP TABLE "Landing";
ALTER TABLE "new_Landing" RENAME TO "Landing";
CREATE UNIQUE INDEX "Landing_slug_key" ON "Landing"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
