---
title: >-
  LLM Research Insights: Instruction Masking and New LoRA Finetuning
  Experiments?
url: 'https://magazine.sebastianraschka.com/p/llm-research-insights-instruction'
url_hash: f15ee17f9a180e70f51d72ddb0699517ab427690
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-06-02T06:03:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
original_lang: en
truncated: false
---
本月，我将介绍三篇与大型语言模型（LLM）的指令微调和基于LoRA的参数高效微调相关的新论文。由于我每天都在使用这些方法，因此看到能提供实用见解的新研究总是令人兴奋。

这篇文章可能比平时稍短，因为我正在完成我的书《[从零开始构建大型语言模型](http://mng.bz/orYv)》的最后一章。此外，我还在准备本周三的一场虚拟[ACM技术讲座：LLM](https://events.zoom.us/ev/ArzwACAJCGWLB-pPrWeIwszDr8WDhlEcFLL4VMCb1SJVU4fzrQo9~AvhUziSVIoulf4yLm7f0hhyew2qRK0ZEIE6Xztz4yEDudekpMeEd9L_UXVY_6lWFFOTqXHlF-N_xKaCrP5aP07ZzFQ)。该讲座免费向所有人开放，如果你感兴趣，非常欢迎参加！

本月引起我注意的一篇论文是《[指令微调：对指令计算损失](https://arxiv.org/abs/2405.14394)》。

在这篇论文中，作者质疑了指令微调中一个广泛接受的做法：在计算损失时屏蔽指令。但在讨论研究结果之前，我们先来做一个总体概述。

指令微调（简称指令调优）是改进预训练LLM响应以遵循指令的任务（例如“*总结这篇文章*”、“*翻译这个句子*”等）。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!yA5a!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!yA5a!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 424w, https://substackcdn.com/image/fetch/$s_!yA5a!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 848w, https://substackcdn.com/image/fetch/$s_!yA5a!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 1272w, https://substackcdn.com/image/fetch/$s_!yA5a!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!yA5a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png" width="603" height="501.9478021978022" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1212,&quot;width&quot;:1456,&quot;resizeWidth&quot;:603,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!yA5a!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 424w, https://substackcdn.com/image/fetch/$s_!yA5a!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 848w, https://substackcdn.com/image/fetch/$s_!yA5a!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 1272w, https://substackcdn.com/image/fetch/$s_!yA5a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d44831a-bf1e-4b56-82f1-183e31b4876a_1554x1294.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>指令微调数据集示例的图示</em></figcaption></figure>

在对LLM进行指令微调时，通常会在计算损失时屏蔽指令本身。例如，我们的[LitGPT](https://github.com/Lightning-AI/litgpt)库默认执行此操作，我在《[从零开始构建大型语言模型](https://github.com/rasbt/LLMs-from-scratch)》一书的第7章中也使用了它（不过，我现在正考虑将屏蔽操作改为读者练习）。

在其他流行的LLM库（如[Axolotl](https://github.com/OpenAccess-AI-Collective/axolotl)）中，这也是通过`config.yaml`中的默认设置`train_on_inputs: false`自动完成的。在Hugging Face中，默认情况下不会执行此操作，但可以通过`DataCollatorForCompletionOnlyLM`数据集整理器来实现，详见[其文档](https://huggingface.co/docs/trl/en/sft_trainer#train-on-completions-only)。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!0wW6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!0wW6!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 424w, https://substackcdn.com/image/fetch/$s_!0wW6!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 848w, https://substackcdn.com/image/fetch/$s_!0wW6!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 1272w, https://substackcdn.com/image/fetch/$s_!0wW6!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!0wW6!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png" width="1456" height="624" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:624,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!0wW6!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 424w, https://substackcdn.com/image/fetch/$s_!0wW6!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 848w, https://substackcdn.com/image/fetch/$s_!0wW6!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 1272w, https://substackcdn.com/image/fetch/$s_!0wW6!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98ac4f2a-7a11-4acd-b2e2-79ed53921296_1502x644.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>输入屏蔽的图示：高亮文本仍会输入LLM，但在训练期间不用于计算损失。</em></figcaption></figure>

如上所述，屏蔽输入提示是一项常规任务，有些论文可能会比较屏蔽与不屏蔽的效果。例如，QLoRA论文在其附录中进行了比较，发现屏蔽效果更好。

请注意，MMLU是一个专注于衡量多项选择题性能的基准，作者并未测量或研究当微调后的模型用作聊天机器人时，这对对话性能有何影响。

在上一节对主题进行简要介绍之后，让我们来审视《[指令微调：对指令计算损失](https://arxiv.org/abs/2405.14394)》这篇论文。在这项研究中，作者系统地研究了指令被屏蔽与未屏蔽时LLM性能的差异。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!vW3B!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!vW3B!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 424w, https://substackcdn.com/image/fetch/$s_!vW3B!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 848w, https://substackcdn.com/image/fetch/$s_!vW3B!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 1272w, https://substackcdn.com/image/fetch/$s_!vW3B!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!vW3B!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png" width="1456" height="1155" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/ed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1155,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!vW3B!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 424w, https://substackcdn.com/image/fetch/$s_!vW3B!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 848w, https://substackcdn.com/image/fetch/$s_!vW3B!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 1272w, https://substackcdn.com/image/fetch/$s_!vW3B!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fed9ccd32-a70e-43bf-975d-cd707345e882_1600x1269.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>（1）无指令掩码、（2）指令掩码和（3）模板文本掩码的示意图。</em></figcaption></figure>

上图中的方法1是实现LLM时的默认方法，因为它不需要任何额外工作或修改损失函数。作者在论文中称这种方法为"指令建模"。（在论文中，他们还额外掩码了可能出现在非Alpaca提示模板中的特殊提示标记，如`<|user|>`、`<|assistant|>`和`<|system|>`。）

方法2是目前实践中最常见的方法，即在计算损失时，除响应部分外，其余所有内容都被掩码。在论文中，作者称这种方法为"指令微调"（在此语境下，这个命名有些不幸，因为与方法1相比，我们并非在"微调"指令，而是将指令排除在损失之外）。

在绘制上图时，我想到了一个论文中未探讨的有趣的第三种方法：掩码提示特定的模板文本。例如，在Alpaca风格的提示中，所有示例都以"Below is an instruction..."开头。与实际的指令和输入相比，这段文本是恒定的，因此可以将其排除在损失之外。论文中并未研究这一点，但这可能是一个有趣的补充实验，我计划将其作为另一个读者练习（附解决方案）添加到我的[《从零开始构建LLM》](https://github.com/rasbt/LLMs-from-scratch)一书中。

事实证明，指令建模（即不掩码指令）似乎优于掩码方法，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!mC_S!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!mC_S!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 424w, https://substackcdn.com/image/fetch/$s_!mC_S!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 848w, https://substackcdn.com/image/fetch/$s_!mC_S!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 1272w, https://substackcdn.com/image/fetch/$s_!mC_S!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!mC_S!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png" width="1456" height="622" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/a5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:622,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!mC_S!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 424w, https://substackcdn.com/image/fetch/$s_!mC_S!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 848w, https://substackcdn.com/image/fetch/$s_!mC_S!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 1272w, https://substackcdn.com/image/fetch/$s_!mC_S!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5293f2b-4861-42d3-a921-bbd4fbc2afc1_1600x684.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>不掩码指令的效果优于掩码指令。摘自《Instruction Tuning With Loss Over Instructions》（</span><a href="https://arxiv.org/abs/2405.14394">https://arxiv.org/abs/2405.14394</a><span>）</span></em></figcaption></figure>

然而，"指令建模"的性能取决于（a）指令与响应长度的比例，以及（b）数据集的大小（以训练样本数量计）。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!PUmD!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!PUmD!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 424w, https://substackcdn.com/image/fetch/$s_!PUmD!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 848w, https://substackcdn.com/image/fetch/$s_!PUmD!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 1272w, https://substackcdn.com/image/fetch/$s_!PUmD!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!PUmD!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png" width="1456" height="658" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:658,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:473847,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!PUmD!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 424w, https://substackcdn.com/image/fetch/$s_!PUmD!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 848w, https://substackcdn.com/image/fetch/$s_!PUmD!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 1272w, https://substackcdn.com/image/fetch/$s_!PUmD!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2dcc97b5-b2c2-4032-a4d1-a3a274a2caac_2092x946.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>不掩码指令的收益取决于数据集的长度和大小。摘自《Instruction Tuning With Loss Over Instructions》（https://arxiv.org/abs/2405.14394）</figcaption></figure>

对于上述数据集长度和大小依赖性的一个合理解释是：如果响应较短且训练样本较少，模型更容易记忆响应，因此在损失中纳入指令建模（即对更多模型输出进行建模）有助于减少过拟合。

简而言之，作者发现，回归基础、不掩码指令，可以提升模型性能。

令人惊讶的是，不屏蔽指令（除了屏蔽特殊提示标记如<|user|>、<|assistant|>和<|system|>）这种更简单的方法表现更好。

根据我的个人经验，过去尝试这两种方法时并未看到明显优劣，我通常不会过多实验屏蔽策略，而是更专注于在效果不佳时调整其他设置。事后看来，或许应该多考虑尝试（不）屏蔽的方法，因为这似乎取决于数据集的大小和长度。

[LoRA Learns Less and Forgets Less](https://arxiv.org/abs/2405.09673) 是一项关于低秩适配（LoRA）微调大语言模型的全面实证研究，将LoRA与全参数微调在两个目标领域（编程和数学）进行了比较。除了这些领域，比较还扩展到两个目标任务：指令微调和持续预训练。

如果你希望在阅读前回顾LoRA知识，我最近在《改进LoRA：从零实现权重分解低秩适配（DoRA）》中做了介绍：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!LX62!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65c4cc25-a71e-4999-8bcf-a00a850de9a0_1510x876.png">![改进LoRA：从零实现权重分解低秩适配（DoRA）](https://substackcdn.com/image/fetch/$s_!LX62!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65c4cc25-a71e-4999-8bcf-a00a850de9a0_1510x876.png)

](https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch)

根据第一组结果，LoRA的学习能力明显弱于全参数微调，如下图所示。在我看来这符合预期，因为更新更少的参数会限制学习能力。学习新知识通常需要比将预训练基础模型转化为指令跟随模型更强的能力。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!3u9H!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!3u9H!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 424w, https://substackcdn.com/image/fetch/$s_!3u9H!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 848w, https://substackcdn.com/image/fetch/$s_!3u9H!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 1272w, https://substackcdn.com/image/fetch/$s_!3u9H!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!3u9H!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png" width="1456" height="723" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:723,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!3u9H!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 424w, https://substackcdn.com/image/fetch/$s_!3u9H!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 848w, https://substackcdn.com/image/fetch/$s_!3u9H!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 1272w, https://substackcdn.com/image/fetch/$s_!3u9H!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F22601b68-778c-4a26-b6e7-5c1e51d20d76_1600x795.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>全参数微调 vs LoRA。性能在HumanEval数据集上测量，该数据集包含164个编程挑战。注释图来自LoRA Learns Less and Forgets Less，</span><a href="https://arxiv.org/abs/2405.09673">https://arxiv.org/abs/2405.09673</a><span>。</span></em></figcaption></figure>

在上图中，另一个值得注意的点是，LoRA与全参数微调之间的差距在持续预训练中比在指令微调中更大。这与常见直觉一致：预训练主要教会大语言模型新知识，而指令微调主要改变大语言模型的行为。

接下来，考察数学领域（而非编程）的同一组实验，我们发现全参数微调与LoRA之间的差距缩小了，如下图所示。

可以认为，解决数学问题比编程更接近大语言模型的源领域。换句话说，大语言模型在预训练期间可能遇到更多数学问题而非编程任务。此外，数学问题通常用文字描述，而编程需要一套全新的术语。

总结来说，到目前为止我们可以得出结论：新任务与预训练数据的偏差越大，在获取新知识（例如通过持续预训练）时，使用全参数微调相比LoRA的优势就越明显。

上文我们探讨了LoRA与全量微调在知识更新方面的对比。接下来的实验通过持续预训练和指令微调，评估了这两种方法在额外训练后遗忘信息的情况。与之前结果的不同之处在于，这里衡量的是它们在原始源任务上的表现。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!JQPO!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!JQPO!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 424w, https://substackcdn.com/image/fetch/$s_!JQPO!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 848w, https://substackcdn.com/image/fetch/$s_!JQPO!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 1272w, https://substackcdn.com/image/fetch/$s_!JQPO!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!JQPO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png" width="1456" height="624" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:624,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!JQPO!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 424w, https://substackcdn.com/image/fetch/$s_!JQPO!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 848w, https://substackcdn.com/image/fetch/$s_!JQPO!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 1272w, https://substackcdn.com/image/fetch/$s_!JQPO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c69b535-fb2f-45a2-bece-2310c4c5be0e_1600x686.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>在编程数据训练后，全量微调与LoRA在原始源任务上的表现对比。</span><em><span>来自《LoRA学得更少，遗忘也更少》的标注图，</span><a href="https://arxiv.org/abs/2405.09673">https://arxiv.org/abs/2405.09673</a><span>。</span></em></figcaption></figure>

从上图可以看出，当这些方法应用于距离源领域较远的数据集（此处为编程）时，全量微调遗忘的知识远多于LoRA。对于数学数据集，差距较小，如下所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!NVUC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!NVUC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 424w, https://substackcdn.com/image/fetch/$s_!NVUC!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 848w, https://substackcdn.com/image/fetch/$s_!NVUC!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 1272w, https://substackcdn.com/image/fetch/$s_!NVUC!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!NVUC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png" width="1456" height="794" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:794,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!NVUC!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 424w, https://substackcdn.com/image/fetch/$s_!NVUC!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 848w, https://substackcdn.com/image/fetch/$s_!NVUC!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 1272w, https://substackcdn.com/image/fetch/$s_!NVUC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F269396b6-0f2a-42ea-9466-7938b71eecb3_1600x872.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>在数学数据训练后，全量微调与LoRA在原始源任务上的表现对比。</span><em><span>来自《LoRA学得更少，遗忘也更少》的标注图，</span><a href="https://arxiv.org/abs/2405.09673">https://arxiv.org/abs/2405.09673</a><span>。</span></em></figcaption></figure>

LoRA与全量微调相比如何？或许正如预期，这归根结底是学习与遗忘之间的权衡。全量微调在新目标领域表现更强，而LoRA在原始源领域保持更好的性能*。

直观上，我怀疑这仅仅是LoRA改变模型中参数更少的副作用——正如其名，LoRA的目标是低秩适应，这意味着不会大幅修改所有模型参数。

此外，在实践中，通常不是选择全量微调还是LoRA的问题，因为后者由于节省内存和存储空间，可能是唯一可行的选项。

尽管如此，看到这些内容被如此详尽地展开并通过大量实验细节进行分析，仍然非常有趣。（实验使用7B和13B的Llama 2模型进行。）

*（Mariano Kamp向我指出一个注意事项：他们在LoRA实验中未更新嵌入层，而这在将模型适应新任务时至关重要。）

每当有类似LoRA的高效LLM微调方法的新论文发表时，总是令人兴奋。在[MoRA：用于参数高效微调的高秩更新](https://arxiv.org/abs/2405.12130)中，作者采用了一种与低秩适应相关但相反的方法，用方矩阵替换了LoRA适配器。

此外，我的《从零开始构建大型语言模型》一书（[http://mng.bz/orYv](http://mng.bz/orYv)）的附录E，为训练用于分类垃圾邮件的GPT模型实现了从零开始的LoRA。

如下图所示，MoRA使用一个小方矩阵（M）代替两个小的LoRA矩阵A和B。我们将在下一节继续讨论其工作原理。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!dSQt!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!dSQt!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 424w, https://substackcdn.com/image/fetch/$s_!dSQt!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 848w, https://substackcdn.com/image/fetch/$s_!dSQt!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 1272w, https://substackcdn.com/image/fetch/$s_!dSQt!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!dSQt!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png" width="371" height="282.76216216216216" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:564,&quot;width&quot;:740,&quot;resizeWidth&quot;:371,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!dSQt!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 424w, https://substackcdn.com/image/fetch/$s_!dSQt!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 848w, https://substackcdn.com/image/fetch/$s_!dSQt!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 1272w, https://substackcdn.com/image/fetch/$s_!dSQt!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1845cdf5-c5f9-4023-9e25-f3f09dc5803e_740x564.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>LoRA 和 MoRA 的并排对比，其中 W 是神经网络层中的权重。图片来源：MoRA: High-Rank Updating for Parameter-Efficient Finetuning，</span><a href="https://arxiv.org/abs/2405.12130">https://arxiv.org/abs/2405.12130</a></figcaption></figure>

为什么还要引入另一种 LoRA 替代方案，而且还是带有“高”秩的？原因在于，LoRA 对原始权重的更新方式相对有限。在我看来，这其实是设计使然，因为当我们用 LoRA 微调模型时，并不希望过度扰动或改变原始模型的能力。然而，尽管这种低秩更新对于指令微调等任务来说既有效又充分，但它有一个缺点：在吸收新知识方面相对低效，例如通过持续预训练（也就是在常规文本数据上进行微调，而非指令微调）。

在 MoRA 论文中，作者试图开发一种参数高效的微调方法，该方法在***指令微调***和通过持续预训练吸收新知识方面都能表现良好。

下面是一个基于合成数据集的 LoRA、MoRA 和常规全微调（FFT）的并排对比，该数据集要求 LLM 记忆特定的标识符代码。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!qKBD!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!qKBD!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 424w, https://substackcdn.com/image/fetch/$s_!qKBD!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 848w, https://substackcdn.com/image/fetch/$s_!qKBD!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 1272w, https://substackcdn.com/image/fetch/$s_!qKBD!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!qKBD!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png" width="531" height="506.7" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/ba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1126,&quot;width&quot;:1180,&quot;resizeWidth&quot;:531,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!qKBD!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 424w, https://substackcdn.com/image/fetch/$s_!qKBD!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 848w, https://substackcdn.com/image/fetch/$s_!qKBD!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 1272w, https://substackcdn.com/image/fetch/$s_!qKBD!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4b3670-7b49-406b-95fe-060e62b8c547_1180x1126.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>LoRA、MoRA 和全微调（FFT）在记忆标识符代码方面的性能。图片来源：MoRA: High-Rank Updating for Parameter-Efficient Finetuning，</span><a href="https://arxiv.org/abs/2405.12130">https://arxiv.org/abs/2405.12130</a></figcaption></figure>

在上图所示的合成基准测试中，MoRA 的知识吸收（或记忆）能力与全微调相当。高秩（r=256）的 LoRA 最终也能记住这些合成标识符代码，但需要更多的训练步数。而小秩（r=8）的 LoRA 则无法记住。

需要注意的是，LLM 中的记忆并不一定是好事（当然，历史日期和事实除外）。然而，LoRA 不易记忆的特性，在减少对训练数据过拟合的倾向方面也可能是一个优势。话虽如此，这个基准测试主要探究的是 LoRA 是否具备足够的能力来学习新知识。可以将其类比为批次过拟合——一种流行的调试技术，我们试图让模型在训练集的一小部分上过拟合，以确保架构实现正确。（我们将在下一节中查看基于真实数据的基准测试。）

那么，MoRA 是如何实现的呢？

在这里，作者使用了一个可训练的方阵来作用于原始权重 W，而不是 LoRA 中的矩阵 AB。这个方阵通常远小于原始权重矩阵。事实上，LoRA 和 MoRA 的可训练参数数量甚至可以相同。

例如，若原始权重层有4096×4096=16,777,216个参数，则r=8的LoRA有4096×8+8×4096=65,536个参数。使用MoRA时，我们可以用r=256匹配参数数量，即256×256=65,536。

如何将这个256×256矩阵应用于原始的1024×1024权重矩阵？他们定义了几种非参数压缩和解压缩方法（具体细节超出本文范围，但我尝试在图中用PyTorch代码进行了总结）。

左图：参数总数相同时，LoRA和DoRA的矩阵维度可视化。右图：说明MoRA矩阵压缩和解压缩的示例代码。

LoRA和MoRA相比如何？

从实际数据集基准测试（见下表）来看，MoRA和LoRA的表现大致相当。然而，在生物医学和金融数据的持续预训练场景中，MoRA优于所有LoRA变体；只有全微调（FFT）表现更好。此外，一个有趣的观察是，LoRA与DoRA（我几个月前在《从零实现权重分解低秩适配（DoRA）》中介绍过的一种LoRA变体）持平或更优：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!LX62!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65c4cc25-a71e-4999-8bcf-a00a850de9a0_1510x876.png">![从零实现权重分解低秩适配（DoRA）](https://substackcdn.com/image/fetch/$s_!LX62!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65c4cc25-a71e-4999-8bcf-a00a850de9a0_1510x876.png)

](https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch)

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!XKoY!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!XKoY!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 424w, https://substackcdn.com/image/fetch/$s_!XKoY!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 848w, https://substackcdn.com/image/fetch/$s_!XKoY!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 1272w, https://substackcdn.com/image/fetch/$s_!XKoY!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!XKoY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png" width="635" height="494.38022284122565" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1118,&quot;width&quot;:1436,&quot;resizeWidth&quot;:635,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!XKoY!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 424w, https://substackcdn.com/image/fetch/$s_!XKoY!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 848w, https://substackcdn.com/image/fetch/$s_!XKoY!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 1272w, https://substackcdn.com/image/fetch/$s_!XKoY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4cdae923-c277-4091-9d65-bff898d0d683_1436x1118.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>几种LoRA变体与MoRA在实际数据集上的比较。注释表来自《MoRA: High-Rank Updating for Parameter-Efficient Finetuning》，</span><a href="https://arxiv.org/abs/2405.12130">https://arxiv.org/abs/2405.12130</a></figcaption></figure>

事实证明，相对简单的MoRA方法效果出奇地好。在持续预训练中，它确实略优于LoRA。然而，在小秩下的指令微调和数学推理方面，它略逊于LoRA。对我来说，这些结果还不足以让我用MoRA取代LoRA。尽管如此，这篇论文提出了一种有趣的方法，并附带了一系列有趣的实验。

以下是我本月偶然发现的其他一些有趣论文。鉴于列表长度，我用星号（\*）标记了其中10篇我特别感兴趣的。但请注意，此列表及其注释完全基于我的个人兴趣和与我项目的相关性。

**Contextual Position Encoding: Learning to Count What's Important** 作者：Golovneva, Wang, Weston, and Sukhbaatar（5月29日），[https://arxiv.org/abs/2405.18719](https://arxiv.org/abs/2405.18719)

-   该研究引入了上下文位置编码（CoPE），这是一种针对LLM的新位置编码方法，能够适应上下文，从而实现更抽象的基于位置的注意力。

**LLaMA-NAS: Efficient Neural Architecture Search for Large Language Models** 作者：Sarah, Sridhar, Szanking, and Sundaresan（5月28日），[https://arxiv.org/abs/2405.18377](https://arxiv.org/abs/2405.18377)

-   这项研究引入了一种方法，使用一次性NAS和遗传算法优化LLaMA2-7B模型，实现了1.5倍的尺寸缩减和1.3倍的吞吐量加速，且精度损失极小，优于传统的剪枝和稀疏化技术。

**VeLoRA: Memory Efficient Training using Rank-1 Sub-Token Projections** 作者：Miles, Reddy, Elezi, and Deng（5月28日），[https://arxiv.org/abs/2405.17991](https://arxiv.org/abs/2405.17991)

-   本文介绍了一种内存高效的算法，用于训练和微调大型语言模型（LLM），该算法在无性能损失的情况下压缩中间激活，将token拆分为子token，并将其投影到固定的1D子空间。

**\*** **gzip预测数据依赖的缩放定律**，作者：Pandey（5月26日），[https://arxiv.org/abs/2405.16684](https://arxiv.org/abs/2405.16684)

-   这项研究通过证明模型性能缩放对训练数据复杂度敏感，挑战了神经语言模型缩放定律与数据无关的观点，提出了一种新的数据依赖缩放定律，将模型的计算最优资源分配与训练数据的gzip压缩性相关联。

**面向大型语言模型对齐的离线正则化强化学习**，作者：Yao、Wu、Yang等（5月22日），[https://arxiv.org/abs/2405.13800](https://arxiv.org/abs/2405.13800)

-   本文介绍了直接奖励优化（DRO），一种用于对齐大型语言模型的新框架，利用更丰富的单轨迹数据集（包含提示、响应和用户反馈），消除了像直接偏好优化（DPO）中所需的成对偏好数据。

**Trans-LoRA：迈向无数据可迁移的参数高效微调**，作者：Wang、Ghosh、Cox等（5月27日），[https://arxiv.org/abs/2405.17258](https://arxiv.org/abs/2405.17258)

-   Trans-LoRA能够使用合成数据，在不同基础模型之间实现几乎无数据、无损的低秩适配器（LoRA）迁移。

**堆叠你的Transformer：深入探究模型增长以实现高效LLM预训练**（5月26日），作者：Du、Luo、Qiu等，[https://arxiv.org/abs/2405.15319](https://arxiv.org/abs/2405.15319)

-   本文研究了在LLM预训练中的模型增长方法，特别是一种名为Gstack的深度堆叠算子，以加速训练并提升性能。

**少走规划之路**，作者：Defazio、Yang、Mehta等（5月24日），[https://arxiv.org/abs/2405.15682](https://arxiv.org/abs/2405.15682)

-   该研究引入了一种无需调度的优化方法，在无需预定义停止时间的情况下，超越了传统学习率调度，且未在标准动量优化器基础上增加额外超参数。

**带指令损失的指令微调**，作者：Shi、Yang、Wu等（5月23日），[https://arxiv.org/abs/2405.14394](https://arxiv.org/abs/2405.14394)

-   本文比较了在指令微调中是否屏蔽指令时LLM的性能，发现不屏蔽指令往往表现更好。

**SimPO：基于无参考奖励的简单偏好优化**，作者：Meng、Xia和Chen（5月23日），[https://arxiv.org/abs/2405.14734](https://arxiv.org/abs/2405.14734)

-   直接偏好优化（DPO）简化了LLM的基于人类反馈的强化学习，而本文通过平均对数概率并移除参考模型，进一步简化了DPO。

**AlignGPT：具备自适应对齐能力的多模态大型语言模型**，作者：Fei Zhao、Taotian Pang和Chunhui Li（5月23日），[https://arxiv.org/abs/2405.14129](https://arxiv.org/abs/2405.14129)

-   AlignGPT是一种新的多模态大型语言模型，通过在预训练中区分图像-文本对的对齐能力，并在指令微调中自适应调整这些能力，从而改进跨模态对齐。

**用于MLLM的密集连接器**，作者：Yao、Wu、Yang等（5月22日），[https://arxiv.org/abs/2405.13800](https://arxiv.org/abs/2405.13800)

-   本文介绍了密集连接器，一种视觉-语言连接器，通过整合多层视觉特征来改进多模态大型语言模型（MLLM）。

**注意力机制作为RNN**，作者：Feng、Tung、Hajimirsadeghi等（5月22日），[https://arxiv.org/abs/2405.13956](https://arxiv.org/abs/2405.13956)

-   这项研究将Transformer重新解释为RNN的一种变体，并引入了Aaren，一种新的基于注意力的模块，结合了Transformer的并行训练能力与传统RNN的高效、恒定内存更新特性。

**\* MoRA: 面向参数高效微调的高秩更新方法** 作者：Jiang, Huang, Luo 等（5月20日），[https://arxiv.org/abs/2405.12130](https://arxiv.org/abs/2405.12130)

-   本文分析了大型语言模型中低秩更新的局限性，并提出了MoRA方法，该方法采用方阵实现高秩更新，在保持与LoRA相同参数效率的同时，在内存密集型任务上表现更优，并在其他任务上维持了相当的性能。

**SLAB: 基于简化线性注意力与渐进式重参数化批归一化的高效Transformer** 作者：Guo, Chen, Tang, Wang（5月19日），[https://arxiv.org/abs/2405.11582](https://arxiv.org/abs/2405.11582)

-   本文提出了一种在Transformer模型中逐步用重参数化批归一化替代层归一化的方法，并配套设计了简化线性注意力模块。

**面向模块化大型语言模型：构建与复用LoRA库** 作者：Ostapenko, Su, Ponti 等（5月17日），[https://arxiv.org/abs/2405.11157](https://arxiv.org/abs/2405.11157)

-   本研究探索了将基础大型语言模型中训练好的适配器复用于新任务的方法，引入了一种基于模型聚类的适配器库构建技术，并设计了零样本路由机制，无需重新训练即可提升任务泛化能力。

**Chameleon: 混合模态早期融合基础模型** 作者：Meta AI（5月16日），[https://arxiv.org/abs/2405.09818](https://arxiv.org/abs/2405.09818)

-   Chameleon是一种基于令牌的早期融合混合模态模型，擅长以任意序列处理并生成图像与文本。

**Xmodel-VLM: 多模态视觉语言模型的简单基线** 作者：Xu, Liu, He 等（5月15日），[https://arxiv.org/abs/2405.09215](https://arxiv.org/abs/2405.09215)

-   本文介绍了Xmodel-VLM，一个10亿参数规模的高效多模态视觉语言模型，专为在消费级GPU上部署而设计。

**\* LoRA学习更少、遗忘更少** 作者：Biderman, Ortiz, Portes 等（5月15日），[https://arxiv.org/abs/2405.09673](https://arxiv.org/abs/2405.09673)

-   本研究将参数高效微调方法——低秩适配与大型语言模型在编程和数学领域的全参数微调进行了对比，发现LoRA虽然通常表现逊色，但能更好地保留目标领域外的基础模型能力，并提供更强的正则化效果。

**RLHF工作流：从奖励建模到在线强化学习人类反馈** 作者：Dong, Xiong, Pang 等（5月13日），[https://arxiv.org/abs/2405.07863](https://arxiv.org/abs/2405.07863)

-   本报告概述了一种面向大型语言模型的在线迭代RLHF方法，该方法使用代理模型模拟人类反馈，性能优于离线方法，并由此诞生了高性能的SFR-Iterative-DPO-LLaMA-3-8B-R模型。

**PHUDGE: Phi-3作为可扩展评判模型** 作者：Deshwal, Chawla（5月12日），[https://arxiv.org/abs/2405.08029](https://arxiv.org/abs/2405.08029)

-   本报告介绍了PHUDGE，一个Phi3模型，在评分任务的速度和有效性上超越了ChatGPT的GPT-4。

**面向语言模型对齐与个性化的价值增强采样** 作者：Han, Shenfeld, Srivastava 等（5月10日），[https://arxiv.org/abs/2405.06639](https://arxiv.org/abs/2405.06639)

-   本研究引入了价值增强采样，一种新的奖励优化框架，无需修改模型权重或联合训练策略与价值函数即可高效对齐大型语言模型，并支持对ChatGPT等仅提供API的模型进行适配。

**\* 对大型语言模型进行新知识微调会诱发幻觉吗？** 作者：Gekhman, Yona, Aharoni 等（5月9日），[https://arxiv.org/abs/2405.05904](https://arxiv.org/abs/2405.05904)

-   本研究探讨了在大型语言模型监督微调过程中引入新事实信息的影响，发现虽然这些模型难以吸收新事实且学习速度慢于熟悉信息，但最终对这些事实的学习会线性增加模型生成事实错误回答的倾向。

**\*** **Fishing for Magikarp: Automatically Detecting Under-trained Tokens in Large Language Models** 作者：Land 和 Bartolo（5月8日），[https://arxiv.org/abs/2405.05417](https://arxiv.org/abs/2405.05417)

-   本文对大型语言模型中的分词器问题进行了深入分析，并提出了一种自动检测“故障令牌”的方法——这些令牌存在于分词器中，但在训练数据中几乎或完全缺失。

**\*** **DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model** 作者：Liu、Feng、Wang 等人（5月8日），[https://arxiv.org/abs/2405.04434](https://arxiv.org/abs/2405.04434)

-   DeepSeek-V2 是一个 236B 参数的混合专家语言模型（每个令牌仅激活 21B 参数），引入了多头潜在注意力机制，旨在将键值缓存压缩为潜在向量，从而提高推理效率并降低内存需求。

**You Only Cache Once: Decoder-Decoder Architectures for Language Models** 作者：Sun、Dong、Zhu 等人（5月8日），[https://arxiv.org/abs/2405.05254](https://arxiv.org/abs/2405.05254)

-   该研究提出了 YOCO，一种用于大型语言模型的解码器-解码器架构，其特点是通过自解码器编码全局键值缓存供交叉解码器使用，大幅降低了 GPU 内存需求并提升了预填充性能。

**\*** **xLSTM: Extended Long Short-Term Memory** 作者：Beck、Poeppel、Spanring 等人（5月7日），[https://arxiv.org/abs/2405.04517](https://arxiv.org/abs/2405.04517)

-   本研究探索了通过指数门控和增强记忆结构等新改进将 LSTM 扩展到数十亿参数的潜力，并将这些改进集成到 xLSTM 架构中，使其性能与基于 Transformer 和状态空间的最先进大型语言模型相当。

**vAttention: Dynamic Memory Management for Serving LLMs without PagedAttention** 作者：Prabhu、Nayak、Mohan 等人（5月7日），[https://arxiv.org/abs/2405.04437](https://arxiv.org/abs/2405.04437)

-   本文介绍了 vAttention，一种管理大型语言模型中 GPU 内存的方法，该方法将键值缓存保留在连续的虚拟内存中，并利用现有的低级系统支持按需分页来动态分配物理内存。

**\*** **Is Flash Attention Stable?** 作者：Golden、Hsia、Sun 等人（5月5日），[https://arxiv.org/abs/2405.02803](https://arxiv.org/abs/2405.02803)

-   本研究开发了一个框架来分析数值偏差对大规模机器学习模型训练的影响，发现广泛使用的 Flash Attention 优化存在显著的数值偏差，尽管其影响小于低精度训练带来的偏差。

**\*** **What Matters When Building Vision-Language Models?** 作者：Laurencon、Tronchon、Cord 和 Sanh（5月3日），[https://arxiv.org/abs/2405.02246](https://arxiv.org/abs/2405.02246)

-   本文强调了视觉语言模型中关键设计选择缺乏论证的问题，并介绍了 Idefics2，一个 80 亿参数的新视觉语言模型，通过严格评估不同架构、数据和训练方法实现了最先进的性能，其模型和数据集已公开发布。

**Prometheus 2: An Open Source Language Model Specialized in Evaluating Other Language Models**（5月2日），[https://arxiv.org/abs/2405.01535](https://arxiv.org/abs/2405.01535)

-   本文介绍了 Prometheus 2，一个开源评估型大型语言模型，通过紧密对齐人类和 GPT-4 的判断，并提供灵活的评估格式和标准，解决了先前模型的局限性。

**\*** **A Careful Examination of Large Language Model Performance on Grade School Arithmetic** 作者：Zhang、Da、Lee 等人（5月1日），[https://arxiv.org/abs/2405.00332](https://arxiv.org/abs/2405.00332)

-   本研究引入了GSM1k，这是一个模仿已有GSM8k的新基准测试，用于检验大语言模型，并发现模型性能显著下降，这表明之前的成功可能更多源于记忆训练数据，而非真正的数学推理能力。（注：GSM8k是一个基准测试，旨在通过呈现小学水平复杂度的问题来评估大语言模型的数学推理能力。）

**通过自我对弈偏好优化实现语言模型对齐**，作者：Wu、Sun、Yuan等人（5月1日），[https://arxiv.org/abs/2405.00675](https://arxiv.org/abs/2405.00675)

-   本文介绍了用于语言模型对齐的自我对弈概率偏好优化（SPPO）方法，该方法利用自我对弈框架，通过迭代策略更新来近似纳什均衡。

**更大的编辑批次规模总是更好吗？基于Llama-3的模型编辑实证研究**，作者：Yoon、Gupta和Anumanchipalli（5月1日），[https://arxiv.org/abs/2405.00664](https://arxiv.org/abs/2405.00664)

-   本研究通过在Llama-3上测试跨不同层的顺序编辑、批量编辑以及一种新颖的顺序-批量编辑，检验了模型编辑技术的有效性，结论是较小的顺序编辑在提升模型性能方面优于较大的批量编辑。（注：编辑批次规模指在一轮编辑中同时对模型参数进行的更改数量。）

*本刊物是个人兴趣项目，不提供直接报酬。不过，若您愿意支持我，请考虑购买一本[我的书籍](https://sebastianraschka.com/books)。如果您觉得这些书有见地且有益，欢迎推荐给您的朋友和同事。（通过[在亚马逊上撰写书评](https://www.amazon.com/Machine-Learning-AI-Essential-Questions/dp/1718503768/ref=sr_1_1?crid=1566EI5BQC9U0&dib=eyJ2IjoiMSJ9.4oCd5DaBraiVbzZDag-sX4dJQTIguc2mCbDGm1UCKmulcZsTRWmz--_y1AwHt5OmSFglsDpUXQO6FJ_fhs3n9qizrIqlU4STsWxFGor7WdW0QRtPtWgyzz8w0C3PHW8uwsDMJLN4VxjnFIkMizRHBoiHZjLGslLzmiLpzLTTlhbS7bSkhGnUcb1wKkartwWqVtq8c8KbnTdEJ34G6dOlf_YIfsYyG2XOGXneQuNmWh8.AZ3qpJ95F8x9PhDbClERH4iibU3U4r4CTLdtf2r1Nyc&dib_tag=se&keywords=Machine+Learning+Q+and+AI&qid=1717088426&sprefix=%2Caps%2C275&sr=8-1)与他人分享您的反馈，也大有帮助！)*

**您的支持意义重大！非常感谢！**

#### 关于本篇文章的讨论

### 想要了解更多？
