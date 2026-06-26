# daily-news

自动化的中英文资讯聚合管道——每日抓取多源 RSS/网页,经 LLM 翻译与打标后,编译为静态站点发布。

## 项目介绍

daily-news 解决一个问题:**把分散的信息源聚合成一个可读、可搜索、可订阅的中文资讯站**,且全程零运维、零数据库。

### 核心能力

- **多源聚合** —— 支持 RSS/Atom feed 和直连文章页;`add-source` CLI 全自动发现 feed 并试抓预览
- **智能翻译** —— 按源声明语言,英文内容自动经 LLM 翻译为中文(中文源跳过翻译)
- **LLM 打标** —— 每篇文章自动生成标签,经 `tags.json` 别名归一化(如"人工智能"/"AI" 统一)
- **去重** —— 两层:HTTP ETag(整源未变不下载)+ url_hash 内容寻址(文章级精确去重)
- **预算护栏** —— 全局 token 上限 + 每源 `max_items` 上限,防止高频源吃满配额
- **静态站点** —— Astro 构建,Pagefind 全文搜索,全局/每标签 RSS,sitemap
- **失败隔离** —— 单篇文章或单源失败不影响整轮运行,失败详情记入运行摘要

### 设计哲学

- **无数据库** —— 所有持久化落在 git 仓库内(`news/*.md`、`configs/`、`runs/`),文件存在即已处理
- **两条流水线解耦** —— GitHub Actions 只管内容生产,Cloudflare Pages 只管渲染构建
- **类型同源** —— crawler 与 Astro 站点共享同一套 Zod schema,frontmatter 字段不会漂移

---

## 架构

### 整体数据流

```
┌─────────────────────────────────────────────────────────────┐
│  Pipeline 1: 内容生产 (GitHub Actions, 每日 cron)             │
│                                                             │
│  sources.yaml ──→ fetch ──→ ETag 去重                        │
│                    │                                        │
│                    ▼                                        │
│               RSS 解析 / HTML 抓取                           │
│                    │                                        │
│                    ▼                                        │
│               url_hash 去重 (扫已有 news/*.md)               │
│                    │                                        │
│                    ▼                                        │
│               Readability 正文提取 → turndown HTML→MD        │
│                    │                                        │
│                    ▼                                        │
│               LLM 翻译 (英文源) → LLM 打标                    │
│                    │                                        │
│                    ▼                                        │
│               写入 news/<date>-<slug>.md                     │
│                    │                                        │
│                    ▼                                        │
│               git commit & push ← GITHUB_TOKEN 认证          │
└────────────────────────────┬────────────────────────────────┘
                             │ push
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Pipeline 2: 站点渲染 (Cloudflare Pages, push 触发)           │
│                                                             │
│  pnpm build ──→ Astro 编译 (Content Collection 读 news/)     │
│                    │                                        │
│                    ▼                                        │
│               Pagefind 搜索索引                              │
│                    │                                        │
│                    ▼                                        │
│               部署到 CDN                                     │
└─────────────────────────────────────────────────────────────┘
```

### Monorepo 结构

```
daily-news/
├── shared/              # 共享 Zod schema (crawler 与 Astro 的类型契约)
│   └── src/schema.ts
├── crawler/             # 抓取管线 (GitHub Actions 运行)
│   ├── src/
│   │   ├── index.ts     # 主编排器 (逐源遍历 + 失败隔离 + 预算熔断)
│   │   ├── config.ts    # 配置加载 + ${VAR} 环境变量替换
│   │   ├── fetch.ts     # HTTP 抓取 (重试/重定向/UA)
│   │   ├── dedup.ts     # url_hash 去重 (内容寻址)
│   │   ├── extract.ts   # Readability 正文提取
│   │   ├── turndown.ts  # HTML → Markdown
│   │   ├── llm.ts       # OpenAI 兼容客户端 + token 预算
│   │   ├── translate.ts # 分块翻译
│   │   ├── tag.ts       # LLM 打标 + 别名归一化
│   │   ├── write.ts     # 写 news/*.md (slug 冲突自动加 hash)
│   │   ├── state.ts     # source-state.yaml 持久化 (ETag 游标)
│   │   ├── summary.ts   # runs/<date>.json 运行摘要
│   │   └── sources/     # rss.ts (feed 解析) + router.ts (类型分派)
│   └── test/
├── cli/                 # add-source 命令行工具
│   ├── src/add-source.ts
│   └── test/
├── configs/             # 运行配置 (tracked in git)
│   ├── sources.yaml         # 资讯源声明
│   ├── llm.config.yaml      # LLM 设置 (模型/温度/预算, 支持 ${VAR} 覆盖)
│   ├── tags.json            # 标签别名注册表
│   └── source-state.yaml    # 每源 ETag 游标 (运行时自动更新)
├── news/                # 抓取产物 (crawler 写入, Astro 读取)
├── runs/                # 运行摘要 JSON (每次运行一个文件)
├── src/                 # Astro 站点
│   ├── content.config.ts    # Content Collection (glob loader → ./news)
│   ├── layouts/Base.astro
│   ├── pages/               # 首页/文章/标签/RSS/404 + 分页
│   ├── components/Search.astro
│   └── styles/global.css    # 编辑风设计系统
├── .github/workflows/
│   ├── crawl.yml        # 每日 cron 抓取 + 提交回写
│   └── ci.yml           # 质量门 (typecheck + test + build)
└── astro.config.mjs
```

### 去重机制(两层)

