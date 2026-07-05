---
title: 'Fragments: April 21'
url: 'https://martinfowler.com/fragments/2026-04-21.html'
url_hash: 6d93c50d1a794e5e9b338bc70c7bade8a087f2dc
source: Martin Fowler
source_url: 'https://martinfowler.com/feed.atom'
date: 2026-04-21T20:34:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
上周，Thoughtworks 发布了[第 34 期技术雷达](https://www.thoughtworks.com/radar)。这份雷达是我们每半年一次对技术领域经验的调研，重点介绍我们使用过或引起我们关注的工具、技术、平台和语言。本版包含 118 个 blip，每个都简要描述了我们对其中一项元素的印象。

正如预期，雷达以 AI 相关主题为主。部分内容是用 LLM 辅助的视角重新审视熟悉领域：

> AI 在软件开发中的一个有趣后果是，它不仅迫使我们展望未来，还推动我们重新审视行业根基。在编写本版时，我们发现自己在回顾许多成熟技术，从结对编程到零信任架构，从变异测试到 DORA 指标。我们还重新审视了软件工艺的核心原则，如整洁代码、审慎设计、可测试性和可访问性作为一等关注点。这不是怀旧，而是对 AI 工具生成复杂性的速度的必要平衡。我们还观察到命令行的复兴：经过多年以可用性为名将其抽象化后，代理工具正将开发者带回终端作为主要界面。

我特别高兴看到同事 Jim Gumbley 加入写作团队，多年来他一直是安全信息的重要来源，包括参与本站的[威胁建模指南](https://martinfowler.com/articles/agile-threat-modelling.html)工作。鉴于使用 LLM 带来的严重安全问题，雷达团队中有强大的安全代表尤为重要。雷达的一个主题是保护“权限饥渴”的代理：

> “权限饥渴”描述了当前代理时代核心的困境：值得构建的代理正是那些需要访问一切的代理。OpenClaw 和 Claude Cowork 监督实际工作任务；Gas Town 协调整个代码库中的代理集群。这些代理需要广泛访问私有数据、外部通信和真实系统——每个都声称回报值得。
>
> 然而，就像刚学会转弯的滑雪者自信地指向最难的黑色雪道，安全措施尚未跟上这种雄心。对访问的渴望与未解决的问题相冲突。提示注入意味着模型仍然无法可靠地区分可信指令和不可信输入。

鉴于这一切，本版雷达的许多 blip 涉及“驾驭工程”（Harness Engineering），事实上雷达会议是 [Birgitta 关于该主题的精彩文章](https://martinfowler.com/articles/harness-engineering.html)的主要灵感来源。雷达包含多个 blip，建议了适合的驾驭所需的指南和传感器。我预计六个月后下一版雷达出现时，这个列表会增长。

❄                ❄                ❄                ❄                ❄

Mike Mason 探讨了[当开发者不再阅读代码时会发生什么](https://mikemason.ca/writing/ai-slop-code-april-2026/)。

> Claude 生成的 Python 代码基本可用。单元测试通过了，经过几小时的实战检验，它成功管理了我基础设施中一个相当复杂的部分。但就在总代码量达到约 100KB 时，我注意到一个问题：主文件已膨胀到约 50KB（2000 行），而 Claude Code 在需要修改时，开始用 sed 来定位并修改文件中的代码。看到这一幕，我警铃大作。

除了“一位朋友”的经历，他也在思考泄露事件后 Claude Code 那 50 万行代码的问题。

> 两件事都是真的：Claude Code 里有好的架构，也有难以理解的混乱。这恰恰是关键所在。不读代码，你根本不知道哪部分是哪样。

他的结论是一个粗略的框架。一次性分析脚本可以随性挥洒。但需要维护的工具和持久化的代码，则需要定期的人工审查——哪怕只是让人带着对好代码样子的提示，去让模型评估代码。

> 一旦你说出“这东西越来越大，让我有点不安了，我们能做点什么更好的吗？”，它就会做正确的事：合理的分解、新的类，有时甚至为新东西写单元测试。它知道该怎么做，只是不会主动提出来。

他确实建议认真对待 `CLAUDE.md`，不过我不确定他是否尝试过 Rahul Garg 最近发布的那些模式，这些模式旨在[打破类似的挫败循环](https://martinfowler.com/articles/reduce-friction-ai/)，正是 Rahul 所观察到的。

❄                ❄                ❄                ❄                ❄

Dan Davies 提出了一个[恼人的哲学思想实验](https://backofmind.substack.com/p/authentic-is-as-authentic-does-or)，让我们思考如何看待 LLM 参与代笔写作这件事。

❄                ❄                ❄                ❄                ❄

DOGE 在其短暂的“碎木机”行动中拆解了许多有用的东西。其中之一是 DirectFile，一个支持人们在线报税的政府项目。Don Moynihan 与许多参与 Direct File 的人进行了交流，并[撰写了一篇有价值的文章](https://donmoynihan.substack.com/p/what-the-death-of-direct-file-tells)。这篇文章不仅关乎 DirectFile 和其他美国政府技术项目，实际上也适用于任何大型组织中的技术举措。

Moynihan 强调：

> 政府改革中的一个悖论：一个潜在的变革看起来越简单，它就越可能因为隐藏着他人曾尝试解决却失败的复杂性问题而未能实施。

我在许多大公司里也听过类似的故事。

政府项目的一个不同之处在于，在其最佳状态下，它建立在公共服务的精神之上。

> 许多参与Direct File项目的人，都将其与DOGE及其构建技术产品的方式进行了鲜明对比。其中一个关键区别在于，DOGE似乎对公共利益目标乃至公众本身毫无兴趣：“如果你认为政府没有责任服务人民，那么我认为这不禁让人质疑——如果你根本不相信这一基本原则，你又怎么能让政府更好地为人民服务呢？”

对于像我这样的美国纳税人而言，悲剧在于我们失去了一种有效应对每年报税麻烦的方式。此外，美国国税局（IRS）的实力已大为削弱——其员工减少了25%，预算也比2010年低了40%。尽管我们讨厌税务机构，但这并非好事。高效的税收体系是国家安全的重要组成部分，许多历史学家认为，有效征税的能力是英国在18世纪与法国长达百年的斗争中获胜的重要原因。而混乱的税收体系，也是法国君主制——在18世纪初曾如此强大——最终被革命推翻的主要原因之一。事实上，有大量证据表明，增加IRS的预算[将通过增加税收而获得远超成本的回报](https://budgetlab.yale.edu/research/revenue-and-distributional-effects-irs-funding#:~:text=Behavioral%20estimates%20are%20always%20uncertain,from%20taxpayers%20who%20are%20audited.)。
