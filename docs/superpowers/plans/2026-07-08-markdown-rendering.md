# Markdown Rendering Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a maintainable Markdown rendering layer for notes, with responsive sized images and consistent article styles for math, tables, code, quotes, lists, rules, and highlights.

**Architecture:** Keep Astro's existing content collection and `render(post)` flow. Extend `src/utils/remarkContentBlocks.mjs` with focused transforms for card directives and sized image hints, then centralize the visual rendering rules under `.prose` in `src/styles/global.css`.

**Tech Stack:** Astro 7, unified/remark/rehype, `remark-directive`, `remark-math`, `rehype-katex`, Tailwind CSS typography, Node's built-in `node:test`.

---

## File Structure

- Modify `tests/remarkContentBlocks.test.mjs`: add focused tests for sized image conversion, non-numeric alt compatibility, and oversized width clamping.
- Modify `src/utils/remarkContentBlocks.mjs`: refactor the current visitor into small transforms and add sized image handling.
- Modify `src/styles/global.css`: add `.prose` rendering rules for images, math overflow, tables, code, blockquotes, horizontal rules, lists, and `mark`.
- Do not modify note content as part of the implementation. Existing notes should work without migration.
- Do not stage `.superpowers/` visual companion state. It is local brainstorming state.

## Implementation Constants

Use these exact class names and CSS custom property names so tests, Markdown transforms, and CSS stay aligned:

- `note-image`
- `note-image--sized`
- `--note-image-width`

Use this width limit:

- `MAX_IMAGE_WIDTH = 1200`

The limit protects the article layout while still allowing images wider than the current `max-w-3xl` container to behave naturally through responsive CSS.

---

### Task 1: Add Failing Tests for Sized Images

**Files:**
- Modify: `tests/remarkContentBlocks.test.mjs`

- [ ] **Step 1: Add sized image tests**

Append these tests to `tests/remarkContentBlocks.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the targeted test file and verify failure**

Run:

```bash
npm test -- tests/remarkContentBlocks.test.mjs
```

Expected: FAIL. At least the new numeric image test should fail because `remarkContentBlocks` does not yet add `note-image`, `note-image--sized`, or `--note-image-width`.

- [ ] **Step 3: Commit the failing tests**

Run:

```bash
git add tests/remarkContentBlocks.test.mjs
git commit -m "test: cover markdown sized images"
```

Expected: commit succeeds and contains only `tests/remarkContentBlocks.test.mjs`.

---

### Task 2: Implement Sized Image Transform

**Files:**
- Modify: `src/utils/remarkContentBlocks.mjs`
- Test: `tests/remarkContentBlocks.test.mjs`

- [ ] **Step 1: Replace `src/utils/remarkContentBlocks.mjs` with focused transforms**

Update `src/utils/remarkContentBlocks.mjs` to this implementation:

```js
const CARD_TONES = new Set(["green", "blue", "purple", "gray"]);
const CARD_ICONS = {
  question: "?",
  info: "i",
  warning: "!",
  none: "",
};
const MAX_IMAGE_WIDTH = 1200;

function className(...names) {
  return names.filter(Boolean).join(" ");
}

function elementNode(type, hName, hProperties, children = []) {
  return {
    type,
    data: {
      hName,
      hProperties,
    },
    children,
  };
}

function textElementNode(type, hName, hProperties, value) {
  return {
    type,
    value,
    data: {
      hName,
      hProperties,
      hChildren: [{ type: "text", value }],
    },
  };
}

function normalizeTone(tone) {
  return CARD_TONES.has(tone) ? tone : "green";
}

function normalizeIcon(icon) {
  return Object.hasOwn(CARD_ICONS, icon) ? icon : "question";
}

function parseImageWidthHint(alt) {
  const value = String(alt || "").trim();
  if (!/^[1-9]\d*$/.test(value)) return undefined;

  return Math.min(Number(value), MAX_IMAGE_WIDTH);
}

function transformCardDirective(node) {
  if (node.type !== "containerDirective" || node.name !== "card") return false;

  const attributes = node.attributes || {};
  const tone = normalizeTone(attributes.tone);
  const icon = normalizeIcon(attributes.icon);
  const title = String(attributes.title || "").trim();
  const originalChildren = Array.isArray(node.children) ? node.children : [];
  const children = [];

  node.type = "mdCard";
  node.data = {
    hName: "section",
    hProperties: {
      className: className("md-card", `md-card--${tone}`),
    },
  };

  if (title) {
    const headerChildren = [];
    const iconValue = CARD_ICONS[icon];

    if (iconValue) {
      headerChildren.push(
        textElementNode(
          "mdCardIcon",
          "span",
          {
            className: className("md-card__icon", `md-card__icon--${icon}`),
            ariaHidden: "true",
          },
          iconValue,
        ),
      );
    }

    headerChildren.push(
      textElementNode(
        "mdCardTitle",
        "span",
        { className: "md-card__title" },
        title,
      ),
    );

    children.push(
      elementNode(
        "mdCardHeader",
        "div",
        { className: "md-card__header" },
        headerChildren,
      ),
    );
  }

  children.push(
    elementNode(
      "mdCardBody",
      "div",
      { className: "md-card__body" },
      originalChildren,
    ),
  );

  node.children = children;
  return true;
}

function transformSizedImage(node) {
  if (node.type !== "image") return false;

  const width = parseImageWidthHint(node.alt);
  const hProperties = {
    className: "note-image",
  };

  if (width) {
    node.alt = "";
    hProperties.className = "note-image note-image--sized";
    hProperties.style = `--note-image-width:${width}px`;
  }

  node.data = {
    ...(node.data || {}),
    hProperties: {
      ...((node.data && node.data.hProperties) || {}),
      ...hProperties,
    },
  };

  return false;
}

