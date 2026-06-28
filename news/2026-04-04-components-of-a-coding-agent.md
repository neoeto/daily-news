---
title: Components of A Coding Agent
url: 'https://magazine.sebastianraschka.com/p/components-of-a-coding-agent'
url_hash: d0c7d5449da94eced3ffc9778e19b2b4727153b8
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-04-04T11:45:37.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - Rust
  - 创业
original_lang: en
truncated: false
---
在这篇文章中，我想探讨编码智能体与智能体框架的整体设计：它们是什么、如何工作，以及各个部分在实践中如何协同。我的《从头构建大语言模型》和《从头构建大推理模型》的读者经常问及智能体，因此我认为写一篇可供参考的文章会很有用。

更广泛地说，智能体已成为一个重要话题，因为近期实际LLM系统的进步不仅在于更好的模型，还在于我们如何使用它们。在许多实际应用中，外围系统（如工具使用、上下文管理和记忆）所起的作用与模型本身同样重要。这也解释了为什么像Claude Code或Codex这样的系统，在使用相同模型时，会比普通的聊天界面感觉强大得多。

在这篇文章中，我将阐述编码智能体的六个主要构建模块。

你可能熟悉Claude Code或Codex CLI，但为了铺垫，它们本质上是将LLM封装在应用层（即所谓的智能体框架）中的智能编码工具，以便在编码任务中更便捷、性能更优。

编码智能体是为软件工作而设计的，其显著特点不仅在于模型选择，还在于外围系统，包括仓库上下文、工具设计、提示缓存稳定性、记忆以及长会话连续性。

这种区分很重要，因为当我们谈论LLM的编码能力时，人们常常将模型、推理行为和智能体产品混为一谈。但在深入编码智能体的具体细节之前，请允许我先简要介绍一下更广泛概念之间的区别：LLM、推理模型和智能体。

LLM是核心的下一个词元模型。推理模型仍然是LLM，但通常是经过训练和/或提示，以在中间推理、验证或候选答案搜索上花费更多推理时计算的模型。

智能体是上层的一个层，可以理解为围绕模型的控制循环。通常，给定一个目标，智能体层（或框架）决定接下来检查什么、调用哪些工具、如何更新其状态以及何时停止等。

大致上，我们可以这样理解它们的关系：LLM是引擎，推理模型是增强版引擎（更强大，但使用成本更高），而智能体框架帮助我们使用模型。这个类比并不完美，因为我们也可以将传统LLM和推理LLM作为独立模型使用（在聊天UI或Python会话中），但我希望它能传达主要观点。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!if1o!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!if1o!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 424w, https://substackcdn.com/image/fetch/$s_!if1o!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 848w, https://substackcdn.com/image/fetch/$s_!if1o!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 1272w, https://substackcdn.com/image/fetch/$s_!if1o!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!if1o!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png" width="659" height="166.56043956043956" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:368,&quot;width&quot;:1456,&quot;resizeWidth&quot;:659,&quot;bytes&quot;:840893,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!if1o!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 424w, https://substackcdn.com/image/fetch/$s_!if1o!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 848w, https://substackcdn.com/image/fetch/$s_!if1o!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 1272w, https://substackcdn.com/image/fetch/$s_!if1o!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F09a4d839-d572-4eab-a2ee-47f644a746e5_3501x885.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图2：传统LLM、推理LLM（或推理模型）以及封装在智能体框架中的LLM之间的关系。</em></figcaption></figure>

换句话说，智能体就是在环境中反复调用模型的系统。

简而言之，我们可以这样总结：

-   *LLM*：原始模型

-   *推理模型*：经过优化，能够输出中间推理轨迹并更频繁进行自我验证的LLM

-   *智能体*：一个循环系统，使用模型以及工具、记忆和环境反馈

-   *智能体框架*：围绕智能体的软件脚手架，用于管理上下文、工具使用、提示、状态和控制流

-   *编码框架*：智能体框架的一种特殊情况；即针对软件工程的特定任务框架，用于管理代码上下文、工具、执行和迭代反馈

