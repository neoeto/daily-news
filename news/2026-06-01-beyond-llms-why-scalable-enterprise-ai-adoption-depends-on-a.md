---
title: 'Beyond LLMs: Why Scalable Enterprise AI Adoption Depends on Agent Logic'
url: 'https://huggingface.co/blog/ibm-research/agent-logic-and-scalable-ai-adoption'
url_hash: 65ae950e23b00581c384b0268c8ad6058e788654
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-01T13:51:18.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Nicholas Fuller 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/65b12ed52be9660f0b7e5f72/r230jdYzTFj_CYmKgpz78.jpeg)](https://huggingface.co/nfuller)

纵观人类历史，指南始终发挥着重要作用。史前文明就懂得利用太阳和月亮在陆地和海洋上远距离导航。随着时间的推移，各种旅程催生了地图的诞生，帮助人们更好地规划路线，缩短重复目的地的出行时间。几个世纪后，指南针的出现让航海者能够更精准地探索未知领域。而今天，GPS导航应用指引着我们的每一次出行。在当今的智能体AI时代，AI智能体无疑有潜力推动AI规模化应用，彻底改变我们所知的各行各业。然而，要实现这一潜力，需要一种智能的指南——即智能体逻辑——来提升智能体质量、成本效益，并最终赢得终端用户的信任。

**企业工作流与用例**

众多研究指出AI试点项目普遍失败，同时也有研究强调，AI需要深入企业工作流的核心才能实现规模化应用。\[1\] \[2\] 为深入理解这一现象及相关论断，有必要对企业工作流进行分析。这些工作流具有以下特点：

A. 动态且长期运行
B. 涉及大量API、数据库和服务
C. 通常受业务策略和/或法规约束

要让智能体在上述特性下有效运行，自然需要扩展模型上下文——前沿大语言模型固然具备这一能力，但代价是什么？是幻觉增加、令牌消耗上升吗？此外，能否为LLM配备一个智能指南（即GPS），使其在企业工作流核心实现智能体AI执行，从而带来更理想的结果？我们针对这些假设进行了测试，为IBM产品设计并构建了配备相应智能体逻辑的智能体，充分考虑了上述特性。这些产品涉及领域专家面临的一些最具挑战性的任务，这些专家负责关键任务型企业软件交付生命周期的各个阶段，包括：

1.  理解用遗留代码（Cobol / PL/1）编写的应用程序
2.  加速开发人员的测试生成
3.  主动响应事件，实现左移应用弹性
4.  自动化关键环境的合规现代化

在详细探讨每个领域之前，我们先定义智能体逻辑的特征。智能体逻辑是软件原语，例如知识图谱、算法、程序分析库，它们在智能体层（智能体框架内）运行，能够有意识地引导LLM朝着企业工作流的方向前进，从而缩小上下文空间。这样做往往能以更具成本效益的方式推动更优性能的结果。接下来，我们看看智能体逻辑如何在上述四个领域中实现这样的结果。

1.  理解用遗留代码（Cobol / PL/1）编写的应用程序——程序分析。\[3\]

IBM watsonx Code Assistant for Z（WCA4Z）用于通过AI和自动化加速大型机应用开发与现代化，配备了一个应用洞察代理（App Insights agent）用于应用理解——这是运行在IBM大型机上处理关键任务负载的企业客户的主要关注领域之一。该代理利用跨应用的深度静态分析，并在一个数据库模式中存储预索引表示，该模式涵盖数百个具有复杂语义的相互关联表，使代理能够检索精确、结构化的已有信息；从而提升答案准确性，减少令牌使用量，并最小化与语言模型（本例中为Mistral Medium 250B）的来回交互。当这种方法应用于多个关键任务遗留系统（最多100万行代码和1000个程序）时，相比仅使用前沿LLM的基线方法，应用理解性能保持略微优势，同时令牌消耗降低约30倍。

2. 通过Aster程序分析加速开发者的测试生成。[4]，[5]

Aster是一个基于IBM专有程序分析与数据预处理/后处理的库，用于基于代理生成单元测试、集成测试、API测试和变更测试；对多个开发者社区的分析表明，与各种开源工具或开发者编写的测试相比，其获得了更高的开发者评分。基于后者以及相比类似开源工具（集成测试）和零样本LLM及编码代理（单元测试）在行覆盖率、分支覆盖率和方法覆盖率上的优越基准测试（均在开源应用上测试），我们已在75多个Java IBM CIO应用（最多560个类和6.7万行代码）上使用Devstral 24B模型以预生产模式运行Aster。迄今为止的稳态结果显示，行覆盖率、分支覆盖率和方法覆盖率提升了20%至45%，同时在这些应用子集上相比最先进的编码代理性能更优，且令牌消耗低数个数量级（最多降低15倍）。这些结果的原因在于，程序分析输出（用于提示并“聚焦”LLM）结合用于增强覆盖率和修复运行时及编译错误的子代理，能够实现更高效的结果并显著降低成本。

3. 主动响应事件并实现左移应用韧性——基于知识图谱、程序分析库和调查（可观测性）驱动的编排。[6]，[7]

虽然第1和第2点所述的与应用相关的LLM上下文被“限制”在应用源代码中，但在已部署基础设施上对应用进行运行时管理时，底层IT全栈就会发挥作用。我们在此定义了一个知识图谱，其中包含实体（微服务、数据库/中间件服务、MELT等），并结合了领域专家的内隐知识。借助这样的图谱，并将LLM限定在局部边界推理中以处理非确定性结果，我们采用了一种可观测性驱动的方法，来缩减涵盖IT栈及底层应用源代码（若相关）的上下文空间，用于事件根因分析（及其他用例）。通过这种方法，利用等效的Instana数据模型，我们观察到专有的Instana“I3”（智能事件调查[8]）智能体相比使用GPT-5.1的ReAct智能体，在ITBench[9]评测中实现了高达4.0倍的性能提升。使用Gemini 3 Flash时，ReAct智能体的性能提升至仅比I3智能体低17%，但消耗的token数量是后者的1.6倍。我们已将此方法扩展到源代码领域，通过代码分析智能体（利用程序依赖图）和漏洞修复智能体（利用推理扩展）进行测试，同样在ITBench上验证了其优越性能。与最先进的编码智能体相比，我们的源代码分析和漏洞修复智能体（Gemini 2.5 Flash）在定位问题微服务（3.0倍）和修复缺陷（1.6倍）方面表现更优，同时分别节省了3.7倍和5.9倍的token消耗。该多智能体系统已在IBM Think大会上作为新发布的IBM Concert平台（用于左移IT运维）的一部分公布，并正在IBM CIO内部进行试点。[10]

4. 自动化关键环境的IT合规现代化——算法与自适应规划及编排。[11]

企业面临着日益复杂且碎片化的合规要求，迫使团队花费大量时间手动创建控制措施、评估和修复计划。缺乏集中化的知识，修复方案需手动编写，这带来了错误和安全漏洞的风险。由于合规工作复杂且涉及多个步骤，它需要跨专业智能体的协调性策略驱动自动化，而非人工努力或简单的AI提示。我们的多智能体系统通过算法将复杂任务分解为协调步骤，利用自适应规划、动态分解和工作流排序，并辅以持续反馈，以迭代方式识别修复方案并扩展评估范围，从而实现合规自动化。与使用固定规划策略的先前智能体（Claude 4 Sonnet）相比，其性能提升1.3至2.0倍（同样基于ITBench评测）。该方法将合规转变为持续引导的自我修正过程，显著改善了结果，尤其在复杂场景中，将成功率从个位数提升至高达+80%（Claude 4 Sonnet）。该多智能体系统及16,000多项数字化控制映射已在IBM Think大会上作为IBM Sovereign Core的一部分公布，集成了监控、漂移检测功能，并提供自动化证据生成，确保审计证据安全地保留在客户控制范围内。[12]

以上示例展示了智能体逻辑在减少大语言模型上下文、引导大语言模型以高性能和低成本方式遍历工作流核心方面的影响。此外，我们还将类似方法应用于两个案例研究：一个是在医疗领域使用可配置通用智能体及运行时（CUGA），另一个是针对IBM全球房地产的物理资产基于状态的维护。

**领域案例研究**

案例1：可配置通用智能体（CUGA）医疗基准测试——算法策略执行。[13]

以下健康保险客户服务示例简洁说明了为何在受监管环境中，智能体系统优于仅依赖大语言模型的对话模型。CUGA（可配置通用智能体）的策略系统实现了用于智能体治理的策略即代码，该策略在运行时独立于模型提示且无需微调即可执行。我们的实验表明，智能体的策略系统弥补了任务正确性方面的巨大差距，在所有模型系列（Claude Opus – 4.5、GPT OSS 120B和GPT – 4.1）中强制执行结构化工作流、安全意图处理、可靠工具使用和受控输出格式，准确率提升幅度在15%至26%之间。权限通过最小权限披露、明确合规规则和人工升级路径来执行。智能行为被提出，而权限由策略和监督机制行使。推理是自主的；决策权受到约束。CUGA也是IBM Think Sovereign Core发布的关键组成部分。

案例2：IBM全球房地产物理资产基于状态的维护——有向无环图。[14],[15]

企业维护系统收集大量资产数据，但无法有效整合这些数据，需要专家手动拼凑零散信号并做出决策，而缺乏统一、基于证据的洞察。我们最近推出的Maximo Condition Insights[16]智能体分析跨数千个资产和地点（传感器、工单、故障模式和事件分析）的大规模资产数据，使用结构化证据和验证循环可靠地识别问题、确定行动优先级，并以一致、可追溯的洞察支持决策。我们已在IBM全球房地产（GRE）内部试点该智能体（使用GPT OSS 120B），将资产分析时间从15-20分钟缩短至15-30秒（提升97%），并将资产审查覆盖率从约1%提升至约30%，覆盖超过120个地点和6000个物理资产。使用AssetOpsBench基准测试，Condition Insights智能体将无依据声明减少了57%，将冗长程度降低了35%，将规则合规性提高了30%，保持了接近零的矛盾，并将令牌使用量平均降低了77%，同时略微提高了诊断特异性。该智能体配备有向无环图，提供结构工程和操作上下文，以减少朴素提示下的无依据推理，而约束感知提示显著改善了规则遵循，减少了冗长程度，并降低了整体令牌消耗，同时未引入不稳定性。

**总结与参考文献：** 几个世纪以来，我们一直受益于各种指南，它们简化并提升了我们的生活。随着技术的发展，我们所使用的指南也在不断演进，使我们能够做得更多，并进一步缩小我们的地球村。随着这个智能体AI时代的到来，当我们寻求通过规模经济等方式进一步提升社会效率时，我们应延续这一趋势，充分利用智能体逻辑来简化模型上下文，并在核心层面智能地遍历企业工作流；只有这样，以最优运营成本实现可扩展的采用才真正可行。

\[1\] 《GenAI鸿沟：2025年企业AI应用状况》，MIT研究，[https://mlq.ai/media/quarterly\_decks/v0.1\_State\_of\_AI\_in\_Business\_2025\_Report.pdf](https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf)

\[2\] 《从AI项目到利润：智能体AI如何维持财务回报》，IBM IBV报告，[https://www.ibm.com/thought-leadership/institute-business-value/en-us/report/agentic-ai-profits](https://www.ibm.com/thought-leadership/institute-business-value/en-us/report/agentic-ai-profits)

\[3\] 《理解》，IBM Watson Code Assistant for Z，2026年2月27日，[https://www.ibm.com/docs/en/watsonx/watsonx-code-assistant-4z/2.x?topic=understand](https://www.ibm.com/docs/en/watsonx/watsonx-code-assistant-4z/2.x?topic=understand)

\[4\] R. Pan, R. Krishna, R. Pavuluri, 等，《ASTER：使用LLM进行自然语言和多语言单元测试生成 - IBM Research》，2025年4月30日，[https://research.ibm.com/blog/aster-llm-unit-testing](https://research.ibm.com/blog/aster-llm-unit-testing)

\[5\] R. Pan, R. Pavuluri, R. Huang, 等，《SAINT：基于程序分析和基于LLM的智能体的服务级集成测试生成》，2025年11月17日，[https://arxiv.org/abs/2511.13305](https://arxiv.org/abs/2511.13305)

\[6\] S. Jha, R. Arora, Bhavya, 等，《局部思考，全局解释：通过局部推理和信念传播进行图引导的LLM调查》，2026年1月25日，[https://arxiv.org/abs/2601.17915](https://arxiv.org/abs/2601.17915)

\[7\] S. Cui, R. Krishna, S. Jha, 等，《用于云应用中代码相关事件根因分析的智能体结构化图遍历》，2025年12月26日，[https://arxiv.org/html/2512.22113v1](https://arxiv.org/html/2512.22113v1)

\[8\] IBM Instana 和智能事件调查智能体：[https://www.ibm.com/new/announcements/resolve-incidents-faster-with-ibm-instana-intelligent-incident-investigation-powered-by-agentic-ai](https://www.ibm.com/new/announcements/resolve-incidents-faster-with-ibm-instana-intelligent-incident-investigation-powered-by-agentic-ai)

\[9\] S. Jha, R. Arora, Y. Watanabe, 等，《ITBench：评估AI智能体在多样化真实世界IT自动化任务中的表现》，2025年2月7日，[https://arxiv.org/abs/2502.05352](https://arxiv.org/abs/2502.05352)

\[10\] IBM Concert 平台：[https://www.ibm.com/new/announcements/from-insight-to-action-closing-the-gap-in-modern-it-operations](https://www.ibm.com/new/announcements/from-insight-to-action-closing-the-gap-in-modern-it-operations)

\[11\] Y. Watanabe, T. Yanagawa, H. Kitahara, A. Sailer，《使用GenAI CISO评估智能体实现IT合规自动化》，DZone教程，2025年12月12日，[https://dzone.com/articles/itbench-part-3-it-compliance-automation-with-genai](https://dzone.com/articles/itbench-part-3-it-compliance-automation-with-genai)

\[12\] IBM Sovereign Core：[https://newsroom.ibm.com/2026-05-05-think-2026-ibm-makes-digital-sovereignty-operational-with-general-availability-of-ibm-sovereign-core](https://newsroom.ibm.com/2026-05-05-think-2026-ibm-makes-digital-sovereignty-operational-with-general-availability-of-ibm-sovereign-core)

\[13\] S. Shlomov, A. Oved, S. Marreed, 等，《从基准到业务影响：在企业生产中部署IBM通用智能体》，2025年12月9日，[https://arxiv.org/pdf/2510.23856](https://arxiv.org/pdf/2510.23856)

\[14\] D. Patel, S. Lin, J. Rayfield, 等，《AssetOpsBench：对工业资产运营和维护中任务自动化的AI智能体进行基准测试》，2025年6月4日，[https://arxiv.org/abs/2506.03828](https://arxiv.org/abs/2506.03828)

\[15\] Fearghal O'Donncha, Nianjun Zhou, Natalia Martinez, 等，《使用异构数据进行工业维护的基于证据的推理》，[https://arxiv.org/abs/2603.08171](https://arxiv.org/abs/2603.08171)

\[16\] IBM Maximo 和 Condition Insights 智能体：[https://www.ibm.com/new/announcements/maximo-condition-insight](https://www.ibm.com/new/announcements/maximo-condition-insight)
