---
layout: post
title: spring-boot项目使用h2内在数据库,数据库文件存到本地,操作h2数据库
date: 2019-05-13 21:47:00
categories: spring-boot学习笔记
tags: spring-boot
author: 朋也
---

* content
{:toc}

h2是一个内在数据库, 一般用来做测试的, 不过数据文件也可以存在本地, 这样就可以用来做一些小玩意了





**创建项目**

创建一个springboot项目即可, 这里不多说了, 依赖如下

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

原接文链: [https://atjiu.github.io/2019/05/16/spring-boot-h2/](https://atjiu.github.io/2019/05/16/spring-boot-h2/)

---

**使用**

对数据库操作可以使用jpa, 用法跟hibernate一样

---

**数据本地化**

在`application.yml`里加上下面配置即可

```yml
spring:
  datasource:
    url: jdbc:h2:file:./db/h2-demo;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1
```

其中 `./db` 表示存在当前项目根目录下, 也可以写绝对路径,

---

**操作数据库**

数据库文件存下了,要想查看总不能写程序来看, 开启一个配置就可以在网页上操作数据库了

加入下面配置

```yml
spring:
  h2:
    console:
      enabled: true
```

然后启动项目, 浏览器访问 `http://localhost:8080/h2-console` 就可以打开操作数据库的页面了, 如下图

![](/assets/20190516215418.png)

图中红框部分的路径要填上绝对路径, 其它都不用改的, 点击 `connect` 按钮, 就可以连接数据库文件进行操作了
