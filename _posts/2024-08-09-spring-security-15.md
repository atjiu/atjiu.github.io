---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 15.thymeleaf-security标签用法
date: 2024-08-09 11:16:04
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







thymeleaf有个扩展项目`thymeleaf-extras-springsecurity`，提供了 `sec:authorize` 标签来鉴权

更多详细内容可参考

- [https://www.thymeleaf.org/doc/articles/springsecurity.html](https://www.thymeleaf.org/doc/articles/springsecurity.html)
- [https://github.com/thymeleaf/thymeleaf-extras-springsecurity](https://github.com/thymeleaf/thymeleaf-extras-springsecurity)

## 引入依赖

在build.gradle里添加上依赖

```gradle
implementation 'org.thymeleaf.extras:thymeleaf-extras-springsecurity6'
```

## 添加namespace

要想在开发过程中IDEA有提示，还需要添加sec的namespace，在扩展项目的readme最下面提到了，所有版本的命名空间都统一了

![](/assets/1745311731714.png)

所以只需要引入这一个地址就行了

## 修改header.html

页面最上面的导航是跳转到不同页面的链接，其中zhangsan用户是没有 `user:list`权限的，正好用这个来测试

给`首页`和`用户`现在超链接都添加上权限验证

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org" xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<body>
<th:block th:fragment="head">
    <link rel="stylesheet" th:href="@{/css/app.css}">
</th:block>
<th:block th:fragment="navbar(user)">
    <header>
        <a th:href="@{/}" sec:authorize="hasAuthority('index')">首页</a> &nbsp;
        <a th:href="@{/user/list}" sec:authorize="hasAuthority('user:list')">用户</a>
    </header>
    <p>当前登录的用户名：<span th:text="${user.username}" style="color:red;"></span></p>
</th:block>
</body>
</html>
```

## 测试

使用admin登录，页面如下

![](/assets/1745311742315.png)

使用zhangsan登录，页面如下

![](/assets/1745311749268.png)


