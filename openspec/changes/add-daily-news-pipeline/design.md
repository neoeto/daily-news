## Context

Greenfield 项目 `daily-news`,目标是自动化中英文资讯聚合。硬约束:**应用完全在 GitHub Actions + Cloudflare Pages 中运行,不依赖任何数据库、Redis 或运行时中间件**。所有持久化必须落在 git 仓库内或可丢弃的 Actions cache 中。

当前状态:空仓库(占位 `package.json`,无提交,无既有能力)。本次变更建立全部三条能力(news-crawling / news-site / news-deploy)。

两条流水线通过 `news/*.md` 文件夹解耦,形成对称的纯粹边界:**GitHub Actions 只负责内容生产(抓取/翻译/打标/提交),Cloudflare Pages 只负责渲染(构建/搜索索引/分发)**。两者唯一的契约是 `news/` 目录的内容与 frontmatter schema。

## Goals / Non-Goals

**Goals:**
- 零运维:无 DB / 无 Redis / 无运行时中间件,持久化全在 git
- 内容生产与渲染解耦,各自可独立演化(换主题不碰爬虫,加源不碰站点)
- 低摩擦扩展源:一条 URL 全自动加入
- 翻译质量优先 + 成本可控(按任务分模型 + 预算护栏)
- 站点无密钥、确定性构建,可在任意静态托管平台复现

**Non-Goals:**
- 不支持 JS 渲染(SPA)源——静态 fetch + RSS 覆盖 90%+ 源,SPA 跳过并记日志
- 不做跨源语义去重(起步只用 URL 哈希,simhash 后期再加)
- 不做按日期归档页(首页分页 + 标签页已够,后期零成本可补)
- 不做 OPML 批量导入(起步不支持,后期零成本可补)
- 不本地化图片(热链;碎图兜底作为可选后期钩子)
- 不做用户系统/评论/动态后端——纯静态
- 不自建翻译/打标模型——一律走 OpenAI 兼容外部 LLM

## Decisions

### D1. 内容格式:Markdown + frontmatter(非 HTML / 非 JSON)

`news/` 存 `.md`,头部 frontmatter 携带结构化元数据。**理由**:(1) Astro / Hugo / 11ty 等主流 SSG 原生支持「内容集合」,换主题零成本;(2) frontmatter 是 SSG 生态最主流的元数据载体;(3) 渲染完全交给 presenter,crawler 只管「抓 + 译 + 打标」,职责清晰。

**考虑过的替代**:
- *最终 HTML*:crawler 产出完整带样式 HTML,presenter 只做索引。代价:换皮要动 crawler,标签只能塞 sidecar JSON,生态关闭。被否。
- *结构化 JSON*:灵活性最高但所有 SSG 模板都要自写,且不能直接预览文件。被否。

frontmatter 字段(完整定义见 `news-site` spec 的 Content Collection schema):`title`、`url`、`url_hash`、`source`、`source_url`、`date`、`lang`、`original_lang?`、`translated`、`tags[]`、`truncated?`。

### D2. 解耦边界:`news/` 文件夹作为契约

crawler 输出 `news/<date>-<slug>.md`;Astro Content Collection 读取同一目录。两端共享同一套 Zod schema(`shared/schema.ts`),**类型同源,字段定义不会漂移**:crawler 写入时校验一次,Astro 构建时再校验一次。

### D3. 持久化:内容寻址,无独立状态存储

不维护「已见 URL 列表」「翻译缓存表」等独立状态文件。**核心洞察:文件存在 = 已处理**。

