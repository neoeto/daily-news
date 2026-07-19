---
title: ASCII control characters in my terminal
url: 'https://jvns.ca/blog/2024/10/31/ascii-control-characters/'
url_hash: e29a9fced976df3c2018c3fe76f851eba45d6def
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2024-10-31T08:00:10.000Z
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
你好！我最近一直在思考终端相关的问题，昨天突然对这些“控制码”产生了好奇，比如 `Ctrl-A`、`Ctrl-C`、`Ctrl-W` 之类的。它们到底是怎么回事？

### ASCII 控制字符表

下面这张表列出了全部 33 个 ASCII 控制字符，以及它们在我的机器（Mac OS）上大致的功能。虽然存在无数例外情况，但我会解释这些含义，并说明我所知的这张图存在的所有问题。

[![](https://jvns.ca/images/ascii-control.png)](https://jvns.ca/ascii.html)

你也可以查看 [HTML 版本](https://jvns.ca/ascii.html)（我把它做成图片是为了在 RSS 中显示）。

### 不同类型的代码混杂在一起

这张图最让我惊讶的一点是，33 个控制码大致可分为以下几类：

1.  由操作系统终端驱动程序处理的代码，例如当操作系统收到 `3`（`Ctrl-C`）时，会向当前程序发送 `SIGINT` 信号。
2.  其他所有代码原样传递给应用程序，由应用程序自行处理。其中又包含几个子类：
    -   对应键盘上某个按键的字面敲击（`回车`、`制表符`、`退格`）。例如按下 `回车` 时，终端会收到 `13`。
    -   `readline` 使用的代码：“应用程序可以自行处理”通常意味着“无论应用程序是否实际使用 `readline`，它都会大致遵循 `readline` 库的行为”，因此我标注了部分 `readline` 使用的代码。
    -   其他代码，例如我认为 `Ctrl-X` 在终端中没有通用含义，但 emacs 大量使用它。

这些代码所属类别毫无规律可言，完全是历史演变中随机分布的。

（如果你对 readline 感兴趣，我在《[在终端中输入文本很复杂](https://jvns.ca/blog/2024/07/08/readline/)》中有更详细的介绍，网上也有大量[速查表](https://github.com/chzyer/readline/blob/master/doc/shortcut.md)可供参考。）

### 只有 33 个控制码

另一个让我略感意外的是，控制码只有 33 个——从 A 到 Z，外加 7 个（`@, [, \, ], ^, _, ?`）。这意味着如果你想在终端应用中使用 `Ctrl-1` 这样的快捷键，它实际上没有意义——至少在我的机器上，`Ctrl-1` 和直接按 `1` 完全一样，`Ctrl-3` 等同于 `Ctrl-[`，以此类推。

此外，`Ctrl+Shift+C` 并非控制码——它的行为取决于你的终端模拟器。例如在 Linux 上，`Ctrl-Shift-X` 通常被终端模拟器用于复制、打开新标签页或粘贴等操作，根本不会发送到 TTY。

另外我经常使用 `Ctrl+左箭头`，但这也不是控制码，它会发送一个 ANSI 转义序列（`ctrl-[[1;5D`），这是另一回事，本文篇幅有限，无法展开讨论。

这种“只有33个控制码”的说法，与图形界面中键盘快捷键的工作方式完全不同——在图形界面里，你可以为任意按键设置 `Ctrl+KEY` 组合。

### 官方的ASCII名称对我来说没什么意义

这33个控制码在ASCII中都有各自的名称（例如 `3` 对应 `ETX`）。当初定义这些控制码时，它们根本不是用于计算机或终端的，而是用于[电报机](https://falsedoor.com/doc/ascii_evolution-of-character-codes.pdf)。电报机与UNIX终端不同，因此许多控制码后来被重新赋予了其他含义。

就我个人而言，这些ASCII名称没什么用，因为50%的情况下，ASCII中的名称与这些码在当今UNIX系统上的实际功能毫无关联。所以，干脆完全忽略这些ASCII名称，比试图弄清楚哪些还保留原意要省事得多。

### 用Ctrl-M作为键盘快捷键很麻烦

另一个有点奇怪的地方是：`Ctrl-M` 实际上等同于 `Enter`，而 `Ctrl-I` 等同于 `Tab`，这使得这两个组合很难用作键盘快捷键。

经过快速调研，似乎确实有人仍在使用 `Ctrl-I` 和 `Ctrl-M` 作为键盘快捷键（[这里有个例子](https://github.com/tmux/tmux/issues/2705)），但要做到这一点，你需要配置终端模拟器，让它们与默认行为不同。

对我来说，主要的结论是：如果我将来编写终端应用程序，应该避免在其中使用 `Ctrl-I` 和 `Ctrl-M` 作为键盘快捷键。

### 如何识别发送了哪些控制码

在写这篇文章时，我需要做大量实验来弄清楚各种按键组合的效果，于是我编写了这个Python脚本 [echo-key.py](https://gist.github.com/jvns/a2ea09dbfbe03cc75b7bfb381941c742)，它会打印出这些组合。

可能还有更正式的方法，但我喜欢能有一个可以自定义的脚本。

### 注意事项：关于规范模式与非规范模式

其中两个控制码（`Ctrl-W` 和 `Ctrl-U`）在表中被标注为“由操作系统处理”，但实际上它们并非**总是**由操作系统处理，这取决于终端处于“规范模式”还是“非规范模式”。

在[规范模式](https://www.man7.org/linux/man-pages/man3/termios.3.html)下，程序只有在按下 `Enter` 时才能获得输入（并且操作系统负责在你按下 `Backspace` 或 `Ctrl-W` 时删除字符）。但在非规范模式下，程序会在你按下按键时立即获得输入，`Ctrl-W` 和 `Ctrl-U` 这些控制码会被直接传递给程序，由程序以任意方式处理。

通常，在非规范模式下，程序处理 `Ctrl-W` 和 `Ctrl-U` 的方式与操作系统类似，但会存在一些细微差别。

使用规范模式的程序示例：

-   几乎任何非交互式程序，比如 `grep` 或 `cat`
-   我认为 `git` 也是

使用非规范模式的程序示例：

-   `python3`、`irb` 以及其他REPL
-   你的shell
-   任何全屏TUI，比如 `less` 或 `vim`

### 注意：所有“操作系统终端驱动程序”代码均可通过 `stty` 配置

我之前说 `Ctrl-C` 发送 `SIGINT`，但严格来说这不完全正确——如果你真的想，可以用名为 `stty` 的工具重新映射所有标记为“操作系统终端驱动程序”的代码（包括退格键），并且可以通过 `stty -a` 查看当前映射。

以下是我当前机器上的映射：

```
$ stty -a
cchars: discard = ^O; dsusp = ^Y; eof = ^D; eol = <undef>;
	eol2 = <undef>; erase = ^?; intr = ^C; kill = ^U; lnext = ^V;
	min = 1; quit = ^\; reprint = ^R; start = ^Q; status = ^T;
	stop = ^S; susp = ^Z; time = 0; werase = ^W;
```

我个人从未重新映射过这些代码，也想不出有什么理由需要这么做（我觉得这只会给自己带来混乱和灾难），但我在 Mastodon 上询问后，人们表示他们使用 `stty` 最常见的原因是：

-   用 `stty sane` 修复损坏的终端
-   设置 `stty erase ^H` 来改变退格键的工作方式
-   设置 `stty ixoff`
-   有些人甚至会将 `SIGINT` 映射到不同的按键，比如他们的 `DELETE` 键

### 注意：关于信号

关于信号有两点需要注意：

1.  如果终端模式 `ISIG` 被关闭，操作系统就不会发送信号。例如 `vim` 会关闭 `ISIG`
2.  在 BSD 系统上，似乎有一个额外的控制代码（`Ctrl-T`）会发送 `SIGINFO`

你可以像这样使用 `strace` 查看程序设置了哪些终端模式，终端模式通过 `ioctl` 系统调用设置：

```
$ strace -tt -o out  vim
$ grep ioctl out | grep SET
```

以下是 `vim` 启动时设置的模式（`ISIG` 和 `ICANON` 不见了！）：

```
17:43:36.670636 ioctl(0, TCSETS, {c_iflag=IXANY|IMAXBEL|IUTF8,
c_oflag=NL0|CR0|TAB0|BS0|VT0|FF0|OPOST, c_cflag=B38400|CS8|CREAD,
c_lflag=ECHOK|ECHOCTL|ECHOKE|PENDIN, ...}) = 0
```

并在退出时重置这些模式：

```
17:43:38.027284 ioctl(0, TCSETS, {c_iflag=ICRNL|IXANY|IMAXBEL|IUTF8,
c_oflag=NL0|CR0|TAB0|BS0|VT0|FF0|OPOST|ONLCR, c_cflag=B38400|CS8|CREAD,
c_lflag=ISIG|ICANON|ECHO|ECHOE|ECHOK|IEXTEN|ECHOCTL|ECHOKE|PENDIN, ...}) = 0
```

我认为 `vim` 这里使用的特定模式组合可能被称为“原始模式”，[man cfmakeraw](https://linux.die.net/man/3/cfmakeraw) 对此有详细说明。

### 存在大量冲突

关于“只有 33 个代码”这一点，系统中不同部分经常想用同一个代码做不同的事情，导致大量冲突。例如，默认情况下 `Ctrl-S` 会冻结屏幕，但如果你关闭这个功能，`readline` 就会用 `Ctrl-S` 进行正向搜索。

另一个例子是，在我的机器上，有时 `Ctrl-T` 会发送 `SIGINFO`，有时会交换两个字符，有时又会根据以下因素做出完全不同的行为：

-   程序是否设置了 `ISIG`
-   程序是否使用 `readline` / 模仿 readline 的行为

### 注意：关于“退格键”和“另一个退格键”

在这个图表中，我将代码 127 标记为“退格键”，将代码 8 标记为“另一个退格键”。呃，这是什么意思？

我认为这是 Mastodon 回复中讨论最多的话题——显然这背后有大量历史，而我此前对此一无所知。

首先，以下是我机器上的工作方式：

1.  我按下 `Backspace` 键
2.  TTY 收到字节 `127`，在 ASCII 中称为 `DEL`
3.  操作系统终端驱动和 readline 都将 `127` 映射为“退格”（因此在规范模式和非规范模式下都能正常工作）
4.  前一个字符被删除

如果我按下 `Ctrl+H`，在使用 readline 时效果与 `Backspace` 相同，但在不支持 readline 的程序（例如 `cat`）中，它只会输出 `^H`。

显然，上述第 2 步对某些人来说有所不同——他们的 `Backspace` 键发送的是字节 `8` 而非 `127`，因此如果希望退格键正常工作，他们需要使用 `stty` 配置操作系统，将 `erase` 设置为 `^H`。

Debian 策略手册中有一个令人惊叹的[键盘配置章节](https://www.debian.org/doc/debian-policy/ch-opersys.html#keyboard-configuration)，描述了根据 Debian 策略 `Delete` 和 `Backspace` 应如何工作，这与我当前 Mac 上的工作方式非常相似。根据我的理解（通过[这篇 Mastodon 帖子](https://tech.lgbt/@Diziet/113396035847619715)），该策略写于 90 年代，因为当时关于 `Backspace` 应如何工作存在大量混乱，需要制定一个标准来确保一切正常运行。

这里还有更多历史终端相关内容，但我暂时只说这么多。

### 实际工作方式可能更加多样化

我可能遗漏了许多“我机器上的工作方式”与他人机器上的工作方式不同的情况，也可能对我自己机器上的工作方式描述有误。但这就是我今天能分享的全部内容。

还有一些我知道但未提及的内容：根据 `stty -a`，`Ctrl-O` 是“丢弃”，`Ctrl-R` 是“重印”，`Ctrl-Y` 是“dsusp”。我不知道如何让它们实际生效（按下它们时没有任何明显效果，有人告诉过我它们历史上的用途，但我不清楚它们在 2024 年是否还有用），而且在实际使用中，它们似乎经常被直接传递给应用程序，所以我只是将 `Ctrl-R` 和 `Ctrl-Y` 标记为 `readline`。

### 并非所有这些知识都那么有用

另外我想说，我觉得这篇文章的内容挺有意思的，但未必真的那么*实用*。过去20年里，我每天都能顺利使用终端，却完全不知道这些知识——我只是在实践中知道`Ctrl-C`、`Ctrl-D`、`Ctrl-Z`、`Ctrl-R`、`Ctrl-L`的作用（可能再加上`Ctrl-A`、`Ctrl-E`和`Ctrl-W`），大部分时候并不纠结细节，而这样几乎完全够用，除非是在[尝试使用xterm.js](https://jvns.ca/blog/2022/07/20/pseudoterminals/)的时候。

但我在学习这些内容的过程中玩得很开心，所以也许你也会觉得有趣。
