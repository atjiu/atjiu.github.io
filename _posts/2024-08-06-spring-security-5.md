---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 5.代码配置权限
date: 2024-08-06 14:34:07
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
  {:toc}

目前配置的认证仅有一个，即所有链接都需要登录认证才能访问

```java
http {
authorizeRequests {
    // 配置所有请求地址都需要登录认证才能访问
    authorize("/**", authenticated)
}
```

下面来配置一下不同url需要不同权限

## 准备工作

创建一个 `/home` 路径的`controller`和页面

```java
@GetMapping("/home")
fun home(model:Model) : Any? {
    model.addAttribute("user", SecurityContextHolder.getContext().authentication.principal)
    return "home"
}
```

home.html

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Home</title>
</head>
<body>
    <p>当前登录的用户名：<span th:text="${user.username}"></span></p>
    <p>当前登录的用户权限：</p>
    <ul>
        <li th:each="auth : ${user.authorities}" th:text="${auth}"></li>
    </ul>
</body>
</html>
```

顺便修改一下 `/` 的响应数据，也将用户的名字和权限输出出来

```java
@GetMapping("/")
fun index(model: Model): Any? {
    model.addAttribute("user", SecurityContextHolder.getContext().authentication.principal)
    model.addAttribute("study", "Spring Security")
    return "index"
}
```

index.html

```html
<!doctype html>
<html lang="zh-CN" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Hello Security</title>
</head>
<body>
    <p th:text="${study}"></p>
    <p>当前登录的用户名：<span th:text="${user.username}"></span></p>
    <p>当前登录的用户权限：</p>
    <ul>
        <li th:each="auth : ${user.authorities}" th:text="${auth}"></li>
    </ul>
</body>
</html>
```

## 代码配置

首先在模拟内存用户处给`user`用户添加`USER`角色。另外再创建一个用户`admin`并设置上`ADMIN`权限

```java
@Bean
fun users(): UserDetailsService {
    // 构建一个用户
    // 密码可通过 PasswordEncoderFactories.createDelegatingPasswordEncoder().encode("123123") 来生成
    val user = User.builder()
        .username("user")
        .password("{bcrypt}\$2a\$10\$TzCWNNt8cJb6ruQ43nQ/jecs2ojY5G7jOrTEk6EBUXDhlwcPyLbtu")
        .roles("USER")
        .build()
    val admin = User.builder()
        .username("admin")
        .password("{bcrypt}\$2a\$10\$iOhhM1Z.A4AsnJSfT1Dx1ORGotFhNQzG2wx9cMtAhPCS.7976MRcC")
        .roles("ADMIN")
        .build()
    // 将构建的用户放进内存中等待用户登录验证
    return InMemoryUserDetailsManager(user, admin)
}
```

然后在过滤器链中添加上 `/home` 需要 `ADMIN` 权限

```java
@Bean
open fun filterChain(
    http: HttpSecurity,
): SecurityFilterChain {
    http {
        authorizeRequests {
            // 配置 /home 路径需要 ADMIN 权限
            authorize("/home", hasRole("ADMIN"))
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
```

**注意：`authorize("/home", hasRole("ADMIN"))` 这段配置必须要放在`authorize("/**", authenticated)`上面，因为校验权限是从上到下校验的，`/**` 是包含 `/home`的，在`/**`处已经通过了，就不会再往下校验了。**

## 源码跟踪

在构建内存用户时，调用了一个 `roles()` 方法，看一下这个方法将传的参数扔哪了

![](/assets/images/1745309539168.png)

从源码中可以看到springsecurity将传进来的roles给遍历出来并在前面又拼上了 `ROLE_` 作为权限放进了`authorities`中。断点看看

![](/assets/images/1745309550688.png)

在内存用户校验的方法 `loadUserByUsername()` 中，UserDetails对象user中确实是有 `ROLE_ADMIN` 权限的

所以上面配置 `/home` 路径所需权限处用的是 `hasRole("ADMIN")` 这里也可以换成 `hasAuthority("ROLE_ADMIN")` 如下

```java
http {
    authorizeRequests {
        // 配置 /home 路径需要 ADMIN 权限
        authorize("/home", hasAuthority("ROLE_ADMIN"))
        // 配置所有请求地址都需要登录认证才能访问
        authorize("/**", authenticated)
    }
}
```

而 `hasRole()` 这个方法为什么能不写 `ROLE_` 也能校验呢？继续查源码

![](/assets/images/1745309563178.png)

在`AuthorizeHttpRequestsConfigurer`类中的`hasRole()`方法中调用了`AuthorityAuthorizationManager`类中的 `hasAnyRole()`方法 且将`this.rolePrefix`参数带过!去了，下面看看

![](/assets/images/1745309575619.png)

方法中，它又调用了 `hasAnyAuthority()` 并将这个前缀继续往下传给了 `toNamedRolesArray()` 方法，在 `toNamedRolesArray()` 方法中，又将前缀和角色名拼在一块作为权限来验证了

所以`hasRole()`底层还是调用的 `hasAuthority()` 来验证的。

## 测试

使用 `user` 用户登录，然后访问 `/` 页面

![](/assets/images/1745309585232.png)

保持登录状态访问 `/home` 页面

![](/assets/images/1745309593721.png)

可以看到403了，`user`用户没有权限访问 `/home`页面

重新使用`admin`登录，访问 `/home`页面。如下就能正常显示了

![](/assets/images/1745309621055.png)

## 总结

- `authorize("/home", hasRole("ADMIN"))` 这段配置必须要放在`authorize("/**", authenticated)`上面，因为校验权限是从上到下校验的，`/**` 是包含 `/home`的，在`/**`处已经通过了，就不会再往下校验了。
- 懒得多写`ROLE_`可以用 `hasRole()`进行配置，本质上还是调用的 `hasAuthority()`来验证的

