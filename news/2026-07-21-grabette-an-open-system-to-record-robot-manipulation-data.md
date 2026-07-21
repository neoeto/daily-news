---
title: 'Grabette: an open system to record robot-manipulation data'
url: 'https://huggingface.co/blog/grabette'
url_hash: f07ea0986edc9c353236b2f45b3060a99d2cf92e
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-21T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 创业
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

## Grabette：一个用于记录机器人操作数据的开放系统  
*并共同构建一个共享数据集。*

*用手持夹爪在几分钟内记录你自己的操作任务，自动将其转化为机器人可直接使用的数据集，并助力打造一个开放、协作的机器人学习数据集。*

## 瓶颈不在模型，而在数据。

机器人学习面临一个供给问题。我们有强大的策略架构（基于Transformer的VLA、扩散与流匹配策略，甚至世界模型），也有训练它们所需的GPU。但我们缺少的是大规模、多样化、真实世界的操作数据。

通过远程操控机器人来收集数据既昂贵又费力：首先，**它需要一台机器人**。而且，根据远程操作方式的不同，如果数据收集耗时数小时，对用户来说可能很繁琐，还会带来重大的硬件和后勤挑战。这在需要覆盖广泛任务和环境时难以规模化。

但**你并不需要一台机器人来收集机器人数据。** 只需要一只人手、一个夹爪、一个摄像头，以及一种恢复手部动作6自由度轨迹的方法。捕捉演示过程，你就得到了机器人可以学习的数据。

这就是我们今天发布的内容：Grabette，一个用于记录操作数据的开放、低成本系统。拿起它，用你自己的手记录一个任务，然后得到一个干净、可直接用于机器人的数据集。不需要机器人，不需要实验室，不需要远程操控设备。

![put\_on\_grabettes](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/grabette.gif)

而更大的目标是：如果记录一个演示像拍摄视频一样简单，那么任何人都可以贡献数据。我们希望Grabette能催生一个**大规模、开放、协作的操作数据集**。这是任何单一实验室都无法独自构建的。

![open\_cabinet](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/cup.gif)

## 站在UMI的肩膀上

