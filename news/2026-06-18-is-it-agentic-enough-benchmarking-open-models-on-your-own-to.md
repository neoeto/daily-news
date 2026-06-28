---
title: Is it agentic enough? Benchmarking open models on your own tooling
url: 'https://huggingface.co/blog/is-it-agentic-enough'
url_hash: d44bbcfdf323272f26f8025fb1690758aee5812c
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-18T00:00:00.000Z
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
[返回文章](https://huggingface.co/blog)

[![跨不同指标对 transformers 版本进行基准测试](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_6.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_6.png)

*跨不同指标对 transformers 版本进行基准测试*

> 这是一篇由人类撰写的、以智能体为核心的博客文章。

编码智能体正越来越多地代替我们与软件协作：描述一个任务后，智能体会自行选择库、编写调用、运行代码，并调试自己的错误。当库成为障碍时，它会愉快地绕过它，从头重写逻辑。这为库开发引入了一个新概念：代码不仅要正确和高效，还应设计得让智能体能够有效驱动它。笨拙的 API 或过时的文档会让我们开发者感到烦恼，而现在它还会让智能体走上一条更长、更昂贵的路径。

大多数基准测试只看最终答案。而我们想要的是整个过程：不仅关注智能体是否做对了，还要看它为此付出了多少努力，以及这种努力如何随模型、库版本和任务而变化。我们以 `transformers` 作为案例研究，精确测量了这些指标。

在这里，我们将介绍一个专注于答案发现过程的工具特定基准测试，并提供一种简单实现方案，完全运行在由 [pi](https://www.npmjs.com/package/@mariozechner/pi-coding-agent) 编码智能体驱动的开放模型上，将模型 × 版本 × 任务的完整组合分散到 [Hugging Face Jobs](https://huggingface.co/docs/huggingface_hub/guides/jobs) 中，确保每次运行都使用相同的硬件。

但是，***如何为智能体优化软件？***

我们坚信以下两个软件原则：

-   未经测试，则无法工作
-   没有文档，则等于不存在

在面向智能体优化的工具领域，这一点同样适用，而且这一次，这两者直接相互关联。

你希望你的工具对智能体而言是存在的：它需要是可发现的。API 必须清晰，文档必须详尽。它们需要以智能体能够快速访问有用文件和示例的方式组织。如果你希望你的工具能为智能体所用，那么你应该针对智能体使用场景进行测试。

## [](#针对智能体使用场景测试软件)针对智能体使用场景测试软件

在整篇博客文章中，我们将以 `transformers` 为例：智能体*使用*它来解决机器学习任务（文本分类、图像描述、音频转录），而不是为其贡献代码；尽管该测试框架设计为可与任何能从命令行操作的工具配合使用。

我们对 `transformers` 的直觉是，通过一些改动可以大幅简化其使用方式：一个 CLI、一个技能（Skill）以及自包含的、针对特定任务的示例。这与最近应用于 [`hf` CLI（重新设计为面向智能体优化）](https://huggingface.co/blog/hf-cli-for-agents) 的方法相同，其中智能体使用的 token 减少了 1.3–1.8 倍（最高达 6 倍）。我们想知道这种改进是否具有普适性，以及是否也能对 transformers 有所帮助。

直觉是一种强大的工具，但在我们向像 `transformers` 这样广泛使用的代码库提交增加数千行代码的 PR 之前，我们想要更多证据。我们开始衡量成功的标准。

### [](#not-all-successes-are-equal)并非所有成功都同等

两个智能体都能为情感分类任务生成正确的标签，但其中一个：

-   编写了一个 40 行的 Python 脚本，导入 `transformers`，调试了一个形状错误，重新运行了两次，最终打印出答案；

而另一个：

-   输入 `transformers classify --model ... --text "..."`，一次调用就完成了。

两者都得到了 `POSITIVE (0.9999)`，以下是两个智能体在此任务中实际采取的两条路径：

```
# 任务：对 "I absolutely loved the movie, it was fantastic!" 进行情感分类

- # 一个智能体：将脚本通过管道传给 python 并解析输出
- python - <<'PY'
- from transformers import AutoTokenizer, AutoModelForSequenceClassification
- import torch
- import torch.nn.functional as F
-
- model = AutoModelForSequenceClassification.from_pretrained("distilbert/distilbert-base-uncased-finetuned-sst-2-english")
- tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-uncased-finetuned-sst-2-english")
- inputs = tokenizer("I absolutely loved the movie, it was fantastic!", return_tensors="pt")
- with torch.no_grad():
-     logits = model(**inputs).logits
- probs = F.softmax(logits, dim=1)
- idx = torch.argmax(probs, dim=1).item()
- print(model.config.id2label[idx], probs[0][idx].item())
- PY

+ # 另一个智能体：一条命令
+ transformers classify \
+   --model distilbert/distilbert-base-uncased-finetuned-sst-2-english \
+   --text "I absolutely loved the movie, it was fantastic!"
```

两种方法都得到了相同的结果。但它们在**成本、延迟、令牌使用和失败情况**方面有着截然不同的特征。

如果你的评估只检查最终字符串，你就无法看到这些差异，也无法判断你对库所做的更改（CLI 改进、更好的错误消息、一个技能）是否真正帮助了智能体。

我们使用这个测试框架的目标是评估智能体执行给定任务需要做多少工作，以及库的更改是否提升了性能。

### [](#how-do-we-run-evaluations)我们如何运行评估？

简单说明一下我们将如何在此评估智能体。

我们在三种变体（或“层级”）下运行每个任务；智能体可以以三种不同的方式接触 `transformers`：

```
bare     安装 transformers，没有其他内容
clone    完整的 transformers 源代码，检出在工作目录中
skill    一个打包的技能：CLI 的文档 + 任务示例，加载在上下文中
```

这些不是嵌套关系：`skill` 不包含 `clone`（它提供精选的文档，而不是源代码树），两者也不严格包含对方，每种方式都给智能体提供了不同类型的帮助。正如我们将看到的，模型有时在 `clone` 上的表现可能优于 `skill`。

还有几个选择：

-   目前我们只关注能够提供精确匹配的确定性任务，因为这些任务为实验提供了极佳的基础。对于其他任务，模型作为评判者（Model-as-a-judge）及其他方案显然是下一步的方向。
-   每次运行都是一个独立的 Hugging Face 任务：每个（模型 × 版本 × 任务）对应一个任务，因此整个扫描在相同的硬件上并行运行，从而在大规模下保持比较的公平性。
-   结果和追踪记录存储在 Hugging Face 存储桶中：速度快，无需版本控制，并能处理极高的写入并发。

### [](#which-models-to-benchmark-against)应该以哪些模型作为基准？

并非所有驱动智能体的模型都相同，它们的差异会改变你在运行时应关注的重点。

*大型开源模型*

一方面，你有最大、能力最强的开源模型。在相当常见的任务上，这些模型最终应该能给出正确答案。对它们来说，任务完成率接近 100%，不再能提供关于工具的有用信息；更相关的基准是智能体完成任务所付出的努力：花费了多少轮次、令牌数和秒数，以及它们是否走了一条清晰的路径，还是使用了已弃用的 API。

*本地模型*

本地模型的大小差异很大，其能力也各不相同。与大型模型相比，**“匹配率”** 等指标更为相关，因为你可以看到模型大小/能力如何影响在特定工具上的结果。

这个测试框架不仅为库维护者提供指导，帮助他们改进仓库以适应智能体交互，还能评估不同智能体和模型在用户关心的任务上的表现。

测试框架从多个维度对每次运行进行评分，以便你可以针对每类模型关注真正重要的指标：

-   **匹配率**：最终答案是否包含预期结果（按任务划分，不区分大小写的子字符串/正则表达式/精确匹配，均在报告中明确说明）；
-   **中位时间**和**中位令牌数**（新生成 vs. 缓存 vs. 生成）；
-   **运行错误率**：包括一个保护机制，标记那些产生*空结果*的运行（0 个输出令牌、无工具调用、无答案），这样静默失败就不会伪装成“0”；
-   **标记采纳率**：工具定义的行为标记；详见下文解释。

所有结果都汇总到一份报告中，你可以直接查看：

*实时报告：概览、覆盖率和结果，全部在客户端侧。*

由于它捕获了每次运行的原生智能体追踪记录，数字只是开始：你可以逐条命令精确查看智能体做了什么。这些追踪记录可通过 Hub 的 [agent-traces 查看器](https://huggingface.co/docs/hub/agent-traces) 分享：

![在 Hub 的 agent-traces 查看器中渲染的一次运行：MiniMax-M2.7 在 answer-question 任务上](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_11.png)
*在 Hub 的 agent-traces 查看器中渲染的一次运行：MiniMax-M2.7 在 answer-question 任务上。*
[**在 Hub 上打开此追踪记录 ↗**](https://huggingface.co/buckets/lysandre/transformers-agentic-use/tree/traces/22404f7951/pi/MiniMaxAI--MiniMax-M2.7/bare__answer-question__run1.jsonl)

在结果之前，先快速回顾一下设置。每次运行变化四个因素：驱动智能体的**模型**、它所运行的 `transformers` **版本**、**任务**以及**层级**（`bare` / `clone` / `skill`）。如前所述，我们对两种不同的模型类别关注不同的指标。

### [](#大型开源模型-固定模型-变更版本)大型开源模型：固定模型，变更版本

由于大型开源模型通常能得出正确结果，实际衡量的是达成结果所需付出的努力。是用了十轮对话还是一轮？是否因为信任过时的文档而调用了已弃用的 API 路径？是否遇到了未曾预见的错误？

自然的实验方法是固定一个强模型，然后变更工具的版本：我们测试的 `transformers` 的连续 git 版本，从 `v5.8.0` 和 `v5.9.0` 等发布标签，到引入 CLI 和 Skill 的具体提交。我们想观察它给智能体带来的负担是增加还是减少。我们在 `transformers` 上使用测试框架来检查添加专用 CLI 和 Skill 是否确实减轻了智能体的工作。

对于我们测试中使用的三个大型模型，所有任务的平均耗时表明，Skill 提交导致完成任务所需的时间更少：

![按层级划分的每个版本的中位时间](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_13.png)
*按层级划分的每个版本的中位时间：Skill 提交（绿点）速度最快。*

另一方面，在克隆仓库的实验中，我们可以看到，由于引入 CLI 和示例的提交，token 消耗显著增加，我们稍后将看到这一点。

![按层级划分的每个版本的中位新 token 数](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_12.png)
*按层级划分的每个版本的中位新 token 数：一旦 CLI 进入仓库，克隆变体的 token 数就会跃升。*

阅读克隆变体的跟踪记录可以解释原因。该提交添加了一个命令，但它同时也将 CLI 的实现和一组 `cli/agentic/*.py` 使用示例直接放入了仓库中。

在 `clone` 变体上，智能体面前有一个完整的 transformers 代码库，大约三分之一的运行会去读取新的表面（`/cli/` 目录树和示例脚本）以了解接口，然后再调用它。这使中位输入从约 4k token 增加到约 6.4k token。

这两个图表代表了同一权衡的两个方面：该提交为大型模型节省了时间（它们直接使用 CLI 而不是调试 Python），但代价是消耗了更多 token（它们阅读了教会它们使用 CLI 的代码）。这是在合并 PR 之前值得了解的权衡。

不过，有一个因素对 CLI 有利，但尚未被基准测试所涵盖：阅读它的成本会随着后续运行而摊销。我们的设置是为一次性实验而构建的。每次运行都是一个全新的智能体，从头重新发现 CLI，因此每次都要支付发现成本。在实际使用中，智能体只需学习一次接口，然后在同一会话中逐个完成任务，从而将成本分摊到多次请求中。我们这里测量的 token 增加更接近最坏情况，而不是用户日常会看到的情况。

### [](#小型模型-固定版本-变更模型)小型模型：固定版本，变更模型

开放模型让我们能对这里最关键的变量进行精细控制：规模、配置、量化、提供商、训练方式，以及任何模型间的差异。同时，良好的工具交互界面在这里也至关重要：当一个小型模型被要求在`bare`环境中"使用`transformers`执行X任务"时，它可能会猜测某个已更新数个版本的API，进行不必要的工具调用，甚至得出错误答案。

因此，这里的实验与上述情况相反：固定版本，遍历模型。这有助于观察哪些模型真正能完成任务——不仅看token数量和时间，更要看哪些模型无法可靠处理工具调用。我们的直觉是：模型越小，工具使用和任务难度就越大；我们通过一系列不同规模的模型来验证这一点：

![各层级模型的匹配率](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_14.png)
*各层级模型的匹配率：技能层级提升了大型模型的表现，但降低了小型模型的表现。*

这似乎也与摄入的token数量相关：

![各层级模型的中位新增token数](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_15.png)
*各层级模型的中位新增token数。*

> 关于公平比较的说明：当覆盖率不均时（例如只完成简单任务的模型看起来速度很快），简单地对任务取平均值会产生误导。报告提供了**"仅共享任务"**切换选项（可跨模型和/或版本使用），以便进行同类比较；同时还有**覆盖率**热力图，可以精确查看哪些任务×版本×模型组合实际运行过。

## [](#tweaking-the-tool-markers-and-results)调整工具：标记与结果

这里涉及两个要点：如何超越"代理是否成功"的表象，深入观察其行为与执行方式；以及我们从测试框架中提取的首批结果。

### [](#whats-a-marker)什么是标记？

匹配率、token数量和时间能告诉你运行成本，但无法揭示运行背后的具体情况。

为此我们引入了标记概念。标记是一个命名模式，由配置文件（即小型插件，用于指导测试框架如何构建和驱动特定库）与运行结果进行匹配。

它用一行标签概括你关心的行为，并针对代理运行的shell命令、编写的代码、读取的文件或最终答案进行校验。一次运行可能触发多个标记，也可能一个都没有；报告会显示每个标记在每种模型和版本下的触发频率。

对于`transformers`，我们声明了几个标记，但这里只关注两个最相关的：

-   **`cli`**：代理调用了`transformers`命令行工具（例如`transformers classify …`），而非编写Python代码。
-   **`pipeline`**：代理使用了高级`pipeline(...)` Python API。

我们通过观察这些标记来判断变更是否真正改变了代理的行为。有趣的是，模型越大，它越倾向于利用新上下文而非依赖自身记忆，因此也更倾向于使用新引入的CLI。

![按模型层级划分的 CLI 采用率](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_16.png)
*按模型层级划分的 CLI 采用率：只有技能层级会使用它，且模型越大使用越多。*

CLI 的采用是全新的：CLI 仅通过一次提交引入，不在任何模型的训练数据中，且文档极少。效果很明显：只有技能变体（即附带 CLI 文档的版本）会实际使用它，采用率为 55.3%。

### [](#is-the-cli--skill-commit-helping)CLI + 技能提交是否有帮助？

比较不同模型规模下的提交效果，CLI + 技能对较大模型有帮助：在 `skill` 层级上，Kimi 和其他大型智能体会使用 CLI 并在更少的轮次内完成任务。（在 `clone` 层级上，它们会先消耗更多输入 token 来阅读新的 CLI 代码，如上所述，因此优势体现在时间和轮次上，而非原始 token 数。）

![跨版本的 Kimi-K2.6、GLM-5.1 和 MiniMax-M2.7](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_5.png)
*跨版本的 Kimi-K2.6、GLM-5.1 和 MiniMax-M2.7*

但在某些较小模型的设置中，它似乎会损害性能。一个合理的解释是，小模型依赖记忆的 API 模式，复现它们在训练数据中见过的 `pipeline(...)` 代码片段。新概念反而成为它们更容易出错的地方。你可以直接在测试框架中观察到这一点：匹配率降低、重试次数增加、`cli` 标记几乎不触发。在 Qwen3-4B 模型上尤为明显：技能变体几乎不改变其匹配率，但其成本分布却受到显著影响。

这几乎全部来自 `clone` 层级。检出内容现在包含 CLI 的实现和 `cli/agentic/*.py` 示例，4B 智能体会批量读取它们：其中位数新 token 从约 2.4k 跃升至约 23k，时间和输出也大幅增加，但准确率毫无提升。

![跨版本的 Qwen3-4B 成本分布：耗时、新 token、重复 token、输出 token](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_7.png)
*跨版本的 Qwen3-4B。CLI + 技能提交使成本分布大幅扩散，在 `clone` 层级上，智能体批量读取新引入的 CLI 源码（新 token 增加约 10 倍），但匹配率毫无提升。（`重复 token` 保持平稳：此设置未使用提示缓存。）*

不过，有时技能变体会直接破坏正确性。查看追踪记录可以发现，例如对于 Qwen3-14B：添加技能变体使其整体匹配率从 67%（基础版）降至 43%，在最简单的任务上，这种崩溃非常明显：`classify-sentiment` 从 `clone` 变体的 100% 降至技能变体的 **0%**。

![跨版本的 Qwen3-14B classify-sentiment 按层级划分的匹配率](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_17.png)
*Qwen3-14B 在 `classify-sentiment` 上按层级划分：`clone`（蓝色）在跨版本中保持 100%，但技能变体（绿色）在 CLI + 技能版本中崩溃至 0%。*

查看追踪记录，模型将 CLI 误认为是一种*可以直接调用的工具*（类似于智能体测试框架中的工具，如网络搜索）。技能变体**并非**可执行工具：它是加载到智能体上下文中的文档，而 `transformers` CLI 仅设计为通过 shell（使用 `bash`）运行；因此这不会成功。

Qwen3-14B 读取了 Skill，在其 56 次 Skill 运行中，有 39 次要么发出了一个 `transformers(command="classify", ...)` 工具调用（一个从未注册过的工具），要么在其 `read`/`bash`/`edit`/`write` 工具集中找不到类似内容，从而得出结论：它*无法*运行模型并放弃。无论哪种情况，它都没有回退到在 `clone` 检查点上获得 100% 分数的单行 `pipeline(...)`，而是宣布任务不可能完成。

![Qwen3-14B 在 Skill 变体下放弃 classify-sentiment 任务](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/is-it-agentic-enough/img_10.png)
*Qwen3-14B 在 classify-sentiment（Skill 变体）上的表现：它认为 read/bash/edit/write 无法运行模型，于是放弃。*

这正是我们构建测试框架所要捕捉的问题：加速大型模型的同一改动最终却破坏了小型模型，这起初让我们觉得有些反直觉，而且我们很可能就这样直接发布了。给维护者的启示是：**面向 Agent 的 API 应跨模型规模进行评估，因为新的能力接口可以减少强模型的工作量，同时给弱模型增加歧义。** 这也暗示了一种修复方法：与其手写一个 Skill 并在事后检查，不如预先针对较弱的模型生成并验证一个 Skill。

这正是 [Upskill](https://huggingface.co/blog/upskill) 所做的：只有当 Skill 能切实帮助较小模型时，它才会将强模型的解决方案转化为 Skill。

## [](#trying-it-yourself)自行尝试

该测试框架是一个 CLI 工具 `agent-eval`。安装它，运行一个测试套件，在 HF Jobs 上将其分发到模型 × 修订版本的组合中，然后将报告发布为 Hugging Face Space。

> **仅限受信任的本地使用。** 该测试框架会运行一个绕过权限的编码 Agent，并执行你指向的任何修订版本的代码，跟踪记录可能包含提示词、输出和本地路径。在将其指向非你编写的代码或分享结果之前，请参阅 [SECURITY.md](https://github.com/huggingface/is-it-agentic-enough/blob/main/SECURITY.md)。

完整且保持更新的设置和使用说明位于 [README](https://github.com/huggingface/is-it-agentic-enough) 中。

## [](#closing)结语

检查最终答案能告诉你 Agent 是否*能够*使用你的库。但它不会告诉你代价是什么：交互轮次、令牌数、错误以及它到达那里所走的路径。这个测试框架可以衡量这些，涵盖你选择的修订版本和模型。

在 `transformers` 上，它捕捉到了我们本会凭信心发布的问题：CLI + Skill 对最大的开源模型有帮助，却损害了最小的模型。在合并之前知道这一点很有价值！

它是基于配置文件的，并且设计为可适配：将其指向你自己的库，定义几个任务及其预期答案，就能得到同样的报告。代码和任务在[仓库](https://github.com/huggingface/is-it-agentic-enough)中，跟踪记录在 Hub 上。如果你在自己的项目中使用了它，请告诉我们！

## [](#acknowledgements)致谢

这个测试框架完全建立在 [pi](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)（Mario Zechner 的编码 Agent CLI）之上：它驱动了每一次开源模型的运行，并且只需要一个 `HF_TOKEN` 来提供模型服务，这使开源模型的全面评估变得切实可行。

感谢我们评估的模型背后的模型构建者和推理提供商。总体而言，它们的表现远高于 `bare` 基线所暗示的水平。
