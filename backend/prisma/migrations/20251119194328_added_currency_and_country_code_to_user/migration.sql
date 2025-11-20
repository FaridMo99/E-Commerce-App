-- AlterTable
ALTER TABLE "User" ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "currency" "CurrencyISO" NOT NULL DEFAULT 'USD';
