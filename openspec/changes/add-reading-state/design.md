## Context

`daily-news` 当前是 Astro 7 纯静态站点,build 产物完全确定、零 secret、零数据库。两条流水线(GitHub Actions 抓取 / Cloudflare Pages 渲染)严格解耦,任何客户端状态进入 build 都是不可接受的回归。

站点现有 client JS 仅一处:`src/components/Search.astro` 里的 `<script is:inline>`,以原生 JS 调 Pagefind。无 React/Vue/Svelte island,无 hydration 边界。CSS 在单文件 `src/styles/global.css`(533 行,flat 作者风格,token 化的暖色编辑设计系统,vermillion `#a8341f` 唯一强调色)。

文章身份的稳定主键已存在:frontmatter 的 `url_hash = sha1(canonicalize(url))`,与 crawler 的 dedup 机制同源(`shared/src/schema.ts:21`)。slug 可能因 title 微调而变,但 `url_hash` 对同一篇文章永远稳定。

读者场景是高回访(每日看新文章),但目前无任何「看过了」「想读」「读到哪了」的记号。本变更引入客户端阅读状态,约束为:**零基础设施新增、零构建期依赖客户端状态、纯 Web Platform API**。

## Goals / Non-Goals

**Goals:**

- 让读者能在浏览器里看到自己「哪些文章看过了」「哪些收藏了」「上次读到哪」。
- 在不引入账号系统、数据库、第三方服务的前提下完成上述目标。
- 保持 `astro build` 100% 确定性、零 secret,CF Pages / GitHub Actions 管线零变更。
- 收藏聚合页 `/bookmarks/` 可深链、可分享、对 SEO 友好(壳是静态 HTML,内容 JS 增强)。
- 数据模型向前兼容:版本化 envelope,后续加字段无痛。
- 视觉变化贴合现有编辑设计系统,不引入新颜色/字体/圆角 token。

**Non-Goals:**

- **跨设备同步** —— 不做账号、不做云存储。换设备数据不迁移(v1 可加导出/导入按钮,v2 才考虑云同步)。
- **服务端读写** —— 不在 build 期或运行时把状态发往任何服务端。
- **基于阅读历史的个性化推荐 / 排序** —— 首页排序仍按文章发布时间。
- **阅读时长统计 / 阅读速度分析** —— 只存最后一个 `scrollY` 和 `readAt`,不做时序记录。
- **社交分享 / 评论 / 协作收藏** —— 单用户、单浏览器、私有。
- **PWA / Service Worker / 离线阅读** —— 不在本变更范围;localStorage 只存状态,不缓存正文。
- **客户端路由 / View Transitions** —— 暂不引入,详情页间仍是浏览器原生跳转(影响 `pagehide` 触发时机,见 D5)。

## Decisions

### D1. 存储介质选 `localStorage`(单 key + envelope)

**理由**:数据量小(500 篇文章全收藏 ≈ 50KB,远低于 5MB 上限)、读写 API 同步简单、无需异步包装、所有浏览器一致支持。读者场景是「刷新即看到」,不需要 IndexedDB 的异步/事务/索引能力。单 key 存 `{v, data:{read, starred}}` 的 envelope 让导入导出/迁移/清理都是一行 JSON 操作。

**考虑过的替代**:

- _IndexedDB_:容量大(数百 MB)、异步不阻塞主线程、可存结构化克隆。被否——50KB 量级用 IDB 是杀鸡用牛刀,API 复杂度(事务、cursor、版本升级)显著增加实现成本,且私密模式下同样受限。
- _sessionStorage_:标签页关闭即清空,不符合「跨会话保留」目标。被否。
- _Cookie_:每次 HTTP 请求携带,污染 CF Pages 请求;4KB 上限太小。被否。
- _多 key 扁平存(`dn:read:<hash>=1`)_:查单条 O(1),但读全量要遍历所有 keys,导入导出/迁移/清理极麻烦,且 key 数量膨胀可能触发 implementer 配额(早期 Safari 限制 key 数量)。被否。
- _内存 `Map`_:无持久化,刷新即丢。被否作为主存储,但保留为私密模式降级后备(见 D8)。

### D2. 文章主键用 `url_hash`,不用 slug 或 URL

