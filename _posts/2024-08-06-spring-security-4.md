---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 4.自定义登录页
date: 2024-08-06 11:47:59
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}




前面介绍了springsecurity中默认的登录用户名和密码，以及springsecurity为我们提供了一个默认的登录页。

实际开发中登录页会有一些自定义的内容，比如验证码。下面来自己定义一个登录页，让登录认证更灵活

## 创建一个登录页面

在`templates`文件夹中创建一个`login.html`
```html
<!doctype html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>登录</title>

</head>
<body>
<form th:action="@{/loginpost}" method="post">
    <fieldset>
        <legend>登录</legend>
        <label for="username">用户名</label><br>
        <input type="text" name="username" id="username" placeholder="用户名"> <br>
        <label for="password">密码</label><br>
        <input type="password" name="password" id="password" placeholder="密码"> <br>
        <button type="submit">登录</button>
    </fieldset>
</form>
</body>
</html>
```

添加对应的controller
```java
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

    @GetMapping("/login")
    fun login() : Any? {
        return "login"
    }

}
```

## 创建SecurityConfig
创建配置类`com.example.springsecuritydemo.SecurityConfig.kt`，注释都写的很清楚

```java
package com.example.springsecuritydemo.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain

import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.provisioning.InMemoryUserDetailsManager

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    open fun filterChain(
        http: HttpSecurity,
    ): SecurityFilterChain {
        http {
            authorizeRequests {
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
        }

        return http.build()
    }

    @Bean
    fun users(): UserDetailsService {
        // 构建一个用户
        // 密码可通过 PasswordEncoderFactories.createDelegatingPasswordEncoder().encode("123123") 来生成
        val user = User.builder()
            .username("user")
            .password("{bcrypt}\$2a\$10\$TzCWNNt8cJb6ruQ43nQ/jecs2ojY5G7jOrTEk6EBUXDhlwcPyLbtu")
            .build()
        // 将构建的用户放进内存中等待用户登录验证
        return InMemoryUserDetailsManager(user)
    }

    /**
     * 构建登录认证管理器，将userDetailService与passwordEncoder联系起来
     */
    @Bean
    open fun authenticationManager(): AuthenticationManager {
        val authenticationProvider = DaoAuthenticationProvider()
        authenticationProvider.setUserDetailsService(users())
        authenticationProvider.setPasswordEncoder(PasswordEncoderFactories.createDelegatingPasswordEncoder())

        return ProviderManager(authenticationProvider)
    }
}
```

`HttpSecurity`我用的是kotlin里的Dsl语法配置的，如果IDEA里无法识别，出现了如下红色错误时
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/1acc4ea860a746ffaf79d8b158f7111d.png)这原因是少导了一个包 `import org.springframework.security.config.annotation.web.invoke` 在这个类最上面导入一下就正常了

## CSRF防护
目前springsecurity会自动给form表单添加`_csrf` 所以不用自己再添加了

![](/assets/images/1745309422658.png)

## 测试

浏览器打开 [http://localhost:8080](http://localhost:8080) 输入 用户名 `user` 密码 `123123` 登录即可

## 总结

- 开启了 `@EnableWebSecurity` 后，配置文件(`application.properties`)里的相关配置就失效了
- 如果HttpSecurity无法使用 kotlin 的Dsl语法，查看一下是否导入了 `import org.springframework.security.config.annotation.web.invoke`
- `formLogin`里配置的`loginPage`和`loginProcessingUrl`是可以一样的，但强烈不建议保持一致，后面自定义异常处理时会有莫名其妙的问题
- `formLogin`里配置的`loginPage`是需要提供一个`controller`的 而`loginProcessingUrl` 就只需要与登录表单里的 `action`的值保持一致即可
- csrf防护 security会自动在form表单中添加hidden表单，所以无需再次手动添加


