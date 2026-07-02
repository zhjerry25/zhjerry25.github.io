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
        // Keep the trailing slash so sitemap URLs match each page's canonical.
        const url = item.url;
        // Detect the locale from the first URL path segment only — robust for
        // the home pages /en/ and /zh/, which a "/zh/" substring check misreads
        // once you (don't) strip the trailing slash.
        const m = url.match(/^https?:\/\/[^/]+\/(en|zh)(\/|$)/);
        if (!m) return { ...item, url };
        const lang = m[1];
        const otherLang = lang === "en" ? "zh" : "en";
        const swap = (l) =>
          url.replace(/^(https?:\/\/[^/]+)\/(en|zh)(\/|$)/, `$1/${l}$3`);
        return {
          ...item,
          url,
          // hreflang alternates + x-default pointing at the English variant.
          links: [
            { lang, url },
            { lang: otherLang, url: swap(otherLang) },
            { lang: "x-default", url: swap("en") },
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
