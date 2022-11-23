---
layout: post
title: SpringCloud学习记录 - Hystrix
date: 2021-01-04 11:54:00
categories: spring-cloud学习笔记
tags: spring-cloud
author: 朋也
---

* content
{:toc}

hystrix是啥？

hystrix(熔断器)，当服务提供方出问题之后的解决方案就是熔断器(hystrix)干的活。下面举几个例子

- `if(){}elseif{}else{//这里就是熔断器发挥空间}`
- `switch(){case:default://这里就是熔断器发挥空间}`






**下面介绍的熔断器配置都是在消费端配置的，我觉得熔断器配置在消费端要灵活些**

## 概念

- 降级 上面举的例子就是服务降级，说白了就是服务提供方出问题后的备选方案
- 熔断 带有一定条件的服务降级，意思就是当满足xx条件后，服务提供方即使没有出问题也会进行降级，过一段时间后会尝试恢复
- 限流 跟熔断一样，当请求数量超过设置的阈值后，自动进行服务降级

## 降级

模拟服务提供者响应超时（hystrix）默认的响应等待时间是1s，超过1s还没有收到响应数据的话，就会报超时错误。

另一个异常就是服务提供者在处理业务的时候出的异常（运行时异常）这也是最常见的异常

针对这两种异常，hystrix的降级配置都能捕获到并给出降级处理的结果

User引入依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```

开启熔断 UserApplication

```java
@EnableHystrix
public class UserApplication {}
```

application.properties

```properties
# 开启熔断器
feign.hystrix.enabled=true
```

> 为啥配置类上加注解了，配置文件里还要开启呢？
>
> 在启动类上添加 `@EnableHystrix` 注解是为了让在controller里配置的 `@HystrixCommand` 注解生效
>
> 在配置文件里配置的 `feign.hystrix.enabled` 是针对feign接口调用服务的熔断功能（也就是让IOrderService里配置的 @Feign(fallback="fallbackmethod")生效）

把controller从UserApplication里提取出来，放到一个单独的类中

创建一个OrderService实现IOrderService接口，并给每个方法一个默认的实现

```java
@Component
public class OrderService implements IOrderService {

    @Override
    public String create(String userId) {
        return "create order error";
    }

    @Override
    public String getOrder(String id) {
        return "get order error, id: " + id;
    }
}
```

修改 IOrderService 上的 `@FeignClient(value = "ORDER", fallback = OrderService.class)` 添加一个 `fallback`属性并配置上实现类是 OrderService.class，这样如果IOrderService里定义的接口在调用提供者出错时，hystrix就会默认将OrderService里每个接口的默认实现返回

为了测试可以修改一下 Order1Application里的Controller

```java
@PostMapping("/order/create/{userId}")
public String create(@PathVariable("userId") String userId) throws InterruptedException {
    TimeUnit.SECONDS.sleep(2);  // 因为hystrix等待时间是1s，这里设置成2s，制造超时异常
    return "userId: " + userId + " create an order! server: order1";
}
```

链文接原: [https://atjiu.github.io/2021/01/04/spring-cloud-hystrix/](https://atjiu.github.io/2021/01/04/spring-cloud-hystrix/)

因为Order1Application里的create接口设置了等待时间2s才响应，所以User调到Order1的服务上时熔断器肯定会报超时异常，这时候服务降级就会起作用，将OrderService里的实现方法里的 `return "create order error";` 给返回，测试如下

浏览器访问：http://localhost:18081/createOrder?userId=123

结果

```log
// 当调用的是Order1的服务时，结果如下
default error fallback
// 当调用Order2的服务时，结果如下
userId: 123 create an order! server: order2
```

**这里只测试了超时，运行时异常是一样的，也能触发服务降级**

## 基于注解的降级

上面介绍的是feign里支持的降级方法，这种方法不是很实用，业务处理的时候很可能会是一个很耗时的业务，1s显然是不够用的，这时候就要用上注解来配置降级了

**基于注解的降级配置要在启动类上添加上 @EnableHystrix 注解，否则不会生效**

修改UserController

```java
@GetMapping("/createOrder")
@HystrixCommand(
        fallbackMethod = "defaultFallback",
        commandProperties = {
                @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "2500")
        }
)
public Object createOrder(String userId) {
    return iOrderService.create(userId);
}

