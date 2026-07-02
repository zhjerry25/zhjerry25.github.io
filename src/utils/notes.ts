import type { Lang } from "../i18n/utils";

/**
 * Split a note id ("others/post-1" or "top") into { category, slug } the same
 * way the [...slug] route does: top-level notes (no "/") are filed under the
 * "others" category. Centralizing this keeps link builders and getStaticPaths
 * in agreement so a top-level note's links match its generated URL.
 */
export function splitNoteId(id: string): { category: string; slug: string } {
  const parts = id.split("/");
  return parts.length > 1
    ? { category: parts[0], slug: parts.slice(1).join("/") }
    : { category: "others", slug: id };
}

/** Canonical URL of a note's detail page for a given language. */
export function noteURL(lang: Lang, id: string): string {
  const { category, slug } = splitNoteId(id);
  return `/${lang}/notes/${category}/${slug}/`;
}