Grabette直接受到斯坦福大学[**通用操作接口**（UMI）](https://umi-gripper.github.io/)的启发：一个手持夹爪，配备鱼眼摄像头，在“野外”记录演示，通过SLAM恢复摄像头轨迹，并从中训练视觉运动策略。

UMI证明了这一方法是可行的。其他（闭源的）设备也存在，比如Agibot的MEgo夹爪、Genrobot的DAS夹爪和Sunday Robotics的技能捕捉手套。我们的目标是让使用变得毫不费力，尽可能降低从“我有一个任务”到“我有一个训练好的模型”的门槛。

Grabette构建于现代开放生态系统之上：LeRobot用于数据集，Hugging Face Hub用于共享，以及一个**从浏览器运行**、无需安装的处理流水线。Grabette是任何人都可以在工作台上搭建、在现场使用并贡献数据的工具。

## 认识Grabette

我们已经开发Grabette数月，觉得它已经足够好用，可以分享了。我们很高兴现在与大家分享！

Grabette是一个**手持夹爪**，配备了重建操作演示所需的一切。

![grabette\_label](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/grabette_label_big.png)

它搭载了**两个摄像头，各有分工。** 拆分这两个角色是经过深思熟虑的：廉价的广角鱼眼摄像头为策略提供了丰富的上下文，类似于腕部摄像头的视角；而RGBD摄像头则负责稳健的6自由度追踪这一艰巨任务。

在用户执行任务期间，Grabette 会记录数据，但实际执行训练后习得动作的则是它的机器人孪生体。因此，让我们认识一下 **Gripette**——Grabette 的机械臂末端执行器版本。

这对"双胞胎"共享相同的硬件基因：

-   **Grabette**：手持式演示设备（摄像头 + 惯性测量单元 + 夹爪，物料清单成本约 490 欧元）
-   **Gripette**：电动夹爪（摄像头 + 两个伺服电机，物料清单成本约 120 欧元），可在真实或模拟机械臂上形成闭环

![Grabette 和 Gripette](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/grabette_gripette.png)

*Grabette 手持记录设备（左）与 Gripette 机器人夹爪（右）*

## [](#built-for-everyone)为所有人打造

**一切皆开源**

[立即查看仓库！](https://github.com/pollen-robotics/grabette)

-   **硬件**：Grabette 和 Gripette 的 CAD 及生产文件
-   **采集服务**：树莓派设备端软件
-   **处理流程**：可本地运行，或通过我们的 Hugging Face Space 在线处理
-   **下游参考栈**：标准 LeRobot 训练 + OpenArm 评估方案

**组件**。采用市面可购的标准传感器，无封闭流程，无平台锁定。仅需树莓派、标准树莓派摄像头、市售 OAK-D 深度摄像头、磁性编码器。核心理念是任何人都能用可订购的零件自行组装。

**设计上独立于机器人平台**。采集过程和数据格式均不预设特定机械臂。演示数据以摄像头本地六自由度笛卡尔位姿加夹爪状态存储，输出为标准 LeRobot 数据集并上传至 Hugging Face Hub，因此同一份数据可驱动不同机器人和学习方法。不过，您仍需在机械臂上安装对应的 Gripette 夹爪。

## [](#from-your-hand-to-a-dataset-in-two-steps)从手部操作到数据集，只需两步

本次发布让任何人都能快速从"我想演示一个任务"到"获得训练就绪的数据集"，无需专业知识。

### [](#1-record)1. 记录

![web\_processing](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/start_session.gif) ![record\_coffee](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/record_coffee_convert_small.gif)

按下按钮，观测摄像头、追踪摄像头（彩色、深度及惯性测量单元）以及夹爪编码器关节值的数据将同步记录，通过统一时钟确保精确同步。再次按下按钮结束片段，数据将本地保存于树莓派。

### [](#2-process-directly-in-your-browser)2. 在浏览器中直接处理

[![浏览器后处理](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/Browser_postprocess_small2.gif)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/Browser_postprocess_small2.gif)

在浏览器中打开 Grabette 仪表盘。选择要加入数据集的片段，一键启动后处理：

-   片段上传至 HF Hub
-   grabette-slam 空间利用 RTAB-MAP 库执行 SLAM，验证轨迹正确性（无跳变或追踪丢失）
-   片段转换为 LeRobot 格式
-   新数据集上传至您的空间，可使用 LeRobot 可视化工具查看每个片段的数据

至此，一切就绪，可以开始训练！

## [](#what-can-you-do-with-the-data-heres-one-example)这些数据能做什么？以下是一个示例。

数据集只有能训练出东西才有意义。因此，为了展示完整的闭环流程，我们提供了一个**完整示例**。但需要明确的是，这只是一个展示其能力的*示例*，而非最终产品：本次发布的核心是记录系统。你的Grabette数据可与任何使用LeRobot数据集的方法兼容。

我们的示例采集了200段演示记录，例如：

以及：

-   **训练策略**：基于**LeRobot**技术栈——采用扩散策略（ResNet18 + SpatialSoftmax编码器、DDIM调度器、6维旋转动作），可在单张消费级GPU上运行。
-   **评估策略**：在配备Gripette夹爪的OpenArm 7自由度机械臂上，通过gRPC API驱动，得到如下结果：

## [](#现在轮到你了)现在轮到你了

数据瓶颈无法由单个实验室解决，而是需要社区在全球各地记录演示数据。现在你就可以为构建数据集贡献力量：制作一台Grabette，记录你感兴趣的任务，并将其分享到Hub上。每一段演示都会让开放数据集变得更庞大、更多样化，而每一位贡献者都能让机器人学习不再被昂贵的硬件所限制。

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/sugar1.gif) ![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/sugar2.gif) ![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/spoon.gif) ![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/sponge.gif) ![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/screws.gif) ![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/grabette/screwdiver.gif)

### [](#下一步计划)下一步计划

本次发布只是项目的开端！Grabette将持续进化。我们已有更多计划在路上，包括**Casquette**——一款头戴式第一人称视角设备，用于补充Grabette的自我中心视角捕捉（*仍在开发中*）。但最重要的下一步不仅属于我们，也属于你：开始记录，让我们一起构建数据集。

👉 **[制作一台Grabette（GitHub）](https://github.com/pollen-robotics/grabette)** · [处理你的数据（HF Space）](https://huggingface.co/spaces/pollen-robotics/grabette-slam) · 为数据集贡献力量

*由Pollen Robotics ❤️ 打造。*
