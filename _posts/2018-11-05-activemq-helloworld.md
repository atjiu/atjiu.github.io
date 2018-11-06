---
layout: post
title: ActiveMQ学习-HelloWorld (1)
date: 2018-11-05 19:39:00
categories: ActiveMQ学习笔记
tags: activemq
author: 朋也
---

* content
{:toc}

## 安装ActiveMQ

[ActiveMQ官网](http://activemq.apache.org/) 下载ActiveMQ

解压，进入 `bin` 运行

```sh
cd [activemq_install_dir]/bin
./activemq console
```

我用的是MAC，还可以使用homebrew安装, 我这里用的是 `5.15.7` 版本

```sh
brew install apache-activemq
# 启动
activemq console
```

浏览器访问 http://localhost:8161/admin/ 用户名密码都是 `admin`





## Java程序调用

Java调用分以下几步(提供者，消费者都一样)

1. 创建连接工厂
2. 从工厂里拿一个连接
3. 从连接中获取Session(会话)
4. 从会话中获取目的地(Destination)消费者会从这个目的地取消息
5. 从会话中创建消息提供者
6. 从会话中创建文本消息(也可以创建其它类型的消息体)
7. 通过消息提供者发送消息到ActiveMQ
8. 关闭连接

新建Maven项目，引入 ActiveMQ 依赖

```xml
<dependency>
  <groupId>org.apache.activemq</groupId>
  <artifactId>activemq-core</artifactId>
  <version>5.7.0</version>
</dependency>
```

消息提供者 Producer
```java
public class Producer {

  public static void main(String[] args) throws JMSException {
    // ActiveMQConnectionFactory.DEFAULT_USER 与 ActiveMQConnectionFactory.DEFAULT_PASSWORD 是连接AMQ的默认用户名与密码，可以在AMQ的配置文件里修改
    // 地址连接使用 tcp 端口是61616
    ConnectionFactory connectionFactory = new ActiveMQConnectionFactory(
        ActiveMQConnectionFactory.DEFAULT_USER,
        ActiveMQConnectionFactory.DEFAULT_PASSWORD,
        "tcp://localhost:61616"
    );

    Connection connection = connectionFactory.createConnection();
    connection.start();

    // 如果session不支持事件，就是FALSE，支持事务就是true，如果开启事务要在关闭连接之前 commit() 一下，否则消息不会进入到 AMQ
    // AUTO_ACKNOWLEDGE 表示自动消费，除此还有手动消费
    Session session = connection.createSession(Boolean.FALSE, Session.AUTO_ACKNOWLEDGE);
    Destination destination = session.createQueue("amq-demo");

    MessageProducer producer = session.createProducer(null);

    for (int i = 0; i < 100; i++) {
      TextMessage msg = session.createTextMessage("提供消息" + i);
      producer.send(destination, msg);
    }

    connection.close();
  }
}
```

消息消费者 Consumer
```java
public class Consumer {

  public static void main(String[] args) throws JMSException {
    // 跟Producer一样创建连接工厂
    ConnectionFactory connectionFactory = new ActiveMQConnectionFactory(
        ActiveMQConnectionFactory.DEFAULT_USER,
        ActiveMQConnectionFactory.DEFAULT_PASSWORD,
        "tcp://localhost:61616"
    );

    Connection connection = connectionFactory.createConnection();
    connection.start();

    Session session = connection.createSession(Boolean.FALSE, Session.AUTO_ACKNOWLEDGE);

    Destination destination = session.createQueue("amq-demo");
    MessageConsumer consumer = session.createConsumer(destination);

    while(true) {
      // receive() 方法当没有消息的时候会阻塞在这，等待提供者提供消息，后面介绍使用监听来获取消息
      TextMessage msg = (TextMessage) consumer.receive();
      System.out.println("消费消息：" + msg.getText());
    }
  }
}
```