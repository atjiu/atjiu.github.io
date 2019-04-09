---
layout: post
title: 使用动态代理跟undertow容器实现一个mvc框架，根据请求路径通过代理调用不同的方法执行
date: 2019-04-09 10:19:00
categories: java学习笔记
tags: java
author: 朋也
---

* content
{:toc}

[undertow.io](undertow.io)官网上有一个helloworld版的server demo 代码，相当的简单

想到了java里的动态代理，是不是可以根据请求的地址path，再经过动态代理去执行不同的方法，然后渲染模板返回页面，这不就是一个mvc框架吗

下面来折腾一下

首先要实现一下动态代理







## 创建接口

创建一个接口 `IController.java`

```java
import io.undertow.server.HttpServerExchange;

public interface IController {

  void index(HttpServerExchange exchange);
  void about(HttpServerExchange exchange);

}
```

## 实现接口IController

```java
import co.yiiu.base.IController;
import io.undertow.server.HttpServerExchange;
import io.undertow.util.Headers;

import java.util.Deque;
import java.util.Map;

/**
 * Created by tomoya at 2019/4/9
 */
public class HelloController implements IController {

  @Override
  public void index(HttpServerExchange exchange) {
    exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "text/plain");
    exchange.getResponseSender().send("Index Page");
  }

  @Override
  public void about(HttpServerExchange exchange) {
    exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "text/plain");
    exchange.getResponseSender().send("About Page");
  }
}
```

原链文接：[https://tomoya92.github.io/2019/04/09/mvc-by-dynamic-proxy-and-undertow/](https://tomoya92.github.io/2019/04/09/mvc-by-dynamic-proxy-and-undertow/)

## 创建服务

引入依赖

```xml
<properties>
  <undertow.version>2.0.20.Final</undertow.version>
</properties>
<dependencies>
  <dependency>
    <groupId>io.undertow</groupId>
    <artifactId>undertow-core</artifactId>
    <version>${undertow.version}</version>
  </dependency>
  <dependency>
    <groupId>io.undertow</groupId>
    <artifactId>undertow-servlet</artifactId>
    <version>${undertow.version}</version>
  </dependency>
</dependencies>
```

下面是undertow官网上的代码

```java
public class HelloWorldServer {

    public static void main(final String[] args) {
        Undertow server = Undertow.builder()
                .addHttpListener(8080, "localhost")
                .setHandler(new HttpHandler() {
                    @Override
                    public void handleRequest(final HttpServerExchange exchange) throws Exception {
                        exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "text/plain");
                        exchange.getResponseSender().send("Hello World");
                    }
                }).build();
        server.start();
    }
}
```

稍微改造一下

```java
import co.yiiu.base.IController;
import io.undertow.Undertow;
import io.undertow.util.Headers;

import java.io.IOException;
import java.lang.reflect.Proxy;

public class HelloServer {

  public static void main(final String[] args) throws IOException {
    Undertow server = Undertow.builder()
        .addHttpListener(8080, "localhost")
        .setHandler(exchange -> {
          // 获取请求路径
          String path = exchange.getRequestPath();
          // 创建被代理类的代理对象
          DynamicProxy proxy = new DynamicProxy(new HelloController());
          // 获取被代理类的实例
          IController o = (IController) Proxy.newProxyInstance(IController.class.getClassLoader(), new Class[]{IController.class}, proxy);
          // 通过请求地址来判断走哪个方法
          if (path.equalsIgnoreCase("/index") || path.equalsIgnoreCase("/")) {
            o.index(exchange);
          } else if (path.equalsIgnoreCase("/about")) {
            o.about(exchange);
          } else {
            // 如果没有，就404，指定response的status为404
            exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "text/plain");
            exchange.getResponseHeaders().put(Headers.STATUS, 404);
            exchange.getResponseSender().send("404");
          }
        }).build();
    server.start();
  }
}
```

## 获取请求参数

原链接文：[https://tomoya92.github.io/2019/04/09/mvc-by-dynamic-proxy-and-undertow/](https://tomoya92.github.io/2019/04/09/mvc-by-dynamic-proxy-and-undertow/)

请求参数分为三种，query, params, body

在undertow里有两个方法 `getPathParameters()` `getQueryParameters()` 两个方法可以获取 params, query 两种类型的参数

```java
public void index(HttpServerExchange exchange) {
  Map<String, Deque<String>> pathParameters = exchange.getPathParameters();
  Map<String, Deque<String>> queryParameters = exchange.getQueryParameters();
  System.out.println(pathParameters.toString());
  System.out.println(queryParameters.toString());
  exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "text/plain");
  exchange.getResponseSender().send(String.format("Index Page\nqueryParameters: %s", queryParameters.toString()));
}
```

怎么获取body类型的参数我还不清楚

## 测试

![](/assets/mvc-by-undertow-dynamic-proxy.gif)

## 总结

1. java自带的动态代理只能代理实现了接口的类，如果一个类没有实现某个接口，动态代理是没法代理的，这就不太好了，写一个controller，还要去事先定义好接口，不好
2. 我上面折腾的是通过路径判断来转到不同的代理方法去处理逻辑，这种手动的方式也不太好，如果能在程序启动的时候自动扫描controller类以及方法，参数返回值等，就可以自动的去匹配了，也就不用写一堆的if else了
3. 动态代理来解析还有个好处，可以在方法里执行完逻辑，然后返回一个结果，代理完成后，拿到结果再去处理模板逻辑，这样就可以将controller跟模板分离了
4. cglib也是个代理工具，不知道是不是也需要实现接口的类才能代理，继续折腾...

写博客不易，转载请保留原文链接，谢谢!