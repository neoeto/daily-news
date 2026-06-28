---
title: Migrating Your GitHub CI to Hugging Face Jobs
url: 'https://huggingface.co/blog/github-ci-hf-jobs'
url_hash: eb987eaf18833b227db4ccfcd6d545cef5b93d9a
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-09T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![阿布巴卡尔·阿比德头像](https://cdn-avatars.huggingface.co/v1/production/uploads/1621947938344-noauth.png)](https://huggingface.co/abidlabs)

如果你的 GitHub 仓库启用了 GitHub Actions，你很可能使用 GitHub 托管的运行器进行 CI。这是许多项目的默认选择，因为操作简单：添加一个工作流，写上 `runs-on: ubuntu-latest`，GitHub 就会为你提供一台机器。

这个默认方案虽然方便，但也有局限性。GitHub Actions 可能运行缓慢或停机维护，托管机器配置通用，而且大多数开源项目无法直接启用 GPU 访问。对于 [Trackio](https://github.com/gradio-app/trackio) 项目来说，这些限制开始变得重要。我们既需要可靠的 CPU CI 来运行基本单元测试和前端检查，也需要 GPU CI 来执行需要在真实 CUDA 硬件上运行的测试。

因此，我们构建了一个替代方案：让 GitHub Actions 继续负责 CI 编排，但将作业运行在 [Hugging Face Jobs](https://huggingface.co/docs/hub/en/jobs-overview) 上。

结果：Trackio 的 CI 现在运行在 Hugging Face Jobs 上，并实时回传日志，**CPU 作业的 CI 时间缩短了约 30%，同时还实现了全新的 GPU 机器测试套件**！

在本文中，我们将逐步说明如何为你的 GitHub 仓库实现相同的配置。如果你使用 AI 代理，可以直接将本文指向它，因为我们同时提供了 CLI 指令和适合人类操作的浏览器操作指南。

让我们先快速了解 Hugging Face Jobs！

## [](#什么是-hugging-face-jobs)什么是 Hugging Face Jobs？

[Hugging Face Jobs](https://huggingface.co/docs/hub/en/jobs-overview) 让你可以在 Hugging Face 的无服务器基础设施上运行命令或脚本，几乎支持任何硬件配置。一个 Job 本质上包含：

-   要运行的命令
-   一个 Docker 镜像（来自 Docker Hub 或 Hugging Face Space）
-   一种硬件配置（如 CPU、`t4-small` 或 `h200` GPU）
-   可选的环境变量和密钥

例如，你可以运行：

```
hf jobs run python:3.12 python -c "print('Hello world')"
```

或者

```
hf jobs uv run --flavor a10g-small "https://raw.githubusercontent.com/huggingface/trl/main/trl/scripts/sft.py"
```

这使得 Jobs 非常适合 CI。CI 作业本身就是命令驱动的，在干净环境中运行，并且通常需要精确选择硬件。对于机器学习库来说，GPU 场景尤其吸引人：你可以在真实 GPU 硬件上运行测试套件，而无需维护自己的常驻运行器。

关键步骤是将 GitHub Actions 连接到 HF Jobs，下面我们将详细介绍。

## [](#架构设计)架构设计

为此，我们创建了 [`huggingface/jobs-actions`](https://github.com/huggingface/jobs-actions)，这是一个小型桥接工具，可以将 GitHub Actions 作业转换为运行在 HF Job 内部的临时自托管运行器。

完整的流程如下所示：

1.  一个拉取请求会触发 GitHub Actions 工作流。
2.  GitHub 会将任何 `runs-on` 标签不可用的任务（例如 `hf-jobs-cpu-upgrade` 或 `hf-jobs-t4-small`）加入队列，并通过 GitHub App 向调度器发送一个签名的 `workflow_job.queued` webhook。
3.  调度器 Space 验证 webhook，检查是否存在 `hf-jobs-*` 标签，生成一个短期的 GitHub 运行器注册令牌，并在匹配的硬件上启动一个 HF Job。
4.  HF Job 启动一个临时的 GitHub Actions 运行器，并使用该一次性令牌将其注册到仓库。
5.  GitHub 将挂起的工作流任务分配给该运行器；运行器执行 CI 任务，将状态报告回 GitHub，然后退出。

从 GitHub 的角度来看，这只是一个自托管的运行器。从 Hugging Face 的角度来看，这只是一个 Job，它启动一个容器来执行仓库 GitHub Actions 中的工作流步骤。

## [](#step-1-duplicate-the-dispatcher-space)步骤 1：复制调度器 Space

首先你需要的是调度器。这是一个小型 Docker Space，用于接收 GitHub `workflow_job` webhook 事件并启动 HF Job 作为响应。

请先创建它，因为 GitHub App 需要一个 webhook URL，而这个 URL 来自该 Space。此 Space 应位于你自己的命名空间下，或位于你拥有写入权限的 Hugging Face 组织下。

#### [](#web-setup)Web 设置

前往 [`huggingface/jobs-actions-dispatcher`](https://huggingface.co/spaces/huggingface/jobs-actions-dispatcher) 并点击 **Duplicate this Space**。

![image](https://github.com/user-attachments/assets/c8b450c3-b801-43dc-97ff-954d9bbaf975)

使用：

```
Owner: 你的 HF 用户或组织
Name: jobs-actions-dispatcher
Hardware: cpu-upgrade
```

对于真实的 CI 环境，请使用 `cpu-upgrade`，以确保调度器能够持续接收 GitHub webhook。`cpu-basic` 适用于测试，通常也能工作，但它可能会在无活动后休眠；如果 GitHub 的 webhook 在其唤醒期间到达，工作流可能会永远保持排队状态。

构建完成后，打开复制的 Space。你会看到一个显示“Required Space secrets”的部分，暂时可以忽略。着陆页应显示下一步所需的 GitHub App webhook URL。它看起来像这样：

```
https://你的-HF-命名空间-jobs-actions-dispatcher.hf.space/webhook
```

#### [](#cli-setup)CLI 设置

如果你更倾向于使用代理或 CLI 工作流来设置调度器 Space：

```
export HF_NAMESPACE=你的-hf-用户或组织
export SPACE_ID="$HF_NAMESPACE/jobs-actions-dispatcher"

hf repo duplicate huggingface/jobs-actions-dispatcher "$SPACE_ID" \
  --type space \
  --flavor cpu-upgrade \
  --exist-ok
```

然后设置：

```
export DISPATCHER_URL="https://${HF_NAMESPACE}-jobs-actions-dispatcher.hf.space"
```

## [](#step-2-create-and-install-the-github-app)步骤 2：创建并安装 GitHub App

接下来，从调度器 Space 本身创建并安装 GitHub App。此 App 需要权限来监听排队的工作流任务并创建临时的自托管运行器注册令牌。

### [](#web-setup-1)Web 设置

打开你复制的调度器 Space：

```
https://你的-HF-命名空间-jobs-actions-dispatcher.hf.space
```

在设置表单中，输入应在 HF Job 上运行 CI 的 GitHub 仓库：

```
你的-GITHUB-组织/你的-REPO
```

然后点击按钮创建 GitHub App。GitHub 会要求你为 App 命名；名称可以是任何内容，只要在你的 GitHub 账户或组织中可用即可。提交后，最终页面会明确告诉你如何使用 `hf` CLI 将 App 凭证上传到调度器 Space。

**重要提示**：你需要提供一个 [Hugging Face 令牌](https://huggingface.co/settings/tokens)，该令牌需具有启动任务的权限，并对应你的个人账户或应计费任务所属的组织。此令牌应作为 `HF_TOKEN` 密钥保存在你的调度器 Space 中。

最后，你需要在 Space 中输入的同一个 GitHub 仓库上安装该 App。在 Trackio 设置中，我们将其安装在 `gradio-app/trackio` 上。

### [](#agent-assisted-setup)代理辅助设置

GitHub App 清单流程仍基于浏览器，但代理可以遵循相同的 Space 驱动路径：

```
export HF_NAMESPACE=your-hf-user-or-org
export GITHUB_REPO=YOUR-GITHUB-ORG/YOUR-REPO
open "https://${HF_NAMESPACE}-jobs-actions-dispatcher.hf.space"
```

将 `$GITHUB_REPO` 粘贴到 Space 中，点击 GitHub App 创建按钮，选择任意可用的 App 名称，然后按照生成的 GitHub 说明操作。

App 创建完成后，在 App 设置页面将其安装到你的仓库。对于 GitHub 组织，安装设置位于：

```
https://github.com/organizations/YOUR-GITHUB-ORG/settings/installations
```

## [](#step-3-final-dispatcher-settings)步骤 3：最终调度器设置

此时，调度器 Space 应已配置完成。GitHub App 设置流程生成了将 App 凭证、Webhook 密钥和 Hugging Face 令牌上传到 Space 的命令。

![图片](https://github.com/user-attachments/assets/0fc8ac73-f93a-419b-bd80-70da2756f50c)

默认情况下，HF 任务会在与调度器 Space 相同的命名空间下启动。如果你希望将任务计费到不同的 Hugging Face 用户或组织，可以选择将 `HF_NAMESPACE` 设置为 Space 变量：

```
export SPACE_ID=YOUR-HF-NAMESPACE/jobs-actions-dispatcher
hf spaces variables add "$SPACE_ID" -e HF_NAMESPACE=your-billing-namespace
hf spaces restart "$SPACE_ID"
```

你在步骤 2 中设置的令牌应与该命名空间对应。

## [](#step-4-change-runs-on)步骤 4：更改 `runs-on`

实际的工作流程改动很小。将：

```
runs-on: ubuntu-latest
```

替换为调度器处理的标签之一：

```
runs-on: hf-jobs-cpu-upgrade
```

对于 GPU 测试，请使用 GPU 标签：

```
runs-on: hf-jobs-t4-small
```

对于任何你想在 HF 任务上运行的 GitHub Action，只需这一行改动即可！

## [](#step-5-test-it-out)步骤 5：测试运行

要从 CLI 添加一个最小的冒烟测试工作流程：

```
mkdir -p .github/workflows
cat > .github/workflows/hf-jobs-test.yml <<'EOF'
name: HF Jobs Test

on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: hf-jobs-cpu-upgrade
    steps:
      - uses: actions/checkout@v4
      - run: echo "Hello from Hugging Face Jobs"
EOF

git add .github/workflows/hf-jobs-test.yml
git commit -m "Run CI on Hugging Face Jobs"
git push
```

要从 CLI 验证：

```
gh run list --repo YOUR-GITHUB-ORG/YOUR-REPO --limit 5
hf jobs ps --namespace "$HF_NAMESPACE"
hf spaces logs "$SPACE_ID"
```

你应该能够看到与常规 GitHub Action 类似的日志——例如，在这个 [Trackio PR #565](https://github.com/gradio-app/trackio/pull/565) 中。

就是这样！

*关于选择正确 Docker 镜像的说明*

我们最初的 CPU 环境使用了 `ubuntu:22.04`，每次运行时都要安装缺失的系统包。虽然能工作，但速度远未达到理想状态。GitHub 的 `ubuntu-latest` 镜像默认包含大量开发者工具；而裸 Ubuntu 镜像则没有。

对于 Trackio 来说，UI 测试需要 Playwright 浏览器、Node、ffmpeg、sqlite、git 以及常规的 Linux 构建依赖。Hugging Face Jobs 支持使用任何 [Docker 镜像](https://huggingface.co/docs/hub/jobs-popular-images)，因此我们切换到了 Microsoft 的 Playwright 镜像，效果很好：

```
mcr.microsoft.com/playwright:v1.60.0-jammy
```

对于 GPU 任务，我们使用了：

```
nvidia/cuda:12.4.0-runtime-ubuntu22.04
```

## [](#results)结果

以下是 Trackio CI 的数据：

| 运行环境 | 运行时间 | 与 GitHub 平均时间对比 |
| --- | --- | --- |
| GitHub `ubuntu-latest` 基准线 | `1分40秒` | 基准线 |
| HF Jobs CPU，Playwright 镜像 | `1分10秒` | `-30秒`，约快 `30%` |
| HF Jobs GPU，`t4-small` 标签 | `45秒` | 无 GitHub 托管 GPU 基准线 |

最大的亮点是 GPU CI。Trackio 的 GPU 检查在 HF Jobs 上运行，耗时 `45秒`，按 `t4-small` 费率计算，成本不到 1 美分。

CPU 结果也令人鼓舞。使用合适的镜像后，Linux 测试任务比 GitHub 托管的基准线更快。这表明 HF Jobs 可以成为实用的 CI 后端，尤其适合需要自定义镜像或加速器的 ML 项目。

日志方面也带来了惊喜。GitHub Actions 日志虽然有用，但 Web UI 在处理大型日志时可能显得笨重。HF Jobs 的日志可以通过 CLI 轻松获取：

```
hf jobs logs <job_id> > logs.txt
```

这使得使用本地工具或编码代理检查日志变得非常方便。在我们的桥接方案中，还将 GitHub Actions 的任务日志同步到了 HF Job 日志中，这样两个系统都拥有足够的信息来调试运行。

最后，虽然 Trackio 的 CI 没有用到，但 HF Jobs 还[支持挂载卷](https://huggingface.co/docs/huggingface_hub/en/guides/jobs#mount-a-volume)，如果你需要在 CI 中快速从 Hugging Face 加载数据集或模型，这会非常有用。

希望这些内容能帮助你尝试使用 HF Jobs 来运行你的 GitHub Actions！
