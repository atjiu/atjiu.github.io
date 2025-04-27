---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 8.动态URL权限控制
date: 2024-08-07 16:18:05
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
  {:toc}

上篇创建的权限表`auth`中有个字段`url`，对应权限名`name`，目前只在`SecurityConfig.kt`里使用代码写死了一个配置

```kotlin
authorizeRequests {
    // 配置 /home 路径需要 ADMIN 权限
    authorize("/home", hasAuthority("user:delete"))
    // 配置所有请求地址都需要登录认证才能访问
    authorize("/**", authenticated)
}
```

这篇来将 `auth` 表里的 `url` 字段利用起来，实现权限动态控制，即数据库里对权限做更新而无需修改代码

## 准备Controller

将前面写的 `/home`的controller修改一下地址，改成 `/user/list`

```kotlin
@GetMapping("/user/list")
fun home(model: Model): Any? {
    model.addAttribute("user", SecurityContextHolder.getContext().authentication.principal)
    return "home"
}
```

## 配置authorizeHttpRequests

通过构造方法将 `AuthService注入进来`

```kotlin
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val myUserDetailsService: MyUserDetailsService,
    private val authService: AuthService
) {}
```

在HttpSecurity的权限配置里，`authorizeRequests`和`authorizeHttpRequests`是不能并存的。前面配置的权限使用的是`authorizeRequests`，要想自定义决策逻辑，就需要用到 `authorizeHttpRequests`了，所以先将`authorizeRequests`相关代码注释掉，再添加上  `authorizeHttpRequests`相关代码

```kotlin
http {
//    authorizeRequests {
//        authorize("/captcha", permitAll)
//        // 配置 /home 路径需要 ADMIN 权限
//        authorize("/home", hasAuthority("user:delete"))
//        // 配置所有请求地址都需要登录认证才能访问
//        authorize("/**", authenticated)
//    }
    authorizeHttpRequests {
    	// 系统的报错页面，直接放行
        authorize("/error", permitAll)
        authorize(anyRequest) { authentication, context ->
            // 获取请求地址
            val path = context.request.servletPath
            // 获取当前认证用户权限列表
            val authorities = authentication.get().authorities
            // 临时变量：用来记录是否经过url决策
            var isDecision:Boolean = false
            // 临时变量：用来记录url决策结果
            var decision:Boolean = false
            // 查询数据库里所有的权限
            var auths = authService.list()
            // 过滤掉url字段是空的权限和请求地址与数据库里配置的url不匹配的权限
            auths = auths.filter { it.url != null && Pattern.compile(it.url!!).matcher(path).find() }
            if (auths.isNotEmpty()) {
                // 对权限列表进行2次过滤，取权限名的值在当前认证用户权限列表里的数据
                auths = auths.filter { authorities.contains(SimpleGrantedAuthority(it.name)) }
                // 不管二次过滤还有没有值，都表示经过了url决策，所以isDecision设为true
                isDecision = true
                // 缓存一下url决策的结果
                decision = auths.isNotEmpty()
                AuthorizationDecision(decision)
            }
            if (!isDecision) {
                // 如果没有经过url决策，则判断是不是匿名用户，是的话就去登录，不是的话，说明这个地址没有配置权限只需登录认证即可
                AuthorizationDecision(authentication.get() !is AnonymousAuthenticationToken)
            } else {
                // 上面两个临时变量isDecision, decision就是为了在这用的
                AuthorizationDecision(decision)
            }
        }
    }
    formLogin {}
    logout {}
    csrf { disable() }
}
return http.build()
```

## 测试

启动服务，直接访问 `/user/list` 地址，会跳转到登录，说明匿名用户会首先跳转登录的逻辑是正常的

然后登录成功后回到 `/user/list` 页面，因为 `zhangsan` 只有首页权限而没有这个页面的权限。所以跳转到403报错页面，说明从数据库中读取权限进行决策的逻辑也是正常的。

![](/assets/images/1745310418945.png)

![](/assets/images/1745310425033.png)

## 总结

- `authorizeRequests`和`authorizeHttpRequests`是不能并存的，启动时会报错
- 自定义url决策那里有一段查询数据库所有权限的代码，这个查询在每次请求都会被执行，所以需要对所有权限进行缓存。否则数据库的压力就太大了



