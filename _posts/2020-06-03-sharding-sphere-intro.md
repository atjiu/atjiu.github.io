---
layout: post
title: 分库分表原理介绍
date: 2020-06-03 15:42:00
categories: sharding-sphere学习笔记
tags: javascript
author: 朋也
---

* content
{:toc}


拆分规则：

垂直拆分，水平拆分






举例：

表user

字段：id, username, password, email, address, gender, bio

垂直拆分后

表user
字段：id, username, password

表user_info
字段: email, address, gender, bio

对应的还有垂直分库，就是按照业务对数据库进行划分，比如用户信息相关的单独一个库，用户发的帖子相关的数据单独一个库（这也是最常用的）

水平拆分后

表user1

字段：id, username, password, email, address, gender, bio

表user2

字段：id, username, password, email, address, gender, bio

两张表结构一模一样，这种分表是在存数据的时候动手脚的，比如常见的对主键id取模，分两张表就%2,分3张表就%3

```
id % 2 == 0  -> user1
id % 2 == 1 -> user2
id % 3 == 2 -> user3
```

文接链原: [https://tomoya92.github.io/2020/06/03/sharding-sphere-intro](https://tomoya92.github.io/2020/06/03/sharding-sphere-intro/)

优劣：

垂直：

- 好处：可以根据业务进行划分，逻辑清晰
- 坏处：当某个业务数据量过大，还是会出现性能瓶颈

水平：

- 好处：结构简单，不用过多的去花心思设计数据库，当数据量大时，复制一份出来，改一下存取规则即可
- 坏处：浪费空间（相对的）

总结：可以通过垂直分表（分库）与水平分表（分库）相结合来使用，会更灵活

---

分库分表的优劣：

- 好处：当MySQL数据量达到百万量级以上时，性能就开始有显著下降，分库/分表可以非常有效的解决单库/单表数据量过多带来的性能问题
- 坏处：进行单表/单业务查询时，很爽。当进行多表联查时。。。

---

补充：

- sharding-sphere-jdbc: 这个功能是通过外部的jar包引入到自己系统中通过配置文件来实现对表或者库的拆分功能实现
- sharding-sphere-proxy: 这货就是一个mysql的服务器，可以直接拿客户端工具连接上，在它的配置文件里可以配置各种各样的分表分库策略，启动服务后，默认端口是3307，程序直接连接这个服务即可，对数据库的操作，直接发送给它，它再根据事先配置好的策略来保存或者读取数据，所以sharding-sphere-jdbc能做的事sharding-sphere-proxy都能做，但sharding-sphere-proxy是一个外部的服务，不像sharding-sphere-jdbc那样只一个jar包引入项目即可