## 1. 共享 schema 与纯函数(`shared/`)

- [x] 1.1 在 `shared/src/reading-state.ts` 定义 Zod schema:`ReadingStateEnvelopeV1`(含 `v: 1`、`data: { read: Record<string, { at: number; y: number }>; starred: Record<string, { at: number }> }`),导出 `type ReadingStateV1 = z.infer<...>` 与 `READING_STATE_VERSION = 1`、`READING_STATE_STORAGE_KEY = 'dn:state:v1'`。
- [x] 1.2 实现纯函数 `migrate(raw: unknown, fromVersion: number): ReadingStateV1`(顺序迁移,纯函数,不抛错只返空默认值)+ `emptyState(): ReadingStateV1`。预留 `MIGRATIONS` 数组结构,即便 v1 暂无迁移也要让 v2 加迁移时无痛。
- [x] 1.3 在 `shared/src/index.ts` 导出新模块的公共类型与函数,确保 Astro 端 `import { ReadingStateV1, READING_STATE_STORAGE_KEY } from '@daily-news/shared'` 可用。
- [x] 1.4 在 `shared/test/reading-state.test.ts` 写单元测试:合法 envelope 解析、缺字段 envelope 返空、`v` 不匹配返空、迁移函数对未知 fromVersion 返空。运行 `pnpm test` 应通过。

## 2. 浏览器端 store(`src/scripts/reading-state.ts`)

- [x] 2.1 实现 `hasLocalStorage(): boolean`(写探针 `setItem('__probe__','1') + removeItem`),封装 `safeGet(key)` / `safeSet(key, val): boolean` / `safeRemove(key)`,捕获 `QuotaExceededError` 与 `NS_ERROR_DOM_QUOTA_REACHED`,失败时降级到模块内 `Map`。
- [x] 2.2 实现 `loadState(): ReadingStateV1`(读 `READING_STATE_STORAGE_KEY`,JSON.parse,Zod 校验,失败返 `emptyState()`)+ `saveState(state): boolean`(JSON.stringify + safeSet,失败软返回 false)。
- [x] 2.3 实现 pub/sub:`subscribe(fn: (state) => void): () => void`(返回 unsubscribe)+ `getState()` + 内部 `notify()`。所有 mutation 通过 action 函数:`markRead(hash, { y })`、`unmarkRead(hash)`、`toggleStar(hash)`、`clearOrphans(validHashes: Set<string>)`,每个 action 改完 state 后 `saveState(state) && notify()`。
- [x] 2.4 绑定 `window.addEventListener('storage', e => { if (e.key === READING_STATE_STORAGE_KEY && e.newValue) { 重新解析 + 替换内部 state + notify() } })`,实现跨标签页同步。

## 3. 已读检测与进度恢复(`src/scripts/track-read.ts`)

- [x] 3.1 实现 `trackArticleCompletion(opts: { urlHash: string, sentinel: HTMLElement, minDwellMs?: number })`:创建 `new IntersectionObserver` 配置 `{ threshold: 1.0, rootMargin: '0px 0px -10% 0px' }`,IntersectionCallback 内部启动 `setTimeout(markRead, minDwellMs ?? 500)`,提前离开视口 `clearTimeout`,触发后 `observer.disconnect()` 一次性语义。
- [x] 3.2 实现 `saveScrollOnLeave(urlHash: string)`:绑定 `visibilitychange`(切到 hidden 时存)+ `pagehide`(存),内部 `debounce(150ms)` 写 `y: scrollY`;必须验证不存在 `unload` / `beforeunload` 监听。
- [x] 3.3 实现 `restoreScrollIfAny(urlHash: string)`:从 state 读 `read[<hash>]?.y`,`scrollY < threshold(如 innerHeight * 0.5)` 时直接 `scrollTo`;长文场景 `await Promise.allSettled(Array.from(document.images).map(img => img.complete ? Promise.resolve() : img.decode().catch(() => {})))` 后再 `scrollTo(0, y)`;若 `document.body.scrollHeight < window.innerHeight * 1.5` 跳过恢复(短文无意义)。
- [x] 3.4 在 `src/pages/news/[...slug].astro` 底部(文章 `</article>` 后、`</Base>` 前)插入哨兵 `<div data-read-sentinel aria-hidden="true" style="height:1px"></div>`;在详情页 `<script>` 入口调用 `trackArticleCompletion` + `saveScrollOnLeave` + `restoreScrollIfAny`,从 `entry.data.url_hash` 取主键。

