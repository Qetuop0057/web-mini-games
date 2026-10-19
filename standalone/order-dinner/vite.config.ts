import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 构建到 dist/，由 wrangler.jsonc 作为静态资源发布。
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
});
