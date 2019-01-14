---
layout: post
title: Spring-Boot集成Dubbo相关配置总结
date: 2019-01-12 11:46:00
categories: spring-boot学习笔记
tags: spring-boot dubbo
author: 朋也
---

* content
{:toc}

> 上一篇博客使用springboot集成搭建了一个dubbo服务，这篇博客来总结一下dubbo的相关配置

## 配置文件加载顺序

从上到下配置优先级顺序

1. 使用 -D 参数启动，springboot开发的项目可以打成jar包，然后使用 `java -jar xxx.jar` 的形式来启动，当然也可以在命令后面指定参数，比如 `java -jar -Ddubbo.protocol.port=20880 xxx.jar` 的形式来指定通信协议的端口，这种优先级是最高的
2. dubbo.xml配置文件次之
3. dubbo.properties 文件最后

一般整合springboot与dubbo，配置都会在 application.yml 里配置，如果想另外配置可以通过第一种方式写一个脚本指定线上环境的相关配置，其实也可以通过springboot的配置文件加载顺序来配置开发环境跟线上环境的不同





## 启动检查

官方文档说明如下

> Dubbo 缺省会在启动时检查依赖的服务是否可用，不可用时会抛出异常，阻止 Spring 初始化完成，以便上线时，能及早发现问题，默认 check="true"。
>
> 可以通过 check="false" 关闭检查，比如，测试时，有些服务不关心，或者出现了循环依赖，必须有一方先启动。

> 另外，如果你的 Spring 容器是懒加载的，或者通过 API 编程延迟引用服务，请关闭 check，否则服务临时不可用时，会抛出异常，拿到 null 引用，如果 check="false"，总是会返回引用，当服务恢复时，能自动连上。

也就是说把启动检查关了，就可以避免消费端**启动服务的时候**因为连不上服务提供者而报错了

这个配置有好有坏，开发环境下比较好，如果把启动检查关了，可以避免开发本地功能时还要一直开着服务提供者了，不过如果部署到正式环境了，建议还是开着检查比较好，这样可以及时发现服务提供者服务是否可用

但是，dubbo还有一个东西，monitor ，可以启动一个监控器服务，这样也可以实时查看服务提供者跟服务消费者是否可用

配置方法

可以配置 registry和consumer和@Reference注解上

放在 @Reference 注解上 关闭某个服务的启动时检查 (没有提供者时报错) `@Reference(check=false)`

放在registry和consumer两个上，就是全局配置了

```yml
dubbo:
  registry:
    check: false #关闭注册中心启动时检查 (注册订阅失败时报错)
  consumer:
    check: false #关闭所有服务的启动时检查 (没有提供者时报错)
```

## 超时&重试次数

上一篇博客就碰到这个坑了，dubbo为了服务的性能，默认超时时间是1000ms，就短短1s时间，没有响应就直接抛异常了

正巧，我写的那个demo里模拟一个发短信的请求，设置了一个 Thread.sleep() 大于1s了，一直报错，后来配置了个超时时间就正常了

超时可以配置在很多地方

- 服务提供者一方
- 服务消费者一方
- 提供者或消费者中的服务类上
- 提供者或消费者中的服务类里方法上
- 注册中心连接上
- ...

这里配置生效有个优先级，官网上也给出了优先级两句好记的话

以 timeout 为例，显示了配置的查找顺序，其它 retries, loadbalance, actives 等类似：

- 方法级优先，接口级次之，全局配置再次之。
- 如果级别一样，则消费方优先，提供方次之。

重试次数就是调用服务失败后系统自动重试的意思，默认调用的那一次不算，也就是说配置 `retries=2` 后，在消费端调用服务（第一次）失败了，这时候它会自动重试，这里配置的重试是2次，也就是说如果一个服务一直失败，那么这个服务会被调用3次

重试功能还有一个好处，如果服务提供端部署了多台服务，那么如果一台服务器上调用失败了，dubbo会自动尝试调用其它服务器上的相同服务

**需要注意的是：幂等操作，非幂等操作**

- 幂等操作：可以设置重试次数
  - 幂等操作：每次操作结果都是相同的，比如查询，删除，修改等
- 非幂等操作：不能设置重试次数
  - 每次操作结果不是相同的，比如新增，这里就不能设置重试次数

## 多版本管理

在服务提供者里可以对服务配置上版本，然后在消费方就可以指定使用服务提供方提供的哪个版本来处理服务，配置方法

服务提供端
```java
@Service(version="1.0.0")  // 注意这个注解是dubbo里提供的，不是Spring包里提供的那个
```

服务消费端
```java
@Reference(version = "1.0.0")
```

当然如果服务提供端提供了多个版本的相同服务，在服务消费端可以配置 `version="*"` 的方式，让dubbo随机的调用不同版本的服务

## 服务消费者直连服务提供者

如果注册中心使用zookeeper，服务端跟消费端都运行好好的，但由于一些不可控的原因，zookeeper挂了，那么这时候**消费端跟服务端还是可以通信的** 因为当消费端通过注册中心与服务端建议连接后，会在本地有个服务端连接的缓存信息，下次再请求发现注册中心不可用了，就会从缓存里拿连接信息

