---
layout: post
title: Sharding-Sphere-JDBC垂直分表，分库例子
date: 2020-06-03 15:51:00
categories: sharding-sphere学习笔记
tags: javascript
author: 朋也
---

* content
{:toc}

目的：根据业务（用户信息，帖子信息）将数据存如不同数据库中，我这以用户信息存入test库中，帖子信息存入test1库中为例






垂直分表没必要用sharding-sphere，根据分库分表的原理来看，垂直分表就是将一个表细分，且在同一个库里，正常操作即可，下面介绍一下分库的垂直拆分

一个论坛业务，拆分成用户信息一个库，帖子相关的一个库的话，一般做法是配置两个数据源【可参见这篇博客：[springboot集成mybatis配置主从复制双库实现读写分离](https://tomoya92.github.io/2019/10/30/spring-boot-mybatis-read-write-separation/)】，通过给mybatis的mapper配置不同的数据源来实现业务，使用sharding-sphere逻辑也是大同小异，看配置

链文接原: [https://tomoya92.github.io/2020/06/03/sharding-sphere-vertical-split](https://tomoya92.github.io/2020/06/03/sharding-sphere-vertical-split/)

```prop
# 指定数据源名，如果有两个，用逗号隔开 如：ds0,ds1，相应的下面也要配置上ds1的连接地址
spring.shardingsphere.datasource.names=ds0,ds1
# 配置数据源
spring.shardingsphere.datasource.ds0.type=com.zaxxer.hikari.HikariDataSource
spring.shardingsphere.datasource.ds0.driver-class-name=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds0.jdbc-url=jdbc:mysql://localhost:3306/test?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds0.username=root
spring.shardingsphere.datasource.ds0.password=123123
# ds1
spring.shardingsphere.datasource.ds1.type=com.zaxxer.hikari.HikariDataSource
spring.shardingsphere.datasource.ds1.driver-class-name=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.ds1.jdbc-url=jdbc:mysql://localhost:3306/test1?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.ds1.username=root
spring.shardingsphere.datasource.ds1.password=123123

# 指定user表名规则
spring.shardingsphere.sharding.tables.user.actual-data-nodes=ds0.user_$->{0..1}
spring.shardingsphere.sharding.tables.user.table-strategy.inline.sharding-column=id
spring.shardingsphere.sharding.tables.user.table-strategy.inline.algorithm-expression=user_$->{id % 2}
# 指定user表主键名以及主键生成策略SNOWFLAKE(雪花算法)
spring.shardingsphere.sharding.tables.user.key-generator.column=id
spring.shardingsphere.sharding.tables.user.key-generator.type=SNOWFLAKE

# 指定topic表名规则
spring.shardingsphere.sharding.tables.topic.actual-data-nodes=ds1.topic_$->{0..1}
spring.shardingsphere.sharding.tables.topic.table-strategy.inline.sharding-column=id
spring.shardingsphere.sharding.tables.topic.table-strategy.inline.algorithm-expression=topic_$->{id % 2}
# 指定topic表主键名以及主键生成策略SNOWFLAKE(雪花算法)
spring.shardingsphere.sharding.tables.topic.key-generator.column=id
spring.shardingsphere.sharding.tables.topic.key-generator.type=SNOWFLAKE

# 打印sql
spring.shardingsphere.props.sql.show=true
```

说明：

两个数据源，ds0,ds1，给表user指定策略为存入ds0里，然后再根据id在奇偶判断存入哪个user表中，相应的给topic表指定数据源ds1，且分表逻辑跟user一样
