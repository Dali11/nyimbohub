import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEON_AUTH_URL: process.env.NEON_AUTH_URL,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
