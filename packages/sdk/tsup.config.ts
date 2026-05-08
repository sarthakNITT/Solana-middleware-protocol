import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  noExternal: [
    "@repo/core",
    "@repo/config",
    "@repo/fee-optimizer",
    "@repo/logger",
    "@repo/retry-engine",
    "@repo/router",
    "@repo/rpc-client",
    "@repo/simulator",
    "@repo/types",
    "@repo/utils",
    "@repo/tx-builder",
  ],

  external: ["@solana/web3.js"],
});
