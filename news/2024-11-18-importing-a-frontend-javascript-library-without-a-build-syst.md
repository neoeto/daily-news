---
title: Importing a frontend Javascript library without a build system
url: 'https://jvns.ca/blog/2024/11/18/how-to-import-a-javascript-library/'
url_hash: 4627af0e4a735f38655696e078077d61fb09279b
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2024-11-18T09:35:42.000Z
lang: zh
translated: true
tags:
  - 前端
  - AI
original_lang: en
truncated: false
---
我喜欢用[无构建系统的方式](https://jvns.ca/blog/2023/02/16/writing-javascript-without-a-build-system/)写JavaScript，但昨天又遇到老问题：我需要在不使用构建系统的情况下导入一个JavaScript库，结果花了**巨长时间**才搞明白怎么导入——因为库的安装说明默认你用了构建系统。

好在现在我已经基本学会如何应对这种情况：要么成功用上这个库，要么判断太麻烦就换另一个库。所以这篇指南正是我多年前就希望看到的——关于如何在不使用构建系统时导入JavaScript库。

我只讨论前端场景下的JavaScript库使用，且仅限无构建系统的配置。

本文将涵盖：

1.  库可能提供的三种主要JavaScript文件类型（ES模块、经典全局变量型、CommonJS）
2.  如何判断库的构建产物包含哪些文件类型
3.  在代码中导入每种文件类型的方法

### 三种JavaScript文件类型

库可能提供三种基础JavaScript文件类型：

1.  **经典型**：定义全局变量的文件。直接`<script src>`就能用。能拿到这种文件最好，但并非总有
2.  **ES模块**（可能依赖其他文件，后续会说明）
3.  **CommonJS模块**：用于Node环境，不借助构建系统无法在浏览器使用

我不确定"经典型"是否有更专业的名称，暂且这么称呼。还有一种叫"AMD"的类型，但不确定2024年是否还常用。

既然知道了三种文件类型，接下来看看如何判断库实际提供了哪种！

### 文件来源：NPM构建产物

每个JavaScript库都会将**构建产物**上传到NPM。你可能会想（和我当初一样）：Julia！我们明明不用Node构建库，为什么还要提NPM？

但如果你使用CDN链接（如[https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js](https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js)），你仍然在使用NPM构建产物！CDN上的所有文件最初都来自NPM。

正因如此，我有时会忍不住 `npm install` 某个库，即便我根本没打算用 Node 来构建项目——我只会新建一个临时文件夹，在里面执行 `npm install`，用完就删掉。我喜欢在本地文件系统中翻看 NPM 构建的文件，因为这样我能百分百确定库在构建中提供了哪些内容，而 CDN 不会对我有所隐藏。

那么，让我们 `npm install` 几个库，看看它们构建时提供了哪些类型的 JavaScript 文件吧！

### 示例库 1：chart.js

首先来看看 [Chart.js](https://www.chartjs.org)，一个绘图库。

```
$ cd /tmp/whatever
$ npm install chart.js
$ cd node_modules/chart.js/dist
$ ls *.*js
chart.cjs  chart.js  chart.umd.js  helpers.cjs  helpers.js
```

这个库似乎提供了 3 种基本选项：

**选项 1：`chart.cjs`**。`.cjs` 后缀表明这是一个 **CommonJS 文件**，用于 Node 环境。这意味着如果不经过某种构建步骤，就无法直接在浏览器中使用它。

**选项 2：`chart.js`**。仅凭 `.js` 后缀无法判断文件类型，但打开后，我看到 `import '@kurkle/color';`，这立即表明它是一个 ES 模块——`import ...` 语法正是 ES 模块的语法。

**选项 3：`chart.umd.js`**。“UMD” 代表“通用模块定义”（Universal Module Definition），我认为这意味着你可以通过基本的 `<script src>`、CommonJS 或第三种我不太懂的 AMD 方式来使用这个文件。

### 如何使用 UMD 文件

当我使用 Chart.js 时，我选择了选项 3。只需在代码中添加以下内容：

```
<script src="./chart.umd.js"> </script>
```

然后我就可以通过全局变量 `Chart` 来使用这个库了。再简单不过了。我直接把 `chart.umd.js` 复制到了我的 Git 仓库中，这样就不用担心使用 NPM 或 CDN 出问题之类的事情了。

### 构建文件并不总是在 `dist` 目录中

很多库会把构建文件放在 `dist` 目录中，但并非总是如此！构建文件的位置由库的 `package.json` 指定。

例如，以下是 Chart.js 的 `package.json` 中的一段内容：

```
  "jsdelivr": "./dist/chart.umd.js",
  "unpkg": "./dist/chart.umd.js",
  "main": "./dist/chart.cjs",
  "module": "./dist/chart.js",
```

我认为这表示，如果你想使用 ES 模块（`module`），应该用 `dist/chart.js`，而 jsDelivr 和 unpkg CDN 应该使用 `./dist/chart.umd.js`。我猜 `main` 是给 Node 用的。

`chart.js` 的 `package.json` 还包含了 `"type": "module"`，根据[这份文档](https://nodejs.org/api/packages.html#modules-packages)的说法，这告诉 Node 默认将文件视为 ES 模块。我认为它并没有具体说明哪些文件是 ES 模块、哪些不是，但确实表明其中*某些*文件是 ES 模块。

### 示例库 2：`@atcute/oauth-browser-client`

[`@atcute/oauth-browser-client`](https://github.com/mary-ext/atcute/tree/trunk/packages/oauth/browser-client) 是一个用于在浏览器中通过 OAuth 登录 Bluesky 的库。

来看看它的构建包里提供了哪些 JavaScript 文件！

```
$ npm install @atcute/oauth-browser-client
$ cd node_modules/@atcute/oauth-browser-client/dist
$ ls *js
constants.js  dpop.js  environment.js  errors.js  index.js  resolvers.js
```

这里面唯一看起来像根文件的只有 `index.js`，内容大致如下：

```
export { configureOAuth } from './environment.js';
export * from './errors.js';
export * from './resolvers.js';
```

这种 `export` 语法意味着它是一个 **ES 模块**。也就是说，我们可以在浏览器中直接使用它，无需构建步骤！来看看具体怎么做。

### 如何配合 importmap 使用 ES 模块

使用 ES 模块并不像直接加个 `<script src="whatever.js">` 那么简单。如果 ES 模块有依赖（比如 `@atcute/oauth-browser-client` 就有），步骤如下：

1.  在 HTML 中设置一个 import map
2.  在 JS 代码中写入类似 `import { configureOAuth } from '@atcute/oauth-browser-client';` 的导入语句
3.  在 HTML 中这样引入你的 JS 代码：`<script type="module" src="你的脚本.js"></script>`

为什么需要 import map，而不能直接写成 `import { BrowserOAuthClient } from "./oauth-client-browser.js"` 呢？因为模块内部还有更多导入语句，比如 `import {something} from @atcute/client`，我们需要告诉浏览器去哪里获取 `@atcute/client` 及其所有其他依赖的代码。

以下是我为 `@atcute/oauth-browser-client` 使用的 importmap 示例：

```
<script type="importmap">
{
  "imports": {
    "nanoid": "./node_modules/nanoid/bin/dist/index.js",
    "nanoid/non-secure": "./node_modules/nanoid/non-secure/index.js",
    "nanoid/url-alphabet": "./node_modules/nanoid/url-alphabet/dist/index.js",
    "@atcute/oauth-browser-client": "./node_modules/@atcute/oauth-browser-client/dist/index.js",
    "@atcute/client": "./node_modules/@atcute/client/dist/index.js",
    "@atcute/client/utils/did": "./node_modules/@atcute/client/dist/utils/did.js"
  }
}
</script>
```

让这些 import map 正常工作相当繁琐，我觉得肯定有工具能自动生成它们，但我还没找到。虽然完全可以写一个脚本，利用 [esbuild 的 metafile](https://esbuild.github.io/api/#metafile) 自动生成 importmap，但我还没做，而且也许有更好的方法。

我昨天决定设置 importmap，让 [github.com/jvns/bsky-oauth-example](https://github.com/jvns/bsky-oauth-example) 能跑起来，所以那个仓库里有一些示例代码。

另外，有人向我推荐了 Simon Willison 的 [download-esm](https://simonwillison.net/2023/May/2/download-esm/)，它可以下载 ES 模块并重写导入路径，直接指向 JS 文件，这样就不需要 importmap 了。我还没试过，但这看起来是个好主意。

### importmap 的问题：文件太多

不过，在浏览器中使用 importmap 确实遇到了一些问题——加载我的网站需要下载几十个 JavaScript 文件，而我的开发服务器不知为何跟不上。我经常看到文件随机加载失败，然后不得不刷新页面，祈祷这次能成功。

当我将网站部署到生产环境后，这个问题就不再出现了，所以估计是我本地开发环境的问题。

另外，ES 模块还有一个让人略感不便的地方：你必须运行一个 Web 服务器才能使用它们。我知道这肯定有充分的理由，但如果能直接打开 `index.html` 文件而无需启动服务器，那会更方便。

由于“文件太多”的问题，我觉得像这样使用带 importmap 的 ES 模块其实对我没那么有吸引力，但知道这是可行的也不错。

### 如何在不使用 importmap 的情况下使用 ES 模块

如果 ES 模块没有依赖项，那就更简单了——你根本不需要 importmap！只需：

-   在 HTML 中放入 `<script type="module" src="YOURCODE.js"></script>`。`type="module"` 很重要。
-   在 `YOURCODE.js` 中放入 `import {whatever} from "https://example.com/whatever.js"`。

### 替代方案：使用 esbuild

如果你不想用 importmap，也可以使用像 [esbuild](https://esbuild.github.io/) 这样的构建系统。我在 [Some notes on using esbuild](https://jvns.ca/blog/2021/11/15/esbuild-vue/) 中讨论过如何操作，但这篇博文主要讲的是完全避免构建系统的方法，所以这里我就不展开说了。不过我还是很喜欢 esbuild，并且认为在这种情况下它是一个不错的选择。

### importmap 的浏览器支持情况如何？

[CanIUse](https://caniuse.com/import-maps) 显示 importmap 处于“Baseline 2023：在主流浏览器中新近可用”，所以我的感觉是，在 2024 年这也许还有点新？我想我会在仅供我自己和 12 个人使用的趣味实验性代码中使用 importmap，但如果我希望代码能被更广泛地使用，我会改用 `esbuild`。

### 示例库 3：`@atproto/oauth-client-browser`

我们来看最后一个示例库！这是一个与 `@atcute/oauth-browser-client` 不同的 Bluesky 认证库。

```
$ npm install @atproto/oauth-client-browser
$ cd node_modules/@atproto/oauth-client-browser/dist
$ ls *js
browser-oauth-client.js  browser-oauth-database.js  browser-runtime-implementation.js  errors.js  index.js  indexed-db-store.js  util.js
```

同样，这里唯一真正可能的候选文件似乎是 `index.js`。但这次的情况与之前的示例库不同！我们来看看 `index.js`：

`index.js` 中有很多类似这样的内容：

```
__exportStar(require("@atproto/oauth-client"), exports);
__exportStar(require("./browser-oauth-client.js"), exports);
__exportStar(require("./errors.js"), exports);
var util_js_1 = require("./util.js");
```

这种 `require()` 语法是 CommonJS 语法，这意味着我们根本无法在浏览器中使用这个文件，需要某种构建步骤，而且 ESBuild 也无法处理。

另外，这个库的 `package.json` 中写着 `"type": "commonjs"`，这也是表明它是 CommonJS 的一个方式。

### 如何通过 [esm.sh](https://esm.sh) 使用 CommonJS 模块

起初我以为不学习构建系统就不可能使用 CommonJS 模块，但后来 Bluesky 上有人告诉了我 [esm.sh](https://esm.sh)！它是一个 CDN，可以将任何内容转换为 ES 模块。[skypack.dev](https://www.skypack.dev/) 也提供类似功能，我不太确定它们有什么区别，但有人提到，如果其中一个不行，有时他们会尝试另一个。

对于 `@atproto/oauth-client-browser`，使用起来似乎相当简单，我只需要在 HTML 中放入：

```
<script type="module" src="script.js"> </script>
```

然后在 `script.js` 中放入：

```
import { BrowserOAuthClient } from "https://esm.sh/@atproto/oauth-client-browser@0.3.0"
```

它似乎就是能正常工作，这很酷！当然，这本质上还是在用构建系统——只不过现在是 esm.sh 替我运行构建，而不是我自己来。我对这种做法的担忧主要有：

-   我不太相信 CDN 能永远稳定运行——通常我喜欢把依赖复制到自己的仓库里，以防将来因为某些原因它们不可用。
-   我听说过一些 CDN 出现安全漏洞的问题，这让我很担心。
-   我不太理解 esm.sh 具体在做什么。

### esbuild 也能将 CommonJS 模块转换为 ES 模块

我还了解到，你也可以用 `esbuild` 将 CommonJS 模块转换为 ES 模块，不过有一些限制——`import { BrowserOAuthClient } from` 这种语法行不通。这里有一个 [相关的 GitHub issue](https://github.com/evanw/esbuild/issues/442)。

我觉得 `esbuild` 的方法可能比 `esm.sh` 的方法更吸引我，因为它是我电脑上已有的工具，所以我更信任它。不过，我目前还没有在这方面做太多尝试。

### 三种文件类型的总结

下面是你可能遇到的三种 JS 文件类型的总结，包括如何使用它们以及如何识别它们。

不太方便的是，`.js` 或 `.min.js` 文件扩展名可能对应这三种类型中的任何一种，所以如果文件是 `something.js`，你需要进一步调查才能确定你面对的是哪种类型。

1.  **“经典” JS 文件**
    -   **使用方法：** `<script src="whatever.js"></script>`
    -   **识别方法：**
        -   网站的安装说明中有醒目的横幅写着“配合 CDN 使用！”之类的话
        -   扩展名为 `.umd.js`
        -   直接尝试把它放在 `<script src=...` 标签里，看看是否有效
2.  **ES 模块**
    -   **使用方法：**
        -   如果没有依赖，直接在代码中使用 `import {whatever} from "./my-module.js"`
        -   如果有依赖，创建一个 importmap，然后使用 `import {whatever} from "my-module"`
            -   或者使用 [download-esm](https://simonwillison.net/2023/May/2/download-esm/) 来避免使用 importmap
        -   使用 [esbuild](https://esbuild.github.io/) 或任何 ES 模块打包工具
    -   **识别方法：**
        -   查找 `import` 或 `export` 语句（注意不是 `module.exports = ...`，那是 CommonJS）
        -   扩展名为 `.mjs`
        -   可能在 `package.json` 中有 `"type": "module"`（不过我不太确定这具体指的是哪个文件）
3.  **CommonJS 模块**
    -   **使用方法：**
        -   使用 [https://esm.sh](https://esm.sh/#docs) 将其转换为 ES 模块，例如 `https://esm.sh/@atproto/oauth-client-browser@0.3.0`
        -   以某种方式使用构建工具（？？）
    -   **识别方法：**
        -   在代码中查找 `require()` 或 `module.exports = ...`
        -   扩展名为 `.cjs`
        -   可能在 `package.json` 中有 `"type": "commonjs"`（不过我不太确定这具体指的是哪个文件）

### ES 模块标准化真是太好了

在我看来，CommonJS 模块与 ES 模块的主要区别在于：ES 模块是真正的标准。这让我在使用它们时更有信心，因为浏览器对 Web 标准的向后兼容性承诺是永久的——如果今天我使用 ES 模块编写代码，可以确信它在 15 年后依然能正常运行。

这也让我对使用像 `esbuild` 这样的工具感到更安心，因为即使 esbuild 项目停止维护，由于它实现的是标准，未来很可能会有其他类似工具可以替代它。

### JS 社区构建了许多非常酷的工具

每当我谈论这些内容时，经常会收到类似“我讨厌 JavaScript！！！它是最烂的！！！”这样的回复。但我的体验是，JavaScript 有很多优秀的工具（我昨天刚了解到 [https://esm.sh](https://esm.sh)，看起来很棒！我很喜欢 esbuild！），只要花时间学习它们的工作原理，就能利用这些工具让工作更轻松。

所以这篇文章的目的绝不是抱怨 JavaScript，而是理解整个生态，以便我能以让自己舒服的方式使用这些工具。

### 我仍有的疑问

以下是我尚未解决的问题，如果找到答案我会更新到文章中。

-   是否有工具能为本地配置的 ES 模块自动生成 importmap？（似乎有：[jspm](https://jspm.org/getting-started)）
-   如何像 [https://esm.sh](https://esm.sh) 那样在本地将 CommonJS 模块转换为 ES 模块？（似乎 esbuild 可以部分实现，但[命名导出无法正常工作](https://github.com/evanw/esbuild/issues/442)）
-   当人们将 CommonJS 模块编译为常规 JS 代码时，实际执行编译的是什么代码？显然有 webpack、rollup、esbuild 等工具，但这些工具都实现自己的 JS 解析器/静态分析吗？目前有多少种 JS 解析器？
-   有没有办法将 ES 模块打包成单个文件（如 `atcute-client.js`），但在浏览器中仍能从该文件导入多个不同路径（如同时导入 `@atcute/client/lexicons` 和 `@atcute/client`）？

### 所有工具

以下是本文讨论的所有工具列表：

-   Simon Willison 的 [download-esm](https://simonwillison.net/2023/May/2/download-esm/)，可下载 ES 模块并将导入路径转换为指向 JS 文件，从而无需 importmap
-   [https://esm.sh/](esm.sh) 和 [skypack.dev](https://www.skypack.dev/)
-   [esbuild](https://esbuild.github.io/)
-   [JSPM](https://jspm.org/getting-started) 可生成 importmap

撰写这篇文章让我意识到，虽然我通常不希望每次更新项目时都运行构建流程，但我可能愿意在**项目初始化时仅运行一次**构建步骤（使用 `download-esm` 或类似工具），之后除非更新依赖版本，否则不再运行。

### 以上就是全部内容！

感谢 [Marco Rogers](https://polotek.net/)，他教会了我这篇文章中的许多内容。我可能在文中犯了一些错误，很想知道是哪些——欢迎在 Bluesky 或 Mastodon 上告诉我！
