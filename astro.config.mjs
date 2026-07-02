// @ts-check
import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://zhjerry25.github.io",
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !page.includes("/404"),
      serialize(item) {
        // Strip the final / for canonical URLs
        const url = item.url.replace(/\/$/, "");
        // Determine language from URL
        const isZh = url.includes("/zh/");
        const lang = isZh ? "zh" : "en";
        const otherLang = isZh ? "en" : "zh";
        const otherURL = url.replace(`/${lang}/`, `/${otherLang}/`);

        return {
          ...item,
          url,
          // Add hreflang annotations for sitemap
          links: [
            { lang, url },
            { lang: otherLang, url: otherURL },
            { lang: "x-default", url: url.replace(`/${lang}/`, "/en/") },
          ],
        };
      },
    }),
  ],

  // Native responsive images for markdown body images and <Image>. The custom
  // rehype plugin used previously was dead code — Astro already optimizes
  // markdown images via remark-collect-images → rehype-images → getImage.
  image: {
    layout: "constrained",
    responsiveStyles: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
