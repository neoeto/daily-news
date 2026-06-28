---
title: The Open Source Community is backing OpenEnv for Agentic RL
url: 'https://huggingface.co/blog/openenv-agentic-rl'
url_hash: fbaf22fcf62fc4433bc8ccbd71931405ebeb66e3
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-08T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 开源
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![博客文章缩略图](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/openenv-expansion/banner.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/openenv-expansion/banner.png)

OpenEnv 是一款用于创建智能体执行环境的工具，例如终端、浏览器或任何智能体可以交互的环境。今天，我们激动地宣布 OpenEnv 将变得更加开放，以推动智能体训练的未来走向开源。

从今天起，OpenEnv 将由一个委员会协调，目前成员包括 Meta-PyTorch、Reflection、Unsloth、Modal、Prime Intellect、Nvidia、Mercor、Fleet AI、Microsoft 和 Hugging Face。`OpenEnv` 现已托管于 [`huggingface/OpenEnv`](https://github.com/huggingface/OpenEnv)。

OpenEnv 项目得到了 AI 生态系统中一些领先组织的支持与采用，包括 PyTorch 基金会、vLLM、SkyRL（加州大学伯克利分校）、Lightning AI、Axolotl AI、斯坦福扩展智能实验室、Mithril、OpenMined、Scaler AI Labs、Scale AI、Patronus AI、Surge AI、Halluminate、Turing、Scorecard 和 Snorkel AI。

## [](#why-we-need-openenv-to-train-open-source-agents)为何需要 OpenEnv 来训练开源智能体

像 Claude Code、Codex、OpenClaw 和 Hermes 这样的智能体工具链正在不断进步。它们进步的一个原因是，GPT-5.5 和 Opus 4.8 等模型经过训练，能够有效使用各自的工具链。

我们也希望开源模型能获得同样的提升：训练本地模型以高效使用工具链，并通过针对特定任务进行模型特化来节省计算资源。

## [](#why-we-need-to-be-even-more-open)为何需要（更加）开放

前沿实验室训练的模型和工具链，在很大程度上是紧密配合的。模型经过训练以使用工具链，并针对其特性进行了优化。模型可以在一定程度上泛化到其他工具链，但没有什么能比得上针对性训练的效率。

[![开源强化学习生态系统](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/openenv-expansion/diagram.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/openenv-expansion/diagram.png)

在开源领域，情况并非如此。开发者可以根据自己重视的用例，自由选择任何工具链、任何模型、任何推理引擎。这是社区的根本，但也是一个需要基础设施和工具来应对的挑战。

这正是 OpenEnv 的用武之地。它是一个连接工具链、环境和训练器的库，适用于任何模型。为了使其持久发展，它需要由所有主要利益相关方共同拥有。

## [](#a-protocol-layer-not-a-reward-framework)协议层，而非奖励框架

伴随治理结构的调整，我们也在明确 OpenEnv 的定位。

在最近的版本中，OpenEnv 已成为 **RL 环境的互操作层**。它的职责是标准化环境的发布、部署以及被智能体使用的方式。它不会规定奖励如何定义或训练循环如何运行。奖励定义、评分规则和训练器特定逻辑应归属于专门处理这些功能的库。OpenEnv 是它们都能接入的通用接口。

在实践中，这意味着：

一个统一的接口，多种环境，所有这些环境都暴露了熟悉的 Gymnasium 风格 API（`reset()`、`step()`、`state()`），并运行在客户端/服务器架构上。任何支持 OpenEnv 的训练器都可以驱动任何兼容的环境，而无需编写定制代码。

熟悉的协议和规范的打包方式。环境通过 HTTP 和 WebSocket 等标准协议提供服务，并使用 Docker 打包。MCP 是一等公民，因此 OpenEnv 环境可以立即与 MCP 服务器兼容，并且同一环境在模拟（训练/评估）和生产模式下表现一致。

跨环境库的互操作性。您可以在不同生态系统（验证器、harbor等）中定义和使用环境，并选择您自己的基础设施和中心。OpenEnv是它们底层的部署与接口层，而非竞争对手。

## [](#whats-next)下一步计划

未来几个月，我们将专注于将OpenEnv从快速发展的项目转变为可靠标准的关键事项：

1.  **外部奖励**：允许在您已使用的任何库中定义奖励，以OpenEnv作为部署层（[RFC 006](https://github.com/huggingface/OpenEnv/pull/794)）。
2.  **基于数据集的任务集**：将环境任务与Hugging Face数据集连接，使环境和基准测试能够清晰组合（[RFC 007](https://github.com/huggingface/OpenEnv/pull/795)）。
3.  **持续Harness集成**：为智能体化测试框架提供一级支持。
4.  **端到端示例**：在TRL、Unsloth等框架中提供完整的训练与评估教程。
5.  **自动验证**：衡量环境质量及其对模型学习的贡献。这将为社区提供可扩展的环境评估方式，推动质量提升（想想黑客马拉松！）。[RFC 008](https://github.com/huggingface/OpenEnv/issues/778)。

## [](#get-involved)参与贡献

OpenEnv以社区为核心设计理念，目前仍处于早期阶段——难免存在不完善之处，期待您帮助我们打磨优化。查看代码和RFC：[github.com/huggingface/OpenEnv](https://github.com/huggingface/OpenEnv)

感谢所有推动这一转变的贡献者。让我们共同构建开源智能体强化学习的通用基础层。
