import assert from "node:assert/strict";
import { test } from "node:test";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import remarkContentBlocks from "../src/utils/remarkContentBlocks.mjs";

async function renderMarkdown(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkContentBlocks)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

test("renders card directives as styled card markup", async () => {
  const html = await renderMarkdown(`:::card{title="什么叫“宏观可以观测”?" icon="question" tone="green"}
正文包含 **重点** 和 $x$。
:::
`);

  assert.match(html, /<section class="md-card md-card--green">/);
  assert.match(html, /<div class="md-card__header">/);
  assert.match(html, /<span class="md-card__icon md-card__icon--question" aria-hidden="true">\?<\/span>/);
  assert.match(html, /<span class="md-card__title">什么叫“宏观可以观测”\?<\/span>/);
  assert.match(html, /<div class="md-card__body">/);
  assert.match(html, /<strong>重点<\/strong>/);
});

test("falls back to default card options", async () => {
  const html = await renderMarkdown(`:::card
无标题内容。
:::
`);

  assert.match(html, /<section class="md-card md-card--green">/);
  assert.doesNotMatch(html, /md-card__header/);
  assert.match(html, /<div class="md-card__body">/);
});

test("leaves non-card directives untouched for future extensions", async () => {
  const html = await renderMarkdown(`:::aside
补充内容。
:::
`);

  assert.doesNotMatch(html, /md-card/);
});

test("turns numeric image alt text into a responsive width hint", async () => {
  const html = await renderMarkdown("![603](water.jpg)");

  assert.match(
    html,
    /<img src="water\.jpg" alt="" class="note-image note-image--sized" style="--note-image-width:603px">/,
  );
});

test("preserves non-numeric image alt text", async () => {
  const html = await renderMarkdown("![water molecule](water.jpg)");

  assert.match(html, /<img src="water\.jpg" alt="water molecule" class="note-image">/);
  assert.doesNotMatch(html, /note-image--sized/);
  assert.doesNotMatch(html, /--note-image-width/);
});

test("ignores non-integer image width hints", async () => {
  const html = await renderMarkdown("![603px](water.jpg)");

  assert.match(html, /<img src="water\.jpg" alt="603px" class="note-image">/);
  assert.doesNotMatch(html, /note-image--sized/);
  assert.doesNotMatch(html, /--note-image-width/);
});

test("clamps oversized numeric image width hints", async () => {
  const html = await renderMarkdown("![2400](water.jpg)");

  assert.match(
    html,
    /<img src="water\.jpg" alt="" class="note-image note-image--sized" style="--note-image-width:1200px">/,
  );
});
