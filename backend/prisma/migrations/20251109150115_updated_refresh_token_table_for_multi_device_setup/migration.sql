/*
  Warnings:

  - You are about to drop the column `lastUsedAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `deviceId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "lastUsedAt",
DROP COLUMN "revoked",
ADD COLUMN     "deviceId" TEXT NOT NULL;
