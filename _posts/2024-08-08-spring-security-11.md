---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 11.异常处理（下）
date: 2024-08-08 11:43:47
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







除了利用框架内提供的默认异常处理，也可以自定义，实现 `AuthenticationFailureHandler` 接口即可

## 自定义认证失败处理

MyAuthenticationFailureHandler.kt
```kotlin
package com.example.springsecuritydemo.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import java.nio.charset.StandardCharsets

class MyAuthenticationFailureHandler : AuthenticationFailureHandler {

    override fun onAuthenticationFailure(request: HttpServletRequest?, response: HttpServletResponse?, exception: AuthenticationException?) {
        response?.setHeader("Content-Type", "text/html")
        response?.characterEncoding = StandardCharsets.UTF_8.name()
        request?.session?.setAttribute("loginpost_errors", exception?.message)
        response?.sendRedirect("/login")
    }
}
```

配置在 `formLogin` 里

```kotlin
formLogin {
// 登录页面（get请求）
    loginPage = "/login"
    // failureUrl没必要配置，框架默认将 loginPage+"?error"当成failureUrl
    // failureUrl = "/login"
    // 登录提交地址（post请求）
    loginProcessingUrl = "/loginpost"
    // 自定义异常处理
    authenticationFailureHandler = MyAuthenticationFailureHandler()
    // 默认登录成功跳转的地址
    defaultSuccessUrl("/", true)
    // 以上设置的两个地址(/login, /loginpost)全都直接放行，不需要权限
    permitAll = true
}
```

效果

![](/assets/1745311142062.png)

## 自定义权限验证异常处理
默认的没权限页面如下这样

![](/assets/1745311151002.png)

可以看到非常的不好看，在配置httpSecurity时，还有一个 `exceptionHandling` 属性，可以给它配置一个403的页面

```kotlin
exceptionHandling {
    accessDeniedPage = "/403.html"
}
csrf { disable() }
```

在 `src/resources//static` 里创建一个`403.html`页面

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>403</title>
</head>
<body>
<p>没有权限！！！</p>
</body>
</html>
```

别忘了将这个地址放行

```kotlin=
authorizeHttpRequests {
    authorize("/403.html", permitAll)
    //...
}
```

使用 zhangsan 帐号登录，访问 `/user/list`

![](/assets/1745311162284.png)

服务端渲染的页面这样就够了，但现在都喜欢前后端分离，所以自定义异常处理还是有必要的

创建 `MyAccessDeniedHandler ` 类实现 接口 `AccessDeniedHandler `

```kotlin
package com.example.springsecuritydemo.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import java.nio.charset.StandardCharsets

class MyAccessDeniedHandler : AccessDeniedHandler {
    override fun handle(request: HttpServletRequest?, response: HttpServletResponse?, accessDeniedException: AccessDeniedException?) {
        response?.setHeader("Content-Type", "text/html")
        response?.characterEncoding = StandardCharsets.UTF_8.name()
        response?.writer?.write(
            """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>403</title>
            </head>
            <body>
            <p>自定义没权限的异常页面！！！</p>
            </body>
            </html>
        """.trimIndent()
        )
        response?.writer?.flush()
    }
}
```

配置 httpSecurity里的`exceptionHandling`

```kotlin
exceptionHandling {
    // accessDeniedPage = "/403.html"
    accessDeniedHandler = MyAccessDeniedHandler()
}
```

测试效果如下

![](/assets/1745311173753.png)

## 总结

- 如果网站是服务端渲染的话，用框架自带的异常处理就够了，如果是前后端分离的话，可以自定义，会更灵活

