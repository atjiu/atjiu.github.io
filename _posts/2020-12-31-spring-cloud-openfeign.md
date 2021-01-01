---
layout: post
title: SpringCloud学习记录 - openfeign
date: 2021-01-01 20:17:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

openfeign是啥？

openfeign是ribbon+resttemplate的合集，使用ribbon的时候，还要手动去写resttemplate的调用，openfeign就是解决了手动写resttempalte调用的代码，用了openfeign，就只需要定义接口，实现部分openfeign已经做好了






引入依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

> 上一篇在自定义rule的时候需要将`spring-cloud-starter-netflix-eureka-client`里面引入的ribbon去掉，当使用openfeign的时候，又不能去掉。。
>
> 虽然openfeign里也引入了ribbon，但就是不能把`spring-cloud-starter-netflix-eureka-client`里的ribbon去掉，这。。

配置文件不需要修改

定义要调用的接口(接口调用只需要在调用端定义就行了，比如User要调用Order服务的接口，那么openfeign的接口就只需要在User模块里定义)

```java
package com.example.springcloudtutorial;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;

@Component
@FeignClient("ORDER")  // 指定要调用哪个实例的接口
public interface IOrderService {

    @PostMapping("/order/create") // 要调用实例的接口地址
    String create(String userId);

}
```

使用

链文接原: [https://tomoya92.github.io/2021/01/01/spring-cloud-openfeign/](https://tomoya92.github.io/2021/01/01/spring-cloud-openfeign/)

```java
package com.example.springcloudtutorial;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableEurekaClient
@EnableDiscoveryClient
@RestController
@EnableFeignClients
//@RibbonClient(name = "ORDER", configuration = MyRuleConfig.class)
public class UserApplication {

//    @Bean
//    @LoadBalanced
//    public RestTemplate restTemplate() {
//        return new RestTemplate();
//    }

    @Autowired
    private IOrderService orderService;

    @GetMapping("/createOrder")
    public Object createOrder(String userId) {
//        ResponseEntity<String> forEntity = restTemplate().getForEntity("http://ORDER/order/create?userId=" + userId, String.class);
//        return forEntity.getBody();

        return orderService.create(userId);
    }

    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
}
```

最后别忘了在启动类上添加上 `@EnableFeignClients` 注解

浏览器访问：localhost:18081/createOrder?userId=123

