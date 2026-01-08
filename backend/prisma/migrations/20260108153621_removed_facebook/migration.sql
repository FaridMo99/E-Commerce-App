/*
  Warnings:

  - The values [FACEBOOK] on the enum `UserCreatedBy` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserCreatedBy_new" AS ENUM ('SELF', 'GOOGLE');
ALTER TABLE "User" ALTER COLUMN "createdBy" TYPE "UserCreatedBy_new" USING ("createdBy"::text::"UserCreatedBy_new");
ALTER TYPE "UserCreatedBy" RENAME TO "UserCreatedBy_old";
ALTER TYPE "UserCreatedBy_new" RENAME TO "UserCreatedBy";
DROP TYPE "public"."UserCreatedBy_old";
COMMIT;