如上所述，在智能体和编码工具的语境中，我们还有两个流行术语：*智能体框架*和（智能体）*编码框架*。编码框架是围绕模型的软件脚手架，帮助其有效地编写和编辑代码。而智能体框架则更广泛，不局限于编码（例如，想想OpenClaw）。Codex和Claude Code可以被视为编码框架。

无论如何，更好的LLM为推理模型（涉及额外训练）提供了更好的基础，而框架则能更好地发挥这个推理模型的作用。

当然，LLM和推理模型本身也能解决编码任务（无需框架），但编码工作不仅仅关乎下一个token的生成。它很大程度上还涉及仓库导航、搜索、函数查找、差异应用、测试执行、错误检查，以及将所有相关信息保持在上下文中。（程序员可能知道，这是一项费脑力的工作，这就是为什么我们在编码时不喜欢被打断:)。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!l4hd!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!l4hd!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 424w, https://substackcdn.com/image/fetch/$s_!l4hd!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 848w, https://substackcdn.com/image/fetch/$s_!l4hd!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 1272w, https://substackcdn.com/image/fetch/$s_!l4hd!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!l4hd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png" width="700" height="312.0192307692308" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:649,&quot;width&quot;:1456,&quot;resizeWidth&quot;:700,&quot;bytes&quot;:189650,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!l4hd!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 424w, https://substackcdn.com/image/fetch/$s_!l4hd!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 848w, https://substackcdn.com/image/fetch/$s_!l4hd!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 1272w, https://substackcdn.com/image/fetch/$s_!l4hd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F76f2c37e-1996-4f30-96cd-e2e555169873_2227x992.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图3. 编码框架结合了三层：模型家族、智能体循环和运行时支持。模型提供“引擎”，智能体循环驱动迭代式问题解决，运行时支持提供管道。在循环中，“观察”从环境收集信息，“检查”分析该信息，“选择”决定下一步，“执行”实施该步骤。</em></figcaption></figure>

这里的要点是，一个好的编码框架可以让推理模型和非推理模型比在普通聊天框中感觉强大得多，因为它有助于上下文管理等。

正如上一节所述，当我们说*框架*时，通常指的是模型周围的软件层，它负责组装提示、暴露工具、跟踪文件状态、应用编辑、运行命令、管理权限、缓存稳定前缀、存储记忆等等。

如今，在使用LLM时，与直接提示模型或使用网页聊天界面（更接近于“与上传文件聊天”）相比，这一层塑造了大部分用户体验。

在我看来，如今各大LLM的原始版本能力已非常接近（例如GPT-5.4、Opus 4.6和GLM-5等的基础版本），因此，决定一个LLM表现优劣的关键往往在于其"控制框架"（harness）。

虽然这只是推测，但我认为，如果我们将某个最新、最强大的开源LLM（如GLM-5）放入类似的控制框架中，它在Codex中的表现很可能与GPT-5.4相当，或在Claude Code中与Claude Opus 4.6媲美。当然，针对特定控制框架进行后训练通常是有益的。例如，OpenAI历史上就曾维护过GPT-5.3和GPT-5.3-Codex两个独立版本。

