---
title: 'The State Of LLMs 2025: Progress, Problems, and Predictions'
url: 'https://magazine.sebastianraschka.com/p/state-of-llms-2025'
url_hash: b1581a551bbc528f2a4043a13b63ecbb7cc0e712
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2025-12-30T08:15:00.000Z
lang: zh
translated: true
tags:
  - AI
original_lang: en
truncated: false
---
随着2025年即将结束，我想回顾一下今年大型语言模型领域最重要的一些进展，反思仍然存在的局限性和未解决的问题，并分享一些对未来的思考。

正如我每年常说的那样，2025年对LLM和AI来说是充满重大事件的一年，而今年，进步丝毫没有饱和或放缓的迹象。

我想讨论的话题很多，但让我们从2025年1月按时间顺序开始。

​规模扩展仍然有效，但它并没有真正改变LLM在实际使用中的行为或感受（唯一的例外是OpenAI新发布的o1，它增加了推理痕迹）。因此，当DeepSeek在2025年1月发布他们的[R1论文](https://arxiv.org/abs/2501.12948)时，表明类似推理的行为可以通过强化学习来培养，这确实是一件大事。（在LLM的语境中，推理意味着模型解释其答案，而这种解释本身通常能提高答案的准确性。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Kcvi!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Kcvi!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 424w, https://substackcdn.com/image/fetch/$s_!Kcvi!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 848w, https://substackcdn.com/image/fetch/$s_!Kcvi!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 1272w, https://substackcdn.com/image/fetch/$s_!Kcvi!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Kcvi!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png" width="500" height="489.3543956043956" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1425,&quot;width&quot;:1456,&quot;resizeWidth&quot;:500,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:false,&quot;topImage&quot;:true,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Kcvi!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 424w, https://substackcdn.com/image/fetch/$s_!Kcvi!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 848w, https://substackcdn.com/image/fetch/$s_!Kcvi!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 1272w, https://substackcdn.com/image/fetch/$s_!Kcvi!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89f0ab43-20be-4c4d-a0f7-1a107d380222_1496x1464.png 1456w" sizes="100vw" fetchpriority="high"></picture></div></a><figcaption><em>图1：一个简短回答和一个包含中间步骤的较长回答，后者通常由推理模型生成。</em></figcaption></figure>

DeepSeek R1因多种原因受到了广泛关注：

首先，DeepSeek R1以开源权重模型的形式发布，性能非常出色，与当时最好的专有模型（ChatGPT、Gemini等）不相上下。

其次，DeepSeek R1论文促使许多人，尤其是投资者和记者，重新审视了2024年12月发布的早期[DeepSeek V3论文](https://arxiv.org/abs/2412.19437)。这随后导致了一个修正后的结论：虽然训练最先进的模型仍然昂贵，但成本可能比之前假设的要低一个数量级，估计更接近500万美元，而不是5000万或5亿美元。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!Tc8v!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!Tc8v!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 424w, https://substackcdn.com/image/fetch/$s_!Tc8v!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 848w, https://substackcdn.com/image/fetch/$s_!Tc8v!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 1272w, https://substackcdn.com/image/fetch/$s_!Tc8v!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!Tc8v!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png" width="1456" height="351" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:351,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!Tc8v!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 424w, https://substackcdn.com/image/fetch/$s_!Tc8v!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 848w, https://substackcdn.com/image/fetch/$s_!Tc8v!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 1272w, https://substackcdn.com/image/fetch/$s_!Tc8v!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca64a21-f608-4aba-9920-5a8f8216ae27_1600x386.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图2：来自</span><a href="https://arxiv.org/abs/2412.19437">DeepSeek V3论文</a><span>的表格，估算了训练671B参数DeepSeek V3模型的成本。</span></em></figcaption></figure>

​DeepSeek R1的[补充材料](https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-025-09422-z/MediaObjects/41586_2025_9422_MOESM1_ESM.pdf)估计，在DeepSeek V3基础上训练DeepSeek R1模型还需花费29.4万美元，这再次远低于所有人的预期。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!2b0j!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!2b0j!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 424w, https://substackcdn.com/image/fetch/$s_!2b0j!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 848w, https://substackcdn.com/image/fetch/$s_!2b0j!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 1272w, https://substackcdn.com/image/fetch/$s_!2b0j!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!2b0j!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png" width="1358" height="288" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/adaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:288,&quot;width&quot;:1358,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!2b0j!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 424w, https://substackcdn.com/image/fetch/$s_!2b0j!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 848w, https://substackcdn.com/image/fetch/$s_!2b0j!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 1272w, https://substackcdn.com/image/fetch/$s_!2b0j!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fadaa546e-94d1-4dfe-b05d-f23e43847211_1358x288.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图3：来自DeepSeek R1论文</em><a href="https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-025-09422-z/MediaObjects/41586_2025_9422_MOESM1_ESM.pdf">补充材料</a><em>的表格，估算了在DeepSeek V3基础上训练R1模型的成本。</em></figcaption></figure>

当然，500万美元的估算有很多注意事项。例如，它只涵盖了最终模型运行的算力信用成本，但没有考虑研究人员的薪资以及与超参数调整和实验相关的其他开发成本。

第三点，也是最有意思的一点，该论文提出了基于GRPO算法的*可验证奖励强化学习*（RLVR），将其作为一种新的（或至少是改进的）算法方法，用于开发所谓的推理模型，并在后训练阶段改进大语言模型。

到目前为止，监督式指令微调（SFT）和基于人类反馈的强化学习（RLHF）等后训练方法，仍然是训练流程的重要组成部分，但它们都受限于需要昂贵的书面回答或偏好标签。（当然，我们也可以用其他大语言模型来合成生成这些数据，但这有点像是先有鸡还是先有蛋的问题。）

​

DeepSeek R1和RLVR的重要性在于，它们允许我们在大量数据上对大语言模型进行后训练，这使得它们成为通过在后训练阶段扩展计算量（在给定的计算预算下）来改进和释放模型能力的绝佳候选方案。

RLVR中的V代表“可验证”，这意味着我们可以使用确定性的方法来分配正确性标签，而这些标签足以让大语言模型学习解决复杂问题。（典型的领域是数学和代码，但也可以将这个想法扩展到其他领域。）

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!ZBQ-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 424w, https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 848w, https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 1272w, https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png" width="508" height="272.31053604436227" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:580,&quot;width&quot;:1082,&quot;resizeWidth&quot;:508,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 424w, https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 848w, https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 1272w, https://substackcdn.com/image/fetch/$s_!ZBQ-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93f6ea05-d650-4ec7-8972-b1975ffbc508_1082x580.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图5：一个简单的可验证奖励示例。</em></figcaption></figure>

我不想在这里过多地陷入技术细节，因为我希望在这篇年度回顾文章中涵盖其他方面。而且，关于推理大语言模型和RLVR，可以写出整篇文章或整本书。例如，如果你有兴趣了解更多，可以查看我之前的文章：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!QwUc!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6ebc5c9-461f-4d3a-889b-b8ea4e14e5ba_1600x830.png">![理解推理大语言模型](https://substackcdn.com/image/fetch/$s_!QwUc!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6ebc5c9-461f-4d3a-889b-b8ea4e14e5ba_1600x830.png)

](https://magazine.sebastianraschka.com/p/understanding-reasoning-llms)

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!pmzH!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png">![用于大语言模型推理的强化学习现状](https://substackcdn.com/image/fetch/$s_!pmzH!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c02ecf0-cb1d-4f62-a160-6d07636b99fd_1600x1384.png)

](https://magazine.sebastianraschka.com/p/the-state-of-llm-reasoning-model-training)

​总而言之，今年的关键要点是，大语言模型的发展基本上被使用RLVR和GRPO的推理模型所主导。

​实际上，每个主要的开放权重或专有大语言模型开发者，在DeepSeek R1之后都发布了其模型的推理（通常称为“思考”）变体。

如果我要简洁地总结每年大语言模型的发展重点，除了扩展架构和预训练计算量之外，我的列表会是这样的：

-   **2022年 RLHF + PPO**

-   **2023年 LoRA SFT**

-   **2024年 中间训练**

-   **2025年 RLVR + GRPO**

预训练仍然是所有工作的必要基础。除此之外，RLHF（通过PPO算法）当然是在2022年首次为我们带来原始ChatGPT模型的技术。

在2023年，很多关注点都集中在LoRA和类似LoRA的参数高效微调技术上，用于训练小型定制大语言模型。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!GlDd!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!GlDd!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 424w, https://substackcdn.com/image/fetch/$s_!GlDd!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 848w, https://substackcdn.com/image/fetch/$s_!GlDd!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 1272w, https://substackcdn.com/image/fetch/$s_!GlDd!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!GlDd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png" width="1456" height="524" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:524,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!GlDd!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 424w, https://substackcdn.com/image/fetch/$s_!GlDd!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 848w, https://substackcdn.com/image/fetch/$s_!GlDd!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 1272w, https://substackcdn.com/image/fetch/$s_!GlDd!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23917c54-bf6b-4554-9db7-9b7360b69f11_1600x576.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图6：多年来专有和开源大语言模型开发的部分重点领域。请注意，这是累积性的，意味着RLHF + PPO等技术仍然相关且在使用中，但已不再是讨论最热烈的话题。</em></figcaption></figure>

随后，在2024年，所有主要实验室开始通过聚焦合成数据、优化数据混合、使用领域特定数据以及增加专用的长上下文训练阶段，使其（预）训练流程更加精细化。我在2024年的文章中总结了这些不同方法（当时我将这些技术归类为预训练，因为“中期训练”这个术语尚未出现）：

当时，我将这些视为预训练技术，因为它们使用了相同的预训练算法和目标。如今，这些在通用数据常规预训练之后进行的、更为专门化的预训练阶段，通常被称为“中期训练”（作为常规预训练与后训练之间的桥梁，后训练包括SFT、RLHF以及现在的RLVR）。

那么，你可能会问，接下来会发生什么？

我认为明年我们将看到对RLVR（甚至）更多的关注。目前，RLVR主要应用于数学和代码领域。

下一个合乎逻辑的步骤是，不仅使用最终答案的正确性作为奖励信号，还要在RLVR训练期间评判大语言模型的解释。这在过去多年中已有尝试，研究标签为“过程奖励模型”（PRM）。然而，它尚未取得巨大成功。例如，引用[DeepSeek R1论文](https://arxiv.org/abs/2501.12948)中的内容：

> **4.2. 不成功的尝试**
>
> \[...\] 总之，虽然PRM在重新排序模型生成的前N个响应或辅助引导搜索（Snell等人，2024）方面表现出良好的能力，但在我们的大规模强化学习实验中，其优势相对于引入的额外计算开销而言是有限的。

然而，看看上个月发布、我在上一篇文章[《从DeepSeek V3到V3.2：架构、稀疏注意力与RL更新》](https://magazine.sebastianraschka.com/p/technical-deepseek)中讨论过的DeepSeekMath-V2论文，我认为未来我们会看到更多将“解释评分”作为训练信号的做法。

目前，解释评分的方式涉及使用第二个大语言模型。这引出了我对RLVR的另一个观察：扩展到数学和代码以外的其他领域。

所以，如果你今天问我，2026年和2027年我会看到什么，我会说：

-   **2026年：RLVR扩展与更多推理时扩展**

-   **2027年：持续学习**

除了上述RLVR扩展，我认为2026年将更加关注推理时扩展。推理时扩展意味着我们在训练后，让大语言模型生成答案时投入更多时间和金钱，但这会带来显著效果。

推理扩展并非全新范式，LLM平台已在底层运用某些技术。这是在延迟、成本和响应准确性之间的权衡。然而，在准确性比延迟和成本更重要的特定应用中，极端推理扩展完全值得。例如，正如近期[DeepSeekV2-Math论文](https://arxiv.org/html/2511.22570v1)所示，它将模型在数学竞赛基准上的表现推至金牌水平。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!OUnU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!OUnU!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 424w, https://substackcdn.com/image/fetch/$s_!OUnU!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 848w, https://substackcdn.com/image/fetch/$s_!OUnU!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!OUnU!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!OUnU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg" width="1456" height="892" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:892,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!OUnU!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 424w, https://substackcdn.com/image/fetch/$s_!OUnU!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 848w, https://substackcdn.com/image/fetch/$s_!OUnU!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!OUnU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8d671b5e-667d-4464-8c30-8ca1b15967e3_1600x980.jpeg 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图7：两种推理时扩展方法的结合：自一致性（self-consistency）与自我精炼（self-refinement）。额外的自我精炼迭代提升了准确性。该注释图来自</span><a href="https://arxiv.org/html/2511.22570v1">DeepSeekMath-V2论文</a><span>。自一致性与自我精炼在我所著的</span><a href="https://mng.bz/Nwr7">《构建推理模型（从零开始）》</a><span>一书的第4章和第5章中有详细阐述。</span></em></figcaption></figure>

今年，同事们之间也频繁讨论持续学习。简而言之，持续学习是指在不从头重新训练模型的情况下，用新数据或新知识对模型进行训练。

这并非新概念，我很好奇为何今年它被如此频繁地提及，因为目前持续学习领域尚未出现任何重大突破。持续学习面临的挑战是灾难性遗忘（正如持续预训练实验所示，学习新知识意味着LLM会在一定程度上遗忘旧知识）。

尽管如此，既然这似乎是一个热门话题，我预计未来几年将在最小化灾难性遗忘方面取得更多进展，并使持续学习方法的开发成为一项重要发展。

近年来，在昂贵的LLM时代，学术研究面临一些挑战。当然，那些成为主流并成为LLM进步与突破关键支柱的重要发现，仍然可以在学术界（尽管预算较少，或正因为预算较少）中产生。

近年来，流行的例子包括LoRA（[LoRA：大型语言模型的低秩适应](https://arxiv.org/abs/2106.09685)，2021年）及相关参数高效微调方法。

另一个是DPO（[直接偏好优化：你的语言模型其实是一个奖励模型](https://arxiv.org/abs/2305.18290)）及相关方法，作为基于人类反馈的强化学习的替代方案，无需奖励模型即可实现对齐。

在我关注的圈子里，今年的研究亮点是GRPO。尽管它是在DeepSeek R1论文中提出的，而非源自学术界，但它仍然让研究者们度过了激动人心的一年：RLVR和GRPO在概念上都很有趣，并且根据规模不同，实验成本并非高得令人望而却步。

因此，今年我在LLM研究文献中看到了许多对GRPO的数学改进（来自公司和学术研究者），这些改进后来被应用于最先进LLM的训练流程中。例如，一些改进包括：

**[Olmo 3](https://arxiv.org/abs/2512.13961)：**

-   零梯度信号过滤（DAPO，[Yu等人，2025](https://arxiv.org/abs/2503.14476)）

-   主动采样（DAPO，[Yu等人，2025](https://arxiv.org/abs/2503.14476)）

-   令牌级损失（DAPO，[Yu等人，2025](https://arxiv.org/abs/2503.14476)）

-   无KL损失（DAPO，[Yu等人，2025](https://arxiv.org/abs/2503.14476) 和 Dr. GRPO，[Liu等人，2025](https://arxiv.org/abs/2503.20783)）

-   更高裁剪（DAPO，[Yu 等人，2025](https://arxiv.org/abs/2503.14476)）

-   截断重要性采样（[Yao 等人，2025](https://fengyao.notion.site/off-policy-rl)）

-   无标准差归一化（Dr. GRPO，[Liu 等人，2025](https://arxiv.org/abs/2503.20783)）

**[DeepSeek V3.2](https://arxiv.org/abs/2512.02556)：**

-   使用领域特定 KL 强度进行 KL 调优（数学领域为零）

-   重加权 KL

-   离策略序列掩码

-   保留 top-p / top-k 的采样掩码

-   保留原始 GRPO 优势归一化

我可以确认，这些 GRPO 技巧或修改在实践中影响巨大。例如，在应用其中部分或多项修改后，不良更新不再破坏我的训练过程，我也不再需要定期重新加载检查点。

即使在非常短的运行中，我也观察到采用这些技巧带来了显著提升：

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!9MeZ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!9MeZ!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 424w, https://substackcdn.com/image/fetch/$s_!9MeZ!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 848w, https://substackcdn.com/image/fetch/$s_!9MeZ!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 1272w, https://substackcdn.com/image/fetch/$s_!9MeZ!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!9MeZ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png" width="1456" height="421" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:421,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!9MeZ!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 424w, https://substackcdn.com/image/fetch/$s_!9MeZ!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 848w, https://substackcdn.com/image/fetch/$s_!9MeZ!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 1272w, https://substackcdn.com/image/fetch/$s_!9MeZ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d86dee8-3feb-42d7-9c8c-032338ff8ea3_1600x463.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图 10：我从零开始的 GRPO 训练代码结果的小片段，该代码可在 </span><a href="https://github.com/rasbt/reasoning-from-scratch/tree/main/ch06/02_rlvr_grpo_scripts_original">GitHub 上获取</a></em></figcaption></figure>

总之，我的 [构建推理模型（从零开始）](https://github.com/rasbt/reasoning-from-scratch) 仓库中有一个基础的 [GRPO 脚本](https://github.com/rasbt/reasoning-from-scratch/tree/main/ch06/02_rlvr_grpo_scripts_intro)，如果你想尝试一下的话。（我很快会添加更多带有相应修改的消融研究。）

在 LLM 架构方面，最先进的模型仍然使用经典的解码器风格 Transformer。然而，今年，开放权重的 LLM 或多或少地趋向于使用混合专家（MoE）层，以及至少一种“效率调整”的注意力机制：分组查询注意力、滑动窗口注意力或多头潜在注意力。

除了这些相当标准的 LLM 架构之外，我们还看到了更激进的效率调整，针对注意力机制以随序列长度线性扩展。例如，Qwen3-Next 和 Kimi Linear 中的 Gated DeltaNets，以及 NVIDIA 的 Nemotron 3 中的 Mamba-2 层。

总之，我不想在这里深入细节，因为如果你想了解更多，我有一篇最近更新的 13000 字文章专门介绍这些架构：[大型 LLM 架构比较](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison)。

我的预测是，我们至少还会继续使用 Transformer 架构几年，至少在达到最先进建模性能方面是这样。

与此同时，我确实认为我们会看到越来越多像 Gated DeltaNet 和 Mamba 层这样的效率和工程调整，因为在 LLM 训练、部署和使用的规模下，从财务角度来看，这些调整对这些公司来说是有意义的，它们仍在 LLM 服务上投入大量资金。

这并不意味着没有其他替代方案。正如我在 [超越标准 LLM](https://magazine.sebastianraschka.com/p/beyond-standard-llms) 中所写的，例如，文本扩散模型是一种有趣的方法。目前，它们属于实验性研究模型，但 [Google 分享](https://deepmind.google/models/gemini-diffusion) 说他们将发布一个 Gemini 扩散模型。它在建模质量上不会与最先进的产品竞争，但会非常快，并且对低延迟要求的任务（例如代码补全）很有吸引力。

另外，两周前，开放权重的 [LLaDA 2.0 模型发布了](https://github.com/inclusionAI/LLaDA2.0)。其中最大的模型拥有 1000 亿参数，是迄今为止最大的文本扩散模型，性能与 Qwen3 300 亿参数模型相当。（是的，它并未全面推动最前沿技术，但在扩散模型领域仍是一次值得关注的发布。）

通过扩展训练数据和架构来改进大语言模型，是一条（至今依然）行之有效的既定公式。然而，尤其是在今年，它已不再是“唯一”的充分方案。

我们在 2025 年 2 月发布的 GPT 4.5 上就看到了这一点。据传，GPT 4.5 比 GPT 4（以及后来发布的 GPT 5）要大得多，而单纯依靠规模扩展通常并非最明智的前进方向。GPT 4.5 的能力可能优于 GPT 4，但其增加的训练预算被认为“性价比不高”。

相反，更好的训练流程（更注重训练中期和后期）以及推理扩展，才是今年推动进步的主要动力。

例如，如前所述，在谈到达到金牌级别数学性能的 DeepSeekMath-V2 时，推理扩展是我们可用来让大语言模型按需解决极其复杂任务的杠杆之一（GPT Heavy Thinking 或 Pro 是其他例子；由于高延迟和成本，并非所有任务都适合使用这些模式，但在某些场景下，例如具有挑战性的数学或编程问题，这种高强度的推理扩展就很有意义。）

另一项重大改进来自将工具使用纳入训练考量的大语言模型。如你所知，幻觉是大语言模型最大的问题之一。可以说，幻觉率在不断改善，我认为这很大程度上归功于上述工具使用。例如，当被问及 1998 年世界杯冠军是谁时，大语言模型无需死记硬背，而是可以通过工具使用调用传统搜索引擎，从该主题的可靠网站（例如，在此案例中，就是国际足联官方网站）上选择并抓取这一信息。数学问题、使用计算器 API 等也是如此。

例如，OpenAI 的 gpt-oss 模型是今年较早发布的、专门为工具使用而开发的开放权重模型之一。

不幸的是，开源生态系统尚未完全跟上这一步伐，许多（即便不是大多数）工具仍然默认以非工具使用模式运行这些大语言模型。原因之一是，这是一种较新的、不断发展的范式，相关工具需要相应调整。另一个原因是，由于安全问题，这是一个更难解决的问题（给予大语言模型不受限制的工具使用权限，可能会带来安全风险，或对你的系统造成其他类型的破坏。我认为，始终要问的一个明智问题是：你会信任一个新实习生，给予他如此大的系统访问权限吗？）

我确实认为，在未来几年，当本地使用大语言模型时，启用和允许工具使用将变得越来越普遍。

如果要用一个词或趋势来概括今年大语言模型的发展，那就是“刷榜优化”（benchmaxxing）。

这里，“刷榜优化”指的是过度关注提升排行榜分数，有时甚至到了把基准测试表现本身当作目标，而非衡量通用能力的代理指标的程度。

一个典型的例子是 Llama 4，它在许多现有基准测试中得分极高。然而，当用户和开发者真正上手使用后，才发现这些分数并不能反映其真实能力和实用性。

俗话说得好，如果测试集是公开的，那它就不是真正的测试集。而如今的问题是，测试集数据不仅（有意或无意地）被纳入训练语料，还常常在大语言模型开发过程中被直接优化。

过去，即使公开测试集上的基准分数存在虚高，至少模型的排名顺序还是可信的。例如，下图来自 2019 年的论文《Do ImageNet Classifiers Generalize to ImageNet?》（https://arxiv.org/abs/1902.10811）中的标注图。

在大语言模型开发中，这种情况已经发展到基准分数不再能可靠反映模型性能的程度。

不过，我仍然认为基准测试是大语言模型必须跨越的必要门槛。也就是说，如果我发现某个大语言模型在基准 Y 上的得分低于 X，我就知道它不是一个好模型。但如果它在基准 Y 上的得分高于 X，这并不意味着它比另一个同样在基准 Y 上得分高于 X 的模型好多少。

另一个需要考虑的方面是，图像分类器只有一项任务，即图像分类。而大语言模型则用于许多不同的任务：翻译文本、总结文本、编写代码、头脑风暴、解决数学问题等等。评估图像分类器时，有明确的指标（如分类准确率），这比评估大语言模型在确定性和自由形式任务上的表现要简单得多。

除了在实践中试用大语言模型并不断生成新的基准测试外，遗憾的是，目前没有解决这个问题的办法。

顺便提一下，如果你有兴趣了解更多关于大语言模型评估的主要类别，你可能会喜欢我的文章《理解大语言模型评估的 4 种主要方法（从零开始）》：

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!c7Za!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1748fa24-e946-47fb-bf1b-e488d08547fd_1764x1244.png">![理解大语言模型评估的 4 种主要方法（从零开始）](https://substackcdn.com/image/fetch/$s_!c7Za!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1748fa24-e946-47fb-bf1b-e488d08547fd_1764x1244.png)

](https://magazine.sebastianraschka.com/p/llm-evaluation-4-approaches)

由于这个问题经常被提及，我想分享一些关于大语言模型在某些任务（甚至工作）上取代人类的个人看法。

从宏观层面看，我认为大语言模型是赋予某些职业人士“超能力”的工具。我的意思是，如果使用得当，大语言模型可以显著提高个人的工作效率，并减少日常工作中的许多摩擦。这既包括相对平凡的任务，比如确保章节标题的大小写格式一致，也包括在大型代码库中发现复杂的错误。

如今，我仍然亲自编写自己在意的大部分代码。所谓"在意"，是指那些我需要理解代码逻辑并确保其正确性的场景。例如，在搭建大语言模型训练脚本时，我会亲手实现并仔细审查训练逻辑。这样做一是为了确保代码按预期运行，二是为了保持我在这个任务上的知识储备和专业能力。不过，我现在会借助大语言模型来补充周边更常规的代码，比如添加命令行参数解析的样板代码，这样就能更方便地从命令行调用自己的程序。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!7w1V!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!7w1V!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 424w, https://substackcdn.com/image/fetch/$s_!7w1V!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 848w, https://substackcdn.com/image/fetch/$s_!7w1V!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 1272w, https://substackcdn.com/image/fetch/$s_!7w1V!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!7w1V!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png" width="621" height="1035" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1600,&quot;width&quot;:960,&quot;resizeWidth&quot;:621,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!7w1V!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 424w, https://substackcdn.com/image/fetch/$s_!7w1V!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 848w, https://substackcdn.com/image/fetch/$s_!7w1V!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 1272w, https://substackcdn.com/image/fetch/$s_!7w1V!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F59b0b5ba-c041-4e07-a354-f748113b85ea_960x1600.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图14：使用提示词"为training-script.py添加所有超参数选项的命令行参数"为训练脚本添加命令行参数的示例。</em></figcaption></figure>

但我也越来越依赖大语言模型来发现问题、提出改进建议或验证想法。与此同时，我希望理解自己正在构建的内容，并且作为个人目标，我希望深化自己的知识和技能，持续提升专业能力。

同时，大语言模型在我核心专业领域之外的任务中极具价值。它们让我能够自动化那些原本没有时间或精力去处理的事情。一个例子是我最近编写的一个工具，用于将我的Substack文章提取并备份为Markdown格式。（我通常用Markdown起草内容，但经常直接在Substack编辑器中编辑和扩展文章，因此本地草稿并不总是最新的）。大语言模型还帮我清理了个人网站的CSS，这些CSS多年来积累了大量的重复和不一致之处。今年还有许多类似的案例，我都借助了大语言模型。

简而言之，我认为关键在于识别何时该用、何时不该用大语言模型。以及如何以有助于提升专业能力且令人满意的方式使用它们。

大语言模型在编写代码方面变得更出色了，但尽管听到一些人说代码会变得短暂或过时，我并不这么认为。大语言模型赋予了人们超能力，能够生成某些原本需要大量精力才能完成的编程项目。

然而，纯粹由大语言模型生成的代码库并不能取代专家精心编写的代码库。这些专家代码库甚至可能由人类程序员借助大语言模型创建。但关键在于，某个领域的专家投入了大量时间和精力来创建、测试和完善它。其他人要复制它需要付出大量工作，那么既然它已经存在，为什么不直接采用呢？

简而言之，我认为一位精通良好设计模式与权衡、并在职业生涯中研究、观察并构建过众多平台的全栈开发专家，能够比一个随机向大语言模型（LLM）提问的人构建出更好的平台。

令人惊叹的是，如今一个普通人也能构建平台，即便它并非最佳。然而，使用并提示LLM只能让这个人走到一定地步，平台的质量可能会停滞不前。因此，如果这个人真心希望改进平台，那么深入下去，学习他人如何构建平台，再带着更多知识回来，更有效地利用LLM来指导和优化平台设计，将是一个好主意。

与编程类似，我不认为LLM会让技术写作过时。撰写一本优秀的技术书籍需要数千小时，并且对主题有深入的熟悉。这个过程可能涉及LLM来提升清晰度、检查技术准确性、探索替代方案或进行小型实验，但核心工作仍然依赖于人类的判断和专业知识。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!IxSY!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!IxSY!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 424w, https://substackcdn.com/image/fetch/$s_!IxSY!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 848w, https://substackcdn.com/image/fetch/$s_!IxSY!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 1272w, https://substackcdn.com/image/fetch/$s_!IxSY!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!IxSY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/dedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:null,&quot;width&quot;:null,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!IxSY!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 424w, https://substackcdn.com/image/fetch/$s_!IxSY!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 848w, https://substackcdn.com/image/fetch/$s_!IxSY!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 1272w, https://substackcdn.com/image/fetch/$s_!IxSY!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdedc255c-7eef-4367-a908-c2d6d7f0b0e1_1067x1600.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图15：一个非摆拍的例子，LLM帮助我找到并修复了之前文章中的一个错误。</em></figcaption></figure>

是的，LLM可以让技术书籍变得更好。它们可以帮助作者发现错误、扩展参考文献，并总体上减少在琐碎任务上花费的时间。这为真正需要创造力和经验的深度工作腾出了更多时间。

从读者的角度来看，我也不认为LLM会取代技术写作。使用LLM学习一个主题，对于快速提问和初级水平的解释来说效果不错。然而，当你想要建立更深层次的理解时，这种方法很快就会变得混乱。

此时，与其自己花费数小时试图从LLM的回答中筛选信息（而你正在学习但尚未成为专家的主题），通常更明智的做法是遵循由专家设计的结构化学习路径。（专家可能使用也可能没有使用LLM。）

当然，在参加课程或从书籍中学习时，使用LLM来澄清疑问或探索旁支路径仍然完全合理。用它来设计测验或练习以巩固知识也很棒。

总体而言，我认为LLM对作者和读者来说都是净收益。

但我也认为，关键在于学会识别何时该用LLM、何时不该用。例如，主要缺点是，当主题变得困难时，很容易立即求助于LLM，因为先自己努力解决问题往往能带来更扎实的学习效果。

我对研究的看法也大致如此。大型语言模型在查找相关文献、发现数学符号中的问题以及建议后续实验方面非常有用。但让人类研究者掌握主导权，依然合情合理。

或许这里的原则大致如下：

-   如果这篇（研究）文章或这本书完全由人类生成，那么它本有可能得到进一步改进。
-   而如果这篇（研究）文章或这本书仅靠向大型语言模型输入提示就能生成，那么它很可能不够新颖和/或不够深入。

大型语言模型仍然相当新颖，且仍在不断发展。我认为，过度使用它们还有一个较少被讨论的弊端。例如，如果模型包揽了所有具体工作，而人类主要负责监督，那么工作可能会开始变得空洞。

当然，有些人确实享受专注于管理系统和编排工作流程，这是一种完全合理的偏好。但对于那些享受做事本身的人来说，我认为这种工作模式可能会加速职业倦怠。（对于那些因为有了大型语言模型而期望更快产出更多成果的公司来说，这一点可能尤其如此。）

与一个难题苦苦斗争，最终看到它成功解决，这其中有一种特殊的满足感。当大型语言模型一次就给出解决方案时，我得不到同样的感觉。我想这类似于烹饪（这只是我临时想到的比喻，而且我厨艺不精）。如果你喜欢做披萨，使用现成的面团，只负责添加配料，这很可能剥夺了大部分乐趣，烹饪就变成了达到目的的手段。这未必是坏事，但如果你每天长时间从事这项工作，持续数月或数年，我可以想象这会让人感到空虚，并最终导致职业倦怠。

所以，从一个自私的角度来看，写代码也比读代码更有趣。你可能也同意，创建拉取请求通常比审查它们更有趣（当然，这并非对所有人都适用）。

也许，一个关于如何以可持续的方式使用人工智能的、理想化（但不完美）的类比是国际象棋。

国际象棋引擎在几十年前就超越了人类棋手，然而人类参与的职业国际象棋依然活跃且蓬勃发展。我不是国际象棋专家，但我认为这项运动甚至可能因此变得更加丰富和有趣。

根据我所听到的（例如，基于卡斯帕罗夫的《深度思考》一书以及包含马格努斯·卡尔森访谈的播客），现代棋手一直在利用人工智能探索不同的想法，挑战自己的直觉，并以以往根本无法达到的深度分析错误。

我认为，这是一个有用的模型，可以帮助我们思考如何将人工智能应用于其他形式的智力工作中。如果运用得当，人工智能可以加速学习，并拓展一个人能够合理承担的工作范围。我认为我们应该更多地将其视为合作伙伴，而非替代品。

但我同样认为，如果AI被完全用于外包思考和编码，可能会削弱学习动力和长期技能发展。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!wCE7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!wCE7!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 424w, https://substackcdn.com/image/fetch/$s_!wCE7!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 848w, https://substackcdn.com/image/fetch/$s_!wCE7!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 1272w, https://substackcdn.com/image/fetch/$s_!wCE7!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!wCE7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png" width="584" height="357.7802197802198" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:892,&quot;width&quot;:1456,&quot;resizeWidth&quot;:584,&quot;bytes&quot;:null,&quot;alt&quot;:&quot;&quot;,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" title="" srcset="https://substackcdn.com/image/fetch/$s_!wCE7!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 424w, https://substackcdn.com/image/fetch/$s_!wCE7!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 848w, https://substackcdn.com/image/fetch/$s_!wCE7!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 1272w, https://substackcdn.com/image/fetch/$s_!wCE7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01f101ad-9526-4fc5-9ed9-7de240179289_1688x1034.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图16：LLM降低了入门门槛，并提高了程序员（无论是新手还是专家）的生产力。然而，在2025年即将结束之际，我认为投资成为专家仍然值得，因为这样你能从LLM中获得更多收益，并交付更出色的成果。</figcaption></figure>

LLM在通用编程、知识问答和写作方面的能力持续提升。这在很大程度上是成立的，因为得益于训练流程和范式（例如RLVR）的改进，以及推理扩展和工具使用的优化，规模化仍然能带来正向的投资回报。

​

然而，这将在某个节点开始趋于平稳（类似于我们从GPT-4到GPT-4.5发展过程中所看到的情况），除非我们不断发明新的训练方法和/或架构（目前，还没有人知道这些方法或架构可能是什么样子）。

LLM目前能够解决大量通用任务和相对容易的“低垂果实”。但要让它们深入扎根于某些行业，则需要更多的领域专业化。我认为LLM提供商非常希望获得高质量、特定领域的数据。就目前而言，这似乎将是一个挑战。

例如，大多数被接触的公司似乎都拒绝了此类交易，正是因为这些数据是专有的，并且是其业务差异化的核心。（我从多个渠道听到了这一说法，此外还有一篇[《The Information》的文章](https://www.theinformation.com/articles/openai-anthropic-discuss-data-deals-biotech-companies)也讨论了这一话题。）

​在我看来，这完全合理。我认为，将有朝一日可能为公司带来优势的宝贵专有数据出售给OpenAI或Anthropic，可能有些目光短浅。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!7EYB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!7EYB!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 424w, https://substackcdn.com/image/fetch/$s_!7EYB!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 848w, https://substackcdn.com/image/fetch/$s_!7EYB!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 1272w, https://substackcdn.com/image/fetch/$s_!7EYB!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!7EYB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png" width="1456" height="657" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/a6d20218-9621-43c5-885b-deae884c60af_1648x744.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:657,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!7EYB!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 424w, https://substackcdn.com/image/fetch/$s_!7EYB!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 848w, https://substackcdn.com/image/fetch/$s_!7EYB!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 1272w, https://substackcdn.com/image/fetch/$s_!7EYB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa6d20218-9621-43c5-885b-deae884c60af_1648x744.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em>图17：示例展示了可能对训练领域特定LLM有用的行业和数据类型，但将此类数据对外出售会令人担忧。（我不是法律专家，这也不构成法律建议，但我可以想象，如果这是一个纯粹的本地LLM，不离开公司的安全服务器，那么在患者健康数据上训练模型，与开发其他处理该患者健康数据的内部软件并无区别。）</em></figcaption></figure>

目前，LLM的开发成本高昂且规模化挑战巨大，这就是为什么只有少数大公司能开发出最先进的LLM。然而，我认为LLM开发正日益商品化，因为LLM开发者经常在雇主之间流动，最终会被更大的金融机构、生物技术公司以及其他有预算的公司聘用，利用其私有数据开发具有竞争力的内部LLM。

这些大语言模型甚至不需要完全从头训练；像 DeepSeek V3.2、Kimi K2 和 GLM 4.7 等许多最先进的 LLM 已经发布，可以进行适配和进一步的后训练。

你可能会好奇我今年在忙什么。我的精力几乎全部投入到了与 LLM 相关的工作中。去年，我决定独立创业，成立自己的公司，主要是为了能有更多时间从事自己的研究、写书、运营 Substack 以及进行行业合作。

作为一名独立研究员，咨询项目是维持这种模式可持续性的重要组成部分。这包括日常开销（从食品杂货到健康保险），也包括一些不那么显性的成本，比如用于实验的云计算资源。

随着时间的推移，我的目标是进一步减少咨询工作，将更多时间投入到长篇研究和写作中，尤其是我在 Substack 上分享的那些技术深度解析文章。

我很幸运，许多公司都向我提供了全职岗位的机会——如果独立发展这条路走不通，这会是可行的备选方案——但就目前而言，我计划继续保持独立。

如果你觉得我的工作有价值，并且条件允许的话，订阅我的 Substack 或购买我的书籍，确实能帮助这种工作模式持续下去，我对此深表感激。

今年我个人最大的亮点之一，就是我的书《[从零开始构建大语言模型](https://amzn.to/4fqvn0D)》收到了大量积极反馈。我收到了来自世界各地公司和大学的读者发来的许多深思熟虑的留言。

这些反馈涵盖了广泛的应用场景：有大学教授将这本书作为主要教材来讲解 LLM 的工作原理，有前学生用它来准备面试并成功获得新职位，还有工程师将其作为在生产环境中实现定制 LLM 的跳板。

我还很兴奋地得知，这本书目前已被翻译成至少九种语言。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!zoqK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!zoqK!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 424w, https://substackcdn.com/image/fetch/$s_!zoqK!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 848w, https://substackcdn.com/image/fetch/$s_!zoqK!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 1272w, https://substackcdn.com/image/fetch/$s_!zoqK!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!zoqK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png" width="668" height="513.8461538461538" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/d4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1120,&quot;width&quot;:1456,&quot;resizeWidth&quot;:668,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!zoqK!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 424w, https://substackcdn.com/image/fetch/$s_!zoqK!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 848w, https://substackcdn.com/image/fetch/$s_!zoqK!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 1272w, https://substackcdn.com/image/fetch/$s_!zoqK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd4e5d049-9504-4003-a033-30e8dd9f9814_1600x1231.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图 18：《从零开始构建大语言模型》的不同语言译本。</figcaption></figure>

许多读者还问到，是否会有涵盖更新、更高级主题的第二版。虽然我确实考虑过这件事，但我很谨慎，不想让这本书变得难以入门。例如，用更复杂的变体（如 DeepSeek 某些新模型中使用的多头潜在注意力）来替换标准的多头注意力机制，会显著提高入门门槛。

因此，就目前而言，我更倾向于保持这本书的现有内容，因为它对于想要入门 LLM 的人来说效果非常好。而对于对更高级内容感兴趣的读者，作为补充，我在过去一年里为这本书的 [GitHub 仓库](https://github.com/rasbt/LLMs-from-scratch) 添加了大量额外材料。我计划在未来继续扩充这些内容。

此外，你可能知道，我目前正在撰写续作《[从零开始构建推理模型](https://mng.bz/Nwr7)》。

第一本书《[从零开始构建大型语言模型](https://mng.bz/M96o)》主要关注核心大型语言模型架构和预训练的基础知识。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!x6eg!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!x6eg!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 424w, https://substackcdn.com/image/fetch/$s_!x6eg!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 848w, https://substackcdn.com/image/fetch/$s_!x6eg!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 1272w, https://substackcdn.com/image/fetch/$s_!x6eg!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!x6eg!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png" width="1456" height="1151" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1151,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!x6eg!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 424w, https://substackcdn.com/image/fetch/$s_!x6eg!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 848w, https://substackcdn.com/image/fetch/$s_!x6eg!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 1272w, https://substackcdn.com/image/fetch/$s_!x6eg!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F02d7af11-324a-4489-8768-6c93252024ee_2048x1619.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图20：说明这两本“从零开始”的书籍如何相互关联。</figcaption></figure>

推理模型这本书则从第一本书结束的地方开始。它从一个预训练的基础模型出发，探索了推理时扩展方法和强化学习技术，这些技术专门旨在提升推理能力。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!avvc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!avvc!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 424w, https://substackcdn.com/image/fetch/$s_!avvc!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 848w, https://substackcdn.com/image/fetch/$s_!avvc!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 1272w, https://substackcdn.com/image/fetch/$s_!avvc!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!avvc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png" width="1456" height="1194" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/a903f056-2386-456a-af93-3b6343fcca92_2048x1680.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1194,&quot;width&quot;:1456,&quot;resizeWidth&quot;:null,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!avvc!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 424w, https://substackcdn.com/image/fetch/$s_!avvc!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 848w, https://substackcdn.com/image/fetch/$s_!avvc!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 1272w, https://substackcdn.com/image/fetch/$s_!avvc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa903f056-2386-456a-af93-3b6343fcca92_2048x1680.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption><em><span>图21：《从零开始构建推理模型》的节选，该书已在</span><a href="https://mng.bz/Nwr7">早期访问</a><span>中提供。</span></em></figcaption></figure>

除了这个Substack，我还在努力撰写推理模型这本书，从很多方面来看，我认为这是我迄今为止构思最周密、最精良的一本书。

目前，我估计每章大约花费75到120小时。如果你好奇的话，我估计通常的时间分配如下：

-   3-5小时：头脑风暴和修订主题选择

-   5-10小时：构建内容结构

-   20小时：编写初始代码

-   10-20小时：运行额外实验并阅读最新文献以获取更多见解

-   10-20小时：制作图表

-   10小时：撰写初稿文本

-   10-20小时：重写和润色章节

-   5-10小时：制作练习题并运行实验

-   2-5小时：整合编辑和读者的建议

目前，我正在进行第6章的一半工作，该章实现了用于训练推理模型的可验证奖励强化学习（GRPO）代码。

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!2TLW!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!2TLW!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 424w, https://substackcdn.com/image/fetch/$s_!2TLW!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 848w, https://substackcdn.com/image/fetch/$s_!2TLW!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 1272w, https://substackcdn.com/image/fetch/$s_!2TLW!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!2TLW!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png" width="677" height="480.7815934065934" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:1034,&quot;width&quot;:1456,&quot;resizeWidth&quot;:677,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!2TLW!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 424w, https://substackcdn.com/image/fetch/$s_!2TLW!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 848w, https://substackcdn.com/image/fetch/$s_!2TLW!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 1272w, https://substackcdn.com/image/fetch/$s_!2TLW!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15ffa69f-f8ac-43e9-a106-629707d373ab_1622x1152.png 1456w" sizes="100vw" loading="lazy"></picture></div></a><figcaption>图22：第6章和第7章关于可验证奖励强化学习实验的早期结果。</figcaption></figure>

《[从零开始构建推理模型](https://mng.bz/Nwr7)》是一项非常艰巨的工作，但我非常享受其中！我希望你和其他读者会像喜欢《从零开始构建大型语言模型》一样觉得它有用。

我想以一些主要收获来结束这篇文章，重点是我个人觉得有些意外的事情，以及我对2026年的预测。

让我们从2025年的意外开始说起。如果你在2024年提前一年问我，我可能不会预料到这些发展：

1.  多个推理模型已在主要数学竞赛中达到[金牌水平](https://www.nature.com/articles/d41586-025-02343-x)（OpenAI 的未命名模型、[Gemini Deep Think](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/) 以及开源权重模型 [DeepSeekMath-V2](https://arxiv.org/html/2511.22570v1)）。总体而言，我对这一进展并不意外，但令我惊讶的是，这发生在 2025 年，而非 2026 年。

2.  Llama 4（或整个 Llama 系列）在开源权重社区中几乎完全失宠，而 Qwen 在受欢迎程度上已超越 Llama（根据 [Nathan Lambert](https://open.substack.com/users/10472909-nathan-lambert?utm_source=mentions) 的 [ATOM 项目](https://www.atomproject.ai/)报告的下载量和衍生模型数量衡量）。

3.  Mistral AI 在其 2025 年 12 月发布的最新旗舰模型 Mistral 3 中[采用了 DeepSeek V3 架构](https://magazine.sebastianraschka.com/i/168650848/mistral)。

4.  除 Qwen3 和 DeepSeek R1/V3.2 外，开源权重顶尖模型的竞赛中还涌现出众多其他竞争者，包括 Kimi、GLM、MiniMax 和 Yi。

5.  更廉价、高效的混合架构正成为领先实验室的更高优先级（如 [Qwen3-Next](https://magazine.sebastianraschka.com/i/168650848/qwen-next)、[Kimi Linear](https://magazine.sebastianraschka.com/i/168650848/kimi-linear)、[Nemotron 3](https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison)），而非由独立实验室分别开发。

6.  OpenAI 发布了一个开源权重模型（gpt-oss，我今年早些时候为此撰写了[一篇独立文章](https://magazine.sebastianraschka.com/p/from-gpt-2-to-gpt-oss-analyzing-the)）。

7.  [MCP](https://modelcontextprotocol.io/docs/getting-started/intro)（[加入 Linux 基金会](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)）已成为（目前）智能体式 LLM 系统中工具和数据访问的标准；我原本预计 2025 年该生态系统仍将保持碎片化，至少持续到 2026 年。

1.  我们很可能会看到面向行业规模、面向消费者的扩散模型，用于廉价、可靠、低延迟的推理，其中 Gemini Diffusion 可能率先推出。

2.  开源权重社区将缓慢但稳步地采用具备本地工具使用和日益增强的智能体能力的 LLM。

3.  RLVR 将更广泛地扩展到数学和编码之外的其他领域（例如化学、生物学等）。

4.  经典的 RAG 将逐渐淡出作为文档查询的默认解决方案。开发者将不再对每个文档相关查询都使用检索，而是更多地依赖更好的长上下文处理能力，尤其是随着更好的“小型”开源权重模型的出现。

5.  大量 LLM 基准测试和性能提升将来自改进的工具和推理时扩展，而非训练或核心模型本身。看起来 LLM 正在变得更好，但这主要是因为周边应用在改进。同时，开发者将更注重降低延迟，并使推理模型在非必要情况下减少推理 token 数量。别误会我的意思，2026 年将进一步推动技术前沿，但今年进步的更大比例将来自推理方面，而非纯粹的训练方面。

总结一下，我认为 2025 年有一个元教训：LLM 的进步并非依赖单一突破，而是通过多个独立杠杆在多个方面同时改进。这包括架构调整、数据质量提升、推理训练、推理扩展、工具调用等。

与此同时，评估仍然困难，基准测试并不完美，对何时以及如何使用这些系统做出良好判断仍然至关重要。

我对2026年的期望是，我们能够继续看到有趣的进步，同时也能理解这些进步从何而来。这既需要更好、更一致的基准测试，当然也需要透明度。

感谢你的阅读，也感谢这一年里在评论区以及从Substack Notes到GitHub等各个平台上所有深思熟虑的反馈和讨论。

那些积极的反馈和深入的交流，确实激励着我投入撰写长文所需的时间和精力，并持续深入钻研LLM的研究与实现细节。我从这些交流中学到了很多，希望你也一样。

我非常期待在2026年这个领域持续演进的过程中，继续这些对话！

此致，
Sebastian

<figure><a target="_blank" href="https://substackcdn.com/image/fetch/$s_!NNUi!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg" data-component-name="Image2ToDOM"><div><picture><source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!NNUi!,w_424,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 424w, https://substackcdn.com/image/fetch/$s_!NNUi!,w_848,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 848w, https://substackcdn.com/image/fetch/$s_!NNUi!,w_1272,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!NNUi!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 1456w" sizes="100vw"><img src="https://substackcdn.com/image/fetch/$s_!NNUi!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg" width="414" height="275.81043956043953" data-attrs="{&quot;src&quot;:&quot;https://substack-post-media.s3.amazonaws.com/public/images/8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg&quot;,&quot;srcNoWatermark&quot;:null,&quot;fullscreen&quot;:null,&quot;imageSize&quot;:null,&quot;height&quot;:970,&quot;width&quot;:1456,&quot;resizeWidth&quot;:414,&quot;bytes&quot;:null,&quot;alt&quot;:null,&quot;title&quot;:null,&quot;type&quot;:null,&quot;href&quot;:null,&quot;belowTheFold&quot;:true,&quot;topImage&quot;:false,&quot;internalRedirect&quot;:null,&quot;isProcessing&quot;:false,&quot;align&quot;:null,&quot;offset&quot;:false}" alt="" srcset="https://substackcdn.com/image/fetch/$s_!NNUi!,w_424,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 424w, https://substackcdn.com/image/fetch/$s_!NNUi!,w_848,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 848w, https://substackcdn.com/image/fetch/$s_!NNUi!,w_1272,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 1272w, https://substackcdn.com/image/fetch/$s_!NNUi!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8480ea33-a65e-4e81-8359-4a17d9c7aaf1_2048x1364.jpeg 1456w" sizes="100vw" loading="lazy"></picture></div></a></figure>

今年六月，我向支持本Substack的付费订阅者分享了一篇附赠文章，其中包含我精心整理并收藏的研究论文列表。

[

<source type="image/webp" srcset="https://substackcdn.com/image/fetch/$s_!cRyQ!,w_140,h_140,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e920533-c926-461b-95bb-c7446f3df382_1289x619.png">![LLM研究论文：2025年列表（一月至六月）](https://substackcdn.com/image/fetch/$s_!cRyQ!,w_140,h_140,c_fill,f_auto,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4e920533-c926-461b-95bb-c7446f3df382_1289x619.png)

](https://magazine.sebastianraschka.com/p/llm-research-papers-2025-list-one)

类似地，为了感谢所有友善的支持者，我在下方准备了一份列表，列出了我从2025年7月到12月期间收藏并分类的所有有趣研究文章。我浏览了这些论文的摘要，但只读了其中极小的一部分。不过，我仍然喜欢持续收集这些整理好的列表，因为在从事某个项目时，我经常需要回头查阅其中的一些论文。

然而，考虑到当前这篇文章已经非常冗长，我将这份列表分享在另一篇单独的文章中，链接如下：

非常感谢你订阅我的 *Ahead of AI* 博客，并在今年支持我的工作。我对此深表感激。你的支持切实地让这项工作成为可能，并使我能够继续投入必要的时间去写作、实验和深入思考这些话题！

#### 关于本文的讨论

### 准备好了解更多内容了吗？
