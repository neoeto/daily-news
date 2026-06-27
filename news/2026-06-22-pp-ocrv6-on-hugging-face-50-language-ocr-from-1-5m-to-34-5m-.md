---
title: 'PP-OCRv6 on Hugging Face: 50-Language OCR from 1.5M to 34.5M Parameters'
url: 'https://huggingface.co/blog/PaddlePaddle/pp-ocrv6'
url_hash: 493a508e4ceaa14c153f1cf6111d4d075ab15b9d
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-22T13:18:56.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

> **在线评估 PP-OCRv6，然后通过 PaddlePaddle、Transformers 或 ONNX Runtime 后端集成轻量级、可投入生产的 OCR。**

PP-OCRv6 是 PaddleOCR 通用 OCR 模型系列的最新版本。它专为文档、截图、多语言图像、数字显示屏、工业标签和场景文本等真实场景中的文本检测与识别而设计。

[![ppocrv6\_det\_vis](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/BB9bToA0xHZ8Xu5cvBGx0.jpeg)](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/BB9bToA0xHZ8Xu5cvBGx0.jpeg)

该模型系列参数规模从 **1.5M 到 34.5M**，分为三个等级：**tiny**、**small** 和 **medium**。其中 medium 和 small 等级支持 **50 种语言**，包括简体中文、繁体中文、英语、日语以及 46 种拉丁字母语言。快速在线体验 PP-OCRv6：[PP-OCRv6 在线演示](https://huggingface.co/spaces/PaddlePaddle/PP-OCRv6_Online_Demo)。

[![ocrv6\_models](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/Rwhy6dk3g8xb6eyVFL9R_.jpeg)](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/Rwhy6dk3g8xb6eyVFL9R_.jpeg)

在 PaddleOCR 官方内部多场景 OCR 基准测试中，**PP-OCRv6\_medium** 的**检测 Hmean 达到 86.2%**，**识别准确率达到 83.2%**。与 PP-OCRv5\_server 相比，文本检测提升了 **+4.6 个百分点**，文本识别提升了 **+5.1 个百分点**。

[![v6acc\_opt](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/xYqS-wDYHDE7cUQQdkcqD.png)](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/xYqS-wDYHDE7cUQQdkcqD.png)

PP-OCRv6 聚焦于一个实际的 OCR 需求：通过小型模型和灵活的部署选项，生成准确、结构化的文本输出。关于为何在 VLM 时代专用 OCR 模型仍然有用的深入讨论，请参阅我们之前的博客：[PP-OCRv5 on Hugging Face: A Specialized Approach to OCR](https://huggingface.co/blog/baidu/ppocrv5)。

* * *

## [](#whats-new-in-pp-ocrv6)PP-OCRv6 的新特性

PP-OCRv6 在检测和识别方面引入了架构、训练和数据的改进。主要设计目标是在保持模型尺寸适用于不同部署场景的同时，提升 OCR 准确率。

### [](#three-model-tiers)三个模型等级

PP-OCRv6 提供三个模型等级，覆盖不同的模型尺寸和 OCR 准确率水平。

| 模型 | 模型大小 | 检测 Hmean | 识别准确率 | 典型应用场景 |
| --- | --- | --- | --- | --- |
| **PP-OCRv6\_tiny** | **1.5M 参数** | 80.6% | 73.5% | 边缘设备、轻量级本地 OCR、延迟敏感型演示、资源受限环境 |
| **PP-OCRv6\_small** | **7.7M 参数** | 84.1% | 81.3% | 移动端、桌面端、均衡型 OCR 服务、低计算成本的多语言 OCR |
| **PP-OCRv6\_medium** | **34.5M 参数** | **86.2%** | **83.2%** | 精度导向型 OCR、服务端流水线、工业 OCR、文档录入、多语言 OCR |

### [](#pplcnetv4-backbone)PPLCNetV4 骨干网络

PP-OCRv6 使用 **PPLCNetV4** 作为文本检测和文本识别的统一骨干网络。

对开发者而言，主要优势在于模型系列的一致性。tiny、small 和 medium 等级并非互不相关的模型，它们属于同一个 OCR 家族，共享共同的架构方向。

[![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MzQ2ODgzNWViOTJhYjMzZDUxNTMyY2RlMzdhMDAwZmNfZWJmZGY5NTljOWJlY2YyODVhYzg0N2NhNTk3MjQwMTRfSUQ6NzY1MjcxNjg0NDE1OTMyMzA5N18xNzgxODE5MjkwOjE3ODE5MDU2OTBfVjM)](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MzQ2ODgzNWViOTJhYjMzZDUxNTMyY2RlMzdhMDAwZmNfZWJmZGY5NTljOWJlY2YyODVhYzg0N2NhNTk3MjQwMTRfSUQ6NzY1MjcxNjg0NDE1OTMyMzA5N18xNzgxODE5MjkwOjE3ODE5MDU2OTBfVjM)

### [](#replkfpn-for-text-detection)用于文本检测的 RepLKFPN

文本检测是 OCR 流水线的第一阶段。检测质量会影响送入识别器的裁剪区域，而质量差的裁剪区域通常会导致识别效果不佳。

PP-OCRv6 将检测模块升级为 **RepLKFPN**，这是一个轻量级的大核特征金字塔网络，专为多尺度文本检测设计，同时保持推理高效。

这对于真实世界的 OCR 输入尤为重要，因为文本可能很小、密集、旋转、低分辨率，或嵌入在复杂背景中。

[![ppocrv6\_det\_pip\_ori](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/Unp8cz-s3c4jSMl71qIFf.png)](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/Unp8cz-s3c4jSMl71qIFf.png)

### [](#encoderwithlightsvtr-for-recognition)用于识别的 EncoderWithLightSVTR

在文本识别方面，PP-OCRv6 使用了 **EncoderWithLightSVTR**。它将局部上下文建模与全局注意力相结合，以提升对具有挑战性的文本裁剪区域的识别质量。

识别方面的改进尤其适用于多语言文本、屏幕文本、工业字符、特殊符号、密集文本以及噪声图像区域。

[![rec](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/YLhR7a1-BdP62o0o_zZl1.png)](https://cdn-uploads.huggingface.co/production/uploads/652b2e9166313ebb6197e706/YLhR7a1-BdP62o0o_zZl1.png)

### [](#unified-multilingual-ocr)统一的多语言 OCR

中端和轻量级模型系列支持 **50 种语言**，涵盖简体中文、繁体中文、英语、日语以及 46 种拉丁字母语言。

这有助于在常见的多语言 OCR 场景中减少对独立 OCR 模型的需求。

* * *

## [](#快速上手-paddleocr)快速上手 PaddleOCR

安装 PaddleOCR：

```
pip install paddleocr
```

使用 Paddle Inference（默认后端）运行 OCR：

```
from paddleocr import PaddleOCR

# 模型：PP-OCRv6_medium（默认）
# 后端：Paddle Inference（默认）
ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
)
result = ocr.predict("https://paddle-model-ecology.bj.bcebos.com/paddlex/imgs/demo_image/general_ocr_002.png")

for res in result:
    res.print()
    res.save_to_img("output")
    res.save_to_json("output")
```

OCR 结果可保存为可视化图像和结构化 JSON 输出。结构化输出随后可供下游系统使用，例如文档解析、搜索、信息提取、RAG、分析或智能体工作流。

* * *

## [](#可用的推理后端)可用的推理后端

PP-OCRv6 可通过 PaddleOCR 使用多种推理后端。**PaddleOCR 3.7** 提供了统一的推理引擎接口，其中 `engine` 参数用于选择底层运行时，相关配置可通过流水线或模块 API 传递。

| **后端** | **描述** |
| --- | --- |
| **Transformers** | 面向 Hugging Face / PyTorch 的推理路径，适用于支持的 PaddleOCR 模型 |
| **ONNX Runtime** | 基于 ONNX 的部署环境的可移植推理路径 |
| **Paddle Inference** | 原生 Paddle 推理格式 |

对于 Hugging Face 用户，PaddleOCR 支持使用 Transformers 后端运行选定的 OCR 和文档解析模型。可通过以下方式启用：

```
engine="transformers"
```

有关 Transformers 后端在 PaddleOCR 中如何工作的更多详细信息，请参阅：

[PaddleOCR：使用 Transformers 后端运行 OCR 和文档解析任务](https://huggingface.co/blog/PaddlePaddle/paddleocr-transformers)

使用 Transformers 后端运行 PP-OCRv6 示例：

```

from paddleocr import PaddleOCR

# 模型：PP-OCRv6_medium（默认）
# 后端：transformers
ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    engine="transformers",
)
result = ocr.predict("https://paddle-model-ecology.bj.bcebos.com/paddlex/imgs/demo_image/general_ocr_002.png")
```

ONNX 变体也可在 [PP-OCRv6 模型合集](https://huggingface.co/collections/PaddlePaddle/pp-ocrv6) 中找到，适用于通过 `engine="onnxruntime"` 使用 ONNX Runtime 的环境：

```
from paddleocr import PaddleOCR

# 模型：PP-OCRv6_medium（默认）
# 后端：ONNX Runtime
ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    engine="onnxruntime",
)
result = ocr.predict("https://paddle-model-ecology.bj.bcebos.com/paddlex/imgs/demo_image/general_ocr_002.png")
```

这些后端选项共同使 PP-OCRv6 能够在不同的运行时环境中使用，同时保持 Hugging Face Hub 上相同的 OCR 模型系列。

* * *

## [](#总结)总结

PP-OCRv6 为 PaddleOCR 扩展了一个轻量级、多语言的 OCR 模型系列，用于实际场景中的文本检测与识别。

此次发布包括三个模型层级，参数规模从 **1.5M 到 34.5M**，支持**多达 50 种语言的 OCR**，在检测和识别精度上优于 PP-OCRv5_server，并在 Hugging Face Hub 上提供多种模型格式，包括 **safetensors**、**Paddle 推理模型**和 **ONNX 模型**。

结合托管的 Hugging Face Space 和可用的 PaddleOCR 推理后端，PP-OCRv6 提供了多个评估和集成的入口：

-   **在线演示**：[PP-OCRv6 在线演示](https://huggingface.co/spaces/PaddlePaddle/PP-OCRv6_Online_Demo)

-   **模型合集**：[PP-OCRv6 模型合集](https://huggingface.co/collections/PaddlePaddle/pp-ocrv6)

-   **Transformers 后端博客**：[PaddleOCR 与 Transformers 后端](https://huggingface.co/blog/PaddlePaddle/paddleocr-transformers)

-   **PaddleOCR 文档**：[PP-OCRv6 文档](https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html)

-   **PaddleOCR 官方网站**：[https://www.paddleocr.com](https://www.paddleocr.com/)

您可以通过在线演示评估 PP-OCRv6，探索模型合集中的可用模型资产，并使用与您自身 OCR 工作流相匹配的推理后端。
