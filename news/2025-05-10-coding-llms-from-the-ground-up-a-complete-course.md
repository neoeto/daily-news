---
title: 'Coding LLMs from the Ground Up: A Complete Course'
url: 'https://magazine.sebastianraschka.com/p/coding-llms-from-the-ground-up'
url_hash: 4b3449d49d4ba585143a0aea80c516a4ae238762
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-05-10T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
近几个月我写了不少关于推理模型的内容（连续四篇！）。在"智能体"相关话题之外，推理是2025年LLM领域最热门的主题之一。

不过这个月，我想和大家分享一些更基础或"奠基性"的内容——如何编写LLM代码，这是理解LLM工作原理的最佳途径之一。

为什么？因为去年我分享的LLM精简版工作坊让很多人受益匪浅：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!ye37!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F367b547c-9d22-4a3d-b466-1d56ccc6b055_1844x1224.png">![从零构建LLM：3小时编码工作坊](https://substackcdn.com/image/fetch/$s_!ye37!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F367b547c-9d22-4a3d-b466-1d56ccc6b055_1844x1224.png)

](https://magazine.sebastianraschka.com/p/building-llms-from-the-ground-up)

所以我想，这个时长约5倍、内容更详尽的版本（总计约15小时）应该会更有帮助。

另外，我最近不幸遭遇严重的颈部损伤，过去三周几乎无法在电脑前工作。目前正在尝试保守治疗，之后可能要考虑医生建议的手术方案。这真是最糟糕的时机——生活刚给我来了个急转弯，我正努力重回正轨。

因此在康复期间，我想分享过去几个月录制的这些视频，作为过渡期的内容。

希望这些对你有用，感谢支持！

*附注：这些视频最初是为我的《从零构建大语言模型》一书（[Manning](https://mng.bz/M96o) | [Amazon](https://amzn.to/4fqvn0D)）准备的补充材料。但后来发现它们作为独立内容效果也很好。*

**为什么要从零构建？**

这可能是学习LLM真实工作原理最有效的方式。而且许多读者反馈说这个过程非常有趣。

打个比方：如果你对汽车感兴趣，想了解其工作原理，跟着教程从零开始组装一辆车就是绝佳的学习方式。当然，我们不会一开始就造F1赛车——成本太高、复杂度太大。更合理的是从卡丁车这类简单项目入手。

组装卡丁车同样能让你理解转向系统、发动机原理等知识。你甚至可以开着它上赛道练习（还能享受乐趣），之后再接触专业赛车（或加入专注研发赛车的公司/团队）。毕竟，最优秀的赛车手往往都是从亲手改装卡丁车起步的（想想舒马赫和塞纳）。通过这个过程，他们不仅培养了对赛车的敏锐感知，还能为机械师提供宝贵建议，从而获得超越其他车手的优势。

1. 《从零构建LLM》书籍（[Manning](https://mng.bz/M96o) | [Amazon](https://amzn.to/4fqvn0D)）

2. [从零构建LLM GitHub仓库](https://github.com/rasbt/LLMs-from-scratch)

这是讲解如何使用uv配置Python环境的补充视频。

具体来说，我们使用的是"`uv pip`"命令，相关说明见[此文档](https://github.com/rasbt/LLMs-from-scratch/blob/main/setup/01_optional-python-setup-preferences/README.md)。

另外，本视频中提及但未详细讲解的原生“`uv add”`语法，可参考[此处](https://github.com/rasbt/LLMs-from-scratch/blob/main/setup/01_optional-python-setup-preferences/native-uv.md)的说明。

<iframe src="https://www.youtube-nocookie.com/embed/yAcWnfsZhzo?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

**注意/提示：** 在某些Windows版本上，安装过程可能会出现问题。如果你使用的是Windows系统，并且在安装中遇到困难（很可能是由于视频5中需要加载OpenAI原始GPT-2模型权重，而TensorFlow依赖导致的问题），请不必担心，可以跳过TensorFlow的安装（只需从requirements文件中移除TensorFlow相关行即可）。

作为替代方案，我已将GPT-2模型权重从TensorFlow张量格式转换为PyTorch张量，并上传至Hugging Face模型库，可用于替代视频5中的权重加载部分：[https://huggingface.co/rasbt/gpt2-from-scratch-pytorch](https://huggingface.co/rasbt/gpt2-from-scratch-pytorch)。

无论如何，在视频5结束之前，你无需担心这个权重加载代码。

本视频讲解了LLM训练中的文本数据预处理步骤（分词、字节对编码、数据加载器等）。

<iframe src="https://www.youtube-nocookie.com/embed/341Rb8fJxY0?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

这是一个补充视频，通过从零开始编码的方式，解释注意力机制（自注意力、因果注意力、多头注意力）的工作原理。
你可以将其视为构建汽车的引擎（在添加车身、座椅和车轮之前）。

<iframe src="https://www.youtube-nocookie.com/embed/-Ll8DtpNtvk?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

本视频讲解如何从零开始编码一个LLM架构。

<iframe src="https://www.youtube-nocookie.com/embed/YSAkgEarBGE?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

本视频解释如何从零开始预训练一个LLM。

<iframe src="https://www.youtube-nocookie.com/embed/Zar2TJv-sE0?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

本视频讲解如何将LLM微调为分类器（此处以垃圾邮件分类为例），作为微调的入门介绍，后续视频将进行指令微调。

<iframe src="https://www.youtube-nocookie.com/embed/5PFXJYme4ik?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

最后，本视频解释如何对LLM进行指令微调。

<iframe src="https://www.youtube-nocookie.com/embed/4yNswvhPWCQ?rel=0&amp;autoplay=0&amp;showinfo=0&amp;enablejsapi=0" frameborder="0" loading="lazy" gesture="media" allow="autoplay; fullscreen" allowautoplay="true" allowfullscreen="true" width="728" height="409"></iframe>

**祝观看与动手实践愉快！**

作为对付费订阅者的一份厚礼，我想分享一个我在4月初（大约在Llama 4发布两天后）录制的2.5小时（非编码）奖励视频。在这个讲座中，我讨论了2025年当前的LLM格局，重点介绍了自2018年GPT-2以来发生了什么变化以及如何变化。

感谢你的支持，作为一名独立且自雇的研究者，这对我来说意义重大！

希望未来几周/几个月内情况会有所改善，因为我对即将撰写的文章有很多想法，并且迫不及待地想要开始工作！
