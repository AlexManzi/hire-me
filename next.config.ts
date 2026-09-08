import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  basePath: process.env.NEXT_BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
