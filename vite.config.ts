import { defineConfig } from "vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [VitePWA({
    registerType: "autoUpdate",
    workbox: {
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
    },
    manifest: {
      name: "AION - Sistema Operativo para Transformar tu Vida",
      short_name: "AION",
      description: "El verdadero juego de la vida. IA + Hipnosis + Gamificación = Level Up Your Life",
      theme_color: "#a855f7",
      background_color: "#0a0a0f",
      display: "standalone",
      orientation: "portrait",
      dir: "ltr",
      lang: "es",
      start_url: "/",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        }
      ]
    }
  })].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },

  optimizeDeps: {
    include: [],
  },

  build: {
    outDir: "dist",
    sourcemap: false,
  },
});