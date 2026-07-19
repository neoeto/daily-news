---
title: Learning a few things about running SQLite
url: 'https://jvns.ca/blog/2026/07/17/learning-about-running-sqlite/'
url_hash: de7f56468be81a999ff3b6a7648b671cb56dc9d5
source: Julia Evans
source_url: 'https://jvns.ca/atom.xml'
date: 2026-07-17T00:00:00.000Z
lang: zh
translated: true
tags:
  - AI
  - 后端
  - 数据库
original_lang: en
truncated: false
---
你好！我最近在做一个 Django 网站，决定用 SQLite 作为数据库。刚开始用 SQLite 做网站数据库时，我读了一[堆](https://alldjango.com/articles/definitive-guide-to-using-django-sqlite-in-production)博客文章，都说在小网站上用 SQLite 完全没问题，我觉得确实*完全*没问题，但我没有充分意识到的是：SQLite 终究还是个数据库，数据库很复杂，而我对数据库运维知之甚少。

所以这里分享一些我学到的关于运行 SQLite 的小经验。这是我第四次用 SQLite 做网站，但这次感觉更难，因为借助 Django ORM 的强大功能，我让数据库做了比以前没用 Django 时更多的工作。

一开始我按照所有博客文章的建议开启了 WAL 模式，然后就听天由命了。

### `ANALYZE` 显然很重要

今天我在一个有 4000 行的表上运行查询（使用 [SQLite 的 FTS5](https://www.sqlite.org/fts5.html) 做全文搜索），花了 5 秒钟。这显然不对劲：计算机可是很快的！

结果发现我需要运行 [`ANALYZE`](https://sqlite.org/lang_analyze.html)！问题查询立刻从 5 秒降到了大约 0.05 秒（或者某个小到我不再关心的数字）。我仍然不清楚查询计划具体哪里出了问题，但最好的猜测是某种[意外二次复杂度](https://accidentallyquadratic.tumblr.com/)的情况。

`ANALYZE` 会生成“统计信息”（我猜是关于每个表的行数？可能还有其他东西？），这样查询规划器就能做出更好的选择。

也许有一天我会学会看查询计划。

### 清理数据库很棘手

偶尔我会遇到这种情况：不小心在数据库里放了一堆不想要的行（比如来自 [django-tasks-db](https://github.com/RealOrangeOne/django-tasks-db) 的已完成任务），想要清理掉。

这种情况下我遇到过几次：

1.  我运行某种命令来清理这些行
2.  由于行数很多，命令执行时间超过 5 秒（不过说实话我仍然怀疑为什么这些 DELETE 语句这么慢，可能是在事务中运行了大量 Python 代码，我不确定）
3.  在此期间，另一个工作进程试图写入数据库，5 秒后超时（我设置了 5 秒的超时时间）
4.  工作进程因无法写入数据库而崩溃，虚拟机随之关闭

到目前为止，我的做法是分批进行这些清理操作，这样就不需要执行运行时间超过5秒的数据库查询。不过，这段经历让我更加理解为什么有人会想用像Postgres这样支持同时多个写入操作的“真正”数据库。

也许将来需要做这类操作时，我会直接让网站进入计划维护状态，但我还没想好具体的工作流程。

### 关于ORM查询性能暂无笔记

到目前为止，我一直用Django的ORM来执行任何查询，完全没关注查询性能，除了`ANALYZE`那件事外，基本还算顺利。数据库很小（大概10000行？），而且我预计它会一直保持很小，所以希望这个方案能继续奏效。

### 备份SQLite

我用过几种方式备份SQLite。虽然没实际测试过从备份恢复，但我通常会通过死机开关来监控备份状态。

**方式1：restic**

```
sqlite3 /data/calendar.db "VACUUM INTO '/tmp/calendar.sqlite'"
gzip /tmp/calendar.sqlite

# 上传备份到S3
# 有时备份会因OOM被杀死，导致文件被锁定，所以先解锁
restic -r s3://s3.amazonaws.com/some_bucket/ unlock
# 执行备份并清理旧备份
restic -r s3://s3.amazonaws.com/some_bucket/ backup /tmp/calendar.sqlite.gz
restic -r s3://s3.amazonaws.com/some_bucket/ snapshots
restic -r s3://s3.amazonaws.com/some_bucket/ forget -l 1 -H 6 -d 2 -w 2 -m 2 -y 2
restic -r s3://s3.amazonaws.com/some_bucket/ prune
```

**方式2：[litestream](https://litestream.io/)**

我最近开始尝试Litestream，因为觉得增量备份可能更高效：我的restic备份有时会因OOM被杀死，我有点烦了。基本上只需写个配置文件，然后运行：

```
litestream replicate -config litestream.yml
```

我在配置文件中设置了`retention: 400h`，试图保留一些数据库历史记录，但不确定是否有效。

我一直备份到AWS，这总是很麻烦，因为要在AWS控制台里生成凭证很繁琐。也许有一天我会换到其他兼容S3的替代方案。

### 可以使用多个数据库

我当前的项目只有一个数据库，但我在[Mess with DNS](https://messwithdns.net/)中使用的一个技巧是将表拆分到三个独立的数据库文件中，因为我并不需要所有表都在同一个数据库里。我觉得这很有帮助。

Mess with DNS已经在SQLite上运行了4年（从2022年开始），效果很好，我认为从Postgres迁移对这个项目来说是个很棒的选择。

### 就这些！

看到自己花了多久才学会所用技术的一些基本功能，总是挺有趣的。我记得第一次在Web项目中使用SQLite是在2022年，而直到今天我才知道`ANALYZE`的存在！想象一下，一两年后我可能又会学到某个非常基础的功能。

### 一些参考资料

除了官方文档外，我还参考过以下博客文章：

-   [在生产环境中使用Django与SQLite的权威指南](https://alldjango.com/articles/definitive-guide-to-using-django-sqlite-in-production)
-   [关于SQLite性能调优的要点](https://gist.github.com/phiresky/978d8e204f77feaa0ab5cca08d2d5b27)
