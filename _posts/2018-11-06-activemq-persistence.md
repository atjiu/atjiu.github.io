---
layout: post
title: ActiveMQ学习-持久化队列数据，将队列中的消息存入MySQL (3)
date: 2018-11-06 19:39:00
categories: ActiveMQ学习笔记
tags: activemq
author: 朋也
---

* content
{:toc}

- [ActiveMQ学习-HelloWorld (1)](https://tomoya92.github.io/2018/11/05/activemq-helloworld/)
- [ActiveMQ学习-安全认证-连接AMQ用户密码配置 (2)](https://tomoya92.github.io/2018/11/06/activemq-security/)
- [ActiveMQ学习-持久化队列数据，将队列中的消息存入MySQL (3)](https://tomoya92.github.io/2018/11/06/activemq-persistence/)
- [ActiveMQ学习-Api介绍 (4)](https://tomoya92.github.io/2018/11/08/activemq-api/)
- [ActiveMQ学习-与spring整合，在spring-boot中使用 (5)](https://tomoya92.github.io/2018/11/09/activemq-spring-boot/)

> ActiveMQ默认使用的持久性机制是KahaDB，这货不熟悉，所以这篇文章来介绍一下将队列中的消息存放在MySQL数据库里

## 修改配置

找到 `conf` 文件夹，打开 `activemq.xml` 文件，找到下面配置

```xml
<persistenceAdapter>
    <kahaDB directory="${activemq.data}/kahadb"/>
</persistenceAdapter>
```





可以看到，ActiveMQ默认使用的是`kahadb`，把这一行注释掉，加上MySQL的配置(mysql-datasource的bean要配置在broker标签外面)，如下

```xml
<broker>
    <!-- ... -->
    <persistenceAdapter>
        <!-- <kahaDB directory="${activemq.data}/kahadb"/> -->
        <jdbcPersistenceAdapter dataSource="#mysql-datasource"/>
    </persistenceAdapter>
    <!-- ... -->
</broker>

<bean id="mysql-datasource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
    <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
    <property name="url" value="jdbc:mysql://localhost:3306/test?relaxAutoCommit=true"/>
    <property name="username" value="root"/>
    <property name="password" value=""/>
    <property name="maxActive" value="200"/>
    <property name="poolPreparedStatements" value="true"/>
</bean>
```

**注意上面数据库连接中的用户名密码要根据自己的mysql服务来进行修改，我这里用是test库**

## ActiveMQ添加MySQL驱动

将mysql-connector-java、commons-dbcp、commons-pool三个jar包拷贝到 ActiveMQ 文件夹下的 `lib` 文件夹内

jar包下载地址:

- [mysql-connector-java](https://mvnrepository.com/artifact/mysql/mysql-connector-java/5.1.47)
- [commons-dbcp](https://mvnrepository.com/artifact/commons-dbcp/commons-dbcp/1.4)
- [commons-pool](https://mvnrepository.com/artifact/commons-pool/commons-pool/1.6)

![](/assets/QQ20181106-200540@2x.png)

然后再次重启ActiveMQ，如果没有报错，一般就没问题了

打开 mysql 数据库客户端 找到 `test` 库，会发现多了三张表

![](/assets/QQ20181106-200859@2x.png)

## 测试

运行HelloWorld里的`Producer`创建100条消息

打开表 `ACTIVEMQ_MSGS` 可以看到已经有100条数据了

![](/assets/QQ20181106-201307@2x.png)

再次运行 `Consumer` 消费这100条消息，然后再打开表 `ACTIVEMQ_MSGS` 则没有数据了
