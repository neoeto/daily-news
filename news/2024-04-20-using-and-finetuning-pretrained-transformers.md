---
title: Using and Finetuning Pretrained Transformers
url: >-
  https://magazine.sebastianraschka.com/p/using-and-finetuning-pretrained-transformers
url_hash: 3e034385ade240c24808b6828bd26665c42a4934
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-04-20T07:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
本周进展不断，包括令人兴奋的新AI研究，我将在[每月底常规总结](https://magazine.sebastianraschka.com/archive)中讨论。

此外，我很高兴宣布由No Starch Press出版的新书《*[Machine Learning Q and AI](https://www.amazon.com/Machine-Learning-AI-Essential-Questions/dp/1718503768)*》正式发布。

如果你一直在寻找入门机器学习课程后的进阶资源，这本书或许正合你意。书中涵盖了我此前书籍和课程中未深入探讨的30个概念，并以简洁的问答形式（含练习）呈现。

我相信它也能成为机器学习面试准备的有益参考。

鉴于当前最热门的话题之一是如何使用和微调预训练大语言模型（LLM），我想分享书中一个节选，希望对你当前的项目有所帮助。

*祝阅读愉快！*

使用和微调预训练大语言模型（LLM）有哪些不同方式？最常见的三种方式包括：基于特征的方法、上下文提示（in-context prompting）以及更新部分模型参数。

首先，大多数预训练LLM或语言Transformer无需进一步微调即可使用。例如，我们可以采用基于特征的方法，利用预训练Transformer生成的嵌入向量来训练新的下游模型（如线性分类器）。其次，我们可以在输入中直接展示新任务的示例，这意味着无需模型进行任何更新或学习，即可直接呈现预期输出。这一概念也称为提示（prompting）。最后，我们也可以微调全部或少量参数以达到预期效果。

以下章节将深入讨论这些方法。

我们先从使用预训练Transformer的传统方法开始：基于特征嵌入训练另一个模型、微调输出层以及微调所有层。我们将以分类任务为例进行讨论。（关于提示的详细内容，将在后文“上下文学习、索引与提示微调”部分重新探讨。）

**基于特征的方法**

在基于特征的方法中，我们加载预训练模型并保持其“冻结”状态，即不更新预训练模型的任何参数。相反，我们将模型视为特征提取器，应用于新数据集，然后基于这些嵌入向量训练下游模型。下游模型可以是任意模型（随机森林、XGBoost等），但线性分类器通常表现最佳。这很可能是因为BERT、GPT、Llama、Mistral等预训练Transformer已能从输入数据中提取高质量、信息丰富的特征。这些特征嵌入往往捕捉了复杂的关联和模式，使得线性分类器能够轻松有效地将数据划分为不同类别。

此外，线性分类器（如逻辑回归模型和支持向量机）通常具有较强的正则化特性。这些正则化特性有助于在使用预训练Transformer生成的高维特征空间时防止过拟合。这种基于特征的方法是最有效的方式，因为它完全不需要更新Transformer模型。最后，在训练分类器进行多个训练周期时，嵌入向量可以针对给定的训练数据集预先计算（因为它们不会变化）。

图1展示了LLM通常如何通过微调创建并应用于下游任务。这里，一个在通用文本语料库上预训练的模型被微调以执行德语到英语翻译等任务。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!AK0B!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!AK0B!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 424w, https://substackcdn.com/image/fetch/$s_!AK0B!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 848w, https://substackcdn.com/image/fetch/$s_!AK0B!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 1272w, https://substackcdn.com/image/fetch/$s_!AK0B!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!AK0B!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp" width="553" height="383.4569256756757" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:821,&quot;width&quot;:1184,&quot;resizeWidth&quot;:553,&quot;bytes&quot;:56392,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/webp&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!AK0B!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 424w, https://substackcdn.com/image/fetch/$s_!AK0B!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 848w, https://substackcdn.com/image/fetch/$s_!AK0B!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 1272w, https://substackcdn.com/image/fetch/$s_!AK0B!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F77ca5be8-cbe3-444d-84a3-fa848d5b9815_1184x821.webp 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图1：大型语言模型的一般微调工作流程</em></figcaption></figure>

**微调**

微调预训练LLM的传统方法包括仅更新输出层（我们称之为微调I）和更新所有层（我们称之为微调II）。

微调I类似于前面描述的基于特征的方法，但它会在LLM本身中添加一个或多个输出层。LLM的主干保持冻结，我们只更新这些新层中的模型参数。由于不需要通过整个网络进行反向传播，这种方法在吞吐量和内存需求方面相对高效。在微调II中，我们加载模型并添加一个或多个输出层，与微调I类似。然而，我们不是仅通过最后几层进行反向传播，而是通过反向传播更新所有层，这使得它成为最昂贵的方法。虽然这种方法在计算上比基于特征的方法和微调I更昂贵，但它通常能带来更好的建模或预测性能。对于更专业的领域特定数据集尤其如此。

图2总结了本节到目前为止描述的三种方法。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Rtrq!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Rtrq!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 424w, https://substackcdn.com/image/fetch/$s_!Rtrq!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 848w, https://substackcdn.com/image/fetch/$s_!Rtrq!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 1272w, https://substackcdn.com/image/fetch/$s_!Rtrq!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Rtrq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp" width="1456" height="730" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:730,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:96094,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/webp&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Rtrq!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 424w, https://substackcdn.com/image/fetch/$s_!Rtrq!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 848w, https://substackcdn.com/image/fetch/$s_!Rtrq!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 1272w, https://substackcdn.com/image/fetch/$s_!Rtrq!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bf4e2c8-5f09-4642-b9a5-4f83e9916381_1701x853.webp 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图2：利用预训练LLM的三种传统方法。你可以在</span><a href="https://github.com/rasbt/MachineLearning-QandAI-book/tree/main/supplementary/q18-using-llms/01_classifier-finetuning">此处</a><span>找到所有三种方法的代码示例。</span></em></figcaption></figure>

除了本节描述的三种微调方法的概念性总结外，图2还提供了这些方法在训练效率方面的经验法则指南。由于微调II比微调I更新更多的层和参数，因此微调II的反向传播成本更高。出于类似原因，微调II比更简单的基于特征的方法成本更高。

感兴趣的读者可以在[此处](https://github.com/rasbt/MachineLearning-QandAI-book/tree/main/supplementary/q18-using-llms/01_classifier-finetuning)找到说明基于特征的方法、微调一个或多个层以及微调完整Transformer用于分类的代码示例。

像GPT-2和GPT-3这样的LLM普及了上下文学习的概念，在此上下文中通常称为零样本或少样本学习，如图3所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!kFBS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!kFBS!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 424w, https://substackcdn.com/image/fetch/$s_!kFBS!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 848w, https://substackcdn.com/image/fetch/$s_!kFBS!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 1272w, https://substackcdn.com/image/fetch/$s_!kFBS!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!kFBS!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp" width="525" height="540.8759124087592" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:988,&quot;width&quot;:959,&quot;resizeWidth&quot;:525,&quot;bytes&quot;:69514,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/webp&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!kFBS!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 424w, https://substackcdn.com/image/fetch/$s_!kFBS!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 848w, https://substackcdn.com/image/fetch/$s_!kFBS!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 1272w, https://substackcdn.com/image/fetch/$s_!kFBS!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7f7fcfc0-4845-4721-a2e8-edb69b396bbc_959x988.webp 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图3：通过提示进行上下文学习。上下文学习的代码可在此处</span><a href="https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q18-using-llms/02_prompting">获取</a><span>。</span></em></figcaption></figure>

如图3所示，上下文学习旨在在输入或提示中提供任务相关的上下文或示例，使模型能够推断出期望的行为并生成适当的响应。这种方法利用了模型在预训练期间从海量数据中学习的能力，这些数据包含了多样化的任务和上下文。

> 注：少样本学习的定义（通常被视为与基于上下文学习的方法同义）与第3章讨论的传统少样本学习方法有所不同。

例如，假设我们想使用上下文学习进行少样本的德语-英语翻译，并采用像GPT-3这样的大规模预训练语言模型。为此，我们提供几个德语-英语翻译的示例，帮助模型理解所需的任务，如下所示：

```
将以下德语句子翻译成英语：
示例1：
德语："Ich liebe Pfannkuchen."
英语："I love pancakes."

示例2：
德语："Das Wetter ist heute schoen."
英语："The weather is nice today."

翻译这个句子：
德语："Wo ist die naechste Bushaltestelle?"
```

一般来说，上下文学习在某些任务或特定数据集上的表现不如微调，因为它依赖于预训练模型从训练数据中泛化的能力，而无需针对当前任务进一步调整其参数。

然而，上下文学习也有其优势。当用于微调的标注数据有限或不可用时，它尤其有用。此外，在我们无法直接访问模型，或仅通过UI或API（例如ChatGPT）与模型交互的情况下，它还能让我们快速尝试不同任务，而无需微调模型参数。

与上下文学习相关的是硬提示调优的概念，其中“硬”指的是输入标记的不可微性质。前面描述的微调方法通过更新模型参数来更好地执行当前任务，而硬提示调优则旨在优化提示本身以获得更好的性能。提示调优不会修改模型参数，但可能涉及使用较小的标注数据集来为特定任务确定最佳的提示表述方式。例如，为了改进前面德语-英语翻译任务的提示，我们可以尝试以下三种提示变体：

-   `"将德语句子'{german_sentence}'翻译成英语：{english_translation}"`

-   `"德语：'{german_sentence}' | 英语：{english_translation}"`

-   `"从德语到英语：'{german_sentence}' -> {english_translation}"`

提示调优是一种资源高效的替代参数微调的方法。然而，其性能通常不如全模型微调，因为它不会针对特定任务更新模型参数，这可能会限制其适应任务特定细微差别的能力。此外，提示调优可能耗费人力，因为它需要人工参与比较不同提示的质量，或使用其他类似方法来完成。这通常被称为硬提示，因为输入标记是不可微的。另外，还有其他方法提出使用另一个大语言模型来自动生成和评估提示。

> 你可以在[此处](https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q18-using-llms/02_prompting)找到演示提示和上下文学习的代码示例。

另一种纯粹基于上下文学习的方法是LLM索引，如图4所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!snki!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!snki!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 424w, https://substackcdn.com/image/fetch/$s_!snki!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 848w, https://substackcdn.com/image/fetch/$s_!snki!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 1272w, https://substackcdn.com/image/fetch/$s_!snki!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!snki!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp" width="501" height="385.41694630872485" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/bddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:917,&quot;width&quot;:1192,&quot;resizeWidth&quot;:501,&quot;bytes&quot;:38658,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/webp&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!snki!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 424w, https://substackcdn.com/image/fetch/$s_!snki!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 848w, https://substackcdn.com/image/fetch/$s_!snki!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 1272w, https://substackcdn.com/image/fetch/$s_!snki!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbddcd0d3-3c5f-44bc-bdc7-c9bb2d7af3e9_1192x917.webp 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图4：LLM索引，用于从外部文档中检索信息。你可以在</span><a href="https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q18-using-llms/03_retrieval-augmented-generation">此处</a><span>找到索引代码示例。</span></em></figcaption></figure>

在LLM的背景下，我们可以将索引视为一种基于上下文学习的变通方法，它允许我们将LLM转变为信息检索系统，从外部资源和网站中提取信息。在图4中，索引模块将文档或网站解析成较小的块。这些块被嵌入为向量，并存储在向量数据库中。当用户提交查询时，索引模块计算嵌入查询与数据库中每个向量之间的向量相似度。最后，索引模块检索前k个最相似的嵌入来合成响应。

> LLM索引通常作为一个总称，描述将LLM连接到现有数据源的框架或过程。一个具体的例子是检索增强生成（RAG）。RAG涉及将LLM与检索系统结合，以增强模型生成响应的能力。

感兴趣的读者可以在[此处](https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q18-using-llms/03_retrieval-augmented-generation/retrieval-augmented-generation.ipynb)找到展示LLM索引和检索增强生成的代码示例。

近年来，已经开发出许多方法，以更高效地将预训练Transformer适应新的目标任务。这些方法通常被称为参数高效微调，截至撰写本文时，最流行的方法总结在图5中。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!cOVH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!cOVH!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 424w, https://substackcdn.com/image/fetch/$s_!cOVH!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 848w, https://substackcdn.com/image/fetch/$s_!cOVH!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 1272w, https://substackcdn.com/image/fetch/$s_!cOVH!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!cOVH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp" width="449" height="311.0687432867884" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/e978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:645,&quot;width&quot;:931,&quot;resizeWidth&quot;:449,&quot;bytes&quot;:32428,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/webp&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!cOVH!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 424w, https://substackcdn.com/image/fetch/$s_!cOVH!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 848w, https://substackcdn.com/image/fetch/$s_!cOVH!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 1272w, https://substackcdn.com/image/fetch/$s_!cOVH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe978f96d-d3ff-406f-b48c-67c5c5abdca5_931x645.webp 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图5：参数高效微调技术的主要类别，附有流行示例</em></figcaption></figure>

与前一节讨论的硬提示方法相比，软提示策略优化了提示的嵌入版本。在硬提示调优中，我们修改离散的输入标记，而在软提示调优中，我们使用可训练的参数张量。

**软提示调优**

软提示调优的核心思想是：在嵌入查询令牌前添加一个可训练的参数张量（即“软提示”），然后通过梯度下降法对该张量进行调优，以提升模型在目标数据集上的性能。用类似 Python 的伪代码描述如下：

```
x = EmbeddingLayer(input_ids)
x = concatenate([soft_prompt_tensor, x],
                 dim=seq_len)
output = model(x)
```

其中 `soft_prompt_tensor` 的特征维度与嵌入层生成的嵌入输入相同。因此，修改后的输入矩阵会多出若干行（相当于在原始输入序列后添加了额外的令牌，使序列变长）。

**前缀调优**

另一种流行的提示调优方法是前缀调优。前缀调优与软提示调优类似，区别在于前缀调优是将可训练张量（软提示）添加到每个 Transformer 块的前面，而不仅仅是嵌入输入，这有助于稳定训练过程。前缀调优的实现如下列伪代码所示：

```
def transformer_block_with_prefix(x):
    ➊ soft_prompt = FullyConnectedLayers( # 前缀
        soft_prompt)                      # 前缀
    # 2:
    ➋ x = concatenate([soft_prompt, x],   # 前缀
                       dim=seq_len)       # 前缀
    ➌ x = SelfAttention(x)
    x = LayerNorm(x + residual)
    residual = x
    x = FullyConnectedLayers(x)
    x = LayerNorm(x + residual)
    return x
```

*列表 1：为前缀调优修改后的 Transformer 块*

我们将列表 1 分为三个主要部分：实现软提示、将软提示（前缀）与输入拼接，以及实现 Transformer 块的其余部分。首先，张量 `soft_prompt` 通过一组全连接层进行处理 ➊。其次，变换后的软提示与主输入 `x` 进行拼接 ➋。拼接的维度用 `seq_len` 表示，即序列长度维度。第三，后续代码行 ➌ 描述了 Transformer 块中的标准操作，包括自注意力、层归一化和前馈神经网络层，这些操作通过残差连接包裹。

如列表 1 所示，前缀调优通过添加可训练的软提示来修改 Transformer 块。图 6 进一步说明了常规 Transformer 块与前缀调优 Transformer 块之间的区别。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!H3ec!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!H3ec!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 424w, https://substackcdn.com/image/fetch/$s_!H3ec!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 848w, https://substackcdn.com/image/fetch/$s_!H3ec!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 1272w, https://substackcdn.com/image/fetch/$s_!H3ec!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!H3ec!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp" width="539" height="851.5862068965517" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:2016,&quot;width&quot;:1276,&quot;resizeWidth&quot;:539,&quot;bytes&quot;:90058,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/webp&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!H3ec!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 424w, https://substackcdn.com/image/fetch/$s_!H3ec!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 848w, https://substackcdn.com/image/fetch/$s_!H3ec!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 1272w, https://substackcdn.com/image/fetch/$s_!H3ec!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2a14fb20-8cbf-4f12-be49-5aa1b9662d6d_1276x2016.webp 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图 6：常规 Transformer 与前缀调优的对比</em></figcaption></figure>

软提示调优和前缀调优都被认为是参数高效的，因为它们只需要训练添加的参数张量，而不需要训练 LLM 本身的参数。

**适配器方法**

适配器方法与前缀调优相关，都是在 Transformer 层中添加额外参数。在原始的适配器方法中，额外的全连接层被添加到每个 Transformer 块的多头自注意力和现有全连接层之后，如图 7 所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!J4M8!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!J4M8!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 424w, https://substackcdn.com/image/fetch/$s_!J4M8!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 848w, https://substackcdn.com/image/fetch/$s_!J4M8!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 1272w, https://substackcdn.com/image/fetch/$s_!J4M8!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!J4M8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp" width="563" height="852.3018726591761" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:2021,&quot;width&quot;:1335,&quot;resizeWidth&quot;:563,&quot;bytes&quot;:104876,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/webp&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!J4M8!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 424w, https://substackcdn.com/image/fetch/$s_!J4M8!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 848w, https://substackcdn.com/image/fetch/$s_!J4M8!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 1272w, https://substackcdn.com/image/fetch/$s_!J4M8!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1252b9f2-5cb0-448a-b2d1-b55c2b83aee5_1335x2021.webp 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图7：常规Transformer模块（左）与带有适配器层的Transformer模块（右）的对比。你可以在</span><a href="https://github.com/rasbt/MachineLearning-QandAI-book/tree/main/supplementary/q18-using-llms/04_adapter">此处</a><span>找到说明适配器层的代码示例。</span></em></figcaption></figure>

在使用原始适配器方法训练LLM时，只有新的适配器层会被更新，而其余Transformer层保持冻结。由于适配器层通常很小——适配器模块中的第一个全连接层将其输入投影到低维表示，而第二个层则将其投影回原始输入维度——因此这种适配器方法通常被认为是参数高效的。

用伪代码表示，原始适配器方法可以写成如下形式：

```
def transformer_block_with_adapter(x):
    residual = x
    x = SelfAttention(x)
    x = FullyConnectedLayers(x)  # 适配器
    x = LayerNorm(x + residual)
    residual = x
    x = FullyConnectedLayers(x)
    x = FullyConnectedLayers(x)  # 适配器
    x = LayerNorm(x + residual)
    return x
```

**低秩适配**

低秩适配（LoRA）是另一种值得考虑的流行参数高效微调方法，它指的是使用低秩变换对预训练LLM的权重进行重新参数化。LoRA与低秩变换的概念相关，这是一种使用低维表示来近似高维矩阵或数据集的技术。低维表示（或低秩近似）通过找到能够有效捕捉原始数据中大部分信息的较少维度组合来实现。常见的低秩变换技术包括主成分分析和奇异值分解。

例如，假设 *ΔW* 表示LLM权重矩阵的参数更新，其维度为 *ℝA×B*。我们可以将权重更新矩阵分解为两个较小的矩阵：*ΔW=WAWB*，其中 *WA ∈ ℝA×h* 且 *WB ∈ ℝh×B*。在此过程中，我们保持原始权重冻结，仅训练新的矩阵 WA 和 WB。

引入新的权重矩阵后，这种方法如何实现参数高效？这些新矩阵可以非常小。例如，如果 A=25 且 B=50，那么 *ΔW* 的大小为 *25×50=1,250*。如果 *h=5*，则 *WA* 有125个参数，WB 有250个参数，两个矩阵合计仅有 *125+250=375* 个参数。

在学习权重更新矩阵后，我们可以像以下伪代码所示，编写全连接层的矩阵乘法：

```
def lora_forward_matmul(x):
    h = x . W  # 常规矩阵乘法
    h += x . (W_A . W_B) * scalar
    return h
```

*列表2：使用LoRA的矩阵乘法。你可以在[此处](https://github.com/rasbt/MachineLearning-QandAI-book/tree/main/supplementary/q18-using-llms/05_lora)找到说明适配器层的代码示例。*

在列表2中，scalar 是一个缩放因子，用于调整组合结果（原始模型输出加上低秩适配）的幅度。这平衡了预训练模型的知识与新的任务特定适配。根据引入LoRA方法的原始论文，使用LoRA的模型在多个任务特定基准测试中的表现略优于使用适配器方法的模型。通常，LoRA的表现甚至优于使用前面描述的微调II方法进行微调的模型。

上一节主要讨论了如何提高微调效率。换个角度，我们如何通过微调来提升大语言模型的建模性能呢？

将大语言模型适配或微调到新的目标领域或任务的传统方法是使用带标签的目标数据进行监督学习。例如，微调II方法允许我们适配预训练的大语言模型，并在情感分类等目标任务上对其进行微调，使用的数据集包含带有情感标签（如正面、中性、负面）的文本。

监督微调是训练大语言模型的基础步骤。另一个更高级的步骤是基于人类反馈的强化学习（RLHF），它可以进一步改善模型与人类偏好的对齐。例如，ChatGPT及其前身InstructGPT就是两个使用RLHF微调的预训练大语言模型（GPT-3）的典型例子。

在RLHF中，预训练模型通过监督学习和强化学习的结合进行微调。这种方法因最初的ChatGPT模型而普及，而ChatGPT本身又基于InstructGPT。人类反馈通过让人类对不同的模型输出进行排序或评分来收集，从而提供奖励信号。收集到的奖励标签可用于训练一个奖励模型，然后利用该模型引导大语言模型适应人类偏好。奖励模型通过监督学习来训练，通常以预训练的大语言模型为基础模型，然后通过额外的微调来使预训练的大语言模型适应人类偏好。这个额外微调阶段的训练使用了一种称为近端策略优化的强化学习变体。

RLHF使用奖励模型，而不是直接在人类反馈上训练预训练模型，因为让人类参与学习过程会造成瓶颈，因为我们无法实时获取反馈。

虽然微调预训练大语言模型的所有层仍然是适应新目标任务的黄金标准，但存在几种利用预训练Transformer的高效替代方案。例如，我们可以通过使用基于特征的方法、上下文学习或参数高效微调技术，在最小化计算成本和资源的同时，有效地将大语言模型应用于新任务。

三种传统方法——基于特征的方法、微调I和微调II——在计算效率和性能之间提供了不同的权衡。参数高效微调方法，如软提示微调、前缀微调和适配器方法，进一步优化了适配过程，减少了需要更新的参数数量。同时，RLHF提供了一种监督微调的替代方法，有可能提升建模性能。

总之，预训练大语言模型的多功能性和效率正在不断进步，为有效将这些模型适配到广泛的任务和领域提供了新的机遇和策略。随着该领域研究的深入，我们可以期待在使用预训练语言模型方面出现进一步的改进和创新。

1.  介绍GPT-2模型的论文：Alec Radford等人，《语言模型是无监督的多任务学习者》（2019），[https://www.semanticscholar.org/paper/Language-Models-are-Unsupervised-Multitask-Learners-Radford-Wu/9405cc0d6169988371b2755e573cc28650d14dfe](https://www.semanticscholar.org/paper/Language-Models-are-Unsupervised-Multitask-Learners-Radford-Wu/9405cc0d6169988371b2755e573cc28650d14dfe)。

2.  介绍GPT-3模型的论文：Tom B. Brown等人，《语言模型是少样本学习者》（2020），[https://arxiv.org/abs/2005.14165](https://arxiv.org/abs/2005.14165)。

3.  自动提示工程方法，该方法提出使用另一个大语言模型进行自动提示生成与评估：Yongchao Zhou 等人，《大语言模型是人类级别的提示工程师》（2023），[https://arxiv.org/abs/2211.01910](https://arxiv.org/abs/2211.01910)。

4.  LlamaIndex 是一种利用上下文学习的索引方法示例：[https://github.com/jerryjliu/llama\_index](https://github.com/jerryjliu/llama_index)。

5.  DSPy 是另一个用于大语言模型应用（如检索增强和索引）的热门开源库：[https://github.com/stanfordnlp/dspy](https://github.com/stanfordnlp/dspy)。

6.  软提示的首次实例：Brian Lester、Rami Al-Rfou 和 Noah Constant，《规模的力量：参数高效提示调优》（2021），[https://arxiv.org/abs/2104.08691](https://arxiv.org/abs/2104.08691)。

7.  首次描述前缀调优的论文：Xiang Lisa Li 和 Percy Liang，《前缀调优：优化连续提示用于生成》（2021），[https://arxiv.org/abs/2101.00190](https://arxiv.org/abs/2101.00190)。

8.  介绍原始适配器方法的论文：Neil Houlsby 等人，《NLP 的参数高效迁移学习》（2019），[https://arxiv.org/abs/1902.00751](https://arxiv.org/abs/1902.00751)。

9.  介绍 LoRA 方法的论文：Edward J. Hu 等人，《LoRA：大语言模型的低秩适配》（2021），[https://arxiv.org/abs/2106.09685](https://arxiv.org/abs/2106.09685)。

10.  涵盖参数高效微调方法的 40 多篇研究论文综述：Vladislav Lialin、Vijeta Deshpande 和 Anna Rumshisky，《缩小以扩大：参数高效微调指南》（2023），[https://arxiv.org/abs/2303.15647](https://arxiv.org/abs/2303.15647)。

11.  InstructGPT 论文：Long Ouyang 等人，《通过人类反馈训练语言模型遵循指令》（2022），[https://arxiv.org/abs/2203.02155](https://arxiv.org/abs/2203.02155)。

12.  近端策略优化，用于基于人类反馈的强化学习：John Schulman 等人，《近端策略优化算法》（2017），[https://arxiv.org/abs/1707.06347](https://arxiv.org/abs/1707.06347)。

13.  作者撰写的关于基于人类反馈的强化学习（RLHF）及其替代方案的文章：[https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives](https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives)

-   [特征提取器 vs. 微调不同输出层 vs. 微调所有层](https://github.com/rasbt/MachineLearning-QandAI-book/tree/main/supplementary/q18-using-llms/01_classifier-finetuning)

-   [上下文学习与提示调优](https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q18-using-llms/02_prompting)

-   [索引与检索增强生成（RAG）](https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q18-using-llms/03_retrieval-augmented-generation)

-   [适配器微调](https://github.com/rasbt/MachineLearning-QandAI-book/blob/main/supplementary/q18-using-llms/04_adapter)

-   [低秩适配（LoRA）微调](https://github.com/rasbt/MachineLearning-QandAI-book/tree/main/supplementary/q18-using-llms/05_lora)

1.  在什么情况下，使用上下文学习比微调更合理，反之亦然？

2.  在前缀调优、适配器和 LoRA 中，我们如何确保模型保留（且不遗忘）原始知识？

希望你喜欢这段摘录！如果你对机器学习与人工智能相关的其他 29 个主题感兴趣，可以在[出版社网站](https://nostarch.com/machine-learning-and-ai-beyond-basics)、[亚马逊](https://www.amazon.com/Machine-Learning-AI-Beyond-Basics/dp/1718503768)以及许多其他书店找到这本书。

《Ahead of AI》是一个个人热情项目，不提供直接报酬。如果你能考虑购买一本我的书来支持这些努力，我将不胜感激。

如果你已经购买了这本书，在亚马逊上写一篇评论也会非常有帮助！

#### 关于此帖的讨论

### 想要更多内容？
