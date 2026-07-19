---
title: How to add a directory to your PATH
url: 'https://jvns.ca/blog/2025/02/13/how-to-add-a-directory-to-your-path/'
url_hash: fd27e61e7aae8c8eb9c46f15f91492b3d7e18b30
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2025-02-13T12:27:56.000Z
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
今天我和朋友聊到如何把目录添加到 PATH 里。对我来说，这似乎是件“显而易见”的事，毕竟我用终端已经很久了。但当我搜索具体操作步骤时，却找不到一个能完整解释所有环节的教程——很多教程只说“把它加到 `~/.bashrc` 里”，可如果你用的不是 bash 呢？如果你的 bash 配置实际上在另一个文件里呢？而且，你又怎么知道该添加哪个目录呢？

所以我打算试着写一份更完整的指南，并提一下这些年我遇到过的几个坑。

以下是目录：

-   [第一步：你用的什么 shell？](#第一步你用的什么-shell)
-   [第二步：找到你的 shell 配置文件](#第二步找到你的-shell-配置文件)
    -   [关于 bash 配置文件的说明](#关于-bash-配置文件的说明)
-   [第三步：确定要添加哪个目录](#第三步确定要添加哪个目录)
    -   [第三步.1：再次确认目录是否正确](#第三步1再次确认目录是否正确)
-   [第四步：编辑你的 shell 配置](#第四步编辑你的-shell-配置)
-   [第五步：重启你的 shell](#第五步重启你的-shell)
-   常见问题：
    -   [问题 1：运行了错误的程序](#问题-1运行了错误的程序)
    -   [问题 2：程序没有从你的 shell 中运行](#问题-2程序没有从你的-shell-中运行)
    -   [问题 3：PATH 条目重复，增加调试难度](#问题-3path-条目重复增加调试难度)
    -   [问题 4：更新 PATH 后丢失历史记录](#问题-4更新-path-后丢失历史记录)
-   备注：
    -   [关于 source 的说明](#关于-source-的说明)
    -   [关于 fish_add_path 的说明](#关于-fish_add_path-的说明)

### 第一步：你用的什么 shell？

如果你不确定自己用的什么 shell，可以用这个方法查一下。运行以下命令：

```
ps -p $$ -o pid,comm=
```

-   如果你用的是 **bash**，它会输出 `97295 bash`
-   如果你用的是 **zsh**，它会输出 `97295 zsh`
-   如果你用的是 **fish**，它会输出类似“In fish, please use $fish_pid”的错误（`$$` 在 fish 中不是有效语法，但无论如何，错误信息会告诉你用的是 fish，这你大概早就知道了）

另外，Linux 默认是 bash，Mac OS（截至 2024 年）默认是 zsh。本指南只涵盖 bash、zsh 和 fish。

### 第二步：找到你的 shell 配置文件

-   在 zsh 中，通常是 `~/.zshrc`
-   在 bash 中，可能是 `~/.bashrc`，但情况比较复杂，详见下一节的说明
-   在 fish 中，通常是 `~/.config/fish/config.fish`（如果想 100% 确定，可以运行 `echo $__fish_config_dir`）

### 关于 bash 配置文件的说明

Bash 有三个可能的配置文件：`~/.bashrc`、`~/.bash_profile` 和 `~/.profile`。

如果你不确定系统用的是哪个，我建议这样测试：

1.  在 `~/.bashrc` 中添加 `echo hi there`
2.  重启你的终端
3.  如果看到“hi there”，说明 `~/.bashrc` 正在被使用！太棒了！
4.  否则，删除它，然后用 `~/.bash_profile` 重复同样的操作
5.  如果前两个都不行，还可以试试 `~/.profile`

（网上有很多[详细的流程图](https://blog.flowblok.id.au/2013-02/shell-startup-scripts.html)解释 Bash 如何决定使用哪个配置文件，但我觉得没必要死记硬背，直接测试才是最快确认的方法）

### 第三步：确定要添加的目录

假设你正在尝试安装并运行一个叫 `http-server` 的程序，但运行失败，就像这样：

```
$ npm install -g http-server
$ http-server
bash: http-server: command not found
```

如何找到 `http-server` 所在的目录？老实说，这通常并不容易——答案往往是“取决于 npm 的配置”。这里有几个思路：

-   通常设置新安装工具（如 `cargo`、`npm`、`homebrew` 等）时，首次配置会打印一些关于如何更新 PATH 的说明。所以如果你留意了，当时就能拿到指引。
-   有时安装工具会自动更新你的 shell 配置文件来帮你更新 `PATH`。
-   有时直接搜索“npm 把东西装在哪里？”就能找到答案。
-   有些工具提供了子命令来告诉你它们配置的安装位置，比如：
    -   Node/npm：`npm config get prefix`（然后加上 `/bin/`）
    -   Go：`go env GOPATH`（然后加上 `/bin/`）
    -   asdf：`asdf info | grep ASDF_DIR`（然后加上 `/bin/` 和 `/shims/`）

### 第三步.1：再次确认目录是否正确

找到你认为正确的目录后，务必验证一下！例如，我发现我的机器上 `http-server` 位于 `~/.npm-global/bin`。我可以尝试直接运行该目录下的 `http-server` 程序来确认：

```
$ ~/.npm-global/bin/http-server
Starting up http-server, serving ./public
```

成功了！现在你知道需要添加到 `PATH` 的目录了，进入下一步！

### 第四步：编辑 shell 配置文件

现在我们有了两个关键信息：

1.  你要添加到 PATH 的目录（比如 `~/.npm-global/bin/`）
2.  你的 shell 配置文件位置（比如 `~/.bashrc`、`~/.zshrc` 或 `~/.config/fish/config.fish`）

接下来根据你的 shell 添加内容：

**Bash 操作说明：**

打开 shell 配置文件，添加一行类似这样的内容：

```
export PATH=$PATH:~/.npm-global/bin/
```

（显然，将 `~/.npm-global/bin` 替换为你实际要添加的目录）

**Zsh 操作说明：**

你可以像 Bash 一样操作，但 Zsh 也支持一些更高级的语法，如果你喜欢的话：

```
path=(
  $path
  ~/.npm-global/bin
)
```

**Fish 操作说明：**

在 Fish 中，语法不同：

```
set PATH $PATH ~/.npm-global/bin
```

（在 Fish 中你也可以使用 `fish_add_path`，关于这点[下文有说明](#a-note-on-fish-add-path)）

### 第五步：重启 shell

现在，非常重要的一步：更新 shell 配置文件后，如果不重启 shell，更改不会生效！

有两种方法可以做到：

1.  打开一个新的终端（或终端标签页），最好关闭旧的以免混淆
2.  运行 `bash` 启动一个新的 shell（如果你使用 zsh，则运行 `zsh`；如果使用 fish，则运行 `fish`）

我发现这两种方法通常都能正常工作。

然后你就应该搞定了！尝试运行你之前想运行的程序，希望现在能正常工作。

如果不行，这里有几个你可能遇到的问题：

### 问题 1：运行了错误的程序

如果运行的是错误的**版本**，你可能需要将该目录添加到 PATH 的**开头**而不是末尾。

例如，在我的系统上安装了两个版本的 `python3`，可以通过运行 `which -a` 查看：

```
$ which -a python3
/usr/bin/python3
/opt/homebrew/bin/python3
```

你的 shell 将使用**第一个列出的**版本。

如果你想使用 Homebrew 版本，需要将该目录（`/opt/homebrew/bin`）添加到 PATH 的**开头**，方法是在 shell 的配置文件中写入以下内容（使用 `/opt/homebrew/bin/:$PATH` 而不是通常的 `$PATH:/opt/homebrew/bin/`）：

```
export PATH=/opt/homebrew/bin/:$PATH
```

或者在 fish 中：

```
set PATH ~/.cargo/bin $PATH
```

### 问题 2：程序不是从你的 shell 中运行的

所有这些说明仅在**从你的 shell 中**运行程序时才有效。如果你从 IDE、GUI、cron 作业或其他方式运行程序，则需要以不同的方式将目录添加到 PATH，具体细节可能取决于具体情况。

**在 cron 作业中**

一些选项：

-   使用你要运行的程序的完整路径，例如 `/home/bork/bin/my-program`
-   将你想要的完整 PATH 作为 crontab 的第一行（类似 `PATH=/bin:/usr/bin:/usr/local/bin:…`）。你可以通过在 shell 中运行 `echo "PATH=$PATH"` 来获取你当前使用的完整 PATH。

老实说，我不确定如何在 IDE/GUI 中处理这个问题，因为我已经很久没有遇到这种情况了，如果有人给我指路，我会在这里添加说明。

### 问题 3：重复的 `PATH` 条目使调试更困难

如果你编辑了路径并通过运行 `bash`（或 `zsh`、`fish`）启动一个新的 shell，通常会得到重复的 `PATH` 条目，因为每次启动 shell 时，shell 都会不断向 `PATH` 添加新内容。

就我个人而言，我不认为这种重复会导致任何问题，但如果你试图理解 `PATH` 的内容，重复项可能会使调试变得更困难。

一些处理方法：

1.  如果你在调试 `PATH`，请打开一个新终端来操作，这样能获得一个“干净”的状态，避免重复。
2.  在你的 shell 配置文件的末尾对 `PATH` 进行去重（例如在 zsh 中，你可以用 `typeset -U path` 实现）。
3.  在添加目录时，检查该目录是否已存在于 `PATH` 中（例如在 fish 中，我认为可以用 `fish_add_path --path /some/directory` 实现）。

如何对 `PATH` 去重取决于你使用的 shell，并非所有 shell 都内置了去重功能，因此你需要查阅如何在你使用的 shell 中实现。

### 问题 4：更新 `PATH` 后丢失历史记录

在 bash 或 zsh 中，很容易遇到以下情况：

1.  运行一条命令（它失败了）
2.  更新你的 `PATH`
3.  运行 `bash` 重新加载配置
4.  按几次上箭头重新运行失败的命令（或打开一个新终端）
5.  失败的命令不在历史记录中！为什么？

这是因为在 bash 中，默认情况下，历史记录直到你退出 shell 时才会保存。

一些解决方法：

-   不要运行 `bash` 重新加载配置，而是运行 `source ~/.bashrc`（在 zsh 中运行 `source ~/.zshrc`）。这会在当前会话中重新加载配置。
-   配置你的 shell 持续保存历史记录，而不是仅在 shell 退出时保存。（具体方法取决于你使用的是 bash 还是 zsh，zsh 的历史记录选项有点复杂，我不太确定最佳方式是什么）

### 关于 `source` 的说明

当你首次安装 `cargo`（Rust 的安装器）时，它会提供以下设置 PATH 的说明，这些说明完全没有提及特定目录。

```
通常通过运行以下命令之一来完成（注意开头的点号）：

. "$HOME/.cargo/env"        	# 适用于 sh/bash/zsh/ash/dash/pdksh
source "$HOME/.cargo/env.fish"  # 适用于 fish
```

其思路是，你将这一行添加到 shell 配置中，然后它们的脚本会自动为你设置 `PATH`（以及可能的其他内容）。

这种做法相当常见（例如 [Homebrew](https://github.com/Homebrew/install/blob/deacfa6a6e62e5f4002baf9e1fac7a96e9aa5d41/install.sh#L1072-L1087) 建议你 eval `brew shellenv`），有两种处理方式：

1.  直接按照工具的建议操作（例如将 `. "$HOME/.cargo/env"` 添加到你的 shell 配置中）
2.  弄清楚它们让你运行的脚本会向你的 PATH 添加哪些目录，然后手动添加这些目录。以下是我的做法：
    -   在我的 shell 中运行 `. "$HOME/.cargo/env"`（如果使用 fish，则运行 fish 版本）
    -   运行 `echo "$PATH" | tr ':' '\n' | grep cargo` 来找出它添加了哪些目录
    -   看到它显示 `/Users/bork/.cargo/bin`，将其缩短为 `~/.cargo/bin`
    -   按照本文的说明将目录 `~/.cargo/bin` 添加到 PATH 中

我不认为按照工具建议的方式操作有什么问题（那可能是“最佳方法”！），但个人通常采用第二种方式，因为我更喜欢清楚知道自己正在修改哪个配置。

### 关于 `fish_add_path` 的说明

Fish 有一个名为 `fish_add_path` 的便捷函数，可以这样运行来将目录添加到 `PATH`：

```
fish_add_path /some/directory
```

这个命令很酷（如此简洁！），但我已经停止使用它，原因有二：

1.  `fish_add_path` 有时会更新未来所有会话的 `PATH`（通过“通用变量”），有时又只更新当前会话的 `PATH`，我很难判断它会采用哪种方式。理论上文档有解释，但我理解不了。
2.  如果几周或几个月后因操作失误需要*移除* `PATH` 中的目录，操作起来相当困难（不过 [这个 GitHub issue 的评论中有相关说明](https://github.com/fish-shell/fish-shell/issues/8604)）。

### 总结

希望这对某些人有帮助。如果你在向 PATH 添加目录时遇到过其他重大陷阱，或对本文有疑问，欢迎（在 Mastodon 或 Bluesky 上）告诉我！
