---
title: The NeurIPS 2023 LLM Efficiency Challenge Starter Guide
url: 'https://sebastianraschka.com/blog/2023/neurips2023-starter-guide.html'
url_hash: ceb0004a91deef503d65e8550538cf446963ae1b
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2023-08-10T08:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
  - 前端
original_lang: en
truncated: false
---
大语言模型（LLMs）为开发更高效的训练方法提供了最有趣的机遇之一。几周前，NeurIPS 2023 LLM 效率挑战赛启动，聚焦于高效的 LLM 微调，本指南是一份简短的操作手册，解释如何参与这项竞赛。本文涵盖了你需要了解的所有内容，从设置编码环境到首次提交。

### 1 - 什么是 NeurIPS 效率挑战赛？[](#1---what-is-the-neurips-efficiency-challenge)

[NeurIPS 2023 效率挑战赛](https://llm-efficiency-challenge.github.io/)是一项专注于**在 1 块 GPU 上于 24 小时内训练 1 个 LLM** 的竞赛——表现最佳的 LLM 团队将在 NeurIPS 2023 上展示其成果。

像 GPT-4 这样的大语言模型具有令人印象深刻的能力。然而，它们的开发和运行成本高昂，同时对于定制化大语言模型也有大量需求，例如：

-   用于撰写草稿的个人助手（许多研究人员和公司无法将敏感材料上传到 ChatGPT）；
-   针对法律、医疗或金融数据和文档的问答系统；
-   具备特定领域知识或针对公司产品知识的客户聊天机器人。

抛开应用不谈，对于像我这样的研究人员来说，这项挑战是一个绝佳的机会，可以开发和尝试更高效训练 LLM 的新方法。

但在进入实践部分之前，让我们先回顾一些关键点和限制条件，以便快速了解概况。不过，参与者应查看[官方指南](https://llm-efficiency-challenge.github.io/rules)以获取所有最新细节。

![横幅](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/banner.webp)

*官方挑战网站托管在 [https://llm-efficiency-challenge.github.io](https://llm-efficiency-challenge.github.io/)*

### 2 - 竞赛概述[](#2---competition-overview)

本节简要介绍 *NeurIPS 2023 效率挑战赛*。（我强烈建议同时查看[官方指南](https://llm-efficiency-challenge.github.io/rules)以获取所有最新细节。）

**GPU**

由于只允许使用 1 块 GPU，这项挑战是实验高效微调技术的理想测试平台，无需过多担心基础设施问题。仅允许使用以下两种 Nvidia GPU：

-   A100（40 GB 内存）；
-   以及 RTX 4090（24 GB 内存）。

（由于这些 GPU 不能直接比较，因此设有两个不同的赛道和排行榜。）

**模型**

所有三种 Transformer LLM 架构类型都允许使用：编码器、编码器-解码器和解码器。（编码器和解码器有什么区别？我在[这里](https://magazine.sebastianraschka.com/p/understanding-encoder-and-decoder)讨论过。）

然而，我推测仅解码器架构可能是最有前景的方向：

> “我们在 Wang 等人（2022a）的研究中探讨了这个问题，评估了编码器-解码器和仅解码器架构，以及它们与因果、前缀和掩码语言建模[预训练](https://sebastianraschka.com/glossary/#pretraining "Pretraining")目标的交互作用。我们的结果表明，在预训练后立即评估时，因果仅解码器模型表现最佳——验证了最先进 LLM 的选择。”——引用自 [BLOOM: A 176B-Parameter Open-Access Multilingual Language Model](https://arxiv.org/abs/2211.05100)

批准的 LLM 列表总结在下图中。请注意，竞赛侧重于基础（基座）LLM，这些模型尚未经过微调，因为微调是本次竞赛的重点。

![允许的 LLM](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/allowed-llms.webp)

*竞赛中允许使用的模型（截至撰写本文时）*

**数据和任务**

在选择数据集时，请注意模型预计无法处理超过2048个token的上下文。评估将使用斯坦福大学[HELM](https://crfm.stanford.edu/helm/latest/)基准测试套件的一个子集，针对英文文本进行。（我们将在本文末尾运行HELM基准测试。）

参与者需提交训练和评估代码，这些代码应包含在“开源”数据集上训练[基础模型](https://sebastianraschka.com/glossary/#base-model "Base Model")所需的所有步骤，训练时间不超过24小时，使用A100或RTX 4090显卡。截至本文撰写时，允许使用的数据集包括：

-   [Databricks-Dolly-15](https://huggingface.co/datasets/databricks/databricks-dolly-15k)（15k条指令-响应对）
-   [OpenAssistant对话数据集（oasst1）](https://huggingface.co/datasets/OpenAssistant/oasst1)
-   [Alpaca Libre](https://github.com/mobarski/alpaca-libre)

![Neurips2023入门指南数据集](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/dataset.webp)

*来自[Alpaca-Libre](https://github.com/mobarski/alpaca-libre)数据集的两个示例。*

**更新：组织者刚刚禁止在比赛中使用Alpaca-Libre，因为这违反了比赛政策，该政策规定比赛中不得使用任何由大语言模型生成的数据。**

**由于这是一个提交教程，我将重点介绍从零到提交的主要流程。但未来我可能会在独立文章中更详细地重新讨论某些主题，比如数据集。**

### 3 - 官方入门工具包[](#3---the-official-starter-kit)

NeurIPS效率挑战赛的组织者选择了[Lit-GPT](https://github.com/Lightning-AI/lit-gpt)仓库作为官方入门工具包，这是一个开源的GitHub仓库，实现了加载流行大语言模型的方法和工具（见下表）。这很方便，因为我过去对这个仓库有一些贡献经验，包括实现LLaMA-Adapter v2、全量微调、[低秩适配](https://sebastianraschka.com/glossary/#lora "LoRA（低秩适配）")（LoRA）的移植、合作实现QLoRA等。

另外值得一提的是，Lit-GPT实现了本次比赛目前最相关的大语言模型，如下表所示：

| Lit-GPT中的模型 | 参考文献 |
| --- | --- |
| Meta AI Llama 2 | [Touvron等人，2023](https://arxiv.org/abs/2307.09288) |
| Stability AI FreeWilly2 | [Stability AI，2023](https://stability.ai/blog/stable-beluga-large-instruction-fine-tuned-models) |
| TII UAE Falcon | [TII，2023](https://falconllm.tii.ae/) |
| OpenLM Research OpenLLaMA | [Geng & Liu，2023](https://github.com/openlm-research/open_llama) |
| LMSYS Vicuna | [Li等人，2023](https://lmsys.org/blog/2023-06-29-longchat) |
| Together RedPajama-INCITE | [Together，2023](https://together.ai/blog/redpajama-models-v1) |
| EleutherAI Pythia | [Biderman等人，2023](https://arxiv.org/abs/2304.01373) |
| StabilityAI StableLM | [Stability AI，2023](https://github.com/Stability-AI/StableLM) |

截至本文撰写时，我建议重点关注Llama 2，或许还有Falcon，因为根据公开排行榜，这两个模型系列目前最有前景。（为了让本指南专注于提交流程，我将把更详细的模型讨论留到未来的文章中。）

**在接下来的部分中，我将带你逐步设置计算环境和Lit-GPT仓库，以便进行实验和提交！**

*请注意，并不强制要求使用组织者建议的Lit-GPT入门工具包。另外，组织者与该仓库或其开发者没有关联，而是独立选择了它，这很可能是因为它相对可定制且“易于修改”，这在尝试新的研究思路时会很有用。*

### 4 - 设置项目环境[](#4---setting-up-a-project-environment)

就我个人而言，我倾向于为每个研究项目创建专用的虚拟环境，这有助于我管理特定的版本号等。为此，我（仍然）偏好使用 [conda 包管理器](https://docs.conda.io/en/latest/)。在本节中，我将带你了解我喜欢的设置流程。（如果你已经熟悉使用 `conda`、`venv` 或任何其他虚拟环境设置，可以跳过本节。）

在你计划运行实验的机器上，下载 [miniconda](https://docs.conda.io/en/latest/miniconda.html) 或 [miniforge](https://github.com/conda-forge/miniforge)。如果你使用的是 Linux 电脑，那很可能是下面截图中的第一行，即最上面那一行。

![Neurips2023 入门指南 miniforge](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/miniforge.webp)

*Miniforge 安装选项*

然后，你可以通过执行相应的 shell 脚本并按照说明来安装 conda 包管理器：

```
sh Miniforge3-Linux-x86_64.sh
```

接下来，创建一个新的 conda 环境：

```
conda create -n neurips2023-1 python=3.10 --yes
```

安装完成后，激活该环境：

```
conda activate neurips2023-1
```

![Neurips2023 入门指南 conda 激活](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/conda-activate.webp)

当我在远程机器上工作时，我也喜欢使用 [tmux](https://github.com/tmux/tmux/wiki)，以便在重新连接时能够重启终端会话：

```
tmux new -s neurips-1
cd ~/Developer/neurips23
conda activate neurips2023-1
```

然后，每次断开连接后，我可以重新登录机器并通过以下命令恢复会话：

### 5 - 安装依赖项[](#5---installing-the-requirements)

为 NeurIPS 竞赛设置好虚拟环境后，我们现在可以克隆 Lit-GPT 仓库并安装相应的依赖项。首先，让我们克隆 [Lit-GPT](https://github.com/Lightning-AI/lit-gpt) GitHub 仓库：

```
git clone https://github.com/Lightning-AI/lit-gpt.git
```

该仓库包含一个 [requirements.txt](https://github.com/Lightning-AI/lit-gpt/blob/main/requirements.txt) 文件，其中列出了来自 [PyPI](https://pypi.org/) 的相应 Python 包，这些包是使用该仓库代码所必需的。但请注意，Lit-GPT 利用了最新的 PyTorch 特性，因此我们必须安装 PyTorch 的 nightly 版本（遗憾的是，这些无法通过 requirements.txt 文件安装）。

我们可以通过从 [pytorch.org 安装程序菜单](https://pytorch.org/) 中选择并运行相应命令来安装最新的 PyTorch 版本，如下面截图所示。

![PyTorch 安装菜单](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/pytorch-nightly.webp)

*PyTorch 安装菜单*

接下来，我们可以使用 `pip` 通过以下命令安装剩余的依赖项：

```
cd lit-gpt
pip install -r requirements.txt
```

### 6 - 下载模型检查点[](#6---downloading-model-checkpoints)

截至撰写本文时，我建议使用 Meta 新发布的 [Llama 2](https://arxiv.org/abs/2307.09288) 作为最有前景的基础模型。为简单起见，专注于 70 亿参数版本可能比较合理，当使用参数高效微调技术时，该版本应能适配 24 GB 的 RTX 4090 或 40 GB 的 A100 GPU。（如果你想下载其他模型，请参阅 [Lit-GPT 教程](https://github.com/Lightning-AI/lit-gpt/tree/main/tutorials)。）

我们可以使用 Lit-GPT 仓库中提供的 scripts/download.py 脚本来下载 7B Llama 2 基础模型。下载的文件大约需要 13 GB 的磁盘空间。

不过，首先你需要完成以下步骤：

1.  在 [https://huggingface.co/meta-llama/Llama-2-7b](https://huggingface.co/meta-llama/Llama-2-7b) 创建一个 Hugging Face (HF) 账户。
2.  在 [https://huggingface.co/meta-llama/Llama-2-7b](https://huggingface.co/meta-llama/Llama-2-7b) 申请 Llama-2 的访问权限。
3.  [获取你的 HF 令牌](https://huggingface.co/settings/tokens)，你可以在 [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) 下生成。

![Neurips2023 入门指南 hf](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/hf.webp)

接下来，要下载 Llama 7B 模型，我们需要通过 `--token` 参数提供 HF 令牌，如下所示：

```
cd ~/Developer/neurips23/lit-gpt
pip install huggingface_hub
python scripts/download.py --repo_id meta-llama/Llama-2-7b-hf --token your_hf_token
```

（这里，`your_hf_token` 是你从 HF 网站上的用户账户中复制的令牌。）

如果你看到以下消息：

> 您访问模型 meta-llama/Llama-2-7b-hf 的请求正在等待仓库作者的审核。

你可能需要等待（目前是 1-2 天）以获得批准。

好消息是，在此期间我们可以使用 7B OpenLLaMA 模型，它不需要身份验证：

```
python scripts/download.py --repo_id openlm-research/open_llama_7b
```

![Neurips2023 入门指南 openllama](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/openllama.webp)

（你也可以通过 `--repo_id openlm-research/open_llama_3b` 使用更小的 30 亿参数版本进行实验。）

默认情况下，检查点文件将保存在 Lit-GPT 仓库内的本地目录 `checkpoints/` 中。

接下来，我们将下载的文件转换为 Lit-GPT 中所有模型使用的通用权重格式：

```
python scripts/convert_hf_checkpoint.py --checkpoint_dir checkpoints/openlm-research/open_llama_7b
```

在准备数据集和微调模型之前，让我们通过使用相应的 `generate` 脚本来确保它正常工作：

```
python generate/base.py --checkpoint_dir checkpoints/openlm-research/open_llama_7b --prompt "告诉我一个有趣的事实："
```

请注意，基础模型是作为文本补全模型训练的，与可用于聊天的指令微调模型不同。我们在这里使用基础模型，因为微调是比赛的一部分。然而，我们可以看到，即使模型只被训练来预测下一个词，它也能给出一个有趣的回答：

![提示：使用符号链接](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/prompt-response.webp)

**提示：使用符号链接**

你可能希望在某个时候创建多个项目文件夹。我建议使用[符号链接](https://en.wikipedia.org/wiki/Symbolic_link)来避免重新下载或复制原始模型检查点或数据集。例如，如果模型检查点位于共享目录 `/shared/data/checkpoints` 中，你可以按如下方式在 `lit-gpt` 仓库内创建一个符号链接：

```
cd ~/Developer/neurips23/experiment1/lit-gpt
ln -s /shared/data/checkpoints checkpoints
```

（你可以使用相同的 `ln -s` 命令为你的数据集创建符号链接。）

### 7 - 下载和准备数据集[](#7---downloading-and-preparing-datasets)

我强烈建议查看[官方规则](https://llm-efficiency-challenge.github.io/challenge)以获取关于允许的模型和数据集的最新信息。截至撰写本文时，以下数据集是允许的，如前所述：

-   [Databricks-Dolly-15](https://huggingface.co/datasets/databricks/databricks-dolly-15k)
-   [OpenAssistant 对话数据集 (oasst1)](https://huggingface.co/datasets/OpenAssistant/oasst1)
-   [Alpaca Libre](https://github.com/mobarski/alpaca-libre)

**更新：组织者刚刚禁止在比赛中使用 Alpaca-Libre，因为这违反了政策，规定本次比赛中不能使用任何 LLM 生成的数据。**

为了简单起见，我们将在本次比赛中使用 Alpaca Libre，我们在本文开头的*数据集和任务部分*简要介绍过。你可以按如下方式下载它，这会将原始的 .json 文件转换为 PyTorch 张量格式，以加速后续的数据加载：

```
python scripts/prepare_alpaca_libre.py --checkpoint_dir checkpoints/openlm-research/open_llama_7b/
```

（这个过程应该很快；处理后的 Alpaca-Libre 数据集保存在 `./data/alpaca_libre/` 下，大约占用 120 MB。）

**注意：** 如果你的仓库中还没有这个 prepare\_alpaca\_libre.py 文件，那很可能是因为我最近才将它提交到 Lit-GPT，尚未合并。这种情况下，你可以从[这个 PR](https://github.com/Lightning-AI/lit-gpt/pull/358) 下载它，或者改用 scripts/prepare\_alpaca.py 来处理常规的 Alpaca 数据集。

**提醒：** 如果你以后考虑使用不同的模型，则需要用不同的 –checkpoint\_dir 参数重新准备数据集，因为不同模型可能使用不同的分词器。

### 8 - 建立微调基线[](#8---establishing-a-finetuning-baseline)

完成上一节中概述的数据集准备步骤后，我们现在可以进入更有趣的部分——微调模型。这是我们可以发挥创造力、组合或构思新的研究思路来提升基础模型建模性能的地方。

我计划在后续文章中介绍一些值得尝试的有趣研究方向。为了让本指南聚焦于主要步骤，我们在此先专注于建立一个性能基线。为此，我们将采用 OpenLLaMA 7B 模型，并使用低秩适配（LoRA）在 Alpaca-Libre 数据集上进行微调：

```
python finetune/lora.py \
--data_dir data/alpaca_libre/ \
--checkpoint_dir checkpoints/openlm-research/open_llama_7b/ \
--precision bf16-true
```

（你可以通过 `python finetune/lora.py --help` 查看其他选项。）

使用默认设置，即微批次大小为 4、[上下文长度](https://sebastianraschka.com/glossary/#context-length "Context Length")为 2048、以及如上所示的 bf16-true 精度（本文后续会解释），在 A100 上大约耗时 7 小时 28 分钟：

```
{'eval_interval': 100, 'save_interval': 100, 'eval_iters': 100, 'log_interval': 1, 'devices': 1, 'learning_rate': 0.0003, 'batch_size': 128, 'micro_batch_size': 4, ...}
Global seed set to 1337

Loading model 'checkpoints/openlm-research/open_llama_7b/lit_model.pth' with {'org': 'openlm-research', 'name': 'open_llama_7b', 'block_size': 2048, 'vocab_size': 32000, ...}

Number of trainable parameters: 4,194,304
Number of non trainable parameters: 6,738,415,616

Validating ...

...

Estimated TFLOPs: 357.80
Measured TFLOPs: 324.99
...
iter 30 step 0: loss 1.9667, iter time: 92.21ms
iter 31 step 1: loss 1.9221, iter time: 196.06ms (optimizer.step)
iter 32 step 1: loss 1.0282, iter time: 199.56ms
iter 33 step 1: loss 1.3246, iter time: 136.38ms
iter 34 step 1: loss 2.0406, iter time: 94.96ms
iter 35 step 1: loss 2.2522, iter time: 84.61ms
iter 36 step 1: loss 1.4814, iter time: 113.93ms
iter 37 step 1: loss 1.7872, iter time: 92.81ms
...

...
iter 49990 step 1562: loss 0.5110, iter time: 84.79ms
iter 49991 step 1562: loss 0.5513, iter time: 147.55ms
iter 49992 step 1562: loss 0.4352, iter time: 134.89ms
iter 49993 step 1562: loss 0.3533, iter time: 101.12ms
iter 49994 step 1562: loss 0.4636, iter time: 166.13ms
iter 49995 step 1562: loss 0.5932, iter time: 96.34ms
iter 49996 step 1562: loss 0.4907, iter time: 131.20ms
iter 49997 step 1562: loss 0.4948, iter time: 135.04ms
iter 49998 step 1562: loss 0.5330, iter time: 84.70ms
iter 49999 step 1562: loss 0.4570, iter time: 100.29ms
Training time: 26239.77s
Saving LoRA weights to 'out/lora/alpaca/lit_model_lora_finetuned.pth'
```

我个人也喜欢在脚本中添加下面这行代码，这样就能在训练完成后看到最大内存消耗：

```
print(f"Memory used: {torch.cuda.max_memory_allocated() / 1e9:.02f} GB", file=sys.stderr)
```

![Neurips2023 入门指南内存分配](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/memory-alloc.webp)

对于上面的模型，它会输出以下内容：

考虑到比赛允许使用 40 GB 内存的 A100 GPU，这说明我们可以增加可训练参数数量、微批次大小或其他设置，将内存使用量提高约 11 GB，从而充分利用这块 GPU。

顺便提一下，通过[这个 Pull Request](https://github.com/Lightning-AI/lit-gpt/pull/275) 中的 `--quantize "bnb.nf4"` 参数，也应该支持类似 QLoRA 的微调。这会将内存消耗降低到 17.04 GB，这样你就可以在 RTX 4090 上运行了。如果你使用的是 RTX 4090，后续章节还会有更多关于降低内存需求的技巧。

### 9 - 使用模型[](#9---使用模型)

要快速用提示词测试模型，我们可以按如下方式使用 `generate/lora.py` 脚本：

```
python generate/lora.py --prompt "how do you make pizza?" \
--checkpoint_dir '/home/sebastian/Developer/neurips23/lit-gpt/checkpoints/openlm-research/open_llama_7b'
```

![Neurips2023 入门指南披萨](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/pizza.webp)

这里，我们主要想看看模型能否生成连贯的文本输出。看起来效果不错。我们将在本文后面重新讨论模型评估的问题。

### 10 - 更改微调设置[](#10---更改微调设置)

在前面的章节中，我们使用默认设置微调并使用了基础模型。当然，如果我们真的想在比赛中*竞争*，就需要做出一些调整。我计划在未来的文章中介绍研究方向，但现在，我想先简要介绍几个设置，以便充分利用所提供的代码。

之前，在*建立微调基线*部分，我们提到了默认设置，比如微批次大小为 4、上下文长度为 2048 等。这些可以直接在脚本顶部进行更改：

![默认脚本](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/default-script.webp)

我们来讨论一下其中一些设置的含义。

**`*_interval` 设置**

`*_interval` 设置用于指定模型评估和保存的频率。这在开发模型时很有用。不过，在提交之前，最好增加这个数值，以节省几秒或几分钟的时间。

**`devices`**

`devices` 指定使用的设备数量。如果这个数字大于 2，则会使用全分片数据并行，这意味着它 a) 运行数据并行，并且 b) 将大层划分到多个 GPU 上。如果你感兴趣，我在[我的深度学习课程的第 9.2 和 9.3 单元](https://lightning.ai/courses/deep-learning-fundamentals/9.0-overview-techniques-for-speeding-up-model-training/unit-9.2-multi-gpu-training-strategies/)中提供了更多关于多 GPU 训练的说明。

![Neurips2023 入门指南张量并行](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/tensor-parallelism.webp)

不过，由于比赛限制使用 1 个 GPU，我们在这里不必担心这个设置，将其保留为 `devices=1` 即可。

**`override_max_seq_length`**

设置`override_max_seq_length=None`意味着使用模型的默认上下文长度。对于OpenLLaMA，默认长度为`2048`，巧合的是这也是比赛允许的最大长度。因此，如果你计划尝试不同模型（为了提交有竞争力的结果，这可能是必要的），建议将其设置为`override_max_seq_length=2048`。

**`learning_rate`**

`learning_rate`是一个需要调整的超参数。通常，我们通过监控损失并在验证集上评估模型来确定它。关于学习率调整的详细讨论超出了本文的范围，但你可以参考我的深度学习课程中的[第6.2单元——学习率与学习率调度器](https://lightning.ai/courses/deep-learning-fundamentals/unit-6-overview-essential-deep-learning-tips-tricks/unit-6.2-learning-rates-and-learning-rate-schedulers/)。

**`batch_size`和`micro_batch_size`**

由于模型使用梯度累积，因此有两个批次大小设置：`batch_size`和`micro_batch_size`。`micro_batch_size`是模型每次前向传播接收的批次大小。`batch_size`决定了模型在反向传播中实际更新的批次大小。

换句话说，如果`batch_size`设置为128，`micro_batch_size`设置为4，模型将执行32次前向传播（128 / 4 = 32）来累积每次反向传播的损失。不过，模型性能和梯度更新与常规训练完全相同。我们可以将梯度累积视为一种节省内存的技巧。如果你想了解更多关于梯度累积的内容，请查看我的博客文章[《使用梯度累积在单GPU上微调LLM》](https://sebastianraschka.com/blog/2023/llm-grad-accumulation.html)。

![梯度累积](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/gradient-accum.webp)

*来自[《使用梯度累积在单GPU上微调LLM》](https://sebastianraschka.com/blog/2023/llm-grad-accumulation.html)的梯度累积解释*

如果将`micro_batch_size`从4改为2，可以在不牺牲模型性能的情况下显著节省计算内存。然而，这也会增加运行时间。在参与比赛时，我们需要权衡这一点。

**`lora_*`参数**

`lora_*`设置LoRA的可训练参数。例如，将`lora_key`从`False`改为`True`，将为LLM的*键*权重（除了值和查询权重）启用LoRA。在实践中，这可以使性能更接近全参数微调。

以下是我根据上述讨论选择的一些设置，总内存消耗为23.66 GB，使得代码可以在RTX4090和A100上运行：

![Neurips2023入门指南LoRA更改](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/lora-changes.webp)

在上面的截图中，`max_iter`设置为100以便快速实验，这意味着脚本大约在2分钟内完成。然而，对于“真正”的训练，你需要将迭代次数至少设置为数据集中的记录数（对于Alpaca或Alpaca-Libre，为50k）。

**关于全参数微调的说明**

7B OpenLLaMA模型有6,738,415,616个参数。然而，在LoRA脚本中，只有一小部分参数是可训练的（默认情况下为4,194,304），这实现了参数高效的微调。为什么不微调整个模型？因为这会消耗大量内存。我无法在单个A100上完成全参数微调。

实际上，我需要6块GPU和张量分片才能实现。以下是我在[《使用LoRA和适配器更高效地微调Falcon LLM》](https://sebastianraschka.com/blog/2023/falcon-finetuning.html)文章中的基准测试结果：

![Neurips2023入门指南 falcon](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/falcon.webp)

### 11 - 防止内存溢出错误[](#11---preventing-out-of-memory-errors)

如前所述，本次比赛的主要挑战之一是如何避免内存溢出错误，因为我们的GPU内存有限。上文简要讨论了梯度累积、量化、选择更小的基础模型和LoRA等技巧。

我们还可以添加许多其他技巧，包括自动混合精度训练、低精度浮点数、高效模型初始化、选择更精简的优化器以及参数卸载。详细讨论所有这些技术超出了本文的范围，但第一个好消息是，其中大部分技术已在Lit-GPT代码中实现。

第二个好消息是，我有一篇独立文章更详细地讨论了所有这些方法：[《优化PyTorch中训练LLM和视觉Transformer的内存使用》](https://sebastianraschka.com/blog/2023/pytorch-memory-optimization.html)。

![来自《优化PyTorch中训练LLM和视觉Transformer的内存使用》的内存技巧](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/memory-tricks.webp)

*来自[《优化PyTorch中训练LLM和视觉Transformer的内存使用》](https://sebastianraschka.com/blog/2023/pytorch-memory-optimization.html)的内存技巧*

[《优化PyTorch中训练LLM和视觉Transformer的内存使用》](https://sebastianraschka.com/blog/2023/pytorch-memory-optimization.html)文章还介绍了Lightning的[Fabric](https://lightning.ai/docs/fabric/stable/)，这是一个开源库，可方便地加速PyTorch模型训练，并在Lit-GPT内部用于减少样板代码。

### 12 - 研究方向[](#12---research-directions)

最初，我计划写一个详尽的章节，介绍本次比赛中值得探索的研究思路和方向。但由于本文篇幅已经（几乎）过长，我将把这些内容推迟到未来的文章中。不过在此期间，您或许可以从我的研究亮点系列中找到一些灵感：[2023年6-7月](https://magazine.sebastianraschka.com/p/ai-research-highlights-in-3-sentences-738)、[2023年5-6月](https://magazine.sebastianraschka.com/p/ai-research-highlights-in-3-sentences-2a1)和[2023年4-5月](https://magazine.sebastianraschka.com/p/ai-research-highlights-in-3-sentences)。

### 13 - 本地评估模型[](#13---evaluating-the-model-locally)

大多数读者可能已经读完了这篇长篇入门指南，迫不及待想要开始实践。不过，还有一件事值得讨论：评估模型性能！但我保证会简短说明（并计划未来撰写更详细的评估文章）。

比赛提交的作品将在[斯坦福HELM基准测试](https://crfm.stanford.edu/helm/latest/)的子集上进行评估，该基准测试包含42个场景和59个指标。

其中包括[HellaSwag](https://crfm.stanford.edu/helm/latest/?group=hellaswag)和[TruthfulQA](https://crfm.stanford.edu/helm/latest/?group=truthful_qa)等场景，这些场景也涵盖在其他基准测试中，例如EleutherAI的[语言模型评估工具](https://github.com/EleutherAI/lm-evaluation-harness)。

为了防止过拟合，或许最好先在评估工具中的几个任务上开发模型（将其视为验证集），然后再应用于HELM基准测试。由于比赛评估将基于HELM的子集，我们可以将HELM视为测试集。

语言模型评估工具目前已在Lit-GPT中直接支持（[HELM支持正在开发中](https://github.com/Lightning-AI/lit-gpt/pull/370)）。让我们简要看看如何在Lit-GPT中使用评估工具。

首先，我们需要克隆并安装官方的评估工具仓库：

```
git clone https://github.com/EleutherAI/lm-evaluation-harness
cd lm-evaluation-harness
pip install -e .
cd ..
```

（注意：`pip install -e .` 会本地安装并运行 `python setup.py develop`，这样对 `lm-evaluation-harness` 包的修改无需重新安装。）

然后，要评估 OpenLLaMA 模型，我们可以从 `lit-gpt` 仓库中对检查点文件运行评估框架，操作如下：

```
python eval/lm_eval_harness.py \
  --checkpoint_dir "checkpoints/openlm-research/open_llama_7b/" \
  --precision "bf16-true" \
  --eval_tasks "[truthfulqa_mc]" \
  --batch_size 4 \
  --save_filepath "results-openllama-7b.json"
```

这应该只需要 5 分钟即可运行完成。

（对于 LoRA 微调模型，Lit-GPT 仓库中有一个等效的 `lm_eval_harness_lora.py` 脚本。）

如果你想包含多个任务，例如 HellaSwag 和 TruthfulQA，可以将 `[truthfulqa_mc]` 替换为 `[truthfulqa_mc,hellaswag]`。**你可以在[此处任务表](https://github.com/EleutherAI/lm-evaluation-harness/blob/master/docs/task_table.md)中找到完整的任务列表。**

![评估框架支持的任务小片段](https://sebastianraschka.com/images/blog/2023/neurips2023-starter-guide/tasks.webp)

*评估框架支持的任务小片段*

这将生成以下 JSON 输出：

```
{"results":
    {"truthfulqa_mc":
        {"mc1": 0.23133414932680538,
         "mc1_stderr": 0.014761945174862673,
         "mc2": 0.352784342017196,
         "mc2_stderr": 0.01356224149206526}},
         "versions": {"truthfulqa_mc": 1},
         "config": {"model": "open_llama_7b", "num_fewshot": 0,
        					   "batch_size": 4, "device": "cuda:0",
        					   "no_cache": true, "limit": null,
        					   "bootstrap_iters": 2, "description_dict": null
}}
```

得到的分数 `mc1` 和 `mc2` 衡量了模型生成真实陈述的比例（范围从 0 到 1）。mc1 和 mc2 分数之间的差异在 [TruthfulQA](https://github.com/sylinrl/TruthfulQA) 仓库中有解释：

-   “**MC1（单一真实）**：给定一个问题及 4-5 个答案选项，选择唯一正确的答案。模型的选择是它在问题之后分配最高完成对数概率的答案选项，与其他答案选项无关。该分数是所有问题的简单准确率。”
-   “**MC2（多重真实）**：给定一个问题及多个真/假参考答案，分数是分配给真实答案集合的归一化总概率。”

TruthfulnessQA 会用于最终模型评估吗？很可能不会。我在这里只是将其作为一个简单的参考。请注意，Llama 2 Chat 模型（由于已经微调，因此不允许在此竞赛中使用）可能是良好分数的参考。

为了进行比较，我们可以对 Llama 2 7b [聊天模型](https://sebastianraschka.com/glossary/#instruct-model "Instruct Model")运行相同的评估代码，操作如下：

```
python eval/lm_eval_harness.py \
   --checkpoint_dir "checkpoints/meta-llama/Llama-2-7b-chat-hf/" \
   --precision "bf16-true" \
   --eval_tasks "[truthfulqa_mc]" \
   --batch_size 4 \
   --save_filepath "results-llama2-7b.json"
```

这将得到 mc1 和 mc2 分数分别为 `0.306` 和 `0.454`。这听起来并不理想：0.3 意味着 30% 的答案是真实的。然而，作为对比，大 25 倍的 175B GPT-3 模型根据 [TruthfulQA](https://github.com/sylinrl/TruthfulQA) 仓库也只达到了 21%。

### 14 - 提交作品[](#14---making-submissions)

该竞赛目前只允许提交 3 次。因此，我强烈建议在首次提交之前先在本地开发模型（竞赛截止日期目前列为 2023 年 10 月 15 日）。

如前所述，你可以使用评估框架进行模型评估。此外，HELM 评估将很快添加到 Lit-GPT 中，这对于在提交前评估最终候选模型非常有用。

对于提交本身，您需要提交一个 Docker 镜像。幸运的是，主办方在 GitHub 上提供了一个包含具体步骤的仓库（[点击此处](https://github.com/llm-efficiency-challenge/neurips_llm_efficiency_challenge)），同时还提供了一份玩具提交设置指南，帮助您在正式提交前在本地测试模型。（在粘贴未来可能过时的代码示例之前，我建议您查阅[官方竞赛仓库](https://github.com/llm-efficiency-challenge/neurips_llm_efficiency_challenge)。）

请注意，主办方还维护了一个 [Discord 频道](https://discord.gg/XJwQ5ddMK7)，用于解答关于竞赛的其他问题。

### 结论[](#conclusion)

我非常期待研究社区能够开发出（更）高效的大语言模型微调方法。希望您能像我一样觉得这场竞赛既实用又令人兴奋。请帮忙宣传这场竞赛——参与的人越多，我们就越能推动高效大语言模型研究领域的发展。

如果您有任何疑问，以下是一些最佳的联系方式：

-   如果您在使用 Lit-GPT 时遇到任何问题，并且认为这可能是 bug，请[考虑在 GitHub 上提交 Issue](https://github.com/Lightning-AI/lit-gpt/issues)。
-   如果您发现本文中的代码有任何问题，您也可以提交 Issue 并标记我的 [GitHub 用户账号 @rasbt](https://github.com/rasbt)，或[通过社交媒体联系我](https://x.com/rasbt)——我非常乐意修复这些问题！
-   关于与竞赛相关的 Lit-GPT 问题，我在 Lightning AI 的同事们也维护了一个 Discord 频道，[点击此处](https://discord.com/channels/1077906959069626439/1134560480795570186)即可加入。
-   此外，非常欢迎您提交 [Lit-GPT 的 Pull Request](https://github.com/Lightning-AI/lit-gpt/pulls)，以改进或实现新技术！

祝您编码和实验愉快！
