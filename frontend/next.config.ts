import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@monorepo/shared"],
};

export default nextConfig;
