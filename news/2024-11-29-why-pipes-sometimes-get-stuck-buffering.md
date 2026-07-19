---
title: 'Why pipes sometimes get "stuck": buffering'
url: 'https://jvns.ca/blog/2024/11/29/why-pipes-get-stuck-buffering/'
url_hash: 87058a497987a6a55d615368865f0ff823dccd18
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2024-11-29T08:23:31.000Z
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
这里有一个困扰我多年的终端小问题，直到几周前我才真正搞明白。假设你正在运行这条命令，用来监控日志文件中特定的输出内容：

```
tail -f /some/log/file | grep thing1 | grep thing2
```

如果日志行写入文件的速度相对较慢，我看到的会是……什么都没有！无论日志文件中是否有匹配的内容，都不会有任何输出。

我过去一直把这种现象内化为“嗯，管道有时候就是会卡住，不显示输出，真奇怪”，然后我会改用 `grep thing1 /some/log/file | grep thing2` 来处理，这样就能正常工作了。

所以，在过去几个月深入钻研终端技术的过程中，我特别兴奋，终于能确切知道这是为什么了。

### 为什么会这样：缓冲机制

“管道卡住”有时会发生，原因在于：程序在将输出写入管道或文件之前，**非常常见**的做法是先缓冲输出。所以管道本身是正常的，问题在于程序压根儿就没把数据写到管道里！

这是出于性能考虑：一有输出就立即写入，会使用更多的系统调用；因此，更高效的做法是先把数据攒起来，等到有大约 8KB 的数据（或者程序退出时）再一次性写入管道。

在这个例子中：

```
tail -f /some/log/file | grep thing1 | grep thing2
```

问题在于 `grep thing1` 会一直缓存所有匹配的结果，直到攒够 8KB 数据才写入，而这可能永远都不会发生。

### 写入终端时，程序不会缓冲

我之所以觉得这个问题很令人困惑，部分原因在于 `tail -f file | grep thing` 完全能正常工作，但一旦加上第二个 `grep`，它就不行了！！原因在于 `grep` 处理缓冲的方式取决于它是否在向终端写入数据。

以下是 `grep`（以及许多其他程序）决定如何缓冲输出的逻辑：

-   使用 `isatty` 函数检查标准输出是否为终端
    -   如果是终端，则使用行缓冲（每得到一行就立即打印）
    -   否则，使用“块缓冲”——只有攒够大约 8KB 数据时才打印

所以，如果 `grep` 直接向你的终端写入数据，那么一行被打印出来时你立刻就能看到；但如果它向管道写入数据，你就看不到了。

