export type Lang = "en" | "zh";

export function getLocale(lang: Lang): string {
  return lang === "en" ? "en-US" : "zh-CN";
}

export function getAlternateLang(lang: Lang): Lang {
  return lang === "en" ? "zh" : "en";
}

/** Given a full URL pathname and the current language, returns the equivalent URL in the other language. */
export function getAlternatePath(pathname: string, currentLang: Lang): string {
  const otherLang = getAlternateLang(currentLang);
  // Replace the language prefix segment
  return pathname.replace(`/${currentLang}`, `/${otherLang}`);
}

/** Derive the canonical (English) URL for a path. */
export function getCanonicalPath(pathname: string, lang: Lang): string {
  if (lang === "en") return pathname;
  return pathname.replace(`/${lang}`, "/en");
}

/** Derive the language-specific path for hreflang. */
export function getLangPath(pathname: string, _currentLang: Lang, targetLang: Lang): string {
  // Replaces the lang prefix regardless of current lang
  return pathname.replace(/^\/(en|zh)/, `/${targetLang}`);
}
