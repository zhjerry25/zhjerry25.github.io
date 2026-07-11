import type { Lang } from "../i18n/utils";

export const TRANSLATION_KEY_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/;

interface NoteDataLike {
  lang: Lang;
  translationKey: string;
  pubDate: Date;
  tags?: readonly string[];
}

interface NoteLike {
  filePath?: string;
  data: NoteDataLike;
}

export function splitTranslationKey(translationKey: string): {
  category: string;
  slug: string;
} {
  if (!TRANSLATION_KEY_PATTERN.test(translationKey)) {
    throw new Error(`Invalid note translationKey: "${translationKey}"`);
  }

  const [category, ...slugParts] = translationKey.split("/");
  return { category, slug: slugParts.join("/") };
}

export function noteURL(lang: Lang, translationKey: string): string {
  const { category, slug } = splitTranslationKey(translationKey);
  return `/${lang}/notes/${category}/${slug}/`;
}

export function getNoteAnalyticsPath(translationKey: string): string {
  return getNoteViewPaths(translationKey).shared;
}

export function getNoteViewPaths(translationKey: string): {
  shared: string;
  legacyZh: string;
} {
  return {
    shared: noteURL("en", translationKey),
    legacyZh: noteURL("zh", translationKey),
  };
}

export function getNotesForLang<T extends NoteLike>(
  notes: readonly T[],
  lang: Lang,
): T[] {
  return notes.filter((note) => note.data.lang === lang);
}

function sourceCategory(filePath: string): string {
  const normalized = filePath.replaceAll("\\", "/");
  const marker = "src/notes/";
  const start = normalized.indexOf(marker);
  if (start === -1) {
    throw new Error(`Note source must be inside ${marker}: "${filePath}"`);
  }

  return normalized.slice(start + marker.length).split("/")[0];
}

function normalizedTags(tags: readonly string[] | undefined): string[] {
  return [...(tags ?? [])].sort();
}

function sourceBasename(filePath: string, lang: Lang): string {
  return filePath.replaceAll("\\", "/").replace(new RegExp(`\\.${lang}\\.md$`), "");
}

export function validateNoteTranslations<T extends NoteLike>(
  notes: readonly T[],
): void {
  const groups = new Map<string, T[]>();

  for (const note of notes) {
    const { lang, translationKey } = note.data;
    if (!TRANSLATION_KEY_PATTERN.test(translationKey)) {
      throw new Error(`Note has invalid translationKey "${translationKey}"`);
    }
    if (!note.filePath) {
      throw new Error(`Note "${translationKey}" is missing its source file path`);
    }
    if (!note.filePath.endsWith(`.${lang}.md`)) {
      throw new Error(
        `Note "${translationKey}" with lang "${lang}" must end with .${lang}.md`,
      );
    }

    const { category } = splitTranslationKey(translationKey);
    const directory = sourceCategory(note.filePath);
    if (category !== directory) {
      throw new Error(
        `Note "${translationKey}" category "${category}" must match source directory "${directory}"`,
      );
    }

    const group = groups.get(translationKey) ?? [];
    group.push(note);
    groups.set(translationKey, group);
  }

  for (const [translationKey, group] of groups) {
    const enEntries = group.filter((note) => note.data.lang === "en");
    const zhEntries = group.filter((note) => note.data.lang === "zh");
    if (group.length !== 2 || enEntries.length !== 1 || zhEntries.length !== 1) {
      throw new Error(
        `Note "${translationKey}" must contain exactly one en and one zh entry`,
      );
    }

    const [en] = enEntries;
    const [zh] = zhEntries;
    if (
      sourceBasename(en.filePath!, "en") !==
      sourceBasename(zh.filePath!, "zh")
    ) {
      throw new Error(
        `Translations for "${translationKey}" must use the same source basename`,
      );
    }
    if (en.data.pubDate.getTime() !== zh.data.pubDate.getTime()) {
      throw new Error(`Translations for "${translationKey}" must use the same pubDate`);
    }
    if (
      JSON.stringify(normalizedTags(en.data.tags)) !==
      JSON.stringify(normalizedTags(zh.data.tags))
    ) {
      throw new Error(`Translations for "${translationKey}" must use the same tags`);
    }
  }
}
