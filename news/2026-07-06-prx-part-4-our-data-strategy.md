---
title: 'PRX Part 4: Our Data Strategy'
url: 'https://huggingface.co/blog/Photoroom/prx-part4-data'
url_hash: 088a18b234ed800d8a355a36f932d5a7b5ce4478
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-06T15:30:55.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

欢迎回来！这是 PRX 系列的第 4 部分。第 1 到第 3 部分涵盖了[模型架构](https://huggingface.co/blog/Photoroom/prx-part1-architectures)、[训练设计](https://huggingface.co/blog/Photoroom/prx-part2)以及一次[24 小时速通](https://huggingface.co/blog/Photoroom/prx-part3)。这次，我们将揭开默默支撑这一切的那个部分的面纱：数据。在塑造 PRX 质量的所有因素中，数据管道是构建起来最不引人注目、但却是必须正确对待的重要环节之一。以下是我们所做的、我们会做出不同选择的地方，以及一些我们花了很长时间才学到的东西。

用一句话概括：我们从公开和内部数据集的混合中组装训练数据，使用 VLM 重新标注图像，并将结果转化为我们训练 PRX 所用的可流式语料库。

从高层次来看，数据管道如下所示：

![数据管道：源数据集、准备图像、使用 VLM 重新标注、写入 Mosaic 数据分片](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/5QIAhbRR2s_0sSyiBniF-.jpeg)

接下来，我们将深入探讨细节。

## [](#1-指导原则)1. 指导原则

### [](#a-用于预训练的多样化数据集)用于预训练的多样化数据集

目标是组装一个大型、多样化的数据集用于预训练。在这个阶段，模型正在学习世界的样子：视觉概念、物体和场景、事物的构成和光照方式，以及图像可能包含的广泛内容。这是一个关于覆盖范围和多样性的问题，而不是追求每张图像的完美。一个广泛、具有代表性的语料库能让模型学到更多关于视觉世界结构的知识，而一个更小、更精美的语料库则做不到这一点，即使许多单独的图像只是普通的快照或略有压缩。在这个阶段过度过滤美学实际上会适得其反，会缩小数据分布，使模型失去以后无法恢复的概念和构图多样性。让生成结果看起来精致是一个单独的、后续的问题，我们将其留给微调和基于小型、精心筛选数据集的偏好对齐。预训练是为了广度；微调是为了品味。

### [](#a-混合数据来源)混合数据来源

我们从公开和内部数据集的混合中组装预训练数据。这个阶段的重点是广度、多样性，以及利用已有的数据整理成果，而不是自己重新做一遍。如果某个数据源已经经过了质量过滤、去重以及 NSFW 内容和个人信息过滤，我们就会在此基础上进行构建，而不是大规模重复这项工作。数据源以不同的形式出现：有些带有图像数据本身，有些则带有元数据和基础标注，我们会将其统一为一种通用格式。我们采取了务实的方法：与其从头开始构建一个完整的语料库，不如利用现有数据集和我们自己的工具来快速组装一个。事后看来，这不一定是最佳的数据集，但它是预训练一个 7B 模型的坚实且轻量级的起点。

### [](#a-我们的标注理念)我们的标注理念

根据我们的经验，预训练最关键的是使用能准确描述图像中所有内容的长描述。我们在[第二部分](https://huggingface.co/blog/Photoroom/prx-part2)中直接看到了这一点：从短描述切换到长描述显著提升了样本质量。如果描述足够忠实，我们就不必担心图像中偶尔出现的截图、广告、标志或文字片段，因为这些内容也会被描述出来，模型会将其视为有条件、可控的属性来学习，而不是无条件地复现它们。准确的描述能将"噪声"转化为你可以提示或规避的内容。这正是我们后续过滤处理刻意保持轻量的原因。我们移除的是真正不可用的内容，而非所有不完美的内容。

### [](#data-formats)数据格式

我们使用 [Mosaic Streaming](https://github.com/mosaicml/streaming) 和 Mosaic Data Shards (MDS) 作为分布式训练的数据集格式已有一段时间。结合 [Mosaic Composer](https://docs.mosaicml.com/projects/composer/en/latest/index.html)，我们发现这是一个维护成本低、灵活且性能出色的分布式训练框架。此外，MDS 数据集可以轻松有效地混合和打乱，还支持直接从对象存储（如 S3 或 GCS）进行分布式训练。

然而，MDS 数据集非常僵化。添加一列或为特定过滤器创建子集基本上意味着需要扫描并重写整个数据集。因此，我们使用 [Lance](https://lance.org/) 进行此类特征工程和数据集整理。Lance 是一种列式数据格式，具有廉价的谓词下推、标量索引和向量搜索功能，是构建和探索数十亿行数据集的正确工具。

![Lance 用于构建和探索，MDS 用于流式传输到训练](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/hM9_KCDbZhuGuDtvAc0bF.jpeg)

这两种格式在本文和 PRX 数据管道中相互配合：Lance 用于构建，MDS 用于流式传输。

### [](#on-text-latents)关于文本潜在表示

在之前的训练中，我们使用 [T5Gemma](https://deepmind.google/models/gemma/t5gemma/) 作为文本编码器，并预先计算文本潜在表示，将其以字节形式存储在 MDS 中。这次，在将文本编码器切换为 [Qwen3-VL](https://huggingface.co/collections/Qwen/qwen3-vl) 后，我们决定在训练过程中动态计算文本潜在表示。在训练循环中运行文本编码器会消耗吞吐量，但具体消耗取决于模型：对于小型去噪器来说可能影响显著，而在 PRX 的 7B 规模下，文本编码器的计算量与去噪器相比微不足道，我们测量到吞吐量仅下降约 3-4%（在 30 天的训练中大约多花 1 天）。作为回报，我们获得了两点好处。跳过预计算使我们的 MDS 分片小得多，足以将完整的预训练数据集存储在 SLURM 集群的 SSD 共享文件系统上，而无需通过网络从对象存储流式传输。同时，我们可以在未来自由更换文本编码器，而无需重写数 TB 的已存储潜在表示——这正是我们转向 Qwen3-VL 时所做的那种切换。

### [](#on-image-encoding)关于图像编码

我们将所有图像以JPEG格式、质量参数92进行编码，而非采用PNG等无损格式。我们并非仅凭直觉认为质量92是安全的，而是通过实际测量验证。现实中的图像通常已经过多次JPEG压缩，因此真正的问题在于：额外一次重新编码是否会造成损害。在针对高分辨率（1–2 MP）和低分辨率（0.25–0.5 MP）真实图像进行反复解码/编码循环测试后，首次以质量92重新编码的图像几乎无法察觉差异。后续每次循环几乎不会增加损失，因为JPEG会迅速收敛至稳定状态。即使经过10次循环，图像仍保持在不可感知范围内，而PNG文件体积将增大3–10倍，且无任何感知增益。以下数据基于100张图像在质量92下的测试结果，以原始图像为基准（PSNR越高越好，LPIPS越低越好）：

| 图像分辨率 | 1次循环后PSNR (dB) ↑ | 1次循环后LPIPS ↓ | 10次循环后PSNR (dB) ↑ | 10次循环后LPIPS ↓ |
| --- | --- | --- | --- | --- |
| 1–2 MP | 48.7 | 0.004 | 45.4 | 0.008 |
| 0.25–0.5 MP | 45.1 | 0.005 | 42.2 | 0.010 |

由于多数源图像本身已是JPEG压缩格式，将其无损存储为PNG意义不大，因此我们将所有图像统一转换为高质量JPEG（质量参数92）。

我们还验证了最关键的问题：使用JPEG训练是否会影响模型输出。我们的语料库本身以JPEG为主，PNG的唯一优势在于不会引入新伪影。我们特意从高分辨率源图像进行对比，预期原始JPEG图像在高分辨率下携带的伪影极少。我们训练了两个完全相同的PRX模型（1024px分辨率），使用相同图像，分别存储为PNG和JPEG（质量92）。两个模型在各项指标上训练效果相当，生成的图像几乎无法区分。我们甚至通过[已知的量化表匹配技术估算JPEG质量](https://www.bitsgalore.org/2024/10/30/jpeg-quality-estimation-using-simple-least-squares-matching-of-quantization-tables.html)，对比了输出图像的JPEG压缩程度：

| 训练模型使用的格式 | 检测率 | 平均估算JPEG质量 | 中位数估算JPEG质量 |
| --- | --- | --- | --- |
| JPEG（质量92） | 12.0% | 39.6 | 34.0 |
| PNG | 10.8% | 42.1 | 45.0 |

检测率指生成图像中被检测出存在量化结构的比例。平均与中位数估算JPEG质量仅针对被标记的图像计算。两个模型几乎无法区分：无论哪种格式，大约每十张生成图像中仅有一张出现可检测的量化结构，且差异极小。我们确信训练图像的格式对输出质量影响微乎其微。因此，高质量JPEG存储不会在源图像已有基础上增加任何可测量的影响。对于大规模文本到图像训练而言，这已足够优秀。但对于用于训练Photoroom其他模型（如自定义[AI阴影](https://docs.photoroom.com/image-editing-api-plus-plan/ai-shadows)模型）的伪影敏感数据，我们仍坚持使用PNG。

## [](#2-building-the-dataset-in-lance)2\. 在Lance中构建数据集

你无法交互式地探索包含数亿甚至数十亿行的 Parquet 表。因此，我们将数据存储在 Lance 中，这样我们就可以对其进行索引、查询和浏览。我们使用 [Ray Data](https://docs.ray.io/en/latest/data/data.html) 进行数据摄取，并行读取源表，并在集群中写入 Lance 表的多个片段。

一个值得分享的经验是关于碎片化问题。Lance 表被分割成多个片段，某些操作的规模取决于片段的总数，而不是行数：扫描会打开每个片段的文件，而一些元数据操作的复杂度是 O(片段数)。因此，一个被分割成过多小片段的表，无论其大小如何，查询速度都会很慢。[Lance 性能指南](https://lancelot.dev/performance/) 建议保持较低的片段数量（经验法则是，即使是十亿行的表，片段数量也应在几百个左右），并定期运行压缩操作，将小片段合并成大片段。

我们是通过缓慢的方式才学到这一点的。我们最初的摄取目标仅为每个片段 10 万行，这导致了成千上万个微小的片段，使得即使是简单的过滤和全文搜索也慢如蜗牛。在将每个片段的压缩目标调整到大约一百万行后（对于我们几亿行的表来说，这意味着大约一千个片段），查询变得快速，我们就不再担心这个问题了。正确的目标取决于行的宽度、查询模式以及数据的写入方式。事后看来，更少、更大的片段可能是一个更好的默认选择。Lance 支持分布式压缩（例如通过 [Lance-Ray](https://lancelot.dev/integrations/ray/#lance-ray-integration) 集成），因此事后调整很容易，但一开始就避免过度碎片化是值得的。

![Lance 片段压缩：许多小片段（慢）被压缩成更少、更大的片段（快）](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/IkEGCBEUtXF-x9lY3rjvW.jpeg)

### [](#existing-captions-and-embeddings-for-exploration)用于探索的现有标题和嵌入

我们选择自己为每张图像重新生成标题，而不是依赖某些数据集自带的标题。原因是为了保持一致性：在混合来源中，标题的长度、风格和质量差异很大，我们希望在整个语料库中采用统一的标准（更多关于标题生成器的内容见第 3 节）。

然而，数据集已有的元数据仍然有价值，只是用途不同。预先存在的标题，以及有时随之而来的向量嵌入（例如 [CLIP](https://arxiv.org/abs/2103.00020) 嵌入），正是让数据集能够在 Lance 中立即被探索的原因：对标题进行全文搜索，以及对嵌入列进行最近邻搜索，使我们能够浏览数据，并快速判断其质量以及需要进行的过滤，这远在我们运行自己的标题生成之前。因此，我们保留两者，如果它们位于单独的表中，则将其连接进来，并依赖它们进行接下来描述的浏览。

### [](#profiling-and-exploring-the-data)数据剖析与探索

数据可查询后，我们就能快速分析其概况。例如，分辨率分布告诉我们应在何处设置截断阈值。最小的训练桶为512²像素，我们将上采样至桶的比例上限设为4/3（约33%），因此有效截断阈值为384²≈14.7万像素，且宽高比需在\[0.5, 2.0\]范围内。低于此标准的数据均被舍弃。

Lance表原生支持文本列的全文搜索和向量嵌入列的最近邻相似度搜索，两者均可通过构建索引加速。我们正是对标题列和嵌入列执行了此操作，随后构建了一个小型用户界面用于浏览数据集：既能对标题进行实时文本搜索，也能通过向量搜索导航视觉相似图像的聚类。

[![explorer\_text](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/azqOCm90EDc2EkXiO2tTy.jpeg)](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/azqOCm90EDc2EkXiO2tTy.jpeg)

通过这种方式浏览数据，我们只需观察就能定性评估其多样性和质量，并及早发现问题。我们发现了信息量不足的基础标题、数量惊人的非摄影内容（截图、幻灯片、文档、信息图表），以及一些近乎重复的图像。这些观察结果直接塑造了后续流程：重新为所有图像生成标题（更长、更准确的标题能很好地描述即使不完美的图像，并确保标题与我们训练所用的确切图像匹配），并在后续步骤中增加轻度过滤和去重处理。总的来说，我们认为这类探索工具在决定采用某个数据集之前，对于了解其特性而言是无价的。

## [](#3-re-captioning-everything-with-a-vlm)3. 使用视觉语言模型重新生成所有标题

我们发现，长而详细的标题对输出质量有着非常显著的影响。在早期基准测试中，我们使用相同的图像训练了一个小型扩散模型两次：一次使用我们通过[Qwen2.5-VL-7B](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)生成的标题，另一次使用更短的标题（由[LLaVA-1.5-LLaMA3-8B](https://huggingface.co/xtuner/llava-llama-3-8b-v1_1)生成），并在整个训练过程中对两者进行评分。使用Qwen2.5-VL-7B生成的长标题全面胜出，在每个检查点都获得了更低的FID、CMMD和DINO-MMD值（这三个指标都是越低越好）。

[![vlm\_vs\_llava\_metrics](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/DTRMDylmVp1dfdSaL7Epu.jpeg)](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/DTRMDylmVp1dfdSaL7Epu.jpeg) *使用Qwen2.5-VL-7B标题（红色）与基线LLaVA-1.5-LLaMA3-8B标题（蓝色）训练的小型扩散模型，每10k步评分一次，直至100k步。三个指标均为越低越好。*

最终指标（约100k步时）：

| 标题 | FID ↓ | CMMD ↓ | DINO-MMD ↓ |
| --- | --- | --- | --- |
| Qwen2.5-VL-7B | ≈13 | ≈0.32 | ≈0.22 |
| LLaVA-1.5-LLaMA3-8B | ≈21 | ≈0.52 | ≈0.35 |

以下是一个示例图像，同时展示了我们生成的、由视觉语言模型生成的长标题，以及用作基线的较短标题：[![captions](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/4wLXv1ICfgVBA1_nAQn_C.jpeg)](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/4wLXv1ICfgVBA1_nAQn_C.jpeg)

我们的标题生成作为一个基于Ray Data构建的流式管道运行：它从Lance读取数据，准备每张图像，在GPU上为其生成标题，然后将标题作为新列写回，以便我们进行查询和过滤。我们提示生成一个密集、基于视觉的段落，而不是一行式的标题。

### [](#choosing-the-captioner)选择标题生成模型

紧凑的时间表和有限的资源意味着我们不能花费太多时间对不同标题生成模型和系统提示进行消融实验。

我们使用以下提示来生成标题。

系统提示：

该图像是一张折线图，展示了三个候选描述器（captioner）和两个参考描述器在训练过程中的FID、CMMD和DINO-MMD指标变化。横轴表示训练步数（从0到100k，每10k步标记一次），纵轴表示指标值（越低越好）。图中包含五条不同颜色的曲线：蓝色代表Qwen2.5-VL-7B-Captioner-Relaxed，橙色代表Qwen3-VL-8B，绿色代表Qwen3.5-9B，红色代表Qwen2.5-VL-7B（参考），紫色代表Gemini 1.5 Flash（参考）。所有曲线均从左上方向右下方下降，但下降幅度和最终位置不同。Qwen3.5-9B（绿色）在三个子图中均位于最下方，表现最佳；Qwen3-VL-8B（橙色）紧随其后；Qwen2.5-VL-7B（红色）在大多数步数中位于最上方，表现最弱。图像下方有一个表格，列出了五个描述器在约100k步时的最终指标值，包括FID、CMMD和DINO-MMD，并标注了“↓”表示越低越好。表格中Qwen3.5-9B的FID为10.51，CMMD为0.278，DINO-MMD为0.162，均为最低。图像标题为“FID, CMMD, and DINO-MMD over training for the three captioner candidates and two reference captioners, scored every 10k steps up to 100k. Lower is better on all three.”，这是图像的一部分，而非图形叠加。整体构图居中，背景为白色，线条清晰，颜色区分明显，便于比较。

我们更看重质量而非吞吐量，但面对数亿张图像时，吞吐量依然重要，因为它决定了生成描述的成本。我们仅对三个候选模型进行了测量，所有模型均通过 [vLLM](https://github.com/vllm-project/vllm) 提供服务，未使用量化或自定义内核。调优在流水线层面进行：每个 GPU 运行一个 vLLM 副本，配合足够的 Ray Data 池工作节点，使节点上的全部八块 GPU 保持满载。我们首先发现 Qwen3-VL-8B 速度最快（每块 H200 每秒处理 20 张图像），并因其速度、质量以及稳定且达到发布级别的 vLLM 支持而选择了它。直到后来我们才发现，Qwen2.5-VL "Relaxed" 描述器在修复后也能达到同样的 20 img/s：它之前保存时使用了错误的架构类，导致 vLLM 的 `torch.compile` 哈希失效，迫使我们使用缓慢的即时模式，直到我们将其重新保存为 `Qwen2_5_VLForConditionalGeneration`。Qwen3.5-9B 能生成出色的描述，但运行速度较慢（约 6.5 img/s），且当时需要不稳定的夜间依赖构建。几个月后，它可能也是一个不错的选择。

## [](#4-writing-mosaic-data-shards)4. 写入 Mosaic 数据分片

在流水线的末端，我们将添加了描述并按桶分组的流转换为 MDS 格式，这是训练器流式读取的格式。

### [](#what-mds-is-and-why-we-use-it-over-lance)什么是 MDS，以及我们为何选择它而非 Lance

Mosaic Streaming 库将样本打包成约 128MB 的分片，在训练期间从对象存储或本地文件系统流式读取。Lance 也支持简单的分布式训练，但我们发现转换为 MDS 对我们来说摩擦更小。Mosaic Streaming 免费提供了我们原本需要自行构建的分布式训练机制：

-   **确定性、可恢复的洗牌**：提供多种算法选择，可在洗牌质量与主机内存之间权衡。
-   **弹性中期检查点恢复**：可更改节点/秩的数量，并在不重复或跳过样本的情况下恢复训练。
-   **多数据流的加权混合**：以指定比例混合不同数据集/子集，同时保持洗牌和恢复的保证。

### [](#resolution--aspect-ratio-bucketing)分辨率 + 宽高比分桶

扩散训练在固定大小的张量上进行，因此批次中的每张图像必须共享相同的宽度和高度。为了避免将所有图像裁剪为正方形（丢失肖像和风景的边缘部分）或填充（浪费计算资源），我们采用了宽高比分桶：定义一组允许的 (宽, 高) 形状，每张图像被分配到最近的形状，且仅相同形状的图像被组合成一个批次。

我们分两步进行。首先按分辨率层级（像素数）划分：大部分数据使用512px和1024px两个层级，高分辨率数据额外增加2048px和4096px层级。一张图片会被放入其无需放大超过4/3（约33%）即可达到的最大层级，因此每个层级的下限为（尺寸 × 3/4）²（512层级约为384²，1024层级约为768²）；低于最小下限的图片将被丢弃。然后在层级内按宽高比处理：我们枚举出与patch对齐的（宽，高）形状（两者均可被16整除，宽高比在[0.5, 2.0]范围内），这些形状保持约256个patch的恒定token预算，每个层级产生13个桶，从0.5（竖长）经1.0（正方形）到2.0（横宽）。在512px层级，这对应352×704 … 512×512 … 704×352；在1024px层级，则按相同13种比例放大。恒定的patch数量使得不同形状图片的计算量保持一致。

![宽高比分桶：不同形状的图片被归入固定的512px和1024px桶中](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/OYSqm4DoFjLyRS97O9gG-.jpeg)

随后，每张图片使用Lanczos滤波器调整至其对应桶的尺寸，并以质量92编码为JPEG。Mosaic数据分片被写入按分辨率和宽高比键控的树状结构中，以便训练器可以分别流式读取各桶：

```
output_dir/
  512/
    0.500/  shard.00000.mds, ...
    ...
    1.000/  ...
    ...
    2.000/  ...
  1024/
    0.500/  ...
    1.000/  ...
```

## [](#5-data-filtering)5\. 数据过滤

第2节的探索依赖于数据集自带的任何标题。一旦我们自己的详细标题就位，同样的全文搜索功能变得强大得多，对标题进行几轮筛选后，发现了稀疏的原始元数据所隐藏的内容：比我们估计更多的文本密集型图片（截图、幻灯片、文档、信息图），以及一些漏网的NSFW内容。

为了将这些近似搜索转化为过滤器，我们使用[Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)在纯文本模式下进行了一次快速分类：它读取每个标题（从不看图片），并将样本标记为视觉、文本或NSFW。整个启发式方法本质上就是一个问题：“你会看这张图片，还是读它？” 基于标题而非像素进行分类成本低廉（每GPU每秒约处理200个标题），并且复用了我们已经完成的工作。像素级别的图像分类器可能更准确，但这足以在中等成本下移除明显案例，且无需标注数据和训练自定义分类器。

与其重写整个语料库来剔除这些样本，我们在MDS数据加载器中添加了跳过列表功能：每个分片附带一个小型侧车文件，列出需要跳过的样本索引，加载器会合并这些索引并在训练时跳过对应样本。无需删除或重写任何内容。事实证明，这种灵活的机制远不止适用于这一种过滤场景。我们可以排除事后发现的任何样本集——无论是新发现的质量问题、黑名单，还是（关键所在）后来选择退出训练数据使用的用户内容——只需在下次运行前扩展跳过列表即可。这种机制对消融实验也很方便：要衡量某个过滤器的效果，只需在同一数据集上分别使用和不使用跳过列表训练一次，而无需存储两份副本。唯一的限制在于规模。跳过列表会在加载时增加少量逐样本处理开销，因此当跳过比例增大到一定程度时（我们估计大约在10%左右，但未精确测量临界点），重写不含跳过样本的MDS数据集会比维护不断增长的跳过列表更划算。

[![skip\_lists](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/rYCQhSfWBd9mMSiGy-28d.jpeg)](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/rYCQhSfWBd9mMSiGy-28d.jpeg)

## [](#6-deduplication)6\. 去重

同一探索工具还发现了大量重复内容：大型图像集合往往会积累精确重复和近似重复的副本，这不仅浪费训练算力，还会扭曲数据分布。我们主要针对近似重复和精确副本，因此添加了基于感知哈希的快速去重流程。如果目标是识别重复概念并在数据集中平衡它们，基于图像嵌入聚类的去重方法更为合适。

[![explorer\_duplicates](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/uhCtFxqSbyY1b3QFPinLK.jpeg)](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/uhCtFxqSbyY1b3QFPinLK.jpeg)

我们本可以采用SHA-256等字节哈希进行精确去重，但感知哈希已经涵盖了这一功能（它也能匹配字节完全相同的图像），同时还能捕获重新编码或调整尺寸后的副本，因此我们仅使用了感知哈希。这是一种标准的[基于DCT的感知哈希](https://www.hackerfactor.com/blog/index.php?/archives/432-Looks-Like-It.html)（缩放到小尺寸灰度缩略图，进行二维DCT，对低频系数进行阈值处理生成紧凑指纹），基于[OpenCV](https://opencv.org/)和[SciPy](https://scipy.org/)仅需几行代码即可实现。当两个哈希值的汉明距离为零时，我们判定为匹配，因此仅移除像素级近似相同的副本。同一主体的不同拍摄角度会生成不同的指纹（以及不同的描述文本），这些会被有意保留。

一旦每张图像都拥有感知哈希（指纹），去重本身仅需哈希表查找：扫描每个宽高比桶中的不同分辨率，每个指纹仅保留一个条目。因此，任何指纹已存在的图像都是已保留图像的副本；当某个聚类跨越多个分辨率时，我们保留最高分辨率的副本。重复项会被写入每个分片的跳过列表，加载器在加载时合并并跳过这些样本，因此无需删除任何内容，数据集也无需重写。

![感知哈希去重：近似相同的图像被简化为指纹，重复项被分组，保留最高分辨率](https://cdn-uploads.huggingface.co/production/uploads/680a58121b2c7c159d2bd481/yMF9iatdukIM9-3Pnu4kL.jpeg)

在整个语料库中，去重移除了约百分之几的图像，基于标题的文本过滤器又移除了百分之几，而NSFW过滤仅移除了不到百分之一。

* * *

## [](#whats-next)下一步计划

本文介绍的数据集是预训练语料库，在此阶段广度和规模最为重要。而在监督微调与偏好对齐阶段，权衡完全反转：质量远胜于数量，问题变为如何从海量语料中筛选并整理出小规模、高信噪比的子集。为此，我们正在构建更强大的筛选工具，包括一个更丰富的探索器，它能通过视觉语言模型（VLM）预测的结构化属性为图像打标签，从而让我们能够组装高度针对性的微调子集。我们计划在后续文章中深入探讨微调、偏好对齐以及相关数据工具等主题。

**用PRX构建项目，或发现我们流程中的漏洞？** PRX采用Apache 2.0协议，模型代码托管于[github.com/Photoroom/PRX](https://github.com/Photoroom/PRX)。我们已将PRX集成到[diffusers](https://github.com/huggingface/diffusers)库中，并提供了[Hugging Face Space](https://huggingface.co/spaces/Photoroom/PRX-Pixel)供您试用最新版本[PRX Pixel](https://huggingface.co/Photoroom/prxpixel-t2i)。

欢迎通过[Discord](https://discord.gg/ZRwdpBSyyC)与我们讨论扩散模型与数据。

## [](#references)参考文献

工具

1.  [Lance](https://lance.org/)
2.  [Mosaic Streaming (MDS)](https://github.com/mosaicml/streaming)
3.  [Ray Data](https://docs.ray.io/en/latest/data/data.html)
4.  [vLLM](https://github.com/vllm-project/vllm)

模型

5.  [Qwen2.5-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)
6.  [LLaVA-1.5-LLaMA3-8B](https://huggingface.co/xtuner/llava-llama-3-8b-v1_1)
7.  [Qwen2.5-VL-7B-Captioner-Relaxed](https://huggingface.co/Ertugrul/Qwen2.5-VL-7B-Captioner-Relaxed)
8.  [Qwen3-VL-8B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct)
9.  [Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)

评估指标

10.  [FID (Heusel et al., 2017)](https://arxiv.org/abs/1706.08500)
11.  [CMMD, "Rethinking FID" (Jayasumana et al., 2024)](https://arxiv.org/abs/2401.09603)
12.  [DINOv2 (Oquab et al., 2023), DINO-MMD背后的特征](https://arxiv.org/abs/2304.07193)

PRX

13.  [PRX模型代码](https://github.com/Photoroom/PRX)
14.  [PRX Pixel模型](https://huggingface.co/Photoroom/prxpixel-t2i)
15.  [PRX Pixel演示 (Hugging Face Space)](https://huggingface.co/spaces/Photoroom/PRX-Pixel)
