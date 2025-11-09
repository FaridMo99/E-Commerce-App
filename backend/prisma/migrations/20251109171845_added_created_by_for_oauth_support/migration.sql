/*
  Warnings:

  - Added the required column `createdBy` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserCreatedBy" AS ENUM ('SELF', 'GOOGLE', 'FACEBOOK');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdBy" "UserCreatedBy" NOT NULL,
ALTER COLUMN "birthdate" DROP NOT NULL;
