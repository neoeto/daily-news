## Why

每日资讯是回访型阅读场景:读者每天来看新文章,但站点纯静态、无账号系统,导致「这篇看过了吗?」「上次想读的那篇去哪了?」完全无迹可循。引入浏览器端 `localStorage` 即可在零基础设施、零数据库、构建确定性的前提下,为每位读者建立私有的已读/收藏/阅读进度记忆。

## What Changes

- [ ] **阅读状态持久化**:在浏览器端用 `localStorage` 单 key(`dn:state:v<N>`)存 `{read, starred}` 两个映射,以文章 `url_hash` 为主键,带版本化 envelope `{v, data}` 支持后续迁移。
- [ ] **自动标记已读**:文章详情页底部放置哨兵元素,`IntersectionObserver`(`threshold:1.0` + 负 `rootMargin` + 500ms 驻留防抖)触发标记已读,首次触发后立即 `disconnect()`。
- [ ] **收藏入口**:列表页 `.post-meta` 与详情页 `.article-meta` 各放一个收藏按钮(★/☆),两处 UI 共享同一份状态、实时联动。
- [ ] **阅读进度恢复**:详情页滚动位置(`scrollY`)在 `visibilitychange` + `pagehide` 双信号时保存(绝不用 `beforeunload`,iOS Safari 不触发且破坏 bfcache);再次进入该文时等图片 `decode()` 完成再 `scrollTo` 恢复。
- [ ] **收藏聚合页 `/bookmarks/`**:build time 烘焙全量文章 manifest 到 `<script type="application/json" id="dn-posts">`,client 端读 `localStorage` join 渲染;支持「全部 / 稍后读(未读收藏) / 已读」过滤,默认按 `starredAt` 倒序。
- [ ] **孤儿 slug 处理**:文章被 crawler 删除后 `/bookmarks/` 显式列出「[已删除]」并提供一键清除失效收藏,而非静默吞掉。
- [ ] **FOUC 防护**:`<html>` 初始 `class="no-js"`,head 内 `<script is:inline>` 同步替换为 `js`,CSS 用 token 表达已读/收藏态(复用 `--faint` / `--accent` / `--accent-soft`)。
- [ ] **首页最后更新时间**:首页 `section-head` 区域显示 crawler 最后一次运行的 `finished_at`(扫 `runs/*.json` 取 `max(finished_at)`),build time 用 `import.meta.glob` 静态读取,`Intl.DateTimeFormat` 强制 `Asia/Shanghai` 时区格式化为「最后更新 2026-06-26 13:27 (UTC+8)」,零 client JS、零 runtime fetch。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `news-site`:新增 5 条 requirement——4 条客户端阅读状态相关(持久化与版本化、UI 反映、阅读进度保存恢复、收藏聚合页)+ 1 条首页最后更新时间显示(build time 扫 `runs/*.json`)。不修改既有 7 条 requirement。

## Impact

- **新增代码**:
  - `shared/src/reading-state.ts` —— envelope schema(Zod)+ 加载/保存/迁移纯函数(类型同源原则)。
  - `src/scripts/reading-state.ts` —— 浏览器端 store(订阅/发布 + localStorage 适配层 + 内存降级)。
  - `src/scripts/track-read.ts` —— IntersectionObserver + scroll 保存逻辑。
  - `src/components/StarBtn.astro` —— 复用型收藏按钮(列表/详情共用)。
  - `src/pages/bookmarks.astro` —— 收藏聚合页(空壳 + manifest script)。
  - `src/layouts/Base.astro` —— 注入 `<html class="no-js">` + head 内联 class 切换 script。
  - `src/styles/global.css` —— 新增 `/* ---- post state ---- */` 与 `.star-btn` 规则块(约 30 行)。
  - `src/pages/[...page].astro`、`src/pages/news/[...slug].astro`、`src/pages/tags/[tag]/[...page].astro` —— 给 `<article>` 加 `data-url-hash` 属性、嵌入 `<StarBtn>`;`[...page].astro` 额外用 `import.meta.glob('../../runs/*.json', { eager: true })` 扫 run summaries,在 section-head 显示最后更新时间。
- **新增配置**:无。
- **外部依赖(npm)**:无,纯 Web Platform API(`localStorage`、`IntersectionObserver`、`visibilitychange`、`pagehide`)。
- **基础设施**:无。构建仍 100% 确定性、零 secret;客户端状态绝不进入 `astro build`,部署管线(CF Pages / GitHub Actions)零变更。
- **数据策略**:`localStorage` 单 key,预估 500 篇文章全收藏 ≈ 50KB,远低于 5MB 上限;配额超限时软失败(写入返回 false,UI 不崩)。
