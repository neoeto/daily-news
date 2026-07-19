---
title: Standards for ANSI escape codes
url: 'https://jvns.ca/blog/2025/03/07/escape-code-standards/'
url_hash: 0888cc366071aa5494e39801bc0bf61b3d064889
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2025-03-07T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - Rust
  - 创业
original_lang: en
truncated: false
---
你好！今天我想聊聊 ANSI 转义码。

很长一段时间里，我对 ANSI 转义码只有模糊的认识（“就是那种能让终端文字变红的东西”），但完全不清楚它们究竟在哪里定义，有没有相关标准。我对它们总有种“前方有龙”的隐约不安感。今年在学习终端相关知识的过程中，我了解到：

1.  ANSI 转义码为终端带来了大量易用性改进（你知道吗？通过 SSH 连接到远程机器时，有一种方法可以把内容复制到系统剪贴板！它就是一个叫 [OSC 52](https://jvns.ca/til/vim-osc52/) 的转义码！）
2.  它们并非完全标准化，因此有时并不可靠。而且由于它们不可见，排查转义码问题极其令人沮丧。

所以我打算为自己整理一份关于转义码现有标准的清单，因为我想知道：它们是否注定要让人感觉不可靠且沮丧，还是说未来我们有可能更放心地依赖它们？

-   [什么是转义码？](#什么是转义码)
-   [ECMA-48](#ecma-48)
-   [xterm 控制序列](#xterm-控制序列)
-   [terminfo](#terminfo)
-   [程序应该使用 terminfo 吗？](#程序应该使用-terminfo-吗)
-   [是否存在“单一通用集合”的转义码？](#是否存在单一通用集合的转义码)
-   [使用 terminfo 的一些理由](#使用-terminfo-的一些理由)
-   [更多文档/标准](#更多文档标准)
-   [为什么我觉得这很有趣](#为什么我觉得这很有趣)

### 什么是转义码？

你有没有在终端里按过左箭头键，然后看到 `^[[D`？这就是一个转义码！它被称为“转义码”，因为第一个字符是“转义”字符，通常写作 `ESC`、`\x1b`、`\E`、`\033` 或 `^[`。

转义码是终端模拟器与其中运行的程序之间传递各种信息（颜色、鼠标移动等）的方式。转义码分为两种：

1.  **输入码**：终端模拟器为那些无法用 Unicode 表示的按键或鼠标移动发送的代码。例如，“左箭头键”是 `ESC[D`，“Ctrl+左箭头”可能是 `ESC[1;5D`，点击鼠标则可能是 `ESC[M :3`。
2.  **输出码**：程序可以打印这些代码来给文字着色、移动光标、清屏、隐藏光标、复制文本到剪贴板、启用鼠标报告、设置窗口标题等。

现在我们来聊聊标准！

### ECMA-48

我找到的第一个与转义码相关的标准是 [ECMA-48](https://ecma-international.org/wp-content/uploads/ECMA-48_5th_edition_june_1991.pdf)，它最初于 1976 年发布。

ECMA-48 做了两件事：

1.  定义了一些转义码的通用**格式**（比如“CSI”码，即 `ESC[` + 某些内容；以及“OSC”码，即 `ESC]` + 某些内容）
2.  定义了一些具体的转义码，例如“光标左移”是 `ESC[D`，或者“文字变红”是 `ESC[31m`。在规范中，“光标左移”被称为 `CURSOR LEFT`，而改变颜色的那个被称为 `SELECT GRAPHIC RENDITION`。

这些格式是可扩展的，因此未来其他人可以定义更多的转义码。如今流行的许多转义码并未在 ECMA-48 中定义：例如，终端应用程序（如 vim、htop 或 tmux）支持鼠标操作非常常见，但 ECMA-48 并未定义鼠标相关的转义码。

### xterm 控制序列

有许多转义码并未在 ECMA-48 中定义，例如：

-   启用鼠标报告（你在终端中点击了哪里？）
-   括号粘贴（你是粘贴了那段文本还是手动输入的？）
-   OSC 52（终端应用程序可用它来将文本复制到系统剪贴板）

我认为（如果我错了请指正！）这些以及其他一些转义码源自 xterm，记录在 [XTerm 控制序列](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html) 中，并且已被其他终端模拟器广泛实现。

这份“xterm 支持的内容”列表严格来说并非标准，但 xterm 极具影响力，因此它似乎是一份重要的文档。

### terminfo

在 80 年代（某种程度上今天依然如此，但据我所知，80 年代的情况要严重得多），终端实际支持的转义码存在巨大差异。

为了解决这个问题，有一个名为“terminfo”的数据库，记录了各种终端的转义码。

terminfo 的标准似乎被称为 [X/Open Curses](https://publications.opengroup.org/c243-1)，但出于某种原因，你需要创建一个账户才能查看该标准。它定义了数据库格式以及用于访问数据库的 C 库接口（“curses”）。

例如，你可以运行以下 bash 片段，查看系统已知的所有不同终端中“清屏”对应的每个可能转义码：

```
for term in $(toe -a | awk '{print $1}')
do
  echo $term
  infocmp -1 -T "$term" 2>/dev/null | grep 'clear=' | sed 's/clear=//g;s/,//g'
done
```

在我的系统上（可能也包括我用过的所有系统？），terminfo 数据库由 ncurses 管理。

### 程序应该使用 terminfo 吗？

我认为有趣的是，应用程序处理 ANSI 转义码主要有两种方法：

1.  使用 terminfo 数据库，根据 `TERM` 环境变量的内容来确定使用哪些转义码。例如，Fish 就采用这种方法。
2.  确定一个“单一通用集合”的转义码，这些转义码在“足够多”的终端模拟器中有效，然后直接硬编码这些转义码。

一些采用方法 #2（“不使用 terminfo”）的程序/库示例包括：

-   [kakoune](https://github.com/mawww/kakoune/commit/c12699d2e9c2806d6ed184032078d0b84a3370bb)
-   [python-prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit/blob/165258d2f3ae594b50f16c7b50ffb06627476269/src/prompt_toolkit/input/ansi_escape_sequences.py#L5-L8)
-   [linenoise](https://github.com/antirez/linenoise)
-   [libvaxis](https://github.com/rockorager/libvaxis)
-   [chalk](https://github.com/chalk/chalk)

我很好奇为什么人们可能正在远离 terminfo，然后我发现了这篇非常有趣且极其详细的 [来自一位 Fish 维护者的关于 terminfo 的吐槽](https://twoot.site/@bean/113056942625234032)，其中认为：

> [terminfo 的作者们] 做了大量在当时极其重要且有益的工作。我的观点是，它现在已经不再如此了。

我无法充分传达其内容，所以就不总结了，我认为它值得一读。

### 是否存在一套“通用”的转义码？

我刚刚在讨论一个想法：你可以使用一套“通用”的转义码，这对大多数人来说都能用。但这一套到底是什么？有没有什么共识？

我其实完全不知道答案，但通过一些阅读，看起来它可能是以下内容的某种组合：

-   VT100 支持的转义码（尽管有些在现代终端上已不相关）
-   ECMA-48 中的内容（我觉得其中也有一些不再相关的东西）
-   xterm 支持的内容（不过我猜其中并非所有内容都得到了足够广泛的支持）

也许最终的做法是“确定你认为用户最常用的终端模拟器，然后在这些模拟器中进行测试”，就像 Web 开发者在决定哪些 CSS 特性可以安全使用时所做的那样。

不过，我认为目前还没有像 [Can I use…?](https://caniuse.com/) 或 [Baseline](https://web-platform-dx.github.io/web-features/) 这样的资源适用于终端。（理论上，terminfo 应该充当终端的“caniuse”，但似乎当人们发明新终端特性时，往往需要 10 年以上才能将其加入 terminfo，这使得它的作用非常有限）

### 使用 terminfo 的一些理由

我还在 Mastodon 上询问为什么在 2025 年人们仍然认为 terminfo 有价值，得到了一些我觉得有道理的理由：

-   有些人希望能够通过 `TERM` 环境变量来控制程序的行为（例如使用 `TERM=dumb`），而在后 terminfo 时代，并没有关于这种机制应该如何工作的标准
-   尽管终端模拟器之间的差异比 80 年代要*小*，但远非为零：有图形终端、Linux 帧缓冲控制台、通过串口控制台连接服务器时的场景、Emacs shell 模式，可能还有我遗漏的其他情况
-   对于什么是“通用”转义码，并没有统一的标准，有时程序会使用实际上并未得到足够广泛支持的转义码

### terminfo 与用户代理检测

ncurses 使用 `TERM` 环境变量来决定使用哪些转义码的方式，让我想起了 Web 服务器有时会通过浏览器用户代理来决定提供哪个版本的网站。

看起来它也产生了类似的结果——iTerm2 将自己报告为“xterm-256color”的方式，与 Safari 的用户代理是“Mozilla/5.0 (Macintosh; Intel Mac OS X 14\_7\_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15”颇为相似。在这两种情况下，终端模拟器/浏览器最终都会修改自己的用户代理，以绕过那些运行不佳的用户代理检测。

在网络上，我们最终认定用户代理检测并非良策，转而专注于标准化，以便为所有浏览器提供相同的HTML/CSS。不过，我不确定同样的方法是否适用于终端的未来——我认为如今的终端生态比当年的网络更加碎片化，且资金支持也远不如网络。

### 更多文档/标准

以下是一些与转义码相关的文档和标准，排名不分先后：

-   [Linux console_codes 手册页](https://man7.org/linux/man-pages/man4/console_codes.4.html) 记录了Linux支持的转义码
-   [VT 100](https://vt100.net/docs/vt100-ug/chapter3.html) 如何处理转义码与控制序列
-   [kitty键盘协议](https://sw.kovidgoyal.net/kitty/keyboard-protocol/)
-   [OSC 8](https://gist.github.com/egmontkob/eb114294efbcd5adb1944c9f3cb5feda) 用于终端中的链接（以及[采用情况](https://github.com/Alhadis/OSC8-Adoption?tab=readme-ov-file)说明）
-   [来自tmux的ANSI标准摘要](https://github.com/tmux/tmux/blob/882fb4d295deb3e4b803eb444915763305114e4f/tools/ansicode.txt)
-   [iTerm的终端功能报告规范](https://iterm2.com/feature-reporting/)
-   sixel图形

### 为何我觉得这很有趣

我有时会看到有人说Unix终端“过时了”，而由于我非常热爱终端，我总好奇哪些渐进式的改变能让它显得不那么“过时”。

或许，如果我们拥有更清晰的标准体系（就像网络那样！），终端模拟器开发者就能更轻松地构建新功能，终端应用程序的作者也能更自信地采用这些功能，从而让我们所有人都能从中受益，在终端中获得更丰富的体验。

显然，标准化ANSI转义码并非易事（ECMA-48首次发布已近50年，我们仍未完全实现！）。我甚至不清楚所有挑战是什么。但HTML/CSS/JS的情况曾经也极其糟糕，如今却已大为改观，所以或许还是有希望的。
