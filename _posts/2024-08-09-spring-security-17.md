---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 17.jwt加密解密
date: 2024-08-09 14:06:21
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}







JWT官网：[https://jwt.io/](https://jwt.io/)

java实现有好几个开源项目，我这选的是 [io.jsonwebtoken](https://github.com/jwtk/jjwt)

## 引入依赖

在build.gradle里添加jwt的依赖

```gradle
implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6' // or 'io.jsonwebtoken:jjwt-gson:0.12.6' for gson
```

## 加密

```kotlin
val id = UUID.randomUUID().toString()
// 签名的key，加密解密用的都是它
val key = UUID.randomUUID().toString()
val token = Jwts.builder()
    .header()
    .add("typ", "JWT")
    .add("alg", "HS256")
    .and()
    // 自定义的负载信息 用户及权限信息就是放在负载里的
    .claims(payload)
    // JWT ID,标明 JWT 的唯一ID
    .id(id)
    // 过期日期
    .expiration(Date.from(LocalDateTime.now().plusMinutes(1).atZone(ZoneId.systemDefault()).toInstant()))
    // 签发时间
    .issuedAt(Date())
    // 签发人
    .issuer("zhangsan")
    // 用于说明该JWT面向的对象或面向的用户
    .subject("this is a subject")
    // 签名
    .signWith(Keys.hmacShaKeyFor(key.toByteArray()), Jwts.SIG.HS256)
    .compact()
```

将token打印出来如下

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoidG9tY2F0IiwiYWdlIjoxMiwianRpIjoiMjhmNjkzOWQtOWUyNy00MjYzLWI4YzUtN2ExMGI3ZjY0MTk2IiwiZXhwIjoxNzIzMTgzMjQyLCJpYXQiOjE3MjMxODMxODIsImlzcyI6InpoYW5nc2FuIiwic3ViIjoidGhpcyBpcyBhIHN1YmplY3QifQ.6AYrdkvucoSRyNJYMLzV1CHSFlbdbGb9f_RoIhptg8o
```

## 解密

```kotlin
val data = Jwts.parser()
		// key就是加密时生成的那个key
    .verifyWith(Keys.hmacShaKeyFor(key.toByteArray()))
    .build()
    .parseSignedClaims(token)
```
将data打印出来如下

```kotlin
header={typ=JWT, alg=HS256},payload={name=tomcat, age=12, jti=28f6939d-9e27-4263-b8c5-7a10b7f64196, exp=1723183242, iat=1723183182, iss=zhangsan, sub=this is a subject},signature=6AYrdkvucoSRyNJYMLzV1CHSFlbdbGb9f_RoIhptg8o
```

## 精简一下

加密时，header，id，issuer，subject这些都可以不传

```kotlin
valkey = UUID.randomUUID().toString()
val token = Jwts.builder()
//            .header()
//            .add("typ", "JWT")
//            .add("alg", "HS256")
//            .and()
    // 自定义的负载信息
    .claims(payload)
    // JWT ID,标明 JWT 的唯一ID
//            .id(id)
    // 过期日期
    .expiration(Date.from(LocalDateTime.now().plusMinutes(1).atZone(ZoneId.systemDefault()).toInstant()))
    // 签发时间
    .issuedAt(Date())
    // 签发人
//            .issuer("zhangsan")
    // 用于说明该JWT面向的对象或面向的用户
//            .subject("this is a subject")
    // 签名
    .signWith(Keys.hmacShaKeyFor(key.toByteArray()), Jwts.SIG.HS256)
    .compact()
```

token打印出来如下

```
eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoidG9tY2F0IiwiYWdlIjoxMiwiZXhwIjoxNzIzMTgzNDAwLCJpYXQiOjE3MjMxODMzNDB9.SQTdaJ1O96ETzHQvB2HpqbQEmTJlqsIgjufYX_2zeyw
```

解密没法再精简了，解密出来如下

```
header={alg=HS256},payload={name=tomcat, age=12, exp=1723183400, iat=1723183340},signature=SQTdaJ1O96ETzHQvB2HpqbQEmTJlqsIgjufYX_2zeyw
```

