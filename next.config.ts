import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones reach the dev server through an ngrok tunnel.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app"],
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