| 层级    | 机制                                                  | 作用                          |
| ------- | ----------------------------------------------------- | ----------------------------- |
| Feed 级 | HTTP `If-None-Match` / `If-Modified-Since` → 304 跳过 | 整个 feed 未变时不下载,省带宽 |
| 文章级  | `sha1(canonicalize(url))` 扫 `news/*.md` frontmatter  | 精确到单篇文章,跨源也能去重   |

URL 规范化包括:小写 host、删跟踪参数(utm\_\*/fbclid/gclid)、去锚点、排序参数、去尾斜杠。

### 预算护栏(两级)

| 级别 | 配置                                  | 默认    | 触发效果                |
| ---- | ------------------------------------- | ------- | ----------------------- |
| 全局 | `llm.config.yaml: max_tokens_per_run` | 500,000 | 立即停止所有源的处理    |
| 单源 | `sources.yaml: max_items` (每源可选)  | 不限    | 停止当前源,剩余留到次日 |

---

## 使用指南

### 前置要求

- **Node.js 22+**(见 `.nvmrc`)
- **pnpm 10+**

### 安装

```bash
git clone <repo-url> daily-news
cd daily-news
pnpm install
```

### 配置资讯源

编辑 `configs/sources.yaml`:

```yaml
target_lang: zh

sources:
  - name: 阮一峰的网络日志
    url: https://www.ruanyifeng.com/blog/atom.xml
    type: rss
    lang: zh

  - name: Hacker News
    url: https://news.ycombinator.com/rss
    type: rss
    lang: en
    max_items: 20 # 可选:每轮最多处理 20 篇新文章
```

或用 CLI 自动发现并添加:

```bash
pnpm add-source https://example.com/blog
# 自动探测 feed → 试抓预览 → 交互确认 → 写入 sources.yaml
```

### 本地运行

**冒烟模式(无 LLM key)** —— 跳过翻译和打标,文章仍会写入,用于验证抓取链路:

```bash
pnpm crawl
```

**完整模式** —— 设置环境变量后运行:

```bash
export LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
export LLM_API_KEY=your-key-here
pnpm crawl
```

### 本地预览站点

```bash
pnpm dev       # 开发服务器 (热重载)
# 或
pnpm build     # 完整构建 + Pagefind 搜索索引
pnpm preview   # 预览构建产物
```

### 部署到 Cloudflare Pages

1. **推送仓库到 GitHub**

2. **配置 GitHub Secrets**(Settings → Secrets and variables → Actions):

   | Secret                | 必填 | 说明                                |
   | --------------------- | ---- | ----------------------------------- |
   | `LLM_BASE_URL`        | 是   | LLM API endpoint                    |
   | `LLM_API_KEY`         | 是   | LLM API key                         |
   | `LLM_TRANSLATE_MODEL` | 否   | 翻译模型,不设则默认 `glm-4.5`       |
   | `LLM_TAG_MODEL`       | 否   | 打标模型,不设则默认 `glm-4.5-flash` |

   切换 LLM 提供商时(如 DeepSeek),只需设置模型 secret 覆盖默认值,无需改代码。

3. **连接 Cloudflare Pages**:
   - Build command: `pnpm install --frozen-lockfile && pnpm build`
   - Build output directory: `dist`
   - Cloudflare 会在每次 push 后自动构建部署

4. **触发抓取**:
   - 自动:每天 UTC 01:00(cron `0 1 * * *`)
   - 手动:Actions → daily-crawl → Run workflow

### 查看 LLM 配置

`configs/llm.config.yaml` 使用 `${VAR:-default}` 语法,模型名可被环境变量覆盖:

```yaml
llm:
  base_url: ${LLM_BASE_URL}
  api_key: ${LLM_API_KEY}
  translate:
    model: ${LLM_TRANSLATE_MODEL:-glm-4.5}
  tag:
    model: ${LLM_TAG_MODEL:-glm-4.5-flash}
  guardrails:
    max_tokens_per_run: 500000
```

---

## 开发

### 质量检查

```bash
pnpm typecheck     # TypeScript 类型检查
pnpm test          # 单元测试 (crawler + cli)
pnpm format        # Prettier 格式化
pnpm format:check  # 格式检查 (不修改)
```

CI(`ci.yml`)会在每次 push/PR 时自动运行 typecheck + test + build 质量门。

### 添加标签别名

编辑 `configs/tags.json`,key 是规范标签,value 是别名数组:

```json
{
  "AI": ["ai", "人工智能", "机器学习"],
  "Rust": ["rust-lang", "rust语言"]
}
```

LLM 打标时输出的别名会自动归一化到规范标签。

### 目录说明

| 目录       | git 追踪 | 谁写入                             | 说明                                |
| ---------- | -------- | ---------------------------------- | ----------------------------------- |
| `news/`    | 是       | crawler                            | 抓取的文章 (Markdown + frontmatter) |
| `configs/` | 是       | crawler (source-state.yaml) / 手动 | 运行配置                            |
| `runs/`    | 是       | crawler                            | 每次运行的摘要 JSON                 |
| `dist/`    | 否       | `pnpm build`                       | 构建产物                            |

### 技术栈

- **运行时**: Node.js 22, TypeScript (strict), ESM
- **包管理**: pnpm 10 workspaces
- **抓取**: rss-parser, @mozilla/readability, turndown
- **LLM**: openai (兼容任意 OpenAI 接口的 provider)
- **站点**: Astro 7, Pagefind
- **校验**: Zod 4
