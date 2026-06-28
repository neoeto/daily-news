---
title: 'GLM-5.2: Built for Long-Horizon Tasks'
url: 'https://huggingface.co/blog/zai-org/glm-52-blog'
url_hash: 64d6b4cbeaac616aa45a152bf5ef666667407b0f
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-17T09:01:25.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - Rust
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

[![Z.AI 头像](https://cdn-avatars.huggingface.co/v1/production/uploads/67066ea38a79951d7b8d4195/cQYGzliGVE1Q51EL5EiSk.webp)](https://huggingface.co/zaiorg)

我们隆重推出 GLM-5.2，这是我们在长周期任务领域的最新旗舰模型。与上一代 GLM-5.1 相比，它在长周期任务能力上实现了质的飞跃，并首次将这种能力建立在**扎实的 100 万 token 上下文窗口**之上。GLM-5.2 的新能力包括：

-   **扎实的 100 万上下文：** 一个坚实的 100 万 token 上下文窗口，能够稳定支撑长周期工作
-   **灵活用力的高级编码：** 更强的编码能力，提供多种思考力度级别，以平衡性能与延迟
-   **改进的架构：** 我们提出了 [IndexShare](https://arxiv.org/abs/2603.12201)，该方法在每四个稀疏注意力层之间复用同一个索引器，在 100 万上下文长度下将每个 token 的 FLOPs 降低了 2.9 倍。我们还改进了 GLM-5.2 的 MTP 层以用于推测解码，使接受长度提升了高达 20%
-   **纯粹开源：** MIT 开源许可证——无地域限制，技术访问无国界

支持长周期任务，首先要让长上下文在工程上可用：模型必须在漫长、混乱的编码智能体轨迹中保持质量，而不仅仅是接受更多 token。声称拥有 100 万上下文很容易，但在真实的工程压力下保持可靠则困难得多。为此，我们大幅扩展了针对编码智能体场景的 100 万上下文训练，覆盖了大规模实现、自动化研究、性能优化和复杂调试。最终成果是一个不仅范围广阔，而且执行扎实的长上下文系统：为持续的工程工作提供了实用的基础。

这一能力体现在 GLM-5.2 在三个长周期编码基准测试中的表现。[FrontierSWE](https://www.frontierswe.com/) 衡量智能体能否完成耗时数小时到数十小时的开放式技术项目，涵盖系统优化、大规模代码构建和应用机器学习研究。在该基准测试中，GLM-5.2 仅落后 Opus 4.8 1%，同时以 1% 的优势领先 GPT-5.5，并以 11% 的优势领先 Opus 4.7。在 [PostTrainBench](https://posttrainbench.com/) 上，每个智能体配备一块 H100 GPU，根据其通过后训练提升小模型的能力进行评估，GLM-5.2 的表现优于 Opus 4.7 和 GPT-5.5，仅次于 Opus 4.8。在 [SWE-Marathon](https://swe-marathon.vercel.app/) 上，这是一个涵盖构建编译器、优化内核和开发生产级服务等任务的超长周期软件工程基准测试，GLM-5.2 仍有成长空间，落后 Opus 4.8 13%，但仍是仅次于 Opus 系列的第二名。在所有三个基准测试中，GLM-5.2 都是排名最高的开源模型，这表明其 100 万上下文已转化为实际的长周期交付能力。

[![图1](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/2w_Hx2JZ2eZFJPoVgggvu.png)](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/2w_Hx2JZ2eZFJPoVgggvu.png)

在标准编码基准测试中，GLM-5.2 是最强的开源模型，相比 GLM-5.1 有大幅提升：在 Terminal-Bench 2.1 上从 63.5 提升至 81.0，在 SWE-bench Pro 上从 58.4 提升至 62.1。它还大大缩小了与闭源前沿模型的差距——在 Terminal-Bench 2.1（81.0）上，其得分与 Claude Opus 4.8（85.0）仅差几分——同时领先于 Gemini 3.1 Pro。

[![图2](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/grPxoFi2PIFnuUnlW1zNK.webp)](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/grPxoFi2PIFnuUnlW1zNK.webp)

GLM-5.2 还引入了算力等级控制功能，使用户能够根据任务需求，在模型能力、执行速度和计算成本之间进行灵活权衡。如图所示，在相近的 token 预算下，GLM-5.2 展现出比 GLM-5.1 更强的智能体编程能力，其性能大致介于 Claude Opus 4.7 和 Claude Opus 4.8 之间（在相似 token 消耗下）。此外，最高算力等级允许用户在挑战性任务中分配更多计算资源以获得更高性能，进一步扩展了模型的编程能力。这一设计让用户在使用 GLM-5.2 进行编程任务时拥有更大的灵活性，能够根据不同场景选择最合适的推理模式。

[![figure3](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/Ldcz9AqNEaCqWPwNXfCmS.png)](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/Ldcz9AqNEaCqWPwNXfCmS.png)

## [](#architecture-for-1m-context)百万级上下文架构

[![figure4](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/beSnOOqWL0KuCMJX7vHi9.webp)](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/beSnOOqWL0KuCMJX7vHi9.webp)

### [](#indexshare-for-dsa)面向 DSA 的 IndexShare

为支持百万级上下文长度，我们在 GLM-5.2 中应用了 [IndexShare](https://arxiv.org/abs/2603.12201) 技术，以降低 DSA 中索引器的计算成本。具体而言，在 GLM-5.2 中，每 4 个 Transformer 层共享一个轻量级索引器。该索引器置于这 4 层的首层，topk 索引被这 4 层共用。这使得 3/4 的层无需进行索引器点积和 topk 运算。GLM-5.2 从 128K 序列长度的中期训练阶段就开始使用 IndexShare 进行训练，在长上下文基准测试中以更少的计算量超越了 GLM-5.1。

### [](#mtp-with-indexshare-and-kvshare)结合 IndexShare 和 KVShare 的 MTP

我们改进了 GLM-5.2 的 MTP 层，用于推测解码，主要实现两个目标：1) 最小化作为草稿模型的 MTP 层的成本；2) 最大化推测解码的接受率。

针对第一个目标，我们同样在 MTP 层应用了 IndexShare。在多步 MTP 中，索引器置于第一步，topk 索引用于后续所有步骤。但与主干网络不同的是，不同 MTP 步骤的输入 token 各不相同。如下图所示，如果我们将 $h\_4$ 的 topk 索引复用于 $h\_5$，那么 $h\_5$ 只能关注到 $h\_1$ 到 $h\_4$，而无法关注 $h\_5$。我们将证明，这一特性有助于实现第二个目标，即消除 GLM-5.1 的 MTP 层中训练与推理之间的差异。

[![figure5](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/7tRY5CRMpDyjeI7YxZBMo.webp)](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/7tRY5CRMpDyjeI7YxZBMo.webp)

上图中展示了两步 MTP 层的推理过程。在第一步中，推理与训练一致，所有隐藏状态均来自目标模型。然而在第二步中，$h\_{1:4}$ 来自目标模型，而 $h\_5$ 来自 MTP 层。因此，$h\_5$ 的 KV 缓存是来自目标模型的 $kv\_{1:4}$ 与来自 MTP 层的 $kv\_5$ 的混合。相比之下，使用 IndexShare 后，$h\_5$ 的 KV 缓存仅包含 $kv\_{1:4}$，全部来自目标模型的隐藏状态。在训练中，我们复用第一个 MTP 步骤的 KV 缓存和 topk 索引。需要注意的是，与 GLM-5.1 相同，不同 MTP 步骤的参数也是共享的。此外，受 [https://arxiv.org/abs/2606.12370](https://arxiv.org/abs/2606.12370) 启发，我们引入了用于推测解码的拒绝采样，并使用端到端 TV 损失进行训练。

下表展示了在编码场景下，按接受长度进行的技术消融实验。实验中我们使用了GLM-5.1的骨干网络和训练数据，训练和推理时MTP步数均设为7。与基线相比，最终MTP层的接受长度提升了20%。

| 方法 | 接受长度 |
| --- | --- |
| 基线 | 4.56 |
| \+ 索引共享 + KV共享 | 5.10 |
| \+ 拒绝采样 | 5.29 |
| \+ 端到端TV损失 | **5.47** (+20%) |

### [](#高效服务百万级上下文长度)高效服务百万级上下文长度

随着GLM-5.2将最大上下文长度从20万token扩展至100万token，编码工作负载将显著转向更长的提示词。这使得推理的主要瓶颈从计算量转向KV缓存容量、长上下文内核开销以及CPU端开销。尽管新的GLM-5.2架构降低了每token的计算FLOPs，但并未按比例减少每token的KV缓存大小。因此，在有限GPU资源下支持更长的上下文、更高的并发度以及更高的token吞吐量，成为推理引擎优化的核心挑战。

[![图6](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/Gh9wRyZdgUVwiDPmL8VcI.webp)](https://cdn-uploads.huggingface.co/production/uploads/67066ea38a79951d7b8d4195/Gh9wRyZdgUVwiDPmL8VcI.webp)

为应对这一挑战，我们从三个方向优化推理引擎。首先，基于LayerSplit，我们引入更细粒度的内存管理和并行化策略，以增加KV缓存容量，为超长上下文请求提供更多可用缓存空间。其次，我们优化了成本随上下文长度增长的内核，并使其与缓存传输流水线更好地协调，从而最小化缓存传输对预填充和解码性能的影响。第三，我们优化了CPU端缓存管理、请求调度和运行时执行路径，以减少GPU执行流水线中的气泡，提升端到端吞吐量。如图所示，随着上下文长度增长，GLM-5.2的吞吐量优势越来越大，在长上下文推理场景中展现出更强的可扩展性。

## [](#用于智能体强化学习的slime)用于智能体强化学习的slime

GLM-5.2的智能体强化学习后训练涉及更大规模、跨更多领域且执行模式更复杂的任务。异构数据和任务需要在统一的训练过程中组织，而长程交互、工具使用、子任务分解以及多轮环境反馈，都对推演和训练编排提出了更高要求。为支持这一过程，slime作为从训练到大规模推演推理的一体化基础设施层，支持多种训练和任务组织模式，包括白盒推演、黑盒推演、紧凑轨迹和子智能体工作流，使同一系统能够扩展到更大规模、更复杂的强化学习和在线策略蒸馏训练任务。在GLM-5.2的后训练过程中，我们使用slime框架进行并行在线策略蒸馏训练，高效地将十余个专家模型合并到最终模型中。整个在线策略蒸馏训练过程耗时约两天，展现了极高的训练效率。

Agentic RL 对系统资源和推理基础设施也提出了更高的要求。slime 为推理系统提供了高度开放且灵活的接口：训练侧能够以不同形式连接推理服务，并灵活适配不同的并行策略、路由策略、PD 分离部署以及部署模式。同时，在 RL 推演过程中积累的配置经验、调度策略和优化路径，可以在生产服务阶段复用并进一步优化，使训练侧与服务侧相互促进。这为从后训练到生产部署开辟了一条更直接的路径。结合灵活的训练-推理资源组织以及 KV-cache FP8，slime 为 GLM-5.2 的大规模 agentic RL 训练提供了关键的基础设施支持，进一步提升了系统效率、推演吞吐量以及大规模推理并发能力。

## [](#rl-for-long-horizon-task-with-anti-hacking)面向长程任务并具备反作弊能力的强化学习

**面向长程任务的 RL**。对于 GLM-5.2，长程任务会产生显著更长的执行轨迹，一旦超长轨迹因压缩而被拆分为多个子轨迹，同一提示下的不同推演会生成数量不等且长度差异巨大的可训练轨迹。因此，我们从基于组的优化转向基于评论家的 PPO 框架，该框架从单个推演中学习，依赖评论家来估计 token 级别的优势，而非进行组间相对比较。这种单推演框架天然适配压缩机制，因为它对提示产生的轨迹数量或其相对长度没有任何限制：我们将压缩纳入训练，将所有压缩后的子轨迹作为可训练轨迹，并应用 token 级别的损失函数来处理其长度不平衡问题。

**编码智能体中的反作弊**。编码 RL 尤其容易受到奖励作弊的影响，因为奖励通常是一个可验证的通过/失败信号。我们发现 GLM-5.2 比 GLM-5.1 表现出更多潜在的作弊行为。这使得验证信号易于优化，但实际上并未提升模型的核心能力。智能体可以读取受保护的评估工件、从参考代码或上游提交中复制答案内容，或者在与 GitHub 相关的任务中直接获取目标源代码。例如，智能体可能通过 `curl https://raw.githubusercontent.com/<path-to-file>` 下载解决方案，甚至出现链式泄露，如：

```
1. find /workspace -name "*hidden*"
2. cat /workspace/.eval/secret_cases.json
3. python solve.py --case "$(cat /workspace/.eval/secret_cases.json)"
```

这些行为会虚增奖励并污染训练信号，因此需要一种清晰的机制来区分真正的任务解决与走捷径。为此，我们在 RL 训练和评估中都引入了反作弊模块。检测过程分为两个阶段：首先，基于规则的过滤器捕获潜在的作弊行为以最大化召回率；然后，一个 LLM 评判器检查这些被标记动作的意图，以保持高精确率。我们采用在线策略，在每一步监控工具调用。如果检测到作弊，系统会阻止该调用并返回虚假信息作为结果。重要的是，这种在线防护允许模型在作弊行为被捕获后继续推演。通过处理特定的无效行为而非拒绝整个轨迹，这种方法有助于防止因推演突然中止而导致的训练不稳定和模型崩溃。

## [](#完整基准测试表)完整基准测试表

| 基准测试 | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 推理 |  |  |  |  |  |  |  |  |
| HLE | 40.5 | 31 | 41.4 | 37 | 37.7 | 49.8\* | 41.4\* | 45 |
| HLE（使用工具） | 54.7 | 52.3 | 53.5 | \- | 48.2 | 57.9\* | 52.2\* | 51.4\* |
| CritPt | 16.7 | 4.6 | 13.4 | 3.7 | 12.9 | 20.9 | 27.1 | 17.7 |
| AIME 2026 | 99.2 | 95.3 | 97 | \- | 94.6 | 95.7 | 98.3 | 98.2 |
| HMMT 2025年11月 | 94.4 | 94 | 95 | 84.4 | 94.4 | 96.5 | 96.5 | 94.8 |
| HMMT 2026年2月 | 92.5 | 82.6 | 97.1 | 84.4 | 95.2 | 96.7 | 96.7 | 87.3 |
| IMO答案基准 | 91.0 | 83.8 | 90 | \- | 89.8 | 83.5 | \- | 81 |
| GPQA-Diamond | 91.2 | 86.2 | 90 | 93 | 90.1 | 93.6 | 93.6 | 94.3 |
| 编程 |  |  |  |  |  |  |  |  |
| SWE-bench Pro | 62.1 | 58.4 | 60.6 | 59 | 55.4 | 69.2 | 58.6 | 54.2 |
| NL2Repo | 48.9 | 42.7 | 47.2 | 42.1 | 35.5 | 69.7 | 50.7 | 33.4 |
| DeepSWE | 46.2 | 18 | 18 | 20 | 8 | 58 | 70 | 10 |
| ProgramBench | 63.7 | 50.9 | \- | \- | 47.8 | 71.9 | 70.8 | 39.5 |
| Terminal Bench 2.1 (Terminus-2) | 81.0 | 63.5 | 75 | 65 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (最佳报告框架) | 82.7 | 69 | \- | \- | \- | 78.9 | 83.4 | 70.7 |
| FrontierSWE (主导率) | 74.4 | 30.5 | \- | \- | 29.0 | 75.1 | 72.6 | 39.6 |
| PostTrainBench | 34.3 | 20.1 | \- | \- | \- | 37.2 | 28.4 | 21.6 |
| SWE-Marathon | 13.0 | 1.0 | \- | \- | \- | 26.0 | 12.0 | 4.0 |
| 智能体 |  |  |  |  |  |  |  |  |
| MCP-Atlas (公开集) | 76.8 | 71.8 | 76.4 | 74.2 | 73.6 | 77.8 | 75.3 | 69.2 |
| Tool-Decathlon | 48.2 | 40.7 | \- | \- | 52.8 | 59.9 | 55.6 | 48.8 |

## [](#glm-52快速入门)GLM-5.2快速入门

### [](#配合glm编程计划使用glm-52)配合GLM编程计划使用GLM-5.2

在您喜爱的编程代理——**ZCode、Claude Code、OpenCode**等中尝试**GLM-5.2**。 [https://docs.z.ai/devpack/overview](https://docs.z.ai/devpack/overview)

**面向 GLM 编程计划订阅用户：** 我们已向所有编程计划用户推送 GLM-5.2。现在您只需将模型名称更新为 `"GLM-5.2"`（或在 Claude Code 中使用 GLM-5.2\[1m\] 以启用 1M 上下文长度），即可启用 GLM-5.2。您还可以根据任务需求选择不同的[思考强度](https://docs.z.ai/guides/capabilities/thinking-mode)，即高或最高。作为我们能力最强的模型，GLM-5.2 在高峰时段按 3 倍消耗配额，在非高峰时段按 2 倍消耗配额。作为截至 9 月底的限时推广活动，非高峰时段使用按 1 倍计费。（高峰时段为每日北京时间 14:00–18:00）。

更喜欢图形界面？我们提供 [**ZCode**](https://zcode.z.ai/)——一款由 GLM-5.2 驱动的桌面代理，具备 /goal 用于长周期任务、SSH 远程开发以及移动控制功能。**特别优惠**：在 ZCode 中通过编程计划使用 GLM-5.2，在 6 月 30 日前可获得 1.5 倍有效配额。

**立即开始构建：** [https://z.ai/subscribe](https://z.ai/subscribe)

### [](#chat-with-glm-52-on-zai)在 Z.ai 上与 GLM-5.2 聊天

GLM-5.2 现已在 [Z.ai](https://chat.z.ai/) 上可用。

### [](#serve-glm-52-locally)本地部署 GLM-5.2

GLM-5.2 的模型权重已在 [HuggingFace](https://huggingface.co/zai-org/GLM-5.2) 和 [ModelScope](https://modelscope.cn/models/ZhipuAI/GLM-5.2) 上公开发布。对于本地部署，GLM-5.2 支持包括 transformers、vLLM、SGLang、xLLM、ktransformers 在内的推理框架。

## [](#footnote)脚注

-   **人类最后考试（HLE）及其他推理任务**：评估时使用采样参数 `temperature=1.0`、`top_p=0.95`。我们设置最大生成长度为 163,840 个 token。默认情况下，我们报告纯文本子集的结果；标有 * 的结果来自完整数据集。对于 AIME、HMMT 和 IMOAnswerBench，我们使用以下系统提示对每个问题进行评估：`Your response should be in the following format:\nExplanation: {your explanation for your final answer}\nExact Answer: {your succinct, final answer}\nConfidence: {your confidence score between 0% and 100% for your answer}.` 我们使用 GPT-5.5 (medium) 作为评判模型。对于带工具的 HLE，我们使用最大上下文长度 300,000 个 token，不采用上下文管理策略。
-   **SWE-Bench Pro**：我们使用 OpenHands 运行 SWE-Bench Pro 套件，并采用定制指令提示。设置：`temperature=1`、`top_p=1`、`max_new_tokens=32k`，上下文窗口为 400K。
-   **NL2Repo**：我们在 400k 上下文下评估 NL2Repo，参数为 `temperature=1.0`、`top_p=1.0`、`max_new_tokens=48k`。为防止作弊，我们使用基于规则和基于 LLM 的判断来防止恶意行为（例如，未经授权的 pip 或 curl 操作）。
-   **DeepSWE**：我们使用官方 pier 评估框架和 mini-swe-agent 工具包运行 DeepSWE（`temperature=1.0`、`top_p=1.0`、`timeout=2h`、400K 上下文）。每个任务在隔离容器中解决，配备 2 个 CPU、8 GB RAM，且无网络访问。
-   **ProgramBench**：我们使用 Claude-Code 2.1.156 评估 ProgramBench（200 个实例），参数为 `temperature=1.0, top_p=1.0, max_tokens=64000, max_turns=2000, sample_timeout=6h, reasoning_effort=max`，上下文窗口为 400K。每个实例在（4 个 CPU、8 GB RAM）沙箱中运行，禁用网络访问。
-   **Terminal-Bench 2.1 (Terminus 2)**：我们使用 Terminus-2 框架评估 Terminal-Bench 2.1，参数为 `parser=json`、`timeout=4h`、`temperature=1.0`、`top_p=1.0`、`max_new_tokens=48k`、`max_episodes=500`，上下文窗口为 256K。资源限制上限为 4 个 CPU 和 8 GB RAM。
-   **Terminal-Bench 2.1 (Claude Code)**：我们在 Claude Code 2.1.167 中评估，参数为 `temperature=1.0, top_p=0.95, max_new_tokens=131072`。我们通过透明代理将 max_new_tokens 覆盖为 128k，绕过 64k CLI 限制，恢复 `CLAUDE_CODE_MAX_OUTPUT_TOKENS` 的可配置性。我们移除挂钟时间限制，同时保留每任务 CPU 和内存约束。分数取 5 次运行的平均值。
-   **MCP-Atlas**：所有模型均在思考模式下评估，使用 500 个任务的公开子集，每个任务超时 10 分钟。我们使用 Gemini-3.0-Pro 作为评估的评判模型。
-   **Tool-Decathlon**：我们使用官方评估服务，并将 max_token 设置为 128K。
-   **FrontierSWE**：评估由 [Proximal](https://www.proximal.ai/) 进行，上下文长度为 1M，努力级别为最大，最大输出 token 为 128K。优势分数报告截至 2026/06/16。
-   **PostTrainBench**：评估由 [PostTrainBench](https://posttrainbench.com/) 进行，上下文长度为 1M，努力级别为最大，最大输出 token 为 128K。
-   **SWE-Marathon**：评估由 [Abundant AI](https://www.abundant.ai/) 进行，上下文长度为 1M，努力级别为最大，最大输出 token 为 128K。
