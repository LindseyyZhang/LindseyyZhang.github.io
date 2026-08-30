import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Content scripts must ship as a single self-contained classic script (no
// import maps / chunk splitting), so this builds src/content/main.tsx as an
// IIFE bundle into dist/content.js, alongside (not replacing) the main
// multi-page build's output.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // build.lib output skips Vite's usual process.env.NODE_ENV replacement
  // (it's meant to be consumed by another bundler), but this bundle runs
  // standalone as a content script, so React needs it defined here.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve("src/content/main.tsx"),
      formats: ["iife"],
      name: "CatBreathContent",
      fileName: () => "content.js",
    },
  },
});
