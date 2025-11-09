-- AlterTable
ALTER TABLE "User" ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
