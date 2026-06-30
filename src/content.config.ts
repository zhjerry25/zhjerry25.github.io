// Import the glob loader
import { glob } from "astro/loaders";
// Import utilities from `astro:content`
import { defineCollection } from "astro:content";
// Import Zod
import { z } from "astro/zod";

// Single notes collection — one schema, one source of truth.
// Category is derived from the first path segment of each entry's id
// (e.g., "chem/reaction-mechanisms" → category: chem).
const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/notes" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

// Export a single `collections` object
export const collections = { notes };
