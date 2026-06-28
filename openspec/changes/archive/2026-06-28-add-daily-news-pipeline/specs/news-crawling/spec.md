## ADDED Requirements

### Requirement: 多源抓取与路由

系统 SHALL 按源在 `sources.yaml` 声明的 `type` 字段路由抓取:`rss`(RSS/Atom feed)、`api`(JSON API)、`html`(静态 HTML 抓取)。系统 SHALL 优先使用 RSS 源 feed 自带的 `content`/`summary` 字段作为正文,避免额外正文提取。系统 MUST NOT 支持 JS 渲染(SPA)源——对此类源跳过并在运行摘要中记日志。

#### Scenario: RSS 源带全文 content

- **WHEN** 源 type 为 rss 且 feed item 含 `content` 字段
- **THEN** 系统直接使用该字段作为正文 HTML,不触发额外正文提取

#### Scenario: RSS 源仅含摘要需补抓

- **WHEN** 源 type 为 rss 但 feed item 仅含 `summary` 摘要
- **THEN** 系统按 item 的 `link` 抓取完整网页并用 Readability 提取正文

#### Scenario: 遇到 JS 渲染源

- **WHEN** 静态 HTML 抓取得到的正文长度低于阈值(疑似 SPA)
- **THEN** 系统标记该文章 `truncated: true` 进 frontmatter 并在运行摘要记日志,不尝试 JS 渲染

### Requirement: URL 哈希去重

系统 SHALL 用 `url_hash = sha1(canonicalize(url))` 作为去重主键。系统 MUST 通过扫描 `news/*.md` frontmatter 的 `url_hash` 字段派生「已见 URL 集合」,不维护独立的已见列表文件。同一 URL 跨次运行重复抓取时,系统 SHALL 跳过该文章。

#### Scenario: 首次抓取某 URL

- **WHEN** 待抓取文章的 url_hash 不存在于 `news/*.md` frontmatter 中
- **THEN** 系统处理并输出该文章

#### Scenario: 重复抓取已存在 URL

- **WHEN** 待抓取文章的 url_hash 已存在于 `news/*.md` frontmatter 中
- **THEN** 系统跳过该文章,不抓取、不翻译、不花费 LLM token

### Requirement: 按源语言智能翻译

系统 SHALL 根据源在 `sources.yaml` 声明的 `lang` 字段决定是否翻译,不运行时检测语言。当 `source.lang != target_lang` 时,系统 SHALL 调用 LLM 全文翻译;否则 SHALL 跳过翻译。翻译后的文章 frontmatter MUST 标记 `translated: true` 并保留 `original_lang`。

#### Scenario: 英文源需翻译为中文

- **WHEN** 源 lang 为 en 且 target_lang 为 zh
- **THEN** 系统调用 translate 模型全文翻译,写入 frontmatter `translated: true`、`original_lang: en`、`lang: zh`

#### Scenario: 中文源无需翻译

- **WHEN** 源 lang 为 zh 且 target_lang 为 zh
- **THEN** 系统跳过翻译,直接使用原文,frontmatter `translated: false`

### Requirement: LLM 打标与别名归一化

系统 SHALL 对每篇文章调用 LLM 生成标签,生成时把 `tags.json` 的 canonical 标签列表作为上下文喂入,prompt 指示优先复用现有标签。系统 SHALL 将 LLM 输出的原始标签经 `tags.json` 别名表归一化为 canonical 名后写入 frontmatter。系统 MUST 限制每篇文章标签数量(默认上限 5)。

#### Scenario: 复用已有 canonical 标签

- **WHEN** LLM 输出标签 "人工智能" 且 tags.json 中存在 canonical "AI" 其别名含 "人工智能"
- **THEN** frontmatter `tags` 写入归一化后的 canonical 名 "AI"

#### Scenario: 创建新标签

- **WHEN** LLM 输出的标签在 tags.json 任何 canonical 及其别名中均无匹配
- **THEN** 系统将该标签作为新 canonical 写入 frontmatter(是否回写 tags.json 由后续维护决定)

### Requirement: Markdown + frontmatter 输出

系统 SHALL 将每篇文章输出为 `news/<date>-<slug>.md`。frontmatter MUST 包含:`title`、`url`、`url_hash`、`source`、`source_url`、`date`、`lang`、`translated`,以及 `tags[]`;可选 `original_lang`、`truncated`。正文 SHALL 为经 turndown 转换并归一化后的 Markdown。

#### Scenario: 输出标准文章文件

- **WHEN** 一篇文章完成抓取、(可能的)翻译与打标
- **THEN** 系统在 `news/` 下创建 `<date>-<slug>.md`,包含完整 frontmatter 与 Markdown 正文

### Requirement: daily cron 调度

系统 SHALL 通过 GitHub Actions 的 schedule(cron)触发,默认每天运行 1 次。系统 MUST 设置 `concurrency` 组防止并发运行导致 commit 冲突。

#### Scenario: 每日定时触发

- **WHEN** 到达 cron 设定时间
- **THEN** crawl job 启动,遍历 sources.yaml 所有源并处理新文章

#### Scenario: 防止并发

- **WHEN** 一次 crawl job 运行中又触发了一次
- **THEN** 后触发的运行被并发组阻塞或取消,不产生冲突 commit

### Requirement: 部分失败隔离

系统 MUST 在单篇文章处理失败时跳过该篇并继续处理其余,不因单篇失败终止整个 run。失败信息 SHALL 记录到 `runs/<date>.json`。

#### Scenario: 单篇翻译失败

- **WHEN** 某篇文章调用 LLM 翻译时连续重试仍失败
- **THEN** 系统跳过该篇(或写入未译原文),记失败到运行摘要,继续处理后续文章

### Requirement: token 预算护栏

系统 SHALL 在单次 run 累计 LLM token 用量达到 `llm.config.yaml` 的 `max_tokens_per_run` 上限时,停止处理剩余文章并在运行摘要中告警。已处理的文章不受影响。

#### Scenario: 触达预算上限

- **WHEN** 单次 run 累计 token 达到 max_tokens_per_run
- **THEN** 系统停止处理后续文章,运行摘要记录 "budget_exceeded" 告警,本次 run 已写入的内容保留

### Requirement: 运行摘要记录

系统 SHALL 在每次 run 结束时写入 `runs/<date>.json`,记录每源抓取数量、翻译篇数、token 消耗、失败项与预算告警。摘要为 append-only,可月度归档。

#### Scenario: 正常运行结束

- **WHEN** crawl job 完成(无论是否有失败项)
- **THEN** 系统在 `runs/` 下写入当天运行摘要 JSON,含各源 items 数、总 token、失败列表
