---
title: 'DiScoFormer: One transformer for density and score, across distributions'
url: 'https://huggingface.co/blog/allenai/discoformer'
url_hash: 91d16542fa1f3b29004be7a620e044f108cb8232
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-29T18:02:48.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
[返回文章](https://huggingface.co/blog)

[![Kyle Wiggers的头像](https://huggingface.co/avatars/fee5cceec7536851d7c6712760716a71.svg)](https://huggingface.co/Ai2Comms)

**📄 技术报告：** [arxiv.org/abs/2511.05924](https://arxiv.org/abs/2511.05924)

[![DiScoFormer：跨分布的密度与得分一体化Transformer - Google - 图片1](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/RsD3JLEW1EABr7i2WCKlF.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/RsD3JLEW1EABr7i2WCKlF.png)

机器学习和科学领域的许多问题最终都归结为同一项任务：你有一组数据点，想要恢复它们所来自的分布——哪些值常见，哪些值罕见。确定这个分布意味着估计两个量：分布的密度，以及随着维度增加而更有用的得分。密度是直方图的平滑版本——数据点聚集的地方密度高，稀疏的地方密度低。得分（对数密度的梯度）指向密度上升最快的方向：沿着得分方向移动一个点，它会朝向更可能的区域。

基于扩散的生成模型（如Stable Diffusion和DALL-E等AI图像生成器背后的技术）从随机噪声开始，反复跟随得分，将噪声转化为逼真的图像。同样的得分驱动着贝叶斯采样和用于模拟等离子体等系统的粒子模拟。

从有限样本中提取密度和得分极具挑战性，而现有工具迫使人们在泛化能力和准确性之间做出权衡。一种经典方法——核密度估计（KDE）——根据周围数据点计算任意位置的密度：数据点越近、越多，密度越高。它无需训练，适用于任何分布，但其准确性会随着维度增加而急剧下降。另一种方法是神经得分匹配模型，它们经过训练可以预测得分，即使在高维空间中也能保持准确性，但每个模型都需要学习特定分布，并且必须为另一个分布从头开始重新训练。

我们提出了一种名为[DiScoFormer（密度与得分Transformer）](https://arxiv.org/pdf/2511.05924)的新解决方案——给定一组数据点，该模型能在一次前向传播中同时估计分布的密度和得分，无需重新训练。

## [](#training-a-transformer-for-density-and-score-estimation)训练用于密度和得分估计的Transformer

[![DiScoFormer：跨分布的密度与得分一体化Transformer - Google - 图片2](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/tNRWwYaFG4jyW5f2xWdoY.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/tNRWwYaFG4jyW5f2xWdoY.png)

DiScoFormer利用堆叠的Transformer块层，将整个样本映射到其背后分布的密度和得分。该模型采用交叉注意力机制，使其能够评估任意点（而不仅仅是存在数据点的位置）的密度和得分。得分和密度之间存在数学关系：得分是对数密度的梯度。我们通过共享主干网络并配备两个输出头（一个用于密度，一个用于得分）来利用这一关系。

这种耦合不仅节省了参数。得分头必须在每个查询点上匹配对数密度头的梯度，因此两者之间的任何差距都构成一种无标签的一致性损失。我们在推理时利用这一点——固定上下文，对一致性损失进行几步梯度更新，DiScoFormer便能即时适应分布外的输入，无需真实密度或得分。

Transformer架构之所以适合这项任务，存在一个数学原因。核密度估计只有一个带宽——每个点的影响范围是固定的，且在所有位置统一应用。而注意力机制是其严格泛化：我们通过分析证明，单个注意力头的权重近似于数据上的高斯核，因此一个交叉注意力块已能复现KDE的密度和分数。在此基础上，模型更进一步，同时学习多个这样的尺度，并使其适应数据。DiScoFormer并非用黑箱抛弃经典方法，而是将KDE作为特例包含其中，并加以改进。

我们使用什么数据训练DiScoFormer？主要基于高斯混合模型，原因有二。首先，GMM是通用密度逼近器——只要分量足够多，就能以任意小的误差匹配几乎任何平滑分布。其次，GMM具有闭式密度和分数，因此我们始终有精确的目标用于监督。我们利用这两个特性，为每个批次生成新的GMM，为模型提供几乎无限的目标分布示例，并针对给定GMM的精确密度和分数进行监督。

## [](#performance)性能

总体而言，DiScoFormer在密度和分数估计上均优于KDE，且差距恰好在KDE表现不佳处扩大。在100维空间中，差距尤为显著——与最佳手动调参的KDE相比，DiScoFormer将分数误差降低约6.5倍，密度误差降低超过37倍，并且随着样本增加持续改进，而KDE则因内存不足而受限。它还能远超出训练数据范围，在比训练时见过的模式更多的混合分布上，以及拉普拉斯分布和学生t分布等非高斯形状上保持准确。KDE的主要优势仍是速度，尤其在数据集较小时。

我们认为DiScoFormer最令人期待之处在于，分数估计是生成建模、贝叶斯推断和科学计算等多个领域的共同依赖。一个预训练的即插即用型估计器，能在高维空间中保持准确，并省去针对每个问题重新训练的需求，可同时降低所有这些领域的成本——一个模型，在分数和密度出现的任何地方重复使用。

我们鼓励您[阅读我们的技术报告](https://arxiv.org/pdf/2511.05924)以获取更多细节。
