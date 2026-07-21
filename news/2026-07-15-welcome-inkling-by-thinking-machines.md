---
title: Welcome Inkling by Thinking Machines
url: 'https://huggingface.co/blog/thinkingmachines-inkling'
url_hash: 210f6726bf4a719a82160adea65b6e8851b89900
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-15T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

[Inkling](https://huggingface.co/thinkingmachines/Inkling) 是一个大型（1万亿参数！）开放模型，原生支持图像、文本和音频输入。

TLDR；Thinking Machines 开发的 Inkling 已在 Hugging Face 上发布。Inkling 是一个巨大的多模态大语言模型，能够理解所有模态（图像、音频、文本），具备智能体能力，并支持 100 万上下文。它提供完整的 BF16 版本和校准良好的 NVFP4 变体，并包含用于加速推理的推测性 MTP 层。在 transformers、SGLang、vLLM 和 llama.cpp 中均有首日支持。

## [](#inkling-有何特别之处)Inkling 有何特别之处？

Inkling 是首个拥有 **约 1 万亿参数** 和 **100 万上下文窗口** 的大型开放模型，原生支持 **图像、文本和音频输入**，基于 **45 万亿文本、图像、音频和视频令牌** 训练而成。它专注于跨模态（如音频、图像和文本）的推理，并旨在通过微调进行领域适配。我们已对该模型进行了一些调整，构建了一些演示并探索了其架构，认为它非常适合构建新一代多模态推理应用。

## [](#整体能力与架构)整体能力与架构

Inkling 是一个仅解码器的多模态混合专家模型，总参数为 9750 亿，活跃参数为 410 亿。其中涉及许多技术细节，让我们逐一分解：

-   仅解码器：这意味着该架构支持因果自回归生成，与大多数最先进的大语言模型类似。
-   多模态：该模型可以处理文本、音频和图像。
-   混合专家（MoE）：每一层中的前馈网络是稀疏的，由于任何时刻只有 410 亿参数处于活跃状态，因此推理速度更快。该模型有 256 个专家，我们稍后会看到。

以下是架构的快速概览。

**相对注意力：** 与通常在 Transformer 模型中注入位置信息的 RoPE 方法不同，Inkling 使用相对注意力来编码位置信息。每个注意力层直接在注意力对数中学习位置。除了键-查询-值之外，还有第四个投影，为每个令牌、每个头生成一个相对特征 R。然后，这个投影张量会根据距离信息（键向量和查询向量之间的距离）进行调整，并传播到注意力模块中。

[![Inkling 相对注意力架构](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/relative_attention.png)](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/relative_attention.png)

**混合注意力：** 解码器层在全局注意力（一次性关注整个上下文长度）和滑动窗口注意力（以滑动方式关注固定上下文窗口）之间交替。该架构的滑动窗口与全局注意力层比例为 5:1。这种混合注意力方案提高了计算效率。最后一层使用全局注意力来帮助构建特征丰富的表示。

**短卷积：** 该模型在隐藏状态上使用了一种独特的短一维卷积，即 `SConv`。SConv 读取当前令牌和前 `W-1` 个隐藏状态，其中 `W` 是滑动窗口大小。其直觉是，SConv 有助于局部注意力，同时将注意力模块和 MoE 模块从局部表示中解放出来。

[![Inkling 短卷积架构](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/sconv.png)](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/sconv.png)

**具有共享专家汇集的 MoE：** 在 Inkling 中，路由器同时对路由专家和共享专家进行评分。在 6 个专家上执行 Top-k 选择，再加上始终活跃的 2 个共享专家。

**视觉理解：** 该模型包含一个简单的分层MLP分块器，由若干线性层组成。每一层逐步合并像素，直至最后一层为每个图像块生成一个嵌入向量。

**音频理解：** 架构采用离散化梅尔频谱图，将每个音频片段（100毫秒）转换为梅尔刻度，然后分类到精确的梅尔频谱图区间中。

多模态塔是相对简单的模块，与其他为每种模态使用独立编码器的模型不同。每个图像块通过图像嵌入塔处理，音频片段通过音频嵌入塔处理，从而获得两种媒体嵌入。图像输入还包含一个额外的时间维度用于视频处理。我们预计这一能力对下游微调有用，但尚未评估开箱即用的视频性能。该塔会折叠图像块网格：将相邻令牌组成的小局部块堆叠到通道维度，并通过hMLP处理。音频波形被转换为梅尔刻度，然后分类为离散的梅尔区间。这些梅尔区间值在音频嵌入塔中被嵌入，然后将嵌入结果求和以构建最终的音频输入。

## [](#inference-support)推理支持

Inkling 提供即时的 transformers 支持，并兼容 SGLang 和 vLLM 等主流推理引擎。

该模型体积庞大。bf16 检查点需要 2 TB 显存，而 nvfp4 版本需要 600 GB 显存。您可以通过 Inference Providers 等无服务器推理路由器尝试该模型，或使用 ggml 量化版本通过 llama.cpp 进行本地部署。

### [](#transformers)Transformers

直接使用 `transformers` 进行推理的最简单方式是采用 `any-to-any` 流水线。您可以在 Hopper 或更新架构的 GPU 上使用 16 位版本的 `"thinkingmachines/Inkling"`，或在 Blackwell Nvidia GPU 上使用量化后的 NVFP4 检查点 `"thinkingmachines/Inkling-NVFP4"`。请确保已安装最新版本的 transformers（5.14.0 已于今日发布）（`pip install -U transformers`）。

```
from transformers import pipeline

model_id = "thinkingmachines/Inkling"
# model_id = "thinkingmachines/Inkling-NVFP4"

pipe = pipeline("any-to-any", model=model_id)
```

初始化流水线后，您可以按如下方式传入提示。

```
image_url = (
    "https://huggingface.co/datasets/merve/vl-test-suite/"
    "resolve/main/pills.jpg"
)
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "image": image_url,
            },
            {
                "type": "text",
                "text": "这种补充剂中的成分会相互作用吗？",
            },
        ],
    },
]
output = pipe(
    messages,
    max_new_tokens=2000,
    return_full_text=False,
    reasoning_effort="medium",
)
output[0]["generated_text"]
```

再降低一个层级，您可以使用 Auto 类。对于推理，可使用 `AutoModelForMultimodalLM` 类加载模型，使用 `AutoProcessor` 类加载处理器。针对不同的推理任务，分词器接受一个 `reasoning_effort` 参数。可选的推理努力程度包括 `"none"`、`"minimal"`、`"low"`、`"medium"`、`"high"`、`"xhigh"` 和 `"max"`。

```
from transformers import AutoModelForMultimodalLM, AutoProcessor

model_id = "thinkingmachines/Inkling"
processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForMultimodalLM.from_pretrained(
    model_id,
    dtype="auto",
    device_map="auto",
)

messages = [
    {"role": "system", "content": "你只需用数字回答。"},
    {"role": "user", "content": "17 乘以 23 等于多少？"},
]

inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
    reasoning_effort="high",
).to(model.device)
```

```python
output = model.generate(**inputs, max_new_tokens=2000)
generated_tokens = output[0][inputs["input_ids"].shape[1] :]
print(processor.decode(generated_tokens, skip_special_tokens=False))
```

对于多模态推理，你可以使用相同的类。我们在模型卡中为每种不同模态提供了示例代码片段。

文本与图像推理

```python
from transformers import AutoModelForMultimodalLM, AutoProcessor

model_id = "thinkingmachines/Inkling"
processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForMultimodalLM.from_pretrained(
    model_id,
    dtype="auto",
    device_map="auto",
)

image_url = (
    "https://huggingface.co/datasets/merve/vl-test-suite/"
    "resolve/main/pills.jpg"
)
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "image": image_url,
            },
            {
                "type": "text",
                "text": "这种补充剂中的任何成分会相互作用吗？",
            },
        ],
    },
]

inputs = processor.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    reasoning_effort="medium",
    return_dict=True,
    return_tensors="pt",
).to(model.device)
input_len = inputs["input_ids"].shape[-1]

outputs = model.generate(**inputs, max_new_tokens=2000)
response = processor.decode(outputs[0][input_len:], skip_special_tokens=False)

processor.parse_response(response)
```

Inkling 也支持音频输入。以下是一个推理示例代码片段，仍然使用相同的 `AutoModelForMultimodalLM` 类。

文本与音频推理

```python
from transformers import AutoModelForMultimodalLM, AutoProcessor

model_id = "thinkingmachines/Inkling"

processor = AutoProcessor.from_pretrained(model_id)
model = AutoModelForMultimodalLM.from_pretrained(
    model_id,
    dtype="auto",
    device_map="auto",
)

audio_url = (
    "https://huggingface.co/datasets/merve/vl-test-suite/"
    "resolve/main/example_audio.mp3"
)
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "将以下语音转录为文本。"},
            {
                "type": "audio",
                "audio": audio_url,
            },
        ],
    },
]

inputs = processor.apply_chat_template(
    messages,
    tokenize=True,
    return_dict=True,
    return_tensors="pt",
    add_generation_prompt=True,
).to(model.device)
input_len = inputs["input_ids"].shape[-1]

outputs = model.generate(**inputs, max_new_tokens=512)
response = processor.decode(outputs[0][input_len:], skip_special_tokens=False)

processor.parse_response(response)
```

对于在多个节点集群中进行更实际的并行部署，请参考下面的 [Slurm](#slurm-scripts) 部分。

### [](#sglang)SGLang

SGLang 是 Inkling 发布时最快的部署框架之一，因为它包含自定义模型实现。下面的启动命令将模型分片到 8 个 GPU 上，并在端口 30000 上提供兼容 OpenAI 的 API。

```bash
pip install sglang

python3 -m sglang.launch_server \
 --model-path thinkingmachine/Inkling \
 --tp-size 8 \
 --served-model-name inkling \
 --host 0.0.0.0 \
 --port 30000
```

将 `--tp-size` 匹配到你的 GPU 数量。如果需要为 KV 缓存留出更多空间，请添加 `--mem-fraction-static`（例如 `0.85`）。

### [](#vllm)vLLM

vLLM 在生产服务方面表现出色。一条 `vllm serve` 命令即可从 Hub 下载权重，通过张量并行将模型分片到你的 GPU 上，并在端口 8000 上启动兼容 OpenAI 的服务器。你可以在此处查看模型的 vLLM 配方 [here](https://recipes.vllm.ai/thinkingmachines/Inkling)，以根据你的硬件进行定制。

```bash
# 需要 nightly 或 vllm>=0.26（发布后）
uv pip install -U vllm --pre \
  --extra-index-url https://wheels.vllm.ai/nightly/cu130 \
  --extra-index-url https://download.pytorch.org/whl/cu130 \
  --index-strategy unsafe-best-match

vllm serve thinkingmachines/Inkling-NVFP4 \
  --trust-remote-code \
  --tokenizer-mode inkling \
  --tensor-parallel-size 8 \
  --enable-auto-tool-choice \
  --tool-call-parser inkling \
  --reasoning-parser inkling \
  --served-model-name inkling
```

在实践中，你可能需要多个节点和像 SLURM 这样的分发工具（见下文）。关键参数是将 `--tensor-parallel-size` 设置为节点上的 GPU 数量，如果遇到 KV 缓存内存限制，则使用 `--max-model-len` 来限制上下文窗口。

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "inkling",
    "messages": [{"role": "user", "content": "你好！"}]
  }'
```

### [](#remote-inference-with-hugging-face-inference-providers)使用 Hugging Face 推理提供商的远程推理

你可以通过Hugging Face使用多个推理提供商来运行此模型。你可以在这里查看所有代码片段：[https://huggingface.co/thinkingmachines/inkling?inference_provider=fastest&language=python&client=openai&inference_api=true](https://huggingface.co/thinkingmachines/inkling?inference_provider=fastest&language=python&client=openai&inference_api=true)。下面展示了如何配合OpenAI客户端使用。

```
import os

from openai import OpenAI

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

completion = client.chat.completions.create(
    model="thinkingmachines/Inkling:auto",
    messages=[
        {
            "role": "user",
            "content": "法国的首都是哪里？",
        },
    ],
)

print(completion.choices[0].message)
```

使用 `":auto"` 后缀会根据你的设置路由到首选提供商；你也可以使用 `"cheapest"` 或 `":fastest"`。本次发布中，我们为所有人承担了发布后2小时内的推理费用。

注意：推理提供商中的音频支持仍在开发中，即将推出。

### [](#local-inference-with-llamacpp-and-unsloth)使用llama.cpp和Unsloth进行本地推理

你可以使用 `llama.cpp` 在有限硬件上运行模型的量化版本。Unsloth已将模型量化至1位精度，相比原始模型减少了95%的VRAM消耗。

```
llama serve -hf unsloth/inkling-GGUF:UD-IQ1_S
```

这将启动一个兼容OpenAI的服务器，运行在 [`http://localhost:8080`](http://localhost:8080/)`/v1`，你可以通过首选工具或客户端连接。访问该地址后，你可以开始与模型对话，设置你喜欢的MCP，方便地传入图像或文件等！

Llama cpp还内置了一个支持工具、MCP和代理工作负载的UI。查看以1位精度在llama应用中运行的Inkling：

<video controls="" width="100%" autoplay="" loop="" muted=""><source src="https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/thinky.mp4" type="video/mp4"></video>

Inkling的GGUF文件也可以在Unsloth Studio中运行，使用动态1位GGUF，保留了约74.2%的top-1%准确率，同时体积缩小了86%。

[![Inkling在Unsloth Studio中运行](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/unsloth.png)](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/unsloth.png)

## [](#use-cases)使用场景

### [](#agentic-coding-with-pi)使用Pi进行代理编程

Pi是一个极简的编码代理工具，你可以与不同的语言模型配合使用。你可以通过推理引擎服务器端点（如llama.cpp）或Hugging Face上的推理提供商来使用Pi，只需在安装后将以下内容添加到 `~/.pi/agent/models.json` 中。

```
{
  "providers": {
    "inference-providers": {
      "baseUrl": "https://router.huggingface.co/v1",
      "api": "openai-completions",
      "apiKey": "hf_...",
      "models": [
        {
          "id": "thinkingmachines/Inkling"
        }
      ]
    }
  }
}
```

然后，你可以在项目目录中通过调用 `pi` 来启动Pi，一切就绪！在这个演示中，我们给模型一个困难的数学推理问题，它使用Pi中的工具来解决。

[![视觉推理gif演示](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/visual-reasoning.gif)](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/visual-reasoning.gif)

Inkling专注于广泛的模态推理和低令牌消耗，因此可以尝试将其用于文档处理或音频任务。

### [](#multi-token-prediction-drafters)多令牌预测草稿器

MTP为模型添加了额外层，可以一次预测多个令牌，而不仅仅是下一个。在推理过程中，这些额外层充当推测解码的“草稿器”，在不影响性能的情况下加速生成。使用MTP，你可以获得完全相同的生成输出，同时以较小的VRAM内存成本（由于服务草稿器）实现生成速度的倍增。Thinking Machines还在此次发布中提供了一个MTP草稿器。

```
import torch
from transformers import AutoModelForMultimodalLM, AutoProcessor

processor = AutoProcessor.from_pretrained("thinkingmachines/Inkling")
model = AutoModelForMultimodalLM.from_pretrained(
    "thinkingmachines/Inkling",
    dtype=torch.bfloat16,
    device_map="auto",
)
```

# 预处理输入。
...
generated = model.generate(
    **inputs,
    max_new_tokens=1000,
    do_sample=False,
    use_mtp=True,
)
print(processor.decode(generated[0], skip_special_tokens=True))
```

### [](#multimodal-vision)多模态视觉

我们准备了一组来自专家级来源和大学入学考试的小型推理题。我们拍摄了带有水印的屏幕照片来挑战模型。模型在高级推理努力下全部解答正确，在最高级和中级推理努力下各有一道题失败，因此我们提供模型答案的链接，供您查看模型的表现，并列出模型解答每道题所消耗的 token 数量。请注意，这些 vibe 评估中我们没有提供系统提示，而这些推理题通常需要配合良好的系统提示运行。vibe 评估图片和结果见[此处](https://huggingface.co/buckets/merve/inkling)。

| 类别 | 问题 | Token 数量（推理努力：中） | Token 数量（推理努力：高） | Token 数量（推理努力：最高） |
| --- | --- | --- | --- | --- |
| 开放式药物相互作用 | 这里哪些成分存在相互作用？ | 1,893 ✅ | 2,367 ✅ | 3,688 ✅ |
| 物理题（MMMU-Pro） | 回答图片中的问题。 | 1,357 ✅ | 3,323 ✅ | 3,314 ✅ |
| 多语言物理题 | 回答图片中的土耳其语问题。 | 1,435 ✅ | 2,129 ✅ | 3,162 ✅ |
| 律师资格考试 | 回答图片中的问题。 | 1,117 ✅ | 2,137 ✅ | 1,676 ✅ |
| 信息图表问答（开放式） | 根据所提供的信息，预计北极夏季变暖期的长度大约是已观测到的显著变暖时长的多少倍？ | 1,378 ❌ | 3,859 ✅ | 6000（超出 token 预算） |

**关于 vibe 的几点说明：**

-   模型没有直接回答信息图表中的问题，而是先将图片上的文字转换为文本，以此作为推理基础。
-   在推理过程中，提示词对节省 token 至关重要。例如，面对一张药片背面的图片，如果提问“这里哪些成分存在相互作用？”这种模糊的问题，模型首先需要理解这里所说的“相互作用”具体指什么。
-   多项选择题的答案极大地帮助了模型构建自身的推理过程；相比之下，模型在处理开放式问题时表现更吃力，但这在许多模型中都是普遍问题。通常的思维链是：OCR → 特征描述 → 评估每个选项 → 给出答案。
-   0.7 的推理努力（中等）似乎能提供较好的平衡。

### [](#multimodal-audio)多模态音频

我们已对模型在 BigBenchAudio 的部分音频推理示例以及 [GlobeAudio](https://huggingface.co/datasets/iNLP-Lab/GlobeAudio) 的几个多语言音频示例（俄语和中文的多选题，要求找出转录中的最后一个词）进行了体验评估。我们测试的 [BigBenchAudio](https://huggingface.co/datasets/ArtificialAnalysis/big_bench_audio) 示例包含逻辑陈述和问题，要么询问形式谬误（某个论点是否能从音频给出的上下文中逻辑推导出来），要么进行物体计数（在音频中陈述多个不同物体，询问某个物体的总数）。尽管该基准最初是为语音到语音推理设计的，但我们只是想测试该模型的音频推理能力。对于 GlobeAudio，问题相对直接，因此我们将推理努力值设为 0.1 进行测试。我们运行了 GlobeAudio 中每种语言的第一个示例。除最低努力值下的第二个形式谬误示例外，所有测试在所有问题和努力值下均通过，因此我们仅提供每个问题在不同推理努力值下消耗的 token 数量。体验评估结果和音频文件位于[此处](https://huggingface.co/buckets/merve/inkling)。

| GlobeAudio | 问题 | 完成 token 数（最低推理努力值） | 完成 token 数（中等推理努力值） |
| --- | --- | --- | --- |
| 俄语（询问最后一个词） | 音频录音中的最后一个词是什么？1. Россия 2. Свидетелем 3. Москва 4. Событий 选择唯一正确选项，并用其确切文本回答。 | 130 | 179 |
| 俄语（询问说话者职业） | 说话者最有可能从事什么职业？1. Репортершей 2. Блоггершей 3. Учительницей истории 4. Ведущей развлекательного шоу 选择唯一正确选项，并用其确切文本回答。 | 105 | 136 |
| 中文（询问语速） | 播报员的语速有何变化？1. 突然变快 2. 突然变慢 3. 保持不变 4. 时快时慢 选择唯一正确选项，并用其确切文本回答。 | 111 | 289 |

| Big Bench Audio | 完成 token 数（最低） | 完成 token 数（中等） | 完成 token 数（最高） |
| --- | --- | --- | --- |
| 形式谬误 (10) | 285 | 335 | 444 |
| 形式谬误 (39) | 275（失败） | 555 | 778 |
| 物体计数 (680) | 150 | 233 | 161 |

**关于体验的一些说明：**

-   与视觉类似，模型在回答问题前会先转录语音。
-   模型能抵抗干扰项：在俄语测试中，尽管音频中出现了其他答案，模型仍选择了正确答案。
-   与视觉类似，通常的思维链是：转录 → 描述 → 评估每个选项 → 回答。
-   努力值有助于推理，而非听力。音频问答比图像问答便宜得多。

### [](#post-training)后训练

如果您希望使用 Inkling 进行后训练，Thinking Machines 已构建了 `tinker`，这是一个用于后训练开放权重模型的托管工具。他们的指南手册包含微调、蒸馏和强化学习的示例。

我们使用 Tinker 和 OpenEnv（一种智能体强化学习环境工具）对 Inkling 进行了后训练。我们采用了 ECHO 算法，该算法无需验证器即可训练模型预测环境，对环境生成的 token 应用下一个 token 的交叉熵损失，同时结合智能体动作的常规策略学习。这使得策略能够隐式学习世界模型，而无需单独的模型、教师或额外的 rollout。查看[示例](https://github.com/huggingface/OpenEnv/blob/main/examples/echo_world_model/backends/tinker_echo_demo.py)。

[![Inkling 后训练指标](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/trackio.png)](https://huggingface.co/buckets/huggingface/inkling-blog-assets/resolve/trackio.png)

使用 Tinker 和 OpenEnv 的强化学习示例

```
git clone https://github.com/huggingface/OpenEnv.git
cd OpenEnv

# 在 .env 中添加 TINKER_API_KEY=...，然后运行：
uv run --env-file .env \
  examples/echo_world_model/backends/tinker_echo_demo.py
```

如果你正在使用 Transformers 强化学习，我们建议在知识蒸馏设置中将 Inkling 作为教师模型。例如，利用 Inkling 的文档理解能力来提升较小模型（如设备端模型）的性能。在[此示例](https://github.com/huggingface/trl/blob/main/examples/scripts/gold.py)中，我们使用了 transformer 强化学习库和 GOLD 算法进行知识蒸馏。GOLD 在此处非常实用，因为它能匹配不同分词器之间的 token logits，因此你可以将知识蒸馏到 Hub 上的任何模型。

## [](#slurm-scripts)Slurm 脚本

为了在集群上部署 Inkling，我们提供了使用 transformers API 服务的 SLURM 脚本，以及如何通过不同模态查询端点的说明。你可以通过更新命令将这些脚本适配到 vLLM 或 SGlang。这些脚本位于[此处](https://huggingface.co/buckets/merve/inkling)。

-   [提交推理作业](https://huggingface.co/buckets/merve/inkling/tree/slurm/submit_inkling_generate.sbatch)
-   [Python 生成脚本](https://huggingface.co/buckets/merve/inkling/tree/slurm/generate_inkling.py)

## [](#benchmark-results)基准测试结果

|  |  | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (高) | Claude Fable 5 (最大) | GPT 5.6 Sol (极高) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **推理** |  |  |  |  |  |  |  |  |  |  |
|  | HLE（仅文本） | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
|  | HLE（带工具） | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
|  | AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
|  | GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| **智能体（编程）** |  |  |  |  |  |  |  |  |  |  |
|  | SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |
|  | SWEBench Pro（公开） | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | 55.4% | 54.2% | 80.0% | 64.6% |
|  | Terminal Bench 2.1（最佳测试集） | 63.8 | 56.4 | 51.3 | 71.3 | 82.7 | 64 | 73.8 | 84.6 | 89.5 |
|  | GDPVal-AA v2 | 1233 | 1164 | 1009 | 1190 | 1514 | 1307 | 962 | 1760 | 1748 |
| **智能体（通用）** |  |  |  |  |  |  |  |  |  |  |
|  | MCP Atlas | 74.1% | 44.7% | 64.0% | 68.1% | 77.8% | 73.2% | 78.2% | 83.3% | 81.8% |
|  | Tau 3 Banking | 23.7% | 13.8% | 13.2% | 20.6% | 26.8% | 25.8% | 16.5% | 26.8% | 33.0% |
| **事实性** |  |  |  |  |  |  |  |  |  |  |
|  | BrowseComp（带上下文） | 77.1% | – | 74.9% | 83.2% | – | 83.4% | 85.9% | 88.0% | 89.4% |
|  | SimpleQA Verified | 43.9% | 32.4% | 36.9% | 38.7% | 38.1% | 57.0% | 77.3% | 68.3% | 71.6% |
|  | AA Omniscience | 1.0% | \-1.0% | \-8.0% | 6.0% | 4.0% | \-10.0% | 33.0% | 40.0% | 22.0% |
| **对话** |  |  |  |  |  |  |  |  |  |  |
|  | IFBench | 79.8% | 81.4% | 70.2% | 76.0% | 73.3% | 76.5% | 77.1% | 63.5% | 72.7% |
|  | Global-MMLU-Lite | 88.7% | 85.6% | 84.0% | 88.4% | 89.2% | 89.3% | 92.7% | 93.3% | 91.8% |
| **视觉** |  |  |  |  |  |  |  |  |  |  |
|  | MMMU Pro（标准10） | 73.3% | – | 75.0% | 79.0% | – | – | 82.0% | 84.2% | 83.0% |
|  | Charxiv RQ | 78.1% | – | 77.5% | 80.4% | – | – | 80.2% | 86.5% | 84.7% |
|  | Charxiv RQ（带Python） | 82.0% | – | 78.7% | 86.7% | – | – | 89.9% | 89.4% | 87.8% |
| **音频** |  |  |  |  |  |  |  |  |  |  |
|  | Audio MC | 56.6% | – | – | – | – | – | 66.8% | – | – |
|  | MMAU | 77.2% | – | – | – | – | – | 82.5% | – | – |
|  | VoiceBench | 91.4% | – | – | – | – | – | 94.3% | – | – |
| **安全** |  |  |  |  |  |  |  |  |  |  |
|  | FORTRESS（对抗性） | 78.0% | 77.6% | 54.1% | 65.6% | 71.3% | 36.0% | 65.2% | 96.0% | 82.4% |
|  | FORTRESS（良性） | 95.9% | 90.5% | 98.3% | 97.2% | 90.0% | 98.5% | 98.0% | 55.1% | 98.1% |
|  | StrongREJECT | 98.6% | 98.7% | 99.5% | 99.8% | 98.5% | 98.6% | 98.0% | 98.7% | 98.5% |
