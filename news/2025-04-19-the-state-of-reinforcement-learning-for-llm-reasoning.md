---
title: The State of Reinforcement Learning for LLM Reasoning
url: >-
  https://magazine.sebastianraschka.com/p/the-state-of-llm-reasoning-model-training
url_hash: 7b05b9b64a586ec61f6b0abd5fb4944c2429d065
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-04-19T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
本月发生了很多大事，尤其是 GPT-4.5 和 Llama 4 等新旗舰模型的发布。但你可能注意到，业界对这些发布的反应相对平淡。为什么？一个可能的原因是，GPT-4.5 和 Llama 4 仍然是传统模型，这意味着它们在训练过程中没有针对推理进行明确的强化学习。

与此同时，xAI 和 Anthropic 等竞争对手已在其模型中加入了更多推理能力和功能。例如，xAI 的 Grok 和 Anthropic 的 Claude 界面现在都为某些模型提供了一个“思考”（或“扩展思考”）按钮，可以明确地切换推理能力。

无论如何，对 GPT-4.5 和 Llama 4（非推理）模型的平淡反应表明，我们正在接近仅靠扩展模型规模和数据所能达到的极限。

然而，OpenAI 最近发布的 o3 推理模型表明，在战略性投入计算资源方面，特别是通过针对推理任务定制的强化学习方法，仍有相当大的改进空间。（根据 OpenAI 员工在最近的直播中透露，o3 使用的训练计算量是 o1 的 10 倍。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!DWHh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!DWHh!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 424w, https://substackcdn.com/image/fetch/$s_!DWHh!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 848w, https://substackcdn.com/image/fetch/$s_!DWHh!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 1272w, https://substackcdn.com/image/fetch/$s_!DWHh!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!DWHh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png" width="693" height="432.1730769230769" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/b06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:908,&quot;width&quot;:1456,&quot;resizeWidth&quot;:693,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:false,&quot;topImage&quot;:true,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!DWHh!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 424w, https://substackcdn.com/image/fetch/$s_!DWHh!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 848w, https://substackcdn.com/image/fetch/$s_!DWHh!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 1272w, https://substackcdn.com/image/fetch/$s_!DWHh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb06be25e-c103-4554-ba16-6e84ed6a5f1c_1600x998.png 1456w" sizes="100vw" fetchpriority="high"></picture></div></a><figcaption><em>来源：OpenAI 直播 (https://openai.com/live/) 于 2025 年 4 月 16 日</em></figcaption></figure>

虽然推理本身并非万能药，但它确实能可靠地提高模型在复杂任务上的准确性和问题解决能力（至少目前如此）。我预计，以推理为重点的后训练将成为未来 LLM 流程中的标准做法。

那么，在本文中，让我们探讨一下通过强化学习进行推理的最新发展。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!2SLQ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!2SLQ!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 424w, https://substackcdn.com/image/fetch/$s_!2SLQ!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 848w, https://substackcdn.com/image/fetch/$s_!2SLQ!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 1272w, https://substackcdn.com/image/fetch/$s_!2SLQ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!2SLQ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png" width="713" height="497.532967032967" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1016,&quot;width&quot;:1456,&quot;resizeWidth&quot;:713,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:false,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!2SLQ!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 424w, https://substackcdn.com/image/fetch/$s_!2SLQ!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 848w, https://substackcdn.com/image/fetch/$s_!2SLQ!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 1272w, https://substackcdn.com/image/fetch/$s_!2SLQ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F739d9d44-4d24-4d82-bbe8-a68ae5bedd2c_1600x1116.png 1456w" sizes="100vw"></picture></div></a><figcaption><em>本文重点介绍用于开发和改进推理模型的强化学习训练方法</em></figcaption></figure>

由于文章篇幅较长，我在下方提供了目录概览。要导航目录，请在网页视图中使用左侧的滑块。

-   理解推理模型
-   RLHF 基础：一切开始的地方
-   PPO 简介：强化学习的主力算法
-   强化学习算法：从 PPO 到 GRPO
-   强化学习奖励建模：从 RLHF 到 RLVR
-   DeepSeek-R1 推理模型是如何训练的
-   近期关于训练推理模型的强化学习论文的经验教训
-   关于训练推理模型的值得注意的研究论文

**提示：** 如果你已经熟悉推理基础、强化学习、PPO 和 GRPO，请直接跳转到“近期关于训练推理模型的强化学习论文的经验教训”部分，其中包含近期推理研究论文中有趣见解的摘要。

房间里的大象当然是推理的定义。简而言之，推理是关于使 LLM 更擅长处理复杂任务的推理和训练技术。

为了更详细地说明这是如何实现的（到目前为止），我想将推理定义如下：

在大型语言模型（LLM）的语境中，“推理”指的是模型在给出最终答案之前生成中间步骤的能力。这一过程通常被称为思维链（CoT）推理。在CoT推理中，LLM会显式地生成一系列结构化的陈述或计算，以说明其如何得出结论。

下面是一张示意图及其定义。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!mB5l!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!mB5l!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 424w, https://substackcdn.com/image/fetch/$s_!mB5l!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 848w, https://substackcdn.com/image/fetch/$s_!mB5l!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 1272w, https://substackcdn.com/image/fetch/$s_!mB5l!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!mB5l!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png" width="595" height="438.58247422680415" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:858,&quot;width&quot;:1164,&quot;resizeWidth&quot;:595,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!mB5l!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 424w, https://substackcdn.com/image/fetch/$s_!mB5l!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 848w, https://substackcdn.com/image/fetch/$s_!mB5l!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 1272w, https://substackcdn.com/image/fetch/$s_!mB5l!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d4e5157-5a68-4a37-807d-9d6a2f933084_1164x858.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>一个简化的示意图，展示了LLM如何处理多步推理任务。模型并非仅仅回忆一个事实，而是需要结合多个中间推理步骤才能得出正确的结论。根据具体实现，这些中间推理步骤可能会或可能不会展示给用户。</em></figcaption></figure>