## 4. 收藏按钮组件(`src/components/StarBtn.astro`)

- [x] 4.1 创建 `src/components/StarBtn.astro`,接收 prop `urlHash: string` 与 `variant: 'list' | 'detail'`(控制 `class` 与 aria-label 措辞),渲染 `<button class="star-btn" type="button" aria-pressed="false" data-url-hash={urlHash} data-variant={variant}><svg>★/☆</svg><span class="sr-only">收藏</span></button>`。
- [x] 4.2 在 `StarBtn.astro` 底部放 `<script>`(可由 Astro 打包成共享 chunk,多实例共用):DOMContentLoaded 后 `querySelectorAll('.star-btn')`,每个按钮初始化时从 `getState()` 读初始 `aria-pressed`,绑定 click → `toggleStar(urlHash)`,订阅 store 变化重设 `aria-pressed`(保证列表与详情联动)。
- [x] 4.3 验证无 JS 时按钮仍渲染但 click 无效(优雅降级);验证 SSR 阶段不访问 `localStorage`(纯 client 行为)。

## 5. 列表与详情页集成

- [x] 5.1 修改 `src/pages/[...page].astro`:`<article class="post">` 加 `data-url-hash={entry.data.url_hash}`;在 `.post-meta` 末尾嵌入 `<StarBtn urlHash={entry.data.url_hash} variant="list" />`。
- [x] 5.2 修改 `src/pages/tags/[tag]/[...page].astro`:同 5.1 的改造,保证标签分页列表行为一致。
- [x] 5.3 修改 `src/pages/news/[...slug].astro`:`<article class="article">` 加 `data-url-hash={entry.data.url_hash}`;在 `.article-meta` 末尾(source/time/badges 之后)嵌入 `<StarBtn urlHash={entry.data.url_hash} variant="detail" />`。
- [x] 5.4 加客户端引导脚本(可放 `Base.astro` 末尾 `<script>`):DOMContentLoaded 后 `querySelectorAll('[data-url-hash]')`,从 store 读初始态,有读记录的加 `data-read="true"`、有收藏的加 `data-starred="true"`,订阅 store 变化持续更新这些属性(驱动 CSS 视觉)。

## 6. 收藏聚合页 `/bookmarks/`(`src/pages/bookmarks.astro`)

- [x] 6.1 创建 `src/pages/bookmarks.astro`,`getCollection('news')` 取全量,构造 manifest 数组 `[{ url_hash, slug, title, source, date: epoch_ms, url, tags }]`,按 `date` 倒序。
- [x] 6.2 在页面渲染 `<script type="application/json" id="dn-posts">{JSON.stringify(manifest)}</script>`(用 `set:html` 注入原始 JSON,避免 Astro 转义)。验证产物 HTML 里此段是合法 JSON 字面量。
- [x] 6.3 渲染页面骨架:`<h1>收藏</h1>` + 过滤 tabs(`全部` / `稍后读` / `已读`,默认「全部」)+ 空 `<ul id="bm-list"></ul>` + 空状态 `<p id="bm-empty">还没有收藏,去<a href="/">首页</a>看看。</p>` + 导出按钮(`<button id="bm-export">导出 JSON</button>`)。
- [x] 6.4 写客户端 `<script>`:解析 manifest → `Map<url_hash, meta>`;`subscribe` 状态变化 → 计算 `starred` 项 → 与 manifest join → 按 `starredAt` 倒序 → 根据当前过滤 tab 过滤 → 渲染 `<li>`(标题链接、来源、日期、稍后读标记);manifest 找不到的 `url_hash` 渲染为「[已删除] 此文章已不可访问」+ 单条删除按钮。
- [x] 6.5 实现「清除失效收藏」:在页面底部放 `<button id="bm-clear-orphans">清除全部失效收藏</button>`,点击调用 `clearOrphans(validHashes)`,validHashes 即 manifest 的 url_hash 集合。
- [x] 6.6 实现导出:`<button id="bm-export">` 点击 → `Blob([JSON.stringify(getState(), null, 2)])` → `<a download="daily-news-state.json">` 触发下载。

