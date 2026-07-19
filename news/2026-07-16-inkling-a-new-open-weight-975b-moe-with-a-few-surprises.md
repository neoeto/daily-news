---
title: 'Inkling: A New Open-Weight 975B MoE with a Few Surprises'
url: >-
  https://sebastianraschka.com/blog/2026/inkling-architecture-benchmark-notes.html
url_hash: cd4efa01dad0e8b98ecba805d4f0395229e3cb21
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-07-16T08:50:22.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
昨天，Thinking Machines Lab 出人意料地发布了一款有趣的开源权重大语言模型。他们近万亿参数的 [Inkling 模型](https://thinkingmachines.ai/news/introducing-inkling/) 在已公布的基准测试中表现相当扎实。

与 GLM-5.2 相比，Inkling 在 IFBench（79.8% 对 73.3%）和 SimpleQA Verified（43.9% 对 38.1%）等评估中表现更优。但在多个推理和编码智能体基准测试中表现较差，包括 HLE without tools（29.7% 对 40.1%）、SWE-Bench Pro Public（54.3% 对 62.1%）和 Terminal-Bench 2.1（63.8% 对 82.7%）。

这些是发布时的数据，部分行结合了外部报告值和内部测试结果。因此，我不会过度解读细微差异。总体而言，Inkling 看起来是一个不错的全能型模型，旨在用于进一步的微调和专业化。考虑到 Thinking Machines Lab 还开发了其模型定制和微调平台 Tinker，这一方向是合理的。

在架构方面，Inkling 是一个 975B 参数的稀疏混合专家模型，具有 41B 活跃参数和高达 100 万 token 的[上下文窗口](https://sebastianraschka.com/glossary/#context-length "Context Length")。

<figure><p><img src="https://sebastianraschka.com/images/blog/2026/inkling/hero.webp" alt="Inkling 架构图及与 GLM-5.2、Nemotron 3 Ultra、Kimi K2.5、GPT 5.6 Sol 和 Claude Fable 5 的发布基准测试对比" width="3000" height="2016" fetchpriority="high" decoding="async"></p><figcaption>图 1. Inkling 架构及发布时<a href="https://sebastianraschka.com/glossary/#benchmark" title="Benchmark">基准测试</a>对比。基准测试面板数据来自 Thinking Machines Lab 于 2026 年 7 月 15 日的<a href="https://thinkingmachines.ai/news/introducing-inkling/">公告</a>。更高分辨率的架构图也可在<a href="https://sebastianraschka.com/llm-architecture-gallery/#card-inkling">LLM 架构画廊</a>中找到。</figcaption></figure>

一些对比观察：

1.  Inkling 的总参数比 GLM-5.2 多约 231B（975B 对 744B），尽管它们的活跃参数规模几乎相同，分别为 41B 和 40B。
2.  Inkling 比 Kimi K2.5 更不稀疏。它每个 token 激活 4.2% 的参数，而 Kimi K2.5 为 3.2%（41B/975B 对 32B/1T）。
3.  Inkling 使用常规的 Transformer 解码器，而非 Nemotron 3 Ultra 采用的混合 Mamba-Transformer 方法。

我对 token 吞吐量很好奇。相比 Kimi K2.5 更大的活跃参数规模，以及使用传统的 GQA 而非 [MLA](https://sebastianraschka.com/glossary/#mla "Multi-Head Latent Attention (MLA)") 或循环混合堆栈，表明原始解码速度可能不是 Inkling 的主要优势。然而，吞吐量也严重依赖于量化、专家并行、注意力核、批处理和硬件。我尚未看到直接可比的供应商测量数据。

整体设计遵循了近期大型 [MoE](https://sebastianraschka.com/glossary/#moe "Mixture of Experts (MoE)") 的趋势，但架构中有几个有趣的惊喜：

1.  **多处使用小型卷积层。** 每个解码器层在键和值投影之后，以及在注意力和 MLP 分支输出上应用短核为 4 的卷积。我的直觉是，这些卷积提供了廉价的局部 token 混合，并引入了明确的短程归纳偏置，与注意力机制相辅相成。

2.  **在 token [嵌入层](https://sebastianraschka.com/glossary/#token-embeddings "Token Embeddings")之后直接添加了一个额外的 RMSNorm。** 这与每个 Transformer 块内的预注意力 [RMSNorm](https://sebastianraschka.com/glossary/#rmsnorm "Root Mean Square Layer Normalization (RMSNorm)") 是分开的。乍一看，这几乎是多余的，但在[配置](https://huggingface.co/thinkingmachines/Inkling/blob/main/config.json)中明确启用，并存在于 [Transformers 实现](https://github.com/huggingface/transformers/blob/main/src/transformers/models/inkling/modeling_inkling.py)中。它是否真正有帮助需要消融实验来验证。

3.  **一种学习得到的、依赖于输入的相对位置偏置，而非 [RoPE](https://sebastianraschka.com/glossary/#rope "旋转位置编码 (RoPE)")。** [Thinking Machines 表示](https://thinkingmachines.ai/news/introducing-inkling/#architecture)，这种相对位置方法“在性能上优于 RoPE，并且能更好地外推到更长的序列”。

关于最后一点，我的直觉是，重度依赖滑动窗口的架构对此有所帮助。在 66 个解码器层中，有 55 层使用了具有 512 个 token 小窗口的局部注意力。一个学习得到的相对位置偏置可能足以在这些窗口内提供足够的[位置信息](https://sebastianraschka.com/glossary/#positional-encoding "位置编码")。

在 11 个全局层中，已发布的实现仅将学习到的偏置应用于前 1,024 个 token。超出此范围的注意力，就这个位置偏置而言，实际上是基于内容的。这在一定程度上类似于 [NoPE](https://sebastianraschka.com/glossary/#nope "无位置嵌入 (NoPE)") 背后的直觉，其他架构在选定的全局注意力层中使用了 NoPE。

总体而言，Inkling 是 DeepSeek-V3 风格 MoE 方案的一个有趣变体，也是一次扎实的发布。有些人可能会觉得它不够令人兴奋，因为它并未在所有基准测试中领先。我认为这种广泛且混合的基准测试表现令人耳目一新地诚实。这也可能表明，与最近的一些发布相比，该模型在基准测试上的专门化程度较低。

而且，一如既往，很高兴看到另一个强大的开源权重[基础模型](https://sebastianraschka.com/glossary/#base-model "基础模型")可用于微调和独立研究。
