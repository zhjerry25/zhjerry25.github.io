---
title: Markdown 中的 LaTeX 语法参考
lang: zh
translationKey: cs/latex
pubDate: 2026-07-09
description: LaTeX (KaTeX) 输入语法大全
tags:
  - web
---
---

## 一、基础结构

| 功能       | 语法                    | 示例                 |
| -------- | --------------------- | ------------------ |
| 行内公式     | `$...$`               | $E=mc^2$           |
| 独立公式（块级） | `$$...$$` 或 `\[...\]` | $$E=mc^2$$         |

---

## 二、希腊字母

| 字母  | 语法         | 示例         | 字母  | 语法       | 示例       |
| --- | ---------- | ---------- | --- | -------- | -------- |
| α   | `\alpha`   | $\alpha$   | β   | `\beta`  | $\beta$  |
| γ   | `\gamma`   | $\gamma$   | δ   | `\delta` | $\delta$ |
| ε   | `\epsilon` | $\epsilon$ | ζ   | `\zeta`  | $\zeta$  |
| η   | `\eta`     | $\eta$     | θ   | `\theta` | $\theta$ |
| ι   | `\iota`    | $\iota$    | κ   | `\kappa` | $\kappa$ |
| λ   | `\lambda`  | $\lambda$  | μ   | `\mu`    | $\mu$    |
| ν   | `\nu`      | $\nu$      | ξ   | `\xi`    | $\xi$    |
| π   | `\pi`      | $\pi$      | ρ   | `\rho`   | $\rho$   |
| σ   | `\sigma`   | $\sigma$   | τ   | `\tau`   | $\tau$   |
| φ   | `\phi`     | $\phi$     | χ   | `\chi`   | $\chi$   |
| ψ   | `\psi`     | $\psi$     | ω   | `\omega` | $\omega$ |
| Γ   | `\Gamma`   | $\Gamma$   | Δ   | `\Delta` | $\Delta$ |

---

## 三、上标与下标

| 功能  | 语法     | 示例                |
| --- | ------ | ----------------- |
| 上标  | `^`    | $x^2$             |
| 下标  | `_`    | $x_i$             |
| 组合  | 同时用    | $x_i^2$           |
| 多字符 | 加 `{}` | $x^{10}$，$x_{ij}$ |

---

## 四、分数

| 类型   | 语法              | 示例             |
| ---- | --------------- | -------------- |
| 标准分数 | `\frac{分子}{分母}` | $\frac{1}{2}$  |
| 紧凑分数 | `\tfrac`        | $\tfrac{1}{2}$ |
| 显示分数 | `\dfrac`        | $\dfrac{1}{2}$ |

---

## 五、根式

| 功能 | 语法 | 示例 |
|------|------|------|
| 平方根 | `\sqrt{...}` | $\sqrt{x}$ |
| n次根 | `\sqrt[n]{...}` | $\sqrt[3]{x}$ |

---

## 六、括号与定界符

| 功能 | 语法 | 示例 |
|------|------|------|
| 圆括号 | `(...)` | $(x+y)$ |
| 方括号 | `[...]` | $[x+y]$ |
| 花括号 | `\{...\}` | $\{x\}$ |
| 自适应 | `\left( ... \right)` | $\left( \frac{1}{2} \right)$ |
| 绝对值 | `\left\lvert ... \right\rvert` | $\left\lvert x\right\rvert$ |
| 范数 | `\left\lVert ... \right\rVert` | $\left\lVert v\right\rVert$ |

---

## 七、求和、积分、极限

| 功能   | 语法                | 示例                      |
| ---- | ----------------- | ----------------------- |
| 求和   | `\sum_{下}^{上}`    | $\sum_{i=1}^{n} i$      |
| 积分   | `\int_{下}^{上}`    | $\int_0^1 x\,dx$        |
| 二重积分 | `\iint`           | $\iint_D f(x,y)\,dA$    |
| 三重积分 | `\iiint`          | $\iiint_V f(x,y,z)\,dV$ |
| 曲线积分 | `\oint`           | $\oint_C f(z)\,dz$      |
| 极限   | `\lim_{x \to a}`  | $\lim_{x \to a} f(x)$   |
| 乘积   | `\prod_{i=1}^{n}` | $\prod_{i=1}^{n} a_i$   |

