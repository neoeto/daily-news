---
title: Some notes on starting to use Django
url: 'https://jvns.ca/blog/2026/01/27/some-notes-on-starting-to-use-django/'
url_hash: 30776646154579b3b34f8870f41fdacd870c81eb
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-01-27T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 前端
  - 创业
original_lang: en
truncated: false
---
你好！我最喜欢的事情之一，就是开始学习一门从未尝试过、但已经存在了20多年的“古老无聊技术”。感觉特别棒，因为所有可能遇到的问题早就被解决了上千次，我可以轻松地把事情搞定。

我一直觉得学一个像 Rails、Django 或 Laravel 这样流行的 Web 框架会很酷，但一直没真正行动起来。不过几个月前，我开始学 Django 来做个网站，到目前为止还挺喜欢的。这里是一些简单的笔记！

### 比 Rails 少一些“魔法”

2020 年我花了一些时间[尝试学 Rails](https://jvns.ca/blog/2020/11/09/day-1--a-little-rails-/)，虽然它很酷，我也很想喜欢 Rails（Ruby 社区很棒！），但我发现如果我把 Rails 项目搁置几个月，再回来时就很难记起怎么做事了——比如，如果 `routes.rb` 里写着 `resources :topics`，光看这个你并不知道 `topics` 的路由在哪里配置，你得记住或者去查它的约定。

对我来说，能搁置项目几个月甚至几年，然后再回来继续做，这非常重要（我所有的项目都是这样运作的！）。而 Django 感觉更简单，因为它的东西更明确。

在我的小 Django 项目里，感觉主要就只有 5 个文件（除了设置文件）：`urls.py`、`models.py`、`views.py`、`admin.py` 和 `tests.py`。如果我想知道其他东西（比如 HTML 模板）在哪里，通常都能从这些文件里找到明确的引用。

### 内置的管理后台

这个项目里，我想要一个管理界面来手动编辑或查看数据库中的一些数据。Django 有一个非常棒的内置管理后台，而且我只需要写一点点代码就能自定义它。

比如，下面是我一个管理类的一部分，它设置了“列表”视图中要显示的字段、搜索字段，以及默认的排序方式。

```
@admin.register(Zine)
class ZineAdmin(admin.ModelAdmin):
    list_display = ["name", "publication_date", "free", "slug", "image_preview"]
    search_fields = ["name", "slug"]
    readonly_fields = ["image_preview"]
    ordering = ["-publication_date"]
```

### 有 ORM 真好玩

以前我的态度是：“ORM？谁需要啊？我自己写 SQL 查询就行了！” 不过到目前为止，我很喜欢 Django 的 ORM，而且我觉得 Django 用 `__` 来表示 `JOIN` 的方式很酷，就像这样：

```
Zine.objects
    .exclude(product__order__email_hash=email_hash)
```

这个查询涉及 5 张表：`zines`、`zine_products`、`products`、`order_products` 和 `orders`。要让这个工作，我只需要告诉 Django 有一个 `ManyToManyField` 关联了“orders”和“products”，另一个 `ManyToManyField` 关联了“zines”和“products”，这样它就知道如何连接 `zines`、`orders` 和 `products` 了。

我*确实*能写出那个查询，但写 `product__order__email_hash` 打字少得多，读起来也轻松得多，而且说实话，我得花点时间才能想明白怎么构造这个查询（它除了那些连接之外还需要做其他几件事）。

我完全不担心 ORM 生成的查询的性能问题，所以目前我对 ORM 还挺兴奋的，不过我相信迟早会找到让我头疼的地方。

### 自动迁移！

ORM 的另一个好处是迁移！

如果我在 `models.py` 中添加、删除或修改字段，Django 会自动生成一个迁移脚本，比如 `migrations/0006_delete_imageblob.py`。

我想如果需要的话，我也可以编辑这些脚本，但到目前为止，我都是直接运行生成的脚本，不做任何修改，效果非常好。感觉就像魔法一样。

我意识到，能够轻松进行迁移对我来说现在很重要，因为我在摸索数据模型该如何运作的过程中，经常在修改它。

### 我喜欢文档

我以前有个坏习惯，[从来不看文档](https://www.youtube.com/watch?v=krMw1QTP2no)，但到目前为止，我读过的 Django 文档部分都让我非常喜欢。这并非偶然：Jacob Kaplan-Moss 在 PyCon 2011 上有一个关于 Django 文档文化的[演讲](https://pyvideo.org/pycon-us-2011/pycon-2011--writing-great-documentation.html)。

例如，[模型入门](https://docs.djangoproject.com/en/6.0/topics/db/models/)列出了使用 ORM 时你可能想设置的最重要的常用字段。

### 使用 SQLite

在尝试运行 Postgres 却搞不清楚状况的糟糕经历之后，我决定改用 SQLite 来运行我所有的小网站。效果要好得多，而且我喜欢只需执行 `VACUUM INTO` 然后复制生成的单个文件就能备份。

我一直在按照[这些说明](https://alldjango.com/articles/definitive-guide-to-using-django-sqlite-in-production)在生产环境中使用 Django 搭配 SQLite。

我觉得应该没问题，因为我预计这个网站每天最多只有几百次写入，远少于 [Mess with DNS](https://messwithdns.net/)（它的写入量更大，而且运行良好，尽管写入操作分布在 3 个不同的 SQLite 数据库中）。

### 内置邮件功能（以及更多）

Django 似乎“内置功能非常丰富”，我很喜欢这一点——如果我需要 CSRF 保护、`Content-Security-Policy`，或者想发送邮件，这些功能都内置其中！

例如，我想在开发模式下将 Django 发送的邮件保存到文件中（这样就不会向真实用户发送真实邮件），这只需要一点点配置。

我只需在 `settings/dev.py` 中这样设置：

```
EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
EMAIL_FILE_PATH = BASE_DIR / "emails"
```

然后在 `settings/production.py` 中这样配置生产环境的邮件：

```
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.whatever.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "xxxx"
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_API_KEY')
```

这让我觉得，如果我还想要其他基本网站功能，Django 很可能已经内置了简单的实现方式。

### 但 settings 文件还是让人头大

我仍然对 `settings.py` 文件感到有些发怵：Django 的设置系统是通过在文件中设置一堆全局变量来工作的，这让我有点焦虑……如果我把某个变量名拼错了怎么办？我怎么知道？比如把 `WSGI_APPLICATION` 错打成 `WSGI_APPLICATOIN`？

我想我已经习惯了依赖 Python 语言服务器来提示拼写错误，所以现在无法依靠语言服务器支持时，感觉有点不适应。

### 今天就先到这里吧！

我以前从未真正成功地在项目中使用过 Web 框架（目前我的网站几乎都是单个 Go 二进制文件或静态站点），所以我很期待这次尝试！

我还有很多要学习的地方，比如 Django 的表单验证工具和认证系统我还没深入接触过。

感谢 Marco Rogers 说服我尝试 ORM。

（我们还在试验基于 Mastodon 的评论系统！[这里是 Mastodon 上的评论](https://comments.jvns.ca/post/115969229107460589)！告诉我你最喜欢的 Django 功能吧！）
