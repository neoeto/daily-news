---
title: Run a vLLM Server on HF Jobs in One Command
url: 'https://huggingface.co/blog/vllm-jobs'
url_hash: 7f1a19cb84580aa11636c9a996cad4fb5bffdb50
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-26T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Quentin Gallouédec 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/1677431596830-631ce4b244503b72277fc89f.jpeg)](https://huggingface.co/qgallouedec)

只需一条命令，你就可以在 Hugging Face 基础设施上启动一个私有的、兼容 OpenAI 的 LLM 端点——无需配置服务器，无需 Kubernetes，按秒计费。启动后，你可以从笔记本电脑、笔记本或任何其他地方查询它。

这是为测试、评估或批量生成快速部署模型的最快方式。（如果你需要的是托管的生产级服务，那应该使用 [Inference Endpoints](https://huggingface.co/docs/inference-endpoints)——文末有 [更多关于何时选择哪种](#hf-jobs-or-inference-endpoints) 的说明。）

以下是完整的端到端流程。

## [](#prerequisites)前提条件

-   一种支付方式或正数的预付费信用余额（Jobs 按硬件使用分钟计费）。
-   `huggingface_hub >= 1.20.0`：`pip install -U "huggingface_hub>=1.20.0"`。
-   本地登录：`hf auth login`。

## [](#launch-the-server)启动服务器

`hf jobs run` 相当于 HF 基础设施上的 `docker run`。我们使用官方的 `vllm/vllm-openai` 镜像，通过 `--flavor` 请求一个 GPU，并通过 `--expose` 暴露 vLLM 的端口：

```
hf jobs run --flavor a10g-large --expose 8000 --timeout 2h \
  vllm/vllm-openai:latest \
  vllm serve Qwen/Qwen3-4B --host 0.0.0.0 --port 8000
```

`--expose 8000` 将容器的端口通过 Hugging Face 的公共 Jobs 代理路由出去（完整参考请参见 [服务模型指南](https://huggingface.co/docs/hub/jobs-serving)）。该命令会打印你的服务器可访问的 URL：

```
✓ Job started
  id: 6a381ca1953ed90bfb947332
  url: https://huggingface.co/jobs/qgallouedec/6a381ca1953ed90bfb947332
提示：暴露的端口可通过以下地址访问（需要具有任务读取权限的 HF 令牌）：
  https://6a381ca1953ed90bfb947332--8000.hf.jobs
```

`6a381ca1953ed90bfb947332` 是你的任务 ID。请记住它，我们后面会用到。在本文的其余部分，我们将用 `<job_id>` 作为它的占位符。

给它几分钟时间来下载权重并启动。当日志显示 `Application startup complete` 时，说明服务已就绪。

## [](#query-it-from-anywhere)从任何地方查询它

vLLM 使用 OpenAI API，每个请求只需将你的 HF 令牌作为 Bearer 令牌传递。最快的方式是使用 curl：

```
curl https://<job_id>--8000.hf.jobs/v1/chat/completions \
  -H "Authorization: Bearer $(hf auth token)" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3-4B",
    "messages": [{"role": "user", "content": "Hello!"}],
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

这将返回标准的 OpenAI 风格 JSON，其中 `choices[0].message.content` 包含 `"Hello! How can I assist you today? 😊"`。

或者，在 Python 中，将 OpenAI 客户端指向暴露的 URL，并将令牌作为 API 密钥传递：

```
from huggingface_hub import get_token
from openai import OpenAI

client = OpenAI(
    base_url="https://<job_id>--8000.hf.jobs/v1",
    api_key=get_token(),
)
resp = client.chat.completions.create(
    model="Qwen/Qwen3-4B",
    messages=[{"role": "user", "content": "Hello!"}],
    extra_body={"chat_template_kwargs": {"enable_thinking": False}},
)
print(resp.choices[0].message.content)
```

```
Hello! How can I assist you today? 😊
```

在开始之前快速检查健康状况：`curl https://<job_id>--8000.hf.jobs/v1/models -H "Authorization: Bearer $(hf auth token)"` 应该会列出模型。

> **🔐 该端点设有访问控制，并非公开访问。** 每个请求都必须携带一个 HF token，且该 token 需具备**对任务命名空间的读取权限**。直接通过浏览器访问会被拒绝。实际上，任务代理*就是*你的 API 网关：访问权限仅限于你（及你的组织）。这对于私有使用来说没问题，但请妥善对待该 URL：不要期望它是开放的而随意分享，也不要将你的 token 粘贴到不可信的地方。如果你需要更细粒度或公开的访问，请在前面放置一个合适的网关。或者参见下方的 [HF Jobs 还是 Inference Endpoints？](#hf-jobs-or-inference-endpoints)。

## [](#clean-up)清理

任务按秒计费，因此完成后请停止服务器：

```
hf jobs cancel <job_id>
```

你设置的 `--timeout` 是一个安全网（它会自动停止），但显式取消更省钱。一个 `a10g-large` 实例每小时费用为 $1.50——运行 `hf jobs hardware` 查看完整价格列表，并选择适合你模型的最小规格。

## [](#going-further-bigger-models)进阶：更大的模型

同样的命令可以扩展到更大的模型——选择更强大的 `--flavor`，并通过 `--tensor-parallel-size` 告诉 vLLM 将模型分片到多个 GPU 上。例如，在 2× H200 上运行 122B 的 Qwen3.5 混合专家模型：

```
hf jobs run --flavor h200x2 --expose 8000 --timeout 2h \
  vllm/vllm-openai:latest \
  vllm serve Qwen/Qwen3.5-122B-A10B \
  --host 0.0.0.0 --port 8000 --tensor-parallel-size 2 \
  --max-model-len 32768 --max-num-seqs 256
```

`--tensor-parallel-size` 应与 flavor 中的 GPU 数量匹配（`h200x2` → 2，`h200x8` → 8）。运行 `hf jobs hardware` 查看可用选项，并为更大的模型设置更长的 `--timeout`，因为它们需要更长时间下载和加载。对于大型模型，H200 系列通常性价比最高。

`--max-model-len 32768 --max-num-seqs 256` 这些标志特定于此模型：Qwen3.5-122B 是一种混合 Mamba/注意力架构，默认上下文长度为 256K token，这会导致 vLLM 的默认批处理设置内存不足。限制上下文长度和并发序列数量可以使其保持在 GPU 内存范围内。如果模型因内存不足或缓存块错误而无法启动，首先尝试调低这两个参数。其他所有内容（暴露的 URL、OpenAI 客户端、token 认证）保持不变。

## [](#going-further-chat-with-it-in-a-ui)进阶：在 UI 中聊天

更喜欢聊天窗口而不是 curl？几行 [Gradio](https://www.gradio.app/) 代码即可指向同一个端点。在 `vllm serve` 命令中添加 `--reasoning-parser deepseek_r1`，以便 Qwen3 的思考过程作为单独字段返回（非必需，但很有帮助），然后在本地运行以下代码（你只需要任务 ID）：

```
import gradio as gr
from gradio import ChatMessage
from huggingface_hub import get_token
from openai import OpenAI

client = OpenAI(base_url="https://<job_id>--8000.hf.jobs/v1", api_key=get_token())

def chat(message, history):
    messages = [{"role": m["role"], "content": m["content"]} for m in history if not m.get("metadata")]
    messages.append({"role": "user", "content": message})
    stream = client.chat.completions.create(model="Qwen/Qwen3-4B", messages=messages, stream=True)
```

```python
thinking, answer = "", ""
    for chunk in stream:
        delta = chunk.choices[0].delta
        thinking += delta.model_extra.get("reasoning", "")
        answer += delta.content or ""
        out = []
        if thinking.strip():
            status = "done" if answer.strip() else "pending"
            out.append(ChatMessage(role="assistant", content=thinking, metadata={"title": "💭 思考中", "status": status}))
        if answer.strip():
            out.append(ChatMessage(role="assistant", content=answer))
        yield out

gr.ChatInterface(chat).launch()
```

运行后，打开 `http://127.0.0.1:7860` 即可对话——推理过程会流式显示在可折叠面板中，答案则显示在下方。

<video alt="vllm-jobs-chat-ui" autoplay="" loop="" muted="" playsinline=""><source src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-jobs/demo.mp4" type="video/mp4"></video>

## [](#going-further-ssh-into-the-running-server)进阶操作：SSH 连接到运行中的服务器

需要调试启动失败、查看 GPU 内存或实时查看日志？你可以直接打开一个 shell 连接到正在运行的任务。启动时添加 `--ssh` 参数，并确保你的公钥已在 [huggingface.co/settings/keys](https://huggingface.co/settings/keys) 注册：

```
hf jobs run --flavor a10g-large --expose 8000 --timeout 2h --ssh \
  vllm/vllm-openai:latest \
  vllm serve Qwen/Qwen3-4B --host 0.0.0.0 --port 8000
```

然后使用任务 ID 连接：

```
hf jobs ssh <job_id>
```

现在你就进入了容器内部，可以运行 `nvidia-smi`、检查进程或直接操作模型——这比从外部读取日志要方便得多。SSH 支持需要 `huggingface_hub >= 1.20.0`。

## [](#going-further-use-it-as-a-coding-agent-backend-with-pi)进阶操作：配合 Pi 将其用作编码代理后端

同一个端点可以支持终端编码代理。[Pi](https://pi.dev/) 是一个与提供商无关的代理框架。将其指向该任务，你就拥有了一个运行在自己托管模型上的读/写/编辑/Bash 代理。

首先需要设置：代理通过工具调用驱动模型，而 vLLM 只有在服务器启用工具调用功能时才会接受这些调用。因此需要使用 `--enable-auto-tool-choice` 和与模型系列匹配的 `--tool-call-parser`（Qwen3 使用 `hermes`）重新启动。代理也需要更强的模型，所以这里适合引入更大的模型：

```
hf jobs run --flavor h200x2 --expose 8000 --timeout 2h \
  vllm/vllm-openai:latest \
  vllm serve Qwen/Qwen3.5-122B-A10B \
  --host 0.0.0.0 --port 8000 --tensor-parallel-size 2 \
  --max-model-len 32768 --max-num-seqs 256 \
  --reasoning-parser deepseek_r1 \
  --enable-auto-tool-choice --tool-call-parser hermes
```

然后在 `~/.pi/agent/models.json` 中将该任务添加为自定义提供商：

```
{
  "providers": {
    "hf-jobs": {
      "baseUrl": "https://<job_id>--8000.hf.jobs/v1",
      "api": "openai-completions",
      "apiKey": "!hf auth token",
      "models": [
        { "id": "Qwen/Qwen3.5-122B-A10B" }
      ]
    }
  }
}
```

然后启动代理：

```
pi
```

刚才用几条命令启动的模型，现在正在你的终端中驱动一个交互式编码代理。

<video alt="vllm-jobs-pi" autoplay="" loop="" muted="" playsinline=""><source src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vllm-jobs/pi.mp4" type="video/mp4"></video>

## [](#hf-jobs-or-inference-endpoints)HF Jobs 还是推理端点？

HF Jobs 并非在 Hugging Face 上部署模型的唯一方式。[推理端点](https://huggingface.co/docs/inference-endpoints)是我们提供的托管产品，用于完成同样的任务。选择哪个取决于你的具体需求。

当您需要最大灵活性和控制力时，请选择 **HF Jobs**：它只是在 HF 基础设施上执行 `docker run`，因此您可以自行选择镜像、精确的 `vllm serve` 参数以及硬件，并按作业运行时长按秒付费。这使得它非常适合实验、一次性评估、批量生成，或在正式投入前试用模型。

当您需要更接近生产环境的方案时，请选择 **Inference Endpoints**。它们为长期运行的服务提供了必要的运维便利：更精细的访问控制（端点可设为公开、受保护或私有），以及缩放到零功能，从而在无活动期间不会产生费用。如果您要搭建一个持久端点而非运行作业，这就是您需要的工具。

## [](#further-reading)延伸阅读

本文专注于 vLLM，但相同的暴露端口模式适用于任何兼容 OpenAI 的服务器。如需使用 llama.cpp 提供 GGUF 服务或运行 SGLang，请参阅 [在 Jobs 上提供模型指南](https://huggingface.co/docs/hub/jobs-serving)，其中详细介绍了这些后端。
