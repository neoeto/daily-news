---
title: "\U0001F917 Kernels: Major Updates"
url: 'https://huggingface.co/blog/revamped-kernels'
url_hash: c57690ad336e7f8b9a8e0ddbb49d59685fa98303
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-07-06T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
  - 前端
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

在[上一篇文章（从零到GPU）](https://huggingface.co/blog/kernel-builder)中，我们介绍了🤗 Kernels项目，旨在标准化自定义内核的打包、分发和消费方式。我们希望该项目既无摩擦又安全，同时尽可能与Hub友好集成。

过去几个月，我们一直朝着这个目标努力。在此过程中，我们还几乎完全重新设计了该项目。本文将总结我们已发布的主要更新以及未来的规划。

**目录**

-   [内核——一种新的仓库类型](#内核——一种新的仓库类型)
-   [安全性提升](#安全性提升)
-   [CLI全面革新](#cli全面革新)
-   [框架与后端覆盖更广](#框架与后端覆盖更广)
-   [智能内核开发基础](#智能内核开发基础)
-   [其他更新](#其他更新)
-   [总结](#总结)

## [](#内核——一种新的仓库类型)内核——一种新的仓库类型

我们在Hub上引入了一种名为["内核"](https://huggingface.co/kernels)的新仓库类型。这使我们能够满足用户对计算相关特性的需求。例如，用户可以了解某个内核支持的加速器、操作系统和后端版本：

<figure><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/revamped-kernels/flash-attn3.png" alt="Flash Attention 3 内核页面" width="600"><figcaption>内核页面：<a href="https://huggingface.co/kernels/kernels-community/flash-attn3">kernels-community/flash-attn3</a></figcaption></figure>

用户可在此浏览Hub上所有可用内核：[https://huggingface.co/kernels](https://huggingface.co/kernels)。

将这些内核作为Hub的一等公民，也有利于AI生态系统。用户现在可以查看内核、模型及其应用的趋势，内核的可发现性也得到提升。

## [](#安全性提升)安全性提升

内核以与加载它的Python进程相同的权限运行原生代码，因此恶意内核可能造成实际危害。正因如此，安全性始终是Kernels项目的重中之重。

这也是我们早期专注于可重现性的原因：您应能自行重新编译内核，并验证其与公开源代码一致。我们使用Nix实现这一点，因为它通过构建配方的封闭评估和强隔离沙箱保持构建的纯净性。我们还将源代码Git SHA1嵌入内核本身，进一步增强了来源追溯能力。

近几个月，我们增加了额外的防御层：可信内核发布者和代码签名。

### [](#可信内核发布者)可信内核发布者

随着新仓库类型的推出，我们还引入了"可信发布者"。由于内核以与Python进程相同的权限在机器上执行代码，攻击者可能通过上传恶意内核并诱使您使用该内核来入侵机器。为帮助您避免此类恶意内核，内核包现在默认仅加载*可信发布者*的内核。可信发布者是社区信任其诚信行为的组织。

我们仍支持加载来自非可信发布者组织或用户的内核，但您需要在从Hub加载内核时使用`trust_remote_code`参数明确选择启用：

```
from kernels import get_kernel

kernel_module = get_kernel(
   "Atlas-Inference/gdn", version=1, trust_remote_code=True
)
```

默认情况下，用户无法在 Hub 上发布内核仓库。他们需要申请成为内核发布者。用户和组织可以在账户设置中申请访问权限。这让我们有时间逐案处理这些请求。

### [](#kernel-signing)内核签名

我们正在增加的另一个安全层是代码签名。代码签名可以防止以下情况：攻击者从 Hub 凭证被泄露的可信发布者那里，将恶意内核上传到内核仓库。在代码签名中，内核使用只有内核开发者知道的私钥进行签名，并使用公开可用的公钥进行验证。在 Hub 被攻破的情况下，攻击者无法对恶意内核进行签名，因为他们没有签名所需的私钥。

为了进一步提高安全性，我们使用 Sigstore 的 cosign 通过临时私钥进行签名。由于这些签名密钥仅在有限时间内有效，攻击者即使泄露了私钥，通常也无法使用它。我们还会验证内核是否由受信任的 GitHub 仓库中的受信任 GitHub 工作流签名。

`kernel-builder` 已支持内核签名，并且我们提供了 `kernels verify-signature` 来验证内核。Kernels 目前尚未在加载内核时验证签名，因为我们希望在全面推出之前进一步测试这一新功能。关于为自己的内核设置代码签名的初步说明，请参阅 kernels 0.16.0 发布说明：[https://github.com/huggingface/kernels/releases/tag/v0.16.0](https://github.com/huggingface/kernels/releases/tag/v0.16.0)。

## [](#revamped-clis)改进的命令行界面

以前，`kernels` 和 `kernel-builder` 之间混杂了许多实用工具。我们已经在 `kernels` 和 `kernel-builder` 的命令行界面之间建立了更好的关注点分离。这里的心智模型是，`kernels` 是一个用于加载和准备内核以供使用的库。因此，它不应包含任何与“构建”内核相关的内容。

因此，`kernels` 和 `kernel-builder` 现在都更加精简和专注。请参阅文档了解更多信息：

-   [`kernels` 命令行界面](https://huggingface.co/docs/kernels/en/cli)
-   [`kernel-builder` 命令行界面](https://huggingface.co/docs/kernels/en/builder-cli)

这种改进的命令行界面体验也让我们能够更好地适应智能体内核开发的兴起。更多内容请参见[后文](#foundation-for-agentic-kernel-development)。

## [](#more-coverage-of-frameworks-and-backends)更广泛的框架和后端支持

我们扩展了对框架的支持，最显著的变化包括：

-   我们为 kernels 和 kernel-builder 增加了对 Torch Stable ABI 的支持。Torch Stable ABI 允许内核开发者针对特定 Torch 版本或其后发布的大约两年内的任何版本进行开发。例如，针对 Torch 2.9 Stable ABI 的内核支持 Torch >= 2.9。
-   Apache TVM FFI 是除 Torch 之外首个获得支持的框架。TVM FFI 是一种标准化的内核 ABI，可与 PyTorch、Jax 和 CuPy 等其他框架互操作。这使得内核开发者能够开发跨框架运行的内核。

## [](#foundation-for-agentic-kernel-development)智能体内核开发的基础

`kernel-builder` 和 `kernels` 相辅相成，共同推动了智能体内核开发模式的兴起——在这种模式下，智能体被用来从零开始生成（优化后的）内核。两者协同支持一个工作流，让智能体能够搭建、构建、基准测试并迭代优化内核。

智能体内核开发仍处于早期阶段，正确的开发循环会持续演进。因此，简单清晰的基础设施尤为重要，工具应易于组合到用户选择的任何智能体工作流或框架中。

`kernel-builder` 有助于强制执行内核源码的搭建结构，并用于执行可复现的构建。这为智能体提供了可预测的项目布局和可重复的工作流程。其 CLI 也旨在实现[智能体优化](https://huggingface.co/blog/is-it-agentic-enough)。例如，这意味着非交互式命令和输出，便于智能体以编程方式直接解析。为此，我们还提供了[后端特定技能](https://huggingface.co/docs/kernels/en/cli-skills)，帮助智能体应对不同后端的特性。这些技能可以捕获后端特定的工具链、编译路径和性能考量。

成功构建内核并非唯一目标，我们还需要确保它在目标硬件上相比基线能带来实际的速度提升。因此，成功构建只是第一步验证。通常，目标硬件可能包含多种不同的加速器，甚至同一加速器的不同系列。

这使得跨硬件供应商和相关代际评估结果变得重要。我们与 [HF Jobs 的紧密集成](https://huggingface.co/docs/kernels/en/builder/github-actions)可以简化这一基准测试流程。智能体可以利用此集成来运行基准测试套件、收集性能结果，并与定义的基线进行比较。

这样，智能体就能在不同硬件配置上运行测试，获取关于生成内核性能的可靠反馈，并识别需要改进的地方。这些反馈随后可用于指导下一轮优化迭代。

以下是一些智能体增强型内核的示例。它们展示了通过此工作流可以开发和评估的内核类型：

-   [https://huggingface.co/kernels/drbh/yamoe](https://huggingface.co/kernels/drbh/yamoe)
-   [https://huggingface.co/kernels/sayakpaul/qk-norm-rope](https://huggingface.co/kernels/sayakpaul/qk-norm-rope)

## [](#misc)其他

### [](#environment-setup)环境设置

使用 `kernel-builder` 构建内核的环境设置可能比较繁琐。为方便用户，我们现在提供了一个[安装脚本](https://huggingface.co/docs/kernels/en/builder/writing-kernels#quick-install)，可一键设置环境。如果你更喜欢使用临时实例，可以按照我们的 [Terraform 设置指南](https://github.com/huggingface/kernels/tree/main/terraform)操作。

### [](#system-card-for-kernels)内核系统卡

内核构建完成后，我们会为每个内核创建一张系统卡，以公开有用信息，包括如何使用它及其暴露的接口。当内核推送到 Hub 时，这张系统卡会成为内核的前置信息：

<figure><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/revamped-kernels/kernel-card.png" alt="内核系统卡" width="600"><figcaption><a href="https://huggingface.co/kernels/kernels-community/flash-attn3">kernels-community/flash-attn3</a> 的系统卡</figcaption></figure>

### [](#is-a-kernel-compatible-on-my-system)内核在我的系统上兼容吗？

这是一个人们会多次询问以更好规划的问题。可以使用 [`has_kernel()`](https://huggingface.co/docs/kernels/main/en/api/kernels#kernels.has_kernel) 方法：

```
from kernels import has_kernel

print(has_kernel("kernels-community/activation", version=1))
```

它返回一个 `bool` 值。如果你需要更多关于某个内核为何不受支持的解释，可以使用 [`get_kernel_variants()`](https://huggingface.co/docs/kernels/main/en/api/kernels#kernels.get_kernel_variants)：

```
 from kernels import get_kernel_variants, VariantAccepted
```

```python
for decision in get_kernel_variants("kernels-community/activation", version=1):
    name = decision.variant.variant_str
    if isinstance(decision, VariantAccepted):
        print(f"{name}: 兼容")
    else:
        print(f"{name}: 被拒绝 ({decision.reason})")
```

输出结果（取决于你的机器）应为：

```
torch212-cxx11-cu130-aarch64-linux: 兼容
torch210-cu128-x86_64-windows: 被拒绝 (CPU (x86_64) 与系统 CPU (aarch64) 不匹配)
torch211-cu128-x86_64-windows: 被拒绝 (CPU (x86_64) 与系统 CPU (aarch64) 不匹配)
torch212-metal-aarch64-darwin: 被拒绝 (操作系统 (darwin) 与系统操作系统 (linux) 不匹配)
torch211-metal-aarch64-darwin: 被拒绝 (操作系统 (darwin) 与系统操作系统 (linux) 不匹配)
torch210-metal-aarch64-darwin: 被拒绝 (操作系统 (darwin) 与系统操作系统 (linux) 不匹配)
torch29-metal-aarch64-darwin: 被拒绝 (操作系统 (darwin) 与系统操作系统 (linux) 不匹配)
…
```

### [](#improved-manylinux_2_28-support)改进的 manylinux\_2\_28 支持

Kernel-builder 几乎从一开始就针对 `manylinux_2_28`。我们曾通过使用基于 glibc 2.28 编译的现代 gcc 工具链来支持 `manylinux`。为避免与旧版 `libstdc++` 的兼容性问题，我们静态链接了 libstdc++。

然而，这种方法最近引发了一些问题。某些 `libstdc++` 功能使用了全局初始化。当多个 `libstdc++` 版本同时存在时（例如 PyTorch 动态链接的 `libstdc++` 与内核静态链接的 `libstdc++`），这可能导致数据损坏。最近一些内核使用了会触发全局初始化的功能（如 C++ 正则表达式），进而导致数据损坏，引发段错误等问题。

为解决此问题，内核现在动态链接 `libstdc++`。为确保与旧版 `libstdc++` 的兼容性，我们现在使用官方的 `manylinux_2_28` 工具链编译内核。

## [](#conclusion)结论

Kernels 项目的目标是同时服务内核开发者和自定义内核用户。我们始终热切期待社区的反馈，以帮助我们改进。欢迎随时贡献！

*致谢：感谢 [Aritra](https://huggingface.co/blog/ariG23498) 审阅本文。*
