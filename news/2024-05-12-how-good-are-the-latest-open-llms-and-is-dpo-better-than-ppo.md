---
title: How Good Are the Latest Open LLMs? And Is DPO Better Than PPO?
url: 'https://magazine.sebastianraschka.com/p/how-good-are-the-latest-open-llms'
url_hash: 279d7b587f0e4580c8ec8bd9d81743be4759abbc
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-05-12T06:03:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
original_lang: en
truncated: false
---
2024年4月，真是精彩的一个月！我的生日、[新书发布](https://www.amazon.com/Machine-Learning-AI-Essential-Questions/dp/1718503768)、春天终于来了，还有四个重要的开源大语言模型发布：Mixtral、Meta AI的Llama 3、微软的Phi-3，以及苹果的OpenELM。

本文回顾并讨论了最近几周发布的四个基于Transformer的大语言模型，随后介绍了利用PPO和DPO算法进行指令微调的人类反馈强化学习新研究。

1.  Mixtral、Llama 3和Phi-3表现如何？
2.  OpenELM：一个高效的语言模型家族，附带开源训练和推理框架
3.  DPO是否优于PPO用于大语言模型对齐？一项全面研究
4.  四月份其他有趣的研究论文

首先，从本月最热门的话题开始：本月新发布的主要大语言模型。本节将简要介绍Mixtral、Llama 3和Phi-3，这些模型都附带了简短的博客文章或技术论文。下一节将更详细地介绍苹果的OpenELM，幸运的是它附带了一篇研究论文，分享了许多有趣的细节。

[Mixtral 8x22B](https://mistral.ai/news/mixtral-8x22b/) 是Mistral AI最新的混合专家（MoE）模型，已根据宽松的Apache 2.0开源许可证发布。

与2024年1月发布的Mixtral 8x7B类似，该模型的核心思想是将Transformer架构中的每个前馈模块替换为8个专家层。这将是一篇相对较长的文章，所以我跳过MoE的解释，但如果你感兴趣，我几个月前分享的一篇文章中关于Mixtral 8x7B的部分更详细：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!XZiP!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff0f815fd-f34a-4595-8009-1e1e3e5fa3bd_1302x894.png">![2024年1月研究论文：模型合并、混合专家，以及迈向更小的大语言模型](https://substackcdn.com/image/fetch/$s_!XZiP!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff0f815fd-f34a-4595-8009-1e1e3e5fa3bd_1302x894.png)

](https://magazine.sebastianraschka.com/p/research-papers-in-january-2024)

[Mixtral博客文章](https://mistral.ai/news/mixtral-8x22b/)中最有趣的图表之一，将Mixtral 8x22B与多个大语言模型在两个维度上进行了比较：在流行的[测量大规模多任务语言理解](https://arxiv.org/abs/2009.03300)（MMLU）基准上的建模性能，以及活跃参数（与计算资源需求相关）。

[Meta AI在2023年2月首次发布Llama模型](https://arxiv.org/abs/2302.13971)是公开可用大语言模型的一大突破，也是开源大语言模型的一个关键时刻。因此，大家自然对去年的[Llama 2发布](https://arxiv.org/abs/2307.09288)感到兴奋。现在，[Meta AI开始推出](https://ai.meta.com/blog/meta-llama-3/)的Llama 3模型同样令人激动。

虽然Meta仍在训练一些最大的模型（例如400B变体），但他们发布了熟悉的8B和70B参数规模的模型。而且它们表现很好！下面，我将官方[Llama 3博客文章](https://ai.meta.com/blog/meta-llama-3/)中的MMLU分数添加到了我之前分享的Mixtral图表中。

总体而言，Llama 3架构与Llama 2几乎相同。主要区别在于词汇表大小增加，以及Llama 3在较小模型中也使用了分组查询注意力。如果你需要分组查询注意力的解释，我在这里写过：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!S-dI!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49fcbda7-05d2-4b16-87a1-5febd0df9406_2126x1382.png">![新基础模型：CodeLlama及其他开源AI亮点](https://substackcdn.com/image/fetch/$s_!S-dI!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49fcbda7-05d2-4b16-87a1-5febd0df9406_2126x1382.png)

](https://magazine.sebastianraschka.com/p/ahead-of-ai-11-new-foundation-models)

以下是用于在 LitGPT 中实现 Llama 2 和 Llama 3 的配置文件，有助于一目了然地展示主要差异。

**训练数据规模**

与 Llama 2 相比，性能大幅提升的主要原因是数据集规模更大。Llama 3 在 15 万亿个 token 上训练，而 Llama 2 仅用了 2 万亿个 token。

这是一个非常有趣的发现，因为正如 [Llama 3 博客文章](https://ai.meta.com/blog/meta-llama-3/) 所指出的，根据 Chinchilla 缩放定律，80 亿参数模型的最佳训练数据量要小得多，大约为 2000 亿个 token。此外，Llama 3 的作者观察到，即使达到 15 万亿规模，80 亿和 700 亿参数模型都表现出对数线性改进。这表明我们（即研究人员整体）可以通过超过 15 万亿 token 的更多训练数据进一步增强模型。

**指令微调与对齐**

对于指令微调和对齐，研究人员通常选择使用基于近端策略优化（PPO）的强化学习与人类反馈（RLHF），或者免奖励模型的直接偏好优化（DPO）。有趣的是，Llama 3 的研究人员并未偏重其中一种，而是两者兼用！（更多关于 PPO 和 DPO 的内容将在后续章节介绍。）

[Llama 3 博客文章](https://ai.meta.com/blog/meta-llama-3/) 提到，一篇关于 Llama 3 的研究论文将在未来几个月内发布，我期待这篇文章能分享更多细节。

就在 Llama 2 重大发布一周后，微软推出了新的 Phi-3 LLM。根据 [技术报告](https://arxiv.org/abs/2404.14219) 中的基准测试，即使是最小的 Phi-3 模型，尽管体积不到 Llama 3 8B 的一半，其性能也超越了后者。

值得注意的是，基于 Llama 架构的 Phi-3 训练所用的 token 数量比 Llama 3 少 5 倍（3.3 万亿对 15 万亿）。Phi-3 甚至使用了与 Llama 2 相同的分词器，词汇表大小为 32,064，远小于 Llama 3 的词汇表大小。

此外，Phi-3-mini 仅有 38 亿参数，不到 Llama 3 8B 的一半。

那么，秘诀是什么？根据技术报告，关键在于数据集质量而非数量：“经过严格筛选的网络数据和合成数据”。

论文并未详细说明数据整理过程，但大致遵循了之前 Phi 模型所用的方法。几个月前，我在这里写过更多关于 Phi 模型的内容：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!UBG0!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08b6f6cf-1650-4e01-8675-f3aabba02861_1024x1024.jpeg">![LLM 商业与忙碌：近期公司投资与 AI 采用、新型小型开放 LLM 及 LoRA 研究](https://substackcdn.com/image/fetch/$s_!UBG0!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F08b6f6cf-1650-4e01-8675-f3aabba02861_1024x1024.jpeg)

](https://magazine.sebastianraschka.com/p/ahead-of-ai-12-llm-businesses)

截至撰写本文时，人们仍不确定 Phi-3 是否真的如宣传中那样出色。例如，许多与我交流过的人指出，在非基准测试任务中，Phi-3 远不如 Llama 3。

基于上述三大重要发布，本月对于开放 LLM 来说是非凡的。我甚至还没提到我最喜欢的模型 OpenELM，它将在下一节中讨论。

在实践中我们应该使用哪个模型？我认为上述三个模型各有吸引力。Mixtral 的活跃参数数量低于 Llama 3 70B，但仍保持了相当不错的性能水平。Phi-3 3.8B 可能对移动设备极具吸引力；据作者称，其量化版本可以在 iPhone 14 上运行。而 Llama 3 8B 可能是微调中最有趣的全能选手，因为使用 LoRA 时，它可以轻松地在单个 GPU 上进行微调。

[OpenELM: An Efficient Language Model Family with Open-source Training and Inference Framework](https://arxiv.org/abs/2404.14619) 是苹果研究人员分享的最新 LLM 模型套件和论文，旨在为移动设备部署提供小型 LLM。

与 [OLMo](https://magazine.sebastianraschka.com/p/research-papers-in-february-2024?utm_source=profile&utm_medium=reader2) 类似，看到一篇分享架构、训练方法和训练数据细节的 LLM 论文令人耳目一新。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!m9lw!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!m9lw!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 424w, https://substackcdn.com/image/fetch/$s_!m9lw!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 848w, https://substackcdn.com/image/fetch/$s_!m9lw!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 1272w, https://substackcdn.com/image/fetch/$s_!m9lw!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!m9lw!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png" width="1456" height="369" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:369,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!m9lw!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 424w, https://substackcdn.com/image/fetch/$s_!m9lw!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 848w, https://substackcdn.com/image/fetch/$s_!m9lw!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 1272w, https://substackcdn.com/image/fetch/$s_!m9lw!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1ee20e50-64dc-477c-93bd-10e1986eb207_1498x380.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>OpenELM 与其他开源 LLM 的对比，这些模型共享数据集、代码和权重（目前类似开放程度的模型并不多）。来自 OpenELM 论文的注释表格，</span><a href="https://arxiv.org/abs/2404.14619">https://arxiv.org/abs/2404.14619</a><span>。</span></em></figcaption></figure>

让我们从最有趣的点开始：

-   OpenELM 有 4 种相对较小且方便的尺寸：270M、450M、1.1B 和 3B

-   每种尺寸还提供了经过[拒绝采样](https://arxiv.org/abs/2309.06657)和[直接偏好优化](https://magazine.sebastianraschka.com/i/142924793/rlhf-vs-direct-preference-optimization-dpo)训练的指令版本

-   尽管 OpenELM 的训练 token 数少了 2 倍，但其性能略优于 OLMo

-   主要的架构调整是逐层缩放策略

除了逐层缩放策略（稍后详述），整体架构设置和超参数配置与其他 LLM（如 OLMo 和 Llama）相对相似，如下表所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!DGF6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!DGF6!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 424w, https://substackcdn.com/image/fetch/$s_!DGF6!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 848w, https://substackcdn.com/image/fetch/$s_!DGF6!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 1272w, https://substackcdn.com/image/fetch/$s_!DGF6!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!DGF6!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png" width="1382" height="1224" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/deda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1224,&quot;width&quot;:1382,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!DGF6!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 424w, https://substackcdn.com/image/fetch/$s_!DGF6!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 848w, https://substackcdn.com/image/fetch/$s_!DGF6!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 1272w, https://substackcdn.com/image/fetch/$s_!DGF6!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdeda0d03-b19e-4387-887e-ad6915d8980a_1382x1224.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>OpenELM、最小的 OLMo 模型和最小的 Llama 2 模型之间的架构和超参数对比。</span><em><span>来自 OpenELM 论文的注释表格，</span><a href="https://arxiv.org/abs/2404.14619">https://arxiv.org/abs/2404.14619</a><span>。</span></em></figcaption></figure>

分享细节与我在学生时代研究论文旨在解释细节是不同的。例如，他们从各种公共数据集（[RefinedWeb](https://arxiv.org/abs/2306.01116)、[RedPajama](https://github.com/togethercomputer/RedPajama-Data)、[The PILE](https://arxiv.org/abs/2101.00027) 和 [Dolma](https://arxiv.org/abs/2402.00159)）中采样了一个相对较小的 1.8T token 子集。这个子集比用于训练 OLMo 的 Dolma 小 2 倍。但这种子采样的理由是什么？采样标准又是什么？

其中一位作者友好地就此问题回复了我，称：“关于数据集：我们没有任何数据集采样的理由，除了我们希望使用大约 2T token 的公共数据集（遵循 LLama2）。”

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!sQPT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!sQPT!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 424w, https://substackcdn.com/image/fetch/$s_!sQPT!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 848w, https://substackcdn.com/image/fetch/$s_!sQPT!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 1272w, https://substackcdn.com/image/fetch/$s_!sQPT!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!sQPT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png" width="499" height="394.15175097276267" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/aab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:812,&quot;width&quot;:1028,&quot;resizeWidth&quot;:499,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!sQPT!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 424w, https://substackcdn.com/image/fetch/$s_!sQPT!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 848w, https://substackcdn.com/image/fetch/$s_!sQPT!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 1272w, https://substackcdn.com/image/fetch/$s_!sQPT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faab156e5-6394-4e82-bb35-0266eea92b07_1028x812.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>用于训练 OpenELM 的 token 数量与数据集中原始 token 数量的对比（注意，精确的 token 数量取决于所使用的分词器）。来自 OpenELM 论文的注释表格，</span><a href="https://arxiv.org/abs/2404.14619">https://arxiv.org/abs/2404.14619</a><span>。</span></em></figcaption></figure>

逐层缩放策略（借鉴自 [DeLighT: Deep and Light-weight Transformer](https://arxiv.org/abs/2008.00623) 论文）非常有趣。本质上，研究人员从早期的 Transformer 块到后期的 Transformer 块逐渐加宽各层。具体来说，在保持头大小不变的情况下，研究人员增加了注意力模块中的头数量。他们还对前馈模块的隐藏维度进行了缩放，如下图所示。

我希望有一项消融研究，在相同数据集上分别使用和不使用逐层缩放策略来训练 LLM。但这些实验成本高昂，我能理解为什么没有进行。

不过，我们可以在 [DeLighT: Deep and Light-weight Transformer](https://arxiv.org/abs/2008.00623) 论文中找到消融研究，该论文首次在基于原始编码器-解码器架构的较小数据集上引入了逐层缩放，如下所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!dKje!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!dKje!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 424w, https://substackcdn.com/image/fetch/$s_!dKje!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 848w, https://substackcdn.com/image/fetch/$s_!dKje!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 1272w, https://substackcdn.com/image/fetch/$s_!dKje!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!dKje!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png" width="1456" height="733" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:733,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!dKje!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 424w, https://substackcdn.com/image/fetch/$s_!dKje!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 848w, https://substackcdn.com/image/fetch/$s_!dKje!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 1272w, https://substackcdn.com/image/fetch/$s_!dKje!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04bdcf64-ed1e-40fe-bc4e-066af26506df_1600x806.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>来自 DeLighT 论文的标准 Transformer 块与采用逐层（逐块）缩放的 Transformer 块的对比，</span><a href="https://arxiv.org/abs/2008.00623">https://arxiv.org/abs/2008.00623</a><span>。</span></figcaption></figure>

一个我没想到的有趣额外收获是，研究人员比较了 LoRA 和 DoRA（[我几周前讨论过](https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch)）在参数高效微调方面的表现！不过，结果发现这两种方法之间没有显著差异。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!N8PT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!N8PT!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 424w, https://substackcdn.com/image/fetch/$s_!N8PT!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 848w, https://substackcdn.com/image/fetch/$s_!N8PT!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 1272w, https://substackcdn.com/image/fetch/$s_!N8PT!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!N8PT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png" width="1456" height="364" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:364,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!N8PT!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 424w, https://substackcdn.com/image/fetch/$s_!N8PT!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 848w, https://substackcdn.com/image/fetch/$s_!N8PT!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 1272w, https://substackcdn.com/image/fetch/$s_!N8PT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8dbb23d0-1c83-4127-b0cf-e954995225de_1600x400.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>两种参数高效微调方法（LoRA 和 DoRA）的建模性能对比。来自 OpenELM 论文的注释表格，</span><a href="https://arxiv.org/abs/2404.14619">https://arxiv.org/abs/2404.14619</a><span>。</span></em></figcaption></figure>

虽然这篇论文没有回答任何研究问题，但它是一份关于 LLM 实现细节的优秀且透明的报告。逐层缩放策略可能是我们今后在 LLM 中会更常看到的技术。此外，这篇论文只是发布内容的一部分。更多细节方面，苹果还在 [GitHub 上分享了 OpenELM 代码](https://github.com/apple/corenet/tree/main/mlx_examples/open_elm)。

总之，这是一项出色的工作，非常感谢研究人员（以及苹果公司）的分享！

*[Is DPO Superior to PPO for LLM Alignment? A Comprehensive Study](https://arxiv.org/abs/2404.10719)* 终于回答了我前几个月一直提出的一个关键问题。

在深入探讨结果之前，我们先简要概述一下：PPO（近端策略优化）和 DPO（直接偏好优化）都是通过基于人类反馈的强化学习（RLHF）来对齐 LLM 的流行方法。

RLHF 是 LLM 开发的关键组成部分，用于使 LLM 与人类偏好对齐，例如提高 LLM 生成回复的安全性和有用性。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!yZgE!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!yZgE!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 424w, https://substackcdn.com/image/fetch/$s_!yZgE!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 848w, https://substackcdn.com/image/fetch/$s_!yZgE!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 1272w, https://substackcdn.com/image/fetch/$s_!yZgE!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!yZgE!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png" width="509" height="71.578125" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:144,&quot;width&quot;:1024,&quot;resizeWidth&quot;:509,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!yZgE!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 424w, https://substackcdn.com/image/fetch/$s_!yZgE!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 848w, https://substackcdn.com/image/fetch/$s_!yZgE!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 1272w, https://substackcdn.com/image/fetch/$s_!yZgE!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F790c6b27-c9f1-4215-bd26-431735677b61_1024x144.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>典型的 LLM 训练生命周期</em></figcaption></figure>

如需更详细的解释和比较，另请参阅我上个月分享的《Tips for LLM Pretraining and Evaluating Reward Models》[文章](https://magazine.sebastianraschka.com/p/tips-for-llm-pretraining-and-evaluating-rms)中的 *Evaluating Reward Modeling for Language Modeling* 部分。

RLHF-PPO 作为最初的 LLM 对齐方法，一直是 OpenAI 的 [InstructGPT](https://arxiv.org/abs/2203.02155) 以及 ChatGPT 中部署的 LLM 的支柱。然而，近几个月来，随着 DPO 微调 LLM 的出现，格局发生了变化，这些模型在公开排行榜上产生了显著影响。这种流行度的激增可归因于 DPO 的无奖励替代方案，它使用起来特别简单：与 PPO 不同，DPO 不需要训练单独的奖励模型，而是使用类似分类的目标直接更新 LLM。

如今，公开排行榜上的大多数 LLM 都是使用 DPO 而非 PPO 训练的。但遗憾的是，在此之前，还没有任何直接的头对头比较，即使用相同数据集、分别用 PPO 或 DPO 训练同一个模型，直到这篇新论文的出现。

*[Is DPO Superior to PPO for LLM Alignment? A Comprehensive Study](https://arxiv.org/abs/2404.10719)* 是一篇写得很好、包含大量实验和结果的论文，但主要结论是：PPO 通常优于 DPO，并且 DPO 在处理分布外数据时表现更差。

这里，分布外数据指的是 LLM 之前使用监督微调在指令数据上训练，而这些数据与 DPO 的偏好数据不同。例如，一个 LLM 先在通用 Alpaca 数据集上训练，然后使用另一个带有偏好标签的数据集进行 DPO 微调。（改善 DPO 在分布外数据上表现的一种方法是在进行 DPO 微调之前，先在偏好数据集上增加一轮监督指令微调）。

主要发现总结在下图中。

除了上述主要结果外，论文还包含一些额外的实验和消融研究，如果你对这个话题感兴趣，我建议你去看看。

此外，论文中一些有趣的结论还包括使用 DPO 和 PPO 时的最佳实践建议。

例如，如果你使用 DPO，请确保首先在偏好数据上进行监督微调。此外，迭代式 DPO（即使用现有奖励模型标注额外数据）比直接在现有偏好数据上使用 DPO 效果更好。

如果你使用 PPO，关键的成功因素包括大批量大小、优势归一化以及通过指数移动平均进行参数更新。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!XQIG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!XQIG!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 424w, https://substackcdn.com/image/fetch/$s_!XQIG!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 848w, https://substackcdn.com/image/fetch/$s_!XQIG!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 1272w, https://substackcdn.com/image/fetch/$s_!XQIG!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!XQIG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png" width="1456" height="1005" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1005,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!XQIG!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 424w, https://substackcdn.com/image/fetch/$s_!XQIG!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 848w, https://substackcdn.com/image/fetch/$s_!XQIG!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 1272w, https://substackcdn.com/image/fetch/$s_!XQIG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5653e39f-cb9e-4987-bbac-4e420864ed18_1600x1104.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>偏好数据集的一个片段（示例取自 </span><a href="https://huggingface.co/datasets/Intel/orca_dpo_pairs">Orca 数据集</a><span>）</span></em></figcaption></figure>

根据这篇论文的结果，如果使用得当，PPO 似乎优于 DPO。然而，鉴于 DPO 使用和实现起来更直接，我预计 DPO 仍将是一种流行的首选方法。

一个实用的建议是：如果你有真实奖励标签（这样就不需要预训练自己的奖励模型），或者能下载到领域内的奖励模型，那么使用PPO会是不错的选择。否则，为了简便起见，使用DPO即可。

此外，根据我们从Llama 3博客文章中了解到的信息，我们不必在PPO和DPO之间二选一，而是可以两者都用！例如，Llama 3背后的流程是：预训练 → 监督微调 → 拒绝采样 → PPO → DPO。（我希望Llama 3的开发者能尽快分享一篇更详细的论文！）

理解LLM的最佳方法之一是从零开始编写一个！

如果你想了解更多关于LLM的内容，我在我的《从零开始构建大语言模型》一书中（[链接](https://www.manning.com/books/build-a-large-language-model-from-scratch)）涵盖、实现并解释了整个LLM生命周期。该书目前以折扣价出售，预计2024年夏季正式出版。

涵盖预训练的第5章刚刚于两周前发布。如果你对此感兴趣并觉得有用，可以在GitHub上[这里](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch05/01_main-chapter-code/ch05.ipynb)预览代码。

以下是我本月偶然发现的其他一些有趣论文。即使与之前几个月的强劲表现相比，我认为四月份的LLM研究也格外突出。

**KAN: Kolmogorov–Arnold Networks** 作者：Liu, Wang, Vaidya 等（4月30日），[https://arxiv.org/abs/2404.19756](https://arxiv.org/abs/2404.19756)

-   Kolmogorov-Arnold网络（KAN）用基于样条的可学习函数替换了边上的线性权重参数，并且没有固定的激活函数，这似乎为多层感知机提供了一种有吸引力的新替代方案，在准确性、神经缩放和可解释性方面均优于后者。

**When to Retrieve: Teaching LLMs to Utilize Information Retrieval Effectively** 作者：Labruna, Ander Campos 和 Azkune（4月30日），[https://arxiv.org/abs/2404.19705](https://arxiv.org/abs/2404.19705)

-   本文提出了一种针对LLM的自定义训练方法，通过特殊标记<RET>教会它们在不知道答案时，要么利用自身的参数记忆，要么使用外部信息检索系统。

**A Primer on the Inner Workings of Transformer-based Language Models** 作者：Ferrando, Sarti, Bisazza 和 Costa-jussa（4月30日），[https://arxiv.org/abs/2405.00208](https://arxiv.org/abs/2405.00208)

-   本入门指南简要概述了用于解释基于Transformer的仅解码器语言模型的技术。

**RAG and RAU: A Survey on Retrieval-Augmented Language Model in Natural Language Processing** 作者：Hu 和 Lu（4月30日），[https://arxiv.org/abs/2404.19543](https://arxiv.org/abs/2404.19543)

-   本综述全面介绍了检索增强型LLM，详细阐述了其组件、结构、应用和评估方法。

**Better & Faster Large Language Models via Multi-token Prediction** 作者：Gloeckle, Idrissi, Rozière 等（4月30日），[https://arxiv.org/abs/2404.19737](https://arxiv.org/abs/2404.19737)

-   本文提出，训练LLM同时预测多个未来标记（而不仅仅是下一个标记）不仅能提高样本效率，还能提升生成任务的性能。

**LoRA Land: 310 Fine-tuned LLMs that Rival GPT-4, A Technical Report** 作者：Zhao, Wang, Abid 等（4月28日），[https://arxiv.org/abs/2405.00732](https://arxiv.org/abs/2405.00732)

-   LoRA 是应用最广泛的参数高效微调技术之一，本研究发现，经过4位LoRA微调的模型在性能上显著优于其基础模型和GPT-4。

**让大语言模型充分利用上下文**，作者：An、Ma、Lin 等（4月25日），[https://arxiv.org/abs/2404.16811](https://arxiv.org/abs/2404.16811)

-   该研究推出了FILM-7B模型，采用信息密集型训练方法，旨在解决“中间迷失”难题——即大语言模型在信息不在上下文窗口开头或结尾时无法检索的问题。

**层跳过：实现早期退出推理与自推测解码**，作者：Elhoushi、Shrivastava、Liskovich 等（4月25日），[https://arxiv.org/abs/2404.16710](https://arxiv.org/abs/2404.16710)

-   LayerSkip通过在训练中采用层丢弃和早期退出损失，并在推理中实施自推测解码，能够加速大语言模型的推理过程。

**检索头机制解释长上下文事实性**，作者：Wu、Wang、Xiao 等（4月24日），[https://arxiv.org/abs/2404.15574](https://arxiv.org/abs/2404.15574)

-   本文探讨了具备长上下文能力的Transformer模型如何在其注意力机制中使用特定的“检索头”来有效检索信息，揭示了这些头具有通用性、稀疏性、内在性、动态激活性，并且对于需要参考先前上下文或推理的任务至关重要。

**大语言模型时代的图机器学习**，作者：Fan、Wang、Huang 等（4月23日），[https://arxiv.org/abs/2404.14928](https://arxiv.org/abs/2404.14928)

-   这篇综述文章描述了图神经网络与大语言模型如何日益融合，以提升图机器学习和推理能力。

**NExT：教大语言模型推理代码执行**，作者：Ni、Allamanis、Cohan 等（4月23日），[https://arxiv.org/abs/2404.14662](https://arxiv.org/abs/2404.14662)

-   NExT是一种通过教大语言模型分析程序执行来提升其理解和修复代码能力的方法。

**多头混合专家模型**，作者：Wu、Huang、Wang 和 Wei（4月23日），[https://arxiv.org/abs/2404.15045](https://arxiv.org/abs/2404.15045)

-   提出的多头混合专家模型通过引入多头机制，将令牌拆分为子令牌并由不同专家并行处理，从而解决了稀疏混合专家模型中专家激活率低及处理多语义概念能力差的问题。

**大语言模型自我进化综述**，作者：Tao、Lin、Chen 等（4月22日），[https://arxiv.org/abs/2404.14662](https://arxiv.org/abs/2404.14662)

-   本文对大语言模型的自我进化方法进行了全面综述，提出了一个概念框架，并指出了提升这些模型能力所面临的挑战和未来方向。

**OpenELM：具备开源训练与推理框架的高效语言模型家族**，作者：Mehta、Sekhavat、Cao 等（4月22日），[https://arxiv.org/abs/2404.14619](https://arxiv.org/abs/2404.14619)

-   苹果研究人员推出的OpenELM是一个遵循OLMo精神（我之前介绍过的模型家族）的大语言模型套件，包含完整的训练和评估框架、日志、检查点、配置及其他可复现研究的工件。

**Phi-3技术报告：手机上本地运行的高性能语言模型**，作者：Abdin、Jacobs、Awan 等（4月22日），[https://arxiv.org/abs/2404.14219](https://arxiv.org/abs/2404.14219)

-   Phi-3-mini是一个拥有38亿参数的大语言模型，在3.3万亿个令牌上训练，根据基准测试，其性能可与Mixtral 8x7B和GPT-3.5等更大模型相媲美。

**低位量化LLaMA3模型效果如何？一项实证研究**，作者：Huang、Ma 和 Qin（4月22日），[https://arxiv.org/abs/2404.14047](https://arxiv.org/abs/2404.14047)

-   本实证研究发现，Meta的LLaMA3模型在超低位宽下表现出显著的性能退化。

**《指令层级：训练LLMs优先处理特权指令》** 作者：Wallace、Xiao、Leike等人（4月19日），[https://arxiv.org/abs/2404.13208](https://arxiv.org/abs/2404.13208)

-   本研究为LLMs引入了一种指令层级，用于优先处理可信提示，从而在不损害其标准能力的前提下增强其对抗攻击的鲁棒性。

**《OpenBezoar：基于混合指令数据训练的小型、经济高效且开放的模型》** 作者：Dissanayake、Lowe、Gunasekara和Ratnayake（4月18日），[https://arxiv.org/abs/2404.12195](https://arxiv.org/abs/2404.12195)

-   该研究使用Falcon-40B生成的合成数据以及RLHF和DPO等技术，对OpenLLaMA 3Bv2模型进行微调，通过系统性地筛选和微调数据，在缩小模型规模的同时实现了LLM任务中的顶尖性能。

**《通过想象、搜索与批判实现LLMs的自我改进》** 作者：Tian、Peng、Song等人（4月18日），[https://arxiv.org/abs/2404.12253](https://arxiv.org/abs/2404.12253)

-   尽管LLMs在多种任务中表现出色，但在复杂推理和规划方面仍存在困难；提出的AlphaLLM集成了蒙特卡洛树搜索，构建了一个自我改进循环，无需额外数据标注即可提升LLMs在推理任务中的性能。

**《当LLMs不适用时，请使用FastFit：快速有效的多类别文本分类》** 作者：Yehudai和Bendel（4月18日），[https://arxiv.org/abs/2404.12365](https://arxiv.org/abs/2404.12365)

-   FastFit是一个新的Python包，通过集成批量对比学习和词元级相似度评分，快速准确地处理具有许多相似类别的语言任务中的少样本分类，训练速度提升3-20倍，性能优于SetFit和HF Transformers等其他方法。

**《面向大语言模型的检索增强文本生成综述》** 作者：Huang和Huang（4月17日），[https://arxiv.org/abs/2404.10981](https://arxiv.org/abs/2404.10981)

-   这篇综述文章讨论了检索增强生成（RAG）如何结合检索技术和深度学习，通过动态整合最新信息来改进LLMs，对RAG流程进行了分类，回顾了近期发展，并提出了未来研究方向。

**《RAG模型的忠实度如何？量化RAG与LLMs内部先验之间的拉锯战》** 作者：Wu、Wu和Zou（4月16日），[https://arxiv.org/abs/2404.10198](https://arxiv.org/abs/2404.10198)

-   提供正确的检索信息通常能纠正GPT-4等大语言模型中的错误，但错误信息往往会被重复，除非有强大的内部知识加以反驳。

**《缩小CLIP：数据、架构与训练策略的全面分析》** 作者：Li、Xie和Cubuk（4月16日），[https://arxiv.org/abs/2404.08197](https://arxiv.org/abs/2404.08197)

-   本文探讨了如何缩小对比语言-图像预训练（CLIP）以适应有限的计算预算，证明高质量的小数据集通常优于大规模但质量较低的数据集，并且较小的ViT模型最适合这些数据集。

**《DPO在LLM对齐中是否优于PPO？一项综合研究》** 作者：Xu、Fu、Gao等人（4月16日），[https://arxiv.org/abs/2404.10719](https://arxiv.org/abs/2404.10719)

-   本研究探讨了直接偏好优化（DPO）和近端策略优化（PPO）在基于人类反馈的强化学习（RLHF）中的有效性，发现如果应用得当，PPO在所有情况下都能超越所有其他替代方法。

**《为真正良好的对齐学习你的参考模型》** 作者：Gorbatovski、Shaposhnikov、Malakhov等人（4月15日），[https://arxiv.org/abs/2404.09656](https://arxiv.org/abs/2404.09656)

-   研究强调，新的对齐方法——信任区域直接偏好优化（TR-DPO），通过在训练过程中更新参考策略，在多个参数上提升了模型质量，从而超越了现有技术，在特定数据集上实现了高达19%的改进。

**Chinchilla Scaling：一次复制尝试**，作者：Besiroglu、Erdil、Barnett 和 You（4月15日），[https://arxiv.org/abs/2404.10102](https://arxiv.org/abs/2404.10102)

-   作者尝试复制Hoffmann等人用于估计计算最优缩放定律的一种方法，发现与其他方法原始估计相比，结果存在不一致和不可信之处。

**状态空间模型：新一代Transformer替代网络的综述**，作者：Wang、Wang、Ding 等人（4月15日），[https://arxiv.org/abs/2404.09516](https://arxiv.org/abs/2404.09516)

-   本文对状态空间模型（SSM）作为Transformer架构的高效替代方案进行了全面综述和实验分析，详细阐述了SSM的原理、其在多个领域的应用，并通过统计比较展示了其优势及未来研究的潜在方向。

**LLM的上下文召回能力依赖于提示**，作者：Machlab 和 Battle（4月13日），[https://arxiv.org/abs/2404.08865](https://arxiv.org/abs/2404.08865)

-   研究通过将一条事实信息嵌入文本块中，评估了多种LLM在不同条件下检索该信息的能力，发现性能受提示内容和训练数据潜在偏差的影响。

**用于RLHF的数据集重置策略优化**，作者：Chang、Zhan、Oertell 等人（4月12日），[https://arxiv.org/abs/2404.08495](https://arxiv.org/abs/2404.08495)

-   这项工作引入了数据集重置策略优化（DR-PO），一种基于人类偏好反馈的强化学习（RLHF）新算法，通过将离线偏好数据集直接集成到在线策略训练中来增强训练效果。

**用更少令牌预训练小型基础语言模型**，作者：Sanyal、Sanghavi 和 Dimakis（4月12日），[https://arxiv.org/abs/2404.08634](https://arxiv.org/abs/2404.08634)

-   研究介绍了“Inheritune”方法，通过从大型模型中继承少量Transformer块，并仅使用大型模型数据的一小部分进行训练，来开发更小的基础语言模型。结果表明，尽管训练数据和资源显著减少，这些小型模型的性能仍可与大型模型媲美。

**Rho-1：并非所有令牌都是你需要的**，作者：Lin、Gou、Gong 等人（4月11日），[https://arxiv.org/abs/2404.07965](https://arxiv.org/abs/2404.07965)

-   Rho-1是一种新语言模型，它选择性地训练那些表现出更高超额损失的令牌，而非传统的下一个令牌预测方法。

**语言模型合成数据的最佳实践与经验教训**，作者：Liu、Wei、Liu 等人（4月11日），[https://arxiv.org/abs/2404.07503](https://arxiv.org/abs/2404.07503)

-   本文回顾了LLM背景下的合成数据研究。

**JetMoE：以0.1百万美元达到Llama2性能**，作者：Shen、Guo、Cai 和 Qin（4月11日），[https://arxiv.org/abs/2404.07413](https://arxiv.org/abs/2404.07413)

-   JetMoE-8B是一个80亿参数的稀疏门控混合专家模型，在不到10万美元的成本下，使用1.25万亿令牌进行训练。通过每个输入令牌仅使用20亿参数和“仅”3万GPU小时，它超越了Llama2-7B等更昂贵的模型。

**LLoCO：离线学习长上下文**，作者：Tan、Li、Patil 等人（4月11日），[https://arxiv.org/abs/2404.07979](https://arxiv.org/abs/2404.07979)

-   LLoCO是一种结合了上下文压缩、检索和参数高效微调（使用LoRA）的方法，有效扩展了LLaMA2-7B模型的上下文窗口，使其能够处理多达128k个令牌。

**《不留上下文：利用Infini-attention实现高效无限上下文Transformer》** 作者：Munkhdalai、Faruqui和Gopal（4月10日），[https://arxiv.org/abs/2404.07143](https://arxiv.org/abs/2404.07143)

-   本研究提出一种方法，通过在单个Transformer块中结合多种注意力策略，扩展基于Transformer的大语言模型（LLM），使其能够高效处理无限长输入，适用于需要大量上下文信息的任务。

**《将LLaMA解码器适配为视觉Transformer》** 作者：Wang、Shao、Chen等人（4月10日），[https://arxiv.org/abs/2404.06773](https://arxiv.org/abs/2404.06773)

-   本研究将仅解码器架构的Transformer大语言模型（如Llama）适配到计算机视觉领域，通过修改标准视觉Transformer（ViT），引入后序列类别标记和软掩码策略等技术。

**《LLM2Vec：大语言模型其实是强大的文本编码器》** 作者：BehnamGhader、Adlakha、Mosbach等人（4月9日），[https://arxiv.org/abs/2404.05961](https://arxiv.org/abs/2404.05961)

-   本研究提出一种简单的无监督方法，通过以下步骤将解码器风格的大语言模型（如GPT和Llama）转化为强大的文本编码器：1）禁用因果注意力掩码，2）掩码下一词元预测，3）无监督对比学习。

**《大象永不遗忘：大语言模型中的表格数据记忆与学习》** 作者：Bordt、Nori、Rodrigues等人（4月9日），[https://arxiv.org/abs/2404.06209](https://arxiv.org/abs/2404.06209)

-   本研究揭示了大语言模型中数据污染和记忆的关键问题，表明大语言模型常常记忆流行的表格数据集，并在训练期间见过的数据上表现更好，从而导致过拟合。

**《MiniCPM：利用可扩展训练策略发掘小语言模型的潜力》** 作者：Hu、Tu、Han等人（4月9日），[https://arxiv.org/abs/2404.06395](https://arxiv.org/abs/2404.06395)

-   本研究引入了新的资源高效型“小”语言模型，参数规模在12亿至24亿之间，并采用了诸如预热-稳定-衰减学习率调度器等技术，这些技术有助于持续预训练和领域自适应。

**《CodecLM：利用定制合成数据对齐语言模型》** 作者：Wang、Li、Perot等人（4月8日），[https://arxiv.org/abs/2404.05875](https://arxiv.org/abs/2404.05875)

-   CodecLM引入了一个框架，利用编码-解码原理和大语言模型作为编解码器，自适应地生成高质量合成数据，以对齐大语言模型与各种指令分布，从而提升其遵循复杂多样指令的能力。

**《Eagle和Finch：基于矩阵值状态和动态循环的RWKV模型》** 作者：Peng、Goldstein、Anthony等人（4月8日），[https://arxiv.org/abs/2404.05892](https://arxiv.org/abs/2404.05892)

-   Eagle和Finch是基于RWKV架构的新型序列模型，引入了多头矩阵状态和动态循环等特性。

**《AutoCodeRover：自主程序改进》** 作者：Zhang、Ruan、Fan和Roychoudhury（4月8日），[https://arxiv.org/abs/2404.05427](https://arxiv.org/abs/2404.05427)

-   AutoCodeRover是一种自动化方法，利用大语言模型和高级代码搜索，通过修改软件程序来解决GitHub问题。

**《Sigma：用于多模态语义分割的孪生Mamba网络》** 作者：Wan、Wang、Yong等人（4月5日），[https://arxiv.org/abs/2404.04256](https://arxiv.org/abs/2404.04256)

-   Sigma是一种使用孪生Mamba（结构化状态空间模型）网络进行多模态语义分割的方法，它结合了热成像和深度等不同模态与RGB，为基于CNN和视觉Transformer的方法提供了替代方案。

**《设计可验证：使语言模型引用预训练数据》** 作者：Zhang、Marone、Li等人（2024年4月5日），[https://arxiv.org/abs/2404.03862](https://arxiv.org/abs/2404.03862)

-   Quote-Tuning通过训练大语言模型，使其从可靠来源的逐字引用率比标准模型提高55%至130%，从而提升了模型的可信度和准确性。

**ReFT：语言模型的表征微调** 作者：Wu、Arora、Wang 等（4月5日），[https://arxiv.org/abs/2404.03592](https://arxiv.org/abs/2404.03592)

-   本文介绍了表征微调（ReFT）方法，类似于参数高效微调（PEFT），通过仅修改模型的隐藏表征而非全部参数，来高效地适配大型模型。

**CantTalkAboutThis：让语言模型在对话中保持话题聚焦** 作者：Sreedhar、Rebedea、Ghosh 和 Parisien（4月4日），[https://arxiv.org/abs/2404.03820](https://arxiv.org/abs/2404.03820)

-   本文介绍了 CantTalkAboutThis 数据集，旨在帮助大语言模型在任务导向型对话中保持话题聚焦（该数据集包含跨多个领域的合成对话，通过设置干扰轮次来挑战并训练模型抵御话题偏离）。

**在神经压缩文本上训练大语言模型** 作者：Lester、Lee、Alemi 等（4月4日），[https://arxiv.org/abs/2404.03626](https://arxiv.org/abs/2404.03626)

-   本文介绍了一种在神经压缩文本（由小型语言模型压缩的文本）上训练大语言模型的方法，采用等信息窗口技术，将文本分割成等比特长度的块。

**直接纳什优化：教会语言模型通过通用偏好自我改进** 作者：Andriushchenko、Croce 和 Flammarion（4月4日），[https://arxiv.org/abs/2404.02151](https://arxiv.org/abs/2404.02151)

-   本文介绍了直接纳什优化（DNO），一种大语言模型的后训练方法，利用来自预言机的偏好反馈迭代提升模型性能，作为其他基于人类反馈的强化学习（RLHF）方法的替代方案。

**交叉注意力使文本到图像扩散模型的推理变得繁琐** 作者：Zhang、Liu、Xie 等（4月3日），[https://arxiv.org/abs/2404.02747](https://arxiv.org/abs/2404.02747)

-   该研究探讨了文本条件扩散模型在推理过程中交叉注意力的运作方式，发现其在某一时刻趋于稳定，并指出在此收敛点之后绕过文本输入可以简化流程，同时不影响输出质量。

**BAdam：一种用于大语言模型的内存高效全参数训练方法** 作者：Luo、Hengzu 和 Li（4月3日），[https://arxiv.org/abs/2404.02827](https://arxiv.org/abs/2404.02827)

-   BAdam 是一种内存高效的优化器，可提升大语言模型微调的效率，同时易于使用，仅引入一个额外的超参数。

**基于扩散的文本到图像生成的可扩展性研究** 作者：Li、Zou、Wang 等（4月3日），[https://arxiv.org/abs/2404.02883](https://arxiv.org/abs/2404.02883)

-   本研究通过分析缩放去噪骨干网络和训练集的效果，实证探究了基于扩散的文本到图像模型的缩放特性，揭示了交叉注意力和Transformer模块的效率对性能的显著影响，并识别出以更低成本增强文本-图像对齐与学习效率的策略。

**利用简单自适应攻击破解领先的安全对齐大语言模型** 作者：Andriushchenko、Croce 和 Flammarion（4月2日），[https://arxiv.org/abs/2404.02151](https://arxiv.org/abs/2404.02151)

-   该研究表明，即使是最新的注重安全的大语言模型，也能通过自适应技术轻易被破解，通过对抗性提示、利用API漏洞以及限制令牌搜索空间等方法，在多种模型上实现了近乎100%的成功率。

**缩减规模生成式语言模型中的涌现能力** 作者：Muckatira、Deshpande、Lialin 和 Rumshisky（4月2日），[https://arxiv.org/abs/2404.02204](https://arxiv.org/abs/2404.02204)

-   该研究发现，如果预训练数据集被缩减并简化，非常“小”的大语言模型（参数从100万到1.65亿）也能展现出涌现特性。

**长上下文大语言模型在长上下文学习中表现不佳** 作者：Li、Zheng、Do 等（4月2日），[https://arxiv.org/abs/2404.02060](https://arxiv.org/abs/2404.02060)

-   LIConBench 是一个专注于长上下文学习和极端标签分类的新基准，它揭示了大语言模型在高达 2 万 token 时表现优异，但在更长序列中性能下降，而 GPT-4 是个例外，凸显了处理大量上下文丰富信息方面的差距。

**Mixture-of-Depths: Dynamically Allocating Compute in Transformer-Based Language Models** 作者：Raposo、Ritter、Richard 等人（4 月 2 日），[https://arxiv.org/abs/2404.02258](https://arxiv.org/abs/2404.02258)

-   这项研究引入了一种方法，使基于 Transformer 的语言模型能够动态分配计算资源（FLOPs）到输入序列的不同部分，通过选择每层中特定 token 进行处理，从而优化性能和效率。

**Diffusion-RWKV: Scaling RWKV-Like Architectures for Diffusion Models** 作者：Fei、Fan、Yu 等人（4 月 6 日），[https://arxiv.org/abs/2404.04478](https://arxiv.org/abs/2404.04478)

-   本文介绍了 Diffusion-RWKV，这是将自然语言处理中的 RWKV 架构改编用于图像生成扩散模型的一种方法。

**The Fine Line: Navigating Large Language Model Pretraining with Down-streaming Capability Analysis** 作者：Yang、Li、Niu 等人（4 月 1 日），[https://arxiv.org/abs/2404.01204](https://arxiv.org/abs/2404.01204)

-   这项研究识别了能够预测最终大语言模型能力的早期阶段特征，有助于在预训练过程中分析大语言模型并改进预训练设置。

**Bigger is not Always Better: Scaling Properties of Latent Diffusion Models** 作者：Mei、Tu、Delbracio 等人（4 月 1 日），[https://arxiv.org/abs/2404.01367](https://arxiv.org/abs/2404.01367)

-   本研究探讨了潜在扩散模型的大小如何影响不同步骤和任务中的采样效率，揭示了在给定推理预算内，较小的模型通常能产生更高质量的结果。

**Do Language Models Plan Ahead for Future Tokens?** 作者：Wu、Morris 和 Levine（4 月 1 日），[https://arxiv.org/abs/2404.00859](https://arxiv.org/abs/2404.00859)

-   该研究论文通过“预缓存”和“面包屑”机制找到了经验证据，证明 Transformer 在推理过程中会预判未来信息。

如果你正在寻找一本专注讲解机器学习和人工智能中高级主题的书，你可能会喜欢我的书《[Machine Learning Q and AI](https://www.amazon.com/Machine-Learning-AI-Essential-Questions/dp/1718503768)》。印刷版刚刚在两周前发布！

Ahead of AI 是一个个人热情项目，不提供直接报酬，感谢你的支持。

如果你买了这本书，在亚马逊上写个评论也将非常感谢！

#### 关于此文章的讨论

### 准备好了解更多了吗？
