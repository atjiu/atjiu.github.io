---
layout: post
title: Activiti6.0教程(4) - 任务的查询以及完成任务(对任务批注,以及对批注的查询)
date: 2019-04-24 14:27:00
categories: activiti学习笔记
tags: activiti
author: 朋也
---

[Activiti6.0教程(1) - 环境搭建, 画一个流程图](https://tomoya92.github.io/2019/04/24/activiti-env/)
[Activiti6.0教程(2) - 初始化表, 部署流程, 启动流程, 创建的表介绍](https://tomoya92.github.io/2019/04/24/activiti-deploy-start-table/)
[Activiti6.0教程(3) - springboot项目中使用activiti6.0配置及启动](https://tomoya92.github.io/2019/04/24/activiti-spring-boot/)
[Activiti6.0教程(4) - 任务的查询以及完成任务(对任务批注,以及对批注的查询)](https://tomoya92.github.io/2019/04/24/activiti-query-complete-task/)
[Activiti6.0教程(5) - 将任务的代理人配活(变量法, 监听法)](https://tomoya92.github.io/2019/04/24/activiti-assignee/)
[Activiti6.0教程(6) - 排它网关/异或网关(ExclusiveGateway)用法](https://tomoya92.github.io/2019/04/25/activiti-exclusive-gateway/)
[Activiti6.0教程(7) - 并行网关(ParallelGateway)用法](https://tomoya92.github.io/2019/04/25/activiti-parallel-gateway/)
[Activiti6.0教程(8) - 用户, 组, 用户与组关系用法](https://tomoya92.github.io/2019/04/25/activiti-user-group-membership/)
[Activiti6.0教程(9) - 候选任务, 在一个任务上设置多个候选人或候选组(根据实际业务指派给其中一个候选人执行)](https://tomoya92.github.io/2019/04/26/activiti-candidate-task/)

* content
{:toc}

> **前言: 前面定义的那个流程图的请假代理人是 `user1` 部门经理审批代理人是 `user2` 总经理审批代理人是 `user3`**

## 启动一个请假流程

接着上一篇在springboot中启动的那个流程实例, 先启动一个流程

这里模拟一些请假的数据, 在实际项目中这些数据肯定都是存在数据库里的





```java
private List<Map<String, Object>> data = new ArrayList<>();

@Before
public void init() {
  for (int i = 0; i < 10; i++) {
    Map<String, Object> map = new HashMap<>();
    map.put("id", i + 1);
    map.put("username", "员工" + i);
    map.put("title", "请假" + i);
    map.put("day", i);
    data.add(map);
  }
}
```

启动流程

链原接文：[https://tomoya92.github.io/2019/04/24/activiti-query-complete-task/](https://tomoya92.github.io/2019/04/24/activiti-query-complete-task/)

```java
// spring自动将这些Service都初始化好了,直接使用 `@Autowired` 注解注入即可使用
@Autowired
private RuntimeService runtimeService;

@Test
public void startProcess() {
  // 用户1发起了一个请假流程
  ProcessInstance instance = runtimeService.startProcessInstanceByKey("AskLeave", "1");
  System.out.println("Id: " + instance.getId());
}
```

## 查询任务

查询任务使用的是 `taskService` 类来查的

用户 `员工1`提交了一个请假任务, `提交请假` 这个任务的代理人是 `user1`, 所以这里用 user1来查询任务

```java
@Autowired
private TaskService taskService;

@Test
public void queryTask() {
  List<Task> tasks = taskService.createTaskQuery().taskAssignee("user1")
    // 分页查询
    // .listPage(firstResult, maxResults)
    // 排序
    // .orderByTaskCreateTime().desc()
    // 如果你知道这个查询是一条记录的话, 可以使用 .singleResult() 方法来获取单一的记录
    // .singleResult()
    .list();
  for (Task task : tasks) {
    System.out.println(task.toString()); // Task[id=2505, name=提交请假]
  }
}
```

## 处理任务

上面查询到user1有一个任务, 任务的id是 2505, 然后就可以来完成任务了

```java
@Test
public void completeTask() {
  taskService.complete("2505");
}
```

调用一个方法就可以处理任务了, 是不是很简单 : )

user1完成任务后, 任务就走到下一个流程去了, 下一个流程是 `部门经理审批` 代理人是 user2, 这时候就可以用 user2来查询任务了,换句话说就是任务已经转到 user2 了, 后面的流程大致就是

user2查询任务 -> user2完成任务 -> user3查询任务 -> user3完成任务 -> 员工1请假流程结束

## 批注

当代理人在处理任务的时候, 可以增加一些批注, 添加批注的方法如下

原链接文：[https://tomoya92.github.io/2019/04/24/activiti-query-complete-task/](https://tomoya92.github.io/2019/04/24/activiti-query-complete-task/)

```java
@Test
public void completeTask() {
  // 通过查询可以拿到user2的任务id是7502
  String taskId = "7502";
  // 选通过taskId查询任务
  Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
  // 从任务里拿到流程实例id
  String processInstanceId = task.getProcessInstanceId();
  // 批注信息
  String message = "同意";
  Authentication.setAuthenticatedUserId("user2");
  // 给任务添加批注
  taskService.addComment(taskId, processInstanceId, message);
  // 处理任务
  taskService.complete(taskId);
}
```

**注意: 在设置这个批注是谁批的时候, 这个用户名是通过 `Authentication.setAuthenticatedUserId("user2");` 设置的, 这样做的目的是为了线程安全, 挺奇葩的**

## 查询批注

查询批注要从当前流程的实例里查, 因为一个任务在代理人处理完后, 转到下一个代理人那时, 这个任务的id就变了, 虽然可以从历史记录里查, 但麻烦, 直接使用任务的流程实例id来查简单,方便, 可以获取当前请假流程的所有批注信息

```java
@Test
public void queryTask() {
  List<Task> tasks = taskService.createTaskQuery().taskAssignee("user3")
      // 分页查询
      // .listPage(firstResult, maxResults)
      // 排序
      // .orderByTaskCreateTime().desc()
      .list();
  for (Task task : tasks) {
    List<Comment> comments = taskService.getProcessInstanceComments(task.getProcessInstanceId());
    System.out.println("任务ID: " + task.getId());
    for (Comment comment : comments) {
      System.out.println("批注人: " + comment.getUserId());
      System.out.println("批注信息: " + comment.getFullMessage());
      System.out.println("批注时间: " + comment.getTime());
    }
    System.out.println("-------------------------------");
  }
}
```

## 怎么获取BusinessKey

前面说到了项目本身的业务逻辑跟activiti的关联靠的是 `BusinessKey` 来关联的, 那在流程执行的过程中怎么拿到这个数据呢?

可以从当前任务所属的流程实例里拿

```java
@Test
public void getBusinessKey() {
  // user2 处理了任务, 任务转到 user3 任务id也变成了 10003, 可以使用user3来查询任务获取到
  String taskId = "10003";
  // 通过任务id来查询任务
  Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
  // 通过任务里的流程实例id获取当前任务所属的流程实例信息
  ProcessInstance instance = runtimeService.createProcessInstanceQuery().processInstanceId(task
      .getProcessInstanceId()).singleResult();
  // 从流程实例信息中拿到 businessKey
  String businessKey = instance.getBusinessKey();
  System.out.println("businessKey: " + businessKey);
}
```

**注意: 获取流程实例用的是 `runtimeService` , 因为流程没有结束一直都是 runtime 状态**

## 总结

这一篇总结了任务的查询和处理, 回头想一下就知道, 现在代理人还写的是死数据, 这样固然不好, 下一篇来改成活的

另外, 本篇介绍了任务的查询方法, 其它的比如`流程实例的获取` `流程定义的获取` `历史记录的获取` 等查询方法都差不多, 自己写写代码就明白怎么用了, 主要还是要明白它们的执行顺序和表之间的关联关系

---

写博客不易，转载请保留原文链接，谢谢!