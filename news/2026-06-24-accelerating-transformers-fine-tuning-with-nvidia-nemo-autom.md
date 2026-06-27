---
title: Accelerating Transformers Fine-Tuning with NVIDIA NeMo AutoModel
url: >-
  https://huggingface.co/blog/nvidia/accelerating-fine-tuning-nvidia-nemo-automodel
url_hash: 9662972e681ea5f106bc385b1a0945ae79c26803
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-24T16:00:13.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

HuggingFace Transformers 已成为开源 AI 生态系统的基石，而近期发布的 [Transformers v5](https://github.com/huggingface/transformers/releases/tag/v5.0.0) 通过为混合专家（MoE）模型提供一级支持进一步巩固了其地位——MoE 现已成为[前沿模型](https://www.nvidia.com/en-us/glossary/frontier-models/)的主流架构。v5 版本内置了 MoE 基础组件：专家后端、动态权重加载和分布式执行，使 MoE 具备可扩展性且易于构建。

[NVIDIA NeMo AutoModel](https://github.com/NVIDIA-NeMo/Automodel) 是 [NVIDIA NeMo 框架](https://github.com/NVIDIA-NeMo) 的一部分，是一个用于大规模构建自定义生成式 AI 模型的开源库。NeMo AutoModel 直接构建于 v5 之上，新增了专家并行（Expert Parallelism）、DeepEP 融合全对全调度以及 TransformerEngine 内核，并利用 v5 的动态权重加载将这些优化应用于广泛且不断增长的模型家族。其成果是：在微调 MoE 模型时，相比原生 Transformers v5，**训练吞吐量提升 3.4-3.7 倍**，**GPU 内存减少 29-32%**，且使用相同的 from\_pretrained() API：仅需更改一行导入代码，无需其他代码改动。

本文详细介绍了这种组合的工作原理，以及用户如何在不更改 API 的情况下更快地微调 MoE 模型。

## [](#background)背景

MoE 模型的兴起给高效训练带来了新的挑战：跨数百个专家路由令牌、将专家矩阵乘法融合为单个内核、跨 GPU 分片权重、以及重叠通信与计算——所有这些都需要通用库开箱即用之外的基础设施支持。

[Transformers v5](https://github.com/huggingface/transformers/releases/tag/v5.0.0)（简称“v5”）引入了 MoE 的一级支持，例如[专家后端](https://huggingface.co/docs/transformers/en/experts_interface)、[动态权重加载](https://huggingface.co/docs/transformers/en/weightconverter)以及用于分布式执行的张量并行方案。此外，v5 通过将 PyTorch 的 DeviceMesh 直接集成到 from\_pretrained() 中，使分布式训练成为一级特性。

[NeMo AutoModel](https://github.com/NVIDIA-NeMo/Automodel) 通过继承 AutoModelForCausalLM，并添加专家并行（EP）、DeepEP 融合全对全调度和 TransformerEngine 内核，构建于 v5 之上。DeepEP 是 v5 尚未具备的功能：它实现了通信与专家计算的重叠。由于 NeMo AutoModel 利用 v5 的可逆权重转换来加载每个模型，因此它可以将工程精力集中在这些可复用的核心操作上，而不是每个模型的检查点适配工作，同时 save\_pretrained() 仍然输出标准的 HF 检查点，vLLM 和 SGLang 等工具可以直接加载。

下一节将介绍两者如何协同工作，以及我们测量到的性能提升，范围涵盖从跨 16 个节点全微调 [NVIDIA Nemotron 3 Ultra 550B A55B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16) 到单节点模型（如 Qwen3-30B-A3B 和 [Nemotron 3 Nano 30B A3B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)）。

## [](#nemo-automodel-same-api-more-performance)NeMo AutoModel：相同 API，更强性能

NeMo AutoModel 的目标之一是与 HuggingFace Transformers 保持 API 兼容性，以支持开源社区。NeMoAutoModelForCausalLM 继承自 AutoModelForCausalLM，因此任何适用于 HF 模型的代码也同样适用于 AutoModel。

以下是在两者中加载模型的示例。仅导入语句不同：

[![nemo\_and\_hf](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/VTPq2Wp-RrEcP1eGUJxao.png)](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/VTPq2Wp-RrEcP1eGUJxao.png)

这一行导入代码承担了大量工作。对于Qwen3、[NVIDIA Nemotron](https://developer.nvidia.com/nemotron)、GPT-OSS和DeepSeek V3等流行的MoE架构，NeMo AutoModel提供了[手工调优的实现](https://github.com/NVIDIA-NeMo/Automodel/blob/main/nemo_automodel/_transformers/registry.py)，集成了TransformerEngine注意力机制、融合线性层和自定义专家内核。对于其他架构，它会回退到原生HF，同时仍应用[Liger内核](https://github.com/linkedin/Liger-Kernel)补丁等优化。无论走哪条路径，生成的模型都具备可扩展性：传入device\_mesh即可实现多GPU训练，无需额外重写。

NeMo AutoModel的真正优势在于将MoE模型扩展到多GPU训练。要在8个GPU上使用专家并行训练[Nemotron 3 Nano 30B A3B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)，只需添加分布式网格配置：

```
import os
import torch
import torch.distributed as dist
from nemo_automodel import NeMoAutoModelForCausalLM
from nemo_automodel.recipes._dist_utils import create_distributed_setup_from_config

dist.init_process_group(backend="nccl")
torch.manual_seed(0)
torch.cuda.set_device(int(os.environ.get("LOCAL_RANK", 0)))

dist_setup = create_distributed_setup_from_config(
    {
        "strategy": "fsdp2",
        "ep_size": 8,
    },
)

model = NeMoAutoModelForCausalLM.from_pretrained(
    "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16",
    dtype=torch.bfloat16,
    distributed_setup=dist_setup,
)

dist.destroy_process_group()
```

通过一次from\_pretrained()调用，即可获得FSDP2、专家并行、TransformerEngine内核和DeepEP调度带来的速度、可扩展性和内存优化。

## [](#performance-comparison)性能对比

我们在两种场景下评估了NeMo AutoModel：在16个节点上对前沿规模的550B模型进行全参数微调，以及在单个节点上训练两个30B MoE模型。550B的结果展示了专家并行在大规模训练中的必要性；30B的结果则量化了相比Transformers v5的每GPU加速比。

### [](#nemotron-3-ultra-550b-a55b-full-fine-tune-multi-node)Nemotron 3 Ultra 550B A55B（全参数微调，多节点）

[Nemotron 3 Ultra 550B A55B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16)是一个550B参数的混合模型，集成了Mamba2、LatentMoE和多令牌预测（MTP）。我们对其进行了**全参数微调**基准测试：更新所有参数并实例化Adam优化器状态，在此规模下需要**16个H100节点（128个GPU）**。

**方法：**

| 参数 | 值 |
| --- | --- |
| 硬件 | 16x H100 80GB（128个GPU） |
| 专家并行 | EP=64 |
| 本地批次大小 | 2 |
| 序列长度 | 4,096 |
| 特性 | MTP、激活检查点、融合线性交叉熵 |
| 内核 | DeepEP调度 + torch\_mm专家 + TransformerEngine |

| 指标 | NeMo AutoModel（EP=64） |
| --- | --- |
| TPS/GPU（平均） | 815 |
| TFLOP/s/GPU | ~293 |
| 峰值内存 | 58.2 GiB |

**为何没有Transformers v5列。** Transformers v5在此规模下会内存溢出，因此无法报告v5的数据。AutoModel的专家并行将专家分片到多个GPU上，从而将内存占用控制在预算内，使得全参数微调得以运行。下面的30B对比展示了v5可运行时的相同优势。

### [](#single-node-30b-moe-benchmarks)单节点30B MoE基准测试

我们在单个节点（8x H100 80GB GPU）上对三种方法进行了基准测试：HF Transformers v4（Hub代码）、HF Transformers v5（启用最佳可用优化）和NeMo AutoModel（EP=8 + 自定义内核）。

**方法：**

| 参数 | 值 |
| --- | --- |
| 硬件 | 8x H100 80GB（单节点） |
| 序列长度 | 4,096 |
| 本地批次大小 | 1 |

**关于路由门的说明。** 下方 NeMo AutoModel 的数据采用平衡路由门，该机制强制令牌在专家间均匀分布。这模拟了 MoE 训练所追求的*理想*运行点：一个训练良好的模型，其负载均衡损失会使专家利用率趋近均匀，因此平衡路由反映了真实工作负载收敛后的稳态（同时消除了随机虚拟令牌在专家并行中注入的掉队噪声）。v4/v5 版本则使用原生路由器处理相同的虚拟令牌。因此，平衡门衡量的是 NeMo AutoModel 在其目标 MoE 运行点上的表现，而 v4/v5 列反映的是其开箱即用的行为。

[![nemo\_automodel\_blog\_chart\_mockup\_v5](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/rbCVgV6a18c4UcDsiWfZN.png)](https://cdn-uploads.huggingface.co/production/uploads/690d0a6c2c5acfe0e1f4777d/rbCVgV6a18c4UcDsiWfZN.png)

### [](#qwen3-30b-a3b)Qwen3-30B-A3B

| 指标 | v4 | v5 (FA2 + grouped\_mm) | NeMo AutoModel (EP=8) | v5 → NeMo AutoModel |
| --- | --- | --- | --- | --- |
| TPS/GPU (平均) | 死锁 | 3,075 | 11,340 | **3.69倍** |
| 峰值内存 | — | 68.2 GiB | 48.1 GiB | **\-29%** |
| 平均前向+损失 | — | 582 毫秒 | 194 毫秒 | 3.00倍 |
| 平均反向 | — | 758 毫秒 | 178 毫秒 | 4.26倍 |

**v4 死锁原因：** Transformers v4 将 Qwen3 MoE 专家存储为包含 128 个独立 MLP 模块的 ModuleList，每个模块单独进行 FSDP 封装。前向传播使用数据依赖的循环，仅迭代接收了令牌的专家。由于不同 rank 的数据不同，不同 rank 会跳过不同的专家，导致 FSDP AllGather/ReduceScatter 集合操作不匹配，从而无限挂起。Transformers v5 通过将专家存储为融合的 3D 参数张量（无逐专家模块，无逐专家 FSDP 集合操作）修复了此问题。

### [](#nemotron-3-nano-30b-a3b)Nemotron 3 Nano 30B A3B

| 指标 | v4 (hub 代码) | v5 (FA2 + grouped\_mm + Mamba CUDA) | NeMo AutoModel (EP=8) | v5 → NeMo AutoModel |
| --- | --- | --- | --- | --- |
| TPS/GPU (平均) | 1,807 | 4,583 | 15,421 | **3.36倍** |
| 峰值内存 | 61.9 GiB | 62.1 GiB | 42.5 GiB | **\-32%** |
| 平均前向+损失 | 1,024 毫秒 | 283 毫秒 | 109 毫秒 | 2.60倍 |
| 平均反向 | 1,246 毫秒 | 611 毫秒 | 157 毫秒 | 3.89倍 |

**v4 配置：** trust\_remote\_code=True（NVIDIA 的 hub 建模代码）。hub 代码的专家循环是 FSDP 安全的（无论令牌分配如何，都会迭代所有专家），因此不会像 Qwen3 v4 那样死锁。

### [](#where-the-speedup-comes-from)加速来源

NeMo AutoModel 相比 Transformers v5 的 3.4-3.7 倍加速来自三个方面：

1.  **专家并行降低内存压力。** EP=8 将专家权重分布到多个 GPU 上，使每个 GPU 的 MoE 内存占用减少 8 倍。对于 Qwen3，这使峰值内存从 68.2 GiB 降至 48.1 GiB（-29%）。对于 Nemotron Nano，则从 62.1 GiB 降至 42.5 GiB（-32%），为更大的批次大小或更长的序列腾出了空间。

2.  **DeepEP 融合通信与计算。** DeepEP 不再使用独立的 AllGather/ReduceScatter 集合操作进行专家路由，而是将令牌分发与合并融合到优化的 GPU 内核中，使通信与专家计算重叠。

3.  **TransformerEngine 内核加速核心运算。** TE 的融合注意力、线性层和 RMSNorm 实现，在所有层类型（不仅仅是 MoE 层）上，都比其 PyTorch/Flash Attention 对应实现提供了一致的加速效果。

## [](#transformers-v5-features-leveraged-by-huggingface-automodel)HuggingFace AutoModel 利用的 Transformers v5 特性

### [](#专家后端)专家后端

Transformers v5 中最具影响力的特性之一是 [experts\_implementation](https://huggingface.co/docs/transformers/en/experts_interface) 参数，它包含三个专家后端：

| 后端 | 描述 | 最佳适用场景 |
| --- | --- | --- |
| eager | 对选定的专家进行 for 循环 | 调试、兼容性和正确性验证。v4 版本也可用。 |
| batched\_mm | 复制专家参数，通过 torch.bmm 执行单个批处理 GEMM | 小规模输入，配合 torch.compile 速度快。v5 新增。 |
| grouped\_mm | 按专家对 token 排序，通过 torch.nn.functional.grouped\_mm 执行单个分组 GEMM | 训练（内存高效，无参数复制）。v5 新增。 |

grouped\_mm 后端是关键的训练优化：它不再逐个循环专家，而是将 token 按其分配的专家排序，并执行单个融合的分组矩阵乘法。

NeMo AutoModel 更进一步。对于具有自定义实现的模型，它使用 DeepEP 融合的全对全调度，结合分组 GEMM 内核和 TransformerEngine 线性层。其演进过程如下：

```
v4 (eager for循环) → v5 (grouped_mm) → NeMo AutoModel (DeepEP + GMM + TE)
```

在 NeMo AutoModel 中，专家后端通过 BackendConfig 进行配置：

```
from nemo_automodel.components.models.common.utils import BackendConfig

backend = BackendConfig(
    attn="te",           # TransformerEngine 注意力
    linear="te",         # TransformerEngine 线性层
    experts="torch_mm",  # 分组专家矩阵乘法
    dispatcher="deepep", # DeepEP 融合全对全
)
```

## [](#专家并行与-deepep)专家并行与 DeepEP

Transformers v5 还附带了一个[专家并行路径](https://huggingface.co/docs/transformers/en/expert_parallelism)。它将专家权重分片到多个 GPU 上。[GroupedGemmParallel](https://github.com/huggingface/transformers/blob/v5.10.2/src/transformers/integrations/tensor_parallel.py#L1078) 风格仅加载每个设备本地的专家，而 [RouterParallel](https://github.com/huggingface/transformers/blob/v5.10.2/src/transformers/integrations/tensor_parallel.py#L1123) 则路由 token 并通过 all\_reduce 合并结果。它巧妙地构建在 v5 现有的张量并行机制之上。启用它会使模型的 tp\_plan 返回其[专家计划](https://github.com/huggingface/transformers/blob/v5.10.2/src/transformers/modeling_utils.py#L1448)，因此专家并行与数据并行共享设备预算（ep × dp = world\_size）。对于此处单节点 30B 的基准测试，我们发现纯数据并行的 v5（dp=8, ep=1）是最快的 v5 配置，因此我们报告的是该 v5 设置。

NeMo AutoModel 采用了一种针对多 GPU MoE 训练优化的互补方法。它将 EP 作为其自身的并行维度，一个专用的 moe\_mesh，与数据并行网格并列（而非从中划分），并使用 PyTorch 的 DTensor 与 Shard(0)。由于专家网格与数据并行正交，因此两者可以在同一设备上组合。在 8 个 GPU 上，NeMo AutoModel 同时运行 ep=8 和 dp=8，因此每个 GPU 都在自己的数据分片上训练，同时仅持有 1/8 的专家。专家权重在 GPU 之间沿着专家维度进行物理分片。

```
# 来自 nemo_automodel/components/moe/parallelizer.py
from torch.distributed.tensor import Shard, distribute_tensor

# 每个 GPU 仅持有 1/ep_size 的专家权重
distribute_tensor(param, device_mesh, [Shard(0)])
```

在8块GPU上设置ep\_size=8时，每块GPU仅持有1/8的专家参数。对于像Nemotron-3-Nano-30B-A3B这样专家权重约55 GiB的模型，专家并行（EP）将每块GPU的专家内存占用从约55 GiB降至约6.8 GiB，使得在仅使用FSDP会内存不足的情况下也能进行训练。

在EP基础上，NeMo AutoModel集成了[DeepEP](https://github.com/deepseek-ai/DeepEP)，它将令牌路由融合到优化的GPU内核中，并与分组专家计算的分组GEMM结合使用时，可显著提升速度。在我们的[大规模MoE基准测试](https://github.com/NVIDIA-NeMo/Automodel/discussions/916)中，与all-gather加循环专家基线相比，DeepEP加分组GEMM在完整的DeepSeek V3 671B模型上将每次迭代的成本降低了47%。

### [](#dynamic-weight-loading)动态权重加载

Transformers v5还通过WeightConverter和WeightRenaming引入了[动态权重加载](https://huggingface.co/docs/transformers/en/weightconverter)系统。这使得MoE检查点可以以融合的3D张量形式存储，从而实现更高效的执行。WeightConverter应用可组合的操作，在from\_pretrained()过程中即时转换检查点张量。

NeMo AutoModel是此v5 API的直接使用者。超过[20种模型类型](https://github.com/NVIDIA-NeMo/Automodel/blob/main/nemo_automodel/components/checkpoint/conversion_mapping.py)通过MODELS\_REQUIRING\_TENSOR\_MERGING使用此机制，包括Mixtral、Qwen2 MoE、Qwen3 MoE、DeepSeek V2/V3、OLMoE等。转换是完全可逆的：save\_pretrained()生成标准的HF格式检查点，任何下游工具都可以加载。

## [](#getting-started)快速开始

要试用NeMo AutoModel，请访问我们的官方文档页面[快速开始](https://docs.nvidia.com/nemo/automodel/latest/get-started/installation)。

更多详情，请参阅：

-   [NeMo AutoModel HuggingFace API兼容性指南](https://docs.nvidia.com/nemo/automodel/latest/get-started/hf-compatibility)
-   [NeMo AutoModel模型覆盖范围](https://docs.nvidia.com/nemo/automodel/latest/model-coverage/overview)
-   [NeMo AutoModel性能摘要](https://docs.nvidia.com/nemo/automodel/latest/performance/performance-summary)
-   [HuggingFace上的NeMo AutoModel](https://huggingface.co/docs/transformers/en/community_integrations/nemo_automodel_finetuning)

## [](#conclusion)结论

NVIDIA NeMo AutoModel是HuggingFace用户扩展模型训练规模的自然下一步。通过直接构建在Transformers v5之上，AutoModel提供了零摩擦的升级路径：更改一行导入代码，即可获得速度提升超过三倍的模型实例。

在Qwen3-30B-A3B和Nemotron 3 Nano 30B-A3B上，与最佳Transformers v5配置相比，训练吞吐量提升了3.4-3.7倍，GPU内存减少了29-32%。由于真正的专家并行（EP）将专家分片到多个GPU上，同样的路径可以扩展到在16个节点上对像Nemotron 3 Ultra这样的550B模型进行全参数微调——这正是专家并行对于将模型装入内存至关重要的场景。由于NeMo AutoModel检查点是标准的HF格式safetensors，您可以将其部署在vLLM和SGLang等推理框架上。

代码、配置和基准测试脚本均可在[NeMo AutoModel仓库](https://github.com/NVIDIA-NeMo/Automodel/tree/blog/transformers-v5-automodel/blog_experiments)中找到。

## [](#acknowledgements)致谢

本工作的核心贡献者（按姓氏字母顺序排列）：Adil Asif、Hemil Desai、Alexandros Koumparoulis和Huiying Li。
