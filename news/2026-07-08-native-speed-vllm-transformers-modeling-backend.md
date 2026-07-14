---
title: Native-speed vLLM transformers modeling backend
url: 'https://huggingface.co/blog/native-speed-vllm-transformers-backend'
url_hash: f2a3364a10eb9acc95cebb72e580c38287a93cea
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-08T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Harry Mellor 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/ov-55uEKP4mJhavhdQ42x.png)](https://huggingface.co/hmellor)

[![Lysandre 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/5e3aec01f55e2b62848a5217/PMKS0NNB4MJQlTSFzh918.jpeg)](https://huggingface.co/lysandre)

**TL;DR**：对于许多 LLM 架构，transformers vLLM 后端现在与自定义 vLLM 实现速度相当（甚至更快）。模型作者可以自动利用其 transformers 实现，免费获得超快的 vLLM 推理性能。

```
# 升级 vllm pip 包
uv pip install --upgrade vllm --torch-backend auto
```

transformers 库已成为机器学习的**参考建模库**。它通过一致的 API 支持 450 多种架构，其设计主要目标是模型实现*自包含*且*易于理解*。阅读 transformers 代码有助于贡献者轻松了解架构的工作原理，然后将其移植到其他框架，如 vLLM、SGLang、MLX、llama.cpp 等。

我们完全接受了生态系统中的这一角色，并投入大量精力使其更易用。朝着这个方向迈出的一大步是去年将 transformers 作为建模后端集成到 vLLM 中。这使得模型作者无需移植任何代码，即可在 vLLM 中运行 transformers 模型（包括 LLM 和 VLM）。Transformers 提供建模代码，而 vLLM 提供高度优化的推理技术，如连续批处理和自定义注意力内核。

现在，这一集成变得更好 🚀！

## [](#showcase)成果展示

我们将 vLLM 的 transformers 建模后端与 vLLM 手写的原生实现进行了对比，测试了三种截然不同的 Qwen3 模型：

-   单 GPU 上的 4B 密集模型
-   张量并行下的 32B 密集模型
-   同一 8×H100 节点上，采用数据并行 + 专家并行的 235B 参数 FP8 混合专家模型

| [![PR 前后 transformers vllm 后端的基准测试对比](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/pre-post-pr.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/pre-post-pr.png) |
| --- |
| 结果：transformers 建模后端现在在每一个模型上都**达到或超越**了原生吞吐量。 |

通过 transformers 建模后端运行任何\* Hugging Face 模型只需一个标志——`--model-impl transformers`。它可与常用的并行选项组合使用，因此您的服务设置无需任何更改：

```
# Qwen3-4B 密集模型，单 GPU
vllm serve Qwen/Qwen3-4B --model-impl transformers

# Qwen3-32B 密集模型，2 GPU 张量并行
vllm serve Qwen/Qwen3-32B --model-impl transformers --tensor-parallel-size 2

# Qwen3-235B-A22B-FP8 MoE，8 GPU 数据并行 + 专家并行
vllm serve Qwen/Qwen3-235B-A22B-FP8 --model-impl transformers --data-parallel-size 8 --enable-expert-parallel
# 如果节点内存受限，请添加 --max-model-len 8192
```

*\*使用线性注意力的模型目前不受支持，但很快会支持！代码位于 Hub 仓库中的自定义模型不太可能正常工作，因为它们可能没有按照兼容性要求编写。*

### [](#how-we-measured)测量方法

每个模型在三种条件下进行比较，除代码路径外，其他所有条件完全相同：

1.  **原生** — `--model-impl vllm`，vLLM 手写模型（待匹配的基准）
2.  **之后** — `--model-impl transformers` *包含*该 PR
3.  **之前** — `--model-impl transformers` *不包含*该 PR

完整且可复现的运行脚本可在此处获取：[`benchmark.sh`](https://huggingface.co/datasets/ariG23498/useful-scripts/blob/main/transformers-backend-vllm-benchmark.sh)

## [](#so-whats-new)那么，有什么新变化？

vLLM 的 transformers 建模后端过去主要将*注意力机制*视为推理的瓶颈。通过在运行时接入 vLLM 的注意力实现，我们可以让 transformers 模型在 vLLM 引擎内高效运行。但部署涉及众多维度，只有通过定制移植才能实现极致推理性能。跨 GPU 并行化、编译、融合内核以及更多技术，共同助力充分利用硬件实现超快推理。

| [![新模型集成到 transformers 和 vLLM](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/previous-pipeline.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/previous-pipeline.png) |
| --- |
| 过去，新模型需要分别集成到 transformers 和 vLLM，并附带自定义优化 |

当模型作者追求极致性能时，他们仍需编写自定义的 vLLM 实现。

| [![新模型集成到 transformers，即可在 vLLM 中使用](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/current-pipeline.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-backend/current-pipeline.png) |
| --- |
| 新模型一旦集成到 transformers，即可立即在 vLLM 中以原生 vLLM 实现的速度运行 |

最新版本的 vLLM transformers 建模后端会在运行时动态应用推理特定的层融合，以匹配自定义代码实现的速度，适用于兼容的架构。

## [](#how-does-it-work)它是如何工作的？

vLLM 的 transformers 建模后端现在使用 `torch.fx` 对模型的计算图进行静态分析。此过程会搜索可优化的已知模式。识别出任何模式后，它会利用 ast（抽象语法树）来操作源代码并就地重写部分操作。

**我们能通过这个实现什么？**

-   将多对一映射到（超）优化 vLLM 内核的融合操作，例如用于混合专家（MoE）模型中专家并行化（EP）的内核。
-   其他主要的融合操作包括 vLLM 的 `MergedColumnParallelLinear` 和 `QKVParallelLinear`。这些模块使我们能够推断 TP（张量并行）的并行方案。如果解码器模块列表易于识别，也可以推断 PP（流水线并行）方案。
-   经过操作后的模型仍然完全可（torch）编译，能够通过 `torch.compile` 和 CUDA Graphs，与专用的 vLLM 模型实现完全相同。
-   与 vLLM 模型实现不同，Transformers 模型实现可用于**训练**。因此，你可以使用相同的模型代码进行训练/评估/强化学习部署。

如上所示，对于兼容模型，这实现了原生 vLLM 推理速度，而无需编写一行代码来优化推理模型。

> 我们正在撰写一篇详细的博文，深入探讨这些优化的推理方法，并详细解释我们如何操作模型以适应这些方法。

## [](#resources)资源

-   [Transformers 模型定义](https://huggingface.co/blog/transformers-model-definition#a-model-definition-library)
-   [vLLM 中的 Transformers 建模后端](https://vllm.ai/blog/2025-04-11-transformers-backend)
-   [大规模服务](https://vllm.ai/blog/2025-12-17-large-scale-serving)
-   [Torch FX](https://docs.pytorch.org/docs/2.12/fx.html)
-   [抽象语法树](https://docs.python.org/3/library/ast.html)
