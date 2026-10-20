---
title: LaTeX Syntax Reference in Markdown
lang: en
translationKey: cs/latex
pubDate: 2026-07-09
description: Complete Guide to LaTeX (KaTeX) Input Syntax
tags:
  - web
---
---

## 1. Basic Structure

| Function                | Syntax                  | Example            |
| ----------------------- | ----------------------- | ------------------ |
| Inline formula          | `$...$`                 | $E=mc^2$           |
| Display formula (block) | `$$...$$` or `\[...\]` | $$E=mc^2$$         |

---

## 2. Greek Letters

| Letter | Syntax     | Example    | Letter | Syntax   | Example  |
| ------ | ---------- | ---------- | ------ | -------- | -------- |
| α      | `\alpha`   | $\alpha$   | β      | `\beta`  | $\beta$  |
| γ      | `\gamma`   | $\gamma$   | δ      | `\delta` | $\delta$ |
| ε      | `\epsilon` | $\epsilon$ | ζ      | `\zeta`  | $\zeta$  |
| η      | `\eta`     | $\eta$     | θ      | `\theta` | $\theta$ |
| ι      | `\iota`    | $\iota$    | κ      | `\kappa` | $\kappa$ |
| λ      | `\lambda`  | $\lambda$  | μ      | `\mu`    | $\mu$    |
| ν      | `\nu`      | $\nu$      | ξ      | `\xi`    | $\xi$    |
| π      | `\pi`      | $\pi$      | ρ      | `\rho`   | $\rho$   |
| σ      | `\sigma`   | $\sigma$   | τ      | `\tau`   | $\tau$   |
| φ      | `\phi`     | $\phi$     | χ      | `\chi`   | $\chi$   |
| ψ      | `\psi`     | $\psi$     | ω      | `\omega` | $\omega$ |
| Γ      | `\Gamma`   | $\Gamma$   | Δ      | `\Delta` | $\Delta$ |

---

## 3. Superscripts and Subscripts

| Function            | Syntax        | Example                 |
| ------------------- | ------------- | ----------------------- |
| Superscript         | `^`           | $x^2$                   |
| Subscript           | `_`           | $x_i$                   |
| Combined            | Use both      | $x_i^2$                 |
| Multiple characters | Enclose in `{}` | $x^{10}$, $x_{ij}$    |

---

## 4. Fractions

| Type              | Syntax                            | Example            |
| ----------------- | --------------------------------- | ------------------ |
| Standard fraction | `\frac{numerator}{denominator}`    | $\frac{1}{2}$      |
| Compact fraction  | `\tfrac`                          | $\tfrac{1}{2}$     |
| Display fraction  | `\dfrac`                          | $\dfrac{1}{2}$     |

---

## 5. Radicals

| Function    | Syntax             | Example         |
| ----------- | ------------------ | --------------- |
| Square root | `\sqrt{...}`       | $\sqrt{x}$      |
| nth root    | `\sqrt[n]{...}`    | $\sqrt[3]{x}$   |

---

## 6. Brackets and Delimiters

| Function          | Syntax                          | Example                                |
| ----------------- | ------------------------------- | -------------------------------------- |
| Parentheses       | `(...)`                         | $(x+y)$                                |
| Square brackets   | `[...]`                         | $[x+y]$                                |
| Braces            | `\{...\}`                       | $\{x\}$                                |
| Auto-sizing       | `\left( ... \right)`            | $\left( \frac{1}{2} \right)$          |
| Absolute value    | `\left\lvert ... \right\rvert` | $\left\lvert x\right\rvert$           |
| Norm              | `\left\lVert ... \right\rVert` | $\left\lVert v\right\rVert$           |

---

## 7. Sums, Integrals, and Limits

| Function        | Syntax                  | Example                         |
| --------------- | ----------------------- | ------------------------------- |
| Summation       | `\sum_{lower}^{upper}`  | $\sum_{i=1}^{n} i$              |
| Integral        | `\int_{lower}^{upper}`  | $\int_0^1 x\,dx$                |
| Double integral | `\iint`                 | $\iint_D f(x,y)\,dA$            |
| Triple integral | `\iiint`                | $\iiint_V f(x,y,z)\,dV$         |
| Contour integral| `\oint`                 | $\oint_C f(z)\,dz$              |
| Limit           | `\lim_{x \to a}`        | $\lim_{x \to a} f(x)$           |
| Product         | `\prod_{i=1}^{n}`       | $\prod_{i=1}^{n} a_i$            |

