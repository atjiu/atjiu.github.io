---
layout: post
title: Java里观察者模式(订阅发布模式)
date: 2019-04-08 15:11:00
categories: java学习笔记
tags: java
author: 朋也
---

* content
{:toc}

在公司开发项目，如果碰到一些在特定条件下触发某些逻辑操作的功能的实现基本上都是用的定时器

比如用户注册完后，发送邮件，为了防止邮件发送失败或者发送邮件比较耗时，一般也都是通过定时器去扫库里注册没有发邮件的用户数据

再比如一个订单，在改变状态后，要归档，这也是通过定时器来实现的，扫描订单的数据，通过判断状态来做相对应的处理

但这样处理的话，定时器就会越来越多，总觉得不太好

然后，从一些资讯网站上的订阅功能想到了是否可以使用java里的观察者模式来解决这个问题，比如定单的状态改变了，这是一个主题，直接通知订阅这个主题的实现类来处理这个订单，这样不是更方便吗，于是从观察者模式入手，折腾了一下






## 创建主题（Subject）接口

定义主题的接口

```java
package co.yiiu;

/**
 * Created by tomoya at 2019/4/8
 */
public interface Subject {

  // 设置主题内容
  void setContent(String content);

  // 获取主题内容
  String getContent();

  // 添加订阅者
  void attach(Observer observer);

  // 删除订阅者
  void detach(Observer observer);

  // 发布消息
  void publish();
}
```

## 创建订阅者（Observer）接口

```java
package co.yiiu;

/**
 * Created by tomoya at 2019/4/8
 */
public interface Observer {

  // 订阅主题
  void subscribe(Subject subject);

  // 取消订阅
  void unsubscribe(Subject subject);

  // 处理订阅的消息
  void update(Subject subject);
}
```

原链文接：[https://tomoya92.github.io/2019/04/08/java-subscribe-publish/](https://tomoya92.github.io/2019/04/08/java-subscribe-publish/)

## 实现主题

我这里实现了两个主题

- `NewsSubject` 新闻主题，订阅了这个主题的观察者可以获取这个主题更新的新闻内容
- `WeatherSubject` 天气主题，订阅了这个主题的观察者可以获取这个主题发布的天气情况

具体代码如下

```java
package co.yiiu;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by tomoya at 2019/4/8
 */
public class NewsSubject implements Subject {

  private String content;
  private List<Observer> observers = new ArrayList<>();

  @Override
  public String getContent() {
    return content;
  }

  @Override
  public void setContent(String content) {
    this.content = content;
  }

  // 添加观察者
  @Override
  public void attach(Observer observer) {
    observers.add(observer);
  }

  // 删除观察者
  @Override
  public void detach(Observer observer) {
    observers.remove(observer);
  }

  // 通知观察者
  @Override
  public void publish() {
    observers.forEach(observer -> observer.update(this));
  }
}
```

```java
package co.yiiu;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by tomoya at 2019/4/8
 */
public class WeatherSubject implements Subject {

  private String content;
  private List<Observer> observers = new ArrayList<>();

  @Override
  public String getContent() {
    return content;
  }

  @Override
  public void setContent(String content) {
    this.content = content;
  }

  @Override
  public void attach(Observer observer) {
    observers.add(observer);
  }

  @Override
  public void detach(Observer observer) {
    observers.remove(observer);
  }

  @Override
  public void publish() {
    observers.forEach(observer -> observer.update(this));
  }
}
```

文原链接：[https://tomoya92.github.io/2019/04/08/java-subscribe-publish/](https://tomoya92.github.io/2019/04/08/java-subscribe-publish/)

## 实现观察者

我这写了一个通用的实现，创建观察者的时候，传递一个名字表示不同的观察者

```java
package co.yiiu;

/**
 * Created by tomoya at 2019/4/8
 */
public class ConcreteObserver implements Observer {

  private String name;

  public ConcreteObserver(String name) {
    this.name = name;
  }

  @Override
  public void subscribe(Subject subject) {
    subject.attach(this);
  }

  @Override
  public void unsubscribe(Subject subject) {
    subject.detach(this);
  }

  @Override
  public void update(Subject subject) {
    System.out.println(this.name + " 订阅的内容: " + subject.getContent());
  }
}
```

## 测试

```java
package co.yiiu;

import org.junit.Test;

/**
 * Created by tomoya at 2019/4/8
 */
public class TestObserver {


  @Test
  public void test() {
    // 创建主题对象
    Subject newsSubject = new NewsSubject();
    Subject weatherSubject = new WeatherSubject();

    // 给主题赋值
    newsSubject.setContent("我是一条新闻消息");
    weatherSubject.setContent("我是一条天气消息");

    // 创建订阅者
    Observer concreteObserver1 = new ConcreteObserver("用户1");
    // 订阅newsSubject
    concreteObserver1.subscribe(newsSubject);

    Observer concreteObserver2 = new ConcreteObserver("用户2");
    // 订阅newsSubject和weatherSubject
    concreteObserver2.subscribe(newsSubject);
    concreteObserver2.subscribe(weatherSubject);

    Observer concreteObserver3 = new ConcreteObserver("用户3");
    // 订阅weatherSubject
    concreteObserver3.subscribe(newsSubject);
    concreteObserver3.subscribe(weatherSubject);

    // user2 取消订阅newsSubject
    concreteObserver2.unsubscribe(newsSubject);

    // 发布消息
    newsSubject.publish();
    weatherSubject.publish();

  }
}
```

运行结果

```log
用户1 订阅的内容: 我是一条新闻消息
用户3 订阅的内容: 我是一条新闻消息
用户2 订阅的内容: 我是一条天气消息
用户3 订阅的内容: 我是一条天气消息
```

## 总结

有了这个订阅发布模式了，就可以解决类似订单状态改变后的处理逻辑了

1. 创建一个订单主题
2. 创建一个观察者来订阅这个订单主题
3. 当订单状态有变化时，通过订单主题发布这个订单
4. 这时候只要订阅了这个订单主题的观察者就能收到消息，然后就可以处理这个状态有变化的订单了

-----

java.util 包里也有 `Observable` `Observer`

不过它是通过被观察者主动添加观察者来实现的，当有消息了，调用 `notifyObservers()` 方法来通知观察者

这种做法还需要被观察者去维护观察者，不太好，还不如让观察者主动去订阅干脆


写博客不易，转载请保留原文链接，谢谢!