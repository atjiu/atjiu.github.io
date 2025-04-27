---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 6.登出
date: 2024-08-06 14:59:46
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}






有了登录，还没有登出功能，这篇来加一下

代码配置，在过滤器链中配置上 `logout`的url和登出成功后要跳转的页面地址

```java
open fun filterChain(
    http: HttpSecurity,
): SecurityFilterChain {
    http {
        authorizeRequests {
            // 配置 /home 路径需要 ADMIN 权限
            authorize("/home", hasRole("ROLE_ADMIN"))
            // 配置所有请求地址都需要登录认证才能访问
            authorize("/**", authenticated)
        }
        formLogin {
            // 登录页面（get请求）
            loginPage = "/login"
            // 登录提交地址（post请求）
            loginProcessingUrl = "/loginpost"
            // 默认登录成功跳转的地址
            defaultSuccessUrl("/", false)
            // 以上设置的两个地址(/login, /loginpost)全都直接放行，不需要权限
            permitAll = true
        }
        logout {
            // 登出地址
            logoutUrl = "/logout"
            // 登出成功跳转的地址
            logoutSuccessUrl = "/login"
            // 登出地址也被包含在 /** 中，这里要放行一下
            permitAll
        }
    }
    return http.build()
}
```

在`index.html`中添加一个登出按钮

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Hello Security</title>
    <style>
         footer {
             position: fixed;
             bottom: 20px;
             left: 20px;
         }
    </style>
</head>
<body>
    <p th:text="${study}"></p>
    <p>当前登录的用户名：<span th:text="${user.username}"></span></p>
    <p>当前登录的用户权限：</p>
    <ul>
        <li th:each="auth : ${user.authorities}" th:text="${auth}"></li>
    </ul>

    <footer><a th:href="@{/logout}">登出</a></footer>
</body>
</html>
```

## 测试

启动服务登录进入首页

![](/assets/images/1745309925745.png)

点击左下角的`登出`链接

![](/assets/images/1745309936950.png)

啊哦~~ 404了，报错的原因是CSRF防护，开启CSRF防护的情况下，登出功能只能是post请求，所以登出按钮可以被表单包着

index.html

```html
<footer>
    <form th:action="@{/logout}" method="post">
        <button type="submit">登出</button>
    </form>
</footer>
```

![](/assets/images/1745309948670.png)

可以看到csrf又被自动添加上了，这时再点击登出按钮就能正常登出了

**或者** 可以将csrf给禁掉

```java
http {
   authorizeRequests {
        // 配置 /home 路径需要 ADMIN 权限
        authorize("/home", hasRole("ROLE_ADMIN"))
        // 配置所有请求地址都需要登录认证才能访问
        authorize("/**", authenticated)
    }
    formLogin {
        // 登录页面（get请求）
        loginPage = "/login"
        // 登录提交地址（post请求）
        loginProcessingUrl = "/loginpost"
        // 默认登录成功跳转的地址
        defaultSuccessUrl("/", false)
        // 以上设置的两个地址(/login, /loginpost)全都直接放行，不需要权限
        permitAll = true
    }
    logout {
        // 登出地址
        logoutUrl = "/logout"
        // 登出成功跳转的地址
        logoutSuccessUrl = "/login"
        // 登出地址也被包含在 /** 中，这里要放行一下
        permitAll
    }
    csrf { disable() }
}
```

禁掉csrf后，get请求的 `/logout` 也是能正常登出了

## 总结

- 登出功能跟csrf防护有关，如果开启了csrf，那么配置的登出地址就需要 post 请求
- 禁掉csrf防护后，配置的登出地址就可以使用 get 请求了



