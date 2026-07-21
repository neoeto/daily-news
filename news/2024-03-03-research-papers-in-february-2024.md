---
title: Research Papers in February 2024
url: 'https://magazine.sebastianraschka.com/p/research-papers-in-february-2024'
url_hash: 0a66d489cf5fce2d3f8fb84cb3b03a809568fbdb
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-03-03T06:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
再次强调，本月人工智能研究领域精彩纷呈。本期我将介绍两款新开源的大语言模型、小型微调大语言模型的洞见，以及一种参数高效的大语言模型微调技术。

上述两款大语言模型因多重原因脱颖而出。其中一款（OLMo）完全开源，从训练代码到数据集乃至日志文件均完全公开共享。

另一款（Gemma）虽仅开放权重，但在多项基准测试中达到顶尖性能，并以显著优势超越同等规模的流行大语言模型（如Llama 2 7B和Mistral 7B）。

不过在深入探讨这款新模型的架构调整细节前，我们先从下文的《小巨人》论文开始，更详细地讨论小型大语言模型的实用性。

在这篇[Tiny Titans论文](https://arxiv.org/abs/2402.00841)中，研究人员试图回答一个价值百万的问题：参数低于20亿的"小型"微调大语言模型能否超越Llama 2 Chat等开源大模型，以及GPT-3.5等专有模型？

答案并非绝对明确。在讨论细节前，下表汇总了研究结果。

上表中，"零样本"指这些模型未在会议数据和摘要数据上进一步微调，而是直接使用开源权重（如Llama 2 7B Chat）或专有API（如GPT-3.5）的现成版本。

但需注意一个重要前提：虽然这些"零样本"模型未被论文作者进一步微调，但其原始创建过程已包含大量指令微调，其中也包括生成文本摘要的任务。

现在我们可以看到，FLAN-T5-Large在**域内数据集**（互联网上不可获取的真实会议数据）类别中表现突出，因此我们可以部分肯定：小型微调大语言模型确实能超越更大的现有模型。但为何它在**QMSUM-I**数据集上的表现远逊于GPT-3.5和Mixtral-8x7B？可能有两个原因。

首先，GPT-3.5和Mixtral可能在训练过程中使用了部分公开的QMSUM数据（由于模型训练数据细节未公开，无法完全确认）。

第二个合理解释是：FLAN-T5-Large的上下文窗口限制为2048个token，而QMSUM数据集的输入长度是它的4-5倍，如下表所示。

除了上述截断问题，ROUGE分数（[实操示例见此](https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q19-evaluation-llms/rouge.ipynb)）这类自动化指标是否完全可靠？

总体而言，ROUGE分数在评估机器生成摘要与参考摘要的重叠度方面（特别是n-gram重叠、词序和词对匹配）被认为是可靠的，但可能无法充分捕捉摘要的连贯性、可读性或事实准确性等质量维度，因此并非完美工具。为此，研究人员还进行了人工评估，结果汇总于下表。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!iKP9!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!iKP9!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 424w, https://substackcdn.com/image/fetch/$s_!iKP9!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 848w, https://substackcdn.com/image/fetch/$s_!iKP9!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 1272w, https://substackcdn.com/image/fetch/$s_!iKP9!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!iKP9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png" width="637" height="311.27231467473524" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/0f217fcf-2336-429e-b307-5990daac64da_1322x646.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:646,&quot;width&quot;:1322,&quot;resizeWidth&quot;:637,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!iKP9!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 424w, https://substackcdn.com/image/fetch/$s_!iKP9!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 848w, https://substackcdn.com/image/fetch/$s_!iKP9!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 1272w, https://substackcdn.com/image/fetch/$s_!iKP9!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f217fcf-2336-429e-b307-5990daac64da_1322x646.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>带注释的表格（来源：https://arxiv.org/abs/2402.00841），展示了人工评估结果，分数越高越好</em></figcaption></figure>

根据上表中的结果，FLAN 在领域内数据集上的表现明显优于 Llama 2 7B，并且与 GPT-3.5 大致相当。在 QMSUM-I 数据集上的弱点与我们之前观察 ROUGE 分数时发现的情况类似。

另一点需要注意的是，黄金参考摘要使用了 GPT-4。假设 GPT-3.5 的预训练和指令微调方式与 GPT-4 类似，我预计结果会略微偏向 GPT-3.5。

总体而言，除了领域内数据集上的 FLAN-T5，我们发现小型微调 LLM 的表现不如大型 LLM。

一个原因是它们有限的上下文长度，这会导致输入数据被截断。这在生成摘要时会产生问题。可以通过在训练和推理时扩展上下文长度来解决，这并不一定意味着模型规模的增加。

另一个原因可能是模型在中间状态中存储和处理信息的能力较小。要探究这一点，我们至少需要训练具有不同上下文长度的各种 LLM。

为小型 LLM 选择的任务是摘要任务的微调。然而，摘要微调也是大型专有 LLM 训练的重要组成部分。换句话说，我们是在比较大型微调 LLM 和小型微调 LLM。对于尚未包含在 LLM 指令微调流程中的新颖领域特定任务，进行这种比较会很有趣。

Mixtral（在[上一期](https://magazine.sebastianraschka.com/p/research-papers-in-january-2024)中介绍过）表现非常出色！而 FLAN-T5 虽然规模小得多，但在某些微调任务上仍然是一个优秀的模型。

在 [DoRA: 权重分解低秩适应](https://arxiv.org/abs/2402.09353) 中，研究人员提出了一种创新的 LoRA 替代方案，LoRA 是 LLM 和视觉 Transformer 最广泛使用的参数高效微调方法。我原本计划在这篇文章中介绍它，但我发现这个方法非常令人兴奋，以至于几周前就忍不住实现了它。

对于有兴趣了解更多细节和论文讨论的读者，我写了一篇全面的文章和从头实现的指南，涵盖了 DoRA：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!LX62!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65c4cc25-a71e-4999-8bcf-a00a850de9a0_1510x876.png">![改进 LoRA：从头实现权重分解低秩适应（DoRA）](https://substackcdn.com/image/fetch/$s_!LX62!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F65c4cc25-a71e-4999-8bcf-a00a850de9a0_1510x876.png)

](https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch)

[OLMo: 加速语言模型科学](https://arxiv.org/abs/2402.00838) 中的 "OLMo" 指的是 **O**pen **L**anguage **Mo**del（开放语言模型），这是一个最近发布的开源 LLM（提供 1B 和 7B 参数版本）。OLMo 的显著之处在于，研究人员不仅分享了[模型权重](https://huggingface.co/allenai/OLMo-7B)，还提供了所有训练细节，包括[训练代码](https://github.com/allenai/OLMo)、[训练数据](https://huggingface.co/datasets/allenai/dolma)、模型[评估代码](https://github.com/allenai/OLMo-Eval)、[日志文件](https://wandb.ai/ai2-llm/OLMo-7B/reports/OLMo-7B--Vmlldzo2NzQyMzk5)和[微调代码](https://github.com/allenai/open-instruct)。

我强烈推荐阅读OLMo论文本身。虽然我希望它包含更多见解和分析，但看到那些微小的架构选择和超参数配置列表，对我自己的实验已经很有帮助了。以下是两个值得注意的点：

1.  他们禁用了所有线性层中的偏置向量（类似于Llama），以提高训练稳定性。

2.  他们没有使用标准的LayerNorm（带有可训练的缩放和偏移参数）或RMSNorm，而是使用了一种没有任何可训练参数的LayerNorm变体。

此外，下表列出了与其他流行LLM的关键架构差异。

而且，OLMo论文提供了关于AdamW优化器超参数和学习率的有用细节，总结在下表中。

关于学习率，他们使用了5000步（约210亿个token）的预热，然后应用线性衰减（而非余弦衰减），将学习率降至上表所示值的十分之一。此外，他们将梯度裁剪到L2范数最大值为1.0。

最后，有趣的是，他们使用了线性而非余弦学习率调度来衰减学习率，如下面的对比表所示。

虽然这些选择都很有趣，但它与其他LLM相比实际表现如何呢？事实证明，OLMo与Llama 2和Falcon相当，如下表所示。

虽然没有针对某些超参数和架构选择进行额外的消融研究，但所有日志文件都在W&B上可用，因此我们有可能在未来几周或几个月内自行进行分析。总的来说，我认为OLMo对开源和研究社区是一个非常好的贡献，我非常感谢作者分享了所有代码和训练产物。

如果你有兴趣通过从头构建一个LLM（仅使用PyTorch，不借助外部LLM库）来加深对LLM的理解，我的《从零构建大型语言模型》一书（[Build a Large Language From Scratch](https://www.manning.com/books/build-a-large-language-model-from-scratch)）的第4章现已通过Manning的早期访问版本提供。

当然，我们必须讨论Gemma，这是谷歌最近推出的一系列LLM。基于Gemini架构构建的Gemma LLM有四种变体：预训练的Gemma 2B和7B基础模型，以及Gemma 2B和7B指令微调模型。

除了[分享模型权重](https://huggingface.co/google/gemma-7b)，谷歌还发布了一份技术报告，题为《Gemma: Open Models Based on Gemini Research and Technology》（[Gemma: 基于Gemini研究与技术的开放模型](https://storage.googleapis.com/deepmind-media/gemma/gemma-report.pdf)），我们将在下面更详细地讨论。

Gemma最引人注目的方面是，与其他流行且广泛使用的开源模型（如Llama 2 7B和Mistral）相比，其性能令人印象深刻，如下图所示

目前尚不完全清楚上述分数指的是预训练变体还是指令微调变体；不过，我假设它们很可能代表指令微调模型的性能。

是什么促成了Gemma的卓越性能？论文中没有明确说明原因，但我推测是由于：

1.  庞大的词汇量达到256,000个单词（相比之下，Llama的词汇量为32,000个单词）；

2.  广泛的6万亿token训练数据集（Llama仅使用了该数量的三分之一进行训练）。

此外，在将Gemma集成到我们开源的[Lit-GPT仓库](https://github.com/Lightning-AI/lit-gpt)后，我和同事们注意到其整体架构与Llama 2高度相似。我们将在下一节中更详细地探讨这一点。

Gemma背后有哪些有趣的设计选择？如上所述，其词汇量（以及相应的嵌入矩阵大小）非常大。下表展示了Gemma与我们之前讨论的Llama 2 7B和OLMo 7B的架构对比。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!4vu7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!4vu7!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 424w, https://substackcdn.com/image/fetch/$s_!4vu7!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 848w, https://substackcdn.com/image/fetch/$s_!4vu7!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 1272w, https://substackcdn.com/image/fetch/$s_!4vu7!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!4vu7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png" width="1456" height="623" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:623,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!4vu7!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 424w, https://substackcdn.com/image/fetch/$s_!4vu7!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 848w, https://substackcdn.com/image/fetch/$s_!4vu7!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 1272w, https://substackcdn.com/image/fetch/$s_!4vu7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F218c64db-2449-4a6e-b0cf-d5c5f1b75c41_1600x685.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>Gemma、Llama 2和OLMo之间的架构对比。表格注释来自</span><a href="https://storage.googleapis.com/deepmind-media/gemma/gemma-report.pdf">Gemma报告</a></em></figcaption></figure>

另一个值得注意的点是，Gemma 2B使用了多查询注意力机制，而Gemma 7B则没有。此外，与Llama 2相比，Gemma 7B的前馈层相对较大，尽管其总层数较少（28层对比32层）。然而，尽管层数较少，Gemma的参数数量却相当庞大。

虽然它被称为Gemma 7B，但实际上总共有93亿个参数，如果考虑权重共享，则为85亿个参数。权重共享意味着它在输入嵌入层和输出投影层中使用相同的权重，类似于GPT-2和OLMo 1B（OLMo 7B在训练时未使用权重共享）。

另一个突出的细节是论文中的以下引用：

*\> 归一化器位置。我们对每个Transformer子层的输入和输出都进行归一化，这与仅归一化其中一方的标准做法不同。我们使用RMSNorm（Zhang和Sennrich，2019）作为归一化层。*

乍一看，这似乎意味着Gemma在每个Transformer块之后增加了一个额外的RMSNorm层。然而，查看[官方代码实现](https://github.com/keras-team/keras-nlp/blob/34a2cba28f6cb501ade97d6a9e308705d5095ec7/keras_nlp/models/gemma/rms_normalization.py#L39)后，发现Gemma实际上只是使用了与其他大型语言模型（如GPT-2、Llama 2等）相同的常规预归一化方案，如下图所示。

与其他架构的一个显著不同之处在于，Gemma使用了GeGLU激活函数，该函数在2020年的论文《GLU Variants Improve Transformer》中提出。

GeLU（高斯误差线性单元）是一种激活函数，作为传统ReLU的替代方案，它越来越受欢迎。GeLU的流行源于其既能引入非线性，又能允许负输入值的梯度传播，从而解决了ReLU完全阻断负值的一个局限性。

而GeGLU是GeLU的门控线性单元变体，其中激活函数被分为两部分：一个Sigmoid部分和一个线性投影，该投影与第一部分的输出进行逐元素相乘，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!XQIq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!XQIq!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 424w, https://substackcdn.com/image/fetch/$s_!XQIq!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 848w, https://substackcdn.com/image/fetch/$s_!XQIq!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 1272w, https://substackcdn.com/image/fetch/$s_!XQIq!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!XQIq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png" width="629" height="133.9217032967033" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:310,&quot;width&quot;:1456,&quot;resizeWidth&quot;:629,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!XQIq!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 424w, https://substackcdn.com/image/fetch/$s_!XQIq!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 848w, https://substackcdn.com/image/fetch/$s_!XQIq!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 1272w, https://substackcdn.com/image/fetch/$s_!XQIq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97b8625e-9b13-4737-b966-38db6f0391c4_1600x341.png 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

如上图所示，GeGLU 与其他 LLM（例如 Llama 2 和 Mistral）使用的 SwiGLU 激活函数类似，区别在于它使用 GELU 而非 Swish 作为基础激活函数。

通过查看这些激活函数的伪代码，或许能更清楚地理解这一点：

```
# 使用 GELU 的前馈模块（GPT-2）
x = linear(x)
x = gelu(x)
x = linear_projection(x)

# 使用 SwiGLU 的前馈模块（Llama 2）
x_1 = self.linear_1(x)
x_2 = self.linear_2(x)
x = silu(x_1) * x_2
x = linear_projection(x)

# 使用 GeGLU 的前馈模块（Gemma）
x_1 = self.linear_1(x)
x_2 = self.linear_2(x)
x = gelu(x_1) * x_2
x = linear_projection(x)
```

请注意，与常规使用 GeLU 的前馈模块（仅有一个 linear 层）相比，使用 SwiGLU 和 GeGLU 的前馈模块实际上多了一个线性层（`linear_1` 和 `linear_2`）。然而，在 GeGLU 和 SwiGLU 前馈模块中，`linear_1` 和 `linear_2` 通常是通过将一个线性层拆分为两部分得到的，因此不一定增加参数量。

GeGLU 比 SwiGLU 更好吗？目前没有消融研究能给出确切答案。我猜测，这个选择可能只是为了在 Gemma 和 Llama 2 之间制造一些差异。

此外，在为 Lit-GPT 添加 Gemma 支持时，[Andrei Aksionov 发现](https://github.com/Lightning-AI/lit-gpt/pull/941)了一些其他有趣的设计选择。

例如，Gemma 为 RMSNorm 层增加了 +1 的偏移量，并将嵌入向量除以隐藏层维度的平方根进行归一化。后一种做法在原始的 [Attention Is All You Need](https://arxiv.org/abs/1706.03762) Transformer 中也有采用，但在同样使用权重绑定的 GPT-2 或 OLMo 等其他模型中并未出现。

这些细节在论文中并未提及或讨论，其重要性尚不明确。

一个可能的解释是：虽然线性层和嵌入层功能相同（参见我关于[嵌入层与线性层](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch02/03_bonus_embedding-vs-matmul/embeddings-and-linear-layers.ipynb)的笔记），但它们的初始权重尺度不同。由于 Google 的研究人员倾向于在实验中使用 TensorFlow，乘以嵌入维度的平方根或许是一种将权重调整到更合理尺度的方法，如下面的示例代码所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!2bty!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!2bty!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 424w, https://substackcdn.com/image/fetch/$s_!2bty!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 848w, https://substackcdn.com/image/fetch/$s_!2bty!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 1272w, https://substackcdn.com/image/fetch/$s_!2bty!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!2bty!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png" width="1456" height="1081" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/bc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1081,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!2bty!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 424w, https://substackcdn.com/image/fetch/$s_!2bty!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 848w, https://substackcdn.com/image/fetch/$s_!2bty!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 1272w, https://substackcdn.com/image/fetch/$s_!2bty!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbc39e6fc-6b60-4006-801b-857cab1af0de_1600x1188.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>将权重乘以嵌入维度的平方根，可以使权重与标准线性层中的权重处于相同尺度。</em></figcaption></figure>

Gemma 是对公开可用的 LLM 集合的一个很好的贡献。看起来 7B 模型是一个非常强大的模型，有可能在实际应用场景中取代 Llama 2 和 Mistral。

此外，由于我们已经公开了大量约7B参数的模型，Gemma 2B反而更有趣，因为它能轻松在单张GPU上运行。与同为2.7B参数的phi-2相比，它的表现值得关注。

如果你想通过上述Lit-GPT实现实际使用Gemma，我在此创建了一个Studio环境：[链接](https://lightning.ai/lightning-ai/studios/understanding-using-and-finetuning-gemma)。

以下是我本月偶然发现的其他有趣论文精选。鉴于列表篇幅，我用星号（\*）标出了其中10篇我认为特别有趣的。但请注意，这份列表及其注释完全基于我的个人兴趣及与我项目的相关性。

**《Griffin：融合门控线性递归与局部注意力实现高效语言模型》** 作者：De、Smith、Fernando 等（2月29日），[https://arxiv.org/abs/2402.19427](https://arxiv.org/abs/2402.19427)

-   本文介绍了Hawk和Griffin，前者是一种循环神经网络LLM，后者是一种结合循环神经网络元素与局部注意力的混合架构LLM，为基于Transformer的LLM提供了高效的新替代方案。

**《当扩展遇上LLM微调：数据、模型与微调方法的影响》** 作者：Zhang、Liu、Cherry、Firat（2月27日），[https://arxiv.org/abs/2402.17193](https://arxiv.org/abs/2402.17193)

-   本研究系统探讨了模型大小、预训练数据量、微调参数量及微调数据量等扩展因素如何影响大型LLM的微调性能，并在LLM规模超过微调数据量的场景下，比较了全模型微调与参数高效微调（包括提示微调和LoRA）的效果。

**《Sora生成具有惊人几何一致性的视频》** 作者：Li、Zhou、Zhang 等（2月27日），[https://arxiv.org/abs/2402.17403](https://arxiv.org/abs/2402.17403)

-   本文引入了一个基准，通过将生成视频转换为3D模型，并以3D重建的准确性作为评估指标，来衡量Sora模型视频生成对现实物理的忠实度。研究发现，Sora在遵循物理原理方面明显优于Pika等其他文本到视频模型。

**\*《1位LLM时代：所有大型语言模型均采用1.58位》** 作者：Ma、Wang、Ma 等（2月27日），[https://arxiv.org/abs/2402.17764](https://arxiv.org/abs/2402.17764)

-   本研究引入了一种1位LLM变体（仅支持值-1、0和1），在推理时，其困惑度和下游任务性能与采用传统16位精度的LLM相当。

**《Genie：生成式交互环境》** 作者：Bruce、Dennis、Edwards 等（2月23日），[https://arxiv.org/abs/2402.15391](https://arxiv.org/abs/2402.15391)

-   Genie是一个开创性的110亿参数生成式交互环境（基于时空Transformer），通过互联网视频的无监督训练，能够从文本、图像和草图创建无限变化、可操作控制的虚拟世界。

**\*《回归基础：重新审视用于LLM人类反馈学习的REINFORCE风格优化》** 作者：Ahmadian、Cremer、Galle 等（2月22日），[https://arxiv.org/abs/2402.14740](https://arxiv.org/abs/2402.14740)

-   本研究提出，在通过人类反馈强化学习（RLHF）进行大型语言模型AI对齐时，更简单的REINFORCE风格优化方法比近端策略优化（PPO）更高效、更有效。

**《TinyLLaVA：小型大规模多模态模型框架》** 作者：Zhou、Hu、Weng 等（2月22日），[https://arxiv.org/abs/2402.14289](https://arxiv.org/abs/2402.14289)

- TinyLLaVA框架表明，小型大型多模态模型（LMMs）通过使用高质量数据和优化训练，能够匹配或超越更大模型，其最佳模型TinyLLaVA-3.1B在性能上超过了现有的7B模型。

**大型语言模型用于数据标注：一项综述**，作者：Tan、Beigi、Wang等人（2月21日），[https://arxiv.org/abs/2402.13446](https://arxiv.org/abs/2402.13446)

- 本文探讨了像GPT-4这样的大型语言模型（LLMs）在自动化数据标注这一劳动密集型过程中的潜力，重点关注其在数据标注中的应用、对LLM生成标注的评估以及从这些标注中学习。

**\* LongRoPE：将LLM上下文窗口扩展到超过200万令牌**，作者：Ding、Zhang、Zhang等人（2月21日），[https://arxiv.org/abs/2402.13753](https://arxiv.org/abs/2402.13753)

- LongRoPE是一种新方法，通过最少的微调将预训练LLM的上下文窗口扩展到2,048,000个令牌，通过改进位置插值和渐进式扩展策略，在不同上下文大小下保持性能。

**YOLOv9：使用可编程梯度信息学习你想学习的内容**，作者：Wang、Yeh和Liao（2月21日），[https://arxiv.org/abs/2402.13616](https://arxiv.org/abs/2402.13616)

- 本研究提出了解决信息瓶颈和深度监督机制不适用的方案，并提出了YOLOv9，在MS COCO数据集上相比YOLOv8提高了效率和性能。

**神经网络扩散**，作者：Wang、Xu、Zhou等人（2月20日），[https://arxiv.org/abs/2402.13144](https://arxiv.org/abs/2402.13144)

- 本研究展示了传统上用于图像和视频生成的扩散模型如何应用于生成高性能的神经网络参数。

**\* LoRA+：大型模型的高效低秩适应**，作者：Hayou、Ghosh和Yu（2月19日），[https://arxiv.org/abs/2402.12354](https://arxiv.org/abs/2402.12354)

- 本文介绍了LoRA+，这是对原始低秩适应（LoRA）方法的改进，通过为适配器矩阵A和B使用不同的学习率来增强特征学习，从而在无需额外计算成本的情况下，实现1-2%的性能提升和高达2倍的微调速度提升。

**迈向跨分词器蒸馏：面向LLM的通用对数蒸馏损失**，作者：Boizard、Haddad、Hudelot和Colombo（2月19日），[https://arxiv.org/abs/2402.12030](https://arxiv.org/abs/2402.12030)

- 本文引入了通用对数蒸馏损失，使得在不同架构和分词器的大型语言模型之间进行有效的知识蒸馏成为可能，克服了共享分词器的限制。

**AnyGPT：具有离散序列建模的统一多模态LLM**，作者：Zhan、Dai、Ye和Zhou（2月19日），[https://arxiv.org/abs/2402.12226](https://arxiv.org/abs/2402.12226)

- AnyGPT是一种多模态语言模型，通过离散表示无缝集成语音、文本、图像和音乐，在不改变大型语言模型核心架构的情况下，实现灵活的任意到任意多模态交互。

**\* 格式化对齐**，作者：Fan、Li、Zou和Li（2月19日），[https://arxiv.org/abs/2402.12219](https://arxiv.org/abs/2402.12219)

- 本文介绍了ReAlign，一种通过简单重新格式化方法提升大型语言模型（LLMs）微调数据质量，以更好地与人类价值观对齐的方法。

**LongAgent：通过多智能体协作将语言模型扩展到128k上下文**，作者：Zhao、Zu、Xu等人（2月18日），[https://arxiv.org/abs/2402.11550](https://arxiv.org/abs/2402.11550)

- LongAgent通过多智能体协作和成员间通信机制改进了LLM的长文本处理能力，在文本检索和多跳问答等任务上超越了GPT-4等模型。

**Vision-Flan：在视觉指令微调中扩展人工标注任务**，作者：Xu、Feng、Shao等人（2024年），[https://arxiv.org/abs/2402.11690](https://arxiv.org/abs/2402.11690)

-   该研究引入了Vision-Flan，这是一个多样化的视觉指令微调数据集，以及一个用于视觉语言模型的两阶段指令微调框架。通过结合专家数据和GPT-4合成数据，该框架解决了泛化能力差和偏见等问题。

**OneBit：迈向极低比特大语言模型** 作者：Xu, Han, Yang 等（2月17日），[https://arxiv.org/abs/2402.11295](https://arxiv.org/abs/2402.11295)

-   本文提出了OneBit，一个用于大语言模型的1比特量化感知训练框架。通过新的参数表示和初始化方法，该框架在性能损失极小的情况下，实现了显著的存储和计算效率提升。

**FinTral：一套GPT-4级别的多模态金融大语言模型家族** 作者：Bhatia, Nagoudi, Cavusoglu 和 Abdul-Mageed（2月16日），[https://arxiv.org/abs/2402.10986](https://arxiv.org/abs/2402.10986)

-   FinTral是一套专为金融分析优化的多模态大语言模型套件，基于Mistral-7b构建，并通过领域特定训练和基准测试进行了增强。它在关键任务上超越了ChatGPT-3.5和GPT-4——这是人工智能应用于金融领域的一个优秀案例研究。

**生成式表征指令微调** 作者：Muennighoff, Su, Wang 等（2月15日），[https://arxiv.org/abs/2402.09906](https://arxiv.org/abs/2402.09906)

-   GRIT是一种新的训练方法，它使大语言模型GritLM能够通过遵循指令，在生成任务和嵌入任务中都表现出色。

**恢复生成模型的微调前权重** 作者：Horwitz, Kahana 和 Hoshen（2月15日），[https://arxiv.org/abs/2402.10208](https://arxiv.org/abs/2402.10208)

-   本文介绍了Spectral DeTuning方法，该方法能够从Stable Diffusion和Mistral等大规模模型的微调版本中恢复其微调前的权重。

**BASE TTS：基于10万小时数据构建十亿参数文本转语音模型的经验教训** 作者：Lajszczak, Cambara, Li 等（2月15日），[https://arxiv.org/abs/2402.08093](https://arxiv.org/abs/2402.08093)

-   BASE TTS是亚马逊研究人员开发的一款新型文本转语音模型。它通过使用十亿参数的Transformer架构在10万小时数据上进行训练，实现了前所未有的语音自然度。

**Transformer能实现长度泛化，但不够稳健** 作者：Zhou, Alon, Chen 等（2月14日），[https://arxiv.org/abs/2402.09371](https://arxiv.org/abs/2402.09371)

-   本文探讨了语言模型中长度泛化的挑战。研究表明，通过使用特定的数据格式和位置编码，标准Transformer能够外推到其训练输入序列长度2.5倍的序列。然而，这种能力对权重初始化和数据顺序等因素高度敏感。

**\* DoRA：权重分解的低秩适应** 作者：Liu, Wang, Yin 等（2月14日），[https://arxiv.org/abs/2402.09353](https://arxiv.org/abs/2402.09353)

-   DoRA是对标准低秩适应（LoRA）的改进。它将预训练权重分解为幅度和方向，以实现更有效的更新，从而弥合了LoRA等参数高效微调方法与全参数微调之间的精度差距。

**专家混合模型解锁深度强化学习的参数扩展** 作者：Obando-Ceron, Sokar, Willi 等（2月13日），[https://arxiv.org/abs/2402.08609](https://arxiv.org/abs/2402.08609)

-   本文表明，将专家混合（MoE）模块，特别是Soft MoE，集成到基于价值的强化学习网络中，可以使模型随着规模增大而更有效地扩展。这为在强化学习领域建立缩放定律指明了一条路径。

**基于RingAttention的百万长度视频与语言世界模型** 作者：Liu, Yan, Zaharia 和 Abbeel（2月13日），[https://arxiv.org/abs/2402.08268](https://arxiv.org/abs/2402.08268)

-   这项工作提出利用RingAttention等最新技术，在包含长视频和长语言序列的大规模数据集上训练神经网络。

**通过直接原则反馈抑制粉红大象**（2月12日），[https://arxiv.org/abs/2402.07896](https://arxiv.org/abs/2402.07896)

-   本研究引入了直接原则反馈（DPF）作为一种新方法，用于实时调整大语言模型的响应，并通过“粉红大象问题”展示了其能力，成功引导模型避免特定话题。

**Step-On-Feet Tuning: Scaling Self-Alignment of LLMs via Bootstrapping** Wang, Ma, Meng, *等* (2月12日), [https://arxiv.org/abs/2402.07610](https://arxiv.org/abs/2402.07610)

-   该研究通过Step-On-Feet Tuning（SOFT）探索了大语言模型的多轮自对齐自举方法，利用迭代对齐和优化训练序列，相比单步方法提升了模型性能。

**Aya Model: An Instruction Finetuned Open-Access Multilingual Language Model** Ustun, Aryabumi, Yong, *等* (2月12日), [https://arxiv.org/abs/2402.07610](https://arxiv.org/abs/2402.07610)

-   该研究介绍了Aya，一个精通101种语言的多语言生成式语言模型。

**Scaling Laws for Fine-Grained Mixture of Experts** Jakub Krajewski, Jan Ludziejewski, Kamil Adamczewski, *等* (2月12日), [https://arxiv.org/abs/2402.07871](https://arxiv.org/abs/2402.07871)

-   这项工作探索了混合专家模型（MoE）的缩放特性，引入了“粒度”作为微调专家大小的新超参数，并展示了MoE模型相对于密集变换器的优越性。

**Policy Improvement using Language Feedback Models** Zhong, Misra, Yuan, 和 Cote (2月12日), [https://arxiv.org/abs/2402.07876](https://arxiv.org/abs/2402.07876)

-   语言反馈模型（LFMs）通过利用大语言模型对口头化视觉轨迹的反馈来改进模仿学习，在任务完成和适应新环境方面优于传统方法，并具有提供人类可解释反馈以验证期望行为的额外优势。

**ODIN: Disentangled Reward Mitigates Hacking in RLHF** Chen, Zhu, Soselia *等* (2月11日), [https://arxiv.org/abs/2402.07319](https://arxiv.org/abs/2402.07319)

-   该研究通过开发一个细致的评估协议和一个改进的奖励模型来解决大语言模型中的奖励黑客问题，该模型联合训练两个头部以优先考虑内容而非长度，显著减少了长度偏差并提升了策略效果。

**The Boundary of Neural Network Trainability is Fractal** Dickstein (2月9日), [https://arxiv.org/abs/2402.06184](https://arxiv.org/abs/2402.06184)

-   该研究揭示了神经网络训练中的分形边界，强调了训练动态对微小超参数调整的极端敏感性，涵盖了广泛的配置和规模。

**Buffer Overflow in Mixture of Experts** Hayes, Shumailov, 和 Yona (2月8日), [https://arxiv.org/abs/2402.05526](https://arxiv.org/abs/2402.05526)

-   这项研究表明，混合专家模型（MoE）容易受到具有跨批次依赖性的专家路由策略的攻击，恶意查询可以影响同一批次中良性查询的输出。

**Direct Language Model Alignment from Online AI Feedback** Guo, Zhang, Liu, 等 (2月7日), [https://arxiv.org/abs/2402.04792](https://arxiv.org/abs/2402.04792)

-   本文提出了一种用于模型训练的在线反馈方法，通过使用大语言模型的实时评估，超越了直接偏好对齐（DAP）方法（如DPO）和RLHF。

**Grandmaster-Level Chess Without Search** Ruoss, Deletang, 和 Medapati (2月7日), [https://arxiv.org/abs/2402.04494](https://arxiv.org/abs/2402.04494)

-   这篇来自Google Deepmind的论文展示了一个“小型”的2.7亿参数变换器模型，该模型在1000万局棋局上训练，并在国际象棋表现上超越了AlphaZero的网络和GPT-3.5-turbo-instruct。

**Self-Discover: Large Language Models Self-Compose Reasoning Structures** Zhou, Pujara, Ren, *等* (2月6日), [https://arxiv.org/abs/2402.03620](https://arxiv.org/abs/2402.03620)

-   SELF-DISCOVER使大语言模型能够自主创建推理策略，提升了它们的问题解决能力，具有显著的效率和跨模型适用性，可能更接近人类推理。

**视觉超级对齐：视觉基础模型的弱到强泛化** 作者：Guo, Chen, Wang 等（2月6日），[https://arxiv.org/abs/2402.03749](https://arxiv.org/abs/2402.03749)

-   本文通过一种用于知识蒸馏的自适应置信度损失，探索了视觉基础模型中的弱到强泛化，表明较弱的模型能够有效增强较强的模型，这标志着人工智能在视觉任务能力上的重大进步。

**MOMENT：一系列开源时间序列基础模型** 作者：Goswami, Szafer, Choudhry 等（2月6日），[https://arxiv.org/abs/2402.03885](https://arxiv.org/abs/2402.03885)

-   MOMENT引入了一种新的通用时间序列分析方法，采用开源基础模型，通过创建时间序列数据集堆栈并设计用于低监督场景下评估模型的基准，解决了缺乏统一时间序列数据集和多数据集训练复杂性等挑战。

**大型语言模型下游任务性能的缩放定律** 作者：Isik, Ponomareva, Hazimeh 等（2月6日），[https://arxiv.org/abs/2402.04177](https://arxiv.org/abs/2402.04177)

-   这项研究探讨了预训练数据的大小和相关性如何影响大型语言模型中的机器翻译性能，发现对齐能改善结果，而对齐不良则可能导致不一致的结果。

**点积注意力可解模型中的位置学习与语义学习之间的相变** 作者：Cui, Behrens, Krzakala, Zdeborova（2月6日），[https://arxiv.org/abs/2402.03902](https://arxiv.org/abs/2402.03902)

-   这项研究探讨了点积注意力层如何学习关注数据中的位置或含义，揭示出在数据充足的情况下，这些层可以通过从位置注意力机制过渡到语义注意力机制，从而超越线性模型。

**MobileVLM V2：视觉语言模型的更快更强基线** 作者：Chu, Qiao, Zhang 等（2月6日），[https://arxiv.org/abs/2402.03766](https://arxiv.org/abs/2402.03766)

-   MobileVLM V2引入了小型高效的视觉语言模型，其1.7B版本在性能上匹配或超越3B规模的模型，而3B版本则超过了7B+规模的模型。

**DeepSeekMath：推动开放语言模型数学推理的极限** 作者：Shao, Wang, Zhu 等（2月5日），[https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300)

-   DeepSeekMath 7B是一个在1200亿数学相关token上预训练的大型语言模型，通过利用网络数据并引入组相对策略优化（PPO的替代方案）进行数学推理，在MATH基准测试中取得了51.7%的分数，接近Gemini-Ultra和GPT-4等领先模型的性能。

**更多智能体即是一切所需** 作者：Li, Zhang, Yu, Fu, Ye（2月3日），[https://arxiv.org/abs/2402.05120](https://arxiv.org/abs/2402.05120)

-   这项研究表明，通过跨多个大型语言模型使用简单的多数投票集成方法，可以扩展大型语言模型的性能，其改进与现有方法互补，并且在更困难的任务中效果更为显著。

**FindingEmo：野外情感识别的图像数据集** 作者：Mertens, Yargholi, Op de Beeck 等（2月2日），[https://arxiv.org/abs/2402.01355](https://arxiv.org/abs/2402.01355)

-   FindingEmo是一个包含25,000张图像的新数据集，用于情感识别，专注于自然场景中的复杂多人场景，数据和源代码已公开共享。

**\* LiPO：通过排序学习实现列表偏好优化** 作者：Liu, Qin, Wu 等（2月2日），[https://arxiv.org/abs/2402.01878](https://arxiv.org/abs/2402.01878)

-   这项工作引入了列表偏好优化（LiPO），通过将对齐视为一个列表排序问题来使大型语言模型与人类反馈对齐，结果显示LiPO优于当前如DPO等策略优化方法。

**\* 重复我的话：Transformer在复制任务上优于状态空间模型** 作者：Jelassi、Brandfonbrener、Kakade和Malach（2月1日），[https://arxiv.org/abs/2402.01032](https://arxiv.org/abs/2402.01032)

-   本文证明，尽管状态空间模型在推理时具有效率优势，但由于GSSM在固定大小潜在状态方面的固有限制，它们在需要输入上下文复制的任务上不如Transformer。

**\* 小巨人：小型大语言模型能否在真实世界的会议摘要任务中超越自身规模？** 作者：Fu、Laskar、Khasanonva等人（2月1日），[https://arxiv.org/abs/2402.00841](https://arxiv.org/abs/2402.00841)

-   本研究发现，像FLAN-T5这样紧凑的大语言模型在会议摘要等特定任务上，其效率和性能可以匹配甚至超越更大的模型，这使其成为部署中具有成本效益的替代方案。

**\* OLMo：加速语言模型的科学** 作者：Groeneveld、Beltagy、Walsh等人（2月1日），[https://arxiv.org/abs/2402.00838](https://arxiv.org/abs/2402.00838)

-   这份技术报告介绍了OLMo，一个完全开放的大语言模型，以及其完整的框架，包括训练数据、训练和评估代码。

**大语言模型的高效探索** 作者：Dwaracherla、Asghari、Hao和Van Roy（2月1日），[https://arxiv.org/abs/2402.00396](https://arxiv.org/abs/2402.00396)

-   这篇研究论文表明，通过基于收到的反馈持续优化奖励模型，高效探索生成查询的不同方式以获取人类反馈，可以显著提升大语言模型的性能，同时减少查询次数。

我非常兴奋地宣布，《Machine Learning Q and AI》终于要出版了，我本周刚刚收到了我的作者样书。

如果你一直在寻找下一个能加深你对机器学习和人工智能概念理解的资源，《Machine Learning Q and AI》以易于理解的方式介绍了中高级概念。

Ahead of AI是一个个人热情项目，不提供直接报酬。如果你想支持我的这些努力，我将非常感激你考虑购买一本我的书。

-   [直接从No Starch Press订购](https://nostarch.com/machine-learning-and-ai-beyond-basics)

-   [从Amazon.com订购](https://www.amazon.com/Machine-Learning-AI-Beyond-Basics/dp/1718503768)

#### 关于此文章的讨论

### 准备好了解更多了吗？
