---
title: North Mini Code and Agentic Coding Benchmarks
url: 'https://sebastianraschka.com/blog/2026/north-mini-code-agentic-coding.html'
url_hash: 9d0d798da4d29425e850dcee49541801cf744d49
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-06-12T18:49:55.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
original_lang: en
truncated: false
---
[North Mini Code](https://huggingface.co/CohereLabs/North-Mini-Code-1.0) 是 Cohere 为智能体编码任务推出的全新开源权重模型。

根据[发布博文](https://huggingface.co/blog/CohereLabs/introducing-north-mini-code)，该模型采用混合专家架构，总参数量达 300 亿，其中 3B 参数处于激活状态，基于 Apache 2.0 许可开源。架构亮点在于 30B-A3B 的权衡设计：包含 128 个专家模块，每个 token 激活 8 个专家，并采用交错滑动窗口与全局注意力机制。

关键细节在于评估设置。发布重点强调智能体编码能力——模型需在工具循环中工作，而非仅针对提示返回代码答案：

1.  在 [Terminal-Bench](https://www.tbench.ai/) 中，模型需使用终端、检查环境、运行命令、读取输出，并根据观察状态继续操作。
2.  在 [SWE-Bench](https://www.swebench.com/) 中，模型需处理 GitHub 风格的软件问题：理解仓库结构、定位相关文件、生成补丁并通过测试。
3.  [SciCode](https://scicode-bench.github.io/) 与 [LiveCodeBench](https://livecodebench.github.io/) 更接近传统代码生成基准。虽然仍需推理能力，但交互循环明显更短。

这种对智能体编码的专注，或许解释了为何 North Mini Code 在表格中工作流密集型行上远超 Gemma 4。传统代码生成行虽不及 Qwen3.6 水平，但仍具竞争力。

照例，我会将这些视为截至 2026 年 6 月 12 日的发布时[基准](https://sebastianraschka.com/glossary/#benchmark "Benchmark")数据。对于智能体编码，测试框架细节、工具 API、超时设置和提示模板都可能显著影响结果。

<figure><p><a href="https://substack.com/@rasbt/note/c-275332436"><img src="https://sebastianraschka.com/images/blog/2026/north-mini-code/hero.webp" alt="North Mini Code 架构与基准测试概览" width="1446" height="1260" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 <a href="https://substack.com/@rasbt/note/c-275332436">Substack 笔记</a>的合成图，总结了 North Mini Code 架构及发布时基准测试快照。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-275332436) 进行轻微编辑的网站版本。
