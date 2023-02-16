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

- [ActiveMQ学习-HelloWorld (1)](https://atjiu.github.io/2018/11/05/activemq-helloworld/)
- [ActiveMQ学习-安全认证-连接AMQ用户密码配置 (2)](https://atjiu.github.io/2018/11/06/activemq-security/)
- [ActiveMQ学习-持久化队列数据，将队列中的消息存入MySQL (3)](https://atjiu.github.io/2018/11/06/activemq-persistence/)
- [ActiveMQ学习-Api介绍 (4)](https://atjiu.github.io/2018/11/08/activemq-api/)
- [ActiveMQ学习-与spring整合，在spring-boot中使用 (5)](https://atjiu.github.io/2018/11/09/activemq-spring-boot/)

在spring-boot中使用ActiveMQ相当的简单

引入依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-activemq</artifactId>
</dependency>
```





## 添加配置文件

```yml
spring:
  activemq:
    broker-url: tcp://localhost:61616
    packages:
      trust-all: true # 如果要传输对象消息, 这个必须要打开, 否则会报错
```

spring-boot里也可以进行数据连接池的配置，这个之前几篇博客已经都配置好了，这里就不做配置了

## 消息提供者

```java
@Service("producer")
public class Producer {

  @Autowired
  private JmsMessagingTemplate jmsTemplate;

  // 发送消息，destination是发送到的队列，message是待发送的消息
  public void sendMessage(Destination destination, String message) {
    jmsTemplate.convertAndSend(destination, message);
  }

  // 发送对象消息, 传输的对象一定要序列化
  public void sendMessage(Destination destination, Serializable obj) {
    jmsTemplate.convertAndSend(destination, obj);
  }

}
```

## 消息消费者

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

  // 消费对象消息
  @JmsListener(destination = "amq-demo2")
  public void consumerMessage(Item item) {
    System.out.println("Consumer2: " + item.toString();
  }

}
```

## 创建一个消息对象

```java
public class Item implements Serializable {
    private static final long serialVersionUID = -2805516975103385225L;

    private Integer id;
    private String title;

    // setter getter
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
      // 发送字符串消息
      producer.sendMessage(destination, "Producer消息" + i);
      // 发送对象消息
      // Item item = new Item();
      // item.setId(i);
      // item.setTitle("商品 " + i);
      // producer.sendMessage(destination, item);
    }
  }

}
```

运行结果

![](/assets/QQ20181109-092723@2x.png)

## 说明

1. 提供者发送消息到ActiveMQ服务器里
2. 消费者1和消费者2同时消费数据，它们不会重复消费，既有一个消费者把消息消费了，其它消费者就不会再消费这条数据了
3. 消费者2消费数据的同时还将消息重新发出(这里的意思应该是消费者2临时充当了消息提供者的角色了，这个功能可以处理一些复杂的，一个消费者处理不完的消息，或者处理一些消息后，还有后续的操作的业务)
4. 消费者3监听消费者2发出的消息然后进行消费

---

## 补充

activemq里消费消息默认是自动签收的，但业务中有时候会要求有手动签收的，在springboot项目中的配置文件中可以添加下面这个配置

```yml
spring:
  jms:
    listener:
      acknowledge-mode: client
```

**很可惜，经我测试，这个配置一点用都没有，也可能是我理解错了**

所以只能想其它办法

> 假如现在有个需求，有很多订单在队列中放着等着去处理，但客服就那么多，项目中设置了阈值每个客服的任务池中最多只有10个订单，处理完了再给他分配，这时候就要控制队列的消费签收方式了

**经过测试发现，在springboot项目中如果一个消费者在消费的时候，中间抛异常了，那么这个消息就不会自动签收了**

但这也会有个问题，如果当前只有一个消费者，它来负责消费订单消息，给客服下发任务，这时候如果项目中查询到所有的客服的任务池都满了，那就不应该再消费了，这时候手动的在消费者业务中抛一个异常，然后这条消费就不会被自动签收，但现在就一个消费者，这次没有签收成功，下一条消息又进来了，再查询又没有空闲的客服，又抛一个异常，这就会造成一个死循环，只有在有空闲客服的时候，它才会进行下去，这种现象虽然不会出问题，但作为程序员是不能接受的

我现在能想到的就是在查询到没有空闲客服的时候，手动让这个消费者`睡`上一段时间，然后再抛异常，这样感觉就好多了

当然amq里也有一个延迟消费的设置，也可以将当前消费消费了，然后再往队列中插入一条消费，给它设置上延迟，这样也能解决问题，不过这条消息就会被排到最后再被消费了，**这时候就涉及到另一个问题了 `如何在程序有异常情况的时候还把消息给消费掉`**

处理也很简单，在消费者中处理的业务代码外包一层`try catch`，在 `catch` 里处理异常情况就可以了，当前消息也是会被消费掉的

---

**注意，运行test方法进行测试前要先启动 ActiveMQ**
