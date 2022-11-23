---
layout: post
title: xxl-job测试出来的一些特性总结
date: 2020-04-08 14:38:00
categories: java学习笔记
tags: java
author: 朋也
---

* content
{:toc}

xxl-job：一个分布式的定时器管理平台(这东西类似于zookeeper)

开源地址：https://github.com/xuxueli/xxl-job

我启动后，配置了一个项目，测试了以下几个内容

1. 如果定时执行的方法中出异常了，不会中止定时任务
2. 如果job_admin发出任务后，执行器里的任务也在跑着，但执行器服务出意外了，服务停了，job_admin这边的日志就会处于一直等待异步回调的状态，可以手动停止任务，但手动停止任务后，job_admin会默认的再发送一次这个任务的执行
3. 如果执行器中的的一个任务要执行10s，但job_admin里设置的请求间隔是5s，这样的情况定时器也是按顺序执行的，即使是5s一次，它也会等执行器中的任务执行完后，给到job_admin回调结果后，job_admin才会下发下一次的任务
4. 如果job_admin因为意外出故障了，导致服务停止，那么它下发的任务还会继续在执行器项目中执行，直到执行器检测到job_admin挂了，就开始一直报错了，任务也就停止了






## 部署job_admin

去开源地址上把xxl_job_admin下载下来，把数据库脚本导入到数据库，启动项目即可，它是个标准的springboot项目，注意访问的时候要带上path，因为作者在配置文件里配置了访问的path `/xxl-job-admin`

## 项目中集成xxl_job

可以从开源地址中的`xxl-job-executor-samples`中找到对应项目架构的例子，下面是springboot项目的配置方法

首先引入依赖

```xml
<dependency>
    <groupId>com.xuxueli</groupId>
    <artifactId>xxl-job-core</artifactId>
    <version>2.1.2</version>
</dependency>
```

配置文件

```yml
xxl:
  job:
    admin:
      address: http://192.168.1.100:8085/   # xxl-job-admin 的服务端口
    accessToken: 123123  # 连接xxl-job-admin时加密通讯
    executor:
      appname: pybbs  # 当前项目的名字
      address:
      ip:
      port: 30001  # 当前项目的xxl-job的端口，类似于dubbo.protocol.port
      logpath: ./log/xxl-job/jobhandler
      logretentiondays: 30 # xxl-job executor log-retention-days
```

如果是properties格式的配置文件，格式如下

```properties
### xxl-job admin address list, such as "http://address" or "http://address01,http://address02"
xxl.job.admin.addresses=http://127.0.0.1:8080/xxl-job-admin

### xxl-job, access token
xxl.job.accessToken=

### xxl-job executor appname
xxl.job.executor.appname=xxl-job-executor-sample
### xxl-job executor registry-address: default use address to registry , otherwise use ip:port if address is null
xxl.job.executor.address=
### xxl-job executor server-info
xxl.job.executor.ip=
xxl.job.executor.port=9999
### xxl-job executor log-path
xxl.job.executor.logpath=/data/applogs/xxl-job/jobhandler
### xxl-job executor log-retention-days
xxl.job.executor.logretentiondays=30
```

加入配置类

```java
import com.xxl.job.core.executor.impl.XxlJobSpringExecutor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * xxl-job config
 * 文链接原: https://atjiu.github.io/2020/04/08/xxl-job-feature-with-test/
 * @author xuxueli 2017-04-28
 */
@Configuration
public class XxlJobConfig {
    private Logger logger = LoggerFactory.getLogger(XxlJobConfig.class);

    @Value("${xxl.job.admin.address}")
    private String adminAddresses;

    @Value("${xxl.job.accessToken}")
    private String accessToken;

    @Value("${xxl.job.executor.appname}")
    private String appName;

    @Value("${xxl.job.executor.address}")
    private String address;

    @Value("${xxl.job.executor.ip}")
    private String ip;

    @Value("${xxl.job.executor.port}")
    private int port;

    @Value("${xxl.job.executor.logpath}")
    private String logPath;

    @Value("${xxl.job.executor.logretentiondays}")
    private int logRetentionDays;


    @Bean
    public XxlJobSpringExecutor xxlJobExecutor() {
        logger.info(">>>>>>>>>>> xxl-job config init.");
        XxlJobSpringExecutor xxlJobSpringExecutor = new XxlJobSpringExecutor();
        xxlJobSpringExecutor.setAdminAddresses(adminAddresses);
        xxlJobSpringExecutor.setAppName(appName);
//        xxlJobSpringExecutor.setAddress(address); // 最新的快照版里有这个参数的设置，但mvn中心库中的版本里没有这个参数，这里注释掉
        xxlJobSpringExecutor.setIp(ip);
        xxlJobSpringExecutor.setPort(port);
        xxlJobSpringExecutor.setAccessToken(accessToken);
        xxlJobSpringExecutor.setLogPath(logPath);
        xxlJobSpringExecutor.setLogRetentionDays(logRetentionDays);

        return xxlJobSpringExecutor;
    }

    /**
     * 针对多网卡、容器内部署等情况，可借助 "spring-cloud-commons" 提供的 "InetUtils" 组件灵活定制注册IP；
     *
     *      1、引入依赖：
     *          <dependency>
     *             <groupId>org.springframework.cloud</groupId>
     *             <artifactId>spring-cloud-commons</artifactId>
     *             <version>${version}</version>
     *         </dependency>
     *
     *      2、配置文件，或者容器启动变量
     *          spring.cloud.inetutils.preferred-networks: 'xxx.xxx.xxx.'
     *
     *      3、获取IP
     *          String ip_ = inetUtils.findFirstNonLoopbackHostInfo().getIpAddress();
     */


}
```

文接链原: [https://atjiu.github.io/2020/04/08/xxl-job-feature-with-test/](https://atjiu.github.io/2020/04/08/xxl-job-feature-with-test/)

然后在项目中的定时器任务的方法上加上注解 `@XxlJob("testJob")`

```java
@Component
public class SchedulingService {

    @XxlJob("testJob")
    public ReturnT<String> job1(String param) {
        // do stuff..
        // return new ReturnT<>(ReturnT.FAIL.getCode(), "error message");
        return ReturnT.SUCCESS;
    }
}
```

注意，方法的参数必须要加上，不加启动会报错

-----

剩下的就是在job_admin上配置任务了

## 总结

昨天我才知道的，springboot项目自带的定时器他们是共用一个线程的，比如我在一个项目里写了2个定时器，第一个定时器执行一次要耗时10s，第二个要耗时20s，定时任务都是5s一次

假如在2020-04-08 15:51:00 定时器开始执行，如果先执行的是第一个定时器，那么在15:51:10的时候，会执行完，定时间隔是5s，也就是说在 15:51:10 的时候会继续执行第一个定时器，但springboot默认是只给一个线程的，它会等着第二个定时器执行完，也就是还要再等10s，到 15:51:20的时候才会继续下一轮的定时任务

如果要解决这问题，可以在方法中添加上单独的线程，也可以使用 `@Async` 注解，不过这两种方法都不是好的选择，很容易就把线程池给用爆了

这时候就体现出了xxl-job这种定时任务管理的好处了！
