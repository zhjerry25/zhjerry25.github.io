# Markdown Rendering Support Design

Date: 2026-07-08

## Context

This Astro personal site stores notes as Markdown under `src/notes/[category]`.
Posts currently render through Astro content collections with a mostly native
Markdown pipeline, plus a small custom `remarkContentBlocks.mjs` plugin for
content blocks such as `:::card`.

The goal is to add standard, sufficient rendering support for long-form notes,
especially chemistry notes that contain math, images, tables, code, quotes, and
highlighted terms. The change should create a maintainable rendering layer
instead of accumulating unrelated one-off CSS fixes.

## Goals

- Keep the existing Astro content collection and `render(post)` flow.
- Improve Markdown article rendering inside the `.prose` content container.
- Support responsive, centered images with author-controlled maximum widths.
- Ensure block math is centered and scroll-safe on narrow screens.
- Style Markdown tables with a compact, comfortable GitHub-like treatment.
- Provide consistent styling for code, blockquotes, horizontal rules, lists,
  and `mark` highlights.
- Leave a clear extension point for future Markdown features.
- Avoid requiring migrations for existing notes.

## Non-Goals

- Do not introduce a full MDX component system.
- Do not add image lightboxes, interactive charts, table of contents anchors,
  footnotes, or other interactive note features in this iteration.
- Do not rewrite Astro's image pipeline or content collection setup.
- Do not affect layout outside Markdown article content.

## Chosen Approach

Use a light Markdown rendering layer plus centralized content styles.

`src/utils/remarkContentBlocks.mjs` remains the site's custom Markdown AST
enhancement point. It should be organized around small transforms, such as
card directives and sized images. `src/styles/global.css` remains the
centralized style layer for `.prose` content.

This approach keeps old posts working while giving the site a structured place
to add future Markdown semantics such as figures, embeds, or new content block
directives.

## Rendering Rules

### Images

Images are centered and responsive by default.

The existing authoring pattern:

```md
![603](water.jpg)
```

means "render this image with a preferred maximum display width of 603px." The
number is not an absolute locked width. CSS should constrain the result with
rules equivalent to:

- `width: min(var(--note-image-width), 100%)`
- `max-width: 100%`
- `height: auto`

Only alt text that is exactly a positive integer is interpreted as a width.
Examples such as `![603px](...)`, `![fig. 1](...)`, and `![water molecule](...)`
remain normal accessible alt text. Unsized images use the default responsive
article image treatment.

The transform should also guard against author mistakes. Very large numeric
widths should not be allowed to break article layout.

### Math

The existing `remark-math` and `rehype-katex` pipeline remains in place.

Block math rendered as `.katex-display` should be centered by default and
horizontally scrollable when too wide for the viewport. Inline math should
remain inline and should not receive block-level styling. Math inside cards,
blockquotes, and other nested content should follow the same overflow rules.

### Tables

Markdown tables should use a compact, comfortable GitHub-like style:

- subtle outer and cell borders
- light table header background
- moderate cell padding
- readable line height
- horizontal scrolling on small screens or for wide scientific tables
- optional very light row striping if it improves scanability

Left alignment is the default. The table style should not force large academic
typography or centered cells globally, because many notes will mix prose,
numbers, formulas, and labels. `mark` highlights must work cleanly inside table
cells.

### Code

Code blocks should have a clear background, modest radius, readable padding,
and horizontal overflow handling. Inline code should use a small background and
should remain visually distinct from prose without overwhelming the line.

### Blockquotes

The existing blockquote visual direction can remain, but it should be part of
the same `.prose` spacing system as the rest of the article renderer. Nested
math inside blockquotes should remain scroll-safe.

### Horizontal Rules, Lists, and Highlights

Horizontal rules should provide a clear section break without feeling heavier
than headings. Lists should have consistent spacing between list items and
nested content. `mark` should render as a readable highlight in normal prose,
tables, and math-adjacent text.

## Data Flow

1. Astro loads notes through the `notes` content collection.
2. The note route calls `render(post)`.
3. Astro runs the configured Markdown plugins:
   - `remark-math` parses inline and block math.
   - `remark-directive` parses directive syntax.
   - `remarkContentBlocks` applies site-specific Markdown semantics.
   - `rehype-katex` renders math to KaTeX HTML.
4. The rendered content enters `MarkdownPostLayout.astro`.
5. The `.prose` container applies the global content styles.

## Error Handling and Compatibility

- Numeric image alt text is parsed only when it exactly matches a positive
  integer.
- Invalid image width hints are ignored rather than failing the build.
- Oversized hints are constrained so they cannot break the responsive layout.
- Existing non-numeric alt text remains available as real alt text.
- Existing card directives continue to work.
- Wide formulas, tables, and code blocks scroll horizontally instead of
  overflowing the page.

## Extensibility

`remarkContentBlocks.mjs` should be structured as a set of focused transforms,
for example:

- `transformCardDirective`
- `transformSizedImage`

The visitor can apply these transforms in one traversal. Future features should
follow the same pattern: add a small semantic transform when Markdown needs
more structure, and add the visual treatment in the centralized `.prose`
styles. This keeps authoring syntax, AST semantics, and visual styling
separate enough to evolve independently.

## Testing and Acceptance

Automatic verification:

- Run `npm test`.
- Run `npm run build`.
- Add focused tests for `remarkContentBlocks.mjs` if existing coverage does not
  already verify sized images and card compatibility.

Sized image behavior should be tested for:

- `![603](water.jpg)` produces the sized image structure and width variable.
- normal alt text is not treated as a width.
- invalid or excessive width hints cannot break the layout.

Visual verification:

- Use an existing chemistry note as a real sample.
- Confirm images are centered and responsive on desktop and narrow screens.
- Confirm `$$...$$` formulas are centered and scroll-safe.
- Confirm tables use the compact GitHub-like treatment and do not overflow the
  article.
- Confirm code, blockquotes, lists, horizontal rules, and highlights have
  consistent article spacing.

Compatibility acceptance:

- Existing notes do not need migration.
- Existing `![603]` authoring becomes an official maximum-width hint.
- Styles remain scoped to Markdown article content and do not pollute unrelated
  pages.
