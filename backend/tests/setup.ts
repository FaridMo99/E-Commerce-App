import { vi } from "vitest";

 vi.mock("../src/services/redis.ts", () => ({
   redis: {
     get: vi.fn(),
     set: vi.fn(),
     setEx: vi.fn(),
     del: vi.fn(),
   },
 })); 
