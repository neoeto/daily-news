---
title: 'Moving away from Tailwind, and learning to structure my CSS'
url: >-
  https://jvns.ca/blog/2026/05/15/moving-away-from-tailwind--and-learning-to-structure-my-css-/
url_hash: f11ba7bcf0b5251f7cb2eed01f52dcb1f2c36400
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-05-15T00:00:00.000Z
lang: zh
translated: true
tags:
  - CSS
  - 前端
  - Tailwind
  - 语义化HTML
  - 代码组织
original_lang: en
truncated: false
---
你好！8年前，我[兴奋地写下了发现 Tailwind 的经历](https://jvns.ca/blog/2018/11/01/tailwind--write-css-without-the-css/)。

那时我真的不知道如何组织我的 CSS 代码，在完全混乱的代码堆和 Tailwind 之间做选择时，我非常乐意选择 Tailwind。它帮我创建了很多小网站！

最近一周左右，我把几个网站从 Tailwind 迁移到了更语义化的 HTML + 原生 CSS，这个过程非常有趣且引人深思，以下是我学到的一些东西！

和往常一样，我不是全职前端开发者，所以我的 CSS 学习多年来一直是断断续续的。

### 原来 Tailwind 教会了我很多

当我开始思考如何组织 CSS 时，起初感到有些畏惧：我不太擅长组织 CSS！但后来我读了一些关于如何组织 CSS 的博客文章（比如 [A whole cascade of layers](https://www.miriamsuzanne.com/2022/09/06/layers/) 或 [How I write CSS in 2024](https://jacobb.nyc/writing/how-i-write-css-in-2024)），我意识到几件事：

1.  每个 CSS 代码库都包含多种不同的内容（布局！字体！颜色！通用组件！）
2.  拥有系统或指南来管理这些内容非常有用，否则一切会陷入混乱
3.  Tailwind 为其中一些内容提供了系统，而我已经熟悉这些系统！也许我可以模仿我喜欢的系统！

例如，Tailwind 有：

-   一个重置样式表
-   一个[颜色调色板](https://jvns.ca/blog/2026/05/04/css-colour-palettes/)
-   一个[字体比例](https://v2.tailwindcss.com/docs/font-size)

### 我将讨论的系统

我将谈谈我的 CSS 代码库的几个方面，以及到目前为止我对每个方面想要施加的规则的想法。有些是从 Tailwind 借鉴的，有些则不是。

1.  重置
2.  组件
3.  颜色
4.  字体大小
5.  工具类
6.  基础样式
7.  间距
8.  响应式设计
9.  构建系统

### 1. 重置

我直接复制了 Tailwind 的“[预检样式](https://v2.tailwindcss.com/docs/preflight)”，方法是进入 `tailwind.css` 并复制前 200 行左右。

我注意到，随着时间的推移，我与 Tailwind 的 CSS 重置建立了某种关系，例如 Tailwind 在每个元素上设置了 `box-sizing: border-box`（这意味着元素的宽度包括其内边距）：

```
* { box-sizing: border-box; }
```

我认为如果不用这些重置来写 CSS，对我来说会是一个真正的调整，而且我确信 Tailwind 重置中还有很多其他内容（比如 `html {line-height: 1.5;}`）是我潜意识里习惯的，甚至都没意识到它们的存在。

### 2. 组件

接下来这部分是 CSS 的主体！

这里的想法是按“组件”来组织 CSS，这种方式在精神上与 Vue 或 React 组件相关（尽管网站可能实际上没有任何 JavaScript）。

基本上，思路是：

1.  每个“组件”都有一个唯一的类名
2.  一个组件的 CSS 永远不会覆盖其他组件的 CSS
3.  每个组件都有自己的 CSS 文件

因此，编辑一个组件的 CSS 不会莫名其妙地破坏另一个组件。而且，我实际想要修改的 CSS 中大概有 80% 都分布在各个组件文件中，所以如果我正在编辑一个 100 行的组件，我只需要考虑这 100 行代码。对我来说，这样思考要容易得多。

例如，这个 HTML 可能就是 `.zine` “组件”。

```
<figure class="zine horizontal">
    <img src="whatever.jpg">
</figure>
```

而 CSS 看起来像这样，使用了嵌套选择器：

```
.zine {
  ...
  &.horizontal {
    ...
  }
  &.vertical {
    ...
  }
  &:hover {
    ...
  }
}
```

我并没有做任何程序化的事情（比如 Web 组件或 [@scope](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope)）来确保组件之间不会相互干扰，但仅仅建立一个约定并尽力遵守，就已经感觉是一个很大的改进了。

接下来：建立一些约定，以保持整个网站的一致性，并让这些组件彼此协调！

### 3\. 颜色

`colours.css` 中有许多这样的变量，我可以根据需要随时使用。颜色真的很难处理，而且我不想在这次重构中重新审视我对颜色的使用，所以我就保持原样了。

我在这里试图强制执行的唯一准则是：网站中使用的所有颜色都必须列在这个文件中。

```
:root {
  --pink: #fea0c2;
  --pink-light: #F9B9B9;
  --red: #f91a55;
  --orange: rgb(222, 117, 31);
  ...
}
```

### 4\. 字体大小

我欣赏 Tailwind 的一点是，如果我想设置字体大小，我只需要想“嗯，我希望这段文字大一点”，然后写下 `text-lg` 就搞定了！如果还不够大，我可能会改用 `xl` 或 `2xl`。再也不用费心去记我到底用的是 `em`、`px` 还是 `rem` 了。

所以我从 Tailwind 中借鉴并定义了一系列变量，就像这样：

```
  --size-xs: 0.75rem;
  --line-height-xs: 1rem;

--size-sm: 0.875rem;
  --line-height-sm: 1.25rem;
```

然后，如果我想设置字体大小，可以像这样操作。虽然比 Tailwind 稍微冗长一些，但我目前对此很满意。

```
h3 {
  font-size: var(--size-lg);
  line-height: var(--line-height-lg);
}
```

### 5\. 工具类

有些东西，比如按钮，会出现在许多不同的组件中。我称它们为“工具类”。

我从 Tailwind 复制了一些工具类（比如 `.sr-only`，用于那些只应该被屏幕阅读器用户看到的内容）。

这一部分非常小，我会非常小心地对其进行修改。

### 6\. 基础样式

“基础”样式是我自己选择的、适用于整个网站的样式。我必须让这一部分保持非常精简，因为我没有足够的信心在整个网站强制应用大量样式。目前，我觉得只有以下这两个是合适的，而且我可能会更改 `<section>` 的那个：

```
/* 在每个 <section> 中间放置一个 950px 宽的列 */
section {
  --inner-width: 950px;
  padding: 3rem max(1rem, (100% - var(--inner-width))/2);
}

a {
  color: var(--orange);
}
```

我认为对于基础样式来说，自下而上地工作对我来说是最容易的——首先在基础样式中几乎什么都不放，然后当我发现想要统一的常见样式时，再把一些样式从组件移到基础样式中。

### 7\. 间距

我还没有完全想好管理内边距和外边距的方法。不过，我肯定比在 Tailwind 中更有原则，在 Tailwind 中我只是随意地在各处添加内边距和外边距，直到看起来符合我的要求。

目前，我正努力让外层布局组件尽可能多地负责间距。例如，如果我有一个 `<section>`，里面有一堆子元素，我希望它们之间有间距，我可能会这样使用来均匀地分隔子元素：

```
section > *+* {
  margin-top: 1rem;
}
```

一些灵感博客文章：

-   [猫头鹰选择器](https://piccalil.li/blog/my-favourite-3-lines-of-css/)
-   [“无外边距”](https://kyleshevlin.com/no-outer-margin/)

### 8\. 响应式设计：多用网格！

我在 Tailwind 中做响应式设计的方式是使用大量媒体查询。Tailwind 有 `md:text-xl` 这种语法，意思是“在 `md` 或更大尺寸时应用 `text-xl` 样式”。

现在我尝试一种非常不同的方法，即制作更灵活的 CSS 网格布局，不需要那么多断点。这很难，但了解网格能做什么真的很有趣，而且这是一个我认为在 Tailwind 中无法实现的好例子。

例如，我一直在学习如何使用 `auto-fit` 在大屏幕上自动使用两列，在小屏幕上使用一列，就像这样：

```
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), max-content));
  justify-content: center;
```

我还大量使用了 [`grid-template-areas`](https://wizardzines.com/comics/css-grid-areas/)，这是一个很棒的功能，我认为在 Tailwind 中无法使用。

一些灵感：

-   [无需媒体查询的响应式网格布局](https://css-tricks.com/a-responsive-grid-layout-with-no-media-queries/) 来自 CSS Tricks

### 9\. 构建系统：esbuild

在开发中，我不需要构建系统：CSS 现在既有内置的导入语句，像这样：

```
@import "reset.css";
@import "typography.css";
@import "colors.css";
```

也有内置的嵌套选择器，像这样：

```
.page {
  h2 { ...}
}
```

如果需要，我可以使用 `esbuild` 来打包 CSS 文件用于生产环境。看起来像这样：

```
esbuild style.css --bundle --loader:.svg=dataurl  --loader:.woff2=file --outfile=/tmp/out.css
```

尽管我通常避免使用 CSS 和 JS 构建系统，但我并不介意使用 esbuild（我在 [2021 年写过关于它的文章](https://jvns.ca/blog/2021/11/15/esbuild-vue/)），因为它基于 Web 标准，并且是一个静态的 Go 二进制文件。

### 为什么要迁移离开 Tailwind？

有几个人问我为什么要迁移离开 Tailwind。有几个因素促成了这个决定：

-   自2018年以来，Tailwind 对构建系统的依赖程度大幅增加。我认为如果不使用构建系统，几乎不可能使用较新版本的 Tailwind。因此，多年来我一直坚持使用 Tailwind v2。（此外，似乎还有 [litewind](https://litewindcss.com/) 这个选择。）
-   虽然官方一直建议将 Tailwind 与构建系统配合使用，但我从未真正遵循过。因此，我的许多项目中都包含 2.8MB 的 `tailwind.min.css` 文件（gzip 压缩后为 270K），这让我觉得有点滑稽。
-   与刚开始使用 Tailwind 时相比，我现在对 CSS 的掌握程度高了很多。
-   归根结底，Tailwind 存在局限性：如果你想在 CSS 中实现一些“特殊效果”，Tailwind 并不总能满足需求。这些限制有时非常有用（这篇文章很大一部分内容就是关于我如何重新实现 Tailwind 的部分限制！），但到了现在，我更希望能自由选择。
-   我最终创建了一些在同一个项目中混合使用原生 CSS 和 Tailwind 的网站，维护起来非常痛苦。
-   我开始好奇编写更具语义化的 HTML 会是什么感觉。

### 我感兴趣的一些 CSS 特性

在这个过程中，我了解了许多之前未曾使用但未来想学习的 CSS 特性：

-   `@layer`（参考文章：[层叠中的层级全解析](https://www.miriamsuzanne.com/2022/09/06/layers/)）
-   [@scope](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/At-rules/@scope)（特别是[规范中关于如何在“组件”CSS 设计中使用 @scope 的示例！](https://drafts.csswg.org/css-cascade-6/#example-463550a5)）
-   [容器查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Containment/Container_queries)
-   [子网格](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Grid_layout/Subgrid)

### 我放弃 Tailwind 的最后一个原因

在这篇文章中，我一直在谈论从 Tailwind 中学到的东西，这些都是事实。

但三年前我读到一篇名为《Tailwind 与 CSS 的柔性之美》的文章（[原文链接](https://thoughtbot.com/blog/tailwind-and-the-femininity-of-css)），它一直让我难以忘怀。说实话，我最初对 CSS 的态度可能就像那篇文章描述的那样：

> 他们听说 CSS 很简单，就以为它很容易。但实际使用时却发现行不通。他们认为是这门语言的问题，因为他们知道自己很聪明，而 CSS 本该是简单的。

但在过去十年里，我学会了真正热爱并尊重 CSS 这门技术。

因此，多年前我就决定：与其抱怨“CSS 很难”，不如努力提升 CSS 技能，认真对待这门技术，而不是贬低它。这个转变改变了一切：我意识到许多曾经的困扰（比如“居中根本做不到”）其实早已在 CSS 中得到解决，而且“居中”的含义本身并不总是直截了当，存在多种实现方式也是合理的。CSS 之所以难，是因为它在解决一个本身就复杂的问题！

过去10到15年间新增的CSS特性（其中一些我在本文中讨论过！）让我印象深刻，它们让CSS的使用变得更加便捷，而花时间提升CSS技能也成了一段非常酷的经历。

那篇文章让我觉得Tailwind助长了CSS专业知识的贬值，而我不希望成为其中的一部分——即便Tailwind对我个人而言是个有用的工具。尤其是在这个LLM时代，重视人类专业知识比以往任何时候都更重要。

另一篇影响我的批评Tailwind的博客文章：

-   [《经典摇滚、马里奥赛车，以及为何我们无法就Tailwind达成共识》](https://joshcollinsworth.com/blog/tailwind-is-smart-steering)

### 暂时就这些！

感谢[Melody Starling](https://melody.dev/)，她最初设计并编写了[wizardzines.com](https://wizardzines.com)的CSS代码，这个网站所有酷炫有趣的部分都归功于Melody。

此外，在撰写本文的过程中，我阅读了大量关于CSS的优秀博客文章（来自[CSS Tricks](https://css-tricks.com/)、[Smashing Magazine](https://www.smashingmagazine.com/)等），我已尽量在文中附上相关链接，衷心感谢CSS社区中各位分享实践经验的同仁。
