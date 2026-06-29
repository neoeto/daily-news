## ADDED Requirements

### Requirement: 客户端阅读状态持久化

系统 SHALL 在浏览器端通过 `localStorage` 持久化用户的已读与收藏状态。状态 MUST 以文章的 `url_hash`(frontmatter 中已存在的 sha1)为主键,而不是 slug 或 URL——`url_hash` 是去重用的稳定身份,与现有 dedup 机制同源。状态 MUST 包装为版本化 envelope `{ v: number, data: {...} }`,存储在带版本号的 key `dn:state:v<N>` 下,以支持后续 schema 迁移。系统 MUST NOT 在 `astro build` 阶段读取或依赖任何客户端状态(保持零 secret、100% 确定性构建)。当 `localStorage` 不可用(Safari 私密模式、配额超限、sandboxed iframe)时,系统 SHALL 降级为内存 `Map` 并继续提供会话内功能,不抛错、不阻塞 UI。

#### Scenario: 标记已读并持久化

- **WHEN** 用户在文章详情页触发「标记已读」(滚动到底部)
- **THEN** 该文章 `url_hash` 连同 `{ at: <epoch_sec>, y: <scrollY> }` 写入 `localStorage['dn:state:v1']` 的 `read` 映射,刷新或重开浏览器后状态保留

#### Scenario: 构建不依赖客户端状态

- **WHEN** `astro build` 在 CI 中执行
- **THEN** 构建产物对任意客户端 `localStorage` 内容均确定可复现;构建脚本不读取 `localStorage`(浏览器 API 在构建期不可用),不把客户端状态编译进 HTML

#### Scenario: localStorage 不可用时降级

- **WHEN** 浏览器处于私密模式或 `localStorage.setItem` 抛 `QuotaExceededError` / `NS_ERROR_DOM_QUOTA_REACHED`
- **THEN** 系统捕获异常,改写内存 `Map`,UI 行为与会话内一致;关闭页面后状态丢失(可接受),不向用户报错

#### Scenario: 跨标签页同步

- **WHEN** 用户在标签页 A 收藏某文,标签页 B 已打开 `/bookmarks/`
- **THEN** 标签页 B 通过 `storage` 事件监听实时刷新列表,无需手动 reload

### Requirement: 阅读状态 UI 反映

系统 SHALL 在所有展示文章卡片的页面(首页、标签页、详情页)根据客户端状态为 `<article>` 元素添加 `data-read` / `data-starred` 布尔属性,CSS SHALL 据此应用视觉差异:已读文章 SHALL 使用 `var(--faint)` token 降低标题与 meta 的对比度,并去除标题下划线动效;收藏状态 SHALL 通过 `var(--accent)` + `var(--accent-soft)` token 表达(与现有 `.badge.translate` 同款)。系统 SHALL 在列表页 `.post-meta` 与详情页 `.article-meta` 各提供一个收藏按钮(`<button class="star-btn" aria-pressed="...">`),两处按钮 MUST 共享同一份状态存储,点击任一处立即同步反映到另一处。系统 SHALL 通过 `<html class="no-js">` 初始 class + head 内 `<script is:inline>` 同步切换为 `js`,以避免首屏闪烁(FOUC);无 JS 时已读/收藏态不显示但内容仍可正常阅读。

#### Scenario: 列表页已读文章降亮

- **WHEN** 用户打开首页,localStorage 中存在某些文章的已读记录
- **THEN** 这些文章卡片的标题颜色变为 `var(--faint)`,标题下划线渐变动效被去除(`background-image: none`),`.post-meta` 文字颜色变为 `var(--faint)`

#### Scenario: 收藏按钮联动

- **WHEN** 用户在列表页点击文章 A 的 ☆ 按钮
- **THEN** 该按钮立即变为 ★(`aria-pressed="true"`);用户随后打开文章 A 详情页时,详情页的收藏按钮初始即为 ★;两处状态来自同一次 `localStorage` 写入

#### Scenario: 无 JavaScript 时优雅降级

- **WHEN** 浏览器禁用 JS 或 JS 加载失败
- **THEN** 站点所有内容(文章列表、详情、标签页、搜索)仍正常可读;已读/收藏态不显示但也不报错;`<html>` 保持 `no-js` class,CSS 默认态即为可读态

### Requirement: 阅读进度保存与恢复

系统 SHALL 在文章详情页保存用户滚动位置(`scrollY`)。保存 MUST 同时监听 `visibilitychange`(切换到 `hidden` 时)与 `pagehide` 两个事件,系统 MUST NOT 使用 `unload` 或 `beforeunload`(前者破坏 bfcache,后者在 iOS Safari 不触发)。保存操作 SHALL 防抖(≥150ms)以避免高频写入。再次访问同一文章时,系统 SHALL 等待页面内所有 `<img>` `decode()` 完成(`Promise.allSettled`)后再 `scrollTo(0, savedY)`,以避免图片加载导致的位置跳动。已保存的 `scrollY` 随已读状态一起存于 envelope.data.read[<url_hash>].y。

#### Scenario: 中途离开后恢复位置

- **WHEN** 用户在文章 A 读到 `scrollY=1240` 后切到后台(iOS Home 键触发 `visibilitychange`)或关闭页面(`pagehide`)
- **THEN** `scrollY=1240` 被写入该文 `url_hash` 对应的 `read.y`;用户重开文章 A 时,页面在图片解码完成后 `scrollTo(0, 1240)`,从原位置继续

