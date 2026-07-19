---
title: Building A GPT-Style LLM Classifier From Scratch
url: 'https://magazine.sebastianraschka.com/p/building-a-gpt-style-llm-classifier'
url_hash: a7ea6d2d79c7db066c846c890aa380af98bf941d
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-09-21T06:03:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
在这篇文章中，我想向你展示如何将预训练的大语言模型（LLM）转化为强大的文本分类器。

但为什么专注于分类任务呢？首先，对预训练模型进行微调用于分类，是进入模型微调领域一个温和而有效的入门方式。其次，许多现实世界和商业挑战都围绕文本分类展开：垃圾邮件检测、情感分析、客户反馈分类、主题标注等等。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!mmsV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!mmsV!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 424w, https://substackcdn.com/image/fetch/$s_!mmsV!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 848w, https://substackcdn.com/image/fetch/$s_!mmsV!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!mmsV!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!mmsV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg" width="1456" height="781" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/c52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:781,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:false,&quot;topImage&quot;:true,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!mmsV!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 424w, https://substackcdn.com/image/fetch/$s_!mmsV!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 848w, https://substackcdn.com/image/fetch/$s_!mmsV!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!mmsV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc52e5b0c-836c-4ae4-9b09-02e364004195_1600x858.jpeg 1456w" sizes="100vw" fetchpriority="high"></picture></div></a><figcaption>将GPT模型转化为文本分类器</figcaption></figure>

为了庆祝这本书的发布，我将分享其中一章的节选，该章节将引导你如何将预训练的LLM微调为垃圾邮件分类器。

**重要提示**

关于分类微调的章节长达35页——对于一篇文章来说太长了。因此，在这篇文章中，我将聚焦于大约10页的内容，介绍分类微调的背景和核心概念。

此外，我还会分享一些书中未包含的额外实验见解，并解答读者可能遇到的常见问题。（请注意，以下节选基于我个人的草稿，尚未经过Manning出版社的专业文本编辑和最终图表设计。）

本节选的完整代码可以在[GitHub上找到](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch06/01_main-chapter-code/ch06.ipynb)。

此外，我还会回答你可能关于训练LLM分类器的7个问题：

1) 我们需要训练所有层吗？

2) 为什么微调最后一个token，而不是第一个token？

3) BERT与GPT在性能上相比如何？

4) 我们应该禁用因果掩码吗？

5) 增加模型大小有什么影响？

6) 使用LoRA可以期待哪些改进？

7) 填充还是不填充？

**祝阅读愉快！**

微调语言模型最常见的方式是*指令微调*和*分类微调*。指令微调涉及使用特定指令在一组任务上训练语言模型，以提高其理解和执行自然语言提示中描述的任务的能力，如下图1所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!b-8-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!b-8-!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 424w, https://substackcdn.com/image/fetch/$s_!b-8-!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 848w, https://substackcdn.com/image/fetch/$s_!b-8-!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 1272w, https://substackcdn.com/image/fetch/$s_!b-8-!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!b-8-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png" width="1456" height="579" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/d3384270-ff15-41ba-b698-5490ab809d20_1568x624.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:579,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!b-8-!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 424w, https://substackcdn.com/image/fetch/$s_!b-8-!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 848w, https://substackcdn.com/image/fetch/$s_!b-8-!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 1272w, https://substackcdn.com/image/fetch/$s_!b-8-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3384270-ff15-41ba-b698-5490ab809d20_1568x624.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图1：两种不同指令微调场景的示意图。上方，模型被要求判断给定文本是否为垃圾邮件。下方，模型被给予一个指令，要求将英文句子翻译成德语。</em></figcaption></figure>

下一章将讨论指令微调，如上图1所示。与此同时，本章聚焦于分类微调，如果你有机器学习背景，可能已经熟悉这个概念。

在分类微调中，模型被训练用于识别特定的类别标签，例如"垃圾邮件"和"非垃圾邮件"。分类任务的示例不仅限于大语言模型和邮件过滤，还包括从图像中识别不同植物物种、将新闻文章归类为体育、政治或科技等主题，以及在医学影像中区分良性和恶性肿瘤。

关键在于，经过分类微调的模型只能预测其在训练过程中遇到过的类别——例如，它可以判断某内容是否为"垃圾邮件"或"非垃圾邮件"，如图2所示，但无法对输入文本做出其他任何表述。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!0RXf!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!0RXf!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 424w, https://substackcdn.com/image/fetch/$s_!0RXf!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 848w, https://substackcdn.com/image/fetch/$s_!0RXf!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 1272w, https://substackcdn.com/image/fetch/$s_!0RXf!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!0RXf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png" width="516" height="276.16901408450707" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:532,&quot;width&quot;:994,&quot;resizeWidth&quot;:516,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!0RXf!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 424w, https://substackcdn.com/image/fetch/$s_!0RXf!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 848w, https://substackcdn.com/image/fetch/$s_!0RXf!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 1272w, https://substackcdn.com/image/fetch/$s_!0RXf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80e640cf-da89-4479-ae8f-b39e6255e2de_994x532.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图2：使用大语言模型进行文本分类的示意图。经过垃圾邮件分类微调的模型无需在输入旁附加额外指令。然而，与指令微调模型不同，它只能输出"垃圾邮件"和"非垃圾邮件"。</em></figcaption></figure>

与图2中展示的分类微调模型不同，指令微调模型通常能够执行更广泛的任务。我们可以将分类微调模型视为高度专业化的模型，通常来说，开发一个专业化模型比开发一个在各种任务上表现良好的通用模型更容易。

> ***选择正确的方法***
>
> *指令微调提升了模型根据特定用户指令理解和生成响应的能力。指令微调最适合需要基于复杂用户指令处理多种任务的模型，能够提高灵活性和交互质量。而分类微调则适用于需要将数据精确归类到预定义类别的项目，例如情感分析或垃圾邮件检测。*

尽管指令微调更具通用性，但它需要更大的数据集和更多的计算资源来开发精通各种任务的模型。相比之下，分类微调所需的数据和计算能力较少，但其用途仅限于模型训练过的特定类别。
