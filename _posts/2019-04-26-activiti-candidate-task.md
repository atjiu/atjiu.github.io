---
layout: post
title: Activiti6.0教程(9) - 候选任务, 在一个任务上设置多个候选人或候选组(根据实际业务指派给其中一个候选人执行)
date: 2019-04-26 09:01:00
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

假如现在有这么个需求: 一个电商平台, 每天订单量都很大, 在处理订单的时候分配了user1, user2, user3三个员工, 这时候就可以用上这个候选人功能了, 在一个任务里配置上可能会参与这个任务的候选人, 这样候选人员工就可以通过查询候选人任务知道自己可以领取哪些任务, 从而达到员工自动领取任务的功能

用法如下





## 流程图

![](/assets/QQ20190426-091319.png)

**注意: 逗号要是英文状态下的, 多个候选人要用逗号隔开, 这里也可以使用表达式动态指定**

## 启动流程

```java
@Test
public void startProcess() {
  ProcessInstance instance = runtimeService.startProcessInstanceByKey("TestGroupTask");
  System.out.println(instance.getId());
}
```

## 查询

现在查询就不能用 `assignee` 来查了, 因为 `assignee` 是代理人, 现在这条任务还没有指定代理人, 要用候选人字段查询

```java
@Test
public void queryTaskByCandidateUser() {
  // 查询候选人user1的任务, 使用user2, user3 都可以查到这条任务
  List<Task> tasks = taskService.createTaskQuery().taskCandidateUser("user1")
      // 分页查询
      // .listPage(firstResult, maxResults)
      // 排序
      // .orderByTaskCreateTime().desc()
      .list();
  for (Task task : tasks) {
    System.out.println("任务ID: " + task.getId());
    System.out.println("代理人: " + task.getAssignee());
    System.out.println("任务名: " + task.getName());
    System.out.println("-------------------------------");
  }
}
```

```
任务ID: 2505
代理人: null
任务名: User Task
-------------------------------
```

## 分配任务

也可以是候选人自己领取任务, 就是给任务设置一个代理人

原链接文：[https://blog.yiiu.co/2019/04/26/activiti-candidate-task/](https://blog.yiiu.co/2019/04/26/activiti-candidate-task/)

```java
@Test
public void claimTask() {
  // 上面查询到user1的候选任务id为2505
  String taskId = "2505";
  // 将2505任务分配给user1处理
  taskService.claim(taskId, "user1");
}
```

现在再使用 `assignee` 来查询就可以查询到了

```java
@Test
public void queryTask() {
  List<Task> tasks = taskService.createTaskQuery().taskAssignee("user1")
      // 分页查询
      // .listPage(firstResult, maxResults)
      // 排序
      // .orderByTaskCreateTime().desc()
      .list();
  for (Task task : tasks) {
    System.out.println("任务ID: " + task.getId());
    System.out.println("代理人: " + task.getAssignee());
    System.out.println("任务名: " + task.getName());
    System.out.println("-------------------------------");
  }
}
```

```
任务ID: 2505
代理人: user1
任务名: User Task
-------------------------------
```

这里可以看到代理人已经不是null了, 而是被设置成了user1

这时候再使用user2, user3去查候选人任务就啥都没有了

## 放弃任务

既然能在候选人里分配任务, 那也就能放弃任务

```java
@Test
public void claimTask() {
  // 上面查询到user1的候选任务id为2505
  String taskId = "2505";
  // 将2505任务分配给user1处理
  // taskService.claim(taskId, "user1");
  // 放弃任务
  taskService.setAssignee(taskId, null);
}
```

可以看出其实就是把assignee给设置成null了...

当放弃任务后, 这时候又可以使用 user1, user2, user3 去查询候选人任务了

## 候选组

先在流程图表里创建好用户, 组, 以及用户与组的关联, 可参见上一篇博客 [Activiti6.0教程(8) - 用户, 组, 用户与组关系用法](https://blog.yiiu.co/2019/04/25/activiti-user-group-membership/)

然后修改流程图

![](/assets/QQ20190426-093918.png)

**启动流程跟上面一样**

**查询候选组任务**

```java
@Test
public void queryTaskByCandidateGroup() {
  List<Task> tasks = taskService.createTaskQuery().taskCandidateGroup("1")
      // 分页查询
      // .listPage(firstResult, maxResults)
      // 排序
      // .orderByTaskCreateTime().desc()
      .list();
  for (Task task : tasks) {
    System.out.println("任务ID: " + task.getId());
    System.out.println("代理人: " + task.getAssignee());
    System.out.println("任务名: " + task.getName());
    System.out.println("-------------------------------");
  }
}
```

**分配组任务**

跟上面分配给候选人任务一样, 只是把候选人id换成组id就可以了

```java
@Test
public void claimTask() {
  // 上面查询到user1的候选任务id为12524
  String taskId = "12524";
  // 将12524任务分配给userId为1的用户所在的组处理
  taskService.claim(taskId, "1");
  // 放弃任务
  //    taskService.setAssignee(taskId, null);
}
```

接原链文：[https://blog.yiiu.co/2019/04/26/activiti-candidate-task/](https://blog.yiiu.co/2019/04/26/activiti-candidate-task/)

**查询组任务**

```java
@Test
public void queryTask() {
  List<Task> tasks = taskService.createTaskQuery().taskAssignee("1")
      // 分页查询
      // .listPage(firstResult, maxResults)
      // 排序
      // .orderByTaskCreateTime().desc()
      .list();
  for (Task task : tasks) {
    String assignee = task.getAssignee();
    User user = identityService.createUserQuery().userId(assignee).singleResult();
    System.out.println("任务ID: " + task.getId());
    System.out.println("代理人ID: " + task.getAssignee());
    System.out.println("代理人名: " + user.getLastName() + user.getFirstName());
    System.out.println("任务名: " + task.getName());
    System.out.println("-------------------------------");
  }
}
```

```
任务ID: 12524
代理人ID: 1
代理人名: 张三
任务名: User Task
-------------------------------
```

可以看见上面在查询的时候使用到了 `identityService` 类, 它可以很方便的查询出流程图中用户,组,关联关系, 查询查着操作在上一篇博客中有介绍

## 总结

这一篇博客介绍的东西主要是对上一篇博客里用户组功能的一个应用, 当然用户和组的应用完全不止这一点, 如果项目不大的话,我觉得完全可以把流程图里自带的用户表拿来当系统用户表

---

写博客不易，转载请保留原文链接，谢谢!