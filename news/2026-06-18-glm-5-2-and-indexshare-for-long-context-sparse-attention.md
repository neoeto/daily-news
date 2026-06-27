---
title: GLM-5.2 and IndexShare for Long-Context Sparse Attention
url: 'https://sebastianraschka.com/blog/2026/glm-5-2-indexshare.html'
url_hash: 384f71ffddd0c56ddad7c7168c8285198d57b791
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-06-18T09:16:05.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[GLM-5.2](https://huggingface.co/zai-org/GLM-5.2) 是 Z.ai 近期发布的一款开放权重模型。我的第一印象是，它是目前最好的开放权重模型。按照新发布的惯例，我会将发布时的排行榜排名视为具有时效性的信息。

在架构方面，它基于早期的 GLM-5 和 GLM-5.1 架构构建。具体来说，它复用了[多头潜在注意力](https://sebastianraschka.com/llm-architecture-gallery/mla/)和[DeepSeek 稀疏注意力](https://sebastianraschka.com/llm-architecture-gallery/deepseek-sparse-attention/)，即我在[DeepSeek V3 到 V3.2 文章](https://magazine.sebastianraschka.com/p/technical-deepseek)中介绍过的 DeepSeek V3.2 的 DSA 机制。

新的特性是 IndexShare。这是针对 DSA 的一种跨层复用技巧。GLM-5.2 并非在每一层都重新计算稀疏注意力的 top-k 索引器，而是每四层才完整运行一次索引器。后续层会复用已选定的 token 索引。

这保留了 DSA 的核心思想，同时降低了处理 100 万 token 推理的成本。注意力模式仍然是自适应的，但模型减少了反复决定关注哪些早期 token 的工作量。

本地的 [GLM-5.2 架构卡片](https://sebastianraschka.com/llm-architecture-gallery/#card-glm-5-2)包含了当前摘要、配置链接以及[基准测试](https://sebastianraschka.com/glossary/#benchmark "Benchmark")参考。

<figure><p><a href="https://substack.com/@rasbt/note/c-278515750"><img src="https://sebastianraschka.com/images/blog/2026/glm-5-2/hero.webp" alt="GLM-5.2 架构与基准测试概览" width="1622" height="1604" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 <a href="https://substack.com/@rasbt/note/c-278515750">Substack 笔记</a>的合成图，总结了 GLM-5.2 的架构和发布时的平均基准测试快照。</figcaption></figure>

顺便提一下，在下面的 [Artificial Analysis 编程指数](https://artificialanalysis.ai/)快照中，GLM-5.2 得分为 68.8，而 Claude Opus 4.8（最大版本）为 56.7，在编程基准测试上高出 10 多分。对于一款全新的开放权重模型来说，这非常令人印象深刻。

<figure><p><img src="https://sebastianraschka.com/images/blog/2026/glm-5-2/artificial-analysis-coding-index.webp" alt="比较 GLM-5.2 和 Claude Opus 4.8 的 Artificial Analysis 编程指数图表" width="2110" height="1018" loading="lazy" decoding="async"></p><figcaption>Artificial Analysis 编程指数快照显示 GLM-5.2 得分为 68.8，Claude Opus 4.8（最大版本）得分为 56.7。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-278515750)稍作编辑的网站版本。
