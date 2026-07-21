---
title: 'Profiling in PyTorch (Part 1): A Beginner''s Guide to torch.profiler'
url: 'https://huggingface.co/blog/torch-profiler'
url_hash: 357d064be869168138435f793ed457a6cd6def45
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-05-29T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![博客文章缩略图](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/thumbnail.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/thumbnail.png)

> *无法剖析，便无法优化。*

无论你是想从大型语言模型（LLM）中榨取更多每秒令牌数，将推理时间缩短几毫秒，还是仅仅想弄清楚为什么你的训练循环运行速度比规格表承诺的要慢，最终都绕不开性能剖析。

问题在于，性能剖析的**入门门槛很高**。跟踪结果是一堵由彩色矩形构成的密集墙。事件名称令人望而生畏。大多数教程都假设你已经能读懂它们。因此，即使我们*知道*应该进行性能剖析，打开跟踪文件也常常感觉像是一件最好留到以后（或留给别人）做的苦差事。本文以及由此开启的系列文章，是我们降低这一门槛的尝试。

我们从初学者的角度记录这一过程。除了基础的 PyTorch 知识外，无需任何先决条件。请将其视为一次轻松的阅读，其中穿插着一些“顿悟”时刻。文章结构特意采用问题驱动的方式：我们打开一个跟踪文件，问“等等，为什么*会发生这种情况？”，然后追寻答案，直到豁然开朗。阅读本文后，你应该能够了解：

-   如何设置 `torch.profiler` 以及它实际返回什么，
-   如何读取性能分析器表格和跟踪结果（CPU 通道、GPU 通道以及两者之间可疑的间隙），
-   从 Python 调用一路到 CUDA 内核的事件链，
-   当你使用 `torch.compile` 时，什么会发生变化（以及更有趣的是，什么**不会**发生变化）。

在开始之前，先给出两个定义，这将有助于更好地理解下文：

1.  GPU **内核** 是一个在 GPU 的多个线程上并行运行的程序。
2.  CPU **调度并启动** 这些内核。

你通常不需要自己编写 GPU 内核；当你使用 PyTorch 操作时，它会自动转换成一个或多个在 GPU 上完成工作的内核。

带着这两个概念，让我们开始提问吧。

