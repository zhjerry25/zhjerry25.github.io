import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "../i18n/utils";
import { getNotesForLang, validateNoteTranslations } from "./notes";

export type NoteEntry = CollectionEntry<"notes">;

export async function getAllNotes(): Promise<NoteEntry[]> {
  const notes = await getCollection("notes");
  validateNoteTranslations(notes);
  return notes;
}

export async function getLocalizedNotes(lang: Lang): Promise<NoteEntry[]> {
  return getNotesForLang(await getAllNotes(), lang);
}
