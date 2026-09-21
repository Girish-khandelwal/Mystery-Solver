import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Keep development hot reloads from replacing a production build's chunks.
  distDir:
    process.env.CASEFILE_DIST_DIR ??
    (process.env.NODE_ENV === "development" ? ".next-dev" : ".next"),
};
export default config;
