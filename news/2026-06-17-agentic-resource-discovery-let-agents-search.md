---
title: 'Agentic Resource Discovery: Let agents search'
url: 'https://huggingface.co/blog/agentic-resource-discovery-launch'
url_hash: da3c81662bdd9e13d795e3e0ee7761907bf6d3f0
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-17T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

## 智能体资源发现：让智能体自主搜索工具、技能与其他智能体

[![ben burtenshaw的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/62d648291fa3e4e7ae3fa6e8/oatOwf8Xqe5eDbCSuYqCd.png)](https://huggingface.co/burtenshaw)

[![shaun smith的头像](https://huggingface.co/avatars/909635453bf62a2a7118a01dd51b811c.svg)](https://huggingface.co/evalstate)

如果你正在构建智能体应用，很可能已经熟悉三种协议：MCP为智能体提供标准化的工具调用方式，Skills让智能体能够消费指令，A2A则赋予智能体调用其他智能体的能力。但这三种协议都假设用户已经知道自己需要哪种工具、指令或智能体——用户仍需自行发现、集成并维护这些能力。

智能体资源发现（ARD）规范正是位于这些协议之上的发现层。这是一份由微软、谷歌、GoDaddy、Hugging Face等公司贡献者共同开发的开放规范草案，获得了业界广泛参与。它定义了智能体和工具如何在联邦注册中心进行编目、索引和搜索，使智能体能在运行时发现能力，而无需预先安装。这不是一个产品或市场，而是一个共享标准：任何公司都可独立实现，任何智能体或工具都可参与其中。

本文将深入探讨该规范、Hugging Face的实现方式，以及如何开始基于ARD进行开发。

## 发现难题

当前智能体能力的模式是"先安装，后使用"：开发者将MCP服务器URL硬编码到配置文件中，用户通过插件将服务连接到AI应用并重复使用。这对智能体日常使用的少数工具有效，但无法扩展到数千个临时交互场景。

退而求其次的做法是将所有可用工具描述塞入LLM的上下文窗口，让模型自行选择。这受限于上下文预算。虽然也存在基于搜索的策略，但描述往往过于单薄，难以有效区分。

ARD将选择过程移出LLM。注册中心通过更丰富的信号（如发布者身份、代表性查询、合规证明和标签）对能力进行索引。它暴露REST端点，客户端用自然语言搜索，模型调用搜索返回的结果。这一转变是从手动安装的静态目录转向基于意图的搜索，让智能体动态发现所需能力，并触及不断增长的MCP工具、A2A智能体及其他服务生态，无需预先配置每个组件。

该规范定义了两个要素：
- 静态清单格式`ai-catalog.json`，让发布者能在已知URL托管其能力。
- 动态注册中心API`POST /search`，提供实时排序的发现能力。

## Hugging Face Hub上的ARD

Hugging Face的[Discover Tool](https://github.com/huggingface/hf-discover)是我们对ARD的参考实现。它提供对数千个Skills、ML应用和MCP服务器的搜索访问——这些资源既存在于Hugging Face平台，也跨越其他ARD发现服务。

它的工作原理是：将 Hub 现有的基于 Spaces 的语义搜索与我们的 Agent Skills 相结合，并将结果以 ARD 目录条目的形式呈现。Hub 已经托管了一个包含运行 Gradio 应用、MCP 服务器和演示的 Spaces 目录。其语义搜索支持一个 `agents=true` 标志，该标志会返回按面向代理的元数据排序的 Spaces，而 Discover 则将该搜索转换为 ARD 规范。

该适配器应用了两个过滤器。首先，响应仅包含运行时阶段为 `RUNNING` 的 Spaces。其次，响应的媒体类型由请求驱动。支持三种媒体类型：

-   `application/ai-skill`：默认类型。一个生成的 `SKILL.md`，包装了 Space 的 `agents.md`。
-   `application/mcp-server+json`：针对标记为 `mcp-server` 的 Spaces 的 MCP 服务器目录条目。
-   `application/vnd.huggingface.space+json`：供希望自行处理的客户端使用的原始 Space 元数据。

技能类型涉及额外的转换。许多 Spaces 附带一个 `agents.md` 文件，描述了代理应如何与它们交互。Discover 读取该文件，并用技能消费者期望的前置元数据（`name`、`description` 以及涵盖 Space ID、Hub URL、应用 URL 和原始 `agents.md` URL 的源元数据）对其进行包装。结果是任何支持技能的客户端都可以通过其正常的技能流程安装或加载的技能。

对于标记为 MCP 的 Spaces，适配器会生成一个目录条目，指向该 Space 的 Gradio MCP 端点（通过 HTTP 传输）。当 Hub 提供运行时域名时，URL 会使用该域名；否则，使用标准的 `.hf.space` 别名约定。

## [](#using-it)使用方法

`discover` 已内置于 [Hugging Face CLI](https://github.com/huggingface/huggingface_hub)（`hf`）中。要开始使用并为您或您的代理提供访问权限：

```
# 安装 Hugging Face CLI 工具：
uv tool install huggingface_hub

# 搜索训练模型的资源
hf discover search "Fine tune a language model"

# 查找用于生成图像的 MCP 服务器
hf discover search "Generate an image" --json --kind mcp

# 搜索其他注册表
hf discover search "Purchase aeroplane tickets" --registry-url <catalog-url>
```

### [](#rest-api-and-mcp-tool)REST API 和 MCP 工具

您也可以直接使用 REST API 或 MCP 服务器来搜索目录。

Hugging Face 目录发布在其众所周知的 URL 上：

```
https://huggingface.co/.well-known/ai-catalog.json
```

要直接调用搜索：

```
POST https://huggingface-hf-discover.hf.space/search
```

```
curl -s https://huggingface-hf-discover.hf.space/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "text": "fine tune a sentence transformer",
      "filter": {
        "type": ["application/ai-skill"]
      }
    },
    "pageSize": 5
  }'
```

搜索 MCP 服务器

```
curl -s https://huggingface-hf-discover.hf.space/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "text": "transcribe some audio",
      "filter": {
        "type": ["application/mcp-server-card+json"]
      }
    },
    "pageSize": 5
  }'
```

或者，连接任何 MCP 客户端，通过 MCP 端点 [https://huggingface-hf-discover.hf.space/mcp](https://huggingface-hf-discover.hf.space/mcp) 搜索目录。

## [](#what-this-means-for-the-specification)这对规范意味着什么

ARD将发现与执行分离。其静态清单格式由媒体类型驱动，因此任何工件协议都能在无需规范层面变更的情况下，复用同一封装结构。注册表API采用纯HTTP REST协议，任何客户端均可与之联合。Discover是生态系统中该规范的多个参考实现之一，由于联合机制内置于协议中，通过一个服务进行搜索即可呈现由其他服务托管的能力。

Discover工具是该设计的实际验证。它并未创造新的工件格式，而是将现有搜索后端Hub封装在规范的框架内，使同一Spaces能够根据客户端请求，以技能或MCP服务器的形式呈现。

下一步计划是更紧密地集成规范的联合模式（`auto`、`referrals`、`none`），并在Hub端支持用户和组织配置文件上的静态`ai-catalog.json`清单。一旦实现，任何Space发布者都能通过标准的well-known URI机制宣传其能力。

## [](#learn-more)了解更多

-   Agentic资源发现规范：[https://agenticresourcediscovery.org/](https://agenticresourcediscovery.org/)
-   Hugging Face Discover工具：[https://github.com/huggingface/hf-discover](https://github.com/huggingface/hf-discover)
-   Hugging Face CLI：[https://github.com/huggingface/huggingface\_hub](https://github.com/huggingface/huggingface_hub)
-   Hub上的Agent技能：[https://huggingface.co/docs/hub/agents-skills](https://huggingface.co/docs/hub/agents-skills)
-   Hugging Face Spaces：[https://huggingface.co/spaces](https://huggingface.co/spaces)
