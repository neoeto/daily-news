---
title: 'LeRobot v0.6.0: Imagine, Evaluate, Improve'
url: 'https://huggingface.co/blog/lerobot-release-v060'
url_hash: 0a1d2bd6cc12857ba06f7d53830bdb35110d1497
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-07T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 机器人
  - 仿真
  - 训练
  - 开源
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

本次发布聚焦于闭环机器人学习：能够预判未来再行动的决策策略、判断机器人是否成功的奖励模型、将失败转化为训练数据的部署命令行工具，以及六个全新的仿真基准测试。同时新增深度感知、VLM驱动的数据集标注、自定义视频编码、基于HF Jobs的云端训练，并大幅精简安装流程。

## TL;DR

LeRobot v0.6.0 引入学习预判未来的世界模型策略（VLA-JEPA、FastWAM、LingBot-VA），新增多款VLA模型（GR00T N1.7、MolmoAct2、EO-1、EVO1、Multitask DiT），并推出全新奖励模型API（Robometer、TOPReward）。六个仿真基准测试统一整合至`lerobot-eval`，`lerobot-rollout`命令行工具支持DAgger式人工在线修正，FSDP训练与HF Jobs云端训练同步上线。数据集新增深度支持、自动语言标注流程、自定义视频编码，数据加载速度提升2倍，安装包体积进一步缩减。

