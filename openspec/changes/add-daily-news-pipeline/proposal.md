## Why

信息过载与多语言阅读壁垒:个人想系统化追踪中英文科技资讯,但每天手动翻多个站点效率低,英文内容对中文读者有门槛。需要一个完全无运维成本(无数据库、无 Redis、无运行时中间件)的方案——定时抓取 → 智能翻译 → 自动分类 → 编译为静态站点发布,全程跑在 GitHub Actions(内容生产)+ Cloudflare Pages(渲染托管)上,两条流水线通过 `news/*.md` 文件夹解耦,各自纯粹。

## What Changes

- **新增资讯爬取管线**:GitHub Actions daily cron 抓取多源(RSS 优先,静态 HTML 兜底,跳过 JS 渲染源),用 mozilla-readability 提取正文,turndown 转 Markdown;按源声明语言智能决定是否全文翻译(OpenAI 兼容 LLM,翻译/打标按任务分模型);LLM 自由打标并经 tags.json 别名归一化;输出 Markdown + frontmatter 到 `news/`。
- **新增内容寻址式持久化**:不引入任何数据库。`news/*.md` 即真相源——去重靠扫 frontmatter `url_hash`,翻译幂等靠文件存在性;`tags.json`(别名表)、`source-state.yaml`(抓取游标)、`runs/<date>.json`(运行摘要)由 git 持久化;`actions/cache` 仅作可丢弃的优化层。
- **新增 `add-source` CLI**:本地 `pnpm add-source <url>` 全自动发现 feed、嗅探 type/lang、试抓最新一篇预览 Markdown、生成经 Zod 校验的条目并追加 `sources.yaml`。
- **新增 Astro 静态站点**:Content Collections(带 Zod schema)读取 `news/`,生成首页(分页)、文章详情、标签云、每标签列表(分页)、全站 + 每标签 RSS、sitemap;Pagefind 构建时生成站内搜索索引。
- **新增 Cloudflare Pages 部署**:仓库连接 CF Pages,push 触发自动 `astro build` + `pagefind`,输出 `dist/` 到全球 CDN。构建无 secret、确定性渲染。

## Capabilities

### New Capabilities

- `news-crawling`: 资讯抓取与内容生产。覆盖多源抓取(RSS/JSON API/静态 HTML,不支持 SPA)、URL 哈希去重、按源语言智能翻译、LLM 打标 + tags.json 别名归一化、输出 Markdown+frontmatter、daily cron 调度、部分失败隔离、token 预算护栏、truncated 检测。
- `news-site`: 资讯站点构建与呈现。覆盖 Astro Content Collections schema、首页/文章详情/标签列表/标签云路由与分页、Pagefind 站内搜索、全站 + 每标签 RSS、sitemap、热链图片与碎图兜底钩子。
- `news-deploy`: 静态站点部署。覆盖 Cloudflare Pages 连仓库、push 触发自动构建、无 secret 确定性渲染、`dist/` 输出到 CDN、与 crawl job 的边界划分(GitHub 只生产,CF 只渲染)。

### Modified Capabilities

无(greenfield 项目,首次建立能力)。

## Impact

- **新增代码**:`crawler/`(TypeScript / Node)、`src/`(Astro 站点)、`cli/`(add-source 工具)。单仓多目录,crawler 与 Astro 共享同一套 frontmatter Zod schema(类型同源,两端不会漂移)。
- **新增配置**:`sources.yaml`、`llm.config.yaml`、`tags.json`、`source-state.yaml`、`.github/workflows/crawl.yml`。
- **外部依赖(npm)**:`openai`(LLM 客户端,指向 OpenAI 兼容端点)、`turndown` + `turndown-plugin-gfm`(HTML→Markdown)、`@mozilla/readability`(正文提取)、`rss-parser`(feed 解析)、`astro` + `@astrojs/rss` + `pagefind`(站点与搜索)。
- **基础设施**:GitHub Actions(daily cron + `LLM_API_KEY`/`LLM_BASE_URL` secrets)、Cloudflare Pages(构建 + 托管)。
- **无数据库 / 无 Redis / 无运行时中间件**:所有持久化落在 git 仓库内;LLM 密钥仅存 Actions secrets,构建阶段零 secret。
