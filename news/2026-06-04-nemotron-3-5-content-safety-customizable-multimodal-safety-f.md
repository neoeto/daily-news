---
title: >-
  Nemotron 3.5 Content Safety: Customizable Multimodal Safety for Global
  Enterprise AI
url: 'https://huggingface.co/blog/nvidia/nemotron-3-5-content-safety'
url_hash: 3c2e7a73efc4745c3789857d520931d4b30a8613
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-04T18:57:45.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

过去两年，NVIDIA 的内容安全栈已从一个专注的英文文本分类器发展为一个由专门模型组成的家族——每个模型都将覆盖范围扩展到新的模态、语言和推理模式。2026 年 3 月发布的 [Nemotron 3 内容安全](https://huggingface.co/nvidia/Nemotron-3-Content-Safety) 首次将多模态和多语言能力整合到一个 4B 参数模型中。今天，我们发布 [Nemotron 3.5 内容安全](https://huggingface.co/nvidia/Nemotron-3.5-Content-Safety)，完成了这一演进：一个单一模型，将多模态输入、多语言覆盖、自定义企业策略执行和可审计推理统一到一次推理调用中。

本文涵盖 3.5 版本的新变化、每项新能力背后的设计决策，以及如何将该模型集成到生产安全流程中。

## [](#nemotron-35-内容安全的新特性)Nemotron 3.5 内容安全的新特性

### [](#1-统一多模态评估)1. 统一多模态评估

Nemotron 3 引入了图像理解能力；Nemotron 3.5 则深化了多模态集成。该模型将 **用户提示、可选图像和可选助手响应** 作为一个上下文窗口，并对组合输入生成一致的安全判定。将三者一起评估——而非独立评分——弥补了多模态安全场景中一个众所周知的漏洞：仅从文本与图像之间，或请求与响应之间的 *交互* 中产生的策略违规，现在可以在一次处理中被捕获。

### [](#2-全球语言覆盖)2. 全球语言覆盖

Nemotron 3.5 保持了其前代产品的 12 种语言显式训练覆盖——**英语、法语、西班牙语、德语、中文、日语、韩语、阿拉伯语、印地语、俄语、葡萄牙语和意大利语**——同时继承了 Gemma 3 基础模型在约 140 种语言上的强大零样本泛化能力。这意味着在训练数据稀缺的市场（例如东南亚语言、斯堪的纳维亚语言、资源较少的非洲语言）中部署时，无需单独微调即可受益于基础模型的多语言迁移。

### [](#3-自定义策略执行)3. 自定义策略执行

这是 3.5 版本相对于 Nemotron 3 最重要的架构新增功能。生产部署很少在单一通用安全分类体系下运行。医疗平台与金融服务聊天机器人、开发者工具 IDE 或儿童教育应用的风险特征不同。Nemotron 3.5 接受与输入一起提供的自定义策略规范。模型在生成判定时会基于该策略进行推理，而不是完全依赖内置分类体系。这将在 [Nemotron 内容安全推理 4B](https://huggingface.co/nvidia/Nemotron-Content-Safety-Reasoning-4B) 中首次引入的工作扩展到了完整的多模态、多语言场景。

### [](#4-推理轨迹思考模式)4. 推理轨迹（思考模式）

Nemotron 3.5 中的每个安全判定都可以通过可选的 **思考模式** 附带可审计的推理轨迹。启用后，模型会输出逐步推理过程，然后给出最终的 `safe` / `unsafe` 标签，并可选择性地输出违规类别。

```
<think>
用户提示要求提供在没有处方的情况下获取受控物质的指导。
助手响应提供了具体的获取步骤，并引用了在线市场。
此交互违反了犯罪计划/自供和受控物质类别。
图像（药房外观）提供了位置背景，但不改变判定结果。
</think>

用户安全：不安全
响应安全：不安全
安全类别：犯罪计划/自供，受控物质
```

当延迟成为主要约束时，可以禁用THINK模式，以恢复到Nemotron 3中可用的相同低延迟二元判定。

### [](#5-safety-dataset)5\. 安全数据集

随着Nemotron 3.5的发布，我们同步开放了安全数据集。这是一个重要的里程碑，因为大多数开源安全模型通常不提供训练集或评估集。在多模态领域，这一问题更为严重，因为图像或视频等素材往往来自具有严格许可条款的资源。Nemotron 3.5内容安全数据集是多模态、多语言的，并包含用于训练模型的安全推理轨迹。这些推理轨迹通过两步法生成，使其简洁明了，类似于[Nemotron Content Safety Reasoning 4B](https://huggingface.co/nvidia/Nemotron-Content-Safety-Reasoning-4B)模型。

* * *

## [](#model-architecture)模型架构

Nemotron 3.5内容安全基于**Google Gemma 3 4B IT**（4B参数）构建，提供128K上下文窗口、强大的视觉语言推理能力以及广泛的多语言覆盖。NVIDIA通过LoRA适配器对该基础模型进行微调，该适配器安装了针对性的安全分类行为，同时保持模型足够紧凑，可在8GB以上显存的GPU上实时部署。

推理接口支持三种输出模式：

**模式1 — 低延迟二元判定：**

```
用户安全：安全
回复安全：不安全
```

**模式2 — 带类别的二元判定：**

```
用户安全：安全
回复安全：不安全
安全类别：暴力、犯罪计划/供认
```

**模式3 — 思考模式（推理 + 判定）：**

```
<think>
[逐步推理轨迹]
</think>

用户安全：不安全
回复安全：不安全
安全类别：[类别]
```

安全分类法遵循**Aegis 2.0**框架：13个与MLCommons安全分类法一致的核心类别，外加10个细粒度子类别。这种对齐方式允许与在Aegis分类法数据集上基准测试的其他开源和闭源防护系统进行直接比较。

* * *

## [](#reasoning)推理

推理是内容安全分类的加速器，因为它为生产级AI系统（尤其是在企业和受监管环境中）提供了必要的上下文、定制能力和可问责性。

**支持自定义和上下文策略执行**

推理允许内容安全模型在推理时动态解释和执行以自然语言定义的、特定领域的自定义策略。这是必要的，因为生产部署很少在单一、通用的安全分类法下运行。金融服务聊天机器人的风险画像与儿童教育应用不同，后者可能对脏话的容忍度更低。此功能支持：

-   **类别抑制：** 禁用不相关的类别，例如当DevOps工具处理“终止进程”这一短语时，防止触发“暴力”类别。
-   **自定义类别注入：** 定义特定于组织监管或产品策略的专有风险类别。

**提供可审计且有记录的判定依据**

推理轨迹展示了模型在给出最终安全或不安全判定之前的逐步逻辑。这种有记录的判定依据服务于多个目的：

-   **合规与审计日志：** 受监管行业通常需要为内容审核决策提供书面依据。
-   **人工审核：** 审核人员可以审查*为何*得出某个结论，从而识别模型中的系统性错误。
-   **策略迭代：** 追踪记录揭示了模型如何解读边缘案例，使团队能够迭代优化自定义策略语言。

**延迟**

虽然推理过程可能引入延迟，但 Nemotron 模型通过将推理链压缩为简洁摘要来限制输出令牌数量并提高效率，从而解决了这一问题。这通过两步流程实现，与之前的模型 [Nemotron-Content-Safety-Reasoning-4B](https://huggingface.co/nvidia/Nemotron-Content-Safety-Reasoning-4B) 类似。第一步，我们使用更大的、更强大的模型（如 Qwen 397B）基于提供的提示、图像和响应生成思维链推理轨迹。我们还提供了样本的真实标签，以避免任何可能进入推理轨迹的错误分类。第二步，我们使用另一个大型模型（如 Qwen 80B）使这些推理轨迹更加简洁。我们特别指示该模型重新表述原始轨迹（来自第一步），使其不超过 3 句话。根据我们的实验，生成的绝大多数推理轨迹都在 3 句话以内。

高效的推理轨迹优化使得低延迟的自定义策略执行成为可能。此外，推理轨迹还提供了宝贵的训练信号，可用于训练专门的审核模型。开发者可以选择双模式操作，在通用任务中禁用推理以实现最小延迟，或在复杂策略中启用推理。

* * *

## [](#training-data)训练数据

驱动 Nemotron 3.5 的数据集是用于 Nemotron 3 的多模态、多语言混合数据的演进版本，并新增了针对推理和自定义策略能力的数据。我们使用了以下数据来源：

-   **多语言文本安全数据** 来自 [Nemotron Safety Guard Dataset v3](https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3)，从具有文化细微差别的子集中采样，并在安全类别和安全/不安全划分中按比例分布。
-   **人工标注的多模态数据** 由 NVIDIA 以英语收集，并翻译成 12 种语言。关键在于，**99% 的训练图像是真实照片**——而非合成生成。这直接解决了多模态安全基准领域的一个已知弱点，即 VLGuard 和 MM-SafetyBench 等现有数据集严重依赖 SDXL 生成的图像，这些图像缺乏生产内容的纹理和文化复杂性。虽然由于许可限制，并非所有这些真实图像都能发布，但我们仍能发布来自 Wikimedia 和合成生成的图像子集。
-   **安全多模态数据** 来自 [Nemotron VLM Dataset v2](https://huggingface.co/datasets/nvidia/Nemotron-VLM-Dataset-v2)，涵盖扫描文档、图表、论文和图表及其相关查询——确保模型不会过度标记良性的专业内容。
-   **推理轨迹** 源自较大教师模型（Qwen 397B）生成的思维链输出，然后使用 Qwen 80B 进行精简，用于教授模型如何进行推理。
-   **主题跟随数据** 来自 [CantTalkAboutThis](https://huggingface.co/datasets/nvidia/CantTalkAboutThis-Topic-Control-Dataset) 数据集，包含一系列企业部署场景（医疗、金融、银行、教育等）中的策略规范/判定对。
-   **合成数据** 约占总体训练量的 10%，主要用于多样化越狱模式、生成罕见策略违规示例以及产生多模态对抗性案例。

* * *

## [](#benchmarking)基准测试

Nemotron 3.5 Content Safety 在多语言、多模态和自定义策略安全基准上进行了评估，包括 VLGuard、MM-SafetyBench、PolyGuard、RTP-LX、Aya Redteaming、XSafety、MultiJail、Aegis、Dynaguardrail 和 CoSA。这些评估反映了企业安全的核心生产挑战：在跨全球语言、文本和图像输入以及特定领域策略中应用一致的护栏，同时不显著增加延迟。

Nemotron 3 在多模态有害内容测试中平均准确率达到 84%，延迟约为 LlamaGuard-4-12B 的一半，奠定了坚实的基础。Nemotron 3.5 保持了紧凑的 4B 效率，同时增加了自定义策略支持和推理轨迹。

在多语言和多模态安全基准测试中，Nemotron 3.5 在保持紧凑模型规模的同时，提供了强大的有害内容分类准确性。这一点很重要，因为许多安全模型仍然是英语优先、仅文本或成本过高，无法在生产流程中反复运行。Nemotron 3.5 旨在将多语言覆盖、多模态分类、自定义策略支持和低延迟部署整合到一个模型中。

[![figure1](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/uomUY8i9DOEdH9YfOCCB0.png)](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/uomUY8i9DOEdH9YfOCCB0.png)

*图 1. Nemotron 3.5 Content Safety 在多语言和多模态安全基准测试中提供了强大的有害内容分类准确性，在所评估的基准测试集中平均约为 85%。*

语言层面的结果凸显了多语言安全对全球企业 AI 的重要性。在 Multilingual Aegis 上，Nemotron 3.5 在 12 种语言中的有害内容分类准确率平均为 96.5%。在 RTP-LX 上，平均为 88.8%，Aegis 和 RTP-LX 的综合平均值为 92.7%。这种一致性帮助团队在客户、员工和合作伙伴交互的工作流程中应用相同的安全策略，而不是依赖仅英语的审核或单独的本地安全模型。

[![figure2](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/6vntaUhBuotVodz-9BkaX.png)](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/6vntaUhBuotVodz-9BkaX.png) *图 2. Nemotron 3.5 Content Safety 在 Multilingual Aegis Cultural + Adapted（提示分类）（有害-f1）上，12 种语言的有害内容分类准确率平均为 97%。*

[![figure3](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/w8u_dXJ_iRg3GDRzq5I3-.png)](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/w8u_dXJ_iRg3GDRzq5I3-.png) *图 3. Nemotron 3.5 Content Safety 在 RTPLX（提示分类）（有害-f1）上，12 种语言的有害内容分类准确率平均为 89%。*

仅靠准确性不足以构建生产级防护栏。安全模型还必须足够高效，以便在内容被处理、返回或路由到下游之前运行。Nemotron 3.5 Content Safety 紧凑的 4B 设计有助于降低重复安全检查的成本和延迟，使多语言和多模态防护栏在实际 AI 应用中变得可行。

## [](#latency)延迟

在默认（无 THINK）模式下，延迟特性与 Nemotron 3 保持一致。THINK 模式会增加与推理链长度成比例的推理时间，但这种开销是可预测的，并且可以与同步审核循环分开预算——例如，将 THINK 模式评估作为审计管道的一部分异步运行，而默认模式则处理实时决策。

[![figure4](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/5drKmlTOcLxVobY03RJ7_.png)](https://cdn-uploads.huggingface.co/production/uploads/644c4b804ef896a09019a5b4/5drKmlTOcLxVobY03RJ7_.png) *图 4. 在多模态基准测试中，Nemotron 3.5 Content Safety 的端到端延迟比另一种多模态安全模型低 3 倍。*

与另一种推理安全模型相比，我们的模型在启用推理时生成的令牌数最多减少 50%，从而在成本和延迟方面更具效率。

* * *

## [](#addressing-the-benchmark-gap)应对基准测试差距

多模态安全研究中反复出现的一个主题是现有评估基础设施的差距。Nemotron 3.5 的开发过程中遇到了与更广泛文献中记载的相同差距：

-   **纯文本覆盖**：最广泛引用的安全基准测试（WildGuard、XSTest、HarmBench）都是纯文本的。多模态性能无法从文本基准测试结果中推断出来。
-   **合成图像质量**：现有的多模态基准测试大多使用 AI 生成的图像（通常是 SDXL），而非真实照片，低估了实际生产内容的难度。
-   **真实图像许可**：图库照片许可证禁止在 AI 数据集中重新分发，从而在研究条件与生产条件之间造成了结构性差距。

NVIDIA 的多模态训练数据——包含真实图像和具有文化细微差别的多语言提示——旨在填补模型训练中的部分空白。评估方面的基准测试差距对于更广泛的安全研究社区来说仍然是一个悬而未决的问题。

## [](#getting-started)快速入门

Nemotron 3.5 Content Safety 可在 [Hugging Face](https://huggingface.co/nvidia/Nemotron-3.5-Content-Safety) 上获取，采用 NVIDIA 开放模型许可证，适用于研究和商业用途，同时提供训练 [数据集](https://huggingface.co/datasets/nvidia/Nemotron-3.5-Content-Safety-Dataset)。它支持 transformers、vLLM 和 SGLang，并作为生产级 [NVIDIA NIM](https://nvcr.io/nim/nvidia/nemotron-3.5-content-safety:2.0.5-variant) 在 build.nvidia.com 上提供，适用于需要预打包、GPU 优化推理微服务的团队。

开发者还可以通过推理平台访问该模型，包括 [Baseten](https://www.baseten.co/library/nemotron-3-5-content-safety/)、[Eigen AI](https://www.eigenai.com/blog/2026-06-04-eigenai-delivers-day-0-inference-nvidia-nemotron-3-x-family-ultra-asr-content-safety)、[DeepInfra](https://deepinfra.com/nvidia/Nemotron-Content-Safety-3.5)、[OpenRouter](https://openrouter.ai/nvidia/nemotron-3.5-content-safety:free) 和 [Vultr](https://blogs.vultr.com/nemotron-3-5-content-safety)。

对于自定义策略工作流，NVIDIA 提供了一个与 Claude 和 Codex 兼容的 [技能用于生成自定义策略](https://github.com/NVIDIA-NeMo/Nemotron/tree/main/skills/nemotron-policy-generator)，以及 [展示如何使用该模型的指南](https://github.com/NVIDIA-NeMo/Nemotron/tree/main/usage-cookbook/Nemotron-3.5-Content-Safety)。自定义策略和推理链有助于团队根据特定领域规则调整安全行为，同时保持决策的可审计性。
