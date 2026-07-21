---
title: >-
  Improving LoRA: Implementing Weight-Decomposed Low-Rank Adaptation (DoRA) from
  Scratch
url: 'https://magazine.sebastianraschka.com/p/lora-and-dora-from-scratch'
url_hash: 9d0f12f4323caf26b7608d27057cda2356d3c62f
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2024-02-18T08:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
original_lang: en
truncated: false
---
低秩适应（LoRA）是一种机器学习技术，通过仅调整预训练模型（例如大语言模型或视觉Transformer）中一小部分低秩参数，使其更好地适配特定（通常较小）的数据集。

这种方法之所以重要，是因为它能够高效地在任务特定数据上微调大型模型，显著降低微调所需的计算成本和时间。

上周，研究人员提出了 [DoRA：权重分解低秩适应](https://arxiv.org/abs/2402.09353)，这是 LoRA 的一种新替代方案，可能在性能上大幅超越 LoRA。

为了理解这些方法的工作原理，本文将从零开始用 PyTorch 实现 LoRA 和 DoRA！

在深入 DoRA 之前，先简要回顾一下 [LoRA](https://arxiv.org/abs/2106.09685) 的工作原理。

由于大语言模型规模庞大，在训练过程中更新所有模型权重会因 GPU 内存限制而代价高昂。假设某层有一个大型权重矩阵 ***W***。在反向传播过程中，我们会学习一个 ***ΔW*** 矩阵，其中包含如何更新原始权重以最小化训练损失函数的信息。

在常规训练和微调中，权重更新定义如下：

***Wupdated = W + ΔW***

[Hu](https://arxiv.org/abs/2106.09685) *[等人](https://arxiv.org/abs/2106.09685)* 提出的 LoRA 方法提供了一种更高效的替代方案，通过学习 ***ΔW*** 的近似值 ***ΔW ≈ AB*** 来计算权重更新。换句话说，在 LoRA 中，我们有以下公式，其中 ***A*** 和 ***B*** 是两个小型权重矩阵：

***Wupdated = W + A.B***

（"***A.B***" 中的 "**.**" 表示矩阵乘法。）

下图并排展示了全微调和 LoRA 的公式。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Fk3V!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Fk3V!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 424w, https://substackcdn.com/image/fetch/$s_!Fk3V!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 848w, https://substackcdn.com/image/fetch/$s_!Fk3V!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!Fk3V!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Fk3V!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg" width="1456" height="612" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/ee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:612,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Fk3V!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 424w, https://substackcdn.com/image/fetch/$s_!Fk3V!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 848w, https://substackcdn.com/image/fetch/$s_!Fk3V!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!Fk3V!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee7f7d37-3c0a-4f4a-9244-f73287af6211_1456x612.jpeg 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

*图：常规微调（左）与 LoRA 微调（右）的对比示意图。*

LoRA 如何节省 GPU 内存？如果预训练权重矩阵 ***W*** 是一个 1000×1000 的矩阵，那么常规微调中的权重更新矩阵 ***ΔW*** 也是一个 1000×1000 的矩阵。在这种情况下，***ΔW*** 有 1,000,000 个参数。如果我们考虑 LoRA 的秩为 2，那么 ***A*** 是一个 1000×2 的矩阵，***B*** 是一个 2×1000 的矩阵，使用 LoRA 时我们只需要更新 2×2×1000 = 4,000 个参数。在前面的例子中，秩为 2 时，参数数量减少了 250 倍。

当然，***A*** 和 ***B*** 无法捕捉 ***ΔW*** 所能捕捉的所有信息，但这正是设计意图。使用 LoRA 时，我们假设模型需要 *W* 是一个满秩的大矩阵，以捕捉预训练数据集中的所有知识。然而，当微调大语言模型时，我们不需要更新所有权重，也不需要像 ***ΔW*** 那样用大量权重来捕捉适应任务的核心信息；因此，我们通过 ***AB*** 实现低秩更新。

如果你仔细观察，上图中全量微调和LoRA的示意图与我之前展示的公式略有不同。这是因为矩阵乘法满足分配律：我们不必将权重与更新后的权重相加，而是可以保持它们分离。例如，如果***x***是输入数据，那么对于常规微调，我们可以写成：

***x.(W+ΔW) = x.W + x.ΔW***

类似地，对于LoRA，我们可以写成：

***x.(W+A.B)** = **x.W + x.A.B***

我们可以将LoRA权重矩阵保持分离这一事实，使得LoRA特别有吸引力。在实践中，这意味着我们根本不需要修改预训练模型的权重，因为我们可以即时应用LoRA矩阵。如果你正在考虑为多个客户托管一个模型，这一点尤其有用。你无需为每个客户保存大型的更新后模型，只需在原始预训练模型旁边保存一小套LoRA权重即可。

为了减少抽象性并提供更直观的理解，我们将在下一节中从头开始用代码实现LoRA。

我们首先初始化一个`LoRALayer`，它创建矩阵A和B，以及alpha缩放超参数和秩超参数。该层可以接受输入并计算相应的输出，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!wMom!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!wMom!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 424w, https://substackcdn.com/image/fetch/$s_!wMom!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 848w, https://substackcdn.com/image/fetch/$s_!wMom!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 1272w, https://substackcdn.com/image/fetch/$s_!wMom!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!wMom!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png" width="228" height="273.92226148409895" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/a11d59f4-a948-42de-a791-114d719f08f1_566x680.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:680,&quot;width&quot;:566,&quot;resizeWidth&quot;:228,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!wMom!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 424w, https://substackcdn.com/image/fetch/$s_!wMom!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 848w, https://substackcdn.com/image/fetch/$s_!wMom!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 1272w, https://substackcdn.com/image/fetch/$s_!wMom!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa11d59f4-a948-42de-a791-114d719f08f1_566x680.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>LoRA矩阵A和B的示意图，秩为</span><em>r</em><span>。</span></figcaption></figure>

在代码中，上图中描绘的这个LoRA层如下所示：

```
import torch.nn as nn

class LoRALayer(nn.Module):
    def __init__(self, in_dim, out_dim, rank, alpha):
        super().__init__()
        std_dev = 1 / torch.sqrt(torch.tensor(rank).float())
        self.A = nn.Parameter(torch.randn(in_dim, rank) * std_dev)
        self.B = nn.Parameter(torch.zeros(rank, out_dim))
        self.alpha = alpha

def forward(self, x):
        x = self.alpha * (x @ self.A @ self.B)
        return x
```

在上面的代码中，`rank`是一个超参数，用于控制矩阵*A*和*B*的内部维度。换句话说，该参数控制LoRA引入的额外参数数量，是决定模型适应性和参数效率之间平衡的关键因素。

第二个超参数`alpha`是一个缩放超参数，应用于低秩适应的输出。它本质上控制着被适应层的输出在多大程度上允许影响该层的原始输出。这可以看作是一种调节低秩适应对层输出影响的方式。

到目前为止，我们上面实现的`LoRALayer`类允许我们转换层输入`x`。然而，在LoRA中，我们通常希望替换现有的`Linear`层，以便将权重更新应用于现有的预训练权重，如下图所示：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!FOLT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!FOLT!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 424w, https://substackcdn.com/image/fetch/$s_!FOLT!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 848w, https://substackcdn.com/image/fetch/$s_!FOLT!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 1272w, https://substackcdn.com/image/fetch/$s_!FOLT!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!FOLT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png" width="284" height="294.4539877300613" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/fd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:676,&quot;width&quot;:652,&quot;resizeWidth&quot;:284,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!FOLT!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 424w, https://substackcdn.com/image/fetch/$s_!FOLT!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 848w, https://substackcdn.com/image/fetch/$s_!FOLT!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 1272w, https://substackcdn.com/image/fetch/$s_!FOLT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd61c168-2fd6-4b2f-b1ef-50e4da5a63e3_652x676.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>将LoRA应用于现有线性层</em></figcaption></figure>

为了将上图所示的原始线性层权重整合进来，我们将实现一个`LinearWithLoRA`层，它使用之前实现的`LoRALayer`，并可用于替换神经网络中现有的`Linear`层，例如LLM中的自注意力模块或前馈模块：

```
class LinearWithLoRA(nn.Module):

def __init__(self, linear, rank, alpha):
        super().__init__()
        self.linear = linear
        self.lora = LoRALayer(
            linear.in_features, linear.out_features, rank, alpha
        )

def forward(self, x):
        return self.linear(x) + self.lora(x)
```

请注意，由于我们在LoRA层中将权重矩阵B（`LoraLayer`中的`self.B`）初始化为零值，因此*A*与*B*的矩阵乘法结果是一个全零矩阵，不会影响原始权重（因为将0加到原始权重上不会改变它们）。

让我们在一个由单个`Linear`层表示的小型神经网络层上测试LoRA：

**输入：**

```
torch.manual_seed(123)
layer = nn.Linear(10, 2)
x = torch.randn((1, 10))

print("原始输出:", layer(x))
```

**输出：**

```
原始输出: tensor([[0.6639, 0.4487]], grad_fn=<AddmmBackward0>)
```

现在，将LoRA应用于`Linear`层，我们看到结果相同，因为我们尚未训练LoRA权重。换句话说，一切按预期工作：

**输入：**

```
layer_lora_1 = LinearWithLoRA(layer, rank=2, alpha=4)
print("LoRA输出:", layer_lora_1(x))
```

**输出：**

```
LoRA输出: tensor([[0.6639, 0.4487]], grad_fn=<AddmmBackward0>)
```

之前，我提到了矩阵乘法的分配律：

***x.(W+A.B)** = **x.W + x.A.B***。

在这里，这意味着我们也可以合并或融合LoRA矩阵和原始权重，这应该会产生一个等效的实现。在代码中，这种替代`LinearWithLoRA`层的实现如下所示：

```
class LinearWithLoRAMerged(nn.Module):
    def __init__(self, linear, rank, alpha):
        super().__init__()
        self.linear = linear
        self.lora = LoRALayer(
            linear.in_features, linear.out_features, rank, alpha
        )

def forward(self, x):
        lora = self.lora.A @ self.lora.B # 合并LoRA矩阵
        # 然后将LoRA与原始权重合并
        combined_weight = self.linear.weight + self.lora.alpha*lora.T 
        return F.linear(x, combined_weight, self.linear.bias)
```

简而言之，`LinearWithLoRAMerged`计算等式***x.(W+A.B)** = **x.W + x.A.B***的左侧，而`LinearWithLoRA`计算右侧——两者是等价的。

我们可以通过以下代码验证这会产生与之前相同的输出：

**输入：**

```
layer_lora_2 = LinearWithLoRAMerged(layer, rank=2, alpha=4)
print("LoRA输出:", layer_lora_2(x))
```

**输出：**

```
LoRA输出: tensor([[0.6639, 0.4487]], grad_fn=<AddmmBackward0>)
```

现在我们已经有了一个可用的LoRA实现，接下来看看如何在下一节中将其应用于神经网络。

为什么我们要用上述方式使用PyTorch模块来实现LoRA？这种方法使我们能够轻松地将现有神经网络（例如，大型语言模型的前馈或注意力模块）中的`Linear`层替换为新的`LinearWithLoRA`（或`LinearWithLoRAMerged`）层。

为简化起见，我们先聚焦于下图所示的小型3层多层感知机，而非大语言模型：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!866i!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!866i!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 424w, https://substackcdn.com/image/fetch/$s_!866i!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 848w, https://substackcdn.com/image/fetch/$s_!866i!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 1272w, https://substackcdn.com/image/fetch/$s_!866i!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!866i!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png" width="306" height="448.3481012658228" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:926,&quot;width&quot;:632,&quot;resizeWidth&quot;:306,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!866i!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 424w, https://substackcdn.com/image/fetch/$s_!866i!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 848w, https://substackcdn.com/image/fetch/$s_!866i!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 1272w, https://substackcdn.com/image/fetch/$s_!866i!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24331b05-95b4-4ea0-aa96-d035a929a932_632x926.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>一个简单的3层多层感知机</figcaption></figure>

在代码中，我们可以按如下方式实现上述多层感知机：

**输入：**

```
class MultilayerPerceptron(nn.Module):
    def __init__(self, num_features,
        num_hidden_1, num_hidden_2, num_classes):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(num_features, num_hidden_1),
            nn.ReLU(),
            nn.Linear(num_hidden_1, num_hidden_2),
            nn.ReLU(),

nn.Linear(num_hidden_2, num_classes)
        )

def forward(self, x):
        x = self.layers(x)
        return x

model = MultilayerPerceptron(
    num_features=num_features,
    num_hidden_1=num_hidden_1,
    num_hidden_2=num_hidden_2, 
    num_classes=num_classes
)

print(model)
```

**输出：**

```
MultilayerPerceptron(
  (layers): Sequential(
    (0): Linear(in_features=784, out_features=128, bias=True)
    (1): ReLU()
    (2): Linear(in_features=128, out_features=256, bias=True)
    (3): ReLU()
    (4): Linear(in_features=256, out_features=10, bias=True)
  )
)
```

使用 `LinearWithLora`，我们可以通过替换多层感知机模型中原有的 `Linear` 层来添加 LoRA 层：

**输入：**

```
model.layers[0] = LinearWithLoRA(model.layers[0], rank=4, alpha=8)
model.layers[2] = LinearWithLoRA(model.layers[2], rank=4, alpha=8)
model.layers[4] = LinearWithLoRA(model.layers[4], rank=4, alpha=8)

print(model)
```

**输出：**

```
MultilayerPerceptron(
  (layers): Sequential(
    (0): LinearWithLoRA(
      (linear): Linear(in_features=784, out_features=128, bias=True)
      (lora): LoRALayer()
    )
    (1): ReLU()
    (2): LinearWithLoRA(
      (linear): Linear(in_features=128, out_features=256, bias=True)
      (lora): LoRALayer()
    )
    (3): ReLU()
    (4): LinearWithLoRA(
      (linear): Linear(in_features=256, out_features=10, bias=True)
      (lora): LoRALayer()
    )
  )
)
```

然后，我们可以冻结原始的 `Linear` 层，仅使 `LoRALayer` 层可训练，操作如下：

**输入：**

```
def freeze_linear_layers(model):
    for child in model.children():
        if isinstance(child, nn.Linear):
            for param in child.parameters():
                param.requires_grad = False
        else:
            # 递归冻结子模块中的线性层
            freeze_linear_layers(child)

freeze_linear_layers(model)
for name, param in model.named_parameters():
    print(f"{name}: {param.requires_grad}")
```

**输出：**

```
layers.0.linear.weight: False
layers.0.linear.bias: False
layers.0.lora.A: True
layers.0.lora.B: True
layers.2.linear.weight: False
layers.2.linear.bias: False
layers.2.lora.A: True
layers.2.lora.B: True
layers.4.linear.weight: False
layers.4.linear.bias: False
layers.4.lora.A: True
layers.4.lora.B: True
```

根据上述 `True` 和 `False` 值，我们可以直观地确认现在只有 LoRA 层是可训练的（`True` 表示可训练，`False` 表示冻结）。在实际应用中，我们会使用这种 LoRA 配置在新数据集或新任务上训练网络。

为避免文章过长，此处略去了训练该模型的样板代码。但如果你对完整代码感兴趣，可以在此处找到独立的代码笔记本：[https://github.com/rasbt/dora-from-scratch](https://github.com/rasbt/dora-from-scratch)。

此外，如果你对 LoRA 的从头解释及其在大语言模型中的应用感兴趣，也欢迎查看我的 Lightning Studio：[LoRA From Scratch – Implement Low-Rank Adaptation for LLMs in PyTorch](https://lightning.ai/lightning-ai/studios/code-lora-from-scratch)。

你可能已经注意到，我们花了大量时间实现和讨论 LoRA。这是因为 DoRA（[权重分解低秩适配](https://arxiv.org/abs/2402.09353)）可以被视为 LoRA 的一种改进或扩展，它建立在 LoRA 之上，现在我们可以轻松地调整之前的代码来实现 DoRA。

DoRA 可通过两步来描述：第一步是将预训练权重矩阵分解为幅度向量（***m***）和方向矩阵（***V***）；第二步是对方向矩阵 ***V*** 应用 LoRA，并单独训练幅度向量 ***m***。

这种将矩阵分解为幅度和方向分量的做法，源于一个数学原理：任何向量都可以表示为它的幅度（标量值，表示其长度）与方向（单位向量，表示其在空间中的朝向）的乘积。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!pv7G!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!pv7G!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 424w, https://substackcdn.com/image/fetch/$s_!pv7G!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 848w, https://substackcdn.com/image/fetch/$s_!pv7G!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 1272w, https://substackcdn.com/image/fetch/$s_!pv7G!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!pv7G!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png" width="355" height="284.55613577023496" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:614,&quot;width&quot;:766,&quot;resizeWidth&quot;:355,&quot;bytes&quot;:56625,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!pv7G!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 424w, https://substackcdn.com/image/fetch/$s_!pv7G!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 848w, https://substackcdn.com/image/fetch/$s_!pv7G!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 1272w, https://substackcdn.com/image/fetch/$s_!pv7G!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a5bf344-2c27-4197-839f-6c28af722e0f_766x614.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>单个向量方向与幅度的示意图。例如，若有一个二维向量 [1, 2]，可将其分解为幅度 2.24 和方向向量 [0.447, 0.894]。那么 2.24 * [0.447, 0.894] = [1, 2]。</figcaption></figure>

在 DoRA 中，我们将这种分解为幅度和方向分量的方法应用于整个预训练权重矩阵 ***W***（而非单个向量），其中权重矩阵的每一列（向量）对应连接所有输入到特定输出神经元的权重。

因此，分解 ***W*** 的结果是一个幅度向量 ***m***，它表示权重矩阵中每个列向量的尺度或长度，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!aVuN!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!aVuN!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 424w, https://substackcdn.com/image/fetch/$s_!aVuN!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 848w, https://substackcdn.com/image/fetch/$s_!aVuN!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 1272w, https://substackcdn.com/image/fetch/$s_!aVuN!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!aVuN!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png" width="607" height="354.45255474452557" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/d07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:800,&quot;width&quot;:1370,&quot;resizeWidth&quot;:607,&quot;bytes&quot;:101903,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!aVuN!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 424w, https://substackcdn.com/image/fetch/$s_!aVuN!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 848w, https://substackcdn.com/image/fetch/$s_!aVuN!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 1272w, https://substackcdn.com/image/fetch/$s_!aVuN!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd07991e9-b89a-44f9-bba3-03bb7cb41288_1370x800.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>DoRA 中权重矩阵分解的示意图</figcaption></figure>

然后，DoRA 对方向矩阵 ***V*** 应用标准 LoRA，例如：

***W' = m (V + ΔV)/norm = m (W + AB)/norm***

这里的归一化（我在本概述中简写为 "norm" 以避免过度复杂化）基于 Saliman 和 Kingma 在 2016 年提出的权重归一化方法，详见论文 [《权重归一化：一种加速深度神经网络训练的简单重参数化方法》](https://arxiv.org/abs/1602.07868)。

DoRA 的两步过程（分解预训练权重矩阵并对方向矩阵应用 LoRA）在下图（来自 DoRA 论文）中进一步说明。

开发 DoRA 的动机源于对 LoRA 和全微调学习模式的分析与比较。DoRA 的作者发现，LoRA 会按比例增大或减小幅度和方向更新，但似乎缺乏像全微调那样仅进行细微方向调整的能力。因此，研究人员提出了将幅度和方向分量解耦的方法。

换句话说，他们的 DoRA 方法旨在仅对方向分量 ***V*** 应用 LoRA，同时允许幅度分量 ***m*** 被单独训练。

引入幅度向量 m 后，若将 DoRA 与 LoRA 对比，仅增加 0.01% 的参数。然而，在 LLM 和视觉 Transformer 基准测试中，研究人员发现即使将 DoRA 的秩减半（例如 DoRA 仅使用常规 LoRA 一半的参数），其性能仍优于 LoRA，如下方性能对比所示。

正如我几个月前在另一篇文章中所写，LoRA 需要仔细调整秩以优化性能：[使用 LoRA（低秩适配）微调 LLM 的实用技巧](https://magazine.sebastianraschka.com/p/practical-tips-for-finetuning-llms)。然而，DoRA 对秩的变化似乎更具鲁棒性，如下方对比所示。

能够以相对较小的秩成功使用 DoRA，使得该方法比 LoRA 更具参数效率。

总体而言，我对这些结果印象深刻，并且将 LoRA 实现升级为 DoRA 的难度并不大，我们将在下一节中完成这一操作。

在本节中，我们将了解 DoRA 在代码中的实现。之前我们提到，可以用幅度 ***m*** 和方向分量 ***V*** 来初始化预训练权重 ***W0***。例如，有以下公式：

\\(W\_0 = m \\frac{V}{||V||\_c} \\)

其中 ||***V***||c 是 ***V*** 的向量范数。然后我们可以将包含 LoRA 权重更新 ***BA*** 的 DoRA 表示为：

\\(W^{\\prime}=m \\frac{V+BA}{\\|V+BA\\|\_c}\\)

在 DoRA 论文中，作者将 DoRA 表述如下，他们直接使用初始预训练权重 *W0* 作为方向分量，并在训练过程中学习幅度向量 ***m***：

\\(W^{\\prime}={m} \\frac{V+\\Delta V}{\\|V+\\Delta V\\|\_c}={m} \\frac{W\_0+{B A}}{\\left\\|W\_0+{B A}\\right\\|\_c}\\)

这里，***ΔV*** 是方向分量矩阵 ***V*** 的更新量。

虽然原作者尚未发布官方实现，但你可以在此处找到独立实现 [这里](https://github.com/catid/dora/blob/main/dora.py)，我的以下实现大致受其启发。

基于我们之前的 `LinearWithLoRAMerged` 实现，我们可以将其升级为 DoRA，如下所示：

```
class LinearWithDoRAMerged(nn.Module):

def __init__(self, linear, rank, alpha):
        super().__init__()
        self.linear = linear
        self.lora = LoRALayer(
            linear.in_features, linear.out_features, rank, alpha
        )
        self.m = nn.Parameter(
            self.linear.weight.norm(p=2, dim=0, keepdim=True))

# 代码大致受以下实现启发
  # https://github.com/catid/dora/blob/main/dora.py

def forward(self, x):
        lora = self.lora.A @ self.lora.B
        numerator = self.linear.weight + self.lora.alpha*lora.T
        denominator = numerator.norm(p=2, dim=0, keepdim=True)
        directional_component = numerator / denominator
        new_weight = self.m * directional_component
        return F.linear(x, new_weight, self.linear.bias)
```

`LinearWithDoRAMerged` 类与我们之前的 `LinearWithLoRAMerged` 类在几个关键方面有所不同，主要体现在如何修改和应用线性层的权重。然而，两个类都集成了 `LoRALayer` 来增强原始线性层的权重，但 DoRA 增加了权重归一化和调整。

下图展示了两个类的文件差异对比：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!CpnG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!CpnG!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 424w, https://substackcdn.com/image/fetch/$s_!CpnG!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 848w, https://substackcdn.com/image/fetch/$s_!CpnG!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 1272w, https://substackcdn.com/image/fetch/$s_!CpnG!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!CpnG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png" width="1456" height="444" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:444,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!CpnG!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 424w, https://substackcdn.com/image/fetch/$s_!CpnG!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 848w, https://substackcdn.com/image/fetch/$s_!CpnG!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 1272w, https://substackcdn.com/image/fetch/$s_!CpnG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d3550b9-14a6-4a1d-844d-d72c1bfceed3_1600x488.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>文件差异对比：</span><code>LinearWithLoRAMerged</code><span> 与 </span><code>LinearWithDoRAMerged</code></figcaption></figure>

如上图所示，`LinearWithDoRAMerged` 引入了一个额外步骤，涉及对增强后的权重进行动态归一化。

将原始权重与LoRA调整后的权重（`self.linear.weight + self.lora.alpha*lora.T`）合并后，它会计算这些合并权重在列方向上的范数（`column_norm`）。接着，通过将合并权重除以其范数来对其进行归一化（`V = combined_weight / column_norm`）。这一步确保合并权重矩阵的每一列都具有单位范数，这有助于通过维持权重更新的尺度来稳定学习过程。

DoRA还引入了一个可学习向量 `self.m`，它表示归一化权重矩阵每一列的幅度。该参数允许模型在训练过程中动态调整合并权重矩阵中每个权重向量的尺度。这种额外的灵活性有助于模型更好地捕捉不同特征的重要性。

总之，`LinearWithDoRAMerged` 通过引入动态权重归一化和缩放来扩展 `LinearWithLoRAMerged` 的概念，从而提升训练性能。

在实践中，考虑到之前的多层感知机，我们可以简单地将现有的线性层替换为我们的 `LinearWithDoRAMerged` 层，如下所示：

**输入：**

```
model.layers[0] = LinearWithDoRAMerged(model.layers[0], rank=4, alpha=8)
model.layers[2] = LinearWithDoRAMerged(model.layers[2], rank=4, alpha=8)
model.layers[4] = LinearWithDoRAMerged(model.layers[4], rank=4, alpha=8)

print(model)
```

**输出：**

```
MultilayerPerceptron(
  (layers): Sequential(
    (0): LinearWithDoRAMerged(
      (linear): Linear(in_features=784, out_features=128, bias=True)
      (lora): LoRALayer()
    )
    (1): ReLU()
    (2): LinearWithDoRAMerged(
      (linear): Linear(in_features=128, out_features=256, bias=True)
      (lora): LoRALayer()
    )
    (3): ReLU()
    (4): LinearWithDoRAMerged(
      (linear): Linear(in_features=256, out_features=10, bias=True)
      (lora): LoRALayer()
    )
  )
)
```

在对模型进行微调之前，我们可以重用之前实现的 `freeze_linear_layers` 函数，仅使LoRA权重和幅度向量可训练：

**输入：**

```
freeze_linear_layers(model)
for name, param in model.named_parameters():
    print(f"{name}: {param.requires_grad}")
```

**输出：**

```
layers.0.m: True
layers.0.linear.weight: False
layers.0.linear.bias: False
layers.0.lora.A: True
layers.0.lora.B: True
layers.2.m: True
layers.2.linear.weight: False
layers.2.linear.bias: False
layers.2.lora.A: True
layers.2.lora.B: True
layers.4.m: True
layers.4.linear.weight: False
layers.4.linear.bias: False
layers.4.lora.A: True
layers.4.lora.B: True
```

**完整的代码示例，包括模型训练，可在我的GitHub仓库中找到：[https://github.com/rasbt/dora-from-scratch](https://github.com/rasbt/dora-from-scratch)。**

在我看来，DoRA似乎是LoRA的一个逻辑合理、有效且有前景的扩展，我很期待在实际的大语言模型微调场景中尝试它。

与此同时，我还将上述DoRA实现添加到了 [从零实现LoRA – 在PyTorch中为大语言模型实现低秩适配](https://lightning.ai/lightning-ai/studios/code-lora-from-scratch) Lightning Studio 中，用于微调DistilBERT语言模型（参见 `bonus_02_finetune-with-dora.ipynb`）。即使没有进行超参数调优，我已经看到其预测准确率比LoRA提升了超过1%。

*本杂志是一个个人热情项目。对于那些希望支持我的人，请考虑购买一本我的 [《从零构建大语言模型》](https://amzn.to/4fqvn0D) 书籍。（我相信你会从这本书中收获颇丰，因为它以其他地方找不到的详细程度解释了LLM的工作原理。）*

*如果你阅读了这本书并且有几分钟空闲，我将非常感激你留下一个 [简短评论](https://www.amazon.com/Build-Large-Language-Model-Scratch/dp/1633437167)。这对我们作者帮助很大！*

另外，我最近也在Substack上启用了付费订阅选项，以直接支持本杂志。

#### 关于此帖的讨论

### 准备好了解更多了吗？
