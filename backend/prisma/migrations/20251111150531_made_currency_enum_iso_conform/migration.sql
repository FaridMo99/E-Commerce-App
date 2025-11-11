/*
  Warnings:

  - Changed the type of `currency` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `Order_Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CurrencyISO" AS ENUM ('USD', 'GBP', 'EURO');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyISO" NOT NULL;

-- AlterTable
ALTER TABLE "Order_Item" DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyISO" NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "currency",
ADD COLUMN     "currency" "CurrencyISO" NOT NULL;

-- DropEnum
DROP TYPE "public"."Currency";
