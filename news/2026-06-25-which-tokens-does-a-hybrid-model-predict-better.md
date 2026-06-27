---
title: Which tokens does a hybrid model predict better?
url: 'https://huggingface.co/blog/allenai/hybrid-token-prediction'
url_hash: 04bd48744b58f91b4b4c38e365eef5ffe03e9092
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-25T16:11:42.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

[![Kyle Wiggers的头像](https://huggingface.co/avatars/fee5cceec7536851d7c6712760716a71.svg)](https://huggingface.co/Ai2Comms)

📄 **技术报告：** [https://arxiv.org/abs/2606.20936](https://arxiv.org/abs/2606.20936)

[![混合令牌预测博客草稿也将发布到Hugging Face - Goog-image-1](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/5-hA9oXDAmu9e__tV-FYM.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/5-hA9oXDAmu9e__tV-FYM.png)

模型对哪些类型的令牌预测得好，哪些又预测得不好？这个问题对于混合模型来说尤其引人入胜——这是一种开始挑战标准Transformer的语言模型架构，我们一直在通过[Olmo Hybrid](https://allenai.org/blog/olmohybrid)进行研究。

混合模型在标准基准测试中可以与Transformer匹敌甚至超越，但这些总体数字并未揭示混合模型相比Transformer具体有哪些优势。

为了揭示这些令牌级别的行为，我们最近进行了实验，将我们最强的7B Transformer模型[Olmo 3](https://allenai.org/blog/olmo3)与混合模型Olmo Hybrid进行直接对比。具体来说，我们以细粒度方式比较了模型在不同类型令牌（即作为LLM输入的信息单元）上的预测差异。

由于Olmo 3和Olmo Hybrid在架构之外尽可能保持一致——在数据、分词器和训练方案上高度匹配——它们预测中的任何差异主要反映了架构本身。从令牌级别审视这些差异，使我们能够深入了解混合模型相对于Transformer的具体优势。

[我们的结果](https://arxiv.org/abs/2606.20936)表明，混合模型在众多令牌上的优势是真实存在的，但并非对所有令牌都成立。Olmo Hybrid在承载意义的令牌（如名词、动词和形容词）以及只能通过跟踪上下文才能预测的令牌（如代词所指代的人物）上表现最强。然而，对于仅仅重复输入中已有内容的令牌——即从前面逐字复制的单词或短语——混合模型的优势几乎消失，因为答案就在那里，可以直接查找。而这正是Transformer的强项。

## [](#attention-versus-recurrence-and-measuring-the-difference)注意力机制与循环机制，以及衡量差异

语言模型由一系列重复层堆叠而成，每一层都利用周围令牌来优化每个令牌的表示。

Transformer在每一层都使用注意力机制。模型可以直接同时利用所有先前令牌，权衡每个令牌对当前预测的相关性。这使得注意力机制擅长精确回忆特定的先前令牌，即使该令牌出现在输入中较远的位置。但代价是每个令牌都要与所有先前令牌进行比较，因此注意力机制的计算成本随着输入增长而急剧上升。此外，虽然注意力机制擅长回忆和聚合信息，但在表示随时间顺序演变的信息方面也存在困难。

混合模型保留了少量注意力层，其余则替换为循环层。与注意力层不同，循环层从左到右读取词元，并携带固定大小的记忆，每读取一个新词元就将其融入记忆，因此无论输入多长，处理每个词元的成本都保持恒定。这种记忆是压缩且有损的，因此循环层无法像注意力层那样回溯到精确的早期词元。但它非常适合在模型读取词元时持续记录任何变化的信息，从而为注意力层提供互补优势。

为了明确注意力层和循环层的优势与劣势领域，我们向Olmo 3和Olmo Hybrid输入了多种文本段落：文章、维基百科条目、书籍、科学论文，以及Python、HTML和LaTeX等结构化文本。我们根据每个模型在给定样本中根据前文词元预测每个词元的效果进行评分。

两个模型都看到了相同的前文词元，并为每个可能的后续词元分配了概率。我们记录了它们各自赋予实际后续词元的概率。然后，通过计算损失差距（即两个模型之间的损失差异），逐词元总结两个模型的差异。正差距表示混合模型对真实后续词元的预测更好，负差距则表示Transformer模型表现更优。

为了找出损失差距可能集中的位置，我们进行了多项分析。首先，我们将每个词元分类，并计算各类别内的平均损失差距。由于原始平均值可能受其他因素影响（例如类别的稀有性或词元在文本样本中的重复频率），我们通过回归分析重新验证了每个模式，该回归在控制其他因素不变的情况下估计类别本身的效应。

## [](#what-real-text-shows)真实文本的发现

[![Hybrid token prediction social copy - Google Docs-image-2](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/jhU9qFfYhuKlt4BqOGyIh.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/jhU9qFfYhuKlt4BqOGyIh.png)

我们发现，Olmo Hybrid在大多数词元类型上的损失低于Olmo 3，尽管不同词元类型的差距并不相同。

在散文中，最明显的分界线在于实义词（承载意义的名词、动词和形容词）与功能词（如“the”、“of”、“is”）。混合模型对实义词的预测优于Transformer模型，损失差距约为0.04，而功能词的损失差距则接近0.02。

具体而言，在副词和形容词等实义词类别中，混合模型的优势尤为显著，尽管某些功能词类别（如存在词“there”）也显示出混合模型的较大优势。简而言之，混合模型的最大优势体现在表达句子核心内容的词汇上，而在任何模型几乎都能根据语法推测出的语法词上优势最小。

相比之下，我们发现混合模型在某些特定场景下相比Transformer的优势会消失。第一个场景是闭合括号（而非开放括号）的预测——这一模式在语言、代码和标记语言中的各类括号场景中均表现稳健。原因何在？已知注意力机制足以实现括号匹配，这意味着仅凭注意力就能完成闭合括号的预测。

[![混合模型词元预测社交分享 - Google文档-图3](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/O_9IONHpoc8kd31TP1MnR.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/O_9IONHpoc8kd31TP1MnR.png)

第二个混合模型优势几乎消失的场景是下一个词元仅是重复前文已有内容。我们通过查找重复n-gram来识别这类情况：即文本序列中完成某个片段的词元此前已在同一段落中逐字出现过。重复片段越长，混合模型的领先优势就越小，直至趋近于零。

最后，受这些发现启发，我们探索将特定类型词元的过滤损失作为评估指标，以便在预训练实验中更好比较不同架构。我们使用了此前[Olmo混合模型研究](https://example.com/)中的三个10亿参数模型：一个Transformer、一个混合模型，以及一个完全不使用注意力机制的纯循环模型。

在非重复的有意义词元上，混合模型和纯循环模型均超越Transformer，其中混合模型表现最佳。而在重复词元上，纯循环模型——由于缺乏注意力机制无法回溯复制——落后于混合模型和Transformer。

因此，这些过滤后的词元损失揭示了架构间更细微的差异，包括复制能力差异以及内容词上的表现差异，这些差异在训练初期通过常规方式是无法观测到的。

## [](#研究启示)研究启示

[![混合模型词元预测社交分享 - Google文档-图4](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/6i5GcnfYp7U6KfYpsN3e2.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/6i5GcnfYp7U6KfYpsN3e2.png)

*过滤后的词元损失揭示了10亿参数预训练过程中的架构差异。图中展示了Transformer、混合模型和纯循环神经网络（RNN）在WSD退火检查点处的词元损失曲线。*

本研究得出两点启示。

首先，单一的整体损失——模型在所有词元上的平均误差——过于粗糙，不足以比较Transformer与混合架构。仅针对测试特定模型能力的词元计算损失，才能凸显关键差异。

其次，针对混合模型，我们发现了其在开放类词元上的特定优势，这可能与RNN层的状态追踪能力有关。

作为下一步，我们将把这些发现应用到正在进行的混合模型研究中。我们相信，最佳的混合架构将源于对模型各组件在每个词元上表现优势的深入理解。希望此类研究能推动整个AI社区共同增进这种理解。

我们诚邀您阅读[完整报告](https://arxiv.org/abs/2606.20936)，探索[Olmo 3](https://allenai.org/blog/olmo3)，尝试[Olmo混合模型](https://allenai.org/blog/olmohybrid)，并深入研究其相关的开放成果。
