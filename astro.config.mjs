// @ts-check
import { EventEmitter } from "node:events";
EventEmitter.defaultMaxListeners = 20;

import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import { unified } from "@astrojs/markdown-remark";

import rehypeImageOptimizer from "./src/plugins/rehype-image-optimizer";

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

  markdown: unified({
    rehypePlugins: [rehypeImageOptimizer],
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});