[![LeRobot 0.6.0](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/lerobot%20v0.6.0.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/lerobot%20v0.6.0.png)

## 目录

-   [LeRobot v0.6.0：预判、评估、改进](#lerobot-v060-imagine-evaluate-improve)
    -   [TL;DR](#tldr)
    -   [目录](#table-of-contents)
    -   [世界模型：具备预判能力的策略](#world-models-policies-that-imagine)
        -   [VLA-JEPA](#vla-jepa)
        -   [LingBot-VA](#lingbot-va)
        -   [FastWAM](#fastwam)
    -   [VLA模型库持续扩容](#vlas-the-model-zoo-keeps-growing)
        -   [GR00T N1.7](#gr00t-n17)
        -   [MolmoAct2](#molmoact2)
        -   [EO-1](#eo-1)
        -   [Multitask DiT](#multitask-dit)
        -   [EVO1](#evo1)
    -   [奖励模型：精准判断机器人成败](#reward-models-knowing-when-your-robot-succeeds)
        -   [Robometer](#robometer)
        -   [TOPReward](#topreward)
    -   [数据集：加载更快，数据更丰富](#datasets-faster-loading-richer-data)
        -   [你的编码，你做主](#your-codec-your-rules)
        -   [端到端深度支持](#depth-support-end-to-end)
        -   [规模化语言标注](#language-annotations-at-scale)
        -   [数据加载速度提升2倍](#up-to-2x-faster-data-loading)
    -   [基准测试：一个命令行统一评估](#benchmarks-one-cli-to-evaluate-them-all)
    -   [训练与推理](#training--inference)
        -   [`lerobot-rollout`：部署专属命令行工具](#lerobot-rollout-deployment-gets-its-own-cli)
        -   [FSDP：训练超GPU内存的模型](#fsdp-train-models-bigger-than-your-gpu)
        -   [基于HF Jobs的云端训练](#cloud-training-with-hf-jobs)
    -   [代码库：更精简更清晰](#codebase-leaner-and-cleaner)
    -   [社区与生态](#community--ecosystem)
    -   [结语](#final-thoughts)

## 世界模型：具备预判能力的策略

机器人领域正面临一个核心问题：世界模型是否真正有助于机器人策略？v0.6.0 为LeRobot带来三种策略来探索答案。每种策略都在训练过程中学习预判未来，并通过不同路径实现高效预判。

### VLA-JEPA

VLA-JEPA 训练一个紧凑型VLA（基于Qwen3-VL-2B）在学习行动的同时预测潜在空间中的未来状态：训练时，JEPA世界模型需要根据模型自身动作预判后续帧。关键在于推理阶段世界模型会被移除，因此你可以在零额外推理成本下获得世界模型监督。Hub上已提供三个即用型检查点，包括可用于微调的DROID预训练基座：

```
lerobot-train \
  --policy.path=lerobot/VLA-JEPA-Pretrain \
  --dataset.repo_id=${HF_USER}/my_dataset \
  --policy.repo_id=${HF_USER}/my_finetuned_policy
```

查看 [VLA-JEPA文档](https://huggingface.co/docs/lerobot/v0.6.0/vla_jepa) 和 [论文](https://arxiv.org/abs/2602.10098) 了解更多。

### LingBot-VA

LingBot-VA 更进一步：这是一个自回归视频-动作模型，能够逐块预测未来的视频和动作，并将真实观测反馈回来，以保持其想象的现实性。你甚至可以保存机器人想象的内容（`--policy.save_predicted_video=true`），并与实际发生的情况进行对比。推理过程仅需一块 24–32 GB 的 GPU。查看[文档](https://huggingface.co/docs/lerobot/v0.6.0/lingbot_va)和[论文](https://arxiv.org/pdf/2601.21998)了解技术细节。

[![LingBot-VA 想象 rollout 与真实 rollout 对比](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/lingbot_va_viz_1.gif)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/lingbot_va_viz_1.gif)

### [](#fastwam)FastWAM

FastWAM 在其论文标题中提出了一个问题：世界动作模型是否需要测试时的未来想象？它将一个约 5B 的视频生成专家与一个紧凑的动作专家结合在单一网络中，使模型真正学会“梦想”自己的 rollout。在推理时，它完全跳过“梦想”过程，直接对动作块进行去噪。从 [lerobot/fastwam_base](https://huggingface.co/lerobot/fastwam_base) 进行微调，并在[文档](https://huggingface.co/docs/lerobot/v0.6.0/fastwam)中了解更多信息。

## [](#vlas-the-model-zoo-keeps-growing)VLA：模型库持续壮大

### [](#gr00t-n17)GR00T N1.7

我们将 NVIDIA GR00T 集成升级到 GR00T N1.7，这是 NVIDIA 跨具身基础模型的最新开放版本。N1.7 将之前的 VLM 替换为 Cosmos-Reason2-2B（基于 Qwen3-VL），并连接一个流匹配动作头。我们的集成已通过 NVIDIA 原始 Isaac-GR00T 实现的等价性测试：相同的输入，相同的输出。Flash-attention 现在是可选的，因此 `pip install 'lerobot[groot]'` 即可直接使用，你也可以直接加载 [NVIDIA 发布的检查点](https://huggingface.co/nvidia/GR00T-N1.7-3B)。

> GR00T N1.7 取代了 LeRobot 中的 N1.5。如果你需要 N1.5，请锁定 `lerobot==0.5.1`。

### [](#molmoact2)MolmoAct2

MolmoAct2，艾伦人工智能研究所的视觉-语言-动作模型，现已移植到 LeRobot，覆盖完整生命周期：微调（全参数或 LoRA）、评估和真实机器人部署。内置校准校正的现成检查点意味着你可以在 SO-100/101 上零样本运行：

```
lerobot-rollout \
  --policy.path=lerobot/MolmoAct2-SO100_101-LeRobot \
  --robot.type=so100_follower \
  --robot.port=/dev/ttyACM0 \
  --robot.cameras='{cam0: {type: opencv, index_or_path: 0, width: 640, height: 480, fps: 30}, cam1: {type: opencv, index_or_path: 2, width: 640, height: 480, fps: 30}}' \
  --task="pick up the red cube" --duration=30
```

推理在 bf16 下仅需约 12 GB，LoRA 微调可在单块 24 GB GPU 上完成。查看 [MolmoAct2 文档](https://huggingface.co/docs/lerobot/v0.6.0/molmoact2)获取完整部署指南。

[![LeRobot 中的 MolmoAct2 零样本](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/molmoact2_4.gif)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/molmoact2_4.gif)

### [](#eo-1)EO-1

EO-1，一个在交错视觉-文本-动作数据上预训练的 VLA，现已加入 LeRobot：采用 Qwen2.5-VL-3B 骨干网络，搭配流匹配动作头，由论文作者之一贡献。使用标准 `lerobot-train` 工作流，通过 `--policy.type=eo1` 进行训练。详情见[文档](https://huggingface.co/docs/lerobot/v0.6.0/eo1)和[论文](https://arxiv.org/abs/2508.21112)。

### [](#multitask-dit)多任务 DiT

多任务扩散变换器策略将 TRI Large Behavior Models 方法引入 LeRobot：一个约 450M 参数的扩散变换器，以 CLIP 视觉和语言嵌入为条件，使单一模型能够通过自然语言选择学习多个任务。它支持扩散和流匹配目标，并且足够小，你可以自行训练。查看[文档](https://huggingface.co/docs/lerobot/v0.6.0/multi_task_dit)。

### [](#evo1)EVO1

VLA 不一定需要庞大。EVO1 将策略压缩到 0.77B 参数，采用 InternVL3-1B 骨干网络和流匹配动作头，足够小，可以在普通 GPU 上微调和实时运行。它内置两阶段微调和实时分块支持。查看 [EVO1 文档](https://huggingface.co/docs/lerobot/v0.6.0/evo1)和[论文](https://arxiv.org/abs/2511.04555)。

## [](#reward-models-knowing-when-your-robot-succeeds)奖励模型：判断机器人是否成功

成功检测与进度估计是机器人学习循环中缺失的环节，而v0.6.0版本为它们提供了安身之所。LeRobot现在拥有统一的奖励模型API（`lerobot.rewards`），与策略API相呼应，通过同一接口提供四种奖励模型——HIL-SERL奖励分类器、SARM，以及两个新增模型：

### [](#robometer)Robometer

Robometer是一个预训练的通用奖励模型：将[lerobot/Robometer-4B](https://huggingface.co/lerobot/Robometer-4B)指向任意LeRobot数据集，它就能根据原始视频和语言指令对任务进度和成功程度进行评分，无需针对特定任务进行训练。该模型基于Qwen3-VL-4B构建，并通过在超过一百万条机器人轨迹数据集上进行轨迹对比训练（[RSS 2026论文](https://arxiv.org/abs/2603.02115)）。

[![LeRobot Robometer](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/rm_robometer.gif)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/rm_robometer.gif)

### [](#topreward)TOPReward

TOPReward实现了完全零样本：无需任何奖励权重。它封装了一个现成的VLM（Qwen3-VL），并读取给定轨迹视频和任务指令下"True"标记的对数概率。任何具备能力的VLM都能成为奖励函数。

两者都附带标注脚本，可将逐帧进度曲线写入数据集，为奖励感知行为克隆（RA-BC）、数据集质量检查和进度叠加视频做好准备。请查阅[Robometer](https://huggingface.co/docs/lerobot/v0.6.0/robometer)和[TOPReward](https://huggingface.co/docs/lerobot/v0.6.0/topreward)文档。

## [](#datasets-faster-loading-richer-data)数据集：加载更快，数据更丰富

### [](#your-codec-your-rules)你的编解码器，你做主

录制不再局限于单一硬编码的编解码器。新的`--dataset.rgb_encoder.*`选项暴露了完整的编码参数（编解码器、质量、像素格式、GOP、预设），而`vcodec=auto`会探测硬件编码器（如NVENC、VideoToolbox、VAAPI和QSV），然后回退到默认的软件AV1编码器。对于现有数据集，一条命令即可重新编码所有内容：

```
lerobot-edit-dataset \
    --repo_id ${HF_USER}/my_dataset \
    --operation.type reencode_videos \
    --operation.rgb_encoder.vcodec h264 \
    --operation.rgb_encoder.crf 23
```

详情请参阅[视频编码文档](https://huggingface.co/docs/lerobot/v0.6.0/video_encoding_parameters)。

### [](#depth-support-end-to-end)深度支持，端到端

插入Intel RealSense，设置`use_depth: true`，LeRobot即可端到端记录深度图：以毫米为单位采集，压缩为紧凑的12位深度视频流（与RGB摄像头并行），并在训练时解码回物理单位。深度信息在录制期间和`lerobot-dataset-viz`中实时渲染，并支持SO-100/101、Koch、OpenArm、reBot、Unitree G1等更多设备。

[![LeRobot深度摄像头](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/depth2.gif)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/depth2.gif)

### [](#language-annotations-at-scale)大规模语言标注

你的数据集不再局限于每个片段一个任务字符串。LeRobot数据集现在原生支持丰富的语言标注（带时间戳的子任务、计划、记忆、修正、语音以及每个摄像头的VQA对），新的`lerobot-annotate` CLI可通过VLM观看你的片段来自动填充这些标注：

```
lerobot-annotate \
    --repo_id=${HF_USER}/my_dataset \
    --new_repo_id=${HF_USER}/my_dataset_annotated \
    --vlm.model_id=Qwen/Qwen2.5-VL-7B-Instruct \
    --push_to_hub=true
```

随后，一个YAML配方层会在采样时将这些标注渲染为聊天风格的训练消息：这正是未来长时域、会说话的机器人策略所需的训练数据。通过HF Jobs进行扩展，并阅读[标注流水线文档](https://huggingface.co/docs/lerobot/v0.6.0/annotation_pipeline)了解更多信息。

### [](#up-to-2x-faster-data-loading)数据加载速度提升高达2倍

视频数据集训练现可提速约2倍：多摄像头帧并行解码，数据加载器工作进程传输紧凑的uint8帧（进程间内存占用减少4倍），持久化工作进程在跨epoch训练时保持解码器缓存活跃。加载大型数据集的子集（`episodes=[...]`）从数分钟缩短至毫秒级（我们的基准测试中从275秒降至0.06秒）。采样过程现已实现确定性和可恢复性，中断的训练可精确恢复至原样本位置。

## [](#benchmarks-one-cli-to-evaluate-them-all)基准测试：统一CLI评估所有模型

v0.5.0版本在LeRobot上树立了VLA评估中心的旗帜；v0.6.0版本通过六个全新仿真基准测试将其变为现实，所有测试均可通过同一`lerobot-eval`命令行界面运行，每个基准测试都配有文档页面、Docker镜像和经过CI烟雾测试的SmolVLA基线检查点：

-   [LIBERO-plus](https://huggingface.co/docs/lerobot/v0.6.0/libero_plus) 通过约10,000个LIBERO扰动变体从光照、相机视角到改写指令等七个维度对VLA进行压力测试，可检测策略何时失效。
-   [RoboTwin 2.0](https://huggingface.co/docs/lerobot/v0.6.0/robotwin) 涵盖SAPIEN平台上50项双臂操作任务，具有强域随机化特性，并在Hub上提供[超过10万条可训练轨迹](https://huggingface.co/datasets/lerobot/robotwin_unified)。
-   [RoboCasa365](https://huggingface.co/docs/lerobot/v0.6.0/robocasa) 在2,500个程序生成的厨房场景中覆盖365项厨房任务，是当前最大规模的任务集合。
-   [RoboCerebra](https://huggingface.co/docs/lerobot/v0.6.0/robocerebra) 评估长时域行为，包含3至6个子目标链式组合的回合，并配有语言引导的中间指令及6,660回合数据集。
-   [RoboMME](https://huggingface.co/docs/lerobot/v0.6.0/robomme) 是记忆测试：你的策略能否计数重复、追踪隐藏物体并模仿演示流程？涵盖4个记忆套件的16项任务。
-   [VLABench](https://huggingface.co/docs/lerobot/v0.6.0/vlabench) 测试操作中的知识与推理能力，从物理问题到复合任务（如完整冲泡咖啡）。

```
lerobot-eval \
  --policy.path=lerobot/smolvla_robotwin \
  --env.type=robotwin \
  --env.task=beat_block_hammer \
  --eval.n_episodes=100 --eval.batch_size=1
```

模拟器后端需要特定的系统依赖和独立安装步骤；每个文档页面都提供精确配置，每个基准测试都附带现成的Docker镜像，方便跳过环境搭建。

结合LIBERO、Meta-World和NVIDIA IsaacLab-Arena，现已形成九大基准测试家族的统一平台，新增的[添加新基准测试指南](https://huggingface.co/docs/lerobot/v0.6.0/adding_benchmarks)详细说明了如何接入自定义基准。评估速度也得到提升：并行评估默认采用异步向量化环境，基准测试显示速度提升达2倍。

[![LeRobot基准测试](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/benchmarks2.gif)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/benchmarks2.gif)

## [](#training--inference)训练与推理

### [](#lerobot-rollout-deployment-gets-its-own-cli)`lerobot-rollout`：部署专属命令行工具

过去部署策略需要在`lerobot-record`基础上进行hack操作。全新的`lerobot-rollout`命令行工具将部署变为独立工作流，支持可插拔策略和推理后端（包括针对慢速兼容VLA的实时分块技术）。`base`策略仅运行策略本身。`sentry`持续记录，循环保存回合数据并实时上传至Hub。`highlight`维护环形缓冲区，在按键触发时保存最近N秒数据，确保不会错过精彩瞬间。`episodic`复刻经典回合/重置记录工作流。`dagger`则将部署转化为数据收集过程。

采用DAgger策略时，你观察策略运行，一旦出现错误立即按下按键（或USB脚踏开关），用主导臂接管并记录修正操作，随后将控制权交还。接管前，主动式引导臂会驱动至从动臂位姿，确保切换过程无抖动。每个修正帧都会标记`intervention`标志，生成的数据集可直接用于下一轮微调：

```
lerobot-rollout \
    --strategy.type=dagger \
    --policy.path=${HF_USER}/my_policy \
    --robot.type=so100_follower \
    --robot.port=/dev/ttyACM0 \
    --teleop.type=so101_leader \
    --teleop.port=/dev/ttyACM1 \
    --dataset.repo_id=${HF_USER}/dagger_corrections \
    --dataset.single_task="Grasp the block"
```

部署、收集修正数据、微调、重复：机器人学习飞轮如今仅需一个CLI参数。阅读[部署文档](https://huggingface.co/docs/lerobot/v0.6.0/inference)。

### [](#fsdp-train-models-bigger-than-your-gpu)FSDP：训练超越单GPU容量的模型

机器人基础模型已超出单GPU承载能力。LeRobot训练现通过Accelerate支持FSDP（全分片数据并行）：参数、梯度和优化器状态在GPU间分片，检查点汇总为单文件`model.safetensors`，可像其他策略一样加载。甚至可在不同GPU数量的环境中恢复FSDP运行。参见[多GPU训练文档](https://huggingface.co/docs/lerobot/v0.6.0/multi_gpu_training)。

### [](#cloud-training-with-hf-jobs)通过HF Jobs进行云端训练

没有GPU？没问题。只需添加一个参数，完全相同的`lerobot-train`命令即可在云端运行：

```
lerobot-train \
  --dataset.repo_id=${HF_USER}/so101_test \
  --policy.type=act \
  --policy.repo_id=${HF_USER}/my_policy \
  --job.target=a10g-small
```

LeRobot会在必要时将本地数据集推送至私有Hub仓库，提交任务，将日志流式传输到终端，并在任务结束时将训练好的策略推送至Hub。通过`--job.target`可选择从T4到8×H200的任何配置（计算资源按需付费）。[查看文档](https://huggingface.co/docs/lerobot/v0.6.0/hardware_guide#hugging-face-jobs)

## [](#codebase-leaner-and-cleaner)代码库：更精简、更清晰

-   `pip install lerobot` 现已真正轻量化，基础依赖减少约40%。功能范围扩展（`[training]`、`[core_scripts]`、`[evaluation]`等）覆盖其余部分，缺失依赖错误会明确提示需添加哪个扩展。**仅使用LeRobot数据集时，无需再安装硬件相关依赖 ;)**
-   支持的PyTorch版本更新至2.7–2.11，Linux `uv`安装默认绑定CUDA 12.8 wheels。`--policy.dtype=bfloat16`现可通过Accelerate实现真正的混合精度训练。
-   提交的`uv.lock`文件是CI、Docker和开发环境的权威依赖规范，文档中每一步都包含`uv`安装路径，甚至可通过单个参数选择CUDA wheel。
-   `--display_mode=foxglove`可将遥操作、录制和回放流式传输至[Foxglove](https://foxglove.dev/)，这是机器人领域广泛使用的可视化工具。支持远程配置，`lerobot-dataset-viz`提供可拖拽的数据集回放。
-   可通过pip安装的`lerobot_env_*`包现可自动注册其环境。插件系统覆盖所有五种组件类型：机器人、相机、遥操作器、策略和环境。
-   录制期间的键盘控制现可在Wayland、SSH、无头设备及macOS（无需辅助功能权限）上正常工作。

> 查看[发布说明](https://github.com/huggingface/lerobot/releases)获取完整列表及破坏性变更的迁移指南。

[![LeLab：LeRobot图形用户界面](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/LeLab.gif)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot-blog/release-v0.6.0/gifs/LeLab.gif)

## [](#community--ecosystem)社区与生态系统

-   LeLab 将 LeRobot 的整个工作流程（标定、遥操作、记录、本地训练或通过 HF Jobs 训练、部署）集成到浏览器 UI 中，无需使用命令行。目前支持 SO-ARM101。[立即体验！](https://github.com/huggingface/leLab)
-   Isaac Teleop 让你通过 [NVIDIA 的 Isaac Teleop 技术栈](https://github.com/NVIDIA/IsaacTeleop) 结合 CloudXR/OpenXR，使用 VR 控制器远程操控 SO-101，这是与 NVIDIA 团队合作的成果。详见[文档](https://huggingface.co/docs/lerobot/v0.6.0/isaac_teleop)。
-   新的[计算硬件指南](https://huggingface.co/docs/lerobot/v0.6.0/hardware_guide)回答了每位新手都会问的两个问题：我需要什么 GPU？训练需要多长时间？它提供了每种策略家族的实测显存占用范围，以及从 RTX 4090 到 4×H100 的参考训练时间。
-   重写的[添加策略指南](https://huggingface.co/docs/lerobot/v0.6.0/bring_your_own_policies)展示了如何发布自己的策略，无论是集成到代码库中，还是作为无需提交 PR 的插件包。

## [](#final-thoughts)最后感想

除了这些重点功能外，v0.6.0 还包含了数百项错误修复、文档改进以及代码库整体的体验优化——从更智能的默认设置到更可靠的持续集成。

我们想向社区中的每一位成员表示衷心的感谢。本次发布包含了来自学术界、工业界和爱好者团队的工作成果，他们选择 LeRobot 作为其模型和基准测试的平台。每一次 PR 和错误报告都在推动开源机器人技术向前发展。

敬请期待更多精彩内容 🤗 立即[开始](https://github.com/huggingface/lerobot)！—— LeRobot 团队 ❤️
