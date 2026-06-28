---
title: Gemma 4 Architecture and Benchmark Notes
url: 'https://sebastianraschka.com/blog/2026/gemma-4-release-notes.html'
url_hash: 4d4259137984a8451eeb008984e288d13cc8ec4c
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-04-02T14:07:15.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
Gemma 4 的发布颇为有趣，因为从架构层面看，31B 密集模型与 Gemma 3 27B 并无根本性差异。

根据 [Gemma 4 模型卡](https://ai.google.dev/gemma/docs/core/model_card_4) 和 [Gemma 4 31B 配置](https://huggingface.co/google/gemma-4-31B-it/blob/main/config.json)，该模型沿用了 Gemma 系列熟悉的局部-全局注意力机制：

1.  滑动窗口注意力与全局注意力的比例为 5:1
2.  采用 [QK-Norm](https://sebastianraschka.com/glossary/#qk-norm "QK-Norm") 的分组查询注意力
3.  前 [RMSNorm](https://sebastianraschka.com/glossary/#rmsnorm "Root Mean Square Layer Normalization (RMSNorm)") 和后 RMSNorm 模块
4.  256k 令牌的[上下文长度](https://sebastianraschka.com/glossary/#context-length "Context Length")
5.  262k 令牌的[词汇表](https://sebastianraschka.com/glossary/#vocabulary-size "Vocabulary Size")

因此，相较于 Gemma 3 的[基准测试](https://sebastianraschka.com/glossary/#benchmark "Benchmark")提升，可能更多归功于训练数据和训练方法，而非新的 Transformer 模块。截至 2026 年 4 月，绘制的基准测试结果显示，在多项常见基准上，Gemma 4 31B 的表现更接近 Qwen3.5-27B，而非 Gemma 3 27B。竞技场风格的排名是有用的信号，但我倾向于将其视为偏好偏差的结果，而非纯粹的能力度量。

此外，还有一个稀疏的 [MoE](https://sebastianraschka.com/glossary/#moe "Mixture of Experts (MoE)") 变体，[Gemma 4 26B-A4B](https://huggingface.co/google/gemma-4-26B-A4B-it/blob/main/config.json)，它保留了相同的局部-全局注意力主干，但将密集前馈层替换为 MoE 层。为了保持图表对比的可读性，我未将其纳入图中，但它已收录在 [LLM 架构画廊](https://sebastianraschka.com/llm-architecture-gallery/#card-gemma-4-26b-a4b)中。

许可协议也值得注意。Gemma 4 采用 [Apache License 2.0](https://ai.google.dev/gemma/docs/core/model_card_4) 许可，对于许多用例来说，这比 Gemma 3 的自定义许可要友好得多。

<figure><p><a href="https://substack.com/@rasbt/note/c-237278550"><img src="https://sebastianraschka.com/images/blog/2026/gemma-4-release-notes/hero.webp" alt="Gemma 4 31B 架构图与基准测试对比" width="1600" height="1600" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 Substack 笔记的图表，展示了 Gemma 4 31B 架构及选定的基准测试对比。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-237278550) 稍加编辑的网站版本。
