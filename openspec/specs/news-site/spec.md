# news-site Specification

## Purpose
TBD - created by archiving change add-daily-news-pipeline. Update Purpose after archive.
## Requirements
### Requirement: Content Collection 与 frontmatter 校验

Astro 站点 SHALL 定义名为 `news` 的 Content Collection,type 为 `content`,schema 用 Zod 校验 frontmatter。schema 字段 MUST 与 crawler 共享(类型同源),包含 `title`、`url`、`url_hash`、`source`、`source_url`、`date`、`lang`、`translated`、`tags[]`,以及可选 `original_lang`、`truncated`。构建时 frontmatter 不符合 schema 的文章 MUST 导致构建报错。

#### Scenario: 合法文章被纳入集合
- **WHEN** `news/*.md` 的 frontmatter 符合 Zod schema
- **THEN** 该文章被 Content Collection 收录,可通过 `getCollection('news')` 获取为类型安全对象

#### Scenario: 缺字段文章导致构建失败
- **WHEN** 某文章 frontmatter 缺少必填字段(如 `url_hash`)
- **THEN** Astro 构建报错并指出问题文章,不让坏数据上线

### Requirement: 首页与文章详情路由

系统 SHALL 生成首页 `/`(最新文章列表,按 date 倒序,分页)与文章详情页 `/news/<slug>/`。文章详情页 SHALL 显示标题、正文、来源(带原文链接)、日期、标签、翻译标记。

#### Scenario: 访问首页
- **WHEN** 访问站点根路径 `/`
- **THEN** 返回最新 N 篇文章列表(分页),含标题、摘要、来源、日期、标签

#### Scenario: 访问文章详情
- **WHEN** 访问 `/news/<slug>/`
- **THEN** 返回该文章完整内容,含原文链接、来源、日期、标签;若 `translated: true` 显示翻译标记

### Requirement: 标签云与每标签列表页

系统 SHALL 生成标签云页 `/tags/`(列出所有 canonical 标签及文章数)与每标签列表页 `/tags/<tag>/`(该标签下所有文章,分页)。

#### Scenario: 浏览标签云
- **WHEN** 访问 `/tags/`
- **THEN** 返回全部 canonical 标签,每个标签附该标签下文章数

#### Scenario: 浏览单标签列表
- **WHEN** 访问 `/tags/ai/`
- **THEN** 返回所有 tags 含 "ai" 的文章列表(分页,按 date 倒序)

### Requirement: 站内搜索(Pagefind)

系统 SHALL 在 Astro 构建产出 `dist/` 后运行 Pagefind 生成搜索索引,索引写入 `dist/pagefind/`。系统 SHALL 在前端提供搜索 UI,在浏览器端运行查询,无需服务端。中文搜索 MUST 经配置支持分词。

#### Scenario: 构建后生成搜索索引
- **WHEN** `astro build` 完成,执行 `pagefind --site dist`
- **THEN** `dist/pagefind/` 下生成索引文件,前端搜索 UI 可查询全部已发布文章

#### Scenario: 用户站内搜索
- **WHEN** 用户在前端搜索框输入关键词(含中文)
- **THEN** 浏览器端返回匹配文章的标题、片段与链接,全程无服务端调用

### Requirement: RSS feed(全站 + 每标签)

系统 SHALL 生成全站 RSS `/rss.xml` 与每标签 RSS `/tags/<tag>/rss.xml`。RSS 由 `@astrojs/rss` 在构建时生成。每标签 feed 让读者可只订阅某栏目。

#### Scenario: 订阅全站
- **WHEN** 读者订阅 `/rss.xml`
- **THEN** 获得全站最新文章的 RSS feed

#### Scenario: 订阅单标签
- **WHEN** 读者订阅 `/tags/ai/rss.xml`
- **THEN** 仅获得 tags 含 "ai" 的文章 RSS feed

### Requirement: sitemap 与 404

系统 SHALL 生成 `/sitemap.xml`(供搜索引擎)与 `/404.html`(自定义未找到页)。

#### Scenario: 生成 sitemap
- **WHEN** 构建完成
- **THEN** `dist/sitemap.xml` 列出全部公开页面 URL

### Requirement: 图片热链与碎图兜底钩子

系统 SHALL 在渲染时保留文章中图片的原始 `src`(热链),不重写为本地图址。系统 SHALL 预留碎图兜底钩子(如 `<img>` 的 `onerror` 占位),作为可选后期增强,不阻塞首发。

#### Scenario: 渲染热链图片
- **WHEN** 文章 Markdown 含 `![alt](https://原站/img.png)`
- **THEN** 渲染为 `<img src="https://原站/img.png" alt="alt">`,保留原始 URL

