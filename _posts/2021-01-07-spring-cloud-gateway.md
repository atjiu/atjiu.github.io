---
layout: post
title: SpringCloud学习记录 - Gateway
date: 2021-01-07 17:32:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

Gateway是啥？

网关，将各种服务统一配置、调度的东东，类似于nginx，接受所有的请求，通过内部配置的各种断言来决定走哪个服务器处理






## 坑

在我将依赖，配置都配置好，启动项目的时候报错了

```log
Correct the classpath of your application so that it contains a single, compatible version of reactor.netty.resources.ConnectionProvider
```

网上找遍了解决方法，都说是reactor-netty的版本问题，要从0.9.4降到0.9.2，但我用idea看了一下mvn的依赖关系，确实是0.9.2。这就没办法了，然后我想到了升版本，开始尝试springcloud3.x，于是项目的版本号被我升级了，如下

```xml
<properties>
    <java.version>1.8</java.version>
    <!--<spring-cloud.version>Hoxton.SR9</spring-cloud.version>-->
    <!--<spring-boot.version>2.2.2.RELEASE</spring-boot.version>-->
    <spring-cloud.version>2020.0.0</spring-cloud.version>
    <spring-boot.version>2.4.1</spring-boot.version>
</properties>
```

刷新mvn后，启动项目，正常。

## 依赖

创建一个模块，名为`gateway` 添加如下依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

## 启动类

```java
package com.example.springcloudtutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}

```

链文接原: [https://tomoya92.github.io/2021/01/07/spring-cloud-gateway/](https://tomoya92.github.io/2021/01/07/spring-cloud-gateway/)

## 配置文件

> 之前的模块一直用的是properties来配置的，但网关这块如果还用properties来配置，那就不是人看的了，所以这个模块的配置文件采用yaml来配置

```yaml
server:
  port: 18084

spring:
  application:
    name: gateway
  cloud:
    gateway:
      routes:
        - id: path_route
          uri: lb://order # 负载均衡地址，在user模块里使用ribbon调服务的时候已经用过了，不过那时候调用服务用的协议是http，这里变成了lb协议（猜测是loadbanlance)的意思，至于为啥是lb协议，我也没找到哪有写
          predicates:  # 断言，判断条件，下面的条件成立则通过
            - Path=/order/** # 请求路径为/order开关的地址，则通过断言

eureka:
  client:
    service-url:
      defaultZone: http://localhost:18080/eureka/
  instance:
    instance-id: gateway-${server.port}

```

## 测试

请求 http://localhost:18084/order/123

```log
order: 345 server: order2
```

## 总结

gateway这货在我看来就是为了掩盖各种服务实例的真实地址端口的，可有可无
