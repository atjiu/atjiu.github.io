---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 14.整理thymeleaf页面
date: 2024-08-09 10:46:01
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
  {:toc}

创建 `components/header.html` `components/footer.html` 两个片段文件和 `css/app.css` 样式文件

![](/assets/images/1745311633315.png)

header.html

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

footer.html

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<body>
<footer th:fragment="logout"><a th:href="@{/logout}">登出</a></footer>
</body>
</html>
```

创建app.css

```css
html, body {
    font-size: 1rem;
    font-family: minecraft, zpix, serif;
}

footer {
    position: fixed;
    bottom: 20px;
    left: 20px;
}
```

修改index.html

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Hello Security</title>
    <th:block th:replace="~{components/header::head}"></th:block>
</head>
<body>
<th:block th:replace="~{components/header::navbar(${user})}"></th:block>
<!--<p th:text="${study}"></p>-->
<p th:text="#{study}"></p>
<p>当前登录的用户权限：</p>
<ul>
    <li th:each="auth : ${user.authorities}" th:text="${auth}"></li>
</ul>

<th:block th:replace="~{components/footer::logout}"></th:block>
</body>
</html>
```

修改home.html

```html
<!DOCTYPE html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Home</title>
    <th:block th:replace="~{components/header::head}"></th:block>
</head>
<body>
<th:block th:replace="~{components/header::navbar(${user})}"></th:block>
<p>当前登录的用户权限：</p>
<ul>
    <li th:each="auth : ${user.authorities}" th:text="${auth}"></li>
</ul>
<th:block th:replace="~{components/footer::logout}"></th:block>
</body>
</html>
```

将 `css/**` 添加到认证放行

SecurityConfig.kt

```kotlin
authorizeHttpRequests {
   authorize("/403.html", permitAll)
   authorize("/css/**", permitAll)
   authorize("/error", permitAll)
   authorize("/captcha", permitAll)
	 //....
```

效果：首页

![](/assets/images/1745311647596.png)

用户页

![](/assets/images/1745311655529.png)

每个页面都有上面的导航和下面的登出了


