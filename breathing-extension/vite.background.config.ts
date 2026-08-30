import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Background service workers load as an ES module (manifest sets
// background.type = "module"), so this builds a single flat dist/background.js.
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve("src/background/main.ts"),
      formats: ["es"],
      fileName: () => "background.js",
    },
  },
});
