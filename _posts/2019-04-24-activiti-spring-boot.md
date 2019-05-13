---
layout: post
title: Activiti6.0教程(3) - springboot项目中使用activiti6.0配置及启动
date: 2019-04-24 14:00:00
categories: activiti学习笔记
tags: activiti
author: 朋也
---

* content
{:toc}

- [Activiti6.0教程(1) - 环境搭建, 画一个流程图](https://tomoya92.github.io/2019/04/24/activiti-env/)
- [Activiti6.0教程(2) - 初始化表, 部署流程, 启动流程, 创建的表介绍](https://tomoya92.github.io/2019/04/24/activiti-deploy-start-table/)
- [Activiti6.0教程(3) - springboot项目中使用activiti6.0配置及启动](https://tomoya92.github.io/2019/04/24/activiti-spring-boot/)
- [Activiti6.0教程(4) - 任务的查询以及完成任务(对任务批注,以及对批注的查询)](https://tomoya92.github.io/2019/04/24/activiti-query-complete-task/)
- [Activiti6.0教程(5) - 将任务的代理人配活(变量法, 监听法)](https://tomoya92.github.io/2019/04/24/activiti-assignee/)
- [Activiti6.0教程(6) - 排它网关/异或网关(ExclusiveGateway)用法](https://tomoya92.github.io/2019/04/25/activiti-exclusive-gateway/)
- [Activiti6.0教程(7) - 并行网关(ParallelGateway)用法](https://tomoya92.github.io/2019/04/25/activiti-parallel-gateway/)
- [Activiti6.0教程(8) - 用户, 组, 用户与组关系用法](https://tomoya92.github.io/2019/04/25/activiti-user-group-membership/)
- [Activiti6.0教程(9) - 候选任务, 在一个任务上设置多个候选人或候选组(根据实际业务指派给其中一个候选人执行)](https://tomoya92.github.io/2019/04/26/activiti-candidate-task/)

springboot集成非常的简单,基本上不需要做配置, 而且项目启动时自动会部署流程

## 创建项目

依赖如下





```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>2.1.4.RELEASE</version>
  <relativePath/> <!-- lookup parent from repository -->
</parent>

<dependencies>

  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
  </dependency>

  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-spring-boot-starter-basic</artifactId>
    <version>6.0.0</version>
  </dependency>

</dependencies>
```

**注意这里要用6.0, 如果不写这个版本号的话, springboot会自动下载7.0的activiti, 我在启动的时候报了一个错, jdk1.8没法用, 至少要将jdk升级到9才能用activiti7.0**

原链接文：[https://tomoya92.github.io/2019/04/24/activiti-spring-boot/](https://tomoya92.github.io/2019/04/24/activiti-spring-boot/)

## 修改配置文件

application.yml

```yml
spring:
  datasource:
    username: root
    password:
    url: jdbc:mysql:///activiti-demo?useSSL=false&characterEncoding=utf8&serverTimezone=GMT%2B8
  activiti:
    database-schema-update: true
```

另外还要把流程图文件放在 `src/main/resources/processes`下, springboot默认是到这个文件夹里去找流程图进行部署的

而且还要把图片的文件名修改一下, 假如流程图名是 `AskLeave.bpmn` 那么在springboot项目中对应的图片名就应该是 `AskLeave.AskLeave.png`

## 启动异常

这样启动它会报个错, 错误信息 `java.lang.ArrayStoreException: sun.reflect.annotation.TypeNotPresentExceptionProxy`

这个问题当初我找了好久才找到啥问题, 是因为springboot的自动配置把 `SecurityAutoConfiguration` 在项目启动的时候也配置了, 这货会导致报这个错

解决办法是在启动为上的 `@SpringBootApplication(exclude = SecurityAutoConfiguration.class)` 配置不去自动配置即可

再次启动就没有问题了

---

今天又碰到一个问题, 在启动项目的时候, activiti不自动创建表, 网上找文章发现在数据库连接url后面加上一个参数 `nullCatalogMeansCurrent=true` 然后就好了, 也不知道啥原因

`jdbc:mysql:///activiti-demo?useSSL=false&characterEncoding=utf8&serverTimezone=GMT%2B8&nullCatalogMeansCurrent=true`

---

正式集成项目的时候, 又出问题了, 报错信息: `Caused by: java.lang.IllegalStateException: No typehandler found for property inTime`

解决办法: 在pom.xml里加上下面依赖即可

```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-typehandlers-jsr310</artifactId>
    <version>1.0.1</version>
</dependency>
```

然后重新启动项目, 还是有异常, 只是异常信息变了, 现在长这个样 `Caused by: java.lang.NoSuchFieldError: INSTANCE`

原因是mybatis-plus里引入的mybatis跟activiti里引入的mybatis版本冲突了, 有两种解决办法

1. 排除掉activiti里的mybatis依赖, 为啥要排除activiti里的呢? 因为mybatis-plus里引入的mybatis依赖版本要高些

```xml
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-spring-boot-starter-basic</artifactId>
    <version>6.0.0</version>
    <exclusions>
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

2. 单独引入mybatis依赖, 这样maven就会将单独引入的且指定了版本号的这个版本为主

```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.0</version>
</dependency>
```

再启动就没有问题了

PS: 出现这个问题 `Caused by: java.lang.NoSuchFieldError: INSTANCE` 的原因是在项目里使用 `@Select` 来写查询sql了,如果你项目里没有使用mybatis里的这个注解, 就不会出现这个异常

## 总结

springboot项目启动之后, 流程也就自动部署了, 如果流程在开发中间有变动的话, 再次启动springboot项目的时候, 这个流程会重新部署, 即使定义的流程的名字没变, 它也会重新部署一份, 后面再使用流程定义的Key来启动流程就走的是新的流程了

---

写博客不易，转载请保留原文链接，谢谢!
