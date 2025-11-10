/*
  Warnings:

  - You are about to alter the column `total_amount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `price_at_purchase` on the `Order_Item` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `sale_price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to drop the `_UserCart` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Order_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('usd', 'eur', 'gbp');

-- DropForeignKey
ALTER TABLE "public"."_UserCart" DROP CONSTRAINT "_UserCart_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserCart" DROP CONSTRAINT "_UserCart_B_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" "Currency" NOT NULL,
ALTER COLUMN "total_amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Order_Item" ADD COLUMN     "currency" "Currency" NOT NULL,
ALTER COLUMN "price_at_purchase" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "currency" "Currency" NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "sale_price" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "public"."_UserCart";

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
