---
layout: post
title: springsecurity6.x+gradle+kotlin+thymeleaf学习笔记 - 1.创建项目
date: 2024-08-06 09:14:05
categories: springsecurity6.x学习笔记
tags: springsecurity kotlin gradle thymeleaf
author: 朋也
---

* content
{:toc}




项目名： springsecurity-demo
构建工具：gradle
开发语言：kotlin
java版本：21
kotlin：2.0.0

![](/assets/images/1745308290869.png)

![](/assets/images/1745308332026.png)

项目创建好之后打开根目录下的 `build.gradle`文件，将kotlin插件版本改成`2.0.0`

```gradle
plugins {
    id 'org.springframework.boot' version '3.3.2'
    id 'io.spring.dependency-management' version '1.1.6'

//    id 'org.jetbrains.kotlin.jvm' version '1.9.24'
//    id 'org.jetbrains.kotlin.plugin.spring' version '1.9.24'

    id 'org.jetbrains.kotlin.jvm' version '2.0.0'
    id 'org.jetbrains.kotlin.plugin.spring' version '2.0.0'
}
```
在`repositories`里添加一些能快速构建的源

```gradle
repositories {
    mavenLocal()
    maven { url 'https://maven.aliyun.com/repository/public/' }
    maven { url = uri("https://repo.spring.io/snapshot") }
    maven { url = uri("https://repo.spring.io/milestone") }
    mavenCentral()
}
```
剩下就是等待gradle构建项目完成了
项目中各框架的版本号

![](/assets/images/1745308345780.png)
