---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 2.默认用户名密码
date: 2024-08-06 09:33:15
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}




gradle构建好之后什么都不用修改，直接启动`SpringsecurityDemoApplication`类中的`main`方法

在启动日志中可以看到一串密码
`Using generated security password: e4cec2e0-b868-44dc-81cb-3add5bc79112`

![](/assets/1745308949696.png)

打开浏览器输入网址：[http://localhost:8080](http://localhost:8080) 会打开一个springsecurity提供的默认登录页

![](/assets/1745308961790.png)

默认用户名是：user
默认密码就是控制台中日志里输出的那串密码

输入后点击登录，成功后会跳到一个新页面

![](/assets/1745308971346.png)

可以看到链接已经变成了 localhost:8080?continue 了。错误信息404是因为没有首页的控制器，在项目中添加一个

新建一个 `controller` 包，并在 `controller` 包中添加 `IndexController.kt`

```kotlin
package com.example.springsecuritydemo.controller

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class IndexController {

    @GetMapping("/")
    fun index(model: Model): Any? {
        model.addAttribute("study", "Spring Security")
        return "index"
    }
}
```
在`templates`文件夹里新建一个 `index.html` 文件

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
    <head>
        <title>Hello Security</title>
    </head>
<body>
    <p th:text="${study}"></p>
</body>
</html>
```
重启服务，重新登录，就会看到正常页面了

![](/assets/1745308988161.png)