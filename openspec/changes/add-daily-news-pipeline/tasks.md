## 1. 项目脚手架与共享 schema

- [x] 1.1 初始化 monorepo 结构:`crawler/`、`cli/`、`src/`、`shared/`、`news/`、`configs/`、`runs/` 目录
- [x] 1.2 配置根 `package.json`(pnpm workspace)、TypeScript、ESLint、格式化工具
- [x] 1.3 在 `shared/schema.ts` 定义 frontmatter Zod schema(字段:title/url/url_hash/source/source_url/date/lang/translated/tags[]/original_lang?/truncated?),crawler 与 Astro 共享此文件
- [x] 1.4 在 `shared/schema.ts` 定义 `sources.yaml`、`llm.config.yaml`、`tags.json`、`source-state.yaml` 的 Zod schema
- [x] 1.5 安装核心依赖:`openai`、`turndown`、`turndown-plugin-gfm`、`@mozilla/readability`、`jsdom`、`rss-parser`、`gray-matter`、`franc`

## 2. Crawler 抓取基础

- [x] 2.1 实现 `configs/sources.yaml` 加载与校验(经 Zod)
- [x] 2.2 实现 HTTP fetch 封装(自定义 UA、超时、重试、重定向跟随)
- [x] 2.3 实现 RSS/Atom 解析(rss-parser),提取 item 的 title/link/date/content/summary
- [x] 2.4 实现按源 `type` 路由(rss | api | html)的调度入口

## 3. 正文提取与 HTML→Markdown

- [x] 3.1 实现 Readability 正文提取(jsdom + @mozilla/readability)
- [x] 3.2 实现清理 pass:移除 `.related`/`.newsletter`/`.paywall` 等残留选择器
- [x] 3.3 实现每源 `selectors:` 覆盖(失败源手工指定 title/body/date 选择器)
- [x] 3.4 实现 turndown + GFM 插件转换:HTML → Markdown(`<img>` 原样热链、`<iframe>`/`<figure>` 透传、script/style/nav 丢弃)
- [x] 3.5 实现实体与空白归一化 pass
- [x] 3.6 实现 truncated 检测:正文长度低于阈值则标记 `truncated: true`

## 4. 去重与持久化

- [x] 4.1 实现 `url_hash = sha1(canonicalize(url))` 工具
- [x] 4.2 实现扫 `news/*.md` frontmatter 构建已见 url_hash 集合
- [x] 4.3 实现文章写入:`news/<date>-<slug>.md` + frontmatter(经 shared schema 校验)
- [x] 4.4 实现源增量游标:`source-state.yaml` 存 ETag/If-Modified-Since,读取用于带宽优化
- [x] 4.5 实现 git commit & push(提交 news/ 与 configs/ 变更)

## 5. LLM 客户端集成

- [x] 5.1 实现 `configs/llm.config.yaml` 加载(经 Zod),`${VAR}` 环境变量替换
- [x] 5.2 封装 OpenAI 兼容客户端(`openai` 包,baseURL/apiKey/timeout/maxRetries 来自配置)
- [x] 5.3 实现 token 用量累计与 `max_tokens_per_run` 预算护栏(超额停止 + 告警)
- [ ] 5.4 在 GitHub Actions secrets 配置 `LLM_BASE_URL`、`LLM_API_KEY`

## 6. 翻译

- [x] 6.1 实现按源 `lang` 智能跳过:`source.lang != target_lang` 才翻译
- [x] 6.2 实现全文翻译 prompt(translate.model、temperature 0.3)
- [x] 6.3 实现长文按段落分块翻译再拼接(兜底超长文章)
- [x] 6.4 翻译后写入 frontmatter:`translated: true`、`original_lang`、`lang: target`

## 7. 打标

- [x] 7.1 实现 `tags.json` 加载(canonical → 别名数组)
- [x] 7.2 实现打标 prompt:文章 + tags.json canonical 列表作上下文,指示优先复用,限制 max_tags
- [x] 7.3 实现别名归一化:LLM 原始输出经别名表映射为 canonical 名
- [x] 7.4 归一化后标签写入 frontmatter `tags[]`

## 8. 鲁棒性与调度

