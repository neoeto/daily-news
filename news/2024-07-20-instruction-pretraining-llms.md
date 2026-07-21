---
title: Instruction Pretraining LLMs
url: 'https://magazine.sebastianraschka.com/p/instruction-pretraining-llms'
url_hash: ef29388bfc9d58ffd838c949566d457f9ffefc01
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-07-20T06:03:00.000Z
lang: zh
translated: true
tags:
  - AI
  - LLM
  - 指令微调
  - 预训练
  - 技术
original_lang: en
truncated: false
---
上个月发生了很多事情：苹果宣布集成设备端大语言模型（LLM），英伟达分享了他们的大型Nemotron模型，FlashAttention-3发布，谷歌的Gemma 2推出，还有更多消息。

你可能已经在各种新闻媒体上读到了这些内容。因此，在这篇文章中，我想聚焦于近期围绕指令微调的研究，这是训练LLM的一项基础技术。

本文将要涵盖的内容：

1.  一种用于生成指令微调数据的新型高性价比方法

2.  从头开始进行指令微调

3.  使用指令数据预训练LLM

4.  Gemma 2的新特性概览

5.  六月份发布的其他有趣研究论文概览

祝阅读愉快！

[Magpie：通过用“无”提示对齐的LLM从头合成对齐数据](https://arxiv.org/abs/2406.08464)这篇论文分享了一个巧妙的技巧，用于生成高质量的LLM指令微调数据集。虽然这并没有提供特别新颖的研究见解，但它是一个有趣且实用的方法，看起来非常有用。

这种指令数据生成方法与其他方法的不同之处在于，它可以完全自动化，并且不需要任何初始问题或指令。正如论文标题所示，它能够从“无”中创建指令数据集——我们唯一需要的是一个本地运行的Llama 3 8B模型。下图总结了这种方法的工作原理。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!0QPB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!0QPB!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 424w, https://substackcdn.com/image/fetch/$s_!0QPB!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 848w, https://substackcdn.com/image/fetch/$s_!0QPB!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 1272w, https://substackcdn.com/image/fetch/$s_!0QPB!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!0QPB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png" width="1456" height="1069" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1069,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!0QPB!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 424w, https://substackcdn.com/image/fetch/$s_!0QPB!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 848w, https://substackcdn.com/image/fetch/$s_!0QPB!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 1272w, https://substackcdn.com/image/fetch/$s_!0QPB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1c9aef22-3864-4212-ac39-cf73d569831b_1600x1175.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>Magpie方法生成指令微调合成数据集的注释插图。该图基于Magpie论文中的插图：https://arxiv.org/abs/2406.08464</em></figcaption></figure>

本质上，如上图所示，我们只需要用预查询模板提示*Llama 3 8B Instruct*模型，它就会为我们生成一个指令。然后，我们将该指令反馈给LLM，它就会生成一个响应。如果我们重复这个过程几千次，就会得到一个用于指令微调的数据集。（可选地，我们可以使用LLM按质量过滤指令-响应对。）

令人着迷的是，使用由此产生的指令数据集，作者发现，仅通过指令微调（无需通过RLHF和DPO进行偏好微调）来微调Llama 3 8B基础模型，就击败了Meta AI原始的Llama 2 8B Instruct模型，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!akSq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!akSq!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 424w, https://substackcdn.com/image/fetch/$s_!akSq!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 848w, https://substackcdn.com/image/fetch/$s_!akSq!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 1272w, https://substackcdn.com/image/fetch/$s_!akSq!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!akSq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png" width="549" height="554.6559065934066" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/b417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1471,&quot;width&quot;:1456,&quot;resizeWidth&quot;:549,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!akSq!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 424w, https://substackcdn.com/image/fetch/$s_!akSq!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 848w, https://substackcdn.com/image/fetch/$s_!akSq!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 1272w, https://substackcdn.com/image/fetch/$s_!akSq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb417eecf-8f0c-4cdb-8a6b-899d515172bd_1510x1526.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>在Magpie生成的指令数据集上微调的Llama 3 8B基础模型击败了原始的Llama 3 8B Instruct模型。基于Magpie论文中的注释插图：https://arxiv.org/abs/2406.08464</em></figcaption></figure>

上图中显示的Magpie结果仅使用了30万个样本。相比之下，原始的Llama 3 Instruct模型是在1亿个样本上进行微调和对齐的！

起初我还有些怀疑，于是亲自尝试实现了一下——结果真的有效！[这里](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch07/05_dataset-generation)是我用Ollama重新实现的版本，甚至在MacBook Air上也能流畅运行。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!5nwy!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!5nwy!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 424w, https://substackcdn.com/image/fetch/$s_!5nwy!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 848w, https://substackcdn.com/image/fetch/$s_!5nwy!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 1272w, https://substackcdn.com/image/fetch/$s_!5nwy!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!5nwy!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png" width="1456" height="1340" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1340,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!5nwy!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 424w, https://substackcdn.com/image/fetch/$s_!5nwy!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 848w, https://substackcdn.com/image/fetch/$s_!5nwy!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 1272w, https://substackcdn.com/image/fetch/$s_!5nwy!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8633e941-ac42-4968-a53f-15edd93aad18_1600x1472.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>本地运行的Magpie方法重实现代码截图。代码可在此处获取：</span><a href="https://github.com/rasbt/LLMs-from-scratch/blob/main/ch07/05-dataset-generation/instruction-data-llama3-7b.json">链接</a><span>。</span></em></figcaption></figure>

作者创建了两个数据集版本：使用Llama 3 70B Instruct模型的"Pro"版本，以及使用Llama 3 8B Instruct模型的"Air"版本。如前图所示，当使用这些数据集对Llama 3 8B基础模型进行指令微调时，Magpie-Pro生成的数据集训练出的模型略优于Magpie-Air数据集。

下图展示了通过LLM评估的数据集质量和难度的额外对比。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!a2TC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!a2TC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 424w, https://substackcdn.com/image/fetch/$s_!a2TC!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 848w, https://substackcdn.com/image/fetch/$s_!a2TC!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 1272w, https://substackcdn.com/image/fetch/$s_!a2TC!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!a2TC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png" width="487" height="533.9493464052288" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1342,&quot;width&quot;:1224,&quot;resizeWidth&quot;:487,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!a2TC!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 424w, https://substackcdn.com/image/fetch/$s_!a2TC!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 848w, https://substackcdn.com/image/fetch/$s_!a2TC!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 1272w, https://substackcdn.com/image/fetch/$s_!a2TC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8b72fca8-af33-4b89-bb6d-8646b88c51f6_1224x1342.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>Magpie论文中的标注图，展示了Air和Pro数据集在质量和难度上的相对对比。</em></figcaption></figure>

如上图所示，Air和Pro数据集的质量大致相当。此外，如果能将Alpaca数据集与它们进行对比，也会很有参考价值。（虽然推测Magpie数据质量远高于Alpaca，但有个基准参照点会更有意义。）

此外，论文中的分析表明，该数据集的广度或多样性远超其他流行的指令微调数据集，如Alpaca、Evol Instruct和UltraChat。同时，与其他指令微调数据集训练的模型相比，Magpie-Pro微调模型的表现也非常出色。

总体而言，我认为Magpie是一个有趣的发现：一方面其有效性令人着迷，另一方面又具有很高的实用价值。未来在构建通用指令数据集时，我肯定会将其视为一个简单、经济且高效的候选方案。

如果你正在寻找理解LLM指令微调过程的资源，我很高兴地分享：关于指令微调LLM的第7章现已正式在Manning网站上发布（[链接](https://mng.bz/M96o)）。

这是全书最长的一章，采用从零开始的方法实现指令微调流程。内容涵盖从输入格式化、使用自定义collate函数进行批处理、掩码填充标记、训练循环本身，到在自定义测试集上评估微调LLM的响应质量。

（练习部分包括更改提示风格、指令掩码和添加LoRA。）

祝编码愉快！

附：这也是最后一章，出版商目前正在准备印刷版的排版。

在论文《指令预训练：语言模型是监督多任务学习者》（[https://arxiv.org/abs/2406.14491](https://arxiv.org/abs/2406.14491)）中，研究人员探讨了是否可以通过在预训练中包含合成的指令-回答对（而非仅使用原始文本）来提高LLM预训练的效率。（这里，“原始文本”指来自书籍、网站、论文等未经特定格式重新处理的文本。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!1qne!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!1qne!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 424w, https://substackcdn.com/image/fetch/$s_!1qne!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 848w, https://substackcdn.com/image/fetch/$s_!1qne!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 1272w, https://substackcdn.com/image/fetch/$s_!1qne!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!1qne!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png" width="1444" height="838" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/e7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:838,&quot;width&quot;:1444,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!1qne!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 424w, https://substackcdn.com/image/fetch/$s_!1qne!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 848w, https://substackcdn.com/image/fetch/$s_!1qne!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 1272w, https://substackcdn.com/image/fetch/$s_!1qne!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7b54f6a-21ba-4cfc-ba11-84869fe4c1b1_1444x838.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>通过来自 </span><a href="https://arxiv.org/abs/2406.14491">https://arxiv.org/abs/2406.14491</a><span> 的注释图对比常规预训练（上）与所提出的指令预训练方法（下）</span></em></figcaption></figure>

具体来说，研究人员尝试通过一个“指令合成器”（一个专门为此任务微调的LLM）从原始训练语料库本身生成指令-回答数据。

（请注意，这并不是第一篇提出将原始文本格式化为指令数据的论文。另一项相关工作是“Genie：实现内容生成数据集的人类水平”([https://arxiv.org/abs/2401.14367](https://arxiv.org/abs/2401.14367))。我还记得几个月前看到过另一篇论文或博客文章在预训练中使用指令数据——我曾与一些同事讨论过这种方法——但遗憾的是，我找不到参考文献了。尽管如此，本文讨论的这篇论文特别引人入胜，因为它基于可本地运行的开源LLM，并涵盖了预训练和持续预训练。）

在深入探讨预训练和持续预训练的结果之前，我们先来谈谈这种方法的核心组件：指令合成器。这是一个开源的Mistral 7B v0.1 LLM（我去年在这里写过关于它的文章：[https://magazine.sebastianraschka.com/i/138555764/mistral-b](https://magazine.sebastianraschka.com/i/138555764/mistral-b)），它经过微调，可以从原始文本生成指令-回答对。

为了微调这个合成器，研究人员使用了诸如HotpotQA（[https://arxiv.org/abs/1809.09600](https://arxiv.org/abs/1809.09600)）之类的数据集，该数据集包含与问题和答案相关的维基百科段落。为此，作者还确保涵盖了各种任务，如常识推理、情感分析、数学问题等。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!JMNR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!JMNR!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 424w, https://substackcdn.com/image/fetch/$s_!JMNR!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 848w, https://substackcdn.com/image/fetch/$s_!JMNR!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 1272w, https://substackcdn.com/image/fetch/$s_!JMNR!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!JMNR!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png" width="1456" height="748" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:748,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!JMNR!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 424w, https://substackcdn.com/image/fetch/$s_!JMNR!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 848w, https://substackcdn.com/image/fetch/$s_!JMNR!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 1272w, https://substackcdn.com/image/fetch/$s_!JMNR!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F048c0532-67b6-4e47-b9b1-abacbd2d7b33_1600x822.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>通过来自 https://arxiv.org/abs/2406.14491 的注释图展示指令合成器的输入和输出数据</em></figcaption></figure>

一旦这个指令合成器被开发出来（即微调完成），它就可以用于生成预训练目标LLM的输入数据。

关于指令合成器，最后一个值得注意的细节是，多个原始文本（Tn）和指令-回答对（In ⊕ Rn）被连接起来作为少样本示例，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!AXY8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!AXY8!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 424w, https://substackcdn.com/image/fetch/$s_!AXY8!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 848w, https://substackcdn.com/image/fetch/$s_!AXY8!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 1272w, https://substackcdn.com/image/fetch/$s_!AXY8!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!AXY8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png" width="1456" height="1010" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1010,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!AXY8!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 424w, https://substackcdn.com/image/fetch/$s_!AXY8!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 848w, https://substackcdn.com/image/fetch/$s_!AXY8!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 1272w, https://substackcdn.com/image/fetch/$s_!AXY8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92c31ec9-e599-42f9-adbf-7d5af05e9aec_1600x1110.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>通过来自 https://arxiv.org/abs/2406.14491 的注释图展示用于微调（和使用）指令合成器的指令数据格式</em></figcaption></figure>

既然我们已经讨论了生成指令-响应对的方法，现在进入有趣的部分：模型在这个增强数据集上训练的效果如何。第一组结果展示了两个从头训练的小模型：500M参数和1.3B参数（两者均基于Mistral架构）。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!4mSs!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!4mSs!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 424w, https://substackcdn.com/image/fetch/$s_!4mSs!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 848w, https://substackcdn.com/image/fetch/$s_!4mSs!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 1272w, https://substackcdn.com/image/fetch/$s_!4mSs!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!4mSs!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png" width="1456" height="712" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:712,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!4mSs!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 424w, https://substackcdn.com/image/fetch/$s_!4mSs!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 848w, https://substackcdn.com/image/fetch/$s_!4mSs!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 1272w, https://substackcdn.com/image/fetch/$s_!4mSs!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e191e7e-4b9c-442d-9fc6-194b8eb0b989_1600x782.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>三种不同预训练方法从头训练模型的对比（来自 https://arxiv.org/abs/2406.14491 的注释表格）</em></figcaption></figure>

从上表可以看出，通过所提出的指令预训练方法（***Instruct PT***）训练的模型在大多数基准任务上表现最佳（数值越高越好）。

不过需要注意的是，它比 ***Vanilla PT*** 方法看到了更多的token，因为它包含了合成的指令-响应对。因此，作者加入了 ***Mix PT*** 对比，该模型是在包含原始文本和用于训练合成器的指令数据的混合数据上训练的。

从这个对比中，我们可以看出，并非简单地使用任何指令数据就能带来差异。***Instruct PT*** 在大多数任务上优于 ***Mix PT*** 这一事实表明，指令-响应数据的性质（即与原始数据相关的指令-响应数据）才是关键所在。（作者在相同token数量下进行了所有实验。）

此外，值得注意的是，Instruct PT 预训练模型还有另一个优势：如下图所示，它们在后续进行指令微调时，性能提升更为显著。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!EUJj!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!EUJj!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 424w, https://substackcdn.com/image/fetch/$s_!EUJj!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 848w, https://substackcdn.com/image/fetch/$s_!EUJj!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 1272w, https://substackcdn.com/image/fetch/$s_!EUJj!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!EUJj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png" width="1456" height="925" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:925,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!EUJj!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 424w, https://substackcdn.com/image/fetch/$s_!EUJj!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 848w, https://substackcdn.com/image/fetch/$s_!EUJj!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 1272w, https://substackcdn.com/image/fetch/$s_!EUJj!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57961fbf-d0ce-42d7-bbeb-c7f7222d5221_1600x1016.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>对使用传统预训练范式（Vanilla PT）或指令预训练（Instruct PT）预训练的LLM进行微调（来自 https://arxiv.org/abs/2406.14491 的注释图）</em></figcaption></figure>

从头开始预训练很有趣，因为LLM最初就是这样创建的。不过，我认为实践者更关心的是持续预训练和微调。

这里的持续预训练是指，我们拿一个已有的预训练模型，在新的领域数据上进一步预训练。例如，考虑一个在通用文本语料上训练过的 Llama 3 8B 基础模型，你想将其适配到金融、医疗、法律或其他领域。

下表总结了研究人员将指令预训练方法应用于预训练的 Llama 3 8B 基础模型所获得的结果。具体来说，他们使用生物医学文本和金融文本进行了持续预训练。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!vNyr!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!vNyr!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 424w, https://substackcdn.com/image/fetch/$s_!vNyr!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 848w, https://substackcdn.com/image/fetch/$s_!vNyr!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 1272w, https://substackcdn.com/image/fetch/$s_!vNyr!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!vNyr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png" width="1456" height="610" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:610,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!vNyr!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 424w, https://substackcdn.com/image/fetch/$s_!vNyr!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 848w, https://substackcdn.com/image/fetch/$s_!vNyr!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 1272w, https://substackcdn.com/image/fetch/$s_!vNyr!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F469a29ba-6d63-4b4b-8f83-c17359302975_1600x670.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>三种不同预训练方法用于持续预训练的对比（来自 https://arxiv.org/abs/2406.14491 的注释表格）</em></figcaption></figure>

从上表可以看出，指令预训练方法（***Instruct PT***）明显优于普通预训练方法（***Vanilla PT***）（这里指对基础模型进行常规的持续预训练）。

Llama 3 70B 基础模型作为参考被纳入，我想是为了展示小型专用模型可以击败大型通用模型。

几乎每次我向别人解释 LLM 预训练流程时，他们都会对其简单性感到惊讶，并且惊讶于这仍然是如今训练 LLM 的常用方法。从这个意义上说，指令预训练方法相当令人耳目一新。

一个注意事项是，对于大型预训练语料库，创建指令增强语料库可能仍然成本高昂。不过，生成数据的好处在于，一旦创建，它可以在许多不同的项目中重复使用。

我写这篇文章时不能不提到谷歌新的 [Gemma 2 模型](https://storage.googleapis.com/deepmind-media/gemma/gemma-2-report.pdf)，这可以说是上个月发布的最大模型。然而，就纯规模而言，英伟达的 Nemotron-4 340B 拔得头筹（https://arxiv.org/abs/2406.11704）。Gemma 2 模型有 2.6B、9B 和 27B 参数版本。

由于这篇文章已经相当冗长，而且你可能已经从其他渠道了解了 Gemma 2，那我们就直奔主题。谷歌新发布的 Gemma 2 LLM 的主要亮点和值得注意的更新是什么？主题是探索技术，而不一定增加训练数据集的大小，而是专注于开发相对较小且高效的 LLM。

具体来说，他们融合了三种主要的架构和训练选择来创建 2.6B 和 9B 参数模型：滑动窗口注意力、分组查询注意力和知识蒸馏。

**滑动窗口注意力**（例如，由 Mistral 推广）是一种使用固定大小注意力块的技术，允许当前 token 只关注特定数量的先前 token，而不是所有先前 token，如下图所示。

在 Gemma 2 中，作者交替使用了常规注意力和滑动窗口注意力层。滑动注意力块大小为 4096 个 token，总块大小为 8192 个 token。

滑动窗口注意力主要用于提高计算性能，研究人员还进行了一项小型消融研究，表明在推理过程中缩小块大小对困惑度的影响几乎可以忽略不计。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!dSDK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!dSDK!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 424w, https://substackcdn.com/image/fetch/$s_!dSDK!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 848w, https://substackcdn.com/image/fetch/$s_!dSDK!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 1272w, https://substackcdn.com/image/fetch/$s_!dSDK!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!dSDK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png" width="375" height="169.95841995841997" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/cb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:436,&quot;width&quot;:962,&quot;resizeWidth&quot;:375,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!dSDK!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 424w, https://substackcdn.com/image/fetch/$s_!dSDK!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 848w, https://substackcdn.com/image/fetch/$s_!dSDK!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 1272w, https://substackcdn.com/image/fetch/$s_!dSDK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcb1b8411-dfa2-4ff9-adac-59b09106df99_962x436.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>来自 </span><a href="https://storage.googleapis.com/deepmind-media/gemma/gemma-2-report.pdf">Gemma 2 技术报告</a><span> 的消融研究显示，在推理过程中，减小滑动窗口的块大小对 9B 参数模型的建模性能影响微乎其微。</span></em></figcaption></figure>

（如果能同时看到 GPU 内存的改进情况，那会很有趣。）

**分组查询注意力**（如 Llama 2 和 3 中）可以被视为多查询注意力的一种更通用的形式。其动机是通过为多个查询头共享相同的键和值头来减少可训练参数的数量，从而降低计算需求。

**知识蒸馏**（如 MiniLLM，https://arxiv.org/abs/2306.08543）的核心理念是将知识从较大的模型（教师模型）迁移到较小的模型（学生模型）。在此过程中，他们从头训练了一个 27B 参数的教师模型，然后利用该较大教师模型的输出，训练了较小的 2B 和 9B 学生模型。27B 模型并未使用知识蒸馏，而是从头训练，作为较小模型的“教师”。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!bxeb!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!bxeb!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 424w, https://substackcdn.com/image/fetch/$s_!bxeb!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 848w, https://substackcdn.com/image/fetch/$s_!bxeb!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 1272w, https://substackcdn.com/image/fetch/$s_!bxeb!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!bxeb!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png" width="1456" height="692" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/273cd779-88f1-430c-950a-05c75f828d79_1600x760.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:692,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!bxeb!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 424w, https://substackcdn.com/image/fetch/$s_!bxeb!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 848w, https://substackcdn.com/image/fetch/$s_!bxeb!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 1272w, https://substackcdn.com/image/fetch/$s_!bxeb!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F273cd779-88f1-430c-950a-05c75f828d79_1600x760.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>来自我的《机器学习Q与AI》一书中关于计算机视觉背景下知识蒸馏的概述。在LLM的语境下，将图像替换为文本，将类别标签替换为预测的token。</span></em></figcaption></figure>

该论文还包含许多其他有趣的点。例如，Gemma 2 的一个显著特点是其相对较大的词汇量：256,000 个 token。这与第一代 Gemma 模型相似，但仍然值得注意，因为它是 Llama 3 词汇量（128,000）的两倍，是 Phi-3 词汇量（32,000）的八倍。

LLM 的词汇量指的是模型能够识别和生成的唯一 token（词、子词或字符）的数量。

LLM 中较大的词汇量可以更好地覆盖词汇和概念，改进对多语言内容的处理，并减少分词伪影。然而，较大的词汇量也伴随着权衡，例如模型规模增大，以及由于更大的嵌入层和输出层可能导致推理速度变慢。（这就是滑动窗口注意力和多查询注意力机制对于抵消这一影响至关重要的原因。）

论文中还有一个关于“logit 裁剪”的有趣部分，这是我之前未曾见过的技术。本质上，它是一种对 logit 值进行最小-最大归一化和裁剪的形式，以将其保持在特定范围内。我推测这是为了提高训练过程中的稳定性和梯度流。

logits ← soft\_cap ∗ tanh(logits/soft\_cap).

此外，他们还利用模型合并技术，将来自不同超参数多次运行的模型进行组合，尽管论文对此并未提供太多细节。（然而，感兴趣的读者可以在 [WARP: On the Benefits of Weight Averaged Rewarded Policies](https://arxiv.org/abs/2406.16768) 中了解更多信息，Gemma 2 正是使用了该技术进行模型合并。）

在模型性能方面，Gemma 2 几乎与规模大 3 倍的 Llama 3 70B 相当，并且超越了旧的 Qwen 1.5 32B 模型。如果能与更新的 Qwen 2 模型进行对比，那将非常有趣。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!mUlT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!mUlT!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 424w, https://substackcdn.com/image/fetch/$s_!mUlT!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 848w, https://substackcdn.com/image/fetch/$s_!mUlT!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 1272w, https://substackcdn.com/image/fetch/$s_!mUlT!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!mUlT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png" width="537" height="334.61306532663315" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:744,&quot;width&quot;:1194,&quot;resizeWidth&quot;:537,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!mUlT!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 424w, https://substackcdn.com/image/fetch/$s_!mUlT!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 848w, https://substackcdn.com/image/fetch/$s_!mUlT!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 1272w, https://substackcdn.com/image/fetch/$s_!mUlT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47e61f11-d421-4b8d-911c-ef24cff0d15e_1194x744.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>与另外两个拥有公开权重的流行模型 Llama 3 和 Qwen 1.5 的对比。（来自 Gemma 2 技术报告的注释表格）。</span></em></figcaption></figure>

个人而言，Gemma 2 报告的一大亮点是包含了部分架构选择的消融研究。这在学术研究中曾是一种常态，但在大语言模型研究中却越来越罕见。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!pi1N!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!pi1N!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 424w, https://substackcdn.com/image/fetch/$s_!pi1N!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 848w, https://substackcdn.com/image/fetch/$s_!pi1N!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 1272w, https://substackcdn.com/image/fetch/$s_!pi1N!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!pi1N!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png" width="383" height="252.24008810572687" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/e2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:598,&quot;width&quot;:908,&quot;resizeWidth&quot;:383,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!pi1N!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 424w, https://substackcdn.com/image/fetch/$s_!pi1N!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 848w, https://substackcdn.com/image/fetch/$s_!pi1N!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 1272w, https://substackcdn.com/image/fetch/$s_!pi1N!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2e16f45-736e-48ef-ac40-c7c418aabb0b_908x598.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>Gemma 2 技术报告（</span><a href="https://storage.googleapis.com/deepmind-media/gemma/gemma-2-report.pdf">链接</a><span>）中包含的消融研究示例。此处，"wide" 指具有 28 层和中间大小 24,576 的模型，而 "deep" 指具有 42 层和中间大小 14,336 的架构。</span></em></figcaption></figure>

看到谷歌发布如此相对详细的技术报告，令人耳目一新。就模型本身而言，根据公众共识，Gemma 2 很可能是当今单 GPU 使用场景下能力最强的模型。对于更大的模型，Llama 3 70B 和 Qwen 2 72B 仍然是强有力的竞争者。

Ahead of AI 是一个个人热情项目，不提供直接报酬。但对于那些希望支持我的人，请考虑购买一本[我的书籍](https://sebastianraschka.com/books/)。如果您觉得它们有见地且有益，请随时推荐给您的朋友和同事。

如果您有空闲时间，在亚马逊上为 [Machine Learning Q and AI](https://www.amazon.com/Machine-Learning-AI-Essential-Questions/dp/1718503768) 或 [Machine Learning with PyTorch and Scikit-Learn](https://www.amazon.com/Machine-Learning-PyTorch-Scikit-Learn-learning/dp/1801819319/ref=sr_1_1?crid=27NRKE8510ZCW&dib=eyJ2IjoiMSJ9.TkNrEFi6U3A1XzQPR1fFxtkV_dPIIK-OXf9buQc9DOIfhEkMakIHB-Vc2_jmSqnevK3jzIMIRVz0VAChRIhNFKXAmxnmCjXHn563FpaCIcpyCvQHafM2tctHm9PSVX11UtMM1pndhNgx9p0K8g7ExA7s-13q5LVOtKoJ-TWB7xswfc-tsL81s1mANhwQmAgDJGJwiewdxKdSEEr1iuoe_8wL9bMLbwxgBl6AuMBLDl0.u59naLiDQN-WVJ7ZGIUS6KEpMOnzd9XpWVMixwa4sjk&dib_tag=se&keywords=raschka+machine+learning&qid=1721327500&sprefix=raschka+machine+learnin%2Caps%2C204&sr=8-1) 撰写评论也会非常有帮助！

您的支持意义重大，对于继续这段旅程来说极其宝贵。谢谢！

以下是我本月偶然发现的其他一些有趣论文的精选列表。鉴于列表长度，我用星号 (\*) 标记了其中 20 篇我特别感兴趣的。但请注意，此列表及其注释完全基于我的个人兴趣以及与我自己项目的相关性。

**Scaling Synthetic Data Creation with 1,000,000,000 Personas** 作者：Chan, Wang, Yu, *等* (6月28日)，[https://arxiv.org/abs/2406.20094](https://arxiv.org/abs/2406.20094)

-   该研究提出了一种基于角色的数据合成方法论，利用 LLM 通过一个大规模自动策划的角色集合（称为 Persona Hub，代表全球约 13% 的人口）来创建多样化的合成数据。

**LLM Critics Help Catch LLM Bugs** 作者：McAleese, Pokorny, Ceron Uribe, *等* (6月28日)，[https://arxiv.org/abs/2407.00215](https://arxiv.org/abs/2407.00215)

-   本研究使用 RLHF 开发了“评论家”模型，以帮助人类评估模型生成的代码，训练 LLM 就代码错误撰写自然语言反馈，并展示了它们在各种任务中捕捉错误的有效性。

**Direct Preference Knowledge Distillation for Large Language Models** 作者：Li, Gu, Dong, *等* (6月28日)，[https://arxiv.org/abs/2406.19774](https://arxiv.org/abs/2406.19774)

-   DPKD 将 LLM 的知识蒸馏重新构建为一个两阶段过程：首先优化一个结合了隐式奖励和反向 KL 散度的目标，然后提高教师输出相对于学生输出的偏好概率。

**Changing Answer Order Can Decrease MMLU Accuracy** 作者：Gupta, Pantoja, Ross, *等* (6月27日)，[https://arxiv.org/abs/2406.19470](https://arxiv.org/abs/2406.19470)

-   本研究调查了 LLM 在 MMLU 基准测试上准确性度量的鲁棒性，揭示了打乱答案标签内容会导致所有模型的准确性下降，且敏感程度各不相同。

**从人工针到真实草堆：通过合成数据微调提升大语言模型的检索能力**  
作者：Xiong, Papageorgiou, Lee, 和 Papailiopoulos（6月27日），[https://arxiv.org/abs/2406.19292](https://arxiv.org/abs/2406.19292)  

-   本研究提出一种微调方法，利用数值键值检索任务的合成数据集，提升大语言模型在长上下文中的信息检索与推理能力。

**从LoRA权重恢复数据集大小**  
作者：Salama, Kahana, Horwitz, 和 Hoshen（6月27日），[https://arxiv.org/abs/2406.19395](https://arxiv.org/abs/2406.19395)  

本研究介绍了一种方法，通过分析LoRA矩阵的范数和谱，恢复使用LoRA微调视觉模型时所使用的图像数量。

**Step-DPO：面向大语言模型长链推理的逐步偏好优化**  
作者：Azerbayev, Shao, Lin 等人（6月26日），[https://arxiv.org/abs/2406.18629](https://arxiv.org/abs/2406.18629)  

本文提出Step-DPO方法，利用自定义的10K步级偏好对数据集，优化大语言模型在数学问题求解中的单个推理步骤。

**RouteLLM：基于偏好数据学习路由大语言模型**  
作者：Ong, Amjad 等人（6月26日），[https://arxiv.org/abs/2406.18665](https://arxiv.org/abs/2406.18665)  

-   本研究提出高效的路由模型，在推理过程中动态选择较强或较弱的大语言模型，以优化成本与性能的权衡。

**\* 深入探究大语言模型中的混合专家机制**  
作者：Zhang, Liu, Patel 等人（6月26日），[https://arxiv.org/abs/2406.18219](https://arxiv.org/abs/2406.18219)  

本研究深入分析混合专家（MoE）大语言模型的内部运作，分享关于神经元行为、专家选择标准及跨层专家多样性的见解，并基于这些观察为MoE的设计与实现提供实用建议。

**\* 遵循指令中的长度约束**  
作者：Yuan, Kulikov, Yu 等人（6月25日），[https://arxiv.org/abs/2406.17744](https://arxiv.org/abs/2406.17744)  

-   本研究介绍一种训练方法，使大语言模型在推理时能够遵循用户指定的长度约束，解决模型评估中的长度偏差问题，并在长度控制任务中优于标准指令遵循模型。

**LongIns：面向大语言模型的挑战性长上下文指令考试**  
作者：Shaham, Bai, An 等人（6月25日），[https://arxiv.org/abs/2406.17588](https://arxiv.org/abs/2406.17588)  

-   LongIns是一个新基准，用于评估大语言模型的长上下文能力，通过三种设置来测试检索与推理能力。

\* **FineWeb数据集：从网络中精选最佳文本数据**  
作者：He, Wang, Shen 等人（6月25日），[https://arxiv.org/abs/2406.17557](https://arxiv.org/abs/2406.17557)  

-   本报告介绍FineWeb（一个源自Common Crawl的15万亿词元数据集）和FineWeb-Edu（一个1.3万亿词元的教育子集）。

**Adam-mini：用更少的学习率获得更多收益**  
作者：Zhang, Chen, Li 等人（6月24日），[https://arxiv.org/abs/2406.16793](https://arxiv.org/abs/2406.16793)  

-   Adam-mini是一种提出的优化器，通过策略性地减少学习率资源、基于Hessian结构划分参数，并为参数块分配优化的单一学习率，在内存使用减少45-50%的同时，达到与AdamW相当或更优的性能。

**WARP：加权平均奖励策略的优势**  
作者：Ramé, Ferret, Vieillard 等人（6月24日），[https://arxiv.org/abs/2406.16768](https://arxiv.org/abs/2406.16768)  

-   本文提出一种新的大语言模型对齐策略，在三个阶段合并策略：使用指数移动平均进行动态KL正则化、独立微调策略的球面插值，以及与初始化的线性插值。

**更稀疏则更快，更少即是更多：面向长程Transformer的高效稀疏注意力**  
作者：Lou, Jia, Zheng, 和 Tu（6月24日），[https://arxiv.org/abs/2406.16747](https://arxiv.org/abs/2406.16747)

-   作者提出了一种用于自回归Transformer的新型稀疏注意力机制，通过评分网络和可微分top-k掩码算子，为每个查询选择固定数量的KV对，从而实现线性时间复杂度和恒定内存占用。

**通过缓解稳定性差距实现高效持续预训练**，作者：Wang, Hu, Xiong 等（6月21日），[https://arxiv.org/abs/2406.14833](https://arxiv.org/abs/2406.14833)

-   本研究提出了三种改进大语言模型持续预训练的策略：对子集进行多轮训练、聚焦高质量数据、以及使用类似预训练数据的混合数据。

**MoA：用于自动大语言模型压缩的混合稀疏注意力**，作者：Fu, Huang, Ning 等（6月21日），[https://arxiv.org/abs/2406.14909](https://arxiv.org/abs/2406.14909)

-   混合注意力（MoA）能够自动优化大语言模型中不同模型组件和输入长度的稀疏注意力模式，相比统一的稀疏注意力方法，在上下文长度、准确性和效率方面均有提升。

**LongRAG：利用长上下文大语言模型增强检索增强生成**，作者：Jiang, Ma, Chen 等（6月21日），[https://arxiv.org/abs/2406.15319](https://arxiv.org/abs/2406.15319)

-   LongRAG引入了一种新的RAG框架，使用4K令牌的检索单元和长上下文大语言模型进行答案提取，从而提升了检索性能，并在无需额外训练的情况下在问答任务上取得了最先进的结果。

**\* 信任与准确性的故事：RAG系统中的基础模型与指令微调模型**，作者：Cuconasu, Trappolini, Tonellotto 等（6月21日），[https://arxiv.org/abs/2406.14972](https://arxiv.org/abs/2406.14972)

-   本研究挑战了传统观念，证明基础大语言模型在检索增强生成（RAG）任务中优于指令微调模型。

**大语言模型能通过教学来学习吗？一项初步研究**，作者：Ning, Wang, Li, Lin 等（6月20日），[https://arxiv.org/abs/2406.14629](https://arxiv.org/abs/2406.14629)

-   作者开发并测试了三种在大语言模型中实现“通过教学来学习”的方法，在不同层面模拟人类教学过程：观察学生反馈、从反馈中学习、以及迭代学习，从而在不依赖额外人工生成数据或更强模型的情况下提升模型性能。

\* **指令预训练：语言模型是监督式多任务学习者**，作者：Cheng, Gu, Huang 等（6月20日），[https://arxiv.org/abs/2406.14491](https://arxiv.org/abs/2406.14491)

-   本研究引入了一个用于大语言模型监督式多任务预训练的框架，该框架通过合成生成的指令-响应对来增强原始语料库。

**\* 长上下文语言模型能否取代检索、RAG、SQL等？**，作者：Wu, Zhang, Johnson 等（6月19日），[https://arxiv.org/abs/2406.13121](https://arxiv.org/abs/2406.13121)

-   本研究引入了一个基准测试，用于评估长上下文大语言模型在需要处理多达数百万令牌的任务上的表现，证明这些长上下文大语言模型在上下文检索和推理任务中能够与专门的检索和RAG系统相竞争。

**评判评判者：评估大语言模型作为评判者的对齐性与脆弱性**，作者：Ye, Turpin, Li, He 等（6月18日），[https://arxiv.org/abs/2406.12624](https://arxiv.org/abs/2406.12624)

-   本文使用TriviaQA作为基准，评估了“大语言模型作为评判者”这一范式，比较了9个评判模型和9个应试模型与人工标注的结果，揭示出与人类对齐度高的模型未必是排名应试模型的最佳选择。

**从RAG到丰富参数：探究语言模型如何在事实查询中利用外部知识而非参数化信息**，作者：Wadhwa, Seetharaman, Aggarwal 等（6月18日），[https://arxiv.org/abs/2406.12824](https://arxiv.org/abs/2406.12824)

-   作者研究了大型语言模型中检索增强生成（RAG）的机制，揭示了模型在回答问题时主要依赖检索到的上下文信息而非其参数记忆，在不同模型家族中均表现出一种捷径行为。

**Self-MoE：通过自专业化专家实现组合式大型语言模型**，作者：Kang、Karlinsky、Luo 等（6月17日），[https://arxiv.org/abs/2406.12034](https://arxiv.org/abs/2406.12034)

-   本文介绍了一种方法，将单一的大型语言模型转化为名为 MiXSE（自专业化专家混合）的模块化系统，利用自生成的合成数据创建具有共享基础大型语言模型和自优化路由的专业化专家模块。

**衡量代码补全中基于人类反馈的强化学习的记忆效应**，作者：Pappu、Porter、Shumailov、Hayes（6月17日），[https://arxiv.org/abs/2406.11715](https://arxiv.org/abs/2406.11715)

-   本研究探讨了基于人类反馈的强化学习（RLHF）对大型语言模型数据记忆的影响，重点关注代码补全任务，发现与直接微调相比，RLHF 减少了奖励建模和强化学习阶段所用数据的记忆，但很大程度上保留了初始微调阶段的记忆。

**HARE：人类先验知识——小型语言模型效率的关键**，作者：Zhang、Jin、Ge 等（6月17日），[https://arxiv.org/abs/2406.11410](https://arxiv.org/abs/2406.11410)

-   本研究提出了一种原则，用于在小型语言模型（SLM）的数据构建中利用人类先验知识，重点关注语义多样性和数据质量一致性，同时避免基准数据泄露。

**迭代长度正则化直接偏好优化：将 7B 语言模型提升至 GPT-4 水平的案例研究**，作者：Kim、Lee、Park 等（6月17日），[https://arxiv.org/abs/2406.11817](https://arxiv.org/abs/2406.11817)

-   本研究引入了迭代长度正则化直接偏好优化（iLR-DPO），一种在控制回答冗长性的同时改进大型语言模型与人类偏好对齐的方法。

**揭示无编码器的视觉-语言模型**，作者：Choi、Yoon、Lee 等（6月17日），[https://arxiv.org/abs/2406.11832](https://arxiv.org/abs/2406.11832)

-   本研究提出了一种无编码器的视觉-语言模型（VLM），该模型在统一的解码器中直接处理视觉和文本输入。

\* **DeepSeek-Coder-V2：打破代码智能领域闭源模型的壁垒**，作者：Zhu、Wang、Lee 等（6月17日），[https://arxiv.org/abs/2406.11931](https://arxiv.org/abs/2406.11931)

-   DeepSeek-Coder-V2 是一个开源的混合专家代码大型语言模型，通过在 6 万亿额外令牌上持续预训练，在编码任务上达到了 GPT4-Turbo 级别的性能。

**分词器不足：分词器的诅咒**，作者：Nguyen、Kim、Patel 等（6月17日），[https://arxiv.org/abs/2406.11687](https://arxiv.org/abs/2406.11687)

-   本研究通过考察大型语言模型在复杂问题求解、令牌结构探测以及对拼写变体的鲁棒性方面的表现，探讨了“分词器的诅咒”，揭示了虽然扩大模型规模有所帮助，但大型语言模型仍然容易受到分词器引入的偏差影响。

**DataComp-LM：寻找下一代语言模型训练集**，作者：Li、Fang、Smyrnis 等（6月17日），[https://arxiv.org/abs/2406.11794](https://arxiv.org/abs/2406.11794)

-   作者提供了一个标准化测试平台，用于实验语言模型训练中的数据集策展策略，包括一个 240T 令牌的语料库、预训练配方以及 53 项下游评估。

\* **Nemotron-4 340B 技术报告**，作者：NVIDIA 未知作者（6月17日），[https://arxiv.org/abs/2406.11704](https://arxiv.org/abs/2406.11704)

-   本技术报告伴随 NVIDIA 发布的 Nemotron-4 340B 模型家族，该模型在各种基准测试中表现优异，并在合成数据生成方面表现出色，同时开源了其数据生成流水线，以促进进一步的研究和开发。

**mDPO：多模态大语言模型的条件偏好优化**，作者：Wang、Zhou、Huang 等人（6月17日），[https://arxiv.org/abs/2406.11839](https://arxiv.org/abs/2406.11839)

-   mDPO 通过优化图像偏好和语言偏好，解决了多模态 DPO 中的无条件偏好问题，并引入奖励锚点以防止选定响应的似然度下降。

\* **大语言模型在预训练过程中如何获取事实知识？** 作者：Chang、Park、Ye 等人（6月17日），[https://arxiv.org/abs/2406.11813](https://arxiv.org/abs/2406.11813)

**Task Me Anything** 作者：Zhang、Huang、Ma 等人（6月17日），[https://arxiv.org/abs/2406.11775](https://arxiv.org/abs/2406.11775)

-   Task-Me-Anything 是一个基准生成引擎，通过从庞大的图像和视频分类体系中程序化生成任务实例，为多模态语言模型创建定制化基准。

**THEANINE：利用时间线增强响应生成重新审视长对话中的内存管理** 作者：Kim、Ong、Kwon 等人（6月16日），[https://arxiv.org/abs/2406.10996](https://arxiv.org/abs/2406.10996)

-   Theanine 通过使用内存时间线（一系列展示过去事件发展和因果关系的记忆）来增强 LLM 的响应生成，提升模型从冗长对话历史中回忆和利用信息的能力。

**正则化隐藏状态使 LLM 能够学习可泛化的奖励模型** 作者：Yang、Ding、Lin 等人（6月14日），[https://arxiv.org/abs/2406.10216](https://arxiv.org/abs/2406.10216)

-   本研究提出通过保留基础模型的语言模型头并引入文本生成损失来正则化隐藏状态，同时学习奖励头，从而增强 RLHF 中奖励模型的泛化能力，提升分布外任务性能并缓解奖励过度优化。

**像金鱼一样，不要记忆！缓解生成式 LLM 中的记忆化** 作者：Hans、Wen、Jain 等人（6月14日），[https://arxiv.org/abs/2406.10209](https://arxiv.org/abs/2406.10209)

-   “金鱼损失”技术通过在训练过程中随机排除一部分 token 不参与损失计算，降低 LLM 中的模型记忆化，防止模型从训练数据中学习完整的逐字序列。

**利用 DPO 隐式奖励引导语言模型** 作者：Chen、Liu、Du 等人（6月14日），[https://arxiv.org/abs/2406.09760](https://arxiv.org/abs/2406.09760)

-   研究人员发现，使用直接偏好优化（DPO）过程中生成的隐式奖励模型（即对齐后的模型）本身可以用于生成偏好数据集，从而进一步大幅提升自身性能。

**FouRA：傅里叶低秩适应** 作者：Borse、Kadambi、Pandey 等人（6月13日），[https://arxiv.org/abs/2406.08798](https://arxiv.org/abs/2406.08798)

-   本研究引入了 FouRA，一种在傅里叶域中运行并使用自适应秩选择的新型低秩适应（LoRA）方法，解决了 LoRA 微调文本到图像扩散模型中的数据复制和分布崩溃问题，同时提升了图像质量和泛化能力。

\* **一张图像的价值远超 16x16 个补丁：探索基于单个像素的 Transformer** 作者：Nguyen、Mahmoud Assran、Jain 等人（6月13日），https://arxiv.org/abs/2406.09415

-   这项研究揭示，普通 Transformer 通过将单个像素视为 token，可以在各种计算机视觉任务中实现高性能，这挑战了现代视觉架构中基于局部性的归纳偏置的必要性假设，并为未来计算机视觉神经网络设计开辟了新的可能性。

**MLKV：用于内存高效 Transformer 解码的多层键值头** 作者：Zuhri、Adilazuarda、Purwarianti 和 Aji（6月13日），[https://arxiv.org/abs/2406.09297](https://arxiv.org/abs/2406.09297)

-   本研究引入了多层键值（MLKV）共享技术，这是一种在Transformer层间扩展键值（KV）缓存的新方法，相比现有的多查询注意力（MQA）和分组查询注意力（GQA）等方法，能显著减少自回归推理过程中的内存使用，同时保持NLP任务的性能。

**Transformers Meet Neural Algorithmic Reasoners** 作者：Bounsi、Ibarz、Dudzik 等人（6月13日），[https://arxiv.org/abs/2406.09308](https://arxiv.org/abs/2406.09308)

-   TransNAR是一种混合架构，将Transformer与基于图神经网络的神经算法推理器（NAR）相结合，通过让Transformer利用NAR强大的计算能力，同时保持对自然语言的强理解，从而在算法推理任务上实现性能提升。

**Discovering Preference Optimization Algorithms with and for Large Language Models** 作者：Lu、Holt、Fanconi 等人（6月12日），[https://arxiv.org/abs/2406.08414](https://arxiv.org/abs/2406.08414)

-   提出的发现式偏好优化方法利用大语言模型自动发现并实现新的偏好优化算法，以改进大语言模型的输出。

\* **An Empirical Study of Mamba-based Language Models** 作者：Waleffe、Byeon、Riach 等人（6月12日），[https://arxiv.org/abs/2406.07887](https://arxiv.org/abs/2406.07887)

-   本研究比较了在大型数据集上训练的80亿参数状态空间模型（Mamba、Mamba-2）与Transformer模型，发现纯状态空间模型在许多任务上达到或超越Transformer，但在需要强复制、上下文学习或长上下文推理的任务上表现落后；然而，混合模型似乎能兼顾两者优势。

\* **Large Language Models Must Be Taught to Know What They Don't Know** 作者：Kapoor、Gruver、Roberts 等人（6月12日），[https://arxiv.org/abs/2406.08391](https://arxiv.org/abs/2406.08391)

-   本研究证明，在小型分级示例数据集上微调大语言模型，能比仅通过提示产生更可靠的不确定性估计，且所得模型能够为自己和其他模型估计不确定性。

**Large Language Model Unlearning via Embedding-Corrupted Prompts** 作者：Liu、Flannigan 和 Liu（6月12日），[https://arxiv.org/abs/2406.07933](https://arxiv.org/abs/2406.07933)

-   本研究引入了嵌入破坏提示方法，这是一种大语言模型选择性知识遗忘技术，通过提示分类和嵌入破坏实现针对性遗忘，在多种模型规模下副作用极小。

**What If We Recaption Billions of Web Images with LLaMA-3?** 作者：Li、Tu、Hui 等人（6月12日），[https://arxiv.org/abs/2406.08478](https://arxiv.org/abs/2406.08478)

-   本研究证明，使用基于微调Llama 3的LLaVA-1.5多模态大语言模型对DataComp-1B数据集中的13亿张图像进行重新标注，能显著提升视觉语言模型在各种任务中的性能。

\* **Magpie: Alignment Data Synthesis from Scratch by Prompting Aligned LLMs with Nothing** 作者：Xu、Jiang、Niu 等人（6月12日），[https://arxiv.org/abs/2406.08464](https://arxiv.org/abs/2406.08464)

-   研究人员提出了一种合成指令数据生成方法，从Llama-3-Instruct中生成了30万对高质量指令-响应对；这些数据可用于监督式指令微调，无需实际对齐步骤即可达到与对齐大语言模型相当的性能。

\* **Samba: Simple Hybrid State Space Models for Efficient Unlimited Context Language Modeling**（6月11日），[https://arxiv.org/abs/2406.07522](https://arxiv.org/abs/2406.07522)

-   Samba是一种混合模型，结合了选择性状态空间模型（类似Mamba）与滑动窗口注意力机制，能高效扩展至38亿参数。

\* **Never Miss A Beat: An Efficient Recipe for Context Window Extension of Large Language Models with Consistent "Middle" Enhancement**（6月11日）作者：Wu、Zhao 和 Zheng，[https://arxiv.org/abs/2406.07138](https://arxiv.org/abs/2406.07138)

-   CREAM 是一种训练高效的方法，通过插值位置编码并使用截断高斯分布优先处理中间上下文信息，来扩展大语言模型的上下文长度。

**简单有效的掩码扩散语言模型**，作者：Sahoo、Arriola、Schiff 等人（6月11日），[https://arxiv.org/abs/2406.07524](https://arxiv.org/abs/2406.07524)

-   这项工作表明，当使用有效配方和简化目标进行训练时，掩码离散扩散模型可以显著缩小与自回归方法在语言建模方面的性能差距。

**TextGrad：通过文本实现自动“微分”**，作者：Yuksekgonul、Bianchi、Boen 等人（6月11日），[https://arxiv.org/abs/2406.07496](https://arxiv.org/abs/2406.07496)

-   TextGrad 是一个框架，利用大语言模型“反向传播”文本反馈，以优化复合人工智能系统中的构建模块（例如“工具调用器”、“搜索引擎”等）。

**一张图像仅需32个Token即可实现重建与生成**，作者：Yu、Weber、Deng 等人（6月11日），[https://arxiv.org/abs/2406.07550](https://arxiv.org/abs/2406.07550)

-   作者提出了一种基于Transformer的一维分词器用于图像生成，可将256x256x3的图像压缩为仅32个离散Token。

\* **自调优：通过自我教学指导大语言模型有效获取新知识**，作者：Zhang、Peng、Zhou 等人（6月10日），[https://arxiv.org/abs/2406.06326](https://arxiv.org/abs/2406.06326)

-   自调优框架通过专注于记忆、理解和自我反思的自我教学任务，提升了大语言模型从原始文档中获取知识的能力。

**Turbo Sparse：以最少激活参数实现大语言模型最先进性能**，作者：Song、Xie、Zhang 等人（6月10日），[https://arxiv.org/abs/2406.05955](https://arxiv.org/abs/2406.05955)

-   本文提出了dReLU激活函数和优化的训练数据混合方法，以提升大语言模型中的激活稀疏性。

**Husky：一个统一、开源的多步推理语言智能体**，作者：Kim、Paranjape、Khot 和 Hajishirzi（6月10日），[https://arxiv.org/abs/2406.06469](https://arxiv.org/abs/2406.06469)

-   Husky 是一个开源语言智能体，学习在统一动作空间上进行推理，通过迭代生成和执行动作并借助专家模型，处理涉及数值、表格和基于知识的多样化推理任务。

**无需参考的扩散模型对齐：基于边界的偏好优化**，作者：Hong、Paul、Lee 等人（6月10日），[https://arxiv.org/abs/2406.06424](https://arxiv.org/abs/2406.06424)

-   为解决RLHF和DPO等传统对齐技术的局限性，作者提出了面向文本到图像扩散模型的边界感知偏好优化（MaPO），该方法在不使用参考模型的情况下，最大化偏好图像集与非偏好图像集之间的似然边界。

\* **自回归模型超越扩散：Llama用于可扩展图像生成**，作者：Sun、Jian、Chen 等人（6月10日），[https://arxiv.org/abs/2406.06525](https://arxiv.org/abs/2406.06525)

-   作者提出了LlamaGen，将大语言模型的“下一个Token预测”范式应用于图像生成。

**创造力已离开聊天：去偏语言模型的代价**，作者：Mohammidi（6月8日），[https://arxiv.org/abs/2406.05587](https://arxiv.org/abs/2406.05587)

-   这项研究揭示，虽然RLHF等对齐技术减轻了大语言模型的偏见，但可能削弱模型的创造能力，影响句法和语义多样性，而这对于需要创造性输出的任务至关重要。

**3D-GRAND：百万级数据集助力3D大语言模型实现更好定位与更少幻觉**，作者：Yang、Chen、Madaan 等人（6月7日），[https://arxiv.org/abs/2406.05132](https://arxiv.org/abs/2406.05132)

-   这项研究引入了3D-GRAND数据集，包含40,087个家庭场景及其对应的620万条场景语言指令，并利用指令微调和3D-POPE基准测试，增强3D大语言模型的定位能力并减少幻觉。

**BERT是生成式上下文学习器**，作者：Samuel（6月7日），[https://arxiv.org/abs/2406.04823](https://arxiv.org/abs/2406.04823)

-   本文证明，像DeBERTa这样的掩码语言模型可以通过一种简单的推理技术实现上下文学习，该技术将输入标记序列重新格式化为带有掩码标记的形式，其结构类似于因果注意力掩码。

6月7日，《混合智能体增强大型语言模型能力》，https://arxiv.org/abs/2406.04692

**WildBench：用真实用户挑战性任务基准测试大型语言模型**，作者：Lin、Deng、Chandu等人（6月7日），[https://arxiv.org/abs/2406.04770](https://arxiv.org/abs/2406.04770)

-   作者引入了一个自动化评估框架，用于使用真实世界用户查询对大型语言模型进行基准测试，包含1024个任务和两个高级指标：WB-Reward和WB-Score。这些指标通过采用任务特定的检查清单和结构化解释，提供可靠且可解释的自动判断。

**CRAG——综合检索增强生成基准**，作者：Yang、Sun、Xin等人（6月7日），[https://arxiv.org/abs/2406.04744](https://arxiv.org/abs/2406.04744)

-   本研究引入了一个包含4409个问答对的事实问答数据集，并配有模拟网络和知识图谱搜索的模拟API，旨在反映多样化、动态的真实世界问答任务。

**通过C4提升大规模并行训练效率：一种通信驱动的方法**，作者：Dong、Luo、Zhang等人（6月7日），[https://arxiv.org/abs/2406.04594](https://arxiv.org/abs/2406.04594)

-   本研究引入了C4，一种用于大型语言模型并行训练的通信驱动解决方案，能够快速识别和隔离硬件故障，并优化流量规划以减少网络拥塞，从而将错误引起的开销减少高达30%，并将运行时性能提升高达15%。

**步骤感知偏好优化：在每一步对齐偏好与去噪性能**，作者：Liang、Yuan、Gu等人（6月6日），[https://arxiv.org/abs/2406.04314](https://arxiv.org/abs/2406.04314)

-   本研究引入了步骤感知偏好优化，一种后训练方法，在文本到图像扩散模型中独立评估和调整每一步的去噪性能，在图像对齐和美学方面优于Diffusion-DPO，同时提供20倍的训练效率提升。

\* **我们完成MMLU了吗？** 作者：Gema、Leang、Hong等人（6月6日），[https://arxiv.org/abs/2406.04127](https://arxiv.org/abs/2406.04127)

-   本研究识别了广泛使用的MMLU基准中的大量错误，创建了一个重新注释的子集MMLU-Redux，揭示了报告模型性能中的显著差异，并主张修订MMLU以提高其可靠性。

**\* 变压器需要眼镜！语言任务中的信息过度压缩**，作者：Barbero、Banino、Kapturowski等人（6月6日），[https://arxiv.org/abs/2406.04267](https://arxiv.org/abs/2406.04267)

-   该研究分析了大型语言模型（特别是仅解码器变压器）中的信息传播，揭示了一种表示崩溃现象，其中不同的输入序列可以产生任意接近的最终标记表示，导致在计数或复制等任务中出现错误，并丧失对特定输入标记的敏感性。

**提示报告：提示技术的系统调查**，作者：Schulhoff、Ilie、Balepur等人（6月6日），[https://arxiv.org/abs/2406.06608](https://arxiv.org/abs/2406.06608)

-   这篇76页的论文旨在提供一个清晰有序的框架，用于理解提示和提示技术。

**思想缓冲区：基于大型语言模型的思想增强推理**，作者：Yang、Yu、Zhang等人（6月6日），[https://arxiv.org/abs/2406.04271](https://arxiv.org/abs/2406.04271)

-   这种思想缓冲区方法通过检索和实例化思想模板（即通用的问题解决蓝图）来改进大型语言模型，用于跨多个领域的推理。

**块变压器：用于快速推理的全局到局部语言建模**（6月4日），作者：Ho、Bae、Kim等人，[https://arxiv.org/abs/2406.02657](https://arxiv.org/abs/2406.02657)

-   提出的Block Transformer通过将昂贵的全局注意力隔离到低层固定大小的token块上，并在高层应用快速局部注意力，将推理吞吐量提升了10-20倍。

\* **可扩展的无矩阵乘法语言建模**，作者：Zhu、Zhang、Sifferman等（6月4日），[https://arxiv.org/abs/2406.02528](https://arxiv.org/abs/2406.02528)

-   本文提出了一种可扩展的无矩阵乘法语言模型架构，该架构使用三元权重，将矩阵乘法替换为逐元素乘积和累加，即使在十亿参数规模下也能良好运行。

**迈向LLM的可扩展自动化对齐：综述**（6月3日），作者：Cao、Lu、Lu等。[https://arxiv.org/abs/2406.01252](https://arxiv.org/abs/2406.01252)

-   本文回顾了近期新兴的LLM自动化对齐方法，这些方法通常遵循LLM开发流程中的指令微调步骤。

**大型语言模型中类别与层级概念的几何结构**，作者：Park、Choe、Jiang和Veitch（6月3日），[https://arxiv.org/abs/2406.01506](https://arxiv.org/abs/2406.01506)

-   本文使用Gemma LLM，扩展了线性表示假说，表明类别概念是单纯形，层级关系是正交的，复杂概念是多面体，并通过957个WordNet概念进行了验证。

**OLoRA：大型语言模型的正交低秩自适应**，作者：Büyükakyüz（6月3日），[https://arxiv.org/abs/2406.01775](https://arxiv.org/abs/2406.01775)

-   OLoRA是对低秩自适应（LoRA）的改进，通过QR分解使用正交矩阵初始化，相比常规LoRA加速了LLM训练的收敛。

**Skywork-MoE：混合专家语言模型训练技术深度解析**，作者：Wei、Zhu、Zhao等（6月3日），[https://arxiv.org/abs/2406.06563](https://arxiv.org/abs/2406.06563)

-   一份报告，描述了从现有130亿参数密集（非混合专家）模型开发1460亿参数混合专家LLM所采用的一些方法和技术。

**展示而非讲述：通过演示反馈对齐语言模型**，作者：Shaikh、Lam、Hejna等（6月2日），[https://arxiv.org/abs/2406.00888](https://arxiv.org/abs/2406.00888)

-   所提出的方法利用模仿学习，通过少于10个演示作为反馈，将LLM输出与特定用户行为对齐。

*本杂志是个人爱好项目，不提供直接报酬。不过，如果您希望支持我，请考虑购买一本[我的书籍](https://sebastianraschka.com/books)。如果您觉得它们有见地且有益，欢迎推荐给您的朋友和同事。（通过[在亚马逊上撰写书评](https://www.amazon.com/Machine-Learning-AI-Essential-Questions/dp/1718503768/ref=sr_1_1?crid=1566EI5BQC9U0&dib=eyJ2IjoiMSJ9.4oCd5DaBraiVbzZDag-sX4dJQTIguc2mCbDGm1UCKmulcZsTRWmz--_y1AwHt5OmSFglsDpUXQO6FJ_fhs3n9qizrIqlU4STsWxFGor7WdW0QRtPtWgyzz8w0C3PHW8uwsDMJLN4VxjnFIkMizRHBoiHZjLGslLzmiLpzLTTlhbS7bSkhGnUcb1wKkartwWqVtq8c8KbnTdEJ34G6dOlf_YIfsYyG2XOGXneQuNmWh8.AZ3qpJ95F8x9PhDbClERH4iibU3U4r4CTLdtf2r1Nyc&dib_tag=se&keywords=Machine+Learning+Q+and+AI&qid=1717088426&sprefix=%2Caps%2C275&sr=8-1)与他人分享您的反馈也很有帮助！）*

**您的支持意义重大！谢谢！**

#### 关于此文章的讨论

### 准备好了解更多了吗？
