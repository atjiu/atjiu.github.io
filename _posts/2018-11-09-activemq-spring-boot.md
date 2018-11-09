---
layout: post
title: ActiveMQ学习-与spring整合，在spring-boot中使用 (5)
date: 2018-11-09 08:56:00
categories: ActiveMQ学习笔记
tags: activemq
author: 朋也
---

* content
{:toc}

在spring-boot中使用ActiveMQ相当的简单

引入依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-activemq</artifactId>
</dependency>
```





添加配置文件

```yml
spring:
  activemq:
    broker-url: tcp://localhost:61616
```

spring-boot里也可以进行数据连接池的配置，这个之前几篇博客已经都配置好了，这里就不做配置了

消息提供者
```java
@Service("producer")
public class Producer {

  @Autowired
  private JmsMessagingTemplate jmsTemplate;

  // 发送消息，destination是发送到的队列，message是待发送的消息
  public void sendMessage(Destination destination, String message) {
    jmsTemplate.convertAndSend(destination, message);
  }

}
```

消息消费者1
```java
@Component
public class Consumer1 {
  // 使用JmsListener配置消费者监听的队列，其中text是接收到的消息
  @JmsListener(destination = "amq-demo")
  public void receiveQueue(String text) {
    System.out.println("Consumer1: " + text);
  }
}
```

消息消费者2
```java
@Component
public class Consumer2 {
  // 使用JmsListener配置消费者监听的队列，其中text是接收到的消息
  @JmsListener(destination = "amq-demo")
  public void receiveQueue(String text) {
    System.out.println("Consumer2: " + text);
  }
}
```

消息消费者3
```java
@Component
public class Consumer3 {

  @JmsListener(destination = "amq-demo2")
  public void consumerMessage(String text) {
    System.out.println("收到来自amq-demo2队列的消息: " + text);
  }

}
```

test方法
```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class DemoApplicationTests {

  @Autowired
  private Producer producer;

  @Test
  public void contextLoads() {
    Destination destination = new ActiveMQQueue("amq-demo");

    for (int i = 1; i <= 5; i++) {
      producer.sendMessage(destination, "Producer消息" + i);
    }
  }

}
```

运行结果

![](https://tomoya92.github.io/assets/QQ20181109-092723@2x.png)

说明

1. 提供者发送消息到ActiveMQ服务器里
2. 消费者1和消费者2同时消费数据，它们不会重复消费，既有一个消费者把消息消费了，其它消费者就不会再消费这条数据了
3. 消费者2消费数据的同时还将消息重新发出(这里的意思应该是消费者2临时充当了消息提供者的角色了，这个功能可以处理一些复杂的，一个消费者处理不完的消息，或者处理一些消息后，还有后续的操作的业务)
4. 消费者3监听消费者2发出的消息然后进行消费

**注意，运行test方法进行测试前要先启动 ActiveMQ**
