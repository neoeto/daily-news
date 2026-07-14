---
title: Data for Agents
url: 'https://huggingface.co/blog/nvidia/open-data-for-agents'
url_hash: 5535aeb9eb9d5ca5e2f18868cc1d79c540821d4d
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-08T17:16:05.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

*为何智能体AI需要开放数据，以及合成数据如何成为规模化扩展的关键。*

![Nemotron 后训练 v3 提示集](https://cdn-uploads.huggingface.co/production/uploads/68d2fec8856b85d927e44d32/8LCrLMaVy8W-dX0j-OwQI.gif)

*图片：Nemotron 后训练 v3 提示集*

## [](#超越模型权重)超越模型权重

构建 AI 智能体之所以困难，是因为现实世界的行为方式与基准测试并不相同。

一个无法从失败的 API 调用或从未见过的工作流中恢复的智能体，并非真正的智能体。它只是一个带有工具的自动补全器。从前者到后者的跨越是一个数据问题：软件工程轨迹、工具使用失败、多步推理、检索、安全、用户模拟、工作流执行，以及最终的物理世界交互。这正是 NVIDIA Nemotron 开放数据产品所专注的领域。

NVIDIA 近期强调了[开放模型如何推动 AI 研究](https://blogs.nvidia.com/blog/open-models-icml-2026/)，并在广受欢迎的国际机器学习大会（ICML）上大放异彩，有近 145 篇论文引用了 Nemotron 模型和数据集。合成数据在整个生态系统中扮演着重要角色：

-   **[Nemotron-CC](https://huggingface.co/datasets/nvidia/Nemotron-CC-v2)** 利用合成数据增强了流行的 Common Crawl 数据集，用于预训练。
-   **[Nemotron-CC-MATH](https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1)** 利用合成数学问题来提升推理能力。
-   **[Nemotron 预训练数据集](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets)** 是一个广泛的集合，涵盖通用、代码、数学和合成数据，总计数万亿 token。

[NVIDIA 发布开放数据集](https://huggingface.co/blog/nvidia/open-data-for-ai)的部分原因，是为了与社区共同学习，以扩展这些不同的应用。

开放权重很重要。但对于智能体而言，权重只是故事的一部分。可复现性同样依赖于模型背后的数据集、筛选策略、训练方法和评估手段。

智能体的行为需要是可审查的。如果一个模型调用工具、执行工作流、检索信息并在系统间运作，开发者需要理解塑造这些行为的数据。开放数据使智能体行为变得可审查和可解释。而合成数据正是实现这一目标的关键拼图。

## [](#保守秘密)保守秘密

NVIDIA 应用深度学习研究副总裁 Bryan Catanzaro 最近指出：["每家公司都围绕着一个秘密建立"](https://youtu.be/Oojrfdl42LI?is=94ru5X7RaufPBHL9)——一个竞争对手没有的工作流、语料库或客户模式。这些秘密让 AI 变得有用，但公司不应轻易将其暴露。合成数据为团队提供了一种方法，既能保留有价值的信号，又无需暴露底层来源。

Bryan 还谈到要培育一个多元化、参与式的 AI 生态系统，让各类公司、研究人员、政府和社区都能做出贡献。这不仅仅是一种价值观主张，更是一个数据主张。

如果每个模型都从同样狭窄的数据池中学习，那么当模型开始趋同时，我们不应感到惊讶。困难在于，最有用的数据往往存在于那些无法或不愿直接公开数据的组织内部。一个更丰富的共享数据层能让所有人受益，但没有人愿意成为第一个交出自身独特优势的人。

以开放形式发布的合成数据，是改变这种局面的一种方式。

## [](#探索智能体数据)探索智能体数据

作为Nemotron开放数据计划的一部分，我们已发布超过10万亿预训练token和数百万后训练样本，涵盖众多领域和数据形态。面对如此庞大的数据量，原始数据集表格显然难以提供有效帮助。

为了让用户更直观地探索Nemotron后训练数据的实际内容，我们构建了[Nemotron Post-Training v3 Prompt Atlas](https://huggingface.co/spaces/nvidia/nemotron-post-training-v3-prompt-atlas)：一个交互式可视化地图，其中每个数据点代表一个提示样本，这些样本来自Nemotron v3后训练数据集，并通过体积采样真实反映数据混合比例。

颜色叠加层和筛选功能可让您按数据集、流水线阶段、领域或工具使用情况重新组织地图。由于语义相似的提示会自动聚类，您可以放大查看特定区域——编码算法、安全、数学、智能体行为——检查代表性示例，并利用这些信号来整理数据、构建评估体系，或理解模型特定行为背后的原因。

## [](#viva-la-persona)Viva La Persona

智能体还需要理解它们所服务的人群，这正是"数据质量"体现地域性而非普适性的关键所在。基于英语互联网数据训练的毒性分类器可能无法识别韩语或日语中的恶意信息——在这些语言中，攻击性往往通过礼貌程度而非明显词汇来编码。相同信号，不同语境。团队已开始通过这种方式[构建智能体](https://huggingface.co/blog/nvidia/build-korean-agents-with-nemotron-personas)。

[Nemotron-Personas](https://docs.nvidia.com/nemo/datadesigner/dev-notes/designing-nemotron-personas)正是解决这一问题的尝试：基于地域特征的合成人格数据，捕捉人群的多样性与复杂性。该数据集基于NVIDIA最先进的复合AI合成数据生成工具[NeMo Data Designer](https://github.com/NVIDIA-NeMo/DataDesigner/)构建，镜像了官方区域人口统计和地理数据。其目标并非复制真实人物，而是帮助开发者测试其系统是否真正服务于其所宣称的用户群体、语言、地区及职业。[Privasis](https://huggingface.co/datasets/nvidia/Privasis-USA)作为衍生数据集，基于[Nemotron-Personas-USA](https://huggingface.co/datasets/nvidia/Nemotron-Personas-USA)构建，展示了这一方向的可能性——在医疗、金融、法律和社会场景中叠加隐私保护的合成记录。

上个月在巴黎VivaTech大会上，我们发布了[数据集系列](https://huggingface.co/collections/nvidia/nemotron-personas)中的第十个国家版本，目前该系列已覆盖超过24亿人口。

![Nemotron-Personas全球覆盖范围](https://cdn-uploads.huggingface.co/production/uploads/68d2fec8856b85d927e44d32/Nu65bo-Tz_GI1ZyylUVN4.png)

当质量具有地域性时，只有了解该地域的人才能构建它——区域研究人员、母语使用者、领域专家、能够与您共同审查和修正的利益相关者。这就是公开学习：不是孤立地发布数据，而是协作构建数据。

## [](#ground-truths)基础事实

合成数据需要作为数据源系统的一部分进行整合。这需要权衡取舍。它可以降低风险，但无法替代对基础事实、数据溯源、整理、评估和人类判断的需求。

理解这个问题的一个有用方法是借助[“合成阈值”](https://youtu.be/1Qka-OiViqM?si=6umC78jZ94AmbTeq&t=1366)：即数据不再能被纯粹视为真实数据的临界点。这条界限并不总是显而易见的。真实工作流、人类反馈、模型生成的痕迹、模拟用户以及合成标签都可能相互交织。答案不是假装合成数据是虚假或无害的，而是要记录哪些数据是生成的、哪些是有依据的、哪些经过了审查，以及这些数据旨在测试什么。随着越来越多的人工智能系统基于人工信息进行训练，我们需要更好的共同习惯来检查、记录这些数据，并在公开场合讨论这些技术。

质量在不同语境下也意味着不同的事情。推理数据需要更困难的问题和更清晰的痕迹。角色数据需要分布保真度和局部审查。智能体工作流需要任务多样性、失败覆盖率和恢复路径。这个领域仍然更像是一门手艺而非公式。

这就是为什么开放方法很重要。合成数据不仅仅是为了生成更多样本，更是为了提出更好的问题，并让原本无法坐在同一张桌子上的各方能够合作：公司无需泄露秘密，政府无需牺牲隐私，研究人员无需等待可能永远不会到来的许可。

人工智能中稀缺的资源不是令牌，而是组织之间的信任。合成数据是我们为数不多的可以用来建立这种信任的工具之一。

* * *

我们于2026年7月7日（星期二）举办了一场关于[为什么开放数据很重要](https://www.youtube.com/live/qg8awR1Yg78?si=nEsZzEJCOxcjZnp4)的直播，邀请了出色的嘉宾。这场直播值得一看，同时还有[Hugging Face上的Nemotron数据集合集](https://huggingface.co/nvidia/collections)。

通过[订阅NVIDIA新闻](https://www.nvidia.com/en-us/preferences/email-preferences/)并关注NVIDIA AI在[LinkedIn](https://www.linkedin.com/showcase/nvidia-ai/)、[X](https://x.com/NVIDIAAI)、[YouTube](https://www.youtube.com/@NVIDIADeveloper)以及[Discord上的Nemotron频道](https://discord.com/invite/nvidia)，了解NVIDIA Nemotron的最新动态。

访问[Hugging Face上的开放Nemotron模型](https://huggingface.co/nvidia)以及[build.nvidia.com上的NIM微服务和开发者示例合集](https://build.nvidia.com/)。
