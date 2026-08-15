import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Pin the workspace root to the monorepo, not wherever Next infers it.
   *
   * There is a stray `package-lock.json` in the user's home directory, and with
   * multiple lockfiles in the ancestry Next picks the outermost one — which made
   * it trace files from `~` and prefix every diagnostic path with
   * `./Downloads/Documents/Dev/Backlify/...`. Pinning it keeps module resolution
   * and output file tracing inside the repo.
   */
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
