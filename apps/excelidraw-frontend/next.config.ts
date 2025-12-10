import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Enable if using Docker
  experimental: {
    // outputFileTracingRoot for monorepo support
  },
};

export default nextConfig;
