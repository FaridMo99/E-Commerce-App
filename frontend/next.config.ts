import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@monorepo/shared"],
  output: "standalone"
};

export default nextConfig;
