---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 12.记住我
date: 2024-08-08 14:03:44
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







如果是服务端渲染的页面，那么这个记住我的功能就很实用了

## 查源码
`HttpSecurity`里有个属性 `rememberMe` 点进去看看，有如下这些属性

```kotlin
class RememberMeDsl {
    var authenticationSuccessHandler: AuthenticationSuccessHandler? = null
    var key: String? = null
    var rememberMeServices: RememberMeServices? = null
    var rememberMeParameter: String? = null
    var rememberMeCookieName: String? = null
    var rememberMeCookieDomain: String? = null
    var tokenRepository: PersistentTokenRepository? = null
    var userDetailsService: UserDetailsService? = null
    var tokenValiditySeconds: Int? = null
    var useSecureCookie: Boolean? = null
    var alwaysRemember: Boolean? = null
```

有些属性框架已经内置好了默认值

- `rememberMeParameter` 登录页面上记住我选择框表单的name值，默认值是 `remember-me`
- `rememberMeCookieName` cookie名字
- `tokenRepository` 将登录记录保存到数据库里的服务类
- `tokenValiditySeconds` cookie有效时间，单位：秒

`rememberMeParameter`和`rememberMeCookieName`的默认值在`RememberMeConfigurer`类里被初始化了，值就是 `remember-me`

![](/assets/1745311277081.png)

`tokenRepository`类型是`PersistentTokenRepository`，是一个接口，共有两个实现类

![](/assets/1745311285585.png)

根据名字可以看出，`InMemoryTokenRepositoryImpl`是保存在内存中的实现。而`JdbcTokenRepositoryImpl`是保存在数据库里的实现。

打开 `JdbcTokenRepositoryImpl`可以看到一段建表的sql以及增删改查的sql

![](/assets/1745311293952.png)

将这段创建表的sql拷贝下来，去创建一个表，然后开始配置rememberMe功能

``是cookie的有效时间，默认值是 `1209600` 秒，初始值在 `AbstractRememberMeServices` 类中

![](/assets/1745311302464.png)

## 配置rememberMe

初始化 `JdbcTokenRepositoryImpl`

```kotlin
@Bean
fun jdbcTokenRepositoryImpl(): PersistentTokenRepository {
    val tokenRepository = JdbcTokenRepositoryImpl()
    // 操作数据库就需要用到dataSource
    tokenRepository.setDataSource(dataSource)
    return tokenRepository
}
```
初始化 `JdbcTokenRepositoryImpl`要用到`dataSource`，可以通过`SecurityConfig.kt`的构造方法注入进来

```kotlin
class SecurityConfig(
    private val myUserDetailsService: MyUserDetailsService,
    private val authService: AuthService,
    private val myCheckParamsFilter: MyCheckParamsFilter,
    private val dataSource: DataSource
) {
```
将初始化的 `JdbcTokenRepositoryImpl`赋值给`rememberMe`的`tokenRepository`属性

```kotlin
exceptionHandling {}
rememberMe {
    tokenValiditySeconds = 120 // 单位：秒
    tokenRepository = jdbcTokenRepositoryImpl()
}
csrf { disable() }
```

## 测试

启动服务，登录要选中 `记住我`

![](/assets/1745311312457.png)

登录前是没有`rememberMe`cookie的，登录后就有了

![](/assets/1745311321363.png)

打开表`persistent_logins` 可以看到也有一条记录了

![](/assets/1745311334339.png)

在cookie有效期内，删掉cookie中的 `JSESSIONID`后，刷新页面会自动登录，并会重新生成一条新的 `JSESSIONID`

点击`登出`后，cookie里 `remember-me`记录会删除，表 `persistent_logins` 中的数据也会被删除

