---
title: '"Rules" that terminal programs follow'
url: 'https://jvns.ca/blog/2024/11/26/terminal-rules/'
url_hash: 88b1d8261ef2782421475971ad631c1b7f6bf475
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2024-12-12T09:28:22.000Z
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
最近我一直在思考，终端里发生的所有事情无非是以下几种角色的组合：

1.  **操作系统**的职责
2.  **Shell** 的职责
3.  **终端模拟器**的职责
4.  **当前运行的程序**（比如 `top`、`vim` 或 `cat`）的职责

前三者（操作系统、Shell 和终端模拟器）都属于已知范畴——如果你在 Linux 的 GNOME 终端里使用 bash，你基本能推断出它们之间的交互方式，而且部分行为已由 POSIX 标准化。

但第四种（“当前运行的程序”）感觉可能做出任何事。你怎么知道一个程序会如何表现？

这篇文章有点长，这里先列个快速目录：

-   [程序的行为出奇地一致](#程序的行为出奇地一致)
-   [这些规则是描述性的，而非规定性的](#这些规则是描述性的而非规定性的)
-   [哪些“规则”应由程序负责实现，有时并不明显](#哪些规则应由程序负责实现有时并不明显)
-   [规则 1：非交互式程序应在按下 `Ctrl-C` 时退出](#规则-1非交互式程序应在按下-ctrl-c-时退出)
-   [规则 2：TUI 程序应在按下 `q` 时退出](#规则-2tui-程序应在按下-q-时退出)
-   [规则 3：REPL 应在空行按下 `Ctrl-D` 时退出](#规则-3repl-应在空行按下-ctrl-d-时退出)
-   [规则 4：不要使用超过 16 种颜色](#规则-4不要使用超过-16-种颜色)
-   [规则 5：大致支持 readline 快捷键](#规则-5大致支持-readline-快捷键)
-   [规则 5.1：`Ctrl-W` 应删除最后一个词](#规则-51ctrl-w-应删除最后一个词)
-   [规则 6：写入管道时禁用颜色](#规则-6写入管道时禁用颜色)
-   [规则 7：`-` 表示标准输入/输出](#规则-7-表示标准输入输出)
-   [这些“规则”需要很长时间才能学会](#这些规则需要很长时间才能学会)

### 程序的行为出奇地一致

据我所知，终端程序的行为并没有真正的标准——我了解最接近的标准是：

-   POSIX，主要规定了终端模拟器/操作系统/Shell 如何协同工作。我认为它确实指定了 `cp` 等核心工具的一些行为，但据我所知，它没有规定 `htop` 等程序应该如何表现。
-   这份[命令行界面指南](https://clig.dev/)

但即使没有标准，根据我的经验，终端程序的行为还是相当一致的。所以我想写下一份“规则”清单，这些规则在我的经验中大多数程序都会遵循。

### 这些规则是描述性的，而非规定性的

我的目标不是说服终端程序的作者必须遵循这些规则。这些规则有很多例外，而且这些例外往往有充分的理由。

但对我来说，了解一个随机的新终端程序会有什么行为非常有用。与其说“呃，程序可能做任何事”，不如说“好，这是我所期望的基本规则，然后我可以在脑子里记一个简短的例外清单”。

我把自己在 20 年终端使用中观察到的程序行为规律、对背后原因的思考，以及一些打破这些规律的例子记录下来。

### 哪些"规则"应由程序负责实现，并不总是显而易见

有许多常见惯例明显属于程序应负责实现的范畴，例如：

-   配置文件应放在 `~/.BLAHrc`、`~/.config/BLAH/FILE` 或 `/etc/BLAH/` 等位置
-   `--help` 应输出帮助文本
-   程序应将"常规"输出打印到 stdout，错误信息打印到 stderr

但本文重点讨论那些并非完全明确的程序职责。比如对我来说，按 `Ctrl-D` 退出 REPL 就像"自然法则"一样理所当然，但程序往往需要显式实现该功能——尽管 `cat` 无需实现 `Ctrl-D` 支持，`ipython` 却[需要](https://github.com/prompt-toolkit/python-prompt-toolkit/blob/a2a12300c635ab3c051566e363ed27d853af4b21/src/prompt_toolkit/shortcuts/prompt.py#L824-L837)（详见下文"规则三"）。

理解哪些属于程序职责，能让我们在遇到不同程序实现细节差异时不再感到意外。

### 规则一：非交互式程序应在按下 `Ctrl-C` 时退出

这条规则的主要依据是：非交互式程序若未设置 `SIGINT` 信号处理器，默认会在 `Ctrl-C` 时退出，因此这属于"应遵循默认行为"的规则。

容易让人困惑的是，这条规则**不适用**于 `python3`、`bc`、`less` 等**交互式**程序。因为在交互式程序中，`Ctrl-C` 有不同职责——若程序正在执行操作（如 `less` 中的搜索或 `python3` 中的 Python 代码），`Ctrl-C` 会中断该操作但不会终止程序。

以下是交互式程序中的实现示例：[prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit/blob/a2a12300c635ab3c051566e363ed27d853af4b21/src/prompt_toolkit/key_binding/bindings/vi.py#L2225)（iPython 使用的输入处理库）中按 `Ctrl-C` 中止搜索的代码。

### 规则二：TUI 程序应在按下 `q` 时退出

TUI 程序（如 `less` 或 `htop`）通常会在按下 `q` 时退出。

这条规则不适用于按 `q` 退出毫无意义的程序，例如 `tmux` 或文本编辑器。

### 规则三：REPL 应在空行按下 `Ctrl-D` 时退出

REPL（如 `python3` 或 `ed`）通常会在空行按下 `Ctrl-D` 时退出。此规则与 `Ctrl-C` 规则类似——原因在于，若程序（如 `cat`）运行在"熟模式"下，操作系统会在空行按下 `Ctrl-D` 时返回 `EOF`。

我使用的大多数 REPL（sqlite3、python3、fish、bash 等）实际上并不使用熟模式，但它们都实现了这个键盘快捷键以模拟默认行为。

例如，这是 [prompt-toolkit 中按下 Ctrl-D 退出的代码](https://github.com/prompt-toolkit/python-prompt-toolkit/blob/a2a12300c635ab3c051566e363ed27d853af4b21/src/prompt_toolkit/shortcuts/prompt.py#L824-L837)，这是 [readline 中的相同实现](https://github.com/bminor/bash/blob/6794b5478f660256a1023712b5fc169196ed0a22/lib/readline/readline.c#L658-L672)。

我之前一直以为这条是“终端物理定律”，因为几乎没见过被打破的情况，但你看上面那些链接就会发现，这其实只是每个输入库需要各自实现的功能。

有人指出 Erlang 的 REPL 在按下 `Ctrl-D` 时并不会退出，所以看来并非所有 REPL 都遵循这条“规则”。

### 规则 4：不要使用超过 16 种颜色

终端程序很少使用基础 16 色 ANSI 颜色以外的颜色。这是因为如果用十六进制码指定颜色，很可能会与某些用户的背景色冲突。比如我用 `#EEEEEE` 打印文字，在浅色背景下几乎看不见，但在深色背景下就显示正常。

但如果坚持使用默认的 16 种基础颜色，用户更有可能已经在终端模拟器中配置过这些颜色，使它们能与背景色合理搭配。另一个坚持使用基础 16 色的原因是，这样能减少对终端模拟器支持哪些颜色的假设。

我通常看到打破这条“规则”的程序只有文本编辑器，比如 Helix 默认使用紫色背景，这不是默认的 ANSI 颜色。Helix 打破这条规则似乎没问题，因为 Helix 不是“核心”程序，而且我假设任何不喜欢这个配色的 Helix 用户都会自行更换主题。

### 规则 5：大致支持 readline 键绑定

我使用的几乎所有程序，只要合理，都会支持 `readline` 键绑定。例如，下面列出了一些不同的程序，以及它们定义 `Ctrl-E` 跳转到行尾的链接：

-   ipython（[Ctrl-E 在此定义](https://github.com/prompt-toolkit/python-prompt-toolkit/blob/a2a12300c635ab3c051566e363ed27d853af4b21/src/prompt_toolkit/key_binding/bindings/emacs.py#L72)）
-   atuin（[Ctrl-E 在此定义](https://github.com/atuinsh/atuin/blob/a67cfc82fe0dc907a01f07a0fd625701e062a33b/crates/atuin/src/command/client/search/interactive.rs#L407)）
-   fzf（[Ctrl-E 在此定义](https://github.com/junegunn/fzf/blob/bb55045596d6d08445f3c6d320c3ec2b457462d1/src/terminal.go#L611)）
-   zsh（[Ctrl-E 在此定义](https://github.com/zsh-users/zsh/blob/86d5f24a3d28541f242eb3807379301ea976de87/Src/Zle/zle_bindings.c#L94)）
-   fish（[Ctrl-E 在此定义](https://github.com/fish-shell/fish-shell/blob/99fa8aaaa7956178973150a03ce4954ab17a197b/share/functions/fish_default_key_bindings.fish#L43)）
-   tmux 的命令提示符（[Ctrl-E 在此定义](https://github.com/tmux/tmux/blob/ae8f2208c98e3c2d6e3fe4cad2281dce8fd11f31/key-bindings.c#L490)）

这些程序实际上都没有直接使用 `readline`，它们只是大致模仿了 emacs/readline 的键绑定。它们并不总是*完全*模仿：例如 atuin 似乎将 `Ctrl-A` 用作前缀，所以 `Ctrl-A` 不会跳转到行首。

此外，所有这些程序似乎都实现了自己的内部剪切和粘贴缓冲区，因此你可以用 `Ctrl-U` 删除一行，然后用 `Ctrl-Y` 粘贴。

例外情况包括：

-   某些程序（如 `git`、`cat` 和 `nc`）根本不支持行编辑功能（除了退格键、`Ctrl-W` 和 `Ctrl-U`）
-   像往常一样，文本编辑器是例外，每个文本编辑器都有自己处理文本编辑的方式

我在 [在终端中输入文本很复杂](https://jvns.ca/blog/2024/07/08/readline/) 一文中更详细地讨论了“程序支持哪些键绑定？”这个问题。

### 规则 5.1：Ctrl-W 应删除上一个单词

我从未见过（除了文本编辑器之外）有程序会不把 `Ctrl-W` 当作删除上一个单词的功能。这和 `Ctrl-C` 的规则类似——默认情况下，如果程序处于“熟模式”，操作系统会在你按下 `Ctrl-W` 时删除上一个单词，按下 `Ctrl-U` 时删除整行。所以通常程序都会模仿这种行为。

除了文本编辑器之外，我想不出任何例外情况，但如果有的话，我很想听听大家的分享！

### 规则 6：写入管道时禁用颜色

大多数程序在写入管道时会禁用颜色。例如：

-   `rg blah` 会在输出中高亮显示所有 `blah` 的出现，但如果输出目标是管道或文件，则会关闭高亮。
-   `ls --color=auto` 在写入终端时会使用颜色，但写入管道时则不会。

这两个程序在写入终端时还会以不同方式格式化输出：`ls` 会将文件排列成列，而 ripgrep 会用标题对匹配结果进行分组。

如果你想强制程序使用颜色（例如，因为你想查看颜色），可以使用 `unbuffer` 来强制程序的输出成为 tty，如下所示：

```
unbuffer rg blah | less -R
```

我确信有些程序会“打破”这条规则，但我现在想不出任何例子。有些程序有一个 `--color` 标志，你可以用它来强制开启颜色，在上面的例子中，你也可以这样做：`rg --color=always | less -R`。

### 规则 7：`-` 表示标准输入/标准输出

通常，如果你将 `-` 而不是文件名传递给程序，它会从标准输入读取或写入标准输出（视情况而定）。例如，如果你想用 `black` 格式化剪贴板上的 Python 代码，然后复制它，你可以运行：

```
pbpaste | black - | pbcopy
```

（`pbpaste` 是 Mac 上的程序，在 Linux 上你可以用 `xclip` 做类似的事情）

我的印象是，大多数程序在合理的情况下都会实现这一点，我现在想不出任何例外，但我确信有很多例外。

### 这些“规则”需要很长时间才能学会

这些规则花了我很长时间才学会，因为我必须：

1.  了解这条规则在任何地方都适用（“`Ctrl-C` 会退出程序”）
2.  注意到一些例外情况（“好吧，`Ctrl-C` 会退出 `find`，但不会退出 `less`”）
3.  下意识地找出模式是什么（“`Ctrl-C` 通常会退出非交互式程序，但在交互式程序中，它可能会中断当前操作而不是退出程序”）
4.  最终也许能将其表述为我所知道的明确规则

老实说，我对终端的很多理解还停留在“潜意识模式识别”阶段。我之所以花时间把这些东西明确写出来，唯一的原因是我一直在尝试向别人解释它的运作方式。希望把这些“规则”明确写下来，能让其他人学这些东西时稍微快一点。