## 7. 首页最后更新时间(`src/pages/[...page].astro`)

- [x] 7.1 在 `src/pages/[...page].astro` frontmatter 顶部用 `import.meta.glob('../../runs/*.json', { eager: true })` 导入所有 run summary 文件;TS 断言为 `Record<string, { default: RunSummary }>` 形式,`Object.values(...).map(m => m.default)` 取数组;过滤掉空文件或解析失败的项(`try/catch` + `runSummarySchema.safeParse`)。
- [x] 7.2 计算 `lastUpdated: Date | null` —— 数组为空返 `null`;否则 `new Date(Math.max(...valid.map(r => Date.parse(r.finished_at))))`。用 `Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })` 格式化为「2026-06-26 13:27」;显示时附加「 (UTC+8)」后缀。
- [x] 7.3 在 `section-head` 内 `<p class="lede">...</p>` 之后插入:`{lastUpdated && <p class="last-updated">最后更新 <time datetime={lastUpdated.toISOString()}>{formatted} (UTC+8)</time></p>}`。`runs/` 为空时 `lastUpdated === null`,该元素不渲染。
- [x] 7.4 在 `src/styles/global.css` 现有 `.lede` 规则之后插入 `.last-updated { color: var(--faint); font-size: 0.8rem; margin: 0.4rem 0 0; }`(复用 faint token,与 `.tag .count` 同款次要信息样式)。
- [x] 7.5 验证产物:`pnpm build` 后 `dist/index.html` 含 `<time datetime="2026-06-26T13:27:18.216Z">最后更新 2026-06-26 13:27 (UTC+8)</time>` 字面量;时间值是 `runs/*.json` 中 `max(finished_at)` 对应的时刻。
- [x] 7.6 验证降级:临时把 `runs/` 清空(仅留 `.gitkeep`)再 build,首页应正常渲染、不出现「最后更新」元素、不抛错;恢复 `runs/` 后再验一次确认数据回流。
- [x] 7.7 验证零 client fetch:浏览器 DevTools Network 面板查看首页加载,不存在 `fetch('/runs.json')` 或类似运行时取数请求;「最后更新」完全是 build time 静态文本。

## 8. CSS 视觉规则(`src/styles/global.css`)

- [x] 8.1 在 line 219(现有 `.badge.truncate` 之后、`/* ---- tags -- */` 之前)插入新 section `/* ---- post state (read / starred) ---- */`,规则:`.post-list > .post[data-read] .post-title a { color: var(--faint); background-image: none; }` + `.post-list > .post[data-read] .post-meta { color: var(--faint); }`。
- [x] 8.2 加收藏态视觉:`.post-list > .post[data-starred] .post-title a::before { content: '★ '; color: var(--accent); }`(列表态标记);详情页通过 `.star-btn[aria-pressed="true"] { color: var(--accent); }` 反映。
- [x] 8.3 在 line 306(现有 `.article-meta .source` 之后)插入 `.article-meta .star-btn` 规则:`background: none; border: none; cursor: pointer; padding: 0; line-height: 1; color: var(--faint); vertical-align: 1px; transition: color 0.18s ease;` + `.article-meta .star-btn:hover { color: var(--accent); }` + `.article-meta .star-btn[aria-pressed="true"] { color: var(--accent); }` + `.article-meta .star-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--accent-soft); border-radius: var(--radius-pill); }`(focus ring 复用 `.search input:focus` 同款)。
- [x] 8.4 在 `@media (prefers-reduced-motion: no-preference)` block(line 482 内)加可选的 star-toggle 微动效(`transform: scale(1→1.15→1)` 200ms);`@media (max-width: 640px)` block 内按需加 `.star-btn` 移动端尺寸调整。
- [x] 8.5 加 `.sr-only` 工具类(若 global.css 尚无):`position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;`,供 StarBtn 的 `<span class="sr-only">` 使用。

## 9. FOUC 防护与 Base 布局改造

