---
layout: post
title: SpringCloud学习记录 - Bus
date: 2021-01-14 11:55:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

Bus是啥？

Bus是公交车，在springcloud里意思应该是总线的意思。

Bus解决了啥问题呢？

上一篇里介绍了Config用法，当服务都启动好之后，客户端是可以拿到服务端的配置内容的，但当配置内容被修改了，直接访问服务端获取到的就是修改之后的内容，但在客户端拿到的就还是之前的数据，这是因为Config客户端在获取到服务端配置后，会把数据给缓存下来。既然是缓存就肯定可以更新了，这就是Bus的作用了。

刷新配置缓存有两种方式，一种是通知服务端，让服务端往下分发更新缓存的消息，一种是通知客户端，让客户端互相`感染`，下面介绍的用法是第一种







## 坑

要想暴露出 `/actuator/busrefresh` 接口，就必须要配置 `management.endpoints.web.exposure.include=busrefresh`

这个配置项的值必须为 `bus-refresh` 或者 `busrefresh` 不能写成其它的，且这个配置项还是必须要配置的

## 依赖

bus要依赖队列实现刷新服务端配置项的通知，支持两个队列 `rabbitmq` 和 `kafka`

官方文档上给的例子是rabbitmq，我也就用rabbitmq来测试的

服务端跟客户端都添加下面两个依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## rabbitmq

rabbitmq依赖于erlang，先下载erlang安装并配置环境变量

下载地址：https://erlang.org/download/otp_versions_tree.html

安装后配置 `ERLANG_HOME` 环境变量，指向安装目录即可

在终端里输入 `erl` 能出来版本号就安装好了

然后是下载rabbitmq，rabbitmq有两种，一种是压缩包，一种是exe安装程序，想省事就下载exe安装程序，我这用的是压缩包

下载地址：https://www.rabbitmq.com/install-windows.html

下载好之后解压，运行命令在 `sbin` 里

```bash
# 先安装插件，开启管理程序
.\rabbitmq-plugins.bat enable rabbitmq_management

# 然后启动rabbitmq
.\rabbitmq-server.bat
```

启动成功后界面长这样

![](/assets/images/2021-01-14-13-07-42.png)

浏览器里运行：http://localhost:15672/  用户名密码都是 guest

## 配置

