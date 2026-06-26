---
title: A data model for Git (and other docs updates)
url: 'https://jvns.ca/blog/2026/01/08/a-data-model-for-git/'
url_hash: 95ab72c792a2ce2bdc47f9d1b50342736093c828
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-01-08T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - Rust
  - 创业
original_lang: en
truncated: false
---
你好！去年秋天，我决定花些时间改进 Git 的文档。长期以来，我一直考虑参与开源文档的工作——通常，如果我觉得某个项目的文档有待改进，我会写一篇博客文章或小册子之类的。但这次我在想：能不能直接对官方文档做一些改进呢？

于是，我和 [Marie](https://marieflanagan.com/) 一起对 Git 文档做了一些修改！

### Git 的数据模型

在文档工作一段时间后，我们注意到 Git 在文档中频繁使用“对象”、“引用”或“索引”这些术语，但并没有很好地解释这些术语的含义，以及它们如何与“提交”和“分支”等核心概念相关联。因此，我们编写了一份新的“数据模型”文档！

你现在可以[在这里阅读数据模型](https://github.com/git/git/blob/master/Documentation/gitdatamodel.adoc)。我猜在某个时间点（也许在下个版本发布后？），它也会出现在 [Git 官网](https://git-scm.com)上。

我对此感到兴奋，因为理解 Git 如何组织其提交和分支数据，多年来一直帮助我理解 Git 的工作原理。我认为拥有一份简短（1600 字！）且准确的数据模型说明非常重要。

“准确”这一点并不容易做到：我了解 Git 数据模型的基本原理，但在审阅过程中，我学到了一些新细节，并不得不做了大量修改（例如合并冲突在暂存区中的存储方式）。

### 更新 `git push`、`git pull` 等命令

我还致力于更新一些 Git 核心手册页的引言部分。我很快意识到，“仅凭我自己的判断来改进”是行不通的：维护者凭什么相信我的版本更好呢？

在讨论开源文档修改时，我经常遇到一个问题：两位软件专家用户会争论某个解释是否清晰（“我觉得用 X 来解释很好！”“嗯，我觉得 Y 更好！”）。

我认为这效率不高（众所周知，软件专家用户很难判断某个解释对非专家是否清晰），所以我需要找到一种更基于证据的方法来识别手册页中的问题。

### 通过测试读者发现问题

我在 Mastodon 上招募了测试读者，请他们阅读当前版本的文档，并告诉我哪些内容令人困惑或他们有什么疑问。大约有 80 位测试读者留下了评论，我学到了很多！

人们提供了大量宝贵的反馈，例如：

-   他们不理解的术语（什么是 pathspec？“reference”是什么意思？“upstream”在 Git 中有特定含义吗？）
-   令人困惑的具体句子
-   建议添加的内容（“我经常做 X，我认为应该包含在这里”）
-   不一致之处（“这里暗示 X 是默认值，但其他地方暗示 Y 是默认值”）

大多数测试读者使用 Git 至少已有 5-10 年，我认为这效果很好——如果一群使用 Git 超过 5 年的测试读者都觉得某个句子或术语难以理解，那就很容易论证文档应该更新以使其更清晰。

我认为这种“让软件用户评论现有文档，然后修复他们发现的问题”的模式效果非常好，我很期待将来可能再次尝试。

### 手册页的改动

我们最终更新了以下 4 个手册页：

-   `git add`（[修改前](https://github.com/git/git/blob/2b3ae040/Documentation/git-add.adoc)，[修改后](https://github.com/git/git/blob/e0bfec3dfc356f7d808eb5ee546a54116b794397/Documentation/git-add.adoc)）
-   `git checkout`（[修改前](https://github.com/git/git/blob/2b3ae040/Documentation/git-checkout.adoc)，[修改后](https://github.com/git/git/blob/e0bfec3dfc356f7d808eb5ee546a54116b794397/Documentation/git-checkout.adoc)）
-   `git push`（[修改前](https://github.com/git/git/blob/2b3ae040/Documentation/git-push.adoc)，[修改后](https://github.com/git/git/blob/e0bfec3dfc356f7d808eb5ee546a54116b794397/Documentation/git-push.adoc)）
-   `git pull`（[修改前](https://github.com/git/git/blob/2b3ae040/Documentation/git-pull.adoc)，[修改后](https://github.com/git/git/blob/e0bfec3dfc356f7d808eb5ee546a54116b794397/Documentation/git-pull.adoc)）

`git push` 和 `git pull` 的改动对我来说最有趣：除了更新这些页面的介绍部分，我们还最终编写了：

-   [一个描述“上游分支”含义的章节](https://github.com/git/git/blob/e0bfec3dfc356f7d808eb5ee546a54116b794397/Documentation/urls-remotes.adoc#upstream-branches)（之前并未真正解释）
-   [一个更清晰的“推送 refspec”描述](https://github.com/git/git/blob/e0bfec3dfc356f7d808eb5ee546a54116b794397/Documentation/git-push.adoc#options)

进行这些改动让我真正体会到维护开源文档的工作量有多大：要写出既清晰又准确的内容并不容易，有时我们不得不做出妥协，例如句子“`git push` 可能会失败，如果你尚未为当前分支设置上游，具体取决于 `push.default` 的设置”有点模糊，但“取决于”的具体细节非常复杂，理清这些是一个大工程。

### 关于为 Git 做贡献的流程

我花了一些时间才理解 Git 的开发流程。我不打算在这里详细描述（那可能得另写一篇文章！），但有几个快速要点：

-   Git 有一个 [Discord 服务器](https://git-scm.com/community#discord)，其中有一个“我的第一次贡献”频道，用于帮助入门贡献。我发现 Discord 上的人们非常热情。
-   我使用 [GitGitGadget](https://gitgitgadget.github.io/) 进行所有贡献。这意味着我可以创建 GitHub 拉取请求（这是我熟悉的工作流程），然后 GitGitGadget 会将我的 PR 转换为 Git 开发者使用的系统（带有补丁附件的电子邮件）。GitGitGadget 运行得很好，我非常感激不必学习如何用 Git 通过电子邮件发送补丁。
-   除此之外，我使用普通的电子邮件客户端（Fastmail 的网页界面）回复邮件，并将文本换行到 80 个字符，因为这是邮件列表的规范。

我也觉得 [lore.kernel.org](https://lore.kernel.org/git/) 上的邮件列表归档难以浏览，于是自己拼凑了一个 [Git 列表查看器](https://github.com/jvns/git-list-viewer)，方便阅读冗长的邮件列表讨论。

许多人在贡献流程和代码审查方面给予了我帮助：感谢 Emily Shaffer、Johannes Schindelin（GitGitGadget 的作者）、Patrick Steinhardt、Ben Knoble、Junio Hamano 等。

（我正在尝试在 Mastodon 上使用评论功能，[你可以在此处查看评论](https://comments.jvns.ca/post/115861337435768520)）
