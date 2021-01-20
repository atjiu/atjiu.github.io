---
layout: post
title: SpringCloud学习记录 - Stream
date: 2021-01-20 15:02:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

Stream是啥？

Stream做的事跟hibernate一样，是个翻译器，hibernate适配不同的数据库，stream适配不同的队列





# 创建模块

创建一个stream-provider和两个 stream-consumer1, stream-consumer2 模块

stream-provider引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
</dependency>
<!--<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>-->
```

两个消费者引入的依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
</dependency>
<!--<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>-->
```

## 配置

stream-provider模块的配置

```properties
server.port=18087

spring.application.name=stream-provider

# rabbit 配置
spring.cloud.stream.binders.myMQ.type=rabbit
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.host=localhost
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.port=5672
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.username=guest
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.password=guest

# kafka 配置
#spring.cloud.stream.binders.myMQ.type=kafka
#spring.cloud.stream.kafka.binder.brokers=localhost
#spring.cloud.stream.kafka.binder.defaultBrokerPort=9092

spring.cloud.stream.bindings.output.destination=stream-provider-test
# 下面配置的myMQ是上面配置的binders
spring.cloud.stream.bindings.output.binder=myMQ
```

stream-consumer1模块的配置

```properties
server.port=18088

spring.application.name=stream-consumer1

spring.cloud.stream.binders.myMQ.type=rabbit
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.host=localhost
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.port=5672
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.username=guest
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.password=guest

#spring.cloud.stream.binders.myMQ.type=kafka
#spring.cloud.stream.kafka.binder.brokers=localhost
#spring.cloud.stream.kafka.binder.defaultBrokerPort=9092

spring.cloud.stream.bindings.input.destination=stream-provider-test
spring.cloud.stream.bindings.input.binder=myMQ
# 给消费者添加上组名，只要组名相同，消费消息的时候就不会重复
spring.cloud.stream.bindings.input.group=consumer-group-test
```

stream-consumer2模块的配置

```properties
server.port=18089

spring.application.name=stream-consumer1

spring.cloud.stream.binders.myMQ.type=rabbit
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.host=localhost
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.port=5672
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.username=guest
#spring.cloud.stream.binders.myMQ.environment.spring.rabbitmq.password=guest

#spring.cloud.stream.binders.myMQ.type=kafka
#spring.cloud.stream.kafka.binder.brokers=localhost
#spring.cloud.stream.kafka.binder.defaultBrokerPort=9092

spring.cloud.stream.bindings.input.destination=stream-provider-test
spring.cloud.stream.bindings.input.binder=myMQ
spring.cloud.stream.bindings.input.group=consumer-group-test
```

原链文接: [https://tomoya92.github.io/2021/01/20/spring-cloud-stream/](https://tomoya92.github.io/2021/01/20/spring-cloud-stream/)

## 提供者

消息提供者发送消息到队列中，使用 `@EnableBinding` 来开启消息功能

```java
package com.example.springcloudtutorial;

import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@EnableBinding(Processor.class)
public class MessageProviderService {

    @Resource
    private MessageChannel output;

    public String send() {
        String uuid = UUID.randomUUID().toString();
        Map<String, Object> payload = new HashMap<>();
        payload.put("uuid", uuid);
        output.send(MessageBuilder.withPayload(payload).build());
        return uuid;
    }

}
```

写一个接口，调用一次发一条消息

```java
package com.example.springcloudtutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@SpringBootApplication
@RestController
public class StreamProviderApplication {

    @Resource
    private MessageProviderService messageProviderService;

    @GetMapping("/sendMsg")
    public ResponseEntity<String> sendMsg() {
        String uuid = messageProviderService.send();
        System.out.println("provider: " + uuid);
        return ResponseEntity.ok(uuid);
    }

    public static void main(String[] args) {
        SpringApplication.run(StreamProviderApplication.class, args);
    }
}
```

## 消费者

同样使用 `@EnableBinding` 开启消息功能，同时使用 `@StreamListener` 来监听消费哪的消息

StreamConsumer1Application.java

```java
package com.example.springcloudtutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.messaging.Message;

import java.util.Map;

@SpringBootApplication
@EnableBinding(Processor.class)
public class StreamConsumer1Application {

    @StreamListener(Processor.INPUT)
    public void receiveMsg(Message<Map<String, Object>> message) {
        Map<String, Object> payload = message.getPayload();
        System.out.println("consumer2: " + payload.toString());
    }

    public static void main(String[] args) {
        SpringApplication.run(StreamConsumer1Application.class, args);
    }
}
```

StreamConsumer2Application.java

```java
package com.example.springcloudtutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.cloud.stream.messaging.Processor;
import org.springframework.messaging.Message;

import java.util.Map;

@SpringBootApplication
@EnableBinding(Processor.class)
public class StreamConsumer2Application {

    @StreamListener(Processor.INPUT)
    public void receiveMsg(Message<Map<String, Object>> message) {
        Map<String, Object> payload = message.getPayload();
        System.out.println("consumer2: " + payload.toString());
    }

    public static void main(String[] args) {
        SpringApplication.run(StreamConsumer2Application.class, args);
    }
}

```

## 总结

`org.springframework.cloud.stream.annotation` 这个包下的几个注解都标注了不推荐使用了，但官方文档上又没说明用哪个来代替

![](/assets/2021-01-20-15-30-05.png)
