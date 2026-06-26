---
title: 'New zine: The Secret Rules of the Terminal'
url: 'https://jvns.ca/blog/2025/06/24/new-zine--the-secret-rules-of-the-terminal/'
url_hash: d249672a7d9371c01637557fd3e88d19e665a21c
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2025-06-26T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
你好！在花了数月时间撰写关于终端的深度技术博客之后，本周二我发布了一本新杂志，名为《终端的秘密规则》！

你可以花12美元在这里购买：[https://wizardzines.com/zines/terminal](https://wizardzines.com/zines/terminal)，或者在这里获取[我所有杂志的15本套装](https://wizardzines.com/zines/all-the-zines/)。

这是封面：

[![](https://jvns.ca/images/terminal-cover-small.jpg)](https://wizardzines.com/zines/terminal)

### 目录

以下是目录：

[![](https://jvns.ca/images/terminal-toc-small.png)](https://wizardzines.com/zines/terminal/toc.png)

### 为什么是终端？

我每天使用终端已有20年，尽管对终端非常自信，但总有一种不安的感觉。通常一切正常，但有时出现问题，调查起来似乎不可能，或者至少会打开一个巨大的麻烦盒子。

于是我开始尝试列出在终端中遇到的各种奇怪问题，并意识到终端存在许多微小的不一致性，例如：

-   有时你可以用箭头键移动，但有时按箭头键只会打印出`^[[D`
-   有时你可以用鼠标选择文本，但有时不行
-   有时运行命令时会被保存到历史记录，有时却不会
-   有些shell允许你用上箭头查看上一条命令，有些则不行

如果你每天使用终端长达10年或20年，即使不完全理解这些现象发生的*原因*，你也很可能建立起一种直觉。

但拥有直觉并不等同于理解它们为何发生。在编写这本杂志时，我实际上做了大量工作，才弄清楚终端中究竟*发生*了什么，以便能够讨论如何推理这些问题。

### 这些规则没有写在任何地方

事实证明，关于终端如何工作的“规则”（如何编辑输入的命令？如何退出程序？如何修复颜色？）极难完全理解，因为“终端”实际上由许多不同的软件组件组成（你的终端模拟器、操作系统、shell、像`grep`这样的核心工具，以及你安装的其他各种随机终端程序），这些组件由不同的人编写，他们对事情应该如何工作有着不同的想法。

所以我想写一些内容来解释：

-   终端的四个部分（你的shell、终端模拟器、程序和TTY驱动）如何协同工作
-   一些核心惯例，让你了解终端中事物通常如何运作
-   大量关于如何使用终端程序的技巧和窍门

### 这本杂志解释了终端内部最实用的部分

终端内部机制一团糟。很多现状之所以如此，只是因为有人在80年代做了个决定，如今已无法改变。老实说，我认为学习终端内部的所有知识并不值得。

但有些部分并不难理解，却能真正改善你在终端中的体验，比如：

-   如果你理解**你的 shell** 负责什么，就可以配置 shell（或换用不同的 shell！），更轻松地访问历史记录、获得出色的 Tab 补全功能，以及更多好处。
-   如果你理解**转义码**，当 `cat` 一个二进制文件到标准输出导致终端混乱时，就不会那么害怕，只需输入 `reset` 即可继续。
-   如果你理解**颜色**的工作原理，就可以消除终端中糟糕的颜色对比度，从而真正看清文本。

### 写这本小册子让我学到了很多意想不到的东西

当我写 [Git 的工作原理](https://wizardzines.com/zines/git) 时，我以为自己已经了解了 Git 的工作方式，事实也确实如此。但终端则不同。尽管我对终端充满信心，尽管我已经每天使用它 20 年，但我对终端的工作原理仍有很多误解。而且（除非你是 `tmux` 的作者之类的人），我认为你也很可能如此。

我学到的一些对我实际有用的东西：

-   我更好地理解了终端的结构，因此在调试遇到的奇怪终端问题时更有信心（我甚至能够为 fish 提出一个[小改进](https://github.com/fish-shell/fish-shell/issues/10834)！）。准确识别是哪个软件导致终端出现奇怪现象仍然不*容易*，但我现在比以前擅长多了。
-   你可以编写一个 shell 脚本，通过 SSH [复制到剪贴板](https://jvns.ca/til/vim-osc52/)。
-   `reset` 在底层是如何工作的（它相当于执行 `stty sane; sleep 1; tput reset`）——基本上我学到的是，我永远不需要担心记住 `stty sane` 或 `tput reset`，只需运行 `reset` 即可。
-   如何查看程序打印出的不可见转义码（运行 `unbuffer program > out; less out`）。
-   为什么我的 Mac 上像 `sqlite3` 这样的内置 REPL 用起来这么烦人（它们使用 `libedit` 而不是 `readline`）。

### 我沿途写的博客文章

和最近一样，我写了一系列关于各种支线任务的博客文章：

-   [如何将目录添加到 PATH](https://jvns.ca/blog/2025/02/13/how-to-add-a-directory-to-your-path/)
-   [终端问题遵循的“规则”](https://jvns.ca/blog/2024/11/26/terminal-rules/)
-   [管道有时为何会“卡住”：缓冲问题](https://jvns.ca/blog/2024/11/29/why-pipes-get-stuck-buffering/)
-   [一些终端使用中的烦恼](https://jvns.ca/blog/2025/02/05/some-terminal-frustrations/)
-   [终端中的 ASCII 控制字符](https://jvns.ca/blog/2024/10/31/ascii-control-characters/) 关于“Ctrl+A、Ctrl+B、Ctrl+C 等到底是怎么回事？”
-   [在终端中输入文本很复杂](https://jvns.ca/blog/2024/07/08/readline/)
-   [打造“现代”终端设置涉及哪些方面？](https://jvns.ca/blog/2025/01/11/getting-a-modern-terminal-setup/)
-   [使用 Shell 作业控制的理由](https://jvns.ca/blog/2024/07/03/reasons-to-use-job-control/)
-   [ANSI 转义码标准](https://jvns.ca/blog/2025/03/07/escape-code-standards/)，这实际上是我在尝试弄清楚 `terminfo` 数据库如今是否仍能很好地为我们服务

### 参与本 zine 制作的人员

很久以前，我大多独自编写 zine，但每个项目我都获得了越来越多的帮助。从九月到六月，我每个工作日都与 [Marie Claire LeBlanc Flanagan](https://marieflanagan.com) 会面，共同完成这个项目。

封面由 Vladimir Kašiković 设计，Lesley Trites 负责文字编辑，Simon Tatham（[PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/) 的作者）进行了技术审阅，我们的运营经理 Lee 负责转录以及无数其他事务，而 [Jesse Luehrs](https://github.com/doy)（我认识的极少数真正理解终端内部复杂机制的人之一）与我进行了无数次极有价值的对话，探讨终端内部的工作原理。

### 获取 zine

以下是一些再次获取 zine 的链接：

-   获取《终端的秘密规则》[The Secret Rules of the Terminal](https://wizardzines.com/zines/terminal)
-   在此获取我的 [15 本 zine 合集包](https://wizardzines.com/zines/all-the-zines/)

一如既往，你可以选择在家打印的 PDF 版本，或邮寄到家的印刷版。唯一需要注意的是，印刷订单将在 **八月** 发货——我需要等待订单量来确定印刷数量，然后再发送给印刷厂。
