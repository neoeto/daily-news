---
title: We got local models to triage the OpenClaw repo for FREE!*
url: 'https://huggingface.co/blog/local-models-pr-triage'
url_hash: d1c7fe87ce16567d226c5de1ae7a74704ed432c0
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-22T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
  - 前端
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

*\*免费如啤酒，不包括电费，且假设你已拥有硬件*

2026年6月将被铭记为人们意识到闭源模型可能被剥夺的时刻。随着Anthropic最新旗舰模型Claude Fable 5被下架的记忆犹新，不难理解为何拥有自己的AI栈并能在本地运行模型比以往任何时候都更重要——尤其是当你正将业务建立在AI之上时。

有鉴于此，我们想分享如何在代理框架中使用Gemma和Qwen等本地模型来执行分类任务[\[1\]](#note-1)。这种方法不同于使用BERT等模型进行分类。在Pi这样的代理框架中，本地模型可与结构化输出配合使用来分配标签。我们选择此方法是因为手头已有本地模型和框架，并且坚信随着本地模型能力的提升，类似配置将越来越受欢迎[\[2\]](#note-2)。

我们的起点是OpenClaw仓库中的开源贡献。OpenClaw每天收到数百个issue和PR，需要分类、确定优先级并分配给维护者。我（Onur）正致力于让本地模型与OpenClaw良好配合。作为这个特定领域的维护者，我需要快速响应任何P0问题。

使用GPT-5、Opus或Sonnet等SOTA闭源模型时，这是相当直接的任务。但我恰好拥有128GB统一内存的NVIDIA GB10。因此我接受了这个挑战：

> 我能否构建一个实时通知系统，仅过滤并通知我负责的issue……使用本地开源权重模型？

<figure><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/local-models-pr-triage/dgx-spark.png" alt="NVIDIA DGX Spark"><figcaption>这个名为DGX Spark的小盒子能以高并发运行gemma-4-26b-a4b，每秒生成数百个token。</figcaption></figure>

如果我让运行在每月200美元ChatGPT Pro计划上的OpenClaw主代理在每个新issue或PR时触发任务，那会耗尽我的配额。我可能改为每2小时或6小时运行一次。这会将issue批量处理更长时间，因此我们将用实时通知换取延迟处理。

如果我在已有硬件上使用本地模型运行此任务，不仅几乎能即时收到通知，还能免费完成（或者说，仅需支付电费）。

## [](#categorizing-issues-and-prs)对issue和PR进行分类

我们设计了一组有限标签，代表需要分类的issue类别，然后使用本地模型将每个issue归类到其中一个类别，例如`local_models`、`self_hosted_inference`、`acp`、`agent_runtime`、`codex`、`ui_tui`等[\[3\]](#note-3)。

但如何对拉取请求进行分类？只需向Chat Completions端点发送一个带有工具JSON模式（主题作为枚举）的简单请求？

差不多。但现在是2026年，不是2023年，我们有AGENTS了。我们可以做得更好！

在本地模型选择上，我们测试了 `gemma-4-26b-a4b` 和 `qwen3.6-35b-a3b`。经过性能优化，两者都能在本地每秒生成数百个token。

我们使用一个agent框架来驱动分类运行。为此，我们将 [pi](https://pi.dev/) 打包成一个框架，用于调用本地模型端点。

默认情况下，agent会在第一条提示中收到PR标题、正文以及PR差异的截断摘要。然后，它可以选择使用 `bash` 工具对OpenClaw仓库执行只读操作（如果需要查看代码库），或者使用 `final_json` 工具提交最终分类结果。

在这种高吞吐量的场景下，你不会想给本地模型完全的bash访问权限，因为一个被提示注入的issue或PR可能会引导模型执行与分类无关的操作。

因此，我们使用 [`reposhell`](https://github.com/osolmaz/localpager/tree/main/reposhell) 代替 `bash`：一个受限的、类似 `bash` 的shell，只允许对OpenClaw仓库执行只读操作（`ls`、`find`、`cat`、`grep`等）。模型以为自己在使用 `bash`，但任何不允许的操作都会被拒绝：

```
reposhell bound cwd=/repo/openclaw repos=openclaw
type help for allowed commands; exit or quit to leave

reposhell /repo/openclaw> help
allowed: pwd, ls, find, rg, grep, sed -n, cat, head, tail, wc -l, git status --short, git show --name-only, git grep, git ls-files
search: rg -n -i "lm studio" or grep -R -n -i "lm studio" .
files: rg --files -g "*.ts" or git ls-files src
examples: rg -n reposhell README.md | sed is not allowed; use one simple command at a time

reposhell /repo/openclaw> head README.md
# 🦞 OpenClaw — Personal AI Assistant

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text-dark.svg">
        <img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text.svg" alt="OpenClaw" width="500">
    </picture>
</p>

<p align="center">

reposhell /repo/openclaw> curl localhost
reposhell policy denied command: unsupported command "curl"
exit_code=2

reposhell /repo/openclaw>
```

这里有一个具体的例子，说明了这一点的重要性。在一个[保存的会话示例](https://huggingface.co/datasets/dutifuldev/openclaw-classification-dataset/blob/main/session-examples/README.md)中，`qwen3.6-35b-a3b` 正在分类 [`openclaw/openclaw#84621`](https://github.com/openclaw/openclaw/pull/84621)，标题为 `Fix Kimi tool-call rewriting stop reason handling`。思考过程显示，模型最初考虑的是 `coding_agent_integrations`，因为更改的路径 `extensions/kimi-coding` 看起来似乎合理。模型使用reposhell通过简单的只读命令（如 `ls extensions`、`ls extensions/kimi-coding` 和 `cat extensions/kimi-coding/package.json`）检查了本地仓库。该包的元数据显示，这个扩展实际上是 `@openclaw/kimi-provider`，一个OpenClaw Kimi提供者插件。因此，模型将最终标签修正为 `inference_api` 和 `tool_calling`，并明确排除了 `coding_agent_integrations`。

我们之前提到过，我们打包了一个特定的 `pi` 配置，它只能执行只读操作并返回分类输出。我们称之为 [`localpager-agent`](https://github.com/osolmaz/localpager/tree/main/localpager-agent)，以这里的主项目 `localpager` 命名。每个PR和issue都会生成一个提示，然后像下面这样，连同其他参数一起传递给CLI：

```
localpager-agent \
  --model "<model-id>" \
  --base-url "<openai-compatible-base-url>" \
  --session-dir "<session-output-dir>" \
  --final-schema "<runtime-schema.json>" \
  --tools bash,final_json \
  --reposhell-socket "<reposhell.sock>" \
  --reposhell-default-repo "<repo-id>" \
  --reposhell-visible-repos "<repo-id>[,<repo-id>...]" \
  -p "$(cat <rendered-prompt.md>)"
```

## [](#processing-incoming-prs-and-issues)处理传入的PR和issue

那么，是什么在协调从收到 PR/Issue 到最终在 Discord 上发送通知之间的所有环节呢？

<figure><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/local-models-pr-triage/discord-notification.jpg" alt="Localpager Discord 通知"><figcaption>这就是最终过滤后的 Discord 通知的样子：一个关于所需领域的 PR 被路由到了我这里。</figcaption></figure>

围绕这一过程的协调非常简单；只有分类步骤涉及 LLM：

1.  我们使用 [openclaw/gitcrawl](http://github.com/openclaw/gitcrawl) 作为仓库的本地镜像。每当有新的 PR 或 Issue 时，每个条目都会被标准化为相同的格式，并写入 localpager 自己的 SQLite 数据库。如果该条目是新的，localpager 会为其创建一个分类任务。
2.  然后，一个工作进程从队列中领取任务。它会构建一个 GitHub 上下文对象，包含 Issue 或 PR 的标题、正文、标签、作者、状态，以及可选的评论、更改的文件和选定的差异摘录。这意味着本地模型大多数情况下无需浏览 GitHub 或自行打开 URL，而是直接获得所有相关上下文。
3.  上下文对象被渲染成提示词，并按照上一节所述传递给 `localpager-agent`。该代理可以思考并使用 reposhell，但最终必须按照定义的架构输出分类结果。
4.  输出结果被存储回 localpager 的 SQLite 数据库中，并根据用户配置的通知策略（即通知我这些主题，但不通知其他主题）转发到 Discord。

下图展示了 localpager 的整体架构：

<figure><img src="https://huggingface.co/blog/assets/local-models-pr-triage/localpager-architecture.svg" alt="Localpager 架构"></figure>

该架构是半代理式的。标签分类以代理方式完成，而发送通知则由确定性规则处理。这样做是为了通过移除任务中最直接部分的推理需求，来加快通知管道的速度。本地推理是免费的，但每个任务都有资源争用成本：GPU 带宽应保留给绝对需要推理的任务。这也减少了通知出错的几率。

## [](#can-local-models-triage-prs)本地模型能对 PR 进行分类吗？

坦白说，这个系统的早期本地版本噪音很大。第一个测试的模型 `gemma-4-e4b-it` 有助于让端到端的本地管道运行起来，但它也倾向于给 PR 或 Issue 打上太多不相关的标签。误报标签会让 Discord 信息流变得嘈杂，无法将我的注意力集中在正确的问题上。这促使我们测试更大的本地模型，包括 `gemma-4-26b-a4b` 和 `qwen3.6-35b-a3b`，在下面包含 330 行的评估集上进行测试。

在早期的提示词工作中，我们还通过 antirez 的 DS4 实现[\[4\]](#note-4) 使用了 `DeepSeek-V4-Flash` 来创建早期的数据集标签。该设置通过 CUDA 使用 DS4 服务器。我们最终放弃了 DS4 作为标签器，因为它在不同运行中的标签结果不一致。我们也没有将其作为主要的 `localpager-agent` 模型，因为它太大，无法在我们的硬件上获得足够的吞吐量：DS4 服务器为我们提供了大约每秒 14 个 token，最大并发数为 1。

为了测试模型性能，我们选取了330个GitHub Issue和PR并生成了标签。每个条目被标注五次（3次GPT-5.5和2次Opus 4.8），且模型之间需达成一致才能被接受。这一过程涉及人工裁决、改进标签定义，并突出模型内部产品设计选择。这为我们提供了一套稳定、可复现的标签，用于对比我们的小型模型。

在获得该评估集的有用结果之前，我们无需对`gemma-4-26b-a4b`或`qwen3.6-35b-a3b`进行提示优化。使用相同的路由提示，Gemma的召回率更高，每行耗时更短；而Qwen的精确率更高，精确匹配率更高，误报更少。我们还以`DeepSeek-V4-Flash`作为参考在同一数据集上运行。其误报最少，但模型规模和吞吐量使其无法在NVIDIA GB10上实时执行这些任务。由于每行可能有多个标签，误报和漏报是所有行的标签总数。以下Qwen的结果是在重试结构化输出失败（模型在调用`final_json`前耗尽输出令牌）后得出的。对于Gemma和Qwen，重复运行指标报告了三次运行的平均值±样本标准差。`DeepSeek-V4-Flash`作为参考仅运行一次。

| 指标 | `gemma-4-26b-a4b` | `qwen3.6-35b-a3b` | `DeepSeek-V4-Flash` |
| --- | --- | --- | --- |
| 精确率 | 0.716 ± 0.010 | 0.831 ± 0.007 | 0.938 |
| 召回率 | 0.905 ± 0.004 | 0.818 ± 0.006 | 0.714 |
| F1值 | 0.800 ± 0.008 | 0.824 ± 0.002 | 0.811 |
| 精确匹配 | 0.410 ± 0.014 | 0.540 ± 0.014 | 0.509 |
| 误报 | 227.0 ± 10.5 | 105.7 ± 6.4 | 30 |
| 漏报 | 60.0 ± 2.6 | 115.3 ± 4.0 | 181 |
| 每行耗时（秒） | 1.41 ± 0.04 | 13.51 ± 0.79 | 144.14 |
| 输出令牌/秒/工作器 | 25 | 50 | 13 |
| 输出令牌/秒（总计） | 402.6 | 145.3 | 13 |
| 并发数 | 16 | 4 | 1 |
| 总参数量 | 26B | 35B | 284B |
| 激活参数量 | 4B | 3B | 13B |

这里的吞吐量和耗时数据并非这些模型在该硬件上的最终最大性能指标，而是我们当时在现有优化条件下使用的设置。例如，在另一次测试中，`gemma-4-26b-a4b`还支持并发数32，并实现了超过700个聚合输出令牌/秒。

<figure><img src="https://huggingface.co/blog/assets/local-models-pr-triage/benchmark-comparison.svg" alt="330行标签集的基准对比"><figcaption>330行标签集的基准对比。每个面板使用各自的垂直刻度；蓝色标记该指标的最佳值。精确率和召回率的误差线显示Gemma和Qwen三次运行的样本标准差。</figcaption></figure>

对于Gemma基准测试，我们使用vLLM部署了`gemma-4-26b-a4b`模型，并启用了该配置下可用的各项优化。其中关键部分是NVFP4量化：在GB10级Blackwell硬件上，这不仅是更小的模型文件，更是一种硬件友好格式，能比Q4\_K\_M等便携式GGUF量化更直接地利用NVIDIA/vLLM执行路径。实际效果是内存流量减少，批处理空间更大。我们还启用了前缀缓存、FP8 KV缓存、CUTLASS MoE后端以及纯语言模型模式。完整330行运行在并发数16下约7.5分钟完成。

## [](#tracking-and-validating-real-time-performance-using-openclaw)使用OpenClaw追踪和验证实时性能

我们之前提到过，不必为每个新Issue或PR都运行本地模型作业，而是可以每隔n小时（例如每2小时）使用OpenClaw中运行的GPT-5.5等SOTA云端模型执行批量作业，以达到相同目的。[\[5\]](#note-5)

这种情况下，我们需要一个ChatGPT Pro订阅计划。由于模型是SOTA级别，即使将2小时内的Issue/PR批量处理，仍可预期其表现合理。

为了评估本地分类器与GPT-5.5的对比效果，我们同时运行两者，并每2小时让GPT-5.5作为假阳性和假阴性的评判者。

为安全起见，我们在沙箱中运行OpenClaw作业，仅允许访问我们报告结果的[公共仓库](https://github.com/osolmaz/onurclaw)。具体做法是：让OpenClaw作业更新一个机器可读文件，然后通过简单脚本读取Codex分配的标签，计算假阳性/假阴性状态。示例输出：

> 假阴性
>
> -   Issue #88499 openai-responses provider: 404 on previous\_response\_id when store=false (default)
>     -   inventory区域: OpenAI-compatible/proxy; notifier主题: agent\_runtime, api\_surface, sessions; 通知: 无
>
> 假阳性
>
> -   PR #88275 fix(models-config): allow self-hosted providers without apiKey in models.json (#88267)
>     -   notifier兴趣: i0; 主题: self\_hosted\_inference, local\_model\_providers, config; 通知: 已发送
> -   PR #88266 refactor: extract model catalog core package
>     -   notifier兴趣: i1; 主题: config, api\_surface, local\_model\_providers; 通知: 已发送
> -   PR #88247 feat: add hosted model providers
>     -   notifier兴趣: i0; 主题: local\_model\_providers, model\_serving, docs, api\_surface; 通知: 已发送

分类方法、编辑机器可读文件、通过脚本获取假阳性和假阴性的说明，均包含在[代理技能](https://github.com/osolmaz/onurclaw/blob/main/.agents/skills/openclaw-onur-inventory/SKILL.md)中，该技能被每2小时运行的[OpenClaw定时任务](https://docs.openclaw.ai/automation/cron-jobs)引用。随后，OpenClaw代理会摄取所有新Issue或PR，将其添加到带有适当标签的JSON文件中，运行脚本，并在同一Discord频道中报告结果。这样，我们每隔几小时就能观察本地模型的性能，并收到遗漏通知。

## [](#conclusion)结论

我们认为，议题/PR分类任务属于更广泛的"高吞吐量分类"任务范畴。本文探讨了在单一领域（即开源贡献）中，使用本地模型实时过滤信息的思路。像`gemma-4-26b-a4b`和`qwen3.6-35b-a3b`这类中等规模的本地模型，无需微调即可实现较高准确率的零样本分类，这使其成为快速原型开发的首选方案，之后再转向更具成本效益的传统分类器模型。

不过，同样的方法也可应用于其他领域：

-   新闻业的新闻分类
-   社交媒体和论坛（如X或Reddit）中感兴趣帖子的筛选
-   客户支持工单的分类处理
-   内容审核申诉的分类处理
-   销售过程中潜在客户的筛选
-   研究过程中arXiv上特定主题的筛选

这个列表还可以继续扩展，但我们认为核心思路已经清晰。

除了分类处理，我们还探索了如何通过运行快速本地模型的智能体框架，以安全方式进行分类。这种方法可称为*智能体分类*：模型并非一次性接收全部信息，而是可以搜索更多上下文后再返回结构化数据。虽然这算不上全新方法，但我们希望这篇博文能为特定的[Pi](https://pi.dev/)+受限shell+`final_json`方案提供良好参考。

## [](#footnotes)脚注

1.  针对本文用例，我们发现以正确理解并标注产品表面的方式拆分PR/议题是一个难题。[返回](#note-1-ref)
2.  虽然我们的测试中并未出现——但模型完全有理由推断下一步需要收集信息并使用外部分类器。智能体方法与传统方法并非互斥。[返回](#note-2-ref)
3.  完整主题列表及其他配置请见[此处](https://github.com/osolmaz/localpager/blob/main/examples/profiles/openclaw-routing-topics.json)。[返回](#note-3-ref)
4.  我们使用了来自[antirez/deepseek-v4-gguf](https://huggingface.co/antirez/deepseek-v4-gguf)的`DeepSeek-V4-Flash-IQ2XXS-w2Q2K-AProjQ8-SExpQ8-OutQ8-chat-v2.gguf`。[返回](#note-4-ref)
5.  虽然我们清楚使用LLM作为评判者会失去"免费"特性，但我们的具体实现出于研究目的这样做。实践中，可以在试用期配合使用更大更贵的模型进行校准，之后系统完全过渡到较小模型。在最近的运行中，此审计循环每2小时检查约消耗4万GPT-5.5总token（主要为缓存上下文），按API定价每次运行约2-3美分，每天12次运行则每月约9美元。这是对所有新项目的一次性批量审计，而非每个项目单独调用；若按项目单独进行，成本可能高出数倍。[返回](#note-5-ref)
