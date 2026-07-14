---
title: From Hugging Face to Amazon SageMaker Studio in one click
url: 'https://huggingface.co/blog/amazon/one-click-to-sagemaker-studio'
url_hash: ca9a2a21da074b1826986835c8247c4c7ed792ab
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-07T21:15:33.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

今天，我们激动地宣布 [Hugging Face](https://huggingface.co/) 与 [Amazon SageMaker AI](https://aws.amazon.com/sagemaker/ai/studio/) 之间实现了深度链接集成。开发者现在只需一次选择，即可从模型发现无缝进入 SageMaker Studio 进行动手实验。无论是微调 [Amazon SageMaker JumpStart](https://aws.amazon.com/sagemaker/ai/jumpstart/) 的基础模型 (FM)，还是将其部署到 [Amazon SageMaker Inference](https://aws.amazon.com/sagemaker/ai/deploy/) 端点，您都可以直接进入相应的 SageMaker Studio 工作流。所选模型已预加载，环境已完全配置，随时可用。

此前，在 Hugging Face 上发现模型后，要在 SageMaker Studio 中开始使用，需要经过多个步骤：在 AWS 控制台中打开 Amazon SageMaker AI、创建域、配置 IAM 权限，有时还需要申请 GPU 配额。对于希望快速迭代的开发者来说，这种摩擦拖慢了从灵感迸发到实验验证的进程。此次集成开辟了一条从模型发现到企业部署的更直接路径。

> *“在 Arcee，我们构建开放模型，让开发者和企业能够真正拥有他们运行的内容：检查权重、用自己的数据进行后训练、按自己的方式部署。这次集成将这一承诺落实到了最后一公里。从 Hugging Face 上的开放模型一键直达 SageMaker Studio，然后在您自己的 AWS 环境中进行微调或部署，无需任何额外配置——这正是开放模型一直缺失的体验。您拥有的开放权重，在您控制的云中运行。这正是我们的客户一直要求的组合。”*

—— Mark McQuade，Arcee AI 创始人兼首席执行官

随着一键式 Studio 着陆体验的推出，在支持的 Hugging Face 模型页面上选择 *在 SageMaker AI 上自定义* 或 *在 SageMaker AI 上部署*，即可直接进入控制台。SageMaker AI 随后会在几秒钟内自动配置一个具有预置权限的新域，并携带模型上下文信息。

## [](#whats-new)新特性

本次发布引入了三项能力，缩短了从 Hugging Face 模型到可运行的 SageMaker Studio 工作流的路径。

### [](#deep-links-from-hugging-face-into-sagemaker-studio)从 Hugging Face 到 SageMaker Studio 的深度链接

当您在 Hugging Face 上浏览模型时，您会在支持的模型旁边看到直接映射到 SageMaker Studio 工作流的操作按钮：

-   **在 SageMaker AI 上自定义**：打开 Studio 中的模型自定义页面，所选模型已预加载，随时可进行微调。
-   **在 SageMaker AI 上部署**：打开 Studio 中的部署页面，模型已预配置好端点部署。

每个入口点都保留了上下文，这意味着您进入 Studio 后无需再次搜索模型。

### [](#pre-configured-permissions)预配置权限

通过此流程创建的新 Studio 环境已预先配置好 SageMaker AI 全部功能的权限，包括模型定制、训练任务、Notebook 实验和端点部署。系统会为您创建并附加一项新的托管策略 [AmazonSageMakerModelCustomizationCoreAccess](https://aws.amazon.com/about-aws/whats-new/2026/01/quick-setup-model-customization-sagemaker-studio/)。该策略提供使用监督微调 (SFT)、直接偏好优化 (DPO)、可验证奖励强化学习 (RLVR) 和 AI 反馈强化学习 (RLAIF) 进行无服务器模型定制任务的权限，并支持部署到 SageMaker AI 或 Amazon Bedrock 端点。这免去了您在开始实验前手动创建和配置 AWS Identity and Access Management (IAM) 角色和策略的麻烦。对于现有的 Studio 环境，可操作的消息会附带直接指向文档的链接，指导您添加这些权限。

### [](#gpu-quota-visibility)GPU 配额可见性

在选择用于部署或训练的实例类型时，Studio UI 现在会直接在实例选择列表中显示配额可用性。您可以立即看到在当前账户限制下哪些 GPU 实例类型（G5、G6）可用。您无需单独导航到 Service Quotas。如果您仍需要请求增加限额，系统会直接重定向到相应实例类型的 Service Quotas 页面。

## [](#walkthrough-deep-linking-from-hugging-face-to-sagemaker-studio)演练：从 Hugging Face 深度链接到 SageMaker Studio

让我们演练一下从 Hugging Face 开始定制或部署模型的体验。

### [](#step-1-discover-and-select)步骤 1：发现并选择

在 Hugging Face 模型页面上，点击“部署”并选择“Amazon SageMaker AI”。如果模型受支持，您将看到两个按钮：“在 SageMaker AI 上部署”和“在 SageMaker AI 上定制”。然后为受支持的模型选择“在 SageMaker AI 上定制”。

[![Hugging Face 模型页面，显示受支持模型的“在 SageMaker AI 上定制”按钮](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/07/06/ML-21254-1.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/07/06/ML-21254-1.png)

### [](#step-2-sign-in)步骤 2：登录

系统会提示您使用现有凭证登录 AWS。如果您已有活跃的控制台会话，此步骤将自动跳过。有关更多信息，请参阅[登录 AWS 管理控制台](https://docs.aws.amazon.com/signin/latest/userguide/how-to-sign-in.html)。

### [](#step-3-land-in-studio)步骤 3：进入 Studio

您将直接进入 SageMaker Studio 内的模型定制页面，并且您的模型已预先选定。接下来，配置您的微调参数，例如训练数据、超参数和实例类型，然后提交定制任务。

[![SageMaker Studio 模型定制页面，已预加载所选模型，并可配置微调参数](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/07/06/ML-21254-2.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/07/06/ML-21254-2.png)

或者，选择**在 SageMaker AI 上部署**会打开 Studio 中的端点部署页面，并且模型已预先配置好。选择您的实例类型（包含配额可见性），查看设置，然后进行部署。

[![SageMaker Studio 端点部署页面，模型已预先配置，实例类型选择显示配额可见性](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/07/06/ML-21254-3.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/07/06/ML-21254-3.png)

### [](#step-4-test-your-endpoint)步骤 4：测试您的端点

部署端点后，直接从 Studio 的端点[测试界面](https://docs.aws.amazon.com/sagemaker/latest/dg/manage-endpoints-studio-test.html)测试推理。

## [](#getting-started)入门

您可以立即尝试此体验：

1.  浏览 Hugging Face 上的模型。
2.  在受支持的模型上查找**在 SageMaker AI 上定制**或**在 SageMaker AI 上部署**按钮。
3.  选择并遵循简化的登录流程。
4.  在完全配置好的 SageMaker Studio 环境中开始构建。

## [](#conclusion)结论

一键启动Studio落地体验，极大降低了从发现模型到尝试使用之间的摩擦。通过将Hugging Face直接连接到SageMaker Studio工作流，开发者可以保持工作流畅，无需切换上下文、手动配置环境或排查权限问题。

要开始使用，请访问 [Amazon SageMaker Studio](https://aws.amazon.com/sagemaker/ai/studio/) 页面，或在Hugging Face上探索模型，并选择在SageMaker AI上部署或定制。