当然，并不是每个程序的缓冲区大小都是 8KB，这取决于具体实现。对于 `grep` 来说，缓冲由 libc 管理，而 libc 的缓冲区大小定义在 `BUFSIZ` 变量中。[这里是 glibc 中定义该变量的位置](https://github.com/bminor/glibc/blob/c69e8cccaff8f2d89cee43202623b33e6ef5d24a/libio/stdio.h#L100)。

（顺带一提：“程序向终端写入时不会使用 8KB 输出缓冲区”并非终端物理定律，程序若想向终端写入时使用 8KB 缓冲区完全可行，只是这样做会极其反常——我想不出有哪个程序会如此行事）

### 缓冲的命令与不缓冲的命令

这种缓冲行为令人困扰的一点在于，你大概需要记住哪些命令在写入管道时会缓冲输出。

以下是一些**不**缓冲输出的命令：

-   tail
-   cat
-   tee

我认为几乎所有其他命令都会缓冲输出，尤其是那些常用于批处理的命令。下面列出一些常见命令，它们在写入管道时会缓冲输出，以及禁用块缓冲的参数。

-   grep（`--line-buffered`）
-   sed（`-u`）
-   awk（有 `fflush()` 函数）
-   tcpdump（`-l`）
-   jq（`-u`）
-   tr（`-u`）
-   cut（无法禁用缓冲）

我能想到的就这些了。许多 Unix 命令（如 `sort`）可能会也可能不会缓冲输出，但这并不重要，因为 `sort` 在接收完输入前无法执行任何操作。

另外，我已尽力测试了这些命令在 Mac OS 和 GNU 版本下的表现，但由于存在大量变体，可能仍有疏漏。

### 默认“print”语句会缓冲的编程语言

此外，以下编程语言的默认 print 语句在写入管道时会缓冲输出，以及一些禁用缓冲的方法（如需）：

-   C（使用 `setvbuf` 禁用）
-   Python（使用 `python -u`、`PYTHONUNBUFFERED=1`、`sys.stdout.reconfigure(line_buffering=False)` 或 `print(x, flush=True)` 禁用）
-   Ruby（使用 `STDOUT.sync = true` 禁用）
-   Perl（使用 `$| = 1` 禁用）

我推测这些语言如此设计，是为了让默认的 print 函数在批处理时能保持高速。

此外，输出是否缓冲可能取决于打印方式。例如在 C++ 中，`cout << "hello\n"` 在写入管道时会缓冲，但 `cout << "hello" << endl` 会刷新输出。

### 在管道上按下 `Ctrl-C` 时，缓冲区内容会丢失

假设你正用以下命令以取巧方式监控对 `example.com` 的 DNS 请求，却忘记给 tcpdump 加上 `-l` 参数：

```
sudo tcpdump -ni any port 53 | grep example.com
```

当你按下 `Ctrl-C` 时会发生什么？在完美的理想世界中，我*希望*看到的是：tcpdump 刷新其缓冲区，grep 搜索 `example.com`，然后我能看到所有遗漏的输出。

但在现实世界中，实际发生的是所有程序都被终止，tcpdump 缓冲区中的输出就此丢失。

我认为这个问题可能无法避免——我用 `strace` 简单研究了一下工作原理，发现无论如何 `grep` 都会在 `tcpdump` 之前收到 `SIGINT`，所以即使 `tcpdump` 试图刷新缓冲区，`grep` 也已经终止了。

经过进一步调查，有一个变通方法：找到 `tcpdump` 的 PID 并执行 `kill -TERM $PID`，这样 tcpdump 就会刷新缓冲区，你就能看到输出了。虽然有点麻烦，但我测试过，似乎可行。

### 重定向到文件也会缓冲

不仅仅是管道，以下命令也会缓冲：

```
sudo tcpdump -ni any port 53 > output.txt
```

不过重定向到文件不会出现"Ctrl-C 会完全清空缓冲区内容"的问题——根据我的经验，它通常更符合预期：程序退出前缓冲区内容会写入文件。但我不确定这是否总是可靠。

### 避免缓冲的几种方法

我们来谈谈解决方案。假设你运行了以下命令：

```
tail -f /some/log/file | grep thing1 | grep thing2
```

我在 Mastodon 上询问大家实际中如何解决这个问题，得到了 5 种基本方法：

#### 方案 1：运行快速完成的程序

以往我的解决方案是彻底避免"命令缓慢写入管道"的情况，改用能快速完成的程序，例如：

```
cat /some/log/file | grep thing1 | grep thing2 | tail
```

这与原命令效果不同，但可以避免考虑这些奇怪的缓冲问题。

（你也可以用 `grep thing1 /some/log/file`，但我更喜欢用"多余的" `cat`）

#### 方案 2：记住 grep 的"行缓冲"标志

你可以记住 grep 有一个避免缓冲的标志，像这样使用：

```
tail -f /some/log/file | grep --line-buffered thing1 | grep thing2
```

#### 方案 3：使用 awk

有人提到，如果遇到多个 grep 的情况，他们会改用单个 awk 重写，例如：

```
tail -f /some/log/file |  awk '/thing1/ && /thing2/'
```

或者写更复杂的 grep，像这样：

```
tail -f /some/log/file |  grep -E 'thing1.*thing2'
```

（awk 也会缓冲，所以要让 awk 成为管道中的最后一个命令）

#### 方案 4：使用 `stdbuf`

`stdbuf` 利用 LD\_PRELOAD 关闭 libc 的缓冲功能，你可以这样关闭输出缓冲：

```
tail -f /some/log/file | stdbuf -o0 grep thing1 | grep thing2
```

与任何 `LD_PRELOAD` 方案一样，它有些不可靠——不适用于静态链接的二进制文件，如果程序未使用 libc 的缓冲机制则可能失效，且在 macOS 上并非始终有效。Harry Marr 有一篇非常精彩的博文 [How stdbuf works](https://hmarr.com/blog/how-stdbuf-works/)。

#### 方案 5：使用 `unbuffer`

`unbuffer program` 会强制程序的输出视为 TTY，这意味着它将像在 TTY 上正常运行时那样工作（减少缓冲、输出颜色等）。你可以这样使用它：

```
tail -f /some/log/file | unbuffer grep thing1 | grep thing2
```

与 `stdbuf` 不同，它始终有效，但可能带来副作用，例如 `grep thing1` 也会对匹配项着色。

如需安装 unbuffer，它位于 `expect` 软件包中。

### 以上就是我所知的所有方案！

很难说哪个“最好”，我个人最倾向于使用 `unbuffer`，因为我知道它始终有效。

如果了解到更多方案，我会尝试补充到本文中。

### 我不太确定这种情况有多常见

对我来说，像这样让程序缓慢地将数据流入管道的情况并不常见。通常使用管道时，大量数据会快速写入，经管道中所有程序处理后退出。目前我能想到的例子只有：

-   tcpdump
-   `tail -f`
-   通过其他方式查看日志文件，如 `kubectl logs`
-   慢速计算的输出

### 如果存在禁用缓冲的环境变量会怎样？

我认为如果能有一个标准的环境变量来关闭缓冲会很酷，比如 Python 中的 `PYTHONUNBUFFERED`。这个想法源于 Mark Dominus 在 2018 年的[几篇](https://blog.plover.com/Unix/stdio-buffering.html)[博文](https://blog.plover.com/Unix/stdio-buffering-2.html)。也许可以像 [NO_COLOR](https://no-color.org/) 那样使用 `NO_BUFFER`？

设计起来似乎很棘手；Mark 指出 NETBSD 拥有名为 `STDBUF`、`STDBUF1` 等的[环境变量](https://man.netbsd.org/setbuf.3)，可对缓冲进行精细控制，但我想大多数开发者并不想为实现一个相对次要的边界情况而处理这么多不同的环境变量。

我也很好奇是否有程序会在一定时间后（如 1 秒）自动刷新输出缓冲区。理论上这似乎不错，但我想不到任何程序这样做，因此我猜测存在一些缺点。

### 未提及的内容

本文未讨论某些内容，因为最近这些博文篇幅越来越长，说真的，有人真的想读 3000 字关于缓冲的文章吗？

-   行缓冲与完全无缓冲输出之间的区别
-   标准错误输出（stderr）与标准输出（stdout）在缓冲机制上的差异
-   本文仅讨论**程序内部**发生的缓冲行为，操作系统TTY驱动有时也会进行少量缓冲
-   除了“正在向管道写入数据”之外，其他可能需要刷新输出的原因
