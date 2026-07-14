---
title: Understanding and Coding the KV Cache in LLMs from Scratch
url: 'https://magazine.sebastianraschka.com/p/coding-the-kv-cache-in-llms'
url_hash: c9d8040bdb3105956b4605d014854f9706d09674
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-06-17T08:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
KV缓存是生产环境中实现LLM高效推理最关键的技术之一。KV缓存是生产环境中实现计算高效LLM推理的重要组成部分。本文将通过概念讲解和从零开始、可读性强的代码实现，介绍其工作原理。

> 距离我上次分享讲解LLM基础概念的技术教程已经有一段时间了。由于我目前正在从伤病中恢复，同时也在撰写一篇更大型的LLM研究文章，我想借此机会分享一篇关于读者多次询问主题的教程文章（因为我的《从零开始构建大型语言模型》一书中**没有**包含这个主题）。

祝阅读愉快！

简而言之，KV缓存会存储中间键（K）和值（V）的计算结果，以便在推理（训练后）过程中复用，从而在生成文本时实现显著的加速。KV缓存的缺点在于：增加了代码的复杂性，提高了内存需求（这也是我最初未将其纳入书中的主要原因），并且无法在训练过程中使用。然而，在生产环境中使用LLM时，推理速度的提升往往足以弥补代码复杂性和内存方面的权衡。

假设LLM正在生成一些文本。具体来说，假设给LLM提供了以下提示词："Time"。你可能已经知道，LLM一次只生成一个词（或token），接下来的两个文本生成步骤可能如下图所示：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!pooO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!pooO!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 424w, https://substackcdn.com/image/fetch/$s_!pooO!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 848w, https://substackcdn.com/image/fetch/$s_!pooO!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 1272w, https://substackcdn.com/image/fetch/$s_!pooO!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!pooO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png" width="527" height="521.5104166666666" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:760,&quot;width&quot;:768,&quot;resizeWidth&quot;:527,&quot;bytes&quot;:73550,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:false,&quot;topImage&quot;:true,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!pooO!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 424w, https://substackcdn.com/image/fetch/$s_!pooO!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 848w, https://substackcdn.com/image/fetch/$s_!pooO!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 1272w, https://substackcdn.com/image/fetch/$s_!pooO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4249e23e-7945-4c8f-a11f-2fd921ff0672_768x760.png 1456w" sizes="100vw" fetchpriority="high"></picture></div></a><figcaption>该图展示了LLM如何一次生成一个token。从提示词"Time"开始，模型生成下一个token"flies"。在下一步中，整个序列"Time flies"被重新处理以生成token"fast"。</figcaption></figure>

请注意，生成的LLM文本输出中存在一些冗余，如下图所示：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!As0Z!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!As0Z!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 424w, https://substackcdn.com/image/fetch/$s_!As0Z!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 848w, https://substackcdn.com/image/fetch/$s_!As0Z!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 1272w, https://substackcdn.com/image/fetch/$s_!As0Z!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!As0Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png" width="429" height="429.69529983792546" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/da5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:618,&quot;width&quot;:617,&quot;resizeWidth&quot;:429,&quot;bytes&quot;:45491,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!As0Z!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 424w, https://substackcdn.com/image/fetch/$s_!As0Z!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 848w, https://substackcdn.com/image/fetch/$s_!As0Z!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 1272w, https://substackcdn.com/image/fetch/$s_!As0Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda5df468-5b21-4b1f-9ccb-b144dfb2a293_617x618.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>此图突出显示了在每个生成步骤中LLM必须重新处理的重复上下文（"Time flies"）。由于LLM没有缓存中间键/值状态，每次生成新token（例如"fast"）时，它都会重新编码整个序列。</figcaption></figure>

