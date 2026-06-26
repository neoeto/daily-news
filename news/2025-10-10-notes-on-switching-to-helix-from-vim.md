---
title: Notes on switching to Helix from vim
url: 'https://jvns.ca/blog/2025/10/10/notes-on-switching-to-helix-from-vim/'
url_hash: df910b18ea46a837475965b5e1fb721ef22305d6
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2025-10-10T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - Rust
  - 创业
original_lang: en
truncated: false
---
今年夏初，我和一位朋友聊起我有多[喜欢用 fish](https://jvns.ca/blog/2024/09/12/reasons-i--still--love-fish/)，以及我有多喜欢它无需配置。对方说他们对 [helix](https://helix-editor.com/) 文本编辑器也有同感，于是我决定尝试一下。

到现在我已经用了三个月，下面是一些笔记。

### 为什么选择 helix：语言服务器

我想促使我尝试 Helix 的原因是，我一直想搭建一个好用的语言服务器环境（以便实现“跳转到定义”等功能），但在 Vim 或 Neovim 里配置出顺手的感觉实在太费劲了。

用了 Vim/Neovim 20 年，我既试过“从头构建自己的自定义配置”，也试过“使用别人的预置配置系统”。尽管我很喜欢 Vim，但能直接开箱即用、完全不用折腾配置，还是让我很兴奋。

Helix 内置了语言服务器支持，在任何语言里都能轻松实现“重命名这个符号”之类的操作，感觉非常棒。

### 搜索功能很棒

Helix 最让我喜欢的功能之一就是搜索！当我在仓库的所有文件中搜索某个字符串时，它可以让我滚动浏览所有匹配的文件，并看到匹配内容的完整上下文，就像这样：

![](/images/helix-search.png)

作为对比，这是我之前用的 vim ripgrep 插件的样子：

![](/images/vim-ripgrep.png)

完全没有该行周围的其他上下文信息。

### 快捷参考很贴心

Helix 还有一个让我喜欢的地方：当我按下 `g` 键时，会弹出一个帮助提示，告诉我可以跳转到哪些位置。我真的很欣赏这一点，因为我不太常用“跳转到定义”或“跳转到引用”功能，经常忘记快捷键。

![](/images/goto.png)

### 一些 vim -> helix 的转换

-   Helix 没有像 `ma`、`'a` 这样的标记，取而代之的是我用 `Ctrl+O` 和 `Ctrl+I` 来回到（或前进到）上一个光标位置。
-   我觉得 Helix 确实有宏功能，但在我以前会用宏的每个场景中，现在都改用多光标了。相比总是写宏，我更喜欢多光标。如果我想批量修改文档中的内容，我的操作流程是：按 `%`（高亮全部内容），然后按 `s` 用正则表达式选中要修改的部分，接着直接按需编辑所有选中内容。
-   Helix 没有 Neovim 风格的标签页，取而代之的是一个好用的缓冲区切换器（`<space>b`），我可以用它切换到想要的缓冲区。这里有一个[拉取请求](https://github.com/helix-editor/helix/pull/7109)正在实现 Neovim 风格的标签页。另外还有一个设置项 `bufferline="multiple"`，它可以通过 `gp`、`gn` 实现类似标签页的切换（上一个/下一个“标签”），用 `:bc` 关闭一个“标签”。

### 一些 Helix 的烦人之处

以下是我到目前为止对 Helix 感到不满的地方。

-   我挺喜欢 Helix 的 `:reflow` 功能，但感觉不如 Vim 用 `gq` 重排文本那么好用，处理列表时效果不佳。（[GitHub 问题](https://github.com/helix-editor/helix/issues/3332)）
-   在编辑 Markdown 列表时，按回车键不会自动延续列表。虽然有个[部分解决方案](https://github.com/helix-editor/helix/wiki/Recipes#continue-markdown-lists--quotes)适用于无序列表，但有序列表的解决方案我还没找到。
-   目前还没有持久化撤销功能：在 Vim 中我可以使用 [undofile](https://vimdoc.sourceforge.net/htmldoc/options.html#'undofile')，这样即使退出后也能撤销修改。Helix 目前还没有这个功能。（[GitHub PR](https://github.com/helix-editor/helix/pull/9154)）
-   Helix 不会自动重新加载磁盘上已修改的文件，我需要手动运行 `:reload-all`（`:ra<tab>`）来重新加载。不过问题不大。
-   偶尔会崩溃，大概每周一次。我怀疑是[这个问题](https://github.com/helix-editor/helix/issues/12582)。

崩溃信息大致如下：

```
thread 'main' panicked at helix-core/src/transaction.rs:499:9:
Positions [(2959, AfterSticky), (2959, AfterSticky)] are out of range for changeset len 2945!
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

由于我经常编辑 Markdown 列表，“列表延续”和“重排”问题频繁出现，但我还是坚持用 Helix，看来这些烦恼还不至于让我放弃。

### 切换比想象中容易

我原本担心要重新学习 20 年的 Vim 肌肉记忆会非常困难。

结果比预想简单得多。我在度假时开始用 Helix 做一个小型编程项目，一两周后就不再感到别扭了。虽然可能很难在 Vim 和 Helix 之间来回切换，但我最近没怎么用 Vim，所以不确定这会不会成为问题。

第一次尝试 Helix 时，我试图强制使用更接近 Vim 的快捷键，结果并不理想。直接学习“Helix 的方式”反而容易得多。

不过还是有些地方让我不适应：比如 Vim 中的 `w` 和 Helix 中的 `w` 对“单词”的定义不同（Helix 包含单词后的空格，Vim 则不包含）。

### 使用终端文本编辑器

多年来我主要使用 Vim/Neovim 的 GUI 版本，所以切换到终端编辑器需要一些适应。

最终我决定：

1.  每个项目使用独立的终端窗口，窗口内的所有标签页（大部分）共享相同的工作目录
2.  将 Helix 标签页设为终端窗口的第一个标签页

效果不错，我甚至觉得比之前的工作流程更好。

### 我的配置

相比我那几百行的 Neovim 配置，Helix 的配置简单多了，主要就是 4 个快捷键。

```
theme = "solarized_light"
[editor]
# 与系统剪贴板同步
default-yank-register = "+"

[keys.normal]
# 我不喜欢 Ctrl+C 作为默认的"切换注释"快捷键
"#" = "toggle_comments"

# 我不想学习另一种方式
# 来跳转到行首/行尾，所以
# 我重新映射了 ^ 和 $
"^" = "goto_first_nonwhitespace"
"$" = "goto_line_end"

[keys.select]
"^" = "goto_first_nonwhitespace"
"$" = "goto_line_end"

[keys.normal.space]
# 我写大量文本，所以需要经常重新排版，
# 并且怀念 vim 的 `gq` 快捷键
l = ":reflow"
```

另外还有一个独立的 `languages.toml` 配置文件，我在其中设置了一些语言偏好，比如关闭自动格式化。例如，这是我的 Python 配置：

```
[[language]]
name = "python"
formatter = { command = "black", args = ["--stdin-filename", "%{buffer_name}", "-"] }
language-servers = ["pyright"]
auto-format = false
```

### 走着瞧吧

三个月并不算长，说不定哪天我会决定回到 Vim。比如，我之前写过一篇[关于切换到 nix 的文章](https://jvns.ca/blog/2023/02/28/some-notes-on-using-nix/)，但大约八个月后我又切换回了 Homebrew（不过我现在仍然用 NixOS 管理一台小服务器，对此还算满意）。
