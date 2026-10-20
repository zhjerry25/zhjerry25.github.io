// Import the glob loader
import { glob } from "astro/loaders";
// Import utilities from `astro:content`
import { defineCollection } from "astro:content";
// Import Zod
import { z } from "astro/zod";
import { TRANSLATION_KEY_PATTERN } from "./utils/notes";

// Single notes collection — one schema, one source of truth.
// Discover bilingual notes recursively, including per-note folders. Other .md
// files (e.g. README.md) are not published. Public URLs and categories come
// from translationKey, independently of the source folder and filename.
const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{en,zh}.md', base: "./src/notes" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    pubDate: z.date(),
    lang: z.enum(["en", "zh"]),
    translationKey: z.string().regex(
      TRANSLATION_KEY_PATTERN,
      "translationKey must be a lowercase ASCII category/slug path",
    ),
    description: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    // Co-located image, validated at build time and resolved to ImageMetadata
    image: image().optional(),
  }),
});

// Export a single `collections` object
export const collections = { notes };
