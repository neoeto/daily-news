---
title: Using Local Coding Agents
url: 'https://sebastianraschka.com/blog/2026/using-local-coding-agents.html'
url_hash: ee7009035355b5603d8169ba05dfa0cdbaaf6a22
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-06-29T09:01:02.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
我整理了一篇新文章，介绍如何使用开放权重模型搭建本地编码智能体。所有操作完全在本地运行。

之所以觉得这篇文章可能有用，是因为过去很多人问过我的设置方式，同时我也希望它能激励大家开始尝试用本地模型处理严肃工作。今年随着更强大的大语言模型和更完善的工具框架出现，本地模型的能力已经变得非常强大。

所以，[这里是一份如何将本地大语言模型连接到本地编码工具框架的指南](https://magazine.sebastianraschka.com/p/using-local-coding-agents)。你可能已经熟悉 Claude Code 或 Codex 这类工具。

我还附上了一些评估要点，可以作为清单来帮助选择或权衡不同的大语言模型：

1.  检查长上下文下的内存占用，判断模型是否适合实际工作
2.  测量预填充和解码的每秒 token 数，看速度是否足够快而不令人烦躁
3.  确保模型理论上具备足够的工具调用能力
4.  对智能体框架进行安全审计
5.  评估模型在编码工具框架中能否解决一些更具挑战性的任务

当然，总有一些更专业的工具能进一步榨取性能，但我希望这份入门指南足够灵活实用。也就是说，你可以轻松切换到新发布的模型，或者在当前模型不足以应对特定任务时，接入你熟悉的工具框架中的云端模型。

你可以在这里找到完整文章：[使用本地编码智能体](https://magazine.sebastianraschka.com/p/using-local-coding-agents)。

<figure><p><a href="https://substack.com/@rasbt/note/c-284837359"><img src="https://sebastianraschka.com/images/blog/2026/using-local-coding-agents/hero.webp" alt="《使用本地编码智能体》文章的预览图，展示了本地模型、运行时和编码工具框架" width="680" height="430" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 <a href="https://substack.com/@rasbt/note/c-284837359">Substack 笔记</a>的预览图，链接到 <a href="https://magazine.sebastianraschka.com/p/using-local-coding-agents">《使用本地编码智能体》</a> 文章。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-284837359) 稍作编辑的网站版本。
