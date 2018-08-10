---
layout: post
title: MongoDB增删改查简单操作
date: 2017-04-28 14:45:00
categories: mongodb学习笔记
tags: mongodb
author: 朋也
---

* content
{:toc}

## 查询

```sh
> use demo
> db.topics.find() // 返回topics文档里的所有记录
> db.topics.find({'tab': 'Python'}) // 返回topics文档里tab字段为Python的记录
> db.topics.find({'view': {$lt: 10}}) // 返回topics文档里view小与10的记录，同类的还有 $gt $lte $gte $ne 
> db.topics.find({'tab:' 'Python'}, {'title': 1}) // 返回topics文档里tab为Python的_id, title字段的记录，1返回，0不返回
> db.topics.find({'tab': 'Python'}, {'title': 1, '_id': 0}) // 返回topics文档里tab为Python的title字段的记录
> db.topics.find().pretty() // 返回记录格式化
> db.topics.find().pretty().skip(5).limit(10) // 返回topics文档里第5-15条记录
> db.topics.find().sort({'createAt': -1}) // 按createAt降序排列 1 正序
```




## 查询时间

```sh
> use demo
> db.topics.find().limit(20).explain("executionStats") // 输出结果里有个 executionTimeMillis 字段就是执行时间，单位毫秒
```

## 插入

```sh
> use demo
> db.topics.insert({'title': 'hello world', tab: 'Python'})
```

## 更新

```sh
> use demo
> db.topics.update({'title':'hello world'},{$set:{'title':'MongoDB'}}) // 只修改一条记录
> db.topics.update({'title':'hello world'},{$set:{'title':'MongoDB'}},{multi: true}) // 修改全部匹配的记录
```

## 删除

```sh
> use demo
> db.topics.remove({'title': 'Hello World'}) // 删除所有匹配的记录
> db.topics.remove({'title': 'Hello World'}, {justOne: 1}) // 删除匹配的第一条记录
```

## 参考

- <http://www.runoob.com/mongodb/mongodb-query.html>
- <http://www.runoob.com/mongodb/mongodb-operators.html>
- <http://www.runoob.com/mongodb/mongodb-limit-skip.html>
- <http://www.runoob.com/mongodb/mongodb-sort.html>
- <http://www.runoob.com/mongodb/mongodb-update.html>
- <http://www.runoob.com/mongodb/mongodb-insert.html>
- <http://www.runoob.com/mongodb/mongodb-remove.html>

