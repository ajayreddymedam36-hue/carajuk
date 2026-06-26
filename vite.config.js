import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve("src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core"
    ]
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
      generatedRouteTree: './src/routeTree.gen.js',
      disableTypes: true,
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"]
        }
      }
    }),
    nitro({
      preset: process.env.VERCEL ? "vercel" : undefined,
    }),
    react(),
  ],
  css: {
    transformer: "lightningcss",
  },
});
