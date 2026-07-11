---
title: Markdown Syntax Reference
pubDate: 2026-07-09
description: A comprehensive guide to Markdown syntax
lang: en
translationKey: cs/markdown
tags:
  - web
---
---

## 1. Headings

```markdown
# Level 1 Heading
## Level 2 Heading
### Level 3 Heading
#### Level 4 Heading
##### Level 5 Heading
###### Level 6 Heading
```

> Note: It is recommended to leave a space between `#` and the heading text.

---

## 2. Paragraphs and Line Breaks

- Paragraphs: Write continuous text directly, separating paragraphs with blank lines.
- Line breaks: Add **two spaces** at the end of a line before pressing Enter, or use `<br>`.

---

## 3. Emphasis

| Effect | Syntax |
| --- | --- |
| **Bold** | `**Bold**` or `__Bold__` |
| *Italic* | `*Italic*` or `_Italic_` |
| ***Bold italic*** | `***Bold italic***` |
| ~~Strikethrough~~ | `~~Strikethrough~~` |
| <u>Underline</u> | `<u>Underline</u>` |

---

## 4. Lists

### Unordered Lists

```markdown
- Item 1
- Item 2
  - Subitem (indent by 2 or 4 spaces)
* An asterisk also works
+ A plus sign also works
```

### Ordered Lists

```markdown
1. First item
2. Second item
   3. Subitem (indented)
4. Third item
```

### Task Lists

```markdown
- [x] Completed
- [ ] Incomplete
- [ ] To do
```

---

## 5. Links and Images

### Links

```markdown
[Display text](https://example.com)
[Link with a title](https://example.com "Shown on hover")
```

### Images

```markdown
![Alternative text](https://example.com/image.jpg)
![Image](img.png "Optional title")
```

### Reference-Style Links (Reusable)

```markdown
[Text][id]
[id]: https://example.com
```

---

## 6. Blockquotes

```markdown
> This is a blockquote
> A blockquote spanning multiple lines
>> A nested blockquote
```

---

## 7. Code

### Inline Code

```markdown
`console.log('hello')`
```

### Fenced Code Blocks

````markdown
```python
print("Hello")
```
````

> Specify a language such as `python`, `javascript`, or `bash` to enable syntax highlighting.

### Indented Code Blocks (4 Spaces or 1 Tab Before Each Line)

```markdown
    def hello():
        print("Hi")
```

---

## 8. Tables

```markdown
| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| Content      |    Content     |       Content |
| Row 2        |     Row 2      |         Row 2 |
```

> `---` separates the header row, while `:` controls the alignment direction.

---

## 9. Horizontal Rules

```markdown
---
***
___
```

> Place at least three symbols on a line by themselves.

---

## 10. Escaping Characters

Use a backslash `\` to escape special Markdown characters:

```markdown
\* Not italic
\# Not a heading
\[ Not a link
```

---

## 11. HTML Tags (Extension)

Most Markdown renderers support inline HTML for more complex layouts:

```html
<span style="color:red">Red text</span>
<br> Line break
<kbd>Ctrl</kbd> + <kbd>C</kbd>
```

---

## 12. Other Common Extensions (Platform-Dependent)

### 1. Footnotes

```markdown
Text with a footnote[^1]
[^1]: Footnote content
```

### 2. Definition Lists

```markdown
Term
: Definition
```

### 3. Collapsible/Details Blocks (GitHub)

```markdown
<details>
<summary>Click to expand</summary>
Hidden content
</details>
```

### 4. Mathematical Formulas (Requires LaTeX)

```markdown
Inline formula: $E=mc^2$
Block formula: $$x = \frac{-b}{2a}$$
```

### 5. Highlighting

```markdown
==Highlighted text==
```

### 6. Subscripts and Superscripts

```markdown
H~2~O      (subscript)
X^2^       (superscript)
```

---

## 13. Complete Example (Combined)

```markdown
# Project Description

> **Important**: Install the dependencies first.

1. Clone the repository
   `git clone xxx`

2. Install the dependencies
   - [x] npm install
   - [ ] Configure environment variables

| Parameter | Description |
|-----------|-------------|
| `--port` | Port number; defaults to `3000` |
```
