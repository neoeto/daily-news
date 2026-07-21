---
title: What building Shippy taught us about building agents
url: 'https://huggingface.co/blog/allenai/shippy-tech-blog'
url_hash: 53e3149d2cc17d3edc5eb4f9e6836d13e5dc9847
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-15T17:29:41.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Kyle Wiggers 的头像](https://huggingface.co/avatars/fee5cceec7536851d7c6712760716a71.svg)](https://huggingface.co/Ai2Comms)

*Shippy 是一个面向高风险决策的海事 AI 智能体，在这里，错误答案会带来真实影响。以下是其背后的架构——以及我们将其融入 Ai2 其他环境平台的经验教训。*

[![Shippy 回答关于加纳专属经济区的实时查询](https://www.datocms-assets.com/64837/1783699893-shippy-technical-blog-final-version-google-docs-image-1.png)](https://www.datocms-assets.com/64837/1783699893-shippy-technical-blog-final-version-google-docs-image-1.png)

*Shippy 回答关于加纳专属经济区的实时查询。其响应展示了工作过程：边界来源、数据截止时间、查询时间戳，以及返回 Skylight 地图的深层链接，以便分析师验证每个数字。*

为保护海洋等高风险的运营领域构建 AI 智能体，首要问题是可靠性。对于海事分析师而言，一个错误答案可能让巡逻船偏离数英里，浪费本就紧张的资源，甚至将人员置于危险之中。

因此，当 [Skylight](http://skylight.global/) 团队着手构建 [**Shippy**](https://skylight.global/news/shippy-launch)（我们用于实时海事领域感知的 AI）时，真正的工作不在于模型本身，而在于构建一个我们能够信任的系统——确保其正确性、严守自身边界，并在广泛任务中保持稳定。而且，我们必须针对 Skylight 的实时数据（随着新卫星和船舶信号不断更新，而非静态快照）进行全部验证。

### [](#agent-anatomy-skills-soul-and-config)智能体解剖：技能、灵魂与配置

我们将 Shippy 这样的智能体视为三部分：**灵魂**、**技能**和**配置**。

**灵魂**是系统提示，定义了 Shippy 的角色设定和行为边界。**技能**告诉 Shippy 如何处理特定类型的请求。灵魂和技能共同被打包进一个 Docker 镜像——一个版本化、可部署的产物，定义了 Shippy 的*本质*。**配置**涵盖其他一切：使用哪个智能体框架（Shippy 使用的是 [OpenClaw](https://github.com/openclaw/openclaw)，一个开源智能体框架）、使用哪个 LLM（目前 Shippy 依赖 Claude Opus 4.6），以及运行时设置。API 密钥等机密在运行时注入；切换模型或框架只需更改配置，无需重新构建。

Shippy 的技能遵循与 Claude Code 和 Codex 等编码工具相同的 [agent-skills 规范](https://agentskills.io/home)——带有结构化前置元数据的纯 Markdown 文件。这确保了每项技能易于理解、可版本化且便于修改。Shippy 目前包含以下技能：

-   **查询 Skylight API**，获取事件（Skylight 呈现的船舶行为，如捕捞或两船之间的转运）和船舶数据
-   **查询专属经济区 (EEZ) 和海洋保护区 (MPA) 边界**
-   **解读船舶轨迹数据**，即船舶广播的位置和运动信号，基于 Skylight 模型（包括 [Atlantes](https://allenai.org/blog/atlantes)）已生成的活动分类进行扩展
-   **生成交互式地图链接**，让分析师能从 Shippy 聊天中的回答直接跳转到 Skylight 地图上的精确位置

例如，Skylight API查询技能将回答特定区域问题的完整工作流编码为指令。当分析师或用户询问“显示上个月巴拿马专属经济区内的捕鱼活动”时，该技能的指令会引导Shippy首先通过Skylight的区域API将“巴拿马专属经济区”解析为边界多边形，而非猜测或硬编码坐标；然后在该几何范围内查询捕鱼事件；将结果格式化并附上返回Skylight地图的深层链接；同时注明来自Skylight合作伙伴（如Global Fishing Watch或TMT）的任何船舶元数据。

向Shippy提出的单个问题可以同时调用多个技能。“是否有船舶在Cordillera de Coiba海洋保护区附近作业？”这一问题会调用Skylight技能进行数据查询、合作伙伴ProtectedSeas的数据库获取海洋保护区边界信息，以及船舶轨迹技能解读船舶行为。所有这些都在一次对话交互中完成。

“灵魂”定义了Shippy能做什么和不能做什么。它不会对船舶是否违法做出法律判定——这是由人而非智能体做出的决定。它也不会超出数据支持的范围进行推测。这些边界在系统提示中明确说明，而非隐含在微调中，因此可审计且易于修改。

### [](#deterministic-tools-for-a-nondeterministic-agent)为非确定性智能体打造的确定性工具

智能体是非确定性的。你无法控制模型决定做什么，但可以让它调用的工具变得可预测。为此，Shippy通过一个专门构建的命令行界面（CLI）与Skylight“对话”，该CLI调用API，而非自行发出原始调用。

我们的API有数十种输入类型、嵌套的过滤器对象、分页游标和复杂的几何输入。在早期原型中，我们让Shippy从头构建API调用。结果产生了大量细微错误：格式错误的分页导致结果静默丢失、几何编码错误，以及因误解过滤器类型而看似正确却返回错误数据的查询。

Skylight CLI将这些复杂性简化为可预测的接口。Shippy发出单个命令——`skylight events search`并附带类型化过滤器标志——CLI处理身份验证、分页和结构化输出。CLI还自带文档：详尽的`--help`文本和详细的错误信息为智能体（以及人类开发者）提供足够上下文，使其无需猜测即可从错误中恢复。其输出始终写入本地JSON文件，而非通过shell管道传输。早期，大型结果集会达到管道缓冲区限制或破坏下游工具（如`jq`）。写入磁盘可避免这两个问题，并让智能体在后续步骤中程序化访问查询结果。

CLI底层是一个[标准化API](https://api.skylight.earth/docs/)：多种资源类型——Skylight事件、船舶、区域、卫星图像、船舶轨迹等——可通过通用的搜索和聚合操作访问。API的输入和输出定义为带有字段级描述的类型化模式。

这种分层架构——类型化API、确定性CLI以及引用CLI命令的智能体技能——意味着Shippy的每个组件都可以独立测试。API拥有自己的测试套件。CLI可由人类或智能体操作。而智能体技能引用的CLI命令负责处理底层管道，这样Shippy每次调用Skylight API时都无需重新发明轮子。每一层都限制了下一层可能出错的范围。

[![Shippy架构图](https://www.datocms-assets.com/64837/1783702321-shippy-architecture.png)](https://www.datocms-assets.com/64837/1783702321-shippy-architecture.png)

### [](#sandboxed-hosting-and-isolation)沙盒托管与隔离

Skylight为遍布70多个国家的数百家政府机构和非政府组织提供服务。菲律宾的一名渔业官员拥有与其Skylight账户绑定的兴趣区域、船只监控列表和警报配置。当他们向Shippy提问时，智能体的API调用需要返回他们的数据，而且他们的对话历史绝不能对任何人可见。

每个用户都在自己独立的临时会话中与Shippy对话，而要在规模化场景下可靠地实现这一点，是该项目背后最重大的工程挑战之一。我们构建了**Mothership**，这是一个智能体托管平台，可为每个用户会话配置专用的Kubernetes部署。当用户打开对话时，系统会启动一组Pod，封装智能体运行时、其技能以及Skylight CLI。用户的Skylight JWT在配置时注入，确保智能体的API调用仅限于该用户的数据范围。

智能体在多步骤分析过程中写入的文件仅存在于该会话中，绝不会跨用户共享。在沙盒内部，智能体可以编写并运行代码、安装依赖项、导入数据集，并完成多步骤分析。在网络层面，沙盒仅限访问其所需的服务。

[![沙盒架构图](https://www.datocms-assets.com/64837/1783702321-sandbox-architecture.png)](https://www.datocms-assets.com/64837/1783702321-sandbox-architecture.png)

### [](#evaluating-an-agent-not-a-model)评估智能体，而非模型

大多数基准测试在静态问题上对通用AI进行排名。它们无法捕捉智能体接入真实工作流后的行为：如何选择工具、查询实时数据、对结果采取行动以及知道何时停止。因此，我们围绕Shippy的工作方式构建了自己的评估系统，对完整的智能体——模型、技能和沙盒——在实时数据上进行评分。

在我们的评估框架中，领域专家编写场景和评分标准，为每项任务选择适用的标准并设置权重，从而确保每项任务都根据其真正重要的方面进行评分。例如，对于渔业事件查询，数据准确性权重最高，边界解析和时间范围次之，来源归属和回复风格权重较低。领域专家还会将单个回复标注为正确或错误，为评判者提供评分依据。此外，领域专家还会对单个回复进行正确或错误的标注，为评判者提供评分所需的真实依据。

流程很直接：自然语言提示词经过沙盒运行，LLM 评判器对每个标准从0到1打分，并书面解释响应为何达标或未达标，加权总分再与固定通过阈值比对，如下方图表所示。

[![评估流程示意图](https://www.datocms-assets.com/64837/1783707731-eval-pipeline-updated.png)](https://www.datocms-assets.com/64837/1783707731-eval-pipeline-updated.png) *单个任务在我们的流程中如何评分。自然语言提示词经过沙盒运行，LLM 评判器对每个评分标准进行书面推理打分，加权总分根据固定阈值判定通过或失败。*

任务通过 [Harbor](https://www.harborframework.com/)（一个开放评估框架）执行。我们编写了一个 Harbor 插件，在正在测试的确切版本上启动一个真实的 Shippy 会话，并面对用户会遇到的相同真实数据。该测试套件针对特定版本的 Shippy 构建并行运行，生成带时间戳的结果文件以及与上次运行相比的分数变化报告。每当技能、模型或底层数据发生变化时，我们都会重新运行测试套件，任何在评估标准上出现性能倒退的 Shippy 版本都不会到达最终用户手中。

Shippy 在数据检索和防护栏任务中表现稳定，能正确拒绝军事情报请求、维护用户数据隔离，并准确归因信息来源。在我们最新一次运行中，最明显的模式包括：巡逻规划任务中 Shippy 越界给出战术建议而非决策支持、几何敏感查询中边界简化导致事件遗漏，以及一个案例中智能体编造了不存在的 CLI 命令。这些问题都直接指导我们下一轮技能改进。

[![Shippy 评估套件截图](https://www.datocms-assets.com/64837/1783707895-screenshot-2026-07-10-at-2-24-22-pm.png)](https://www.datocms-assets.com/64837/1783707895-screenshot-2026-07-10-at-2-24-22-pm.png) *Shippy 的评估套件在 Skylight 中运行：每个场景根据加权标准评分，评判器的推理过程可见，因此失败能直接指向需要修复的具体行为。*

### [](#where-were-headed)未来方向

我们正在分批次向早期用户开放 Shippy，并邀请他们进行压力测试——找出智能体回答不佳的问题以及可能需要加强的防护栏。以下是我们的下一步计划：

-   **智能体驱动的 UI 控制。** 目前 Shippy 返回地图链接；下一步它将直接驱动 Skylight 地图，移动至某个区域、应用筛选条件并调整时间范围。
-   **模型路由。** 并非每个问题都需要前沿模型，因此我们将简单查询路由到更小、更快的模型，将全量模型保留给复杂调查。
-   **跨线程记忆。** 对话历史在单个线程内持续存在，但上下文不会跨线程传递。我们正在构建记忆功能，使 Shippy 能携带持久性事实（例如分析师的管辖区域、偏好来源）并自动应用。这样，“显示本周捕鱼活动”就不需要每次都重新指定分析师的专属经济区。

我们在 Shippy 上的工作已经在影响 Ai2 其他领域对智能体的思考——最直接的是 EarthRanger（我们的野生动物保护平台）和 OlmoEarth（我们的地球观测工具开放套件）。Mothership 的设计初衷是通用化，能够承载其他智能体，因此虽然海事是我们应用的第一个领域，但我们预计它不会是最后一个。

* * *

*Shippy 由 Ai2 的 Skylight 团队构建。Skylight 是一个免费的海上态势感知平台，被 70 多个国家的 300 多个合作伙伴使用。*
