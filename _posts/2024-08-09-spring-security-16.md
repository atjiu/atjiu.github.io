---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 16.springsecurity注解鉴权
date: 2024-08-09 11:29:29
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







在第8篇介绍了 `动态URL权限控制` ，现在貌似用的很少了，大家都喜欢用注解来鉴权，这篇来介绍一下注解鉴权

## 配置

开启注解鉴权功能：在 `SecurityConfig.kt` 类上添加注解 `@EnableMethodSecurity`

```kotlin
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    private val myUserDetailsService: MyUserDetailsService,
    private val authService: AuthService,
    private val myCheckParamsFilter: MyCheckParamsFilter,
    private val dataSource: DataSource
) {}
```

将动态权限验证注释掉，恢复成`authorizeRequests`权限配置方式

```kotlin
http {
    authorizeRequests {
        authorize("/403.html", permitAll)
        authorize("/css/**", permitAll)
        authorize("/error", permitAll)
        authorize("/captcha", permitAll)
        // 配置所有请求地址都需要登录认证才能访问
        authorize("/**", authenticated)
    }
//    authorizeHttpRequests {
//        authorize("/403.html", permitAll)
//        authorize("/css/**", permitAll)
//        authorize("/error", permitAll)
//        authorize("/captcha", permitAll)
//        authorize(anyRequest) { authentication, context ->
//            // 获取请求地址
//            val path = context.request.servletPath
//            // 获取当前认证用户权限列表
//            val authorities = authentication.get().authorities
//            // 临时变量：用来记录是否经过url决策
//            var isDecision: Boolean = false
//            // 临时变量：用来记录url决策结果
//            var decision: Boolean = false
//            // 查询数据库里所有的权限
//            var auths = authService.list()
//            // 过滤掉url字段是空的权限和请求地址与数据库里配置的url不匹配的权限
//            auths = auths.filter { it.url != null && Pattern.compile(it.url!!).matcher(path).find() }
//            if (auths.isNotEmpty()) {
//                // 对权限列表进行2次过滤，取权限名的值在当前认证用户权限列表里的数据
//                auths = auths.filter { authorities.contains(SimpleGrantedAuthority(it.name)) }
//                // 不管二次过滤还有没有值，都表示经过了url决策，所以isDecision设为true
//                isDecision = true
//                // 缓存一下url决策的结果
//                decision = auths.isNotEmpty()
//                AuthorizationDecision(decision)
//            }
//            if (!isDecision) {
//                // 如果没有经过url决策，则判断是不是匿名用户，是的话就去登录，不是的话，说明这个地址没有配置权限只需登录认证即可
//                AuthorizationDecision(authentication.get() !is AnonymousAuthenticationToken)
//            } else {
//                // 上面两个临时变量isDecision, decision就是为了在这用的
//                AuthorizationDecision(decision)
//            }
//        }
//    }
// ...
}
```

打开 `IndexConfig.kt` 在两个controller上添加上鉴权注解 `@PreAuthorize("hasAuthority('')")`

```kotlin
@Controller
class IndexController {

    @PreAuthorize("hasAuthority('index')")
    @GetMapping("/")
    fun index(model: Model): Any? {
        model.addAttribute("user", SecurityContextHolder.getContext().authentication.principal)
        model.addAttribute("study", "Spring Security")
        return "index"
    }

    @PreAuthorize("hasAuthority('user:list')")
    @GetMapping("/user/list")
    fun home(model: Model): Any? {
        model.addAttribute("user", SecurityContextHolder.getContext().authentication.principal)
        return "home"
    }
    // ...
}
```

## 测试

使用 zhangsan登录，打开 http://localhost:8080/user/list 提示没权限

![](/assets/images/1745311818122.png)