在下一节中，我将更深入地探讨具体细节，并借助我的*Mini Coding Agent*来讨论编码控制框架的核心组件：[https://github.com/rasbt/mini-coding-agent](https://github.com/rasbt/mini-coding-agent)

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!iPcp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!iPcp!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 424w, https://substackcdn.com/image/fetch/$s_!iPcp!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 848w, https://substackcdn.com/image/fetch/$s_!iPcp!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 1272w, https://substackcdn.com/image/fetch/$s_!iPcp!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!iPcp!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png" width="1456" height="416" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:416,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:460566,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!iPcp!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 424w, https://substackcdn.com/image/fetch/$s_!iPcp!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 848w, https://substackcdn.com/image/fetch/$s_!iPcp!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 1272w, https://substackcdn.com/image/fetch/$s_!iPcp!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82c0f343-afec-4a9f-b8fe-b60f7ad5db5f_3396x971.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图4：编码代理/编码控制框架的主要功能特性，将在后续章节中讨论。</em></figcaption></figure>

顺便一提，在本文中，为简便起见，我会将"编码代理"（coding agent）和"编码控制框架"（coding harness）这两个术语互换使用。（严格来说，代理是模型驱动的决策循环，而控制框架是提供上下文、工具和执行支持的周边软件架构。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!0mGQ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!0mGQ!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 424w, https://substackcdn.com/image/fetch/$s_!0mGQ!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 848w, https://substackcdn.com/image/fetch/$s_!0mGQ!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 1272w, https://substackcdn.com/image/fetch/$s_!0mGQ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!0mGQ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png" width="617" height="383.0824175824176" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:904,&quot;width&quot;:1456,&quot;resizeWidth&quot;:617,&quot;bytes&quot;:1307377,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!0mGQ!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 424w, https://substackcdn.com/image/fetch/$s_!0mGQ!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 848w, https://substackcdn.com/image/fetch/$s_!0mGQ!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 1272w, https://substackcdn.com/image/fetch/$s_!0mGQ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89ec8895-15ba-4f84-b600-190a40b58d62_2069x1285.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图5：一个最小化但功能完整的、从零实现的</span><a href="https://github.com/rasbt/mini-coding-agent/blob/main/mini_coding_agent.py">Mini Coding Agent</a><span>（使用纯Python实现）</span></em></figcaption></figure>

总之，以下是编码代理的六个主要组件。你可以查看我最小化但功能完整的、从零实现的[Mini Coding Agent](https://github.com/rasbt/mini-coding-agent/blob/main/mini_coding_agent.py)（使用纯Python实现）的源代码，以获取更具体的代码示例。代码通过注释标注了下面讨论的六个组件：

```
##############################
#### 六个代理组件 ####
##############################
# 1) 实时仓库上下文 -> WorkspaceContext
# 2) 提示形状与缓存复用 -> build_prefix, memory_text, prompt
# 3) 结构化工具、验证与权限 -> build_tools, run_tool, validate_tool, approve, parse, path, tool_*
# 4) 上下文缩减与输出管理 -> clip, history_text
# 5) 记录、记忆与恢复 -> SessionStore, record, note_tool, ask, reset
# 6) 委派与有界子代理 -> tool_delegate
```

这可能是最显而易见的组件，但也是最重要的组件之一。

当用户说"修复测试"或"实现xyz"时，模型应该知道它是否在Git仓库内、当前在哪个分支、哪些项目文档可能包含说明等信息。

这是因为这些细节经常变化，或者会影响正确的操作是什么。例如，"修复测试"并不是一个自包含的指令。如果代理看到了AGENTS.md或项目README，它可能会知道要运行哪个测试命令等。如果它知道仓库根目录和布局，它就能在正确的位置查找，而不是盲目猜测。

此外，git 分支、状态和提交记录也能提供更多上下文，帮助我们了解当前正在进行的变更以及需要重点关注的内容。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!mPz4!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!mPz4!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 424w, https://substackcdn.com/image/fetch/$s_!mPz4!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 848w, https://substackcdn.com/image/fetch/$s_!mPz4!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 1272w, https://substackcdn.com/image/fetch/$s_!mPz4!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!mPz4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png" width="636" height="435.50274725274727" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:997,&quot;width&quot;:1456,&quot;resizeWidth&quot;:636,&quot;bytes&quot;:310217,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!mPz4!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 424w, https://substackcdn.com/image/fetch/$s_!mPz4!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 848w, https://substackcdn.com/image/fetch/$s_!mPz4!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 1272w, https://substackcdn.com/image/fetch/$s_!mPz4!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e3a1e6a-4eb5-4b60-b52f-0a4ee880dbca_2085x1428.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图 6：代理工具首先构建一个简短的工作区摘要，该摘要与用户请求结合，以提供额外的项目上下文。</em></figcaption></figure>

关键在于，编码代理在执行任何工作之前，会先收集信息（作为工作区摘要的“稳定事实”），这样它就不会在每次提示时都从零开始、缺乏上下文。

一旦代理获得了仓库视图，下一个问题就是如何将这些信息输入模型。之前的图表展示了一个简化的视图（“组合提示：前缀 + 请求”），但在实践中，对每个用户查询都合并并重新处理工作区摘要会相对浪费。

也就是说，编码会话是重复性的，代理规则通常保持不变。工具描述通常也保持不变。甚至工作区摘要通常也（大部分）保持不变。主要变化通常是最近的用户请求、最近的对话记录，以及可能的短期记忆。

“智能”运行时不会在每次交互时都将所有内容重建为一个巨大的无差别提示，如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!keF3!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!keF3!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 424w, https://substackcdn.com/image/fetch/$s_!keF3!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 848w, https://substackcdn.com/image/fetch/$s_!keF3!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 1272w, https://substackcdn.com/image/fetch/$s_!keF3!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!keF3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png" width="1456" height="540" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:540,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:306965,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!keF3!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 424w, https://substackcdn.com/image/fetch/$s_!keF3!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 848w, https://substackcdn.com/image/fetch/$s_!keF3!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 1272w, https://substackcdn.com/image/fetch/$s_!keF3!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F92d9467c-1333-40f3-8d5d-c8bc0ffebb11_2698x1001.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图 7：代理工具构建一个稳定的提示前缀，添加变化的会话状态，然后将组合后的提示输入模型。</em></figcaption></figure>

与第 1 节的主要区别在于，第 1 节是关于收集仓库事实。在这里，我们关注的是如何高效地打包和缓存这些事实，以便重复调用模型。

“稳定的提示前缀”意味着其中包含的信息不会变化太大。它通常包含通用指令、工具描述和工作区摘要。如果没有什么重要变化，我们不想在每次交互中都从头重建它，浪费计算资源。

其他组件更新得更频繁（通常是每次交互）。这包括短期记忆、最近的对话记录和最新的用户请求。

简而言之，“稳定提示前缀”的缓存方面就是：智能运行时会尝试重用这一部分。

工具访问和工具使用是开始感觉更像代理而不是聊天的地方。

一个普通的模型可以用文字建议命令，但编码框架中的 LLM 应该执行更具体、更有用的操作，并且能够实际执行命令并检索结果（而不是我们手动调用命令并将结果粘贴回聊天中）。

但与其让模型随意编造语法，工具框架通常会提供一个预定义的、命名清晰的工具列表，每个工具都有明确的输入和边界。（当然，像 Python 的 `subprocess.call` 这样的功能也可以包含在内，这样智能体就能执行任意广泛的 shell 命令。）

工具使用流程如下图所示。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!yL-u!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!yL-u!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 424w, https://substackcdn.com/image/fetch/$s_!yL-u!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 848w, https://substackcdn.com/image/fetch/$s_!yL-u!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 1272w, https://substackcdn.com/image/fetch/$s_!yL-u!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!yL-u!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png" width="1456" height="621" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:621,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:234057,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!yL-u!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 424w, https://substackcdn.com/image/fetch/$s_!yL-u!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 848w, https://substackcdn.com/image/fetch/$s_!yL-u!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 1272w, https://substackcdn.com/image/fetch/$s_!yL-u!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7aff251f-0ce2-44f1-9792-5449c24d5600_2172x927.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图 8：模型发出结构化动作，工具框架验证该动作，可选地请求批准，执行它，并将有界结果反馈回循环中。</em></figcaption></figure>

为了说明这一点，下面是一个使用我的 Mini Coding Agent 时用户通常看到的示例。（它不像 Claude Code 或 Codex 那样美观，因为它非常简约，使用纯 Python，没有任何外部依赖。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!nD22!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!nD22!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 424w, https://substackcdn.com/image/fetch/$s_!nD22!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 848w, https://substackcdn.com/image/fetch/$s_!nD22!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 1272w, https://substackcdn.com/image/fetch/$s_!nD22!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!nD22!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png" width="699" height="569.3777472527472" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1186,&quot;width&quot;:1456,&quot;resizeWidth&quot;:699,&quot;bytes&quot;:2152195,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!nD22!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 424w, https://substackcdn.com/image/fetch/$s_!nD22!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 848w, https://substackcdn.com/image/fetch/$s_!nD22!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 1272w, https://substackcdn.com/image/fetch/$s_!nD22!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ff4770e-c3a5-442f-a657-ef9bec6b9862_2493x2031.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图 9：Mini Coding Agent 中工具调用审批请求的示例。</em></figcaption></figure>

在这里，模型必须选择一个工具框架能识别的动作，比如列出文件、读取文件、搜索、运行 shell 命令、写入文件等。它还必须以工具框架能检查的格式提供参数。

因此，当模型请求执行某个操作时，运行时可以停下来运行程序化检查，例如：

-   “这是已知的工具吗？”
-   “参数有效吗？”
-   “这需要用户批准吗？”
-   “请求的路径是否在工作区内？”

只有这些检查通过后，才会实际执行任何操作。

当然，运行编码智能体确实存在一定风险，但工具框架的检查也提高了可靠性，因为模型不会执行完全任意的命令。

此外，除了拒绝格式错误的动作和审批把关外，通过检查文件路径，文件访问也可以限制在仓库内部。

从某种意义上说，工具框架限制了模型的自由度，但同时也提升了可用性。

上下文膨胀并非编码智能体独有的问题，而是大语言模型普遍面临的问题。诚然，如今大语言模型支持越来越长的上下文（我最近写过关于[注意力变体](https://magazine.sebastianraschka.com/p/visual-attention-variants)的文章，使其在计算上更可行），但长上下文仍然昂贵，并且可能引入额外的噪声（如果包含大量无关信息）。

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!8IKa!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51d52b9a-e820-45d6-8135-f94496ec1745_1600x900.png">![现代大语言模型中的注意力变体视觉指南](https://substackcdn.com/image/fetch/$s_!8IKa!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51d52b9a-e820-45d6-8135-f94496ec1745_1600x900.png)

](https://magazine.sebastianraschka.com/p/visual-attention-variants)

在多轮对话中，编码智能体比常规大语言模型更容易受到上下文膨胀的影响，因为涉及重复的文件读取、冗长的工具输出、日志等。

如果运行时将所有内容都保持完整精度，可用上下文令牌很快就会耗尽。因此，一个好的编码工具通常在处理上下文膨胀方面相当复杂，而不仅仅是像常规聊天界面那样截断或总结信息。

从概念上讲，编码代理中的上下文压缩可能如下图所示。具体来说，我们进一步放大上一节图8中的剪辑部分（步骤6）。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!ksfT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!ksfT!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 424w, https://substackcdn.com/image/fetch/$s_!ksfT!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 848w, https://substackcdn.com/image/fetch/$s_!ksfT!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 1272w, https://substackcdn.com/image/fetch/$s_!ksfT!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!ksfT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png" width="1456" height="708" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:708,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:352608,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!ksfT!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 424w, https://substackcdn.com/image/fetch/$s_!ksfT!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 848w, https://substackcdn.com/image/fetch/$s_!ksfT!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 1272w, https://substackcdn.com/image/fetch/$s_!ksfT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d61d701-1f2b-4010-9a1f-2cefc7265bde_2495x1213.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图10：大型输出被剪辑，旧读取被去重，记录在重新进入提示之前被压缩。</em></figcaption></figure>

一个最小化的工具至少使用两种压缩策略来管理这个问题。

第一种是剪辑，它缩短了长文档片段、大型工具输出、记忆笔记和记录条目。换句话说，它防止任何一段文本因为恰好冗长而占用过多的提示预算。

第二种策略是记录缩减或总结，它将完整的会话历史（下一节会详细讨论）转化为一个更小的、可提示的摘要。

这里的一个关键技巧是保留更丰富的近期事件，因为它们更可能与当前步骤相关。而对较旧的事件进行更积极的压缩，因为它们可能相关性较低。

此外，我们还对旧的文件读取进行去重，这样模型就不会因为同一文件在会话早期被多次读取而反复看到相同的内容。

总的来说，我认为这是优秀编码代理设计中容易被低估且略显枯燥的部分。很多表面上的“模型质量”实际上都是上下文质量。

在实践中，这里涵盖的所有这6个核心概念都是高度交织的，不同的章节和图表以不同的重点或缩放级别来覆盖它们。在上一节中，我们介绍了提示时历史记录的使用以及如何构建紧凑的记录。那里的问题是：在下一轮中，应该将多少过去的内容放回模型？因此，重点是压缩、剪辑、去重和近期性。

现在，这一节——结构化会话记忆——是关于历史记录的存储时结构。这里的问题是：代理随着时间的推移保留什么作为永久记录？因此，重点是运行时保留一个更完整的记录作为持久状态，同时还有一个更轻量的记忆层，它更小，并且会被修改和压缩，而不仅仅是追加。

总结一下，编码代理将状态分为（至少）两层：

-   工作记忆：代理明确保留的、经过提炼的小型状态
-   完整记录：涵盖所有用户请求、工具输出和LLM响应

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!xWhc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!xWhc!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 424w, https://substackcdn.com/image/fetch/$s_!xWhc!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 848w, https://substackcdn.com/image/fetch/$s_!xWhc!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 1272w, https://substackcdn.com/image/fetch/$s_!xWhc!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!xWhc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png" width="667" height="368.3159340659341" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/e58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:804,&quot;width&quot;:1456,&quot;resizeWidth&quot;:667,&quot;bytes&quot;:368293,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!xWhc!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 424w, https://substackcdn.com/image/fetch/$s_!xWhc!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 848w, https://substackcdn.com/image/fetch/$s_!xWhc!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 1272w, https://substackcdn.com/image/fetch/$s_!xWhc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe58efdfb-9c19-42e8-a016-90b41b51ef15_2438x1346.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图11：新事件被追加到完整转录中，并在工作记忆中汇总。磁盘上的会话文件通常以JSON格式存储。</em></figcaption></figure>

上图展示了两个主要的会话文件——完整转录和工作记忆，它们通常以JSON格式存储在磁盘上。如前所述，完整转录存储了整个历史记录，即使关闭代理也可以恢复。工作记忆则更像是一个浓缩版本，包含当前最重要的信息，这与紧凑转录有一定关联。

但紧凑转录和工作记忆的职责略有不同。紧凑转录用于提示重建，其任务是为模型提供最近历史的压缩视图，使其无需每轮都查看完整转录即可继续对话。工作记忆则更侧重于任务连续性，其任务是维护一个精简且明确的状态摘要，记录跨轮次的重要信息，例如当前任务、重要文件和最近的笔记。

按照上图中的步骤4，最新的用户请求、LLM响应和工具输出将被记录为完整转录和工作记忆中的"新事件"，并在下一轮中处理（为简化图示，未在图中展示）。

一旦代理拥有了工具和状态，下一个有用的能力就是委派。

原因在于，它允许我们通过子代理将某些工作并行化为子任务，从而加速主任务。例如，主代理可能正在处理一个任务，但仍需要获取一个辅助答案，比如哪个文件定义了某个符号、配置内容是什么，或者测试失败的原因。将这类问题拆分为有边界的子任务，比强制单个循环同时处理所有工作线程更为有效。

（在我的迷你编码代理中，实现方式更简单，子代理仍然同步运行，但核心理念是相同的。）

子代理只有在继承足够上下文以执行实际工作时才有用。但如果不加以限制，多个代理可能会重复工作、操作相同文件，甚至生成更多子代理，导致混乱。

因此，设计上的棘手问题不仅在于如何生成子代理，还在于如何对其进行约束。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Ygjt!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Ygjt!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 424w, https://substackcdn.com/image/fetch/$s_!Ygjt!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 848w, https://substackcdn.com/image/fetch/$s_!Ygjt!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 1272w, https://substackcdn.com/image/fetch/$s_!Ygjt!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Ygjt!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png" width="1456" height="591" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:591,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:225496,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Ygjt!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 424w, https://substackcdn.com/image/fetch/$s_!Ygjt!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 848w, https://substackcdn.com/image/fetch/$s_!Ygjt!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 1272w, https://substackcdn.com/image/fetch/$s_!Ygjt!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F81b2ae42-ea42-40bf-b2ba-fdfcf9b87912_2438x990.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图12：子代理继承足够上下文以发挥作用，但其运行边界比主代理更严格。</em></figcaption></figure>

这里的技巧在于，子代理继承的上下文既要足够有用，又要受到约束（例如，只读权限和递归深度限制）。

Claude Code 早已支持子代理，而 Codex 在近期也加入了这一功能。Codex 通常不会强制子代理进入只读模式，相反，它们大多会继承主代理的沙箱和审批设置。因此，边界更多体现在任务范围、上下文和深度上。

以上部分试图涵盖编码代理的主要组件。如前所述，这些组件在实现上或多或少是深度交织的。不过，我希望逐一介绍它们能帮助你构建编码工具整体运作的心智模型，并理解为什么相比简单的多轮对话，它们能让 LLM 更有用。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!ml47!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!ml47!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 424w, https://substackcdn.com/image/fetch/$s_!ml47!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 848w, https://substackcdn.com/image/fetch/$s_!ml47!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 1272w, https://substackcdn.com/image/fetch/$s_!ml47!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!ml47!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png" width="1456" height="416" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:416,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:460597,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:&quot;image/png&quot;,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:&quot;https://magazine.sebastianraschka.com/i/193137515?img=https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png&quot;,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!ml47!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 424w, https://substackcdn.com/image/fetch/$s_!ml47!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 848w, https://substackcdn.com/image/fetch/$s_!ml47!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 1272w, https://substackcdn.com/image/fetch/$s_!ml47!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4fe9e9f0-b04f-4c3e-be1f-fbd74b41c4aa_3396x971.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图 13：前文讨论的编码工具的六大主要特性。</em></figcaption></figure>

如果你有兴趣看到这些功能以简洁、极简的 Python 代码实现，你可能会喜欢我的 [Mini Coding Agent](https://github.com/rasbt/mini-coding-agent)。

OpenClaw 可能是一个有趣的对比对象，但它并非完全同类的系统。

OpenClaw 更像是一个本地的通用代理平台，也能进行编码，而不是一个专门的（终端）编码助手。

不过，它与编码工具仍有若干重叠之处：

-   它使用工作区中的提示和指令文件，例如 AGENTS.md、SOUL.md 和 TOOLS.md
-   它保存 JSONL 会话文件，并包含对话记录压缩和会话管理功能
-   它可以生成辅助会话和子代理
-   等等。

然而，如上所述，两者的侧重点不同。编码代理针对的是在仓库中工作、请求编码助手检查文件、编辑代码并高效运行本地工具的人。而 OpenClaw 则更侧重于跨聊天、频道和工作区运行大量长期存在的本地代理，编码只是其中一项重要工作负载。

我很激动地分享，我已经完成了《从零构建推理模型》的写作，所有章节均已进入早期访问阶段。出版商目前正在排版，预计今年夏天正式出版。

这大概是我迄今为止最有野心的一本书。我花了大约 1.5 年时间写作，并投入了大量实验。从时间、精力和打磨程度来看，这很可能也是我付出最多的一本书，希望你会喜欢。

主要主题包括：

-   评估推理模型
-   推理时扩展
-   自我优化
-   强化学习
-   知识蒸馏

关于 LLM 中的“推理”有很多讨论，我认为理解它在 LLM 语境中真正含义的最佳方式，就是从头实现一个！

-   [Amazon](https://amzn.to/4aAKiFY)（预购）
-   [Manning](https://mng.bz/Nwr7)（完整书籍 [早期访问](https://mng.bz/Nwr7)，预排版，528 页）

#### 关于本文的讨论

### 准备好了解更多了吗？
