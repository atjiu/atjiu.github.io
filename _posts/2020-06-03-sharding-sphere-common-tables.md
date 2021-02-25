---
layout: post
title: Sharding-Sphere-JDBC公共表例子
date: 2020-06-03 15:57:00
categories: sharding-sphere学习笔记
tags: sharding-sphere
author: 朋也
---

* content
{:toc}

目的：如果每个库中都有look_up这种系统配置的基本表，又想做到一次CRUD操作能在所有库中都生效






如果项目中分库后，有些表又是所有库中共用的，可以使用下面配置将其在sharding-sphere里指定为公共表


```prop
# 配置公共表
spring.shardingsphere.sharding.broadcast-tables=look_up
spring.shardingsphere.sharding.tables.look_up.key-generator.column=id
spring.shardingsphere.sharding.tables.look_up.key-generator.type=SNOWFLAKE
```

说明：

通过 `broadcast-tables` 属性指定库中的的 `look_up` 为公共表

特点：
CRUD都是同时的，即添加一条数据，所有库中的look_up表都会添加，删除一条数据，所有库中的look_up表中都会将这条数据删除