/*
  Warnings:

  - The values [EURO] on the enum `CurrencyISO` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CurrencyISO_new" AS ENUM ('USD', 'GBP', 'EUR');
ALTER TABLE "Product" ALTER COLUMN "currency" TYPE "CurrencyISO_new" USING ("currency"::text::"CurrencyISO_new");
ALTER TABLE "Order" ALTER COLUMN "currency" TYPE "CurrencyISO_new" USING ("currency"::text::"CurrencyISO_new");
ALTER TABLE "Order_Item" ALTER COLUMN "currency" TYPE "CurrencyISO_new" USING ("currency"::text::"CurrencyISO_new");
ALTER TYPE "CurrencyISO" RENAME TO "CurrencyISO_old";
ALTER TYPE "CurrencyISO_new" RENAME TO "CurrencyISO";
DROP TYPE "public"."CurrencyISO_old";
COMMIT;
