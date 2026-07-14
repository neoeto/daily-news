---
title: 'Profiling in PyTorch (Part 3): Attention is all you profile'
url: 'https://huggingface.co/blog/torch-attention-profile'
url_hash: 145fbd552c7570091ad5e1a261a1719c4bffd75e
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-10T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![博客文章缩略图](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/profile-3-thumbnail.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/profile-3-thumbnail.png)

"PyTorch 性能分析"系列旨在帮助你轻松读懂性能分析器的追踪记录和表格。在[第 1 部分](https://huggingface.co/blog/torch-profiler)中，我们对加法和乘法等基本数学运算进行了性能分析。我们看到了性能分析表如何揭示热点，以及性能分析追踪如何展示算法随时间运行的顺序。

在[第 2 部分](https://huggingface.co/blog/torch-mlp-fusion)中，我们将这些加法和乘法封装到了 torch 线性层中。然后，我们将多个线性层堆叠在一起（形成一个多层感知机）并对其进行了性能分析。在此过程中，我们还分析了融合和手动调优的内核。

从 Transformer 架构的角度来看，我们接下来要分析的另一个基础算法是注意力机制。尽管它以其二次时间复杂度而臭名昭著，但存在许多巧妙的技巧来缓解这个问题并使其变得快速。我们的目标不是详细涵盖每一个技巧。相反，我们想看看每个技巧在性能分析器下是如何呈现不同样貌的。

> 本博客文章的脚本位于：[`04_a_naive_attention.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/04_a_naive_attention.py)、[`04_b_inplace_ops_attention.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/04_b_inplace_ops_attention.py)、[`04_c_sdpa_attention.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/04_c_sdpa_attention.py) 和 [`04_d_kernels_attention.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/04_d_kernels_attention.py)。和之前一样，建议在新标签页中打开它们，并在阅读时同步浏览代码。我们使用 `NVIDIA A100-SXM4-80GB` GPU 来运行脚本。使用 [Dev Mode with Spaces](https://huggingface.co/docs/hub/spaces-dev-mode) 在 Hugging Face 基础设施上设置 GPU 并试验脚本非常容易。也可以使用 [Hugging Face Jobs pipeline](https://huggingface.co/docs/huggingface_hub/en/guides/jobs) 来运行脚本。

## [](#naive-attention)朴素注意力

注意力机制涉及查询（`q`）、键（`k`）和值（`v`）。它们之间的交互可以写成一系列简短的步骤：

1.  计算注意力分数 `scores`：`matmul(q, k.T)`
2.  缩放分数：`scores * scale`
3.  对分数应用因果掩码：`scores.masked_fill(mask, "-inf")`
4.  使用 softmax 归一化分数以获得注意力权重 `attn`：`softmax(scores)`
5.  使用这些权重重新加权值：`matmul(attn, v)`

因此，注意力实际上是一系列基本操作的集合。其中一些我们已经熟悉（矩阵乘法），其余的操作也很容易识别。让我们在 PyTorch 中编写一个朴素的注意力模块并对其进行分析。

```
class NaiveCausalAttention(nn.Module):
    def __init__(self, head_dim):
        super().__init__()
        self.scale = 1.0 / math.sqrt(head_dim)

def forward(self, q, k, v, mask):
        scores = torch.matmul(q, k.transpose(-2, -1))
        scores = scores * self.scale
        scores = scores.masked_fill(mask, float("-inf"))
        attn = torch.softmax(scores, dim=-1)
        out = torch.matmul(attn, v)
        return out
```

在打开追踪记录之前，让我们像往常一样先猜测一下应该看到什么。追踪这个模块的 `forward` 方法，我们预期会看到：

-   一个矩阵乘法内核（`q . k.T`）
-   一个乘法内核（缩放）
-   一个用于掩码的操作
-   一个 softmax 内核
-   一个矩阵乘法内核（`atten . v`）

```
uv run 04_a_naive_attention.py
uvx trace-util -f traces/ -b <hf_uname>/traces
```

| [![CPU lane of the naive attention profiler trace, with the `attn_fwd` block expanded to show its matmul, mul, masked_fill and softmax operations](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cpu-profile-naive.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cpu-profile-naive.png) |
| --- |
| 图1：朴素注意力机制性能分析追踪的CPU通道，突出显示了各个离散操作 |

图1展示了性能分析的CPU通道（GPU通道已折叠以免信息过载）。在`attn_fwd`（我们标注的前向调用）内部，可以清晰看到我们推测的操作序列。矩阵乘法已是老相识，新操作也一目了然：

-   `mul`：缩放操作
-   `masked_fill`：因果掩码
-   `softmax`：softmax核函数

现在让我们展开GPU通道，看看实际启动了哪些核函数。

| [![朴素注意力机制性能分析追踪图，CPU通道位于GPU通道上方，每个`attn_fwd`步骤对应一组GPU核函数](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/gpu-profile-naive.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/gpu-profile-naive.png) |
| --- |
| 图2：朴素注意力机制性能分析追踪的GPU和CPU通道，突出显示对应一个性能分析步骤的核函数集合 |

图2展示了与CPU通道并排的GPU通道。让我们放大GPU通道上的单个`attn_fwd`模块，逐一观察核函数。

| [![朴素注意力机制GPU通道放大图，显示单个步骤的各个核函数：两个矩阵乘法、一个乘法、一次内存拷贝、一个掩码核函数和一个softmax](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/each-kernels-naive.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/each-kernels-naive.png) |
| --- |
| 图3：朴素注意力机制实现的性能分析追踪GPU通道放大图 |

图3让我们可以读出单个性能分析步骤的各个核函数：

1.  矩阵乘法（查询和键）
2.  乘法（缩放）
3.  内存拷贝 🤔
4.  因果掩码
5.  softmax（生成注意力权重）
6.  矩阵乘法（注意力权重和值）

其中五个是预期中的。内存拷贝是意外出现的一个，那么它是从哪里来的呢？线索在于PyTorch支持就地操作。当你以普通（非就地）方式操作张量时，PyTorch通常会创建一个副本，对副本执行请求的操作，然后返回该副本。按照操作序列来看，这里的罪魁祸首是我们的[`masked_fill`](https://docs.pytorch.org/docs/2.13/generated/torch.Tensor.masked_fill.html)。

如果我们用就地操作替换它会怎样？

## [](#naive-attention-with-inplace-causal-masking)使用就地因果掩码的朴素注意力机制

我们只需将`masked_fill`改为`masked_fill_`（注意末尾的下划线，这是PyTorch就地操作的约定），然后运行相同的脚本。

```
def forward(self, q, k, v, mask):
    # q, k, v: [batch, heads, seq, head_dim]
    scores = torch.matmul(q, k.transpose(-2, -1))  # [batch, heads, seq, seq]
    scores = torch.mul(scores, self.scale)
-    scores = scores.masked_fill(mask, float("-inf"))
+    scores.masked_fill_(mask, float("-inf"))
    attn = torch.softmax(scores, dim=-1)
    out = torch.matmul(attn, v)  # [batch, heads, seq, head_dim]
    return out
```

让我们查看追踪结果，看看是否有变化。

```
uv run 04_b_inplace_ops_attention.py
uvx trace-util -f traces/ -b <hf_uname>/traces
```

原地版本（图5）在掩码步骤中包裹的CPU操作远少于非原地版本（图4）。这是一个令人鼓舞的信号。让我们展开GPU通道来确认发生了什么。

在GPU通道上，`Memcpy`内核已经彻底消失（图6和图7）。仅通过一行代码的改动，我们就从每次前向传播中砍掉了一个完整的内核。这单独看起来可能不算什么，但请记住这只是一个注意力操作。在基于Transformer的大模型（如LLM、扩散模型等）中，每个层都会重复执行该操作，而模型有多个层，因此节省的开销会迅速累积（如果这为你带来了加薪，分给我们至少10%才算公平）。

> 非原地操作是PyTorch的默认选择是有原因的。为了计算梯度，自动求导必须记住前向传播中看到的张量值，因为许多反向传播公式会重用它们。原地操作会覆盖内存中的这些值，导致反向传播读取错误的数据。由于我们在`torch.no_grad`下运行`forward`，原地操作对我们来说是安全的，没有反向传播，也没有数据会被破坏。值得注意的是，原地操作不仅节省时间（如我们所见），还能节省内存（因为无需额外复制），这对于像logits这样的大张量非常有用！

## [](#缩放点积注意力)缩放点积注意力

我们刚刚用基本操作构建了注意力机制，甚至还砍掉了一个`Memcpy`。好消息是，PyTorch团队已经为我们完成了所有这些工作，并将整个流程打包成一个函数：

```
from torch.nn import functional as F

F.scaled_dot_product_attention(q, k, v, is_causal=True)
```

这一行代码替代了我们手写的模块，而`is_causal=True`甚至省去了我们手动构建掩码的步骤。值得停下来体会一下这个函数隐藏了多少细节。它隐藏的不仅仅是代码行数。缩放点积注意力（SDPA）并非只有单一实现。在底层，它会*调度*到多个后端之一，并选择支持我们输入（数据类型、头维度、掩码、硬件等）的最快后端。

[官方SDPA教程](https://docs.pytorch.org/tutorials/intermediate/scaled_dot_product_attention_tutorial.html)详细介绍了这个选择过程，而后端本身列在`torch.nn.attention.SDPBackend`枚举中：

```
from torch.nn.attention import SDPBackend

BACKENDS = {
    "math": SDPBackend.MATH,
    "flash": SDPBackend.FLASH_ATTENTION,
    "efficient": SDPBackend.EFFICIENT_ATTENTION,
    "cudnn": SDPBackend.CUDNN_ATTENTION,
}
```

通常SDPA会为我们选择，但我们可以使用`torch.nn.attention.sdpa_kernel`上下文管理器固定特定后端。这正是我们在脚本中所做的。这让我们可以单独分析每个后端，并观察它们在跟踪中如何以不同方式呈现。让我们逐一来看。

### [](#数学后端)数学后端

```
uv run 04_c_sdpa_attention.py --backend math
uvx trace-util -f traces/ -b <hf_uname>/traces
```

在打开任何内容之前，我们先来猜一猜。我们将手写注意力机制（matmul、mul、mask、softmax、matmul）替换为一行代码，因此预期跟踪结果会变得更*简单、更快*。内核数量更少，CPU 调度更少，甚至可能实现融合内核。我们先查看分析器表格。

| 指标 | 查看位置 | 朴素原地实现 | SDPA math 实现 |
| --- | --- | --- | --- |
| `*_fwd` CUDA 平均时间 | `*_fwd` 操作的“CUDA 平均时间”列 | 1.955 毫秒 | 7.239 毫秒 |
| 自身 CUDA 总时间 | 分析器表格底部 | 7.194 毫秒 | 27.279 毫秒 |

这是第一个意外：一行代码反而慢了 `3.7` 倍。

打开跟踪结果（图 9）就能明白为什么警报响起：math 后端每次前向传播启动了 `20` 个 GPU 内核，而我们朴素注意力实现只启动了 `5` 个（图 8）。这与我们的猜测完全相反。我们来探究原因。

#### [](#tensor-cores-left-vacant)Tensor Core 未被利用

在[第 2 部分](https://huggingface.co/blog/torch-mlp-fusion#where-did-the-transpose-go-kernel-layouts-and-pre-ops)中，我们学会了像解读指纹一样解读内核名称。这里也沿用这个习惯：

我们用于捕获这些跟踪结果的 A100 配备了 [Tensor Core](https://www.nvidia.com/en-us/data-center/tensor-cores/)，这是一种专门用于加速矩阵乘法的硬件，其速度远超普通 CUDA Core。要理解这一点的重要性，需要了解 GPU 的内部结构。流式多处理器（SM）是 GPU 的计算单元，每个 SM 包含两种算术单元：CUDA Core 和 Tensor Core。CUDA Core 是通用型的，一次处理少量元素；而 Tensor Core 能在单条指令中完成整个小矩阵块的乘加运算。因此问题很简单：“每个后端是否真的使用了快速路径？”

内核名称给出了答案。朴素内核（图 10）中的 `s16816` 是 `bfloat16` Tensor Core 矩阵乘法的签名（`16x8x16` Tensor Core 指令），因此朴素版本走的是快速路径。而 `sgemm`（图 11）是运行在普通 CUDA Core 上的经典单精度（`FP32`）矩阵乘法。换句话说，math 后端根本没有使用 Tensor Core：为了用速度换取数值精度，它将张量提升为 `FP32`（即使输入是 `bf16`，数据移动量也翻倍），并回退到较慢的 CUDA Core。

#### [](#causal-masks-built)因果掩码的构建

在朴素版本中，我们构建了一次因果掩码并重复使用。而这里我们传入了 `is_causal=True`，math 后端在*每次*调用时都为我们重新生成掩码。你可以在 CPU 通道上看到这一过程：

| [![SDPA math 后端 CPU 通道，显示重建因果掩码的操作：aten::ones、aten::tril、aten::scalar_tensor、aten::fill_ 和 aten::where](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/mask-math.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/mask-math.png) |
| --- |
| 图 12：显示掩码操作的 CPU 通道 |

以下是我们在图 12 中看到的内容：

```
aten::ones -> aten::tril            构建一个 [seq, seq] 的下三角矩阵
aten::scalar_tensor -> aten::fill_  生成 -inf 填充值
aten::where                         将其转换为加法偏置（0 或 -inf）
```

在 GPU 上，这表现为一个 `triu_tril_kernel`、几个 `where` 内核以及一个 `add_`。那个让我们不再考虑掩码的便捷标志并没有消除工作量，只是将其下移了一层，掩码在每次前向传播时都会从头重建。

#### [](#the-safe-softmax)安全 softmax

我们手写的版本直接调用了 `aten::softmax`。数学后端调用的是 `aten::_safe_softmax`，其差异再次体现为额外的内核（图 13）：

| [![SDPA 数学后端的 GPU 通道，显示 aten::\_safe\_softmax 相比普通 softmax 启动的额外内核](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/safe-softmax-extra-kernels.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/safe-softmax-extra-kernels.png) |
| --- |
| 图 13：安全 softmax 突出显示了与通用 softmax 相比的额外内核 |

一个完全被掩码的行（每个条目都是 `-inf`）会导致普通的 softmax 计算 `exp(-inf)/sum(exp(-inf)) = 0/0 = NaN`。`_safe_softmax` 正是为了防止这种情况。我们原始的核心理所当然地忽略了这一点，在这种边界情况下会静默地产生 `NaN`。

#### [](#so-what-is-the-math-backend-for)那么数学后端是用来做什么的？

总的来说，数学后端是参考实现。它是将注意力分解为原始 ATen 操作的一种直接、数据类型安全、NaN 安全的分解。它本质上就是我们手写的朴素注意力，但更加谨慎。正是这种谨慎使其变得极其缓慢。

它的任务不是快，而是*始终*有效。这使其成为完美的基准。我们接下来分析的每个后端（flash、efficient、cudnn）都试图将 `20` 个 GPU 内核压缩成一个融合内核，该内核保持在 bf16 精度，并且完全不实例化中间矩阵。

### [](#efficient-backend)Efficient 后端

```
uv run 04_c_sdpa_attention.py --backend efficient
uvx trace-util -f traces -b <hf_uname>/traces
```

| [![SDPA efficient 后端的分析器跟踪，显示每次前向传播只有一个融合的 fmha\_cutlassF 注意力内核](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/efficient-backend.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/efficient-backend.png) |
| --- |
| 图 14：使用 efficient 后端的 sdpa 分析器跟踪 |

数学后端在一个分析器步骤中启动了 20 个内核，而 efficient 后端只启动了一个 `fmha_cutlassF_bf16_aligned_64x64_rf_sm80`（如图 14 所示）。

让我们解读一下这个内核的名称：

-   `fmha`（融合多头注意力）：注意力中的所有原始操作现在都“融合”到一个操作中。
-   `cutlassF`：基于 CUTLASS（NVIDIA 用于张量核心 GEMM 的开源模板）构建，`F` 表示前向。
-   `bf16_aligned`：以 bfloat16 运行（与数学后端不同，没有 FP32 向上转换）。
-   `64x64`：tile 大小。
-   `rf`（寄存器文件）：工作集保存在寄存器中，这是芯片上最快的存储器。
-   `sm80`：为 Ampere 编译（A100 的计算能力为 8.0）。

这就是源自 Meta 的 [xformers](https://github.com/facebookresearch/xformers) 库并上游到 PyTorch 的内存高效注意力内核。当人们说“xformers 后端”时，他们指的就是这个 `fmha_cutlassF` 内核。

### [](#flash-backend)Flash 后端

```
uv run 04_c_sdpa_attention.py --backend flash
uvx trace-util -f traces -b <hf_uname>/traces
```

| [![SDPA flash 后端的性能分析追踪](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/flash-backend.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/flash-backend.png) |
| --- |
| 图 15：flash 后端追踪，每个前向传播有一个融合的 `pytorch_flash` 内核 |

`void pytorch_flash` 内核（图 15）是 [FlashAttention-2](https://arxiv.org/abs/2307.08691)（Tri Dao 的实现），已集成到 PyTorch 中。

在进一步解读追踪之前，值得回答你此刻应该会问的问题：*为什么会有个叫“flash”的完整后端，它又为何如此重要？*

#### [](#为什么需要flash-attention)为什么需要 flash attention？

让我们暂时回到数学后端。它的真正问题不在于 20 个内核的数量，而在于这些内核之间传递的内容。

步骤 1 构建了完整的分数矩阵 `attn = q . k.T`，这是 **每个头** 的 `[seq, seq]` 矩阵。对于 4096 的序列长度，单个头就是 `4096 x 4096 ≈ 1600 万` 个数字。这个矩阵会被写入 HBM（GPU 的主内存），前提是有足够的空间。然后，它被读回进行缩放，再次写入用于掩码，再次读取用于 softmax，依此类推。注意力的成本主要来自这种 **与 HBM 之间的来回流量**，而不是矩阵乘法本身。

FlashAttention 正是针对这一点进行优化。它不先计算整个 `s` 矩阵再规约，而是以 **分块** 的方式遍历 `k` 和 `v`，在过程中维护一个动态 softmax（即“在线 softmax”技巧），并逐块累积输出。完整的 `[seq, seq]` 分数矩阵 **从未写入 HBM**，它只存在于片上。正是这一核心思想，使得整个注意力流水线能够坍缩成一个融合内核，在 Tensor Core 上以 bf16 格式运行。

#### [](#为什么flash在性能分析器中看起来异常)为什么 flash 在性能分析器中看起来“异常”

| [![Flash 内核的 Perfetto 占用率报告显示估计的达到占用率为 13%](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/flash-occupancy.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/flash-occupancy.png) |
| --- |
| 图 16：flash 内核的估计占用率显示为 13% |

这就是 flash 让阅读性能分析器足迹的人感到惊讶的地方。它是最快的后端，但性能分析器却报告其 **占用率很低**（如图 16 所示）。要理解为什么这没问题，我们需要三个快速定义。

GPU 内核本质上是由许多小型执行单元执行的一系列指令。这些独立的执行单元（线程）负责加载变量、相加、存储等操作。对于每个内核，我们会启动大量线程，为了管理它们，我们按块进行分组。

块被调度到流式多处理器（SM）上，这是 GPU 的主要计算单元。一个块完全驻留在一个 SM 上，而一个 SM 可以同时托管多个块，*前提是它有足够的资源*。这些资源包括寄存器、共享内存、最大常驻线程数和最大常驻线程束数。因此，当我们说一个内核的 **占用率** 较低时，意味着每个 SM 上的常驻线程束数量少于其理论支持的最大值。

> 如果你想深入了解线程、线程块、网格等概念，这里有一份[优质资源](https://huggingface.co/blog/mi300kernels#a-quick-introduction-to-the-mi300x)。

点击追踪中的flash内核，其资源占用情况便一目了然（图17）。

| [![Perfetto中pytorch\_flash内核的资源占用情况，显示每个线程的高寄存器使用量以及每个线程块的大共享内存使用量](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/flash-reg-count.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/flash-reg-count.png) |
| --- |
| 图17：flash内核的资源占用情况，每个线程块对寄存器和共享内存的需求都很高。 |

Flash使用了大量每线程寄存器和每线程块的大容量共享内存。例如，如果一个线程块有128个线程，每个线程使用255个寄存器，那么该线程块需要 `128 × 255 = 32,640` 个寄存器。在拥有65,536个寄存器的Ampere SM上，同时只能容纳两个这样的线程块。每个128线程的线程块有 `128 / 32 = 4` 个线程束，因此两个线程块总共只有8个驻留线程束。相对于最多64个驻留线程束的上限，这大约只有13%的占用率。Flash的低占用率并非因为优化不佳，而是因为每个线程块在片上资源的使用上刻意设计得非常“沉重”。

而这正是关键所在。高占用率通过保持大量线程束随时可运行来*隐藏延迟*，但并不能使工作本身变得高效。Flash有意消耗这些寄存器和共享内存，目的是将注意力分块保留在片上，积极复用数据，并避免在全局内存中实例化完整的注意力矩阵。

### [](#cudnn-backend)cuDNN后端

```
uv run 04_c_sdpa_attention.py --backend cudnn
uvx trace-util -f traces -b <hf_uname>/traces
```

| [![SDPA cuDNN后端的性能分析追踪，显示每次前向传播中只有一个cudnn\_generated注意力内核](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cudnn-backend.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cudnn-backend.png) |
| --- |
| 图18：cuDNN后端追踪，每次前向传播中只有一个生成的注意力内核。 |

现在这个模式已经很熟悉了。与flash和efficient类似，cuDNN在每次前向传播中提供了一个融合的、flash风格的内核（图18）。那么自然而然的问题是：**既然flash已经融合了注意力，为什么PyTorch还要提供另一个flash后端？** 答案在于*谁编写内核以及如何构建内核*，正是这种差异导致了追踪结果的不同。

#### [](#how-is-cudnn-kernel-different)cuDNN内核有何不同

Flash和efficient是**固定的、预编译的内核**，随PyTorch一起提供。每次你得到的都是相同的二进制文件。而cuDNN是NVIDIA自己的深度学习库，其注意力内核是**针对特定问题生成和调优的**。它在精神上更接近`torch.compile`的代码生成，而不是固定的cuBLAS二进制文件。这一点可以从（非常长的）内核名称中直接看出：

```
cudnn_generated_fort_native_sdpa_sm80_flash_fprop_wmma_f16_knob_6_128x64x64_4x1x1_cga1x1x1_kernel0_0
```

-   `cudnn_generated`：不是预先提供的二进制文件，而是由cuDNN生成的。
-   `flash_fprop`：flash注意力风格的前向传播。因此算法与flash后端属于同一家族。
-   `wmma_f16`：它使用线程束级矩阵乘累加（WMMA）API，即16位浮点流水线上的Tensor Core路径。
-   `knob_6`：cuDNN从一组预调优的配置（“旋钮”）中进行选择。不同的形状会选择不同的旋钮，类似于cuBLAS选择不同的分块变体。
-   `128x64x64`：它选择的分块维度。

这一事实——**每个问题生成一次**——解释了 trace 中所有看起来异常的现象。

1.  **无转置操作**：CPU 通道从 `_cudnn_attention_forward` 直接进入几个 `aten::empty` 分配，然后进入内核，完全没有 `aten::transpose`（图 19、20 和 21）。Flash 和 Efficient 各自插入了四个（元数据）转置来重塑张量，而 cuDNN 直接使用原生的 `[B, H, S, D]` 布局，因为其生成器会为该布局生成内核。

2.  **通过 `cuLaunchKernelEx` 启动，而非 `cudaLaunchKernel`**：本系列中的所有其他内核都通过运行时 API `cudaLaunchKernel` 启动。cuDNN 使用驱动程序级别的*扩展*启动，该启动携带启动属性（图 22）。

| [![cuDNN 后端的 CPU 通道，显示使用 cuLaunchKernelEx 驱动程序级启动而非 cudaLaunchKernel](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cudnn-launch.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cudnn-launch.png) |
    | --- |
    | 图 22：cuDNN 后端的 CPU 通道，显示使用 cuLaunchKernelEx 驱动程序级启动而非 cudaLaunchKernel |

3.  **分析器报告 0% 的达到占用率**：不要轻信这个数值，这是一个测量缺口，而非 GPU 停滞。CUPTI（分析后端）无法像为 `cudaLaunchKernel` 那样，将占用率归因于驱动程序 API（`cuLaunchKernelEx`）的启动，因此该字段显示为 0。占用足迹揭示了真相（图 23）：`240 个寄存器 × 256 个线程 = 每个块 61,440` 个寄存器，而 SM 有 65,536 个，因此每个 SM 只能容纳**一个块**（8 个 warp ≈ 12.5%），这与 Flash 的情况完全一致。

| [![cuDNN 内核的 Perfetto 占用足迹，报告 0% 的达到占用率，每个线程 240 个寄存器，每个块 256 个线程](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cudnn-footprint.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-attention-profile/cudnn-footprint.png) |
    | --- |
    | 图 23：cuDNN 内核报告 0% 的达到占用率，每个线程 240 个寄存器，每个块 256 个线程 |

#### [](#the-cost-moved-to-the-cpu)成本转移到了 CPU

“无转置”的故事诱使我们期望 cuDNN 成为 CPU 上*最精简*的后端。但事实恰恰相反。

| 后端 | CUDA 平均时间 | CPU 平均时间 |
| --- | --- | --- |
| efficient | 277.9 µs | 117 µs |
| flash | 146.8 µs | 138 µs |
| cudnn | 186.3 µs | **214 µs** |

即使没有转置操作，cuDNN 每次前向传播在 CPU 上仍花费约 **214 µs**，超过了 Flash（138 µs）或 Efficient（117 µs）。几乎所有时间都花在 `aten::scaled_dot_product_attention` 自身时间（占整个运行的 26%）和 `_cudnn_attention_forward` 上。这是 cuDNN 的运行时引擎在每次调用时选择和准备计划（“旋钮”搜索）。

更少的可见 ATen 操作并不意味着更少的 CPU 工作，而是将**工作转移到了库内部**，分析器只能将其显示为一个粗大、不透明的条。当 trace 突然变得*更干净*时，工作并不总是消失了，有时它只是转移到了分析器无法分解的地方。

在 GPU 上，cuDNN（186.3 µs）介于高效版和闪存版之间。对于这种非常适合闪存处理的形状，手写的 FlashAttention-2 略胜一筹。cuDNN 在*其他*形状（更大的头维度、不同的序列长度）上经常胜出，正是因为其生成器会针对每个问题重新调优，但这种重新调优也正是你在 CPU 上付出的代价。

## [](#everything-we-covered-at-a-glance)我们涵盖的所有内容，一目了然

在结束之前，这里用一个表格回顾我们剖析过的每个注意力变体，以及每个追踪教给我们的经验。

| 变体 | 我们改变了什么 | 内核 / 前向传播 | 追踪揭示的内容 |
| --- | --- | --- | --- |
| 朴素注意力 | 从原语（matmul、mul、mask、softmax、matmul）手动构建的注意力 | 6 | 一个隐藏的 `Memcpy`，来自非原地操作的 `masked_fill`。 |
| 朴素原地操作 | `masked_fill` → `masked_fill_` | 5 | 一行代码完全去掉了 `Memcpy` 内核。 |
| SDPA 数学模式 | 固定使用数学后端的 `F.scaled_dot_product_attention` | 20 | 参考实现：在 CUDA 核心上使用 FP32，每次调用重建掩码，`_safe_softmax`。正确但慢约 3.7 倍。 |
| SDPA 高效版 | 高效（xformers）后端 | 1 | 一个融合的 `fmha_cutlassF` 内核，在张量核心上保持 bf16。 |
| SDPA 闪存版 | 闪存后端 | 1 | 一个融合的 `pytorch_flash` 内核（FlashAttention-2）。最快，尽管有“看似错误”的 13% 占用率。 |
| SDPA cuDNN | cuDNN 后端 | 1 | 一个针对每个问题生成的内核：无转置，`cuLaunchKernelEx`，但代价转移到了庞大的 CPU 条上。 |

## [](#concluding-the-series)系列总结

如果整个系列你只带走一件事，那就是我们在每次追踪前反复做的习惯：**先猜测，再观察。**

大声说出你期望追踪中包含什么，然后打开它，把任何不匹配视为屏幕上最有趣的内容。这三篇文章中的每一个真正洞见——隐藏的 `Memcpy`、`addmm` 尾声、20 个内核的数学后端、闪存版“看似错误”的占用率、cuDNN 庞大的 CPU 条——都来自一个与追踪不匹配的猜测。

性能剖析并非 GPU 专家专属的独立、令人生畏的技能。它只是仔细观察并追问“等等，为什么*那个*会发生？”直到答案浮现的纪律。你现在已经掌握了在自己模型上这样做的词汇和反应能力。打开一个追踪，形成一个猜测，然后去寻找不匹配。

感谢阅读 **PyTorch 性能剖析** 系列。现在去剖析点什么吧。🤗

感谢 [Noe Flandre](https://huggingface.co/NoeFlandre) 对本文早期草稿的审阅！

> 这篇博客文章经过了大语言模型（LLM）的润色。这绝不意味着我们让某个智能体在后台运行并自动生成博客。团队中有些成员并非英语母语者，我们认为LLM（主要基于英语训练）能够纠正简单的语法错误，或重新组织更清晰、更易读的句子。希望这能解答“既然是用LLM生成的，我为什么还要读”的疑问。🤗
