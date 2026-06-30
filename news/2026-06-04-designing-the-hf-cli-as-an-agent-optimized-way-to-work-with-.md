---
title: Designing the hf CLI as an agent-optimized way to work with the Hub
url: 'https://huggingface.co/blog/hf-cli-for-agents'
url_hash: 431ad766fff6cc422fc97182a8095ac6e746a59a
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-04T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Célina Hanouti 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/6192895f3b8aa351a46fadfd/gsGa2PvHTKAv7MNbyLH8y.jpeg)](https://huggingface.co/celinah)

[![Lucain Pouget 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/1659336880158-6273f303f6d63a28483fde12.png)](https://huggingface.co/Wauplin)

`hf` 是 Hugging Face Hub 的官方命令行入口。凡是你能通过 Python SDK 在 Hub 上完成的操作，都可以在终端中完成：下载和上传模型、数据集和 Spaces；创建和管理仓库、分支、标签及拉取请求；在 HF 基础设施上运行任务；管理 Buckets、Collections、Webhooks 和推理端点。

多年来，`hf` CLI 主要面向我们的用户构建。但现在，它越来越多地被**编码代理**使用：Claude Code、Codex、Cursor 等等。因此，我们对其进行了重构，使其能同时服务于这两类用户。这篇博文总结了我们的工作以及基准测试方法。我们发现，在复杂的多步骤任务中，不使用 `hf` CLI 的基线方案（即代理手动编写 `curl` 命令或使用 Python SDK）消耗的 token 数量最高可达使用 `hf` CLI 的 **6 倍**。

## [](#ai-agent-traffic-on-the-hub)Hub 上的 AI 代理流量

我们从 2026 年 4 月开始追踪 Hub 上的代理使用情况。`hf` CLI（及其所基于的 `huggingface_hub` Python SDK）通过读取代理设置的环境变量来检测是否有编码代理在驱动它：`CLAUDECODE`/`CLAUDE_CODE` 对应 Claude Code，`CODEX_SANDBOX` 对应 Codex，此外还有 Cursor、Gemini、Pi 以及通用的 `AI_AGENT`。这个单一信号承担了两项工作：它塑造了 CLI 的输出格式（下文详述），并为每个 Hub 请求打上 `agent/<name>` 的用户代理标签，以便我们将流量归因于驱动它的代理。按独立用户数计算，最大的两个代理是 **Claude Code 和 Codex**，它们遥遥领先于其他代理，也是我们本文后续进行基准测试的两个代理。

![自 2026 年 4 月以来，按编码代理划分的 Hugging Face Hub 独立用户数。Claude Code 以 39,500 名用户和 4,860 万次请求领先，其次是 Codex，拥有 34,800 名用户和 3,640 万次请求，随后是 antigravity、cursor-cli、openclaw、cursor、gemini 和 pi。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-users.png) ![自 2026 年 4 月以来，按编码代理划分的 Hugging Face Hub 独立用户数。Claude Code 以 39,500 名用户和 4,860 万次请求领先，其次是 Codex，拥有 34,800 名用户和 3,640 万次请求，随后是 antigravity、cursor-cli、openclaw、cursor、gemini 和 pi。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-users-dark.png)

柱状图统计的是每个代理的独立用户数；子标签显示的是请求量。仅 Claude Code 就有约 4 万用户和近 4,900 万次请求，Codex 紧随其后。这些只是早期数据（我们直到 2026 年 4 月才开始归因代理流量），但规模已经相当可观，我们预计随着编码代理成为与 Hub 交互的标准方式，这一数字还将继续增长。

## [](#built-for-humans-and-agents)为人类和代理而构建

人类和编码智能体对相同的 `hf` 命令期望不同的输出。人类希望获得丰富的终端输出：ANSI 颜色、适配屏幕的截断填充表格、成功时的绿色 ✅、布尔值的 `✔`、进度条和文本提示。而智能体则相反：不需要 ANSI、不截断、每个值都完整显示（因为智能体能处理比人类更密集的输出），保持紧凑和结构化以节省 token。此外，智能体无法响应 CLI 提示，会在超时后愉快地重新运行命令。本节其余部分将介绍 `hf` 如何满足双方的需求。我们在 `hf` v1.9.0 中引入了智能体模式输出，并在后续版本中逐步将 CLI 的其他部分迁移到该模式。

### [](#one-command-multiple-renderings)同一命令，多种渲染方式

当 `hf` 自动检测到智能体使用（通过上述环境变量）时，它会以不同方式渲染**同一命令**。它无需传递标志即可优化人类或智能体的输出格式：

```
# 人类（终端默认）：对齐表格，截断适配屏幕，附带提示
> hf models ls --author Qwen --sort downloads --limit 3
ID                       CREATED_AT DOWNLOADS LIBRARY_NAME LIKES PIPELINE_TAG    PRIVATE TAGS
------------------------ ---------- --------- ------------ ----- --------------- ------- -------------------------
Qwen/Qwen3-0.6B          2025-04-27  21156913 transformers  1285 text-generation         transformers, safetens...
Qwen/Qwen2.5-1.5B-Ins... 2024-09-17  15143953 transformers   725 text-generation         transformers, safetens...
Qwen/Qwen3-4B            2025-04-27  14808352 transformers   625 text-generation         transformers, safetens...
提示：使用 `--no-truncate` 或 `--format json` 显示完整值。

# 智能体（自动检测）：TSV 格式，完整 ID + ISO 时间戳 + 所有标签，无截断
$ hf models ls --author Qwen --sort downloads --limit 3
id      created_at      downloads       library_name    likes   pipeline_tag    private tags
Qwen/Qwen3-0.6B 2025-04-27T03:40:08+00:00       21156913        transformers    1285    text-generation False   ['transformers', 'safetensors', 'qwen3', 'text-generation', 'conversational', 'arxiv:2505.09388', 'base_model:Qwen/Qwen3-0.6B-Base', 'base_model:finetune:Qwen/Qwen3-0.6B-Base', 'license:apache-2.0', 'text-generation-inference', 'endpoints_compatible', 'deploy:azure', 'region:us']
Qwen/Qwen2.5-1.5B-Instruct      2024-09-17T14:10:29+00:00       15143953        transformers    725     text-generation False['transformers', 'safetensors', 'qwen2', 'text-generation', 'chat', 'conversational', 'en', 'arxiv:2407.10671', 'base_model:Qwen/Qwen2.5-1.5B', 'base_model:finetune:Qwen/Qwen2.5-1.5B', 'license:apache-2.0', 'text-generation-inference', 'endpoints_compatible', 'deploy:azure', 'region:us']
Qwen/Qwen3-4B   2025-04-27T03:41:29+00:00       14808352        transformers    625     text-generation False   ['transformers', 'safetensors', 'text-generation', 'arxiv:2309.00071', 'arxiv:2505.09388', 'base_model:Qwen/Qwen3-4B-Base', 'base_model:finetune:Qwen/Qwen3-4B-Base', 'license:apache-2.0', 'endpoints_compatible', 'deploy:azure', 'region:us']
```

**人类**获得对齐的表格，截断适配终端，并附带查看更多的提示，状态通过颜色提示（成功时绿色 `✓`，错误时红色）。**智能体**获得完整的 TSV 记录：完整的仓库 ID、完整的 ISO 时间戳、所有标签、无 ANSI 代码、无截断，易于解析且节省 token。

在实践中，我们实现了诸如 `.table(...)`、`.result(...)`、`.json()` 等日志方法，这些方法接收原始数据作为输入并处理格式化。除了人类和智能体模式，我们还引入了 `--json` 和 `--quiet` 选项，以便更轻松地串联命令。默认模式会根据上下文自动选择，但用户始终可以通过 `--format human | agent | json | quiet` 强制选择所需的格式。

### [](#next-command-hints)下一步命令提示

CLI 命令很少孤立运行：一个步骤通常意味着下一步（比如 `git add`，然后 `git commit`）。现在许多 `hf` 命令的末尾都会附带一个**提示**：即下一步要运行的确切命令，并预填好你刚刚使用的 ID，这样用户或代理就可以直接衔接下一步，而无需从头推算。在后台启动作业后，它会指向日志；创建 Space 后，它会指向启动状态：

```
$ hf jobs run --detach python:3.12 python train.py
✓ 作业已启动
  id: 6f3a1c2e9b
  url: https://huggingface.co/jobs/celinah/6f3a1c2e9b
提示：使用 `hf jobs logs 6f3a1c2e9b` 获取日志。
```

对人类来说，这是便利。对代理来说，这是轨道：下一步操作已被命名，并用正确的 ID 参数化，随时可以运行，因此减少了推算步骤。错误也以同样的方式处理，不是仅仅报错，而是指出修复方法：

```
错误：未登录。请先运行 `hf auth login`。
```

提示、警告和错误都输出到 stderr，而数据输出到 stdout，因此这些指导信息不会污染代理正在解析的输出。

### [](#non-blocking-and-safe-to-retry)非阻塞且可安全重试

`hf` 绝不会停留在交互式提示符前等待代理无法按下的按键。破坏性命令仍然会要求人类确认，但在代理模式下，它会*快速失败*，并在消息中给出修复方法（`使用 --yes 跳过确认。`），而 `-y`/`--yes` 则跳过确认。此外，由于代理会在超时和上下文丢失时重试，操作被设计为可安全重复：`hf repos create --exist-ok` 在仓库已存在时无操作，重新运行上传会干净地重新提交。另外，移动真实数据的命令带有 `--dry-run` 参数，可以在运行前精确显示将要传输的内容，这对人类和代理都很方便，因为两者都不必承诺进行长时间的下载或盲同步：

```
# 代理模式：不带 --yes 的破坏性命令会拒绝，并在消息中给出修复方法
$ hf repos delete my-org/old-model
错误：您即将永久删除模型 'my-org/old-model'。是否继续？使用 --yes 跳过确认。

# 移动数据的命令使用 --dry-run 预览传输内容
$ hf download deepseek-ai/DeepSeek-V4-Pro config.json --dry-run
[dry-run] 将下载 1 个文件（共 1 个），总计 1.8K。
文件         大小
config.json  1.8K
```

### [](#discoverable-predictable-commands)可发现、可预测的命令

`hf` 被设计为可探查：运行 `hf` 查看资源组，在需要的组上运行 `--help`，每个 `--help` 末尾都带有真实、可复制粘贴的示例（代理匹配这些示例的速度远快于解析描述）：

```
$ hf models ls --help
...
示例
  $ hf models ls --sort downloads --limit 10
  $ hf models ls --search "qwen" --author Qwen
  $ hf models ls Qwen/Qwen3-4B --tree
```

命令树是一致的，**资源 + 动词** 并带有明显的别名（`hf models ls`、`hf repos create`、`hf jobs ps`、`hf collections delete`；`list`/`ls`、`remove`/`rm`），因此一旦智能体学会一个命令，就能推断出其余命令。输出结果可组合使用：`-q` 每行打印一个 ID 以便通过管道传递给下一个命令，`--json` 则提供可交给 [`jq`](https://jqlang.org/) 处理的数据。

```
$ hf models ls --author Qwen -q | head -3
Qwen/Qwen3-0.6B
Qwen/Qwen2.5-1.5B-Instruct
Qwen/Qwen3-4B
```

## [](#benchmarking-the-hf-cli-for-coding-agents)对面向编码智能体的 hf CLI 进行基准测试

为了验证 `hf` CLI 是否真的对智能体更高效，我们进行了测量。我们构建了一个小型评估框架，通过每种驱动 Hub 的方式反复执行同一组 Hub 任务，并根据实时 Hub 对每次运行进行评分。以下是方法论之前的要点：在两种智能体上，`hf` CLI 均表现更优，尤其是在复杂的多步骤任务中，其使用的 token 数量显著更少。

| 智能体 | 工具 | 成功率 | token 使用量 | 自报错误 |
| --- | --- | --- | --- | --- |
| **Claude Code (Sonnet 4.6)** | `hf` CLI | **0.94** | 基准 | **2 / 163** |
|  | curl / Python SDK | 0.84 | **1.3-1.6× tokens** | 11 / 163 |
| **Codex (GPT-5.5)** | `hf` CLI | **0.93** | 基准 | **3 / 163** |
|  | curl / Python SDK | 0.92 | **1.6-1.8× tokens** | 10 / 163 |

*(自报错误 = 智能体报告在 17 个可解任务上成功，但 Hub 显示并非如此。`hf` CLI 行表示安装了技能的 CLI；技能在裸 CLI 基础上增加的功能（主要是减少工具调用次数）将在下文[技能部分](#the-hf-cli-skill)详细说明。代表性记录已发布在[此存储桶](https://huggingface.co/buckets/celinah/hf-cli-agent-benchmark)中。)*

### [](#the-setup)设置

我们定义了 **18 个非平凡的 Hub 任务**。不是“下载文件”，而是你实际会要求的那种操作：汇总热门组织的模型、检查仓库的文件及其大小、使用包含/排除规则上传文件夹、删除文件、跨仓库复制文件、打开一个添加许可证的 PR、创建一个带有分支和标签的仓库、同步并清理存储桶、构建集合。每个任务都交给一个全新的编码智能体，并只允许其使用**一种**与 Hub 交互的方式：

-   `hf` CLI，或
-   **curl / Python SDK**：完全不使用 `hf` CLI，因此智能体只能退而使用针对 REST API 的 `curl` 或 `huggingface_hub` Python 库。

我们在两种配置下运行 `hf` CLI：带技能和不带技能（技能是一个生成的命令参考，我们将在[其专属部分](#the-hf-cli-skill)中讨论）。但下面的主要对比仅仅是 **`hf` CLI 对比 curl / SDK**；技能的增量效果足够小，我们将其单独列出，而不是挤入主要结果中。

配置刻意保持简洁：每次运行都是全新实例，没有自定义MCP服务器，没有`CLAUDE.md`或`AGENTS.md`，上下文中没有任何引导行为的内容。任务和工具被放入单个提示中，代理以`TASK_COMPLETE`或`TASK_FAILED`标记结束，但我们并不信任这个标记（代理可能会在未实际完成的工作上报告成功），因此我们通过**重新查询实时Hub**来独立评估每次运行：分支是否真的创建了，文件是否真的删除了，存储桶是否存在？每个任务/工具组合运行**10次**，因为编码代理是非确定性的，每个代理约**520次运行**（18个任务 × 3个工具 × 10次重复，减去一个可计费Jobs任务的上限），总共约1,000次分级运行。我们在两个最流行的编码代理（**使用Sonnet 4.6的Claude Code**和**使用GPT-5.5的OpenAI Codex**）上完整运行了两次。

### [](#the-results)结果

下面的两张图表解析了上表。首先是**Sonnet上的任务成功率**，这是curl和SDK表现最差的代理：

![使用Sonnet 4.6的Claude Code上的任务成功率：hf CLI 94%，curl / Python SDK 84%。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-success.png) ![使用Sonnet 4.6的Claude Code上的任务成功率：hf CLI 94%，curl / Python SDK 84%。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-success-dark.png)

没有CLI的情况下，curl和SDK落后了十个百分点，因为在Sonnet上它们根本无法完成部分工作（主要是写入操作），而`hf` CLI则能顺利处理。

第二张图展示了**GPT-5.5上的Token影响**，按任务细分。每个柱状图代表同一任务上curl/SDK的Token数除以CLI的Token数，因此`2.4×`意味着非hf版本消耗了2.4倍的Token来完成相同任务：

![GPT-5.5上curl/Python SDK与hf CLI的每任务Token比率，从高到低排序。多步骤任务中curl/Python SDK成本远高于CLI：创建+同步+清理存储桶6.0倍，按趋势模型排名组织4.1倍，创建仓库+分支+标签/删除文件/跨仓库复制文件各2.4倍。简单的一次性读取接近持平或更低：批量模型元数据0.5倍，统计数据集行数0.3倍。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-tokens.png) ![GPT-5.5上curl/Python SDK与hf CLI的每任务Token比率，从高到低排序。多步骤任务中curl/Python SDK成本远高于CLI：创建+同步+清理存储桶6.0倍，按趋势模型排名组织4.1倍，创建仓库+分支+标签/删除文件/跨仓库复制文件各2.4倍。简单的一次性读取接近持平或更低：批量模型元数据0.5倍，统计数据集行数0.3倍。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-tokens-dark.png)

对于一次性读取（统计数据集行数、批量元数据），curl和SDK表现良好，有时甚至更轻量。但随着任务变得复杂并涉及多个依赖步骤，代理必须手动构建整个REST调用链（或深入挖掘SDK），成本急剧上升：在创建带分支和标签的仓库、删除文件、跨仓库复制或同步存储桶等任务上，**成本是CLI的2.4倍到6倍**。`hf` CLI让代理能够以几个高级命令来表达任务，而无需精心设计复杂的工作流。

### [](#key-findings)关键发现

-   **`hf` CLI 远比 curl 或 SDK 轻量。** 在同等或更优成功率下，完成相同任务时，curl 和 SDK 消耗的 token 量**大约是 1.3 到 1.8 倍**。在简单读取任务上尚可，但在真实的多步骤工作中，代价高达 **2 到 6 倍**：CLI 将一串 REST 调用组合成几个高级命令，而 curl 或 SDK 每次运行都需要手动重新推导这一串调用。
-   **在更强的模型上，curl 和 SDK 虽然能用，但仍然浪费。** 在 Sonnet 上，它们无法完成部分任务（主要是写入操作）；在 GPT-5.5 上，它们大多能成功，能正确手动实现 REST 调用（或使用 SDK），但 token 消耗仍然远超 CLI。

## [](#the-hf-cli-skill)hf-cli 技能

`hf` 附带了一个**技能**：一个紧凑的参考手册，涵盖了代理作为上下文加载的整个命令界面。它是从实时的 `hf` 命令树**自动生成**的，每个命令占一行（包含其签名、一行描述以及重要标志），按资源分组，并附有常用选项的简短词汇表。它刻意跳过了不言自明的标志，以保持简洁和轻量，并且每个版本都会重新生成。运行 `hf skills preview` 可以打印它，或通过以下命令安装：

```
# 适用于 Codex、Cursor、OpenCode、Pi 以及其他从 `.agents/skills` 加载技能的代理
hf skills add
# 包含上述内容 + Claude Code
hf skills add --claude
```

这能带来什么好处？主要是，代理不再需要猜测。最清晰的体现是，在有技能和无技能的情况下，每次运行所需的命令数量对比：

![每次运行的平均命令数（工具调用），有和没有 hf-cli 技能的情况，在两个代理上。Claude Code (Sonnet 4.6)：无技能时 10.4 个，有技能时 6.9 个。Codex (GPT-5.5)：无技能时 10.1 个，有技能时 7.3 个。越少越好。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-skill.png) ![每次运行的平均命令数（工具调用），有和没有 hf-cli 技能的情况，在两个代理上。Claude Code (Sonnet 4.6)：无技能时 10.4 个，有技能时 6.9 个。Codex (GPT-5.5)：无技能时 10.1 个，有技能时 7.3 个。越少越好。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/huggingface_hub/chart-skill-dark.png)

在两个代理上，每个任务大约从十个命令减少到七个，工具调用减少了大约 30%。这是因为代理不再需要通过 `--help` 来探测正确的命令和参数。技能不会减少你的 token 消耗，因为它会在上下文前面加上一段固定的信息，因此对于相同的任务，token 量大致相同或略有增加。技能也不会让 CLI 更可靠，但它能帮助代理将时间花在执行你的任务上，而不是弄清楚工具的工作原理。这在将 `hf` 与本地模型一起使用时可能特别有用。

我们在全新的会话中运行每个任务，因此技能在每个任务上都付出了其上下文成本。在真实的多任务会话中，这个成本会被摊销（代理只需学习一次命令界面），因此 token 情况可能会有所改善；我们没有测量这种情况。

## [](#try-it-yourself)亲自尝试

我们对所有这些进行了基准测试，因为我们认为这很重要。智能体正在成为 Hub 的真实用户：它们训练模型、构建和清理数据集，并以 Spaces 的形式发布演示，而且几乎总是代表人类行事。一个对智能体运行良好的 Hub，同样也能让使用它们的人获得更好的体验。智能体的工具越好，它能为你做的事情就越多。

如果你的智能体与 Hugging Face Hub 交互，我们建议为其提供 `hf` CLI：

```
# macOS / Linux
curl -LsSf https://hf.co/cli/install.sh | bash

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"
```

然后为其添加技能，这样它从一开始就能了解整个命令范围：

```
hf skills add            # Codex、Cursor、OpenCode、Pi 以及其他从 .agents/skills 加载技能的智能体
hf skills add --claude   # 上述所有 + Claude Code
```

接着将你的智能体指向 Hub，让它开始工作。确保你已经登录（`hf auth login`），然后给它一个类似这样的提示：

```
使用 `hf` 列出我在 Hugging Face Hub 上的模型、数据集和 Spaces。
看看我目前是如何使用 Hub 的，并建议几种你可以帮助我的方式。
```

它会自行解析命令，并返回有用的结果。

完整的命令参考位于 [`hf` CLI 指南](https://huggingface.co/docs/huggingface_hub/guides/cli)中。

## [](#register-an-agent-harness)注册智能体框架

正在构建智能体框架？**请务必注册它！** 这样 `hf` 才能学会检测它，Hub 才能将其流量归因于你的框架。你只需打开一个小型 PR，在 [`agent-harnesses.ts`](https://github.com/huggingface/huggingface.js/blob/main/packages/tasks/src/agent-harnesses.ts) 中添加一个条目即可。阅读[注册你的智能体框架](https://huggingface.co/docs/hub/agents-overview#register-your-agent-harness)指南以获取更多详细信息。
