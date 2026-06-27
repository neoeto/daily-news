---
title: VibeThinker-3B and the Strength of Post-Training
url: 'https://sebastianraschka.com/blog/2026/vibethinker-3b-post-training.html'
url_hash: 4c9d5872c695b9176de97fb2f3c29ef54a06ee58
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-06-17T08:13:15.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
根据已公布的基准测试结果，[VibeThinker-3B](https://huggingface.co/WeiboAI/VibeThinker-3B) 的表现惊人地接近许多规模更大的编程与推理系统。

最令我感兴趣的是，该模型基于较旧的 [Qwen2.5-Coder-3B](https://huggingface.co/Qwen/Qwen2.5-Coder-3B) 架构。根据模型卡片，VibeThinker-3B 拥有 30.9 亿参数，并采用 Qwen2 风格的主干网络。

因此，这显然是一个很好的例子，说明优质的数据整理和后期训练能带来多大的提升。

[技术报告](https://arxiv.org/abs/2606.16140) 值得一读，因为它详细介绍了后期训练流程。关键部分包括：

1.  使用可验证解决方案的高信号合成数学与代码数据
2.  每个答案生成多条推理路径，随后进行激进过滤
3.  两阶段[监督微调](https://sebastianraschka.com/glossary/#instruction-finetuning "Instruction Finetuning (SFT)")，先广泛覆盖，再处理更困难的长推理示例
4.  基于目标准确率而非仅验证损失进行检查点选择
5.  MGPO，一种 [GRPO](https://sebastianraschka.com/glossary/#grpo "GRPO (Group Relative Policy Optimization)") 风格的 RLVR 方法，强调既不太简单也不太困难的样本
6.  单阶段 64k 上下文强化学习，而非渐进式上下文扩展
7.  领域强化学习顺序为：数学、代码、STEM
8.  后期阶段奖励更短的正确轨迹
9.  从过滤后的数学、代码和 STEM 强化学习轨迹中进行离线自我[蒸馏](https://sebastianraschka.com/glossary/#distillation "Distillation")
10. 最终指令强化学习使用基于规则的验证器和基于评分标准的奖励模型

他们没有分享该项目确切的 GPU 小时数。根据早期 VibeThinker-1.5B 报告的数据，我粗略估计成本大约在 2.5 万到 6 万美元之间。这仍然是一笔不小的开支，但并非数百万美元。

需要注意的是，截至 2026 年 6 月 17 日，该模型非常新，基准测试结果可能好得令人难以置信。未来几天的实际应用将检验 VibeThinker 的结果是否经得起实践考验。但就第一印象而言，这是一个出色的小模型成果，也是一份有价值的后期训练总结报告。

<figure><p><a href="https://substack.com/@rasbt/note/c-277879621"><img src="https://sebastianraschka.com/images/blog/2026/vibethinker-3b/hero.webp" alt="VibeThinker-3B 基准测试、架构及后期训练概览" width="1182" height="1259" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 <a href="https://substack.com/@rasbt/note/c-277879621">Substack 笔记</a>的合成图，总结了 <a href="https://sebastianraschka.com/glossary/#benchmark" title="Benchmark">基准测试</a>快照、架构草图及后期训练流程。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-277879621) 稍作编辑的网站版本。
