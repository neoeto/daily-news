---
title: LLM Architecture Gallery Diff Tool
url: 'https://sebastianraschka.com/blog/2026/llm-architecture-gallery-diff-tool.html'
url_hash: 8f23861c0cf2b12dac3da386d7352c861ab23e8d
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-03-26T12:56:08.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
original_lang: en
truncated: false
---
过去两周，我为 [LLM 架构画廊](https://sebastianraschka.com/llm-architecture-gallery/) 添加了几项更新。

其中最实用的是新增的 [架构差异对比工具](https://sebastianraschka.com/llm-architecture-gallery/#architecture-diff-tool)。你可以选择两个模型，并排比较它们的架构堆栈。

对比视图目前突出显示以下内容：

1.  架构示意图
2.  注意力模块差异
3.  解码器类型
4.  每个 token 的 KV 缓存占用
5.  层配方
6.  模型规模与 [上下文长度](https://sebastianraschka.com/glossary/#context-length "上下文长度")

你可以直接使用差异工具中的选择器，或者先点击单个画廊卡片上的 `模型 A` 和 `模型 B` 操作，再跳转到对比视图。

这主要适用于两个模型在宏观层面看似相似，但在一两个关键细节上存在差异的情况。DeepSeek V3 与 DeepSeek V3.2 就是一个很好的例子：它们的堆栈高度相似，但注意力模块从 MLA 变为了 MLA 结合 [DeepSeek 稀疏注意力](https://sebastianraschka.com/glossary/#deepseek-sparse-attention "DeepSeek 稀疏注意力")。

<figure><p><a href="https://sebastianraschka.com/llm-architecture-gallery/#architecture-diff-tool"><img src="https://sebastianraschka.com/images/blog/2026/llm-architecture-gallery-diff-tool/hero.webp" alt="LLM 架构画廊差异对比工具比较 DeepSeek V3 与 DeepSeek V3.2" width="1600" height="838" fetchpriority="high" decoding="async"></a></p><figcaption>LLM 架构画廊差异对比工具比较 DeepSeek V3 与 DeepSeek V3.2 的截图。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-233727903) 略作编辑的网站版本。
