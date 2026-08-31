import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@instafix/core"],
  output: "standalone",
};

const withMDX = createMDX();

export default withMDX(nextConfig);
