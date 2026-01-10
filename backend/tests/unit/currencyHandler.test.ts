import { it, expect, describe, vi, beforeEach } from "vitest";
import { redis } from "../../src/services/redis.js";
import {
  turnPriceToPriceInCents,
  formatPriceForClient,
  formatPricesForClientAndCalculateAverageRating,
  getExchangeRates,
  roundPriceUpInCents,
  transformAndFormatProductPrice,
  transformAndFormatProductPriceInCents,
  convertAndFormatPriceInCents,
  ProductWithAvgRating,
} from "../../src/lib/currencyHandlers.js";

global.fetch = vi.fn();

describe("Currency Transformation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = (): ProductWithAvgRating => ({
    id: "prod_123",
    stock_quantity: 2,
    description: "non",
    published_at: new Date(),
    updated_at: new Date(),
    category: { id: "kon", name: "0i" },
    imageUrls: [""],
    price: 1000,
    sale_price: 800,
    name: "Test Item",
    currency: "EUR",
    reviews: [{ rating: 5 }, { rating: 3 }],
    _count: { reviews: 2 },
  });

  describe("Basic Formatters", () => {
    it("should turn 10.99 to 1099", () => {
      expect(turnPriceToPriceInCents(10.99)).toBe(1099);
    });

    it("should turn 1099 to 10.99", () => {
      expect(formatPriceForClient(1099)).toBe(10.99);
    });

    it("should apply nice price rounding (100 -> 199)", () => {
      expect(roundPriceUpInCents(100)).toBe(199);
      expect(roundPriceUpInCents(200, 95)).toBe(295);
    });

    it("should format price and add average rating", () => {
      const product = mockProduct();
      formatPricesForClientAndCalculateAverageRating(product);
      expect(product.price).toBe(10);
      expect(product.sale_price).toBe(8);
      expect(product.averageRating).toBeDefined();
    });

    it("", () => {
      const product = mockProduct();
      transformAndFormatProductPriceInCents(product, "EUR", "USD");
      expect(product.price).toBe(1000);
      expect(product.sale_price).toBe(800);
    });
  });

  describe("getExchangeRates", () => {
    it("should return cached data from Redis if available", async () => {
      const mockData = { rates: { USD: 1.1, EUR: 1.0 } };
      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockData));

      const result = await getExchangeRates();

      expect(result.rates.USD).toBe(1.1);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should fetch from API if Redis is empty and then save to Redis", async () => {
      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ rates: { USD: 1.2 } }),
      } as Response);

      await getExchangeRates();

      expect(global.fetch).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });
  });

  describe("Complex Transformations", () => {
    it("should transform EUR to USD correctly", async () => {
      vi.mocked(redis.get).mockResolvedValue(
        JSON.stringify({
          rates: { EUR: 1.0, USD: 1.1 },
        })
      );

      const product = mockProduct();

      await transformAndFormatProductPrice(product, "EUR", "USD");

      expect(product.price).toBe(11.99);
      expect(product.currency).toBe("USD");
    });

    it("should only round and format if currencies are the same", async () => {
      const product = mockProduct();

      await transformAndFormatProductPrice(product, "EUR", "EUR");

      expect(product.price).toBe(10.99);
      expect(redis.get).not.toHaveBeenCalled();
    });

    it("should calculate average rating during transformation", async () => {
      const product = mockProduct();
      await transformAndFormatProductPrice(product, "EUR", "EUR");

      expect(product.averageRating).toBeDefined();
    });
  });

  describe("convertAndFormatPriceInCents", () => {
    it("should convert and format a standalone value", async () => {
      vi.mocked(redis.get).mockResolvedValue(
        JSON.stringify({
          rates: { EUR: 1, USD: 1.5 },
        })
      );

      const result = await convertAndFormatPriceInCents(1000, "EUR", "USD");

      expect(result).toBe(15.99);
    });
  });
});
