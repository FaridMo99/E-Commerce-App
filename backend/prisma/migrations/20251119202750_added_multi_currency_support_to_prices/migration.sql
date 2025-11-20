/*
  Warnings:

  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sale_price` on the `Product` table. All the data in the column will be lost.
  - Added the required column `price_in_EUR` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_in_GBP` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_in_USD` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
DROP COLUMN "sale_price",
ADD COLUMN     "price_in_EUR" INTEGER NOT NULL,
ADD COLUMN     "price_in_GBP" INTEGER NOT NULL,
ADD COLUMN     "price_in_USD" INTEGER NOT NULL,
ADD COLUMN     "sale_price_in_EUR" INTEGER,
ADD COLUMN     "sale_price_in_GBP" INTEGER,
ADD COLUMN     "sale_price_in_USD" INTEGER;
