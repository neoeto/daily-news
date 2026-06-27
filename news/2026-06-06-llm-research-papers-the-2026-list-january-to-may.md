---
title: 'LLM Research Papers: The 2026 List (January to May)'
url: 'https://magazine.sebastianraschka.com/p/llm-research-papers-2026-part1'
url_hash: f3d1448df6a6df0267e2466d113920ea6031aa3c
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-06-06T11:16:22.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
各位读者中，有些人可能知道，我长期保持着一个习惯：持续整理一份我想阅读、重访或在未来文章与项目中引用的研究论文清单。

去年，我分享了两份经过整理的论文列表，[一份](https://magazine.sebastianraschka.com/p/llm-research-papers-2025-list-one)涵盖1月至6月，[另一份](https://magazine.sebastianraschka.com/p/llm-research-papers-2025-part2)涵盖7月至12月。

有几位读者告诉我这些清单非常有用，因此，本着类似的精神，我为2026年上半年准备了一份新清单。这份清单涵盖了我从2026年1月至5月收藏的论文。

请不要将其视为今年所有已发表论文的完整列表。每天发表的论文数量之多，使得这种全面收录完全不可行。相反，这是一份基于我个人认为有趣或与自身工作相关的论文而整理的精选参考清单。在整理清单时，我仔细浏览了标题、摘要和主题框架，但必须承认，我也只详细阅读了其中一部分论文。

为什么要制作这些清单？当我在撰写文章、书籍章节、代码示例或准备讲座时，我常常记得自己在哪里见过一篇相关的论文，但再次找到它却出奇地麻烦。一份分类清晰的Markdown清单为我解决了这个问题，我希望它也能对你们有所帮助。（即便在基于LLM的网络搜索时代，拥有一份具体的上下文清单仍然非常有用。）

今年，这份清单再次侧重于推理模型、强化学习和高效推理，因为我倾向于收藏与当前工作相关的论文。然而，与2025年的清单相比，我也收藏了更多关于智能体框架、工具使用、长上下文、扩散语言模型和实际服务基础设施的论文，因为这是我目前深度参与的领域，也是该领域的发展方向。

这份研究论文清单的分类如下。（小贴士：在本文的网络版中，您可以使用左侧的目录直接跳转到最相关的章节。）

1.  架构与模型设计

2.  高效训练与扩展

3.  推理效率与KV缓存

4.  稀疏注意力与长上下文

5.  推理与测试时计算

6.  强化学习与RLVR

7.  智能体系统与工具使用

8.  编码智能体与软件工程

9.  扩散语言模型

10. 模型评估与基准测试

第一部分汇集了关于模型架构、模型发布技术报告以及有助于解释当前LLM为何呈现如此形态的论文。

我发现2026年迄今为止的一个有趣之处在于，架构工作已不仅仅是让Transformer变得更大。大量工作集中在：

-   混合架构（例如，*[Nemotron 3](https://arxiv.org/abs/2604.12374)* 和 *[Arcee Trinity](https://www.arxiv.org/abs/2602.17004)*），

-   状态空间层（*[Nemotron 3](https://arxiv.org/abs/2604.12374)* 和 *[Mamba-3](https://arxiv.org/abs/2603.15569)*），

-   MoE容量分配（*[Scaling Embeddings Outperforms Scaling Experts](https://arxiv.org/abs/2601.21204)* 和 *[Step 3.5 Flash](https://arxiv.org/abs/2602.10604)*），

-   激活行为（*[The Spike, the Sparse and the Sink](https://arxiv.org/abs/2603.05498)*），

-   以及表示几何学（*[语言统计中的对称性塑造了模型表示的几何结构](https://arxiv.org/abs/2602.15029)*）。

所有这些论文都相当有趣，这也是我最初收藏它们的原因。但如果非要选一篇必读之作，我可能会选 Nemotron 3 Super，因为这篇文章*超级*详细（没有双关之意），并且描述了已在生产环境中使用的模型所采用的技术。毕竟，它也是同尺寸级别中最好的模型之一。

Nemotron 3 的一个有趣之处在于其混合架构设计，这意味着它在常规注意力层和 Mamba-2（状态空间模型）层之间交替，以便在长上下文场景下更高效。到了 2026 年，随着越来越多的 LLM 接入智能体框架（如 OpenClaw 等），长上下文效率将成为关键，这需要处理越来越长的上下文。

话虽如此，120B-A12B 对于普通消费级硬件上的本地推理来说可能有点过大，但还有一个 Nemotron 3 Nano（4B）版本可供选择。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!1Yxw!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!1Yxw!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 424w, https://substackcdn.com/image/fetch/$s_!1Yxw!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 848w, https://substackcdn.com/image/fetch/$s_!1Yxw!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 1272w, https://substackcdn.com/image/fetch/$s_!1Yxw!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!1Yxw!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png" width="1456" height="1485" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/cdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1485,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:&quot;Nemotron-3 architecture&quot;,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="Nemotron-3 架构" title="Nemotron-3 架构" srcset="https://substackcdn.com/image/fetch/$s_!1Yxw!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 424w, https://substackcdn.com/image/fetch/$s_!1Yxw!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 848w, https://substackcdn.com/image/fetch/$s_!1Yxw!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 1272w, https://substackcdn.com/image/fetch/$s_!1Yxw!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb128a1-b639-494e-9ca5-ef60d59cd113_4167x4250.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图 1：Nemotron-3 Super 的架构，这是一种使用 Mamba-2 层的混合架构。</figcaption></figure>

请注意，两天前，英伟达还发布了该模型的升级版 Nemotron 3 Ultra（550B-A55B），它扩展了嵌入和投影维度，但其他方面使用了相同的构建模块。如果你对可视化感兴趣，我在 Substack Notes 上发布了相关内容，[点击此处](https://substack.com/@rasbt/note/c-270588404?r=gb4sb&utm_source=notes-share-action&utm_medium=web)查看。

这种在注意力层和替代层之间交替的混合架构趋势，是今年相对流行的一个发展方向。采用类似混合设计的最流行的开源权重 LLM 系列可能是 Qwen3.6，它在非注意力部分使用了 Gated DeltaNet 层，而不是 Mamba-2 层。更多信息，请参阅我的混合注意力（[https://sebastianraschka.com/llm-architecture-gallery/hybrid-attention/](https://sebastianraschka.com/llm-architecture-gallery/hybrid-attention/)）文章，其中汇集了我之前几篇 Substack 文章中关于这些内容的信息。

此外，在下面的论文列表中，你可能会注意到现在有了 Mamba-3 和 Gated DeltaNet-2（即 Mamba-2 和 GatedDeltaNet 的新版本），看到它们出现在即将推出的开源权重 LLM（例如 Nemotron-4 和 Qwen4？）中将会很有趣。

除了描述混合架构设计之外，Nemotron-3 论文还包含了许多其他有趣的消融实验，例如关于用于推测解码的多 token 预测、NVFP4 预训练与 BF16 对比、合成 MMLU 风格数据以及训练后量化方案，但详细涵盖这些内容超出了本概述的范围。

-   1 月 1 日，Deep Delta Learning，[https://arxiv.org/abs/2601.00417](https://arxiv.org/abs/2601.00417)
-   1 月 6 日，MiMo-V2-Flash 技术报告，[https://arxiv.org/abs/2601.02780](https://arxiv.org/abs/2601.02780)
-   1 月 13 日，Ministral 3，[https://arxiv.org/abs/2601.08584](https://arxiv.org/abs/2601.08584)
-   1 月 29 日，扩展嵌入在语言模型中优于扩展专家，[https://arxiv.org/abs/2601.21204](https://arxiv.org/abs/2601.21204)
-   1 月 30 日，LatentLens：揭示 LLM 中高度可解释的视觉 Token，[https://arxiv.org/abs/2602.00462](https://arxiv.org/abs/2602.00462)
-   2 月 4 日，ERNIE 5.0 技术报告，[https://arxiv.org/abs/2602.04705](https://arxiv.org/abs/2602.04705)
-   2 月 8 日，ViT-5：面向 2020 年代中期的视觉 Transformer，[https://arxiv.org/abs/2602.08071](https://arxiv.org/abs/2602.08071)（本文大部分内容聚焦于 LLM，但我忍不住加入了一个新的主要视觉 Transformer 设计。）

-   2月11日，Step 3.5 Flash：以110亿活跃参数实现前沿级智能，[https://arxiv.org/abs/2602.10604](https://arxiv.org/abs/2602.10604)

-   2月12日，Nanbeige4.1-3B：一个具备推理、对齐与行动能力的小型通用模型，[https://arxiv.org/abs/2602.13367](https://arxiv.org/abs/2602.13367)

-   2月16日，语言统计中的对称性塑造模型表征的几何结构，[https://arxiv.org/abs/2602.15029](https://arxiv.org/abs/2602.15029)

-   2月17日，GLM-5：从氛围编码到智能体工程，[https://arxiv.org/abs/2602.15763](https://arxiv.org/abs/2602.15763)

-   2月18日，Arcee Trinity大型技术报告，[https://www.arxiv.org/abs/2602.17004](https://www.arxiv.org/abs/2602.17004)

-   3月4日，尖峰、稀疏与沉没：大规模激活与注意力沉溺的剖析，[https://arxiv.org/abs/2603.05498](https://arxiv.org/abs/2603.05498)

-   3月12日，Tiny Aya：连接规模与多语言深度，[https://arxiv.org/abs/2603.11510](https://arxiv.org/abs/2603.11510)

-   3月15日，注意力残差，[https://arxiv.org/abs/2603.15031](https://arxiv.org/abs/2603.15031)

-   3月16日，Mamba-3：利用状态空间原理改进序列建模，[https://arxiv.org/abs/2603.15569](https://arxiv.org/abs/2603.15569)

-   3月31日，从注意力到Mamba：跨架构蒸馏的秘诀，[https://arxiv.org/abs/2604.14191](https://arxiv.org/abs/2604.14191)

-   4月13日，Nemotron 3 Super：面向智能体推理的开放、高效混合专家Mamba-Transformer模型，[https://arxiv.org/abs/2604.12374](https://arxiv.org/abs/2604.12374)

-   5月6日，ZAYA1-8B技术报告，[https://arxiv.org/abs/2605.05365](https://arxiv.org/abs/2605.05365)

-   5月13日，Delta注意力残差，[https://arxiv.org/abs/2605.18855](https://arxiv.org/abs/2605.18855)

-   5月21日，门控DeltaNet-2：在线性注意力中解耦擦除与写入，[https://arxiv.org/abs/2605.22791](https://arxiv.org/abs/2605.22791)

-   5月25日，MiniMax-M2系列：以微小激活释放最大现实世界智能，[https://arxiv.org/abs/2605.26494](https://arxiv.org/abs/2605.26494)

本部分涉及训练系统、适配方法与扩展策略。这些论文并非（全部）关于从头预训练。部分聚焦于微调、蒸馏、测试时训练，或在受限硬件上优化训练效果。
