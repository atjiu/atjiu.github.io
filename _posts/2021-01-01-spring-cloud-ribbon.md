---
layout: post
title: SpringCloud学习记录 - Ribbon
date: 2021-01-01 12:48:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
  {:toc}

上一篇在User模块里调用Order的时候用到了一个注解 @LoadBanlance 这货就是Ribbon里的

Ribbon是什么东西？

一个基于Http和TCP的客户端负载均衡工具，它解决的是微服务之间的负载均衡问题，是一个部署在客户端的负载均衡工具（nginx是一个服务端的负载均衡工具）





> spring-cloud-starter-netflix-eureka-client 包里已经引入了 ribbon，所以可以直接使用

负载均衡的规则有哪些？

![](/assets/images/2021-01-01-17-27-05.png)

- AvailabilityFilteringRule
- BestAvailableRule 会过滤掉由于多次访问故障而处于断路器跳闸状态的服务，然后选择一个并发量最小的服务
- PredicateBasedRule 这是一个抽象类，提供一个choose的模板，通过调用AbstractServerPredicate实现类的过滤方法来过滤出目标的服务，再通过轮询方法选出一个服务。
- RandomRule 随机
- RetryRule 重试，先按照RoundRobinRule获取服务，如果失败则在指定时间内重试获取可用的服务
- RoundRobinRule 轮询
- WeightedResponseTimeRule 对RoundRobinRule的扩展，响应速度越快的实例权重越大，越容易被选中
- ZoneAvoidanceRule 默认规则，复合判断server所在区域的性能和server的可用性选择服务

使用@LoadBalance注解默认使用的是轮询，如何换成其它的规则来调用服务？

> 自定义的规则类不能被@ComponentScan扫描到，否则自定义的规则会被所有Ribbon客户端共享 见：https://cloud.spring.io/spring-cloud-netflix/multi/multi_spring-cloud-ribbon.html#_customizing_the_ribbon_client

![](/assets/images/2021-01-01-17-49-42.png)

自定义一个rule配置类，注意这个类的包名为 com.example.myrule 而UserApplication的包名为 com.example.springcloud

```java
package com.example.myrule;

import com.netflix.loadbalancer.IRule;
import com.netflix.loadbalancer.RandomRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyRuleConfig {

    @Bean
    public IRule myRule() {
        return new RandomRule();
    }

}

```

在UserApplication.java上配置上调用这个自定义的rule

链文接原: [https://atjiu.github.io/2021/01/01/spring-cloud-ribbon/](https://atjiu.github.io/2021/01/01/spring-cloud-ribbon/)

```java
@RibbonClient(name = "ORDER", configuration = MyRuleConfig.class)
public class UserApplication {
}
```

重启User服务，再次访问 localhost:18081/createOrder?userId=123

多刷几次就会发现 order1, order2是随机出现的


----

上面说到了 `spring-cloud-starter-netflix-eureka-client` 这个包里已经引入了 ribbon ，用 @LoadBalance 注解是没问题，但自定义Rule的时候就找不到 IRule 接口了，解决办法是先从 `spring-cloud-starter-netflix-eureka-client` 里把 ribbon 给移除，然后再重新引入

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
    </dependency>
</dependencies>
```
