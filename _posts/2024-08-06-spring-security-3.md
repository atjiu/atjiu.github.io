---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 3.配置文件配置用户名密码
date: 2024-08-06 09:39:56
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}




除了使用springsecurity框架给我们提供的默认的用户名和密码外，我们还可以自己在配置文件`application.properties`中配置用户名和密码

```properties
spring.security.user.name=user
spring.security.user.password=123123
```

重启服务，重新登录就是自己设定的用户名和密码了

> 这种方式对于想自己写个博客来用的用户已经够用了，不过如果自己搭博客系统也不会用springsecurity这么重的框架了 : )



