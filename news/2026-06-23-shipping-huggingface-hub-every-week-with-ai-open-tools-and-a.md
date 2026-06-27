---
title: >-
  Shipping huggingface_hub every week with AI, open tools, and a human in the
  loop
url: 'https://huggingface.co/blog/huggingface-hub-release-ci'
url_hash: 49c160394cb9a2038758c989c6e48c3ea5b8a7f8
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-23T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Lucain Pouget的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/1659336880158-6273f303f6d63a28483fde12.png)](https://huggingface.co/Wauplin)

[![Célina Hanouti的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/6192895f3b8aa351a46fadfd/gsGa2PvHTKAv7MNbyLH8y.jpeg)](https://huggingface.co/celinah)

`huggingface_hub` 是 Hugging Face 生态系统的 Python 客户端基础库。`transformers`、`datasets`、`diffusers`、`sentence-transformers` 以及数十个其他库都依赖它与 Hub 交互。我们每推迟一周发布新版本，就意味着修复和功能更新在 `main` 分支上多滞留一周。

过去很长一段时间，我们每 4 到 6 周发布一次。现在，我们通过一个 GitHub Actions 工作流实现每周发布。我们使用开源工具和开放权重模型构建了这一流程，并在需要判断力的关键环节保留了人工审核。本文所述内容无需供应商合同、封闭模型或任何你无法自行部署的基础设施。这从一开始就是我们的设计目标，因为我们希望其他维护者能够直接采用并适配这一工作流。

读完本文，你将掌握构建类似流程所需的一切。

## [](#where-we-started)起点

旧流程部分自动化，但大部分仍依赖手动操作。

已在 CI 中实现的部分：

-   推送标签后自动发布到 PyPI。
-   在下游库中创建测试分支，并固定候选发布版本。

每次仍需手动操作的部分：

-   创建发布分支，更新 `__init__.py` 中的版本号，提交、打标签、推送。
-   监控下游 CI 运行结果并排查失败原因。
-   逐条审阅上次发布以来合并的所有 PR，手动编写发布说明：按主题分组，附上背景信息，语言风格不能像 `git log` 转储。
-   在候选发布期结束后发布稳定版本。
-   起草内部 Slack 公告和社交媒体帖子。
-   创建发布后 PR，将 `main` 分支版本升级为下一个 `dev0`。

为新版本撰写高质量的说明是最繁重的部分，需要汇总数十个涉及不同主题的 PR。技术上并不困难，但需要几小时的专注投入。再加上各类公告，一次小版本发布往往要花费半天时间，且分散在数天内完成。

## [](#two-kinds-of-work)两类工作

因此，我们决定简化整个流程。审视上述清单，工作可分为两类。

有些步骤纯粹是机械性的，可以自动化：更新版本号、提交、打标签、推送、创建下游测试分支、创建发布后 PR。这些步骤无需思考，只需每次按正确顺序执行——这正是 CI 工作流擅长的。

其余部分则不同。编写发布说明、决定突出哪些内容、为人类读者撰写公告：这是脑力劳动。正是这种判断力让发布流程多年来一直依赖人工。这正是 AI 的用武之地，它能在几秒钟内将空白页面转化为扎实的初稿。但我们也必须谨慎，因为一份看似自信却暗藏错误的草稿，比没有草稿更糟糕。

## [](#the-design-principle-open-parts-reusable-by-anyone)设计原则：开放组件，人人可用

当我们决定修复这个问题时，首先设定了一个约束：每一个可动部件都必须能让任何维护者自行运行。没有隐藏在无法替换的API背后的封闭模型，没有专有的发布平台，也没有秘密配方。

以下是整个技术栈：

第二个原则：模型起草，人类决定。语言模型擅长将三十个简短的PR标题转化为可读的发布说明。但它们并不擅长被盲目信任。因此，工作流程是人工监督的：模型完成初稿，确定性脚本检查其工作，人类在发布前审核并编辑（下文详述）。

## [](#a-tour-of-the-pipeline)流水线概览

完整的工作流程是一个单一文件：[`.github/workflows/release.yml`](https://github.com/huggingface/huggingface_hub/blob/main/.github/workflows/release.yml)，通过Actions UI手动触发。它只接受一个输入：

```
on:
  workflow_dispatch:
    inputs:
      release_type:
        type: choice
        options:
          - minor-prerelease   # 从main分支切出RC版本
          - minor-release      # 将RC版本提升为正式版
          - patch-release      # 在现有发布分支上修复bug
```

从那里开始，任务大致按以下顺序运行：

-   **准备。** 计算下一个版本号，创建或复用发布分支，更新`__version__`，提交，打标签，推送。
-   **发布到PyPI。** 构建并上传`huggingface_hub`。同时，构建并上传`hf` CLI作为独立的PyPI包。
-   **发布说明。** 对比自上一个标签以来的提交范围，从GitHub API拉取PR元数据，让模型起草结构化的变更日志（[这里有一个最近的例子](https://github.com/huggingface/huggingface_hub/releases/tag/v1.20.0)）。保存为*草稿*版GitHub发布。
-   **下游测试分支。** 对于RC版本，在`transformers`、`datasets`、`diffusers`、`sentence-transformers`中打开一个分支，固定RC版本，以便它们的CI能快速告诉我们是否破坏了什么。
-   **Slack通知。** 读取发布说明，以我们团队的风格生成内部通知。
-   **归档发布说明。** 将原始的AI草稿和人工编辑后的版本并排上传到Hugging Face Bucket。
-   **发布后版本更新。** 在稳定版发布后，在`main`分支上打开一个PR，将版本更新到下一个`dev0`。
-   **评论已发布的PR。** 在发布中包含的每个PR上留下“此功能已在vX.Y.Z中发布”的评论。
-   **同步CLI文档。** 在我们的[skills](https://github.com/huggingface/skills)仓库中打开一个PR，更新重新生成的`hf` CLI技能文档。
-   **向Slack报告。** 每个步骤都会以线程回复的形式发布其状态；最后一个任务会用✅或❌更新根消息。

剩下的人工步骤是审核并发布草稿版的发布说明，以及审核并发布内部Slack消息。这两个步骤正是我们希望有人类参与的地方。

## [](#trust-but-verify-the-human-in-the-loop-core)信任但验证：人工审核的核心

以下是每个人对AI生成的发布说明最担心的失败模式：模型悄悄遗漏了一个PR，或者凭空捏造了一个不属于本次发布的PR。一份几乎正确的变更日志比没有变更日志更糟糕，因为没有人会重新检查它。

我们不信任生成的发布说明在第一次尝试时就完整无缺，而是以确定性的方式验证它。在模型运行之前，一个 Python 脚本会检索属于该发布版本的所有 PR，并将其存储为基准真相。

```
# 确定性：从范围内的压缩合并提交中提取 PR 编号。
PR_NUMBER_PATTERN = re.compile(r"\(#(\d+)\)$")

pr_numbers = [
    int(m.group(1))
    for commit in commits_since_last_tag
    if (m := PR_NUMBER_PATTERN.search(commit.title))
]
save_manifest(pr_numbers)  # 真相来源
```

然后模型根据这些 PR 起草发布说明。完成后，我们将其输出与初始 PR 列表进行核对：

```
expected = set(load_manifest())          # 应该包含的内容
found    = extract_pr_refs(notes_md)     # 模型写的内容（#1234 -> 1234）

missing = expected - found               # 被静默遗漏的
extra   = found - expected               # 属于其他发布版本的
```

如果有任何遗漏或多余的内容，我们不会失败，也不会发布错误的文件。我们会将差异反馈给代理，并要求它精确修复这些 PR：

```
for _ in range(MAX_ITERATIONS):
    missing, extra = validate(notes)
    if not missing and not extra:
        break  # 与清单完全匹配
    run_agent_fix(missing_prs=missing, extra_prs=extra)
```

这就是让整个过程值得信赖的模式：一个非确定性模型被包裹在确定性护栏中。模型擅长撰写文字，但在全面性上不可靠。所以我们让它写，让代码来强制执行一致性。

## [](#grounding-the-model-so-it-doesnt-make-things-up)约束模型，防止其编造内容

完整性是一方面，准确性是另一方面。仅凭标题来总结 PR 的模型会愉快地编造出与实际 API 不符的代码示例。

为了防止这种情况，我们在获取 PR 元数据时，还会拉取每个 PR 中的实际文档差异：PR 修改过的 `docs/` 下所有 `.md` 文件的统一差异。

```
def fetch_doc_diffs(pr):
    return [
        {"filename": f.filename, "status": f.status, "patch": f.patch}
        for f in pr.get_files()
        if f.filename.startswith("docs/") and f.filename.endswith(".md") and f.patch
    ]
```

这个差异会进入模型的上下文，这样当它写“这是新的 CLI 命令”时，它引用的是 PR 作者在文档中实际编写的示例。这与之前的逻辑相同：给模型真实的源材料和狭窄的任务。

提示本身作为 [Skills](https://github.com/huggingface/huggingface_hub/tree/main/.opencode/skills/hf-release-notes) 存在：存放在仓库中的小型 Markdown 文件（`SKILL.md` 加上参考模板）。发布说明技能详细说明了如何挑选亮点、如何组织章节、何时添加文档链接等。它读起来像入职指南，而这正是正确的思维模型。

## [](#the-human-checkpoint)人工检查点

RC 发布后，草稿 GitHub 发布页面会保留 AI 的初稿。这时人工介入：

1.  审阅者阅读草稿，调整语气和重点，修正模型过度或不足强调的内容。
2.  只有在此之后，他们才会触发 `minor-release` 运行，将 RC 提升为最终版本。

审阅者的时间用于润色，将半天的写作工作变成十五分钟的编辑会话。

我们还保留纸质记录以便持续改进。我们将两个文件并排归档到 Hugging Face 存储桶中：原始 AI 草稿（在 RC 时间点、任何人接触之前上传）和人工编辑版本（在最终发布版本切割时上传）。

```
# 在 RC 时间点：直接从模型输出，未经修改
hf cp release_notes_raw.txt    "hf://buckets/huggingface/releases/huggingface_hub/${V}/release_notes_raw.txt"

# 在发布时：经过人工审核后
hf cp release_notes_edited.txt "hf://buckets/huggingface/releases/huggingface_hub/${V}/release_notes_edited.txt"
```

每周收集这两份文件，我们就能积累一个不断增长的“模型写了什么”与“我们希望它写什么”的数据集。这个数据集随后可用于更新智能体的技能。

## [](#open-and-secure-plumbing)开放且安全的管道

重新设计发布流程是一个加强安全性的好机会，尤其是在防范供应链攻击方面。

**无 PyPI 令牌。** 发布采用[可信发布](https://docs.pypi.org/trusted-publishers/)：PyPI 验证由 GitHub 为此特定工作流生成的短期 OIDC 令牌，并为每个工件签发 [PEP 740](https://peps.python.org/pep-0740/) 证明 / Sigstore 出处信息。没有长期存在的秘密需要泄露或轮换。

```
permissions:
  id-token: write       # 为 PyPI 生成 OIDC 令牌
  attestations: write   # 生成 Sigstore 出处信息
# ...
- uses: pypa/gh-action-pypi-publish@v1.14.0
  with:
    attestations: true  # 无需密码，无需 API 令牌，仅需 OIDC
```

**智能体运行时被锁定并经过验证。** 我们不会直接 `curl | bash` 最新版 OpenCode 然后碰运气。我们会锁定一个版本，并在运行前检查其 SHA256：

```
curl -fsSL https://opencode.ai/install | bash -s -- --version "${OPENCODE_VERSION}"
echo "${OPENCODE_SHA256}  $(which opencode)" | sha256sum -c -
```

开放工具并不意味着粗心大意的工具。

## [](#so-what-did-it-cost)那么，成本是多少？

几乎为零。一次完整的发布（包括发布说明和 Slack 公告，涉及 20-40 个 PR 和几轮提示）在推理提供商上的成本大约为 **0.25 美元**。采用按需付费的开放权重模型，每周唯一真正的问题是“是否有值得发布的内容？”，而答案总是肯定的。

## [](#what-changed-in-practice)实际发生了什么变化

发布节奏从每 4 到 6 周一次变为每周一次。次要影响才是真正有趣的：

-   **发布说明质量提升而非下降。** 初稿始终存在，因此审核时间用于打磨。分组更一致，遗漏的内容也更少。
-   **问题更早暴露。** 每个 RC 上的下游测试分支在候选窗口期间就能捕获集成问题。
-   **贡献者反馈周期缩短。** 自动生成的“已在 vX.Y.Z 中发布”评论的重要性超出了我们的预期。当有人在已关闭的 PR 上报告问题时，每个人都能立即看到修复所在的版本。过去这需要手动查找标签。

## [](#make-it-yours)打造你自己的版本

这是最核心的部分。该工作流是围绕 `huggingface_hub` 设计的，但其结构是通用的。

**几乎可直接复用：**

-   触发器和版本号递增逻辑（`minor-prerelease` 然后 `minor-release` 然后 `patch-release`）。
-   信任但验证的循环：确定性清单、模型草稿、验证、重新提示。这是可迁移的核心思想，与您生成的内容无关。
-   OIDC 可信发布、锁定并经过校验和验证的运行时、Slack 线程化。
-   基于技能的提示：替换模板，保留结构。

**特定于我们的部分：**

-   下游仓库列表及其依赖锁定格式。
-   技能文档中精确的章节分类与语气风格。
-   Slack 频道和存储桶目标地址。

如需适配，请复刻[工作流文件](https://github.com/huggingface/huggingface_hub/blob/main/.github/workflows/release.yml)和[脚本](https://github.com/huggingface/huggingface_hub/tree/main/utils/release_notes)，将其指向您的软件包，重写[技能 Markdown 文件](https://github.com/huggingface/huggingface_hub/blob/main/.opencode/skills/hf-release-notes/SKILL.md)以匹配项目风格，设置两个仓库变量（模型 ID 和 OpenCode 版本），在 PyPI 上配置可信发布，若没有下游依赖则可删除下游测试任务。其中"信任但验证"循环是最值得原样复用的部分，它能确保生成的产物安全发布。

## [](#whats-next)后续计划

-   **自动分类下游故障。** 当前工作流会创建测试分支并由人工查看 CI 结果。下一步显然应检查失败日志，在内部 Slack 消息中报告问题。
-   **扩展应用模式。** 这套方案大部分具有通用性。我们预计会在生态系统中其他 Python 库中大量复用。

## [](#takeaway)核心启示

发布流程中原本需要人类专注工作半天才能完成的部分（编写发布说明、起草公告、协调下游检查），正是模型擅长的草拟工作。其余环节都是机械性的，只需一个 YAML 文件即可完成。关键从来不是"让 AI 全权负责"，而是让模型起草、让确定性代码验证、让人做最终决策。这套方案完全基于开源工具和开放权重构建，成本趋近于零，任何人都能运行。

完整的工作流文件已公开。如果您维护 Python 库，请[复刻它](https://github.com/huggingface/huggingface_hub/blob/main/.github/workflows/release.yml)进行适配，并告诉我们效果如何！
