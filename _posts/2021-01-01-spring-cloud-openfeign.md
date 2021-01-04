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

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

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

    @Resource // 这里如果用Autowired会有报错提示，用Resource就不会
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

---

openfeign调用服务的超时时间默认为1s，如果超过了1s没有连通或者连通了没有响应，就会报错，这里可以修改配置文件将超时时间改的长一些来解决

```properties
# 连接服务提供方的超时时间
feign.client.config.default.connect-timeout=5000  # 5s
# 连接上服务后，到响应完成之前所等待的时间
feign.client.config.default.read-timeout=5000  # 5s
```

---

openfeign调用服务接口的日志配置

> openfeign的日志只需要在调用方，比如User模块要调用Order模块的服务，那么就只需要配置在User模块里就可以了

日志级别有以下四种

- NONE 默认的，不显示任何日志
- BASIC 仅记录请求方法，URL，响应状态码及执行时间
- HEADERS 除了BASIC中定义的信息之外，还显示请求和响应的头信息
- FULL 除了HEADERS中定义的信息之外，还有请求和响应的正文数据

创建日志级别的Bean

文链接原: [https://tomoya92.github.io/2021/01/01/spring-cloud-openfeign/](https://tomoya92.github.io/2021/01/01/spring-cloud-openfeign/)

```java
package com.example.springcloudtutorial;

import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignLoggerConfig {

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }

}

```

配置文件添加下面配置

```properties
# 开启openfeign的访问日志
logging.level.com.example.springcloudtutorial.IOrderService=debug
```

再次访问 localhost:18081/createOrder?userId=123 后会看到控制台里显示的日志如下

![](/assets/2021-01-01-20-46-43.png)
