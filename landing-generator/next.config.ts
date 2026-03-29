import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: ".next-build",
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
