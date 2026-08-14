import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { "/api": "http://localhost:3000" } },
  build: { outDir: "dist" },
  test: { exclude: ["test/**", "e2e/**", "node_modules/**", "dist/**", "dist-server/**"] },
});
