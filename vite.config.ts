import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const base = process.env.BASE_PATH ?? "/workout-app/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      // "prompt": new versions surface an in-app "Update" banner instead of
      // silently waiting — installed iPhone PWAs have no other refresh UI.
      registerType: "prompt",
      includeAssets: ["icon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Ironlog — Workout Tracker",
        short_name: "Ironlog",
        description: "Local-first gym workout tracker with coaching and analytics",
        theme_color: "#16A97C",
        background_color: "#F5F5F0",
        display: "standalone",
        orientation: "portrait",
        scope: base,
        start_url: base,
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
} as Parameters<typeof defineConfig>[0]);
