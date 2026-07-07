---
title: Understanding and Implementing Qwen3 From Scratch
url: 'https://magazine.sebastianraschka.com/p/qwen3-from-scratch'
url_hash: c52b4cee69ffc817b5366e03aded7f1b464b2d42
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-09-06T08:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - Rust
  - 创业
original_lang: en
truncated: false
---
此前，我在《大型LLM架构对比》一文中比较了2025年最值得关注的开源权重架构。随后，我在《从GPT-2到gpt-oss：架构演进分析》中从概念层面深入探讨了各种架构组件。

既然好事成三，在介绍今年夏天一些值得关注的研究亮点之前，我想现在通过代码亲手实践这些架构。跟随本文，你将理解这些架构在底层是如何运作的，并掌握可用于自己实验或项目的构建模块。

为此，我选择了Qwen3（[最初于5月发布](https://arxiv.org/abs/2505.09388)，7月更新），因为它是目前最受欢迎和使用最广泛的开源权重模型系列之一。

在我看来，Qwen3模型如此受欢迎的原因如下：

1.  采用对开发者友好且商业友好的开源协议（[Apache许可证 v2.0](https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE)），除原始开源许可条款外无任何附加条件（其他一些开源权重LLM会施加额外使用限制）

2.  性能非常出色；例如，截至本文撰写时，开源权重235B-Instruct变体在[LMArena排行榜](https://lmarena.ai/leaderboard/text)上排名第8，与闭源的Claude Opus 4并列。排名更高的另外两个开源权重LLM分别是DeepSeek 3.1（体积大3倍）和Kimi K2（体积大4倍）。9月5日，[Qwen3在其平台上发布了1万亿参数的"max"变体](https://x.com/Alibaba_Qwen/status/1963991502440562976)，在所有主要基准测试上均超越Kimi K2、DeepSeek 3.1和Claude Opus 4；不过该模型目前仍为闭源。

3.  提供多种不同规模的模型，适用于不同的计算预算和使用场景，从0.6B密集模型到480B参数的混合专家模型。

由于本文包含纯PyTorch的从头实现代码，篇幅较长。虽然代码部分可能看起来有些冗长，但我希望它们能比单纯的概念图更好地解释各个构建模块！

**提示1：** 如果你在电子邮件收件箱中阅读本文，较窄的行宽可能导致代码片段换行混乱。为获得更好的阅读体验，建议[在浏览器中打开](https://magazine.sebastianraschka.com/p/qwen3-from-scratch)。

**提示2：** 你可以使用网站左侧的目录在各章节间更轻松地导航。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!_APX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!_APX!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 424w, https://substackcdn.com/image/fetch/$s_!_APX!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 848w, https://substackcdn.com/image/fetch/$s_!_APX!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 1272w, https://substackcdn.com/image/fetch/$s_!_APX!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!_APX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png" width="1456" height="652" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/bb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:652,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:892224,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/172832845?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!_APX!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 424w, https://substackcdn.com/image/fetch/$s_!_APX!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 848w, https://substackcdn.com/image/fetch/$s_!_APX!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 1272w, https://substackcdn.com/image/fetch/$s_!_APX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb3d5266-b65a-45ea-9f8f-98d7d8038b8e_3432x1536.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图1：本文讨论并用纯PyTorch（重新）实现的Qwen3密集模型和混合专家架构预览。</figcaption></figure>