| 状态 | 存储方式 | 说明 |
|---|---|---|
| `news/*.md` 内容 | git commit | 权威内容层 |
| URL 去重 | **派生**:扫 `news/*.md` frontmatter `url_hash` 构建已见集合 | 无独立文件,O(n) 但 daily 1×、N 小 |
| 翻译幂等 | **派生**:`url_hash` 对应 `.md` 已存在则整篇跳过 | 文件即翻译缓存 |
| 运行历史 | **派生**:`git log news/` | 不单独存 |
| 每源最新日期 | **派生**:扫该 source 的 md 取 `max(date)` | 业务过滤用 |
| `tags.json` 别名表 | git commit | 策展状态,小、慢长 |
| `source-state.yaml` 抓取游标(ETag) | git commit | 带宽优化,丢了最坏多抓一次 |
| `runs/<date>.json` 运行摘要 | git commit,append-only | 可观测(token/抓取量),月度归档 |
| 翻译复用 / 依赖缓存 | `actions/cache`(evictable) | **非权威**,丢了从 news/*.md 重建 |

**考虑过的替代**:用独立 `seen-urls.json` 存去重集合——被否,因为文件存在性已隐含该信息,独立文件只会冗余且需额外一致性维护。

### D4. 抓取:RSS 优先,静态 HTML 兜底,SPA 跳过

路由按源 `type`:`rss` | `api` | `html`。**RSS 路线隐藏红利**:feed 的 `content`/`summary` 字段已是 HTML 片段,多数情况无需正文提取。仅当「feed 只给摘要」或「无 RSS 只能抓网页」时才进入 HTML 提取。

不支持 JS 渲染源(需 Playwright,复杂度跳一档);静态 fetch 得到 HTML 若正文过短,标记 `truncated: true` 进 frontmatter。

### D5. 正文提取:Readability 为主 + 失败源选择器覆盖

默认所有源用 `@mozilla/readability` 启发式自动找主内容(搞定 ~80%)。少数提取不干净的源,在 `sources.yaml` 该源下加 `selectors:` 覆盖。Readability 输出后追加清理 pass,移除 `.related`/`.newsletter`/`.paywall` 等残留块。

**考虑过的替代**:
- *纯每站手写选择器*:精确但维护量大,原站改版即坏。被否(作为默认;仅作失败源兜底)。
- *LLM 提取*:精度高但每篇花 token 且 HTML 巨大。被否。

### D6. HTML → Markdown:turndown + GFM 插件

`turndown`(事实标准)+ `turndown-plugin-gfm`(表格/删除线/任务列表)。转换天然有损,处理规则:
- `<img>` 原样保留为 `![alt](原图 src)`(热链,见 D7)
- `<iframe>`/`<figure>` 等无 Markdown 等价物 → turndown 透传原始 HTML
- `<script>`/`<style>`/`<nav>`/inline style/class → 丢弃
- 实体与空白归一化 pass

**实现选择**:自组合 `mozilla-readability` + `turndown`,而非一体式 `@postlight/parser`——需要精细控制图片/表格/嵌入,组合式更可控。

### D7. 图片:原样热链

保留原图 `src`,不下载。**理由**:零存储、零成本、最简,符合「无中间件」原则。**已接受代价**:原站删图/防盗链 → 永久碎图。碎图兜底(构建时检测 / Astro `<img onerror>` 占位)作为**可选后期钩子**,不阻塞首发。

**考虑过的替代**:
- *下载提交进仓库*:git 不擅存二进制,与「仓库膨胀」担忧直接冲突。被否。
- *下载 → Cloudflare R2 → 重写 src*:R2 是静态对象存储(非 DB/Redis 类运行时中间件),技术上可接受,但引入一个外部依赖,个人资讯站图片多为点缀,不值得。被否(预留:若未来碎图严重再评估)。

### D8. 翻译:按源声明语言,智能跳过,全文翻译

不运行时检测语言。每个源在 `sources.yaml` 声明 `lang`。处理规则:`if source.lang != target_lang: translate(full body) else: skip`。可靠且零检测成本。长文按段落分块翻译再拼接作兜底。

### D9. LLM 支持:OpenAI 兼容 + 按任务分模型 + 预算护栏

用 `openai` 官方 npm 包,`baseURL` 指向任意 OpenAI 兼容端点(GLM / DeepSeek / Moonshot / OpenRouter / 本地 Ollama 等)。**切 provider = 改 `base_url` + `model` + Actions secret,零代码改动。**

按任务分模型(成本/质量特性不同):
- `translate.model`:强模型(质量优先,如 `glm-4.5`),`temperature: 0.3`
- `tag.model`:flash/mini 级(分类够用,如 `glm-4.5-flash`),`temperature: 0.2`

护栏与鲁棒性(默认全开):重试 + 指数退避(openai 包内置)、单篇超时、部分失败隔离(一篇坏不杀整批,记 `runs/<date>.json`)、`max_tokens_per_run` 硬上限(异常源爆量踩刹车,超额停止 + 告警)。

配置与源配置分文件(`llm.config.yaml` vs `sources.yaml`),因关注点/演化节奏/权限边界不同。密钥只存 Actions secrets,`${LLM_API_KEY}` 环境变量替换,绝不进仓库。

### D10. 打标:LLM 自由打标 + tags.json 别名归一化

LLM 输出原始标签 → 经 `tags.json` 别名表归一化为 canonical 名 → 落地 canonical。`tags.json` 形如 `{"AI": ["ai", "A.I.", "人工智能", "机器智能"], "Rust": ["rust-lang"], ...}`。

LLM 打标时把 tags.json 的 canonical 标签作为上下文喂入,prompt 指示优先复用现有标签、仅当无匹配时才创建。别名表吸收变体 proliferation(`GenAI` vs `生成式AI`),即使 LLM 偶尔输出变体也能归并。别名表可手工编辑 + 定期 LLM 审查扩充(后期可选)。

**考虑过的替代**:
- *tags.json 纯列表(无别名)*:挡不住变体 proliferation。被否。
- *扫描 news/*.md 收集标签*:无归一化,O(n) 读取且噪声累积。被否。

### D11. 去重:URL 哈希(扫 frontmatter)

`url_hash = sha1(canonicalize(url))`。每次运行扫 `news/*.md` frontmatter 构建已见集合;新文章 hash 命中则跳过。**文件存在即已处理**,自愈、可审计、零额外状态。跨源同题(simhash)起步不做。

### D12. SSG:Astro

选 Astro 而非 Hugo/11ty。**理由**:TS 原生(与 crawler 同语言,共享 Zod schema)、Content Collections API 对 frontmatter md 一等支持、内置分页、Islands 架构(交互组件按需加载)、Vite 生态。对「文章型 + 标签/分类」站点最自然。

### D13. 构建与部署:Cloudflare Pages 自动构建,无 secret

仓库连接 CF Pages,push 触发自动 `astro build` + `pagefind --site dist`。**GitHub Actions 只跑 crawl job,不跑 build job;CF 只渲染,不生产。** 构建**无 secret、确定性**——翻译/打标全在 crawl job 早做完了,Astro build 只渲染已处理 markdown,CF 配置零 secret、可复现、失败可重跑。daily 1× 提交,CF 构建配额无忧。

**考虑过的替代**:*Actions 全包(构建 + wrangler 部署)*——被否,因为希望保持 GitHub 项目「只管内容生产」的纯粹性;CF 自动构建更简单且天然 CDN。

### D14. 源管理:`add-source` CLI,全自动 feed 发现

本地 `pnpm add-source <url>`:fetch URL → 若是站点页扫 `<link rel="alternate">` 发现 feed → 嗅探 type(content-type + body)→ 检测 lang(feed `<language>` 或 franc)→ 取 feed `<title>` 作 name → 试抓最新一篇跑完整管线(readability→turndown)打印 Markdown 预览 → Readability 失败时交互提示加 selectors → 生成经 Zod 校验条目 → 确认后 append `sources.yaml`。

**「快速」的本质 = 一条 URL → 自动发现 + 探测 + 当场验证预览**,不必等 24h cron 才发现坏源。

### D15. 爬虫语言:TypeScript

crawler 与 Astro 同为 TS,共享 `shared/schema.ts` 的 Zod schema。理由:类型同源防漂移、Actions 原生支持 Node、与 Astro/Vite 生态一致。

### D16. 仓库结构:单仓多目录

```
daily-news/
├── crawler/          # TS 抓取管线(Actions 跑)
├── cli/              # add-source 等本地工具
├── src/              # Astro 站点源码(CF 构建)
├── shared/           # 共享 Zod schema (frontmatter / sources / llm config)
├── news/             # 产出内容(crawler 写, Astro 读) ◀── 契约边界
├── configs/
│   ├── sources.yaml
│   ├── llm.config.yaml
│   ├── tags.json
│   └── source-state.yaml
├── runs/             # 运行摘要(append-only)
├── .github/workflows/crawl.yml
├── astro.config.mjs
└── package.json
```

## Risks / Trade-offs

- **[热链碎图]** → 原站删图/防盗链导致永久碎图。缓解:起步接受;预留构建时碎链检测 / Astro `<img onerror>` 占位符作为可选后期钩子。升级路径:若严重,评估 Cloudflare R2 本地化(静态对象存储,不违反运行时中间件原则)。
- **[仓库长期膨胀]** → `news/*.md` 只增不减,N 年后 clone/构建变慢。缓解:设计预留归档钩子(超过 X 个月移至 `archive/` 或独立分支,Astro 只读近 N 个月);`runs/` 月度归档。后期问题,首发不做。
- **[Actions 6h 作业上限]** → daily 1× 批量,正常量级远未触及。缓解:token 预算护栏 + 部分失败隔离,异常情况提前停止而非卡死。
- **[Readability 提取失败]** → 个别源正文提不干净。缓解:该源在 `sources.yaml` 加 `selectors:` 覆盖;`truncated: true` 标记短正文供构建时特殊处理。
- **[标签 proliferation]** → LLM 输出变体标签。缓解:tags.json 别名归一化 + 历史标签作上下文喂入。残留风险:别名表需定期审查(后期可选 LLM 辅助合并)。
- **[付费墙 / SPA 源]** → 静态 fetch 拿到 stub 或空正文。缓解:正文过短检测 → `truncated: true` + 记日志跳过。
- **[LLM provider 故障]** → 单次 run 全部翻译失败。缓解:重试 + 指数退避;失败隔离(该篇跳过不杀整批);内容本身仍写入(原文未译),下次 run 可补译。
