---
title: Tips for LLM Pretraining and Evaluating Reward Models
url: >-
  https://magazine.sebastianraschka.com/p/tips-for-llm-pretraining-and-evaluating-rms
url_hash: 3ed054bbd6a55a0025dea5d0c5d03da933d4035f
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-03-31T06:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
又到了每月AI研究时间，这次的选择实在让人难以取舍。

除了新研究，本月还有诸多重磅消息。其中，xAI开源了[Grok-1](https://github.com/xai-org/grok-1)模型，这个拥有3140亿参数的模型是迄今为止最大的开源模型。此外，有报道称[Claude-3](https://www.anthropic.com/news/claude-3-family)的性能已接近甚至超越GPT-4。还有[Open-Sora 1.0](https://github.com/hpcaitech/Open-Sora)（全开源视频生成项目）、[Eagle 7B](https://blog.rwkv.com/p/eagle-7b-soaring-past-transformers)（基于RWKV的新模型）、Mosaic的1320亿参数[DBRX](https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm)（混合专家模型），以及[AI21的Jamba](https://huggingface.co/ai21labs/Jamba-v0.1)（基于Mamba的SSM-Transformer模型）。

不过由于这些模型的详细信息较为匮乏，我决定聚焦研究论文的讨论。本月我将解读一篇探讨大语言模型持续预训练策略的论文，接着讨论强化学习人类反馈中使用的奖励建模（一种流行的大语言模型对齐方法），最后介绍一个新基准。

**大语言模型的持续预训练**是个重要课题，因为它能让我们更新现有模型，例如确保模型掌握最新信息和趋势。同时，我们无需从头训练就能将模型适配到新的目标领域。

**奖励建模**的重要性在于它能让我们更精准地将大语言模型与人类偏好对齐，并在一定程度上提升安全性。除了优化人类偏好外，它还能通过提供指令-输出示例，让模型学习适应复杂任务——当显式编程正确行为困难或不切实际时，这种机制尤为有效。

祝阅读愉快！

我们常讨论微调大语言模型以遵循指令。但在实践中，用新知识或领域特定数据更新模型同样重要。近期论文《[简单可扩展的大语言模型持续预训练策略](https://arxiv.org/abs/2403.08763)》为如何用新数据持续预训练大语言模型提供了宝贵见解。

具体而言，研究人员比较了三种不同训练方式的模型：

1.  **常规预训练**：用随机权重初始化模型，在数据集D1上预训练。

2.  **持续预训练**：取上述预训练模型，在数据集D2上继续预训练。

3.  **合并数据集重训**：如同第一种方案用随机权重初始化模型，但在D1和D2的并集上训练。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!stc4!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!stc4!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 424w, https://substackcdn.com/image/fetch/$s_!stc4!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 848w, https://substackcdn.com/image/fetch/$s_!stc4!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 1272w, https://substackcdn.com/image/fetch/$s_!stc4!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!stc4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png" width="1456" height="397" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:397,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!stc4!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 424w, https://substackcdn.com/image/fetch/$s_!stc4!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 848w, https://substackcdn.com/image/fetch/$s_!stc4!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 1272w, https://substackcdn.com/image/fetch/$s_!stc4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6fabd9ec-29f1-4c1c-85fb-8781e7c6ce0b_1600x436.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>三种预训练方法示意图</em></figcaption></figure>

方法3（合并数据集重训）是该领域的常见做法，例如[我去年在讨论BloombergGPT论文时提到的](https://magazine.sebastianraschka.com/p/ahead-of-ai-7-large-language-models?utm_source=%2Fsearch%2F%2520BloombergGPT&utm_medium=reader2)。这是因为重训通常有助于找到合适的学习率调度——常采用线性预热加半周期余弦衰减——并能缓解灾难性遗忘问题。

灾难性遗忘是指神经网络（尤其在序列学习任务中）在学习新信息时忘记先前所学知识的现象。对于需要随时间跨不同数据集或任务训练的模型而言，这一问题尤为突出。

因此，通过在包含新旧信息的组合数据集上重新训练模型，模型既能适应新数据，又能保持对先前学习任务的性能表现。

这份24页的论文报告了大量实验并附有无数图表，以当今标准来看非常详尽。为便于理解，下图总结了主要结论：采用持续预训练方法，可以达到与从头开始组合数据集重新训练相同的优异性能。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!BllO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!BllO!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 424w, https://substackcdn.com/image/fetch/$s_!BllO!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 848w, https://substackcdn.com/image/fetch/$s_!BllO!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 1272w, https://substackcdn.com/image/fetch/$s_!BllO!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!BllO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png" width="1456" height="1250" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1250,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!BllO!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 424w, https://substackcdn.com/image/fetch/$s_!BllO!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 848w, https://substackcdn.com/image/fetch/$s_!BllO!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 1272w, https://substackcdn.com/image/fetch/$s_!BllO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F72b02acf-d4de-44b8-a341-8556fe2185dc_1600x1374.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>持续预训练的成本仅为从头重新训练的½（因为已有预训练模型，只需使用一半数据），却能达到相同的优异性能。来源：来自 </span><a href="https://arxiv.org/abs/2403.08763">https://arxiv.org/abs/2403.08763</a><span> 的注释图。</span></em></figcaption></figure>

成功应用持续预训练的"技巧"是什么？

1.  重新预热并重新衰减学习率（详见下一节）。

2.  在新增数据集（D2）中加入少量（例如5%）原始预训练数据（D1），以防止灾难性遗忘。注意，0.5%和1%等更小的比例也同样有效。

在预训练或微调大语言模型时，通常采用学习率调度策略：先进行线性预热，随后进行半周期余弦衰减，如下图所示。

如上图所示，在线性预热阶段，学习率从较低值开始，在训练初期逐步增加到预设值。这种方法有助于在进入主要训练阶段前稳定模型的权重参数。随后，在预热期结束后，学习率采用余弦衰减调度，以在训练过程中逐步降低模型的学习率。

考虑到预训练结束时学习率已降至极低水平，我们应如何调整持续预训练的学习率？通常的做法是重新引入学习率预热阶段，随后紧跟衰减阶段，这被称为重新预热和重新衰减。简而言之，我们采用与初始预训练阶段完全相同的学习率调度方案。

作者发现，重新预热和重新衰减确实有效。此外，他们还与所谓的"无限学习率"调度进行了比较，该调度源自2021年的[《Scaling Vision Transformers》论文](https://arxiv.org/abs/2106.04560)。这种调度以温和的余弦衰减（或可选的反平方根衰减）开始，过渡到恒定学习率，最后以急剧衰减结束以进行退火。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!uGFC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!uGFC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 424w, https://substackcdn.com/image/fetch/$s_!uGFC!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 848w, https://substackcdn.com/image/fetch/$s_!uGFC!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 1272w, https://substackcdn.com/image/fetch/$s_!uGFC!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!uGFC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png" width="1456" height="910" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:910,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!uGFC!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 424w, https://substackcdn.com/image/fetch/$s_!uGFC!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 848w, https://substackcdn.com/image/fetch/$s_!uGFC!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 1272w, https://substackcdn.com/image/fetch/$s_!uGFC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F973f844b-8c1a-476b-8a6d-082d561edf0e_1600x1000.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>针对三个预训练阶段，使用重新加热、重新衰减以及无限学习率调度进行的实验。</span><em><span>来源：来自 </span><a href="https://arxiv.org/abs/2403.08763">https://arxiv.org/abs/2403.08763</a><span> 的标注图表。</span></em></figcaption></figure>

无限学习率调度很方便，因为可以在恒定学习率阶段的任意时刻通过短退火阶段停止预训练（而无需完成余弦半周期）。然而，如上图结果所示，在预训练和持续预训练中使用“无限学习率”并非必要。常见的重新加热和重新衰减方法与无限学习率调度能达到相同的最终损失。

据我所知，重新加热和重新衰减，以及将原始预训练数据添加到新数据中，或多或少是常识。但我非常欣赏研究人员在这份长达24页的详细报告中，花时间正式测试了这种方法。

此外，我发现“无限学习率”调度并非必要，并且本质上与通过常见的线性预热后接半周期余弦衰减所获得的最终损失相同，这一点很有趣。

虽然我很欣赏本文进行的全面实验，但一个潜在的局限是，大多数实验是在相对较小的405M参数模型上进行的，并采用了相对经典的LLM架构（GPT-NeoX）。然而，作者表明这些结果在10B参数模型上也成立，这让我们有理由相信这些结果同样适用于更大（例如70B参数）的模型，甚至可能适用于架构变体。

研究人员专注于规模相似的预训练数据集。此外，附录还表明，当仅使用50%或30%的数据集进行持续预训练时，这些结果仍然一致。一个有趣的未来研究方向是，当用于预训练的数据集远小于初始预训练数据集时（这是实践中常见的情况），这些趋势和建议是否仍然成立。

另一个有趣的未来研究方向是测试持续预训练如何影响指令微调LLM的指令遵循能力。我特别好奇，在通过持续预训练更新LLM的知识后，是否有必要再增加一轮指令微调。

顺便提一下，如果你对高效预训练大型语言模型（LLM）感兴趣，我们最近开源了一个名为 [Thunder](https://github.com/Lightning-AI/lightning-thunder) 的PyTorch编译器。

当我的同事将其应用于我参与开发的 [LitGPT](https://github.com/Lightning-AI/litgpt) 开源LLM库时，他们在预训练Llama 2 7B模型时实现了40%的运行时性能提升。

[RewardBench: Evaluating Reward Modeling for Language Modeling](https://arxiv.org/abs/2403.13787) 为用于基于人类反馈的强化学习（RLHF）——一种流行的LLM指令微调和对齐流程——中的奖励模型引入了一个基准测试。

在我们讨论本文的主要结论之前，让我们先快速绕道，在下一节简要讨论RLHF和奖励建模。

RLHF旨在改进大语言模型（LLM），使其生成的输出更符合人类偏好。通常，这指的是模型响应的有用性和无害性。我在之前的文章中更详细地介绍过RLHF流程：[https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives](https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives)。

请注意，本文重点是对奖励模型进行基准测试，而不是对通过LLM获得的指令微调LLM本身。用于创建ChatGPT和Llama 2-chat等指令遵循型LLM的RLHF流程，总结如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!up5D!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!up5D!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 424w, https://substackcdn.com/image/fetch/$s_!up5D!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 848w, https://substackcdn.com/image/fetch/$s_!up5D!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 1272w, https://substackcdn.com/image/fetch/$s_!up5D!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!up5D!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png" width="581" height="904.2801556420234" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1600,&quot;width&quot;:1028,&quot;resizeWidth&quot;:581,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!up5D!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 424w, https://substackcdn.com/image/fetch/$s_!up5D!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 848w, https://substackcdn.com/image/fetch/$s_!up5D!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 1272w, https://substackcdn.com/image/fetch/$s_!up5D!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5de12ea7-b40c-42ae-8c20-3ee55210b548_1028x1600.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>用于微调LLM并使其与人类偏好对齐的三步RLHF流程总结。基于InstructGPT论文中的注释图，</span><a href="https://arxiv.org/abs/2203.02155">https://arxiv.org/abs/2203.02155</a><span>。</span></em></figcaption></figure>

如上图所示，奖励模型的创建是RLHF流程中的一个中间步骤。此外，奖励模型本身也是一个LLM。

奖励模型与原始基础LLM的区别在于，我们调整了奖励模型的输出层，使其返回一个可用作奖励标签的分数。为此，我们有两种选择：（1）用一个新的线性层替换现有的输出层，该层产生一个单一的logit值；或者（2）重新利用现有的一个输出logit，并使用奖励标签对其进行微调。

训练奖励模型的过程和损失函数类似于训练用于分类的神经网络。在常规的二分类中，我们预测一个输入样本属于类别1还是类别0。我们使用一个逻辑函数来建模，该函数计算输入样本属于类别1的类别成员概率。

通过逻辑函数进行二分类任务的主要要点总结在下图中。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!c8x8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!c8x8!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 424w, https://substackcdn.com/image/fetch/$s_!c8x8!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 848w, https://substackcdn.com/image/fetch/$s_!c8x8!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 1272w, https://substackcdn.com/image/fetch/$s_!c8x8!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!c8x8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png" width="567" height="582.1306179775281" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1462,&quot;width&quot;:1424,&quot;resizeWidth&quot;:567,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!c8x8!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 424w, https://substackcdn.com/image/fetch/$s_!c8x8!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 848w, https://substackcdn.com/image/fetch/$s_!c8x8!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 1272w, https://substackcdn.com/image/fetch/$s_!c8x8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F573582be-7daa-4f0b-814a-906a624cf2b7_1424x1462.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>二分类总结。</figcaption></figure>

如果你对使用逻辑函数训练分类器还不熟悉，可以在这里找到更多信息：

-   我的文章 [《PyTorch中优化负对数似然和交叉熵的损失函数学习》](https://sebastianraschka.com/blog/2022/losses-learned-part1.html)
-   我的免费课程 [《第4单元：训练多层神经网络》](https://lightning.ai/courses/deep-learning-fundamentals/training-multilayer-neural-networks-overview/)（特别是第4.1、4.2和4.3单元中的5+3+5=13个视频；或者，这些视频也可以在YouTube上找到 [这里](https://www.youtube.com/playlist?list=PLaMu-SDt_RB6KyP_bNaTghy4_Py2X4hq_)）

关于奖励建模，我们可以使用逻辑损失进行二分类，其中结果被标记为0或1，来训练奖励模型。

然而，对于奖励模型，更常见的是使用类似的Bradley-Terry模型，该模型专为成对比较任务设计，其目标不是独立地对项目进行分类，而是确定项目对之间的偏好或排名。

Bradley-Terry 模型在结果涉及相对比较的场景中特别有用，例如"这两个物品中你更偏好哪一个？"，而非绝对分类问题，比如"这个物品是0还是1？"

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Ka5t!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Ka5t!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 424w, https://substackcdn.com/image/fetch/$s_!Ka5t!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 848w, https://substackcdn.com/image/fetch/$s_!Ka5t!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 1272w, https://substackcdn.com/image/fetch/$s_!Ka5t!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Ka5t!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png" width="677" height="603.9993131868132" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1299,&quot;width&quot;:1456,&quot;resizeWidth&quot;:677,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Ka5t!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 424w, https://substackcdn.com/image/fetch/$s_!Ka5t!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 848w, https://substackcdn.com/image/fetch/$s_!Ka5t!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 1272w, https://substackcdn.com/image/fetch/$s_!Ka5t!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0605ace1-cc21-400a-941f-154a1faa103c_1600x1427.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>Bradley-Terry 模型用于相对比较的概述。</figcaption></figure>

在大多数模型中，例如 Llama 2 和 OpenAI 的 InstructGPT（ChatGPT 模型可能也采用相同的方法），奖励模型被训练为一个分类器，用于预测两个答案之间的人类偏好概率，如上节所述。

然而，训练奖励模型需要额外的步骤，而在实践中，如果我们能直接优化奖励而无需创建显式的奖励模型，则会更加简便。这种方法，也称为[直接偏好优化（DPO）](https://arxiv.org/abs/2305.18290)，最近已广泛流行。

在 DPO 中，其核心思想是优化策略 π（这里的"策略"只是指正在训练的模型），使其在最大化预期奖励的同时，在一定程度上保持与参考策略 πref 的接近。这有助于在新策略 π 中保留 πref 的某些理想特性（如稳定性或安全性）。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!EURC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!EURC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 424w, https://substackcdn.com/image/fetch/$s_!EURC!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 848w, https://substackcdn.com/image/fetch/$s_!EURC!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 1272w, https://substackcdn.com/image/fetch/$s_!EURC!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!EURC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png" width="603" height="382.6730769230769" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:924,&quot;width&quot;:1456,&quot;resizeWidth&quot;:603,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!EURC!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 424w, https://substackcdn.com/image/fetch/$s_!EURC!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 848w, https://substackcdn.com/image/fetch/$s_!EURC!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 1272w, https://substackcdn.com/image/fetch/$s_!EURC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F487af2f0-e51d-4140-92a7-23476c5ea016_1600x1015.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>比较奖励模型与 DPO</figcaption></figure>

上述公式中的 β 通常充当温度参数，用于控制概率分布对策略得分差异的敏感度。较高的 β 会使分布对差异更敏感，从而产生更陡峭的函数，使得选项之间的偏好更加明显。较低的 β 则使模型对得分差异不那么敏感，导致更平缓的函数，表示较弱的偏好。本质上，β 有助于校准偏好表达在概率模型中的强度。

由于其相对简单性（即无需训练单独的奖励模型），通过 DPO 微调的 LLM 非常受欢迎。但一个显而易见的问题是：它的表现究竟如何？根据原始的 [DPO 论文](https://arxiv.org/abs/2305.18290)，如下表所示，DPO 的表现非常出色。然而，对此需要持保留态度，因为使用专用奖励模型的 RLHF（即 RLHF-PPO）由于需要更大的数据集和计算资源而更难训练，因此这种比较可能无法反映最佳 DPO 模型与最佳 RLHF-PPO 模型之间的真实对比。

此外，许多DPO模型常出现在各大LLM排行榜前列。但由于DPO比使用专用奖励模型的RLHF简单得多，市面上DPO模型的数量远超后者。因此，在缺乏完全等效模型（即架构相同、训练数据集相同，仅分别采用DPO与带专用奖励模型的RLHF进行训练）的情况下，很难断言DPO在直接对比中是否更优。

在简要介绍RLHF与奖励建模后，本节将深入解读论文《RewardBench: Evaluating Reward Modeling for Language Modeling》（https://arxiv.org/abs/2403.13787），该文提出了评估奖励模型及DPO模型奖励分数的基准测试。

该基准测试套件同时评估了优选响应与拒斥响应的得分，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!4C3A!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!4C3A!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 424w, https://substackcdn.com/image/fetch/$s_!4C3A!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 848w, https://substackcdn.com/image/fetch/$s_!4C3A!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 1272w, https://substackcdn.com/image/fetch/$s_!4C3A!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!4C3A!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png" width="611" height="464.125" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1106,&quot;width&quot;:1456,&quot;resizeWidth&quot;:611,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!4C3A!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 424w, https://substackcdn.com/image/fetch/$s_!4C3A!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 848w, https://substackcdn.com/image/fetch/$s_!4C3A!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 1272w, https://substackcdn.com/image/fetch/$s_!4C3A!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ebd6f26-c7f9-4d55-bca2-a853110689dd_1600x1215.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>RewardBench将奖励模型与DPO模型评估视为预测任务，统计方法选择“优选”（preferred）响应的频率。（来自RewardBench论文的注释图，</span><a href="https://arxiv.org/abs/2403.13787">https://arxiv.org/abs/2403.13787</a><span>）</span></figcaption></figure>

下图列出了RewardBench排名前20的模型。该表格基本印证了前文观点：许多DPO模型出现在LLM排行榜前列，很可能是因为DPO比使用专用奖励模型的RLHF更易用，导致市面上DPO模型数量远超后者。

注意，现有排行榜与RewardBench的区别在于评估指标。其他排行榜评估的是通过奖励模型训练出的LLM在问答和对话方面的表现，而RewardBench聚焦于训练这些LLM所使用的奖励分数。

论文的另一有趣发现是，测量的奖励准确率与模型规模相关（符合预期），如下表所示。（遗憾的是，该对比仅适用于DPO模型。）

尽管论文未提出新的LLM微调方法，但它为讨论奖励建模与DPO提供了契机。同时，很高兴看到奖励模型领域终于有了基准测试。感谢研究人员的创建与分享。

一个小瑕疵是：若能验证RewardBench排名与使用这些奖励模型生成的LLM聊天模型在公开排行榜上的排名高度相关，将更具价值。不过，由于公开排行榜数据与RewardBench数据均可获取，希望这能启发后续论文对此进行分析。

另一个小瑕疵（作者在论文中也已承认）是：RewardBench确实对DPO模型有所偏袒，因为市面上DPO模型的数量远超奖励模型。

未来，在另一篇论文中，若能开展控制计算资源和数据集的对比实验，比较RLHF奖励模型与DPO模型的效果，将颇具意义。

***Ahead of AI*** 是一个个人兴趣项目，不提供直接报酬。不过，若您希望支持我，请考虑购买一本[我的书籍](https://sebastianraschka.com/books/)。如果您觉得这些书有见地且有益，欢迎推荐给您的朋友和同事。

[塞巴斯蒂安的书](https://sebastianraschka.com/books/)

以下是我本月偶然发现的其他有趣论文。鉴于列表较长，我用星号（\*）标出了其中10篇我特别感兴趣的。但请注意，这份列表及其注释完全基于我个人兴趣及与自身项目的相关性。

**《模型库存：我们只需几个微调模型》** 作者：Jang、Yun 和 Han（3月28日），[https://arxiv.org/abs/2403.19522](https://arxiv.org/abs/2403.19522)

-   本文提出了一种名为“模型库存”的高效微调技术，仅使用两个模型进行逐层权重平均。

**《MagicLens：基于开放式指令的自监督图像检索》** 作者：Zhang、Luan、Hu 等人（3月28日），[https://arxiv.org/abs/2403.19651](https://arxiv.org/abs/2403.19651)

-   MagicLens 是一个自监督图像检索模型框架，利用文本指令促进基于视觉相似性之外广泛关系的图像搜索。

**《混合架构的机制设计与扩展》** 作者：Poli、Thomas、Nguyen 等人（3月26日），[https://arxiv.org/abs/2403.17844](https://arxiv.org/abs/2403.17844)

-   本文介绍了一种机制架构设计流程，通过使用合成任务进行高效架构评估，简化了深度学习开发，揭示了混合和稀疏架构在可扩展性和效率上优于传统模型。

**\*《LISA：基于重要性采样的内存高效大语言模型微调》** 作者：Pan、Liu、Diao 等人（3月26日），[https://arxiv.org/abs/2403.17919](https://arxiv.org/abs/2403.17919)

-   这项研究引入了一种简单技术，在训练过程中基于重要性采样随机冻结中间层，该方法高效且能在模型性能上显著超越 LoRA 和完整的大语言模型微调。

**《Mini-Gemini：挖掘多模态视觉语言模型的潜力》** 作者：Li、Zhang、Wang 等人（3月27日），[https://arxiv.org/abs/2403.18814](https://arxiv.org/abs/2403.18814)

-   Mini-Gemini 是一个旨在通过高分辨率视觉标记、高质量数据集和视觉语言模型引导生成来改进多模态视觉语言模型的框架。

**《大语言模型的长篇事实性》** 作者：Wei、Yang、Song 等人（3月27日），[https://arxiv.org/abs/2403.18802](https://arxiv.org/abs/2403.18802)

-   LongFact 是一个全面的提示集，用于评估大语言模型在38个主题上的长篇事实性。

**《ViTAR：任意分辨率的视觉变换器》** 作者：Fan、You、Han 等人（3月27日），[https://arxiv.org/abs/2403.18361](https://arxiv.org/abs/2403.18361)

-   本文解决了视觉变换器在不同图像分辨率下可扩展性有限的问题，引入了动态分辨率调整和模糊位置编码。

**《BioMedLM：基于生物医学文本训练的27亿参数语言模型》** 作者：Bolton、Venigalla、Yasunaga 等人（3月27日），[https://arxiv.org/abs/2403.18421](https://arxiv.org/abs/2403.18421)

-   BioMedLM 是一个紧凑的 GPT 风格大语言模型，基于 PubMed 的生物医学论文训练，为创建“小型”、专业化且功能强大的大语言模型提供了另一个优秀案例。

**《深层层的无端低效》** 作者：Gromov、Tirumala、Shapourian 等（3月26日），[https://arxiv.org/abs/2403.17887](https://arxiv.org/abs/2403.17887)

-   该研究表明，选择性剪枝预训练大语言模型多达一半的层数，随后结合量化和QLoRA进行策略性微调，对问答任务的性能影响极小。

**《大语言模型智能体操作系统》** 作者：Mei、Li、Xu 等（3月25日），[https://arxiv.org/abs/2403.16971](https://arxiv.org/abs/2403.16971)

-   本文介绍了AIOS，一个旨在将大语言模型与智能体集成的操作系统。

**《LLM2LLM：通过新型迭代数据增强提升大语言模型》** 作者：Lee、Wattanawong、Kim 等（3月22日），[https://arxiv.org/abs/2403.15042](https://arxiv.org/abs/2403.15042)

-   LLM2LLM是一种数据增强策略，通过使用教师模型从学生模型在初始训练中产生的错误生成合成数据，提升大语言模型在低数据场景下的性能。

**《大语言模型能否进行上下文探索？》** 作者：Krishnamurthy、Harris、Foster 等（3月22日），[https://arxiv.org/abs/2403.15371](https://arxiv.org/abs/2403.15371)

-   本研究发现，包括GPT-3.5、GPT-4和Llama2在内的当代大语言模型，在无重大干预的情况下，无法可靠地在多臂赌博机环境中进行探索性行为。

**《SiMBA：基于简化Mamba的视觉与多变量时间序列架构》** 作者：Patro 和 Agneeswaran（3月22日），[https://arxiv.org/abs/2403.15360](https://arxiv.org/abs/2403.15360)

-   SiMBA引入了一种新型架构，结合了用于通道建模的Einstein FFT和用于序列建模的Mamba模块，以解决图像和时间序列领域大规模网络中的稳定性问题。

**《RakutenAI-7B：面向日语的大语言模型扩展》** 作者：Levine、Huang、Wang 等（3月21日），[https://arxiv.org/abs/2403.15484](https://arxiv.org/abs/2403.15484)

-   RakutenAI-7B是一套面向日语的大语言模型系列，采用Apache 2.0许可证，包含专门的指令和聊天模型，在日语LM Harness基准测试中达到顶级性能。

**《LlamaFactory：100多种语言模型的统一高效微调》** 作者：Zheng、Zhang、Zhang 等（3月20日），[https://arxiv.org/abs/2403.13372](https://arxiv.org/abs/2403.13372)

-   LlamaFactory引入了一个多功能框架，配有用户友好的Web界面LlamaBoard，支持对100多种大语言模型进行无需编码的高效微调。

**《RewardBench：评估语言建模的奖励模型》** 作者：Lambert、Pyatkin、Morrison 等（3月20日），[https://arxiv.org/abs/2403.13787](https://arxiv.org/abs/2403.13787)

-   本文介绍了RewardBench，一个基准数据集和工具包，旨在全面评估用于从人类反馈中进行强化学习（RLHF）的奖励模型，以将预训练语言模型与人类偏好对齐。

**《PERL：基于参数高效从人类反馈中进行强化学习》** 作者：Sidahmed、Phatale、Hutcheson 等（3月19日），[https://arxiv.org/abs/2403.10704](https://arxiv.org/abs/2403.10704)

-   本工作引入了使用低秩适应（LoRA）的参数高效强化学习（PERL），用于通过从人类反馈中进行强化学习（RLHF）训练模型，该方法高效地将预训练基础大语言模型与人类偏好对齐。

**《解码压缩信任：审视压缩下高效大语言模型的可信度》** 作者：Hong、Duan、Zhang 等（3月18日），[https://arxiv.org/abs/2403.15447](https://arxiv.org/abs/2403.15447)

-   本研究分析了大语言模型压缩技术与可信度之间的复杂关系，发现量化在保持效率和可信度方面优于剪枝。

**《TnT-LLM：利用大语言模型进行大规模文本挖掘》** 作者：Wan、Safavi、Jauhar 等（3月18日），[https://arxiv.org/abs/2403.12173](https://arxiv.org/abs/2403.12173)

-   本文介绍了TnT-LLM，一个利用大语言模型自动生成标签分类体系并进行分配、只需最少人工输入的框架。

**\* RAFT：通过检索增强微调使语言模型适应特定领域RAG** 作者：Zhang, Patil, Jain 等（3月15日），[https://arxiv.org/abs/2403.10131](https://arxiv.org/abs/2403.10131)

-   本文提出检索增强微调（RAFT），通过训练大语言模型识别并忽略无用的“干扰”文档，同时准确引用正确来源的相关信息，从而增强其在开放书籍、领域内问答任务中的表现。

\* **MM1：多模态大语言模型预训练的方法、分析与洞见** 作者：McKinzie, Gan, Fauconnier 等（3月14日），[https://arxiv.org/abs/2403.09611](https://arxiv.org/abs/2403.09611)

-   本工作通过分析架构和数据策略推进多模态大语言模型发展，并提出30B参数的MM1模型系列，该系列在预训练和微调基准测试中表现优异。

**GiT：通过通用语言接口实现通用视觉Transformer** 作者：Wang, Tang, Jiang 等（3月14日），[https://arxiv.org/abs/2403.09394](https://arxiv.org/abs/2403.09394)

-   GiT是一个利用基础视觉Transformer（ViT）处理广泛视觉任务的框架，其核心是通过通用语言接口简化架构，适用于图像描述、目标检测和分割等任务。

**LocalMamba：带窗口选择性扫描的视觉状态空间模型** 作者：Huang, Pei, You 等，[https://arxiv.org/abs/2403.09338](https://arxiv.org/abs/2403.09338)

-   本工作通过优化扫描方向改进Vision Mamba任务，采用局部扫描方法更好地捕捉2D依赖关系，并引入动态逐层扫描优化，在ImageNet等基准测试中取得显著性能提升。

**BurstAttention：面向超长序列的高效分布式注意力框架** 作者：Ao, Zhao, Han 等（3月14日），[https://arxiv.org/abs/2403.09347](https://arxiv.org/abs/2403.09347)

-   “BurstAttention”优化了基于Transformer模型在长序列处理中的分布式注意力机制，将通信开销降低40%，并在GPU上实现处理速度翻倍。

**语言模型在过度训练和下游任务中可靠扩展** 作者：Gadre, Smyrnis, Shankar 等（3月13日），[https://arxiv.org/abs/2403.08540](https://arxiv.org/abs/2403.08540)

-   本文聚焦过度训练以及模型困惑度与下游任务性能之间的关系，探讨了大语言模型扩展定律中的空白。

\* **持续预训练大语言模型的简单可扩展策略** 作者：Ibrahim, Thérien, Gupta 等（3月13日），[https://arxiv.org/abs/2403.08763](https://arxiv.org/abs/2403.08763)

-   本工作证明，通过结合简单的学习率重新升温并添加少量先前训练数据，可以有效利用新数据更新大语言模型，同时缓解灾难性遗忘。

**Chronos：学习时间序列的语言** 作者：Ansari, Stella, Turkmen 等（3月12日），[https://arxiv.org/abs/2403.07815](https://arxiv.org/abs/2403.07815)

-   Chronos将基于Transformer的模型应用于时间序列预测，通过在真实与合成数据的混合训练集上学习，在已知和未知数据集上均取得良好性能。

\* **窃取生产级语言模型的部分信息** 作者：Carlini, Paleka, Dvijotham 等（3月11日），[https://arxiv.org/abs/2403.06634](https://arxiv.org/abs/2403.06634)

-   研究人员提出一种新型模型窃取攻击，能够精确提取黑盒语言模型（如OpenAI的ChatGPT和Google的PaLM-2）中的信息，首次揭示了这些模型的隐藏维度。

**语言模型的算法进展** 作者：Ho, Besiroglu, Erdil（3月9日），[https://arxiv.org/abs/2403.05812](https://arxiv.org/abs/2403.05812)

-   研究发现，自2012年以来，预训练语言模型（包括大语言模型）的计算效率大约每8个月翻一番，这一速度远超摩尔定律所预测的硬件进步速度。

**LLM4Decompile: 用大型语言模型反编译二进制代码** 作者：Tan, Luo, Li, Zhang（3月8日），[https://arxiv.org/abs/2403.05286](https://arxiv.org/abs/2403.05286)

-   本文介绍了用于反编译的开源大型语言模型的发布，这些模型在包含C源代码和相应汇编代码的大型数据集上进行了预训练。

**嵌入的余弦相似度真的关乎相似性吗？** 作者：Steck, Ekanadham, Kallus（3月8日），[https://arxiv.org/abs/2403.05440](https://arxiv.org/abs/2403.05440)

-   本文探讨了通过低维嵌入使用余弦相似度判断高维对象间语义相似性的有效性和局限性。

**Gemini 1.5：解锁跨越数百万上下文标记的多模态理解** 作者：Reid, Savinov, Teplyashin 等（3月8日），[https://arxiv.org/abs/2403.05530](https://arxiv.org/abs/2403.05530)

-   这份技术报告介绍了Gemini 1.5 Pro，这是Google Gemini系列中的多模态模型，擅长处理跨多种模态的长上下文任务。

\* **常见的7B语言模型已具备强大的数学能力** 作者：Li, Wang, Hu 等（3月7日），[https://arxiv.org/abs/2403.04706](https://arxiv.org/abs/2403.04706)

-   这项研究揭示了LLaMA-2 7B模型尽管仅经过标准预训练，却展现出惊人的数学技能，并且随着监督指令微调数据的规模扩大，其一致性得到提升。

**我们在智能视觉演绎推理方面走了多远？** 作者：Zhang, Bai, Zhang 等（3月7日），[https://arxiv.org/abs/2403.04732](https://arxiv.org/abs/2403.04732)

-   这项研究探讨了最先进的视觉语言模型（如GPT-4V）在基于视觉的演绎推理这一精细领域的能力，发现了视觉演绎推理中的显著盲点，并指出在大型语言模型中有效的文本推理技术无法直接应用于视觉推理挑战。

**停止回归：通过分类训练价值函数以实现可扩展的深度强化学习** 作者：Farebrother, Orbay, Vuong 等（3月6日），[https://arxiv.org/abs/2403.03950](https://arxiv.org/abs/2403.03950)

-   本文探讨了通过使用分类交叉熵分类而非传统回归来训练价值函数（这对强化学习至关重要）以增强深度强化学习可扩展性的潜力。

\* **GaLore：通过梯度低秩投影实现内存高效的大型语言模型训练** 作者：Zhao, Zhang, Chen 等（3月6日），[https://arxiv.org/abs/2403.03507](https://arxiv.org/abs/2403.03507)

-   梯度低秩投影（GaLore）是一种新的训练策略，可在大型语言模型训练过程中将优化器状态的内存使用量显著降低高达65.5%，且不影响性能。

**MedMamba：用于医学图像分类的Vision Mamba** 作者：Yue, Li（2024年），[https://arxiv.org/abs/2403.03849](https://arxiv.org/abs/2403.03849)

-   MedMamba通过将卷积神经网络与状态空间模型（Conv-SSM）相结合，用于高效的远程依赖建模和局部特征提取，从而解决医学图像分类问题。

**3D扩散策略** 作者：Ze, Zhang, Zhang 等（3月6日），[https://arxiv.org/abs/2403.03954](https://arxiv.org/abs/2403.03954)

-   3D扩散策略是一种新的视觉模仿学习方法，它将3D视觉表示与扩散策略相结合，以提高机器人训练中的效率和泛化能力，所需演示更少且安全性更高。

**语言模型是解谜高手吗？算法谜题揭示多模态推理中的严峻挑战** 作者：Ghosal, Han, Ken, Poria（3月6日），[https://arxiv.org/abs/2403.03864](https://arxiv.org/abs/2403.03864)

-   本文介绍了一个新的多模态解谜挑战，揭示了GPT4-V和Gemini等模型在复杂谜题中表现严重不足。

**SaulLM-7B：开创性的法律领域大型语言模型** 作者：Colombo, Pires, Boudiaf 等（3月6日），[https://arxiv.org/abs/2403.03883](https://arxiv.org/abs/2403.03883)

-   SaulLM-7B是一个专为法律领域定制的70亿参数语言模型，基于Mistral 7B架构，并在大量英文法律文本语料库上进行了训练。

**《学习与多个语言模型协同解码》** 作者：Shen, Lang, Wang 等人（3月6日），[https://arxiv.org/abs/2403.03870](https://arxiv.org/abs/2403.03870)

-   该方法使多个大型语言模型能够在词元级别协同生成文本，自动学习何时贡献或让位于其他模型，通过利用通用模型和专用模型的联合专长，提升各类任务的性能。

**《回溯：检索查询的成因》** 作者：Wang, Wirawarn, Khattab 等人（3月6日），[https://arxiv.org/abs/2403.03956](https://arxiv.org/abs/2403.03956)

-   该研究引入“回溯”作为一项任务，帮助讲师等内容创作者识别引发用户查询的文本片段，旨在提升教育、新闻和对话领域的内容传递效果。

\* **《ShortGPT：大型语言模型中的层冗余度超乎预期》** 作者：Men, Xu, Zhang 等人（3月6日），[https://arxiv.org/abs/2403.03853](https://arxiv.org/abs/2403.03853)

-   该研究引入块影响（BI）指标来评估LLM中每一层的重要性，并提出ShortGPT，一种基于BI分数移除冗余层的剪枝方法。

**《Design2Code：我们距离自动化前端工程还有多远？》** 作者：Si, Zhang, Yang 等人（3月5日），[https://arxiv.org/abs/2403.03163](https://arxiv.org/abs/2403.03163)

-   该研究引入Design2Code，一个评估多模态LLM将视觉设计转化为代码能力的基准，使用精心挑选的484个真实网页进行评估，其中GPT-4V表现最佳。

**《扩展整流流Transformer以实现高分辨率图像合成》** 作者：Esser, Kulal, Blattmann 等人（3月5日），[https://arxiv.org/abs/2403.03206](https://arxiv.org/abs/2403.03206)

-   该工作通过改进噪声采样并引入新颖的基于Transformer的架构，增强了整流流模型在高分辨率文本到图像合成中的表现，提升了文本理解能力和图像质量，并通过广泛评估和人类偏好评分显示出更优性能。

**《利用丰富监督增强视觉-语言预训练》** 作者：Gao, Shi, Zhu 等人（3月5日），[https://arxiv.org/abs/2403.03346](https://arxiv.org/abs/2403.03346)

-   强监督屏幕截图预训练（S4）引入了一种新的视觉-LLM预训练方法，利用网页截图以及HTML元素固有的树状层次结构。

**《进化Transformer：上下文中的进化优化》** 作者：Lange, Tian, Tang（3月5日），[https://arxiv.org/abs/2403.02985](https://arxiv.org/abs/2403.02985)

-   提出的进化Transformer利用因果Transformer架构进行元优化。

\* **《WMDP基准：通过遗忘衡量和减少恶意使用》** 作者：Li, Pan, Gopal 等人（3月5日），[https://arxiv.org/abs/2403.03218](https://arxiv.org/abs/2403.03218)

-   WMDP基准是一个精心策划的数据集，包含4000多个问题，旨在衡量和减轻LLM在生物安全、网络安全等可能被滥用的领域中的知识。

**《Vision-RWKV：基于RWKV类架构的高效可扩展视觉感知》** 作者：Duan, Wang, Chen 等人（3月4日），[https://arxiv.org/abs/2403.02308](https://arxiv.org/abs/2403.02308)

-   VRWKV将RWKV模型从NLP领域适配到计算机视觉，在分类速度和内存使用上优于DeiT等视觉Transformer（ViT），并在密集预测任务中表现出色。

**《免训练预训练模型合并》** 作者：Xu, Yuan, Wang 等人（3月4日），[https://arxiv.org/abs/2403.01753](https://arxiv.org/abs/2403.01753)

-   提出的模型合并框架通过线性组合权重空间和激活空间的相似性矩阵，解决了模型合并中两者单元相似性不一致的挑战，从而提升了多任务模型的性能。

**《Mamba模型的隐藏注意力》** 作者：Ali, Zimerman, Wolf（3月3日），[https://arxiv.org/abs/2403.01590](https://arxiv.org/abs/2403.01590)

-   本文表明，像Mamba这样的选择性状态空间模型可被视为注意力驱动模型。

**利用语法增强改进LLM代码生成** 作者：Ugare、Suresh、Kang（3月3日），[https://arxiv.org/abs/2403.01632](https://arxiv.org/abs/2403.01632)

-   SynCode是一个框架，它利用编程语言的语法（本质上是一个离线构建的高效查找表）进行语法验证，并将LLM的词汇表限制为仅包含语法有效的标记，从而改进LLM的代码生成。

**在视觉表征学习中学习与利用世界模型** 作者：Garrido、Assran、Ballas等人（3月1日），[https://arxiv.org/abs/2403.00504](https://arxiv.org/abs/2403.00504)

-   该研究通过引入图像世界模型（IWM）来超越掩码图像建模，从而扩展了流行的联合嵌入预测架构（JEPA）。

*本杂志是个人爱好项目，不提供直接报酬。但对于那些希望支持我的人，请考虑购买一本[我的书](https://sebastianraschka.com/books)。如果您觉得它们有见地且有益，欢迎推荐给您的朋友和同事。*

**您的支持意义重大！谢谢！**

#### 关于本文的讨论

### 准备好了解更多？
