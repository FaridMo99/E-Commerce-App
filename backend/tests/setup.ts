import { vi } from "vitest";

vi.mock("../src/services/redis.ts", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
  },
}));
