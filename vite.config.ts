import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    proxy: { "/api": { target: "http://localhost:8787", changeOrigin: true } },
  },
  resolve: { tsconfigPaths: true },
  plugins: [tailwindcss(), viteReact()],
  build: { outDir: "dist", emptyOutDir: true },
});
