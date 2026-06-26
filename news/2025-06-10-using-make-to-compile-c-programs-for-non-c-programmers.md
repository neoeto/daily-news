---
title: Using `make` to compile C programs (for non-C-programmers)
url: 'https://jvns.ca/blog/2025/06/10/how-to-compile-a-c-program/'
url_hash: d45bdf1588f5d7ed46809ed499d18597f94d4fe2
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2025-06-10T00:00:00.000Z
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
我从来不是C语言程序员，但时不时需要从源码编译C/C++程序。这对我来说一直是个挑战：很长一段时间里，我的方法基本上是“安装依赖，运行`make`，如果不行，要么找别人编译好的二进制文件，要么放弃”。

在Linux上运行时，“指望别人编译好了”这招还挺管用，但自从过去几年改用Mac后，我遇到越来越多需要自己编译程序的情况。

那么，我们来聊聊编译C程序可能需要做哪些事！我会用几个我实际编译过的C程序作为例子，谈谈可能出问题的地方。下面是我们将要讨论编译的三个程序：

-   [paperjam](https://mj.ucw.cz/sw/paperjam/)
-   [sqlite](https://www.sqlite.org/download.html)
-   [qf](https://git.causal.agency/src/tree/bin/qf.c)（一个分页器，可以用`rg -n THING | qf`快速从搜索结果中打开文件）

### 第一步：安装C编译器

这很简单：在Ubuntu系统上，如果还没有C编译器，我会这样安装：

```
sudo apt-get install build-essential
```

这会安装`gcc`、`g++`和`make`。在Mac上的情况更复杂一些，大致是“安装xcode命令行工具”。

### 第二步：安装程序的依赖

与一些较新的编程语言不同，C语言没有依赖管理器。所以如果程序有任何依赖，你需要自己去找。不过正因如此，C程序员通常会将依赖保持得非常精简，而且这些依赖通常在你使用的包管理器中都能找到。

README中几乎总会有说明如何获取依赖的部分，例如在[paperjam](https://mj.ucw.cz/sw/paperjam/)的README中写道：

> 要编译PaperJam，你需要libqpdf和libpaper库的头文件（通常以libqpdf-dev和libpaper-dev包的形式提供）。

> 构建手册页可能需要`a2x`（位于[AsciiDoc](http://www.methods.co.nz/asciidoc/a2x.1.html)中）。

所以在基于Debian的系统上，你可以这样安装依赖：

```
sudo apt install -y libqpdf-dev libpaper-dev
```

如果README给出了包名（比如`libqpdf-dev`），我基本都会认为它指的是“在基于Debian的Linux发行版中”：如果你在Mac上，`brew install libqpdf-dev`是行不通的。我至今还没完全掌握在Mac上开发的要领，所以这方面没什么建议。我猜如果使用Homebrew，这种情况应该是`brew install qpdf`。

### 第三步：运行`./configure`（如果需要）

有些C程序自带`Makefile`，而有些则带有一个名为`./configure`的脚本。例如，如果你下载[sqlite的源码](https://www.sqlite.org/download.html)，它里面有一个`./configure`脚本，而不是Makefile。

我对这个`./configure`脚本的理解是：

1.  运行它，会输出大量难以理解的文本，然后要么生成一个 `Makefile`，要么因为缺少某个依赖而失败。
2.  `./configure` 脚本是一个名为 [autotools](https://www.gnu.org/software/automake/manual/html_node/Autotools-Introduction.html) 的系统的一部分，我从未需要了解它除了“运行它以生成 `Makefile`”之外的任何内容。

我想可能有一些选项可以传递给 `./configure` 脚本，以生成不同的 `Makefile`，但我从未这样做过。

### 第 4 步：运行 `make`

下一步是运行 `make` 来尝试构建程序。关于 `make` 的一些说明：

-   有时你可以运行 `make -j8` 来并行化构建过程，使其更快。
-   编译程序时，它通常会打印出大量的编译器警告。我总是忽略它们。软件又不是我写的！编译器警告不是我的问题。

### 编译器错误通常是依赖问题

这是我在 Mac 上编译 `paperjam` 时遇到的一个错误：

```
/opt/homebrew/Cellar/qpdf/12.0.0/include/qpdf/InputSource.hh:85:19: error: function definition does not declare parameters
   85 |     qpdf_offset_t last_offset{0};
      |                   ^
```

多年来，我学到最好不要过度思考这类问题：如果它提到了 `qpdf`，那么很可能只是意味着我在包含 `qpdf` 依赖时做错了什么。

现在，我们来谈谈一些以正确方式包含 `qpdf` 依赖的方法。

### 关于编译器和链接器的极简介绍

在讨论如何解决依赖问题之前：构建 C 程序分为两个步骤：

1.  **编译**代码为**目标文件**（使用 `gcc` 或 `clang`）
2.  **链接**这些目标文件为最终的可执行文件（使用 `ld`）

在构建 C 程序时了解这一点很重要，因为有时你需要向编译器和链接器传递正确的标志，告诉它们在哪里可以找到你要编译的程序的依赖。

### `make` 使用环境变量来配置编译器和链接器

如果我在 Mac 上运行 `make` 来安装 `paperjam`，会得到这个错误：

```
c++ -o paperjam paperjam.o pdf-tools.o parse.o cmds.o pdf.o -lqpdf -lpaper
ld: library 'qpdf' not found
```

这并不是因为我的系统上没有安装 `qpdf`（实际上已经安装了！）。但编译器和链接器不知道如何*找到* `qpdf` 库。要解决这个问题，我们需要：

-   向编译器传递 `"-I/opt/homebrew/include"`（告诉它在哪里找到头文件）
-   向链接器传递 `"-L/opt/homebrew/lib -liconv"`（告诉它在哪里找到库文件，并链接 `iconv`）

我们可以使用环境变量让 `make` 将这些额外参数传递给编译器和链接器！要了解这是如何工作的：在 `paperjam` 的 Makefile 中，你可以看到许多环境变量，比如这里的 `LDLIBS`：

```
paperjam: $(OBJS)
	$(LD) -o $@ $^ $(LDLIBS)
```

你放入 `LDLIBS` 环境变量中的所有内容都会作为命令行参数传递给链接器（`ld`）。

### 秘密环境变量：`CPPFLAGS`

`Makefiles` 有时会定义自己的环境变量传递给编译器/链接器，但 `make` 也有一堆“隐式”环境变量，会自动传递给 C 编译器和链接器。这里有一份[隐式环境变量的完整列表](https://www.gnu.org/software/make/manual/html_node/Implicit-Variables.html#index-CFLAGS0)，其中一个是 `CPPFLAGS`，它会自动传递给 C 编译器。

（严格来说，更常规的做法是使用 `CXXFLAGS`，但这个特定的 `Makefile` 硬编码了 `CXXFLAGS`，所以设置 `CPPFLAGS` 是我找到的唯一无需编辑 `Makefile` 就能设置编译器标志的方法）

顺便说一句：我花了很长时间才意识到 `make` 与 C/C++ 的紧密联系——我以前以为 `make` 只是一个通用的构建系统（当然你可以用它做任何事！），但它为构建 C/C++ 程序提供了很多便利，而这些便利在构建其他类型的程序时并不存在。

### 向 `make` 传递环境变量的两种方式

感谢 [@zwol](https://www.owlfolio.org/)，我了解到实际上有两种向 `make` 传递环境变量的方式：

1.  `CXXFLAGS=xyz make`（常规方式）
2.  `make CXXFLAGS=xyz`

两者的区别在于：`make CXXFLAGS=xyz` 会覆盖 `Makefile` 中设置的 `CXXFLAGS` 值，而 `CXXFLAGS=xyz make` 则不会。

我不确定哪种方式更常见，但本文中我将使用第一种方式。

### 如何使用 `CPPFLAGS` 和 `LDLIBS` 修复这个编译器错误

既然我们已经讨论了 `CPPFLAGS` 和 `LDLIBS` 如何传递给编译器和链接器，下面是我用来成功构建程序的最终命令：

```
CPPFLAGS="-I/opt/homebrew/include" LDLIBS="-L/opt/homebrew/lib -liconv" make paperjam
```

这条命令将 `-I/opt/homebrew/include` 传递给编译器，将 `-L/opt/homebrew/lib -liconv` 传递给链接器。

另外，我不想假装自己“神奇地”知道这些是正确的参数，实际上弄清楚它们的过程涉及大量混乱的谷歌搜索，本文中我跳过了这部分。但我要说明的是：

-   `-I` 编译器标志告诉编译器在哪里查找头文件，例如 `/opt/homebrew/include/qpdf/QPDF.hh`
-   `-L` 链接器标志告诉链接器在哪里查找库文件，例如 `/opt/homebrew/lib/libqpdf.a`
-   `-l` 链接器标志告诉链接器要链接哪些库，例如 `-liconv` 表示“链接 `iconv` 库”，而 `-lm` 表示“链接 `math` 库”

### 小技巧：如何只构建特定文件：`make $FILENAME`

昨天我发现了一个很酷的工具叫 [qf](https://git.causal.agency/src/tree/bin/qf.c)，可以用它从 `ripgrep` 的输出中快速打开文件。

`qf` 位于一个包含各种工具的大目录中，但我只想编译 `qf`。所以我这样只编译了 `qf`：

```
make qf
```

基本上，如果你知道（或能猜到）要构建文件的输出文件名，就可以通过运行 `make $FILENAME` 告诉 `make` 只构建那个文件。

### 小技巧：你不需要 Makefile

我有时会写一些只有5行、没有任何依赖的C程序，刚发现如果有个叫`blah.c`的文件，不用创建`Makefile`也能这样编译：

```
make blah
```

它会自动扩展成`cc -o blah blah.c`，能省点打字功夫。我不确定自己能不能记住这个技巧（可能还是会继续敲`gcc -o blah blah.c`），但感觉是个挺有趣的窍门。

### 小贴士：看看其他打包系统是怎么构建同一个C程序的

如果你在构建C程序时遇到困难，说不定别人也遇到过！每个Linux发行版都会为它们构建的每个软件包准备构建文件，所以即使不能直接安装那个发行版的软件包，也能从它的构建方式中获得启发。意识到这一点（多亏了我的朋友Dave）对我来说是个醍醐灌顶的时刻。

比如，[nix的`paperjam`软件包中的这行代码](https://github.com/NixOS/nixpkgs/blob/405624e81a9b65378328accb0a11c3e5369e651c/pkgs/by-name/pa/paperjam/package.nix#L35)写着：

```
  env.NIX_LDFLAGS = lib.optionalString stdenv.hostPlatform.isDarwin "-liconv";
```

这基本就是在说"在Mac上构建时传递链接器标志`-liconv`"，所以这给了我们构建它的线索。

同一个文件里还有`env.NIX_CFLAGS_COMPILE = "-DPOINTERHOLDER_TRANSITION=1";`。我不太确定这是什么意思，但当我尝试构建`paperjam`包时，确实遇到了一个关于`PointerHolder`的错误，所以这大概和"PointerHolder过渡"有关。

### 第5步：安装二进制文件

一旦成功编译了程序，你可能想把它安装到某个地方！有些`Makefile`提供了`install`目标，可以用`make install`把工具安装到系统上。我对此总是有点担心（它会往哪里放文件？以后想卸载怎么办？），所以如果编译的是比较简单的程序，我通常会手动复制二进制文件来安装，像这样：

```
cp qf ~/bin
```

### 第6步：也许自己做个软件包！

等我搞明白所有这些步骤后，意识到可以用新学的`make`知识为Homebrew贡献一个`paperjam`软件包！这样以后在新系统上就能直接用`brew install paperjam`了。

好消息是，尽管不同打包系统的具体细节各不相同，但它们本质上都使用C编译器和链接器。

### 即使不是C程序员，了解一点C也很有用

我觉得这很有意思地说明了，即使你一辈子都不打算写什么正经的C程序，了解一些C程序的基本原理（比如"它们有头文件"）也是很有用的。

能够自己编译C/C++程序的感觉真好，尽管我对编译器和链接器的各种标志仍然没有完全把握，而且我依然打算除了“运行`./configure`来生成`Makefile`”之外，永远不去了解autotools的任何工作原理。

这篇文章里我漏掉了两件事：

-   `LD_LIBRARY_PATH / DYLD_LIBRARY_PATH`（用于在运行时告诉动态链接器去哪里找动态链接文件），因为我记不清上次遇到`LD_LIBRARY_PATH`问题却找不到示例是什么时候了。
-   `pkg-config`，我觉得它很重要，但还没完全搞懂。
