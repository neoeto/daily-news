---
title: How an Agent Built a 3D Paris Gallery by Chaining Two Hugging Face Spaces
url: 'https://huggingface.co/blog/mishig/spaces-agents-md'
url_hash: 92ae8342b63631379180bff2702e8ca9a275971f
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-09T10:46:19.000Z
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

[![Mishig Davaadorj 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/60a551a34ecc5d054c8ad93e/dhcBFtwNLcKqqASxniyVw.jpeg)](https://huggingface.co/mishig)

*一个智能体利用两个 Hugging Face Spaces 构建了一个 3D 巴黎画廊。*

我让一个编码智能体搭建一个精美的网站，以 3D 高斯泼溅的形式展示巴黎的纪念碑。我从未打开过图像生成器，也从未碰过 3D 重建工具。这个智能体直接调用两个 Hugging Face Spaces 生成了所有素材（包括图像**和** 3D 泼溅），然后将它们整合到一个电影级查看器中。

以下是最终成果，以一个静态 Space 的形式呈现：

👉 **[mishig/monuments-de-paris](https://huggingface.co/spaces/mishig/monuments-de-paris)**

这篇文章将探讨*如何*实现这一点，以及为什么我认为这预示着未来大量多媒体软件的构建方式。

## [](#构建模块经济降临多媒体领域)构建模块经济降临多媒体领域

Mitchell Hashimoto 最近描述了一种他称之为[构建模块经济](https://mitchellh.com/writing/building-block-economy)的转变：开发软件最有效的路径不再是打磨一个庞大的单体应用，而是使用小巧、文档完善的组件，让其他人（尤其是*智能体*）来组装。他的关键观察是：AI 从零开始构建一切的能力尚可，但它在**拼接成熟组件**方面**非常出色**。

这一论点此前主要围绕*代码*库展开。但同样的力量正在冲击**多媒体 AI**。使用最先进的图像模型、视频模型、TTS 模型或 3D 重建模型的难点从来不在模型本身，而在于集成：SDK、权重、GPU、输入格式、轮询。如果每个模型都是一个有文档、可调用的模块，那么智能体就能像拼接 npm 包一样将它们组合起来。

这正是 Hugging Face Spaces 悄然成为的角色。

## [](#每个-space-都是构建模块通过-agentsmd)每个 Space 都是构建模块，通过 `agents.md`

Hub 上托管着数千个最先进的模型（其中很大一部分是**开放权重**的），并且大多数都部署为交互式 **Spaces**。现在，每个 Gradio Space 都暴露一个纯文本的 [`agents.md`](https://huggingface.co/docs/hub/en/spaces-agents) 文件，它精确地告诉智能体如何调用它：

```
curl https://huggingface.co/spaces/VAST-AI/TripoSplat/agents.md
```

一次调用即可返回所有必要信息：模式 URL、调用和轮询模板、如何上传文件以及身份验证提示：

```
API schema:   GET  .../gradio_api/info
Call endpoint: POST .../gradio_api/call/v2/{endpoint} {"param_name": value, ...}
Poll result:  GET  .../gradio_api/call/{endpoint}/{event_id}
File inputs:  POST .../gradio_api/upload -F "files=@file.ext"
Auth:         Bearer $HF_TOKEN
```

无需客户端库，无需硬编码集成。智能体读取这些信息后，就能端到端地驱动这个 Space。设置一个 [`HF_TOKEN`](https://huggingface.co/settings/tokens) 即可开始。你可以在任何 Gradio Space 上通过其 **Agents** 按钮找到这些说明：

![Hugging Face Space 上的 Agents 按钮](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/agents-triposplat.png)

真正的关键在于**链式调用**：一个 Space 的输出成为下一个 Space 的输入。提示词 → 图像 → 3D。这正是这个画廊背后的完整流程。

## [](#实践案例巴黎纪念碑-→-泼溅)实践案例：巴黎纪念碑 → 泼溅

智能体链式调用了两个 Space：

1.  **图像：** 一个图像生成 Space 将每座纪念碑转化为一张干净、深色背景的“标本”照片（埃菲尔铁塔则变成了底座上的小立体模型）。输入提示词，输出图像。
2.  **泼溅：** [`VAST-AI/TripoSplat`](https://huggingface.co/spaces/VAST-AI/TripoSplat) 从每张单张图像重建出 3D 高斯泼溅（`.ply` 格式）。输入图像，输出 3D。

生成的图像

[![生成的先贤祠](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-pantheon.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-pantheon.jpg)

重建的泼溅

智能体生成的六张源图像，均以黑色背景独立呈现，可直接用于单图像三维重建：

[![生成的大教堂图像](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-opera.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-opera.jpg) [![生成的凯旋门](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-arc.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-arc.jpg) [![生成的圣心大教堂](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-sacre-coeur.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-sacre-coeur.jpg) [![生成的埃菲尔铁塔立体模型](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-eiffel-diorama.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-eiffel-diorama.jpg)

随后智能体还完成了"粘合"工作。它发现TripoSplat输出的模型是Y轴朝下的，于是将其翻转至直立状态，自动为每座纪念碑调整取景框，将`.ply`文件压缩为`.ksplat`（体积缩小约3倍，加载更迅速），构建了一个支持滚动切换和拖拽旋转的Three.js查看器，并将整个项目部署为静态Space。人类仅需在审美层面输入指令："拉远视角"、"用更适合点云渲染的物体替换方尖碑"、"过渡动画停留时间太长"。

其中多个步骤是**智能体对现实情况的即时反应**。宽大的玻璃金字塔点云效果不佳，细长的方尖碑显得单调，单视角重建需要推断背面。这正是"外包研发、快速迭代"循环的典型体现——只不过这里的研发变成了对话形式。

## [](#两个提示词-一个全新画廊)两个提示词，一个全新画廊

对构建模块的真正考验在于复用的成本有多低。这套流程建立后，创建全新画廊的成本几乎降到了一句话。输入"为日本创建类似的Space"，再为埃及执行相同操作，智能体便完成了其余所有工作：每个国家六张纪念碑图像、六个点云文件、压缩、查看器，以及部署完成的Space。

-   🏛️ [埃及纪念碑](https://huggingface.co/spaces/mishig/monuments-of-egypt)：大金字塔、狮身人面像、阿布辛贝神庙、图坦卡蒙面具、卡纳克神庙、门农巨像。

<video autoplay loop muted playsinline width="100%" src="

">

-   ⛩️ [日本纪念碑](https://huggingface.co/spaces/mishig/monuments-of-japan)：东京塔、姬路城、金阁寺、大阪城、镰仓大佛、严岛神社鸟居。

<video autoplay loop muted playsinline width="100%" src="

">

同样的两个Space，同样的`agents.md`，唯一改变的是提示词。这正是构建模块经济的核心逻辑：新多媒体应用的边际成本趋近于描述它的语言成本。

## [](#为何重要)为何重要

-   **模型变得可组合。** 来自不同机构的SOTA点云模型和图像模型，通过零集成代码即可串联使用。Hub上的开放权重目录变成了可调用的多媒体原语库。
-   **智能体偏好文档完善且易访问的资源。** `agents.md`让Space变得触手可及，智能体会优先选择它，而非需要手动配置的模型。这与Hashimoto指出的开源库动态如出一辙。
-   **集成曾是最大障碍，如今已基本消除。** "将提示词转化为可旋转的3D纪念碑"过去是一个项目，现在只是流程中的一个步骤。

## [](#亲自尝试)亲自尝试

将你自己的智能体指向Space的`agents.md`，让它自由发挥：

```
# 图像生成
curl https://huggingface.co/spaces/ideogram-ai/ideogram4/agents.md
# 单图像转3D高斯点云
curl https://huggingface.co/spaces/VAST-AI/TripoSplat/agents.md
```

将任一链接粘贴到你的编码智能体（如Claude Code等）中，设置好`HF_TOKEN`，然后让它构建项目。本画廊完整可复现的流程，以及调用这两个`agents.md`端点的脚本，均保存在[Space仓库](https://huggingface.co/spaces/mishig/monuments-de-paris/tree/main)中。

构建模块就静静地躺在Hub上。智能体早已懂得如何将它们粘合在一起。

我让一个编码智能体构建了一个精美的网站，以3D高斯泼溅的形式展示巴黎的纪念碑。我从未打开过图像生成器，也从未碰过3D重建工具。这个智能体通过直接调用两个Hugging Face Spaces生成了所有资产（图像**和**3D泼溅），然后将它们整合到一个电影般的查看器中。

以下是结果，作为一个静态Space实时呈现：

👉 **[mishig/monuments-de-paris](https://huggingface.co/spaces/mishig/monuments-de-paris)**

这篇文章是关于*如何*实现这一点的，以及为什么我认为这是未来大量多媒体软件构建方式的预演。

## [](#the-building-block-economy-comes-for-multimedia-1)积木式经济降临多媒体领域

Mitchell Hashimoto最近描述了他称之为[积木式经济](https://mitchellh.com/writing/building-block-economy)的转变：构建软件最有效的路径不再是打磨一个庞大的单体，而是使用小巧、文档完善的组件，让其他人（尤其是*智能体*）来组装。他的关键观察是：AI从零开始构建一切的能力尚可，但它在**拼接**经过验证的组件方面**非常出色**。

这个论点主要围绕*代码*库展开。但同样的力量正在冲击**多媒体AI**。使用最先进的图像模型、视频模型、TTS模型或3D重建模型的难点从来不是模型本身，而是集成：SDK、权重、GPU、输入格式、轮询。如果每个模型都是一个有文档、可调用的积木块，那么智能体就可以像拼接npm包一样将它们组合起来。

这正是Hugging Face Spaces悄然成为的样子。

## [](#every-space-is-a-building-block-via-agentsmd-1)每个Space都是一个积木块，通过`agents.md`

Hub托管着数千个最先进的模型（其中很大一部分是**开放权重**的），并且大多数都部署为交互式**Spaces**。现在，每个Gradio Space都暴露一个纯文本的[`agents.md`](https://huggingface.co/docs/hub/en/spaces-agents)，它*精确地*告诉智能体如何调用它：

```
curl https://huggingface.co/spaces/VAST-AI/TripoSplat/agents.md
```

一次返回所有需要的信息：schema URL、调用和轮询模板、如何上传文件以及认证提示：

```
API schema:   GET  .../gradio_api/info
Call endpoint: POST .../gradio_api/call/v2/{endpoint} {"param_name": value, ...}
Poll result:  GET  .../gradio_api/call/{endpoint}/{event_id}
File inputs:  POST .../gradio_api/upload -F "files=@file.ext"
Auth:         Bearer $HF_TOKEN
```

无需客户端库，无需硬编码集成。智能体读取这些信息后，就能端到端地驱动Space。设置一个[`HF_TOKEN`](https://huggingface.co/settings/tokens)，你就可以开始了。

真正的解锁在于**链式调用**：一个Space的输出成为下一个Space的输入。提示词 → 图像 → 3D。这就是这个画廊背后的完整流程。

## [](#the-worked-example-paris-monuments-→-splats-1)实际案例：巴黎纪念碑 → 泼溅

智能体链式调用了两个Space：

1.  **图像：** [`ideogram-ai/ideogram4`](https://huggingface.co/spaces/ideogram-ai/ideogram4) 将每个纪念碑转化为一张干净的、深色背景的“标本”照片（埃菲尔铁塔则变成了底座上的小立体模型）。输入提示词，输出图像。
2.  **泼溅：** [`VAST-AI/TripoSplat`](https://huggingface.co/spaces/VAST-AI/TripoSplat) 从每张单张图像重建出一个3D高斯泼溅（`.ply`）。输入图像，输出3D。

生成的图像

[![生成的先贤祠](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-pantheon.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-pantheon.jpg)

重建的泼溅

智能体生成的六张源图像，全部在黑色背景上独立呈现，为单图像3D重建做好准备：

[![生成的纪念碑图像](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-opera.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-opera.jpg) [![生成的凯旋门](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-arc.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-arc.jpg) [![生成的圣心大教堂](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-sacre-coeur.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-sacre-coeur.jpg) [![生成的埃菲尔立体模型](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-eiffel-diorama.jpg)](https://huggingface.co/spaces/mishig/monuments-de-paris/resolve/main/blog/assets/gen-eiffel-diorama.jpg)

从那里开始，智能体也完成了“粘合”工作。它注意到TripoSplat的输出是Y轴朝下的，于是将其翻转直立，自动为每座纪念碑取景，将`.ply`文件压缩为`.ksplat`（体积缩小约3倍，加载更快），构建了一个支持滚动切换和拖拽旋转的Three.js查看器，并将整个项目部署为静态Space。人类仅有的输入是审美层面的：“拉远视角”、“用更适合高斯泼溅的物体替换方尖碑”、“过渡动画停留时间太长”。

其中几个步骤是**智能体对现实的反应**。宽大的玻璃金字塔泼溅效果不佳。细长的方尖碑显得单调。单视角重建会推断背面。这正是“外包研发、快速迭代”循环的体现——正如积木块经济所预测的那样，只不过这里的研发变成了一场对话。

## [](#two-prompts-a-whole-new-gallery-1)两个提示，一整个新画廊

对积木块真正的考验在于复用的成本有多低。一旦这条流水线建立起来，创建全新画廊的成本大约只需一句话。“为日本创建一个类似的Space，使用高斯泼溅”，然后对埃及做同样的事，智能体完成了其余工作：每个国家六张纪念碑图片、六个高斯泼溅、压缩、查看器，以及一个部署好的Space。

-   🏛️ [埃及纪念碑](https://huggingface.co/spaces/mishig/monuments-of-egypt)：大金字塔、狮身人面像、阿布辛贝神庙、图坦卡蒙面具、卡纳克神庙、门农巨像。

-   ⛩️ [日本纪念碑](https://huggingface.co/spaces/mishig/monuments-of-japan)：东京塔、姬路城、金阁寺、大阪城、镰仓大佛、严岛神社鸟居。

同样的两个Space，同样的`agents.md`，只有提示词变了。这就是积木块经济的一句话总结：新多媒体应用的边际成本趋近于描述它的成本。

## [](#why-this-matters-1)为什么这很重要

-   **模型变得可组合。** 来自不同机构的SOTA高斯泼溅模型和SOTA图像模型，无需任何集成代码即可串联使用。Hub上的开放权重目录变成了一个可调用的多媒体原语库。
-   **智能体偏好文档完善且易于访问的内容。** `agents.md`让Space变得极易访问，因此智能体会优先选择它，而不是需要手动设置的模型。这与Hashimoto指出的开源库动态机制相同。
-   **集成曾是障碍，如今已基本消除。** “将提示词转化为旋转的3D纪念碑”曾经是一个项目。在这里，它只是流水线中的一个步骤。

## [](#try-it-yourself-1)亲自尝试

将你自己的智能体指向某个Space的`agents.md`，让它自由发挥：

```
# 图像生成
curl https://huggingface.co/spaces/ideogram-ai/ideogram4/agents.md
# 单图像到3D高斯泼溅
curl https://huggingface.co/spaces/VAST-AI/TripoSplat/agents.md
```

将任一链接粘贴到你的编码智能体（如Claude Code等）中，设置你的`HF_TOKEN`，然后让它构建一些东西。这个画廊完整且可复现的流水线，以及调用这两个`agents.md`端点的脚本，都保存在[Space仓库](https://huggingface.co/spaces/mishig/monuments-de-paris/tree/main)中。

积木块就摆在Hub上。智能体已经知道如何粘合。
