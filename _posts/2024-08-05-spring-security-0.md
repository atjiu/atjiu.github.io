---
layout: post
title: SpringSecurity6.x运行流程源码分析
date: 2024-08-05 16:08:31
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}




**SpringSecurity6.x运行流程源码分析**

1. 请示发送到 UsernamePasswordAuthenticationFilter 过滤器
2. 过滤器中的attemptAuthentication方法执行。此方法由过滤器的父类AbstractAuthenticationProcessingFilter中的doFilter方法调用
3. attemptAuthentication方法执行时，先获取请示参数，默认是username和password 具体由方法obtainUsername和方法obtainPassword处理
4. 创建认证方法参数对象UsernamePasswordAuthenticationToken 此对象中保存登录请求参数，且标记未登录认证
5. 调用认证方法 authenticate()，方法参数是UsernamePasswordAuthenticationToken的对象
6. authenticate()方法由接口AuthenticationManager实现类型ProviderManager提供
7. ProviderManager.authenticate()核心代码是：
    1. Authentication result = AuthenticationProvider.authenticate(authentication)
    2. Authentication 是security框架定义的用户主体类型。是被security框架保存在会话作用域中的数据。
    3. AuthenticationProvider 是接口类型。用于实现具体的登录过程。具体使用抽象实现类AbstractUserDetailsAuthenticationProvider
8. AbstractuserDetailsAuthenticationProvider.authenticate()运行流程是:
    1. 检查是否已经登录，查看security管理的缓存中，是否存在此用户对象
    2. UserDetails user =this.usercache.getUserFromcache(username)
    3. 如果缓存中没有要导录的用户对象，开始认证登录。
    4. UserDetails user = retrieveUser(用户名,UsernamePasswordAuthenticationToken类型对象传递密码);
    5. retrieveUser方法是一个抽象方法，由子类型 DaoAuthenticationProvider 提供具体实现。
9. DaoAuthenticationProvider.retrieveUser运行流程
    1. 调用userDetailsservice接口中的loaduserByUsername方法，查询用户
    2. UserDetails loadeduser = this,getUserDetailsservice(),loaduserByusername(username),
    3. 查询完毕后，返回 UserDetails 类型对象
10. AbstractUserDetailsAuthenticationProvider.authenticate() catch异常， 异常类型是 usernameNotFoundException ，异常出现，则用户不存在。直接返回错误结果
11. AbstractuserDetailsAuthenticationProvider.authenticate()
    1. 调用 DefaultPreAuthenticationchecks.check 方法，做前置检查，简单用户是否已锁定、不可用、已过期
    2. preAuthenticationchecks.check(user);如果已锁定或不可用或已过期，抛出异常。
12. AbstractuserDetailsAuthenticationProvider.authenticate()  开始判断登录用户的密码是否正确
    1. Daoauthenticationprovider,additionalAuthenticationchecksluser, (usernamePasswordAuthenticationToken) authentication)
    2. 方法中调用PasswordEncoder类型matches方法，判断密码是否正确，如果密码错误，抛出异常。
    3. if (!this.passwordEncoder,matches(presentedPassword, userDetails.getPassword()))
13. AbstractUserDetailsAuthenticationProvider.authenticate()
    1. 开始密码判断后的检查。调用 DefaultPostAuthenticationchecks,check 方法，简单密码是否已过期，如果过期抛出异常
    2. this.postAuthenticationchecks.check(user);
14. AbstractUserDetailsAuthenticationProvider,authenticate()
    1. 如果没有任何异常抛出，则代表登录认证成功。创建结果对象。结果对象类型是 Authentication 接口类型，
    2. 具体创建过程由下述方法实现。具体对象类型是 usernamePasswordAuthenticationToken
    3. createsuccessAuthentication(principalToReturn, authentication, user)
15. AbstractuserpetailsAuthenticationprovider.authenticate()结束，返回 Authentication 类型对象, 代表用户登录认证成功，返回的是查询结果对象。包含用户的身份、凭证和权限列表。
16. ProviderManager.authenticate()方法中，认证成功后，需要隐减Authentication对象中的密码。具体由下述方法实现。
    1. 隐藏密码从目的是数据脱敏(摆脱敏感信息)。
    2. ((CredentialsContainer)result).erasecredentials();
17. ProviderManager.authenticate()方法执行结束，返回隐藏密码后的 Authentication 对象。
18. usernamePasswordAuthenticationfilter.attemptAuthentication方法执行结束，返回结果交给父类型的过滤方法 doFilter
19. AbstractAuthenticationProcessingFilter 中的 doFilter 方法继续执行。
    1. 根据登录结果决定运行 successfulAuthentication 或 unsuccessfulAuthentication 。
    2. 当 attemptAuthentication 方法抛出异常时，运行 unsuccessfulAuthentication, 进入登录认证失败处理流程。调用 AuthenticationFailureHandler 中的 onAuthenticationfailure 方法，处理认证失败。
    3. 当 attemptAuthentication 方法正常结束时，运行 successfulAuthentication, 进入登录认证成功处理流程。调用 AuthenticationsuccessHandler 中的 onAuthenticationsuccess 方法，处理认证功。

整理自：[https://www.bilibili.com/video/BV1e94y1H7Kk?p=21](https://www.bilibili.com/video/BV1e94y1H7Kk?p=21)
