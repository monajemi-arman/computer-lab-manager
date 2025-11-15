-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "playbookId" INTEGER NOT NULL,
    CONSTRAINT "Task_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
