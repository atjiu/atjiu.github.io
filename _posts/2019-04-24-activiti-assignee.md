---
layout: post
title: Activiti6.0教程(5) - 将任务的代理人配活(变量法, 监听法)
date: 2019-04-24 15:17:00
categories: activiti学习笔记
tags: activiti
author: 朋也
---

- [Activiti6.0教程(1) - 环境搭建, 画一个流程图](https://tomoya92.github.io/2019/04/24/activiti-env/)
- [Activiti6.0教程(2) - 初始化表, 部署流程, 启动流程, 创建的表介绍](https://tomoya92.github.io/2019/04/24/activiti-deploy-start-table/)
- [Activiti6.0教程(3) - springboot项目中使用activiti6.0配置及启动](https://tomoya92.github.io/2019/04/24/activiti-spring-boot/)
- [Activiti6.0教程(4) - 任务的查询以及完成任务(对任务批注,以及对批注的查询)](https://tomoya92.github.io/2019/04/24/activiti-query-complete-task/)
- [Activiti6.0教程(5) - 将任务的代理人配活(变量法, 监听法)](https://tomoya92.github.io/2019/04/24/activiti-assignee/)
- [Activiti6.0教程(6) - 排它网关/异或网关(ExclusiveGateway)用法](https://tomoya92.github.io/2019/04/25/activiti-exclusive-gateway/)
- [Activiti6.0教程(7) - 并行网关(ParallelGateway)用法](https://tomoya92.github.io/2019/04/25/activiti-parallel-gateway/)
- [Activiti6.0教程(8) - 用户, 组, 用户与组关系用法](https://tomoya92.github.io/2019/04/25/activiti-user-group-membership/)
- [Activiti6.0教程(9) - 候选任务, 在一个任务上设置多个候选人或候选组(根据实际业务指派给其中一个候选人执行)](https://tomoya92.github.io/2019/04/26/activiti-candidate-task/)

* content
{:toc}

将代理人配置活了, 就可以在程序里动态的指定了, 比如: 今天部门经理是user1, 明天这个部门经理离职了, 又来了个部门经理是 user11 , 那么流程图中的代理人就要更改了, 如果有配置成活的, 就没问题了

动态指定代理人有两种方式

1. 监听的方式
2. 变量方式





## 监听方式配置

**修改流程图**

写一个监听类, 实现 `TaskListener` 接口里的 `notify` 方法, 在这个方法里可以设置下一个代理人是谁

```java
// 处理提交请假的代理人设置
public class Task1Listener implements TaskListener {
  @Override
  public void notify(DelegateTask delegateTask) {
    delegateTask.setAssignee("user1");
  }
}
```

```java
// 处理部门经理审批的代理人设置
public class Task2Listener implements TaskListener {
  @Override
  public void notify(DelegateTask delegateTask) {
    delegateTask.setAssignee("user2");
  }
}
```

```java
// 处理总经理审批的代理人设置
public class Task3Listener implements TaskListener {
  @Override
  public void notify(DelegateTask delegateTask) {
    delegateTask.setAssignee("user3");
  }
}
```

将 assignee 里的固定值去掉, 然后在Listeners里配置监听类, 三个都要配置上

![](/assets/QQ20190424-155049.png)

这样配置好之后, 代码都不用变的, 流程继续执行, 但代理人已经配活了, 我这写了三个监听类来设置代理人, 实际业务中员工一般都有直接领导, 领导也会有上级, 所以这里就不用这样写了, 可以从登录的用户对象里拿到他的上级领导, 然后将上级领导的用户名设置成下一个代理人即可

## 变量方式配置

**更改流程图**

activiti里支持表达式 `${}` 来传入一些变量, 先把所有的 `UserTask` 的代理人都改成 `${username}`

**别忘了把监听配置去掉**

原链接文：[https://tomoya92.github.io/2019/04/24/activiti-assignee/](https://tomoya92.github.io/2019/04/24/activiti-assignee/)

![](/assets/QQ20190424-152554.png)

**修改代理人处理任务的代码**

```java
@Test
public void startProcess() { // 启动流程也要指定一下下一个代理人是谁
  // 创建一个Map存放变量
  Map<String, Object> variables = new HashMap<>();
  // 设置这个流程的下一个代理人是 user1
  variables.put("username", "user1");
  // 这次调用的方法是三个参数的, 最后一个是放变量的
  ProcessInstance instance = runtimeService.startProcessInstanceByKey("AskLeave", "1", variables);
  System.out.println("Id: " + instance.getId());
}
```

查询个人任务还是之间那个方法

用户处理任务的时候也要指定一下下一个代理人是谁, 代码如下

```java
@Test
public void completeTask() {
  // 通过查询可以拿到user2的任务id是7502
  String taskId = "2505";
  // 选通过taskId查询任务
  Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
  // 从任务里拿到流程实例id
  String processInstanceId = task.getProcessInstanceId();
  // 批注信息
  String message = "同意";
  Authentication.setAuthenticatedUserId("user1"); // 当前处理任务的用户的userId, 也可以放用户名
  // 给任务添加批注
  taskService.addComment(taskId, processInstanceId, message);
  // 创建一个Map存放变量
  Map<String, Object> variables = new HashMap<>();
  // 设置这个流程的下一个代理人是 user2
  variables.put("username", "user2");
  // 处理任务
  taskService.complete(taskId, variables);
}
```

## 总结

业务简单的话, 变量的方式就够用了

业务复杂的话, 监听的方式更灵活些

---

写博客不易，转载请保留原文链接，谢谢!