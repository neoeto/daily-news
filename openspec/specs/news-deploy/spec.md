# news-deploy Specification

## Purpose

TBD - created by archiving change add-daily-news-pipeline. Update Purpose after archive.

## Requirements

### Requirement: Cloudflare Pages 自动构建

系统 SHALL 将仓库连接到 Cloudflare Pages,使每次 push 到默认分支触发自动构建。构建命令 SHALL 执行 Astro 构建(`astro build`)与 Pagefind 索引生成(`pagefind --site dist`),构建输出目录为 `dist/`。构建产物由 Cloudflare 推送至全球 CDN。

#### Scenario: push 触发构建

- **WHEN** crawl job 提交并 push 新内容到默认分支
- **THEN** Cloudflare Pages 自动拉取仓库、执行构建命令、将 `dist/` 部署到 CDN

#### Scenario: 构建产物可访问

- **WHEN** 构建与部署完成
- **THEN** 站点在 Cloudflare Pages 绑定的域名上可公开访问,含首页、文章、标签、搜索、RSS

### Requirement: 无 secret 确定性构建

构建阶段 MUST NOT 依赖任何 secret/API key。所有 LLM 调用(翻译、打标)MUST 在 GitHub Actions 的 crawl job 中完成,先于构建。构建仅渲染已处理的 `news/*.md`,因此是确定性的、可复现的、失败可重跑的。Cloudflare Pages 项目配置中 MUST NOT 需要任何密钥。

#### Scenario: 构建零密钥

- **WHEN** Cloudflare Pages 执行构建
- **THEN** 构建不读取任何 secret,相同仓库内容产出相同 `dist/`,无外部网络依赖(除 npm 安装)

#### Scenario: 构建失败可重跑

- **WHEN** 某次构建因瞬时错误失败
- **THEN** 在 Cloudflare Pages 重试同一 commit 产出相同结果

### Requirement: 生产与渲染的边界划分

GitHub Actions 的职责 MUST 限定为内容生产(抓取、翻译、打标、提交 `news/*.md`),MUST NOT 执行站点构建或部署。Cloudflare Pages 的职责 MUST 限定为渲染与托管,MUST NOT 生产或修改内容。两侧唯一契约为 `news/` 目录与共享的 frontmatter schema。

#### Scenario: GitHub 不渲染

- **WHEN** crawl job 运行
- **THEN** 它只产出 `news/*.md` 与配置/摘要文件,不执行 `astro build` 或部署

#### Scenario: Cloudflare 不生产

- **WHEN** Cloudflare Pages 构建
- **THEN** 它只读取 `news/*.md` 与站点源码执行渲染,不修改 `news/` 内容、不调用 LLM