---

## 8. Common Operators

| Function                  | Syntax                 | Example                                  |
| ------------------------- | ---------------------- | ---------------------------------------- |
| Addition, subtraction, multiplication, division | `+ - \times \div` | $a+b-c\times d\div e$ |
| Dot product               | `\cdot`                | $a\cdot b$                               |
| Cross product             | `\times`               | $a\times b$                              |
| Union                     | `\cup`                 | $A\cup B$                                |
| Intersection              | `\cap`                 | $A\cap B$                                |
| Element of                | `\in`                  | $x\in A$                                 |
| Subset and superset       | `\subset`, `\supset`  | $A\subset B$, $B\supset A$              |
| Not equal                 | `\neq`                 | $a\neq b$                                |
| Approximately equal       | `\approx`              | $\pi\approx 3.14$                        |
| Identically equal         | `\equiv`               | $a\equiv b$                              |
| Less than or equal        | `\le` or `\leq`        | $a\le b$                                 |
| Greater than or equal     | `\ge` or `\geq`        | $a\ge b$                                 |
| Plus or minus             | `\pm`                  | $x=\pm 1$                                |
| Minus or plus             | `\mp`                  | $a\mp b$                                 |
| Infinity                  | `\infty`               | $x\to\infty$                             |
| Partial derivative        | `\partial`             | $\frac{\partial f}{\partial x}$          |
| Gradient                  | `\nabla`               | $\nabla f$                               |

---

## 9. Function Names (Upright)

| Function | Syntax    | Example                 |
| -------- | --------- | ----------------------- |
| sin      | `\sin`    | $\sin x$                 |
| cos      | `\cos`    | $\cos x$                 |
| tan      | `\tan`    | $\tan x$                 |
| cot      | `\cot`    | $\cot x$                 |
| sec      | `\sec`    | $\sec x$                 |
| csc      | `\csc`    | $\csc x$                 |
| arcsin   | `\arcsin` | $\arcsin x$              |
| arccos   | `\arccos` | $\arccos x$              |
| log      | `\log`    | $\log x$                 |
| ln       | `\ln`     | $\ln x$                  |
| lg       | `\lg`     | $\lg x$                  |
| exp      | `\exp`    | $\exp x$                 |
| max      | `\max`    | $\max(a,b)$              |
| min      | `\min`    | $\min(a,b)$              |
| sup      | `\sup`    | $\sup A$                 |
| inf      | `\inf`    | $\inf A$                 |
| lim      | `\lim`    | $\lim_{x\to 0} x$        |
| det      | `\det`    | $\det A$                 |

---

## 10. Matrices and Determinants

| Environment                   | Syntax                                            | Example                                           |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| Matrix (no delimiters)        | `\begin{matrix} a & b \\ c & d \end{matrix}`     | $\begin{matrix} a & b \\ c & d \end{matrix}$     |
| Parenthesized matrix          | `\begin{pmatrix} ... \end{pmatrix}`               | $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$   |
| Square-bracketed matrix       | `\begin{bmatrix} ... \end{bmatrix}`               | $\begin{bmatrix} a & b \\ c & d \end{bmatrix}$   |
| Braced matrix                 | `\begin{Bmatrix} ... \end{Bmatrix}`               | $\begin{Bmatrix} a & b \\ c & d \end{Bmatrix}$   |
| Determinant                   | `\begin{vmatrix} ... \end{vmatrix}`               | $\begin{vmatrix} a & b \\ c & d \end{vmatrix}$   |
| Norm matrix                   | `\begin{Vmatrix} ... \end{Vmatrix}`               | $\begin{Vmatrix} a & b \\ c & d \end{Vmatrix}$   |

Separate columns with `&` and rows with `\\`.

---

## 11. Multiline Formulas

| Function         | Syntax                                                                    | Example                                                                   |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Alignment        | `\begin{aligned} x &= 1 \\ y &= 2 \end{aligned}`                         | $\begin{aligned} x &= 1 \\ y &= 2 \end{aligned}$                         |
| System of equations | `\begin{cases} x+y=1 \\ x-y=2 \end{cases}`                            | $\begin{cases} x+y=1 \\ x-y=2 \end{cases}$                               |
| Piecewise function | `f(x)=\begin{cases} x^2 & x>0 \\ 0 & x=0 \\ -x & x<0 \end{cases}`     | $f(x)=\begin{cases} x^2 & x>0 \\ 0 & x=0 \\ -x & x<0 \end{cases}$       |

