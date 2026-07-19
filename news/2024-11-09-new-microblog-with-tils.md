---
title: New microblog with TILs
url: 'https://jvns.ca/blog/2024/11/09/new-microblog/'
url_hash: ae09b64490f31e1ea686da642945b3042a73bd52
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2024-11-09T09:24:29.000Z
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
几周前，我给这个网站新增了一个栏目，叫 [TIL](https://jvns.ca/til/)（“今日所学”）。

### 目标：保存我在社交媒体上分享的有趣工具和知识

我喜欢在 Mastodon/Bluesky 上发类似“嘿，有个很酷的东西”的内容，比如 [超好用的 SQLite REPL 工具 litecli](https://github.com/dbcli/litecli)，或者 Go 语言交叉编译“开箱即用”的惊人特性，还有 [加密领域的正确选择](https://www.latacora.com/blog/2018/04/03/cryptographic-right-answers/)，以及 [这个很棒的 diff 工具](https://diffdiff.net/)。通常我不想为这些写一整篇博客，因为实在没什么可多说的，就是“嘿，这个很有用！”

但后来我开始觉得困扰——这些东西没地方放：比如最近我想用 [diffdiff](https://diffdiff.net/)，却完全想不起它叫什么名字。

### 解决方案：给博客新增一个栏目

于是我快速建了一个新文件夹 [/til/](https://jvns.ca/til/)，加了些自定义样式（想让帖子看起来有点像推文），写了个小 Rake 任务方便快速创建新帖（`rake new_til`），还单独设置了一个 RSS 订阅源。

我觉得这个新栏目可能更多是为自己服务的——现在如果我忘了“加密领域的正确选择”的链接，希望能从 TIL 页面找到。（你可能会想：“朱莉娅，为什么不用书签？？”但我这辈子都没成功用过书签，而且我觉得这习惯永远不会改，把东西公开分享对我来说反而容易得多。）

目前效果不错，很多时候我确实能在两分钟内快速发帖，这正是目标。

### 灵感来自 Simon Willison 的 TIL 博客

我的页面灵感来自 [Simon Willison 的精彩 TIL 博客](https://til.simonwillison.net/)，不过我的 TIL 帖子要短得多。

### 我并不希望所有内容都被归档

这件事的起因是，我在 Twitter 上花了很多时间，所以一直在思考如何处理我的所有推文。

我经常看到“POSSE”（“在自己的网站发布，再同步到其他平台”）的建议，虽然原则上觉得这个想法不错，但对我来说，社交媒体的部分魅力在于它的短暂性。我可以发投票、提问、观察或笑话，然后随着它们变得不那么相关，自然淡出。

我发现更容易的做法是，明确识别出哪些类别的东西我真正想放在“我拥有的真实网站”上：

-   博客文章在这里！
-   漫画在 [https://wizardzines.com/comics/](https://wizardzines.com/comics/)！
-   现在 TIL 在 [https://jvns.ca/til/](https://jvns.ca/til/)）

然后让其他内容保持短暂性。

不过，我确实很认同建立邮件列表的建议——前两个（博客文章和漫画）都设有邮件列表和RSS订阅功能，方便感兴趣的人订阅。我可能会考虑把当周的TIL帖子做个简短摘要，添加到“本周博客文章”的邮件列表里。