> 以下是我们在本文中使用的完整脚本：[`01_matmul_add.py`](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py)。我们建议你在新标签页中打开此脚本，并逐步浏览代码。我们使用 `NVIDIA A100-SXM4-80GB` GPU 来运行脚本。使用 [Dev Mode with Spaces](https://huggingface.co/docs/hub/spaces-dev-mode) 在 Hugging Face 基础设施上设置 GPU 并试验脚本非常容易。你也可以使用 [Hugging Face Jobs pipeline](https://huggingface.co/docs/huggingface_hub/en/guides/jobs) 运行脚本。

## [](#the-matrix-multiplication-and-addition-operation)矩阵乘法与加法操作

正如 [Dr. Sara Hooker 精辟地指出](https://youtu.be/7knwihgj0fU?si=uvzGH-J9bsCHP4Nn&t=2199)，就像我们主要由水构成一样，深度神经网络主要由矩阵乘法构成。既然矩阵乘法如此基础，那么用其他任何操作来开启我们的性能剖析之旅都将是一种遗憾。

```
def fn(x, w, b):
  return torch.add(torch.matmul(x, w), b)
```

> 矩阵加法与矩阵乘法共同模拟了神经元中权重和偏置的交互方式。这种加法（双关语）将帮助我们理解它如何为[后文中的编译](#lets-see-some-torch-compile-at-work)铺平道路。

我们将使用 `torch.profiler` 模块进行性能分析。具体步骤如下：

1.  [准备好待分析的代码](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py#L26-L27)（此处为 `def fn`，它封装了矩阵乘法和矩阵加法）
2.  [对算法进行标注](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py#L32)。虽然这一步完全可选，但我们强烈建议执行。`record_function` 将我们的函数标注为 `matmul_add`，便于在追踪结果中定位（后文会提到）

```
def step():
  with torch.profiler.record_function("matmul_add"):
    return fn(x, w, b)
```

3.  使用 `torch.profiler.profile` [上下文管理器](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py#L53-L62)包裹代码

```
  with torch.profiler.profile(
    activities=[
        torch.profiler.ProfilerActivity.CPU,  # CPU 活动
        torch.profiler.ProfilerActivity.CUDA, # GPU 活动
    ],
  ) as prof:
    # 建议多次运行事件以预热 GPU
    for _ in range(5):
      step()
      prof.step()
```

4.  [导出](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py#L70)性能分析结果

```
# 分析器表格
prof.key_averages().table(sort_by="cuda_time_total", row_limit=15)

# 分析器追踪
prof.export_chrome_trace(trace_path)
```

分析器会生成两种不同的产物：

1.  **分析器表格**：提供算法的统计摘要。回答"什么占用了最多时间"的问题。这对于定位热点非常有帮助。热点是指耗时最长的事件，可能是流水线的瓶颈，也可能是被频繁触发的事件。
2.  **分析器追踪**：提供时间维度的执行视图。回答"操作在何时以及为何发生"的问题，展示 CPU 和 GPU 上的活动。当我们需要调查启动的内核、启动延迟、CPU 与 GPU 活动之间的重叠情况时，这非常有用。

让我们通过第一次执行来看看这两者的实际效果。（[这里是完整的 `01_matmul_add.py` 脚本](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py)）

> 建议在配备 GPU 的机器上运行此脚本。

```
uv run 01_matmul_add.py --size 64
```

如果你（在 GPU 机器上）运行上述脚本，会在 `traces/01_matmul_add` 文件夹中找到两个产物：

```
64_bf16_cold_eager.json
64_bf16_cold_eager.txt
```

| [![64 尺寸矩阵的 matmul add 分析器表格](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/profile-table-64.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/profile-table-64.png) |
| --- |
| 图 1：64 尺寸矩阵的 matmul add 分析器表格 |

`.txt` 文件保存了分析器表格。打开文件后，如图 1 所示，你会看到一个大型表格，第一列包含在分析范围内触发的事件。

其他列与事件在 CPU、GPU 或 `torch.profiler.profile` 中 `activities` 指定的其他设备上花费的时间有关。查看哪些事件耗时最长，并尝试凭直觉判断该事件是否确实应该花费那么长时间。同时，关注"# of Calls"列也很重要，它指示了事件被触发的次数。

既然我们在讨论这个话题，不妨也聊聊"Self CPU/CUDA"与"CPU/CUDA total"的区别。"Self"列仅衡量事件本身（不包括其子事件）所花费的时间，而"total"列则包含事件及其所有子事件的总耗时。因此，如果你查看`matmul_add`的"CPU total"，它由该事件自身的耗时加上其触发的子事件耗时共同构成。这是一个需要特别注意的细微差别。

观察表格最后两行，你会发现分析器显示：

```
Self CPU time total: 2.314ms
Self CUDA time total: 23.104us
```

CPU时间以毫秒(ms)为单位，而GPU时间以微秒(us)为单位。直观来看，GPU（内核`ampere_bf16_s16816gemm...`）的耗时不到CPU（`matmul_add`操作）耗时的1%。GPU大部分时间处于空闲状态，这是一个明显的警示信号。造成这种现象的原因是GPU能极快地完成小型矩阵乘法运算，因此我们的代码大部分时间都花在准备内核、将其调度到GPU、传输待乘数据以及收集结果上。这种概念被称为*开销主导型算法*。

摆脱这种困境的最简单方法是使用更大的矩阵乘法。

```
uv run 01_matmul_add.py --size 4096
```

| [![针对4096大小矩阵的matmul add算法分析器表格](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/profiler-table-4096.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/profiler-table-4096.png) |
| --- |
| 图2：针对4096大小矩阵的matmul add算法分析器表格 |

图2的最后两行显示：

```
Self CPU time total: 4.908ms
Self CUDA time total: 4.495ms
```

两个时间单位均为毫秒，这意味着我们仅通过增大矩阵乘法的规模就实现了更多GPU时间的实质化。观察图2你还会发现，现在CUDA时间主要消耗在GPU内核（`ampere_bf16_s16816gemm_..`）上，而非启动它的CPU操作（`matmul_add`）。这表明我们确实成功从开销主导型转向了计算主导型。

接下来我们将进入调度链的可视化环节，这些信息存储在`.json`文件中。你可以将其上传至[Perfetto UI](https://ui.perfetto.dev/)查看追踪结果，或者使用`uvx trace-util -f traces -b <hf_uname>/traces`直接生成Perfetto链接。

## [](#64x64-traces)64x64追踪结果

| [![PyTorch分析器追踪：CUDA GPU上64×64 bf16矩阵乘法与加法操作](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/64-matmul-add.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/64-matmul-add.png) |
| --- |
| 图3：64大小矩阵的matmul与add操作分析器追踪结果 |

在图3中，我们看到了矩阵乘法与加法操作的分析器追踪结果。这里条形宽度表示事件持续时间，垂直嵌套表示调用层级关系，CPU通道显示CPU上发生的事件，而GPU通道则展示实际的内核执行情况。你还会注意到空白区域，这些代表等待或空闲时间。

该脚本使用默认配置运行，具体配置为：

-   size 64：输入、权重和偏置的大小均为 (64, 64)
-   dtype bf16：数据类型为 bfloat16
-   no compile：未对 torch 操作进行编译
-   no warmup：在性能分析前未预热 GPU

> 使用 Perfetto 时，建议通过键盘快速浏览跟踪信息。可以使用 "W A S D" 键进行导航。

| [![PyTorch 性能分析器跟踪，在 Perfetto 中并排显示 CPU 通道和 GPU 通道](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/gpu-cpu-trace.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/gpu-cpu-trace.png) |
| --- |
| 图 4：PyTorch 性能分析器跟踪中的 CPU 和 GPU 通道 |

图 4 中有两个通道，一个用于 CPU 活动，另一个用于 GPU 活动。在 CPU 通道中，会注意到三个分析步骤（从 `ProfilerStep#2` 开始）。这源于 `schedule`。

```
schedule = torch.profiler.schedule(wait=1, warmup=1, active=3, repeat=1)
```

`wait` 跳过噪声初始化（`ProfilerStep#0`），`warmup` 在不记录的情况下运行分析器（`ProfilerStep#1`），而 `active` 则是跟踪中显示的内容。可以在[此处的脚本](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py#L58)中找到所使用的调度。

现在，让我们戴上侦探帽，调查跟踪信息并提出一些问题。

### [](#为什么-profilerstep2-耗时这么长)为什么 ProfilerStep#2 耗时这么长？

| [![PyTorch 性能分析器跟踪中的 ProfileStep#2 比 ProfileStep#3 和 ProfileStep#4 更宽](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/why-is-step-2-big.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/why-is-step-2-big.png) |
| --- |
| 图 5：`ProfileStep#2` 明显比后续步骤更宽 |

在图 5 中，我们注意到 `ProfileStep#2` 比其他步骤花费更多时间，仔细观察会发现 `matmul_add` 注释也有类似模式。问题出在注释内部，而不是注释本身：

| 步骤 | `matmul_add` 开始 | `aten::matmul` 开始 | 间隔 |
| --- | --- | --- | --- |
| #2 | 138.736 | 366.493 | 227.757 µs |
| #3 | 517.926 | 523.447 | 5.521 µs |
| #4 | 610.039 | 614.527 | 4.488 µs |

| [![分析步骤 2 中 record_function matmul_add 与 aten::matmul 调度之间的 228 微秒间隔](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/gap-227.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/gap-227.png) |
| --- |
| 图 6：`record_function("matmul_add")` 与 PyTorch 实际调度 `aten::matmul` 之间约 228 µs 的死窗口 |

图 6 中显示的约 228 µs 是进入 `record_function("matmul_add")` 与 PyTorch 实际调度 `aten::matmul` 之间的“死窗口”。这可能是由多种原因造成的，包括工作空间分配、[cuBLAS](https://developer.nvidia.com/cublas)（NVIDIA 专有的 GPU 加速库，用于执行基本线性代数运算）启发式算法或延迟模块加载。我们可以选择忽略它，或者在性能分析前运行[更多预热步骤](https://huggingface.co/datasets/ariG23498/profiling-pytorch/blob/main/01_matmul_add.py#L35-L39)（这是标准做法）。

在性能分析中，预热是指在正式分析前先运行若干次事件。GPU 执行的预处理工作（包括上述指针操作）属于一次性开销，我们并不希望将其纳入分析范围。在我们的示例中，预热分为两个阶段：一是在进入分析器前对函数进行实际循环，二是在分析器内部通过 `warmup` 参数实现。本节中，我们已启用实际迭代次数并配合调度策略。

```
uv run 01_matmul_add.py --warmup
```

[64x64 矩阵预热后的 Perfetto 追踪](https://ui.perfetto.dev/#!/?url=https://huggingface.co/buckets/ariG23498/traces/resolve/01_matmul_add/64_bf16_warm_eager.json)

| [![预热步骤后的 PyTorch 分析器追踪，ProfileStep#2 不再显示冷启动开销](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/warmup.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/warmup.png) |
| --- |
| 图 7：预热后，每个分析步骤耗时相近 |

从图 7 可以看出，每个分析步骤耗时相近，但这并不意味着我们优化了一次性开销。我们通过预热运行，使这些开销不被纳入分析。我们认为若在本节结尾不提供解决思路而草草收场，对读者有失公允，因此附上[链接](https://pytorch.org/blog/accelerating-generative-ai-2/)，供读者进一步了解如何优化启动开销。

### [](#为什么-cpu-和-gpu-通道之间存在约-25-毫秒的偏移)为什么 CPU 和 GPU 通道之间存在约 2.5 毫秒的偏移？

| [![PyTorch 分析器追踪中 CPU 通道与 GPU 通道之间的 2.32 毫秒偏移](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/gap-bw-kernel-launch.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/gap-bw-kernel-launch.png) |
| --- |
| 图 8：CPU 与 GPU 通道之间约 2.5 毫秒的偏移 |

在图 8 中，我们看到 CPU 和 GPU 通道之间存在约 2.5 毫秒的偏移：这是 CPU 提交 CUDA 内核后到内核实际开始执行之间的延迟。有人可能会认为，预热阶段结合调度策略中的 `wait` 和 `warmup` 参数应能使 GPU 保持忙碌状态，从而缩小这一偏移。

为了揭示实际情况，让我们稍微调整调度策略：

```
- schedule = torch.profiler.schedule(wait=1, warmup=1, active=3, repeat=1)
+ schedule = torch.profiler.schedule(wait=0, warmup=0, active=3, repeat=1)
```

| [![wait=0 warmup=0 的 PyTorch 分析器追踪，显示步骤间存在活动缓冲区请求](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/full-profile.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/full-profile.png) |
| --- |
| 图 9：当 `wait=0` 且 `warmup=0` 时，追踪显示存在 `Activity Buffer Request` |

图 9 显示，在任何操作之前，GPU 通道中存在一个 `Activity Buffer Request`。让我们进一步放大观察。

| [![matmul 与 add CUDA 内核之间的间隙，由分析器缓冲区请求导致](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/mat-add-gap.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/mat-add-gap.png) |
| --- |
| 图 10：在分析步骤 1 中，matmul 与 add 内核之间出现间隙 |

放大GPU追踪图后，我们注意到`ProfileStep#0`（其CPU追踪在图例中不可见）的矩阵乘法和加法核函数是依次执行的，而`ProfileStep#1`的核函数之间则存在时间间隔。对此最合理的解释是：发生了缓冲区溢出，导致在核函数执行期间触发了另一个缓冲区请求（即请求在GPU显存中分配内存）。

要排除其他可能性，最佳方法是采集更多迭代次数的性能数据，观察追踪图其他部分是否出现类似的时间间隔。为此我们设置`active=20`进行测试。

| [![PyTorch Profiler追踪图显示20次活跃迭代，确认缓冲区请求间隔仅出现一次](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/20-iters.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/20-iters.png) |
| --- |
| 图11：在20个活跃步骤中，该间隔仅出现一次，证实了缓冲区请求的存在 |

如图11所示，我们在`ProfileStep#1`中观察到了相似的趋势。这与之前的发现一致，可以安全地得出结论：这确实是另一个缓冲区请求。

### [](#事件链)事件链

| [![PyTorch Profiler中的嵌套CPU调度链：ProfileStep、matmul_add、aten::matmul、aten::mm](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/cpu-nests.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/cpu-nests.png) |
| --- |
| 图12：调度链 |

在图12中，我们看到了嵌套的CPU调用。这是一个重要的可视化结果，能帮助理解调度链的真实结构。

我们从`ProfileStep#<id>`开始，它封装了性能分析步骤。由于我们对步骤进行了标注，可以看到`matmul_add`行。`matmul_add`包含两个`aten`调用，分别用于矩阵乘法和矩阵加法。

`aten::matmul`是[ATen层](https://github.com/pytorch/pytorch/tree/main/aten/src/ATen)的调度入口，用户层面的PyTorch矩阵乘法调用最终会落到这里。`aten::mm`则是二维矩阵乘法的后端实现。

值得注意的是，如果为矩阵添加批次维度，PyTorch会调用`aten::bmm`（批量矩阵乘法）。让我们暂时绕道，看看`aten::bmm`的实际运行情况。

```
- x = torch.randn(args.size, args.size, device=device, dtype=dtype)
- w = torch.randn( args.size, args.size, device=device, dtype=dtype)
- b = torch.randn(args.size, args.size, device=device, dtype=dtype)

+ # 添加批次大小为8
+ x = torch.randn(8, args.size, args.size, device=device, dtype=dtype)
+ w = torch.randn(8, args.size, args.size, device=device, dtype=dtype)
+ b = torch.randn(8, args.size, args.size, device=device, dtype=dtype)
```

| [![PyTorch Profiler追踪图显示aten::matmul为3D批量张量调度aten::bmm](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/bmm.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/bmm.png) |
| --- |
| 图13：批量矩阵乘法 |

在图13中，当为输入添加批次维度后，`aten::matmul`现在封装了一系列其他必要的CUDA运行时调用，以及`aten::bmm`（替代了原来的`aten::mm`）。这也暗示了cuBLAS需要执行的启发式策略，以便为程序调度最合适的核函数。

> 在本文后续部分，除非另有说明，我们将使用简单的二维矩阵进行演示。

### [](#为什么matmul会有额外的cuda运行时调用)为什么matmul会有额外的CUDA运行时调用？

| [![CPU 通道显示在 matmul cudaLaunchKernel 之前有 cudaOccupancyMaxActiveBlocksPerMultiprocessor](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/cudaoccupancy.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/cudaoccupancy.png) |
| --- |
| 图 14：在矩阵乘法内核启动前触发的 CUDA 占用率查询 |

我们注意到，对于 `aten::mm` 有两个 CUDA 运行时调用，分别是 `cudaOccupancyMaxActiveBlocksPerMultiprocessor`（图 14 中框选部分）和 `cudaLaunchKernel`，而 `aten::add` 只有 `cudaLaunchKernel`。

`cudaOccupancyMaxActiveBlocksPerMultiprocessor` 是一个规划调用，完全在 CPU 侧执行。它询问的是："给定一个内核函数、选定的块大小和选定的动态共享内存大小，该内核有多少个块可以同时驻留在一个 SM（流式多处理器）上？"

这引出一个问题：为什么矩阵乘法需要规划，而加法不需要？

要理解这一点，我们需要查看内核的资源占用情况。如果点击 GPU 内核，就可以检查相应内核的资源占用情况。

在图 15 中，我们注意到矩阵乘法的 `每线程寄存器数` 和 `共享内存` 是动态的（取决于矩阵大小）。cuBLAS 提供了数百种内核变体，每种都有基于启发式的启动路径，需要关于硬件容量的运行时信息。占用率查询就是该启发式的一部分。从概念上讲，我们可以将 GPU 加速的矩阵乘法视为[在独立分块上工作](https://alvinwan.com/how-to-tile-matrix-multiplication/)：使用多少分块以及每个分块的大小取决于矩阵和硬件。现代算法远比这复杂，但这仍然是一个很好的参考框架。

从图 16 中我们看到，加法的资源占用显示为 32 个寄存器和零共享内存。这显然很容易满足。无需查询，因为没有硬件资源会限制占用率。该内核在设计上就是资源轻量型的。

> 在阅读任何跟踪信息时，你可以将此作为快速诊断方法。扫描 CPU 通道中的 `cudaOccupancyMaxActiveBlocksPerMultiprocessor`。每次出现都标记了一个"重量级、自适应启动"的内核，通常是 GEMM（通用矩阵乘法）、卷积或类似操作。没有前置占用率查询的内核是 PyTorch 机械启动的逐元素/归约类内核。

### [](#为什么-cudadevicesynchronize-这么大-178-ms)为什么 cudaDeviceSynchronize 这么大（约 1.78 毫秒）？

`cudaDeviceSynchronize` 会阻塞 CPU，直到该设备上的所有 GPU 工作完成。分析器在活动窗口结束时发出此同步以刷新事件。如果没有它，内核计时将会缺失。

一个覆盖 26 微秒实际 GPU 工作的 1.78 毫秒同步告诉你，这次运行有 98% 的时间处于空闲状态。这是典型的开销受限症状。

## [](#4096x4096-跟踪信息)4096x4096 跟踪信息

从上面的分析器表格分析中我们已经知道，为算法提供更大的矩阵会使其从开销受限区域转移到计算受限区域。

让我们运行命令并深入分析跟踪信息。

```
uv run 01_matmul_add.py --size 4096 --warmup
```

### [](#为什么相同的内核比其他内核花费更多时间)为什么相同的内核比其他内核花费更多时间？

| [![4096x4096 bf16 矩阵乘法内核时间在同一 GPU 上的分析器步骤中变化](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/kernel-time.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/kernel-time.png) |
| --- |
| 图 17：尽管输入相同，一个矩阵乘法内核的运行时间比其他内核更长 |

在图17中，我们注意到`ProfileStep#3`的矩阵乘法内核在GPU上的耗时比其他步骤更长。这一点特别值得关注，因为启动的其他内核完全相同，这意味着没有涉及cuBLAS的启发式算法。不存在调度间隙，CPU启动正常，也不是性能分析器的伪影。

图17中的这个追踪记录揭示了一个在理想化示例中容易被忽略的重要观点：即使在同一硬件环境下运行相同代码处理相同数据，内核运行时间也并非恒定值。

让我们通过稍微修改脚本使这一点更具体。我们将迭代运行20次，捕获每一步的数据。

```
- schedule = torch.profiler.schedule(wait=1, warmup=1, active=3, repeat=1)
+ schedule = torch.profiler.schedule(wait=0, warmup=0, active=20, repeat=1)

- for _ in range(5):
+ for _ in range(20):
```

| [![PyTorch profiler trace of 20 matmul iterations showing kernel runtime variance](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/20-iters-kernels.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/20-iters-kernels.png) |
| --- |
| 图18：在20次迭代中，相同的矩阵乘法内核以不同速度运行 |

图18揭示了类似的发现。虽然每个内核完全相同，但它们的耗时却不同。不同的计算时间可归因于多种原因：

-   GPU在空闲和升频时的时钟频率
-   GPU发热
-   GPU电源管理
-   驱动端的后台维护

只看平均值的读者会得出矩阵乘法耗时约1毫秒（5次平均值为1084微秒）的结论；而查看追踪记录的读者会发现，除了GPU偶尔异常外，矩阵乘法通常耗时约580微秒。这是两种截然不同的认知模型，且只有后者是正确的。

## [](#lets-see-some-torchcompile-at-work)让我们看看torch.compile的实际效果

使用`torch.compile`一直令我们惊叹。只需编写普通的即时PyTorch代码，但PyTorch会尝试捕获张量密集型区域，将其转化为计算图，进行优化，并运行生成的代码。默认后端通常是`TorchInductor`，其整体流程为：

1.  `TorchDynamo`将Python执行过程捕获为FX计算图
2.  `AOTAutograd`在涉及梯度时准备前向/反向计算图
3.  `Inductor`将计算图降级为优化的CPU或GPU代码。

在本节中，我们将讨论编译过程并查看性能分析器追踪记录。

```
uv run 01_matmul_add.py --size 4096 --warmup --compile
```

`args.compile`标志触发以下代码：

```
def fn(x, w, b):
  return torch.add(torch.matmul(x, w), b)

fn = torch.compile(fn) if args.compile else fn
```

| [![torch.compile region highlighted in a PyTorch profiler trace, showing TorchDynamo and Inductor frames](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/compilation-region.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/compilation-region.png) |
| --- |
| 图19：编译区域在追踪记录中显示为TorchDynamo和Inductor框架 |

在图19中，我们看到新的CPU行名为`Torch-Compiled Region: 0/0`，这指向正在使用的编译函数。

### [](#did-we-fuse-the-matmul-and-add-kernels-into-one)我们是否将矩阵乘法和加法内核融合为一个？

| [![Compiled trace showing aten::addmm replacing the eager aten::add and aten::mm pair](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/fused-ops.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/fused-ops.png) |
| --- |
| 图20：编译运行分派单个`aten::addmm` |

观察图20，我们不禁要问：我们真的将乘法与加法运算融合成一个操作了吗？

这是图级别的算子融合。Inductor将我们的`torch.add(torch.matmul(x, w), b)`重写为单个`aten::addmm(b, x, w)`调用。这里需要注意的关键点是，它**没有**生成**新的**融合CUDA内核。实际的GPU工作仍然是`ampere_bf16_s16816gemm_bf16_128x256_ldg8_f2f_stages_64x3_nn`，与即时模式使用的cuBLAS内核相同。因此，这里的"融合"发生在调度器层面，而非内核层面。

> PyTorch提供了[`torch.addmm`](https://docs.pytorch.org/docs/2.12/generated/torch.addmm.html)函数，可以一步完成我们之前两步的操作，即乘法和加法。我们鼓励读者查看该函数的追踪结果，并在下方评论区分享你的观察！

### [](#torchcompiles-runtime-architecture)torch.compile的运行时架构

虽然理论上我们了解编译函数时会发生什么，但实际观察其运行过程同样重要。让我们看看反映`torch.compile`运行时架构的CPU端层次结构。

**TorchDynamo缓存查找**是Dynamo检查当前调用是否仍与编译时相同的输入形状、数据类型、设备和张量元数据匹配的地方。如果任何内容不匹配，Dynamo将重新编译。即使在编译后，每次调用都会产生此开销。

**Torch-Compiled Region**是"进入"编译版本的包装器。**AOTDispatcher运行时包装器序言**是AOT Autograd的运行时包装器。尽管这里不需要梯度，但AOTDispatcher始终存在于堆栈中，处理张量元数据、视图跟踪，并在`requires_grad`为真时设置反向传播。

**## Call CompiledFxGraph**是实际生成的代码运行的地方。"CompiledFxGraph"后的字符串是FX图的内容哈希。在所有三个活跃步骤中它都相同，确认了缓存命中。

> 你可以在磁盘上的`/tmp/torchinductor_<user>/fxgraph`目录下找到以此哈希为键的生成代码，当你想要阅读Inductor实际生成的Triton/C++代码时，这会很有用。

### [](#do-the-cuda-launches-go-down-by-half)CUDA启动次数是否减少了一半？

| [![编译后的matmul追踪显示每步启动Memcpy DtoD和GEMM内核](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/memcpy.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/torch-profiler/memcpy.png) |
| --- |
| 图21：每个编译步骤仍然启动两个GPU内核：一个设备到设备的内存复制和GEMM |

查看图21中的追踪结果，我们很高兴地注意到每步只有一个`cudaLaunchKernel`。这一观察结果与我们之前在GPU追踪中看到的情况直接矛盾。每步仍然启动了两个内核，即`Memcpy DtoD（设备 -> 设备）`和GEMM。回到CPU追踪，我们发现自己完全忽略了`cudaMemcpyAsync`调度。

`addmm`计算`out = α·A·B + β·C`，而cuBLAS的带偏置加法后处理的GEMM会写入一个目标缓冲区，该缓冲区需要已包含偏置。后处理可以理解为GEMM**之后**发生的所有操作。在深度学习领域，我们不断遇到GEMM后处理，如激活函数、偏置加法、归一化等。这就是存在cuBLAS GEMM带后处理内核变体的原因。

> 如果你对 `torch.compile` 使用不同的 `mode`，会注意到启动的内核变体有所不同。你可以亲自尝试，并在下方评论中分享你的观察！

因此，Inductor 生成的代码执行了以下操作：

-   `out = copy(C)` ← 这是 DtoD 内存拷贝（32 MB，耗时约 33 µs）
-   `out = α·(A·B) + β·out` ← 使用 `α=β=1` 的 GEMM，将偏置加法融合到回写操作中

结果在数学上仍然相同。偏置加法并非免费，因为我们预先支付了一次内存拷贝，外加一个稍昂贵的 GEMM 尾声。

人们可能期望的融合——即 `x·w + b`（此处为 `out = α·A·B + β·C`）能合并为单个内核，且无额外内存流量——并未实现。Inductor 保留了两次内存访问操作，只是将偏置拷贝重新标记为内存拷贝，将加法重新标记为 GEMM 尾声。

真正融合的实现会跳过内存拷贝。这正是 FlashAttention 风格的手写内核所做的，也是 Inductor 通过 Triton 代码生成所能实现的，但对于 `4096×4096 bf16 矩阵乘法`，Inductor 显然认为“使用 cuBLAS，通过尾声设置处理偏置”是最佳路径。

### [](#cpu-overhead-went-up-not-down)CPU 开销不降反升

这是比较即时执行和编译执行时最容易忽略的一点：

| 步骤 | 即时执行耗时 (ms) | 编译执行耗时 (ms) |
| --- | --- | --- |
| #2 | 0.1 | 0.2 |
| #3 | 0.07 | 0.1 |
| #4 | 0.07 | 0.1 |

`torch.compile` 在 CPU 上的每一步开销大约高出 2 倍。这是因为每次调用都会遍历完整的 Dynamo > AOTAutograd > Inductor 堆栈，同时还要执行我们已有的 `aten::addmm` 分发。编译流水线是为包含数十个操作的 ML 模型设计的，其中每次调用的开销会被分摊（对于单个操作来说，这是一种额外负担）。

> `torch.compile` 有一个 `mode` 参数。留给读者作为作业：阅读文档，找出一种能降低 CPU 开销的 `mode`。🤗

## [](#trace-reading-cheatsheet)跟踪读取速查表

以下是我们所讨论模式的快速参考。思路是：如果你在跟踪中看到以下内容，通常意味着什么。

### [](#profiler-table)性能分析器表格

| 你看到的 | 通常意味着 |
| --- | --- |
| `Self CPU time total` ≫ `Self CUDA time total`（CPU 单位为毫秒，GPU 单位为微秒） | 开销受限。CPU 在调度上花费的时间比 GPU 在计算上花费的时间更多。请增大工作负载（更大的矩阵、批处理操作）或融合调用。 |
| `Self CPU time total` ≈ `Self CUDA time total`，两者均为毫秒 | 计算受限。GPU 是瓶颈，这通常是您希望看到的情况。 |
| 某个事件在 `CUDA total` 中占主导地位 | 这就是您的热点。请从此处开始优化。 |
| 某个事件的 `# of Calls` 非常大 | 即使每次调用开销很小，也可能是潜在瓶颈。检查是否可以将其融合或批处理。 |
| 某行的 `CPU total` ≫ `Self CPU` | 大部分开销在子事件中。请深入分析嵌套事件，而非父事件。 |

### [](#cpu-lane)CPU 通道

| 你看到的 | 通常意味着 |
| --- | --- |
| 第一个 `ProfileStep` 远宽于其余步骤 | 冷启动开销：工作空间分配、cuBLAS 启发式算法、模块懒加载。请添加预热迭代和/或调度中的 `warmup` 参数。 |
| `record_function("...")` 开始与第一个 `aten::*` 之间存在较大间隔 | 同样是冷启动开销，只是放大了细节。注解已进入，但调度尚未发生。 |
| `cudaLaunchKernel` 之前的 `cudaOccupancyMaxActiveBlocksPerMultiprocessor` | 一个重量级、自适应启动的内核（GEMM、卷积等）。cuBLAS 正在向驱动查询一个 SM 上能容纳多少个块，以便选择内核变体。 |
| 没有前置占用查询的 `cudaLaunchKernel` | 一个元素级或规约内核，具有固定的、资源轻量的占用。无需规划。 |
| 活动窗口末尾出现较长的 `cudaDeviceSynchronize` | 分析器正在刷新事件。其持续时间主要是 GPU 完成待处理工作的时间，而非真实的 CPU 开销。覆盖微小 GPU 工作的同步是经典的开销受限症状。 |
| 一个您未编写的 `cudaMemcpyAsync` | 通常是隐藏的设备到设备拷贝。常见于 `addmm` 在 GEMM 后处理之前用偏置初始化目标缓冲区时。 |

### [](#gpu-lane)GPU 通道

| 你看到的内容 | 通常含义 |
| --- | --- |
| GPU 通道上的 `Activity Buffer Request` | 分析器正在分配/重新填充自身的事件缓冲区。第一个通常用于计算初始的 CPU↔GPU 通道偏移量。 |
| 单个步骤中两个内核之间的间隙 | 可能是执行过程中的另一个缓冲区请求。通过运行更多迭代来确认：如果只出现一次，那就是分析器的问题，而非你的代码。 |
| 同一内核在不同步骤中耗时不同 | GPU 时钟、温度、电源管理、驱动程序维护。请查看跟踪信息，而不仅仅是平均值。 |
| 名为 `ampere_bf16_s16816gemm_...` 的内核 | 矩阵乘法的实际 cuBLAS GPU 计算。对于相同的形状/数据类型，内核名称在 eager 模式和编译模式下通常相同。 |
| GEMM 之前的 `Memcpy DtoD` | `addmm` 后置操作的偏置复制。"融合"发生在调度器层面，而非内核层面。 |

### [](#dispatch-chain)调度链

| 你看到的内容 | 通常含义 |
| --- | --- |
| `ProfileStep#N` → `<record_function name>` → `aten::*` → `aten::mm` / `aten::bmm` / `aten::add` | 标准的嵌套调用层次结构。自身时间排除子项；总时间包含子项。 |
| `aten::matmul` 解析为 `aten::mm` | 二维 × 二维矩阵乘法。 |
| `aten::matmul` 解析为 `aten::bmm`（带有额外的 CUDA 运行时调用） | 对三维及以上张量进行批量矩阵乘法。cuBLAS 会进行更多启发式工作来选择变体。 |
| `aten::addmm(b, x, w)` 替代单独的 `aten::add` + `aten::mm` 对 | 调度器层面的算子融合。GPU 内核仍然是相同的 GEMM，偏置加法被折叠到后置操作中。 |

### [](#torchcompile)torch.compile

| 你看到的内容 | 通常含义 |
| --- | --- |
| CPU 通道上的 `Torch-Compiled Region: K/M` 行 | 你处于编译函数内部。 |
| 每一步都出现 `TorchDynamo Cache Lookup` | Dynamo 正在验证形状/数据类型/设备是否与缓存的编译结果匹配。每次调用都会产生开销，即使在编译之后。 |
| 即使没有梯度也出现 `AOTDispatcher Runtime Wrapper Prologue` | AOTAutograd 的运行时包装器始终在堆栈中，负责处理张量元数据和视图跟踪。 |
| 各步骤中哈希值相同的 `## Call CompiledFxGraph <hash>` | 对生成代码的缓存命中。生成的源代码位于 `/tmp/torchinductor_<user>/fxgraph/<hash>` 下。 |
| 对于微小算子，`torch.compile` 下每步的 CPU 时间高于 eager 模式 | 这是预期的。Dynamo → AOTAutograd → Inductor 堆栈是一种开销，只有在处理多个算子时才能摊销。 |

## [](#conclusion)结论

我们从一个小型的 `matmul + add` 开始，并以此为契机学习如何阅读 PyTorch 分析器。在此过程中，我们掌握了一些适用于更大工作负载的思维模型。这是 **PyTorch 性能分析**系列的第一站。[在后续文章中](https://huggingface.co/blog/torch-mlp-fusion)，我们将逐步告别这个双算子玩具，沿着复杂性阶梯向上攀登，研究更大的构建模块，并最终分析真实模型。

感谢 [Noe Flandre](https://huggingface.co/NoeFlandre)、[Suvaditya Mukherjee](https://huggingface.co/suvadityamuk) 和 [Vidit Ostwal](https://huggingface.co/ViditOstwal) 对本文早期草稿的审阅！

> 本文借助大语言模型（LLM）进行了润色。这绝不意味着我们放任 AI 在后台自动生成整篇博客。团队中有部分成员并非英语母语者，我们认为 LLM（主要基于英语语料训练）能够修正一些语法错误，或对表达进行优化，使其更简洁易懂。希望这能帮助大家理解“既然是用 LLM 生成的，我为什么还要阅读”这一想法。🤗
