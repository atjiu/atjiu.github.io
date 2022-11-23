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

链文接原: [https://atjiu.github.io/2021/01/07/spring-cloud-gateway/](https://atjiu.github.io/2021/01/07/spring-cloud-gateway/)

## Predicates

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

配置中的断言规则可以参见：https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gateway-request-predicates-factories

里面在针对Path,Header,Cookie,Host,Method,Query等等进行判断

## Filters

```yaml
spring:
  cloud:
    gateway:
      routes:
      - id: add_request_header_route
        uri: https://example.org
        filters:
        - AddRequestHeader=X-Request-red, blue
```

上面配置意思是请求经过断言成功后，再走过滤器(filter)，要请求头中有X-Request-red参数的请求才行，具体过滤器配置参见：https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#gatewayfilter-factories

## 全局过滤器

添加下面配置启用全局过滤器

```java
@Bean
public GlobalFilter customFilter() {
    return new CustomGlobalFilter();
}

public class CustomGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("custom global filter");
        // 从exchange里可以取出request, response
        ServerHttpRequest request = exchange.getRequest();
        ServerHttpResponse response = exchange.getResponse();
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
```

每次请求都会走一下这个filter方法，然后就可以在里面做些小动作了

## 测试

请求 http://localhost:18084/order/123

```log
order: 345 server: order2
```

## 总结

gateway这货在我看来就是为了掩盖各种服务实例的真实地址端口的，可有可无
