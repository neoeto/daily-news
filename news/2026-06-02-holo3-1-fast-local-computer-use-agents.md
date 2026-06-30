---
title: 'Holo3.1: Fast & Local Computer Use Agents'
url: 'https://huggingface.co/blog/Hcompany/holo31'
url_hash: 440b7646f5767e29323bc647b882f2d7add19e78
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-02T14:13:23.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

去年三月，我们发布了 Holo3——当时最先进的计算机操控模型。该模型迅速获得采用，开发者、企业和合作伙伴开始在广泛的工作流程中部署 Holo3，涵盖浏览器自动化、商业软件、内部工具及桌面应用。随着采用规模扩大，我们意识到仅凭性能已不足以满足需求。

用户希望在同一套计算机操控能力下，既能覆盖桌面端也能覆盖移动端环境，并能与不同智能体框架无缝集成。他们需要灵活的部署方案，从云端推理到终端设备的完全本地执行皆可支持。

为此，我们推出 Holo3.1 系列。Holo3.1 在生产环境最关键的三个维度上提升了鲁棒性：环境（网页、桌面、移动端）、智能体框架以及部署目标。我们首次发布了针对本地推理优化的量化检查点，包括 FP8、Q4 GGUF 和 NVFP4 格式。

Holo3.1 是实现我们通用计算机操控智能体愿景的重要一步：构建能够跨环境运行、集成至任意智能体堆栈、并在工作流所在之处执行的系统。

* * *

## [](#跨图形界面环境与智能体框架的计算机操控)跨图形界面环境与智能体框架的计算机操控

基于 Qwen 系列，Holo3.1 旨在提升计算机操控智能体实际部署环境中的鲁棒性，同时保持业界领先性能。

当团队将 Holo3 从评估阶段推进至生产环境时，我们反复观察到同一挑战：在某一场景下的强劲表现未必能迁移至其他场景。移动设备、替代性智能体框架以及不同的执行引擎都会引入各自的分布偏移源。

[![Capture d’écran 2026-06-01 à 16.30.52](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/FZHF8oDkdWeMRSghXlO7h.png)](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/FZHF8oDkdWeMRSghXlO7h.png)

## [](#移动端自动化)移动端自动化

Holo3.1 将 Holo3 的能力拓展至浏览器和桌面控制之外，在移动端环境取得重大突破。在 AndroidWorld 基准测试中，我们的 35B-A3B 模型从 67% 提升至 79.3%，而较小的 4B 和 9B 变体则从 58% 提升至 72%。

## [](#跨框架性能)跨框架性能

为更好支持团队在第三方智能体堆栈中部署 Holo，Holo3.1 在原有结构化 JSON 输出基础上，新增了对函数调用协议的原生支持。

在 OSWorld 及涵盖电商、商业软件和协作工作流的内部基准测试中，函数调用与原生执行现已达到近乎一致的性能。当在 Holotab 产品框架内评估时，Holo3.1 相比 Holo3 实现了超过 25% 的提升。

## [](#兼顾成本与性能的较小模型)兼顾成本与性能的较小模型

为进一步支持本地及设备端推理，我们除发布性能顶尖的 35B-A3B 大模型外，还推出了包括 0.8B、4B 和 9B 在内的小型模型，适用于经济高效且注重隐私的部署场景。

[![Capture d’écran 2026-06-01 à 16.21.18](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/RyP4nSDHYTtKv0eb3CjZI.png)](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/RyP4nSDHYTtKv0eb3CjZI.png)

[![overall\_pareto\_light\_notitle](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/5voXQcpFKz6Fz3s3e4Kpu.png)](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/5voXQcpFKz6Fz3s3e4Kpu.png)

*Holo3.1 与 Qwen 3.5 系列的性能与成本对比。整体性能先对四项 H Corporate 基准测试取平均值（确保各系列权重相等），再计算 OSWorld、AndroidWorld、H Corporate、ScreenSpot-Pro 及 OSWorld-G 的总体均值。*

* * *

## [](#快速本地推理)快速本地推理

这是我们首次发布量化权重。首批提供 35B-A3B 检查点，支持 FP8、Q4 GGUF 和 NVFP4 格式。

对于NVFP4，我们采用了NVIDIA的Model Optimizer，配置为W4A16。这些检查点能够实现计算机使用代理的快速本地推理，且模型性能几乎没有下降。FP8和NVFP4在OSWorld上取得了相同的分数，仅比全精度BF16检查点低约两分。

速度提升十分显著：在DGX Spark上，NVFP4 W4A16的总令牌吞吐量是FP8的1.41倍，是BF16的1.74倍。[![quality\_throughput\_pareto\_light (1)](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/LRDMlYHe5n_FLLu41CRXd.png)](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/LRDMlYHe5n_FLLu41CRXd.png)

## [](#towards-local-agents-on-consumer-hardware)迈向消费级硬件上的本地代理

我们还发布了Q4 GGUF检查点，旨在消费级硬件上本地部署计算机使用代理。

代理本身在Windows或Mac机器上本地运行，而模型可以在同一台机器上运行（我们提供了Apple Silicon的参考数据），也可以在同一网络的DGX Spark上运行。无论哪种情况，执行过程都完全保持私密和本地化，不会离开用户的网络。

在Spark上，我们与NVIDIA共同开发的代理框架优化，结合上述NVFP4量化，相比FP8基线实现了约2倍的端到端加速，将平均步骤时间从6.8秒缩短至3.3秒。

[![agent\_request\_rate\_light](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/FbfYX69aNTL-U6yhOBQDN.png)](https://cdn-uploads.huggingface.co/production/uploads/69ce2739f4b9146a31e99a2f/FbfYX69aNTL-U6yhOBQDN.png)

*各平台和精度下的代理请求速率。在DGX Spark上，采用NVFP4的vLLM在默认和快速模式下均实现了最高请求速率，其次是Q4 GGUF和FP8。这些改进及更多内容将很快在即将推出的桌面代理框架中落地。*

* * *

## [](#availability)可用性

Holo3.1系列提供四种尺寸：

| 模型 | 部署目标 |
| --- | --- |
| Holo3.1-0.8B | 超轻量级本地代理 |
| Holo3.1-4B | 经济高效的部署 |
| Holo3.1-9B | 平衡性能与延迟 |
| Holo3.1-35B-A3B | 最先进的性能 |

我们还发布了优化的FP8、NVFP4和Q4 GGUF检查点，用于本地和边缘部署。

* * *

## [](#get-started)开始使用

-   Holo Models API：[https://hcompany.ai/holo-models-api](https://hcompany.ai/holo-models-api)
-   Hugging Face：[https://huggingface.co/collections/Hcompany/holo31](https://huggingface.co/collections/Hcompany/holo31)

我们期待看到开发者利用Holo3.1构建出怎样的成果。
