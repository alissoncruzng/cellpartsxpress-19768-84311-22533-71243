import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { VitePWA } from "vite-plugin-pwa";

// Configuração otimizada para desenvolvimento
export default defineConfig({
  server: {
    host: "0.0.0.0",
    open: true
  },
  plugins: [
    react(),
    // Temporarily disabled PWA plugin
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192x192.png', 'icon-512x512.png'],
    //   manifest: {
    //     name: 'CellParts Express',
    //     short_name: 'CellParts',
    //     description: 'Sistema de Gestão de Peças',
    //     theme_color: '#0a0f1a',
    //     background_color: '#0a0f1a',
    //     display: 'standalone',
    //     start_url: '/',
    //     icons: [
    //       {
    //         src: '/icon-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       },
    //       {
    //         src: '/icon-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    //   }
    // })
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
