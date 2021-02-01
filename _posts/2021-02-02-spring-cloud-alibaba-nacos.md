---
layout: post
title: SpringCloud学习记录 - Nacos
date: 2021-02-02 13:56:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

Nacos是啥？

Nacos是alibaba将不在更新的 config, ribbon, bus等模块给整合的一个包，并且在维护更新，相当于以后用config或者负载均衡等服务就只需要引入一个nacos就够了





## Hello World

首先下载nacos，官网：https://nacos.io/zh-cn/docs/quick-start.html

> 本文用的版本是 1.4.0

启动成功后，访问：http://localhost:8848/nacos/index.html 用户名: nacos 密码: nacos

接下来创建项目, 我这创建了两个服务提供者用于测试

nacos-provider1

依赖

```xml
<!-- 这个依赖是配置在根目录下的pom.xml里的 -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-dependencies</artifactId>
    <version>2.1.0.RELEASE</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>

<!-- 下面是模块里的依赖 -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
</dependencies>
```

application.properties

```properties
server.port=28081

spring.application.name=nacos-provider

spring.cloud.nacos.discovery.server-addr=localhost:8848

management.endpoints.web.exposure.include=*
```

启动类 NacosProvider1Application.java

```java
package com.example.springcloudtutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient // 一定要加上这个注解, 否则nacos发现不了服务
@SpringBootApplication
public class NacosProvider1Application {

    public static void main(String[] args) {
        SpringApplication.run(NacosProvider1Application.class, args);
    }

}
```

第二个服务的端口为 28082

分别启动两个服务, 然后打开nacos的控制台

![](/assets/2021-02-01-14-09-50.png)

## 负载均衡

nacos自带了负载均衡的功能，原因是它把ribbon给引入了

![](/assets/2021-02-01-14-11-08.png)

下面实现一下负载均衡

先在两个服务提供者中添加上一个服务

```java
package com.example.springcloudtutorial;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@EnableDiscoveryClient
@SpringBootApplication
@RestController
public class NacosProvider1Application {

    @Value("${server.port}")
    private int port;

    @GetMapping("/getOrder")
    public Object getOrder() {
        return "order list " + port;
    }

    public static void main(String[] args) {
        SpringApplication.run(NacosProvider1Application.class, args);
    }
}
```

创建消费者模块 nacos-consumer

依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
</dependencies>
```

配置文件

```properties
server.port=28083

spring.application.name=nacos-consumer

spring.cloud.nacos.discovery.server-addr=localhost:8848

management.endpoints.web.exposure.include=*
```

启动类

```java
package com.example.springcloudtutorial;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class NacosConsumerApplication {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @GetMapping("/consumer/getOrder")
    public Object getOrder() {
        return restTemplate().getForEntity("http://nacos-provider/getOrder", String.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(NacosConsumerApplication.class, args);
    }
}
```

消费者中请求的地址写的是 `http://nacos-provider` 这个 `nacos-provider` 就是服务提供者的 `spring.application.name`

在注入 `restTemplate` 的时候添加上 `@LoadBalanced` 实现负载均衡的实现，默认是轮询

分别启动服务，nacos控制台里可以看到有2个服务提供者，一个服务消费者

![](/assets/2021-02-01-14-45-41.png)

浏览器访问 `http://localhost:/consumer/getOrder` 不停的刷新会看到输出的端口是轮换输出的

## 配置管理Config

nacos控制台自带了配置文件编写发布的功能

![](/assets/2021-02-01-16-39-19.png)

打开配置页面如下

![](/assets/2021-02-01-16-40-05.png)

其中 dataId 配置规则是 `${prefix}-${spring.profiles.active}.${file-extension}`

- prefix 默认为 spring.application.name 的值，也可以通过配置项 spring.cloud.nacos.config.prefix来配置。
- spring.profiles.active 即为当前环境对应的 profile
- file-exetension 为配置内容的数据格式，可以通过配置项 spring.cloud.nacos.config.file-extension 来配置。目前只支持 properties 和 yaml 类型。

创建一个配置文件，名为：nacos-consumer-dev.properties 内容如下，然后保存发布

```properties
site.name=nacos-consumer,version=1
```

在模块 nacos-consumer1 里添加下面依赖

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

> 其中这个依赖 `spring-cloud-starter-bootstrap` 必须要加，如果不加的话，`bootstrap.properties` 文件将不加载

application.properties 修改如下

```properties
spring.profiles.active=dev
server.port=28083
```

新建 bootstrap.properties

```properties
spring.application.name=nacos-consumer

spring.cloud.nacos.discovery.server-addr=localhost:8848

spring.cloud.nacos.config.server-addr=localhost:8848
spring.cloud.nacos.config.file-extension=properties
spring.cloud.nacos.config.prefix=${spring.application.name}

management.endpoints.web.exposure.include=*
```

启动类上添加 `@RefreshScope` 注解用来更新修改的配置信息，同时获取一下配置文件里的值

```java
package com.example.springcloudtutorial;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
@RefreshScope
public class NacosConsumerApplication {

    @Value("${site.name:}")
    private String name;

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @GetMapping("/consumer/getOrder")
    public Object getOrder() {
        return restTemplate().getForEntity("http://nacos-provider/getOrder", String.class).getBody() + " " + name;
    }

    public static void main(String[] args) {
        SpringApplication.run(NacosConsumerApplication.class, args);
    }
}
```

浏览器访问：http://localhost:28083/consumer/getOrder  输出内容 `order list 28082 nacos-consumer,version=1`

去nacos控制台里修改一下配置文件内容后保存发布，回到IDE,会看到已经通知到项目刷新配置信息了

![](/assets/2021-02-01-16-48-09.png)

再次访问，输出的 `site.name` 内容也是最新的了

上面介绍了dataid的配置规则跟项目中的配置，nacos除了dataid还提供了两个划分环境的变量，group，namespace

在nacos控制台上创建配置文件的时候，有个选项默认值是 DEFAULT_GROUP, 通过更改这个值就可以将配置文件分配到不同的组中，在项目中只需要通过 `spring.cloud.nacos.config.group=DEFAULT_GROUP` 来指定不同的组即可

## 命名空间 namespace

在上一小段里说到了配置文件有三个变量，其中dataid和group都介绍了，还剩一个namespace,单独拿出来介绍是因为服务（不止配置中区分）也可以区分命名空间

首先在控制台上创建一个namespace

![](/assets/2021-02-01-17-10-33.png)

然后复制命名空间ID，贴到项目中的配置文件里，对应的配置项如下

```properties
# 服务的namespace
spring.cloud.nacos.discovery.namespace=58ee0281-11e6-4ffe-90f2-e84f00d15bb0

# 配置文件的namespace
spring.cloud.nacos.config.namespace=58ee0281-11e6-4ffe-90f2-e84f00d15bb0
```

> 注意，如果服务配置了命名空间，那么互相调用的服务都要保持在一个命名空间里才能被发现到

## MySQL

nacos默认数据存储在一个内置的数据库里（derby），下面介绍一下怎么切换到MySQL数据库

官方文档：https://nacos.io/zh-cn/docs/deployment.html

首先创建一个数据库，名为: nacos-config, 然后打开nacos安装目录下的 conf 文件夹，找到 `nacos-mysql.sql` 文件直接在数据库里执行即可

最后找到 conf/application.properties 文件，在最下面添加下面配置即可,**注意数据库名密码要换成自己的**

```properties
spring.datasource.platform=mysql

db.num=1
db.url.0=jdbc:mysql://localhost:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user=root
db.password=123123
```

重启nacos即可

