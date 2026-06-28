---
title: Nemotron 3 Super Throughput Notes
url: 'https://sebastianraschka.com/blog/2026/nemotron-3-super-throughput.html'
url_hash: 860a5d9fab77490c64ea63a740df8727442464cc
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-03-12T08:07:03.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
NVIDIA 的 [Nemotron 3 Super 120B-A12B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16) 是一次不错的开放权重发布，因为其设计非常明确地瞄准了精度与吞吐量之间的权衡。

根据[技术报告](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf)、[模型配置](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16/blob/main/config.json)以及我的本地[架构卡片](https://sebastianraschka.com/llm-architecture-gallery/#card-nemotron-3-super-120b-a12b)，这个总参数量120B、激活参数量12B的模型结合了多项效率优化选择：

1.  Mamba-2 层，用于提升吞吐量和长上下文效率
2.  [潜在 MoE](https://sebastianraschka.com/glossary/#latent-moe "潜在 MoE") 层，以更低的推理成本实现稀疏扩展
3.  共享权重的多 token 预测，用于原生推测解码
4.  少量 [GQA](https://sebastianraschka.com/glossary/#gqa "分组查询注意力 (GQA)") 层混合在混合架构中

截至2026年3月，报告的[基准测试](https://sebastianraschka.com/glossary/#benchmark "基准测试")表现大致与相同激活规模的 GPT-OSS 120B 和 Qwen3.5 模型相当，而吞吐量数据则更为出色。我会将具体的基准测试排名视为对日期敏感的信息，但架构层面的要点更具持久性。Nemotron 3 Super 在设计上投入了大量精力来降低延迟和成本，而不仅仅是追求原始分数。

这使得它成为值得关注的本地智能体应用模型，因为在这些场景中，吞吐量和成本往往与峰值基准测试分数同样重要。

<figure><p><a href="https://substack.com/@rasbt/note/c-226718041"><img src="https://sebastianraschka.com/images/blog/2026/nemotron-3-super/hero.webp" alt="Nemotron 3 Super 120B-A12B 架构图与基准测试对比" width="1600" height="1578" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 Substack 笔记的图片，展示了 Nemotron 3 Super 架构以及选定的基准测试和吞吐量对比。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-226718041) 稍作编辑的网站版本。
