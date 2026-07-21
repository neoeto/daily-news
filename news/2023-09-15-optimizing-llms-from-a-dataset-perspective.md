---
title: Optimizing LLMs From a Dataset Perspective
url: >-
  https://sebastianraschka.com/blog/2023/optimizing-LLMs-dataset-perspective.html
url_hash: 001115838b91da96dc1ba1a87b6763a732f04384
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2023-09-15T08:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
本文聚焦于通过使用精心整理的数据集对大型语言模型进行微调，以提升其建模性能。具体而言，文章重点介绍了涉及修改、利用或操作数据集以进行指令微调的策略，而非改变模型架构或训练算法（后者将是未来文章的主题）。本文还将解释如何准备自己的数据集来微调开源大型语言模型。

请注意，[NeurIPS LLM效率挑战赛](https://llm-efficiency-challenge.github.io/)目前正在进行中，旨在24小时内在单个GPU上训练一个大型语言模型，这对关注LLM效率的从业者和研究人员来说非常有趣。本文讨论的技术与这一竞赛直接相关，我们将深入探讨这些以数据集为中心的策略如何在挑战赛环境中应用。此外，文章还将为您可能考虑尝试的新实验提供建议。

[**本文为转载文章，最初发表于Lightning AI博客**](https://lightning.ai/pages/community/tutorial/optimizing-llms-from-a-dataset-perspective/)。

## 监督指令微调[](#supervised-instruction-finetuning)

什么是指令微调？我们为什么要关注它？

指令微调是一种用于提升语言模型（如ChatGPT和[Llama-2-chat](https://www.google.com/url?q=https://arxiv.org/abs/2307.09288&sa=D&source=editors&ust=1694778155820217&usg=AOvVaw3DfjwSmu9UDiKXYfwwNURe)）性能的方法，它通过让模型针对一系列示例输入及其期望输出生成结果来实现。这种方法使得模型在特定应用或任务中的行为更加可控和符合预期。此外，它还能增强AI系统在实际应用场景中的可靠性、特异性和安全性。

![优化LLMs数据集视角图1](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image1.webp) *来自[InstructGPT论文](https://www.google.com/url?q=https://arxiv.org/abs/2203.02155&sa=D&source=editors&ust=1694778155821067&usg=AOvVaw0b9IRsqGEu2lM_iI5nMzZM)的注释图*

指令微调使用由指令-响应对组成的数据集来提升LLM遵循指令的能力。这种用于指令微调的数据集通常包含三个组成部分：

1.  指令文本
2.  输入文本（可选）
3.  输出文本

下面的示例列出了两个训练样本，一个不带可选输入文本，另一个带可选输入文本：

![优化LLMs数据集视角图3](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image3.webp)

然后，LLM通过下一个词元预测（类似于[预训练](https://sebastianraschka.com/glossary/#pretraining "Pretraining")）在这些指令数据集上进行微调。与预训练的不同之处在于，模型在需要以自回归方式执行下一个词元预测以生成输出文本之前，会先看到完整的指令和输入文本作为上下文，如下图所示。

![优化LLMs数据集视角图2](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image2.webp)

上述以逐词元迭代方式微调LLM以生成期望输出的过程，也被称为[监督微调](https://sebastianraschka.com/glossary/#instruction-finetuning "Instruction Finetuning (SFT)")。

在实践中，监督微调之后还有一个可选的微调阶段，该阶段使用来自人类标注者的额外偏好数据和排名标签，这些标注者会比较LLM生成的响应。这个过程也被称为基于人类反馈的强化学习（[RLHF](https://sebastianraschka.com/glossary/#rlhf "RLHF (Reinforcement Learning from Human Feedback)")），但不在本文讨论范围内，本文主要关注指令数据集本身。（不过，如果您想了解更多，我有一篇关于RLHF的可选文章，请点击[此处](https://magazine.sebastianraschka.com/p/llm-training-rlhf-and-its-alternatives)阅读。）

## 微调流程与数据集来源[](#the-finetuning-pipeline-and-dataset-origins)

在微调LLM时，指令微调的数据集可以通过多种方式获取：

**1. 人工创建：** 专业标注员可以提供明确的指令和反馈，从而创建用于指令微调的数据集。这对于特定领域任务或减少特定偏见及不良行为尤为有用。

**2. 大语言模型生成：** 我们可以利用现有大语言模型（若服务条款允许）生成大量潜在的输入-输出对。随后由人工对这些数据进行质量评估和优化，再用于微调新的大语言模型。这种方法通常比上述人工创建方式更高效，因为像 GPT-4（通过 API 接口）这样的现有大语言模型能在短时间内生成大量示例样本。

近期优秀的综述论文《[面向大语言模型的指令微调](https://arxiv.org/abs/2308.10792)》总结了使用人工创建或大语言模型生成数据进行微调的流程：

![优化大语言模型数据集视角图5](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image5.webp) *图源论文《[面向大语言模型的指令微调](https://arxiv.org/abs/2308.10792)》*

此外，我们还可以将人工创建与模型生成的指令数据相结合，从而兼得两者优势。

后续章节将详细探讨用于指令微调的大语言模型生成数据集和人工创建数据集，包括近期研究亮点。

## 大语言模型生成的数据集[](#llm-generated-datasets)

数据标注一直是机器学习领域的瓶颈。对于人工标注员而言，像将图像分类为“猫”或“狗”这样的简单任务，一旦需要大规模执行，就会变得相当繁琐。

需要长文本标注的任务则更加耗时且具有挑战性。因此，大量研究致力于利用现有大语言模型自动生成指令微调数据集。

**自指令（Self-Instruct）**

最著名且应用最广泛的大语言模型数据集生成方法之一是[自指令](https://arxiv.org/abs/2212.10560)。

那么它是如何运作的呢？简要来说，包含四个阶段：

1.  用一组人工编写的指令（此处为175条）构建种子任务池，并从中采样指令；
2.  使用预训练大语言模型（如 GPT-3）确定任务类别；
3.  根据新指令，让预训练大语言模型生成响应；
4.  在将响应加入任务池前进行收集、修剪和过滤。

![优化大语言模型数据集视角图4](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image4.webp)

自指令的早期热门应用是[羊驼数据集](https://github.com/gururise/AlpacaDataCleaned)，该数据集包含5.2万条大语言模型生成的指令-响应对。今年早些时候，羊驼数据集被用于创建首个微调版 [Llama v1](https://arxiv.org/abs/2302.13971) 模型。

**反向翻译（Backtranslation）**

另一种有趣的方法是从响应反向推导，通过大语言模型生成对应的指令。

换句话说，与其从人类写作者那里收集指令微调数据集，不如利用大语言模型生成指令-响应对（也称为[蒸馏](https://sebastianraschka.com/glossary/#distillation "Distillation")）。

在题为《[基于指令反向翻译的自我对齐](https://arxiv.org/abs/2308.06259)》的论文中，研究人员通过“指令反向翻译”优化大语言模型，发现该方法优于在羊驼等蒸馏数据集上训练的模型。

![优化大语言模型数据集视角图7](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image7.webp)

**NeurIPS 效率挑战赛规则**

请注意，[NeurIPS 大语言模型效率挑战赛](https://llm-efficiency-challenge.github.io/)（核心要求是在1块GPU上于1天内训练1个大语言模型）不允许使用大语言模型生成的数据集。

因此，在下一节《高质量数据集》中，我们将重点介绍可作为替代方案的人工生成指令数据集。

如果您有兴趣参加 [NeurIPS LLM 效率挑战赛](https://llm-efficiency-challenge.github.io/)，我在这里写了一份[快速入门教程](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/neurips_challenge_quickstart.md)。

**关于 LLM 生成数据集和模仿模型的说明**

在深入讨论用于指令微调的人工生成数据集之前，我想先就 LLM 生成的数据集分享一点提醒。是的，通过 LLM 生成数据集听起来好得令人难以置信，因此，对基于 LLM 生成数据集微调后的 LLM 进行特别仔细的评估至关重要。

例如，在最近一篇名为 *[《模仿专有 LLM 的虚假承诺》](https://arxiv.org/abs/2305.15717)* 的论文中，研究人员观察到，众包工作者对基于 LLM 生成数据训练的 LLM 给出了很高的评价。然而，这些所谓的“模仿模型”主要复制了它们所训练的上游 LLM 的风格，而非其事实准确性。

## 高质量数据集：少即是多[](#high-quality-datasets-less-may-be-more)

在上一节中，我们讨论了由 LLM 生成的数据集。现在，让我们换个角度，审视一个高质量的人工生成数据集，该数据集也允许在 [NeurIPS LLM 效率挑战赛](https://llm-efficiency-challenge.github.io/) 中使用。

**LIMA**

*[《LIMA：对齐中少即是多》](https://arxiv.org/abs/2305.11206)* 论文表明，在指令微调数据集中，质量胜于数量。

在这项研究中，研究人员精心挑选了 1,000 个指令对，使用监督微调来微调 650 亿参数的 Llama-v1 模型，即 LIMA。

值得注意的是，其他微调的 Llama 模型，例如 Alpaca，是在一个包含 52,000 个 LLM 生成指令对的、规模大得多的数据集上训练的。在选定的基准测试中，LIMA 的表现优于采用基于人类反馈的强化学习（RLHF）方法的模型，包括 ChatGPT 和 GPT-3.5。

![优化 LLM 数据集视角图6](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image6.webp) *来自 [LIMA 论文](https://arxiv.org/abs/2305.11206) 的注释图*

下一节将向您展示如何开始使用开源 LLM，并在 LIMA 上微调这些模型。

## 在 LIMA 上微调 LLM[](#finetuning-llms-on-lima)

本节将解释如何使用 [Lit-GPT 仓库](https://github.com/Lightning-AI/lit-gpt) 在 LIMA 等指令数据集上微调开源 LLM。

（请注意，[NeurIPS LLM 效率挑战赛](https://llm-efficiency-challenge.github.io/) 的组织者已批准 LIMA 用于比赛。NeurIPS LLM 效率挑战赛的组织者还选择了 Lit-GPT 作为入门工具包，因为其代码相对易于使用和定制，这是探索新研究方向的基本前提。）

截至撰写本文时，Lit-GPT 当前支持的模型如下：

| **模型及用途** | **参考文献** |
| --- | --- |
| Meta AI [Llama 2](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_llama_2.md) | [Touvron 等人，2023](https://arxiv.org/abs/2307.09288) |
| Stability AI [FreeWilly2](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_freewilly_2.md) | [Stability AI，2023](https://stability.ai/blog/stable-beluga-large-instruction-fine-tuned-models) |
| Stability AI StableCode | [Stability AI，2023](https://stability.ai/blog/stablecode-llm-generative-ai-coding) |
| TII UAE [Falcon](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_falcon.md) | [TII，2023](https://falconllm.tii.ae/) |
| OpenLM Research [OpenLLaMA](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_openllama.md) | [Geng & Liu，2023](https://github.com/openlm-research/open_llama) |
| LMSYS [Vicuna](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_vicuna.md) | [Li 等人，2023](https://lmsys.org/blog/2023-03-30-vicuna/) |
| LMSYS [LongChat](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_longchat.md) | [LongChat 团队，2023](https://lmsys.org/blog/2023-06-29-longchat/) |
| Together [RedPajama-INCITE](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_redpajama_incite.md) | [Together，2023](https://together.ai/blog/redpajama-models-v1) |
| EleutherAI [Pythia](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_pythia.md) | [Biderman 等人，2023](https://arxiv.org/abs/2304.01373) |
| StabilityAI [StableLM](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_stablelm.md) | [Stability AI，2023](https://github.com/Stability-AI/StableLM) |
| Platypus | [Lee, Hunter, and Ruiz，2023](https://arxiv.org/abs/2308.07317) |
| NousResearch Nous-Hermes | [组织页面](https://huggingface.co/NousResearch) |
| Meta AI [Code Llama](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/download_code_llama.md) | [Rozière 等人，2023](https://arxiv.org/abs/2308.12950) |

在本简要演练中，我们将使用 70 亿参数的 [Llama 2 基础模型](https://github.com/Lightning-AI/lit-gpt)，并在 LIMA 上对其进行微调。

假设您已经克隆了 Lit-GPT 仓库，可以通过以下三个步骤开始操作：

1) 下载并准备模型：

```
export HF_TOKEN=your_token

python scripts/download.py \
 --repo_id meta-llama/Llama-2-7b-hf
```

```
python scripts/convert_hf_checkpoint.py \
 --checkpoint_dir meta-llama/Llama-2-7b-hf
```

2) 准备数据集：

```
python scripts/prepare_lima.py \
 --checkpoint_dir checkpoints/meta-llama/Llama-2-7b-hf
```

3) 使用[低秩适配](https://sebastianraschka.com/glossary/#lora "LoRA（低秩适配）")（LoRA）微调模型：

```
python finetune/lora.py \
 --checkpoint_dir checkpoints/meta-llama/Llama-2-7b-hf \
 --data_dir data/lima
```

请注意，在步骤2中准备数据集时需要 `--checkpoint_dir` 参数，因为数据集准备依赖于模型。不同的LLM可能使用不同的分词器和特殊标记，因此相应地准备数据集非常重要。

为了保持本文对数据集角度的专注，我跳过了LoRA微调过程的详细解释。不过，如果您想了解更多，可以参阅我的文章 [使用LoRA和适配器更高效地微调Falcon LLM](https://lightning.ai/pages/community/finetuning-falcon-efficiently/)。

此外，您可能还会发现我的 [NeurIPS 2023 LLM效率挑战快速入门指南](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/neurips_challenge_quickstart.md) 很有帮助，其中我逐步介绍了设置、微调和模型评估的过程。

* * *

**提示**

根据[官方竞赛规则](https://llm-efficiency-challenge.github.io/question)，评估使用的最大[上下文长度](https://sebastianraschka.com/glossary/#context-length "上下文长度")为2,048个标记。因此，我建议准备数据集时设置最大长度为2,048个标记：

```
python scripts/prepare_lima.py \
  --checkpoint_dir checkpoints/meta-llama/Llama-2-7b-hf \
  --max_seq_length 2048
```

或者，您可以编辑 [finetune/lora.py](https://github.com/Lightning-AI/lit-gpt/blob/main/finetune/lora.py%23L37) [文件](https://github.com/Lightning-AI/lit-gpt/blob/main/finetune/lora.py%23L37)，将 `override_max_seq_length = None` 改为 `override_max_seq_length = 2048`，以减少GPU内存需求。

此外，我还建议修改 `max_iter` 设置，将其改为 `max_iter = 1000`，以便对LIMA数据集（包含1,000个训练样本）进行约一轮的微调。

![优化LLM数据集视角图片9](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image9.webp)

* * *

作为参考，使用默认设置的LoRA在A100 GPU上对7B参数模型进行52k指令对的微调（如Alpaca）大约需要1小时。请注意，LIMA比Alpaca小50倍，因此微调只需几分钟。

![优化LLM数据集视角图片8](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image8.webp)

标题：通过使用LoRA和适配器更高效地微调Falcon LLM对7B模型进行52k数据点的微调（[https://lightning.ai/pages/community/finetuning-falcon-efficiently/](https://lightning.ai/pages/community/finetuning-falcon-efficiently/)）

## Lit-GPT中可用的模型和数据集[](#lit-gpt中可用的模型和数据集)

截至撰写本文时，[Lit-GPT](https://github.com/Lightning-AI/lit-gpt) 中支持多个微调数据集。

![优化LLM数据集视角图片12](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image12.webp)

[Dolly](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/prepare_dataset.md) 和 [LIMA](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/prepare_dataset.md%23lima) 数据集是人工生成的，因此应该适合在 [NeurIPS LLM效率挑战](https://llm-efficiency-challenge.github.io/) 中使用。

此外，如果您有兴趣使用不同的数据集为您的项目定制LLM，下一节将简要说明如何操作。

## 准备新的和自定义的数据集[](#准备新的和自定义的数据集)

除了上述现有数据集外，您可能还想添加新数据集或使用自己的数据集来微调自定义的开源LLM。

在Lit-GPT中为LLM准备数据集主要有两种方法：

1.  使用 `scripts/prepare_csv.py` 脚本从CSV文件中读取指令数据集。
2.  创建一个类似于我们之前使用的LIMA的自定义 `scripts/prepare_dataset.py` 脚本。

准备新数据集最简单的方法是使用 Lit-GPT 中的 scripts/prepare\_csv.py 脚本从 CSV 文件读取数据。你只需要一个包含以下三列标题的 CSV 文件：

![优化LLM数据集视角图10](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image10.webp)

假设你将此数据集导出为 MyDataset.csv，然后可以按以下步骤准备和微调模型：

1) 准备数据集：

```
python scripts/prepare_csv.py \
  --csv_dir MyDataset.csv \
  --checkpoint_dir checkpoints/meta-llama/Llama-2-7b-hf
```

2) 使用低秩适配（LoRA）微调模型：

```
python finetune/lora.py \
  --data_dir /data/csv \
  --checkpoint_dir checkpoints/meta-llama/Llama-2-7b-hf
```

你还可以通过以下命令访问其他选项，例如设置随机种子或训练/分割比例：

```
python scripts/prepare_csv.py --help
```

如果你对第二种选项（创建类似 LIMA 的 prepare\_dataset.py 脚本）感兴趣，我在 [Lit-GPT 文档中](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/prepare_dataset.md%23preparing-custom-datasets-for-instruction-finetuning)添加了相关说明。

## 其他值得考虑的数据集[](#additional-datasets-to-consider)

上一节介绍了如何在 Lit-GPT 中为开源 LLM 准备自定义数据集。如果你没有自己的数据集进行实验，但想尝试现有数据集（例如，NeurIPS LLM 效率挑战赛仅限于公开可用的数据集），以下是一些可供探索的数据集建议。

考虑到 [NeurIPS LLM 效率挑战赛](https://llm-efficiency-challenge.github.io/)，以下列表侧重于人工生成的英文数据集，而非 LLM 生成的数据集。

**[Open Assistant](https://huggingface.co/datasets/OpenAssistant/oasst1)**（多语言）是一个由人类创建和标注的助手类对话集合。它包含 35 种语言的 161,443 条消息，并附有 461,292 条质量评估，最终形成超过 10,000 个全面标注的对话树。该数据集源于一项全球众包倡议，吸引了超过 13,500 名志愿者参与。

**[Natural Instructions](https://arxiv.org/abs/2104.08773)** 是一个英文指令数据集，手工制作了 193K 条条目，涵盖 61 个独特的 NLP 任务。

**[P3（公共提示池）](https://arxiv.org/abs/2110.08207)** 是一个指令微调数据集，使用 170 个英文 NLP 数据集和 2,052 个英文提示构建而成。提示（有时称为任务模板）将传统 NLP 任务（如问答、文本分类）中的数据实例映射为自然语言输入-输出对。

**[Flan 2021](https://arxiv.org/abs/2301.13688)** 是一个英文指令数据集，通过将 62 个流行的 NLP 基准（包括 SNLI、AG News 等）转换为语言输入和输出对而创建。

## 值得探索的研究方向[](#research-directions-to-explore)

既然我们已经了解了指令微调的原因和方法，那么有哪些有趣的研究方向可以提升开源 LLM 的性能呢？

**合并数据集**

除了上述提到的 P3 和 Flan 2021 数据集外，我尚未看到尝试通过合并多个来源的数据集来创建更大数据集的案例。例如，尝试组合 LIMA 和 Dolly 等数据集可能是有意义的。

**数据集排序**

延续上述数据集合并的想法，探索以不同顺序访问不同数据点（例如，按指令类型排序或打乱）的作用可能很有趣。除了 [Pythia 论文](https://arxiv.org/abs/2304.01373)中的预训练实验外，我尚未看到任何关于指令微调中数据集排序的研究。

**多轮训练**

由于对数据集规模要求较大，LLM通常预训练不到一个epoch，这意味着它们不会多次重复使用数据。虽然计算成本是原因之一，但另一个原因是LLM容易过拟合。不过，借助多种过拟合抑制技术，研究多epoch训练在LLM中的应用会很有趣。

例如，可以在几分钟内用LIMA这样的小数据集训练LLM。那么，多次迭代数据集是否有意义呢？

**自动质量过滤**

将数据集过滤作为默认方法是否合理？

与之前讨论的LIMA研究相关，*[AlpaGasus: 用更少数据训练更好的Alpaca](https://arxiv.org/abs/2307.08701)* 论文也强调，更大的数据集未必有利于LLM微调。在AlpaGasus研究中，研究人员利用ChatGPT从原始5.2万条指令的Alpaca数据集中筛选低质量指令-响应对。他们发现，将数据精简至仅9000个高质量对，反而提升了训练7B和13B参数Llama-v1 LLM的性能。

![优化LLM数据集视角图11](https://sebastianraschka.com/images/blog/2023/optimizing-llms-dataset-perspective/image11.webp) *来自[AlpaGasus论文](https://arxiv.org/abs/2307.08701)的注释图*

然而如前所述，[NeurIPS LLM效率挑战赛](https://llm-efficiency-challenge.github.io/)不允许使用LLM生成的数据集。因此，基于Alpaca的Alpagasus数据集在此竞赛中无法使用。

一个可行的替代方案是使用LLM过滤人工生成（而非LLM生成）的数据集。但我不确定基于LLM的数据集过滤是否被允许，因此在竞赛中使用此类数据集前，务必通过组织者的Discord频道确认。

后续章节将介绍如何使用LIMA等数据集训练最新的开源LLM，同时我也会重点介绍在[NeurIPS LLM效率挑战赛](https://llm-efficiency-challenge.github.io/)中值得尝试的研究方向。

## 结论[](#conclusion)

本文介绍了指令微调，并阐述了LLM生成数据集与人工生成数据集各自的优势。我们还通过快速教程演示了如何使用不同数据集微调开源LLM，以及如何利用自有数据集创建定制LLM。与专有API和服务相比，这类定制LLM能帮助您在公司内部充分利用特定数据集、优化特定场景下的LLM性能，并实现完全隐私控制。

如有任何问题，欢迎随时联系：

-   若您对Lit-GPT有任何建议、反馈或问题，如确认为bug，请通过[GitHub提交Issue](https://github.com/Lightning-AI/lit-gpt/issues)。

-   此外，非常欢迎通过[Lit-GPT拉取请求](https://github.com/Lightning-AI/lit-gpt/pulls)提交改进方案和新技术的实现！

如果您正在参与[NeurIPS LLM效率挑战赛](https://llm-efficiency-challenge.github.io/)，希望您和我一样觉得这场竞赛既实用又令人兴奋。

-   建议从[我整理的快速入门指南](https://github.com/Lightning-AI/lit-gpt/blob/main/tutorials/neurips_challenge_quickstart.md)开始。

-   关于特定数据集是否允许参赛，建议通过组织者的[Discord频道](https://discord.gg/XJwQ5ddMK7)再次确认。

-   关于挑战赛中Lit-GPT的相关问题，我在Lightning AI的同事也维护了一个[Discord频道](https://discord.gg/MWAEvnC5fU)。

祝学习、编码和实验愉快！