- [x] 9.1 修改 `src/layouts/Base.astro`:`<html lang="zh">` 改为 `<html lang="zh" class="no-js">`;在 `<head>` 紧贴 `<meta charset>` 之后插入 `<script is:inline>document.documentElement.className=document.documentElement.className.replace(/\bno-js\b/,'js')</script>`。
- [x] 9.2 在 `Base.astro` 末尾(`<footer>` 之后、`</body>` 之前)放引导 `<script>`(类型可为 module,由 Astro 打包):DOMContentLoaded 时 `querySelectorAll('[data-url-hash]')` 初始化各 article 的 `data-read` / `data-starred` 属性(对应 spec requirement 「阅读状态 UI 反映」)。
- [x] 9.3 验证:`pnpm build` 后 `dist/index.html` 的 `<html>` 标签含 `class="no-js"`, `<head>` 内有内联切换 script;浏览器打开后 DOM 中 `<html>` class 变为 `js`,无首屏闪烁。

## 10. 无障碍与键盘导航

- [x] 10.1 验证 StarBtn:`tabindex` 默认可聚焦、`aria-pressed` 反映状态、回车/空格键触发 click、focus ring 可见(var(--accent-soft) box-shadow)。
- [x] 10.2 `/bookmarks/` 过滤 tabs 用 `role="tablist"` + `role="tab"` + `aria-selected`,左右箭头键切换;删除收藏后焦点移至下一项而非 `<body>`。
- [x] 10.3 屏幕阅读器抽测(VoiceOver / NVDA):收藏按钮朗读「收藏,切换按钮,已按下/未按下」;`/bookmarks/` 空状态朗读提示文本;已删除条目朗读「已删除,此文章已不可访问」;首页「最后更新」朗读为 `<time>` 的日期时间。

## 11. 端到端验证

- [x] 11.1 `pnpm typecheck` 通过;`pnpm test` 通过(含新增 `shared/test/reading-state.test.ts`)。
- [x] 11.2 `pnpm build` 成功,产出 `dist/index.html`、`dist/news/<slug>/index.html`、`dist/bookmarks/index.html`;grep 验证 `dist/bookmarks/index.html` 内嵌 `<script type="application/json" id="dn-posts">` 含合法 JSON 且字段正确;grep 验证 `dist/index.html` 含「最后更新」字面量与 `<time datetime="...">`。
- [x] 11.3 `pnpm preview` 手动验证清单:① 首页打开某文章 → 滚到底 → 返回首页该文章降亮;② 列表 ☆ 点击 → 详情页 ★ 联动;③ 详情页读一半关闭 → 重进恢复 scrollY;④ `/bookmarks/` 首次空状态;⑤ 收藏后 `/bookmarks/` 列表按 `starredAt` 倒序;⑥ 「稍后读」过滤隐藏已读;⑦ DevTools 删除某 `news/*.md` 重新 `pnpm build` 后,`/bookmarks/` 显示「[已删除]」+ 清除按钮可用;⑧ 首页「最后更新」时间与 `runs/` 中最新 `finished_at` 一致,跨设备显示同为 UTC+8。
- [x] 11.4 浏览器 DevTools 模拟私密模式(Safari)或禁用 localStorage(Chrome devtools Application panel),验证收藏/已读仍可在会话内工作,刷新后丢失(预期行为),不抛错;首页「最后更新」不受影响(纯静态)。
- [x] 11.5 跨标签页验证:同时打开首页和 `/bookmarks/`,在首页收藏 → `/bookmarks/` 自动刷新列表,无需 reload。
- [x] 11.6 暗色模式 + 移动端尺寸(< 640px)视觉回归:已读降亮、收藏按钮、`/bookmarks/` 列表、「最后更新」文本在两种模式 + 两种尺寸下均无视觉错误。
- [x] 11.7 性能基线对比:`pnpm build` 产物体积对比(预期 global.css +~1KB、`/bookmarks/` HTML +~25KB gzip、首页 HTML +~100B 时间字面量);Lighthouse 首屏分数不下降。

## 12. 文档与收尾

- [x] 12.1 更新 `README.md` 在「使用指南」加一节「阅读状态」:简述已读/收藏功能、`/bookmarks/` 入口、跨设备不同步限制、私密模式降级行为。
- [x] 12.2 在 `README.md` 架构图相应位置(Pipeline 2 站点渲染框内)补一句「客户端 localStorage 记录已读/收藏/阅读进度」+「首页显示 crawler 最后运行时间」标注,不改架构边界。
- [x] 12.3 运行 `openspec validate add-reading-state --strict`(或对应校验命令),确认 spec delta、proposal、design、tasks 四件套均通过 schema 校验,无未引用 requirement。
