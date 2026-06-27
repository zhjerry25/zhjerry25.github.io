// Import the glob loader
import { glob } from "astro/loaders";
// Import utilities from `astro:content`
import { defineCollection } from "astro:content";
// Import Zod
import { z } from "astro/zod";

// Blog collection — full schema with author and image
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }),
    tags: z.array(z.string())
  })
});

// Notes schema — simpler, no author/image required
const notesSchema = z.object({
  title: z.string(),
  pubDate: z.date(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

const chem = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/notes/chem" }),
  schema: notesSchema,
});

const cs = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/notes/cs" }),
  schema: notesSchema,
});

const mathphy = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/notes/mathphy" }),
  schema: notesSchema,
});

const others = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/notes/others" }),
  schema: notesSchema,
});

// Export a single `collections` object to register your collection(s)
export const collections = { blog, chem, cs, mathphy, others };
