---
title: Some more things about Django I've been enjoying
url: 'https://jvns.ca/blog/2026/07/21/more-nice-django-things/'
url_hash: affe5eba324aa2458c69f59980f3015c91b2e09c
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-07-21T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
你好！我现在正经历一段有趣的旅程，尝试用2010年代的方式学习建网站——用SQL数据库，在后端渲染HTML。

这段经历挺有意思的，因为对我来说这种方式并不"容易"：我在2000年代或2010年代从未学过这种建站方法，有很多东西需要从头学起。

下面分享一些Django的特性，它们让构建这类网站变得比之前尝试用Go标准库或Flask时更可行。同时也会聊聊我在使用Django时遇到的一些问题。

### 为什么要学2010年代的建站方式？

之前我擅长的建站工具包括：

-   静态网站生成器（比如这个博客）
-   用JavaScript做些有趣功能的静态网站（比如这个[SQL游乐场](https://sql-playground.wizardzines.com/)）
-   简单的Vue.js单页应用，后端用Lambda或Go（比如[mess with dns](https://messwithdns.net/)）

对于这些超简单的应用，我很喜欢这种前端为主的方案。但当我开始考虑做一个包含很多不同页面（而不是只有一个页面）的项目时，那些需要大量前端代码的方案就没那么吸引我了。所以我决定尝试后端开发。

用尽可能少的JavaScript写一个后端为主的网站，和用尽可能少的后端代码写一个单页JS网站，虽然看起来截然相反，但对我来说感觉是相通的——都是想把尽可能多的逻辑集中在一个地方。

现在来聊聊Django！

### 我喜欢查询构建器

我发现在Django中，我可以定义一个"查询集"类，里面包含各种方法，每个方法对应不同的`WHERE`语句，方便构建查询：

在视图代码中，定义好所有方法后，我是这样使用的：

```
Events.objects.approved()
  .for_tab(tab)
  .with_festivals(tab_params.festival_slugs)
  .is_free(tab_params.free)
  .is_outdoors(tab_params.outdoors)
```

而方法的定义是这样的：

```
class EventQuerySet(SearchableQuerySetMixin, models.QuerySet):
    def approved(self):
        return self.filter(approved_at__isnull=False)

def future(self):
        today = timezone.localdate()
        return self.filter(end__gt=self._midnight(today))

def with_tags(self, tags):
        if tags:
            return self.filter(tags__name__in=tags).distinct()
        return self
```

定义过滤器的语法不是我特别喜欢的，但我大部分时间只是在使用这些方法，感觉可读性很强，用起来很舒服，这让我以后想多了解其他查询构建器库。以前我觉得"我会SQL，谁还需要查询构建器？"，但这种结构确实让代码读起来很舒服。

我找到了一个[用Python自己写小型查询构建器](https://github.com/lemon24/reader/blob/15121f667a6f2e388f0072a3fcd715f533883899/src/reader/_sql_utils.py)的例子，打算之后看看，思考一下是否会更喜欢这种更精简的版本。

### 模板过滤器太棒了

Django 模板中有一堆提升开发体验的[过滤器](https://docs.djangoproject.com/en/6.0/ref/templates/builtins/)，在生成 HTML 时超级实用。目前我用过的有：

-   将纯文本 URL 转为链接，或将换行符转为 `<br>`（`{{ event.description|urlize|linebreaksbr }}`）
-   格式化日期（`{{ row.date|date:"M j" }}`）
-   `json_script`：接收 Python 字典，自动转为 JSON，并以安全方式作为 `<script>` 标签插入 HTML

这些功能单个看都很微小，但我觉得能直接调用它们，整体体验提升巨大。

### `querystring` 很酷

我最喜欢的模板过滤器是 `querystring`：在这个网站中，我们有时会用 `?date=2026-06-01` 这样的过滤器来决定显示内容。`querystring` 可以生成指向相同查询字符串但修改某一参数的链接，比如链接到上一个日期：

```
<a href="{% querystring date=nav.prev_date%}">
```

或者移除 `outdoors` 参数：

```
<a href="{% querystring outdoors=None %}">
```

### 自动数据库迁移依然很棒

我仍然非常喜欢 Django 的自动数据库系统。只需编辑模型添加新字段等操作，Django 就能自动生成迁移，这太神奇了。

到目前为止我们已经完成了 19 次数据库迁移，而且可能还会有更多！随着我对问题的理解不断变化，能轻松修改数据库，这对我来说意义重大。

### 我不想用继承来组织代码

Django 的文档有时会建议使用基于类的视图和继承来组织视图代码。例如，我有四个共享大量代码的视图，可以通过定义某种父类，然后让其他视图继承它来管理代码。

我尝试过，但不喜欢用继承在视图间共享代码的体验。我转而使用函数，就像[这篇文章](https://spookylukey.github.io/django-views-the-right-way/)所倡导的那样，这样更直接。我在 Python 中使用继承的体验一直不好，以后也不会再尝试了。

不过，我不介意使用继承来利用 Django 自身提供的接口：例如，如果要定义查询集，我需要写类似 `class EventQuerySet(SearchableQuerySetMixin, models.QuerySet)` 的代码。我不会想太多，它似乎也能正常工作。

（作为元评论：我一直在练习用“某件事对我来说感觉不好，我更喜欢另一件事”的方式来表达编程观点。我链接的那篇文章说基于函数的视图是“正确的方式”。我并不太在意它是否“正确”，但知道其他人对继承有类似感受，这让我感到被验证了。）

### 我不知道如何看待 Django 的性能

某个时刻，LLM爬虫发现了我们的网站，开始以每秒约10个请求的频率访问。我暂时封禁了它们，但这让我思考网站的实际承载能力。我习惯编写Go后端，性能情况通常很直观（基本够快），而Django站点则截然不同。

通过轻量负载测试（`ab -n 1000 -c 1`）发现，目前我们大约每秒能处理2-3个请求（在约10美元/月的虚拟机上运行）。

我很容易陷入这样的困境：花大量时间做性能分析找出瓶颈并尝试优化（有[py-spy](https://github.com/benfred/py-spy)这样的工具，它很棒且极易使用，性能分析也很有趣！）。但我确实不清楚Django站点应有的性能预期，以及如何从更高层面进行思考。

我尚未厘清的问题包括：

-   如果网站偶尔遭遇流量高峰，是否需要具备扩展能力？
-   是否应该设计更多可缓存的内容？（但真的必须这样做吗？缓存机制往往很难正确实现！）
-   [Django性能文档](https://docs.djangoproject.com/en/6.0/topics/performance/)提到Jinja模板引擎更快，是否需要考虑切换模板系统？
-   该文档还指出“`{% block %}`比`{% include %}`更快”，我不确定差异是否显著，以及原因何在。

### 模板缓存可能至关重要

我认为在Django中我学到的一点是：由于它是一个“框架”，很容易意外配置错误。例如，当我思考网站为何缓慢时，阅读了[Django性能文档](https://docs.djangoproject.com/en/6.0/topics/performance/)，注意到这样一段话：

> 启用缓存模板加载器通常能大幅提升性能，因为它避免了每次渲染模板时都重新编译。

之前做CPU性能分析时，我发现大量时间花在模板渲染上！也许这能帮到我。

点击链接后，我发现缓存模板加载器本应默认启用，但我在尝试其他操作时意外关闭了它。这种“意外关闭默认缓存模板加载器”的情况，正说明我仍觉得Django设置文件令人困惑且难以操作。看来我以后修改设置时需要格外小心。

启用模板缓存后，网站现在似乎能轻松处理每秒约12个请求，且不会耗尽CPU。虽然我没有仔细对比前后基准测试数据，但效果显然非常显著。

关于 Django 性能，有一点让我挺意外的——我总听到这样的建议：“如果遇到性能问题，先检查数据库查询！或许加个索引！”但我实际遇到的各种性能问题（比如这个模板缓存问题），都不是因为查询慢导致的。所以对我来说，目前更有效的做法是先跑个 CPU 性能分析。而且因为我用的是 SQLite，任何慢查询问题最终也会在 CPU 分析中暴露出来。

不过我不想深入讨论网站性能。就像我说的，我很容易对性能分析产生兴趣，但实际上我对这方面已经相当了解了，它并不是我最需要学习的内容。

### 先写到这里吧！

以后可能会再聊聊我在 Django 上遇到的趣事（或难题！）。最近在尝试写些更短的博客文章。
