---
title: The test suite as a regression sensor
url: >-
  https://martinfowler.com/articles/sensors-for-coding-agents.html#TheTestSuiteAsARegressionSensor
url_hash: 356f0193fc2e92ed79031f712c94301b02d57677
source: Martin Fowler
source_url: 'https://martinfowler.com/feed.atom'
date: 2026-05-27T15:01:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
在我们的代码库中，通常需要关注和监控多个维度：功能正确性（按预期工作）、[架构适应性](https://www.thoughtworks.com/insights/decoder/f/fitness-functions)（足够快速/安全/可用）以及可维护性。我在此将可维护性定义为：使代码库能够随时间轻松、低风险地变更——[也称为“内部质量”](https://martinfowler.com/articles/is-quality-worth-cost.html)。因此，我不仅希望今天能快速做出修改，也希望未来同样如此。同时，我不希望在每次修改（或由AI进行修改）时，都担心引入错误或导致适应性下降。我通常会在AI生成的代码库中，首先从可维护性出现裂痕的迹象中发现问题：当一个小调整需要修改大量文件时，或者当修改开始破坏原本正常工作的功能时。

内部质量问题对AI代理的影响，与对人类开发者的影响类似。在一个混乱的代码库中工作的代理，可能会在错误的位置寻找现有实现，因未注意到重复代码而产生不一致，或者被迫加载超出任务所需的上下文。

在本文中，我将描述自己如何尝试使用各种传感器，来帮助人类和AI反思代码库的可维护性，以及我从中学到的经验。

## 应用场景

我正在为社区管理员开发一个内部分析仪表盘，该仪表盘从多个API组合中读取聊天空间活动、参与度和人口统计数据，并在Web前端展示这些数据。

![概览图展示了应用前端、后端以及4个外部API——Google Chat、Google People、Employee API、Gemini API](https://martinfowler.com/articles/sensors-for-coding-agents/sensors-example-application.png)

图1：示例应用：Web UI、服务层和外部API。

技术栈为TypeScript、NextJS和React。后端从这些API中读取并整合数据。该应用已存在一段时间，但为了这些实验，我使用AI从头重建了它。

几乎没有关于代码质量和可维护性的指南（例如Markdown文件）提供给AI，我想看看仅依靠传感器反馈，它能做到什么程度。

### 所有传感器概览

![传感器概览图：编码会话期间、集成到流水线后、定期运行以及生产环境中的运行时反馈](https://martinfowler.com/articles/sensors-for-coding-agents/sensors-example-overview.png)

图2：传感器的运行位置：初始编码会话期间、流水线中、按计划运行以及生产环境中。

以下是我在通往生产环境的路径上设置的传感器概览。

**编码会话期间**

这些传感器与代理持续并行运行，提供快速反馈。

-   类型检查器（计算型）
-   ESLint（计算型）
-   Semgrep，内部应用安全团队指定的 SAST 工具（计算型）
-   dependency-cruiser，运行结构规则以检查内部模块依赖关系（计算型）
-   测试套件结果，包括测试覆盖率（计算型——尽管测试套件由 AI 生成，因此是以推理方式创建的）
-   增量突变测试（计算型）
-   GitLeaks 作为预提交钩子的一部分运行，我认为它也是一个传感器，因为它会在代理尝试提交时提供反馈（计算型）

**集成后——流水线**

相同的计算型传感器在 CI 中再次运行。会话内传感器在开发过程中为代理提供早期反馈。CI 流水线在干净的基础设施上以及集成后确认结果。

**重复性**

以较慢节奏运行的传感器，用于检测随时间累积的漂移，而非即时发生的错误。

-   安全审查，提示源自我们内部应用的安全检查清单（推理型）
-   数据处理审查，提示描述诸如“绝不应将任何用户名发送到 Web 前端”等内容（推理型）
-   依赖项新鲜度报告，首先运行脚本获取库依赖项的年龄和活跃度，然后由 AI 生成包含潜在升级、弃用等建议的报告（计算型与推理型）
-   模块化与耦合度审查（计算型与推理型）

在了解这些背景后，让我们深入探讨第一类传感器。

### 基础工具与模型

在构建应用程序的过程中，我混合使用了 Cursor、Claude Code 和 OpenCode（按使用频率排序）。我的默认模型通常是 Claude Sonnet，对于某些规划和分析任务，我使用 Claude Opus，而对于实现任务，我经常使用 Cursor 的 composer-2 模型。

## 静态代码分析：基础代码检查

我将从在这个应用中使用 ESLint 的经验开始分享。像 ESLint 这样的基础代码检查工具主要针对单个文件和函数层面的可维护性风险。

### 针对典型 AI 缺陷的规则

根据我的经验，静态代码分析中最容易处理的 AI 失败模式包括：

-   函数的最大参数数量
-   文件长度
-   函数长度
-   圈复杂度

然而，这些规则在 ESLint 的默认预设中甚至没有激活，我必须先为它们配置最大值。希望静态分析工具能够发展，为 AI 使用提供更好的预设。一些研究表明，人们也开始发布专门针对已知代理失败模式的 ESLint 插件规则集，比如 [Factory 的这个插件](https://github.com/Factory-AI/eslint-plugin)，其中包含关于要求测试文件或结构化日志等规则。

### 自我修正的指导

传感器的目的是向代理提供反馈，使其能够自我修正。理想情况下，我们希望为这种自我修正提供额外的上下文——一种良好的提示注入方式。为此，我构建了一个自定义的 ESLint 格式化器，以覆盖一些默认消息——当然，这自然是在 AI 的帮助下完成的。

以下是关于 `no-explicit-any` 警告的指导示例。

我们希望所有内容都有类型定义，以便更容易避免错误，尤其是针对关键概念。但我们也希望避免用不必要的类型使代码库变得杂乱。请对此做出判断。如果你选择不引入类型，请用以下方式抑制警告：
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- (说明原因)

### 管理警告——现在更可行了？

静态代码分析已经存在很长时间，然而，即使团队已经设置了相关工具，他们往往也无法一致地使用它。原因之一在于随之而来的管理开销。要有效利用这种分析，团队需要保持“整洁的环境”，否则指标只会变成噪音。特别是像上面 `no-explicit-any` 这样的警告很棘手，因为你并不总是想修复它们——这取决于具体情况。而逐个抑制这些警告一直让人感觉繁琐，并且像代码中的噪音。

借助编码代理，我们现在或许有机会实现那个干净的基线。在上面的指导文本中，代理被要求做出判断，并允许在代码中抑制警告。这使得抑制操作保持可控、可见且可审查。

对于阈值，比如最大行数或最大允许的圈复杂度，我在 lint 消息中告诉代理，如果它认为在特定情况下重构不必要或不可能，可以稍微提高阈值。这并不会永久抑制阈值，只是提高它，这样如果未来情况变得更糟，规则会再次触发。约束得以保留，而无需强制做出二选一的抑制或遵从选择。

### 观察

-   查看AI创建的异常（抑制的警告、提高的阈值）是我开始代码审查的一个好起点。
-   AI经常决定提高圈复杂度阈值，但当我进一步推动时，它提出了很好的重构建议。这是唯一一个AI这样做的类别，后来我发现我对此没有设置自我纠正指导，因此没有明确指示说阈值提高应该是绝对例外。这表明自定义lint消息确实能产生显著影响。
-   有时我希望在代码的不同部分以不同方式处理规则。以`no-console`为例，当AI使用`console.log`时，我会指出问题。在后端，我希望它改用日志组件；在前端，我可能希望完全不使用直接日志记录，或者至少需要使用不同的日志组件。这是自我纠正指导力量的另一个例子，也展示了AI在语义判断和分析警告管理方面的帮助。
-   我一直在关注规则之间的权衡案例。目前唯一看到的例子来自`max-lines`和`max-lines-per-function`规则。我观察到AI根据这些传感器反馈进行了大量有用的重构，将代码拆分为更小的函数和组件。然而，在React前端，我注意到一个令人担忧的趋势：由于值通过越来越小的组件链传递，组件拥有大量属性。关于AI在类似权衡中做出一致决策的能力，我尚未获得有价值的观察结果。

### 主要收获

总体而言，我对静态分析能覆盖的方面之多感到惊喜。我多次提醒自己过去它为何未被充分利用，以及发生了什么变化：成本效益平衡。成本降低了，因为借助AI创建自定义脚本和规则变得更加便宜。效益也增加了：分析结果帮助我初步了解许多卫生因素——这些因素在我自己编写代码时甚至不会频繁出现，因此我可以先排除常见的AI错误。

然而，我不禁思考，这会不会也带来一种虚假的安全感和质量幻觉？毕竟，这类检查工具过去使用较少的原因之一，正是它们存在局限性，而我们一直警惕将其作为质量的简化指标。静态分析无法捕捉到许多更语义化的质量方面，AI能否与这些工具协同，充分填补这一空白，仍有待观察。此外，每当我激活一组新规则时，都会在代码中发现新的所谓问题。其中总是混杂着无关紧要的事项和真正重要的问题。因此，我担心代理会收到过量的反馈，陷入过度工程化重构的漩涡。

## 静态代码分析：依赖规则

基础的代码检查主要关注文件或函数内部的质量与复杂度。接下来，我开始研究那些能够为我和代理提供跨文件、跨模块边界可维护性反馈的传感器。历史上，这一领域的分析工具甚至比基础检查工具更少被使用。

为了探索那些能帮助我们和AI在代码库中保持良好模块性的传感器的潜力，我研究了三个方面：

-   依赖规则（确定性）
-   耦合分析（确定性与推断性）
-   模块化审查（推断性）

先从依赖规则说起。在应用实现进行到大约一半时，我与代理合作，为其设计了一个分层模块结构。我请它帮我编写[`dependency-cruiser`](https://github.com/sverweij/dependency-cruiser)规则来强制执行这些分层。

![](https://martinfowler.com/articles/sensors-for-coding-agents/sensors-structure-chativity.png)

图3：分层模块结构与依赖规则

例如，其中一条规则强制规定`clients`文件夹中的代码绝不能从`services`文件夹导入任何内容：

{
  name: "clients-no-services",
  comment:
    "API客户端不得依赖于其上方的编排层。 " + LAYERS,
  severity: "error",
  from: { path: "^server/clients/", pathNot: "/\\_\\_tests\\_\\_/" },
  to: { path: "^server/services/" },
},

与ESLint消息类似，我也扩展了错误消息，使其成为自我修正的指南，并整体回顾了分层概念：

ERROR  clients-no-services
  API客户端不得依赖于其上方的编排层。
  \[层级: routes -> services -> clients + domain; 服务编排: 通过clients获取数据，通过domain进行计算 -- 无I/O，无SDK，不了解数据获取。\]

### 观察

- 如果没有AI，我不可能这么快就制定出这些规则。该工具的配置语法学习成本很高，而AI几乎完全消化了这部分成本。
- 在我引入规则后，代理有几次违反了规则，但随后根据`dependency-cruiser`的反馈自行纠正，因此它确实帮助我维护了文件夹的概念。
- 我还用同样的方法为前端React Hook的结构引入了约定。
- 我必须想办法在AI开始在这个结构之外创建新文件夹时进行捕捉，于是制定了一条规则：每个新文件都必须位于预定义的文件夹结构中。

### 主要收获

在我引入这些规则时，代码的文件夹结构已经变得有些杂乱无章。我可以看到规则如何帮助代理清理这些混乱，并在此后持续执行这些层级。因此，我发现它相当有效地替代了用Markdown指南描述代码结构的方式。不过，这类工具仅限于通过导入、文件名和文件夹结构来表达的内容。

## 静态代码分析：耦合数据

接下来，我尝试从代码库中提取典型的耦合指标，即每个文件的传入和传出导入及调用次数。

我没有使用任何现有工具，而是让一个编码代理编写了一个应用程序，借助TypeScript编译器生成这些指标，这样我就能在实验中获得最大的灵活性。我让它添加了两个接口：一个Web界面，提供多种不同的指标可视化，供我人工查看；一个命令行界面（CLI），可以将这些指标提供给编码代理。

![](https://martinfowler.com/articles/sensors-for-coding-agents/sensors-coupling-dashboards.png)

图4：耦合指标：供人工查看的Web可视化界面和供代理使用的CLI。

### 供人工查看

这些可视化大多是一些成熟的概念，比如依赖结构矩阵（DSM）。我发现它们解读起来很繁琐，尽管它们是通过“氛围编码”生成的，并且肯定可以改进，但我认为这更多与数据的性质有关。这些数据非常详细，需要大量的上下文和经验才能解读，并将其映射到更高级的最佳实践。因此，我觉得这类工具在审查AI修改过的代码库时，仍然无法真正减轻人类的认知负担。

### 供AI使用

我让一个代理访问这个自定义CLI（`coupling-analyser`），并让它基于数据生成一份报告，包括如何改进关键问题的建议。

以下是我提示词的一个片段——我重现这个主要是为了向你展示，我实际上并没有给它太多关于什么是好的或坏的模块化的指导，我主要委托模型自行解读什么是好、什么是坏：

# Modularity & Coupling Analysis Report

## 1. Context

**Target:** TypeScript codebase at `/path/to/project`  
**Analysis tool:** `npx coupling-analyser report`  
**Scope:** All TypeScript source files under `src/`  
**CLI invocation:** `npx coupling-analyser report --threshold 0.3 --min-connections 2`

## 2. Executive Summary

- **Overall posture:** Moderate modularity with 3 critical hotspots and 5 high-risk modules.
- **Top issue #1:** `src/services/dataService.ts` has fan-out of 14 — a clear god module.
- **Top issue #2:** `src/utils/helpers.ts` participates in a 3-module cycle with `src/processors/transform.ts` and `src/validators/schema.ts`.
- **Top issue #3:** `src/components/Table.tsx` has 8 incoming dependencies from unrelated feature modules, violating the stable-abstractions principle.

## 3. Findings from the Tool

### Hotspots (highest coupling scores)

| Module | Coupling Score | Fan-In | Fan-Out | Risk Level |
|--------|---------------|--------|---------|------------|
| `src/services/dataService.ts` | 0.87 | 12 | 14 | Critical |
| `src/utils/helpers.ts` | 0.76 | 9 | 7 | High |
| `src/components/Table.tsx` | 0.72 | 8 | 5 | High |
| `src/processors/transform.ts` | 0.68 | 6 | 4 | High |
| `src/validators/schema.ts` | 0.65 | 5 | 3 | Medium |

### Cycles Detected

```
Cycle 1: src/utils/helpers.ts → src/processors/transform.ts → src/validators/schema.ts → src/utils/helpers.ts
```

### Mutual Dependencies

- `src/services/dataService.ts` and `src/services/authService.ts` have bidirectional imports (mutual dependency score: 0.4)

### Behavioural Highlights

- 78% of modules depend on `src/services/dataService.ts` either directly or transitively.
- `src/utils/helpers.ts` is imported by 9 modules across 4 different feature domains (user, billing, admin, reporting).

## 4. Interpretation (Modularity Lens)

### Cohesion vs. Spread of Change

The high fan-in on `src/services/dataService.ts` means a single change there can ripple across 12+ modules. This violates the **Single Responsibility Principle** — the module is doing too much.

### Stability vs. Dependency Direction

`src/utils/helpers.ts` is a utility module that should be stable (few reasons to change), but it has 7 outgoing dependencies, making it *less stable* than its consumers. This inverts the **Stable Dependencies Principle**.

### Fan-In/Fan-Out Intuition

- High fan-in + low fan-out = stable core (good) — *not observed here*
- High fan-in + high fan-out = unstable hub (bad) — *observed in dataService.ts*
- Low fan-in + high fan-out = leaf module that changes often (bad) — *observed in helpers.ts*

### Cycle Impact

The cycle between `helpers.ts`, `transform.ts`, and `schema.ts` means these modules cannot be tested, deployed, or reasoned about independently. Any change to one risks breaking the others.

## 5. Deep Dives for Each High and Critical Issue

### 5.1 Critical: `src/services/dataService.ts`

**What it is:** The central data orchestration module. It handles API calls, caching, data transformation, and state management.  
**Dependency neighbours (from CLI):**  
- Incoming: 12 modules (components, pages, other services)  
- Outgoing: 14 modules (API clients, validators, formatters, storage adapters)

**Responsibilities today:**
- Fetching data from 3 different API endpoints
- Caching responses in memory
- Transforming data for 4 different component types
- Managing loading/error states
- Providing a unified interface for all data access

**Why it hurts:**
- Any change to data fetching logic requires re-testing 12 consumers
- Adding a new API endpoint means modifying this single file, increasing its complexity
- The module has no clear abstraction boundary — it mixes concerns

**Design options:**

**Option A: Split by domain (recommended)**
- Create `src/services/userDataService.ts`, `src/services/billingDataService.ts`, `src/services/reportingDataService.ts`
- Each handles its own API calls, caching, and transformations
- Keep a thin `src/services/dataService.ts` as a facade that delegates

**Option B: Split by concern**
- Create `src/services/dataFetcher.ts` (API calls only)
- Create `src/services/dataCache.ts` (caching logic)
- Create `src/services/dataTransformer.ts` (transformations)
- Consumers compose these as needed

**Why the new design is better:**
- **Fewer cycles:** No module depends on a monolithic hub
- **Clearer dependency direction:** Domain services depend on infrastructure modules, not vice versa
- **Smaller surfaces:** Each new module has 2-4 incoming dependencies instead of 12
- **Test seams:** Can mock individual domain services without mocking the entire data layer
- **Align with change vectors:** Adding a new API endpoint only touches one domain service

**Future change risk:**
- *Adding a new API endpoint:* Currently requires modifying `dataService.ts` and potentially breaking 12 consumers. With Option A, only the relevant domain service changes.
- *Swapping caching strategy:* Currently requires modifying `dataService.ts` and re-testing all consumers. With Option B, only `dataCache.ts` changes.
- *Shipping a feature independently:* Currently impossible because all features share the same data service. With Option A, each feature can own its data service.

### 5.2 High: `src/utils/helpers.ts`

**What it is:** A general-purpose utility module with 7 outgoing dependencies.  
**Dependency neighbours (from CLI):**  
- Incoming: 9 modules across 4 feature domains  
- Outgoing: 7 modules (including `transform.ts`, `schema.ts`, `apiClient.ts`, `logger.ts`, `config.ts`)

**Responsibilities today:**
- String formatting utilities
- Date manipulation
- Data validation helpers
- Logging wrappers
- Configuration access

**Why it hurts:**
- It's a "kitchen sink" module that mixes unrelated concerns
- Its outgoing dependencies create a cycle with `transform.ts` and `schema.ts`
- Changing any utility function risks breaking 9 consumers

**Design options:**

**Option A: Split by utility category**
- `src/utils/stringUtils.ts`
- `src/utils/dateUtils.ts`
- `src/utils/validationUtils.ts`
- Remove logging and config access (move to dedicated modules)

**Option B: Invert dependencies**
- Make `helpers.ts` depend only on standard library types
- Move the logging and config access to the modules that need them
- Break the cycle by removing the dependency on `transform.ts` and `schema.ts`

**Why the new design is better:**
- **Fewer cycles:** Breaking the cycle allows independent testing and deployment
- **Clearer dependency direction:** Utilities should depend on nothing (or only standard library)
- **Smaller surfaces:** Each utility module has 1-3 consumers instead of 9
- **Test seams:** Pure utility functions are trivially testable without mocking
- **Align with change vectors:** Changing date formatting doesn't risk breaking string utilities

**Future change risk:**
- *Adding a new date format:* Currently requires modifying `helpers.ts` and potentially breaking 9 consumers. With Option A, only `dateUtils.ts` changes.
- *Swapping logging framework:* Currently requires modifying `helpers.ts` and re-testing all consumers. With Option B, only the dedicated logging module changes.
- *Shipping a utility independently:* Currently impossible because of the cycle. With Option A or B, each utility can be extracted to its own package.

### 5.3 High: `src/components/Table.tsx`

**What it is:** A reusable table component with 8 incoming dependencies from unrelated feature modules.  
**Dependency neighbours (from CLI):**  
- Incoming: 8 modules (user list, billing history, admin dashboard, reporting, etc.)  
- Outgoing: 5 modules (helpers, dataService, styles, types, eventBus)

**Responsibilities today:**
- Rendering tabular data
- Sorting, filtering, pagination
- Row selection and actions
- Responsive layout
- Accessibility features

**Why it hurts:**
- It's a "god component" that tries to handle every table use case
- 8 unrelated features depend on it, making any change risky
- It has too many responsibilities (sorting, filtering, pagination, selection, actions)

**Design options:**

**Option A: Split by feature (composition)**
- Create `src/components/Table/Table.tsx` (core rendering only)
- Create `src/components/Table/TableSortable.tsx` (adds sorting)
- Create `src/components/Table/TableFilterable.tsx` (adds filtering)
- Create `src/components/Table/TablePaginated.tsx` (adds pagination)
- Consumers compose these as needed

**Option B: Use slots/render props**
- Keep a single `Table.tsx` but make all features optional via render props
- Each feature module provides its own sorting/filtering/pagination logic
- The table component only handles rendering and layout

**Why the new design is better:**
- **Fewer cycles:** No feature module depends on a monolithic table component
- **Clearer dependency direction:** Feature modules own their table behavior
- **Smaller surfaces:** Each table variant has 1-3 consumers instead of 8
- **Test seams:** Can test core table rendering without mocking sorting/filtering
- **Align with change vectors:** Adding a new table feature doesn't require modifying the core component

**Future change risk:**
- *Adding a new table feature (e.g., drag-and-drop reordering):* Currently requires modifying `Table.tsx` and potentially breaking 8 consumers. With Option A, only a new `TableDraggable.tsx` is added.
- *Swapping sorting algorithm:* Currently requires modifying `Table.tsx` and re-testing all consumers. With Option B, only the sorting render prop changes.
- *Shipping a table feature independently:* Currently impossible because all features are coupled in one component. With Option A, each feature can be extracted to its own package.

## Observations

The LLM's analysis, grounded in the deterministic CLI output, identified the same coupling hotspots that would be visible in visual diagrams — but in a more digestible, actionable format. The key advantage was that the LLM didn't need to scan the entire codebase; it relied on the tool's precise metrics to focus its analysis on the most impactful issues.

However, the depth of the recommendations was limited by the quality of the CLI input. The tool only provides coupling scores and dependency lists — it doesn't reveal *why* modules are coupled (e.g., shared types, function calls, or event emissions). A more detailed analysis would require combining this with static analysis of import statements or runtime dependency tracking.

**Recommendation for future runs:** Use `--format json` and pipe the output to the LLM for more granular analysis, or combine with a tool like `madge` for cycle detection at the file level.

-   它提到最大的问题之一是一个初始化所有必要组件的工厂，但我特意引入这个工厂，是作为类似轻量级依赖注入框架的组件。
-   另一个问题是前后端之间共享的（`zod`）模式，被LLM称为“上帝模块”。但这其实是一种常见模式，用于在前后端之间创建显式契约。当后端和前端一起演进，甚至像我的情况那样共存于同一个仓库时，这并不算大问题。
-   当合法模式表现为高耦合枢纽时，需要在未来分析中提供抑制这些警告的方法，否则它们只会制造更多噪音。
-   它发现的一个有趣问题是：领域文件夹中的`index.ts`文件不加区分地暴露了`./domain`下的所有文件，并被大量地方导入。虽然这也是为层创建显式契约的常见模式，但它有利有弊，至少值得调查一下它是否适合这个代码库。

### 主要收获

上述例子表明，与基础代码检查相比，*好*与*坏*并没有明确定义，关键在于是否*合适*。而什么样的耦合是合适的，取决于大量上下文，而不仅仅是代码库的原始调用和导入图。因此，基于这个小实验，我认为这种耦合数据本身对AI并没有太大用处。

我能想到的这类数据更实际的用途是在代码审查的风险分类中。当我审查AI生成的代码变更时，了解变更文件的影响范围似乎很有用，这样我就能在例如某个有10多个调用者的文件被修改时更加关注。或者，AI审查代理可以利用这些数据来优先分配其计算资源。

## 静态代码分析：AI模块化审查

耦合数据实验的结果不尽如人意，可能有多个原因：

-   我关于分析内容的提示不够具体
-   耦合数据对AI没有用处
-   耦合数据过于浅层，缺乏完整代码的上下文

因此，我最后采取的做法是完全走推理路线，使用 [Vlad Khononov 的“模块化技能”](https://github.com/vladikk/modularity) 来分析代码库设计并发现模块化问题。事实证明，这非常富有成效！它为我提供了许多有趣的重构方向，这些方向显然能降低未来变更的风险。我第二次运行了这些技能，并让它们访问我的耦合分析 CLI。AI 主要是在数据中找到了印证，但并未发现任何额外发现。相反，它指出了 CLI 遗漏的许多问题。同样值得注意的是，第二次分析（没有第一次分析的上下文）又揭示了一个第一次分析未发现的问题。这是一个有用的提醒：在重要的情况下，通常值得多次运行基于 LLM 的分析，以获得更全面的图景。

### 观察结果

以下是结果中的一些亮点（使用的模型是 Claude Opus 4.7，与耦合分析相同）：

-   **重复的路由代码**——我的三个后端端点各自拥有独立的路由文件，且每个路由实现几乎完全相同。因此，每当我想对后端 API 的通用原则进行更改（例如引入请求 ID，或修改错误处理与日志记录方式），都不得不在多个文件中逐一操作。我刚刚才引入第三个端点，所以我认为尚未对此进行抽象化处理也情有可原。但根据我的经验，AI 代理通常不会在第三次或第四次重复某段代码时主动进行重构，它们很乐意直接复制粘贴。
-   **调用后端时的不一致性**——换句话说，这是语义重复的另一种形式。我的应用中有三个页面需要以相同的参数集（选定的聊天空间以及要分析的日期范围）调用后端。其中两个页面使用了相同的钩子和通用方法来实现这一功能，但当 AI 引入第三个页面时，它偏离了原有模式，以自己独特的方式重新实现了类似行为。这可能导致错误处理不一致，或者再次出现后端 API 原则变更时需要修改多个文件的问题。
-   **核心参数处理效率低下**——如上所述，应用中的所有页面都会将聊天空间 ID 和日期范围传递给后端。我之前就注意到，当我更改用户指定日期范围的方式时，AI 不得不为此修改大量文件——超过 40 个！所以我早已意识到这里存在问题，而分析结果也证实了这一点：“问题：请求参数在每个层级重复出现”。建议是引入一个封装所有这些参数的对象。AI 之前已经在一定程度上这样做了——但从未完全贯彻该对象的使用，导致了一团混乱的不一致。
-   **职责分配不当**——审查发现，我们本应仅负责模块连接的工厂中存在少量认证代码。它在用户未认证时实现了回退到模拟数据的功能。像这样出乎意料的代码位置，在添加新路由时存在被遗漏的风险。
-   **对可接受的高导入计数“枢纽”的更佳解读**——还记得我之前耦合分析发现的“上帝类”吗？模块化技能也注意到了它们，但在两种情况下都巧妙地指出，它们在此应用的上下文中具有其用途。我认为这要么归功于这些技能的良好提示，要么是因为该分析实际读取了代码内容，而我要求另一个分析仅依赖耦合数据。

### 主要收获

-   像 `dependency-cruiser` 这样的依赖解析器可以作为有效的实时传感器，强制执行一些基本的文件夹结构和依赖方向，但它们的能力有限。
-   AI 模块化审查是“垃圾回收”的一个绝佳范例，在给出强大提示时效果相当好。将其与实际耦合数据结合似乎并没有带来太大差异。如果能找到一种方法将其应用于提交中变更的文件，从而在流程中更早介入，那将非常理想，但我尚未对此进行探索。
-   我在构建了大部分代码库后进行了模块化审查，而自己并未事先应用此类审查——结果发现了一些相当令人担忧且非常有效的问题，这些问题未来会增加风险。这表明，如果没有人工审查和耦合方面的专业知识，再加上没有这些额外的 AI 审查，智能体肯定会累积[无意的技术债务](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html)。

总体而言，代码库设计和模块化似乎是一个仅靠计算传感器无法提供太多帮助的领域，需要 AI 来添加语义解释并权衡利弊。

## 作为回归传感器的测试套件

测试有多种用途——它们帮助我们思考和驱动设计，记录应用程序的预期行为（它们是最终极的规范！），并帮助我们检测回归，即告知我们何时因变更而破坏了已有功能。有效的回归测试在代码库的可维护性中扮演着重要角色，它们使变更更加安全。因此，在可维护性传感器的背景下，本节讨论的是测试套件作为回归传感器的作用。

当已有测试失败时，我们必须问自己一个问题：“我是否意外破坏了某些东西，因此需要更改实现？还是我故意改变了行为，因此测试需要适应这一新规范？”测试失败给了 AI 提出这个问题的机会。请注意，它可能并不总是做出正确的决定！但一个好的测试套件会降低 AI 破坏已有预期行为的概率。

在我的聊天分析应用中，我让智能体随时间编写了所有测试，除了手动测试和关注测试覆盖率外，几乎没有进行监督。我希望拥有一个完全由 AI 生成的测试套件，以便事后分析其回归有效性。

AI 生成测试而不进行审查的方法存在两个主要风险：

-   覆盖率并不是测试有效性的充分指标
-   测试可能测试的是错误行为——这比检查测试有效性要困难得多，是另一个话题。*本文仅关注测试有效性*，即假设我们的代码实现了预期行为，我们是否有能够捕获破坏性代码的测试。

**我们的工具箱里有什么？**

-   **覆盖率（$）**——追踪测试执行了代码的哪些部分，从而指示代码的哪些部分对测试可见或不可见。
-   **基于属性的测试（$）**——能够通过从定义的属性生成大量输入组合（而非手动构造示例）来发现缺失的逻辑测试用例。
-   **模糊测试（$$）**——能够通过向系统输入意外或畸形的输入来发现输入鲁棒性方面缺失的测试用例。
-   **变异测试（$$）**——能够通过引入微小的代码变异并检查测试套件是否能捕获它们来发现缺失的断言。

在我的应用程序中，我使用了覆盖率和变异测试，因为基于属性的测试和模糊测试不太适合我的用例。

### 变异测试

以下是我代码库中的一个小示例，用于说明变异测试如何帮助我们找到断言中的漏洞。代理在分析变异测试结果时为我创建了此图：

![变异测试分析图，针对映射器及相关代码](https://martinfowler.com/articles/sensors-for-coding-agents/sensors-mutation-example.png)

图 5：代码库中的变异测试示例。

`mappers.ts` 文件报告了 100% 的语句覆盖率和 75% 的分支覆盖率——但结果发现它没有单元测试，并且 [Stryker](https://stryker-mutator.io/)（我使用的变异测试工具）报告了 13 个存活体（即，在 Stryker 的 13 次代码变异后，测试套件仍然通过）。这种情况下的覆盖率很高，是因为代码库有一个大型的验收测试，最终调用了这些函数——覆盖率告诉我们某行代码被执行了，但并未说明其影响得到了验证。如果将来这个小的映射器辅助函数 `dvpToSchema` 被更改，它可能会破坏 UI 中数据图的显示。

### 观察

-   AI 在分析变异热点以及制定优先计划以提高测试质量方面非常有帮助。
-   Stryker 将结果写入一个巨大的 JSON 文件。为了帮助分析并避免意外堵塞上下文窗口，我编写了一个自定义脚本，帮助代理高效地查询 Stryker 的结果。这只是 AI 帮助我辅助 AI 的众多例子之一。

"""从命令行查询 Stryker 变异测试 JSON 报告。

用法：
python query\_stryker.py <report.json> <命令> [选项]

命令：
   summary 总体状态总计、变异分数、阈值。
   files 按文件细分，默认按变异分数升序排序。
   hotspots 存活体/无覆盖率变异体最多的行。
   tests 测试有效性：弱测试、未使用测试或顶级杀手测试。

示例

# 1. 整体健康状况——变异分数、状态细分、阈值通过/失败
python ./query\_stryker.py reports/mutation/mutation.json summary

# 2. 最差文件优先，附带操作提示（加强断言 vs 添加测试）
python ./query\_stryker.py reports/mutation/mutation.json files --top 10 -v

# 3. 同上，但仅针对你在 git 中更改过的文件（自动检测仓库）
python ./query\_stryker.py reports/mutation/mutation.json files --changed -v

# 4. 聚焦一个文件：每个（行、可操作计数、示例变异算子）
python ./query\_stryker.py reports/mutation/mutation.json hotspots --file server/services/ai-summaries.ts --top 30

"""

### 主要收获

目前似乎出现了一种趋势，即更倾向于端到端风格的验收测试。正如开头提到的，AI在生成测试方面已经变得非常出色，因此开发者让AI大量生成测试而很少审查，已成为相当普遍的现象。审查单元测试尤其繁琐。我并非主张完全不看测试——但我承认一个现实：认为人工审查所有测试是可持续的，或者认为人们真的会这样做，都是不切实际的。因此，在我们寻找AI编程未来合适的测试金字塔/冰淇淋蛋筒/松饼形状时，像[已批准场景](https://matteo.vaccari.name/posts/acceptance-tests-for-ai-assisted-development/)这样的技术正变得流行。如上所示，验收测试提高了覆盖率，但通常断言不多，这让我们对测试有效性产生虚假的安全感——而变异测试帮助我们监控这一差距。

当然，变异测试有一个实际限制：它非常消耗资源。在我的设置中，我没有持续运行它（像我的其他一些传感器那样），而是手动触发增量运行。

## 结论与待解问题

*计算型传感器*在文件和函数级别给我留下了最深刻的印象。跨文件关注点（如模块化和耦合性）则是另一回事，原始数据本身非常嘈杂，如果没有LLM的语义解释（即推理型传感器），用处不大。但我对通过良好提示所能获得的输出和建议印象深刻，也对其以不同方式、针对不同经验水平呈现信息的潜力印象深刻。

我在实验中没有看到，但怀疑可能成为更大问题的，是*传感器之间的冲突*。最大行数和每函数最大行数规则显示出一些紧张关系，将代码重构为越来越小的函数反而将复杂性推向了组件属性链。可能还潜伏着更多类似的权衡，随着时间的推移，这是否会以及如何成为问题，将值得关注。

为了更纯粹地观察传感器的效果，我在这个应用中完全没有使用*指南*。我很好奇指南和传感器之间的平衡将如何演变。一旦我们对一组传感器有了信心，哪些指南可以删除？传感器是否使使用较弱模型变得更加现实？我们如何保持指南和传感器之间的一致性，是否会找到某种方式将它们捆绑在一起，以便更容易维护？

在回归测试领域，我真正认识到，当我们决定将大部分测试交给AI时，*变异测试*变得多么关键……我想再次强调，关于测试的正确性，还有另一场完整的讨论需要进行！

虽然其中一些传感器确实提升了我对结果质量的信任，但它们并非能完全取代人类参与的魔法解决方案。不过，我确实感受到，在计算型传感器和推理型传感器作为我的合作伙伴时，我的审查体验和信任水平都得到了明显改善。

* * *
