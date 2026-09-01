// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  integrations: [react(), svelte()],

  vite: {
    plugins: [tailwindcss()],
  },
});
