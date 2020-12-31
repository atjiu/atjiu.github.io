---
layout: post
title: SpringCloud学习记录 - 写在前面
date: 2020-12-31 15:47:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

在用springcloud搭建服务之前，先来了解一下传统模块之间互调的做法





创建两个springboot项目，一个User, 一个Order，需求：调User的一个web服务去创建订单

User接口代码

```java
@SpringBootApplication
@RestController
public class UserApplication {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @GetMapping("/createOrder")
    public Object createOrder(String userId) {
        // 使用 restTemplate 调用 Order 项目的一个接口来创建订单
        ResponseEntity<String> forEntity = restTemplate().getForEntity("http://localhost:8081/order/create?userId=" + userId, String.class);
        return forEntity.getBody();
    }

    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
}
```

Order接口代码

```java
@SpringBootApplication
@RestController
public class OrderApplication {

    @GetMapping("/order/create")
    public Object create(String userId) {
        return "userId: " + userId + " create an order. from order.";
    }

    public static void main(String[] args) {
        SpringApplication.run(OrderApplication.class, args);
    }
}
```

测试：

`curl http://localhost:8080/createOrder?userId=123`

响应：

```log
userId: 123 create an order. from order.
```

----

总结

好处：简单，好理解，没有什么规范可言，只要是http服务就行

坏处：做集群麻烦
