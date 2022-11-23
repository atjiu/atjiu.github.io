---
layout: post
title: Sharding-Sphere-JDBC读写分离例子
date: 2020-06-03 16:01:00
categories: sharding-sphere学习笔记
tags: sharding-sphere
author: 朋也
---

* content
{:toc}

目的：读写分离的例子【也可参见这篇博客：[springboot集成mybatis配置主从复制双库实现读写分离](https://atjiu.github.io/2019/10/30/spring-boot-mybatis-read-write-separation/)】当然Sharding-Sphere里也可以实现






> 注意：读写分离的环境还是要自己准备的，创造主从复制的环境可参见这篇博客[MySQL主从复制（主主复制）配置](https://atjiu.github.io/2019/10/24/mysql-master-slave/)

配置文件

```prop
# 指定数据源名
spring.shardingsphere.datasource.names=master0,slave0
# 配置主数据库数据源
spring.shardingsphere.datasource.master0.type=com.zaxxer.hikari.HikariDataSource
spring.shardingsphere.datasource.master0.driver-class-name=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.master0.jdbc-url=jdbc:mysql://192.168.16.87:3306/test?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.master0.username=root
spring.shardingsphere.datasource.master0.password=123123
# 配置从数据库数据源
spring.shardingsphere.datasource.slave0.type=com.zaxxer.hikari.HikariDataSource
spring.shardingsphere.datasource.slave0.driver-class-name=com.mysql.cj.jdbc.Driver
spring.shardingsphere.datasource.slave0.jdbc-url=jdbc:mysql://192.168.16.88:3306/test?useSSL=false&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.shardingsphere.datasource.slave0.username=root
spring.shardingsphere.datasource.slave0.password=123123
# 指定主从关系，ds0相当于给主从库的数据库起了个别名，用于下面给表制定策略时使用
#spring.shardingsphere.masterslave.load-balance-algorithm-type=round_robin # 当有多个从库时，可开启这个配置实现查询的负载均衡
spring.shardingsphere.sharding.master-slave-rules.ds0.master-data-source-name=master0
spring.shardingsphere.sharding.master-slave-rules.ds0.slave-data-source-names=slave0
# 指定表操作的数据源
spring.shardingsphere.sharding.tables.user.actual-data-nodes=ds0.user_$->{0..1}
spring.shardingsphere.sharding.tables.user.table-strategy.inline.sharding-column=id
spring.shardingsphere.sharding.tables.user.table-strategy.inline.algorithm-expression=user_$->{id % 2}
# 打印sql
spring.shardingsphere.props.sql.show=true
```

测试：

```java
@Test
void addUser() {
    for (int i = 0; i < 10; i++) {
        User user = new User();
        user.setUsername("user_" + i);
        user.setAge(random.nextInt(100));
        userMapper.insert(user);
    }
}

@Test
void selectUser() {
    User user = userMapper.selectById(1268079294531719169L);
    System.out.println(user);
}
```

从日志中可以看到，保存时使用的是master0数据源，查询时使用的是slave0数据源
