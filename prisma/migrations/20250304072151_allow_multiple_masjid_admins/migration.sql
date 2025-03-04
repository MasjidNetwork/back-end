/*
  Warnings:

  - A unique constraint covering the columns `[userId,masjidId]` on the table `MasjidAdmin` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MasjidAdmin_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "MasjidAdmin_userId_masjidId_key" ON "MasjidAdmin"("userId", "masjidId");
