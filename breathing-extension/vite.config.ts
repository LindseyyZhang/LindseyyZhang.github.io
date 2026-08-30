import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Builds the standalone web app + the extension's popup and side panel
// pages as a normal multi-page Vite app. The content script and background
// service worker are built separately (see vite.content.config.ts and
// vite.background.config.ts) because they need a single self-contained
// bundle instead of Vite's hashed, code-split multi-page output.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        app: resolve("index.html"),
        popup: resolve("popup.html"),
        sidepanel: resolve("sidepanel.html"),
      },
    },
  },
});
