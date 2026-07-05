---
title: Categories of Inference-Time Scaling for Improved LLM Reasoning
url: 'https://magazine.sebastianraschka.com/p/categories-of-inference-time-scaling'
url_hash: 4c3da264aa3a873f81b8a15185eb48c77d49acd7
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-01-24T08:15:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
推理时扩展已成为提升已部署大语言模型回答质量和准确性的最有效方法之一。

其核心理念非常直观：如果我们愿意在推理阶段（即使用模型生成文本时）投入更多算力和时间，就能让模型产出更优质的答案。

如今，所有主流大语言模型提供商都在采用某种形式的推理时扩展技术。学术界围绕这些方法的研究文献也大幅增长。

今年三月，我曾撰写过一篇推理时扩展领域的综述，总结了部分早期技术。

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!IOSP!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faf9e2677-652a-4af1-9f57-dc0c253d2198_1448x1260.png">![大语言模型推理模型推理状态](https://substackcdn.com/image/fetch/$s_!IOSP!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faf9e2677-652a-4af1-9f57-dc0c253d2198_1448x1260.png)

](https://magazine.sebastianraschka.com/p/state-of-llm-reasoning-and-inference-scaling)

本文旨在将之前的讨论进一步深化，将不同方法归入更清晰的类别，并重点介绍过去几个月涌现的最新研究成果。

在撰写《[从零构建推理模型](https://mng.bz/Nwr7)》中关于推理时扩展的完整章节时，我亲自实验了许多基础方法。经过超参数调优，这迅速演变成数千次运行实验，耗费大量思考与工作来确定哪些方法应在章节中详细阐述。（该章节内容增长迅猛，最终被我拆分为两章，目前均已纳入早期访问计划。）

附注：我对这两章的内容尤为满意。它将基础模型的准确率从约15%提升至约52%，成为本书迄今为止最令人振奋的章节之一。

以下内容汇集了最终未能完全融入章节叙事、但仍值得分享的想法、笔记与论文。

我还计划逐步在 [GitHub 的补充材料](https://github.com/rasbt/reasoning-from-scratch)中增加更多代码实现。

**目录（概览）**

1.  推理时扩展概述
2.  思维链提示
3.  自洽性
4.  Best-of-N 排序
5.  带验证器的拒绝采样
6.  自我优化
7.  解路径搜索
8.  结论、分类与组合
9.  彩蛋：专有LLM使用什么？

您可以通过文章网页视图左侧的导航栏直接跳转到任意章节。

*推理时扩展*（亦称*推理计算扩展*、*测试时扩展*或简称*推理扩展*）是一个总称，指在推理过程中分配更多算力和时间以提升模型性能的方法。

这一概念由来已久，经典机器学习中的集成方法可视为推理时扩展的早期范例——即使用多个模型需要更多计算资源，但能带来更优结果。

即便在大语言模型领域，这一理念也已存在多年。不过，我印象中它（再次）变得特别流行，是在去年 OpenAI 发布 o1 公告博文《[学习用LLM推理](https://openai.com/index/learning-to-reason-with-llms/)》时，展示了推理时扩展与训练曲线图。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!oiA2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!oiA2!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 424w, https://substackcdn.com/image/fetch/$s_!oiA2!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 848w, https://substackcdn.com/image/fetch/$s_!oiA2!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 1272w, https://substackcdn.com/image/fetch/$s_!oiA2!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!oiA2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png" width="1456" height="819" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/fff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:819,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!oiA2!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 424w, https://substackcdn.com/image/fetch/$s_!oiA2!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 848w, https://substackcdn.com/image/fetch/$s_!oiA2!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 1272w, https://substackcdn.com/image/fetch/$s_!oiA2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffff769a2-8324-4fbd-8659-4615e4711ce2_1600x900.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图1：在推理（左）和训练（右）过程中投入更多资源，通常能提升模型的准确率。</em></figcaption></figure>

我认为这张改编自OpenAI[博客文章](https://openai.com/index/learning-to-reason-with-llms/)的图表，很好地诠释了我们改进大语言模型时可用的两个调节旋钮。我们可以在训练阶段投入更多资源（更多数据、更大模型、更多或更长的训练阶段），也可以在推理阶段投入更多资源。

实际上，在实践中，同时采用两种方式效果更佳：训练一个更强的模型，再通过额外的推理扩展使其表现更上一层楼。

在本文中，我只聚焦于图表的左侧部分——推理时扩展技术，即那些不改变模型权重的免训练技术。
