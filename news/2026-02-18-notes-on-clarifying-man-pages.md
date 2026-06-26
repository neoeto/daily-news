---
title: Notes on clarifying man pages
url: 'https://jvns.ca/blog/2026/02/18/man-pages/'
url_hash: 383b837386282981aa122d2c366d23d8b6970aad
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-02-18T00:00:00.000Z
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
你好！在[去年花了一些时间研究 Git 手册页](https://jvns.ca/blog/2026/01/08/a-data-model-for-git/)之后，我一直在思考一个问题：怎样才算一个好的手册页。

我花了很多时间为一些工具（如 tcpdump、git、dig 等）编写速查表，而这些工具的主要文档就是手册页。之所以这样做，是因为我经常发现手册页难以快速找到我想要的信息。

最近我一直在想——手册页*本身*能不能包含一个超棒的速查表？怎样才能让手册页更容易使用？我对这个问题的思考还处于非常初期的阶段，但我想先记下一些零散的想法。

我在 [Mastodon 上问了一些人](https://social.jvns.ca/@b0rk/116092583707187579)他们最喜欢的手册页，下面是一些在这些手册页中看到的很有意思的例子。

### 选项摘要

如果你读过很多手册页，你可能在 `SYNOPSIS` 部分见过类似这样的内容：一旦你几乎列出了整个字母表，就会变得很难看

```
ls [-@ABCFGHILOPRSTUWabcdefghiklmnopqrstuvwxy1%,]

grep [-abcdDEFGHhIiJLlMmnOopqRSsUVvwXxZz]
```

[rsync 手册页](https://download.samba.org/pub/rsync/rsync.1)有一个我以前从未见过的解决方案：它的 SYNOPSIS 非常简洁，像这样：

```
 本地:
     rsync [选项...] 源... [目标]
```

然后有一个“选项摘要”部分，每个选项都有一行摘要，像这样：

```
--verbose, -v            增加详细程度
--info=FLAGS             细粒度信息详细程度
--debug=FLAGS            细粒度调试详细程度
--stderr=e|a|c           更改 stderr 输出模式（默认：errors）
--quiet, -q              抑制非错误消息
--no-motd                抑制守护进程模式下的 MOTD
```

后面再是通常的 OPTIONS 部分，对每个选项进行完整描述。

### 按类别组织的选项部分

[strace 手册页](https://man7.org/linux/man-pages/man1/strace.1.html) 按类别（如“通用”、“启动”、“跟踪”、“过滤”、“输出格式”）组织其选项，而不是按字母顺序。

作为实验，我尝试拿 `grep` 手册页，制作一个按类别分组的“选项摘要”部分，你可以[在这里看到结果](https://gist.github.com/jvns/9f5966633875a4758e0d947a5b4dbdcf)。我不确定我对结果怎么看，但这确实是个有趣的练习。在写的时候，我一直在想，我总记不住 `grep` 的 `-l` 选项叫什么名字。每次在手册页里找到它，我都感觉花了很长时间，我试图思考什么样的结构能让我更容易找到它。也许分类是个办法？

### 速查表

有几个人向我推荐了 Perl 手册页系列（`perlfunc`、`perlre` 等），我注意到的一个东西是 [man perlcheat](https://linux.die.net/man/1/perlcheat)，它有这样的速查表部分：

```
 语法
 foreach (列表) { }     for (a;b;c) { }
 while   (e) { }        until (e)   { }
 if      (e) { } elsif (e) { } else { }
 unless  (e) { } elsif (e) { } else { }
 given   (e) { when (e) {} default {} }
```

我觉得这太酷了，这让我想知道是否还有其他方法可以在手册页中编写紧凑的、80 字符宽的 ASCII 速查表。

### 示例非常受欢迎

常见的评论大意是“我喜欢任何带示例的手册页”。有人提到了OpenBSD的手册页，而[openbsd tail](https://man.openbsd.org/tail)手册页末尾就提供了我常用的两种tail用法的示例。

我见过最多的情况是手册页的示例部分放在末尾，但有些手册页（比如之前的[rsync手册页](https://download.samba.org/pub/rsync/rsync.1)）会把示例放在开头。我在编写[git-add](https://git-scm.com/docs/git-add)和[git rebase](https://git-scm.com/docs/git-rebase)手册页时，就在开头放了一个简短示例。

### 目录与章节间的链接

这并非手册页本身的特性，但终端中查看手册页的一个问题是难以了解它包含哪些章节。

在编写Git手册页时，我和Marie做的一件事是给Git网站上HTML版本手册页的侧边栏[添加目录](https://git-scm.com/docs/git-rebase)。

我还想在Git手册页的HTML版本中添加更多超链接，这样你可以点击“不兼容选项”直接跳转到对应章节。在Git项目中添加这类链接非常容易，因为Git的手册页是用AsciiDoc生成的。

我认为添加目录和内部超链接是一种不错的折中方案——既能改进手册页格式（至少是HTML版本），又无需维护完全不同的文档形式。不过要实现这一点，你需要搭建类似Git的AsciiDoc工具链。

如果能有一种通用系统，让人轻松查找手册页中的特定选项（比如“-a是做什么的？”），那就太棒了。我知道最好的技巧是用手册页阅读器搜索类似`^ *-a`的内容，但我总记不住这么做，最后只能遍历手册页中所有`-a`实例，直到找到目标内容。

### 每个选项的示例

[curl手册页](https://curl.se/docs/manpage.html)为每个选项都提供了示例，HTML版本还带有目录，方便你快速跳转到感兴趣的选项。

例如，`--cert`的示例能让你直观看到可能还需要传递`--key`选项，就像这样：

```
  curl --cert certfile --key keyfile https://example.com
```

他们的实现方式是：每个选项对应[一个文件](https://github.com/curl/curl/blob/dc08922a61efe546b318daf964514ffbf41583 25/docs/cmdline-opts/append.md)，文件中包含“示例”字段。

### 表格化数据格式

不少人说[man ascii](https://www.man7.org/linux/man-pages/man7/ascii.7.html)是他们最喜欢的手册页，它看起来是这样的：

```
 Oct   Dec   Hex   Char
 ───────────────────────────────────────────
 000   0     00    NUL '\0' (空字符)
 001   1     01    SOH (标题开始)
 002   2     02    STX (正文开始)
 003   3     03    ETX (正文结束)
 004   4     04    EOT (传输结束)
 005   5     05    ENQ (询问)
 006   6     06    ACK (确认)
 007   7     07    BEL '\a' (响铃)
 010   8     08    BS  '\b' (退格)
 011   9     09    HT  '\t' (水平制表符)
 012   10    0A    LF  '\n' (换行)
```

显然 `man ascii` 是一份不寻常的手册页，但我认为这份手册页的酷炫之处（除了它作为 ASCII 参考始终有用之外）在于，由于表格格式，你很容易快速扫描找到所需信息。这让我思考，是否还有更多机会在手册页中以“表格”形式展示信息，以便于快速浏览。

### GNU 的做法

当我谈论手册页时，经常有人提到 GNU coreutils 的手册页（例如 [man tail](https://man7.org/linux/man-pages/man1/tail.1.html)）没有示例，而 OpenBSD 的手册页则[包含示例](https://man.openbsd.org/tail)。

我不打算深入探讨这个问题，因为这似乎是一个颇具争议的话题，我肯定无法在此充分讨论，但我认为以下几点是事实：

-   GNU 项目更倾向于在“info”手册中维护文档，而不是手册页。[这个页面](https://www.gnu.org/software/coreutils/manual/coreutils.html)指出“手册页已不再维护”。
-   阅读“info”手册有三种方式：HTML 版本、在 Emacs 中阅读，或使用独立的 `info` 工具。我听说一些 Emacs 用户喜欢 Emacs 的 info 浏览器。但我从未遇到过使用独立 `info` 工具的人。
-   [tail 的 info 手册条目](https://www.gnu.org/software/coreutils/manual/html_node/tail-invocation.html)链接在手册页底部，并且其中包含示例。
-   FSF 曾经[出售](https://www.fsf.org/gnu-press) GNU 软件手册的印刷版书籍（也许他们[偶尔还会这样做](https://shop.fsf.org/)？）。

当复杂度达到一定程度后，手册页会变得难以导航：虽然我从未使用过 coreutils 的 info 手册，将来可能也不会，但我几乎肯定会更倾向于通过 HTML 文档来查阅 [GNU Bash 参考手册](https://www.gnu.org/software/bash/manual/bash.html)或 [GNU C 库参考手册](https://sourceware.org/glibc/manual/latest/html_mono/libc.html)，而不是通过手册页。

### 其他几个与手册页相关的内容

以下是一些我觉得有趣的工具：

-   [fish shell](https://fishshell.com/) 附带一个 [Python 脚本](https://github.com/fish-shell/fish-shell/blob/master/share/tools/create_manpage_completions.py)，用于从手册页自动生成 Tab 补全。
-   [tldr.sh](https://tldr.sh) 是一个由社区维护的示例数据库，例如你可以运行 `tldr grep`。很多人告诉我他们觉得它很有用。
-   [Dash](https://kapeli.com/dash) Mac 文档浏览器内置了不错的手册页查看器。我仍然使用终端手册页查看器，但我喜欢它包含目录，看起来像这样：

![](https://jvns.ca/images/dash.webp)

### 思考受限格式是件有趣的事

man pages 的格式限制非常严格，思考在如此有限的排版选项中能做什么，其实挺有意思的。

尽管我非常喜欢写作，但一直有个坏习惯——从不读文档，所以对我来说，要判断自己到底觉得 man pages 里什么内容有用，其实有点难。我不太确定这篇文章里提到的大部分改进，是否真的能提升我的使用体验。（不过示例除外，我超爱示例！）

所以我很想听听，你觉得还有哪些 man pages 设计得很好，以及你喜欢它们的哪些地方。[评论区在这里](https://comments.jvns.ca/post/116093529820975727)。
