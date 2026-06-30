import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { en } from "../../i18n/en";
import { zh } from "../../i18n/zh";

export async function getStaticPaths() {
  return [
    { params: { lang: "en" }, props: { t: en } },
    { params: { lang: "zh" }, props: { t: zh } },
  ];
}

export async function GET({ params, props, site }) {
  const { lang } = params;
  const { t } = props;
  const notes = await getCollection("notes");

  return rss({
    title: t.rss.title,
    description: t.rss.description,
    site,
    items: notes
      .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
      .map((note) => ({
        title: note.data.title,
        pubDate: note.data.pubDate,
        description: note.data.description,
        link: `/${lang}/notes/${note.id}/`,
      })),
    customData: `<language>${lang === "en" ? "en-us" : "zh-cn"}</language>`,
  });
}
