/*
  Warnings:

  - Added the required column `filename` to the `Playbook` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playbook" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_Playbook" ("description", "id", "name") SELECT "description", "id", "name" FROM "Playbook";
DROP TABLE "Playbook";
ALTER TABLE "new_Playbook" RENAME TO "Playbook";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
