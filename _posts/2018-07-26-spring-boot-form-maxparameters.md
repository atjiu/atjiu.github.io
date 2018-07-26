---
layout: post
title: 解决SpringBoot项目里提交表单字段超过1000个异常 The number of parameters exceeded the maximum of 1000
categories: spring-boot学习笔记
tags: form max-parameters
author: 朋也
---

* content
{:toc}

java web容器在提交表单的时候有个保护机制，当表单字段超过1000个的时候会抛一个异常 `The number of parameters exceeded the maximum of 1000` 这么奇葩的问题居然被我碰到了，下面说一下解决办法，此方法适用 `tomcat`, `jetty`, `undertow`

1. 减少字段数（跟没说一样，如果可以少点，就不会碰到这个问题了）
2. 在项目里配置一下容器的 `MAX_PARAMETERS` 参数，默认是1000，给设置大点就好了

```java
// 项目用的是undertow容器，下面是undertow的配置方法

@Bean
public UndertowEmbeddedServletContainerFactory undertowEmbeddedServletContainerFactory() {
  UndertowEmbeddedServletContainerFactory undertowFactory = new UndertowEmbeddedServletContainerFactory();
  undertowFactory.addBuilderCustomizers(builder -> {
      builder.setServerOption(UndertowOptions.MAX_PARAMETERS, 10000);
  });
  return undertowFactory;
}
```

这段代码可以放在项目里任何地方，前提是要能被spring给扫描到，另外两个容器配置方法差不多，改一下方法名就可以了

配置好了，重启服务器这个异常就消失了