---

## 12. Superscript and Subscript Decorations

| Function             | Syntax                         | Example                              |
| -------------------- | ------------------------------ | ------------------------------------ |
| Overbrace            | `\overbrace{...}^{text}`       | $\overbrace{a+b+c}^{text}$           |
| Underbrace           | `\underbrace{...}_{text}`      | $\underbrace{a+b+c}_{text}$          |
| Arrow with label     | `\xrightarrow{text}`           | $\xrightarrow{text}$                 |
| Overline             | `\overline{...}`               | $\overline{AB}$                      |
| Underline            | `\underline{...}`              | $\underline{AB}$                     |
| Vector arrow         | `\vec{...}`                    | $\vec{v}$                            |
| Long arrow           | `\overrightarrow{AB}`          | $\overrightarrow{AB}$                |
| Hat                  | `\hat{a}`                      | $\hat{a}$                            |
| Tilde                | `\tilde{a}`                    | $\tilde{a}$                          |
| Dot                  | `\dot{a}`, `\ddot{a}`          | $\dot{a}$, $\ddot{a}$                |

---

## 13. Arrow Symbols

| Syntax             | Example            | Syntax                | Example               |
| ------------------ | ------------------ | --------------------- | --------------------- |
| `\leftarrow`       | $\leftarrow$        | `\rightarrow`          | $\rightarrow$          |
| `\Leftarrow`       | $\Leftarrow$        | `\Rightarrow`          | $\Rightarrow$          |
| `\leftrightarrow`  | $\leftrightarrow$   | `\Leftrightarrow`      | $\Leftrightarrow$      |
| `\longleftarrow`   | $\longleftarrow$    | `\longrightarrow`      | $\longrightarrow$      |
| `\uparrow`         | $\uparrow$          | `\downarrow`           | $\downarrow$           |
| `\nearrow`         | $\nearrow$          | `\searrow`             | $\searrow$             |

---

## 14. Spacing and Line Breaks

| Function        | Syntax    | Example                                  |
| --------------- | --------- | ---------------------------------------- |
| Small space     | `\,`      | $a\,b$                                   |
| Medium space    | `\;`      | $a\;b$                                   |
| Large space     | `\quad`   | $a\quad b$                               |
| Larger space    | `\qquad`  | $a\qquad b$                              |
| Forced line break | `\\`   | $\begin{matrix} a \\ b \end{matrix}$   |

---

## 15. Colors

| Syntax                                                                 | Example                                      |
| ---------------------------------------------------------------------- | -------------------------------------------- |
| `\color{red}{text}`                                                    | $\color{red}{text}$                          |
| `\color{blue}{text}`                                                   | $\color{blue}{text}$                         |
| Supported: red, blue, green, yellow, purple, cyan, black, white, gray, etc. | $\color{green}{green}$, $\color{purple}{purple}$ |

---

## 16. Fonts

| Function             | Syntax                           | Example                                      |
| -------------------- | -------------------------------- | -------------------------------------------- |
| Roman type           | `\mathrm{...}`                   | $\mathrm{ABC}$                               |
| Bold                 | `\mathbf{...}`                   | $\mathbf{ABC}$                               |
| Calligraphic         | `\mathcal{...}`                  | $\mathcal{ABC}$                              |
| Blackboard bold      | `\mathbb{...}` (e.g. R, N, Z)    | $\mathbb{R}$, $\mathbb{N}$, $\mathbb{Z}$     |
| Monospace            | `\mathtt{...}`                   | $\mathtt{ABC}$                               |
| Italic (default)     | Enter directly                   | $ABC$                                        |

---

## 17. Special Symbols

| Syntax             | Example      | Syntax       | Example       |
| ------------------ | ------------ | ------------ | ------------- |
| `\forall`          | $\forall$    | `\exists`    | $\exists$     |
| `\neg` or `\lnot`  | $\neg$       | `\emptyset`  | $\emptyset$   |
| `\infty`           | $\infty$     | `\nabla`     | $\nabla$      |
| `\bot`             | $\bot$       | `\top`       | $\top$        |
| `\angle`           | $\angle$     | `\degree`    | $90\degree$   |
| `\prime`           | $x^\prime$   | `\ldots`     | $\ldots$      |
| `\cdots`           | $\cdots$     | `\vdots`     | $\vdots$      |
| `\ddots`           | $\ddots$     | `\hbar`      | $\hbar$       |