---

## 八、常用运算符

| 功能 | 语法 | 示例 |
|------|------|------|
| 加减乘除 | `+ - \times \div` | $a+b-c\times d\div e$ |
| 点乘 | `\cdot` | $a\cdot b$ |
| 叉乘 | `\times` | $a\times b$ |
| 并集 | `\cup` | $A\cup B$ |
| 交集 | `\cap` | $A\cap B$ |
| 属于 | `\in` | $x\in A$ |
| 包含 | `\subset`, `\supset` | $A\subset B$，$B\supset A$ |
| 不等于 | `\neq` | $a\neq b$ |
| 约等于 | `\approx` | $\pi\approx 3.14$ |
| 恒等 | `\equiv` | $a\equiv b$ |
| 小于等于 | `\le` 或 `\leq` | $a\le b$ |
| 大于等于 | `\ge` 或 `\geq` | $a\ge b$ |
| 正负 | `\pm` | $x=\pm 1$ |
| 负正 | `\mp` | $a\mp b$ |
| 无穷 | `\infty` | $x\to\infty$ |
| 偏导 | `\partial` | $\frac{\partial f}{\partial x}$ |
| 梯度 | `\nabla` | $\nabla f$ |

---

## 九、函数名（正体）

| 功能 | 语法 | 示例 |
|------|------|------|
| sin | `\sin` | $\sin x$ |
| cos | `\cos` | $\cos x$ |
| tan | `\tan` | $\tan x$ |
| cot | `\cot` | $\cot x$ |
| sec | `\sec` | $\sec x$ |
| csc | `\csc` | $\csc x$ |
| arcsin | `\arcsin` | $\arcsin x$ |
| arccos | `\arccos` | $\arccos x$ |
| log | `\log` | $\log x$ |
| ln | `\ln` | $\ln x$ |
| lg | `\lg` | $\lg x$ |
| exp | `\exp` | $\exp x$ |
| max | `\max` | $\max(a,b)$ |
| min | `\min` | $\min(a,b)$ |
| sup | `\sup` | $\sup A$ |
| inf | `\inf` | $\inf A$ |
| lim | `\lim` | $\lim_{x\to 0} x$ |
| det | `\det` | $\det A$ |

---

## 十、矩阵与行列式

| 环境 | 语法 | 示例 |
|------|------|------|
| 矩阵（无括号） | `\begin{matrix} a & b \\ c & d \end{matrix}` | $\begin{matrix} a & b \\ c & d \end{matrix}$ |
| 圆括号矩阵 | `\begin{pmatrix} ... \end{pmatrix}` | $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$ |
| 方括号矩阵 | `\begin{bmatrix} ... \end{bmatrix}` | $\begin{bmatrix} a & b \\ c & d \end{bmatrix}$ |
| 花括号矩阵 | `\begin{Bmatrix} ... \end{Bmatrix}` | $\begin{Bmatrix} a & b \\ c & d \end{Bmatrix}$ |
| 行列式 | `\begin{vmatrix} ... \end{vmatrix}` | $\begin{vmatrix} a & b \\ c & d \end{vmatrix}$ |
| 范数矩阵 | `\begin{Vmatrix} ... \end{Vmatrix}` | $\begin{Vmatrix} a & b \\ c & d \end{Vmatrix}$ |

列用 `&` 分隔，行用 `\\` 分隔

---

## 十一、多行公式

| 功能 | 语法 | 示例 |
|------|------|------|
| 对齐 | `\begin{aligned} x &= 1 \\ y &= 2 \end{aligned}` | $\begin{aligned} x &= 1 \\ y &= 2 \end{aligned}$ |
| 方程组 | `\begin{cases} x+y=1 \\ x-y=2 \end{cases}` | $\begin{cases} x+y=1 \\ x-y=2 \end{cases}$ |
| 分段函数 | `f(x)=\begin{cases} x^2 & x>0 \\ 0 & x=0 \\ -x & x<0 \end{cases}` | $f(x)=\begin{cases} x^2 & x>0 \\ 0 & x=0 \\ -x & x<0 \end{cases}$ |

