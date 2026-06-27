---
title: >-
  Build real agentic apps using CUGA: two dozen working examples on a
  lightweight harness
url: 'https://huggingface.co/blog/ibm-research/cuga-apps'
url_hash: f0c4ab4675063190d80d9c7b42197c8f73faedb5
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-23T12:51:55.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[回到文章](https://huggingface.co/blog)

[在 GitHub 上为 CUGA 加星](https://github.com/cuga-project/cuga-agent)

> **太长不看版** — 构建一个智能体主要涉及管道工程：工具、状态、护栏、从单个智能体扩展到多个。CUGA（`pip install cuga`），全称可配置通用智能体（Configurable Generalist Agent），是 IBM 为企业打造的智能体框架，负责处理这些工作，你只需编写工具列表和提示词。我们构建了二十多个单文件应用来证明这一点。在此完整阅读其中一个，然后了解同一个智能体如何无需重写即可在生产环境中自主运行并受管控。

大多数智能体应用在开始做任何有用的事情之前，都要先花一周时间搭建管道。你选择一个框架，连接模型客户端，编写工具适配器，构建某种将状态流式传输到 UI 的方式，然后还要决定这个智能体到底是用来做什么的。有趣的部分总是最后才到来。

[CUGA](https://github.com/cuga-project/cuga-agent) 颠覆了这一点。它是来自 IBM 的开源智能体框架，为你处理规划、执行循环、工具调用和状态管道。剩下的才是真正属于你的部分：智能体可以访问哪些工具，以及你告诉它做什么。为了展示这在实践中的感觉，我们构建了 [cuga-apps](https://github.com/cuga-project/cuga-apps)：二十多个小巧、可运行的应用，每个都是一个封装了单个 `CugaAgent` 的 FastAPI 文件，从电影推荐器到 IBM Cloud 架构顾问，应有尽有。它们的存在就是为了被阅读和复制。你可以[点击浏览实时展示](https://huggingface.co/spaces/ibm-research/cuga-apps)。

本文详细讲解其中一个应用，指出该框架为你省去了哪些工作，并展示当同一个代码需要受管控地投入生产时，它会走向何方。无需先学习新框架。如果你写过 FastAPI 路由，你就能读懂每一行代码。

## [](#why-a-harness-not-a-framework)为什么是框架，而不是又一个新框架

对于这个领域的任何事物，一个合理的问题是它让你免于编写什么。CUGA 的答案是：围绕一个 `model` 的编排工作，否则你每次都得重新构建。

它在行动之前先规划，然后通过工具调用和生成代码（CodeAct）的组合来执行。在一个运行二十步的长任务中，大多数智能体失败的原因是丢失了中间结果，然后在下一轮重新推导（通常推导错误）；CUGA 会保存这些状态，并运行一个反思步骤，该步骤可以捕捉到错误的调用并重新规划，而不是盲目地继续执行。正是这种机制，使得它在 AppWorld 和 WebArena 等智能体基准测试中名列前茅，而不是靠手动调优。

你也可以通过配置而非代码来设定成本/延迟的权衡：快速、均衡和精确三种推理模式，代码执行则在你信任的任何沙箱（本地、Docker/Podman 或 E2B 云端）中进行。相同的智能体定义，不同的调节旋钮。这个旋钮的重要性远超表面所见。大多数框架都假设底层运行着前沿模型，并依赖它来在计划偏离时进行恢复；而 CUGA 则自行完成这项工作。规划、反思步骤、确保长程运行不偏离轨道的变量追踪——这些都是框架承担的工作，否则这些负担将落在模型身上。这正是让一个较小的开源模型能在通常无法胜任的场景下保持稳定的原因。这也是为什么托管应用运行在 gpt-oss-120b 上，而非前沿 API 上。通常的做法是运行你能调用的最大模型；而 CUGA 的信念是，一个较小的开源模型就已足够。

CUGA 的各个组成部分并非独一无二。不同之处在于，它们被预先组装好了，因此你只需配置它们，而无需将它们拼接在一起。你接触的 API 很小——用一个工具列表和一个提示词构建一个 `CugaAgent`，然后执行 `await agent.invoke(...)`。这一行之下的所有内容都是框架。

具体来说，这包括可互换的工具（OpenAPI、MCP 和 LangChain 函数都以相同方式绑定）、带有变量管理和自我修正的长程规划（这是 **2025年7月25日至2026年2月6日期间 [AppWorld](https://appworld.dev/) 排名第一** 以及 **2025年2月25日至2025年9月25日期间 [WebArena](https://webarena.dev/) 排名第一** 背后的机制）、声明式护栏、基于 **A2A** 的多智能体委派、由 Docling 驱动的 RAG，以及通过一个环境变量切换提供商（`pip install cuga`，然后使用 OpenAI、watsonx、Ollama 等）——每一项都是你原本需要自行构建的功能。名称的第一个词就体现了其作用：*可配置*；困难的部分已经处理好了，你的工作就只剩下完成任务本身。

## [](#one-app-start-to-finish)一个应用，从开始到结束

这是 IBM Cloud 顾问——一个能为架构推荐真实 IBM Cloud 服务的智能体。整个应用只用一个文件：一个包含智能体工厂、工具和提示词的 `main.py`，外加一个小型 UI。

[![ibm_cloud_advisor cuga-app 的结构：main.py 文件布局，一个内联的 @tool (search_ibm_catalog) 调用 IBM Cloud Global Catalog API，同时与一个 MCP 网络搜索工具位于同一个工具列表中，以及一个强制要求“先查目录再推荐”的系统提示词。](https://cdn-uploads.huggingface.co/production/uploads/649d9ad1500fd8d51a675a93/UWUOaGwQ7pCVGWT7-Vbg6.png)](https://cdn-uploads.huggingface.co/production/uploads/649d9ad1500fd8d51a675a93/UWUOaGwQ7pCVGWT7-Vbg6.png)

整个智能体就是这样：

```
def make_agent():
    from cuga import CugaAgent
    from _llm import create_llm

return CugaAgent(
        model=create_llm(
            provider=os.getenv("LLM_PROVIDER"),
            model=os.getenv("LLM_MODEL"),
        ),
        tools=_make_tools(),
        special_instructions=_SYSTEM,
        cuga_folder=str(_DIR / ".cuga"),
    )
```

四个参数。模型来自一个小型工厂函数 (`create_llm`)，该函数根据环境变量与 OpenAI、Anthropic、watsonx、LiteLLM 或 Ollama 通信。应用代码中没有任何部分知道背后运行的是哪个模型。`cuga_folder` 是这个应用保存其状态和任何策略的地方。承载应用功能的两个参数是 `tools` 和 `special_instructions`。

这些工具混合了本地函数和托管函数：

```
def _make_tools():
    from langchain_core.tools import tool

@tool
    def search_ibm_catalog(query: str) -> str:
        """搜索 IBM Cloud Global Catalog，查找真实的 IBM Cloud 服务。
        在推荐服务之前务必调用此函数，以验证服务是否存在。"""
        ...  # 调用目录 API，返回 JSON
```

```python
from _mcp_bridge import load_tools
web_tools = load_tools(["web"])

return [search_ibm_catalog, *web_tools]
```

每个应用都遵循相同的模式：MCP工具与内联工具的分工。通用、无状态的能力来自共享的MCP服务器；`load_tools(["web"])` 拉取网络搜索功能，无需你自行托管。而应用特有的逻辑则以内联方式定义为普通Python函数，例如 `search_ibm_catalog`，其文档字符串就是智能体判断何时调用它的依据。你只需编写属于自己的那一个工具，其余部分直接借用。

云顾问的提示词要求智能体在提及任何服务前先搜索目录，推荐三到七个服务并说明每个服务在设计中的角色，且绝不能编造服务名称。最后这条规则至关重要：推荐不存在的IBM Cloud服务的智能体比没有智能体更糟糕，因此提示词强制每次推荐前先进行目录查询。以有序步骤编写并明确"禁止编造"规则的提示词表现良好；而以角色人格编写的提示词则会偏离方向。

这就是整个应用：一个工具、一个流程、四行构造代码。其周围的FastAPI路由是普通的Web代码：浏览器向`/ask`提交问题，实时面板轮询`/session/{thread_id}`端点获取状态。没有数据库；状态是每个`thread_id`对应的Python字典，仅由智能体通过其工具写入。当智能体在运行过程中调用工具时，面板会立即重绘。UI不是逻辑的二次拷贝，而是智能体所修改状态的视图。

## [](#the-convention-that-does-the-heavy-lifting)承担重任的约定

有一个细节容易被忽略，却至关重要：每个内联工具都返回相同的小型信封结构。成功时返回`{"ok": true, "data": {...}}`；失败时返回`{"ok": false, "code": "...", "error": "..."}`。

这看起来像模板代码，实则不然。CUGA的规划器能优雅地处理**声明式**失败（"地理编码未返回结果，跳过该部分继续执行"），但会在**未声明**的失败上卡住——原始堆栈跟踪在规划过程中冒泡，导致运行脱轨。在所有应用中，那些工具从未向智能体抛出裸异常的应用都能可靠运行。一个看似枯燥的约定，却是智能体能否恢复运行的关键区别。

上述分工之所以有效，前提是通用部分已在某处运行。应用反复需要的能力——网络搜索、维基百科/arXiv、地理编码与天气、金融报价等——托管在**7个公共MCP服务器（36个工具）**上，运行于IBM Code Engine，无需认证。一个小型桥接器自动解析它们的URL，而[在线演示](https://huggingface.co/spaces/ibm-research/cuga-apps)内置了**MCP工具浏览器**，让你在将其接入智能体之前，就能通过表单调用任意工具。

## [](#a-library-not-a-demo)一个库，而非演示

有两打精心打磨的应用，其意义远超任何单个应用：一旦你读过了云顾问，就等于读过了所有应用。它们共享一个骨架——电影推荐器将IBM目录工具替换为`knowledge` MCP服务器，网络研究者几乎完全依赖`web`——因此cuga-apps实际上是一个起点目录。你克隆仓库，找到最接近你创意的应用，然后编辑其工具列表和提示（[HOW\_TO\_BUILD\_AN\_APP\_FAST.md](https://github.com/cuga-project/cuga-apps/blob/main/cuga-apps/docs/HOW_TO_BUILD_AN_APP_FAST.md) 和 [ADDING\_AN\_APP.md](https://github.com/cuga-project/cuga-apps/blob/main/cuga-apps/docs/ADDING_AN_APP.md) 详细介绍了这一过程）。有些应用甚至是通过将一份规范文件和一行简要说明交给编码助手生成的——模型能复制的规律性，意味着你也能学会。在克隆任何东西之前，你可以[在实时画廊中逐一浏览每个应用](https://huggingface.co/spaces/ibm-research/cuga-apps)。

这些应用还按家族分类，因此无论你在构建什么，总有一个应用已经涵盖了所需的部分。有一个研究集群（Paper Scout按引用次数对arXiv论文进行排名；Wiki Dive和Web Researcher进行引用综合），一个日常生产力集合（城市简报、旅行、食谱、路线），一个文档和媒体组，对PDF、音频和视频进行RAG处理，一个运维角落监控实时指标，以及一个基于真实IBM产品文档的企业示例。Ouroboros是一个七智能体潜在客户生成系统；打开它了解多智能体架构。Meetup Finder通过Playwright驱动无头Chromium，从Meetup、Luma和Eventbrite（这些平台都关闭了公共搜索API）提取结构化活动；打开它了解浏览器自动化，这是CUGA的起点，也是其在WebArena上取得强劲成绩的基础。

克隆前有两个注意事项。真正的目录位于内部的`cuga-apps/cuga-apps/apps/`目录中，而不是外部的那个。此外，并非所有应用都同样精致，因此UI将它们标记为“展示”或“附加应用”，并默认显示“展示”；从云顾问或电影推荐器开始，以获得一个可用的基线。

## [](#keeping-your-agent-within-the-boundaries)将智能体保持在边界内

一个搜索目录的演示智能体风险较低。将同样的模式用于写入文件、运行shell命令或触及生产环境的场景时，问题就变了：如何阻止它做出让你后悔的事？

CUGA在运行时中解决了这个问题，而不是事后添加一个包装器。开源智能体附带了一个策略系统，你将策略附加到同一个智能体对象上：

```
await agent.policies.add_intent_guard(
    name="阻止强制推送",
    keywords=["--force", "--no-verify"],
    response="已阻止：不允许使用破坏性git标志。",
)
```

这是一个意图守卫，是六种策略类型之一，每种策略都回答了团队在让智能体自由运行前会问的问题：

-   **意图守卫**——它能直接拒绝请求吗？
-   **工具审批**——它能在风险工具运行前暂停等待人工确认吗？
-   **工具指南**——我能否在不重写工具的情况下，指导特定工具的使用方式？
-   **剧本**——我能否为重复性任务固定一个已知良好的流程？
-   **输出格式化器**——我能否强制最终响应符合要求的格式？

第六种类型 `CustomPolicy` 是当上述策略都不适用时的应急方案。时间节点的把握至关重要，因为策略执行并非单一阶段：意图守卫（Intent Guard）会在智能体选择工具前检查请求，工具审批（Tool Approval）在智能体生成代码并检查代码所用工具后执行，而输出格式化器（Output Formatter）仅在最终消息生成后触发。触发条件也不仅限于关键词匹配——它们存储在 `sqlite-vec` 数据库中并通过语义匹配，因此策略会根据用户的*意图*触发，而非仅靠精确关键词。可基于语义相似度、智能体状态或特定工具触发来匹配。策略本身存放在构造函数生成的 `.cuga` 文件夹中，与代码版本化共存，而非游离在独立配置中。

如需查看实际示例，请打开 [Ouroboros](https://github.com/cuga-project/cuga-apps/tree/main/cuga-apps/apps/ouroboros)——一个包含七个智能体的线索生成应用，为其主管智能体附加了三个策略（意图守卫、工具引导和输出格式化器），因此该应用在同一文件中同时演示了治理机制和多智能体架构。

## [](#growing-past-one-agent)超越单一智能体

当应用超越单一对话循环时，有两个扩展机制至关重要。当单个智能体因上下文过载（工具过多、证据繁杂）而难以应对时，可将任务拆分。`CugaSupervisor` 将工作委派给专门的 `CugaAgent`，每个智能体拥有独立的工具、提示词和隔离的上下文，主管仅需判断将子任务交给哪个专家。无论底层有多少工具，其规划空间始终保持精简；某个工具出现故障时，仅影响单次委派而非整个运行流程。专家智能体甚至不必是本地部署——可通过 A2A 协议连接外部智能体，以相同方式委派任务。新增能力只需添加专家，无需重写协调器。

另一个扩展机制封装的是知识而非工具：智能体技能（Agent Skills），即包含 `SKILL.md` 操作手册的文件夹，仅在任务需要时由智能体加载到上下文中，避免单个提示词承载所有可能需要的知识。两者均使用相同的构建模块（工具、提示词、状态、策略），只是组合层级更高。

前文提到的线索生成应用 Ouroboros 将这一模式具体化。其主管智能体管理七个专家（侦察员、网站审计员、客户之声分析员、联系人查找员、技术栈扫描员、收入估算员以及综合撰写推销邮件的专家）。每个专家作为技能加载到 `CugaAgent` 中，主管通过自动生成的 `delegate_to_<名称>` 工具调用它们。新增第八个专家只需一行工厂代码，无需重写协调器。如需了解端到端的多智能体架构，可阅读其 `main.py` 和 `ARCHITECTURE.md` 文件。

还有第三个扩展，它指向技能本身。借助 [ALTK-Evolve](https://agenttoolkit.github.io/altk-evolve/)（CUGA 的岗位学习框架），智能体可以从自身运行中优化技能，让今天完成的任务使明天更快、更准确。专家加载的 `SKILL.md` 最终会包含智能体在您编写内容之外学到的东西。同样的构建模块，只是现在使用一个就能教会下一个。您不再需要重复提示上周已经解决过的问题。

## [](#governed-by-construction)由构造约束

治理在堆栈中的位置决定了生产流程的走向。一个极简的智能体库会提供良好的原语，而将治理（策略、审批、审计、身份）留给您自行组装。CUGA 选择了另一条路径：策略、人工审批、`.cuga` 状态文件夹和自托管从一开始就是框架的一部分，而非后来添加的层。

当您将智能体投入生产时，这会改变工作方向。您不需要为原本为开放访问构建的系统添加控制；控制平面已经存在。受治理的路径是默认选项，而不受治理的捷径则需要您主动选择。因此，剩下的任务很明确：收紧围绕少数真正接触外部世界的工具的沙箱，而不是为它们发明治理机制。

## [](#where-the-same-agent-ends-up)同一个智能体的归宿

这就是回报，也是这一切如此构建的原因。由于框架小巧、开源、与模型无关，并且已经自我治理，您在笔记本电脑上编写的智能体与在严格受限部署中运行的智能体是同一个。您不需要移植它，只需重新部署它。

这是 [IBM Sovereign Core](https://www.ibm.com/products/sovereign-core) 构建的基础，也是我们接下来将 CUGA 推进的方向。[我们单独撰写了相关细节](https://community.ibm.com/community/user/blogs/shikha-srivastava1/2026/04/30/open-by-design-generalist-and-prebuilt-agents-in-t)，但简而言之：Sovereign Core 在我们所谓的边界隔离下运行 CUGA 智能体：数据、控制平面和执行引擎位于同一逻辑边界内，智能体在租户自己的工作空间中运行于临时、隔离的容器中。模型也在那里运行。部署默认使用完全气隙隔离运行在您基础设施内的 `gpt-oss-120b`，工具仅通过每工具审批访问私有 VNET。每个推理步骤都会将 OpenTelemetry 追踪发送到租户内的 Grafana Tempo 后端，没有遥测数据回传。没有任何内容离开边界。

智能体定义无需更改即可实现这一点；改变的是其周围的部署。而之所以可能，是因为以上所有内容——能力、策略和模型选择——都存在于一个您可以阅读的运行时中。这是我们构建它时下的赌注：当智能体的运行时是一个黑箱时，主权只是一个承诺；但当它是开放代码时，主权是您可以验证的东西。您克隆的应用和您编写的智能体都是同一个开放运行时，这一主张正是基于此。

不过，开发者真正能带走的核心收获是：一个智能体应用可以只是一个你装在脑子里的文件。你真正需要写的只有工具和提示词。这些应用是可供学习的库，而不是密封的演示。当风险升级时，治理机制已经内置于运行时中——你无需重建智能体就能确保安全。

## [](#next-steps)下一步

克隆仓库并运行一个应用。托管的 MCP 服务器意味着你不需要第三方密钥，只需要一个 LLM 提供商。本文中的应用运行在开放权重的 **`gpt-oss-120b`** 上——这与托管画廊和我们的 Sovereign Core 部署使用的模型相同——但由于模型只需一行代码即可切换（`create_llm` 读取单个环境变量），你可以将任何应用指向 OpenAI、Anthropic、watsonx 或本地 Ollama 模型，无需修改代码，而且使用本地模型完全没有 API 成本：

首先查看我们的快速入门指南[这里](https://github.com/cuga-project/cuga-apps#1--an-inline-tools-only-app-fastest-path)。如果你想设置所有应用程序，请确保 Docker 正在运行，然后按照以下步骤操作。

```
git clone https://github.com/cuga-project/cuga-apps.git
cd build
cp .env.example .env          # 设置你的 LLM 提供商 + 密钥；为使用它们的应用添加 TAVILY_API_KEY /
                              # OPENTRIPMAP_API_KEY / ALPHA_VANTAGE_API_KEY
docker compose up --build     # 首次构建较大（cuga + Chromium + MCP 依赖）
# 打开 http://localhost:8080
```

然后打开 `apps/ibm_cloud_advisor/main.py` 并从头到尾阅读——这是内联工具加 MCP 模式最清晰的示例。修改系统提示词，添加一个工具，观察行为的变化。MCP 工具浏览器列出了每个托管工具，并带有直接调用它的表单，这是在将工具接入智能体之前检查管道连接的快捷方式。

所以试试吧。`pip install cuga`，克隆 [cuga-apps](https://github.com/cuga-project/cuga-apps)，然后运行一个应用——或者先[点击浏览实时画廊](https://huggingface.co/spaces/ibm-research/cuga-apps)。框架位于 [cuga-agent](https://github.com/cuga-project/cuga-agent)，项目主页是 [cuga.dev](https://cuga.dev/)。如果出现问题、应用行为异常，或者你有想法，我们很乐意倾听：提交 issue、发起 PR、放入你自己的应用，或者直接联系我们——这个仓库就是为了不断扩展而建的，我们会阅读所有收到的反馈。

## [](#resources)资源

-   [cuga-apps](https://github.com/cuga-project/cuga-apps) — 本文中的应用、MCP 服务器和 UI
-   [cuga-apps/apps](https://github.com/cuga-project/cuga-apps/tree/main/cuga-apps/apps) — 二十多个精良的单文件智能体应用（内部目录；从这里克隆）
-   [cuga-apps/mcp\_servers](https://github.com/cuga-project/cuga-apps/tree/main/cuga-apps/mcp_servers) — 应用借用的共享 MCP 服务器（网络、知识、地理、金融、代码、文本等）
-   [实时应用画廊 + MCP 工具浏览器](https://huggingface.co/spaces/ibm-research/cuga-apps) — 每个应用都配有启动按钮，以及直接调用每个托管 MCP 工具的表单
-   [cuga-agent](https://github.com/cuga-project/cuga-agent) — CUGA 运行时和策略系统
-   [cuga.dev](https://cuga.dev/) — CUGA 项目主页（`pip install cuga`）
-   [开放设计：Sovereign Core 中的通用和预构建智能体](https://community.ibm.com/community/user/blogs/shikha-srivastava1/2026/04/30/open-by-design-generalist-and-prebuilt-agents-in-t) — IBM 社区关于 CUGA 如何在 Sovereign Core 中运行的帖子（Srivastava、Marreed、Thomas，2026 年 4 月）
-   [IBM Sovereign Core](https://www.ibm.com/products/sovereign-core) — 产品页面
