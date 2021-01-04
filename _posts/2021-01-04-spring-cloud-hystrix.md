---
layout: post
title: SpringCloud学习记录 - Hystrix
date: 2021-01-04 11:54:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

hystrix是啥？

hystrix(熔断器)，当服务提供方出问题之后的解决方案就是熔断器(hystrix)干的活。下面举几个例子

- `if(){}elseif{}else{//这里就是熔断器发挥空间}`
- `switch(){case:default://这里就是熔断器发挥空间}`







## 概念

- 降级 上面举的例子就是服务降级，说白了就是服务提供方出问题后的备选方案
- 熔断 带有一定条件的服务降级，意思就是当满足xx条件后，服务提供方即使没有出问题也会进行降级，过一段时间后会尝试恢复
- 限流 跟熔断一样，当请求数量超过设置的阈值后，自动进行服务降级