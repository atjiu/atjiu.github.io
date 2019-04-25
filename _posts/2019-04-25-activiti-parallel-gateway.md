---
layout: post
title: Activiti6.0教程(7) - 并行网关(ParallelGateway)用法
date: 2019-04-25 13:27:00
categories: activiti学习笔记
tags: activiti
author: 朋也
---

* content
{:toc}

先看官网描述

> Gateways can also be used to model concurrency in a process. The most straightforward gateway to introduce
>
> concurrency in a process model, is the Parallel Gateway, which allows to fork into multiple paths of execution or
>
> join multiple incoming paths of execution.

翻译过来

> 网关还可以用于对流程中的并发性建模。在流程模型中引入并发性的最简单的网关是并行网关，它允许分叉到多个执行路径或连接多个传入的执行路径。

说白了就是流程有分支了, 就叫并行, 其实我觉得这个应该叫分支网关比较好, 不容易误导人, 举个例子






下面这个是官网上的图

![](/assets/bpmn.parallel.gateway.png)

大致意思就是: 启动订单流程 -> 分成两个分支(发货, 收款) -> 两个分支任务都完成了 -> 合并分支 -> 订单归档 -> 流程结束

下面来看一个例子

## 流程图

![](/assets/QQ20190425-143036.png)

**说明**

受理人分别是

- 付款(买家)    user
- 发货(卖家)    seller
- 收货(买家)    user
- 收款(卖家)    seller

## 测试

**启动流程**

```java
@Test
public void startProcess() {
  ProcessInstance instance = runtimeService.startProcessInstanceByKey("TestParallelGateway");
  System.out.println(instance.getId());
}
```

流程启动后, 数据库里执行实例有三条

![](/assets/QQ20190425-144043.png)

可以看到流程实例ID都是一样的, 说明它们是一个流程的任务实例, 只不过下面两条实例有一个 PARENT_ID 就是第一个实例的id, 可以这样理解, 第一条实例就是网关的实例, 下面两条是两条分支的实例

**查询任务**

现在有两条线, 可以分别查询受理人为 `user` 和 `seller` 的任务, 它们各有一条任务

```java
@Test
public void queryTask() {
  List<Task> tasks = taskService.createTaskQuery().taskAssignee("seller")
      // 分页查询
      // .listPage(firstResult, maxResults)
      // 排序
      // .orderByTaskCreateTime().desc()
      .list();
  for (Task task : tasks) {
    System.out.println("任务ID: " + task.getId());
    System.out.println("受理人: " + task.getAssignee());
    System.out.println("任务名: " + task.getName());
    System.out.println("-------------------------------");
  }
}
```

接原链文：[https://tomoya92.github.io/2019/04/25/activiti-parallel-gateway/](https://tomoya92.github.io/2019/04/25/activiti-parallel-gateway/)

输出卖家的任务

```
任务ID: 26
受理人: seller
任务名: 发货(卖家)
-------------------------------
```

查询出任务id后就可以来处理任务了

**处理任务**

```java
@Test
public void completeTask() {
  String taskId = "26";
  taskService.complete(taskId);
}
```

卖家处理id为26的任务后, 流程就走到下一条了, 也就是说现在买家有两条任务了, 再用买家的受理人名查一次任务,结果如下

```
任务ID: 23
受理人: user
任务名: 付款(买家)
-------------------------------
任务ID: 2502
受理人: user
任务名: 收货(买家)
-------------------------------
```

这时买家有两条任务, 这时候买家可以先付款,也可以先收货, 这都无所谓

- 如果买家先付款, 根据流程图走向下一步卖家就有一条任务, 就是收款
- 如果买家先收货, 那么卖家现在是没有任务的, 但买家就剩一个任务了(付款)

**只有两条分支的任务都处理完了, 流程才会走到下一个并行网关结束流程**

## 总结

用了这么个玩意, 受理人处理任务就可以有选择的去处理了, 比如传统的流程一般都是 付款(买) -> 收款(卖) -> 发货(卖) -> 收货(买)

加上并行网关后, 买家付款后, 卖家可以选择 `收款` 或者 `发货` 这对整个流程没有影响, 不管它选择先处理哪个任务, 流程还是没有结束

说不出来有什么好处, 也说不出来有啥不好的, 先记录一下, 以后业务用上了心里有个谱

---

写博客不易，转载请保留原文链接，谢谢!