**理由**:`url_hash` 是 crawler 已计算的 `sha1(canonicalize(url))`,与现有 dedup 机制同源,是文章的稳定内容寻址身份。slug 可能在 title 微调时改变(参见 `crawler/src/write.ts` 的 slug 冲突处理),URL 又太长且包含跟踪参数。用 `url_hash` 让客户端状态与 crawler 的去重身份天然对齐,孤儿检测(`/bookmarks/` 中的 `url_hash` 是否还在 manifest)也变得简单。

**考虑过的替代**:

- _slug (`entry.id`)_:更短更可读,但 slug 不稳定——`write.ts` 在冲突时自动加 hash 后缀,后续重抓可能让 slug 漂移。被否。
- _原始 URL_:含跟踪参数、大小写不一致、太长(每篇多耗 ~80 字节)。被否。
- _`<slug>` 但同时存 `url_hash` 做回退_:复杂度上升,没有额外收益。被否。

### D3. 数据 schema:`{ v, data: { read: {}, starred: {} } }` envelope,version 进 key

**理由**:版本进 key(`dn:state:v1`)让新旧版本数据共存,迁移失败可回退;envelope 形状统一,加字段(如未来的 `lastReadAt`、`source`)只动 `data` 不破坏版本协议。每篇文章在每个映射下存最小必要字段(`read` 存 `{at, y}`,`starred` 存 `{at}`),保持紧凑。

```typescript
type Envelope = {
  v: 1;
  data: {
    read: Record<string, { at: number; y: number }>; // key = url_hash
    starred: Record<string, { at: number }>;
  };
};
```

**考虑过的替代**:

- _单 key 但 version 只在 value 里_:迁移失败时旧数据已被覆写,无法回退。被否。
- _两个 key(`dn:read:v1`、`dn:starred:v1`)_:看起来更分离,但跨标签页 `storage` 事件要监听两个 key,原子性差(同时改 read+starred 时两次写入)。被否。
- _数组形式 `read: [url_hash, ...]`_:查单条要 O(n) 扫描,存元信息(如 `at`、`y`)要改成对象数组,等于退化到当前方案。被否。

### D4. 已读检测:IntersectionObserver + 底部哨兵 + 防抖 + 一次性触发

**理由**:`IntersectionObserver` 是浏览器原生的视口观测 API,异步、不阻塞主线程、自动批处理。在文章详情页底部放一个零高度 `<div data-read-sentinel>`,配置 `{ threshold: 1.0, rootMargin: '0px 0px -10% 0px' }`(底部收 10%),意味着用户必须真的滚到接近底部才触发。叠加 500ms 防抖过滤快速划过。首次触发后立即 `observer.disconnect()` + 移除 `pagehide` 监听,保证一次性语义。

**考虑过的替代**:

- _`scroll` 事件 + 计算滚动百分比_:要监听高频 scroll 事件、手动算 `innerHeight + scrollY >= document.body.scrollHeight * 0.9`,强制同步布局回流,移动端掉帧。被否(性能差)。
- _停留时间触发(N 秒后算已读)_:用户实际读了 8 秒但未到底部也会误判;长文 15 秒可能没读完。被否(语义不精确)。
- _进入详情页即标记(无哨兵)_:实现最简,但误触成本高(点错=已读),且与「读到一半关闭」的进度恢复逻辑冲突。被否。
- _正面 `rootMargin`(如 `300px 0px 300px 0px`)_:那是 prefetch / 无限滚动的做法,会让用户刚滚到文章中段就误判已读完。被否(语义反了)。

### D5. 滚动保存:`visibilitychange` + `pagehide` 双信号,绝不用 `unload`/`beforeunload`

