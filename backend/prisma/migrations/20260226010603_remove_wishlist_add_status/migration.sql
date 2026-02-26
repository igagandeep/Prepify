/*
  Warnings:

  - You are about to drop the column `wishlist` on the `job_applications` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_job_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Wishlist',
    "location" TEXT NOT NULL DEFAULT '',
    "salary" TEXT NOT NULL DEFAULT '',
    "jobUrl" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_job_applications" ("appliedAt", "company", "createdAt", "id", "jobUrl", "location", "notes", "role", "salary", "status", "updatedAt") SELECT "appliedAt", "company", "createdAt", "id", "jobUrl", "location", "notes", "role", "salary", "status", "updatedAt" FROM "job_applications";
DROP TABLE "job_applications";
ALTER TABLE "new_job_applications" RENAME TO "job_applications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
