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

## Sentinel

hystric不更新后，对服务的熔断，降级，限流等操作现在大都使用alibaba/sentinel

首先下载一个sentinel的控制台，下载地址：https://github.com/alibaba/Sentinel/releases

启动控制台 `java -jar sentinel-dashboard-1.8.0.jar` 启动成功后浏览器访问: http://localhost:8080 用户名密码都是 `sentinel`

登录成功可以看到如下界面

![](/assets/2021-02-02-09-22-46.png)

接下来创建一个模块，让sentinel来监控这个服务的运行情况

服务名：nacos-sentinel

依赖：

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
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>
</dependencies>
```

配置文件 application.properties

```properties
server.port=28084

spring.application.name=nacos-sentinel

spring.cloud.nacos.discovery.server-addr=localhost:8848

# sentinel配置
spring.cloud.sentinel.transport.dashboard=localhost:8080
spring.cloud.sentinel.transport.port=8719

management.endpoints.web.exposure.include=*
```

启动类 NacosSentinelApplication.java

```java
package com.example.springcloudtutorial;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableDiscoveryClient
@RestController
public class NacosSentinelApplication {

    @GetMapping("/test")
    @SentinelResource("test")
    public Object test() {
        return "success";
    }

    public static void main(String[] args) {
        SpringApplication.run(NacosSentinelApplication.class, args);
    }
}
```

启动服务，并浏览器访问：http://localhost:28084/test 多刷新几次，打开sentinel的控制台，就可以看到监控数据了

![](/assets/2021-02-02-10-44-41.png)

## Sentinel 流控规则

![](/assets/2021-02-02-11-23-49.png)

阈值类型

- QPS: query per second 每秒的请求数量
- 线程数：浏览器每开一个标签页访问就是一个线程

后面配置上阈值数量

流控模式有三种

- 直接：字面意思，当选择QPS时，阈值设置为1，表示1s内只能有一个请求，超过的话，就要被限流
- 关联：当关联的资源达到设置的阈值时，会对最上面那个资源名进行限流，举个例子，就是在购物网站上买东西时，下单后，结算服务开始运行，当结算服务处理量达到阈值时，则对下单服务进行限流。最上面的资源名就是下单服务，下面的关联资源就是结算服务
- 链路：这个东西我的理解是假如有两个服务同时调用一个接口，然后这个接口上被标注了@SentinelResource("资源名")注解后，那么这个链路就能起作用了，关联资源设置成被@SentinelResource标注的资源名，最上面资源名配置上其中某个服务的资源名，那么当两个服务都同时对关联资源调用且达到阈值后，则会对最上面配置的资源名进行限流，而不会对没有配置的服务进行限流。举个例子：两个服务 `/test1` `/test2` 都请求一个接口 `doStuff()` 在sentinel控制台里配置上链路限流只针对`/test1`这个服务进行限流，那么当触发限流机制时，就只有 `/test1` 服务会被限流，`/test2` 还能正常运行

流控效果

- 快速生效：字面意思，当触发限流规则时，立即生效
- Warm Up：预热机制，举个例子，当QPS设置为10时，预热时长设置为5，当有大量并发过来时，默认冷却因子是3（写死在代码里的）那么在第一秒就只能处理10/3个请求，一直到5s后，处理量才能达到设置的阈值10/s
- 排除等待：字面意思，如果超时时间设置成10000ms且QPS设置成1, 那么当一次性有很多并发过来时, 服务在10s内会隔1s执行一个请求,其它没被执行到的会在那排除等着,如果发起的请求在10s内执行不完的话,就会触发限流

## Sentinel 降级规则

![](/assets/2021-02-02-11-56-17.png)

熔断策略

- 慢调用比例 (SLOW_REQUEST_RATIO)：选择以慢调用比例作为阈值，需要设置允许的慢调用 RT（即最大的响应时间），请求的响应时间大于该值则统计为慢调用。当单位统计时长（statIntervalMs）内请求数目大于设置的最小请求数目，并且慢调用的比例大于阈值，则接下来的熔断时长内请求会自动被熔断。经过熔断时长后熔断器会进入探测恢复状态（HALF-OPEN 状态），若接下来的一个请求响应时间小于设置的慢调用 RT 则结束熔断，若大于设置的慢调用 RT 则会再次被熔断。
- 异常比例 (ERROR_RATIO)：当单位统计时长（statIntervalMs）内请求数目大于设置的最小请求数目，并且异常的比例大于阈值，则接下来的熔断时长内请求会自动被熔断。经过熔断时长后熔断器会进入探测恢复状态（HALF-OPEN 状态），若接下来的一个请求成功完成（没有错误）则结束熔断，否则会再次被熔断。异常比率的阈值范围是 [0.0, 1.0]，代表 0% - 100%。
- 异常数 (ERROR_COUNT)：当单位统计时长内的异常数目超过阈值之后会自动进行熔断。经过熔断时长后熔断器会进入探测恢复状态（HALF-OPEN 状态），若接下来的一个请求成功完成（没有错误）则结束熔断，否则会再次被熔断。

## Sentinel 热点规则

官方文档：https://github.com/alibaba/Sentinel/wiki/%E7%83%AD%E7%82%B9%E5%8F%82%E6%95%B0%E9%99%90%E6%B5%81

何为热点？热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频次最高的 Top K 数据，并对其访问进行限制。比如：

- 商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制
- 用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制

热点参数限流会统计传入参数中的热点参数，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，仅对包含热点参数的资源调用生效。

![](/assets/2021-02-02-13-36-43.png)

用法如下：

```java
@GetMapping("/test")
@SentinelResource(value = "test", blockHandler = "test_blockHandler", fallback = "test_fallback")
public Object test(String name, Integer age) {
//        int a = 10 / 0;
    return "success";
}

