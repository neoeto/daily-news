---
title: Reachy Mini goes fully local
url: 'https://huggingface.co/blog/local-reachy-mini-conversation'
url_hash: 5b218fefef6f1e0680a7cfdf2fea4482f6ed9275
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-05-27T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Amir Mahla 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/67f2f500e329a81a62a05d44/DOlzc8GFQzrnfVrsOdtbN.png)](https://huggingface.co/A-Mahla)

[![Andres Marafioti 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/65d66b494bbd0d92b641cdbb/6-7dm7B-JxcoS1QlCPdMN.jpeg)](https://huggingface.co/andito)

组装好你的 Reachy Mini 后，你需要安装[对话应用](https://github.com/pollen-robotics/reachy_mini_conversation_app)并开始与它交谈。在此之前，你必须将音频发送到服务器。但现在不必了。今天我们将带你了解如何完全在本地运行整个技术栈。

该技术栈由 [`speech-to-speech`](https://github.com/huggingface/speech-to-speech) 驱动，这是我们级联的 VAD → STT → LLM → TTS 流水线，它暴露了一个兼容 Realtime API 的 `/v1/realtime` WebSocket。启动后端后，从 UI 界面将机器人指向它即可。

级联是当前开源生态中最灵活的选择，并且如果组件选取得当，它们也是最快的。我们会推荐我们最喜欢的组件，但级联的核心优势在于你可以自由替换它们。毕竟每周都有新模型发布。

> **TL;DR**
>
> -   为你的 Reachy Mini 部署一个本地语音后端。
> -   我们使用 `speech-to-speech` 库，采用级联方法。
> -   推荐：**llama.cpp** 搭配 **Gemma 4**、**Silero VAD**、**Parakeet-TDT 0.6B v3 STT**、**Qwen3-TTS**。

* * *

## [](#快速开始)快速开始

这篇博客将指导你如何完全在本地运行 Reachy Mini 的对话功能。无需云端，无需 API 密钥，你的数据不会离开你的机器。以下是现场演示视频：

<video controls="" width="360"><source src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/local_reachy_mini_conversation/Reachy%20mini%20local.mp4" type="video/mp4"></video>

### [](#本地运行-llm)本地运行 LLM

为了运行 LLM，我们将使用 Hugging Face 的 `llama.cpp`。如果需要安装，最简单的方式是 `brew install llama.cpp` 或 `winget install llama.cpp`，如需更多帮助，请[查阅文档](https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md)。首先，我们运行：

```
llama-server -hf ggml-org/gemma-4-E4B-it-GGUF -np 2 -c 65536 -fa on --swa-full
```

搞定！第一次运行时会下载模型，后续启动会很快。

这些参数是做什么的？

-   `-hf ggml-org/gemma-4-E4B-it-GGUF` — 直接从 Hub 拉取模型。首次运行下载，后续运行使用缓存。
-   `-np 2` — 两个并行处理槽。让服务器能够处理第二个请求（例如快速中断），而不会阻塞第一个请求。
-   `-c 65536` — 64k 上下文窗口，跨槽共享。为长对话提供了充足的空间。
-   `-fa on` — 启用 Flash Attention。速度更快，内存占用更低，在现代硬件上几乎零开销。
-   `--swa-full` — 保留完整的滑动窗口注意力缓存，而不是重新计算。在 Gemma 上，用少量 RAM 换取显著更快的提示处理速度。

### [](#设置-speech-to-speech)设置 speech-to-speech

我们首先安装这个库：

```
uv pip install speech-to-speech
```

然后，在另一个终端中运行 LLM 的同时，我们只需运行：

```
speech-to-speech --responses_api_base_url "http://127.0.0.1:8080" --responses_api_api_key "" --mode local
```

然后你就可以通过终端开始与模型对话了！首次运行需要下载 Parakeet-TDT 0.6B v3 和 Qwen3TTS，但后续启动会很快。

以下是本地对话模式的演示视频：

<video controls="" width="100%"><source src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/local_reachy_mini_conversation/s2s-llamacpp.mp4" type="video/mp4"></video>

现在，在 `--mode local` 模式下尝试过后，你可以不带该选项再次运行命令，以便为机器人提供 speech-to-speech 服务。

### [](#将-reachy-mini-连接到-speech-to-speech)将 Reachy Mini 连接到 speech-to-speech

一旦你成功运行了llama.cpp和语音到语音（speech-to-speech）模块，就可以通过桌面应用启动机器人，并打开对话应用。在对话应用的界面中，你需要点击HF后端的"编辑连接"来切换至本地模式。以下视频演示了具体操作步骤：

<video controls="" width="100%"><source src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/local_reachy_mini_conversation/setting_up_conv_app.mp4" type="video/mp4"></video>

至此，设置完成。现在你可以开始与机器人对话了。整个流程的每个环节都涉及权衡：有的TTS模型速度更快但质量较低，有的STT模型速度较慢但准确度更高。我们针对多语言场景进行了优化，而你可能更希望针对单一语言进行优化。博客的其余部分将介绍如何进行自定义设置。

## [](#going-deeper)深入探索

### [](#why-run-your-own-speech-to-speech-server)为什么要运行自己的语音到语音服务器？

托管的实时后端虽然便捷，但运行自己的引擎能带来三大优势：

-   **隐私保护。** 音频数据不会离开你的网络，整个流程在你控制的硬件上运行。
-   **零API费用。** 无需按分钟或按token付费。
-   **完全掌控流程。** 可以替换任意组件：VAD、STT、LLM、TTS。每当Hub 🤗上有更好的模型出现时，即可随时更换。

`speech-to-speech` 仓库通过一个简单的CLI命令即可实现上述所有功能。它会启动一个位于 `/v1/realtime` 的WebSocket服务器，该服务器使用Reachy Mini已支持的通信协议。

### [](#our-opinionated-defaults-vad-stt-tts)我们的默认配置选择：VAD、STT、TTS

一个级联语音流程包含四个阶段：VAD、STT、LLM和TTS。对于其中三个阶段，我们选择了可靠的默认配置，以便你专注于LLM的优化：

| 阶段 | 选择 | 原因 |
| --- | --- | --- |
| VAD | **Silero VAD v5** | 体积小、准确度高、可在CPU上运行。是开源语音代理领域的默认标准。 |
| STT | **Parakeet-TDT 0.6B v3** | 支持流式处理、速度极快、英语识别质量优秀。 |
| TTS | **Qwen3-TTS** | 表现力强、低延迟、支持多语言、可自定义语音。 |

我们对这些选择有明确的倾向性，如果你有偏好，可以随时替换成自己的配置。

### [](#choosing-your-llm)选择你的LLM

LLM是对系统延迟和整体性能影响最大的环节。我们支持两种方案：**在本地运行模型**（llama.cpp、MLX、Transformers、vLLM），或**使用支持Responses API的服务器**（OpenAI、Gemini、HF推理端点、llama.cpp、vLLM等）。

#### [](#the-responses-api-decouple-the-brain-from-the-voice-loop)Responses API：将大脑与语音循环解耦

系统的主要瓶颈在于LLM推理延迟。为解决这一问题，我们支持通过Responses API协议连接外部推理引擎。

因此，`speech-to-speech` 引擎支持第二种模式：只要LLM遵循Responses API协议，就可以在独立进程中运行。你可以在一个终端中启动模型服务器，在另一个终端中启动语音循环，两者通过HTTP进行通信。

##### [](#option-1-llamacpp-in-one-terminal-speech-to-speech-in-the-other)方案1：一个终端运行llama.cpp，另一个终端运行speech-to-speech

**终端1：llama.cpp服务器：**

```
llama-server -hf ggml-org/gemma-4-E4B-it-GGUF -np 2 -c 65536 -fa on --swa-full
```

**终端2：speech-to-speech客户端：**

```
speech-to-speech \
  --mode realtime \
  --stt parakeet-tdt \
  --tts qwen3 \
  --llm_backend responses-api \
  --model_name "ggml-org/gemma-4-E4B-it-GGUF" \
  --responses_api_base_url "http://127.0.0.1:8080/v1"
```

##### [](#option-2-vllm-in-one-terminal-speech-to-speech-in-the-other)选项 2：一个终端运行 vLLM，另一个终端运行语音转语音

> **需要 vLLM ≥ 0.21.0。** vLLM 0.21.0 版本完全支持 Responses API 协议，包括语音转语音后端使用的工具调用流式传输。旧版本可以启动，但当助手尝试调用工具时会出错。

通过 vLLM 为此流水线提供模型服务时，实际上需要三个标志：

-   `--enable-auto-tool-choice`
-   `--tool-call-parser <tool_parser_name>` — 选择按模型系列划分的解析器，将模型的原始输出转换为结构化的工具调用（例如，Qwen3 指令模型使用 `qwen3_coder`，Llama 3 使用 `llama3_json`，Hermes 风格模型使用 `hermes` 等）。
-   `--default-chat-template-kwargs '{"enable_thinking":false}'`：禁用支持该功能的模型的 `<think>` 推理通道。对于更困难的代理任务，您可以将其设置为 `true` 并让模型进行推理，但对于自然的对话体验，我们强烈建议保持关闭：每一个思考令牌都会增加用户听到机器人开始说话前的静默延迟。

**终端 1：vLLM 推理服务器 (`Qwen/Qwen3-4B-Instruct-2507`)：**

```
vllm serve Qwen/Qwen3-4B-Instruct-2507 \
  --port 8000 \
  --host 127.0.0.1 \
  --max-model-len 32768 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --default-chat-template-kwargs '{"enable_thinking":false}' \
  --speculative-config '{"method":"qwen3_next_mtp","num_speculative_tokens":1}'
```

> `--speculative-config` 行启用了多令牌预测（MTP）。它是**可选的**，但对端到端延迟有很大影响。只要模型支持，就请保持启用。

**终端 2：语音转语音客户端：**

```
speech-to-speech \
  --mode realtime \
  --stt parakeet-tdt \
  --tts qwen3 \
  --llm_backend responses-api \
  --model_name "Qwen/Qwen3-4B-Instruct-2507" \
  --responses_api_base_url "http://127.0.0.1:8000/v1"
```

##### [](#option-3-hugging-face-inference-endpoints)选项 3：Hugging Face 推理端点

协议相同，但模型运行在 Hugging Face 管理的 GPU 上。将任何聊天模型部署为推理端点，然后将语音循环指向端点 URL：

```
speech-to-speech \
  --mode realtime \
  --stt parakeet-tdt \
  --tts qwen3 \
  --llm_backend responses-api \
  --model_name "Qwen/Qwen3-4B-Instruct-2507" \
  --responses_api_base_url "https://<your-endpoint>.endpoints.huggingface.cloud/v1" \
  --responses_api_api_key "$HF_TOKEN"
```

##### [](#option-4-hugging-face-inference-providers)选项 4：Hugging Face 推理提供商

如果您不想管理自己的端点，可以使用[推理提供商](https://huggingface.co/docs/inference-providers)。Hugging Face 通过单个 URL 将您的请求路由到第三方后端（例如 Together、Fireworks、Replicate）：

```
speech-to-speech \
  --mode realtime \
  --stt parakeet-tdt \
  --tts qwen3 \
  --llm_backend responses-api \
  --model_name "Qwen/Qwen3.6-35B-A3B:deepinfra" \
  --responses_api_base_url "https://router.huggingface.co/v1" \
  --responses_api_api_key "$HF_TOKEN"
```

##### [](#option-5-openai-or-any-openai-compatible-provider)选项 5：OpenAI（或任何兼容 OpenAI 的提供商）

当您想以零基础设施测试前沿模型时，将相同的标志指向 OpenAI：

```
speech-to-speech \
  --mode realtime \
  --stt parakeet-tdt \
  --tts qwen3 \
  --llm_backend responses-api \
  --model_name "gpt-5.4" \
  --responses_api_api_key "$OPENAI_API_KEY"
```

`--responses_api_*` 标志对于任何实现该协议的提供商（OpenRouter、Together、Fireworks 等）都同样有效。只需更换基础 URL 和 API 密钥，保持流水线的其余部分不变。

* * *

#### [](#running-the-llm-in-process)在进程中运行 LLM

##### [](#option-1-local-llm-on-mlx-apple-silicon)选项 1：在 MLX 上运行本地 LLM（Apple Silicon）

如果你使用的是 Mac，MLX 是运行真实模型并保持合理延迟的最低门槛方式。我们推荐 **Qwen3-4B-Instruct-2507**，它在 M 系列芯片上小到可以即时响应，同时能力足以进行流畅对话。

```
speech-to-speech \
  --llm_backend mlx-lm \
  --model_name "mlx-community/Qwen3-4B-Instruct-2507-bf16"
```

服务器默认监听 `ws://127.0.0.1:8765/v1/realtime`。保持其运行，将对话应用连接到本地后端，你就可以和你的机器人对话了。

##### [](#option-2-local-llm-on-transformers-cuda--cpu--mps)选项 2：基于 Transformers 的本地 LLM（CUDA / CPU / MPS）

思路相同，但使用原生 `transformers`。如果你使用 CUDA 设备、Linux 系统，或者希望自由切换模型而无需为 MLX 重新转换权重，请选择此方式。

```
speech-to-speech \
  --llm_backend transformers \
  --model_name "Qwen/Qwen3-4B-Instruct-2507"
```

> **提示：** `Qwen3-4B-Instruct-2507` 是另一个优秀的 LLM 选择，它在单块消费级 GPU 上实现了良好的速度与质量平衡。你可以将 `--model_name` 指向后端支持的任何 HF 模型——例如更大的 Gemma、Qwen 或 Mistral。

### [](#running-the-engine-on-your-laptop-the-app-on-the-robot)在笔记本上运行引擎，在机器人上运行应用

如果你在笔记本上运行语音引擎，而在 Reachy Mini Wireless 上运行对话应用，唯一需要更改的是 URL。请确保引擎绑定到局域网地址（而不仅仅是 `127.0.0.1`），并在 UI 中选择 IP 时使用机器人的笔记本 IP。

如果你不知道自己的 IP，以下是查找方法：

macOS

```
ipconfig getifaddr en0    # 无线网络
ipconfig getifaddr en1    # 以太网（有时是 en0，因设备而异）
```
Linux

```
hostname -I
```
Windows

```
ipconfig
```

在活动适配器下查找 "IPv4 地址"。

你应该使用 `192.168.x.x` 或 `10.x.x.x` 这类地址。如果看到 `169.254.x.x`，说明你实际上并未连接到网络。

* * *

## [](#wrap-up)总结

现在你拥有了一个完全本地的语音循环：

-   机器人使用 **Silero** 进行监听，
-   使用 **Parakeet-TDT 0.6B v3** 进行转录，
-   使用你选择的 LLM 进行思考——无论是本地 MLX、本地 Transformers、隔壁的 vLLM 或 llama.cpp 服务器，还是托管的 Responses API 端点，
-   并使用 **Qwen3-TTS** 进行回答。

请为 [`huggingface/speech-to-speech`](https://github.com/huggingface/speech-to-speech) 和 [`pollen-robotics/reachy_mini_conversation_app`](https://github.com/pollen-robotics/reachy_mini_conversation_app) 加星标，并在讨论区告诉我们你最终在机器人上运行的是哪个开源级联方案。
