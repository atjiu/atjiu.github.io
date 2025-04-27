---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 13.thymeleaf表达式用法及区别${} @{} ~{} #{} *{}
date: 2024-08-09 10:38:30
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







将页面分割一下，公共部分提取出来

thymeleaf语法

## `${}`

`${}`取值表达式，这个没什么好说的

## `@{}`

`@{}` 超链接解析式，只要是超链接都能让它包起来，如 `<a th:href="@{/login}">登录</a>`

还可以给方法传参数，参数就是链接里的参数，比如 `/login?username=admin&password=123123` 用 `@{}` 包起来就是 `@{/login(username='admin' ,password='123123')}`

## `~{}`

引入片段表达式，thymeleaf支持将一段共用的代码抽出来制作成一个片段，如 见面的 head 里引用的 css，js等，这些内容在每个页面都会用到，所以可以将其抽出来制作成一个片段(fragment)

components/header.html
```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<body>
<th:block th:fragment="head">
    <link rel="stylesheet" th:href="@{/app.css}">
</th:block>
</html>
```

使用时就需要用到 `~{}` 表达式来取

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Hello Security</title>
    <th:block th:replace="~{components/header::head}"></th:block>
</head>
<body>
</html>
```

当然也是可以传参数的，在片段名后加个()写上参数名就行了，调用的地方将值传进去即可

如下，`当前登录的用户名：`的值就是通过 `navbar` 片段的参数传进来的

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<body>
<th:block th:fragment="head">
    <link rel="stylesheet" th:href="@{/app.css}">
</th:block>
<th:block th:fragment="navbar(user)">
    <header>
        <a th:href="@{/}">首页</a> &nbsp;
        <a th:href="@{/user/list}">用户</a>
    </header>
    <p>当前登录的用户名：<span th:text="${user.username}" style="color:red;"></span></p>
</th:block>
</body>
</html>
```

调用

```html
<th:block th:replace="~{components/header::navbar(${user})}"></th:block>
```

## `#{}`

国际化表达式，结合 `th:text` 实现网站国际化的

比如springboot框架默认的国际化文件名是 `resources/messages.properties` 在自己项目里添加上两个文件

messages.properties

```properties
study = Spring Security
```

messages_zh_CN.properties

```properties
study = Spring安全框架
```

thymeleaf页面里就可以通过 `th:text="#{study}"`获取到对应语言的值

![](/assets/images/1745311541187.png)

![](/assets/images/1745311546898.png)

## `*{}`

这个表达式也是取值的，需要结合 `th:object` 使用，如后台传过来一个 `user`对象，而 `user` 对象里有 `username` ，就能写成如下形式

```html
<th:block th:object="${user}">
    <p>当前登录的用户名：<span th:text="*{username}" style="color:red;"></span></p>
</th:block>
```