// 当被热点规则限流后的处理方法
public Object test_blockHandler(String name, Integer age, BlockException exception) {
    return "test_blockHandler...";
}

// 当程序运行时异常后的处理方法
public Object test_fallback(String name, Integer age) {
    return "test_fallback...";
}
```

sentinel配置如下

![](/assets/2021-02-02-13-38-42.png)

- 资源名就是 @SentinelResource 注解里的value值
- 参数索引则是 test() 方法的参数索引，第一个参数索引为0
- 参数例外项里还可以对某一个参数进行特殊配置，截图中的配置意思为参数类型为String的参数(就是name)，当传的值为`hello`时，限流阈值则为10次/s,其它值则还是上面配置的1次/s

@SentinelResource里还配置了两个参数

- blockHandler：当规则被触发后，如果不配置这个属性，则会直接抛出一个错误页面，这个参数指定的方法(test_blockHandler)参数必须要跟(test)方法一样，且后面还要加上`BlockException exception`参数且这个方法名还不能是`blockHandler`
- 另一个fallback参数的意思就跟hystric里的fallback意思是一样的了，意思是当这个服务出现了运行时异常时，给的一个默认的方法

另外@SentinelResource注解除了能指定默认的处理方法外还能配置上单独的类，然后指定类中的方法来作为默认的处理方法，比如

MyFallbackHandler.java

```java
package com.example.springcloudtutorial;

import com.alibaba.csp.sentinel.slots.block.BlockException;

public class MyFallbackHandler {

    public Object test_blockHandler(String name, Integer age, BlockException exception) {
        System.out.println(exception.getMessage());
        return "test_blockHandler...";
    }

    public Object test_fallback(String name, Integer age) {
        return "test_fallback...";
    }
}
```

```java
@GetMapping("/test")
@SentinelResource(
        value = "test",
        fallbackClass = MyFallbackHandler.class,
        fallback = "test_fallback",
        blockHandlerClass = MyFallbackHandler.class,
        blockHandler = "test_blockHandler"
)
public Object test(String name, Integer age) {
//        int a = 10 / 0;
    return "success";
}
```

## 集成Openfeign

新建模块 nacos-openfeign

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
    <dependency>
        <groupId>com.alibaba.cloud</groupId>
        <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
</dependencies>
```

配置文件 application.properties

```properties
server.port=28085

spring.application.name=nacos-openfeign

# 服务注册中心
spring.cloud.nacos.discovery.server-addr=localhost:8848

# sentinel配置
spring.cloud.sentinel.transport.dashboard=localhost:8080
spring.cloud.sentinel.transport.port=8719

# 打开 sentinel 支持
feign.sentinel.enabled=true
```

启动类

```java
package com.example.springcloudtutorial;

import com.example.springcloudtutorial.service.ProviderService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@RestController
public class NacosOpenfeignApplication {

    @Resource
    private ProviderService providerService;

    @GetMapping("/consumer/getOrder")
    public Object getOrder() {
        return providerService.getOrder();
    }

    public static void main(String[] args) {
        SpringApplication.run(NacosOpenfeignApplication.class, args);
    }
}
```

ProviderService.java

```java
package com.example.springcloudtutorial.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(value = "nacos-provider", fallback = ProviderServiceImpl.class)
public interface ProviderService {

    @GetMapping("/getOrder")
    public Object getOrder();
}

```

openfeign支持的fallback默认实现

```java
package com.example.springcloudtutorial.service;

import org.springframework.stereotype.Component;

@Component
public class ProviderServiceImpl implements ProviderService {
    @Override
    public Object getOrder() {
        return "ProviderServiceImpl -- getOrder";
    }
}

```

启动一个nacos-provider，并启动当前模块，浏览器访问：http://localhost:28085/getOrder 即可进行测试

另外因为集成了sentinel，还可以在sentinel控制台里配置限流规则，用于测试限流时的fallback默认实现

> 说一下这里面的坑，之前学 spring-cloud 配置中心的时候，因为spring-cloud版本问题将 spring-boot版本从 `2.2.2.RELEASE` 升级到 `2.4.1` spring-cloud的版本从 `Hoxton.SR9` 升级到 `2020.0.0` 才解决报错问题，详情可以参见：https://atjiu.github.io/2021/01/11/spring-cloud-config/
>
> 当我继续使用升级后的spring-cloud与spring-boot版本配置spring-cloud-alibaba里的openfeign与sentinel时，一直报 `Caused by: java.lang.IllegalStateException: No Feign Client for loadBalancing defined. Did you forget to include spring-cloud-starter-loadbalancer?` 这个异常，一直没找到解决办法，直到我把版本号又降回去后，它神奇的好使了。。

