---
layout: post
title: springboot项目默认配置输出的json中文乱码解决办法
date: 2024-08-15 11:34:29
categories: 杂项
tags: json 乱码
author: 朋也
---

* content
{:toc}







刚新建的springboot web项目，写了一个接口，从数据库中查询数据输出json时，浏览器上看到的是乱码

## 复现

```kotlin
@Controller
class HomeController(@Autowired private val jdbcClient: JdbcClient) {
    @GetMapping("/")
    @ResponseBody
    fun index(): Any? {
        return jdbcClient.sql("select * from user limit 20").query(User::class.java).list()
    }
}
```
数据库编码是`UTF-8`，且中文显示正常

![](/assets/1745312211236.png)

页面上效果

![](/assets/1745312218325.png)

## 原因

出现这问题的原因是springboot web默认输出不会在 `application/json` 后添加上 `charset=utf-8`了

![](/assets/1745312225955.png)

## 解决办法

两种解决办法

1. 在输出json处，手动设置 `response.characterEncoding = "utf-8"`

```kotlin
@GetMapping("/")
@ResponseBody
fun index(response: HttpServletResponse): Any? {
    response.characterEncoding = "utf-8"
    return jdbcClient.sql("select * from user limit 20").query(User::class.java).list()
}
```

2. 修改全局配置

打开 `application.properties` 添加上 `server.servlet.encoding.force-response = true` 配置

然后再访问就能正常显示了

![](/assets/1745312236397.png)