**理由**:`visibilitychange`(切到 `hidden`)是移动端 OS 杀进程、Home 键切后台时唯一可靠的信号(Ilya Grigorik:「treat every transition to hidden as end-of-session」)。`pagehide` 是桌面端关闭标签页/导航离开时的可靠信号,且 bfcache 兼容。两者结合可达 91% 可靠性(speedkit 基准)。`beforeunload` 在 iOS Safari 不触发(react-router#9463、vue/router#2537 证实),`unload` 让页面失去 bfcache 资格(Chrome 已开始废弃)。

**考虑过的替代**:

- _仅 `pagehide`_:移动端 Home 键切后台不触发 pagehide,会丢失位置。被否。
- _仅 `visibilitychange`_:桌面端直接关闭标签页时 visibilitychange 行为不稳定(部分浏览器在 unload 阶段不再触发)。被否。
- _`beforeunload`_:iOS Safari 不触发 + 破坏 bfcache。被否。
- _`scroll` 高频写_:每次 scroll 都写 localStorage,移动端写放大严重,且大多数写入是冗余的。被否(改成 scroll 防抖 + pagehide/visibilitychange 立即写的混合策略)。

**注意**:本站点暂不引入 View Transitions / 客户端路由(Non-Goals),所以 `pagehide` 在普通页面跳转时仍可靠触发。若未来引入客户端路由,需改用 Astro 的 `astro:before-swap` 事件做等价保存。

### D6. `/bookmarks/` 数据交付:build time 内联 `<script type="application/json">`,不做 client `fetch`

**理由**:站点是纯静态,文章 manifest 在 build 时由 `getCollection('news')` 一次性可枚举。把 manifest 直接内联到 `/bookmarks/` 的 HTML 里(`<script type="application/json" id="dn-posts">{...}</script>`),客户端 `JSON.parse(document.getElementById('dn-posts').textContent)` 一次拿到,无额外 HTTP 往返、无 CORS、无需 cache-busting。manifest 只含元数据(`url_hash`、`slug`、`title`、`source`、`date`、`url`、`tags`),500 篇 ≈ 100KB,gzip 后 ≈ 25KB,可接受。

**考虑过的替代**:

- _build 时生成 `/posts.json` 静态资源,client `fetch('/posts.json')`_:多一次 HTTP 往返(即便 same-origin 也要 ~50ms TTFB + 解析),且要处理 cache-busting(部署后旧 HTML 引用新 JSON 的 race)。被否。
- _Pagefind 索引复用_:Pagefind 索引是为全文搜索设计的,字段不直接对应「文章列表」语义,且首次加载要初始化整个索引(更重)。被否。
- _每篇文章页 SSR 时注入自己的 meta,/bookmarks/ 跨页 fetch 每篇_:即 N 次 fetch,完全不可行。被否。
- _`define:vars` 把数组序列化进 inline `<script>`_:语法上是 JS 字面量,JSON.parse 比 eval 安全,且 `<script type="application/json">` 不会被执行,符合 CSP 最佳实践。被否(define:vars 路线)。

### D7. 孤儿 `url_hash` 策略:`/bookmarks/` 显式列出 + 一键清除

**理由**:crawler 会因源失效、文章被作者删除等原因移除 `news/*.md`,但客户端 localStorage 里的收藏记录不会同步消失。静默吞掉这些记录会让用户疑惑「我明明收藏过这篇」。改为显式列出「[已删除] 此文章已不可访问」+ 一键清除失效收藏,让状态变化透明可见,用户掌控数据。

**考虑过的替代**:

- _静默跳过渲染_:实现最简,但 localStorage 中会永久残留失效 slug,且用户感知层面「消失」引发不信任。被否。
- _立即清理(检测到孤儿就删 localStorage)_:用户可能希望保留记录以便文章复活后自动恢复,一次性删除不可逆。被否。
- _延迟清理 + Toast 提示_:实现复杂,UX 收益不明显。被否。

### D8. FOUC 防护:`<html class="no-js">` + head 内联 `<script is:inline>` 切换 `js` class

**理由**:`<html>` 在 Astro layout 里初始 `class="no-js"`,紧贴 `<head>` 开头的 `<script is:inline>`(Astro 不打包不 defer)同步执行 `document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/, 'js')`,在浏览器开始解析 `<body>` 之前 class 已就位。CSS 用 token 表达状态(`.post[data-read] .post-title a { color: var(--faint); background-image: none; }`),且默认态(无 `data-read`)即为可读态,所以 FOUC 仅出现在「已读文章的降亮样式延迟 ~1 帧」这种极轻微场景,可接受。

**考虑过的替代**:

- _接受闪烁不做防护_:已读文章会在首帧以全亮态闪现再降亮,UX 不专业。被否。
- _Cookie + SSR 读 cookie 注入 class_:本站点纯静态,build 时无 cookie;若用 edge function(CF Pages 中间件)读 cookie 注入,引入非确定性构建。被否(违反 Non-Goals)。
- _外部 `<script src="...">` 切换 class_:网络请求阻塞首绘,Paul Irish / Modernizr 文档明确反对。被否。
- _默认态用降亮样式,JS 加载后还原未读态_:语义反了,无 JS 用户看到的全是降亮。被否。

### D9. 跨组件状态同步:轻量 pub/sub + `storage` 事件,不引入框架

**理由**:列表页可能有 20 个 `<article>`,详情页有 1 个收藏按钮,`/bookmarks/` 是单独页面。同一份状态要在多处保持一致。用一个 ~40 行的纯 TS store 模块(`src/scripts/reading-state.ts`)提供 `subscribe(fn)` + `getState()` + `markRead(hash)` / `toggleStar(hash)` action,所有 UI 监听 store 变化重渲染。跨标签页通过 `window.addEventListener('storage', ...)` 监听 localStorage 变化并触发 store 通知。无需 React/Vue/Zustand,符合现有项目的「原生 JS + is:inline」范式。

**考虑过的替代**:

- _CustomEvents 在 document 上广播_:更松耦合但事件不记忆,新订阅者拿不到当前态,要额外维护 last state。被否(等价于自己实现 pub/sub)。
- _引入 Zustand/Preact/Signal_:增加 ~3KB+ 运行时依赖,违背现有零依赖范式。被否。
- _轮询 localStorage_:CPU 与 IO 浪费,延迟不可控。被否。

### D10. 首页最后更新时间:build time 扫 `runs/*.json` 取 `max(finished_at)`

**理由**:crawler 每次运行把 summary 写到 `runs/<date>.json`(`crawler/src/summary.ts`),其中 `finished_at` 是 ISO 8601 时间戳,代表「抓取流水线真正完成的时间」,正是「最后更新」的语义。在 Astro 首页 `[...page].astro` 的 frontmatter 用 `import.meta.glob('../../runs/*.json', { eager: true })` 让 Vite 在 build 时静态分析所有 run 文件、TypeScript 类型断言为 `RunSummary[]`,取 `max(Date.parse(r.finished_at))`,再用 `Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', ... })` 格式化为「2026-06-26 13:27 (UTC+8)」。整条链路 build time 完成,产物是静态文本,零 client JS、零运行时 fetch。

**为什么用 `finished_at` 而非其他**:① 不用文章 frontmatter `date`——那是文章发布时间,可能晚几天才被抓到,不能反映「站点数据新到什么程度」;② 不用 `started_at`——爬取到一半失败也算开始,但没产出;`finished_at` 才代表「这次有结果」;③ 不用 git commit time——CF Pages 的 git 历史不一定保留 committer date,且 push 与 cron 触发的 build 都会变。

**显示格式**:用 `<time datetime={ISO}>最后更新 2026-06-26 13:27 (UTC+8)</time>`,外层 `<p class="last-updated">`。`<time datetime>` 给机器读(搜索引擎、RSS reader),可见文本是 build 服务器时区(UTC+8)。不引入客户端相对时间(「2 小时前」)——那需要定时刷新 + client JS,与「最后更新」这种低频信息不匹配,且会让首屏多一段 JS 执行。

**时区选择**:build 服务器在 CF Pages 全球边缘节点,时区不确定。强制 `timeZone: 'Asia/Shanghai'`(与 crawler cron「UTC 01:00 = 北京 09:00」匹配,目标受众也是中文读者),让所有 build 产物显示一致的 UTC+8 时间,避免「凌晨 build 显示成下午」的混乱。

**考虑过的替代**:

- _client fetch `/runs.json` + 相对时间_:多一次 HTTP 往返,需要 client JS,且静态站点的 runs 数据 build 时就已知、没必要 runtime 取。被否。
- _`max(文章 frontmatter.date)`_:语义错位(发布时间 ≠ 抓取时间);若某天没新文章但 crawler 跑了,这个值不变,误导用户。被否。
- _git log -1 --format=%cI_:间接依赖 git,CF Pages 的浅克隆可能不保留时间;且 push 触发的 build(改 README 等)也会更新 commit time,但 runs/ 没变。被否。
- _只在 masthead / footer 显示_:全局位置与「首页列表新鲜度」语义不匹配,且会让所有页面都承担这个信息。被否(限定首页 section-head)。
- _用浏览器本地时区 `new Date().toLocaleString()`_:build 服务器时区与用户时区都不确定,显示混乱。被否(强制 Asia/Shanghai)。

## Risks / Trade-offs

- **[跨设备不同步]** → 用户在手机收藏的文章不会出现在电脑。缓解:Non-Goals 已明示,v1 可在 `/bookmarks/` 页脚加「导出 JSON」按钮供手动迁移;`README` FAQ 说明限制。升级路径:v2 引入可选 GitHub OAuth + gist 同步(参考 productiveme/bookmarks 模式)。
- **[localStorage 5MB 共享上限]** → 同源下其他数据(如 Pagefind 索引缓存、未来 PWA 资源)也吃配额。缓解:实测 500 篇全收藏 ≈ 50KB,余量充足;`safeSet` 捕获 `QuotaExceededError` 软失败,绝不阻塞 UI。升级路径:LRU 淘汰策略(淘汰最旧未收藏的已读记录)。
- **[Safari 私密模式陷阱]** → Safari <14 私密模式下 `localStorage` API 存在但 `setItem` 抛错,简单 feature-detect 会误判可用。缓解:`hasLocalStorage()` 探测函数做一次 `setItem('probe','1') + removeItem` 写探针,失败则切内存 `Map`。
- **[manifest staleness race]** → 用户在旧 HTML 会话中收藏了刚发布的新文章,但旧 manifest 里没有该文 `url_hash`,会误判为孤儿。缓解:实际场景罕见(用户通常先 reload 才看到新文章);真发生时显示「[已删除]」,用户清除即可,无数据损坏。
- **[阅读进度恢复在图片 decode 前后的位置抖动]** → 即便 `Promise.allSettled(imgs.map(decode))`,webp/动画图可能慢解码。缓解:decode 失败的图用 `Promise.allSettled` 容忍;极端慢加载场景用户可手动滚动,体验降级但不报错。
- **[无障碍]** → 收藏按钮的 `aria-pressed` 状态、`/bookmarks/` 列表的 `<li>` 语义、过滤标签的 `role="tab"` + 键盘导航、删除按钮的焦点管理(删除后焦点移至下一项而非 `<body>`)需在实现阶段严格遵守。缓解:tasks.md 把 a11y 列为独立验证项。
- **[ad blockers 误杀]** → 极少数激进的 ad blocker 会屏蔽 `type="application/json"` 的 inline script(因关键字匹配)。缓解:不预期是高频问题;真出现时改为 `fetch('/posts.json?v=<build_hash>')` 方案(D6 已记录为备选)。
- **[CSP 与 inline script]** → 若未来引入 CSP,`<script is:inline>` 切换 no-js/js class 的内联脚本要加 `'unsafe-inline'` 或 nonce。缓解:目前无 CSP,本变更不引入;若未来引入 CSP,需补 nonce 机制(单独小变更)。

## Migration Plan

- **部署**:无服务端变更,纯前端 build 产物变化。CF Pages 下次自动部署即生效。GitHub Actions 抓取管线零变更。
- **回滚**:本变更新增文件与新增 CSS 规则,不修改既有逻辑(除 `Base.astro` 加两行 class/script、`[...page].astro` 等加 `data-url-hash` 属性)。回滚即 `git revert` 单个合并 commit,无数据迁移、无环境变量变化。
- **数据迁移**:`localStorage['dn:state:v1']` 是全新 key,不存在旧数据迁移问题。未来 v1→v2 通过 D3 的 envelope + 顺序迁移函数处理。

## Open Questions

- 收藏按钮的视觉形态:纯文字「☆ 收藏」、纯图标「★」、还是图标 + 文字?需在实现阶段对照现有 `.badge.translate` 视觉权重决定(倾向图标 + sr-only 文字,符合极简编辑风)。
- `/bookmarks/` 是否在导航栏露出入口?现有导航只有「首页 / 标签 / RSS」。倾向加「收藏」链接,但可能让首屏导航过密——实现时 A/B 试一下。
- 阅读进度恢复的阈值:文章多短时不该恢复(短文滚一点就到底了)?倾向 `document.body.scrollHeight < window.innerHeight * 1.5` 时跳过恢复——实现时验证。