---

## 十二、上下标装饰

| 功能 | 语法 | 示例 |
|------|------|------|
| 上花括弧 | `\overbrace{...}^{text}` | $\overbrace{a+b+c}^{text}$ |
| 下花括弧 | `\underbrace{...}_{text}` | $\underbrace{a+b+c}_{text}$ |
| 上箭头 | `\xrightarrow{text}` | $\xrightarrow{text}$ |
| 上横线 | `\overline{...}` | $\overline{AB}$ |
| 下横线 | `\underline{...}` | $\underline{AB}$ |
| 向量箭头 | `\vec{...}` | $\vec{v}$ |
| 箭头（长） | `\overrightarrow{AB}` | $\overrightarrow{AB}$ |
| 帽子 | `\hat{a}` | $\hat{a}$ |
| 波浪号 | `\tilde{a}` | $\tilde{a}$ |
| 点 | `\dot{a}`，`\ddot{a}` | $\dot{a}$，$\ddot{a}$ |

---

## 十三、箭头符号

| 语法 | 示例 | 语法 | 示例 |
|------|------|------|------|
| `\leftarrow` | $\leftarrow$ | `\rightarrow` | $\rightarrow$ |
| `\Leftarrow` | $\Leftarrow$ | `\Rightarrow` | $\Rightarrow$ |
| `\leftrightarrow` | $\leftrightarrow$ | `\Leftrightarrow` | $\Leftrightarrow$ |
| `\longleftarrow` | $\longleftarrow$ | `\longrightarrow` | $\longrightarrow$ |
| `\uparrow` | $\uparrow$ | `\downarrow` | $\downarrow$ |
| `\nearrow` | $\nearrow$ | `\searrow` | $\searrow$ |

---

## 十四、空格与换行

| 功能 | 语法 | 示例 |
|------|------|------|
| 小空格 | `\,` | $a\,b$ |
| 中空格 | `\;` | $a\;b$ |
| 大空格 | `\quad` | $a\quad b$ |
| 更大空格 | `\qquad` | $a\qquad b$ |
| 强制换行 | `\\` | $\begin{matrix} a \\ b \end{matrix}$ |

---

## 十五、颜色

| 语法 | 示例 |
|------|------|
| `\color{red}{text}` | $\color{red}{text}$ |
| `\color{blue}{text}` | $\color{blue}{text}$ |
| 支持：red, blue, green, yellow, purple, cyan, black, white, gray 等 | $\color{green}{green}$，$\color{purple}{purple}$ |

---

## 十六、字体

| 功能 | 语法 | 示例 |
|------|------|------|
| 罗马体 | `\mathrm{...}` | $\mathrm{ABC}$ |
| 黑体 | `\mathbf{...}` | $\mathbf{ABC}$ |
| 手写体 | `\mathcal{...}` | $\mathcal{ABC}$ |
| 黑板粗体 | `\mathbb{...}`（如 R, N, Z） | $\mathbb{R}$，$\mathbb{N}$，$\mathbb{Z}$ |
| 打字机 | `\mathtt{...}` | $\mathtt{ABC}$ |
| 斜体（默认） | 直接输入 | $ABC$ |

---

## 十七、特殊符号

| 语法               | 示例         | 语法          | 示例          |
| ---------------- | ---------- | ----------- | ----------- |
| `\forall`        | $\forall$  | `\exists`   | $\exists$   |
| `\neg` 或 `\lnot` | $\neg$     | `\emptyset` | $\emptyset$ |
| `\infty`         | $\infty$   | `\nabla`    | $\nabla$    |
| `\bot`           | $\bot$     | `\top`      | $\top$      |
| `\angle`         | $\angle$   | `\degree`   | $90\degree$ |
| `\prime`         | $x^\prime$ | `\ldots`    | $\ldots$    |
| `\cdots`         | $\cdots$   | `\vdots`    | $\vdots$    |
| `\ddots`         | $\ddots$   | `\hbar`     | $\hbar$     |
