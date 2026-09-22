import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/postcss";
import { fileURLToPath } from "node:url";
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
export default defineConfig({
  // Never load the website's .env or Supabase connection strings.
  envDir: here("./"),
  publicDir: here("../public"),
  plugins: [
    react(),
    {
      name: "reject-online-modules",
      generateBundle() {
        for (const id of this.getModuleIds()) {
          if (
            /\/(?:lib\/(?:client|db|session|profile)|data\/server-cases)\.ts$/.test(
              id,
            ) ||
            id.includes("/app/api/")
          )
            this.error(
              `Online-only module was included in the offline build: ${id}`,
            );
        }
      },
    },
  ],
  resolve: {
    dedupe: ["react", "react-dom", "zod", "lucide-react"],
    alias: [
      { find: "@/lib/client", replacement: here("./src/client.ts") },
      { find: "next/link", replacement: here("./src/link.tsx") },
      { find: "next/navigation", replacement: here("./src/navigation.ts") },
      { find: "@", replacement: here("../") },
    ],
  },
  css: { postcss: { plugins: [tailwind()] } },
  build: {
    target: "es2022",
    sourcemap: false,
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 900,
  },
});
