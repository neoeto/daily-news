---
title: Understanding the 4 Main Approaches to LLM Evaluation (From Scratch)
url: 'https://magazine.sebastianraschka.com/p/llm-evaluation-4-approaches'
url_hash: f61e677d50bc3afdd652bb85d932176332b118d7
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-10-05T00:06:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
**我们到底该如何评估大语言模型？**
这个问题看似简单，却往往能引出更广泛的讨论。

在为项目提供咨询或合作时，我经常被问及如何在不同模型之间做选择，以及如何理解现有的评估结果。（当然，也包括在微调或开发自有模型时如何衡量进展。）

由于这个问题频繁出现，我想分享一个简短的概述，介绍人们用来比较大语言模型的主要评估方法，或许会有所帮助。当然，大语言模型评估是一个非常大的话题，无法在一篇文章中详尽覆盖，但我认为，清晰掌握这些主要方法的思维导图，会让我们更容易理解各种基准测试、排行榜和研究论文。

我原本计划将这些评估技术纳入我即将出版的新书 *《从零构建推理模型》*（[Build a Reasoning Model (From Scratch)](https://mng.bz/Nwr7)），但它们最终超出了书的主要范围。（这本书本身更侧重于基于验证器的评估。）所以，我觉得以一篇长文的形式分享这些内容，并附上从零开始的代码示例，会是个不错的主意。

在《从零构建推理模型》一书中，我采用动手实践的方法，从零开始构建一个推理大语言模型。
如果你喜欢《从零构建大语言模型》这本书，那么本书的写作风格与之类似，同样使用纯 PyTorch 从零构建一切。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Q_QP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Q_QP!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 424w, https://substackcdn.com/image/fetch/$s_!Q_QP!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 848w, https://substackcdn.com/image/fetch/$s_!Q_QP!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 1272w, https://substackcdn.com/image/fetch/$s_!Q_QP!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Q_QP!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png" width="1456" height="590" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/b34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:590,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:673404,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:false,&quot;topImage&quot;:true,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Q_QP!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 424w, https://substackcdn.com/image/fetch/$s_!Q_QP!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 848w, https://substackcdn.com/image/fetch/$s_!Q_QP!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 1272w, https://substackcdn.com/image/fetch/$s_!Q_QP!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb34a8123-ef28-48bb-8ea2-28404b08d013_2461x997.png 1456w" sizes="100vw" fetchpriority="high"></picture></div></a><figcaption><span>推理是近期提升大语言模型能力最令人兴奋且最重要的进展之一，但如果你只是听说过“推理”这个词，并仅从理论上了解它，那么它也是最容易被误解的概念之一。因此，</span><a href="https://mng.bz/Nwr7">在这本书中</a><span>，我采用动手实践的方法，从零开始构建一个推理大语言模型。</span></figcaption></figure>

这本书目前处于早期访问阶段，已有超过100页内容在线，我刚刚又完成了30页，排版团队正在添加中。如果你加入了早期访问计划（非常感谢你的支持！），当这些新内容上线时，你应该会收到一封邮件。

*PS：目前大语言模型研究领域有很多新进展。我正在努力追赶我不断增长的已收藏论文列表，并计划在下一篇文章中重点介绍其中一些最有趣的。*

但现在，让我们来讨论四种主要的大语言模型评估方法，以及它们的从零开始代码实现，以便更好地理解它们的优点和缺点。

在实践中，评估已训练的大语言模型有四种常见方法：*多项选择*、*验证器*、*排行榜*和*大语言模型评判*，如下图1所示。研究论文、营销材料、技术报告和模型卡（大语言模型特定技术报告的术语）通常包含来自其中两个或多个类别的结果。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!nwaB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!nwaB!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 424w, https://substackcdn.com/image/fetch/$s_!nwaB!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 848w, https://substackcdn.com/image/fetch/$s_!nwaB!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 1272w, https://substackcdn.com/image/fetch/$s_!nwaB!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!nwaB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png" width="645" height="222.9857142857143" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/c26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:363,&quot;width&quot;:1050,&quot;resizeWidth&quot;:645,&quot;bytes&quot;:92153,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!nwaB!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 424w, https://substackcdn.com/image/fetch/$s_!nwaB!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 848w, https://substackcdn.com/image/fetch/$s_!nwaB!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 1272w, https://substackcdn.com/image/fetch/$s_!nwaB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc26764a9-6a26-4467-bb03-74b6cd1ed72b_1050x363.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图1：本文涵盖的4种不同评估模型概览。</figcaption></figure>

此外，这里介绍的四个类别可分为两组：*基于基准的评估*和*基于判断的评估*，如上图所示。

（还有其他指标，如*训练损失*、*困惑度*和*奖励*，但它们通常在模型开发过程中内部使用。）

以下小节简要概述了每种方法，并提供了示例。

我们从基于基准的方法开始：多项选择题问答。

历史上，最广泛使用的评估方法之一是多项选择基准，例如*MMLU*（大规模多任务语言理解的缩写，[https://huggingface.co/datasets/cais/mmlu](https://huggingface.co/datasets/cais/mmlu)）。为了说明这种方法，图2展示了MMLU数据集中的一个代表性任务。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!WmmA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!WmmA!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 424w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 848w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1272w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!WmmA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png" width="1040" height="608" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:608,&quot;width&quot;:1040,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:146320,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!WmmA!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 424w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 848w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1272w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图2：在MMLU上评估LLM，将其多项选择预测与数据集中的正确答案进行比较。</figcaption></figure>

图2仅展示了MMLU数据集中的一个示例。完整的MMLU数据集包含57个学科（从高中数学到生物学），总共约1.6万个多项选择题，性能以准确率（正确回答问题的比例）衡量，例如，如果1.6万个问题中有1.4万个回答正确，则准确率为87.5%。

像MMLU这样的多项选择基准，以直接、可量化的方式测试LLM的知识回忆能力，类似于标准化测试、许多学校考试或理论驾驶考试。

> 注意，图2展示的是多项选择评估的简化版本，其中模型预测的答案字母直接与正确答案进行比较。还存在另外两种流行的方法，涉及*对数概率评分*。我在[GitHub上](https://github.com/rasbt/reasoning-from-scratch/tree/main/chF/02_mmlu)实现了它们。（由于这建立在本文解释的概念之上，我建议在完成本文后再查看。）

以下小节说明如何用代码实现图2所示的MMLU评分。

首先，在MMLU上评估之前，我们必须加载预训练模型。这里，我们将使用纯PyTorch从头实现的Qwen3 0.6B模型，该模型仅需约1.5 GB的RAM。

注意，Qwen3模型的实现细节在此并不重要；我们只需将其视为一个待评估的LLM。不过，如果你感兴趣，可以在我之前的一篇文章[《从零理解并实现Qwen3》](https://magazine.sebastianraschka.com/p/qwen3-from-scratch)中找到从头实现的指南，源代码也可在[GitHub上](https://github.com/rasbt/reasoning-from-scratch/blob/main/reasoning_from_scratch/qwen3.py)获取。

我们无需复制粘贴Qwen3源代码的众多行，而是从我的[reasoning\_from\_scratch](https://github.com/rasbt/reasoning-from-scratch/blob/main/reasoning_from_scratch) Python库中导入，该库可通过以下命令安装：

```
pip install reasoning_from_scratch
```

或

```
uv add reasoning_from_scratch
```

```
from pathlib import Path
import torch
from reasoning_from_scratch.ch02 import get_device
from reasoning_from_scratch.qwen3 import (
    download_qwen3_small, Qwen3Tokenizer,
    Qwen3Model, QWEN_CONFIG_06_B
)

device = get_device()
```

# 将矩阵乘法精度设置为"high"，以
# 在兼容GPU上启用Tensor Core
torch.set_float32_matmul_precision("high")

# 如果遇到设备兼容性问题，
# 请取消下面这行的注释
# device = "cpu"

# 默认使用基础模型
WHICH_MODEL = "base"

if WHICH_MODEL == "base":
    download_qwen3_small(
        kind="base", tokenizer_only=False, out_dir="qwen3"
    )
    tokenizer_path = Path("qwen3") / "tokenizer-base.json"
    model_path = Path("qwen3") / "qwen3-0.6B-base.pth"
    tokenizer = Qwen3Tokenizer(tokenizer_file_path=tokenizer_path)

elif WHICH_MODEL == "reasoning":
    download_qwen3_small(
        kind="reasoning", tokenizer_only=False, out_dir="qwen3"
    )
    tokenizer_path = Path("qwen3") / "tokenizer-reasoning.json"
    model_path = Path("qwen3") / "qwen3-0.6B-reasoning.pth"
    tokenizer = Qwen3Tokenizer(
        tokenizer_file_path=tokenizer_path,
        apply_chat_template=True,
        add_generation_prompt=True,
        add_thinking=True,
    )

else:
    raise ValueError(f"无效选择：WHICH_MODEL={WHICH_MODEL}")

model = Qwen3Model(QWEN_CONFIG_06_B)
model.load_state_dict(torch.load(model_path))
model.to(device)

# 可选：启用模型编译以提升性能
USE_COMPILE = False
if USE_COMPILE:
    torch._dynamo.config.allow_unspec_int_on_nn_module = True
    model = torch.compile(model)
```

在本节中，我们实现最简单且最直观的MMLU评分方法，该方法通过检查生成的多选题答案字母是否与正确答案匹配来进行评分。这与前面图2中展示的方法类似，为方便起见，下面再次展示该图。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!WmmA!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!WmmA!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 424w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 848w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1272w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!WmmA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png" width="1040" height="608" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:608,&quot;width&quot;:1040,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:146320,&quot;alt&quot;:&quot;&quot;,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" title="" srcset="https://substackcdn.com/image/fetch/$s_!WmmA!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 424w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 848w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1272w, https://substackcdn.com/image/fetch/$s_!WmmA!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d5f7998-21be-4144-bfc2-57b2e0a4b1c4_1040x608.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图3：通过将LLM的多选题预测与数据集中的正确答案进行比较，在MMLU上评估LLM。</figcaption></figure>

为此，我们将使用MMLU数据集中的一个示例：

```
example = {
    "question": (
        "将4个可区分的球放入2个不可区分的盒子中，"
        "有多少种方法？"
    ),
    "choices": ["7", "11", "16", "8"],
    "answer": "D",
}
```

接下来，我们定义一个函数来格式化LLM的提示。

```
def format_prompt(example):
    return (
        f"{example['question']}\n"
        f"A. {example['choices'][0]}\n"
        f"B. {example['choices'][1]}\n"
        f"C. {example['choices'][2]}\n"
        f"D. {example['choices'][3]}\n"
        "答案："
    )
# "答案："后面的空格鼓励模型生成单个字母作为下一个token
```

让我们在MMLU示例上执行该函数，以了解格式化后的LLM输入是什么样的：

```
prompt = format_prompt(example)
print(prompt)
```

输出为：

将4个可区分的球放入2个不可区分的盒子中，有多少种方法？

```
将4个可区分的球放入2个不可区分的盒子中，有多少种方法？
A. 7
B. 11
C. 16
D. 8
答案：
```

如上所示，模型提示为模型提供了不同答案选项的列表，并以“答案：”文本结尾，鼓励模型生成正确答案。

虽然并非严格必要，但有时将额外的题目及其正确答案作为输入提供给模型也会有所帮助，这样模型可以观察如何解决任务。（例如，提供5个示例的情况也称为5-shot MMLU。）然而，对于当前一代的LLM，即使是基础模型也相当强大，因此这并非必需。

> #### **加载不同的 MMLU 样本**
>
> 你可以通过 datasets 库直接从 MMLU 数据集中加载示例（可通过 `pip install datasets` 或 `uv add datasets` 安装）：
>
> ```
> from datasets import load_dataset
>
> configs = get_dataset_config_names("cais/mmlu")
> dataset = load_dataset("cais/mmlu", "high_school_mathematics")
> # 检查测试集中的第一个示例：
> example = dataset["test"][0]
> print(example)
> ```
>
> 上面我们使用了 `"high_school_mathematics"` 子集；要获取其他子集的列表，请使用以下代码：
>
> ```
> from datasets import get_dataset_config_names
>
> subsets = get_dataset_config_names("cais/mmlu")
> print(subsets)
> ```

接下来，我们对提示进行分词，并将其包装成 PyTorch 张量对象，作为 LLM 的输入：

```
prompt_ids = tokenizer.encode(prompt)
prompt_fmt = torch.tensor(prompt_ids, device=device)
# 添加批次维度：
prompt_fmt = prompt_fmt.unsqueeze(0)
```

然后，在完成所有设置后，我们定义下面的主要评分函数，该函数会生成几个 token（默认生成 8 个 token），并提取模型输出的第一个字母 A/B/C/D。

```
from reasoning_from_scratch.ch02_ex import (
    generate_text_basic_stream_cache
)

def predict_choice(
    model, tokenizer, prompt_fmt, max_new_tokens=8
):
    pred = None
    for t in generate_text_basic_stream_cache(
        model=model,
        token_ids=prompt_fmt,
        max_new_tokens=max_new_tokens,
        eos_token_id=tokenizer.eos_token_id,
    ):
        answer = tokenizer.decode(t.squeeze(0).tolist())
        for letter in answer:
            letter = letter.upper()
            # 一旦出现字母就停止
            if letter in "ABCD":
                pred = letter
                break
        if pred:
            break
    return pred
```

然后，我们可以使用上面代码块中的函数来检查生成的字母，如下所示：

```
pred1 = predict_choice(model, tokenizer, prompt_fmt)
print(
    f"生成的字母: {pred1}\n"
    f"是否正确? {pred1 == example['answer']}"
)
```

结果如下：

```
生成的字母: C
是否正确? False
```

如我们所见，在这种情况下生成的答案不正确（`False`）。

这只是 MMLU 中 `high_school_mathematics` 子集 270 个示例中的一个。下面的截图（图 4）展示了基础模型和推理变体在完整子集上执行时的性能。相关代码可在 [GitHub 上此处](https://github.com/rasbt/reasoning-from-scratch/blob/main/chF/02_mmlu/1_letter_matching.py) 获取。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!HSuI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!HSuI!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 424w, https://substackcdn.com/image/fetch/$s_!HSuI!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 848w, https://substackcdn.com/image/fetch/$s_!HSuI!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 1272w, https://substackcdn.com/image/fetch/$s_!HSuI!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!HSuI!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png" width="1456" height="917" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:917,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:571085,&quot;alt&quot;:&quot;&quot;,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" title="" srcset="https://substackcdn.com/image/fetch/$s_!HSuI!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 424w, https://substackcdn.com/image/fetch/$s_!HSuI!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 848w, https://substackcdn.com/image/fetch/$s_!HSuI!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 1272w, https://substackcdn.com/image/fetch/$s_!HSuI!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F098958b6-4a5b-4070-a350-8f318abcede2_1815x1143.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>图 4：基础模型和推理模型在 MMLU </span><code>high_school_mathematics</code><span> 子集上的性能</span></figcaption></figure>

假设问题的答案概率相等，随机猜测者（以均匀概率选择 A、B、C 或 D）预计能达到 25% 的概率。因此，基础模型和推理模型的表现都不太好。

> #### **多项选择题答案格式**
>
> 请注意，本节为说明目的实现了一个简化版的多项选择评估，即直接将模型预测的答案字母与正确答案进行比较。在实践中，存在更广泛使用的变体，例如对数概率评分，我们通过它衡量模型对每个候选答案的认可程度，而不仅仅是检查最终的字母选择。（我们将在第4章讨论基于概率的评分。）对于推理模型，评估还可以包括在将正确答案作为输入提供时，评估模型生成该答案的可能性。
>
> <figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!MM--!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!MM--!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 424w, https://substackcdn.com/image/fetch/$s_!MM--!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 848w, https://substackcdn.com/image/fetch/$s_!MM--!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 1272w, https://substackcdn.com/image/fetch/$s_!MM--!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!MM--!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png" width="1389" height="857" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/e5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:857,&quot;width&quot;:1389,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:255774,&quot;alt&quot;:&quot;&quot;,&quot;title&quot;:&quot;&quot;,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" title="" srcset="https://substackcdn.com/image/fetch/$s_!MM--!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 424w, https://substackcdn.com/image/fetch/$s_!MM--!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 848w, https://substackcdn.com/image/fetch/$s_!MM--!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 1272w, https://substackcdn.com/image/fetch/$s_!MM--!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5fb712c-10f1-4240-b3e6-2cbf7ccfc356_1389x857.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>图5：其他MMLU评分方法已在</span><a href="https://github.com/rasbt/reasoning-from-scratch/tree/main/chF/02_mmlu">GitHub此处</a><span>描述并分享</span></figcaption></figure>
>
> 然而，无论我们使用哪种MMLU评分变体，评估仍然归结为检查模型是否从预定义的答案选项中进行选择。

**像MMLU这样的多项选择基准测试的一个局限性在于，它们仅衡量LLM从预定义选项中选择的能力，因此除了检查模型与基础模型相比遗忘知识的程度外，对于评估推理能力并不十分有用。** 它无法捕捉自由形式的写作能力或实际效用。

尽管如此，多项选择基准测试仍然是简单且有用的诊断工具：例如，高MMLU分数不一定意味着模型在实际使用中表现强劲，但低分数可以突显潜在的知识差距。

与上一节讨论的多项选择问答相关，基于验证的方法通过准确率指标来量化LLM的能力。然而，与多项选择基准测试不同，验证方法允许LLM提供自由形式的答案。然后我们提取相关的答案部分，并使用所谓的验证器将答案部分与数据集中提供的正确答案进行比较，如下图6所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!RL2q!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!RL2q!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 424w, https://substackcdn.com/image/fetch/$s_!RL2q!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 848w, https://substackcdn.com/image/fetch/$s_!RL2q!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 1272w, https://substackcdn.com/image/fetch/$s_!RL2q!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!RL2q!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png" width="656" height="663.4010256410256" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/0304413b-aa78-4488-a157-841d6399d3e6_975x986.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:986,&quot;width&quot;:975,&quot;resizeWidth&quot;:656,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!RL2q!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 424w, https://substackcdn.com/image/fetch/$s_!RL2q!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 848w, https://substackcdn.com/image/fetch/$s_!RL2q!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 1272w, https://substackcdn.com/image/fetch/$s_!RL2q!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0304413b-aa78-4488-a157-841d6399d3e6_975x986.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图6：在自由形式问答中使用基于验证的方法评估LLM。模型生成一个自由形式的答案（可能包含多个步骤）和一个最终的方框答案，该答案被提取出来并与数据集中提供的正确答案进行比较。</figcaption></figure>

当我们如上图所示将提取的答案与提供的答案进行比较时，我们可以使用外部工具，例如代码解释器或类似计算器的工具/软件。

其缺点在于，这种方法只能应用于易于（且最好是确定性）验证的领域，例如数学和代码。此外，这种方法可能会引入额外的复杂性和依赖关系，并可能将部分评估负担从模型本身转移到外部工具上。

然而，由于它允许我们以编程方式生成无限数量的数学问题变体，并受益于逐步推理，它已成为推理模型评估和开发的基石。

我在《构建推理模型（从零开始）》一书中，用35页的篇幅详细探讨了这个主题，因此这里不再展示代码实现。（我上周已经提交了该章节。如果你拥有早期访问版本，当它上线时你会收到邮件通知，届时即可阅读。与此同时，你可以在[GitHub上](https://github.com/rasbt/reasoning-from-scratch/blob/main/ch03/01_main-chapter-code/ch03_main.ipynb)找到逐步的代码。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!P2NG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!P2NG!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 424w, https://substackcdn.com/image/fetch/$s_!P2NG!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 848w, https://substackcdn.com/image/fetch/$s_!P2NG!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 1272w, https://substackcdn.com/image/fetch/$s_!P2NG!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!P2NG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png" width="1406" height="656" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:656,&quot;width&quot;:1406,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:143170,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!P2NG!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 424w, https://substackcdn.com/image/fetch/$s_!P2NG!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 848w, https://substackcdn.com/image/fetch/$s_!P2NG!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 1272w, https://substackcdn.com/image/fetch/$s_!P2NG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F74860b8a-d12a-4781-8362-d5eb06feb389_1406x656.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>图7：基于验证的评估方法示例，详见</span><a href="https://github.com/rasbt/reasoning-from-scratch/blob/main/ch03/01_main-chapter-code/ch03_main.ipynb">GitHub</a></figcaption></figure>

到目前为止，我们已经介绍了两种能够提供易于量化指标（如模型准确率）的方法。然而，上述方法都没有以更全面的方式评估LLM，包括评判响应的风格。在本节中，如图8所示，我们将讨论一种基于评判的方法，即LLM排行榜。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!nm_T!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!nm_T!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 424w, https://substackcdn.com/image/fetch/$s_!nm_T!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 848w, https://substackcdn.com/image/fetch/$s_!nm_T!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 1272w, https://substackcdn.com/image/fetch/$s_!nm_T!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!nm_T!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png" width="639" height="262.1391382405745" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:457,&quot;width&quot;:1114,&quot;resizeWidth&quot;:639,&quot;bytes&quot;:100702,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!nm_T!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 424w, https://substackcdn.com/image/fetch/$s_!nm_T!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 848w, https://substackcdn.com/image/fetch/$s_!nm_T!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 1272w, https://substackcdn.com/image/fetch/$s_!nm_T!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36c6779c-5eb0-4cfd-88fd-b1b68f44b227_1114x457.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图8：本书所涵盖主题的思维模型，重点聚焦于本附录中讨论的基于评判和基准的评估方法。在上一节中我们已经介绍了基于基准的方法（选择题、验证器），现在我们将介绍基于评判的方法来衡量LLM性能，本小节重点讨论排行榜。</figcaption></figure>

这里描述的排行榜方法是一种基于评判的方法，其中模型不是根据准确率或其他固定基准分数进行排名，而是根据用户（或其他LLM）对其输出的偏好进行排名。

一个流行的排行榜是 *[LM Arena](https://lmarena.ai/)*（原名 *Chatbot Arena*），用户可以在其中比较两个用户选择或匿名模型的响应，并投票选出他们更喜欢的那个，如图9所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!m7Un!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!m7Un!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 424w, https://substackcdn.com/image/fetch/$s_!m7Un!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 848w, https://substackcdn.com/image/fetch/$s_!m7Un!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 1272w, https://substackcdn.com/image/fetch/$s_!m7Un!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!m7Un!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png" width="1456" height="1110" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/a1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1110,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!m7Un!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 424w, https://substackcdn.com/image/fetch/$s_!m7Un!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 848w, https://substackcdn.com/image/fetch/$s_!m7Un!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 1272w, https://substackcdn.com/image/fetch/$s_!m7Un!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1a1816e-790d-421c-a364-48efe66ae622_1600x1220.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图9：基于评判的排行榜界面示例（LM Arena）。两个LLM被给予相同的提示，它们的响应并排显示，用户投票选出更喜欢的答案。</figcaption></figure>

这些偏好投票（如上图所示收集）随后会汇总所有用户的结果，形成一个根据用户偏好对不同模型进行排名的排行榜。LM Arena排行榜的当前快照（2025年10月3日访问）如下方图10所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!KhbK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!KhbK!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 424w, https://substackcdn.com/image/fetch/$s_!KhbK!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 848w, https://substackcdn.com/image/fetch/$s_!KhbK!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 1272w, https://substackcdn.com/image/fetch/$s_!KhbK!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!KhbK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png" width="1115" height="818" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:818,&quot;width&quot;:1115,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:143874,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!KhbK!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 424w, https://substackcdn.com/image/fetch/$s_!KhbK!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 848w, https://substackcdn.com/image/fetch/$s_!KhbK!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 1272w, https://substackcdn.com/image/fetch/$s_!KhbK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2eb7522f-34c1-4d0a-8f54-d5276a77e740_1115x818.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图10：LM Arena排行榜截图，展示了基于用户对文本任务偏好的当前领先LLM</figcaption></figure>

在本节的剩余部分，我们将实现一个简单的排行榜示例。

为了提供一个具体的例子，假设用户在一个类似图9的设置中提示不同的LLM。下面的列表代表成对投票，其中第一个模型是胜者：

```
votes = [
    ("GPT-5", "Claude-3"),
    ("GPT-5", "Llama-4"),
    ("Claude-3", "Llama-3"),
    ("Llama-4", "Llama-3"),
    ("Claude-3", "Llama-3"),
    ("GPT-5", "Llama-3"),
]
```

在上面的列表中，`votes` 列表中的每个元组代表两个模型之间的成对偏好，写作 `(winner, loser)`。因此，`("GPT-5", "Claude-3")` 表示用户更喜欢 GPT-5 而不是 Claude-3 模型的回答。

在本节的剩余部分，我们将把 `votes` 列表转化为一个排行榜。为此，我们将使用流行的 [Elo 评分系统](https://en.wikipedia.org/wiki/Elo_rating_system)，该系统最初是为国际象棋选手排名而开发的。

在我们查看具体的代码实现之前，简而言之，它的工作原理如下。每个模型从一个基准分数开始。然后，在每次比较和偏好投票之后，模型的评分会被更新。（在 Elo 中，更新的幅度取决于结果有多令人惊讶。）

具体来说，如果用户更喜欢当前模型而不是一个排名较高的模型，当前模型将获得相对较大的排名更新，并在排行榜上排名更高。反之，如果它击败了一个排名较低的对手，更新幅度则较小。（如果当前模型输了，它会以类似的方式更新，但排名分数会被减去而不是增加。）

将成对排名转化为排行榜的代码如下所示。

```
def elo_ratings(vote_pairs, k_factor=32,
                initial_rating=1000):
    # 所有模型初始化为相同的基准评分
    ratings = {
        model: initial_rating
        for pair in vote_pairs
        for model in pair
    }

# 每场比赛后更新评分
    for winner, loser in vote_pairs:

# 当前胜者的期望得分
        expected_winner = 1.0 / (
            1.0 + 10 ** (
                (ratings[loser] - ratings[winner])
                / 400.0
            )
        )

# k_factor 决定更新的敏感度
        ratings[winner] = (
            ratings[winner]
            + k_factor * (1 - expected_winner)
        )
        ratings[loser] = (
            ratings[loser]
            + k_factor * (0 - (1 - expected_winner))
        )

return ratings
```

上面定义的 `elo_ratings` 函数将投票作为输入，并将其转化为一个排行榜，如下所示：

```
ratings = elo_ratings(votes, k_factor=32, initial_rating=1000)
for model in sorted(ratings, key=ratings.get, reverse=True):
    print(f"{model:8s} : {ratings[model]:.1f}")
```

这会产生以下排行榜排名，分数越高越好：

```
GPT-5 : 1043.7
Claude-3 : 1015.2
Llama-4 : 1000.7
Llama-3 : 940.4
```

那么，这是如何工作的呢？对于每一对，我们使用以下公式计算胜者的期望得分：

```
expected_winner = 1 / (1 + 10 ** ((rating_loser - rating_winner) / 400))
```

这个值 `expected_winner` 是基于当前评分，模型在无平局情况下获胜的预测概率。它决定了评分更新的幅度。

首先，每个模型从 `initial_rating = 1000` 开始。如果两个评分（胜者和败者）相等，我们有 `expected_winner = 0.5`，表示势均力敌。在这种情况下，更新为：

```
rating_winner + k_factor * (1 - 0.5) = rating_winner + 16

rating_loser + k_factor * (0 - (1 - 0.5)) = rating_loser - 16
```

现在，如果一个大热门（评分高的模型）获胜，我们有 `expected_winner ≈ 1`。热门方只获得少量分数，而失败方也只损失少量分数：

```
rating_winner + 32 * (1 - 0.99) = rating_winner + 0.32

rating_loser + 32 * (0 - (1 - 0.99)) = rating_loser - 0.32
```

然而，如果一匹黑马（评分低的模型）获胜，我们有 `expected_winner ≈ 0`，获胜者几乎获得全部 `k_factor` 分数，而失败者损失大致相同的分数：

```
rating_winner + 32 * (1 - 0.01) = rating_winner + 31.68

rating_loser + 32 * (0 - (1 - 0.01)) = rating_loser - 31.68
```

> #### **顺序很重要**
>
> Elo 方法在每场比赛（模型比较）后更新评分，因此后续结果建立在已经更新的评分之上。这意味着相同的一组结果，如果以不同的顺序呈现，最终得分可能会略有不同。这种影响通常很轻微，但当冷门出现得早或晚时，尤其可能发生。
>
> 为了减少这种顺序效应，我们可以打乱投票对，多次运行 `elo_ratings` 函数并取评分的平均值。

像上述这样的排行榜方法，相比静态的基准分数，提供了对模型质量的更动态的视角。然而，结果可能受到用户人口统计、提示选择和投票偏见的影响。基准测试和排行榜也可能被操纵，用户可能根据风格而非正确性来选择回答。最后，与自动化的基准测试框架相比，排行榜无法为新开发的变体提供即时反馈，这使得它们在活跃的模型开发过程中难以使用。

> #### **其他排名方法**
>
> LM Arena 最初使用本节描述的 Elo 方法，但最近过渡到基于 Bradley–Terry 模型的统计方法。Bradley-Terry 模型的主要优势在于，由于具有统计基础，它可以构建置信区间来表达排名的不确定性。此外，与 Elo 评分相比，Bradley-Terry 模型通过对整个数据集进行统计拟合来联合估计所有评分，这使其不受顺序效应的影响。
>
> 为了使报告的分数保持在熟悉的范围内，Bradley-Terry 模型被拟合以产生与 Elo 相当的值。尽管排行榜不再正式使用 Elo 评分，但“Elo”一词在 LLM 研究人员和从业者比较模型时仍被广泛使用。展示 Elo 评分的代码示例可在 [GitHub 上](https://github.com/rasbt/reasoning-from-scratch/tree/main/chF/03_leaderboards)找到。
>
> <figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!hCOf!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!hCOf!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 424w, https://substackcdn.com/image/fetch/$s_!hCOf!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 848w, https://substackcdn.com/image/fetch/$s_!hCOf!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 1272w, https://substackcdn.com/image/fetch/$s_!hCOf!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!hCOf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png" width="1301" height="688" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:688,&quot;width&quot;:1301,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:206507,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!hCOf!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 424w, https://substackcdn.com/image/fetch/$s_!hCOf!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 848w, https://substackcdn.com/image/fetch/$s_!hCOf!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 1272w, https://substackcdn.com/image/fetch/$s_!hCOf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F57300005-93c2-4984-b099-475e4c7d6aac_1301x688.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>图 11：Elo 和 Bradley-Terry 排名的比较；源代码可在 </span><a href="https://github.com/rasbt/reasoning-from-scratch/tree/main/chF/03_leaderboards">GitHub 上</a><span>获取。</span></figcaption></figure>

早期，LLM的评估主要依赖统计和启发式方法，其中一种指标是*BLEU*，它能粗略衡量生成文本与参考文本的匹配程度。这类指标的缺陷在于要求精确的词匹配，无法处理同义词、词形变化等情况。

若要从整体上评判书面回答文本，一种解决方案是采用上一节讨论的相对排名和排行榜方法。但排行榜的缺点在于基于偏好的比较具有主观性，因为涉及人工反馈（以及收集这些反馈所伴随的挑战）。

另一种相关方法是使用另一个LLM配合预定义的评分*量规*（即评估指南），将LLM的回答与参考回答进行对比，并基于预定量规评判回答质量，如图12所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!o8kH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!o8kH!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 424w, https://substackcdn.com/image/fetch/$s_!o8kH!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 848w, https://substackcdn.com/image/fetch/$s_!o8kH!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 1272w, https://substackcdn.com/image/fetch/$s_!o8kH!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!o8kH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png" width="1456" height="1295" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1295,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!o8kH!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 424w, https://substackcdn.com/image/fetch/$s_!o8kH!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 848w, https://substackcdn.com/image/fetch/$s_!o8kH!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 1272w, https://substackcdn.com/image/fetch/$s_!o8kH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b646f80-a08d-40f4-ae65-eb7b850c7ccd_1503x1337.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图F12：LLM评判评估示例。待评估模型生成回答，然后由独立的评判LLM根据量规和提供的参考回答进行评分。</figcaption></figure>

在实践中，图12所示的基于评判的方法在评判LLM能力较强时效果良好。常见做法是通过API使用领先的专有LLM（例如GPT-5 API），但也存在专门的评判模型。（例如，[Phudge](https://arxiv.org/abs/2405.08029)就是众多例子之一；最终，这些专门模型大多只是经过微调的小型模型，以模仿专有GPT模型的评分行为。）

评判方法效果出色的原因之一在于，评估回答通常比生成回答更容易。

要在Python中以编程方式实现图12所示的基于评判的模型评估，我们可以加载较大的Qwen3模型到PyTorch中，并用评分量规和待评估的模型回答来提示它。

或者，我们可以通过API使用其他LLM，例如ChatGPT或Ollama API。

由于我们已经知道如何在PyTorch中加载Qwen3模型，为了增加趣味性，在本节的剩余部分，我们将使用Python中的Ollama API来实现图12所示的基于评判的评估。

具体来说，我们将使用OpenAI的200亿参数gpt-oss开放权重模型，因为它在能力和效率之间取得了良好的平衡。有关gpt-oss的更多信息，请参阅我的文章《从GPT-2到gpt-oss：分析架构进展》：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!kftt!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F529c4cc7-161c-4d7c-b186-06e68c771776_1564x926.png">![从GPT-2到gpt-oss：分析架构进展](https://substackcdn.com/image/fetch/$s_!kftt!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F529c4cc7-161c-4d7c-b186-06e68c771776_1564x926.png)

](https://magazine.sebastianraschka.com/p/from-gpt-2-to-gpt-oss-analyzing-the)

[Ollama](https://ollama.com/) 是一款高效的开源应用程序，可在笔记本电脑上运行LLM。它作为开源[llama.cpp](https://github.com/ggerganov/llama.cpp)库的封装，该库用纯C/C++实现LLM以最大化效率。但请注意，Ollama仅是使用LLM生成文本（推理）的工具，不支持训练或微调LLM。

请访问官方网站 [https://ollama.com](https://ollama.com/) 安装 Ollama，并根据您的操作系统按照提供的说明进行操作：

-   **macOS 和 Windows 用户**：打开下载的 Ollama 应用程序。如果提示安装命令行使用，请选择“是”。

-   **Linux 用户**：使用 Ollama 网站上提供的安装命令。

在实现模型评估代码之前，我们先下载 gpt-oss 模型，并通过命令行终端使用它来验证 Ollama 是否正常工作。

在命令行（而非 Python 会话中）执行以下命令，尝试使用 200 亿参数的 gpt-oss 模型：

```
ollama run gpt-oss:20b
```

首次执行此命令时，将自动下载占用 14 GB 存储空间的 200 亿参数 gpt-oss 模型。输出如下所示：

```
$ ollama run gpt-oss:20b
pulling manifest
pulling b112e727c6f1: 100% ▕██████████████████████▏  13 GB
pulling fa6710a93d78: 100% ▕██████████████████████▏ 7.2 KB
pulling f60356777647: 100% ▕██████████████████████▏  11 KB
pulling d8ba2f9a17b3: 100% ▕██████████████████████▏   18 B
pulling 55c108d8e936: 100% ▕██████████████████████▏  489 B
verifying sha256 digest
writing manifest
removing unused layers
success
```

> #### **替代的 Ollama 模型**
>
> 请注意，`ollama run gpt-oss:20b` 命令中的 `gpt-oss:20b` 指的是 200 亿参数的 gpt-oss 模型。使用 Ollama 运行 `gpt-oss:20b` 模型需要大约 13 GB 的 RAM。如果您的机器没有足够的 RAM，可以尝试使用较小的模型，例如通过 `ollama run qwen3:4b` 运行 40 亿参数的 `qwen3:4b` 模型，该模型仅需约 4 GB 的 RAM。
>
> 对于性能更强的计算机，您也可以使用更大的 1200 亿参数 gpt-oss 模型，只需将 `gpt-oss:20b` 替换为 `gpt-oss:120b`。但请注意，该模型需要显著更多的计算资源。

模型下载完成后，我们会看到一个命令行界面，允许我们与模型交互。例如，尝试询问模型“1+2 等于多少？”：

```
>>> 1+2 等于多少？

思考中...

用户问：“1+2 等于多少？”这很简单：答案是 3。是否提供解释？可能只需简单

算术。提供答案：3。

...思考结束。

1 + 2 = **3**
```

您可以通过输入 `/bye` 来结束这个 `ollama run gpt-oss:20b` 会话。

您可以通过输入 `/bye` 来结束这个 `ollama run gpt-oss:20b` 会话。

在本节的剩余部分，我们将使用 ollama API。这种方法要求 Ollama 在后台运行。有三种不同的方式可以实现这一点：

1. 在终端中运行 `ollama serve` 命令（推荐）。这会将 Ollama 后端作为服务器运行，通常位于 `http://localhost:11434`。请注意，它不会加载模型，直到通过 API 调用它（在本节后面部分）。

2. 像之前一样运行 `ollama run gpt-oss:20b` 命令，但保持其打开状态，不要通过 `/bye` 退出会话。如前所述，这会在本地 Ollama 服务器周围打开一个最小的便利包装器。在后台，它使用与 `ollama serve` 相同的服务器 API。

3\. Ollama 桌面应用。打开桌面应用会自动运行相同的后端，并在其上提供图形界面，如图 12 所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!NeHY!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!NeHY!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 424w, https://substackcdn.com/image/fetch/$s_!NeHY!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 848w, https://substackcdn.com/image/fetch/$s_!NeHY!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 1272w, https://substackcdn.com/image/fetch/$s_!NeHY!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!NeHY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png" width="606" height="873.4116355653128" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/475023aa-2070-4533-9776-fba77b711052_911x1313.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1313,&quot;width&quot;:911,&quot;resizeWidth&quot;:606,&quot;bytes&quot;:474020,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!NeHY!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 424w, https://substackcdn.com/image/fetch/$s_!NeHY!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 848w, https://substackcdn.com/image/fetch/$s_!NeHY!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 1272w, https://substackcdn.com/image/fetch/$s_!NeHY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F475023aa-2070-4533-9776-fba77b711052_911x1313.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图 13：两种不同的选项来保持 Ollama 服务器（/应用程序）运行，以便我们可以通过 Python 中的 Ollama API 使用它。</figcaption></figure>

> #### **Ollama 服务器 IP 地址**
>
> Ollama 通过启动一个本地服务器进程在我们的机器上本地运行。当在终端中运行 `ollama serve` 时，如上所述，你可能会遇到错误消息 `Error: listen tcp 127.0.0.1:11434: bind: address already in use`。
>
> 如果是这种情况，请尝试使用命令 `OLLAMA_HOST=127.0.0.1:11435 ollama serve`（如果此地址也被占用，请尝试将数字递增 1，直到找到未使用的地址。）

以下代码验证 Ollama 会话是否正常运行，然后我们使用 Ollama 评估上一节中生成的测试集响应：

```
import psutil

def check_if_running(process_name):
    running = False
    for proc in psutil.process_iter(["name"]):
        if process_name in proc.info["name"]:
            running = True
            break
    return running

ollama_running = check_if_running("ollama")

if not ollama_running:
    raise RuntimeError(
        "Ollama 未运行。"
        "请先启动 Ollama 再继续。"
    )
print("Ollama 运行状态：", check_if_running("ollama"))
```

确保执行上述代码的输出显示 Ollama 运行状态：`True`。如果显示 `False`，请验证 `ollama serve` 命令或 Ollama 应用程序是否正在运行（见图 13）。

在本文的其余部分，我们将通过 Ollama REST API 使用 Python 与本地机器上运行的 gpt-oss 模型进行交互。以下 `query_model` 函数演示了如何使用该 API：

```
import json
import urllib.request

def query_model(
    prompt,
    model="gpt-oss:20b",
    # 如果你使用了
    # OLLAMA_HOST=127.0.0.1:11435 ollama serve
    # 请更新下面的地址
    url="http://localhost:11434/api/chat"
):
    # 创建数据负载作为字典：
    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        # 确定性响应所需的设置：
        "options": {
            "seed": 123,
            "temperature": 0,
            "num_ctx": 2048
        }
    }

# 将字典转换为 JSON 并编码为字节
    payload = json.dumps(data).encode("utf-8")

# 创建 POST 请求并添加标头
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST"
    )
    request.add_header("Content-Type", "application/json")

response_data = ""

# 发送请求并捕获流式响应
    with urllib.request.urlopen(request) as response:
        while True:
            line = response.readline().decode("utf-8")
            if not line:
                break
            # 将每一行解析为 JSON
            response_json = json.loads(line)
            response_data += response_json["message"]["content"]

return response_data
```

以下是如何使用我们刚刚实现的 `query_model` 函数的示例：

```
ollama_model = "gpt-oss:20b"
result = query_model("1+2 等于多少？", ollama_model)
print(result)
```

得到的响应是“3”。（由于默认设置不同，这与我们运行 Ollama run 或 Ollama 应用程序得到的结果不同。）

使用 `query_model` 函数，我们可以通过一个包含评分标准的提示词来评估模型生成的回复，该提示词要求 gpt-oss 模型根据正确答案作为参考，对目标模型的回复进行 1 到 5 分的评分。

我们使用的提示词如下所示：

```
def rubric_prompt(instruction, reference_answer, model_answer):
    rubric = (
        "你是一位公正的评审助手。你将收到"
        "一个指令、一个参考答案和"
        "一个待评估的候选答案，请根据"
        "以下评分标准进行评分：\n\n"
        "1：回复未能满足指令要求，提供无关、"
        "错误或过于冗长的内容。\n"
        "2：回复部分满足指令要求，但存在重大错误、"
        "遗漏或无关细节。\n"
        "3：回复在一定程度上满足了指令要求，但存在不完整、"
        "部分正确或表述不清的情况。\n"
        "4：回复基本遵循指令要求，仅存在轻微错误、"
        "遗漏或不够清晰。\n"
        "5：回复完全遵循指令要求，以简洁高效的方式"
        "提供了清晰、准确且相关的答案。\n\n"
        "现在，以下是指令、参考答案和回复。\n"
    )

prompt = (
        f"{rubric}\n"
        f"指令：\n{instruction}\n\n"
        f"参考答案：\n{reference_answer}\n\n"
        f"答案：\n{model_answer}\n\n"
        f"评分："
    )
    return prompt
```

`rubric_prompt` 中的 `model_answer` 旨在代表我们自己的模型在实际中生成的回复。为了便于说明，我们在这里硬编码一个合理的模型答案，而不是动态生成它。（不过，欢迎使用本文开头加载的 Qwen3 模型来生成真实的 `model_answer`）。

接下来，让我们为 Ollama 模型生成渲染后的提示词：

```
rendered_prompt = rubric_prompt(
    instruction=(
        "如果所有鸟都会飞，而企鹅是一种鸟，"
        "那么企鹅会飞吗？"
    ),
    reference_answer=(
        "是的，根据所有鸟都会飞的前提，"
        "企鹅会飞。"
    ),
    model_answer=(
        "是的——在这些前提下，企鹅应该能够飞行。"
    )
)
print(rendered_prompt)
```

输出如下：

```
你是一位公正的评审助手。你将收到一个指令、一个参考答案和一个待评估的候选答案，请根据以下评分标准进行评分：

1：回复未能满足指令要求，提供无关、错误或过于冗长的内容。
2：回复部分满足指令要求，但存在重大错误、遗漏或无关细节。
3：回复在一定程度上满足了指令要求，但存在不完整、部分正确或表述不清的情况。
4：回复基本遵循指令要求，仅存在轻微错误、遗漏或不够清晰。
5：回复完全遵循指令要求，以简洁高效的方式提供了清晰、准确且相关的答案。

现在，以下是指令、参考答案和回复。

指令：
如果所有鸟都会飞，而企鹅是一种鸟，那么企鹅会飞吗？

参考答案：
是的，根据所有鸟都会飞的前提，企鹅会飞。

答案：
是的——在这些前提下，企鹅是能够飞行的。

评估：
```

将提示词以 `“Evaluation: “` 结尾，会促使模型生成答案。让我们看看 gpt-oss:20b 模型如何评判这个回答：

```
result = query_model(rendered_prompt, ollama_model)
print(result)
```

得到的响应如下：

```
**得分：5**

候选答案直接回应了问题，正确应用了给定前提，并简洁地指出企鹅能够飞行。该答案准确、相关且清晰。
```

如我们所见，该回答获得了最高分，这很合理，因为它确实是正确的。虽然这是一个手动逐步演示的简单例子，但我们可以进一步扩展这个思路，实现一个循环，用评估数据集中的问题反复查询模型（例如我们之前加载的 Qwen3 模型），然后通过 gpt-oss 进行评估并计算平均分。你可以在 [GitHub 上](https://github.com/rasbt/reasoning-from-scratch/tree/main/chF/04_llm-judge) 找到这样一个脚本的实现，其中我们使用 MATH-500 数据集评估了 Qwen3 模型。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!e5fC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!e5fC!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 424w, https://substackcdn.com/image/fetch/$s_!e5fC!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 848w, https://substackcdn.com/image/fetch/$s_!e5fC!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 1272w, https://substackcdn.com/image/fetch/$s_!e5fC!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!e5fC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png" width="1332" height="864" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/04869674-1018-4da5-b287-100920e21b9b_1332x864.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:864,&quot;width&quot;:1332,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:327005,&quot;alt&quot;:&quot;&quot;,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" title="" srcset="https://substackcdn.com/image/fetch/$s_!e5fC!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 424w, https://substackcdn.com/image/fetch/$s_!e5fC!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 848w, https://substackcdn.com/image/fetch/$s_!e5fC!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 1272w, https://substackcdn.com/image/fetch/$s_!e5fC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04869674-1018-4da5-b287-100920e21b9b_1332x864.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><span>图 14：Qwen3 0.6 基础版与推理版在 MATH-500 前 10 个示例上的对比，由 gpt-oss:20b 作为评判者进行评估。你可以在 </span><a href="https://github.com/rasbt/reasoning-from-scratch/tree/main/chF/04_llm-judge">GitHub 上</a><span> 找到相关代码。</span></figcaption></figure>

> #### **使用过程奖励模型对中间推理步骤进行评分**
>
> 与符号验证器和 LLM 评判者相关，有一类学习模型被称为*过程奖励模型*（PRM）。与评判者类似，PRM 可以评估推理轨迹，而不仅仅是最终答案；但与通用评判者不同，它们专门关注推理的中间步骤。此外，与验证器（通常仅在结果层面通过符号方式检查正确性）不同，PRM 在强化学习训练过程中提供逐步的奖励信号。我们可以将 PRM 归类为“步骤级评判者”，它们主要用于训练，而非纯粹的评估。（在实践中，PRM 很难在大规模下可靠地训练。例如，DeepSeek R1 并未采用 PRM，而是在推理训练中结合了验证器。）

基于评判者的评估相比基于偏好的排行榜具有优势，包括可扩展性和一致性，因为它们不依赖大量的人类投票者。（从技术上讲，也可以将排行榜背后的基于偏好的评分外包给 LLM 评判者。）然而，LLM 评判者与人类投票者也有类似的弱点：结果可能受到模型偏好、提示设计和回答风格的影响。此外，它们对评判模型和评分标准的选择有很强的依赖性，并且缺乏固定基准的可重复性。

在本文中，我们介绍了四种不同的评估方法：多项选择、验证器、排行榜和 LLM 评判者。

我知道这是一篇很长的文章，但我希望它能帮助你全面了解LLM的评估方式。这种从头开始的方法虽然可能显得冗长，但却是理解这些方法底层运作机制的绝佳途径，进而帮助我们识别其弱点和改进空间。

话虽如此，你可能在想：“评估LLM的最佳方法是什么？”遗憾的是，并没有单一的最佳方法，因为正如我们所看到的，每种方法都有不同的权衡。简而言之：

**多项选择题**
(+) 相对快速且成本低廉，适合大规模运行
(+) 在不同论文（或模型卡）之间标准化且可复现
(-) 仅衡量基础知识回忆
(-) 不能反映LLM在现实世界中的使用方式

**验证器**
(+) 对于有标准答案的领域，提供标准化、客观的评分
(+) 允许自由形式的回答（对最终答案格式有一定限制）
(+) 如果使用过程验证器或过程奖励模型，还可以对中间步骤进行评分
(-) 需要可验证的领域（例如数学或代码），并且构建好的验证器可能很棘手
(-) 仅结果验证器只评估最终答案，不评估推理质量

**竞技场式排行榜（人类成对偏好）**
(+) 直接回答“人们更喜欢哪个模型？”基于真实提示
(+) 允许自由形式的回答，并隐含地考虑了风格、有用性和安全性
(-) 对人类来说成本高且耗时
(-) 不衡量正确性，只衡量偏好
(-) 非静态的参与者群体可能影响稳定性

**LLM作为裁判**
(+) 可跨多个任务扩展
(+) 允许自由形式的回答
(-) 依赖于裁判的能力（集成方法可以使其更稳健）
(-) 取决于评分标准的选择

虽然我通常不太喜欢雷达图，但在这里它有助于直观展示这些不同的评估领域，如下所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!vxlv!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!vxlv!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 424w, https://substackcdn.com/image/fetch/$s_!vxlv!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 848w, https://substackcdn.com/image/fetch/$s_!vxlv!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 1272w, https://substackcdn.com/image/fetch/$s_!vxlv!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!vxlv!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png" width="478" height="396.9107142857143" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/aacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1209,&quot;width&quot;:1456,&quot;resizeWidth&quot;:478,&quot;bytes&quot;:270638,&quot;alt&quot;:&quot;&quot;,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/175225406?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" title="" srcset="https://substackcdn.com/image/fetch/$s_!vxlv!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 424w, https://substackcdn.com/image/fetch/$s_!vxlv!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 848w, https://substackcdn.com/image/fetch/$s_!vxlv!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 1272w, https://substackcdn.com/image/fetch/$s_!vxlv!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faacd21b7-bf77-4cdc-bdb4-efe254a7e1b1_1586x1317.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图15：雷达图概念性地展示了在评估LLM时，我们理想情况下应关注不同领域，以识别其优势和劣势。</figcaption></figure>

例如，强大的多项选择评分表明模型具有扎实的通用知识。再结合强大的验证器分数，模型很可能也能正确回答技术问题。然而，如果模型在LLM作为裁判和排行榜评估中表现不佳，它可能在有效撰写或表达回答方面存在困难，并且可能受益于一些RLHF。

因此，最佳的评估方式应涵盖多个领域。但理想情况下，它还应使用与你的目标或业务问题直接相关的数据。例如，假设你正在部署一个用于辅助法律或法律相关任务的LLM。在标准基准测试（如MMLU）上运行模型作为快速合理性检查是合理的，但最终你需要将评估定制到目标领域，比如法律。你可以在网上找到公开的基准测试作为良好的起点，但最终仍需使用自己的专有数据进行测试。只有这样，你才能合理确信模型在训练期间未曾见过这些测试数据。

无论如何，模型评估是一个非常重要且宏大的主题。希望本文有助于解释主要评估方法的工作原理，并让你在下次查看或自行运行模型评估时获得一些有用的见解。

一如既往，
祝你玩得开心！

*这本杂志是我个人的热情项目，你的支持让它得以延续。*

*如果你愿意支持我的工作，请考虑我的《从零构建大型语言模型》一书或其续作《从零构建推理模型》。（我确信你会从中收获颇丰；它们以你无法在其他地方找到的深度解释了LLM的工作原理。）*

*感谢阅读，也感谢你支持独立研究！*

如果你读过这本书并有余暇，我将非常感激你留下简短的评论。这对我们作者帮助很大！

**你的支持意义重大！谢谢你！**

#### 关于本文的讨论

### 准备好了解更多了吗？
