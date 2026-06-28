---
title: 'Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP'
url: 'https://huggingface.co/blog/torch-mlp-fusion'
url_hash: 47d05adaf3b5567b68808cb126a7d74754fe064b
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-11T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![博客文章缩略图](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/thumbnail.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/thumbnail.png)

在[本系列的第一部分《PyTorch 性能分析》](https://huggingface.co/blog/torch-profiler)中，我们使用 `torch.add(torch.matmul(x, w), b)` 来学习如何解读 PyTorch 性能分析器的追踪结果。我们还讨论了其他几个相关话题——CPU 调度链、启动开销、开销受限与计算受限场景的区别，以及 `torch.compile` 的一些内部机制。

在第二部分（本篇博客）中，我们更上一层楼。我们将手写的矩阵乘法-加法组合替换为 `nn.Linear`（设置 `bias=True`）。这是每个深度学习模型都会使用的基础构建块。接着，我们堆叠三个这样的层（针对我们的示例），并在其间加入激活函数，形成一个多层感知机（MLP）模块。

> 本篇博客的脚本位于：[`02_linear.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/02_linear.py)、[`03_simple_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_simple_mlp.py) 和 [`03_kernels_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_kernels_mlp.py)。和之前一样，建议在新标签页中打开它们，边阅读边查看代码。我们使用 `NVIDIA A100-SXM4-80GB` GPU 来运行脚本。使用 [Dev Mode with Spaces](https://huggingface.co/docs/hub/spaces-dev-mode) 在 Hugging Face 基础设施上设置 GPU 并实验脚本非常容易。也可以使用 [Hugging Face Jobs pipeline](https://huggingface.co/docs/huggingface_hub/en/guides/jobs) 来运行脚本。

在开始之前，快速回顾两个我们将反复依赖的概念：

1.  GPU **内核** 是一个在 GPU 的多个线程上并行运行的程序。
2.  CPU **调度并启动** 这些内核。你在性能分析器追踪中看到的大部分 PyTorch 开销就是这种调度工作。

## [](#从矩阵乘法-加法到线性层)从矩阵乘法-加法到线性层

`nn.Linear` 是一个模块封装器，封装了我们在[第 1 部分](https://huggingface.co/blog/torch-profiler)中已经分析过的相同矩阵乘法和加法。唯一的区别是它将自己的权重和偏置作为参数拥有，并暴露了一个 PyTorch 用户已经熟悉的 `forward` 方法。

```
# bias=True 将真正模拟我们在系列第一部分中看到的乘法和加法操作
linear_layer = nn.Linear(in_dim, out_dim, bias=True)
y = linear_layer(x)
```

当前的操作可以写成：

```
y = x @ w.T + b
```

其中 `x` 是输入，`w` 是权重，`b` 是偏置。让我们运行 [`02_linear.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/02_linear.py) 并检查性能分析结果。

```
uv run 02_linear.py --batch 1024 --in_dim 32 --out_dim 64
uvx trace-util traces -b traces
```

> [`trace-util`](https://x.com/ariG23498/status/2054811716727517374) 是一个工具，它会将你的追踪结果同步到 [Hugging Face 存储桶](https://huggingface.co/storage)，然后在终端上提供 [Preffeto 链接](https://perfetto.dev/)。

| [![PyTorch 性能分析器追踪 `nn.Linear` 前向传播：CPU 通道上有三个短的 Profile Step 和 `linear_fwd` 注释，GPU 通道上有一个微小的内核，末尾有一个长的 `cudaDeviceSynchronize` 条](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/linear-profile-trace.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/linear-profile-trace.png) |
| --- |
| 图 1：`nn.Linear` 的性能分析器追踪 |

图1展示了线性层前向调用的性能分析跟踪。我们使用与之前跟踪类似的 `schedule` 设置（`wait=1`、`warmup=1`、`active=3`）来跟踪线性层的 `forward` 调用。这就是为什么我们在 CPU 和 GPU 通道中看到三个性能分析步骤的原因。

### [](#转置操作在做什么)转置操作在做什么？

| [![放大后的 CPU 调度链显示，在 aten::linear 内部的 aten::addmm 之前嵌套了 aten::t 转置操作，但 GPU 通道上没有匹配的活动](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/transpose-cpu-dispatch.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/transpose-cpu-dispatch.png) |
| --- |
| 图2：转置的 CPU 行 |

如果放大性能分析跟踪（如图2所示），我们会注意到在 `aten::addmm`（乘加）操作之前有一个 `aten::t`（转置）操作。我们可以推断出 `nn.Linear` 会转置权重参数，然后将其与输入相乘。这就是我们看到 `aten::t` 操作的原因。

需要注意的重要一点是，`aten::t` 实际上并不会复制或重新组织数据：它只是在 CPU 上重写张量元数据（形状和步长）来表示转置后的矩阵。它不会在 GPU 上启动内核。可以通过两种方式验证这一点：查看跟踪中的 GPU 通道，或者检查性能分析表中的 `aten::t` 行及其在 CUDA 上花费的时间。

### [](#为什么没有独立的-mul-和-add-内核)为什么没有独立的 `mul` 和 `add` 内核？

| [![线性层的性能分析跟踪，突出显示了调度链，显示 aten::linear、aten::t 和 aten::addmm，但没有单独的 aten::add 操作](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-aten-add.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-aten-add.png) |
| --- |
| 图3：线性层的性能分析中没有 `aten::add` |

如图3所示，线性层的调度链中没有 `aten::add`（偏置加法）。这是因为偏置加法已被*折叠*到矩阵乘法内核中，使用了所谓的**尾声**（epilogue）。

**尾声**是 GEMM（通用矩阵乘法）内核在最后执行的一个小型计算，就在它将结果写回 HBM（高带宽内存，GPU 的主内存）之前。添加偏置、应用激活函数或按常数缩放都是经典的尾声操作。尾声的目的是避免第二次加载或写入 HBM，因为内存流量会使操作变得昂贵。

`nn.Linear` 调用 `torch.nn.functional.linear`，而后者又调用 `aten::linear`。`aten::linear` 会检查输入，注意到传入了偏置，然后调度 `aten::addmm(bias, x, weight)`，而不是分别执行矩阵乘法和加法。`addmm` 计算：

```
out = x @ weight.T + bias
```

在 GPU 上运行的 cuBLAS GEMM 内核内置了偏置加法变体，而 `aten::addmm` 选择的就是这个内核。加法永远不会作为独立的内核出现，因为它是**矩阵乘法内核回写的一部分**，这正是尾声的作用。

现在是时候注意一些微妙之处了。你在[第一部分 `--compile` 部分](https://huggingface.co/blog/torch-profiler#did-we-fuse-the-matmul-and-add-kernels-into-one)看到的核函数（`addmm`）正是即时模式 `nn.Linear` 已经使用的核函数。`torch.compile` 在这里没有什么可以融合的，接下来我们将验证这一点。

### [](#can---compile-help-a-single-linear)--compile 能帮助单个 Linear 吗？

让我们编译前向调用并查看性能分析器跟踪。（性能分析器跟踪将在[下一节](#where-did-the-transpose-go-kernel-layouts-and-pre-ops)中可视化）

```
uv run 02_linear.py --batch 1024 --in_dim 32 --out_dim 64 --compile
uvx trace-util traces -b traces
```

如果你比较单个 `nn.Linear` 的 `forward` 的即时模式和编译跟踪，你会发现：

-   GPU 上相同的 cuBLAS GEMM 核函数。
-   CPU 上相同的 `aten::addmm` 操作。
-   CPU 通道上多出几行编译特有的内容。

这一点值得内化。常见的反应是，当模型感觉慢时，就使用 `torch.compile`。对于单个带偏置的 GEMM，编译几乎没什么可做的。这不是一个 bug，而只是说明编译需要多个操作才能进行融合。让我们通过[查看 MLP](#stacking-two-linears-the-mlp) 来证明这一点。

### [](#where-did-the-transpose-go-kernel-layouts-and-pre-ops)转置去哪了？核函数布局和前置操作

仔细阅读两个跟踪（即时模式 vs 编译）的读者会注意到，即时模式的 CPU 调度链比编译的包含更多内容。

| [![即时模式 CPU 调度链，其中 aten::t 转置和 aten::addmm 在 aten::linear 下分别独立显示](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/eager.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/eager.png) |
| --- |
| 图 4：即时模式调度链，其中 `aten::linear` 依次经过 `aten::t`（转置）和 `aten::addmm` |

| [![编译的 CPU 调度链，显示一个 Torch-Compiled Region 和单个 aten::addmm 调用，没有转置操作](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile.png) |
| --- |
| 图 5：编译的调度链，其中直接调用 `aten::addmm`，没有转置操作 |

即时模式 CPU 调度链中 `aten::linear` 内部是 `aten::t` 后跟 `aten::addmm`（图 4）。要理解 `aten::t` 实际做了什么，我们需要快速了解一下*步长*和*视图*。

一个张量将其数据作为内存中一段连续的、平坦的数字序列存储。`shape` 和 `stride` 是位于该序列之上的元数据，告诉 PyTorch 如何遍历它：步长 `(s0, s1)` 表示“移动 `s0` 个元素以移动一行，移动 `s1` 个元素以移动一列”。更改元数据，你就会得到同一原始数据的*不同视图*，而无需复制：

```
>>> M = torch.tensor([[0, 1],
...                   [2, 3],
...                   [4, 5]])
>>> M.shape, M.stride()
(torch.Size([3, 2]), (2, 1))   # 每行两步，每列一步

>>> T = M.t()                  # 转置
>>> T.shape, T.stride()
(torch.Size([2, 3]), (1, 2))   # 形状和步长互换，数据不变
>>> T
tensor([[0, 2, 4],
        [1, 3, 5]])
>>> T.flatten()                # 强制实现，因此数据被重新排序
tensor([0, 2, 4, 1, 3, 5])
```

`M.t()` 并没有移动任何一个数字。它返回了一个新的视图，其步幅被交换了，因此按行读取现在会以转置后的顺序遍历原始缓冲区 `0, 1, 2, 3, 4, 5`。底层数据完全相同；只有元数据发生了变化。

这正是 `aten::t` 在线性层内部所做的：它不会分配新的张量或复制任何数据，而是生成一个权重*视图*，其步幅被重写。

如图 5 所示，编译并没有移除 GPU 内核：它移除了调度该视图的 *CPU 开销*。Inductor 在编译时追踪了视图链，一次性计算出了最终的步幅，并直接发出一个 `aten::addmm` 调用，将这些步幅硬编码进去。几微秒的 CPU 工作消失了，而 GPU 执行了完全相同的数学运算。

正如预期的那样，当输入数据违反了编译器预先计算的步幅时，它会抛出一个错误。

如果你查看两个追踪中的 GPU 通道，每次前向传播恰好只有一个内核，而且两次都是*同一个*内核：

```
cutlass_80_wmma_tensorop_bf16_s161616gemm_bf16_32x32_32x1_tn_align8
```

如果没有转置内核运行，是谁教会了 GEMM 以转置后的顺序读取权重矩阵呢？答案就在内核的名称中。看看后缀：

```
cutlass_80_wmma_tensorop_bf16_s161616gemm_bf16_32x32_32x1_tn_align8
                                                          ^^
```

这个 `tn` 就是布局描述符。cuBLAS 和 CUTLASS 为每种输入布局组合预编译了一个*独立的内核二进制文件*。

`n`（非转置）和 `t`（转置）描述了内核在内部循环中如何遍历其输入。调度器的工作是查看输入步幅，决定匹配哪个后缀组合，并选择正确的预编译内核。

> 性能分析器追踪中的内核名称是内核标识的哈希转储。如果两次运行显示相同的内核名称，则 GPU 执行的是相同的工作。如果它们不同（例如，`_tn_` 与 `_nn_`、`bf16` 与 `fp16`、或 `s16816gemm` 与 `s161616gemm`），则 GPU 执行的是不同的工作，并且调度器走了不同的分支。学会阅读这个名称是比较追踪时最有用的习惯之一。

## [](#stacking-three-linears-the-mlp)堆叠三个线性层：MLP

在本节中，我们将对一个多层感知机（MLP）进行性能分析。为了更有趣一些，我们将对一个使用 GeGLU 激活变体（在实践中相当常用）的前馈网络进行性能分析。这也是我们向深度学习研究史上最伟大的几行代码致敬的方式（图 6）。

```
class SimpleGeGLUMLP(nn.Module):
    def __init__(self, dim, hidden):
        super().__init__()
        self.gate_proj = nn.Linear(dim, hidden, bias=False)
        self.up_proj = nn.Linear(dim, hidden, bias=False)
        self.down_proj = nn.Linear(hidden, dim, bias=False)

def forward(self, x):
        g = self.gate_proj(x)
        u = self.up_proj(x)
        h = F.gelu(g, approximate="tanh")
        m = h * u
        y = self.down_proj(m)
        return y
```

你可以在这里找到完整的脚本：[`03_simple_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_simple_mlp.py)。按如下方式执行它：

```
uv run 03_simple_mlp.py --batch 64 --seq 128 --dim 768 --hidden 3072
uvx trace-util traces -b traces
```

在打开追踪记录之前，我们先一起思考一下应该会看到什么。`forward` 函数执行了相当多的计算，但其中大部分我们已经很熟悉了。

我们应该会看到三次 `aten::linear` 调度，分别对应每个 `nn.Linear` 层。还应该会看到两次逐点核函数启动，一次用于 GeLU，一次用于乘法。在查看之前形成这样的预期，是性能分析过程中最有用的习惯：你阅读追踪记录是为了*确认或推翻*一个猜想，而不是从头开始构建一个。

| [![GeGLU MLP 前向传播的性能分析追踪记录，CPU 通道上有五个框选分组，分别标注为 linear、linear、gelu、mul、linear](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-eager.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-eager.png) |
| --- |
| 图 7：GeGLU MLP 的性能分析追踪记录 |

| [![线性投影追踪记录中高亮显示的占用率查询](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/occupancy-queries.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/occupancy-queries.png) |
| --- |
| 图 8：线性投影 CPU 通道中高亮显示的占用率查询 |

从图 7 我们可以自我肯定，因为我们的直觉是正确的。每次前向传播（一次 `mlp_fwd`），GPU 恰好运行 5 个核函数。图 8 高亮显示了线性投影层 CPU 通道中的"占用率查询"。

| 操作 | CPU 操作 | GPU 核函数 | 启动次数 |
| --- | --- | --- | --- |
| `gate_proj` | `aten::linear` | `ampere_bf16_s16816gemm_bf16_128x128_...` | 占用率查询 + cudaLaunchKernel |
| `up_proj` | `aten::linear` | `ampere_bf16_s16816gemm_bf16_128x128_...` | 占用率查询 + cudaLaunchKernel |
| `gelu` | `aten::gelu` | `vectorized_elementwise_kernel<4, GeluCUDAKernelImpl...>` | cudaLaunchKernel |
| `h * u` | `aten::mul` | `vectorized_elementwise_kernel<4, ...MulFunctor...>` | cudaLaunchKernel |
| `down_proj` | `aten::linear` | `ampere_bf16_s16816gemm_bf16_128x256_...` | 占用率查询 + cudaLaunchKernel |

三个 GEMM 在启动前都额外执行了一次 `cudaOccupancyMaxActiveBlocksPerMultiprocessor` 调用。我们在第 1 部分中有专门一节介绍这一点，[你可以在这里找到](https://huggingface.co/blog/torch-profiler#why-does-matmul-have-an-extra-cuda-runtime-call)。这是 cuBLAS 在确定网格大小。逐点操作（GeLU 和 mul）直接启动，没有占用率查询。所以"一个 linear"实际上是查询加启动，而"一个逐点操作"只是启动。

| [![GeGLU MLP 的性能分析表格，列出操作名称及其 CUDA 时间，其中像 aten::transpose 和 aten::as_strided 这样的元数据操作显示 CUDA 时间为 0.000us](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-table.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-table.png) |
| --- |
| 图 9：表格显示某些操作启动了零个核函数 |

`aten::t`、`aten::transpose`、`aten::reshape`、`aten::view`、`aten::as_strided` 和 `aten::_unsafe_view` 这些操作启动了零个核函数。它们在表格中显示 CUDA 时间为 `0.000us`（图 9），因为它们只在 CPU 上重写了张量的元数据（形状和步长）。浏览表格的读者会看到每个 linear 大约有六个操作名称，但其中只有一个（`mm`）会实际到达 GPU。

### [](#为什么会有两种类型的-gemm-核函数)为什么会有两种类型的 GEMM 核函数？

MLP 将 `[batch, seq, dim]` 展平为 `[batch * seq, dim]` 以进行矩阵乘法。在我们的命令行调用中，我们为 `batch` 使用了 64，为 `seq` 使用了 128，所以这就是下面 `8192`（`batch * seq = 64 * 128`）的来源。

从追踪记录来看：

| 线性层 | `aten::mm` 输入维度 | M·K·N | cuBLAS 内核 | 平均 CUDA 时间 |
| --- | --- | --- | --- | --- |
| `gate_proj` | `[8192,768] x [768,3072]` | `8192·768·3072` | `…128x128…stages_32x5_tn` | 0.19ms |
| `up_proj` | `[8192,768] x [768,3072]` | `8192·768·3072` | `…128x128…stages_32x5_tn` | 0.19ms |
| `down_proj` | `[8192,3072] x [3072,768]` | `8192·3072·768` | `…128x256…stages_64x3_tn` | 0.17ms |

这三个 GEMM 的 FLOP 数相同，均为 `2·8192·768·3072 ≈ 38.7 GFLOP`，但 `down_proj` 快了约 `10%`。计算量相同，形状不同（`N=768` 而非 `3072`），因此 cuBLAS 选择了不同的分块（`128×256`，配合更深的 `stages_64x3` 流水线），从而在该形状下获得了更好的数据复用。

> 如果你想深入了解分块技术，[这里有一份很好的入门资料](https://alvinwan.com/how-to-tile-matrix-multiplication/)。

这正是表格中有两行 GEMM 的原因（图 9）：`128x128` 行对应 gate 和 up，`128x256` 行对应 down。

### [](#what-does-torchcompile-do)torch.compile 做了什么？

在编译 `forward` 方法并可视化之前，让我们再次进行思维练习，问问自己期望在跟踪中看到什么。这是一个有趣的实验，也是每次自己进行性能分析时都应该重复的重要步骤。始终基于你的直觉，一旦发现任何不符之处，就停下来弄清楚原因。

```
uv run 03_simple_mlp.py --batch 64 --seq 128 --dim 768 --hidden 3072 --compile
uvx trace-util traces -b traces
```

| [![编译后的 GeGLU MLP 性能分析跟踪，在 CPU 通道上显示三个 aten::mm 调用和一个融合的 triton 内核，分别标记为 mm、mm、fused、mm](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-compile-trace.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/simple-mlp-compile-trace.png) |
| --- |
| 图 10：编译后的 GeGLU MLP 性能分析跟踪 |

在即时模式下，每个 `nn.Linear` 被展开为一连串调度器操作（`aten::linear` → `aten::t` → `aten::transpose` → `aten::matmul` → `aten::reshape` → `aten::mm`）。这些是 ATen 在到达真正的 GEMM 之前所遍历的高级包装器。`torch.compile` 移除了这一链条。

当编译后的图运行时，不再有 linear、matmul、transpose 或 reshape，这些元数据操作被折叠进了 `mm` 的调用方式中。我们可以看到三个裸的 `aten::mm` 外部调用（图 10）。证明它们是相同 GEMM 的证据是，内核名称与即时模式逐字节相同：gate 和 up 使用 `...128x128...stages_32x5_tn`，down 使用 `...128x256...stages_64x3_tn`。

### [](#the-fused-triton-kernel)融合的 Triton 内核

| [![编译后的 MLP 跟踪，在 CPU 通道上显示 triton_poi_fused__unsafe_view_gelu_mul_0 内核框，取代了即时运行中单独的 gelu 和 mul 内核](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/fused.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/fused.png) |
| --- |
| 图 11：融合的 Triton 内核 |

这是整个编译课程的核心要点。两个即时点式内核（GeLU 和 mul）加上一个 reshape 合并成了一个内核，`triton_poi_fused__unsafe_view_gelu_mul_0`（图 11）。让我们来解码这个名称：

-   `triton`：由 Inductor 的 Triton 后端生成（非 cuBLAS，非 ATen）。
-   `poi`：逐点运算（Inductor 将逐点内核标记为 `poi`，规约操作为 `red`，持久规约为 `per`）。
-   `fused__unsafe_view_gelu_mul`：融合的操作包括：`_unsafe_view`（重塑）、GeLU 和乘法。
-   `0`：图内的唯一标识符。

为什么这是优势？在即时模式下，中间结果 `h = gelu(g)` 是一个完整的 `[8192, 3072]` bf16 张量（约 50 MB），GeLU 内核将其写入 HBM，而乘法内核立即读取。融合操作将其保留在寄存器中（位于芯片内部且比 HBM 更近的内存）。Triton 内核一次性读取 `g` 和 `u`，计算 `gelu(g) * u`，并一次性写入结果。中间结果通过全局内存的整个往返过程被消除了。

## [](#lets-use-hand-tuned-kernels)让我们使用手动调优的内核

到目前为止，我们让 PyTorch（即时模式）和编译器（`torch.compile`）选择我们的内核。现在我们引入一个由人类专家编写并手动调优的内核。我们使用 `LigerGEGLUMLP` 层，可以通过 `kernels` 库轻松从 [Hugging Face Hub](https://huggingface.co/kernels/kernels-community/liger-kernels) 获取。

```
from kernels import get_kernel

kernels_layers = get_kernel("kernels-community/liger-kernels", version=1).layers
kernels_geglu_mlp = kernels_layers.LigerGEGLUMLP(Config()).to(device, dtype=torch.bfloat16).eval()
```

完整脚本在此：[`03_kernels_mlp.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/03_kernels_mlp.py)。

```
uv run 03_kernels_mlp.py --batch 64 --seq 128 --dim 768 --hidden 3072
uvx trace-util traces -b traces
```

| [![LigerGEGLUMLP 前向传播的性能分析追踪，显示 CPU 通道上有三个 aten::linear 组和一个 LigerGELUMulFunction 组](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/kernels-profile.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/kernels-profile.png) |
| --- |
| 图 12：使用来自 Hub 的 Liger 内核的 `LigerGEGLUMLP` 层的性能分析追踪 |

图 12 显示了使用来自 Hub 的 Liger 内核的 `LigerGEGLUMLP` 层的性能分析。

### [](#why-use-the-kernels-library)为什么使用 kernels 库

用 Triton 或 CUDA 编写内核是一回事，而*分发*它们则是另一回事。内核必须针对你的 GPU 架构、CUDA 版本和 PyTorch 版本的精确组合进行编译。这一步通常容易出问题（“在我的机器上能运行”，缺少 `nvcc`，Triton 版本错误）。

[`kernels`](https://github.com/huggingface/kernels) 库将构建步骤从你的机器上移走。`get_kernel("kernels-community/liger-kernels", version=1)` 从 Hugging Face Hub 下载一个**预构建、版本固定的**内核包，并在本地缓存（例如在 `~/.cache/...kernels-community--liger-kernels` 下）。其优势包括：

-   内核在 CI 中一次性编译，支持多种架构和版本组合。你下载正确的二进制文件，而不是自己编译。
-   `version=1` 固定了确切的构建版本，因此运行你脚本的每个人都会获得相同的内核。不会出现“更新包后变慢”的情况。
-   该包暴露了一个 `.layers` 属性，其中包含可直接替换的 `nn.Module`（如 `LigerGEGLUMLP`）。你只需将模块替换为他们的，模型的其他部分无需更改。

### [](#why-tuned-kernels-are-better)为什么调优后的内核更好

当我们说“调优”时，指的是两个具体方面，这两点在追踪中都能看到。

| [![编译后的 MLP 追踪，在编译图运行之前，CPU 通道上显示 TorchDynamo、序言和守卫预处理操作框](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile-preops.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/compile-preops.png) |
| --- |
| 图 13：编译后的运行在任何 GEMM 运行之前，需要支付预处理操作（Dynamo、守卫、序言）的开销 |

| [![LigerGEGLUMLP 追踪图，其中编译前操作的位置显示为空框，表明手写内核没有 Dynamo 或 guard 开销](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-preops.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-mlp-fusion/no-preops.png) |
| --- |
| 图 14：Liger 内核没有前操作——它们本应出现的位置是空的 |

1.  **融合是内置的。** [`LigerGEGLUMLP`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/layers.py#L307) 的前向传播是 `down_proj(LigerGELUMulFunction.apply(gate_proj(x), up_proj(x)))`。[`LigerGELUMulFunction`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/geglu.py#L130) 运行单个 Triton 内核 [`_geglu_tanh_forward_kernel`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/geglu.py#L97)，该内核在一次传递中计算 `gelu(gate) * up`。这与我们从 `torch.compile` 中看到的情况完全相同，其中中间结果从未通过 HBM 往返。我们在这里**无需编译器**就得到了它，如图 13 和 14 所示（没有 Dynamo 守卫、没有编译延迟、没有重新编译风险）。

2.  **启动参数是为硬件选择的。** 该内核不会随机猜测其块大小。Liger 的 [`calculate_settings`](https://huggingface.co/kernels/kernels-community/liger-kernels/blob/v1/build/torch-cuda/geglu.py#L95) 根据列数选择它们。

有必要诚实地说明这里的权衡，因为原始数字可能具有误导性。Liger 内核运行时间为 **92.8 µs**，而来自编译运行的 Inductor 融合内核为 **89.4 µs**。乍一看，手写内核似乎稍慢，但这种比较隐藏了使其值得付出的代价。

`torch.compile` 专用于**静态形状**。Inductor 的 `89.4 µs` 内核之所以快，正是因为它针对 *这个确切* 的 `[8192, 3072]` 问题而生成。改变批量大小、序列长度或隐藏维度，Dynamo 会重新追踪，并且您需要再次支付编译成本才能获得一个新的专用内核。

因此，真正的选择不是“慢速人工内核 vs 快速编译内核”。而是**一个快速的通用内核 vs 一个专用于特定输入形状的内核**。Liger 内核采用一组启动参数，并针对*任何*形状运行它们，无需重新编译。它放弃了按形状专用化所能带来的最后几微秒，以换取对形状变化的鲁棒性。

## [](#conclusion)结论

下表汇总了每一步在 GPU 上改变了什么以及未触及什么。

| 设置 | 变化内容 | 保持不变的内容 |
| --- | --- | --- |
| 即时模式 `nn.Linear` | 基线：偏置加法已融入 GEMM 后处理（`addmm`），因此是*一个* cuBLAS 内核，而非矩阵乘法加加法 | — |
| 编译模式 `nn.Linear` | 少量 CPU 调度操作（`aten::t` 视图记录）消失 | 相同的单个 cuBLAS GEMM 内核，逐字节一致。编译无需融合任何操作 |
| 即时模式 MLP | 5 个 GPU 内核：3 个 GEMM + 1 个 GeLU + 1 个乘法。`[8192, 3072]` 中间结果需完整经过 HBM 读写 | 每个 GEMM 仍是独立的无偏置 cuBLAS 内核 |
| 编译模式 MLP | GeLU + 乘法 + 变形融合为**一个** Triton 内核；中间结果保留在寄存器中。需付出编译预处理开销（Dynamo、守卫） | 3 个 GEMM 保持不变，内核名称与 cuBLAS 完全一致 |
| Liger MLP | 相同融合，但内嵌于手写 Triton 内核，采用硬件调优的启动参数，**无** Dynamo、守卫或编译延迟 | 3 个 GEMM 仍是相同的 cuBLAS 内核 |

如果要养成一个习惯，那就是我们在每次追踪前练习的那个：**先猜测，再查看。** 说出你期望追踪中包含的内容，打开它，并将任何不匹配视为屏幕上最有趣的信息。

这是 **PyTorch 性能分析**系列的第二站。在下一篇文章中，我们将继续向上攀登，从 MLP 模块转向注意力模块，最终覆盖完整模型。

感谢 [Noe Flandre](https://huggingface.co/NoeFlandre) 和 [Pedro Gabriel Gengo Lourenço](https://huggingface.co/pedrogengo) 对本文初稿的审阅！

> 本文使用 LLM 进行了润色。这绝不意味着我们让一个代理在后台运行并自动生成博客。团队中部分成员非英语母语者，我们认为 LLM（主要基于英语训练）可以纠正语法错误或优化语句，使其更简洁易懂。希望这能解释“如果是 LLM 生成的，我为什么要读”的疑问。🤗