function visit(node) {
  if (!node || typeof node !== "object") return;

  if (transformCardDirective(node)) return;
  transformSizedImage(node);

  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    visit(child);
  }
}

export default function remarkContentBlocks() {
  return (tree) => {
    visit(tree);
  };
}
```

- [ ] **Step 2: Run the targeted test file and verify pass**

Run:

```bash
npm test -- tests/remarkContentBlocks.test.mjs
```

Expected: PASS. Existing card tests and the new image tests pass.

- [ ] **Step 3: Commit the implementation**

Run:

```bash
git add src/utils/remarkContentBlocks.mjs
git commit -m "feat: support responsive markdown image widths"
```

Expected: commit succeeds and contains only `src/utils/remarkContentBlocks.mjs`.

---

### Task 3: Add Article Rendering Styles

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add the Markdown article style rules**

Append this CSS after the existing `.prose strong` rule and before the `.prose .md-card` block:

```css
.prose :where(img.note-image) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin-inline: auto;
  border-radius: 0.375rem;
}

.prose :where(img.note-image--sized) {
  width: min(var(--note-image-width), 100%);
}

.prose :where(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: 0.25rem;
  text-align: center;
}

.prose :where(table) {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.375rem;
  font-size: 0.95em;
  line-height: 1.55;
}

.prose :where(thead) {
  background: var(--color-gray-50);
}

.prose :where(th, td) {
  border: 1px solid var(--color-gray-200);
  padding: 0.55rem 0.75rem;
  vertical-align: top;
}

.prose :where(th) {
  color: var(--color-gray-800);
  font-weight: 600;
}

.prose :where(tbody tr:nth-child(even)) {
  background: var(--color-gray-50);
}

.prose :where(pre) {
  overflow-x: auto;
  border: 1px solid var(--color-gray-200);
  border-radius: 0.5rem;
  background: var(--color-gray-50);
  padding: 1rem;
}

.prose :where(:not(pre) > code) {
  border-radius: 0.25rem;
  background: var(--color-gray-100);
  padding: 0.12rem 0.28rem;
  color: var(--color-pink-700);
  font-weight: 500;
}

.prose :where(:not(pre) > code)::before,
.prose :where(:not(pre) > code)::after {
  content: none;
}

.prose :where(hr) {
  margin-block: 2rem;
  border-color: var(--color-gray-200);
}

.prose :where(li) {
  margin-block: 0.25rem;
}

.prose :where(li > p) {
  margin-block: 0.35rem;
}

.prose :where(mark) {
  border-radius: 0.15rem;
  background: #fef08a;
  box-decoration-break: clone;
  padding-inline: 0.12rem;
}
```

- [ ] **Step 2: Remove duplicate nested KaTeX overflow rules**

In `src/styles/global.css`, remove these duplicate blocks because the new global `.prose :where(.katex-display)` rule covers them:

```css
.prose .md-card__body .katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: 0.25rem;
}
```

and:

```css
.prose blockquote .katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding-block: 0.25rem;
}
```

- [ ] **Step 3: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Commit the style layer**

Run:

```bash
git add src/styles/global.css
git commit -m "style: refine markdown article rendering"
```

Expected: commit succeeds and contains only `src/styles/global.css`.

---

### Task 4: Verify Build and Real Note Rendering

**Files:**
- No source changes expected.

- [ ] **Step 1: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS. Astro generates the site successfully and Pagefind runs through the `postbuild` lifecycle if triggered by the build script environment. If `npm run build` does not run `postbuild`, do not force `postbuild` in this task.

- [ ] **Step 2: Start the local dev server for visual inspection**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: the command prints an Astro local URL, usually `http://127.0.0.1:4321/`.

- [ ] **Step 3: Inspect the chemistry note on desktop and narrow widths**

Open:

```text
http://127.0.0.1:4321/zh/notes/chem/1.%20Hydrogen/
```

Check these items:

- `![603](water.jpg)` renders centered and never exceeds the article width.
- Small chemistry images render centered and keep natural proportions.
- `$$...$$` formulas are centered and horizontally scrollable when needed.
- Tables, if present in the note or a temporary local sample, use compact GitHub-like borders, header background, and readable padding.
- Code blocks and inline code are readable and scroll-safe.
- Blockquotes preserve the current site visual direction.
- Horizontal rules, lists, and highlights have consistent spacing.

- [ ] **Step 4: Stop the dev server**

Press `Ctrl-C` in the terminal running `npm run dev`.

- [ ] **Step 5: Commit a verification note only if source changes were needed**

If visual inspection required source adjustments, commit those source changes with a focused message:

```bash
git add src/utils/remarkContentBlocks.mjs src/styles/global.css tests/remarkContentBlocks.test.mjs
git commit -m "fix: polish markdown rendering verification"
```

Expected: skip this step if no source changes were needed.

---

## Final Verification

- [ ] **Step 1: Confirm the working tree only has intentional unrelated files**

Run:

```bash
git status --short
```

Expected: no staged changes. It is acceptable for pre-existing user edits such as `src/notes/chem/1. Hydrogen.md` or local `.superpowers/` state to remain uncommitted if they were not part of this implementation.

- [ ] **Step 2: Run final tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Run final build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Summarize results**

Report:

- commits created
- tests run and outcomes
- build outcome
- any unrelated working tree changes intentionally left untouched
