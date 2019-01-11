---
layout: post
title: Spring-Boot集成Dubbo简单入门总结
date: 2019-01-10 20:48:00
categories: spring-boot学习笔记
tags: spring-boot dubbo
author: 朋也
---

* content
{:toc}

## 安装zookeeper

我这里使用zookeeper作为服务注册中心，版本3.4.9，下载地址：[https://archive.apache.org/dist/zookeeper/zookeeper-3.4.9/](https://archive.apache.org/dist/zookeeper/zookeeper-3.4.9/)

下载后，解压

要先配置一下，否则没法启动，启动会报错，找不到 `zoo.cfg` 文件，其实这个配置文件是有的，在 `conf` 文件夹里，只不过名字是 `zoo_sample.cfg` 把名字改一下即可

windows是启动还有些问题，直接运行 `zkServer.cmd` 还不行，我电脑上还装了 git-bash ，所以直接打开 git-bash 进入 bin 目录，运行命令 `./zkServer.sh start` 即可启动

停止命令是 `./zkServer.sh stop`





## 定义服务接口

既然是服务，肯定会有接口与一些共用的实体类，如果写在provider里，那么consumer消费的时候，也要再写一遍，所以先把这块提取出来，开发好后，打成jar包，让provider与consumer都引用即可实现共用

新建一个maven项目就可以了

定义一个接口，我这里模拟一下短信服务

```java
public interface SmsService {

    /**
     * 定义一个发短信的接口
     * @param mobile 手机号
     * @param content 内容
     * @param platform 平台，分别对应 LIANTONG, YIDONG, DIANXIN
     * @return 正常返回发送成功，失败即可，这里为了展示发送的手机号与内容平台，直接把内容再返回去
     */
    String sendSms(String mobile, String content, String platform);

}
```

写好之后，运行 `mvn compile install` 安装到本地

## 服务提供者 Provider

新建Springboot项目，引入依赖，我这Springboot使用的版本是2.x，所以这里的 starter 用的是 0.2.x 如果springboot版本是1.5.x 那么这个starter版本要使用0.1.x

```xml
<dependency>
    <groupId>com.alibaba.boot</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>0.2.0</version>
</dependency>
```

另外还要引入上面开发好的接口jar包

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>interface</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

添加配置

找到 `application.properties` 将其修改成 `application.yml` 我比较喜欢yml配置文件，简洁，而且可以少写很多 : )

添加下面配置

```yml
dubbo:
  application:
    name: demo-provider # 服务名
  registry:
    address: zookeeper://127.0.0.1:2181 # 注册中心地址
  protocol:
    name: dubbo # 指定通信协议
    port: 20880 # 通信端口  这里指的是与消费者间的通信协议与端口
  provider:
    timeout: 10000 # 配置全局调用服务超时时间，dubbo默认是1s，肯定不够用呀
    retries: 3 # 重试3次
    delay: -1
```

**这里我碰到一个坑，就是这个超时时间问题，默认是1s，但我实现服务为了模拟效果，故意延时2s，这导致后面消费者端调用服务的时候一直报错**

在服务提供者里实现服务

```java
@Service
@Component
public class SmsServiceImpl implements SmsService {

    @Override
    public String sendSms(String mobile, String content, String platform) {
        try {
            Thread.sleep(2000);// 模拟调用短信接口费时2s
            return String.format("发送结果: %s, 手机号: %s, 内容: %s, 平台: %s", "SUCCESS", mobile, content, platform);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

这个实现上有个注解 `@Service` 这个不是Spring包里的那个注解，而是dubbo里提供的注解，包名是 `com.alibaba.dubbo.config.annotation.Service` 这个注解的用处是暴露服务给消费端使用的，所以一定要加上

暴露了服务还不够，还要开启dubbo服务，在启动类上加上注解 `@EnableDubbo`

到这服务提供端就开发好了，启动服务即可

## 服务消费端 Consumer

有了服务提供者了，还要有消费者，下面来开发消费者

首先创建一个springboot项目，这里就调用一下服务，不需要引入其它依赖，就默认什么都不选的一个springboot项目即可

然后跟提供者一样，引入依赖，跟服务端一样的依赖

```xml
<dependency>
    <groupId>com.alibaba.boot</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>0.2.0</version>
</dependency>

<dependency>
    <groupId>com.example</groupId>
    <artifactId>interface</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```

添加配置

```yml
dubbo:
  application:
    name: demo-consumer # 消息者名字
  registry:
    address: zookeeper://127.0.0.1:2181 # 注册中心地址
```

调用服务，我这就直接写在test方法里了

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class ConsumerApplicationTests {

    @Reference
    private SmsService smsService;

    @Test
    public void contextLoads() {
        String s = smsService.sendSms("13111111111", "hello world", "LIANTONG");
        System.out.println(s);
    }

}
```

运行test方法，结束可以看到打印出调用的结果

```
发送结果: SUCCESS, 手机号: 13111111111, 内容: hello world, 平台: LIANTONG
```

至此，springboot集成dubbo简单demo就开发完了

## 参考

- [http://dubbo.apache.org](http://dubbo.apache.org)
- [https://github.com/apache/incubator-dubbo](https://github.com/apache/incubator-dubbo)
- [https://github.com/apache/incubator-dubbo-spring-boot-project](https://github.com/apache/incubator-dubbo-spring-boot-project)