如果你对推理模型还不熟悉，希望获得更全面的介绍，我推荐你阅读我之前的文章：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!l4Ze!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01d8ee9a-933b-4e66-8ad8-28056a0fdd73_1628x1076.png">![初探从零开始的推理：第一章](https://substackcdn.com/image/fetch/$s_!l4Ze!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01d8ee9a-933b-4e66-8ad8-28056a0fdd73_1628x1076.png)

](https://magazine.sebastianraschka.com/p/first-look-at-reasoning-from-scratch)

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!QwUc!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6ebc5c9-461f-4d3a-889b-b8ea4e14e5ba_1600x830.png">![理解推理型LLM](https://substackcdn.com/image/fetch/$s_!QwUc!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6ebc5c9-461f-4d3a-889b-b8ea4e14e5ba_1600x830.png)

](https://magazine.sebastianraschka.com/p/understanding-reasoning-llms)

现在，正如本节开头所暗示的，LLM的推理能力可以通过两种方式提升，OpenAI一篇博客文章中的示意图很好地说明了这一点：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Vxu-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Vxu-!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 424w, https://substackcdn.com/image/fetch/$s_!Vxu-!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 848w, https://substackcdn.com/image/fetch/$s_!Vxu-!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 1272w, https://substackcdn.com/image/fetch/$s_!Vxu-!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Vxu-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png" width="702" height="469.60714285714283" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/fb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:974,&quot;width&quot;:1456,&quot;resizeWidth&quot;:702,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Vxu-!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 424w, https://substackcdn.com/image/fetch/$s_!Vxu-!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 848w, https://substackcdn.com/image/fetch/$s_!Vxu-!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 1272w, https://substackcdn.com/image/fetch/$s_!Vxu-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb229cbf-7e4c-4633-ae1f-50266d791abc_1600x1070.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>准确率的提升可以通过增加训练计算量或测试时计算量来实现，其中测试时计算量与推理时计算量及推理时扩展是同义词。来源：来自 https://openai.com/index/learning-to-reason-with-llms/ 的注释图</em></figcaption></figure>

在我之前的文章中：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!IOSP!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faf9e2677-652a-4af1-9f57-dc0c253d2198_1448x1260.png">![LLM推理模型推理的现状](https://substackcdn.com/image/fetch/$s_!IOSP!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faf9e2677-652a-4af1-9f57-dc0c253d2198_1448x1260.png)

](https://magazine.sebastianraschka.com/p/state-of-llm-reasoning-and-inference-scaling)

我主要关注了测试时计算方法。**而在本文中，我终于想更深入地探讨一下训练方法。**

用于构建和改进推理模型的强化学习（RL）训练方法，或多或少都与用于开发和对齐传统LLM的基于人类反馈的强化学习（RLHF）方法相关。因此，在讨论基于RL训练的具体推理改进方法之前，我想先简要回顾一下RLHF的工作原理。

传统的LLM通常经历一个三步训练流程：

1.  预训练

2.  监督微调

3.  对齐（通常通过RLHF）

“原始”的LLM对齐方法是RLHF，它是开发LLM的标准流程的一部分，遵循了InstructGPT论文中描述的配方，该配方曾用于开发最初的ChatGPT模型。

RLHF的原始目标是使LLM与人类偏好对齐。例如，假设你多次使用一个LLM，对于给定的提示，它生成了多个答案。RLHF会引导LLM更多地生成你偏好的那种答案风格。（通常，RLHF也用于对LLM进行安全调优：避免分享敏感信息、使用脏话等。）

如果你对RLHF还不熟悉，这里是我几年前一次演讲的节选，用不到5分钟解释了RLHF：

<iframe src="https://www.youtube-nocookie.com/embed/vJ4SsfmeQlk?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

或者，下面的段落以文字形式描述了RLHF。

RLHF流程会取一个预训练模型，并以监督方式对其进行微调。这个微调还不是强化学习部分，而主要是前提条件。

然后，RLHF使用一种名为近端策略优化（PPO）的算法进一步对齐LLM。（注意，还有其他算法可以替代PPO；我特意提到PPO是因为它是RLHF最初使用的算法，至今仍是最流行的。）

为简单起见，我们将RLHF流程分为三个独立步骤：

-   RLHF步骤1（前提条件）：对预训练模型进行监督微调（SFT）
-   RLHF步骤2：创建奖励模型
-   RLHF步骤3：通过近端策略优化（PPO）进行微调

如下所示，RLHF步骤1是一个监督微调步骤，用于创建后续RLHF微调的基础模型。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!MiKW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!MiKW!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 424w, https://substackcdn.com/image/fetch/$s_!MiKW!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 848w, https://substackcdn.com/image/fetch/$s_!MiKW!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 1272w, https://substackcdn.com/image/fetch/$s_!MiKW!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!MiKW!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png" width="658" height="304.59615384615387" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:674,&quot;width&quot;:1456,&quot;resizeWidth&quot;:658,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!MiKW!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 424w, https://substackcdn.com/image/fetch/$s_!MiKW!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 848w, https://substackcdn.com/image/fetch/$s_!MiKW!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 1272w, https://substackcdn.com/image/fetch/$s_!MiKW!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef3ddcf-1a49-45a2-950e-49ebf56e80f4_1600x741.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>来自InstructGPT论文的注释图，https://arxiv.org/abs/2203.02155</figcaption></figure>

在RLHF步骤1中，我们创建或采样提示（例如从数据库中），并请人类编写高质量的回复。然后我们使用这个数据集以监督方式微调预训练的基础模型。如前所述，这严格来说不属于RL训练的一部分，而只是一个前提条件。

在RLHF步骤2中，我们使用这个来自监督微调（SFT）的模型来创建奖励模型，如下所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!At37!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!At37!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 424w, https://substackcdn.com/image/fetch/$s_!At37!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 848w, https://substackcdn.com/image/fetch/$s_!At37!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 1272w, https://substackcdn.com/image/fetch/$s_!At37!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!At37!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png" width="658" height="345.2692307692308" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:764,&quot;width&quot;:1456,&quot;resizeWidth&quot;:658,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!At37!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 424w, https://substackcdn.com/image/fetch/$s_!At37!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 848w, https://substackcdn.com/image/fetch/$s_!At37!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 1272w, https://substackcdn.com/image/fetch/$s_!At37!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aca23a9-df94-4054-a8ef-5d109d8daa47_1600x840.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>来自InstructGPT论文的注释图，https://arxiv.org/abs/2203.02155</figcaption></figure>

如上图所示，对于每个提示，我们从之前步骤微调后的LLM生成四个回复。然后，人类标注者根据他们的偏好对这些回复进行排序。虽然这个排序过程耗时，但可能比创建监督微调的数据集稍微省力一些，因为对回复进行排序可能比编写回复更简单。

在收集了包含这些排序的数据集后，我们可以设计一个奖励模型，为RLHF步骤3的后续优化阶段输出奖励分数。这里的思路是，奖励模型取代并自动化了劳动密集型的人类排序，使得在大型数据集上进行训练变得可行。

这个奖励模型（RM）通常源自之前监督微调（SFT）步骤中创建的LLM。为了将RLHF步骤1中的模型转变为奖励模型，其输出层（下一个token分类层）被替换为一个回归层，该层具有单个输出节点。

RLHF 流程的第三步是利用奖励模型（RM）对之前通过监督微调（SFT）得到的模型进行微调，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Ak0r!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Ak0r!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 424w, https://substackcdn.com/image/fetch/$s_!Ak0r!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 848w, https://substackcdn.com/image/fetch/$s_!Ak0r!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 1272w, https://substackcdn.com/image/fetch/$s_!Ak0r!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Ak0r!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png" width="643" height="332.98214285714283" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/c374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:754,&quot;width&quot;:1456,&quot;resizeWidth&quot;:643,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Ak0r!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 424w, https://substackcdn.com/image/fetch/$s_!Ak0r!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 848w, https://substackcdn.com/image/fetch/$s_!Ak0r!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 1272w, https://substackcdn.com/image/fetch/$s_!Ak0r!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc374a894-975e-4c42-9bc8-a8ac1fe06af8_1600x829.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>来自 InstructGPT 论文的注释图，https://arxiv.org/abs/2203.02155</figcaption></figure>

在 RLHF 的第三步，即最后阶段，我们根据在 RLHF 第二步中创建的奖励模型给出的奖励分数，使用近端策略优化（PPO）来更新 SFT 模型。

如前所述，原始的 RLHF 方法使用了一种名为近端策略优化（PPO）的强化学习算法。

PPO 旨在提高策略训练的稳定性和效率。（在强化学习中，“策略”仅指我们想要训练的模型；在此例中，策略 = 大语言模型。）

PPO 的一个关键思想是，它限制了每次更新步骤中策略允许变化的程度。这是通过使用一个裁剪后的损失函数来实现的，这有助于防止模型进行可能破坏训练稳定性的过大更新。

除此之外，PPO 还在损失函数中加入了 KL 散度惩罚项。这一项将当前策略（正在训练的模型）与原始的 SFT 模型进行比较。这鼓励更新保持合理接近。毕竟，其目的是对模型进行偏好微调，而不是完全重新训练。

这就是“近端策略优化”中“近端”一词的由来：该算法在允许改进的同时，力求使更新接近现有模型。为了鼓励一定的探索，PPO 还增加了一个熵奖励，这鼓励模型在训练期间产生多样化的输出。

在接下来的段落中，我想介绍更多的术语，以便在相对较高的层面上说明 PPO。不过，其中涉及很多专业术语，因此我尝试在继续之前，在下图中总结关键术语。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!pmzH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!pmzH!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 424w, https://substackcdn.com/image/fetch/$s_!pmzH!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 848w, https://substackcdn.com/image/fetch/$s_!pmzH!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 1272w, https://substackcdn.com/image/fetch/$s_!pmzH!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!pmzH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png" width="669" height="578.4828296703297" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1259,&quot;width&quot;:1456,&quot;resizeWidth&quot;:669,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!pmzH!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 424w, https://substackcdn.com/image/fetch/$s_!pmzH!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 848w, https://substackcdn.com/image/fetch/$s_!pmzH!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 1272w, https://substackcdn.com/image/fetch/$s_!pmzH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>RLHF 关键术语的图解。例如，PPO 涉及多个模型，而 PPO 是 RLHF 中使用的一种算法（RLHF 是最流行的大语言模型对齐方法之一）。</figcaption></figure>

下面，我旨在通过伪代码说明 PPO 的关键步骤。

此外，为了更直观，我还会用一个类比：想象你是一名经营小型送餐服务的厨师。你不断尝试新的食谱变体来提高顾客满意度。你的总体目标是根据顾客反馈（奖励）来调整你的食谱（策略）。

**1. 计算新策略与旧策略的下一个 token 概率之比：**

```
ratio = new_policy_prob / old_policy_prob
```

简而言之，这检查了我们的新食谱与旧食谱有多大不同。

附注：关于"new\_policy\_prob"，我们尚未使用最终更新后的策略，而是采用当前版本的策略（即正在训练中的模型）。但按照惯例，我们仍称之为"新策略"。因此，即使你仍在实验阶段，根据惯例，我们也会将你当前的草稿称为"新策略"。

**2\. 将该比率乘以行动的好坏程度（称为优势）：**

```
raw_score = ratio * advantage
```

此处为简化起见，我们可以假设优势是基于奖励信号计算的：

```
advantage = actual_reward - expected_reward
```

在厨师类比中，我们可以将优势理解为新菜品的表现：

```
advantage = customer_rating - expected_rating
```

例如，如果顾客给新菜品打9/10分，而顾客通常给我们打7/10分，那么优势就是+2。

请注意，这是一个简化版本。实际上，这涉及广义优势估计（GAE），为避免文章过于冗长，此处略去不提。但有一个重要细节需要提及：预期奖励由所谓的"评论家"（有时也称为"价值模型"）计算，而实际奖励则由奖励模型计算。也就是说，优势计算涉及另外两个模型，其规模通常与我们正在微调的原始模型相同。

在类比中，我们可以将这位评论家或价值模型想象成一位朋友：我们在将新菜品端给顾客之前，先请他试吃。我们还请这位朋友预估顾客会如何评价（即预期奖励）。而奖励模型则是实际顾客给出的反馈（即实际奖励）。

**3\. 计算裁剪后的分数：**

如果新策略变化过大（例如，比率 > 1.2 或 < 0.8），我们会对比率进行裁剪，如下所示：

```
clipped_ratio = clamp(ratio, 0.8, 1.2)
clipped_score = clipped_ratio * advantage
```

在类比中，假设新食谱获得了异常出色（或糟糕）的评价。我们可能会想立即全面调整菜单，但这风险太大。因此，我们暂时限制食谱的变化幅度。（例如，也许我们让菜品变得更辣，而那位顾客恰好喜欢辣食，但这并不意味着其他顾客也会喜欢。）

**4\. 然后，我们取原始分数和裁剪后分数中较小的一个：**

```
final_score = min(raw_score, clipped_score)
```

（感谢 Johanna Reiml 指出之前 PPO 下界属性的问题，现已修正。）

同样，这与保持谨慎有关。例如，如果优势为正（新行为更好），我们会限制奖励。这是因为我们不想过度信任可能只是巧合或运气的好结果。

如果优势为负（新行为更差），我们会限制惩罚。这里的思路类似，即我们不想因为一次糟糕的结果就过度反应，除非我们非常确定。

简而言之，如果优势为正，我们使用两个分数中较小的那个（避免过度奖励）；如果优势为负，则使用较大的那个（避免过度惩罚）。

用类比来说，这确保了如果某个菜谱表现超出预期，我们不会在不确定的情况下过度奖励它；而如果它表现不佳，我们也不会在它并非持续糟糕时过度惩罚它。

**5. 计算损失：**

这个最终分数是我们在训练过程中最大化的目标（通过翻转分数符号后使用梯度下降法进行最小化）。此外，我们还会添加一个 KL 惩罚项，其中 β 是惩罚强度的超参数：

```
loss = -final_score + β * KL(new_policy || reference_policy)
```

用类比来说，我们添加惩罚项是为了确保新菜谱不会与原有风格相差太大。这可以防止你每周都“彻底改造厨房”。例如，我们不想突然把一家意大利餐厅变成烧烤店。

信息量很大，所以我用下面图中一个具体的、在 LLM 背景下的数值例子进行了总结。但如果觉得太复杂，请随意跳过；你应该能顺利理解文章的其余部分。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!L93y!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!L93y!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 424w, https://substackcdn.com/image/fetch/$s_!L93y!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 848w, https://substackcdn.com/image/fetch/$s_!L93y!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 1272w, https://substackcdn.com/image/fetch/$s_!L93y!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!L93y!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png" width="1274" height="1956" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1956,&quot;width&quot;:1274,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:309104,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/161572341?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!L93y!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 424w, https://substackcdn.com/image/fetch/$s_!L93y!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 848w, https://substackcdn.com/image/fetch/$s_!L93y!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 1272w, https://substackcdn.com/image/fetch/$s_!L93y!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16bdf3ea-2674-40be-96ba-d3479410430e_1274x1956.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

我承认，关于 PPO 的讲解可能有点过头了。但既然已经写出来了，删掉又觉得可惜。希望其中一些内容对你们有用！

话虽如此，**下一节中相关的核心要点是，PPO 涉及多个模型：**

**1. 策略模型，即经过 SFT 训练、我们希望进一步对齐的 LLM。**
**2. 奖励模型，即经过训练用于预测奖励的模型（参见 RLHF 步骤 2）。**
**3. 评论家模型，即一个可训练的、用于估计奖励的模型。**
**4. 参考模型（原始策略），用于确保策略模型不会偏离太远。**

顺便提一下，你可能好奇为什么既需要奖励模型又需要评论家模型。奖励模型通常在使用 PPO 训练策略模型之前就已训练好。它的作用是自动化人类评审员的偏好标注，并为策略 LLM 生成的完整响应给出分数。

相比之下，评论家模型评判的是部分响应。我们用它来构建最终响应。奖励模型通常保持冻结状态，而评论家模型在训练过程中会不断更新，以更好地估计奖励模型给出的奖励。

关于PPO的更多细节超出了本文的讨论范围，但感兴趣的读者可以在以下四篇早于InstructGPT论文的文献中找到数学细节：

(1) [异步深度强化学习方法](https://arxiv.org/abs/1602.01783)（2016年），作者Mnih、Badia、Mirza、Graves、Lillicrap、Harley、Silver和Kavukcuoglu，介绍了策略梯度方法作为基于深度学习的强化学习中Q学习的替代方案。

(2) [近端策略优化算法](https://arxiv.org/abs/1707.06347)（2017年），作者Schulman、Wolski、Dhariwal、Radford和Klimov，提出了一种改进的近端策略强化学习流程，相比上述原始策略优化算法，其数据效率更高、可扩展性更强。

(3) [基于人类偏好的语言模型微调](https://arxiv.org/abs/1909.08593)（2020年），作者Ziegler、Stiennon、Wu、Brown、Radford、Amodei、Christiano和Irving，阐述了将PPO和奖励学习应用于预训练语言模型的概念，包括使用KL正则化防止策略偏离自然语言过远。

(4) [从人类反馈中学习摘要生成](https://arxiv.org/abs/2009.01325)（2022年），作者Stiennon、Ouyang、Wu、Ziegler、Lowe、Voss、Radford、Amodei和Christiano，引入了广为人知的RLHF三步流程，该流程后来也被用于[InstructGPT论文](https://arxiv.org/abs/2203.02155)。

如前所述，PPO是RLHF最初使用的算法。从技术角度来看，它在用于开发推理模型的强化学习流程中运行得非常好。然而，DeepSeek-R1在其强化学习流程中使用的是一种名为“群体相对策略优化”（GRPO）的算法，该算法在他们早期的一篇论文中提出：

- [DeepSeekMath：推动开放语言模型数学推理的极限](https://arxiv.org/abs/2402.03300)（2024年）

DeepSeek团队将GRPO描述为：

> 一种近端策略优化（PPO）的变体，在增强数学推理能力的同时，优化了PPO的内存使用。

因此，**这里的关键动机是提高计算效率。**

效率提升是通过舍弃“评论家”（价值模型）实现的，即不再使用计算价值函数（即预期未来奖励）的大型语言模型。

GRPO没有依赖这个额外模型来计算估计奖励以得出优势值，而是采用了一种更简单的方法：直接从策略模型本身采样多个答案，并利用它们的相对质量来计算优势值。

为了说明PPO和GRPO之间的差异，我从DeepSeekMath论文中借用了这张精美的示意图：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!z_Sr!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!z_Sr!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 424w, https://substackcdn.com/image/fetch/$s_!z_Sr!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 848w, https://substackcdn.com/image/fetch/$s_!z_Sr!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 1272w, https://substackcdn.com/image/fetch/$s_!z_Sr!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!z_Sr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png" width="1456" height="794" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/aae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:794,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!z_Sr!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 424w, https://substackcdn.com/image/fetch/$s_!z_Sr!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 848w, https://substackcdn.com/image/fetch/$s_!z_Sr!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 1272w, https://substackcdn.com/image/fetch/$s_!z_Sr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faae68a20-4c1b-44a2-af8b-693e8efb21e4_1600x872.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>来自DeepSeekMath论文（https://arxiv.org/abs/2402.03300）的注释图，用于说明PPO和GRPO之间的差异。</figcaption></figure>

到目前为止，我们将RLHF视为一个流程，并介绍了两种常用于该流程的强化学习算法：PPO和GRPO。

但如果RLHF已经是大型语言模型对齐工具包的核心组成部分，那么这一切与推理有什么关系呢？

RLHF与推理之间的联系在于，DeepSeek团队采用了类似的基于强化学习的方法（使用GRPO）来训练其R1和R1-Zero模型的推理能力。

区别在于，DeepSeek-R1团队没有依赖*人类偏好和训练奖励模型*，而是使用了**可验证奖励**。这种方法被称为基于可验证奖励的强化学习（RLVR）。

再次强调：与标准RLHF不同，RLVR绕过了对奖励模型的需求。

因此，模型不再从人工标注的样本中学习什么是"好"答案，而是通过确定性工具（如符号验证器或基于规则的检查工具）获得直接的二元反馈（正确或错误）。可以想象成数学问题中的计算器，或代码生成中的编译器。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!9KP1!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!9KP1!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 424w, https://substackcdn.com/image/fetch/$s_!9KP1!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 848w, https://substackcdn.com/image/fetch/$s_!9KP1!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 1272w, https://substackcdn.com/image/fetch/$s_!9KP1!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!9KP1!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png" width="525" height="297.83653846153845" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/fb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:826,&quot;width&quot;:1456,&quot;resizeWidth&quot;:525,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!9KP1!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 424w, https://substackcdn.com/image/fetch/$s_!9KP1!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 848w, https://substackcdn.com/image/fetch/$s_!9KP1!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 1272w, https://substackcdn.com/image/fetch/$s_!9KP1!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffb315cfb-fdc6-4e3f-be74-7c8cb00ea09e_1586x900.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>基于可验证奖励的强化学习（RLVR）示例。模型被要求解决一个数学问题并给出答案。不是使用学习到的奖励模型，而是由符号验证器（例如计算器）检查输出，并根据正确性提供二元反馈。</em></figcaption></figure>

这样做的一个动机是，通过使用自动正确性检查作为RL期间的监督信号，来避免有噪声或昂贵的人工或学习奖励。另一个动机是，通过使用计算器等"廉价"工具，我们可以替代昂贵的奖励模型训练以及奖励模型本身。由于奖励模型通常是整个预训练模型（但带有一个回归头），RLVR的效率要高得多。

简而言之，DeepSeek-R1使用了结合GRPO的RLVR，从而在训练过程中消除了两个昂贵的模型：奖励模型和价值模型（评论家），如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!g4uq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!g4uq!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 424w, https://substackcdn.com/image/fetch/$s_!g4uq!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 848w, https://substackcdn.com/image/fetch/$s_!g4uq!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 1272w, https://substackcdn.com/image/fetch/$s_!g4uq!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!g4uq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png" width="1456" height="828" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:828,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!g4uq!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 424w, https://substackcdn.com/image/fetch/$s_!g4uq!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 848w, https://substackcdn.com/image/fetch/$s_!g4uq!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 1272w, https://substackcdn.com/image/fetch/$s_!g4uq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F44fa9529-7e3a-44ca-b0f8-2401423bf7ab_1600x910.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>LLM训练中强化学习设置的比较。传统的基于PPO的RLHF同时使用奖励模型（基于人类偏好训练）和评论家（价值模型）来指导学习。GRPO消除了评论家模型。结合GRPO的RLVR更进一步，也移除了奖励模型，转而依赖来自计算器或编译器这类符号工具的可验证奖励。</em></figcaption></figure>

在下一节中，我想简要回顾一下DeepSeek-R1的流程，并讨论DeepSeek团队使用的不同可验证奖励。

现在我们已经明确了RLHF和RLVR，以及PPO和GRPO是什么，接下来让我们在强化学习和推理的背景下，简要回顾一下DeepSeek-R1论文的主要见解。

首先，存在三种类型的模型：

1.  DeepSeek-R1-Zero：仅使用纯RL训练

2.  DeepSeek-R1：使用指令微调（SFT）和RL训练

3.  DeepSeek-Distill变体：通过指令微调SFT创建，不使用RL

我创建了一个DeepSeek-R1流程示意图，来说明这些模型之间的关系，如下所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!abwB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!abwB!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 424w, https://substackcdn.com/image/fetch/$s_!abwB!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 848w, https://substackcdn.com/image/fetch/$s_!abwB!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 1272w, https://substackcdn.com/image/fetch/$s_!abwB!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!abwB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png" width="1456" height="1127" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1127,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!abwB!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 424w, https://substackcdn.com/image/fetch/$s_!abwB!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 848w, https://substackcdn.com/image/fetch/$s_!abwB!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 1272w, https://substackcdn.com/image/fetch/$s_!abwB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f17a2fc-0cbf-446d-bd27-fc8c6ac4117a_1600x1238.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>DeepSeek-R1系列模型的训练流程</em></figcaption></figure>

**DeepSeek-R1-Zero** 使用 GRPO 结合可验证奖励（RLVR）进行训练，结果证明这足以让模型通过中间步骤生成展现出推理能力。这表明跳过 SFT 阶段是可行的。模型通过探索而非从示例中学习来提升推理能力。

**DeepSeek-R1** 是旗舰模型，性能最佳。与 DeepSeek-R1-Zero 相比，其区别在于交替进行了指令微调、RLVR 和 RLHF。

**DeepSeek-Distill** 变体旨在成为小型且更易部署的模型；它们是通过使用 DeepSeek-R1 模型的指令数据对 Llama 3 和 Qwen 2.5 模型进行指令微调生成的。这种方法在推理部分未使用任何 RL（不过，创建 Llama 3 和 Qwen 2.5 基础模型时使用了 RLHF）。

有关 DeepSeek-R1 管道的更多详细解释，请参阅我之前的文章“理解推理型 LLM”：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!QwUc!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6ebc5c9-461f-4d3a-889b-b8ea4e14e5ba_1600x830.png">![理解推理型 LLM](https://substackcdn.com/image/fetch/$s_!QwUc!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6ebc5c9-461f-4d3a-889b-b8ea4e14e5ba_1600x830.png)

](https://magazine.sebastianraschka.com/p/understanding-reasoning-llms)

这里的主要收获是，DeepSeek 团队没有使用基于 LLM 的奖励模型来训练 DeepSeek-R1-Zero。相反，他们使用基于规则的奖励来对 DeepSeek-R1-Zero 和 DeepSeek-R1 进行推理训练：

> 在开发 DeepSeek-R1-Zero 时，我们没有应用结果或过程神经奖励模型，因为我们发现神经奖励模型在大规模强化学习过程中可能遭受奖励破解 \[...\]

> 为了训练 DeepSeek-R1-Zero，我们采用了一个基于规则的奖励系统，主要包括两种奖励：

> (1) 准确性奖励：准确性奖励模型评估响应是否正确。例如，在结果确定的数学问题中，模型需要以指定格式（例如，在方框内）提供最终答案，从而实现可靠的基于规则的正确性验证。类似地，对于 LeetCode 问题，可以使用编译器根据预定义的测试用例生成反馈。

> (2) 格式奖励：除了准确性奖励模型，我们还采用了一个格式奖励模型，强制模型将其思考过程放在 '<think>' 和 '</think>' 标签之间。

我意识到引言（即到目前为止的所有内容）比我预期的要长得多。尽管如此，我认为这个冗长的引言或许对于将以下经验教训置于上下文中是必要的。

在上个月阅读了大量关于推理模型的最新论文后，我在本节中总结了最有趣的想法和见解。（像“[1]”这样的参考文献指向文章末尾列出的相应论文。）

原始的 DeepSeek-R1 论文清楚地表明，监督微调（SFT）后接强化学习（RL）优于单独的 RL。

基于这一观察，直观上，额外的 RL 应该能进一步提升蒸馏模型（因为蒸馏模型本质上是通过使用更大模型生成的推理示例进行 SFT 训练的模型）。

事实上，DeepSeek 团队明确观察到了这一现象：

> 此外，我们发现将强化学习应用于这些蒸馏模型能带来显著的进一步提升。我们认为这值得深入探索，因此此处仅展示简单SFT蒸馏模型的结果。

多个团队独立验证了这些观察结果：

-   \[8\] 研究人员使用1.5B参数的DeepSeek-R1-Distill-Qwen模型，仅用7000个样本和42美元的计算预算，就通过强化学习微调实现了显著的性能提升。令人印象深刻的是，这个小型模型在AIME24数学基准测试上超越了OpenAI的o1-preview。

-   \[15\] 然而，另一个团队提醒说，这些提升可能并不总是具有统计显著性。这表明，尽管强化学习可以改进较小的蒸馏模型，但基准测试结果有时可能夸大了改进幅度。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!oCP8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!oCP8!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 424w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 848w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1272w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!oCP8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png" width="1288" height="888" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/ad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:888,&quot;width&quot;:1288,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!oCP8!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 424w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 848w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1272w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自《A Sober Look at Progress in Language Model Reasoning: Pitfalls and Paths to Reproducibility》的注释图，https://arxiv.org/abs/2504.07086</em></figcaption></figure>

我之前提到，基于可验证奖励的强化学习（RLVR）并不严格需要GRPO算法；DeepSeek的GRPO只是恰好高效且性能良好。

然而，\[12\] 表明，将普通的PPO与基本的二元正确性奖励相结合，就足以在推理能力和响应长度上扩展模型。

更有趣的是，PPO和GRPO都存在长度偏差。多篇论文探索了应对过长错误答案的方法：

-   \[14\] 提供了一项分析，说明PPO如何因损失计算中的数学偏差而无意中偏向更长的响应；GRPO可能也存在同样的问题。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!bkp0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!bkp0!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 424w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 848w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1272w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!bkp0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png" width="495" height="384.3112701252236" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:868,&quot;width&quot;:1118,&quot;resizeWidth&quot;:495,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!bkp0!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 424w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 848w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1272w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自《Concise Reasoning via Reinforcement Learning》的注释图，https://arxiv.org/abs/2504.05185</em></figcaption></figure>

-   作为上述陈述的后续，\[7\] \[10\] 特别指出了GRPO中的长度和难度级别偏差。修改后的变体“Dr. GRPO”通过移除长度和标准差归一化来简化优势计算，提供更清晰的训练信号。

-   \[1\] 在GRPO中明确惩罚冗长的错误答案，同时奖励简洁正确的答案。

-   \[3\] \[6\] 没有直接控制GRPO中的响应长度，但发现token级别的奖励是有益的，使模型能够更好地关注关键的推理步骤。

-   \[5\] 在GRPO中引入了对超过特定长度的响应的明确惩罚，从而在推理过程中实现精确的长度控制。

除了DeepSeek-R1论文中提到的“啊哈”时刻，强化学习已被证明能诱导模型产生有价值的自我验证和反思性推理能力\[2\] \[9\]。有趣的是，与“啊哈”时刻类似，这些能力在训练过程中无需明确指令便自然涌现。

\[1\] 表明，扩展上下文长度（最高可达128k token）能进一步提升模型的自我反思和自我纠正能力。

迄今为止，大多数研究工作都集中在数学或编程背景下的推理任务上。然而，\[4\] 通过在逻辑谜题上训练模型，展示了成功的泛化能力。在逻辑谜题上训练的模型在数学推理任务中也取得了强劲的表现。这证明了强化学习能够诱导独立于特定领域知识的通用推理行为。

作为上一节的延续，另一个有趣的见解[11]是，推理能力可以自然地扩展到数学、代码和逻辑等结构化领域之外。

模型成功地将推理应用于医学、化学、心理学、经济学和教育等领域，利用生成式软评分方法有效处理自由形式的答案。

推理模型值得关注的下一步方向包括：

- 将现有推理模型（如 o1、DeepSeek-R1）与外部工具使用和检索增强生成（RAG）等能力相结合；OpenAI 刚刚发布的 o3 模型为此铺平了道路

- 谈到工具使用和搜索，[9] 表明，赋予推理模型搜索能力会引发自我纠正等行为，并在基准测试中实现稳健的泛化，尽管训练数据集极小。

基于 DeepSeek-R1 团队在维持知识型任务性能方面所经历的种种波折，我认为为推理模型添加搜索能力几乎是理所当然的。

DeepSeek-R1（以及 R1-Zero）背后的基本主张是，RLVR 明确地诱导出推理能力。然而，最近的研究发现[10]表明，包括“顿悟时刻”在内的推理行为，可能已经存在于基础模型中，这是因为它们在预训练阶段接触了大量思维链数据。

我最近对 DeepSeek V3 基础版和 R1 进行的比较强化了这一观察结果，因为更新后的基础模型也表现出了类似推理的行为。例如，原始 V3 和 R1 模型之间的对比清晰地展示了非推理模型与推理模型之间的差异：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!eRCf!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!eRCf!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 424w, https://substackcdn.com/image/fetch/$s_!eRCf!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 848w, https://substackcdn.com/image/fetch/$s_!eRCf!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 1272w, https://substackcdn.com/image/fetch/$s_!eRCf!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!eRCf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png" width="1456" height="941" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:941,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!eRCf!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 424w, https://substackcdn.com/image/fetch/$s_!eRCf!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 848w, https://substackcdn.com/image/fetch/$s_!eRCf!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 1272w, https://substackcdn.com/image/fetch/$s_!eRCf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4c429ead-c30e-4bb3-9aeb-8f9b7fd09645_1600x1034.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

然而，当比较更新后的 V3 基础版与 R1 时，情况就不再如此了：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!oV_S!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!oV_S!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 424w, https://substackcdn.com/image/fetch/$s_!oV_S!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 848w, https://substackcdn.com/image/fetch/$s_!oV_S!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 1272w, https://substackcdn.com/image/fetch/$s_!oV_S!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!oV_S!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png" width="1456" height="899" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:899,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!oV_S!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 424w, https://substackcdn.com/image/fetch/$s_!oV_S!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 848w, https://substackcdn.com/image/fetch/$s_!oV_S!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 1272w, https://substackcdn.com/image/fetch/$s_!oV_S!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67ac85a9-1149-4644-9d28-6f694dc725c5_1600x988.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

此外，[13] 发现，自我反思和自我纠正行为在预训练过程中，会跨不同领域和模型规模逐步涌现。这进一步使得将推理能力完全归因于 RL 方法变得复杂。

或许结论是，RL 确实能将简单的基础模型转变为推理模型。然而，它并非诱导或提升推理能力的唯一途径。正如 DeepSeek-R1 团队所示，蒸馏也能提升推理能力。而且，由于这篇论文中的蒸馏意味着在思维链数据上进行指令微调，那么在包含思维链数据的数据集上进行预训练，很可能也会诱导出这些能力。（正如我在书中通过实操代码所解释的，预训练和指令微调毕竟都基于相同的下一个词元预测任务和损失函数。）

在上个月阅读了大量推理相关论文后，我试图在上一节中总结出最有趣的要点。然而，对于那些对来源更感兴趣、想了解更多细节的读者，我还在本节中列出了 15 篇相关论文作为可选阅读。（为简洁起见，以下摘要按日期排序。）

请注意，这份列表也并不全面（我限制在15篇以内），因为这篇文章已经太长了！

**📄 1月22日，《Kimi k1.5：用强化学习扩展大语言模型》，https://arxiv.org/abs/2501.12599**

有趣的是，这篇论文与DeepSeek-R1论文在同一天发布！在此，作者展示了一个通过强化学习训练的多模态大语言模型。与DeepSeek-R1类似，他们没有使用过程奖励模型（PRM），而是采用了可验证奖励。PRM是一种在强化学习（尤其是在大语言模型训练中）中使用的奖励模型，它不仅评估最终答案，还评估得出答案的推理步骤。

另一个关键点是，扩展上下文长度（最高可达128k tokens）有助于模型在推理过程中进行规划、反思和自我修正。因此，除了与DeepSeek-R1类似的正确性奖励外，他们还设置了长度奖励。具体来说，他们鼓励更短的正确答案，而错误的长答案会受到更重的惩罚。

他们还提出了一种名为long2short的方法，将这些长思维链技能提炼成更高效的短思维链模型。（通过使用模型合并、最短拒绝采样、DPO以及第二轮带有更强长度惩罚的强化学习等方法，从长思维链模型中提炼出更短的正确答案。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!FvXN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!FvXN!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 424w, https://substackcdn.com/image/fetch/$s_!FvXN!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 848w, https://substackcdn.com/image/fetch/$s_!FvXN!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 1272w, https://substackcdn.com/image/fetch/$s_!FvXN!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!FvXN!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png" width="1318" height="724" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:724,&quot;width&quot;:1318,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!FvXN!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 424w, https://substackcdn.com/image/fetch/$s_!FvXN!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 848w, https://substackcdn.com/image/fetch/$s_!FvXN!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 1272w, https://substackcdn.com/image/fetch/$s_!FvXN!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F176ae121-dda5-48ac-8bff-fb63d317c3ac_1318x724.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自Kimi k1.5: Scaling Reinforcement Learning with LLMs的注释图，https://arxiv.org/abs//2501.12599</em></figcaption></figure>

**📄 2月3日，《使用大型推理模型进行竞技编程》，https://arxiv.org/abs/2502.06807**

这篇来自OpenAI的论文评估了他们的o系列模型（如o1、o1-ioi和o3）在竞技编程任务上的表现。虽然论文没有深入探讨强化学习如何应用的技术细节，但仍提供了一些有趣的见解。

首先，这些模型是基于结果的强化学习训练的，而不是基于过程的奖励模型。这与DeepSeek-R1和Kimi等方法类似。

一个有趣的发现是，o3可以自主学习自己的测试时（即推理时扩展）策略。例如，它经常为某个问题编写一个简单的暴力版本（一种牺牲效率换取正确性的方法），然后用它来验证其更优化方案的输出。这种策略并非人工编码；模型是自己摸索出来的。

总的来说，这篇论文认为，扩展通用强化学习可以让模型发展出自己的推理和验证方法，而无需任何人类启发式方法或特定领域的推理流程。相比之下，其他（较早的）模型如o1-ioi依赖于手工制作的测试时策略，例如对数千个样本进行聚类并重新排序，这需要大量的人工设计和调优。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!AFi5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!AFi5!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 424w, https://substackcdn.com/image/fetch/$s_!AFi5!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 848w, https://substackcdn.com/image/fetch/$s_!AFi5!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 1272w, https://substackcdn.com/image/fetch/$s_!AFi5!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!AFi5!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png" width="674" height="408.4172185430464" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/fe06168b-51b5-4d08-8211-3830870218a7_1208x732.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:732,&quot;width&quot;:1208,&quot;resizeWidth&quot;:674,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!AFi5!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 424w, https://substackcdn.com/image/fetch/$s_!AFi5!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 848w, https://substackcdn.com/image/fetch/$s_!AFi5!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 1272w, https://substackcdn.com/image/fetch/$s_!AFi5!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe06168b-51b5-4d08-8211-3830870218a7_1208x732.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自Competitive Programming with Large Reasoning Models的注释图，https://arxiv.org/abs/2502.06807</em></figcaption></figure>

**📄 2月10日，《探索结果奖励在数学推理中的极限》，https://arxiv.org/abs/2502.06781**

本文探讨了仅使用二元“正确”或“错误”反馈（如DeepSeek-R1）的强化学习在解决数学问题方面能走多远。为此，他们首先采用Best-of-N采样收集正例，并对其应用行为克隆，理论上证明这足以优化策略。

为了应对稀疏奖励的挑战（尤其是当长思维链包含部分正确步骤时），他们添加了一个token级别的奖励模型，该模型学会为推理的不同部分分配重要性权重。这有助于模型在学习时聚焦最关键步骤，从而提升整体性能。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!yT5L!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!yT5L!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 424w, https://substackcdn.com/image/fetch/$s_!yT5L!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 848w, https://substackcdn.com/image/fetch/$s_!yT5L!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 1272w, https://substackcdn.com/image/fetch/$s_!yT5L!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!yT5L!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png" width="1390" height="758" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/d3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:758,&quot;width&quot;:1390,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!yT5L!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 424w, https://substackcdn.com/image/fetch/$s_!yT5L!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 848w, https://substackcdn.com/image/fetch/$s_!yT5L!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 1272w, https://substackcdn.com/image/fetch/$s_!yT5L!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3dd40c4-3b95-4ab3-9a74-c282585a8019_1390x758.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自论文《Exploring the Limit of Outcome Reward for Learning Mathematical Reasoning》的注释图，https://arxiv.org/abs/2502.06781</em></figcaption></figure>

**📄 2月20日，** ***Logic-RL: Unleashing LLM Reasoning with Rule-Based Reinforcement Learning*****，https://arxiv.org/abs/2502.14768**

DeepSeek-R1专注于数学和代码任务。这篇论文则使用逻辑谜题作为主要训练数据来训练一个7B模型。

研究人员采用了与DeepSeek-R1类似的基于规则的强化学习设置，但做了几项调整：

1. 他们引入了一种严格的格式奖励，惩罚走捷径的行为，并确保模型使用<think>和<answer>标签将推理过程与最终答案分开。

2. 他们还使用了一个系统提示，明确告诉模型在给出最终答案之前，先逐步思考问题。

即使只用了5000个合成逻辑问题，该模型也发展出了良好的推理能力，并能很好地泛化到更难的数学基准测试（如AIME和AMC）上。

这一点尤其有趣，因为它表明基于逻辑的强化学习训练可以教会模型以超越原始领域的方式进行推理。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!j1cS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!j1cS!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 424w, https://substackcdn.com/image/fetch/$s_!j1cS!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 848w, https://substackcdn.com/image/fetch/$s_!j1cS!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 1272w, https://substackcdn.com/image/fetch/$s_!j1cS!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!j1cS!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png" width="1456" height="819" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:819,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!j1cS!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 424w, https://substackcdn.com/image/fetch/$s_!j1cS!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 848w, https://substackcdn.com/image/fetch/$s_!j1cS!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 1272w, https://substackcdn.com/image/fetch/$s_!j1cS!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36e013eb-b79e-4645-973a-fc8b134c8020_1600x900.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自论文《Logic-RL: Unleashing LLM Reasoning with Rule-Based Reinforcement Learning》的注释图，https://arxiv.org/abs/2502.14768</em></figcaption></figure>

**📄 3月6日，** ***L1: Controlling How Long A Reasoning Model Thinks With Reinforcement Learning*****，https://arxiv.org/abs/2503.04697**

推理模型的一个特点是，由于思维链推理，它们倾向于生成更长的输出。但默认情况下，没有明确的方法来控制响应的长度。

这篇论文介绍了长度控制策略优化（LCPO），这是一种简单的强化学习方法，帮助模型在优化准确性的同时，遵守用户指定的长度约束。

简而言之，LCPO类似于GRPO，即“GRPO + 用于长度控制的自定义奖励”，实现如下：

```
reward = reward_correctness - α * |target_length - actual_length|
```

其中目标长度作为用户提示的一部分提供。上述LCPO方法鼓励模型精确遵守提供的目标长度。

此外，他们还引入了一个LCPO-Max变体，该变体不是鼓励模型精确匹配目标长度，而是鼓励模型保持在最大token长度以下。

```
reward = reward_correctness * clip(α * (target_length - actual_length) + δ, 0, 1)
```

作者使用 LCPO 训练了一个名为 L1 的 1.5B 模型，该模型能够根据提示调整输出长度。这让用户可以根据任务在准确性和计算量之间进行权衡。有趣的是，论文还发现，这些长链模型在短推理任务上也表现出色，甚至在相同 token 长度下超越了 GPT-4o 等更大的模型。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!FL9p!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!FL9p!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 424w, https://substackcdn.com/image/fetch/$s_!FL9p!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 848w, https://substackcdn.com/image/fetch/$s_!FL9p!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 1272w, https://substackcdn.com/image/fetch/$s_!FL9p!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!FL9p!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png" width="1456" height="755" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:755,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!FL9p!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 424w, https://substackcdn.com/image/fetch/$s_!FL9p!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 848w, https://substackcdn.com/image/fetch/$s_!FL9p!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 1272w, https://substackcdn.com/image/fetch/$s_!FL9p!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96e79a6d-e9c2-49a9-8242-de47ae444408_1600x830.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自 L1: Controlling How Long A Reasoning Model Thinks With Reinforcement Learning 的注释图，https://arxiv.org/abs/2503.04697</em></figcaption></figure>

**📄 3月10日，** ***R1-Searcher: Incentivizing the Search Capability in LLMs via Reinforcement Learning***，https://arxiv.org/abs/2503.05592

像 DeepSeek-R1 这样经过 RL 训练的推理模型依赖于其内部知识。本文作者通过增加对外部搜索系统的访问，专注于改进这些模型在需要更时效性或最新信息的知识型任务上的表现。

因此，本文通过教导模型在推理过程中使用外部搜索系统来改进这些模型。作者没有依赖测试时策略或监督训练，而是使用了一种两阶段强化学习方法，帮助模型自主学习如何以及何时进行搜索。模型首先学习搜索格式，然后学习如何使用搜索结果找到正确答案。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!lSjH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!lSjH!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 424w, https://substackcdn.com/image/fetch/$s_!lSjH!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 848w, https://substackcdn.com/image/fetch/$s_!lSjH!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 1272w, https://substackcdn.com/image/fetch/$s_!lSjH!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!lSjH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png" width="1198" height="672" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:672,&quot;width&quot;:1198,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!lSjH!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 424w, https://substackcdn.com/image/fetch/$s_!lSjH!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 848w, https://substackcdn.com/image/fetch/$s_!lSjH!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 1272w, https://substackcdn.com/image/fetch/$s_!lSjH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22dfffd6-b925-47e1-9fef-2c0aadc1fbd4_1198x672.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自 R1-Searcher: Incentivizing the Search Capability in LLMs via Reinforcement Learning 的注释图，https://arxiv.org/abs/2503.05592</em></figcaption></figure>

**📄 3月18日，** ***DAPO: An Open-Source LLM Reinforcement Learning System at Scale***，https://arxiv.org/abs/2503.14476

虽然本文主要致力于开发一个类似 DeepSeek-R1 的训练流程并将其开源，但它也提出了对 DeepSeek-R1 训练中使用的 GRPO 算法的有趣改进。

1.  Clip-higher：提高 PPO 裁剪范围的上限，以鼓励探索并防止训练过程中熵崩溃。
2.  动态采样：通过过滤掉所有采样响应要么全对要么全错的提示，提高训练效率。
3.  Token 级策略梯度损失：从样本级损失计算转向 Token 级损失计算，使得较长的响应能够对梯度更新产生更大影响。*
4.  过长奖励塑形：对因过长而被截断的响应添加软惩罚，这减少了奖励噪声并有助于稳定训练。

* 标准的 GRPO 使用样本级损失计算。这涉及首先对每个样本的 token 损失进行平均，然后对样本的损失进行平均。由于样本权重相等，较长响应样本中的 token 可能对整体损失的贡献不成比例地减少。同时，研究人员观察到，较长的响应在最终答案之前通常包含胡言乱语，而在原始的 GRPO 样本级损失计算中，这些胡言乱语不会得到充分惩罚。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!PcKh!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!PcKh!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 424w, https://substackcdn.com/image/fetch/$s_!PcKh!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 848w, https://substackcdn.com/image/fetch/$s_!PcKh!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 1272w, https://substackcdn.com/image/fetch/$s_!PcKh!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!PcKh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png" width="1456" height="1025" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1025,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!PcKh!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 424w, https://substackcdn.com/image/fetch/$s_!PcKh!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 848w, https://substackcdn.com/image/fetch/$s_!PcKh!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 1272w, https://substackcdn.com/image/fetch/$s_!PcKh!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d635353-5ff8-4edb-a2cd-67c3f8527b95_1472x1036.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自 DAPO: An Open-Source LLM Reinforcement Learning System at Scale 的标注图，https://arxiv.org/abs/2503.14476</em></figcaption></figure>

**📄 3月20日，** ***小型LLM中推理的强化学习：什么有效，什么无效*** **，https://arxiv.org/abs/2503.16219**

原始的DeepSeek-R1论文表明，在开发较小推理模型时，蒸馏比纯强化学习效果更好。在这篇论文中，研究人员对此进行了跟进，并研究了用强化学习进一步改进小型蒸馏推理模型的方法。

因此，使用1.5B的DeepSeek-R1-Distill-Qwen模型，他们发现仅用7000个训练样本和42美元的计算预算，强化学习微调就能带来显著的改进。例如，在这种情况下，改进足以在AIME24数学基准测试上超越OpenAI的o1-preview。

此外，该论文还有三个有趣的发现：

1. 小型LLM可以在前50-100个训练步骤内，使用紧凑的高质量数据集实现快速的推理改进。但如果训练时间过长，性能会迅速下降，这主要是由于长度限制和输出不稳定性。

2. 混合使用较简单和较困难的问题，有助于模型在训练早期生成更短、更稳定的响应。然而，性能仍会随时间推移而下降。

3. 使用余弦形状的奖励函数有助于更有效地控制输出长度，并提高训练一致性。但与基于准确率的标准奖励相比，这会略微降低峰值性能。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!KEk2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!KEk2!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 424w, https://substackcdn.com/image/fetch/$s_!KEk2!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 848w, https://substackcdn.com/image/fetch/$s_!KEk2!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 1272w, https://substackcdn.com/image/fetch/$s_!KEk2!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!KEk2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png" width="1456" height="531" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/a1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:531,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!KEk2!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 424w, https://substackcdn.com/image/fetch/$s_!KEk2!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 848w, https://substackcdn.com/image/fetch/$s_!KEk2!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 1272w, https://substackcdn.com/image/fetch/$s_!KEk2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1f0457a-b764-403a-8d4b-d4281b867181_1600x583.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自《小型LLM中推理的强化学习：什么有效，什么无效》的标注图，https://arxiv.org/abs/2503.16219</em></figcaption></figure>

**📄 3月25日，** ***ReSearch：通过强化学习让LLM学会结合搜索进行推理*** **，https://arxiv.org/abs/2503.19470**

本文提出的ReSearch框架将DeepSeek-R1论文中的强化学习方法进行了扩展，将搜索结果纳入推理过程。模型会根据其当前的推理链学习何时以及如何进行搜索，然后利用检索到的信息进行后续推理步骤。

这一切都在没有推理步骤监督数据的情况下完成。研究人员还表明，这种方法可以产生有用的行为，如自我纠正和反思，并且尽管仅在单个数据集上训练，它也能在多个基准测试中很好地泛化。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!_9nY!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!_9nY!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 424w, https://substackcdn.com/image/fetch/$s_!_9nY!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 848w, https://substackcdn.com/image/fetch/$s_!_9nY!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 1272w, https://substackcdn.com/image/fetch/$s_!_9nY!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!_9nY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png" width="1410" height="700" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:700,&quot;width&quot;:1410,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!_9nY!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 424w, https://substackcdn.com/image/fetch/$s_!_9nY!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 848w, https://substackcdn.com/image/fetch/$s_!_9nY!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 1272w, https://substackcdn.com/image/fetch/$s_!_9nY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93de69b7-cbb3-46e5-ad59-7f48efef0d2d_1410x700.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自 ReSearch: Learning to Reason with Search for LLMs via Reinforcement Learning 的标注图，https://arxiv.org/abs/2503.19470</em></figcaption></figure>

附注：这种方法与之前讨论的R1-Searcher有何不同？

R1-Searcher采用两阶段、基于结果的强化学习方法。在第一阶段，它教模型如何调用外部检索；在第二阶段，它学习使用检索到的信息来回答问题。

相比之下，ReSearch 将搜索直接整合到推理过程中。它通过强化学习对模型进行端到端训练，无需对推理步骤进行任何监督。诸如反思错误查询并加以纠正等行为，在此训练过程中会自然涌现。

**📄 3月26日，《理解 R1-Zero 类训练：一个批判性视角》，https://arxiv.org/abs/2503.20783**

本文探究了 DeepSeek-R1-Zero 的纯强化学习方法为何能有效提升推理能力。

作者发现，一些基础模型（如 Qwen2.5）在没有任何强化学习的情况下，已经展现出强大的推理能力，甚至出现了“顿悟时刻”。因此，“顿悟时刻”可能并非由强化学习诱发，而是继承自预训练阶段。这对“仅凭强化学习就能创造深层推理行为”的观点提出了挑战。

该论文还指出了 GRPO 中的两个偏差：

1.  **响应长度偏差**：GRPO 将优势值除以响应长度。这使得较长的错误答案受到更小的惩罚，从而导致模型学会生成更长的错误答案。
2.  **难度级别偏差**：GRPO 还会对每个问题的奖励进行标准差归一化。简单或困难的问题（奖励方差较低）会被过度加权。

为了解决这些问题，作者引入了 Dr. GRPO，这是对标准 GRPO 的一种改进。在此方法中，他们去掉了优势值计算中的响应长度归一化，同时也去掉了问题级别的标准差归一化。这将带来更高效的训练，并减少不必要的长答案生成。特别是当模型出错时，不再鼓励生成冗长的回答。

**📄 3月31日，《跨越奖励桥梁：将基于可验证奖励的强化学习扩展到多样化领域》，https://arxiv.org/abs/2503.23829**

DeepSeek-R1 及随后的大多数推理模型，其奖励信号都集中在代码和数学等易于验证的领域。本文探讨了如何将这些方法扩展到更复杂的领域，如医学、化学、心理学、经济学和教育学，在这些领域中，答案通常是自由形式的，难以验证（不仅仅是简单地对/错）。

作者发现，即使在这些更广泛的领域，使用专家撰写的参考答案进行评估也比预期的更可行。为了提供奖励信号，他们引入了一种生成式的软评分方法，无需大量特定领域的标注。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!cJ-q!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!cJ-q!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 424w, https://substackcdn.com/image/fetch/$s_!cJ-q!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 848w, https://substackcdn.com/image/fetch/$s_!cJ-q!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 1272w, https://substackcdn.com/image/fetch/$s_!cJ-q!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!cJ-q!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png" width="1432" height="878" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/f831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:878,&quot;width&quot;:1432,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!cJ-q!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 424w, https://substackcdn.com/image/fetch/$s_!cJ-q!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 848w, https://substackcdn.com/image/fetch/$s_!cJ-q!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 1272w, https://substackcdn.com/image/fetch/$s_!cJ-q!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff831a219-4e96-469d-b7cb-0e0b19c446af_1432x878.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自《跨越奖励桥梁：将基于可验证奖励的强化学习扩展到多样化领域》的注释图，https://arxiv.org/abs/2503.23829</em></figcaption></figure>

**📄 3月31日，《Open-Reasoner-Zero：一种在基础模型上扩展强化学习的开源方法》，https://arxiv.org/abs/2503.24290**

在这篇论文中，作者探索了一种用于在推理任务上训练大语言模型的极简强化学习设置。他们使用原始的 PPO 而非 GRPO（DeepSeek-R1-Zero 使用的算法），并跳过了 RLHF 流程中通常包含的 KL 正则化。

有趣的是，他们发现这种简单的设置（原始 PPO 和基于答案正确性的基本二元奖励函数）足以训练出在推理性能和响应长度上都能扩展的模型。

使用与 DeepSeek-R1-Zero 相同的 Qwen-32B 基础模型，他们的模型在多个推理基准测试中表现更优，而训练步数仅需后者的十分之一。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!gtil!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!gtil!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 424w, https://substackcdn.com/image/fetch/$s_!gtil!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 848w, https://substackcdn.com/image/fetch/$s_!gtil!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 1272w, https://substackcdn.com/image/fetch/$s_!gtil!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!gtil!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png" width="676" height="555.75" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/adc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1197,&quot;width&quot;:1456,&quot;resizeWidth&quot;:676,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!gtil!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 424w, https://substackcdn.com/image/fetch/$s_!gtil!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 848w, https://substackcdn.com/image/fetch/$s_!gtil!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 1272w, https://substackcdn.com/image/fetch/$s_!gtil!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadc2b1fc-ce73-4ace-a2af-465ef3f86d33_1600x1315.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自 Open-Reasoner-Zero 的注释图：一种在基础模型上扩展强化学习的开源方法，https://arxiv.org/abs/2503.24290</em></figcaption></figure>

**📄 4月5日，** ***重新思考预训练中的反思*****，https://arxiv.org/abs/2504.04022**

基于 DeepSeek-R1 论文中有趣的见解，即将纯强化学习应用于基础模型，我们认为 LLM 的推理能力源于强化学习。这篇论文提供了一个小小的转折，指出自我修正早在预训练阶段就已经出现。

具体来说，通过在任务中引入故意出错的思维链，作者衡量模型是否能够识别并纠正这些错误。他们发现，显式和隐式的反思形式在整个预训练过程中稳步出现。这种情况跨越多个领域和模型规模。即使是相对早期的检查点也显示出自我修正的迹象，并且这种能力随着预训练计算量的增加而增强。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!HU9a!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!HU9a!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 424w, https://substackcdn.com/image/fetch/$s_!HU9a!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 848w, https://substackcdn.com/image/fetch/$s_!HU9a!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 1272w, https://substackcdn.com/image/fetch/$s_!HU9a!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!HU9a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png" width="1456" height="915" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/67dc8709-485e-412a-be2f-56b86389289c_1486x934.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:915,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!HU9a!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 424w, https://substackcdn.com/image/fetch/$s_!HU9a!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 848w, https://substackcdn.com/image/fetch/$s_!HU9a!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 1272w, https://substackcdn.com/image/fetch/$s_!HU9a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67dc8709-485e-412a-be2f-56b86389289c_1486x934.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自《重新思考预训练中的反思》的注释图，https://arxiv.org/abs/2504.04022</em></figcaption></figure>

**📄 4月7日，** ***通过强化学习实现简洁推理*****，https://arxiv.org/abs/2504.05185**

众所周知，推理模型通常会生成更长的回复，这增加了计算成本。现在，这篇新论文表明，这种行为源于强化学习训练过程，而非为了更高准确率而对长答案的实际需求。当模型获得负奖励时，强化学习损失倾向于偏好更长的回复，我认为这解释了纯强化学习训练中出现的“顿悟”时刻和更长的思维链。

也就是说，如果模型获得负奖励（即答案错误），PPO 背后的数学原理会导致：当回复更长时，每个 token 的平均损失变得更小。因此，模型被间接鼓励生成更长的回复。即使这些额外的 token 实际上对解决问题没有帮助，情况也是如此。

回复长度与损失有什么关系？当奖励为负时，更长的回复可以稀释每个 token 的惩罚，从而导致更低（即更好）的损失值（即使模型仍然得到错误答案）。

因此，模型“学会”了更长的回复可以减少惩罚，尽管这对正确性没有帮助。

然而，需要强调的是，这项分析是针对 PPO 进行的：

> 值得注意的是，我们当前的分析不适用于 GRPO，对此类方法的精确分析留待未来工作。

此外，研究人员表明，第二轮强化学习（仅使用少量有时可解的问题）可以缩短回复，同时保持甚至提高准确性。这对部署效率具有重大影响。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!bkp0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!bkp0!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 424w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 848w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1272w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!bkp0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png" width="477" height="370.33631484794273" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:868,&quot;width&quot;:1118,&quot;resizeWidth&quot;:477,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!bkp0!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 424w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 848w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1272w, https://substackcdn.com/image/fetch/$s_!bkp0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F50f896de-3318-478b-a00d-341101e9ab8c_1118x868.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自《通过强化学习实现简洁推理》的注释图，https://arxiv.org/abs/2504.05185</em></figcaption></figure>

**📄 4月9日，《冷静审视语言模型推理的进展：可重复性的陷阱与路径》，https://arxiv.org/abs/2504.07086**

本文深入审视了近期关于强化学习能够改进蒸馏语言模型（例如基于DeepSeek-R1的模型）的说法。

例如，我之前讨论过“3月20日，《小型LLM中用于推理的强化学习：有效与无效之处》”这篇论文，该论文发现强化学习对蒸馏模型是有效的。

此外，DeepSeek-R1论文中也提到：

> 此外，我们发现对这些蒸馏模型应用强化学习能带来显著的进一步提升。我们认为这值得进一步探索，因此在此仅展示简单SFT蒸馏模型的结果。

因此，尽管早期论文报告了强化学习带来的巨大性能提升，但本研究认为，其中许多改进可能只是噪声。作者表明，在AIME24等小型基准测试上的结果高度不稳定：仅仅改变随机种子就可能导致分数波动几个百分点。

当强化学习模型在更受控和标准化的设置下进行评估时，其增益远小于最初报告的结果，并且通常不具有统计显著性。然而，一些经过强化学习训练的模型确实显示出适度的改进，但这些改进通常弱于监督微调所实现的效果，并且往往无法很好地泛化到新的基准测试中。

因此，尽管强化学习在某些情况下可能有助于改进较小的蒸馏模型，但本文认为其益处被夸大了，需要更好的评估标准来理解实际有效的方法。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!oCP8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!oCP8!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 424w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 848w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1272w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!oCP8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png" width="1288" height="888" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/ad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:888,&quot;width&quot;:1288,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!oCP8!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 424w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 848w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1272w, https://substackcdn.com/image/fetch/$s_!oCP8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad0e98ed-292c-40f4-80ad-0aee7ef3e9aa_1288x888.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>来自《冷静审视语言模型推理的进展：可重复性的陷阱与路径》的注释图，https://arxiv.org/abs/2504.07086</em></figcaption></figure>

*本杂志是个人热情之作。为支持我作为独立研究员的工作，请考虑购买我的著作《构建大型语言模型（从零开始）》（https://amzn.to/4fqvn0D），或订阅付费版（https://magazine.sebastianraschka.com/subscribe）。*

*如果您已阅读本书并有余暇，我将非常感激您能留下简短评论（https://www.amazon.com/Build-Large-Language-Model-Scratch/dp/1633437167）。这对我们作者帮助很大！*

**您的支持意义重大！谢谢！**

#### 关于本文的讨论

### 准备好了解更多了吗？
