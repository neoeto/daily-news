---
title: DeepSeek Sparse Attention From Scratch
url: >-
  https://sebastianraschka.com/blog/2026/deepseek-sparse-attention-from-scratch.html
url_hash: 94cf94de8efdcc698cce20b318d205bf227ccf94
source: Sebastian Raschka
source_url: 'https://sebastianraschka.com/rss_feed.xml'
date: 2026-05-23T14:00:34.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
original_lang: en
truncated: false
---
我在 LLMs-from-scratch 仓库中新增了一个从零实现的 [DeepSeek 稀疏注意力](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch04/09_dsa) 模块，这要感谢一位优秀读者的贡献。

该文件夹包含 README 文档、独立的 GPT 风格参考实现以及测试文件：

1.  [README.md](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/09_dsa/README.md)
2.  [gpt\_with\_kv\_dsa.py](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/09_dsa/gpt_with_kv_dsa.py)
3.  [test\_dsa.py](https://github.com/rasbt/LLMs-from-scratch/blob/main/ch04/09_dsa/test_dsa.py)

[DeepSeek 稀疏注意力](https://sebastianraschka.com/glossary/#deepseek-sparse-attention "DeepSeek 稀疏注意力") 的核心思想是用学习到的稀疏模式替代固定的稀疏模式。该机制不再仅使用局部窗口，而是通过轻量级的索引器和选择器来决定哪些先前的 token 值得关注。

如需了解更多背景信息，我还准备了本地 [DeepSeek 稀疏注意力概念页面](https://sebastianraschka.com/llms-from-scratch/ch04/15_deepseek_sparse_attention/) 和 [图解说明](https://sebastianraschka.com/llm-architecture-gallery/deepseek-sparse-attention/)，将其与常规的[因果注意力](https://sebastianraschka.com/glossary/#causal-attention "因果注意力")和滑动窗口注意力进行了对比。

<figure><p><a href="https://substack.com/@rasbt/note/c-264003632"><img src="https://sebastianraschka.com/images/blog/2026/deepseek-sparse-attention/hero.webp" alt="DeepSeek 稀疏注意力实现概览" width="1100" height="1428" fetchpriority="high" decoding="async"></a></p><figcaption>来自原始 <a href="https://substack.com/@rasbt/note/c-264003632">Substack 笔记</a>的截图，展示了 DeepSeek 稀疏注意力实现文件夹和 README 概览。</figcaption></figure>

来源：根据我的 [Substack 笔记](https://substack.com/@rasbt/note/c-264003632) 稍作编辑的网站版本。
