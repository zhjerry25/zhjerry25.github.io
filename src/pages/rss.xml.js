import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const notes = await getCollection("notes");
  return rss({
    title: "Astrchem Notes",
    description: "Personal knowledge base",
    site: context.site,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.pubDate,
      description: note.data.description,
      link: `/notes/${note.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
