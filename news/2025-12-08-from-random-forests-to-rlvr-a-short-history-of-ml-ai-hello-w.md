---
title: 'From Random Forests to RLVR: A Short History of ML/AI Hello Worlds'
url: 'https://sebastianraschka.com/blog/2025/hello-world-ai.html'
url_hash: 2d93d46358590aa4bf908610e443acbe9f073aa8
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-12-08T00:20:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
两年前，我在社交媒体上[发布了一份](https://x.com/rasbt/status/1740006870096433509?s=20)机器学习和人工智能的“Hello World”示例列表。这里的“Hello World”指的是适合初学者的示例，用于展示某种方法。

我设置了一个两年一次的日历提醒，以便重新审视并补充这份列表。我一直在认真思考2025年的示例会是什么样子。所以，这里有一篇短文，包含了更新后的列表以及一些更详细的解释。

-   2013年：鸢尾花数据集上的随机森林分类器
-   2015年：泰坦尼克号数据集上的XGBoost
-   2017年：MNIST数据集上的多层感知机
-   2019年：CIFAR-10数据集上的AlexNet
-   2021年：IMDb电影评论数据集上的DistilBERT
-   2023年：在Alpaca 50k数据集上使用[LoRA](https://sebastianraschka.com/glossary/#lora "LoRA（低秩适配）")的Llama 2
-   2025年：在MATH-500数据集上使用[RLVR](https://sebastianraschka.com/glossary/#rlvr "RLVR（基于可验证奖励的强化学习）")的Qwen3

让我们逐一回顾。

**2013年：鸢尾花数据集上的随机森林分类器**

请注意，列表中的方法在时间上会滞后几年。例如，[随机森林](https://link.springer.com/article/10.1023/A:1010933404324)是在2001年提出的。但根据我当时的记忆，直到2012年它被添加到[scikit-learn](https://scikit-learn.org/stable/)（当时主要的机器学习库）后，大约在2013年左右才变得非常流行和主流。

-   《Python机器学习》中的[代码示例](https://github.com/rasbt/python-machine-learning-book/blob/master/code/ch03/ch03.ipynb)

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/hello-world-ai/1.webp" alt="随机森林决策区域" width="1582" height="1232" fetchpriority="high" decoding="async"></p><figcaption>来自我2015年出版的《Python机器学习》一书的图表</figcaption></figure>

**2015年：泰坦尼克号数据集上的XGBoost**

[XGBoost](https://github.com/dmlc/xgboost)于2014年首次发布，我记得它在2015年因Kaggle竞赛而变得非常流行（当时大家入门都是从热门的[泰坦尼克号数据集竞赛](https://www.kaggle.com/competitions/titanic)开始的）。

-   Kaggle上的[代码示例](https://www.kaggle.com/code/wissams/titanic-competition-step-by-step-using-xgboost/)

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/hello-world-ai/2.webp" alt="泰坦尼克号Kaggle截图" width="1916" height="1046" loading="lazy" decoding="async"></p><figcaption>热门的<a href="https://www.kaggle.com/competitions/titanic">泰坦尼克号Kaggle竞赛</a></figcaption></figure>

**2017年：MNIST数据集上的多层感知机**

多层感知机（MLP）已经存在了很长时间。在1986年[反向传播论文](https://www.nature.com/articles/323533a0)发表后，它们在20世纪80年代和90年代变得有些实用，但并未非常流行。我记得21世纪初，随机森林、支持向量机和梯度提升（特别是XGBoost）仍然占据主导地位。与此同时，非神经网络方法在计算机视觉领域仍然很受欢迎。然而，随着2015年[TensorFlow](https://www.tensorflow.org/)的初始发布以及2017年TensorFlow 1.0的推出，MLP和神经网络在那个时候真正开始蓬勃发展。

-   来自我深度学习笔记本集合的[代码示例](https://github.com/rasbt/deeplearning-models/blob/master/tensorflow1_ipynb/mlp/mlp-basic.ipynb)

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/hello-world-ai/3.webp" alt="反向传播和MNIST" width="1218" height="1468" loading="lazy" decoding="async"></p><figcaption>来自我2015年出版的《Python机器学习》一书的图表</figcaption></figure>

**2019年：CIFAR-10数据集上的AlexNet**

AlexNet可能应该更早出现在这个列表中，因为它是在2012年通过论文《使用深度卷积神经网络的ImageNet分类》引入的。然而，直到2017年PyTorch和TensorFlow 1.0发布后，它才变得非常流行。当时大多数人仍在使用Caffe，但也开始转向使用TensorFlow进行计算机视觉。

不过，由于使用卷积神经网络进行有意义的计算需要GPU，而CUDA和cuDNN让这一过程更加便捷，我认为将其放在“2017年基于MNIST的多层感知机”示例之后是合理的。（此外，当时ImageNet对大多数人来说规模太大且成本过高，因此[CIFAR-10和CIFAR-100](https://www.cs.toronto.edu/~kriz/cifar.html)是流行的入门数据集。）

-   [代码示例](https://github.com/rasbt/deeplearning-models/blob/master/pytorch_ipynb/cnn/cnn-alexnet-cifar10.ipynb)来自我的深度学习笔记本合集

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/hello-world-ai/4.webp" alt="AlexNet架构" width="1650" height="578" loading="lazy" decoding="async"></p><figcaption>来自<a href="https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html">AlexNet论文</a>的AlexNet架构</figcaption></figure>

**2021年：基于IMDb电影评论的DistilBERT**

在[IMDb电影评论情感分类数据集](https://ai.stanford.edu/~amaas/data/sentiment/)上使用[DistilBERT](https://arxiv.org/abs/1910.01108)，我们进入了语言模型开始加速发展的时代。当然，Transformer架构于2017年提出，BERT于2018年提出，DistilBERT于2019年提出，但普及仍需数年时间。

-   [代码示例](https://github.com/rasbt/deeplearning-models/blob/master/pytorch_ipynb/transformer/distilbert-hf-finetuning.ipynb)来自我的深度学习笔记本合集

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/hello-world-ai/5.webp" alt="预训练LLM分类器的方法" width="2394" height="834" loading="lazy" decoding="async"></p><figcaption>将预训练Transformer（如DistilBERT）微调为分类器的方法（来自我的<a href="https://magazine.sebastianraschka.com/p/finetuning-large-language-models">《微调大型语言模型》</a>文章）</figcaption></figure>

**2023年：基于Alpaca 50k数据集的Llama 2与LoRA**

2023年是ChatGPT发布后的第二年，LLM迅速加速发展。由于训练或微调LLM的成本，仍存在较大障碍，但[LoRA](https://arxiv.org/abs/2106.09685)、[Llama 1和2](https://arxiv.org/abs/2307.09288)以及[Alpaca数据集](https://crfm.stanford.edu/2023/03/13/alpaca.html)的结合，突然让LLM变得更容易获取，指令微调也迎来了巨大热潮。

-   [代码示例](https://gist.github.com/radekosmulski/c3cce1a52b52b9b2037e1941de5afa32)由Radek Osmulski在GitHub上提供

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/hello-world-ai/6.webp" alt="Llama 2与GPT架构对比" width="1952" height="1166" loading="lazy" decoding="async"></p><figcaption>来自我的<a href="https://github.com/rasbt/LLMs-from-scratch/blob/main/ch05/07_gpt_to_llama">GPT到Llama转换指南</a>的Llama 2架构</figcaption></figure>

**2025年：基于MATH-500数据集的Qwen3与RLVR**

今年是推理模型和[基于可验证奖励的强化学习](https://magazine.sebastianraschka.com/p/understanding-reasoning-llms)（RLVR）的一年，这一趋势始于2024年[OpenAI o1首次发布](https://openai.com/index/learning-to-reason-with-llms/)带来的热潮，但在2025年1月[DeepSeek R1](https://arxiv.org/abs/2501.12948)发布后真正加速发展。

今年，[Qwen3模型](https://huggingface.co/collections/Qwen/qwen3)也变得非常流行，它们有从0.6B到235B的多种规模。然而，即使是在[MATH-500](https://huggingface.co/datasets/HuggingFaceH4/MATH-500)数据集的训练部分上使用最小模型，用RLVR训练[推理模型](https://sebastianraschka.com/glossary/#reasoning-model "推理模型")也并非易事（这实际上是我[新书](https://mng.bz/Nwr7)的主题）。

不过，存在专有的API服务可以向初学者展示RLVR是什么，因此这可能是一个很好的“Hello World”示例和AI入门介绍（在初学者想要深入了解细节之前）。

-   [代码示例](https://github.com/thinking-machines-lab/tinker-cookbook/tree/main/tinker_cookbook/recipes/math_rl)来自Tinker API Cookbook（我与该公司无关联，但认为这是一个很好的快速入门示例）；从头实现的代码将很快添加到我正在编写的[推理从零开始书籍](https://github.com/rasbt/reasoning-from-scratch)中。

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/hello-world-ai/7.webp" alt="推理模型训练" width="1600" height="1116" loading="lazy" decoding="async"></p><figcaption>来自我的<a href="https://magazine.sebastianraschka.com/p/the-state-of-llm-reasoning-model-training">《LLM推理的强化学习现状》</a>文章的图表。</figcaption></figure>
