---
title: DGX Spark and Mac Mini for Local PyTorch Development
url: 'https://sebastianraschka.com/blog/2025/dgx-impressions.html'
url_hash: 4798db2ea0320f7cd6daebe89a59eb37fbe60881
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-10-29T00:06:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
DGX Spark 用于本地 LLM 推理和微调，最近成了一个相当热门的话题。我有机会亲自体验了一下，主要是在 PyTorch 中处理和使用 LLM，并收集了一些基准测试结果和心得。

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/dgx-impressions/01.webp" alt="图 1：DGX 放在我的 Mac Mini 旁边，旁边还有一个茶壶（以及一台 13 英寸 MacBook Air）作为参照。两者大小大致相同，而且都非常安静（非常适合办公室或桌面使用）。" width="784" height="601" fetchpriority="high" decoding="async"></p><figcaption>图 1：DGX 放在我的 Mac Mini 旁边，旁边还有一个茶壶（以及一台 13 英寸 MacBook Air）作为参照。两者大小大致相同，而且都非常安静（非常适合办公室或桌面使用）。</figcaption></figure>

### 常见用例：本地推理[](#the-usual-use-case-local-inference)

大多数人使用 DGX Spark 搭配 [Ollama](https://ollama.com/) 等工具进行本地推理。我之前在 Mac Mini 上也是这么做的。

DGX 的体验与此类似，但有一个主要区别：它拥有 128 GB 的显存，这使得运行比我通常使用的 `gpt-oss-20B` 模型更大的模型成为可能。

不过，为了进行公平比较，在 Ollama 中使用优化的 `mxfp4` 精度（针对 [MoE](https://sebastianraschka.com/glossary/#moe "Mixture of Experts (MoE)") 模型）时，DGX Spark 和 Mac Mini M4 Pro 在运行 `gpt-oss-20B` 时都能达到大约 45 tok/sec 的速度。

我下面的基准测试更侧重于 PyTorch，但如果你对 Ollama 的用例感兴趣，LMSYS 的[这篇博文](https://lmsys.org/blog/2025-10-13-nvidia-dgx-spark/)有更详细的介绍。

话虽如此，对我来说更有趣的是将它用作我纯 PyTorch 项目的原型设计和开发机器。

下面是与我的 Mac Mini，以及我通常通过云提供商使用的 H100 和 A100 显卡的几项[基准测试](https://sebastianraschka.com/glossary/#benchmark "Benchmark")对比。

### 1\. 使用从头实现的 0.6B 模型进行推理[](#1-inference-with-a-06b-model-implemented-from-scratch)

在本节中，我将比较不同机器上运行一个我用纯 PyTorch 从头实现的 0.6B 小 LLM 模型。这是我目前在我写的《构建[推理模型](https://sebastianraschka.com/glossary/#reasoning-model "Reasoning Model")（从零开始）》一书中使用的模型。

具体来说，我让这个 0.6B 参数的模型在有无 KV-cache 的情况下，为简单提示生成答案，结果如下所示。

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/dgx-impressions/02.webp" alt="图 2：一个简单的推理任务，模型被提示生成一个简短的 30 token 响应。" width="1276" height="768" loading="lazy" decoding="async"></p><figcaption>图 2：一个简单的推理任务，模型被提示生成一个简短的 30 token 响应。</figcaption></figure>

**注意：所有实验均在 PyTorch 2.9 中运行。之前在 Mac GPU（PyTorch 中的“mps”后端）上运行编译模型时遇到的 `InductorError` 已在 2.9 版本中解决。**

DGX Spark 的性能远超 Mac Mini M4 Pro，并且与价格贵 6 倍的 H100 数据中心 GPU 大致相当，这令人印象深刻。

不幸的是，由于 PyTorch MPS 的限制，我无法在 Mac 上运行编译版本。MPS 正在改进，但仍无法与 CUDA 相提并论。

附注：顺便提一下，这是一个相对较小的模型，其[KV缓存](https://sebastianraschka.com/glossary/#kv-cache "KV缓存")是动态的，并在运行时分配以进一步减少内存。这意味着KV缓存会随响应长度增长，而不是使用预分配的数组，这对GPU和编译来说更为优化。我特意以这种动态方式实现它，以降低内存需求——这通常是大多数读者面临的主要瓶颈。因此，你可能会在图中看到一些异常现象，比如带KV缓存的版本在GPU上反而比不带KV缓存的版本稍慢。这是因为这里的提示足够短，在GPU上直接暴力计算并不费力（但你可以看到Mac Mini的CPU从KV缓存中获益良多）。

对于较长的提示，KV缓存版本在所有情况下都是明显的赢家。

你可以在此处找到复现这些结果的代码：[https://github.com/rasbt/reasoning-from-scratch/tree/main/ch02/01\_main-chapter-code](https://github.com/rasbt/reasoning-from-scratch/tree/main/ch02/01_main-chapter-code)

### 2\. 在MATH-500上评估0.6B基础模型与推理模型[](#2-evaluating-a-06b-base-vs-reasoning-model-on-math-500)

该基准测试扩展了之前的测试，比较了一个[基础模型](https://sebastianraschka.com/glossary/#base-model "Base Model")和一个推理模型在500个MATH-500提示上的表现，这些提示产生的答案长度差异巨大。（我在这里使用的是未编译的KV缓存版本。）

下图展示了顺序运行（一次一个提示）或批量运行（一次128个提示）的评估结果。

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/dgx-impressions/03.webp" alt="图3：基础模型与推理模型在MATH-500上的对比。y轴表示总运行时间，因此数值越低越好。" width="1404" height="1564" loading="lazy" decoding="async"></p><figcaption>图3：基础模型与推理模型在MATH-500上的对比。y轴表示总运行时间，因此数值越低越好。</figcaption></figure>

总体而言，推理模型比基础模型慢得多，因为它生成了更长的响应。基础模型的平均响应长度为96.74个token，而推理模型的平均响应长度为1361.21个token。

如图3所示，在顺序运行（2a）中，DGX Spark甚至超越了价格贵6倍的H100，这再次令人印象深刻。然而，在批量运行时，H100是明显的赢家。这大概是因为其更好的内存带宽。

请注意，我没有在Mac Mini上运行推理模型，因为它会变得非常热（根据我使用的[stats](https://github.com/exelban/stats)工具显示，温度超过100°C，这是水的沸点）。我不想让它连续运行超过3小时如此高温，担心会损坏它，因为这是我的主要工作机器。

DGX Spark（由NVIDIA借出）也运行得相对较热，但我认为它是为这类工作负载设计的。（另外，我也没有在上面存储任何重要数据。）

你可以在此处找到复现这些实验的代码：[https://github.com/rasbt/reasoning-from-scratch/tree/main/ch03/02\_math500-verifier-scripts](https://github.com/rasbt/reasoning-from-scratch/tree/main/ch03/02_math500-verifier-scripts)

### 3\. 训练/微调一个355M模型[](#3-training--fine-tuning-a-355m-model)

此前我们看到，DGX Spark 在单序列生成方面表现出色，但在大批量推理方面不如 H100。那么，在小型训练和后训练任务中表现如何呢？

我进行了短期的预训练（3a）、[监督微调](https://sebastianraschka.com/glossary/#instruction-finetuning "指令微调（SFT）")（3b）和 DPO 偏好调优实验，以比较不同系统，如下图所示。

<figure><p><img src="https://sebastianraschka.com/images/blog/2025/dgx-impressions/04.webp" alt="图4：预训练、监督微调和 DPO 偏好调优的对比。" width="1830" height="1640" loading="lazy" decoding="async"></p><figcaption>图4：预训练、监督微调和 DPO <a href="https://sebastianraschka.com/glossary/#dpo" title="DPO（直接偏好优化）">偏好调优</a>的对比。</figcaption></figure>

请注意，这些实验是在 A100 上运行的，而非 H100，因为当时我手头没有 H100。

在所有三类任务中，DGX Spark 和 A100 都明显快于 Mac Mini。

这些只是非常短期的运行，但它们表明 DGX 能够高效处理小规模的训练和微调任务。

以下是复现这些运行的代码链接：

-   预训练（3a）：[https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/01\_main-chapter-code](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05/01_main-chapter-code)（但将模型从 127M 改为 355M）
-   SFT 微调（3b）：[https://github.com/rasbt/LLMs-from-scratch/tree/main/ch07/01\_main-chapter-code](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch07/01_main-chapter-code)
-   DPO 微调（3c）：[https://github.com/rasbt/LLMs-from-scratch/tree/main/ch07/04\_preference-tuning-with-dpo](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch07/04_preference-tuning-with-dpo)

### 结论[](#conclusion)

总体而言，DGX Spark 似乎是一款精巧的小型工作站，可以安静地放在 Mac Mini 旁边。它拥有同样小巧的外形，但配备了更大的 GPU 内存，当然（而且重要的是！）支持 CUDA。

2018 年，我曾拥有一台配备 4 块 GTX 1080Ti GPU 的 Lambda 工作站。我需要这台机器进行研究，但办公室里的噪音和热量令人难以忍受，最终我不得不将机器搬到威斯康星大学麦迪逊分校的专用服务器机房。此后，我不再考虑购买另一台 GPU 工作站，而是完全依赖云 GPU。（或许只有当我搬进带有大地下室和独立隔间的房子时，我才会重新考虑。）相比之下，DGX Spark 绝对足够安静，适合办公室使用。即使在满负荷运行下，也几乎听不到声音。

它还预装了软件，使远程使用变得无缝衔接，你可以直接从 Mac 连接，无需额外外设或 SSH 隧道。这对于日常快速实验来说是一个巨大的优势。

但是，在大规模训练方面，它**当然无法替代 A100 或 H100 GPU**。
我更倾向于将其视为一个开发和原型设计系统，它让我能够在不使 Mac 过热的情况下卸载实验。我认为它是一台介于两者之间的机器，可用于小型运行和在 CUDA 中测试模型，然后再在云 GPU 上运行。

**简而言之：** 如果你不指望奇迹或完整的 A100/H100 级别性能，那么 DGX Spark 是一台适合本地推理和家庭小型微调的不错机器。
