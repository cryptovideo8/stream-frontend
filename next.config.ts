import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Re-enable gradually; keep ignore until remaining type debt is cleared in CI
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
