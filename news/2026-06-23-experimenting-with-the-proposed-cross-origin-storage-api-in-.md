---
title: Experimenting with the proposed Cross-Origin Storage API in Transformers.js
url: 'https://huggingface.co/blog/cross-origin-storage'
url_hash: dba1e8f05869c4fbe55eb7430287130f88fccd74
source: Hugging Face Blog
source_url: 'https://huggingface.co/blog/feed.xml'
date: 2026-06-23T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
original_lang: en
truncated: false
---
[返回文章列表](https://huggingface.co/blog)

[![Thomas Steiner 的头像](https://cdn-avatars.huggingface.co/v1/production/uploads/noauth/qCHAzPfN19g2BtO9jJDNv.jpeg)](https://huggingface.co/tomayac)

（本文是谷歌 Chrome 团队开发者关系工程师 [Thomas Steiner](https://blog.tomayac.com/) 的客座文章。）

Transformers.js 为 Web 开发者提供了一种简单的方式，通过特定任务的管道（pipeline）在他们的 Web 应用中发挥 transformers 的强大能力。为了在浏览器中运行推理，开发者需要创建一个 [`pipeline()`](https://huggingface.co/docs/transformers.js/en/api/pipelines) 实例，并指定他们想要使用的任务。以下代码片段展示了一个具体示例，说明如何设置自动语音识别（ASR）管道。

```
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';

const asr = await pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny.en',
  { device: 'webgpu' },
);
const result = await asr('jfk.wav');
console.log(result);
```

[![自动语音识别管道的极简示例。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/87a91qnbicf.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/87a91qnbicf.png)

## [](#the-cache-challenge)缓存挑战

你会注意到，在源代码中我指定了 [`Xenova/whisper-tiny.en`](https://huggingface.co/Xenova/whisper-tiny.en) 作为模型，这对于常见的英语自动语音识别任务来说是一个非常不错的选择。事实上，根据 Transformers.js 的[默认模型解析](https://github.com/huggingface/transformers.js/blob/main/packages/transformers/src/pipelines/index.js)（参见链接的[代码片段](https://github.com/huggingface/transformers.js/blob/bc9cf7400f4f2c8695016699f879e31026ff0313/packages/transformers/src/pipelines/index.js#L151-L158)），它甚至就是 *默认* 的 ASR 模型。

### [](#model-resources)模型资源

当你在[浏览器中运行这个示例](https://googlechrome.github.io/samples/transformersjs-automatic-speech-recognition/index.html)时，Transformers.js 会自动下载并缓存相关的模型资源和 Wasm 文件。以下截图展示了访问该应用后 Chrome DevTools 的[缓存存储](https://developer.chrome.com/docs/devtools/storage/cache)部分。当你重新加载页面时，资源会从 [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache) 中提供，模型几乎可以立即返回结果。

[![访问应用后，Chrome DevTools 缓存存储部分显示 Whisper AI 模型资源和 Wasm 运行时文件。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/otd8tt1gusb.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/otd8tt1gusb.png)

然而，`Xenova/whisper-tiny.en` 是一个流行的模型（如前所述，甚至还是 Transformers.js 中 ASR 的默认模型），你可以想象，你访问的不仅仅是一个应用会用到它。为了模拟这种情况，这里还是之前的示例应用，但托管在[不同的源](https://rawcdn.rawgit.net/GoogleChrome/samples/c4192bd7a3c66fc288a7b22b77acb935df00b8a1/transformersjs-automatic-speech-recognition/index.html)上。当你访问这个不同源的应用时，浏览器无法几乎立即使用模型，而是必须重新下载并缓存所有模型资源，即使它们与之前逐字节完全相同。即使在这个简单的示例中，这也导致了 177 MB 的重复下载和存储，你可以在 Chrome DevTools [Application 面板](https://developer.chrome.com/docs/devtools/application#open_the_application_panel)的 **Storage** 部分查看。可以想象，这种情况会迅速累积。

[![Chrome DevTools 存储概览显示使用了 177 MB 存储空间。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/9byoniem0pw.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/9byoniem0pw.png)

### [](#wasm-runtime-resources)Wasm 运行时资源

但情况更糟。让我们在示例中添加第二个管道：情感分析。情感分析[默认](https://github.com/huggingface/transformers.js/blob/bc9cf7400f4f2c8695016699f879e31026ff0313/packages/transformers/src/pipelines/index.js#L65)使用 [`Xenova/distilbert-base-uncased-finetuned-sst-2-english`](https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english) 模型。通过不指定模型，Transformers.js 的默认模型解析会自动为你选择它。

```
const classifier = await pipeline('sentiment-analysis');
const sentiment = await classifier(result.text);
console.log(sentiment);
```

[![image](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/le7l1km7o4g.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/le7l1km7o4g.png)

两个完全不同的 AI 模型，但它们依赖于同一个 4,733 kB 的 `ort-wasm-simd-threaded.asyncify.wasm` WebAssembly（Wasm）运行时文件，该文件来自 Transformers.js 所基于的底层 [ONNX Runtime 库](https://onnxruntime.ai/docs/api/js/interfaces/Env.WasmFilePaths.html#wasm)。打开[不同源上的扩展演示](https://rawcdn.rawgit.net/GoogleChrome/samples/d47114a15637383015c274e7bdcd81e1a17b0ccf/transformersjs-automatic-speech-recognition/index2.html)，你会在 [**Network** 标签页](https://developer.chrome.com/docs/devtools/network#load)中注意到 Wasm 运行时也被重新下载并缓存了。

[![Chrome DevTools 网络面板显示 Wasm 运行时资源的下载过程。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/pz12g20fqeg.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/pz12g20fqeg.png)

因此，即使你运行的应用不共享相同的 AI 模型，你的浏览器仍然会对你已拥有的共享 Wasm 资源发出冗余请求，并且还会再次缓存它们，从而占用硬盘空间。

### [](#cache-isolation)缓存隔离

#### [](#ai-model-resources-serving)AI 模型资源服务

默认情况下，**AI 模型资源**来自 [Hugging Face Hub](https://huggingface.co/docs/hub/en/models-the-hub)，最终由 Hugging Face CDN 提供。浏览器会请求类似 [`https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main/config.json`](https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main/config.json) 的资源，然后该请求会被重定向到最终的 CDN URL，例如本例中的 [`https://huggingface.co/api/resolve-cache/models/Xenova/distilbert-base-uncased-finetuned-sst-2-english/0b6928efcb76139cae2c6881d49cda67fe119f42/config.json?%2FXenova%2Fdistilbert-base-uncased-finetuned-sst-2-english%2Fresolve%2Fmain%2Fconfig.json=&etag=%223c36342ef1f74de2797d667c68c6b7b988d0b87c%22`](https://huggingface.co/api/resolve-cache/models/Xenova/distilbert-base-uncased-finetuned-sst-2-english/0b6928efcb76139cae2c6881d49cda67fe119f42/config.json?%2FXenova%2Fdistilbert-base-uncased-finetuned-sst-2-english%2Fresolve%2Fmain%2Fconfig.json=&etag=%223c36342ef1f74de2797d667c68c6b7b988d0b87c%22)。

#### [](#wasm-runtime-resources-serving)Wasm 运行时资源服务

默认情况下，**Wasm 运行时资源**由 [jsDelivr CDN](https://www.jsdelivr.com/) 提供。例如，在撰写本文时，`ort-wasm-simd-threaded.asyncify.wasm` 来自 [`https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/dist/ort-wasm-simd-threaded.asyncify.wasm`](https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/dist/ort-wasm-simd-threaded.asyncify.wasm)。

现在你可能会说，如果不同的应用，即使运行在不同的源上，最终都从相同的 CDN URL 提供资源，那么只要最终的 URL 相同，缓存就不应该成为问题。不幸的是，长期以来，浏览器的缓存机制并非如此。文章 [通过分区缓存获得安全性和隐私性](https://developer.chrome.com/blog/http-cache-partitioning) 详细介绍了所有细节，但本质上，**缓存是按源隔离的**，以防止时序攻击：网站响应 HTTP 请求所需的时间可能会暴露浏览器过去是否访问过同一资源，从而使浏览器容易受到安全和隐私泄露的攻击。

#### [](#chromes-implementation)Chrome 的实现

具体实现可能因浏览器而异，但在 Chrome 中，缓存资源除了使用**资源 URL** 作为键之外，还使用网络隔离密钥进行键控。网络隔离密钥由**顶级站点**和**当前框架站点**组成。以前面托管在源 `https://googlechrome.github.io` 和 `https://rawcdn.rawgit.net` 上的示例应用为例。如果它们都使用来自 `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/dist/ort-wasm-simd-threaded.asyncify.wasm` 的 Wasm 运行时，它们的缓存键将如下表所示。

| 网络隔离密钥 | **资源 URL** |
| --- | --- |
| **顶级站点** | **当前框架站点** |
|
https://googlechrome.github.io

|

https://googlechrome.github.io

|

https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/dist/ort-wasm-simd-threaded.asyncify.wasm

|
|

https://rawcdn.rawgit.net

|

https://rawcdn.rawgit.net

|

https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0-dev.20260416-b7804b056c/dist/ort-wasm-simd-threaded.asyncify.wasm

|

因此，即使资源 URL 完全相同，由于网络隔离密钥不匹配，也不会发生缓存命中，这意味着重复下载和重复存储。这正是跨源存储提案旨在解决的挑战。

## [](#enter-the-cross-origin-storage-api)跨源存储 API 登场

> **💡 注意：** 跨源存储 API 是一个早期阶段的提案，尚未最终确定。虽然该提案 API 尚未在任何浏览器中原生实现，但你无需等待即可进行实验。安装 [跨源存储扩展](https://chromewebstore.google.com/detail/cross-origin-storage/denpnpcgjgikjpoglpjefakmdcbmlgih) 以在所有页面上注入 `navigator.crossOriginStorage` polyfill 并测试完整流程。

提议的 **[跨源存储](https://github.com/WICG/cross-origin-storage) (COS) API** 引入了一个专用的 `navigator.crossOriginStorage` 接口，通过该接口，Web 应用可以跨源边界存储和检索大文件，这些文件不是通过 URL 标识，而是通过加密哈希标识。

![跨源存储 API 标志：一个风格化的行走人物，通常在人行横道标志上见到。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/klwb5fryaa.png)

关于加密哈希的最后一点是关键。因为 COS 通过文件的**哈希值**而非 URL 或来源来识别文件，所以你在访问 `https://googlechrome.github.io` 时下载的 `ort-wasm-simd-threaded.asyncify.wasm` Wasm 运行时，与 `https://rawcdn.rawgit.net` 即将请求的同一个文件会被识别为相同，无论这两个来源从哪里获取它。请参阅以下代码片段，它展示了基本流程。

```
const hash = {
  algorithm: 'SHA-256',
  value: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
};

try {
  const handle = await navigator.crossOriginStorage.requestFileHandle(hash);
  // 缓存命中！以 Blob 形式获取文件并直接使用。
  const fileBlob = await handle.getFile();
} catch {
  // 缓存未命中。从网络下载，然后存储以供下次使用。
  const fileBlob = await fetch('https://cdn.jsdelivr.net/.../ort-wasm-simd-threaded.asyncify.wasm')
    .then(r => r.blob());
  const handle = await navigator.crossOriginStorage.requestFileHandle(
    hash,
    { create: true, origins: '*' },
  );
  const writableStream = await handle.createWritable();
  await writableStream.write(fileBlob);
  await writableStream.close();
}
```

如果资源在 COS 中，你会得到一个 [`FileSystemFileHandle`](https://developer.mozilla.org/zh-CN/docs/Web/API/FileSystemFileHandle)，可以通过 [`getFile()`](https://developer.mozilla.org/zh-CN/docs/Web/API/FileSystemFileHandle/getFile) 直接读取 blob（生成的 [`File`](https://developer.mozilla.org/zh-CN/docs/Web/API/File) 继承自 [`Blob`](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)）。如果资源不在 COS 中，则回退到网络，并将资源写入 COS，供下一个需要它的应用使用，这个应用可能是你的应用，也可能是另一个不相关的应用，甚至可能来自完全不同的源。

该 API 特意模仿了[文件系统标准](https://fs.spec.whatwg.org/)中的 [`FileSystemDirectoryHandle.getFileHandle()`](https://developer.mozilla.org/zh-CN/docs/Web/API/FileSystemDirectoryHandle/getFileHandle)，你可能从[源私有文件系统](https://developer.mozilla.org/zh-CN/docs/Web/API/File_System_API/Origin_private_file_system)（OPFS）API 中熟悉它。`hash` 参数的作用与 OPFS 中的 `name` 参数相同：唯一标识一个资源。`options.create` 标志的工作方式也相同：缺失或为 `false` 表示只读访问，`true` 表示你打算写入。

### [](#控制谁能读取什么)控制谁能读取什么

并非每个资源都应该全局共享。COS 通过存储文件时的 `origins` 选项，让开发者能够精确控制可见性。

-   设置 `origins: '*'` 会使文件**全局可用**。任何源都可以通过哈希值找到它。这对于 Transformers.js 示例中的 AI 模型资源或 Wasm 运行时来说是正确选择：关键在于整个 Web 上的每个应用都能从单个缓存副本中受益。
-   传递一个特定的源列表，例如 `origins: ['https://write.example.com', 'https://calculate.example.com']`，会**限制**仅这些站点可访问。这适用于公司自有属性之间共享的专有资源，不应被其他人发现，比如商业办公套件中使用的专有校对 AI 模型。
-   完全省略 `origins` 会使文件仅对**[同站](https://web.dev/articles/same-site-same-origin#same-site-cross-site)源**可用。这是跨组织所有子域共享资源时的合理默认设置，但不打算跨越组织边界。

一个重要规则：可见性只能提升，不能降低。如果某个文件已经是全局可用的，后续尝试用受限的 `origins` 列表存储它会被静默忽略。这可以防止恶意行为者重新存储公共资源并缩小其可用范围。反向操作是可行的：最初用受限 `origins` 列表存储的文件，后续可以放宽权限。任何站点（不限于原始存储者）都可以对同一哈希值（哈希值并非秘密）调用 `requestFileHandle()`，并附带 `create: true` 和更宽松的 `origins` 值，只要浏览器验证哈希值匹配，该资源从那一刻起就会对更广泛的受众可用。请注意，升级站点**必须**通过返回的句柄写入完整的文件。这一要求是为了防止站点利用升级路径作为侧信道来检测特定文件是否已存储在 COS 中。

### [](#integrity-by-design)设计上的完整性

COS 一个微妙但重要的特性是：浏览器在写入文件时会**验证哈希值**。如果你写入的数据与声明的哈希值不匹配，写入操作会失败并报错。这使得完整性检查成为自动行为：从 COS 读取文件的应用程序可以确信它获得的就是预期的字节。这与应用程序在网络下载后自行计算哈希值所能获得的保证相同。

这在 Transformers.js 场景中显得尤为有用。如今，下载模型权重后，大多数应用程序没有实际的方法来验证 CDN 是否提供了正确的字节。而使用 COS，存储中的每个文件在写入时都会隐式验证，无论它来自何处——无论是官方的 Hugging Face CDN，还是某个随机站点的自建镜像。

### [](#privacy-without-sacrificing-utility)不牺牲实用性的隐私保护

当然，跨域共享缓存会引发与分区 HTTP 缓存相反的问题：如果任何站点都可以通过哈希值探测文件是否存在，攻击者难道不能通过检查某个游戏引擎的 Wasm 模块是否被缓存来了解用户的浏览历史吗？

COS 通过两种互补机制来解决这个问题：

-   首先，`origins` 字段：不应全局可探测的专有资源，就不应该用 `origins: '*'` 来存储。通过**开发者教育**，鼓励开发者在合适的情况下考虑这一点。
-   其次，**可用性门控**：即使是全局声明的文件，如果它尚未在足够多的不同来源中出现过，浏览器也可能抑制对文件存在性的确认。仅在一两个站点上出现的文件仍可能充当跨站标识符，因此浏览器可能会返回错误，仿佛文件根本不存在，无论磁盘上实际有什么。在 Chrome 团队中，我们意识到不常见资源可能带来的隐私泄露风险，并计划通过限制哪些具体资源可以被缓存来普遍缓解这一问题。具体的缓解措施仍在完善中。

关键的是，这意味着错误并非最终答案。它可能表示“未存储”，也可能表示“已存储，但浏览器未告知你”。应用应始终以相同方式处理：回退到网络。

### [](#what-this-means-for-the-transformersjs-example)这对 Transformers.js 示例意味着什么

回到之前的简单示例：`ort-wasm-simd-threaded.asyncify.wasm` 运行时大小为 4,733 kB，无论使用何种 AI 模型，所有基于 Transformers.js 的应用都会共享它。借助 COS，第一个加载它的应用会下载一次，并以 `origins: '*'` 存储在其 SHA-256 哈希下。后续每个应用，无论来自 `https://googlechrome.github.io`、`https://rawcdn.rawgit.net` 还是其他任何源，都能立即在 COS 中找到它。那 177 MB 重复的 Whisper 模型权重呢？同样如此：`Xenova/whisper-tiny.en` 只下载一次，第二次通过哈希识别，并从 COS 在毫秒内提供。当然，`Xenova/distilbert-base-uncased-finetuned-sst-2-english` 也是如此。

Transformers.js 本身已在库级别试用 COS API。[拉取请求 #1549](https://github.com/huggingface/transformers.js/pull/1549) 引入了一个实验性的 COS 缓存后端，需通过选择加入标志启用。在设置管道前，只需一行代码即可启用：

```
import { env, pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";

// 👇 选择加入实验性的跨源存储缓存后端。
env.experimental_useCrossOriginStorage = true;

const asr = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', { device: 'webgpu' });
const result = await asr('jfk.wav');
console.log(result);
```

注意标志上的 `experimental_` 前缀。这是有意为之，表示底层浏览器 API 尚未标准化，且可能在没有主版本号变更的情况下发生变化。设置该标志后，Transformers.js 会为每个 [Xet 跟踪](https://huggingface.co/docs/hub/en/xet/index) 的模型文件（大型 ONNX 权重文件）解析 SHA-256 哈希，通过获取原始 Xet 指针（[示例原始指针文件](https://huggingface.co/Xenova/whisper-tiny.en/raw/main/onnx/decoder_model.onnx)）并提取其 `oid sha256:` 字段。然后，它使用该哈希作为 `navigator.crossOriginStorage` 的键。如果模型已存在于 COS 中（因为其他站点先存储了它），则无需网络往返即可立即提供。如果不存在，则回退到常规下载，并将结果存储到 COS 中供下一个调用者使用。通过这个简单示例，实际优势在于 `Xenova/whisper-tiny.en` 和 `Xenova/distilbert-base-uncased-finetuned-sst-2-english`（当然还有 `ort-wasm-simd-threaded.asyncify.wasm`）只需跨网络传输一次，无论有多少不同源请求它们。

### [](#model-flexibility)模型灵活性

这个玩具示例使用 `Xenova/whisper-tiny.en` 运行得很好，但如果用户已经在 COS 缓存中拥有[其他 Whisper 变体](https://huggingface.co/Xenova/models?search=whisper)，你当然也不会拒绝。例如，用户可能已经拥有 [`Xenova/whisper-large-v3`](https://huggingface.co/Xenova/whisper-large-v3)，顾名思义，它比 tiny 版本大得多。Transformers.js 的[模型注册表](https://huggingface.co/docs/transformers.js/en/api/utils/model_registry)使模型选择变得灵活。如果你知道应用的需求可以通过例如 `Xenova/whisper-tiny.en`、`whisper-medium.en` 或 `Xenova/whisper-large-v3` 中的任意一个来满足，你可以检查注册表中每个模型的相关文件，探测它们在 COS 缓存中是否存在（可能部分或完全包含你需要的模型资源），然后决定最终选择哪个模型。[`ModelRegistry.is_pipeline_cached()`](https://huggingface.co/docs/transformers.js/en/api/utils/model_registry#modelregistryispipelinecachedtask-modelid-options--promise--boolean-) API 直接与 COS（当然还有 Cache API）集成，因此这个操作非常便捷。

### [](#try-it-today)立即尝试

COS API 尚未在任何浏览器中原生实现，但你无需等待即可进行实验。安装 [Cross-Origin Storage 扩展](https://chromewebstore.google.com/detail/cross-origin-storage/denpnpcgjgikjpoglpjefakmdcbmlgih) 以在所有页面上注入 `navigator.crossOriginStorage` polyfill，并测试完整流程。查看[扩展的源代码](https://github.com/web-ai-community/cross-origin-storage-extension)并按照[使用说明](https://github.com/web-ai-community/cross-origin-storage-extension?tab=readme-ov-file#usage)开始使用。

[![Cross-Origin Storage 扩展的 Chrome 网上应用店页面。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/0q3rowmy67ta.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/0q3rowmy67ta.png)

安装扩展后，立即体验完整的端到端流程：打开第一个[启用 COS 的玩具示例](https://googlechrome.github.io/samples/transformersjs-automatic-speech-recognition/index3.html)，让它加载 `Xenova/whisper-tiny.en`，然后打开[来自第二个来源的启用 COS 的玩具示例](https://rawcdn.rawgit.net/GoogleChrome/samples/1e4f2b8c10adc394352c6ec8327bb503bac7aba1/transformersjs-automatic-speech-recognition/index3.html)。与之前看到的 177 MB 重新下载不同，模型在毫秒内从 COS 提供。当你打开扩展的弹出窗口时，可以看到 COS 的运行情况。如果按**按资源查看**，可以看到 SHA-256 哈希值为 `950978b1dbcbf250335358c1236053ba19a7f7849b33dc777f4421b72b7626fa` 的资源在 `https://googlechrome.github.io` 和 `https://rawcdn.rawgit.net` 之间共享。可能不太明显，但通过比较 Hugging Face 上的 SHA-256 哈希值，你可以验证你正在查看的是 [`https://huggingface.co/Xenova/whisper-tiny.en/blob/main/onnx/decoder_model_merged.onnx`](https://huggingface.co/Xenova/whisper-tiny.en/blob/main/onnx/decoder_model_merged.onnx)。目前，该扩展主要面向像你这样的高级用户。一旦在浏览器中实现，浏览器**设置**页面将提供更友好的集成。下面的截图显示了扩展的弹出窗口，其中**按资源查看**选项卡处于活动状态，你可以看到共享资源及其哈希值，以及两个在 COS 缓存中拥有该资源的来源。

[![Cross-Origin Storage 扩展中看到的资源，显示它在两个来源之间共享。](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/usg5dq7dhm.png)](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cross-origin-storage/usg5dq7dhm.png)

## [](#call-to-action)行动号召

如果你正在构建自己的 Transformers.js 应用，行动号召很简单：在第一次调用 `pipeline()` 之前添加 `env.experimental_useCrossOriginStorage = true`，安装扩展，然后观察网络选项卡中重复下载的消失。每个选择加入的站点都会让其他站点的用户体验更快、更便宜。选择加入完全没有风险：如果用户没有安装 COS 扩展导致 COS API 不受支持，代码会回退到默认路径（[Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) API）。

Transformers.js 并非唯一在 COS 方面进行实验的项目。[WebLLM](https://webllm.mlc.ai/)（可选加入，详见[文档](https://webllm.mlc.ai/docs/user/advanced_usage.html#using-cross-origin-storage-cache)）和 [wllama](https://github.com/ngxson/wllama)（自动启用，参见[PR](https://github.com/ngxson/wllama/pull/248)）同样对这一提议中的 API 充满期待。

在 Chrome 团队中，我们正在[考虑在浏览器中原生实现 COS API](https://chromestatus.com/feature/5163371507875840)。作为一项早期提案，我们欢迎各方就该 API 本身及其提案框架提供反馈。[跨源存储仓库](https://github.com/WICG/cross-origin-storage)是提交问题、[表达支持](https://github.com/WICG/cross-origin-storage/labels/expression%20of%20support)或发起 PR 的合适场所。
