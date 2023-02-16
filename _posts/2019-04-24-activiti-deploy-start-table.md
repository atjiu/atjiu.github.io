---
layout: post
title: Activiti6.0教程(2) - 初始化表, 部署流程, 启动流程, 创建的表介绍
date: 2019-04-24 10:56:00
categories: activiti学习笔记
tags: activiti
author: 朋也
---

* content
{:toc}

- [Activiti6.0教程(1) - 环境搭建, 画一个流程图](https://atjiu.github.io/2019/04/24/activiti-env/)
- [Activiti6.0教程(2) - 初始化表, 部署流程, 启动流程, 创建的表介绍](https://atjiu.github.io/2019/04/24/activiti-deploy-start-table/)
- [Activiti6.0教程(3) - springboot项目中使用activiti6.0配置及启动](https://atjiu.github.io/2019/04/24/activiti-spring-boot/)
- [Activiti6.0教程(4) - 任务的查询以及完成任务(对任务批注,以及对批注的查询)](https://atjiu.github.io/2019/04/24/activiti-query-complete-task/)
- [Activiti6.0教程(5) - 将任务的代理人配活(变量法, 监听法)](https://atjiu.github.io/2019/04/24/activiti-assignee/)
- [Activiti6.0教程(6) - 排它网关/异或网关(ExclusiveGateway)用法](https://atjiu.github.io/2019/04/25/activiti-exclusive-gateway/)
- [Activiti6.0教程(7) - 并行网关(ParallelGateway)用法](https://atjiu.github.io/2019/04/25/activiti-parallel-gateway/)
- [Activiti6.0教程(8) - 用户, 组, 用户与组关系用法](https://atjiu.github.io/2019/04/25/activiti-user-group-membership/)
- [Activiti6.0教程(9) - 候选任务, 在一个任务上设置多个候选人或候选组(根据实际业务指派给其中一个候选人执行)](https://atjiu.github.io/2019/04/26/activiti-candidate-task/)

上一篇博客介绍了怎么定义一个流程图, 这一篇来介绍一下项目中用的话, 怎么部署流程, 启动流程, 以及表的介绍

## 创建项目

创建一个maven项目即可, 目前只先做测试, 引入以下依赖





```xml
<dependency>
  <groupId>org.activiti</groupId>
  <artifactId>activiti-engine</artifactId>
  <version>6.0.0</version>
</dependency>

<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>5.1.47</version>
</dependency>

<!-- 这个是数据源的依赖, 如果你不用数据源, 可以不用引入这个的 -->
<dependency>
  <groupId>com.mchange</groupId>
  <artifactId>c3p0</artifactId>
  <version>0.9.5.4</version>
</dependency>

<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.12</version>
</dependency>
```

## 初始化

```java
@Test
public void createTable() {
  // 创建一个数据源
  DriverManagerDataSource dataSource = new DriverManagerDataSource();
  dataSource.setDriverClass("com.mysql.jdbc.Driver");
  dataSource.setJdbcUrl("jdbc:mysql:///activiti-demo?useSSL=false&characterEncoding=utf8&serverTimezone=GMT%2B8");
  dataSource.setUser("root");
  dataSource.setPassword("");

  // 创建流程引擎配置
  ProcessEngineConfiguration configuration = ProcessEngineConfiguration
      .createStandaloneInMemProcessEngineConfiguration();
  // 设置数据源
  //    configuration.setDataSource(dataSource);
  // 如果不使用数据源, 可以通过配置连接信息来连接数据库
  configuration.setJdbcDriver("com.mysql.jdbc.Driver");
  configuration.setJdbcUrl("jdbc:mysql:///activiti-demo?useSSL=false&characterEncoding=utf8&serverTimezone=GMT%2B8");
  configuration.setJdbcUsername("root");
  configuration.setJdbcPassword("");

  // 设置创建表的一个规则,有三种
  // DB_SCHEMA_UPDATE_FALSE = "false" 如果数据库里没有acti相关的表, 也不会创建
  // DB_SCHEMA_UPDATE_CREATE_DROP = "create-drop" 不管数据库里有没acti的相关表, 都会先删除旧表再创建新表, 不推荐在生产中使用
  // DB_SCHEMA_UPDATE_TRUE = "true" 如果数据库里没有acti相关的表, 会自动创建
  // 仔细看看, 是不是有些类似于hibernate里的ddl-auto :)
  configuration.setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_CREATE_DROP);

  // 构建流程引擎, 这一步就会创建好表, 但基本上表内都是空的, 因为还没有部署, 再没有流程实例
  ProcessEngine processEngine = configuration.buildProcessEngine();
  // 可以获取流程引擎的一些信息, 不过这个东西没啥用..
  System.out.println(processEngine.getName());
}
```

原链接文：[https://atjiu.github.io/2019/04/24/activiti-deploy-start-table/](https://atjiu.github.io/2019/04/24/activiti-deploy-start-table/)

注释写的很清楚了, 在配置流程引擎的时候可以指定数据源, 这就要借助一些第三方的包了, 不过也可以在`ProcessEngineConfiguration`里自己配置连接信息, 就不用要数据源了, 效果是一样的

## 表介绍

数据库里生成的表有如下这些

| 表名                  | 说明                         |
|-----------------------|-----------------------------|
| ACT_EVT_LOG           | 事件日志表(实验性质)         |
| ACT_GE_BYTEARRAY      | 通用的流程定义和流程资源     |
| ACT_GE_PROPERTY       | 系统相关属性                 |
| ACT_HI_ACTINST        | 历史的流程实例               |
| ACT_HI_ATTACHMENT     | 历史的流程附件               |
| ACT_HI_COMMENT        | 历史的批注信息               |
| ACT_HI_DETAIL         | 历史的流程运行中的细节信息   |
| ACT_HI_IDENTITYLINK   | 历史的流程运行过程中用户关系 |
| ACT_HI_PROCINST       | 历史的流程实例               |
| ACT_HI_TASKINST       | 历史的任务实例               |
| ACT_HI_VARINST        | 历史的流程运行中的变量信息   |
| ACT_ID_GROUP          | 组                           |
| ACT_ID_INFO           | 用户详细信息                 |
| ACT_ID_MEMBERSHIP     | 用户和组关系的中间表         |
| ACT_ID_USER           | 用户表                       |
| ACT_RE_DEPLOYMENT     | 部署的流程信息               |
| ACT_RE_MODEL          | 流程模型信息                 |
| ACT_RE_PROCDEF        | 流程定义信息                 |
| ACT_RU_DEADLETTER_JOB | 存储执行失败的任务表(异步)   |
| ACT_RU_EVENT_SUBSCR   | 运行时事件                   |
| ACT_RU_EXECUTION      | 运行时流程执行实例           |
| ACT_RU_IDENTITYLINK   | 运行时用户关系信息           |
| ACT_RU_JOB            | 运行时作业(异步)             |
| ACT_RU_SUSPENDED_JOB  | 暂停运行的任务(异步)         |
| ACT_RU_TASK           | 运行时任务                   |
| ACT_RU_TIMER_JOB      | 任务定时器表(异步)           |
| ACT_RU_VARIABLE       | 运行时变量表                 |
| ACT_PROCDEF_INFO      | 流程定义信息表               |
{: .table.table-bordered}

关于上面异步的设计描述可以查看官方文档 [https://www.activiti.org/userguide/#async_executor_design](https://www.activiti.org/userguide/#async_executor_design)

从上面表名的前缀应该可以看出来

- ACT_GE   通用类
- ACT_HI   历史记录类
- ACT_ID   用户信息类
- ACT_RE   流程实例类
- ACT_RU   运行时类

## Activiti API

在启动流程之间先介绍一下activiti中的几大Service, 这些对象都是从流程引擎里获取的

```java
// 获取流程引擎
private ProcessEngine getProcessEngine() {
  // 创建流程引擎配置
  ProcessEngineConfiguration configuration = ProcessEngineConfiguration
      .createStandaloneInMemProcessEngineConfiguration();
  // 设置数据源
  //    configuration.setDataSource(dataSource);
  // 如果不使用数据源, 可以通过配置连接信息来连接数据库
  configuration.setJdbcDriver("com.mysql.jdbc.Driver");
  configuration.setJdbcUrl("jdbc:mysql:///activiti-demo?useSSL=false&characterEncoding=utf8&serverTimezone=GMT%2B8");
  configuration.setJdbcUsername("root");
  configuration.setJdbcPassword("");

  // 设置创建表的一个规则,有三种
  // DB_SCHEMA_UPDATE_FALSE = "false" 如果数据库里没有acti相关的表, 也不会创建
  // DB_SCHEMA_UPDATE_CREATE_DROP = "create-drop" 不管数据库里有没acti的相关表, 都会先删除旧表再创建新表, 不推荐在生产中使用
  // DB_SCHEMA_UPDATE_TRUE = "true" 如果数据库里没有acti相关的表, 会自动创建
  // 我这是做测试, 就选择每次先删除旧的表再创建新的表的规则了
  // 仔细看看, 是不是有些类似于hibernate里的ddl-auto :)
  configuration.setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE);

  // 构建流程引擎, 这一步就会创建好表, 但基本上表内都是空的, 因为还没有部署, 再没有流程实例
  ProcessEngine processEngine = configuration.buildProcessEngine();
  return processEngine;
}

@Test
public void activitiApi() {
  ProcessEngine processEngine = getProcessEngine();
  RepositoryService repositoryService = processEngine.getRepositoryService();
  FormService formService = processEngine.getFormService();
  HistoryService historyService = processEngine.getHistoryService();
  IdentityService identityService = processEngine.getIdentityService();
  ManagementService managementService = processEngine.getManagementService();
  RuntimeService runtimeService = processEngine.getRuntimeService();
  TaskService taskService = processEngine.getTaskService();
}
```

| Service           | 管理的表                                                |
|-------------------|-----------------------------------------------------|
| RepositoryService | 通用类的表                                              |
| FormService       | 通过表单提交的任务的服务类                              |
| HistoryService    | 历史记录表                                              |
| IdentityService   | 用户信息表                                              |
| ManagementService | 自定义查询的服务类 `managementService.executeCustomSql` |
| RuntimeService    | 运行时相关表                                            |
| TaskService       | 任务表, 可以查询 `ACT_RU_` `ACT_HI_`                    |
{: .table.table-bordered}

原接文链：[https://atjiu.github.io/2019/04/24/activiti-deploy-start-table/](https://atjiu.github.io/2019/04/24/activiti-deploy-start-table/)

## 部署流程

这篇博客的流程图用一个简单的, 如下图

![](/assets/QQ20190424-135346.png)

每个 UserTask 的代理人都写的死的, 项目中肯定不建议这样用, 后面还会介绍灵活配置代理人的方法

![](/assets/QQ20190424-135439.png)

![](/assets/QQ20190424-135552.png)

![](/assets/QQ20190424-135618.png)

```java
@Test
public void deployProcess() {
  ProcessEngine processEngine = getProcessEngine();
  RepositoryService repositoryService = processEngine.getRepositoryService();
  Deployment deploy = repositoryService.createDeployment()
      // 给流程起一个名字
      .name("请假流程")
      // 添加流程图资源文件
      .addClasspathResource("AskLeave.bpmn")
      // 添加流程图片资源文件
      .addClasspathResource("AskLeave.png")
      // 部署
      .deploy();
  System.out.println("ID: " + deploy.getId());
}
```

可以看到部署流程的时候用的是 `repositoryService` , 这货是处理一些通用的功能

## 启动流程

流程部署好之后,就可以来启动流程了

**说明**

启动流程时, 此时自身系统的业务就跟流程的业务有交集了, 我在学的时候就有些疑惑, 自己项目里的业务怎么跟流程中的那一堆东西关联起来的呢? 答案就在启动流程这块, 先看启动流程的代码

```java
@Test
public void startProcess() {
  ProcessEngine processEngine = getProcessEngine();
  RuntimeService runtimeService = processEngine.getRuntimeService();
  // 在画流程图的时候,给流程图起的名字
  String processDefinitionKey = "AskLeave";
  // 业务逻辑中的id
  String businessKey = "1";
  ProcessInstance instance = runtimeService.startProcessInstanceByKey(processDefinitionKey, businessKey);
  System.out.println("ID: " + instance.getId());
}
```

可以看到 `startProcessInstanceByKey()` 这个方法传了两个参数

Q: 为啥要用`ProcessInstanceByKey`而不用 ID呢?

A: 流程的Key就是流程图的名字,这个可以提前知道, 而且一个流程图定义好之后这个key就不会变了,但id不一样, 流程部署一次就变一次, 如果用id的话, 还要事先查询好

Q: 这里的`businessKey`是什么东西

A: 这个就是把自己项目里的业务跟Activiti的业务关联起来的东西, 举个例子, 请假的表是自己项目里创建的一个表存储的, 当发起流程的时候, 把这个请假的表里的id传给activiti的流程, 这样在流程处理的过程中可以随时去获取这个 `businessKey` 然后查询出请假的信息

---

到这里一个流程的创建->部署->启动就算完成了, 至于怎么查询流程中的信息, 代理人完成流程中的任务, 另起一篇博客来介绍, 下一篇博客来说一下在springboot项目中怎么集成 activiti

## 总结

activiti的使用顺序如下

定义流程图 -> 初始化流程图(创建表) -> 部署流程 -> 启动流程 -> 处理任务 -> 结束任务

明白了这个过程基本上就不会乱了

## 参考

- [https://blog.csdn.net/hj7jay/article/details/51302829](https://blog.csdn.net/hj7jay/article/details/51302829)
- [https://www.activiti.org/userguide/](https://www.activiti.org/userguide/)

---

写博客不易，转载请保留原文链接，谢谢!