链接文原: [https://atjiu.github.io/2021/01/14/spring-cloud-bus/](https://atjiu.github.io/2021/01/14/spring-cloud-bus/)

添加下面配置

服务端 application.properties

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

# 这个配置是必须的，且值必须为 bus-refresh 或者 busrefresh
# 用其它值或者这个配置项不配置都不行
management.endpoints.web.exposure.include=bus-refresh
```

客户端 application.properties

```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

客户端的启动类上还要加上一个注解 `@RefreshScope`。

> 这个注解应该加在配置类上（就是有`@ConfigurationProperties`注解的类上），当服务端通过队列通知到客户端要更新配置缓存时，客户端就只更新被`@RefreshScope`标注的配置类的缓存，我这案例没有写配置类，就放在启动类上了

分别启动eureka, config, config-client

浏览器访问 http://localhost:18086/getConfig  拿到服务端配置文件的内容后，在git上修改配置文件内容，再次访问这个地址，会发现内容没有变

这时候需要调用一个监听，来刷新缓存

> 我这测试时必须要用postman来调，curl -X POST是不行的，不知道为啥

postman发一个post请求（这个请求消息通知到客户端时，更新的缓存就是被@RefreshScope标注的配置类的缓存），地址：http://localhost:18085/actuator/busrefresh   没有响应结果（不报错就是成功了）

在config-client模块控制台日志里会发现接收到服务端的更新缓存消息

```log
2021-01-14 13:12:47.730  INFO 10376 --- [4GsMYlfOoso7Q-1] o.s.cloud.bus.event.RefreshListener      : Received remote refresh request.
2021-01-14 13:12:47.817  INFO 10376 --- [4GsMYlfOoso7Q-1] c.c.c.ConfigServicePropertySourceLocator : Fetching config from server at : http://DESKTOP-E07LSIA:18085/
2021-01-14 13:12:48.013  INFO 10376 --- [4GsMYlfOoso7Q-1] c.c.c.ConfigServicePropertySourceLocator : Located environment: name=application, profiles=[prod], label=master, version=30afef08e14a058872402571ccd091b9a088c2a2, state=null
2021-01-14 13:12:48.014  INFO 10376 --- [4GsMYlfOoso7Q-1] b.c.PropertySourceBootstrapConfiguration : Located property source: [BootstrapPropertySource {name='bootstrapProperties-configClient'}, BootstrapPropertySource {name='bootstrapProperties-https://gitee.com/tomoya/spring-cloud-config-test.git/file:C:\Users\h\AppData\Local\Temp\config-repo-2154602091380474946\application-prod.properties'}]
2021-01-14 13:12:48.015  INFO 10376 --- [4GsMYlfOoso7Q-1] o.s.boot.SpringApplication               : No active profile set, falling back to default profiles: default
2021-01-14 13:12:48.022  INFO 10376 --- [4GsMYlfOoso7Q-1] o.s.boot.SpringApplication               : Started application in 0.29 seconds (JVM running for 808.066)
2021-01-14 13:12:48.155  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Shutting down DiscoveryClient ...
2021-01-14 13:12:51.158  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Unregistering ...
2021-01-14 13:12:51.160  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : DiscoveryClient_CONFIG-CLIENT/config-client-18086 - deregister  status: 200
2021-01-14 13:12:51.164  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Completed shut down of DiscoveryClient
2021-01-14 13:12:51.165  INFO 10376 --- [4GsMYlfOoso7Q-1] o.s.c.n.eureka.InstanceInfoFactory       : Setting initial instance status as: STARTING
2021-01-14 13:12:51.166  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Initializing Eureka in region us-east-1
2021-01-14 13:12:51.167  INFO 10376 --- [4GsMYlfOoso7Q-1] c.n.d.s.r.aws.ConfigClusterResolver      : Resolving eureka endpoints via configuration
2021-01-14 13:12:51.167  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Disable delta property : false
2021-01-14 13:12:51.167  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Single vip registry refresh property : null
2021-01-14 13:12:51.167  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Force full registry fetch : false
2021-01-14 13:12:51.167  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Application is null : false
2021-01-14 13:12:51.168  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Registered Applications size is zero : true
2021-01-14 13:12:51.168  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Application version is -1: true
2021-01-14 13:12:51.168  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Getting all instance registry info from the eureka server
2021-01-14 13:12:51.176  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : The response status is 200
2021-01-14 13:12:51.176  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Starting heartbeat executor: renew interval is: 30
2021-01-14 13:12:51.177  INFO 10376 --- [4GsMYlfOoso7Q-1] c.n.discovery.InstanceInfoReplicator     : InstanceInfoReplicator onDemand update allowed rate per min is 4
2021-01-14 13:12:51.177  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Discovery Client initialized at timestamp 1610601171177 with initial instances count: 2
2021-01-14 13:12:51.178  INFO 10376 --- [4GsMYlfOoso7Q-1] o.s.c.n.e.s.EurekaServiceRegistry        : Unregistering application CONFIG-CLIENT with eureka with status DOWN
2021-01-14 13:12:51.178  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Saw local status change event StatusChangeEvent [timestamp=1610601171178, current=DOWN, previous=STARTING]
2021-01-14 13:12:51.178  INFO 10376 --- [nfoReplicator-0] com.netflix.discovery.DiscoveryClient    : DiscoveryClient_CONFIG-CLIENT/config-client-18086: registering service...
2021-01-14 13:12:51.178  INFO 10376 --- [4GsMYlfOoso7Q-1] o.s.c.n.e.s.EurekaServiceRegistry        : Registering application CONFIG-CLIENT with eureka with status UP
2021-01-14 13:12:51.179  INFO 10376 --- [4GsMYlfOoso7Q-1] com.netflix.discovery.DiscoveryClient    : Saw local status change event StatusChangeEvent [timestamp=1610601171179, current=UP, previous=DOWN]
2021-01-14 13:12:51.179  INFO 10376 --- [4GsMYlfOoso7Q-1] o.s.cloud.bus.event.RefreshListener      : Keys refreshed []
2021-01-14 13:12:51.185  INFO 10376 --- [nfoReplicator-0] com.netflix.discovery.DiscoveryClient    : DiscoveryClient_CONFIG-CLIENT/config-client-18086 - registration status: 204
2021-01-14 13:12:51.185  INFO 10376 --- [nfoReplicator-0] com.netflix.discovery.DiscoveryClient    : DiscoveryClient_CONFIG-CLIENT/config-client-18086: registering service...
2021-01-14 13:12:51.191  INFO 10376 --- [nfoReplicator-0] com.netflix.discovery.DiscoveryClient    : DiscoveryClient_CONFIG-CLIENT/config-client-18086 - registration status: 204
```

再次访问 http://localhost:18086/getConfig 就会发现配置已经更新了

接链文原: [https://atjiu.github.io/2021/01/14/spring-cloud-bus/](https://atjiu.github.io/2021/01/14/spring-cloud-bus/)

## kafka

既然支持了两种队列，上面用rabbitmq实现了刷新配置缓存功能，顺便来测试一下kafka

下载地址：https://kafka.apache.org/downloads

> kafka依赖zookeeper，不过我现在下载的版本（2.7.0）里已经附带上zookeeper了，不用再单独下载一个zookeeper了

修改配置文件 `conf/zookeeper.properties` 里的 `dataDir`

```properties
dataDir=D:/soft/kafka_2.13-2.7.0/data/tmp/zookeeper # 改成绝对路径
```

和 `conf/server.properties` 里的`log.dirs`

```properties
log.dirs=D:/soft/kafka_2.13-2.7.0/data/tmp/kafka-logs
```

启动：进入bin目录，先启动zookeeper `./zookeeper-server-start.sh ../config/zookeeper.properties` 再启动kafka `./kafka-server-start.sh ../config/server.properties`

修改依赖

```xml
<!--<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bus-kafka</artifactId>
</dependency>
```

服务端与客户端配置文件 application.properties

```properties
# kafka
spring.cloud.stream.kafka.binder.brokers=127.0.0.1:9092

# rabbitmq
#spring.rabbitmq.host=localhost
#spring.rabbitmq.port=5672
#spring.rabbitmq.username=guest
#spring.rabbitmq.password=guest
```

这样就可以了。

## 懒

程序员哪有不懒的，每次服务端更新了配置，还要通过postman发一个post请求，这就太麻烦了，能自动的事，为啥要手动呢？

这时候就要用上git平台的webhook功能了，主流的git平台都是有webhook功能的，当提交代码时就会执行webhook里配置的url，一切都是那么完美
