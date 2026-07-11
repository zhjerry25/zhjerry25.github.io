import rss from "@astrojs/rss";
import { en } from "../../i18n/en";
import { zh } from "../../i18n/zh";
import { getLocalizedNotes } from "../../utils/noteCollection";
import { noteURL } from "../../utils/notes";

export async function getStaticPaths() {
  return [
    { params: { lang: "en" }, props: { t: en } },
    { params: { lang: "zh" }, props: { t: zh } },
  ];
}

export async function GET({ params, props, site }) {
  const { lang } = params;
  const { t } = props;
  const notes = await getLocalizedNotes(lang);

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
        link: noteURL(lang, note.data.translationKey),
      })),
    customData: `<language>${lang === "en" ? "en-us" : "zh-cn"}</language>`,
  });
}
