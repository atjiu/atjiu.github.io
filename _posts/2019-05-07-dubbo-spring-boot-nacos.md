---
layout: post
title: dubbo在springboot项目中使用nacos注册中心
date: 2019-05-07 15:43:00
categories: spring-boot学习笔记
tags: spring-boot dubbo
author: 朋也
---

* content
{:toc}

今天在折腾seata时发现它只支持nacos, 也可能是我用zookeeper当注册中心没有折腾好,它一直说找不到注册中心服务, 无耐只能折腾一下dubbo在springboot项目里怎么连nacos注册中心了

折腾下来还挺简单






首先引入两个依赖

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>dubbo-registry-nacos</artifactId>
    <version>0.0.2</version>
</dependency>
<dependency>
    <groupId>com.alibaba.nacos</groupId>
    <artifactId>nacos-client</artifactId>
    <version>1.0.0</version>
</dependency>
```

原链文接: [https://tomoya92.github.io/2019/05/07/dubbo-spring-boot-nacos/](https://tomoya92.github.io/2019/05/07/dubbo-spring-boot-nacos/)

然后修改配置文件

```yml
dubbo:
  registry:
    address: nacos://127.0.0.1:8848 # 注册中心地址
```

项目里配置到这就可以了

---

接下来就是下载nacos然后启动了

开源地址: [https://github.com/alibaba/nacos](https://github.com/alibaba/nacos)

到release里下载打包好的 [https://github.com/alibaba/nacos/releases](https://github.com/alibaba/nacos/releases)

下载好之后, 解压, 进入bin目录, 运行命令 `sh startup.sh -m standalone`

如果是windows平台运行命令 `cmd startup.cmd -m standalone`

---

最后就可以启动修改好的项目了