当我们实现LLM文本生成函数时，通常只使用每一步最后生成的token。然而，上面的可视化从概念层面揭示了主要低效之一。如果我们放大注意力机制本身，这种低效（或冗余）会更加明显。（如果你对注意力机制感到好奇，可以阅读我的《从零开始构建大型语言模型》一书第3章，或我的文章《理解并编码LLM中的自注意力、多头注意力、因果注意力和交叉注意力》。）

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!3NS4!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F69bfee26-ea3b-42a6-8a1a-6b8187852082_738x564.png">![理解并编码LLM中的自注意力、多头注意力、因果注意力和交叉注意力](https://substackcdn.com/image/fetch/$s_!3NS4!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F69bfee26-ea3b-42a6-8a1a-6b8187852082_738x564.png)

](https://magazine.sebastianraschka.com/p/understanding-and-coding-self-attention)

下图展示了大语言模型（LLM）核心注意力机制计算的一个片段。在此图中，输入词元（"Time"和"flies"）被编码为三维向量（实际应用中这些向量的维度要大得多，但若按真实维度绘制将难以在小型示意图中呈现）。矩阵 *W* 是注意力机制的权重矩阵，负责将这些输入转换为键向量、值向量和查询向量。

下图展示了底层注意力分数计算的片段，其中键向量和值向量已被高亮标注：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!4BB1!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!4BB1!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 424w, https://substackcdn.com/image/fetch/$s_!4BB1!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 848w, https://substackcdn.com/image/fetch/$s_!4BB1!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 1272w, https://substackcdn.com/image/fetch/$s_!4BB1!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!4BB1!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png" width="945" height="445" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:445,&quot;width&quot;:945,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:76215,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!4BB1!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 424w, https://substackcdn.com/image/fetch/$s_!4BB1!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 848w, https://substackcdn.com/image/fetch/$s_!4BB1!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 1272w, https://substackcdn.com/image/fetch/$s_!4BB1!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3748127c-532e-4169-8e12-1fb48e263dbd_945x445.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>此图展示了LLM在注意力计算过程中如何从词元嵌入中推导出键向量（</span><code>k</code><span>）和值向量（</span><code>v</code><span>）。每个输入词元（例如"Time"和"flies"）都通过已学习的矩阵</span><code>W_k</code><span>和</span><code>W_v</code><span>进行投影，从而获得对应的键向量和值向量。</span></figcaption></figure>

如前所述，LLM每次生成一个词（或词元）。假设LLM生成了单词"fast"，那么下一轮的提示词就变成了"Time flies fast"。如下图所示：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!gBu0!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!gBu0!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 424w, https://substackcdn.com/image/fetch/$s_!gBu0!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 848w, https://substackcdn.com/image/fetch/$s_!gBu0!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 1272w, https://substackcdn.com/image/fetch/$s_!gBu0!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!gBu0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png" width="1259" height="877" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:877,&quot;width&quot;:1259,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:186341,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!gBu0!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 424w, https://substackcdn.com/image/fetch/$s_!gBu0!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 848w, https://substackcdn.com/image/fetch/$s_!gBu0!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 1272w, https://substackcdn.com/image/fetch/$s_!gBu0!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F06c2f011-ce16-4832-a3aa-4927703fb752_1259x877.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>此图展示了LLM在每一步生成过程中如何为之前见过的词元（"Time"和"flies"）重新计算键向量和值向量。当生成第三个词元（"fast"）时，模型会再次重新计算相同的</span><code>k(1)/v(1)</code><span>和</span><code>k(2)/v(2)</code><span>向量，而不是重复使用它们。这种重复计算突显了在自回归解码过程中不使用KV缓存的低效性。</span></figcaption></figure>

通过对比前两幅图可以看出，前两个词元的键向量和值向量完全相同，在每一轮下一个词元的文本生成中重新计算它们是一种浪费。

因此，KV缓存的思想是实现一种缓存机制，存储之前生成的键向量和值向量以供重复使用，这有助于我们避免这些不必要的重新计算。

在上一节中我们了解了基本概念之后，现在让我们在查看具体代码实现之前，先深入探讨一些细节。如果我们有一个*没有* KV缓存的文本生成过程，用于生成"Time flies fast"，可以这样理解：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!z-sX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!z-sX!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 424w, https://substackcdn.com/image/fetch/$s_!z-sX!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 848w, https://substackcdn.com/image/fetch/$s_!z-sX!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 1272w, https://substackcdn.com/image/fetch/$s_!z-sX!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!z-sX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png" width="741" height="194" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:194,&quot;width&quot;:741,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:17718,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!z-sX!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 424w, https://substackcdn.com/image/fetch/$s_!z-sX!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 848w, https://substackcdn.com/image/fetch/$s_!z-sX!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 1272w, https://substackcdn.com/image/fetch/$s_!z-sX!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5fdd4b41-96e6-40c2-baf3-aedfeee8d1de_741x194.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

请注意其中的冗余：词元"Time"和"flies"在每一步新的生成过程中都被重新计算。KV缓存通过存储和重复使用之前计算过的键向量和值向量来解决这一低效问题：

1.  最初，模型计算并缓存输入词元的键向量和值向量。
2.  对于每个新生成的词元，模型仅计算该特定词元的键向量和值向量。

3. 之前计算过的向量会从缓存中检索，以避免重复计算。

下表总结了计算和缓存的步骤及状态：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!qQBU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!qQBU!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 424w, https://substackcdn.com/image/fetch/$s_!qQBU!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 848w, https://substackcdn.com/image/fetch/$s_!qQBU!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 1272w, https://substackcdn.com/image/fetch/$s_!qQBU!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!qQBU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png" width="736" height="202" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:202,&quot;width&quot;:736,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:20360,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!qQBU!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 424w, https://substackcdn.com/image/fetch/$s_!qQBU!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 848w, https://substackcdn.com/image/fetch/$s_!qQBU!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 1272w, https://substackcdn.com/image/fetch/$s_!qQBU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f20643e-0942-4b5f-98ec-051d030d127a_736x202.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

这样做的好处是，“Time”只计算一次并被重复使用两次，“flies”只计算一次并被重复使用一次。（为了简单起见，这里用了较短的文本示例，但直观上不难理解，文本越长，我们就能越多地重复使用已计算好的键和值，从而提升生成速度。）

下图并排展示了使用和不使用 KV 缓存的生成步骤 3。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!PjfC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!PjfC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 424w, https://substackcdn.com/image/fetch/$s_!PjfC!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 848w, https://substackcdn.com/image/fetch/$s_!PjfC!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 1272w, https://substackcdn.com/image/fetch/$s_!PjfC!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!PjfC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png" width="841" height="926" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:926,&quot;width&quot;:841,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:134180,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!PjfC!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 424w, https://substackcdn.com/image/fetch/$s_!PjfC!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 848w, https://substackcdn.com/image/fetch/$s_!PjfC!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 1272w, https://substackcdn.com/image/fetch/$s_!PjfC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>对比使用和不使用 KV 缓存的文本生成。在上方面板（无缓存）中，每个 token 步骤都会重新计算键和值向量，导致冗余操作。在下方面板（有缓存）中，之前计算好的键和值会从 KV 缓存中检索，避免重复计算，从而实现更快的生成。</figcaption></figure>

所以，如果我们想在代码中实现 KV 缓存，所要做的就是像往常一样计算键和值，然后将它们存储起来，以便在下一轮中检索。下一节将通过一个具体的代码示例来说明这一点。

实现 KV 缓存的方法有很多种，核心思想是：在每个生成步骤中，只计算新生成 token 的键张量和值张量。

我选择了一种简单的方法，侧重于代码的可读性。我认为最直接的方式就是浏览代码的改动，看看它是如何实现的。

我在 GitHub 上分享了两份文件，它们都是自包含的 Python 脚本，分别实现了不带和带 KV 缓存的 LLM：

1.  [gpt\_ch04.py](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/03_kv-cache/gpt_ch04.py)：取自我的《从头构建大型语言模型》一书第 3 章和第 4 章的自包含代码，用于实现 LLM 并运行简单的文本生成函数。

2.  [gpt\_with\_kv\_cache.py](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/03_kv-cache/gpt_with_kv_cache.py)：与上述相同，但进行了必要的修改以实现 KV 缓存。

要阅读与 KV 缓存相关的代码修改，你可以：

a. 打开 `gpt_with_kv_cache.py` 文件，查找标记新改动的 `# NEW` 部分：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!KVf4!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!KVf4!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 424w, https://substackcdn.com/image/fetch/$s_!KVf4!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 848w, https://substackcdn.com/image/fetch/$s_!KVf4!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 1272w, https://substackcdn.com/image/fetch/$s_!KVf4!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!KVf4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png" width="982" height="881" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:881,&quot;width&quot;:982,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!KVf4!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 424w, https://substackcdn.com/image/fetch/$s_!KVf4!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 848w, https://substackcdn.com/image/fetch/$s_!KVf4!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 1272w, https://substackcdn.com/image/fetch/$s_!KVf4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3338a3b0-c3ad-4d37-9d3f-15db18db51ff_982x881.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

b. 使用你选择的文件差异比较工具，查看这两个代码文件以对比改动：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!qPKJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!qPKJ!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 424w, https://substackcdn.com/image/fetch/$s_!qPKJ!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 848w, https://substackcdn.com/image/fetch/$s_!qPKJ!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 1272w, https://substackcdn.com/image/fetch/$s_!qPKJ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!qPKJ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png" width="1456" height="854" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/ccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:854,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!qPKJ!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 424w, https://substackcdn.com/image/fetch/$s_!qPKJ!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 848w, https://substackcdn.com/image/fetch/$s_!qPKJ!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 1272w, https://substackcdn.com/image/fetch/$s_!qPKJ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccfd3b14-df6e-4988-b986-851b4b207eae_1468x861.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

此外，为了总结实现细节，以下小节提供了一个简短的说明。

在 `MultiHeadAttention` 的构造函数中，我们添加了两个缓冲区 `cache_k` 和 `cache_v`，用于跨步骤存储拼接后的键和值：

```
self.register_buffer("cache_k", None)
self.register_buffer("cache_v", None)
```

（如果你想了解更多关于缓冲区的信息，我制作了一个 YouTube 视频：[理解 PyTorch 缓冲区](https://youtu.be/PetlIokI9Ao)。）

接下来，我们扩展 `MultiHeadAttention` 类的 `forward` 方法，使其接受一个 `use_cache` 参数：

```
def forward(self, x, use_cache=False):
    b, num_tokens, d_in = x.shape
​
    keys_new = self.W_key(x)  # 形状: (b, num_tokens, d_out)
    values_new = self.W_value(x)
    queries = self.W_query(x)
    #...
​
    if use_cache:
        if self.cache_k is None:
            self.cache_k, self.cache_v = keys_new, values_new
        else:
            self.cache_k = torch.cat([self.cache_k, keys_new], dim=1)
            self.cache_v = torch.cat([self.cache_v, values_new], dim=1)
        keys, values = self.cache_k, self.cache_v
    else:
        keys, values = keys_new, values_new
```

这里的键和值存储与检索实现了 KV 缓存的核心思想。

**存储**

具体来说，在通过 `if self.cache_k is None: ...` 初始化缓存后，我们分别通过 `self.cache_k = torch.cat(...)` 和 `self.cache_v = torch.cat(...)` 将新生成的键和值添加到缓存中。

**检索**

然后，`keys, values = self.cache_k, self.cache_v` 从缓存中检索存储的值和键。

基本上就是这样：KV 缓存的核心存储与检索机制。接下来的第 3 节和第 4 节只处理一些次要的实现细节。

在生成文本时，我们必须记住在两次独立的文本生成调用之间重置键和值缓冲区。否则，新提示的查询会关注前一个序列中残留的旧键，导致模型依赖无关的上下文并产生不连贯的输出。为了防止这种情况，我们在 `MultiHeadAttention` 类中添加了一个 `reset_kv_cache` 方法，以便在后续的文本生成调用之间使用：

```
def reset_cache(self):
    self.cache_k, self.cache_v = None, None
```

在完成对 `MultiHeadAttention` 类的修改后，我们现在修改 `GPTModel` 类。首先，我们在构造函数中添加一个用于跟踪 token 索引的位置计数器：

```
self.current_pos = 0
```

这是一个简单的计数器，用于记录模型在增量生成会话期间已经缓存了多少个 token。

然后，我们将单行的块调用替换为一个显式循环，通过每个 transformer 块传递 `use_cache`：

```
def forward(self, in_idx, use_cache=False):
    # ...

if use_cache:
        pos_ids = torch.arange(
            self.current_pos, self.current_pos + seq_len,
            device=in_idx.device, dtype=torch.long
        )
        self.current_pos += seq_len
    else:
        pos_ids = torch.arange(
            0, seq_len, device=in_idx.device, dtype=torch.long
        )

pos_embeds = self.pos_emb(pos_ids).unsqueeze(0)
    x = tok_embeds + pos_embeds
    # ...
    for blk in self.trf_blocks:
        x = blk(x, use_cache=use_cache)
```

上面设置 `use_cache=True` 时，我们从 `self.current_pos` 开始计数 `seq_len` 步。然后，增加计数器，以便下一次解码调用从上次中断的地方继续。

`self.current_pos` 追踪的原因在于，新的查询必须紧跟在已存储的键和值之后。如果不使用计数器，每一步新操作都会从位置 0 重新开始，导致模型将新 token 视为与之前的 token 重叠。（另一种方式是通过 `offset = block.att.cache_k.shape[1]` 来追踪偏移量。）

上述改动还需要对 `TransformerBlock` 类进行小幅修改，以接受 `use_cache` 参数：

```
def forward(self, x, use_cache=False):
    # ...
    self.att(x, use_cache=use_cache)
```

最后，我们在 `GPTModel` 中添加一个模型级别的重置方法，以便一次性清除所有块的缓存：

```
def reset_kv_cache(self):
    for blk in self.trf_blocks:
        blk.att.reset_cache()
    self.current_pos = 0
```

在对 `GPTModel`、`TransformerBlock` 和 `MultiHeadAttention` 进行修改后，下面是在简单文本生成函数中使用 KV 缓存的方式：

```
def generate_text_simple_cached(
        model, idx, max_new_tokens, use_cache=True
    ):
    model.eval()
​
    ctx_len = model.pos_emb.num_embeddings  # 最大支持长度，例如 1024
    if use_cache:
        # 用完整提示初始化缓存
        model.reset_kv_cache()
        with torch.no_grad():
            logits = model(idx[:, -ctx_len:], use_cache=True)
​
        for _ in range(max_new_tokens):
            # a) 选择对数概率最高的 token
            next_idx = logits[:, -1].argmax(dim=-1, keepdim=True)
            # b) 将其追加到当前序列中
            idx = torch.cat([idx, next_idx], dim=1)
            # c) 仅将新 token 输入模型
            with torch.no_grad():
                logits = model(next_idx, use_cache=True)
    else:
        for _ in range(max_new_tokens):
            with torch.no_grad():
                logits = model(idx[:, -ctx_len:], use_cache=False)
            next_idx = logits[:, -1].argmax(dim=-1, keepdim=True)
            idx = torch.cat([idx, next_idx], dim=1)
​
    return idx
```

注意，在步骤 c) 中，我们通过 `logits = model(next_idx, use_cache=True)` 仅将新 token 输入模型。而不使用缓存时，由于模型没有存储的键和值可复用，我们需要将整个输入 `logits = model(idx[:, -ctx_len:], use_cache=False)` 输入模型。

在概念层面了解 KV 缓存后，关键问题是在实际小规模示例中它的性能如何。为了测试实现效果，我们可以将上述两个代码文件作为 Python 脚本运行，它们将驱动一个 1.24 亿参数的小型 LLM 生成 200 个新 token（以 4 个 token 的提示 "Hello, I am" 开头）：

```
pip install -r https://raw.githubusercontent.com/rasbt/LLMs-from-scratch/refs/heads/main/requirements.txt
​
python gpt_ch04.py
​
python gpt_with_kv_cache.py
```

在配备 M4 芯片的 Mac Mini（CPU）上，结果如下：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!LWIV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!LWIV!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 424w, https://substackcdn.com/image/fetch/$s_!LWIV!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 848w, https://substackcdn.com/image/fetch/$s_!LWIV!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 1272w, https://substackcdn.com/image/fetch/$s_!LWIV!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!LWIV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png" width="743" height="160" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:160,&quot;width&quot;:743,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:11924,&quot;alt&quot;:&quot;&quot;,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" title="" srcset="https://substackcdn.com/image/fetch/$s_!LWIV!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 424w, https://substackcdn.com/image/fetch/$s_!LWIV!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 848w, https://substackcdn.com/image/fetch/$s_!LWIV!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 1272w, https://substackcdn.com/image/fetch/$s_!LWIV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d75a600-22e3-4edf-b642-44700dc7a2db_743x160.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

因此，我们可以看到，即使使用 1.24 亿参数的小模型和 200 token 的短序列长度，也能获得约 5 倍的加速。（注意，此实现以代码可读性为优先，并未针对 CUDA 或 MPS 运行时速度进行优化——若需优化，应预分配张量而非反复创建和拼接。）

**注意：** 两种情况下模型都会生成“乱码”文本，例如：

> 输出文本：Hello, I am Featureiman Byeswickattribute argue logger Normandy Compton analogous bore ITVEGIN ministriesysics Kle functional recountrictionchangingVirgin embarrassedgl ...

这是因为我们还没有训练模型。下一章会训练模型，届时你可以在训练好的模型上使用KV缓存（但KV缓存仅用于推理阶段）来生成连贯文本。这里我们使用未训练模型是为了保持代码简洁。

不过更重要的是，`gpt_ch04.py` 和 `gpt_with_kv_cache.py` 两种实现生成的文本完全相同。这说明KV缓存的实现是正确的——索引错误很容易导致结果不一致。

随着序列长度增加，KV缓存的优缺点会变得更加明显：

-   \[优点\] **计算效率提升**：不使用缓存时，第*t*步的注意力机制需要将新查询与之前*t*个键进行比较，累计计算量呈二次方增长O(n²)。使用缓存后，每个键和值只计算一次并重复使用，将每步复杂度降低为线性O(n)。

-   \[缺点\] **内存占用线性增长**：每个新token都会追加到KV缓存中。对于长序列和大型LLM，累积的KV缓存会变得很大，可能消耗大量甚至不可接受的（GPU）内存。作为变通方案，我们可以截断KV缓存，但这会增加更多复杂性（不过在部署LLM时这可能是值得的）。

虽然上述KV缓存的概念性实现有助于清晰理解，主要面向代码可读性和教学目的，但在实际场景中部署（尤其是处理更大模型和更长序列时）需要更精细的优化。

-   **内存碎片化和重复分配**：如前所示，通过`torch.cat`持续拼接张量会导致频繁的内存分配和重新分配，造成性能瓶颈。

-   **内存占用的线性增长**：若处理不当，KV缓存的大小对于超长序列会变得不切实际。

与其重复拼接张量，我们可以根据预期的最大序列长度预先分配足够大的张量。这能确保内存使用的一致性并减少开销。伪代码如下：

```
# 键和值的预分配示例
max_seq_len = 1024  # 最大预期序列长度
cache_k = torch.zeros(
    (batch_size, num_heads, max_seq_len, head_dim), device=device
)
cache_v = torch.zeros(
    (batch_size, num_heads, max_seq_len, head_dim), device=device
)
```

在推理过程中，我们只需将这些预分配张量的切片写入即可。

为了避免GPU内存爆炸，我们可以实现带动态截断的滑动窗口方法。通过滑动窗口，我们只保留缓存中最后`window_size`个token：

```
# 滑动窗口缓存实现
window_size = 512
cache_k = cache_k[:, :, -window_size:, :]
cache_v = cache_v[:, :, -window_size:, :]
```

你可以在 [gpt\_with\_kv\_cache\_optimized.py](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/03_kv-cache/gpt_with_kv_cache_optimized.py) 文件中找到这些优化。

在配备M4芯片（CPU）的Mac Mini上，生成200个token且窗口大小等于LLM上下文长度（以确保结果相同从而实现公平比较）时，代码运行时间对比如下：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!9fY3!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!9fY3!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 424w, https://substackcdn.com/image/fetch/$s_!9fY3!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 848w, https://substackcdn.com/image/fetch/$s_!9fY3!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 1272w, https://substackcdn.com/image/fetch/$s_!9fY3!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!9fY3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png" width="742" height="197" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:197,&quot;width&quot;:742,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:17636,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!9fY3!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 424w, https://substackcdn.com/image/fetch/$s_!9fY3!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 848w, https://substackcdn.com/image/fetch/$s_!9fY3!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 1272w, https://substackcdn.com/image/fetch/$s_!9fY3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F14878ff2-28f2-496f-a5ad-03aa2865640c_742x197.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

不幸的是，在 CUDA 设备上，由于这是一个小型模型，设备传输和通信开销超过了 KV 缓存带来的收益，因此速度优势消失了。

尽管缓存引入了额外的复杂性和内存考量，但效率上的显著提升通常能抵消这些权衡，尤其是在生产环境中。

请记住，虽然我在此优先考虑了代码的清晰性和可读性而非效率，但关键点在于，实际实现通常需要深思熟虑的优化，例如预分配内存或应用滑动窗口缓存来有效管理内存增长。从这个意义上说，我希望本文能为您提供有价值的信息。

欢迎尝试这些技术，祝编码愉快！

在向我的 Qwen3（0.6B）和 Llama 3（1B）从头实现版本添加 KV 缓存后，我运行了额外实验，比较了有无 KV 缓存时的模型运行时间。请注意，我选择了上述提到的 `torch.cat` 方法，而不是像“优化 KV 缓存实现”部分描述的那样预分配 KV 缓存张量。由于 Llama 3 和 Qwen3 支持非常大的上下文长度（分别为 131k 和 41k 个 token），预分配的张量会消耗约 8 GB 的额外内存，代价相当高昂。

此外，由于我使用了更节省内存的 `torch.cat` 方法来动态创建张量，我将 KV 缓存移到了模型外部，以便使用 `torch.compile` 编译模型，从而提升计算效率。

相关代码可在此处找到：

-   [qwen3.py](https://github.com/rasbt/LLMs-from-scratch/blob/main/pkg/llms_from_scratch/qwen3.py) | [README](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/11_qwen3)

-   [llama3.py](https://github.com/rasbt/LLMs-from-scratch/blob/main/pkg/llms_from_scratch/llama3.py) | [README](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/07_gpt_to_llama)

性能表现如下所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!-pE8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!-pE8!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 424w, https://substackcdn.com/image/fetch/$s_!-pE8!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 848w, https://substackcdn.com/image/fetch/$s_!-pE8!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 1272w, https://substackcdn.com/image/fetch/$s_!-pE8!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!-pE8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png" width="931" height="616" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/e5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:616,&quot;width&quot;:931,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:122287,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!-pE8!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 424w, https://substackcdn.com/image/fetch/$s_!-pE8!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 848w, https://substackcdn.com/image/fetch/$s_!-pE8!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 1272w, https://substackcdn.com/image/fetch/$s_!-pE8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5d3a0bf-4a1a-439a-a83c-9046e1a57515_931x616.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!O7SH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!O7SH!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 424w, https://substackcdn.com/image/fetch/$s_!O7SH!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 848w, https://substackcdn.com/image/fetch/$s_!O7SH!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 1272w, https://substackcdn.com/image/fetch/$s_!O7SH!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!O7SH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png" width="876" height="598" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:598,&quot;width&quot;:876,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:106128,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/166106178?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!O7SH!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 424w, https://substackcdn.com/image/fetch/$s_!O7SH!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 848w, https://substackcdn.com/image/fetch/$s_!O7SH!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 1272w, https://substackcdn.com/image/fetch/$s_!O7SH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ce3862-820f-4337-91b7-6b4603ec8f86_876x598.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

正如我们所见，在 CPU 上，KV 缓存带来了最显著的加速。而编译进一步提升了这一性能。然而，在 GPU 上，常规编译模型可以达到最佳性能，这可能是因为我们没有在 GPU 上预分配张量，并且模型相对较小。

*本杂志是一个个人热情项目。为了支持我作为独立研究员，请考虑购买我的书《从零开始构建大语言模型》，或订阅付费版。*

*如果您读过这本书并且有几分钟时间，我将非常感激您能写一篇简短的书评。这对我们作者帮助很大！*

**您的支持意义重大！谢谢！**

#### 关于此帖的讨论

### 准备好了解更多了吗？
