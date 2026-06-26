---
title: Links to CSS colour palettes
url: 'https://jvns.ca/blog/2026/05/04/css-colour-palettes/'
url_hash: d03324d42a4d5e21905ef967f5a828e183e2670a
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-05-04T00:00:00.000Z
lang: zh
translated: true
tags:
  - CSS
  - 前端
original_lang: en
truncated: false
---
不久前，我决定在新项目中停止使用 Tailwind，转而直接编写原生 CSS。

但有一件事让我怀念 Tailwind，那就是它的[调色板](https://v2.tailwindcss.com/docs/customizing-colors#color-palette-reference)（[CSS 版](https://gist.github.com/jvns/9e59b2cd1fe12601084ba78dded072fe)）。想要浅蓝色时，直接用 `blue-100` 就行；不满意的话，试试 `blue-200` 或 `blue-50`。我对色彩不太擅长，所以有一套经过比我更懂色彩的人精心设计的合理调色板，对我来说意义重大。

不过我也对 Tailwind 的配色有些审美疲劳了，于是今天在 Mastodon 上询问还有哪些其他调色板。随后有朋友表示想看看这些调色板的链接，所以我就写了这篇博客，让朋友能看到，也顺便分享给各位 :)

### 我最喜欢的

我最中意的几个是：

-   [uchū](https://uchu.style/)（[CSS 文件](https://code.webb.page/nevercease/uchu.git/tree/dist/uchu.css)，[常见问题](https://code.webb.page/nevercease/uchu.git/about/documentation/FAQ.md)）
-   [flexoki](https://stephango.com/flexoki)（[CSS 文件](https://github.com/kepano/flexoki/blob/main/css/flexoki.css)）
-   [reasonable colours](https://www.reasonable.work/artifacts/ra005-reasonable-colors/)，似乎注重无障碍设计（[CSS 文件](https://github.com/matthewhowell/reasonable-colors/blob/master/reasonable-colors.css)）

### 更多调色板

-   [web awesome](https://webawesome.com/docs/color-palettes)
-   [radix](https://www.radix-ui.com/colors/docs/palette-composition/scales)
-   [美国网页设计系统](https://designsystem.digital.gov/design-tokens/color/system-tokens/)
-   [material design](https://m2.material.io/design/color/the-color-system.html)

### 配色方案生成器

大家还分享了不少调色板生成工具：

-   [harmonizer](https://harmonizer.evilmartians.com/)
-   [tints.dev](https://www.tints.dev/)
-   [coolors](https://coolors.co/)
-   [colorpalette.pro](https://colorpalette.pro/)

我一直觉得这类生成器太难用，但也许有一天我对色彩的理解会进步到能成功使用调色板生成器，所以还是把这些链接留在这里吧。

更多色彩工具：

-   [colorhexa](https://www.colorhexa.com/E97339) 提供色盲相关信息

# `oklch`

[用 CSS 生成色彩](https://gomakethings.com/generative-colors-with-css/) 展示了如何利用 CSS 的 `oklch` 函数动态生成颜色。