#### Scenario: 不使用破坏 bfcache 的事件

- **WHEN** 审查详情页的事件监听器
- **THEN** 不存在 `addEventListener('unload', ...)` 或 `addEventListener('beforeunload', ...)` 调用;滚动保存仅绑在 `visibilitychange` 与 `pagehide` 上

### Requirement: 收藏聚合页 /bookmarks/

系统 SHALL 生成静态路由 `/bookmarks/`,作为用户查看自己收藏文章的入口。页面构建时 SHALL 把全量文章 manifest(`url_hash → { title, source, date, url, slug }`)以 `<script type="application/json" id="dn-posts">` 形式内联到 HTML 中(避免 client fetch 多一次往返)。客户端 SHALL 读取 `localStorage` 中的 `starred` 映射,与 manifest join 后渲染列表,默认按 `starredAt` 倒序排列。页面 SHALL 提供三个过滤标签:`全部` / `稍后读`(未读但已收藏,最有价值的「待读队列」) / `已读`,默认展示「全部」。当 manifest 中找不到某已收藏 `url_hash`(文章被 crawler 删除)时,系统 SHALL 显式列出「[已删除] 此文章已不可访问」并提供一键清除失效收藏按钮,而非静默吞掉。

#### Scenario: 首次访问空状态

- **WHEN** 新用户(无 localStorage 数据)访问 `/bookmarks/`
- **THEN** 页面显示空状态提示(如「还没有收藏,去首页看看」),不报错、不渲染空白

#### Scenario: 收藏后查看并排序

- **WHEN** 用户先收藏文章 A(`starredAt=t1`),后收藏文章 B(`starredAt=t2 > t1`),访问 `/bookmarks/`
- **THEN** 列表按 `starredAt` 倒序展示:文章 B 在前、文章 A 在后;每条展示标题、来源、日期,点击跳转 `/news/<slug>/`

#### Scenario: 稍后读过滤

- **WHEN** 用户点击「稍后读」过滤标签
- **THEN** 列表仅展示 `starred` 中存在但 `read` 中不存在的文章(即收藏了但还没读的),作为待读队列

#### Scenario: 孤儿收藏的透明清理

- **WHEN** 用户曾收藏文章 X,但 crawler 后续删除了 `news/<X>.md`(manifest 中已无 X 的 `url_hash`)
- **THEN** `/bookmarks/` 列表显式展示一行「[已删除] 此文章已不可访问」,并提供「清除失效收藏」按钮;点击后从 localStorage 中移除 X 的 `starred` 记录,manifest 与 localStorage 重新一致

#### Scenario: build manifest 不含正文

- **WHEN** 审查 `dn-posts` JSON 内容
- **THEN** JSON 仅含元数据字段(`url_hash`、`slug`、`title`、`source`、`date`、`url`、`tags`),不含文章正文,体量可控(预估 500 篇 ≈ 100KB,gzip 后 ≈ 25KB)

### Requirement: 首页最后更新时间显示

系统 SHALL 在首页 `/` 的 `section-head` 区域显示「最后更新」时间,数据来源是 crawler 最近一次运行的 `finished_at`(扫 `runs/*.json` 取 `max(Date.parse(finished_at))`)。系统 MUST 在 Astro build 时通过 `import.meta.glob` 静态读取所有 run summary 文件,运行时(浏览器端)MUST NOT 发起任何 fetch 取该数据。显示格式 SHALL 为 `<time datetime="<ISO>">最后更新 YYYY-MM-DD HH:MM (UTC+8)</time>`,可见文本 MUST 用 `Intl.DateTimeFormat` 强制 `timeZone: 'Asia/Shanghai'` 格式化,避免 build 服务器时区漂移。当 `runs/` 目录无有效 run summary(全新仓库首次 build 或仅含 `.gitkeep`)时,系统 SHALL 不渲染该元素而非抛错。

#### Scenario: 显示最近一次运行时间

- **WHEN** `runs/` 含 `2026-06-26.json`(`finished_at: "2026-06-26T13:27:18.216Z"`),用户访问首页 `/`
- **THEN** `section-head` 区域显示 `<time datetime="2026-06-26T13:27:18.216Z">最后更新 2026-06-26 13:27 (UTC+8)</time>`,build 产物 HTML 中此文本为静态字面量

#### Scenario: 跨多份 run summary 取最新

- **WHEN** `runs/` 含 `2026-06-25.json`(`finished_at: T1`)与 `2026-06-26.json`(`finished_at: T2 > T1`)
- **THEN** 首页显示的时间对应 T2(最新的 `finished_at`),而非按文件名日期排序

#### Scenario: runs 目录为空时降级

- **WHEN** `runs/` 目录只有 `.gitkeep`(全新仓库或 crawler 从未跑过),用户访问首页
- **THEN** `section-head` 区域不渲染「最后更新」元素,页面其他部分(标题、lede、文章列表)正常显示,build 不报错

#### Scenario: 不引入客户端 fetch

- **WHEN** 审查首页的客户端 JS 与网络请求
- **THEN** 不存在 `fetch('/runs.json')` 或类似的运行时取数调用;最后更新时间完全是 build time 生成的静态 HTML 字面量
