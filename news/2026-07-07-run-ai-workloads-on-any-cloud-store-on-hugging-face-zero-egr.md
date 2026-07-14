---
title: >-
  Run AI workloads on any cloud, store on Hugging Face: zero-egress storage with
  SkyPilot
url: 'https://huggingface.co/blog/skypilot-hf-storage'
url_hash: b29a21395768cd97a181799d4d884d389985322a
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-07T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

对大多数团队而言，模型和数据集都存放在某个云服务商单一区域的一个存储桶中。而你能获取的GPU——无论是用于开发、训练还是推理——却越来越多地部署在与你数据不同的云上。一旦这两者分离，你就要为将数据读取到自己的GPU上支付跨云传输费用。

我们与Hugging Face携手，将这两部分整合在一起：你的模型和数据集保留在Hub上，而SkyPilot则负责在拥有GPU的集群上运行计算任务（开发、训练或推理）。只需使用一个`hf://` URL和你已有的`HF_TOKEN`，即可将Hugging Face存储桶或任何Hub仓库挂载到SkyPilot任务中，然后无论哪里有计算资源，都可以启动任务。Hugging Face不收取任何出站流量费用，因此，在任何云上将数据读取到GPU上都是零成本的。

以下是新功能：

-   **在任意任务中使用Hub数据。** 通过`store: hf`，使用一个`hf://` URL和你现有的`HF_TOKEN`，即可将Hugging Face **存储桶**（可读写）或任何**模型/数据集/Space仓库**（只读）以`MOUNT`或`COPY`方式挂载到SkyPilot任务中。
-   **在任何云上的任何GPU上运行。** [SkyPilot](https://docs.skypilot.co/) 可在20多个云平台、Kubernetes、Slurm及本地环境中找到合适的计算资源，因此同一任务可以使用你预留或按需获取的任何GPU，无论供应商是谁。
-   **读取数据零出站费用。** Hugging Face存储[不收取出站或CDN费用](https://huggingface.co/pricing)，因此无论SkyPilot将任务部署在何处，它都直接从同一个存储桶中读取你的模型和数据集，无需为每个云创建副本，也无需支付拉取数据的出站账单。
-   **基于Xet的去重功能。** 存储桶基于[Xet](https://huggingface.co/docs/hub/xet/overview)构建，因此增量检查点和模型变体仅存储和传输发生变化的数据块。
-   **共同构建。** [Hugging Face](https://huggingface.co/) 和 [SkyPilot](https://docs.skypilot.co/) 联合发布了此功能，并且Hugging Face团队上游了`hf-mount` FUSE修复程序，使其能够在非特权容器中正常工作。

## [](#hugging-face-storage-is-now-a-first-class-skypilot-backend)Hugging Face存储现已成为SkyPilot的一等后端

[![SkyPilot将Hugging Face模型、数据集和检查点挂载到运行在CoreWeave、Nebius、GCP及20多个其他平台预留GPU集群上的任务中，实现零出站读取。](https://huggingface.co/blog/assets/skypilot-hf-storage/architecture.png)](https://huggingface.co/blog/assets/skypilot-hf-storage/architecture.png)

SkyPilot任务已经可以通过挂载到本地路径的方式，读写云对象存储（S3、GCS、Azure、R2等）。现在，Hugging Face存储也加入了这一行列，作为`store: hf`，通过`hf://`方案访问：

```
file_mounts:
  # 一个Hugging Face存储桶，可读写，用于检查点、日志、处理后的数据。
  /checkpoints:
    source: hf://buckets/my-org/qwen-sft
    store: hf
    mode: MOUNT # 或 COPY
  # 一个模型仓库，只读挂载。
  /base-model:
    source: hf://Qwen/Qwen3.5-4B
    store: hf
    mode: MOUNT
  # 一个数据集仓库，固定到特定版本，只读。
  /data:
    source: hf://datasets/my-org/my-dataset@main
    store: hf
    mode: MOUNT
```

那个 `hf://` 方案覆盖了整个生命周期：从仓库中读取**模型**和**数据集**，在训练时将**检查点**写入存储桶，将训练好的模型发布回仓库，并在推理时将其拉取到推理服务器上。大多数团队已经将模型和数据集保存在 Hub 上，因此无需迁移步骤，也无需创建新的存储账户。

`MOUNT` 使用 Hugging Face 的 [`hf-mount`](https://github.com/huggingface/hf-mount) FUSE 后端，因此存储桶或仓库会显示为本地路径，与 SkyPilot 的其他 FUSE 挂载（`gcsfuse`、`blobfuse2`、`rclone`、`goofys`）并列。数据获取发生在文件系统层：当代码发出 `read()` 调用时，驱动程序仅从 Xet 后端拉取那些字节，因此只有实际访问的数据会通过网络传输，而 `hf-mount` 会保留磁盘缓存，使重复读取保持在本地。这种磁盘缓存行为与 SkyPilot 在 [`MOUNT_CACHED`](https://docs.skypilot.co/en/latest/reference/storage.html) 下为其他后端提供的功能一致，而普通的 `MOUNT` 则每次从存储桶流式读取，不保留任何本地数据。对于 `hf` 存储，`MOUNT` 和 `MOUNT_CACHED` 的行为相同，因此两种模式都会保留缓存。

由于读取是惰性的，进程可以在整个大文件下载完成之前就开始处理它，而无需等待完整复制完成后再进行。这使得 GPU 几乎可以立即投入工作，在数据流式传入时进行训练，而不是在数据集或检查点复制时闲置（并产生费用）。这在第一个 epoch 时效果最为显著，因为此时还没有任何缓存。`COPY` 则采用另一种方式，通过 `huggingface_hub` 预先下载，没有特殊要求。

身份验证使用您已有的令牌。在环境中设置 `HF_TOKEN`，并通过 [`--secret HF_TOKEN`](https://docs.skypilot.co/en/latest/running-jobs/environment-variables.html) 将其传递给运行任务；SkyPilot 会在任务所在的任何云平台上使用该令牌进行挂载。无论任务落在 AWS、GCP、Azure、Nebius、Lambda 还是您自己的 Kubernetes 集群上，一个令牌都能通用，因此无需管理每个云平台的存储桶密钥。

## [](#no-egress-storage-stops-deciding-where-you-run)无出站流量：存储不再决定运行位置

如今，GPU 容量很少来自单一来源。为了获得足够的 H100 和 H200，团队会在多个供应商处同时持有预留和承诺容量（超大规模云上的一个块、新云上的一个集群，或许还有本地机架），并在有分配的地方运行。SkyPilot 正是为此而设计：一个任务规范，调度到 20 多个云平台、Kubernetes 和本地环境，落在任何一个空闲的预留集群上。

对象存储一直是个难题。对象存储是区域性和云厂商绑定的，因此，如果要为位于不同供应商数据中心的GPU或推理服务器提供数据，要么需要在每个供应商的存储桶中都保留一份数据副本，要么就得付费将数据拉取过去。大多数云服务商在数据离开其网络时都会收取出口费（例如，从AWS传出数据约为0.09美元/GB），而且通常在同一云服务商的不同区域之间也会收费。将基础模型拉取到每个推理节点，或者从另一个云服务商的集群中对数据集进行多个epoch的迭代，都会在你已经预留的GPU费用之上，增加一笔高昂的账单。最终，团队不得不将每次运行绑定到持有数据的那个供应商，而让其余的计算资源闲置。

Hugging Face Storage 消除了最令人头疼的成本：读取端。凭借[无出口或CDN费用](https://huggingface.co/pricing)以及12-18美元/TB/月的存储价格（相比之下，AWS S3大约为23美元/TB，还需另加出口费），同一个存储桶可以从所有这些集群访问，并且无论GPU在哪里运行，从中读取数据都是免费的。写回数据仍然需要支付你所用计算云服务的常规出口费，这与写入任何其他云外存储一样，但对于大多数AI工作负载来说，读取操作占主导地位：跨多个epoch流式传输的数据集，或者拉取到每个新训练或推理节点的模型权重。因此，你不再需要将每次运行绑定到持有数据副本的某个供应商。

## [](#a-quick-benchmark)快速基准测试

为了收集一些基准测试数据，我们运行了一个小型微调任务：使用TRL的[`SFTTrainer`](https://huggingface.co/docs/trl/sft_trainer)，在[`HuggingFaceH4/Multilingual-Thinking`](https://huggingface.co/datasets/HuggingFaceH4/Multilingual-Thinking)数据集上微调[`Qwen/Qwen3.5-4B`](https://huggingface.co/Qwen/Qwen3.5-4B)，将模型从其Hub仓库以只读方式挂载，并将每个检查点写入一个Hugging Face Bucket。相同的SkyPilot YAML文件在AWS、GCP和Lambda上运行，仅更改了`--infra`参数。SkyPilot将每个任务放置在GPU空闲的地方，所有三个云服务都读写同一个存储桶。

```
# qwen-sft.yaml. 在任何地方启动: sky launch qwen-sft.yaml --infra aws|gcp|...
resources:
  accelerators: H100:1 # 或者云服务商提供的任何GPU

file_mounts:
  /base-model:
    source: hf://Qwen/Qwen3.5-4B # 只读，从Hub延迟挂载
    store: hf
    mode: MOUNT
  /checkpoints:
    source: hf://buckets/my-org/qwen-sft # 读写Bucket
    store: hf
    mode: MOUNT

run: |
  python train.py --model /base-model --output_dir /checkpoints
```

我们测量到的结果：

-   **模型在每个云服务上都免费加载。** 延迟读取只拉取`from_pretrained`实际触及的数据，因此大约30秒即可开始训练（速度高达约500 MB/s）。由于Hugging Face不收取出口费，这次拉取没有成本；如果模型存放在S3中，每次从另一个云服务商的GPU读取数据都会被收取出口费（在AWS上约为0.09美元/GB）。
-   **检查点直接流式传输到存储桶**，速度高达约170 MB/s（每个检查点8.43 GB的权重），并且在GPU实例终止后仍然持久保存。

按云服务商划分，检查点写入存储桶的速度为：

| 云服务商 | GPU | 检查点写入速度 |
| --- | --- | --- |
| AWS (us-east-2) | L40S | ~168 MB/s |
| GCP (us-central1) | L4 | ~123 MB/s |
| Lambda (us-west-3) | H100 | ~112 MB/s |

## [](#xet-后端存储-检查点与模型变体的去重)Xet 后端存储：检查点与模型变体的去重

Hugging Face Buckets 基于 [Xet](https://huggingface.co/docs/hub/xet/overview) 构建，采用[内容定义分块](https://huggingface.co/docs/hub/xet/deduplication)技术将文件分割成约 64 KB 的块，并确保每个唯一块仅存储一次。由于分块边界由内容决定，编辑操作只会影响被修改的块，其余块会被识别为已存储。这一特性在以下场景中尤为受益：

-   **增量检查点与适配器检查点**：当冻结层、训练适配器或在保存时保持大部分权重不变时，仅上传发生变化的块，而非整个检查点。
-   **共享基座的模型变体**：同一基座模型的微调版本和量化版本存在大量重叠，共享块在所有变体中仅存储一次。
-   **追加数据集**：对话记录或推理输出等日志通过向大型 Parquet 文件追加行来增长。现有行组保持字节级一致，因此仅传输新增行：在 Hugging Face 的[测试](https://huggingface.co/blog/parquet-cdc)中，向 100K 行表追加 10K 行仅传输约 10 MB，而非完整的约 106 MB。（若需原地编辑或删除行，请使用 `use_content_defined_chunking=True` 写入以保持变更局部化。）
-   **重复上传跳过已存储内容**：在我们的测试中，重新上传已存在于存储桶中的 8.43 GB 文件仅需约 8 秒，而首次上传需 24 秒，因为仅传输块哈希值。同样的机制使服务端 `hf buckets cp` 命令在仓库和存储桶之间通过引用复制，而非重新上传字节。

实际节省量取决于工件重叠程度，但去重过程完全自动化：按常规方式写入检查点，仅新块会离开机器。

## [](#开始使用)开始使用

```
pip install "skypilot[huggingface]"
hf auth login  # 或：export HF_TOKEN=<your-token>
```

向任意 SkyPilot 任务添加 `hf://` 挂载点并启动。`MOUNT` 需要基于 glibc 2.34+ 和 `/dev/fuse` 的基础镜像。

## [](#联合构建-hugging-face-与-skypilot)联合构建：Hugging Face 与 SkyPilot

最初的 `store: hf` 支持[始于 Nikhil Jha 的贡献](https://github.com/skypilot-org/skypilot/pull/9418)。Hugging Face 团队[持续推进](https://github.com/skypilot-org/skypilot/pull/9698)并上游修复了 `hf-mount` FUSE 相关问题，使其能在非特权容器（许多 Kubernetes 集群的默认配置）中挂载。SkyPilot 团队将其集成到存储后端。整个链路均为开源：SkyPilot、Hugging Face 的 `hf-mount` 以及 `huggingface_hub` 客户端。

## [](#资源)资源

-   [SkyPilot 存储文档](https://docs.skypilot.co/en/latest/reference/storage.html)
-   [Hugging Face 存储桶指南](https://huggingface.co/docs/hub/storage-buckets)
-   [`hf-mount`](https://github.com/huggingface/hf-mount)
-   [Xet：内容定义分块与去重](https://huggingface.co/docs/hub/xet/deduplication)
-   [SkyPilot Slack 社区](https://slack.skypilot.co/)
