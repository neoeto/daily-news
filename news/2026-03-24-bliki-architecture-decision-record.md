---
title: 'Bliki: Architecture Decision Record'
url: 'https://martinfowler.com/bliki/ArchitectureDecisionRecord.html'
url_hash: 91f4145693873a9242692930749eb838283b8efe
source: Martin Fowler
source_url: 'https://martinfowler.com/feed.atom'
date: 2026-03-24T13:50:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
架构决策记录（ADR）是一份简短文档，用于记录并解释与产品或生态系统相关的单一决策。文档应保持简洁（仅需数页篇幅），包含决策内容、决策背景及重要影响。若决策发生变更，不应修改原文档，而应链接至替代决策。

与多数书面文档类似，撰写ADR具有双重目的。首先，它作为决策档案，使数月乃至数年后的人们能够理解系统为何以当前方式构建。但更具价值的是，撰写过程本身有助于厘清思路——尤其在多人协作时。撰写具有影响力的文档往往能暴露不同观点，迫使各方讨论分歧并有望达成共识。

通用原则是采用新闻写作常见的"倒金字塔"结构，即把最重要内容置于开头，细节信息后置。

常见建议是将决策记录存放在其对应的代码库源码仓库中，通常选择`doc/adr`作为存放位置。这样便于代码库开发者随时查阅。基于相同考量，应使用轻量级标记语言（如Markdown）编写，使其能像普通代码一样轻松阅读和比对差异。我们可通过构建任务将其发布至产品团队网站。

对于覆盖范围超出单一代码库的生态系统级ADR，将其存储在产品仓库中并不适用。也有人认为将ADR保存在Git中会增加非开发人员的使用难度。

每条记录应独立成文件，文件名采用单调递增的数字序列，并包含决策摘要，便于在目录列表中快速浏览（例如："`0001-HTMX-for-active-web-pages`"）。

每条ADR具有状态标识：讨论中为"提议"（proposed），团队采纳并生效后为"已接受"（accepted），若被重大修改或替换则标注为"已替代"（superseded）并附上替代ADR的链接。一旦ADR被接受，绝不应重新开启或修改——应通过替代机制处理。这样我们就能保留清晰的决策日志，记录各决策及其生效时长。

ADR不仅包含决策本身，还需简要说明决策依据。这应总结催生该决策的问题背景，以及权衡过程中考量的因素。可借鉴模式写作中"驱动力"的概念来构思。在此过程中，明确列出所有被认真考虑过的备选方案及其优劣得失将极具价值。

任何决策都会带来后果。有时这些后果会从决策依据中清晰体现，但有时值得用专门章节明确说明。决策通常是在某种不确定性下做出的，因此记录决策的置信度会很有帮助。这也是提及产品环境变化的好地方——这些变化应促使团队重新评估决策。

ADR（架构决策记录）在[建议流程](https://martinfowler.com/articles/scaling-architecture-conversationally.html)中扮演核心角色，不仅用于记录决策，撰写过程本身也能激发专业意见和团队共识。在这种情况下，ADR还应包含形成决策时收集的建议，但为保持简洁，最好在ADR中总结建议，将完整记录另行保存。

这里最需要牢记的是简洁性。保持ADR简短精炼——通常一页即可。如有支撑材料，可附上链接。

虽然ADR是记录软件架构决策的一种形式，但在其他场景下，撰写简短决策记录这一更广泛的概念也值得考虑。这类决策日志能创建宝贵的历史记录，有助于解释事物最终呈现的样貌。

## 延伸阅读

Michael Nygard于2011年通过[ADR格式文章](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)创造了"架构决策记录"这一术语。虽然他并非决策日志概念的原创者，但确实倡导了轻量级文档，并将重点放在决策本身。在这方面，他特别受到Philippe Kruchten关于决策登记册/决策日志的论述，以及[软件模式](/articles/writingPatterns.html)写作风格的启发。他的文章优于该主题的其他几乎所有作品，我撰写本文的唯一目的是指出后续的一些发展。

在本站，[Harmel-Law](https://martinfowler.com/articles/scaling-architecture-conversationally.html#adr)和[Rowse与Shepherd](https://martinfowler.com/articles/building-infrastructure-platform.html#ArchitecturalDecisionRecords)的文章中提供了ADR格式的简要示例。

[adr-tools](https://github.com/npryce/adr-tools)是一个用于管理ADR的简单命令行工具。它包含一套自身使用的ADR，是这种形式的优秀范例。

## 致谢

Andrew Harmel-Law、Brandon Cook、David Lucas、Francisco Dias、Giuseppe Matheus Pereira、John King、Kief Morris、Michael Joyce、Neil Price、Shane Gibson、Steven Peh和Vijay Raghavan Aravamudhan在我们的内部聊天中讨论了本文草稿。Michael Nygard提供了其写作起源的背景信息。
