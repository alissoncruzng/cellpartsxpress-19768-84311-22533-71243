import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Configuração otimizada para desenvolvimento
export default defineConfig({
  server: {
    host: "0.0.0.0",
    open: true
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  preview: {
    port: parseInt(process.env.PORT || "3000"),
    host: "0.0.0.0"
  },
  define: {
    'process.env': {}
  },
});
