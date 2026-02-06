import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  // Avoid Next.js picking the parent workspace as "root" when multiple lockfiles exist.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
