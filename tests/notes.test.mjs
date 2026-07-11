import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getNoteAnalyticsPath,
  getNoteViewPaths,
  getNotesForLang,
  noteURL,
  splitTranslationKey,
  validateNoteTranslations,
} from "../src/utils/notes.ts";

function note({
  lang,
  translationKey = "chem/1-hydrogen",
  filePath = `src/notes/chem/1. Hydrogen.${lang}.md`,
  pubDate = "2026-07-07",
  tags = ["elements"],
} = {}) {
  return {
    id: `${translationKey}-${lang}`,
    filePath,
    data: {
      lang,
      translationKey,
      pubDate: new Date(`${pubDate}T00:00:00.000Z`),
      tags,
      title: `Hydrogen ${lang}`,
    },
  };
}

test("splits a normalized translation key", () => {
  assert.deepEqual(splitTranslationKey("chem/1-hydrogen"), {
    category: "chem",
    slug: "1-hydrogen",
  });
});

test("builds stable localized note URLs", () => {
  assert.equal(
    noteURL("zh", "chem/1-hydrogen"),
    "/zh/notes/chem/1-hydrogen/",
  );
});

test("uses the existing English URL as the shared analytics path", () => {
  assert.equal(
    getNoteAnalyticsPath("chem/1-hydrogen"),
    "/en/notes/chem/1-hydrogen/",
  );
});

test("keeps the English shared path and Chinese historical path distinct", () => {
  assert.deepEqual(getNoteViewPaths("chem/1-hydrogen"), {
    shared: "/en/notes/chem/1-hydrogen/",
    legacyZh: "/zh/notes/chem/1-hydrogen/",
  });
});

test("filters notes to the requested language", () => {
  const notes = [note({ lang: "en" }), note({ lang: "zh" })];
  assert.deepEqual(getNotesForLang(notes, "zh"), [notes[1]]);
});

test("accepts one matching English and Chinese entry", () => {
  assert.doesNotThrow(() =>
    validateNoteTranslations([note({ lang: "en" }), note({ lang: "zh" })]),
  );
});

test("rejects a missing translation", () => {
  assert.throws(
    () => validateNoteTranslations([note({ lang: "zh" })]),
    /must contain exactly one en and one zh entry/,
  );
});

test("rejects duplicate language entries", () => {
  assert.throws(
    () =>
      validateNoteTranslations([
        note({ lang: "en" }),
        note({ lang: "en", filePath: "src/notes/chem/Hydrogen-copy.en.md" }),
        note({ lang: "zh" }),
      ]),
    /must contain exactly one en and one zh entry/,
  );
});

test("rejects non-normalized translation keys", () => {
  assert.throws(
    () =>
      validateNoteTranslations([
        note({ lang: "en", translationKey: "chem/Hydrogen" }),
        note({ lang: "zh", translationKey: "chem/Hydrogen" }),
      ]),
    /invalid translationKey/,
  );
});

test("rejects a filename suffix that disagrees with lang", () => {
  assert.throws(
    () =>
      validateNoteTranslations([
        note({ lang: "en", filePath: "src/notes/chem/Hydrogen.zh.md" }),
        note({ lang: "zh" }),
      ]),
    /must end with \.en\.md/,
  );
});

test("rejects paired translations with different source basenames", () => {
  assert.throws(
    () =>
      validateNoteTranslations([
        note({ lang: "en", filePath: "src/notes/chem/Hydrogen.en.md" }),
        note({ lang: "zh", filePath: "src/notes/chem/氢.zh.md" }),
      ]),
    /must use the same source basename/,
  );
});

test("rejects a translation key category that disagrees with its directory", () => {
  assert.throws(
    () =>
      validateNoteTranslations([
        note({ lang: "en", filePath: "src/notes/cs/Hydrogen.en.md" }),
        note({ lang: "zh", filePath: "src/notes/cs/Hydrogen.zh.md" }),
      ]),
    /category "chem" must match source directory "cs"/,
  );
});

test("rejects paired translations with different publication dates", () => {
  assert.throws(
    () =>
      validateNoteTranslations([
        note({ lang: "en" }),
        note({ lang: "zh", pubDate: "2026-07-08" }),
      ]),
    /must use the same pubDate/,
  );
});

test("rejects paired translations with different tag sets", () => {
  assert.throws(
    () =>
      validateNoteTranslations([
        note({ lang: "en", tags: ["elements", "chemistry"] }),
        note({ lang: "zh", tags: ["elements"] }),
      ]),
    /must use the same tags/,
  );
});
