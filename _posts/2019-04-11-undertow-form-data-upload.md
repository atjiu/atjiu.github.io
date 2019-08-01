---
layout: post
title: undertow作为容器，怎么接收form-data请求数据和怎么上传图片
date: 2019-04-11 16:33:00
categories: java学习笔记
tags: java
author: 朋也
---

* content
{:toc}

网上到处都是拿undertow跟jetty、tomcat比较的文章，但undertow用法的文章基本上没有，一大悲哀。。

在网上到处搜，总结一下接收form-data参数的方法，另外上传也同样实现了






## 创建服务

[undertow.io](https://undertow.io) 官网上的demo就可以

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

## 添加FormDataParser

稍微修改一下 `HttpHandler`

原链接文：[https://blog.yiiu.co/2019/04/11/undertow-form-data-upload/](https://blog.yiiu.co/2019/04/11/undertow-form-data-upload/)

```java
Undertow server = Undertow.builder()
  .addHttpListener(8080, "localhost")
  .setHandler(new HttpHandler() {
    @Override
    public void handleRequest(final HttpServerExchange exchange) throws Exception {
      FormDataParser parser = FormParserFactory.builder().build().createParser(exchange);
      FormData data = parser.parseBlocking();
      for (String d : data) {
        Deque<FormData.FormValue> formValues = data.get(d);
        // 判断formValue是不是文件
        if (formValues.getFirst().isFileItem()) {
          FormData.FileItem fileItem = formValues.getFirst().getFileItem();
          // 获取文件名，这种方式获取的是原文件名，带后缀的
          // 还可以从formValues.getFirst().getFileItem().getFile().getFileName()里获取文件名，不过这个文件名已经被重新命名了，而且还不带后缀
          String fileName = formValues.getFirst().getFileName();
          // 创建一个输出流，将文件保存到本地
          FileOutputStream fos = new FileOutputStream(new File("/Users/hh/git/github/pymvc/" + fileName));
          // 保存文件
          Files.copy(fileItem.getFile(), fos);
          fos.close();
          System.out.println(fileName);
        } else {
          System.out.println("参数名：" + d + " 值：" + formValues.getFirst().getValue());
        }
      }
      exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "text/plain");
      exchange.getResponseSender().send("Hello World");
    }
  }).build();
```

## 测试

启动服务，使用postman发起一个post请求，请求内容类型是 `form-data` ，参数里添加一个文件的类型，选择一个文件，然后发送请求，会发现会报错

```
Caused by: java.lang.IllegalStateException: UT000035: Cannot get stream as startBlocking has not been invoked
```

翻译过来就是 `无法获取流，因为尚未调用startBlocking` 这时只需要在 `HttpHandler` 外再套一层 `BlockingHandler` 即可，如下

```java
public class HelloWorldServer {
  public static void main(final String[] args) {
    Undertow server = Undertow.builder()
      .addHttpListener(8080, "localhost")
      .setHandler(new BlockingHandler(new HttpHandler() {  } )).build();
    server.start();
  }
}
```

再次发送请求就没问题了

## 参考

- [https://stackoverflow.com/questions/37839418/multipart-form-data-example-using-undertow](https://stackoverflow.com/questions/37839418/multipart-form-data-example-using-undertow)

写博客不易，转载请保留原文链接，谢谢!