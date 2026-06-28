---
title: Local Open-Weight LLMs in Coding Harnesses
url: >-
  https://sebastianraschka.com/blog/2026/local-open-weight-llms-coding-harnesses.html
url_hash: e7c67241bdfa0c92973e727ac8c72ef78fe6595d
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-06-26T09:42:42.000Z
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
我一直在不同的测试框架里试用各种本地开源权重的大语言模型（Qwen-Code、Codex、Claude Code）。

30B 参数的混合专家模型是个挺不错的平衡点，能解决一些有挑战性的问题。在 Mac 或 DGX Spark 上，它们的推理速度大约能达到 40 tok/秒，跟 Pro 订阅版里的 GPT 5.5 差不多，日常使用完全够用。

更有意思的是测试框架的选择！Claude Code 消耗的 token 量似乎是 Codex 的两倍。

这里列出 Gemma 4 E2B 只是为了做个参考，说明这些任务并不是小模型就能轻松搞定的。

更详细的文章现在可以在《使用本地编码代理》中看到：[Using Local Coding Agents](https://magazine.sebastianraschka.com/p/using-local-coding-agents)

<figure><p><a href="https://substack.com/@rasbt/note/c-283141629"><img src="https://sebastianraschka.com/images/blog/2026/local-open-weight-llms-coding-harnesses/hero.webp" alt="柱状图比较了 Claude Code、Codex 和 Qwen Code 在本地代理任务中的 token 使用量和任务成功率" width="2496" height="1448" fetchpriority="high" decoding="async"></a></p><figcaption>图表来自原始 <a href="https://substack.com/@rasbt/note/c-283141629">Substack 笔记</a>，比较了在五个相同的本地代理任务中的 token 使用量和任务成功率。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-283141629) 做了轻微编辑的网站版本。
