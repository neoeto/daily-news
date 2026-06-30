---
title: 'ScarfBench: Benchmarking AI Agents for Enterprise Java Framework Migration'
url: 'https://huggingface.co/blog/ibm-research/scarfbench'
url_hash: 8654826289ec75765d33aa78a628bcae9814015f
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-30T18:32:50.000Z
lang: zh
translated: true
tags:
  - AI
  - Java
  - 企业应用
  - 框架迁移
  - 基准测试
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[在 GitHub 上关注 ScarfBench](https://github.com/scarfbench/benchmark)

企业应用现代化是组织承担的最大、最昂贵的软件工程活动之一。团队在不同框架间迁移应用，以提高可维护性、云就绪性、开发者生产力，并获取现代能力。

编码智能体的最新进展引发了人们对 AI 辅助现代化的兴奋。但一个重要问题仍然存在：

**AI 智能体能否可靠地实现真实世界企业应用的现代化？**

现有的软件工程基准测试在错误修复和代码生成方面展现了令人印象深刻的进展，但框架迁移提出了一个根本不同的挑战。成功不仅需要翻译代码，还需要保持行为、适配构建系统以及处理运行时依赖。

为填补这一空白，我们推出了 **ScarfBench（自包含应用重构基准测试）**，这是一个用于评估 AI 智能体在企业 Java 跨框架迁移任务中表现的开放基准测试。

ScarfBench 专注于三大 Java 生态系统间的迁移：

-   Spring
-   Jakarta EE
-   Quarkus

与将生成代码与参考实现进行比较的传统基准测试不同，ScarfBench 评估迁移后的应用是否真正能够构建、部署并保持行为。

## [](#为什么迁移困难)为什么迁移困难

框架迁移远不止替换注解那么简单。

一个简单的仓库迁移可能需要更改依赖注入、持久化配置、查询和框架描述符。其中任何部分的微小错误都可能导致部署失败。

[![scarf-intro-anatomy](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/3LDxVMx4nf_WEqEN2AQ7W.png)](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/3LDxVMx4nf_WEqEN2AQ7W.png)

**图：Spring → Jakarta 迁移示例**

框架迁移需要翻译框架语义，而不仅仅是源代码。

## [](#scarfbench-简介)ScarfBench 简介

[ScarfBench](https://huggingface.co/spaces/ibm-research/ScarfBench) 提供了一种系统化的方法，用于评估 AI 智能体在企业 Java 框架迁移任务中的表现。

应用需要满足以下要求：

1.  成功构建。
2.  正确部署。
3.  通过行为验证。

这为现代化质量提供了更真实的衡量标准。

## 基准测试概览

| 指标 | 数值 |
| --- | --- |
| 应用数量 | 34 |
| 框架实现数量 | 102 |
| 迁移任务数量 | 204 |
| 代码行数 | ~151K |
| 源文件和测试文件 | ~2,000 |
| 专家编写的测试用例 | 1,331 |

ScarfBench 包含聚焦的迁移任务和完整应用迁移。

[![scarf-intro-fig](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/5njqb4qTj7sfutgRJ7QrF.png)](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/5njqb4qTj7sfutgRJ7QrF.png)

**图：ScarfBench 构建流程**

从基于 JSR 的企业 Java 分类法出发，专家迁移创建了跨 Spring、Jakarta EE 和 Quarkus 的已验证实现。

## [](#前沿智能体表现如何)前沿智能体表现如何？

我们在 ScarfBench 上评估了几种最先进的编码智能体。

尽管在传统软件工程基准测试中表现强劲，但框架迁移仍然困难。不同框架对之间的成功率差异显著，而完整应用迁移尤其具有挑战性。

[![leaderboard](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/MrcQ5trSi8oKtfD2UEhm9.png)](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/MrcQ5trSi8oKtfD2UEhm9.png)

**图：当前排行榜**

即使是最强大的现有智能体，其行为成功率也低于 10%，这说明了生成可编译代码与保持应用行为之间的差距。

[![scarf\_aggregate\_progression](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/j7rihRrFe-Eo9oSxNFQS1.png)](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/j7rihRrFe-Eo9oSxNFQS1.png)

**图：编译 → 部署 → 测试进展**

编译成功率始终高于部署成功率，而部署成功率又高于行为成功率。仅凭构建成功会显著高估迁移质量。

[![sankey](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/mQhC1EtAb5dx2Q8d5nqmL.png)](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/mQhC1EtAb5dx2Q8d5nqmL.png)

**图：按目标框架划分的迁移结果**

迁移难度强烈依赖于目标框架，其中 Jakarta EE 尤其具有挑战性。

## [](#关于-java-现代化-ai-智能体的发现)关于 Java 现代化 AI 智能体的发现

除了衡量成功率，ScarfBench 还帮助我们理解智能体在现代化过程中的行为。

### [](#智能体能否可靠判断迁移是否完成)智能体能否可靠判断迁移是否完成？

迁移后的应用程序只有在能够实际构建和运行时才有用。

因此，我们将代理报告的结果与独立的构建验证进行了对比。

#### [](#finding-agents-are-overconfident)发现：代理过于自信

Claude Code 报告称，30 个完整应用程序中有 29 个构建成功。

但实际上只有 22 个应用程序成功构建。

与此同时，被代理归类为失败的单个应用程序最终却正确构建。

这表明，不应将代理的自我评估视为迁移完成的可靠信号。

独立的构建和测试验证仍然至关重要。

### [](#how-do-agents-navigate-application-dependencies)代理如何处理应用程序依赖关系？

框架迁移很少只影响单个文件或层。

配置、服务、数据库和 Web 组件的变更通常会级联影响整个应用程序。

#### [](#finding-migration-is-iterative-rather-than-linear)发现：迁移是迭代而非线性的

最常被访问的层包括：

-   配置
-   Web
-   数据库
-   服务

常见的转换包括：

-   配置 ↔ Web
-   服务 ↔ 数据库

这表明，迁移是一个迭代的依赖关系解析过程，而非简单的源到源转换。

### [](#where-do-agents-spend-most-of-their-effort)代理将大部分精力花在哪里？

我们使用层重新访问频率作为迁移工作量的代理指标。需要反复访问的层通常涉及调试、依赖关系解析或框架适配。

#### [](#finding-configuration-dominates-migration-effort)发现：配置主导迁移工作量

代理并非线性推进，而是在解决框架差异和依赖关系问题时，反复回到与配置相关的工件。

### [](#what-challenges-are-not-about-code-transformation)哪些挑战与代码转换无关？

并非所有迁移问题都源于源代码。

#### [](#finding-environment-and-tooling-matter)发现：环境和工具很重要

代理经常与环境问题作斗争，包括：

-   Docker 缓存不一致
-   端口连接问题
-   Maven 包装器和构建工具问题

即使源代码迁移本身基本完成，这些操作性问题也常常延迟验证。

[![failure-distribution](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/BtWLPGsif0O4VoQfVppIC.png)](https://cdn-uploads.huggingface.co/production/uploads/649c1276a83f996b4191a8f1/BtWLPGsif0O4VoQfVppIC.png)

**图：失败模式分布**

现代化失败涉及构建系统、部署环境、依赖注入、数据库、端点、断言和基础设施。

## [](#key-takeaway)关键要点

框架现代化中最大的挑战不是翻译 Java 代码。

而是管理跨配置、基础设施和运行时环境的依赖关系网络。

虽然前沿代理可以自动化迁移过程的很大一部分，但可靠的验证和架构推理对于实现成功结果仍然至关重要。

ScarfBench 有助于揭示这些挑战，并提供了一种标准化的方式来衡量实现真正自主应用程序现代化的进展。

## [](#explore-scarfbench)探索 ScarfBench

ScarfBench 被设计为面向研究人员和从业者的开放资源。

资源包括：

-   基准数据集
-   评估基础设施
-   公开排行榜
-   文档
-   开源代码

研究人员可以比较代理架构和技术。从业者可以在将现代化解决方案部署到生产环境之前，使用 ScarfBench 对其进行评估。

### [](#website)网站

[https://scarfbench.info](https://scarfbench.info/)

### [](#dataset)数据集

[https://huggingface.co/datasets/ibm-research/ScarfBench](https://huggingface.co/datasets/ibm-research/ScarfBench)

### [](#space)空间

[https://huggingface.co/spaces/ibm-research/ScarfBench](https://huggingface.co/spaces/ibm-research/ScarfBench)

### [](#github-repository)GitHub 仓库

[https://github.com/scarfbench/scarfbench](https://github.com/scarfbench/scarfbench)

### [](#leaderboard)排行榜

[https://scarfbench.info/leaderboard](https://scarfbench.info/leaderboard)

### [](#paper)论文

[https://arxiv.org/abs/2605.06754](https://arxiv.org/abs/2605.06754)

框架迁移仍然是 AI 辅助软件工程中最大的未解决问题之一。我们希望 ScarfBench 能帮助社区衡量进展，并加速下一代 AI 辅助应用程序现代化的发展。

我们邀请研究人员、从业者和框架社区评估他们的代理，贡献新的迁移场景，并帮助推动技术前沿。
