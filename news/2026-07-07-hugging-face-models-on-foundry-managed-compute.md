---
title: Hugging Face Models on Foundry Managed Compute
url: 'https://huggingface.co/blog/microsoft/foundry-managed-compute'
url_hash: 024a3808c07a0ff4537346298fcc49e95cd7b82c
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-07T15:20:06.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Manoj Bableshwar 的头像](https://huggingface.co/avatars/421af1377c858f6137b6ad9089fc624c.svg)](https://huggingface.co/manojsb)

[![Osi 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/Fo0ehdRXafrOg0jqWuCaw.png)](https://huggingface.co/ositanachi)

在 Microsoft Build 2026 上，我们宣布了 **Foundry 托管计算** 和 **Foundry 上的 Hugging Face 模型**——这是一个来自 Hugging Face 生态系统的精选开放权重模型目录，每周刷新，可一键部署到 Foundry 托管计算上。权重已预置于 Azure，运行时由 Microsoft 构建和扫描，集合中的每个模型都享有与 Foundry 上其他模型相同的企业级安全、治理、可观测性和计费功能。

## [](#平台-microsoft-foundry-与托管计算)平台：Microsoft Foundry 与托管计算

Microsoft Foundry 是一个用于构建和运行智能体 AI 应用的平台。Foundry 从任何云上最广泛的模型选择开始——来自 Microsoft、OpenAI、Anthropic、Meta、Mistral、DeepSeek、Hugging Face 等机构的模型，涵盖前沿、开源和自定义权重——所有这些模型均可通过单一端点和一套统一的 SDK（支持 Python、C#、JavaScript 和 Java）访问。

在这些模型之上，是 **Foundry 智能体服务**：多智能体编排，内置记忆功能，通过 Foundry IQ 实现知识基础，以及通过智能体协议连接的工具目录，使智能体能够处理企业数据。智能体运行后，Foundry 提供端到端追踪、实时监控、持续评估，以及一个基于评估结果改进智能体行为的提示优化器——这些可观测性和质量循环是平台的一部分。

此外，开发者还可获得：

-   内容安全过滤器
-   任务遵循护栏
-   用于对抗性测试的 AI 红队智能体
-   统一 RBAC
-   私有网络
-   平台内直接集成的 Azure Policy

除了按 token 付费（入门门槛最低的方式）和预配吞吐量（在前沿模型上实现可预测、高性能的生产工作负载）之外，**Foundry 托管计算** 是 Foundry 中的第三个部署选项：一个面向开源和自定义模型的托管 GPU 平台即服务。

你根据工作负载的关键要素——参数量、上下文长度，以及是否优化延迟或吞吐量——来部署一个模型实例，Foundry 会处理底层的 GPU 拓扑结构，无论实例落在单个还是多个加速器上，让你以模型术语进行思考和规划。

Microsoft 负责机器维护：容器更新、运行时升级和安全补丁会在支持的运行时上自动进行——**vLLM、SGLang、TensorRT-LLM、NIM、TEI、llama.cpp**——无需重新部署模型，而模型配置、部署行为和路由仍由你掌控。

这种一致性贯穿开发者界面——按 token 付费、预配吞吐量和托管计算共享：

-   单一端点
-   相同的 SDK
-   相同的身份验证
-   相同的可观测性
-   单一账单

开源模型与 Foundry 智能体的集成方式与前沿模型相同，因此你可以在单个智能体中混合使用不同类型的模型，无需单独的集成路径。

托管计算提供：

-   **全球部署**——最广泛的容量和最优定价
-   **数据区域部署**——数据驻留和主权

相同的代码，相同的工作流程。配额与加速器系列对齐，因此基于 H100 系列构建的计划会随着新硬件世代的推出而延续。

## [](#为什么选择-hugging-face)为什么选择 Hugging Face

Hugging Face 是开放 AI 的公共广场：**1500 万开发者、40 万个组织、超过 300 万个已发布的开源模型**，每周都有新的前沿能力落地——智能体编程、视频分割、语音、嵌入等。它是开源模型的 GitHub，社区在此发布权重、编写模型卡片、比较评估结果，并拉取模型进行实验。

开源模型在各项基准测试中不断缩小与专有模型的差距，并且它们能实现专有端点无法做到的事情：

-   **前沿技术现已开源。** 领先的开源权重模型在最广泛使用的基准测试中，与顶级闭源前沿模型不相上下。
-   **深度定制。** 完整的权重使得通过 LoRA 进行微调、蒸馏、量化和适配成为可能——为你的领域、数据、延迟和成本目标量身定制模型。
-   **你的模型，你的托管。** 权重在你控制的基础设施上、在你的租户内运行，位于你的推理端点之后，并遵循你的身份和网络边界。
-   **成本控制。** 按小时支付加速器费用，空闲时自动缩零，并为特定模型匹配合适的 GPU——适用于稳定、高吞吐量或延迟敏感的工作负载，在这些场景下按 token 计费更难预测。
-   **版本控制。** 锁定特定的模型版本，进行评估、部署，并按照自己的发布节奏进行升级或回滚。

一直以来，难点都在于运营层面：模型发现、许可证审查、安全筛查、运行时选择、GPU 规格匹配、镜像构建、CVE 补丁修复，以及将模型部署到企业级端点背后。Hugging Face 本身并非一个企业级服务平台。**Foundry 上的 Hugging Face 模型正是这一运营层，由微软运营。**

## [](#hugging-face-models-on-foundry)Foundry 上的 Hugging Face 模型

Hugging Face 集合将经过精选的模型子集直接引入 Foundry 模型目录：

-   **每周更新**——随着社区的发布，持续添加来自 Hugging Face 生态系统的热门模型。
-   **涵盖所有模态**——文本、视觉、音频和多模态：用于聊天和智能体的 LLM 和 VLM、ASR 和语音翻译、嵌入、分割、图像生成。
-   **仅限 SafeTensors，无不可信代码**——集合中的每个模型都经过安全筛查，并以 SafeTensors 权重格式提供，除非经过严格审查，否则不包含 `trust_remote_code` 执行路径。
-   **为模型匹配合适的运行时**——LLM 使用 vLLM 和 SGLang，适用场景使用 TensorRT-LLM 和 NIM，嵌入使用 TEI，CPU 使用 llama.cpp——Foundry 会选择与模型匹配的引擎。

从你的角度来看，Hugging Face 集合中的开源权重模型在 Foundry 模型目录中的外观和行为与其他模型无异，并且集合中的每个模型在出现在目录之前，都经过了多阶段的发布流程。

### [](#the-curation-pipeline)精选流程

Hugging Face 和微软通过系统化的精选流程合作，将 Hugging Face 生态系统中最受欢迎的开源权重模型引入 Microsoft Foundry——为企业环境做好生产准备：

1.  **识别Hugging Face生态中的趋势模型**——基于社区信号、合作伙伴请求和客户需求——并筛选出适合企业级应用的候选模型。
2.  **进行合规性与安全筛查**——根据微软的企业分发政策审查模型许可证（许可证元数据会被捕获并保留在目录模型卡上），并检查仓库中是否存在`trust_remote_code`模式和自定义可执行代码；任何需要在加载时执行第三方Python代码的模型都将被修复或排除。
3.  **构建、扫描并发布运行时**——微软在支持的运行时（vLLM、SGLang、TensorRT-LLM、NIM、TEI、llama.cpp）上构建推理容器镜像，扫描其CVE漏洞，签名后发布到微软管理的容器注册表。
4.  **将权重上传至安全的Azure存储**——模型权重从Hugging Face拉取一次，根据已发布的模型卡进行验证，并存储在模型服务所在区域的微软管理Azure存储中。
5.  **验证并发布到目录**——每个模型+运行时+加速器组合都经过API一致性测试（聊天补全、嵌入、重排序等）和性能测试（延迟、吞吐量、首token时间、token间解码时间），然后验证通过的模型——连同其模板、运行时镜像和权重——发布到Foundry模型目录，并提供一键部署到托管计算环境的路径。

由于权重已预置于Azure存储中，运行时镜像也位于微软管理的注册表内，您的部署无需对Hugging Face Hub进行出站网络访问——您可以在私有网络内部署到生产环境。

## [](#model-runtimes)模型运行时

Foundry上的Hugging Face模型由一系列社区构建的开源推理运行时驱动——每个运行时都针对Foundry托管计算环境进行了选择和调优，并匹配其最佳服务的模型架构。在所有运行时中，系统化的筛选流程确保新版本和补丁能快速落地Foundry，现有模型部署会自动升级——无需您重新部署。

-   **vLLM**——面向开放大语言模型的默认高吞吐量服务引擎，针对生产环境GPU工作负载进行了调优。由于Hugging Face是vLLM的直接贡献者，Transformers库中的任何模型都能开箱即用地在vLLM上运行——因此当新模型登陆Hugging Face时，当天即可在Foundry上提供服务，无需等待自定义集成。

-   **SGLang**——面向语言和多模态模型的服务引擎，对结构化输出（JSON、正则表达式、语法约束生成）有强大支持，这是智能体和工具使用工作负载所依赖的。Hugging Face与SGLang团队已为SGLang构建了Transformers后端集成，因此Transformers库中的任何模型都能开箱即用地在SGLang上运行——并在登陆Hugging Face当天即可在Foundry上使用。

-   **文本嵌入推理（TEI）**——面向嵌入、重排序器和序列分类模型的运行时。加速器专用镜像搭载了为Foundry支持的每种GPU和CPU系列编译的内核，使嵌入热路径在RAG和语义搜索工作负载中保持高效。

-   **llama.cpp** — 面向GGUF量化模型的CPU和小型GPU推理路径。适用于成本优化部署、小型模型及纯CPU环境，提供与vLLM和SGLang相同的OpenAI兼容API。

-   **TensorRT-LLM与NIM** — 用于NVIDIA硬件，借助NVIDIA优化内核和基于Triton的服务，为特定模型系列实现更优的延迟或吞吐量。

-   **hf-serve** — Hugging Face自有模型推理服务器，用于处理LLM和嵌入快速路径之外的模型架构（视觉、音频、分割及其他Transformers原生管道），使模型集合能以统一服务层覆盖所有模态。

## [](#deploying-and-scoring-an-open-weight-model)部署与评分开源权重模型

Foundry模型目录中的Hugging Face集合是您的起点，部署只需五步：

1.  **浏览目录并选择模型** — 部署向导会同时显示模型ID、部署模板ID及`acceleratorType`，方便您通过SDK或REST脚本化部署。
2.  **选择部署模板** — 延迟优化/吞吐量优化、加速器系列、上下文长度、量化方式。
3.  **配置实例数量** — 通过增加模型实例扩展吞吐量。
4.  **部署** — 通过门户、CLI、SDK或REST完成。
5.  **评分** — 通过统一Foundry端点，使用您已有的SDK进行评分。

### [](#deployment-templates)部署模板

部署模板是第二步中的选择单元：一个命名且版本化的资产，固定了运行时、加速器系列与数量、上下文长度以及服务模型所需的运行时特定调优参数。因此，选择模板是您唯一需要操作的旋钮，用于决定"我希望模型如何运行"。

例如，`qwen3-32b` 提供四个模板，部署向导会并排展示：

| 模板 | 运行时 | 加速器 | 上下文 |
| --- | --- | --- | --- |
| `qwen–qwen3-32b–40k-nvidia-a100` | vLLM | 1 × A100 80 GB | 40K |
| `qwen–qwen3-32b–40k-nvidia-h100` | vLLM | 1 × H100 80 GB | 40K |
| `qwen–qwen3-32b–128k-nvidia-2xa100` | vLLM | 2 × A100 80 GB | 128K |
| `qwen–qwen3-32b–128k-nvidia-2xh100` | vLLM | 2 × H100 80 GB | 128K |

每个模板都针对模型进行了预调优——运行时设置、工具调用与推理解析器、评分路径、健康探测、请求并发以及任何模型特定的上下文扩展设置均由Microsoft配置，任何权衡都会在模板描述中内联说明。当您脚本化部署时，只需引用模板，Foundry会处理其余部分。

### [](#deploy--python-sdk)部署 — Python SDK

```
from azure.identity import DefaultAzureCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient

client = CognitiveServicesManagementClient(DefaultAzureCredential(), SUBSCRIPTION_ID)

deployment = client.managed_compute_deployments.begin_create_or_update(
    resource_group_name=RESOURCE_GROUP,
    account_name=ACCOUNT_NAME,
    deployment_name="qwen3-32b",
    resource={
        "sku": {"name": "GlobalManagedCompute", "capacity": 1},
        "properties": {
            "model": "azureml://registries/azure-huggingface/models/qwen--qwen3-32b/versions/1",
            "deploymentTemplate": "azureml://registries/azure-huggingface/deploymenttemplates/qwen--qwen3-32b--40k-nvidia-h100/labels/latest",
            "acceleratorType": "H100_80GB",
        },
    },
).result()
```

### [](#score--openai-sdk)评分 — OpenAI SDK

部署可通过统一Foundry端点使用OpenAI SDK访问——`model`字段使用您刚创建的部署名称：

```
from openai import OpenAI

api_key  = client.accounts.list_keys(RESOURCE_GROUP, ACCOUNT_NAME).key1
endpoint = f"https://{ACCOUNT_NAME}.services.ai.azure.com/openai/v1"

openai_client = OpenAI(base_url=endpoint, api_key=api_key)

completion = openai_client.chat.completions.create(
    model=deployment.name,
    messages=[{"role": "user", "content": "What is the capital of France?"}],
)
```

print(completion.choices[0].message)

### [](#use-it-in-an-agent)在智能体中使用

来自集合中的聊天补全模型可作为管理员连接模型接入 Foundry 智能体，并通过 Foundry 响应 API 使用相同的 OpenAI SDK 进行调用——相同的认证、相同的端点、相同的可观测性。

## [](#whats-available-today)当前可用功能

**现以预览版形式提供：** Microsoft Foundry 模型目录中的 Hugging Face 集合——涵盖所有模态的数千个模型，每周刷新，可部署到 Foundry 托管计算上，使用 NVIDIA A100、NVIDIA H100 或 AMD MI300X 加速器，支持全局和数据区域范围，通过统一的 Foundry 端点提供，支持 Playground、一流的 Azure Monitor 指标、按部署计费标签，以及自动应用于部署的精选运行时升级和 CVE 补丁。

**规划中：** 更广泛的 Hugging Face 生态系统覆盖、更多加速器系列，以及自带权重功能，用于通过与集合模型相同的模板和治理部署微调和专有变体。

Hugging Face 是开放模型发布和发现的地方。Microsoft Foundry 是企业将其运营化的平台——基于托管在 Azure 上的经过审核、许可证筛选和安全筛选的权重；基于社区构建且经过 CVE 扫描的运行时；通过单一端点提供企业级身份认证、网络、可观测性和智能体集成。开源生态系统的广度，加上 Microsoft 在底层运行的运营层。有关 Foundry 托管计算的深入探讨——定价、加速器 SKU、数据驻留、企业就绪性、可观测性以及完整的响应 API + 内存模式——请参阅[托管计算发布博客](https://devblogs.microsoft.com/foundry/announcing-foundry-managed-compute/)。
