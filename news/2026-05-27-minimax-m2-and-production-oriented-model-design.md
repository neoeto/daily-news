---
title: MiniMax M2 and Production-Oriented Model Design
url: 'https://sebastianraschka.com/blog/2026/minimax-m2-technical-report.html'
url_hash: 8bc7746dec315e84ae9e6935f7f68ccc355fd3e4
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-05-27T10:09:03.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[MiniMax M2系列](https://arxiv.org/abs/2605.26494)是今年早些时候使用最广泛的开源权重LLM系列之一。其技术报告中有几个值得关注的细节。

该论文将旗舰模型M2描述为一个稀疏[MoE](https://sebastianraschka.com/glossary/#moe "混合专家模型 (MoE)")，总参数量为2299亿，每个token激活参数为98亿。在本地架构画廊中，这对应着[MiniMax M2](https://sebastianraschka.com/llm-architecture-gallery/#card-minimax-m2-230b)、[MiniMax M2.5](https://sebastianraschka.com/llm-architecture-gallery/#card-minimax-m2-5-230b)和[MiniMax M2.7](https://sebastianraschka.com/llm-architecture-gallery/#card-minimax-m2-7-230b)卡片。

我最感兴趣的部分：

1.  **全注意力机制的反潮流选择**。他们尝试了混合滑动窗口注意力变体，类似于许多其他近期模型使用的方案。尽管效率有所提升，但对M2而言，生产质量的权衡显然不值得。
2.  **线性与稀疏注意力的部署问题**。这些注意力变体在理论上降低了长上下文注意力成本，但报告指出，它们在生产级智能体系统中难以良好运作。两个实际问题是：低精度的类KV状态，以及较弱的预填充缓存支持——这对重用大量上下文的编码智能体至关重要。
3.  **细粒度MoE仍然有效**。报告包含了一个在20亿激活参数规模下的有用MoE消融实验。将32个专家和top-2路由的基线，与128个专家和top-8路由的细粒度设置进行了比较。细粒度设置将MATH从19.6提升至24.1，[HumanEval](https://sebastianraschka.com/glossary/#benchmark "基准测试")从29.7提升至32.5。
4.  **智能体训练流程现已成为主要组成部分**。报告描述了挖掘GitHub拉取请求、构建可运行的Docker环境、提取特定任务的测试奖励，以及将软件工程任务转化为可验证的训练轨迹。
5.  **交错思考对上下文管理至关重要**。移除前几轮中的推理模块会损害性能，尤其是在多步智能体任务中。这是长上下文支持对智能体工作负载如此重要的另一个原因。
6.  **速度奖励是强化学习设计的一部分**。token惩罚很常见，但MiniMax还增加了基于挂钟时间的任务完成时间奖励。目标是减少不必要的慢速工具调用。如果框架支持，这也可能鼓励更多并行的智能体行为。
7.  **自我进化已成为循环的一部分**。报告称，M2.7处理了每日强化学习迭代工作量的30%至50%，修改了自身的脚手架，并完成了一轮100轮的自主脚手架优化循环，内部评估提升了30%。

像往常一样，我会将基准测试和内部评估数据视为2026年5月的快照。更持久的启示是：预填充缓存、工具延迟、可执行环境和脚手架迭代等生产约束，正成为模型设计的一级输入。

<figure><p><a href="https://substack.com/@rasbt/note/c-266029305"><img src="https://sebastianraschka.com/images/blog/2026/minimax-m2-report/hero.webp" alt="MiniMax M2技术报告要点" width="1446" height="1446" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始<a href="https://substack.com/@rasbt/note/c-266029305">Substack笔记</a>的合成图，总结了滑动窗口注意力消融实验、细粒度MoE结果以及SWE扩展流程。</figcaption></figure>

来源：我的[Substack笔记](https://substack.com/@rasbt/note/c-266029305)的轻编辑网站版本。
