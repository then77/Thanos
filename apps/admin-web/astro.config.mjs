// @ts-check
import { defineConfig, fontProviders } from "astro/config";

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
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Valley Sans",
      cssVariable: "--font-valley-sans-variable",
    },
    {
      provider: fontProviders.fontsource(),
      name: "DM Sans",
      cssVariable: "--font-dm-sans-variable",
    },
    {
      provider: fontProviders.fontsource(),
      name: "Lora",
      cssVariable: "--font-lora-variable",
    },
  ],
});
