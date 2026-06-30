import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // Nitro compiles the SSR server into Vercel Functions output (.vercel/output),
  // which Vercel auto-detects and serves. Required for deploying TanStack Start
  // to Vercel — without it the build emits a bare Node server Vercel can't serve.
  plugins: [
    tanstackStart(),
    nitro(),
    tailwindcss(),
    viteReact(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
