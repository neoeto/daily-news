---
title: 'Introducing the FFASR Leaderboard: Benchmarking ASR in the Real World'
url: 'https://huggingface.co/blog/ffasr-leaderboard'
url_hash: c8f3104266f9489e3a98d368e721364b1cd2fc68
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-24T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

🚀 **首个开放远场ASR基准测试：** 社区驱动的评估，涵盖14个模拟房间，并通过真实世界测量验证：[https://huggingface.co/spaces/treble-technologies/ffasr](https://huggingface.co/spaces/treble-technologies/ffasr)

📉 **差距真实且巨大：** 在所有提交的模型中，低信噪比下的远场词错误率始终比相同语音内容的近场词错误率高出数倍

🔬 **值得信赖的方法论：** 混合波动模拟、模拟到真实验证、测试版中的移动声源分割、保留音频，以及所有提交中标准化的评估硬件

⚡ **精度与速度兼得：** 帕累托前沿图绘制平均词错误率与实时因子之间的关系，助您评估适合部署场景的权衡

👀 **更多功能即将推出：** 多说话人场景、麦克风阵列支持和回声消除已在路线图中

基准测试性能与实际部署之间的差距是ASR开发中最持久的痛点之一。在标准评估中得分良好的模型，一旦涉及真实房间声学环境——混响、背景噪声、麦克风距离——往往表现迥异。这些因素之间的复杂交互对性能的影响，是干净语音基准测试无法捕捉的。FFASR排行榜正是我们量化这一差距的尝试。

[Treble Technologies](https://huggingface.co/treble-technologies) 与 Hugging Face 联合推出远场ASR（FFASR）排行榜，这是首个开放、社区驱动的基准测试，旨在评估ASR模型在真实远场声学条件下的表现。该排行榜现已上线，我们诚邀社区提交模型、探索结果，并共同塑造未来方向。

## [](#为什么远场评估至关重要)为什么远场评估至关重要

语音界面已远远超越耳机和智能手机的范畴。AI语音助手、会议室转录、车载助手、人形机器人、智能眼镜以及免提工具正迅速普及。它们的共同点是都在声学复杂的环境中运行：混响、背景噪声、重叠声音，以及可能距离说话人一米到数米不等的麦克风。

主流的ASR评估范式尚未跟上这一现实。干净、近麦克风的基准测试仍是标准，虽然它们对衡量核心识别质量有用，但无法预测远场性能。在LibriSpeech或其他近场数据集上表现良好的模型，一旦引入真实房间声学，性能可能大幅下降。尽管已有多个围绕远场和噪声语音评估的研究努力——包括[CHiME](https://www.chimechallenge.org/)、[URGENT](https://v2.urgent-challenge.com/)和[NOIZEUS](https://ecs.utdallas.edu/loizou/speech/noizeus/)——但社区一直缺乏一种标准化、开放的方式，以持续更新的排行榜形式跨模型一致地衡量这种退化。这正是FFASR的使命。

远场评估的一大挑战是数据可用性。在具有代表性的房间类型、麦克风距离和噪声条件下大规模收集远场录音，仅靠物理测量成本高昂得令人望而却步。模拟使得系统性地覆盖这一空间成为可能，并能在不相应增加测量成本的情况下随时间扩展覆盖范围。

FFASR 的另一个目标是鼓励开发对这些条件具有明确鲁棒性的模型。排行榜历来能有效引导研究方向。通过让远场性能变得可见且可比较，我们希望提升整个领域对真实声学鲁棒性的重视程度。

## [](#how-the-benchmark-is-constructed)基准测试的构建方式

FFASR 排行榜评估模型在九种条件下的表现。决定主要排名得分的四种条件（截至 2026 年 6 月 22 日）如下：

-   近场（干声）——在消声室中测量的纯净语音（类似于 Librispeech，但混响极小）
-   远场高信噪比（高于 14 dB）
-   远场中信噪比（8 至 12 dB）
-   远场低信噪比（低于 6 dB）

为了让你了解这些条件实际听起来的效果，以下样本让你听到同一段语音：先是干声消声音频，然后与房间脉冲响应进行卷积，最后在每个信噪比层级添加噪声。干声录音与低信噪比远场条件之间的差异，可以合理反映排行榜所衡量问题的规模。

另外两个栏目——实验室实测和实验室模拟——作为从仿真到现实的验证轨道。排行榜还包括移动声源分组（目前处于测试阶段），用于评估模型在处理说话者移动而非静止的音频时的表现。这种条件反映了人形机器人、车内语音和移动语音助手等使用场景，其中说话者与麦克风之间的声学几何关系持续变化。

声学数据使用 [Treble 的混合仿真引擎](https://docs.treble.tech/intro) 生成，该引擎结合了低频到中频的波动求解器与高频的几何声学建模。这种方法能够捕捉到更简单仿真方法常忽略的物理现象：衍射、散射、干涉和模态行为。其结果是与实测声学条件高度吻合的仿真数据，实验室实测和实验室模拟栏目通过在同一数据上运行相同评估，直接验证了这一点。

基准测试包含 14 个完全布置家具的房间，面积从 20 到 470 立方米不等，涵盖浴室、带走廊的客厅、办公室、教室和餐厅空间。每个声学场景包含一个目标说话者（在消声室中录制，以避免录音环境带来的混响伪影）以及最多三个噪声源。每个场景都包含一个瞬态噪声源（如咳嗽声）和一个连续噪声源（如暖通空调系统），并设置三个信噪比层级。这种覆盖范围旨在反映部署语音系统的实际空间多样性。

除了词错误率，排行榜还为每次提交报告 RTFx（每秒推理处理的音频秒数），在相同条件下使用 NVIDIA L4 GPU 进行评估。准确性和延迟在实际部署中都很重要，分析选项卡中的帕累托前沿视图明确展示了这一权衡。

[![各提交模型平均词错误率与 RTFx 的帕累托前沿图](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ffasr-leaderboard/pareto-screenshot.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ffasr-leaderboard/pareto-screenshot.png)

该基准测试基于 Treble Technologies 专有仿真引擎构建的模拟声学空间。引擎输出的示例可参见去年发布的 [Treble10 数据集](https://huggingface.co/collections/treble-technologies/treble10)，该数据集建立了仿真流程，并提供了可用于训练和研究的远场房间脉冲响应（RIR）。FFASR 在此基础上扩展为一个标准化评估框架，包含保留测试集、一致的归一化处理以及自动评分功能。

## [](#what-the-data-already-shows)数据已揭示的规律

随着排行榜上线，所有提交模型呈现出一致的模式：近场与远场性能差距巨大，且随着信噪比（SNR）降低而显著扩大。在干净干语音上，近场词错误率（WER）与这些模型在现有基准测试中的表现相当。而低 SNR 下的远场 WER 则截然不同，通常高出数倍。该基准测试使这种性能退化变得可见且可比较，这在以往专有评估流程之外难以实现。

平均 WER 与 RTFx 的帕累托前沿同样具有启示性。当前提交的模型展现了多样化的技术路线：有的优先速度而牺牲部分精度，有的追求精度而降低吞吐量，还有少数模型在两方面均具竞争力。将这类权衡置于远场精度（而非干净语音精度）下可视化，会呈现出系统间真实差异的全新图景。建议开发者深入探索"分析"标签页，而非仅关注主排名表。

值得开发者注意的一点：排行榜同时报告近场（干）和远场 WER。这种分离设计是有意为之且实用的。它有助于区分真正高精度的模型与精度高但对声学条件脆弱的模型——这对于决定是否投资远场微调、语音增强预处理或更换架构至关重要。

## [](#how-to-submit)如何提交

打开 [FFASR 排行榜](https://huggingface.co/spaces/treble-technologies/ffasr)的"提交"标签页，粘贴 Hugging Face 模型 ID，评估将在服务端针对保留数据集运行。该流程支持 Whisper 变体、IBM Granite Speech、Cohere Transcribe、Wav2Vec2 和 HuBERT CTC 头部、SpeechBrain ASR 以及 Hub 上大多数其他 ASR 架构，无需自定义配置。

对于使用更复杂推理栈（包括结合语音增强与 ASR 的系统）的团队，自定义评估器选项允许您定义自己的 `evaluate()` 函数。自定义评估器在版主审核后通过 Hub Jobs 运行，提交说明字段是记录预处理步骤的好地方，以便他人理解结果。

[![自定义评估方法](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ffasr-leaderboard/custom_evaluate.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/ffasr-leaderboard/custom_evaluate.png)

保留评估集包含 2,000 个无回声语音样本，分布在 14 个房间和三个 SNR 层级，每个条件约 8 小时音频，并统一应用 Whisper 风格的文本归一化处理。音频不向提交者公开，以避免测试集污染。

## [](#what-is-coming-next)未来计划

我们正在积极探讨的未来赛道条件包括：多人对话场景（即多个说话者同时发言）、麦克风阵列评估（涵盖波束成形与空间滤波方法），以及回声消除技术——这对任何需同时播放音频并拾音的设备都至关重要。

下一步的研发方向将取决于社区反馈的缺口最大之处。如果您从事的部署环境或应用场景在当前基准测试中未得到充分体现，我们期待您的反馈。FFASR排行榜的设计初衷是持续演进，其发展方向应切实反映实际需求。

欢迎提交您的模型、探索分析选项卡，并在[FFASR论坛](https://huggingface.co/spaces/treble-technologies/ffasr/discussions)分享您的想法与建议，共同构建一个真正服务于领域实际问题的基准测试体系。
