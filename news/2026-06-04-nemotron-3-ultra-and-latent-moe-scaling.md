---
title: Nemotron 3 Ultra and Latent MoE Scaling
url: 'https://sebastianraschka.com/blog/2026/nemotron-3-ultra-latent-moe.html'
url_hash: fc3fb143f26107e663e0e20ef8a1fab978b56580
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-06-04T11:56:41.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
对于开源权重的大语言模型来说，这是不错的一周。现在有好几款优秀的模型可以在本地运行，就连 Gemma 4 12B 也只需要不到 16 GB 的内存。

[Nemotron 3 Ultra](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4) 对本地运行来说太大了，但从性能效率的角度来看，它很有意思。总的来说，它是 [Nemotron 3 Super](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16) 的大号兄弟。整体设计仍然是混合 Mamba-Transformer [MoE](https://sebastianraschka.com/glossary/#moe "Mixture of Experts (MoE)") 架构，但规模扩展到了 550B 总参数，每个 token 激活 55B 参数。

我觉得最有趣的部分是 Nemotron 3 Super 中引入的 [Latent MoE](https://sebastianraschka.com/llm-architecture-gallery/latent-moe/) 概念。

在常规的 MoE 层中，路由专家直接以模型宽度运作。而在 [Latent MoE](https://sebastianraschka.com/glossary/#latent-moe "Latent MoE") 中，路由路径首先被投影到一个更小的潜在空间中，专家在其中运作，然后将结果投影回原始维度。

对于 Super 来说，这是 `4096 -> 1024 -> 4096`。对于 Ultra 来说，则是 `8192 -> 2048 -> 8192`。

所以 4 倍的压缩比保持不变，但模型规模大幅提升了。这是一个很好的架构扩展示例，通过结合多种效率机制实现：Mamba-2、[GQA](https://sebastianraschka.com/glossary/#gqa "Grouped-Query Attention (GQA)")、Latent MoE 和 MTP。

[LLM 架构图库卡片](https://sebastianraschka.com/llm-architecture-gallery/#card-nemotron-3-ultra-550b-a55b) 提供了更高分辨率的架构图和详细的配置摘要。NVIDIA 的 [技术报告](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf) 则包含了完整的模型和训练细节。

和往常一样，[基准测试](https://sebastianraschka.com/glossary/#benchmark "Benchmark") 快照应视为具有时效性。图中的人工分析数据作为 2026 年 6 月 4 日的参考点是有用的，但随着提供商更新推理栈、量化方法和服务设置，排行榜上的位置可能会迅速变化。

<figure><p><a href="https://substack.com/@rasbt/note/c-270588404"><img src="https://sebastianraschka.com/images/blog/2026/nemotron-3-ultra/hero.webp" alt="Nemotron 3 Ultra 架构与基准测试概览" width="1446" height="1231" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 <a href="https://substack.com/@rasbt/note/c-270588404">Substack 笔记</a> 的组合图，总结了 Nemotron 3 Ultra、相关架构卡片以及发布时的基准测试快照。</figcaption></figure>

来源：我的 [Substack 笔记](https://substack.com/@rasbt/note/c-270588404) 的轻微编辑版网站内容。