/**
* 默认的降级处理方法.
* <p>
* 使用场景：当openfeign定义的接口没有实现时，如果服务发生故障，就会调用这个默认的降级处理方法
*/
public String defaultFallback(String id) {
    return "default error fallback";
}
```

配置中的 `@HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "2500")` 就是配置响应超时时间的，单位是毫秒

这里指定2.5s，Order1里睡眠才2s，所以服务不管怎么请求都是正常的

如果把时间改小为1s以下，Order1与Order2都会失败

> @HystrixProperty 注解里的name是怎么来的呢？
>
> 官方的wiki里有介绍，链接：https://github.com/Netflix/Hystrix/wiki/Configuration

## 限流

与降级一样，当请求数量高于设定值时，就触发降级，配置如下

UserController 我这又写了一个方法，用于测试，同样的要在Order模块里添加上实现

```java
@HystrixCommand(
        fallbackMethod = "defaultFallback",
        threadPoolKey = "order",
        threadPoolProperties = {
                @HystrixProperty(name = "coreSize", value = "2"),
                @HystrixProperty(name = "maxQueueSize", value = "1")
        }
)
public Object getOrder(String id) {
    return iOrderService.getOrder(id);
}
```

- coreSize=2 意思是调用 `iOrderService.getOrder(id)` 方法，如果这个方法执行时间是3s，那么在3s内最多可以接收2个请求进行处理，其它的请求全做降级处理
- maxQueueSize 这个属性的默认值是-1，根据官方文档解释来看，当设置为-1时，它用的是异步队列，当不为-1时，它用的是阻塞队列。换句话说，如果这地方设置成-1，或者不配置（默认就是-1）那么coreSize就不会发生效果

## 熔断

熔断是个大集合，一个请求如果因为（超时、运行时异常、限流）触发了降级，就会触发熔断（也就是将服务的调用断开，直接响应降级的结果），在设置的等待时间之后，会尝试重试服务的可用性，可用的话，再将服务连通，真正处理业务，好处就是为了保护服务提供者不至于为了一个服务而拖垮了整个服务器

用法，还是在getOrder()方法上进行配置测试

```java
@GetMapping("/getOrder")
@HystrixCommand(
        fallbackMethod = "defaultFallback",
        commandProperties = {
                @HystrixProperty(name = "circuitBreaker.enabled", value = "true"),// 开启断路器
                @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "5"),// 请求阈值（默认是5）
                @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "5000"), // 触发降级后要等待的时间
                @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "60"),// 失败率达到多少后触发降级
        }
)
public Object getOrder(String id) {
    return iOrderService.getOrder(id);
}
```

上面这几个配置意思是：开启熔断器，并且当请求5次失败率达到60%及以上时就触发服务降级，然后在等待5000毫秒后尝试重连服务，如果服务此时可用了，那么服务降级取消，服务的处理也恢复正常

---

个人理解：熔断是为了服务在降级后能重新恢复而存在的，所以熔断自然也能结合着限流来一起使用

```java
@HystrixCommand(
        fallbackMethod = "defaultFallback",
        commandProperties = {
                @HystrixProperty(name = "circuitBreaker.enabled", value = "true"),// 开启断路器
                @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "5"),// 请求阈值（默认是5）
                @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds", value = "5000"), // 触发降级后要等待的时间
                @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "60"),// 失败率达到多少后触发降级
        },
        threadPoolKey = "order",
        threadPoolProperties = {
                @HystrixProperty(name = "coreSize", value = "2"),
                @HystrixProperty(name = "maxQueueSize", value = "1")
        }
)
public Object getOrder(String id) {
    return iOrderService.getOrder(id);
}
```

## 总结

这么好用的组件，官方也宣布不更新了，当前处于维护模式
