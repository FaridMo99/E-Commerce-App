/*
  Warnings:

  - You are about to drop the column `price_in_EUR` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price_in_GBP` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price_in_USD` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sale_price_in_EUR` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sale_price_in_GBP` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sale_price_in_USD` on the `Product` table. All the data in the column will be lost.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price_in_EUR",
DROP COLUMN "price_in_GBP",
DROP COLUMN "price_in_USD",
DROP COLUMN "sale_price_in_EUR",
DROP COLUMN "sale_price_in_GBP",
DROP COLUMN "sale_price_in_USD",
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "sale_price" INTEGER;
