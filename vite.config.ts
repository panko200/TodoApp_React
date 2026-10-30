import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/TodoApp_React/", // ◀◀ 追加
  server: {
    port: 3000,
    strictPort: false,
    open: true,
  },
});