---
title: Hugging Face and Cerebras bring Gemma 4 to real-time voice AI
url: 'https://huggingface.co/blog/cerebras-gemma4-voice-ai'
url_hash: b7f49b2bc1486b470db58f718245731aab7c90f5
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-01T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

<video controls="" width="100%"><source src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/cerebras-gemma4-voice-ai/s2s-space-demo.mp4" type="video/mp4"></video>

对于语音AI而言，延迟是一个关键参数。开发者在模型质量上取得了巨大进步，但用户体验仍常常受限于响应时间。Hugging Face和Cerebras正在改变这一现状。今天，我们展示当开放的模块化语音AI架构与业界领先的推理速度相结合时，将带来怎样的可能性。

其成果是一种感觉上更加自然的语音到语音体验。对话不再需要等待AI回应，而是以用户期望的人类互动般的响应速度流畅进行。

## [](#architecture-an-open-cascaded-speech-to-speech-stack)架构：开放的级联式语音到语音堆栈

该演示构建为实时语音到语音流水线。系统的每个部分都是模块化、开放且可替换的，使开发者能够轻松地将该堆栈适配于不同的助手、机器人、产品或研究项目。

这创建了一个完全开放的语音到语音循环：

```
语音输入
  -> 使用Nvidia的Parakeet进行语音识别
  -> 在Cerebras上进行Gemma 4 VLM推理
  -> 使用阿里巴巴的Qwen3TTS进行文本转语音
  -> 语音响应
```

该架构汇聚了开源AI生态系统的优势：Cerebras提供快速推理，Google DeepMind的Gemma 4 31B作为语言模型，Qwen负责文本转语音。每一层都可以由开发者检查、修改和扩展。

## [](#cerebras-and-hugging-face-partnership)Cerebras与Hugging Face的合作

如今，一些生产系统虽然中位延迟尚可，但在P95分位上仍会出现令人沮丧的数秒延迟。当工具调用或多模态步骤需要多轮交互时，这些延迟会变得更加明显。

Cerebras帮助解决了堆栈中最重要的瓶颈之一：语言模型的响应时间。通过使推理速度大幅提升且更加稳定，Cerebras让Hugging Face流水线的其余部分得以充分发挥优势。

这种稳定性在长尾场景中尤为重要。许多系统能够提供可接受的中位响应时间，但偶尔的慢响应仍会让对话感觉不可靠。

## [](#built-for-real-world-interaction)为真实世界交互而构建

同样的Hugging Face语音到语音流水线已经为Reachy Mini机器人提供支持，目前已有超过9000台机器人投入使用。对于机器人、语音助手和具身AI而言，响应速度并非锦上添花的改进，而是让交互充满活力的关键。

因此，使用Cerebras的动机不仅仅是降低成本。它追求的是低延迟、可预测的性能，以及能够大规模创建感觉自然的实时体验的能力。

这次合作反映了一个共同的信念：AI的未来将是开放且高性能的。开源模型、开放基础设施和突破性的推理速度共同为下一代对话式AI奠定了基础。

我们邀请开发者探索演示、尝试代码，并共同塑造实时语音AI的未来。

演示：[Hugging Face Space](https://huggingface.co/spaces/smolagents/hf-realtime-voice)

仓库：[huggingface/speech-to-speech](https://github.com/huggingface/speech-to-speech)
