import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Make SKIP_DB available at build time for conditional Prisma imports
  env: {
    SKIP_DB: process.env.SKIP_DB || "false",
  },
};

export default nextConfig;
