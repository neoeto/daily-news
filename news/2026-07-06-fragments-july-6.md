---
title: 'Fragments: July  6'
url: 'https://martinfowler.com/fragments/2026-07-06.html'
url_hash: 222d3c291025d7d7021e02b90e492a6d89dfe64f
source: Martin Fowler
source_url: 'https://martinfowler.com/feed.atom'
date: 2026-07-06T12:53:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
上周，Thoughtworks 举办了第二届[软件开发未来静修会](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html)，这次是在欧洲。和上次活动一样，我会分享一些零散的思考。活动设有五个并行分会场，所以我最多只能参加五分之一的活动。这不是一个形成结论的活动，而是让探索者分享他们的发现和对未来的愿景。[Bliki 文章](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html)列出了我遇到的所有相关文章，包括我自己和他人的。我会随着更多文章的出现不断更新。

Giles Edwards-Alexander [“注意到两次静修会之间的显著差异”](https://overwatering.org/blog/2026/07/notes-from-fose-europe/)：

> 鹿谷那次带着犹豫，相信这里有些什么，尽管我们还不确定是什么；而恩格尔堡这次则充满信心：价值就在这里。正如我今天向一位同事解释的，这不是一场为笃信者准备的会议：证据已经摆在眼前。
>
> 证据说了什么？嗯，这点倒没那么清晰。一些模式和实践正在涌现（一位与会者已经整理了几十个智能体工程模式库），但它们仍在形成中。要真正确定哪些是有效的、何时有效，还有更多工作要做。

Greg Herlein [也有同感](https://blog.herlein.com/post/retreat-observations/)：

> 阅读二月份活动的报告时，当时这群人上次聚在一起，讨论的是智能体开发可能是什么样子。充满憧憬。更多是关于即将到来的东西。
>
> 这次呢？房间里每个人都在实践。都在交付。不是幻灯片——是生产环境。关于这是否会改变软件工程的争论已经结束了。人们早就停止了争论“是否”的问题。他们在争论“如何”，而“如何”正变得真实。

在更微观的层面，我注意到另外两件事。首先，现在大家谈论更多的是[驾驭工程](https://martinfowler.com/articles/harness-engineering.html)，而在犹他时这甚至还不是一个术语——这体现了事情变化之快。其次，人们现在开始担心 token 的成本，而之前大家几乎愿意做任何事来激励人们与[精灵](https://martinfowler.com/articles/who-is-llm.html)对话。

❄                ❄

从犹他延续下来的一个问题是：架构和设计是否仍然重要。这里似乎有两个标志性的假设：一个是精灵拥有如此强大的“银河大脑”，以至于我们不再需要关心这些事，它能够处理我们扔给它的任何混乱代码。另一个是，用 Laura Tacho [令人难忘的话](https://martinfowler.com/fragments/2026-02-13.html)来说：“开发者体验与智能体体验的维恩图是一个圆”。关键在于，精灵使用与人类相同的结构来理解代码库，因此良好的模块化和命名不仅帮助人类，也帮助它。Adam Tornhill 的文章是[这个观点的好例子](https://adamtornhill.substack.com/p/welcome-to-code-for-humans-and-machines)。

我们在这个环节中的一些零碎见解：

-   要评估架构的价值，我们需要关注理想的结果。内部设计质量归根结底在于[变更的难易程度](https://martinfowler.com/articles/is-quality-worth-cost.html)。问题在于，我们迄今为止学到的经验是否仍适用于智能体。
-   衡量设计质量的一种方法是查看 token 成本。如果同样的变更需要更少的 token，则表明架构更优。
-   好的架构需要时间才能展现其质量，短期内我们很难衡量。
-   为什么第三代编程语言（3GL）得以延续，而像第四代语言（4GL）、UML 等却没有站稳脚跟？因为这些编程语言恰好契合了人类对计算理解的理想点。
-   我们首次迎来了计算机关心代码质量的时刻。
-   未来的模型会直接编写机器码吗？如果会，人类将如何审查或指定需求？
-   我们应谨慎推测 LLM 未来可能的行为。相反，我们需要对 LLM 建立[机械同理心](https://martinfowler.com/bliki/MechanicalSympathy.html)，从而理解它们的工作方式以及如何最佳地使用它们。
-   一种工作流程：
    -   从待办事项列表中取出故事
    -   与智能体讨论
    -   达成一致后，创建架构决策记录（ADR）作为规范的持久记录
    -   生成任务列表
    -   让智能体完成它
-   我们需要抽象来与智能体沟通*（呼应 Unmesh Joshi 关于[构建概念模型](https://martinfowler.com/articles/what-is-code.html)的观点）*
-   我们经常在 LLM 生成的代码中发现重复，以及关注点混杂（例如领域逻辑与展示逻辑交织）——即使使用了良好的框架
-   让智能体在会话结束时生成解释性文档
-   夜间质量检查，生成报告供人类在早上处理
-   LLM 会参考现有代码，因此如果代码存在问题，LLM 会放大这些问题
-   我们应警惕将 LLM 代码与人类代码进行过多比较——人类代码在不同团队间差异巨大。

❄                ❄

Mathias Verraes 在关于此次研讨会的记述中，详细阐述了他[对这些软件设计问题的看法](https://verraes.net/2026/07/software-design-in-the-agentic-age/)。他提出了另一个担忧：我们需要良好的设计作为对冲依赖 AI 风险的手段。毕竟，我们不知道成本可能会涨到多高。我们看到政府阻止访问模型。我们看到公众反对 AI，抗议数据中心并呼吁监管。未来我们能在多大程度上依赖 AI 工具来维护和扩展我们的软件？

❄                ❄                ❄                ❄                ❄

Charity Majors 在[关于与 AI 合作的伦理](https://charitydotwtf.substack.com/p/make-ai-boring-again)一文中，精准阐述了我对这一话题的感受。她指出了 AI 固有的危害，既体现在模型创建（基于被盗数据训练）上，也体现在推理过程（内容垃圾、缺乏问责、技能退化）中。然而，她的结论与我一样：彻底放弃使用 AI 并谴责使用者，并不能带来任何伦理上的收益。这种纯粹主义对于一项如此强大且实用的技术而言，几乎无法提供实际帮助。

> 表达关怀的方式是亲身参与。让世界变得更美好的方法是深入泥潭，利用手头的一切技能和资源去建设它。推动变革的方式是参与其中。
>
> 是的，我们都有份。是的，我们都身陷其中。这一点无需争辩。但你要如何对待这份信念感？是将不适转化为团结与行动，还是通过抽身于系统之外来安抚良心？哪种方式更能帮助那些正在受伤害的人？

她关于如何参与的建议并不惊人，但这并不奇怪。在[未来软件开发研讨会](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html)上，我召集了一场关于这个问题的讨论，同样没有得出什么惊人的结论。话虽如此，我向来算不上什么活动家，所以我的想象力可能有限。

❄                ❄                ❄                ❄                ❄

Gergely Orosz 遇到了一个案例：他的一篇文章因一份明显伪造的 DMCA 投诉而[从谷歌搜索中被删除](https://blog.pragmaticengineer.com/pollen-tried-to-remove-my-article-about-callum-negus-fancey-and-google-is-assisting-to-it/)。

> 似乎任何人都可以提交虚假的版权投诉，从而将自己不喜欢的文章从谷歌搜索索引中移除。这件事就是这样发生的。我完全不知道是谁提交了这份版权投诉。更不知道是谁声称自己是版权所有者？因为我是唯一的版权所有者！

他找到了这份 DMCA 投诉，投诉人名为“Ellie Piee”，其个人资料显示居住在布韦岛——一个靠近南极洲、无人居住的挪威属地。投诉称 Gergely 的文章抄袭了《纽约邮报》一篇题为《乐队指挥奏响胜利和弦》的文章。但 Gergely 的文章是《Pollen 的崩塌内幕：“融资 2 亿美元”却拖欠员工工资》，两者之间没有一句相同。显然，与 Pollen 有关的人有动机这么做，我希望由此引发的[斯特赖桑德效应](https://en.wikipedia.org/wiki/Streisand_effect?ref=blog.pragmaticengineer.com)能让他们自食恶果。

❄                ❄                ❄                ❄                ❄

404 media 发布了一系列（付费墙后）报道，内容涉及企业意识到 token 成本失控所带来的影响。他们获取了来自花旗、亚马逊等公司的[泄露的 Slack 聊天记录、内部仪表盘、电子邮件及其他材料](https://www.404media.co/companies-are-throttling-employees-ai-use-because-its-too-expensive/)。

企业正敦促员工使用性能较弱的模型，甚至完全切断前沿模型的访问权限。某公司仪表盘显示，其代币账单已从2025年8月的500万美元飙升至2026年5月的1500万美元，预计本财年总支出将超过1.2亿美元。

404此前报道过[埃森哲正采取措施减少代币使用量](https://www.404media.co/the-tokenpocalypse-is-here-companies-are-scrambling-to-stop-spending-so-much-on-ai/)。最大问题并非软件工程采用[智能体编程](https://martinfowler.com/bliki/AgenticProgramming.html)，而是员工通过AI"消耗代币"完成诸如将PDF转为演示文稿等任务。他们发现自身及客户都在应对代币成本的指数级增长。不可避免的是，在咨询公司花费大量时间敦促客户大量使用AI后，如今他们又开始提供控制这些成本的服务。

另一篇帖子指出，降低代币成本的方法之一是让AI工具[像穴居人一样说话](https://www.404media.co/companies-are-making-claude-and-codex-talk-like-cavemen-to-stop-ais-soaring-costs/)，使用[技能/插件](https://github.com/JuliusBrussee/caveman?ref=404media.co)实现。

404的免费播客对此有精彩总结：[AI代币末日已至](https://www.youtube.com/watch?v=Sia4LZGNkVs)。

❄                ❄                ❄                ❄                ❄

我在美国国庆日（恰逢建国250周年）周末后分享这些思考。历史学家布雷特·德弗罗以[对《独立宣言》的细致解读](https://acoup.blog/2026/07/04/collections-on-the-declaration-of-independence/)来纪念这一事件——这份文件常被谈论却鲜少被阅读。这很可惜，因为它篇幅不长，影响却非同凡响，且不仅限于如今的美国。

> 正如我们将看到的，《独立宣言》在发布时就被视为一份激进、可能引发爆炸性变革的文件。而它确实引爆了世界：1775年的世界由君主制主导，仅有极少数传统共和国（这一点不容忽视！）。宣言的种子传播缓慢，但它帮助创造的世界中，自由民主制虽远未普及（生活在不自由社会的人口始终多于自由社会），却已成为世界事务中最具经济和文化主导地位的阵营——这是前所未有的。这份宣言以其独特方式，不仅重塑了十三个殖民地，更如水流渗入岩石缝隙（或我家的地板缝），缓慢而坚定地重塑了整个世界。

德弗罗为这份文本的世界投下光芒，揭示其历史背景——一个与当今读者成长环境截然不同的世界。其中关于自然法、人人权利平等、政府权力应来自被统治者同意的论断，如今看来几乎不言自明，但在1776年却是极为激进的思想。我发现，阅读这样的历史有助于理解当今世界的面貌，并让我对当前事务的戏剧性获得更广阔的视角。
