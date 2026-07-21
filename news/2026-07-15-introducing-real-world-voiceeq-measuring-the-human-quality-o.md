---
title: 'Introducing Real World VoiceEQ: Measuring the human quality of voice AI'
url: 'https://huggingface.co/blog/real-world-voiceeq'
url_hash: 5d7569c2afe37a81e25967f56fc4d6776a9f22a5
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-15T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

*现有基准测试表明语音AI正接近人类水平，但现实对话却呈现另一番景象。*

语音正迅速成为AI的主要交互界面。从客户支持、医疗保健到教育、娱乐和个人助手，语音正逐渐取代文本，成为人们与AI互动的方式。

过去几年中，语音模型取得了显著进步。词错误率持续下降，延迟已达到对话速度，许多现有基准测试也接近饱和。然而，任何经常使用语音AI的人都知道，有些地方仍然不对劲。

语音模型可能在对话过程中听起来像不同的人，会错过犹豫或不确定的语气，并且在处理口音、噪音或情感化语音时存在困难。这些缺陷在以延迟和词错误率为重点的基准测试中很容易被忽略。人们关心的是，语音系统能否真正倾听、恰当回应，并在真实对话中保持自然和可靠。

## [](#a-broader-benchmark-for-voice-ai)更全面的语音AI基准测试

为了衡量这些品质，我们构建了[Real World VoiceEQ](https://www.hume.ai/rw-voice-eq)——一个旨在评估语音交互人类化质量的基准测试。它评估语音系统能否识别、生成并回应转录文本所遗漏的声学信息，从语气、情感到说话者身份和背景语境。

Real World VoiceEQ评估了**超过40款领先的专有和开源语音模型**，涵盖**15+个关键评估维度**和**60+项指标**，涉及自动语音识别（ASR）、文本转语音（TTS）、语音到语音（S2S）和语音理解。

[![Real World VoiceEQ的四个组成部分——文本转语音、语音到语音、语音理解和ASR鲁棒性——及其各自的评估维度。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/real-world-voiceeq/benchmark-overview.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/real-world-voiceeq/benchmark-overview.png)

Real World VoiceEQ基于超过100万个人类评分开发，这些评分来自不同人口统计特征、说话风格和声学环境。当前基准测试包含78.5万条TTS评分和4.8万条STS评分，使其成为迄今为止规模最大的语音AI人类评估之一。

每项评估均使用**[Kairos](https://www.hume.ai/kairos)**进行，这是我们灵活、原生于语音的评估平台。同一基础设施使前沿AI实验室和企业能够运行针对特定用例定制的评估，识别生产级语音系统中的细微故障模式，生成人类偏好数据，并通过强化学习和人类反馈持续改进模型。

## [](#key-findings-from-real-world-voiceeq)Real World VoiceEQ的主要发现

### [](#progress-in-voice-ai-is-becoming-increasingly-specialized)语音AI的进步正日益专业化。

对单一“最佳”语音模型的竞争正让位于一系列专业能力的集合。

当今领先的系统针对不同优势进行优化——包括技术准确性、情感理解、对话智能、表现力和鲁棒性。一个擅长重复预订参考号、银行账户详情或复杂药物名称的模型，可能在生成富有情感表达的语音方面表现不佳。另一个模型可能听起来非常自然，但在精度导向的任务上可靠性较差。

随着语音AI的成熟，衡量进步越来越需要独立评估这些能力，而不是将它们合并为一个总体分数。在我们的TTS评估中，没有系统配置在所有八个能力组中均排名前五——这凸显了为何不存在单一的“最佳”语音模型。

### [](#voice-models-have-become-better-at-speaking-than-actually-listening)语音模型在“说”方面比“真正倾听”更擅长。

语音转语音模型在我们评估的所有类别中表现出的差异最大。有些系统能极好地识别情感，但在自然回应方面却存在困难。我们发现，能够获取音频并不能保证智能体利用了其中包含的副语言信息。一些系统在很大程度上仍然依赖于转录文本，只关注所说的词语，而忽略了语调、节奏、犹豫、强调和音量等线索。

人类天生就会利用这些线索来推断自信、不确定、沮丧、讽刺和同理心。而如今的模型常常会忽略它们。

想象一下，一个银行智能体询问你是否识别出一笔潜在的欺诈交易。一个自信的“是”和一个犹豫的“……是……”可能具有完全不同的含义，即使转录文本完全相同。人类能立即识别出这种差异。而如今的许多语音模型却做不到。

### [](#traditional-benchmarks-increasingly-overestimate-real-world-performance)传统基准测试日益高估真实世界性能。

许多已有的基准测试正接近其极限，并且不能反映真实世界的情况。模型在处理带口音的语音、说话者重叠、情感、背景噪音和较长的对话方面仍然存在困难。在我们的评估中，领先的开源和专有模型之间的性能差异远大于传统基准测试所显示的结果。在一个例子中，有噪音背景的语音的转录词错误率大约是有音乐背景的语音的四倍，这表明一个单一的背景音频分数如何能掩盖真正的失败模式。

### [](#human-evaluation-remains-essential)人工评估仍然至关重要。

在初步研究中，我们发现一些迹象表明，某些模型可能针对已有的公开基准测试进行了优化。有几个模型重现了参考转录文本中已知的错误，遵循了任意的拼写惯例，甚至重构了音频中不存在的被屏蔽的词语。

LLM 现在被广泛用于评估基于文本的模型，但我们的发现表明，在语音评估中应更谨慎地使用语音语言模型（SLM）。当我们比较领先的 SLM 与经过训练的人工评分员在文本转语音评估中的表现时，在具有清晰、可验证答案的任务（如发音准确性）上，一致性最高。

在更主观的评估上，一致性有所下降。SLM 有时似乎从基于文本的上下文线索中推断情感，而对于开放式判断（例如声音是否适合某个角色或保持了一致的身份），一致性最弱。自动评估器对于定义明确的任务很有价值，但当判断依赖于声学上下文、感知和社会解读时，它们还不能替代人类听众。

## [](#why-voice-ai-needs-a-new-measurement-layer)为什么语音 AI 需要一个新的测量层

随着语音成为 AI 定义性的界面之一，仅凭速度和技术准确性将不再决定哪些系统能够成功。人们最终会选择那些能够像人类一样理解、表达和回应的模型——不仅在理想的基准测试条件下，还要能应对真实世界对话的复杂性。

几十年来，语音 AI 通过针对标准化基准测试的量化指标进行优化而取得进步；从用于转录准确性的 WER，到用于语音质量的客观感知指标（如 PESQ 和 DNSMOS）。我们希望 Real World VoiceEQ 能够通过提供一个基于人类的度量标准来评估合成语音交互的各个组成部分，从而扩展这一范式。

阅读[完整技术报告](https://huggingface.co/papers/2607.14846)并查看[公开排行榜](https://huggingface.co/spaces/HumeAI/rw-voice-eq)——或[联系我们](https://www.hume.ai/sales-form)，了解Hume如何利用Real World VoiceEQ评估您的语音模型或智能体，或为您的特定用例设计定制化评估方案。
