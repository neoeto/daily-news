---
title: Introducing Cosmos 3 Edge
url: 'https://huggingface.co/blog/nvidia/cosmos3edge'
url_hash: 8030c8e0dc091db7f27b5a432a358d109331641b
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-20T15:58:51.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

[![Pranjali Joshi 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/M8ln8L-HFXbpO3vn-_1xn.png)](https://huggingface.co/PranjaliJoshi)

[![Saeed Babamohamadi 的头像](https://huggingface.co/avatars/153cd4243479b05b2e17e052f689433a.svg)](https://huggingface.co/SaeedBabamohamadi)

现实世界广阔无垠，物理 AI 系统要在其中运行，就需要理解场景如何变化，预测接下来可能发生什么，并判断某个动作将如何影响世界。

机器在工厂、仓库、医院等边缘环境中运行。为了理解这些环境并采取行动，它们需要能够在内存受限的系统上提供数据中心级性能的模型。

今天，我们在 Hugging Face 的 Cosmos 3 仓库中发布了 NVIDIA Cosmos 3 Edge。这是一个拥有 40 亿参数的开源世界模型，可帮助机器人和视觉 AI 代理理解周围环境、实时推理，并在边缘设备上生成机器人动作。

下载模型：[https://huggingface.co/nvidia/Cosmos3-Edge](https://huggingface.co/nvidia/Cosmos3-Edge)

该模型在 NVIDIA 边缘计算机（包括 NVIDIA RTX PRO GPU、NVIDIA DGX、NVIDIA GeForce RTX™ GPU、NVIDIA Jetson 以及新发布的 Jetson T2000 和 T3000 模块）上实现了内存高效、高吞吐量的推理。

它被设计为一个紧凑的开源模型，可作为小型视觉语言模型 (VLM) 使用，具有同类最佳的吞吐量和准确性，并支持实时推理。

作为经过后训练的世界动作模型 (WAM)，Cosmos 3 Edge 以机器人控制分辨率（640×360 观测值）运行，在 NVIDIA Jetson Thor 上实现实时推理，每次推理生成 32 个动作，同时以 15 Hz 的频率实现实时控制。

在同类规模（40 亿参数）的模型中，Cosmos 3 Edge 在视觉分析领域的 VANTAGE-Bench 基准测试中排名第一，在机器人策略学习方面达到业界领先水平，为智能基础设施和机器人技术树立了新的标杆。

[![Cosmos 3 视频](https://img.youtube.com/vi/1QPh70Es_oU/maxresdefault.jpg)](https://youtu.be/1QPh70Es_oU)

## [](#what-is-world-modeling)什么是世界建模？

世界模型学习环境如何随时间变化。它表示物体、运动、空间关系以及动作的效果。

想象一个机器人伸手去抓取物体。识别物体只是第一步。机器人还必须理解物体在哪里，它的夹爪如何移动，接触时可能发生什么，以及哪个动作最有可能成功完成任务。

世界模型帮助机器人推理这些关系。它可以预测某个动作的视觉结果，推断导致变化的动作，或生成一个动作来产生期望的结果。

Cosmos 3 Edge 将这些能力整合到一个模型中，并在设备上运行。其共享表示使物理 AI 系统能够理解当前世界状态，模拟可能的未来，并将这些未来与动作联系起来。

## [](#two-transformer-towers-one-shared-representation)两个 Transformer 塔，一个共享表示

Cosmos 3 结合了两个 Transformer 塔：

-   **自回归塔：** 处理视觉和文本标记，用于理解和推理。
-   **扩散塔：** 处理视觉、音频和动作标记，用于预测、生成和神经模拟。

两个塔保持独立的归一化层和多层感知器。它们共享多模态注意力层，这些层在语言、视频、音频和动作之间对齐信息。

这种设计允许模型在生成输出之前对场景进行推理。根据任务的不同，Cosmos 3 可以从自回归塔生成推理标记，或从扩散塔生成去噪后的视频和动作标记。

注意力模式也针对每种信息类型进行了适配。语言采用因果注意力机制，每个token仅关注其之前的token。扩散token则更广泛地关注可用上下文，从而支持连贯的预测与生成。

这些组件共同赋予模型对当前状态、后续可能发生的事件以及行动如何影响结果的统一表征能力。

[![ababa](https://cdn-uploads.huggingface.co/production/uploads/6a45813c717ace23b8c3b562/EXkYn60a1TSwkBXaoKmNh.png)](https://cdn-uploads.huggingface.co/production/uploads/6a45813c717ace23b8c3b562/EXkYn60a1TSwkBXaoKmNh.png)

## [](#a-common-representation-for-action)行动的统一表征

物理系统对行动的描述方式各不相同。车辆可能通过自我姿态和移动来表征行动；相机使用相机运动；机械臂依赖末端执行器的姿态，而手部或夹爪还需表征抓取状态。

Cosmos 3 将这些不同形态映射为统一的行动表征。

行动被编码为紧凑的几何向量，包含：

-   平移
-   旋转
-   操控状态

这建立了控制与视觉世界结构之间的直接联系。模型能够将像素变化与物理运动、空间关系及控制输入相关联。

因此，生成的视频不仅是视觉预测，更能表征世界在行动作用下预期的变化方式。这为开发者提供了基于运动、控制及因果关系的训练数据。

### [](#policy-mode)策略模式

作为策略模型，Cosmos 3 可同时预测行动及其预期的视觉结果。

模型能生成系统应执行的操作，并模拟接下来可能发生的情况。这使世界建模与机器人策略训练及评估直接关联。

**输入当前状态，输出行动与视觉结果。**

这些模式使单一模型能够学习原因、结果与策略。行动可在模型中双向流动，使 Cosmos 3 Edge 既能预测行动效果，也能从效果推断行动。

![机械臂拿起香蕉](https://cdn-uploads.huggingface.co/production/uploads/6a45813c717ace23b8c3b562/T8tZbeaRUEoazK5sdq0UX.gif)

*提示：拿起香蕉并放入盘中。*

我们还发布了 Cosmos 3 Edge 策略模型（DROID）：基于 DROID 数据集后训练的机器人操控策略，适用于拾取与放置任务，并附带后训练脚本。

开发者可使用小型 H100 集群或 NVIDIA DGX Station，高效微调 Cosmos 3 Edge 以适应目标工作负载，随后部署至 NVIDIA 边缘及加速计算平台。

## [](#post-trained-samples-for-improved-performance)后训练样本：提升性能

除基础模型外，我们发布了参考后训练检查点及训练方案，帮助开发者针对自身应用适配和优化 Cosmos 3。

Cosmos 3 是一个开放世界基础模型平台。随着模型使用高质量领域特定数据进行后训练，其在专业应用中的准确性将持续提升。Cosmos 作为构建领域适配世界模型的起点，基于开放框架实现。后训练使开发者能在保持输出质量的同时提升模型性能。为演示这一流程，我们还发布了 Cosmos 3 Super 4步蒸馏检查点及后训练脚本，为 64B 模型提供更快的参考实现，帮助开发者将 Cosmos 适配至自身领域并实现更优的下游性能。

Cosmos 3 Super 四步法（文生图与图生视频）：这些是采用分布匹配蒸馏技术的检查点和脚本，可将扩散过程的去噪步骤从35-50步缩减至仅4步，在保持图像与视频质量及保真度的同时，实现最高25倍的推理加速。

这些示例可作为开发者构建应用的参考实现。通过使用开源训练脚本，您可以为定制机器人策略对Cosmos 3 Edge进行后训练，或针对特定应用对Cosmos 3 Super进行蒸馏，以加速图像与视频生成。

## [](#try-cosmos-3-edge)试用Cosmos 3 Edge

下载模型：[https://huggingface.co/nvidia/Cosmos3-Edge](https://huggingface.co/nvidia/Cosmos3-Edge)

Cosmos 3 Edge通过共享世界表征连接理解、预测、模拟与行动。开发者可将其部署在更靠近传感器的设备端。该模型既可作为推理器使用，也可作为动作生成器。

使用开源的Cosmos框架对模型进行定制与专业化。

查看Cosmos 3：[https://huggingface.co/collections/nvidia/cosmos3](https://huggingface.co/collections/nvidia/cosmos3)

## [](#whats-ahead)未来展望

我们将持续推进Cosmos 3在物理AI领域的发展，即将推出交互式世界生成、驾驶场景模拟及机器人策略等方面的改进。

我们同时致力于在更广泛的硬件平台上实现更快的推理速度和更高效的后训练，减少构建下游模型所需的时间和算力。

这包括通过vLLM等开源推理与优化框架优化Cosmos 3检查点，更多优化方案及开发者工具即将推出。
