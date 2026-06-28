---
title: 'Beyond LoRA: Can you beat the most popular fine-tuning technique?'
url: 'https://huggingface.co/blog/peft-beyond-lora'
url_hash: dc672d00868203d038ecae4b0128e843c3170c01
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-18T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

![LoRA 是最佳 PEFT 技术吗？](https://huggingface.co/datasets/peft-internal-testing/peft-blog-assets/resolve/main/peft-beyond-lora/lora-celebration.png)

## [](#当你计划以参数高效方式微调模型时，请跳出 LoRA 的思维框架)当你计划以参数高效方式微调模型时，请跳出 LoRA 的思维框架

如果你想用自己的数据微调一个开源模型，你很可能对所谓的参数高效微调（简称 *PEFT*）感兴趣。这个术语描述了一系列能显著降低模型微调内存需求的技术。尽管有几十种这样的技术，但几乎所有人都会选择一种叫做 "LoRA" 的方法。在这篇博文中，我们将探讨 LoRA 是否真的是最佳选择，有哪些工具可以帮助你做出明智决策，以及如何通过拓展视野超越 LoRA 来获益。

## [](#什么是-peft-以及何时需要它)什么是 PEFT 以及何时需要它

市面上有无数开源模型，但它们往往无法完全满足你的使用场景。提示工程可能有所帮助，但通常还不够。与其从头训练一个新模型，不如考虑微调现有模型。

然而，微调非常消耗内存：通常需要足够的内存来容纳整个模型多次。量化可以减少模型的内存占用，但量化后的模型无法直接微调。因此，出现了一系列旨在削减微调所需内存的技术，称为 "参数高效微调"（PEFT）。

借助 PEFT，你只需使用其中一小部分内存就能微调模型，甚至可以对量化模型进行微调。它还带来了其他优势，例如检查点体积小、对灾难性遗忘的抵抗力更强，以及能够从同一个基础模型提供多个微调版本。

在 Hugging Face，我们开发了 [`PEFT` 库](https://github.com/huggingface/peft)，它在统一 API 背后实现了多种 PEFT 技术，并与生态系统良好集成，例如 [`Transformers`](https://huggingface.co/docs/transformers/main/en/peft) 和 [`Diffusers`](https://huggingface.co/docs/diffusers/main/en/api/loaders/peft)。它还支持[多种量化方法](https://huggingface.co/docs/peft/developer_guides/quantization)，进一步提升了参数高效微调的可及性。无论你是想用自己的数据微调模型，还是研究新的 PEFT 方法，`PEFT` 都是一个很好的起点。

## [](#lora-微调技术之王-👑)LoRA：微调技术之王 👑

一种早期出现并被证明非常有效的参数高效微调技术叫做 "低秩适应"，简称 ["LoRA"](https://huggingface.co/papers/2106.09685)。它的工作原理是在基础模型之上添加少量参数，冻结基础模型的权重，只训练这些少量参数。

在所有 PEFT 技术中，LoRA 是目前最受欢迎的。以下是一些估算数据：

-   在 Hugging Face Hub 上 [20,834 张模型卡片](https://huggingface.co/datasets/librarian-bots/model_cards_with_metadata) 的样本中，恰好提及一种 PEFT 技术的卡片有 20,509 张提到了 LoRA（占 98.4%）。
-   我们还检查了外部网站上图像生成领域流行的 PEFT 技术。使用 10,000 个检查点的样本，我们发现其中 7,111 个是 LoRA。其他被识别的 PEFT 技术包括 LoCon（363 个）和 DoRA（11 个，可视为 LoRA 变体）。这意味着 95.0% 的 PEFT 检查点是 LoRA。
-   在 GitHub 上搜索代码片段 `from peft import <PEFT CONFIG>`（[示例查询](https://github.com/search?q=%22from+peft+import+LoraConfig%22&type=code)），71.3% 的结果是 LoRA。紧随其后的是 LoHa（3.7%）和 AdaLoRA（3.5%）。

尽管这些估算并不完美，但结论依然是：LoRA 几乎毫无疑问是目前最主流的 PEFT 技术。

这可能仅仅意味着 LoRA 对所有人来说效果最佳，而这一事实也反映在其使用统计数据中。然而，还存在另一种可能性：LoRA 是较早出现的流行 PEFT 技术之一。因此，它的使用可能形成了自我强化效应：LoRA 拥有最高的可见度、最多的教程/示例，以及下游软件包中最完善的支持。于是，LoRA 的流行度便不断自我循环。

这引出了一个问题：*我们是否因回避更优技术而牺牲了性能？* 毕竟，无数研究者在论文中声称他们的技术超越了 LoRA。这难道不足以证明我们应该超越 LoRA，转而采用更新的技术吗？

## [](#根据论文结果选择peft技术存在局限性)根据论文结果选择 PEFT 技术存在局限性

有数十篇论文研究了除 LoRA 之外的微调技术。仅以 `PEFT` 库为例，截至撰写本文时，其中已包含超过 40 种不同的 PEFT 技术（若计入各种变体，数量更多）。几乎对于所有这些技术，你都能找到研究者声称其技术根据他们的基准测试超越了 LoRA。

这些声明的问题在于，研究者面临压力，需要提供超越现有基准的结果。即使没有恶意，这也可能使结果产生偏差，例如，与研究者提出的技术相比，他们在调整替代技术参数上花费的时间更少。[一项研究](https://arxiv.org/abs/2602.04998)发现，例如，通过调整学习率，LoRA 可以匹配那些据称更优的 PEFT 技术。

另一个复杂因素是，每篇论文会选择不同的 PEFT 技术集进行比较，并采用不同的基准测试集。即使在同一基准上比较同一技术，代码也常常不可用或难以自行运行，这使得结果难以复现。

总体而言，仅通过查阅论文结果很难确定最适合你的 PEFT 技术。因此，你可能会倾向于直接使用默认的 LoRA。

## [](#我们在peft中如何进行基准测试)我们在 `PEFT` 中如何进行基准测试

在 Hugging Face，我们思考了如何帮助用户就选择哪种 PEFT 技术做出明智决策。通过 `PEFT` 库，我们已经提供了一个实现多种 PEFT 技术并以统一 API 呈现的软件包。下一步是提供能够更清晰阐明上述问题的基准测试。

我们此前已有一个[在数学数据集上检查 LLM 微调的基准测试](https://github.com/huggingface/peft/tree/main/method_comparison/MetaMathQA)。该基准测试选取一个未经过指令微调的基础模型，通过思维链推理对 LLM 进行微调，使其能生成数学问题的解答结果。因此，该基准测试旨在检验模型能否学会数学推理，并调整生成输出以符合预期格式。

为了将我们的发现扩展到另一个模态，我们还添加了一个[图像生成基准测试](https://github.com/huggingface/peft/tree/main/method_comparison/image-gen)。该测试旨在检验模型能否通过微调学习一个新概念（例如[猫玩偶](https://huggingface.co/datasets/peft-internal-testing/cat-image-dataset)），并在不遗忘已有概念的情况下，在新场景中生成该概念。

所有PEFT技术均在完全相同的条件下进行评估：相同的基础模型、相同的数据集、相同的训练和评估代码、相同的硬件。由于不同用户的需求各异，我们不仅追踪测试性能，还记录了显存使用量、遗忘/漂移程度、运行时间和检查点大小等指标。这些基准测试设计为可在消费级硬件上运行，添加新实验只需新增一个`PEFT`配置并运行脚本即可。

由于我们在同等条件下比较所有PEFT技术，且不偏袒任何一方，我们相信这些基准测试能够客观呈现不同PEFT技术的实际表现。我们认为，如果你有自己的数据集，也可以采用类似方法，利用`PEFT`库来评估多种PEFT技术。

## [](#our-findings-lora-works-well-but-is-not-necessarily-the-best-choice)我们的发现：LoRA表现良好，但未必是最优选择

完成基准测试后，我们发现虽然LoRA表现不错，但其他PEFT方法在单个或多个维度上可能超越它，因此值得考虑。下图展示了LoRA与其他五种PEFT技术的性能对比。

<table><tbody><tr><td><img src="https://huggingface.co/datasets/peft-internal-testing/peft-blog-assets/resolve/main/peft-beyond-lora/benchmark-highlights.png" width="900"></td></tr><tr><td><em>基准测试的部分结果。在测试性能和内存使用方面，LoRA未必是最优选择。左图：MetaMathQA基准测试；右图：图像生成基准测试。请查阅此<a href="https://huggingface.co/spaces/peft-internal-testing/PEFT-method-comparison">Space</a>获取最新结果。</em></td></tr></tbody></table>

解读上述结果的一种方式是考虑权衡关系，例如：模型在测试集上的表现与训练所需内存之间的平衡。如果某种PEFT技术在这两个指标上同时优于其他所有技术，那么它就处于*帕累托前沿*。换句话说：如果你想要更高的测试准确率，就需要更多内存；而如果你追求更高的内存效率，就必须牺牲部分准确率。

让我们更仔细地审视LLM数学数据集基准测试的结果。在测试准确率与内存的权衡中，我们发现LoRA确实处于帕累托前沿。它实现了53.2%的测试准确率，峰值显存需求为22.6 GB。然而，还有其他PEFT技术也位于帕累托前沿。例如，[BEFT](https://huggingface.co/docs/peft/main/en/package_reference/beft)达到了32.9%的测试准确率，峰值内存仅需20.2 GB。另一端则是[Lily](https://huggingface.co/docs/peft/main/en/package_reference/lily)，它实现了54.9%的测试准确率，但需要25.6 GB内存。根据你的具体需求，你可能会发现LoRA并非最适合你的权衡方案。

<table><tbody><tr><td><img src="https://huggingface.co/datasets/peft-internal-testing/peft-blog-assets/resolve/main/peft-beyond-lora/metamath-pareto.png" width="900"></td></tr><tr><td><em>微调<code>meta-llama/Llama-3.2-3B</code>并在GSM8K上评估时的测试准确率与内存使用权衡。LoRA表现良好，但其他PEFT技术同样出色。</em></td></tr></tbody></table>

同样值得注意的是，尽管LoRA在此任务中表现良好，但我们讨论的并非标准LoRA。一方面，我们采用了[秩稳定初始化](https://huggingface.co/papers/2312.03732)的LoRA，该技术通过不同于默认初始化的方式缩放LoRA贡献，实现了非常高的测试准确率（53.2%）。另一方面，[LoRA-FA](https://huggingface.co/papers/2308.03303)使用专为LoRA优化的优化器，冻结部分LoRA权重，因此内存效率更高（20.2 GB）。标准LoRA在22.5 GB内存下仅达到48.1%的准确率，因此应优先选择替代方案。

接下来我们来看图像生成基准测试。在[Hugging Face Space](https://huggingface.co/spaces/peft-internal-testing/PEFT-method-comparison)中，选择"Select Task"下拉菜单中的"image-gen"查看结果。该任务的目标是学习一个新概念（即猫玩偶），并将其泛化到新的提示词中。

<table><tbody><tr><td><img src="https://huggingface.co/datasets/peft-internal-testing/peft-blog-assets/resolve/main/peft-beyond-lora/cat-plushy-lora.png" width="400"></td></tr><tr><td><em>使用LoRA微调<code>FLUX.2-klein-base-4B</code>生成的猫玩偶图像。</em></td></tr></tbody></table>

对于此任务，主要指标是"dino相似度"，用于衡量生成图像与保留测试数据集中图像的相似程度，数值越高越好。同时，我们还需关注内存使用情况。绘制这两个指标的帕累托前沿时，我们发现LoRA位于该前沿之下。具体数据如下：LoRA的相似度得分为0.697，而[OFT](https://huggingface.co/docs/peft/package_reference/oft)达到0.708；内存方面，LoRA需要9.97 GB，OFT需要9.01 GB。因此，OFT在这些指标上严格优于LoRA。

<table><tbody><tr><td><img src="https://huggingface.co/datasets/peft-internal-testing/peft-blog-assets/resolve/main/peft-beyond-lora/image-gen-pareto.png" width="900"></td></tr><tr><td><em>微调<code>FLUX.2-klein-base-4B</code>并在测试集上评估时的测试准确率与内存使用权衡。OFT等其他PEFT技术在测试得分和更低内存使用方面均优于LoRA。</em></td></tr></tbody></table>

当然，您还应检查接近帕累托前沿的其他PEFT方法，因为指标可能因随机性而产生微小波动。此外，您还可以探索其他指标：运行时性能对您是否重要？或者您更关心检查点的大小？从下拉菜单中选择相关指标后，结果可能会发生显著变化。对于图像生成基准测试，请务必检查生成的样本图像，以直观感受微调模型的能力。

## [](#limitations)局限性

> 质疑：但基准测试偏向于某种方法！

对`PEFT`基准测试的一个潜在批评是，超参数的选择可能偏向于某种技术。这确实如此，在众多技术中进行全面且公平的超参数搜索颇具挑战性。然而，每个人都可以轻松地为`PEFT`贡献自己的实验：如果您认为通过选择不同超参数可以改进特定PEFT技术，请创建PR！我们已添加[相关操作指南](https://github.com/huggingface/peft/tree/main/method_comparison#creating-new-experiments)。同样，如果您想贡献全新的基准测试，欢迎联系我们讨论您的想法。

这些基准测试的另一个问题是，它们可能无法全面反映特定PEFT技术的实际能力。我们虽然能够从多个维度对比不同技术，并根据这些权衡找到最优方案，但这种方法无法涵盖所有方面。例如，名为[Cartridges](https://huggingface.co/docs/peft/package_reference/cartridges)的PEFT技术专为压缩长提示词而设计，但这项能力并未在基准测试中体现。其他因素同样会影响技术选择，比如：

-   根据PEFT技术的不同，只有特定类型的网络层可以被修改。
-   并非所有PEFT技术都支持量化基础模型（但我们正在`PEFT`中积极扩展相关支持）。
-   部分PEFT技术允许[合并适配器](https://huggingface.co/docs/peft/main/en/developer_guides/model_merging)以减少运行时开销，而其他技术则不支持。

基准测试无法完全替代您自行调研的责任，但它们可以作为合理的参考指标。

<table><tbody><tr><td><a href="https://huggingface.co/spaces/peft-internal-testing/PEFT-shop"><img src="https://huggingface.co/datasets/peft-internal-testing/peft-blog-assets/resolve/main/peft-beyond-lora/peft-shop.png" width="100%"></a></td></tr><tr><td><em>点击图片浏览PEFT商店，找到最适合您的PEFT技术。您不仅可以按基准指标浏览，还能根据量化支持等能力进行筛选。</em></td></tr></tbody></table>

> 质疑：但llama.cpp/vLLM/...只支持LoRA

使用LoRA以外的PEFT技术存在一个限制：它们在下游软件包中的支持广度远不及LoRA。例如，若想用vLLM部署模型，只能加载LoRA检查点。值得庆幸的是，`PEFT`现已支持[将其他适配器转换为LoRA格式](https://huggingface.co/docs/peft/main/en/package_reference/lora_conversion)。这样一来，您可以将非LoRA检查点转换为LoRA格式，再用于vLLM或其他下游软件包。

为验证此功能，我们使用GraLoRA技术将图像适配器转换为LoRA检查点。转换后的测试分数几乎完全一致（相似度0.702→0.694，0.260→0.269）。以下是为提示词“sks cat at the beach”生成的测试图像：

目前我们尚未实现所有PEFT技术的转换功能，但若有需求，我们将扩展支持范围。

## [](#conclusion-and-what-you-can-do)结论与您的行动方向

在开发`PEFT`软件包的过程中，我们注意到LoRA拥有巨大的发展势头，尽管其他PEFT技术可能更具优势。因此，我们着手为PEFT添加基准测试，以便更客观地展示不同PEFT技术在各指标上的表现。

根据研究结果，我们可以确信：LoRA绝非糟糕的选择，但可能存在更优方案。尤其在图像生成基准测试中，LoRA已被其他技术超越。我们讨论过，在选择合适的PEFT技术时，除指标外还需考虑其他因素。即便如此，我们仍在推动`PEFT`进一步发展，力求让LoRA与其他技术实现功能对等。

我们的旅程远未结束；我们想要扩展并改进现有的基准测试，未来还计划增加更多基准。我们确保社区能够轻松参与贡献，因此如果你有兴趣，请打开[`PEFT` 仓库的 issue](https://github.com/huggingface/peft/issues)，告诉我们你希望如何贡献。

如果本文只能让你记住一件事，那就是：在选择适用于你用例的 PEFT 技术时，LoRA 不应成为自动默认选项。借助 `PEFT` 提供的统一 API，从一种 PEFT 技术切换到另一种，只需在代码中切换一个配置即可。即使你坚持使用 LoRA，也请看看 `PEFT` 支持的所有变体：DoRA、rs-LoRA、LoRA-FA 等。尝试这些其他技术，你可能会收获惊喜。

示例：使用 `PEFT` 从 LoRA 切换到 OFT：

```
from transformers import AutoModelForCausalLM
-from peft import LoraConfig, get_peft_model
+from peft import OFTConfig, get_peft_model

base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B", dtype="bfloat16")
-config = LoraConfig(target_modules=["q_proj", "v_proj"])
+config = OFTConfig(target_modules=["q_proj", "v_proj"])
model = get_peft_model(base_model, config)
```
