---
title: From the Hugging Face Hub to robot hardware with Strands Agents and LeRobot
url: 'https://huggingface.co/blog/amazon/strands-lerobot-hub-to-hardware'
url_hash: c7b6e0d15e340e1a3b79bed5678b1ba8e63dc5e9
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-17T10:18:05.000Z
lang: zh
translated: true
tags:
  - AI
  - 机器人
  - 开源
  - 仿真
  - 硬件
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Sundar Raghavan 头像](https://cdn-avatars.huggingface.co/v1/production/uploads/6a1dc0f2b4238bb17ff94794/GBPtGiJKZpCakTXYM_SJO.jpeg)](https://huggingface.co/rsundaraws)

[![Cagatay Cali 头像](https://cdn-avatars.huggingface.co/v1/production/uploads/6498ef778fadf0ae7639b982/N9zJ6s7luJFTPM26kxWfe.jpeg)](https://huggingface.co/cagataydev)

*Strands Robots 中 LeRobot 集成的完整指南——从 Hub 数据集到实体机器人的单一智能体循环，采用相同的磁盘格式存储仿真与真实数据集，并通过字符串即可切换策略。*

你有一台机器人、一份存放在 [Hugging Face Hub](https://huggingface.co/) 上的演示数据文件夹，以及一个希望它学习的新任务。如今，这需要五套独立工具：一套录制新演示，一套训练模型，一套在仿真中测试，一套自定义代码部署到硬件，还有一套在拥有多台机器人时进行协调。这些工具各自为政，互不通信。

[Strands Robots](https://github.com/strands-labs/robots) 是 AWS 推出的开源 SDK（[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 协议），它将机器人抽象、仿真以及 [LeRobot](https://github.com/huggingface/lerobot) 栈封装为 AgentTool，供你组合成单一的 Strands 智能体。该集成设计得极为精简：LeRobot 自身的脚本负责硬件录制与标定，而 Strands AgentTool 则处理智能体实际编排的部分。仿真工具录制的 LeRobotDataset 与 LeRobot 在硬件上写入的格式完全一致。[GR00T](https://github.com/NVIDIA/Isaac-GR00T) 和 [LerobotLocal](https://strands-labs.github.io/robots/policies/lerobot-local/) 通过统一接口提供策略推理服务，MolmoAct2 检查点则经由 LerobotLocal 路径运行。一个对等网格可将智能体扩展到远程机器人。数据集格式完全保持 LeRobot 写入时的原样；智能体循环充当粘合剂。

本文将通过一个单一智能体内的五个步骤进行讲解：基于 LeRobot AgentTool 构建智能体，在仿真中录制 LeRobotDataset 格式的演示，在同一台机器人上运行策略，仅通过修改一个关键字参数即可将相同智能体代码部署到实体 [SO-101](https://github.com/TheRobotStudio/SO-ARM100) 机器人上，并通过 [Zenoh](https://zenoh.io/) 网格向整个机器人集群广播指令。最后，你可以从 GitHub 克隆可运行的示例应用，并在笔记本电脑的仿真环境中运行。默认路径无需硬件、GPU 或 Hugging Face 凭证。本文的可运行配套文件位于 [`examples/lerobot/hub_to_hardware.py`](https://github.com/strands-labs/robots/blob/main/examples/lerobot/hub_to_hardware.py) 和 [`hub_to_hardware.ipynb`](https://github.com/strands-labs/robots/blob/main/examples/lerobot/hub_to_hardware.ipynb)。该笔记本默认仅支持仿真环境并使用 Mock 策略。

## [](#what-youll-build)你将构建的内容

Strands Robots SDK 将 LeRobot 栈封装为 AgentTool，供你组合成单一的 Strands 智能体。本文示例智能体实现四项功能：在仿真中录制新演示，将结果作为 LeRobotDataset 推送到 Hub，在仿真中针对相同格式运行策略，以及仅通过修改一个关键字参数即可将相同智能体代码部署到实体机器人。当拥有多台机器人时，智能体可通过内置对等网格协调整个集群。对于硬件录制和标定，LeRobot 自身的 CLI 命令（`lerobot-record`、`lerobot-calibrate`）负责启动准备；智能体则从后续环节接手。

[![架构图_hugginface](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/23tSv83E-Y06YWhpso9AS.png)](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/23tSv83E-Y06YWhpso9AS.png)

**图 1. *Robot("so100") 默认使用 MuJoCo 驱动的仿真环境；mode="real" 则返回由 LeRobot 驱动的实体机器人。两种模式共享相同的 DatasetRecorder 和策略提供器，因此仿真环境录制的数据集与硬件录制的数据集使用相同的磁盘 LeRobotDataset 格式。***

两个设计选择使这一切得以实现。首先，[Robot("so100")](https://strands-labs.github.io/robots/getting-started/robot-factory/) 默认返回一个仿真环境（无硬件、无风险），而 `mode="real"` 则返回一个由 LeRobot 驱动的真实硬件机器人。两种模式下，智能体代码完全相同。其次，写入 LeRobotDataset 的 DatasetRecorder 在[仿真路径](https://strands-labs.github.io/robots/simulation/overview/)和 LeRobot 自身的硬件录制之间共享，因此无论是在 [MuJoCo](https://mujoco.org/) 中采集的数据集，还是从实体 [SO-101](https://github.com/TheRobotStudio/SO-ARM100) 上采集的数据集，格式都是统一的。

整个工作流程只需五行 Python 代码：

```
from strands_robots import Robot
from strands import Agent

arm = Robot("so100") # mode="sim"（默认 - 安全，无硬件）
agent = Agent(tools=[arm])
agent("Pick up the red cube")
```

接下来将逐步解析该调用内部的实际运行过程。

## [](#prerequisites)前置条件

#### [](#minimal-default-simulation-path)最小化配置（默认仿真路径）

-   Python 3.12+，运行于 Linux 或 macOS（Apple Silicon 支持 MuJoCo 后端）。
-   用于智能体推理的 Strands 兼容模型提供商：[Amazon Bedrock](https://aws.amazon.com/bedrock/)（需 AWS 凭证）、[Anthropic API](https://docs.anthropic.com/)、OpenAI 或本地运行的 [Ollama](https://ollama.com/)。
-   已安装[附加组件](https://strands-labs.github.io/robots/getting-started/installation/)的 Strands Robots：`uv pip install "strands-robots[sim-mujoco,lerobot,mesh]"`

仅此而已。本文示例在上述三个条件下即可在笔记本电脑上端到端运行。

#### [](#advanced-hardware-deployment-real-policies-hub-push)高级配置（硬件部署、真实策略、Hub 推送）

-   拥有写入权限的 Hugging Face 账户和令牌，用于推送数据集以及从 Hub 拉取策略检查点。
-   硬件路径：一对 SO-101 从机和主机，或任何其他 LeRobot 支持的机器人。两台设备均需在 `~/.cache/huggingface/lerobot/calibration/` 下存放校准文件。
-   本地 GR00T 推理：配备至少 16 GB 显存的 NVIDIA GPU 并安装 Docker。本文使用 gr00t_inference 工具的 `lifecycle="full"` 操作，该操作可一步完成镜像拉取、检查点下载和容器启动。

## [](#step-1---set-up-the-example)步骤 1 - **设置示例**

安装 Strands Robots 并获取示例文件：

```
uv pip install "strands-robots[sim-mujoco,lerobot,mesh]"
git clone https://github.com/strands-labs/robots.git
cd robots
```

如果希望智能体从 Hub 推送数据集或拉取策略，请导出 Hugging Face 令牌。对于本文的默认仿真路径，此步骤为可选；示例使用 Mock 策略端到端运行，并将数据集写入本地缓存，无需访问 Hub。

```
export HF_TOKEN=hf_...
```

可运行示例位于 `strands-labs/robots` 仓库中的 `examples/lerobot/hub_to_hardware.py`（Python 脚本）和 `hub_to_hardware.ipynb`（笔记本），与 MuJoCo 和 LIBERO 示例并列。推荐从笔记本开始：在 [JupyterLab](https://jupyterlab.readthedocs.io/) 中打开，在仿真模式下（无需连接任何硬件）从上到下运行单元格。

## [](#step-2---record-demonstrations-and-push-to-the-hub)步骤 2 - 录制演示并推送到 Hub

仿真工具[录制 LeRobotDataset](https://strands-labs.github.io/robots/recording/) 的格式与 LeRobot 在硬件上写入的格式完全相同，无需硬件。`Simulation` 工具的 `start_recording` 操作通过相同的 `DatasetRecorder` 类写入数据：关节状态和动作采用相同的 parquet 模式，每个摄像头采用相同的 MP4 布局。智能体提示几乎相同：

```
from strands import Agent
from strands_robots import Robot

robot = Robot("so100")  # 默认 mode="sim"
agent = Agent(tools=[robot])
```

agent(
    "使用Mock策略提供程序以30 FPS录制'拿起红色方块并将其放入盒子中'的演示。将数据集写入"
    "my_user/cube_picking_sim，完成后推送到Hub。"
)
```

[![sim_scene](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/DBe5futoSUQ9z9s4ECZ79.png)](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/DBe5futoSUQ9z9s4ECZ79.png)

**图2. *MuJoCo模拟中的录制场景：SO-100机械臂伸向地面上的红色方块，被捕获到LeRobotDataset中。此默认路径无需硬件、GPU或Hugging Face凭据。***

Mock策略是有意为之的：它生成占位关节动作，使工作流无需训练检查点即可端到端运行。机械臂执行随机运动而非完成抓取，录制在结构上是完整的（有效的关节状态、有效的摄像头帧、格式良好的LeRobotDataset片段），但该演示本身不能用作训练数据。下面的步骤3将替换为GR00T或LerobotLocal以实现真实的抓取行为。要在此步骤中看到实际的方块抓取，请运行`--policy lerobot_local --checkpoint allenai/MolmoAct2-SO100_101`（一个[MolmoAct2检查点](https://huggingface.co/allenai/MolmoAct2-SO100_101)，从其config.json自动检测并通过LerobotLocal路径路由）；提示、数据集格式和代理代码保持不变。

证明在于接下来发生的事情。LeRobot自己的数据集加载器读取模拟记录的数据，无需任何Strands特定的代码路径：

```
from lerobot.datasets.lerobot_dataset import LeRobotDataset

dataset = LeRobotDataset("my_user/cube_picking_sim")
print(dataset.features)
# {'observation.state': Sequence(...),
#  'observation.images.front': VideoFrame(...),
#  'action': Sequence(...),
#  'episode_index': Value(...), 'frame_index': Value(...), ...}
```

此特征字典与Hub上的任何LeRobot数据集形状相同：相同的列名、相同的parquet+MP4布局、相同的加载器路径。消费硬件记录数据的训练脚本无需修改即可消费模拟记录的数据。如果需要，从模拟推送的数据集可以与硬件记录一起存放在同一个Hub仓库中。

*从录制的LeRobotDataset中回放的一个片段，来自录制器写入的每个摄像头的MP4文件，训练脚本读取的也是相同的磁盘视频。*

#### [](#recording-on-hardware)**在硬件上录制**

要在物理SO-101而非模拟上录制演示，请直接使用LeRobot的record CLI。Strands集成没有将该命令包装为AgentTool，因为LeRobot已经干净地完成了这项工作：

```
lerobot-calibrate --robot.type=so101_follower --robot.id=my_follower
lerobot-calibrate --robot.type=so101_leader   --robot.id=my_leader

lerobot-record \
  --robot.type=so101_follower --robot.id=my_follower \
  --teleop.type=so101_leader  --teleop.id=my_leader \
  --dataset.repo_id=my_user/cube_picking \
  --dataset.single_task='拿起红色方块并将其放入盒子中' \
  --dataset.num_episodes=25 \
  --dataset.push_to_hub=true
```

从此命令推送到Hub的数据集格式与模拟录制相同。要对其微调策略，请运行LeRobot的训练CLI（`lerobot-train`）；训练本身超出了本文的范围，遵循标准的LeRobot工作流程。从步骤3开始，代理可以互换使用原始检查点或微调后的检查点。有关完整的SO-101硬件设置、校准指南和故障排除，请参阅[示例文件夹中的README](https://github.com/strands-labs/robots/blob/main/examples/lerobot/README.md)。

## [](#step-3---run-a-policy-in-simulation)步骤3 - 在模拟中运行策略

数据集在Hub上之后，下一步是运行策略。该示例在其默认模拟模式下使用`Robot()`工厂，然后附加`gr00t_inference`，以便代理可以管理推理容器：

```
from strands import Agent
from strands_robots import Robot, gr00t_inference

robot = Robot("so100")  # 默认 mode="sim"
agent = Agent(tools=[robot, gr00t_inference])

agent(
    "在端口 5555 上启动 GR00T 推理，使用 my_user/cube-picker 中的立方体抓取检查点。"
    "然后让机器人拿起红色立方体。"
)
```

在底层，智能体运行 `gr00t_inference(action="lifecycle", lifecycle="full", ...)` 来拉取 [GR00T 容器镜像](https://strands-labs.github.io/robots/policies/groot/)，从 Hub 下载检查点，并启动推理服务。然后，它在模拟机器人上执行 `run_policy` 动作，其中 `policy_provider="groot"`，并通过 `policy_config` 字典传递 GR00T 服务的主机和端口（容器可通过端口 5555 访问）。模拟会根据策略的动作块逐步推进，结果渲染图可通过 `Simulation.render` 获取。

[![sim\_grasp](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/70ZHVAM2CTkP0_kjNy08U.png)](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/70ZHVAM2CTkP0_kjNy08U.png)

**图 3. *使用训练好的策略（GR00T 或 MolmoAct2 检查点），智能体驱动 SO-100 在模拟中抓取红色立方体，这是 Mock 策略所模拟的行为。***

对于偏好进程内推理（无需容器，无需 ZeroMQ (ZMQ)）的开发者，可以将 `gr00t_inference` 替换为从 Hub 仓库加载的 `LerobotLocalPolicy` 实例。提供者会将 `lerobot/` 组织下的任何模型 ID 路由到进程内路径：

```
from strands_robots.policies import create_policy
policy = create_policy("lerobot/act_aloha_sim_transfer_cube_human")
```

`LerobotLocalPolicy` 支持 [ACT](https://tonyzhaozh.github.io/aloha/)、[Diffusion Policy](https://diffusion-policy.cs.columbia.edu/)、[SmolVLA](https://huggingface.co/blog/smolvla)、[π0](https://www.pi.website/blog/pi0) 和 [π0.5](https://www.pi.website/blog/pi05)，以及 LeRobot 自身策略注册表能从 `config.json` 解析的任何内容。对于附带 `rtc_config` 的流匹配策略（π0、SmolVLA），[实时分块](https://www.pi.website/research/real_time_chunking) 会自动启用。

NVIDIA 最近发布的 [Cosmos 3](https://huggingface.co/nvidia/Cosmos3-Nano) 也可作为同一接口背后的策略提供者使用，因此无论你指向哪个提供者，智能体代码都保持不变。

*注意：LerobotLocalPolicy 加载 Hugging Face 模型时使用 trust_remote_code=True。设置* `STRANDS_TRUST_REMOTE_CODE=1` *以选择加入，并且只加载来自你信任组织的检查点。*

## [](#step-4---deploy-the-policy-to-physical-hardware)步骤 4 - **将策略部署到物理硬件**

这与步骤 3 的代码相同，只更改了一个关键字参数。`Robot` 工厂返回一个由 LeRobot 的 `make_robot_from_config` 驱动的硬件支持机器人：

```
robot = Robot(
    "so100",
    mode="real",
    port="/dev/ttyACM0",
    data_config="so100_dualcam",
    cameras={
        "front": {"type": "opencv", "index_or_path": "/dev/video0", "fps": 30},
        "wrist": {"type": "opencv", "index_or_path": "/dev/video2", "fps": 30},
    },
)
agent = Agent(tools=[robot, gr00t_inference])

agent(
    "在端口 5555 上启动 GR00T 推理，使用 my_user/cube-picker 中的立方体抓取检查点。"
    "然后让机器人拿起红色立方体。"
)
```

相同的智能体提示现在针对物理机械臂运行。硬件路径使用 LeRobot 的机器人抽象来处理关节命令和摄像头读取，而端口 5555 上可访问的 GR00T 容器则生成动作块。

在针对你的 SO-101 运行之前，必须完成从动臂和主臂的校准。每个设备运行一次 LeRobot 的校准命令（`lerobot-calibrate`）；文件会存放在 ~/.cache/huggingface/lerobot/calibration/ 下，任何触及硬件的 Strands 代码路径都会从那里读取它们。如果校准缺失，智能体会从 LeRobot 驱动层返回错误。

## [](#step-5---coordinate-multiple-robots-with-the-mesh)步骤 5 - 使用网格协调多个机器人

到目前为止，我们一次只驱动一个机器人。[网格](https://strands-labs.github.io/robots/mesh/)是Strands Robots处理多个机器人的方式。想象一下，你桌上的领导臂远程操控另一个房间的跟随臂，或者五台SO-101并行执行相同的仓库任务，又或者一个人形机器人与移动底座协同工作。所有这些都属于网格模式。网格基于Zenoh构建，这是一种开源的点对点协议，你无需管理IP地址、编写发现代码或选择代理；新机器人一旦上线就会出现在网格中，而代理可以同时与所有机器人通信。

每个`Robot()`和每个`Simulation()`都会自动加入一个Zenoh对等网格。`robot_mesh`工具为代理提供了舰队操作所需的词汇，例如发现、结构化命令、广播和紧急停止：

```
agent = Agent(tools=[robot_mesh])

agent(
    "列出网格上的所有机器人和仿真。"
    "然后向每个机器人并行发送'回到初始姿态'指令。"
)
```

代理调用`robot_mesh(action="peers")`来枚举本地和发现的节点，然后调用`robot_mesh(action="broadcast", ...)`向所有节点发送带有超时的结构化命令。添加`[mesh-iot]`扩展包可将此流量路由到AWS IoT Core，以支持跨网络舰队。项目文档中的`robot_mesh`工具操作参考涵盖了完整的词汇表：订阅、监听、收件箱和结构化点对点命令。

默认情况下，每个涉及物理动作的网格操作在执行前都会暂停，等待人工批准中断：包括舰队范围的广播和紧急停止，以及单节点的告知、发送和停止。你可以通过`STRANDS_MESH_HITL_ACTIONS`环境变量调整此集合（设置为all、none或逗号分隔的子集）。首次运行此示例时，你会在终端中看到`robot_mesh-broadcast-approval`提示；输入y（或yes/approve）以授权广播。该批准独立于LLM的工具参数传递，因此试图在命令体中嵌入批准标志的提示注入攻击无法绕过此关卡。

传输层无需修改代理代码即可扩展。内置的Zenoh网格是自动回退方案：在局域网中，Zenoh多播无需代理即可处理节点发现；添加`[mesh-iot]`扩展包后，流量通过[AWS IoT Core](https://aws.amazon.com/iot-core/)（MQTT5 with mTLS）路由以支持云端舰队，同时BridgeTransport将局域网和云端整合在同一个API下（通过`STRANDS_MESH_BACKEND=bridge`选择）。

对于生产级舰队，Device Connect（与Arm合作开发的设备感知网络层）负责处理发现、存在、结构化RPC、事件路由和安全性。当Device Connect可用时，相同的`robot_mesh`工具会通过它进行调度，否则回退到内置的Zenoh网格，因此本文中的代理代码无需更改。有关设置和当前可用性，请参阅[Device Connect文档](https://strands-labs.github.io/robots/device-connect/)。

## [](#try-it-using-the-sample-application)使用示例应用程序尝试

完整示例位于GitHub上的[strands-labs/robots](https://github.com/strands-labs/robots)仓库的examples/lerobot/文件夹中。它将所有五个步骤打包成一个CLI脚本（hub_to_hardware.py）和一个笔记本（hub_to_hardware.ipynb）。CLI默认使用Mock策略在仿真中端到端运行。无需GPU、Docker或Hugging Face凭证。

```
uv pip install "strands-robots[sim-mujoco,lerobot,mesh]"
git clone https://github.com/strands-labs/robots.git
cd robots

export STRANDS_MESH_LOCAL_DEV=1

python examples/lerobot/hub_to_hardware.py
```

录制的数据集存放在 `~/.cache/huggingface/lerobot/local/strands-cube-pick/`。若要将数据集推送到 Hugging Face Hub 而非保留在本地，请在导出具有写入权限的 HF\_TOKEN 后，传递 `--hf-user <你的用户名>`。要在步骤 3 中实现真实的抓取行为，请传递 `--policy groot --checkpoint <hf_repo>`（需要 Docker + NVIDIA GPU）或 `--policy lerobot_local --checkpoint <hf_repo>`（需要 GPU 和 `STRANDS_TRUST_REMOTE_CODE=1`）。

笔记本（examples/lerobot/hub\_to\_hardware.ipynb）逐步展示了相同的工作流程，每一步之间都有说明。在 JupyterLab 中打开它，并在模拟模式下从上到下运行。

## [](#security-considerations)安全注意事项

本设置中展示的代码片段是一个“Hello World”示例，演示了如何将 Strands Robots 与 HuggingFace 结合使用。对于更严肃、生产级的用例，用户需要注意一些重要事项：

#### [](#prompt-injection)提示注入

将不受信任的数据提供给智能体可能导致提示注入，即不可信的上下文被当作 LLM 指令处理。考虑到这些机器人在物理空间中的驱动能力，这是一个需要关注的重要风险。为缓解此行为，开发者应谨慎确保仅向机器人提供来自可信来源的数据。如果无法保证所有输入数据都可信，开发者应限制智能体可用的工具，以防止机器人做出安全关键性动作。

#### [](#robot-mesh-auth-behavior)机器人网格认证行为

本文代码片段中使用的 `STRANDS_MESH_LOCAL_DEV=1` 设置会在没有认证或访问控制的情况下初始化机器人网格。这意味着同一网络上的任何设备都可以向机器人集群发送命令。这在受信任的开发环境中是可以接受的，但不适用于不受信任的网络或生产环境。对于这些用例，需要使用 `STRANDS_MESH_AUTH_MODE=mtls`。

#### [](#operator-approval-for-fleet-wide-actions)**操作员批准集群范围操作**

robot\_mesh 工具的物理驱动操作会影响网络上的对等节点：broadcast 和 emergency\_stop 会到达所有对等节点，而 tell、send 和 stop 仅到达单个目标对等节点。为防止智能体自主（或在提示注入下）发出这些命令，默认情况下，所有五个操作都通过人工介入中断进行控制。当智能体调用受控操作时，Strands 运行时会暂停智能体循环，并要求操作员在 LLM 工具参数之外进行批准。你可以使用 STRANDS\_MESH\_HITL\_ACTIONS 环境变量（all、none 或逗号分隔的子集）调整受控操作集。每个操作还有速率限制、命令验证和审计跟踪，与中断机制并行运行。在智能体循环之外（如裸脚本或单元测试），受控操作将默认失败关闭。

## [](#clean-up)清理

上述工作流程会启动一个 GR00T 容器、打开硬件上的串行端口，并写入本地数据集缓存。要将环境恢复到干净状态：

-   **停止 GR00T 推理容器：** `agent.tool.gr00t_inference(action="stop", port=5555)`，或使用 `lifecycle="teardown"` 同时移除容器。
-   **释放串行端口：** 如果你运行了硬件路径，请断开 SO-101 从手和主手的连接。
-   **可选：移除本地数据集缓存：** 录制的数据集位于 `~/.cache/huggingface/lerobot/<repo_id>`。已推送到 Hub 的数据集不受影响。

## [](#how-this-fits-together)各部分如何协同工作

该集成的核心设计选择是：Strands Robots 不会重新实现 LeRobot 已提供的功能。硬件抽象、校准和数据集格式均保持在上游。Strands 新增了 AgentTool 界面，使其能够通过自然语言进行组合。

由此产生两个结果。对于用户而言，Hub 上的每个数据集都是资产，智能体可以对其进行扩展、微调并直接部署，无需任何转换步骤。对于开发者而言，仿真数据和硬件数据共享单一文件格式，因此为一种数据编写的训练脚本可直接用于另一种数据。仿真与现实之间的界限变成了部署细节，而非架构上的鸿沟。

## [](#where-to-go-from-here)后续方向

[![fleet](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/LC9TP6EKBDCBC4waZEXJo.png)](https://cdn-uploads.huggingface.co/production/uploads/6a1dc0f2b4238bb17ff94794/LC9TP6EKBDCBC4waZEXJo.png)

**图 4. *Strands Robots 目录涵盖机械臂、人形机器人、四足机器人和灵巧手，全部运行在相同的 MuJoCo 仿真环境中，并统一通过 `Robot()` 工厂创建。本文中的 SO-100 只是众多支持的具体形态之一。***

完整的 [Strands Robots 文档](https://strands-labs.github.io/robots/) 深入介绍了机器人目录、仿真、策略提供器、网格和 Device Connect。对于更大规模的工作负载，[strands-labs/robots-sim](https://github.com/strands-labs/robots-sim) 仓库托管了更重的仿真后端，包括 Isaac Sim 和 Newton，以及一个 LIBERO 基准测试示例。这两个后端都接入本文展示的同一 Robot 抽象，因此智能体代码在扩展时保持不变。

欢迎在 Apache 2.0 许可下贡献代码。如果您使用此工作流构建了某些功能，请提交 issue，说明哪些有效、哪些无效。当开发者的反馈直接落在需要改进的界面上时，SDK 的改进速度最快。

## [](#resources)资源

-   **Strands Robots** (SDK, AgentTools, Robot 工厂): [github.com/strands-labs/robots](https://github.com/strands-labs/robots)，Apache 2.0
-   **Strands Robots 文档** (完整文档): [strands-labs.github.io/robots](https://strands-labs.github.io/robots/)
-   **Strands Robots Sim** (示例, 仿真后端): [github.com/strands-labs/robots-sim](https://github.com/strands-labs/robots-sim)
-   **示例:** [examples/lerobot/hub\_to\_hardware.py](https://github.com/strands-labs/robots/tree/main/examples/lerobot) 和 [hub\_to\_hardware.ipynb](https://github.com/strands-labs/robots/tree/main/examples/lerobot)
-   **如何构建物理 AI 智能体：面向真实世界机器人的自然语言**: [直播](https://www.youtube.com/watch?v=K5fVWNeaqiM) 和 [博客](https://aws.amazon.com/blogs/opensource/building-intelligent-physical-ai-from-edge-to-cloud-with-strands-agents-bedrock-agentcore-claude-4-5-nvidia-gr00t-and-hugging-face-lerobot/)
-   **深入探讨物理 AI | S1E4 | 使用 NVIDIA NeMo Agent Toolkit 和 Bedrock AgentCore 实现自动化**: [直播](https://www.youtube.com/watch?v=o4WJrv4jlCU)
-   **LeRobot**: [github.com/huggingface/lerobot](https://github.com/huggingface/lerobot) - 数据集, 策略, 硬件驱动
-   **Strands Agents SDK**: [github.com/strands-agents/harness-sdk](https://github.com/strands-agents/harness-sdk)
-   **SmolVLA**: [SmolVLA](https://huggingface.co/lerobot/smolvla_base)
-   **Pi0**: [Pi0](https://huggingface.co/lerobot/pi0_base)
-   **NVIDIA Isaac-GR00T N1.7**: [GR00T N1.7](https://huggingface.co/nvidia/GR00T-N1.7-3B)
-   **NVIDIA Cosmos3 Nano**: [Cosmos 3 Nano](https://huggingface.co/nvidia/Cosmos3-Nano)

* * *

## [](#authors)作者

**Cagatay Cali** 是 AWS 的研究工程师，专注于智能体 AI 和机器人技术。他设计将 AI 智能体连接到物理机器人的接口，使开发者能够通过自然语言控制机器人系统，并让不同技能水平的构建者都能轻松使用智能体和机器人开发。

[**Sundar Raghavan**](https://www.linkedin.com/in/sundar-raghavan-4838a526) 是 AWS 智能体 AI 基础团队的高级解决方案架构师。他负责 Amazon Bedrock AgentCore 的开发者体验，拥有 SDK 和 CLI 的所有权，并推动框架和生态系统集成战略。他专注于开发者如何在 AWS 上构建、部署和扩展生产级 AI 智能体。目前，他正将这一重点扩展到物理 AI 领域，通过合作 Strands Robots，将相同的智能体开发者体验引入机器人技术。
