---
title: Examples for the tcpdump and dig man pages
url: 'https://jvns.ca/blog/2026/03/10/examples-for-the-tcpdump-and-dig-man-pages/'
url_hash: 0c49abdb7f38d088c06476db0716e5b4da603b3b
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-03-10T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
你好！上个月我[对 man 手册的一些思考](https://jvns.ca/blog/2026/02/18/man-pages/)中，最大的收获是 man 手册里的示例非常棒，于是我为两个我最喜欢的工具的手册添加（或改进了）示例。

以下是成果：

-   [dig 手册（现已包含示例）](https://bind9.readthedocs.io/en/stable/manpages.html#dig-dns-lookup-utility)
-   [tcpdump 手册示例](https://www.tcpdump.org/manpages/tcpdump.1.html#lbAF)（这是对之前示例的更新）

### 目标：包含最基础的示例

这里的目标其实很简单，就是为那些不常用 tcpdump 或 dig（或者从未用过！）且不记得其用法的人，提供最基础的使用示例。

到目前为止，提出“嘿，我想为这个工具的初学者和不常用用户写一个示例章节”这个想法，效果非常好。这个想法很容易解释，而且从我听到的用户对 man 手册的期望来看，我觉得它很有道理，维护者似乎也觉得很有吸引力。

感谢 Denis Ovsienko、Guy Harris、Ondřej Surý 以及所有审阅文档修改的人，这是一次很好的经历，也激励我在 man 手册上再多下点功夫。

### 为什么要改进 man 手册？

我现在之所以致力于改进工具的官方文档，是因为：

-   Man 手册实际上可以做到接近 100% 的信息准确！通过审阅流程来确保信息真实可靠，这非常有价值。
-   即使是像“最常用的 tcpdump 标志有哪些”这样的基本问题，维护者通常也知道一些我不知道的有用功能！例如，在改进这些 tcpdump 示例时，我了解到如果你用 `tcpdump -w out.pcap` 将数据包保存到文件，加上 `-v` 参数可以实时打印已捕获数据包数量的摘要。这真的很有用，我之前不知道，而且我觉得自己永远也不会注意到这一点。

这对我来说有点奇怪，因为老实说，我总以为文档会很难读，通常我会直接跳过，去看博客文章、Stack Overflow 评论，或者直接问朋友。但现在我比较乐观，觉得也许文档不一定要那么糟糕？也许它可以和读一篇很棒的博客文章一样好，而且还额外具有准确无误的优点？我最近一直在用 Django 的文档，它真的很好！我们拭目以待吧。

### 关于避免学习 man 手册的语言

`tcpdump` 项目的 man 手册是[用 roff 语言编写的](https://raw.githubusercontent.com/the-tcpdump-group/tcpdump/refs/heads/master/tcpdump.1.in)，这种语言有点难用，而且我实在不想去学它。

我通过编写一个[非常基础的 markdown-to-roff 脚本](https://gist.github.com/jvns/a31036bf70f0675811b1b2a86b122aeb)来处理这个问题，将 Markdown 转换为 roff，使用的约定与手册页原有的类似。或许我本可以直接用 pandoc，但 pandoc 生成的输出看起来差异很大，所以我觉得自己写个脚本可能更好。谁知道呢。

不过，我觉得能直接利用现有 Markdown 库解析 Markdown AST 的能力，然后实现自己的代码生成方法来格式化内容，使其在这个上下文中显得合理，这确实很酷。

### 手册页很复杂

我深入研究了 `roff` 的历史，了解了它自 70 年代以来的演变过程，以及如今谁在维护它——这源于我了解到 BSD 系统（以及一些 Linux 系统，还有我认为的 macOS）用于格式化手册页的 [mandoc](https://mandoc.bsd.lv/) 项目。今天我就不多说了，或许改天再聊。

总的来说，BSD 和 Linux 在文档工作方式上似乎存在一种技术和文化上的分歧，我至今仍未完全理解，但我一直对 BSD 世界的情况感到好奇。

[评论区在此](https://comments.jvns.ca/post/116206906990442943)。
