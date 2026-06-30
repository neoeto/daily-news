---
title: Featuring Every Eval Ever Results on Hugging Face Model Pages
url: 'https://huggingface.co/blog/eee-community-evals'
url_hash: 3f0a56fa70110027403b008388e78ef3cb8a446e
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-30T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

每个评估（EEE）与Hugging Face社区评估现已实现互通。我们支持评估结果的跨平台发布与解读，同时关联开放模型、排行榜及统一标准化元数据存储。

EEE于2026年2月作为[EvalEval联盟](https://evalevalai.com/)的项目[启动](https://evalevalai.com/infrastructure/2026/02/17/everyevalever-launch/)，这是首个跨机构合作项目，旨在改善第一方和第三方评估者报告AI评估结果的方式。Hugging Face于2026年2月推出[社区评估](https://huggingface.co/blog/community-evals)，旨在将基准分数的报告方式去中心化至Hub平台。两者结合，弥补了用户、研究人员和政策制定者在信任、理解及选择评估与模型方面的缺口。

评估结果是我们衡量模型能力、对比模型差异、推理安全与治理的依据，然而它们却分散且难以比较。这些结果散见于论文、排行榜、博客文章和测试日志中，且格式各异。同一模型在相同基准测试中，常因执行者和执行方式不同而得出不同分数；例如LLaMA 65B在[MMLU](https://huggingface.co/blog/open-llm-leaderboard-mmlu)上的报告分数就分别为63.7和48.8。这些差异可能源于[我们发现的常见未报告评估设置](https://huggingface.co/papers/2606.14516)。

EEE是我们针对报告环节的解决方案。它采用统一的JSON模式记录评估结果，包含：

-   执行者
-   所用模型
-   访问方式
-   生成设置
-   指标的实际含义
-   [推荐] 每个样本输出的配套JSONL文件

该模式基于研究人员和政策研究者的反馈构建，可接收任何来源的结果，使测试日志、排行榜抓取数据和论文数据最终呈现统一格式。[GitHub仓库](https://github.com/evaleval/every_eval_ever)提供了转换器、示例和贡献指南。自发布以来，Hugging Face上的[数据存储库](https://huggingface.co/datasets/evaleval/EEE_datastore)已收录约22.9万条评估结果，涵盖超过2.2万个模型和2200个基准测试，数据来自31种不同的报告格式。仅从头复现这些运行的成本就高达数十万美元，这充分说明不应让已付费生成的数据分散流失。

了解更多关于该模式及贡献方式的信息，请点击[此处](https://evalevalai.com/infrastructure/2026/02/17/everyevalever-launch/)。

现在，它实现了更好的集成与归属。贡献者可将EEE结果直接发送至Hugging Face社区评估。我们构建了一个转换器，可将您的EEE记录转换为Hugging Face所需的YAML小文件，从而无需手动维护两种格式的相同结果。

[![评估卡上的已验证评估者](https://cdn-uploads.huggingface.co/production/uploads/6413251362e6057cbb6259bd/czIJDDShvtMBs2M2T7B45.gif)](https://cdn-uploads.huggingface.co/production/uploads/6413251362e6057cbb6259bd/czIJDDShvtMBs2M2T7B45.gif)

这是面向所有报告或阅读评测结果的人员的新功能，不仅限于现有的EEE贡献者。无论是报告自家模型的第一方评测者，还是报告他人模型的第三方评测者，都可以向社区评测（Community Evals）和EEE提交结果。任何浏览Hub的用户都能看到可追溯至完整记录的结果。当你通过所在组织的官方Hugging Face账户提交数据时，你的结果会在EvalEval上显示一个[已验证](https://evalcards.evalevalai.com/help/get-verified)的勾选标记，向读者表明这些数据直接来自源头。本文的其余部分将介绍什么是社区评测以及转换器的作用。

## [](#hugging-face-社区评测如何与-evaleval-协同工作)Hugging Face 社区评测如何与 EvalEval 协同工作

Hugging Face 社区评测包含两个方面。

基准测试存在于一个数据集仓库中，该仓库通过添加 `eval.yaml` 文件进行注册。注册后，该数据集页面会收集并显示一个排行榜，列出整个Hub中针对该基准测试报告的所有分数。[官方基准测试列表](https://huggingface.co/datasets?benchmark=benchmark:official&sort=trending)会随时间增长。

模型的分数存放在模型仓库内的 `.eval_results/*.yaml` 文件中。它们会显示在模型卡片上，并反馈到相应的基准测试排行榜中。模型作者自己的结果以及其他人通过拉取请求提交的结果都会被汇总，每个分数都会带有一个徽章，标明它是作者提交的、社区提交的还是独立验证的。任何人都可以通过提交包含正确YAML文件的PR来为任何模型添加分数，模型作者可以关闭PR或在自己的仓库中隐藏结果。

以下是其中一个排行榜的样子：

*Hub 上 [人类最后的考试](https://huggingface.co/datasets/cais/hle) 的社区评测排行榜*

这就是EEE和社区评测的结合点。当你将结果同时发送给两者时，会发生两件事：首先，你的分数会出现在Hugging Face模型页面上，并被拉取到基准测试的排行榜中。其次，它会带有一个源徽章，直接链接回完整的EEE记录，其中包含生成配置、测试框架版本、可重复性说明以及任何实例级数据。

[![SmolLM2模型页面上的EvalEval源](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/eee_commevals/smollm2.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/eee_commevals/smollm2.png)

*来自EEE数据存储的评测结果（MMLU-Pro）（a）在文件级别与Hugging Face模型卡片（b）交叉链接。源EvalEval徽章链接到完整的JSON记录。*

**这两个目标服务于同一个目标的不同方面。Hugging Face 将你的结果放在人们查看模型的地方，并附上指向源的链接。EEE 则保存完整的结构化记录，使结果可解释，并在此基础上驱动 [Eval Cards](https://evalevalai.com/projects/eval-cards/)。** 将你的数据同时发送给两者，同一个评测结果就能同时变得可见且可理解，这正是进行任何报告的意义所在。

你可以在下面看到这种交叉兼容性。出现在上述模型卡片上的相同GPQA分数也会在Eval Cards中呈现，后者将EEE运行数据与基准测试和模型元数据组合成一个可解释的记录。同一个评测，不同的展示面：

## [](#工作原理)工作原理

Hugging Face 将评估分数以 YAML 格式存储在模型仓库的 `.eval_results/` 目录下。必填字段仅包括基准数据集、任务和数值。`source` 块用于创建指向 EEE 的反向链接。

```
- dataset:
    id: openai/gsm8k
    task_id: gsm8k
  value: 96.8
  date: '2024-07-16'
  notes: '8-shot CoT'
  source:
    url: https://huggingface.co/datasets/evaleval/EEE_datastore/blob/main/flat/objects/<xx>/<yy>/<uuid>.json
    name: EvalEval
```

**转换器会根据你已有的记录自动填充这些字段。** 它将 `source_data.hf_repo` 映射到 `dataset.id`，`evaluation_name` 映射到 `task_id`，`score_details.score` 映射到 `value`，`evaluation_timestamp` 映射到 `date`，然后插入数据存储对象 URL 作为指向每条记录对应 EEE JSON 的源链接。目前支持四个官方基准：MMLU-Pro、GPQA、HLE 和 GSM8K。

**转换器的作用远不止重塑字段。** 你只需指定一个 EEE 数据存储集合，它就会下载该集合及其引用的记录，检查对象哈希值，并找出映射到受支持基准的分数。在写入任何实时数据之前，它会审计已存在的内容：读取模型主分支和开放 PR 中的每个 `.eval_results` YAML 文件，并按数据集和任务（而非文件名）进行比较。如果分数已存在，则标记为 `already_present`；如果存在不同分数，则标记为 `score_conflict`；如果模型仓库在 Hub 上无法解析，则标记为 `missing_hf_model`。其他情况均标记为 `ready`。

**未经你的确认，不会推送任何内容。** 该工具会生成本地 YAML 预览文件和可供检查的审核文件，显示哪些已就绪、哪些需要关注，并且只有在你输入 `OPEN PRS` 并输入提交信息后，才会打开 PR。重新运行时，除非使用 `--force` 参数，否则会复用集合的缓存结果。

[![转换器的 TUI 界面](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/eee_commevals/terminal%20shot.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/eee_commevals/terminal%20shot.png)

*转换器的审核步骤。被排除的条目（此处为没有匹配 Hub 仓库的模型）会列出其 EEE 源 URL，已就绪的 PR 则等待明确的 `OPEN PRS` 确认。*

## [](#start-here)从这里开始

将你的完整记录提交至 [EEE 数据存储](https://huggingface.co/datasets/evaleval/EEE_datastore)。

使用 EEE 仅需额外一步，而这一步大部分可由转换器自动完成。[社区评估转换器工具](https://github.com/evaleval/every_eval_ever/tree/main/tools/hf-community-evals) 可在 GitHub 仓库中找到。要处理一个集合，请执行以下命令：

```
uv run tools/hf-community-evals/community_evals_converter.py MMLU-Pro \
  --datastore evaleval/EEE_datastore@main
```

检查生成的预览和报告，然后在准备提交时输入 `OPEN PRS`。有关模式、CLI 和转换器的完整文档，请访问 [evalevalai.com/every\_eval\_ever/hf-community-evals](https://evalevalai.com/every_eval_ever/hf-community-evals/)。