当然dubbo如果不用注册中心也是可以用的，消费端可以在消费服务上配置上指定服务端连接地址，达到与服务端直连的目的，照样可以通信

配置方法，假如服务端配置的通信地址是 `127.0.0.1:20880`

消费端
```java
@RestController
public class SmsController {

    @Reference(url = "127.0.0.1:20880")
    private SmsService smsService;

    @GetMapping("/sendSms")
    public String sendSms(String mobile, String content, String platform) {
        return smsService.sendSms(mobile, content, platform);
    }
}
```

## 负载均衡

默认策略是 Random LoadBalance

| 策略                       | 配置关键字                     | 说明                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Random LoadBalance         | random                         | 随机，按权重设置随机概率。<br/> 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有利于动态调整提供者权重。                                                                                                                                                                                                                                                                             |
| RoundRobin LoadBalance     | roundrobin                     | 轮询，按公约后的权重设置轮询比率。<br/>存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上。                                                                                                                                                                                                                                                    |
| LeastActive LoadBalance    | leastactive                    | 最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差。<br/>使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大。                                                                                                                                                                                                                                                                                        |
| ConsistentHash LoadBalance | 没找到，知道的大佬烦请告知 : ) | 一致性 Hash，相同参数的请求总是发到同一提供者。<br/>当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起剧烈变动。<br/>算法参见：http://en.wikipedia.org/wiki/Consistent_hashing <br/> 缺省只对第一个参数 Hash，如果要修改，请配置 `<dubbo:parameter key="hash.arguments" value="0,1" />`<br/>缺省用 160 份虚拟节点，如果要修改，请配置 <dubbo:parameter key="hash.nodes" value="320" /> |

## 服务降级

当服务器压力过大的情况下，根据实际业务情况及流量，对一些服务和页面有策略的不处理或换种简单的方式处理，从而释放服务器资源以保证核心服务的正常动作或高效动作

服务降级有两种方式

- mock=force:return+null 表示消费方对该服务的方法调用都直接返回 null 值，不发起远程调用。用来屏蔽不重要服务不可用时对调用方的影响。
- 还可以改为 mock=fail:return+null 表示消费方对该服务的方法调用在失败后，再返回 null 值，不抛异常。用来容忍不重要服务不稳定时对调用方的影响。

说白了，就是第一种方法不走service方法，直接就返回null了，第二种方法还走了一下，然后才返回的null

配置方法：

1. 简单点，安装一个monitor，在控制台里控制
2. 向注册中心写入动态配置覆盖规则：
    ```java
    RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
    Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
    registry.register(URL.valueOf("override://0.0.0.0/com.foo.BarService?category=configurators&dynamic=false&application=foo&mock=force:return+null"));
    ```

## 服务容错

上面提到的失败重试就是一种容错机制

dubbo提供了很多的容错机制

- failfast cluster: 快速失败，只发起一次调用，失败立即报错，通常用于非幂等性的写操作，比如新增记录
- failsafe cluster: 失败安全，出现异常时，直接忽略，通常这用于写入审计日志等操作
- failback cluster: 失败自动恢复，后台记录失败请求，定时重发，通常用于消息通知操作
- forking cluster: 并行调用多个服务器，只要一个成功即可返回，通常用于实时性要求较高的读操作，但需要浪费更多的服务资源，可通过 fork="2" 来设置最大并行数
- broadcast cluster: 广播调用所有提供者，逐个调用，任意一台报错，则报错，通常用于通知所有提供者更新缓存或日志等本地资源信息

配置方法

集群模式配置
按照以下示例在服务提供方和消费方配置集群模式

`<dubbo:service cluster="failsafe" />` 或 `<dubbo:reference cluster="failsafe" />`

也可以使用第三方的容错框架来解决 比如 `Hystrix` 这货是 springcloud里集成的，在dubbo里也可以用

首先在服务提供方引入依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
    </dependency>
</dependencies>
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>Finchley.SR2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

启动类上添加注解，开启容错功能

```java
@EnableDubbo
@EnableHystrix
@SpringBootApplication
public class ProviderApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProviderApplication.class, args);
    }

}
```

在服务实现类上加上注解 `@HystrixCommand`

```java
@HystrixCommand
public String sendSms(String mobile, String content, String platform) {}
```

服务消费方

引入依赖，启动类上添加注解，开启容错功能 不多说

在消费方调用服务方的service类上添加出错回调方法

```java
@Component
public class MySmsService {

    @Reference
    private SmsService smsService;

    // 配置出错后回调的方法
    @HystrixCommand(fallbackMethod = "errorHandler")
    public String sendSms(String mobile, String content, String platform) {
        if (Math.random() < 0.5) throw new RuntimeException(); // 模拟一下异常
        return smsService.sendSms(mobile, content, platform);
    }

    // 出错了就走这个方法，处理一下出错后的操作
    public String errorHandler(String mobile, String content, String platform) {
        return "error handler";
    }
}
```

## 参考

- [http://dubbo.apache.org](http://dubbo.apache.org)
