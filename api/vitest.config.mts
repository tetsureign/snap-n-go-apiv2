/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
// import path from "path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    // include: ["src/**/*.{test,spec}.{js,ts}"],
    // exclude: [
    //   "generated",
    //   "**/node_modules/**",
    //   "**/dist/**",
    //   "**/cypress/**",
    //   "**/.{idea,git,cache,output,temp}/**",
    //   "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    // ],
    // coverage: {
    //   provider: "v8",
    //   reporter: ["text", "json", "html"],
    // },
  },
  // resolve: {
  //   alias: {
  //     "@": path.resolve(__dirname, "./src"),
  //     "prisma/*": path.resolve(__dirname, "./prisma/*"),
  //   },
  // },
});
