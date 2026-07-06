export interface ReadingTimeResult {
  minutes: number;
  short: string;
  full: string;
}

/**
 * Estimate reading time for bilingual (Chinese/English) markdown content.
 *
 * Chinese characters are counted individually and divided by 300 CPM.
 * Latin words are split on whitespace and divided by 200 WPM.
 * Markdown syntax noise (code fences, links, images, etc.) is stripped first.
 */
export function getReadingTime(
  text: string,
  lang: "en" | "zh" = "en",
): ReadingTimeResult {
  // 1. Strip markdown syntax noise
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")           // fenced code blocks
    .replace(/`[^`]*`/g, "")                    // inline code
    .replace(/\$\$[\s\S]*?\$\$|\\\[.*?\\\]/g, "") // block math ($$...$$, \[...\])
    .replace(/\$[^$]*\$|\\\(.*?\\\)/g, "")       // inline math ($...$, \(...\))
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")   // images → keep alt text
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")     // links → keep link text
    .replace(/^>\s?/gm, "")                      // blockquote markers
    .replace(/^---+$/gm, "")                    // horizontal rules
    .replace(/<!--[\s\S]*?-->/g, "")            // HTML comments
    .replace(/\*{1,3}|_{1,3}/g, "");            // bold / italic markers

  // 2. Count CJK characters and Latin words
  let cjkChars = 0;
  let latinWords = 0;
  let wordBuffer = "";

  const isCJK = (code: number): boolean =>
    code >= 0x4e00 && code <= 0x9fff;

  const isWordChar = (ch: string): boolean =>
    /[a-zA-Z0-9]/.test(ch);

  function flushBuffer(): void {
    if (wordBuffer.length > 0) {
      latinWords += 1;
      wordBuffer = "";
    }
  }

  for (const ch of cleaned) {
    const code = ch.codePointAt(0);
    if (code !== undefined && isCJK(code)) {
      flushBuffer();
      cjkChars += 1;
    } else if (isWordChar(ch)) {
      wordBuffer += ch;
    } else {
      flushBuffer();
    }
  }
  flushBuffer();

  // 3. Compute minutes
  const rawMinutes = cjkChars / 300 + latinWords / 200;
  const minutes = Math.max(1, Math.ceil(rawMinutes));

  // 4. Format localized strings
  if (lang === "zh") {
    return {
      minutes,
      short: `${minutes} 分钟`,
      full: `阅读 ${minutes} 分钟`,
    };
  }

  return {
    minutes,
    short: `${minutes} min`,
    full: `${minutes} min`,
  };
}
