---
title: Adding MCP Tools to Reachy Mini
url: 'https://huggingface.co/blog/adding-mcp-tools-to-reachy-mini'
url_hash: 799726310b5a7d7717527ba73553b8284be14e2d
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-03T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

[![Alina Lozovskaya 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/63f5010dfcf95ecac2ad8652/vmRox4fcHMjT1y2bidjOL.jpeg)](https://huggingface.co/alozowski)

<figure><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/adding-mcp-tools-to-reachy-mini/reachy_mini_window.jpg" alt="Reachy Mini 望向窗外"><figcaption><em>Reachy Mini 不再需要望向窗外才能告诉你天气了</em></figcaption></figure>

Reachy Mini 对话应用现在可以使用托管在公共 Hugging Face Spaces 中的工具，通过 MCP 调用。你可以通过从 Hub 添加一个 Space，而不是编辑应用，来为你的机器人赋予新能力，比如查看天气或搜索网络。该工具在 Space 中持续运行，因此不会下载任何代码到你的机器上。你还可以发布自己的工具供其他人使用。

添加一个工具只需一条命令：

```
reachy-mini-conversation-app tool-spaces add pollen-robotics/reachy-mini-weather-tool
```

然后像往常一样启动应用：

```
reachy-mini-conversation-app
```

现在你可以直接询问：

```
今天巴黎的天气怎么样？
```

下面，我们将介绍什么是工具、配置文件如何控制机器人可以使用的工具，以及远程路径当前的局限性。

## [](#内置工具)内置工具

当你与机器人对话时，你得到的不仅仅是声音，而是一个能对对话做出反应的系统：机器人可以在适当的时候移动并做出非语言回应。我们这里要关注的是实现这一点的工具。工具是模型在对话过程中可以执行的操作：播放情感、移动头部、通过摄像头查看。每个工具都有一个名称和简短描述。模型读取这些信息，判断何时有用，调用它，并使用返回的结果。

目前，每个工具都是本地的，内置于应用中，其中大部分与机器人的身体相关：

| 工具 | 功能 |
| --- | --- |
| `move_head` | 排队执行头部姿势变化 |
| `dance` / `stop_dance` | 从舞蹈库中播放或清除舞蹈 |
| `play_emotion` / `stop_emotion` | 播放或清除录制的情绪片段 |
| `head_tracking` | 切换头部追踪偏移 |
| `camera` | 捕获一帧图像并分析 |
| `idle_do_nothing` | 在空闲轮次中明确保持空闲 |

## [](#配置文件如何控制工具)配置文件如何控制工具

代码中的工具只有在**配置文件**中启用后才可使用。配置文件是一个文件夹，包含两个关键文件：`instructions.txt`（提示词）和 `tools.txt`（启用的工具）。

`default` 配置文件启用了全套工具：

```
# profiles/default/tools.txt
dance
stop_dance
play_emotion
stop_emotion
camera
idle_do_nothing
head_tracking
move_head
```

如果某个名称不在 `tools.txt` 中，模型就无法调用它。

你也可以编写自己的工具：在配置文件（或 `external_tools/` 目录）中添加一个 Python 文件，为其指定名称和描述，然后将该名称列入 `tools.txt`。

目前有内置工具和自定义本地工具，`tools.txt` 决定哪些是激活的。这对于机器人的身体控制来说效果很好，并且保持了可信核心的简洁性。

## [](#本地工具的局限性)本地工具的局限性

这里的限制是每个工具都必须是本地 Python。对于 `move_head` 或 `play_emotion` 来说确实如此：它们需要与硬件通信并属于应用程序内部，但很多有用的功能与机器人本体无关，比如网络搜索、天气查询或信息检索。对于这些功能，将所有内容保持本地化主要会带来以下不便：

-   共享工具意味着要传递你的 Python 文件
-   更新工具意味着要再次发送这些文件
-   修改工具意味着要编辑应用程序，即使该功能实际上与应用程序是分离的

## [](#从-spaces-调用工具)从 Spaces 调用工具

远程工具增加了第三种类型，与你已有的内置工具和自定义本地工具并存，适用于那些更容易独立发布、共享和更新的功能：

-   内置机器人工具保持本地化且可信
-   可共享的远程工具可以部署在公开的 Hugging Face Spaces 中
-   你仍然可以使用 `external_tools/` 中的自定义一次性工具

这对于无状态功能（如搜索、天气和查询）非常适用：任何你想迭代开发但又不想改动应用程序本身的功能。而且由于任何人都可以发布兼容的 Space，共享工具和基于他人工作成果进行构建变得非常容易。

我们首先推出了两个金丝雀工具，作为测试新流程的小型测试工具：

-   [pollen-robotics/reachy-mini-search-tool](https://huggingface.co/spaces/pollen-robotics/reachy-mini-search-tool)
-   [pollen-robotics/reachy-mini-weather-tool](https://huggingface.co/spaces/pollen-robotics/reachy-mini-weather-tool)

它们足以测试整个功能：从 Hub 安装、发现远程工具、按配置文件启用，并让实时后端像调用内置工具一样调用它们。

要同时使用这两个工具，请在同一个配置文件中添加每个 Space 及其工具栈：

```
reachy-mini-conversation-app tool-spaces add pollen-robotics/reachy-mini-search-tool
reachy-mini-conversation-app tool-spaces add pollen-robotics/reachy-mini-weather-tool
```

现在机器人可以在同一对话中搜索网络和查询天气，这正是下面 `canary_web_search_weather` 配置文件所实现的功能。

## [](#安装-列出-移除)安装、列出、移除

```
# 安装并在当前激活的配置文件中启用
reachy-mini-conversation-app tool-spaces add <owner/space-name>

# 在指定配置文件中启用
reachy-mini-conversation-app tool-spaces add <owner/space-name> --profile <NAME>

# 仅安装不启用
reachy-mini-conversation-app tool-spaces add <owner/space-name> --install-only

# 列出已安装的 spaces
reachy-mini-conversation-app tool-spaces list

# 移除已安装的 space
reachy-mini-conversation-app tool-spaces remove <owner/space-name>
```

`add` 命令会验证 Hub 上的 Space，探测 MCP 端点，发现其工具，并默认将工具 ID 追加到当前激活配置文件的 `tools.txt` 中。当前激活配置文件默认为 `default`，除非你设置了 `REACHY_MINI_CUSTOM_PROFILE`。使用 `--install-only` 可以跳过此步骤。

> `tools.txt` 是守门员：远程工具只有在其 ID 出现在配置文件的 `tools.txt` 中时才会被激活，与你想要的内置工具一起。

### [](#清单文件的位置)清单文件的位置

已安装的源信息会持久化存储在：

-   托管应用模式下：`installed_tool_spaces.json`
-   终端模式下：`external_content/installed_tool_spaces.json`

## [](#工具命名)工具命名

每个已安装的 Space 会根据其 slug 派生一个本地别名，其中连字符、点和斜杠都会转换为下划线：

```
pollen-robotics/reachy-mini-search-tool → pollen_robotics_reachy_mini_search_tool
```

远程工具随后会使用双下划线进行命名空间隔离：

```
pollen_robotics_reachy_mini_search_tool__search_web
pollen_robotics_reachy_mini_weather_tool__get_day_brief
```

这样可以防止远程工具名称与内置工具冲突，并允许多个 Space 在同一配置文件中共存。

实现还会在可能时去除冗余的 Space 名称前缀，因此冗长的远程工具名称会变成更简洁的本地 ID。如果去除前缀会导致同一 Space 中的两个工具发生冲突，代码会回退到完整的命名空间名称。

此外，在注册层面还有重复安全检查：`Tool.name` 值在整个合并后的工具集中必须唯一。如果两个来源声称拥有相同的名称，应用会快速失败。

## [](#example-profiles)示例配置文件

为此，我们创建了两个聚焦的 canary 配置文件，将 MCP 实验与完整的实体工具集隔离开来。

第一个保留了一些富有表现力的工具（情绪、头部运动），并添加了网络搜索功能：

```
# profiles/canary_web_search/tools.txt
play_emotion
stop_emotion
idle_do_nothing
move_head
pollen_robotics_reachy_mini_search_tool__search_web
```

第二个与第一个相同，但在搜索之外还增加了天气工具：

```
# profiles/canary_web_search_weather/tools.txt
play_emotion
stop_emotion
idle_do_nothing
move_head
pollen_robotics_reachy_mini_search_tool__search_web
pollen_robotics_reachy_mini_weather_tool__get_day_brief
```

较小的实体工具集意味着 Reachy Mini 在回答来自网络的当前问题时，仍能做出富有表现力的反应。

## [](#why-the-prompts-matter)为什么提示词很重要

远程工具管道将工具引入模型，而提示词则决定模型如何使用它们。

这一点在搜索加天气的 canary 中尤为明显。像这样的组合问题：

```
我今天在波尔多需要带夹克吗，今晚市中心有什么重大活动吗？
```

至少有三种处理方式：先查天气再搜索、先搜索再查天气，或者在同一轮中同时进行。如果提示词模糊不清，模型会串行调用这些工具，造成不必要的延迟。因此，canary 的提示词成为了功能的一部分，而不仅仅是附带配置。

#### [](#canary_web_searchinstructionstxt)`canary_web_search/instructions.txt`

```
[default_prompt]

## CANARY 网络搜索规则
你有一个用于获取当前网络信息的远程工具。
当用户询问最新事实、新闻、实时可用性或任何可能近期发生变化的内容时，请使用它。

当搜索结果已经回答了问题时，直接用通俗语言回答。
以答案开头，不要谈论工具本身。
对于可能需要一点时间的远程查询，你可以用一句非常简短的英文确认，例如“让我查一下，马上回来”，然后继续。
除非用户明确要求其他语言，否则用英文回答。
如果结果片段不完整或有歧义，简要提及不确定性。
仅在链接有附加价值或用户要求来源时提及链接。

保持回答简短，采用口语风格，就像语音助手朗读出来一样。通常一两句话就够了。跳过开场白、列表、标题和填充内容。只给出用户需要的事实或直接答案。
```

#### [](#canary_web_search_weatherinstructionstxt)`canary_web_search_weather/instructions.txt`

```
[default_prompt]

## CANARY 搜索与天气规则
你有两个远程工具：
- 一个天气简报工具，用于获取某个地点的当日天气概况
- 一个网络搜索工具，用于获取更广泛的当前网络信息

使用天气工具查询今日天气状况、温度、降雨概率、日出日落时间，或是否需要带夹克等简单建议。
使用网络搜索查询新闻、活动、营业时间、旅行信息、严重警报或更广泛的当前背景信息。
```

When the user's question mixes a weather part and a current-info part (for example, "should I bring a jacket in Bordeaux today, and is there anything major happening downtown tonight?"), call both tools in parallel in the same turn. Do not wait for one result before starting the other unless the weather result is needed to narrow the search.

Then merge the results into a single short answer. Cover the weather part first, then the events or news part, in plain connected sentences. Do not label the sections or mention which tool gave which piece.

When the user asks about events, news, or what is happening, give them the actual answer from the search results: name specific events, venues, or headlines. Do not tell the user to check websites, visit listing sites, or look something up themselves. If the search returns nothing concrete, say plainly that you didn't find any notable events, rather than redirecting them elsewhere.

For remote lookups that may take a moment, you may give one very short English acknowledgment such as "Let me check that and I'll be right back," then continue.
Answer in English unless the user explicitly asks for another language.
Do not talk about tool usage unless the user asks.

Keep responses short and spoken-style, as if read aloud by a voice assistant. One or two sentences is usually enough. Skip preamble, lists, headers, and filler. Give just the fact or direct answer the user needs.

现在应用中有三种工具共享同一个注册表：内置工具、本地自定义工具和远程MCP工具，而配置文件仍然决定每个助手能访问哪些工具。一个精简可信的核心保持居中，而围绕它的可选能力可以添加、测试和替换，无需改动应用本身。

我们现在最好奇的是大家会构建什么。如果你发布一个工具空间，请打上 `reachy-mini-tool` 和 `mcp` 标签，方便他人找到。我们很期待看到 Reachy Mini 最终能实现什么！

*致谢：非常感谢 [Fabien Danieau](https://huggingface.co/FabienDanieau) 审阅本文并协助测试工作流，感谢 [Andres Marafioti](https://huggingface.co/andito) 协助测试，也感谢 [Remi Fabre](https://huggingface.co/RemiFabre) 和 Pollen Robotics 团队为远程工具工作流提供的创意和反馈。*
