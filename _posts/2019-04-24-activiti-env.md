---
layout: post
title: Activiti6.0教程(1) - 环境搭建, 画一个流程图
date: 2019-04-24 09:38:00
categories: activiti学习笔记
tags: activiti
author: 朋也
---

* content
{:toc}

- [Activiti6.0教程(1) - 环境搭建, 画一个流程图](https://blog.yiiu.co/2019/04/24/activiti-env/)
- [Activiti6.0教程(2) - 初始化表, 部署流程, 启动流程, 创建的表介绍](https://blog.yiiu.co/2019/04/24/activiti-deploy-start-table/)
- [Activiti6.0教程(3) - springboot项目中使用activiti6.0配置及启动](https://blog.yiiu.co/2019/04/24/activiti-spring-boot/)
- [Activiti6.0教程(4) - 任务的查询以及完成任务(对任务批注,以及对批注的查询)](https://blog.yiiu.co/2019/04/24/activiti-query-complete-task/)
- [Activiti6.0教程(5) - 将任务的代理人配活(变量法, 监听法)](https://blog.yiiu.co/2019/04/24/activiti-assignee/)
- [Activiti6.0教程(6) - 排它网关/异或网关(ExclusiveGateway)用法](https://blog.yiiu.co/2019/04/25/activiti-exclusive-gateway/)
- [Activiti6.0教程(7) - 并行网关(ParallelGateway)用法](https://blog.yiiu.co/2019/04/25/activiti-parallel-gateway/)
- [Activiti6.0教程(8) - 用户, 组, 用户与组关系用法](https://blog.yiiu.co/2019/04/25/activiti-user-group-membership/)
- [Activiti6.0教程(9) - 候选任务, 在一个任务上设置多个候选人或候选组(根据实际业务指派给其中一个候选人执行)](https://blog.yiiu.co/2019/04/26/activiti-candidate-task/)

公司业务需要, 学习了一下Activiti, 做个系列博客来总结一下折腾的成果

## Activiti能干啥?

它就是用来管理流程的, 处理业务流程的

举个例子, 在网上下单买东西, 订单的状态要有(下单, 发货, 付款, 收货, 评价) 等多个状态, 这里列的还是少的, 如果业务复杂些, 这种状态可能可以达到几十甚至上百个, 这时候如果还用代码去管理状态, 第一代码不好写, 总会出问题, 第二写代码的人很容易就弄错了, 代码的bug也就多了

Activiti就是通过在最开始时定义好一个流程, 大家开发使用中的业务流程都按这个来, 少了很多扯皮, 代码也好维护了





先抛出一个问题?

Q: 一个流程定义好了, 流程图也画好了, 那后面如果流程图有变动, 是重启部署一份, 还是Activiti会自动更新前一份版本的部署呢?

A: 在springboot项目里, 项目在启动的时候会重新部署一份, 后面的流程也就自然走更新后的部署实例了

## 定义流程图

idea里有两个插件可以画流程图, 不过都不好用, 还是建议在eclipse里画, 当然也可以下载 activiti 的war包部署在tomcat里, 启动服务, 在网页上画, 这种我没折腾过, 我就在eclipse里画了

**安装插件**

eclipse里安装activiti插件网上教程一堆, 这里不多说, 两种方式

1. 在线安装, 链接是: [http://www.activiti.org/designer/update](http://www.activiti.org/designer/update)
   1. 这种方法我昨天在配置环境的时候, 链接一直打不开, 不知道现在怎么样了, 如果在线的方法不行,可以尝试使用第二种方法
2. 到 [https://github.com/Activiti/Activiti-Designer/releases](https://github.com/Activiti/Activiti-Designer/releases) 里下载最新的 zip 包, 然后安装

**创建一个bpmn文件**

在eclipse里创建一个项目, 空项目即可, 在项目里找一个文件夹, `右键 -> New -> Other -> Activiti -> Activiti Diagram` 输入一个名字就可以了

创建好之后界面长这个样

![](/assets/QQ20190424-101859.png)

## 常用组件介绍

在界面右边可以看见有很多的`东西`, 有`事件` `任务` `容器` `网关` 等等, 常用的有以下几个

- Palette      连线的
- Start event  开启任务事件
- End event    任务结束事件
- Task         任务(用户任务, 接收任务)
- Gateway      网关(并行网关, 排它网关)

原链接文：[https://blog.yiiu.co/2019/04/24/activiti-env/](https://blog.yiiu.co/2019/04/24/activiti-env/)

**至于其它的我还没有了解到, 感觉有了这些就已经够用了, 后面业务复杂要是用到其它的功能,再来更新博客**

在界面下面有一些属性的设置界面(这是针对流程图的设置)

常用的有

- Process 针对流程图的一些设置
- General 针对任务的一些设置
- Listeners 给任务设置代理人的监听器
- Main config 在任务里主要是设置代理人的地方, 在连线上主要是设置条件判断的

## 画一张请假流程图

![](/assets/QQ20190424-104038.png)

**注意**

1. 一个流程图必须要有一个启动事件, 一个结束事件
2. 当一个任务上有多于一条连线时, 必须给不同线设置不同的处理逻辑
3. 给任务设置代理人有三种方式
   1. 写死(不推荐)
   2. 变量方式配置(我比较喜欢)
   3. 监听器配置(这个还要在程序里写实现, 不过会更灵活, 看具体需求定)

具体设置地方如下

![](/assets/QQ20190424-104510.png)

![](/assets/QQ20190424-104640.png)

![](/assets/QQ20190424-104803.png)

![](/assets/QQ20190424-104910.png)

## 总结

这篇博客是给完全新手看的, 如果你对流程有一定的理解可以不用看这篇博客

如果博客中有不全的地方, 欢迎在下面留言指出, 谢谢!

---

写博客不易，转载请保留原文链接，谢谢!