- [x] 8.1 实现部分失败隔离:单篇 try/catch,失败记 `runs/<date>.json` 不杀整批
- [x] 8.2 实现运行摘要写入 `runs/<date>.json`(每源 items、翻译篇数、token、失败项、预算告警)
- [x] 8.3 编写 `.github/workflows/crawl.yml`:daily cron、secrets 注入、`concurrency` 防并发
- [x] 8.4 端到端本地跑通:fetch → 去重 → (译)→ (标)→ 写 md → 校验 frontmatter 合 schema

## 9. add-source CLI

- [x] 9.1 实现 `pnpm add-source <url>` 入口
- [x] 9.2 实现 feed 发现:给站点 URL 扫 `<link rel="alternate">` 找 feed
- [x] 9.3 实现 type 嗅探(content-type + body)与 lang 检测(feed `<language>` 或 franc)
- [x] 9.4 实现试抓最新一篇跑完整管线(Readability→turndown)打印 Markdown 预览
- [x] 9.5 Readability 失败时交互提示加 `selectors:`,生成经 Zod 校验条目
- [x] 9.6 确认后 append `configs/sources.yaml`

## 10. Astro 站点基础

- [x] 10.1 初始化 Astro 项目(`src/`、`astro.config.mjs`),Content Collections type=content
- [x] 10.2 在 `src/content/config.ts` 定义 news 集合 schema(引用 shared/schema.ts,类型同源)
- [x] 10.3 实现基础 Layout(头部、导航、暗色模式占位)
- [x] 10.4 用 `getCollection('news')` 验证可读取 `news/*.md`(造几篇样例 md)

## 11. Astro 路由与页面

- [x] 11.1 实现首页 `src/pages/index.astro`(最新文章列表,分页)
- [x] 11.2 实现文章详情 `src/pages/news/[...slug].astro`(getStaticPaths 枚举,显示原文链接/来源/日期/标签/翻译标记)
- [x] 11.3 实现标签云 `src/pages/tags/index.astro`(全部 canonical 标签 + 文章数)
- [x] 11.4 实现每标签列表 `src/pages/tags/[tag]/[page].astro`(paginate,按 date 倒序)
- [x] 11.5 实现碎图兜底钩子(`<img onerror>` 占位,预留可选)

## 12. RSS、sitemap 与 404

- [x] 12.1 实现全站 RSS `src/pages/rss.xml.ts`(@astrojs/rss)
- [x] 12.2 实现每标签 RSS `src/pages/tags/[tag]/rss.xml.ts`
- [x] 12.3 集成 @astrojs/sitemap 生成 `/sitemap.xml`
- [x] 12.4 实现 `src/pages/404.astro`

## 13. Pagefind 站内搜索

- [x] 13.1 添加 pagefind 构建步骤(`astro build` 后跑 `pagefind --site dist`)
- [x] 13.2 实现前端搜索 UI 组件(浏览器端查询)
- [ ] 13.3 配置中文分词,验证中文关键词可搜
  - 注:已尝试 segmentit 集成(可行),但 Pagefind 对 U+200B 的分词效果无法在 CI 中验证(索引为二进制,需浏览器实测),且零宽空格会降低浏览器 Ctrl+F 多词短语匹配。建议在有浏览器实测条件时再决定是否启用。

## 14. Cloudflare Pages 部署

- [ ] 14.1 在 Cloudflare 创建 Pages 项目,连接本仓库
- [ ] 14.2 配置构建命令(`pnpm build` + pagefind)与输出目录 `dist/`
- [x] 14.3 验证构建零 secret、确定性(同 commit 重跑结果一致)
- [ ] 14.4 验证 push 触发自动构建与部署,站点在绑定域名可访问
- [x] 14.5 验证边界:crawl job 在 Actions 只产出 news/,不执行 build/deploy

## 15. 端到端验证

- [ ] 15.1 用 add-source 添加 2-3 个真实源(含中英文 RSS),验证预览正确
- [ ] 15.2 手动触发 crawl job,验证 news/*.md 正确产出(含翻译、打标、去重)
- [ ] 15.3 验证 CF 构建出完整站点(首页/文章/标签/搜索/RSS 均可用)
- [x] 15.4 验证重复运行 crawl:已存在 URL 被跳过、不重复翻译、不重复花 token
- [ ] 15.5 验证预算护栏:模拟超量源触发 budget_exceeded 告警
